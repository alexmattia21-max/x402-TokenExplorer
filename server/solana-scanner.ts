import { fetch } from 'undici';
import type { Token } from '@shared/schema';

const JUPITER_TOKEN_API = 'https://tokens.jup.ag/tokens';
const DEXSCREENER_SEARCH_API = 'https://api.dexscreener.com/latest/dex/search';
const SEARCH_TERMS = ['402', 'x402', '402x']; // Two terms with delay between them

interface JupiterToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  extensions?: {
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

    if (this.tokensCache.length > 0 && (now - this.lastFetchTime) < this.CACHE_TTL) {
      console.log(`Returning cached token data (${this.tokensCache.length} tokens)`);
      return this.tokensCache;
    }

    try {
      console.log('=== Starting token scan ===');
      
      // Fetch from both sources (Jupiter optional, DexScreener required)
      const [jupiterResult, dexScreenerResult] = await Promise.allSettled([
        this.fetchFromJupiter(),
        this.fetchFromDexScreener(),
      ]);

      // Start with DexScreener (primary source)
      const tokensMap = new Map<string, Token>();

      if (dexScreenerResult.status === 'fulfilled') {
        dexScreenerResult.value.forEach(token => {
          tokensMap.set(token.mintAddress.toLowerCase(), token);
        });
        console.log(`✓ DexScreener: ${dexScreenerResult.value.length} tokens (PRIMARY)`);
      } else {
        console.error('✗ DexScreener failed:', dexScreenerResult.reason?.message);
        // If DexScreener fails, we have no tokens
        return this.tokensCache.length > 0 ? this.tokensCache : [];
      }

      // Enhance with Jupiter social links if available
      if (jupiterResult.status === 'fulfilled') {
        let enhancedCount = 0;
        jupiterResult.value.forEach(token => {
          const key = token.mintAddress.toLowerCase();
          const existing = tokensMap.get(key);
          
          if (existing && token.socials) {
            existing.socials = token.socials;
            existing.decimals = token.decimals; // Jupiter has accurate decimals
            enhancedCount++;
          }
        });
        console.log(`✓ Jupiter: Enhanced ${enhancedCount} tokens with social links`);
      } else {
        console.warn('⚠ Jupiter unavailable (network blocked) - tokens will show without social links');
      }

      this.tokensCache = Array.from(tokensMap.values());
      this.lastFetchTime = now;

      console.log(`=== Total tokens: ${this.tokensCache.length} ===`);
      return this.tokensCache;

    } catch (error) {
      console.error('Error scanning for tokens:', error);

      if (this.tokensCache.length > 0) {
        console.log('Returning stale cached data');
        return this.tokensCache;
      }

      return [];
    }
  }

  private async fetchFromJupiter(): Promise<Token[]> {
    try {
      console.log('Fetching from Jupiter API (for social links)...');
      
      const response = await fetch(JUPITER_TOKEN_API, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const allTokens: JupiterToken[] = await response.json();
      console.log(`  → Fetched ${allTokens.length} total tokens`);

      const filtered = allTokens.filter(token =>
        this.contains402(token.name) || this.contains402(token.symbol)
      );

      return filtered.map(token => this.transformJupiterToken(token));

    } catch (error) {
      console.error('Jupiter API error (optional):', error instanceof Error ? error.message : 'Unknown');
      throw error;
    }
  }

  private async fetchFromDexScreener(): Promise<Token[]> {
    try {
      console.log('Fetching from DexScreener API...');
      
      const allPairs: DexScreenerPair[] = [];
      
      // Search multiple terms with delay between each
      for (let i = 0; i < SEARCH_TERMS.length; i++) {
        const term = SEARCH_TERMS[i];
        
        try {
          const url = `${DEXSCREENER_SEARCH_API}?q=${encodeURIComponent(term)}`;
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0',
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

          // Delay between searches to avoid rate limiting (skip delay on last term)
          if (i < SEARCH_TERMS.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
          }

        } catch (err) {
          console.warn(`  → "${term}": Failed -`, err instanceof Error ? err.message : 'Unknown');
        }
      }

      console.log(`  → Total pairs fetched: ${allPairs.length}`);

      // Filter for Solana and matching tokens
      const solanaPairs = allPairs.filter(pair => 
        pair.chainId === 'solana' &&
        pair.baseToken &&
        (this.contains402(pair.baseToken.name) || this.contains402(pair.baseToken.symbol))
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

  private contains402(text: string): boolean {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return lowerText.includes('402') || 
           lowerText.includes('x402') || 
           lowerText.includes('402x');
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
