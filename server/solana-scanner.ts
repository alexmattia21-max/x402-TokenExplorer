import { fetch } from 'undici';
import type { Token } from '@shared/schema';

// API Endpoints
const JUPITER_TOKEN_API = 'https://tokens.jup.ag/tokens';
const DEXSCREENER_SEARCH_API = 'https://api.dexscreener.com/latest/dex/search';
const BIRDEYE_TOKEN_LIST_API = 'https://public-api.birdeye.so/defi/tokenlist';

// Reduced search terms to avoid rate limiting (prioritize most common patterns)
const SEARCH_TERMS = ['402', 'x402', '402x'];

interface JupiterToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  extensions?: {
    coingeckoId?: string;
    discord?: string;
    twitter?: string;
    telegram?: string;
    website?: string;
  };
}

interface DexScreenerPair {
  chainId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd?: string;
  liquidity?: { usd: number };
  marketCap?: number;
  volume?: { h24: number };
  dexId?: string;
}

interface BirdeyeToken {
  address: string;
  name: string;
  symbol: string;
  decimals?: number;
  mc?: number;
  liquidity?: number;
  v24hUSD?: number;
  price?: number;
}

export class SolanaTokenScanner {
  private tokensCache: Token[] = [];
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;

  async scanFor402Tokens(): Promise<Token[]> {
    const now = Date.now();

    // Return cached data if still fresh
    if (this.tokensCache.length > 0 && (now - this.lastFetchTime) < this.CACHE_TTL) {
      console.log('Returning cached token data');
      return this.tokensCache;
    }

    try {
      console.log('=== Starting comprehensive token scan ===');
      
      // Fetch from all sources in parallel with timeout protection
      const [jupiterTokens, dexScreenerTokens, birdeyeTokens] = await Promise.allSettled([
        this.fetchFromJupiter(),
        this.fetchFromDexScreener(),
        this.fetchFromBirdeye(),
      ]);

      // Merge all results
      const allTokensMap = new Map<string, Token>();

      // Process Jupiter tokens (best metadata quality)
      if (jupiterTokens.status === 'fulfilled') {
        jupiterTokens.value.forEach(token => {
          allTokensMap.set(token.mintAddress.toLowerCase(), token);
        });
        console.log(`✓ Jupiter: ${jupiterTokens.value.length} tokens`);
      } else {
        console.error('✗ Jupiter failed:', jupiterTokens.reason?.message || 'Unknown error');
      }

      // Process DexScreener tokens (best for low mcap & new tokens)
      if (dexScreenerTokens.status === 'fulfilled') {
        dexScreenerTokens.value.forEach(token => {
          const key = token.mintAddress.toLowerCase();
          if (!allTokensMap.has(key)) {
            allTokensMap.set(key, token);
          }
        });
        console.log(`✓ DexScreener: ${dexScreenerTokens.value.length} tokens`);
      } else {
        console.error('✗ DexScreener failed:', dexScreenerTokens.reason?.message || 'Unknown error');
      }

      // Process Birdeye tokens (additional coverage)
      if (birdeyeTokens.status === 'fulfilled') {
        birdeyeTokens.value.forEach(token => {
          const key = token.mintAddress.toLowerCase();
          if (!allTokensMap.has(key)) {
            allTokensMap.set(key, token);
          }
        });
        console.log(`✓ Birdeye: ${birdeyeTokens.value.length} tokens`);
      } else {
        console.error('✗ Birdeye failed:', birdeyeTokens.reason?.message || 'Unknown error');
      }

      this.tokensCache = Array.from(allTokensMap.values());
      this.lastFetchTime = now;

      console.log(`=== Total unique tokens found: ${this.tokensCache.length} ===`);
      return this.tokensCache;

    } catch (error) {
      console.error('Error scanning for tokens:', error);

      // If we have cached data, return it even if stale
      if (this.tokensCache.length > 0) {
        console.log('Returning stale cached data due to fetch error');
        return this.tokensCache;
      }

      // If all APIs fail, return demo data
      console.warn('All APIs unavailable, returning demo data for development/testing');
      return this.getDemoTokens();
    }
  }

