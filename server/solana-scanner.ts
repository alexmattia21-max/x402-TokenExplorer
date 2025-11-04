import { fetch } from 'undici';
import type { Token } from '@shared/schema';

const JUPITER_TOKEN_API = 'https://tokens.jup.ag/tokens';
const DEXSCREENER_SEARCH_API = 'https://api.dexscreener.com/latest/dex/search';
const SEARCH_TERMS = ['402', 'x402'];

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
  pairCreatedAt?: number;
}

export class SolanaTokenScanner {
  private tokensCache: Token[] = [];
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  async scanFor402Tokens(): Promise<Token[]> {
    const now = Date.now();

    // Return cached data if still fresh
    if (this.tokensCache.length > 0 && (now - this.lastFetchTime) < this.CACHE_TTL) {
      console.log(`Returning cached token data (${this.tokensCache.length} tokens)`);
      return this.tokensCache;
    }

    try {
      console.log('=== Starting token scan ===');
      
      // DexScreener is PRIMARY (has market cap + creation time)
      // Jupiter is OPTIONAL (adds social links if available)
      const [dexScreenerResult, jupiterResult] = await Promise.allSettled([
        this.fetchFromDexScreener(),
        this.fetchFromJupiter(),
      ]);

      // Start with DexScreener tokens (they have the essential data)
      const tokensMap = new Map<string, Token>();

      if (dexScreenerResult.status === 'fulfilled') {
        dexScreenerResult.value.forEach(token => {
          tokensMap.set(token.mintAddress.toLowerCase(), token);
        });
        console.log(`✓ DexScreener: ${dexScreenerResult.value.length} tokens (PRIMARY)`);
      } else {
        console.error('✗ DexScreener failed:', dexScreenerResult.reason?.message || 'Unknown error');
        // If DexScreener fails completely, we have no tokens
        return [];
      }

      // Enhance with Jupiter data (social links) if available
      if (jupiterResult.status === 'fulfilled') {
        jupiterResult.value.forEach(token => {
          const key = token.mintAddress.toLowerCase();
          const existing = tokensMap.get(key);
          
          if (existing && token.socials) {
            // Add social links to existing DexScreener token
            existing.socials = token.socials;
            existing.decimals = token.decimals; // Jupiter has more accurate decimals
          }
        });
        console.log(`✓ Jupiter: Enhanced ${jupiterResult.value.length} tokens with social links`);
      } else {
        console.warn('⚠ Jupiter failed (optional) - tokens will show without social links');
      }

      this.tokensCache = Array.from(tokensMap.values());
      this.lastFetchTime = now;

      console.log(`=== Total tokens found: ${this.tokensCache.length} ===`);
      return this.tokensCache;

    } catch (error) {
      console.error('Error scanning for tokens:', error);

      // If we have cached data, return it even if stale
      if (this.tokensCache.length > 0) {
        console.log('Returning stale cached data due to error');
        return this.tokensCache;
      }

      // No fallback - return empty array
      return [];
    }
  }

  private async fetchFromDexScreener(): Promise<Token[]> {
    try {
      console.log('Fetching from DexScreener API...');
      
      const allPairs: DexScreenerPair[] = [];
      
      // Search with delay between requests
      for (let i = 0; i < SEARCH_TERMS.length; i++) {
        const term = SEARCH_TERMS[i];
        
        try {
          const url = `${DEXSCREENER_SEARCH_API}?q=${encodeURIComponent(term)}`;
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000),
          });

          if (response.ok) {
            const data: { pairs?: DexScreenerPair[] } = await response.json();
            if (data.pairs) {
              allPairs.push(...data.pairs);
              console.log(`  → "${term}": ${data.pairs.length} pairs`);
            }
          } else if (response.status === 429) {
            console.warn(`  → "${term}": Rate limited, skipping`);
          } else {
            console.warn(`  → "${term}": HTTP ${response.status}`);
          }

          // Delay between searches to avoid rate limits
          if (i < SEARCH_TERMS.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

        } catch (err) {
          console.warn(`  → "${term}": Failed -`, err instanceof Error ? err.message : 'Unknown');
        }
      }

      // Filter for Solana and matching tokens
      const solanaPairs = allPairs.filter(pair => 
        pair.chainId === 'solana' &&
        pair.baseToken &&
        (this.containsSearchTerm(pair.baseToken.name, SEARCH_TERMS) ||
         this.containsSearchTerm(pair.baseToken.symbol, SEARCH_TERMS))
      );

      // Deduplicate by token address
      const tokenMap = new Map<string, DexScreenerPair>();
      solanaPairs.forEach(pair => {
        const key = pair.baseToken.address.toLowerCase();
        const existing = tokenMap.get(key);
        
        if (!existing || (pair.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
          tokenMap.set(key, pair);
        }
      });

      return Array.from(tokenMap.values()).map(pair => 
        this.transformDexScreenerToken(pair)
      );

    } catch (error) {
      console.error('DexScreener API error:', error instanceof Error ? error.message : 'Unknown');
      throw error;
    }
  }

  private async fetchFromJupiter(): Promise<Token[]> {
    try {
      console.log('Fetching from Jupiter API (for social links)...');
      const response = await fetch(JUPITER_TOKEN_API, {
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`Jupiter API returned ${response.status}`);
      }

      const allTokens: JupiterToken[] = await response.json();
      console.log(`  → Fetched ${allTokens.length} total tokens`);

      // Filter for tokens containing search terms
      const filtered = allTokens.filter(token =>
        this.containsSearchTerm(token.name, SEARCH_TERMS) ||
        this.containsSearchTerm(token.symbol, SEARCH_TERMS)
      );

      return filtered.map(token => this.transformJupiterToken(token));

    } catch (error) {
      console.error('Jupiter API error (optional):', error instanceof Error ? error.message : 'Unknown');
      throw error;
    }
  }

  private transformDexScreenerToken(pair: DexScreenerPair): Token {
    return {
      name: pair.baseToken.name,
      symbol: pair.baseToken.symbol,
      mintAddress: pair.baseToken.address,
      decimals: 9,
      socials: undefined,
      marketCap: pair.marketCap,
      createdAt: pair.pairCreatedAt,
    };
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
      marketCap: undefined,
      createdAt: undefined,
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
}
