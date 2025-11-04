import { fetch } from 'undici';
import type { Token } from '@shared/schema';

const DEXSCREENER_SEARCH_API = 'https://api.dexscreener.com/latest/dex/search';
const PUMPPORTAL_TOKENS_API = 'https://pumpportal.fun/api/data/tokens';
const SEARCH_TERMS = ['402', 'x402', '402x'];

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
  info?: {
    socials?: Array<{
      type: string;
      url: string;
    }>;
    websites?: Array<{
      url: string;
    }>;
  };
}

interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  creator?: string;
  marketCap?: number;
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
      
      // Fetch from all sources in parallel
      const [dexScreenerResult, pumpFunResult] = await Promise.allSettled([
        this.fetchFromDexScreener(),
        this.fetchFromPumpFun(),
      ]);

      const tokensMap = new Map<string, Token>();

      // Process DexScreener tokens (primary)
      if (dexScreenerResult.status === 'fulfilled') {
        dexScreenerResult.value.forEach(token => {
          tokensMap.set(token.mintAddress.toLowerCase(), token);
        });
        console.log(`✓ DexScreener: ${dexScreenerResult.value.length} tokens`);
      } else {
        console.error('✗ DexScreener failed:', dexScreenerResult.reason?.message);
      }

      // Enhance with Pump.fun social links
      if (pumpFunResult.status === 'fulfilled') {
        let enhancedCount = 0;
        pumpFunResult.value.forEach(token => {
          const key = token.mintAddress.toLowerCase();
          const existing = tokensMap.get(key);
          
          if (existing && token.socials) {
            // Merge socials
            existing.socials = {
              ...existing.socials,
              ...token.socials,
            };
            enhancedCount++;
          } else if (!existing) {
            // New token from Pump.fun
            tokensMap.set(key, token);
          }
        });
        console.log(`✓ Pump.fun: ${pumpFunResult.value.length} tokens (enhanced ${enhancedCount} with social links)`);
      } else {
        console.warn('⚠ Pump.fun unavailable');
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

  private async fetchFromDexScreener(): Promise<Token[]> {
    try {
      console.log('Fetching from DexScreener API...');
      
      const allPairs: DexScreenerPair[] = [];
      
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

          if (i < SEARCH_TERMS.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }

        } catch (err) {
          console.warn(`  → "${term}": Failed -`, err instanceof Error ? err.message : 'Unknown');
        }
      }

      const solanaPairs = allPairs.filter(pair => 
        pair.chainId === 'solana' &&
        pair.baseToken &&
        (this.contains402(pair.baseToken.name) || this.contains402(pair.baseToken.symbol))
      );

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

  private async fetchFromPumpFun(): Promise<Token[]> {
    try {
      console.log('Fetching from Pump.fun API...');
      
      // PumpPortal provides a list of all recent tokens
      // We'll filter for 402 tokens
      const response = await fetch(PUMPPORTAL_TOKENS_API, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const allTokens: PumpFunToken[] = Array.isArray(data) ? data : [];
      
      console.log(`  → Fetched ${allTokens.length} tokens from Pump.fun`);

      // Filter for 402 tokens
      const filtered = allTokens.filter(token =>
        this.contains402(token.name) || this.contains402(token.symbol)
      );

      return filtered.map(token => this.transformPumpFunToken(token));

    } catch (error) {
      console.error('Pump.fun API error:', error instanceof Error ? error.message : 'Unknown');
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

  private transformDexScreenerToken(pair: DexScreenerPair): Token {
    const socials: Token['socials'] = {};

    if (pair.info?.socials) {
      pair.info.socials.forEach(social => {
        const type = social.type.toLowerCase();
        if (type === 'twitter') {
          socials.twitter = social.url;
        } else if (type === 'telegram') {
          socials.telegram = social.url;
        } else if (type === 'discord') {
          socials.discord = social.url;
        }
      });
    }

    if (pair.info?.websites && pair.info.websites.length > 0) {
      socials.website = pair.info.websites[0].url;
    }

    return {
      name: pair.baseToken.name,
      symbol: pair.baseToken.symbol,
      mintAddress: pair.baseToken.address,
      decimals: 9,
      socials: Object.keys(socials).length > 0 ? socials : undefined,
    };
  }

  private transformPumpFunToken(token: PumpFunToken): Token {
    const socials: Token['socials'] = {};

    if (token.twitter) {
      socials.twitter = this.normalizeUrl(token.twitter);
    }
    if (token.telegram) {
      socials.telegram = this.normalizeUrl(token.telegram);
    }
    if (token.website) {
      socials.website = this.normalizeUrl(token.website);
    }

    return {
      name: token.name,
      symbol: token.symbol,
      mintAddress: token.mint,
      decimals: 9,
      socials: Object.keys(socials).length > 0 ? socials : undefined,
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