  /**
   * Fetch from Jupiter Token API with alternative endpoint fallback
   */
  private async fetchFromJupiter(): Promise<Token[]> {
    try {
      console.log('Fetching from Jupiter API...');
      
      // Try main endpoint first
      let response = await fetch(JUPITER_TOKEN_API, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // If main endpoint fails, try alternative CDN endpoint
      if (!response.ok) {
        console.log('  → Main endpoint failed, trying CDN...');
        response = await fetch('https://cache.jup.ag/tokens', {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0',
          },
          signal: AbortSignal.timeout(10000),
        });
      }

      if (!response.ok) {
        throw new Error(`Jupiter API returned ${response.status}: ${response.statusText}`);
      }

      const allTokens: JupiterToken[] = await response.json();
      console.log(`  → Fetched ${allTokens.length} total tokens from Jupiter`);

      // Filter for tokens containing search terms in name or symbol
      const filtered = allTokens.filter(token =>
        this.containsSearchTerm(token.name, SEARCH_TERMS) ||
        this.containsSearchTerm(token.symbol, SEARCH_TERMS)
      );

      return filtered.map(token => this.transformJupiterToken(token));

    } catch (error) {
      console.error('Jupiter API error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Fetch from DexScreener API with rate limit protection
   */
  private async fetchFromDexScreener(): Promise<Token[]> {
    try {
      console.log('Fetching from DexScreener API...');
      
      const allPairs: DexScreenerPair[] = [];
      
      // Search terms with delays to avoid rate limiting
      for (const term of SEARCH_TERMS) {
        try {
          const url = `${DEXSCREENER_SEARCH_API}?q=${encodeURIComponent(term)}`;
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0',
            },
            signal: AbortSignal.timeout(8000), // 8 second timeout
          });

          if (response.ok) {
            const data: { pairs?: DexScreenerPair[] } = await response.json();
            if (data.pairs) {
              allPairs.push(...data.pairs);
              console.log(`  → "${term}": ${data.pairs.length} pairs`);
            }
          } else if (response.status === 429) {
            console.warn(`  → "${term}": Rate limited (429), skipping`);
          } else {
            console.warn(`  → "${term}": HTTP ${response.status}`);
          }

          // Small delay between requests to avoid rate limiting
          if (term !== SEARCH_TERMS[SEARCH_TERMS.length - 1]) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
          }

        } catch (err) {
          console.warn(`  → "${term}": ${err instanceof Error ? err.message : 'Failed'}`);
        }
      }

      console.log(`  → Total pairs fetched: ${allPairs.length}`);

      // Filter for Solana only and tokens matching our search
      const solanaPairs = allPairs.filter(pair => 
        pair.chainId === 'solana' &&
        pair.baseToken &&
        (this.containsSearchTerm(pair.baseToken.name, SEARCH_TERMS) ||
         this.containsSearchTerm(pair.baseToken.symbol, SEARCH_TERMS))
      );

      // Deduplicate by token address, keeping pair with highest liquidity
      const tokenMap = new Map<string, DexScreenerPair>();
      solanaPairs.forEach(pair => {
        const key = pair.baseToken.address.toLowerCase();
        const existing = tokenMap.get(key);
        
        if (!existing || (pair.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
          tokenMap.set(key, pair);
        }
      });

      const tokens = Array.from(tokenMap.values()).map(pair => 
        this.transformDexScreenerToken(pair)
      );

      return tokens;

    } catch (error) {
      console.error('DexScreener API error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Fetch from Birdeye API (if API key is available)
   */
  private async fetchFromBirdeye(): Promise<Token[]> {
    if (!this.BIRDEYE_API_KEY) {
      console.log('Birdeye API: Skipped (no API key configured)');
      console.log('  → To enable: Set BIRDEYE_API_KEY environment variable');
      console.log('  → Get key at: https://birdeye.so');
      return [];
    }

    try {
      console.log('Fetching from Birdeye API...');
      
      const response = await fetch(
        `${BIRDEYE_TOKEN_LIST_API}?sort_by=mc&sort_type=asc&limit=1000`,
        {
          headers: {
            'X-API-KEY': this.BIRDEYE_API_KEY,
            'x-chain': 'solana',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        throw new Error(`Birdeye API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const allTokens: BirdeyeToken[] = data.data?.tokens || [];
      
      console.log(`  → Fetched ${allTokens.length} total tokens from Birdeye`);

      const filtered = allTokens.filter(token =>
        this.containsSearchTerm(token.name, SEARCH_TERMS) ||
        this.containsSearchTerm(token.symbol, SEARCH_TERMS)
      );

      return filtered.map(token => this.transformBirdeyeToken(token));

    } catch (error) {
      console.error('Birdeye API error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private transformJupiterToken(jupToken: JupiterToken): Token {
    const socials: Token['socials'] = {};

    if (jupToken.extensions) {
      if (jupToken.extensions.twitter) {
        socials.twitter = this.normalizeUrl(jupToken.extensions.twitter);
      }
      if (jupToken.extensions.telegram) {
        socials.telegram = this.normalizeUrl(jupToken.extensions.telegram);
      }
      if (jupToken.extensions.discord) {
        socials.discord = this.normalizeUrl(jupToken.extensions.discord);
      }
      if (jupToken.extensions.website) {
        socials.website = this.normalizeUrl(jupToken.extensions.website);
      }
    }

    return {
      name: jupToken.name,
      symbol: jupToken.symbol,
      mintAddress: jupToken.address,
      decimals: jupToken.decimals,
      socials: Object.keys(socials).length > 0 ? socials : undefined,
    };
  }

  private transformDexScreenerToken(pair: DexScreenerPair): Token {
    return {
      name: pair.baseToken.name,
      symbol: pair.baseToken.symbol,
      mintAddress: pair.baseToken.address,
      decimals: 9,
      socials: undefined,
    };
  }

  private transformBirdeyeToken(token: BirdeyeToken): Token {
    return {
      name: token.name,
      symbol: token.symbol,
      mintAddress: token.address,
      decimals: token.decimals || 9,
      socials: undefined,
    };
  }

  private containsSearchTerm(text: string, searchTerms: string[]): boolean {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return searchTerms.some(term => lowerText.includes(term.toLowerCase()));
  }

  private normalizeUrl(url: string): string {
    if (!url) return url;
    if (url.startsWith('@')) {
      return `https://twitter.com/${url.slice(1)}`;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  private getDemoTokens(): Token[] {
    return [
      {
        name: "402 Protocol",
        symbol: "402X",
        mintAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        decimals: 9,
        socials: {
          twitter: "https://twitter.com/402protocol",
          telegram: "https://t.me/402protocol",
          website: "https://402protocol.com"
        }
      },
      {
        name: "X402 Finance",
        symbol: "X402",
        mintAddress: "8yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV",
        decimals: 6,
        socials: {
          twitter: "https://twitter.com/x402finance",
          discord: "https://discord.gg/x402"
        }
      },
      {
        name: "402 DAO Token",
        symbol: "DAO402",
        mintAddress: "9zKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW",
        decimals: 9,
        socials: {
          discord: "https://discord.gg/dao402",
          website: "https://dao402.org"
        }
      },
      {
        name: "Super 402",
        symbol: "S402",
        mintAddress: "AaKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsX",
        decimals: 9,
        socials: {
          twitter: "https://twitter.com/super402",
          telegram: "https://t.me/super402",
          discord: "https://discord.gg/super402",
          website: "https://super402.io"
        }
      },
      {
        name: "402 Meme Coin",
        symbol: "MEME402",
        mintAddress: "BbKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsY",
        decimals: 6,
      },
      {
        name: "x402 Network",
        symbol: "x402NET",
        mintAddress: "CcKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsZ",
        decimals: 9,
        socials: {
          website: "https://x402network.com"
        }
      },
    ];
  }
}
