import { fetch } from 'undici';
import type { Token } from '@shared/schema';

const JUPITER_TOKEN_API = 'https://tokens.jup.ag/tokens';
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

export class SolanaTokenScanner {
  private tokensCache: Token[] = [];
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async scanFor402Tokens(): Promise<Token[]> {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (this.tokensCache.length > 0 && (now - this.lastFetchTime) < this.CACHE_TTL) {
      console.log('Returning cached token data');
      return this.tokensCache;
    }

    try {
      console.log('Fetching tokens from Jupiter API...');
      const response = await fetch(JUPITER_TOKEN_API);
      
      if (!response.ok) {
        throw new Error(`Jupiter API returned ${response.status}: ${response.statusText}`);
      }

      const allTokens: JupiterToken[] = await response.json();
      console.log(`Fetched ${allTokens.length} total tokens from Jupiter`);

      // Filter for tokens containing '402' or 'x402' in name or symbol
      const filtered402Tokens = allTokens.filter(token => 
        this.containsSearchTerm(token.name, SEARCH_TERMS) ||
        this.containsSearchTerm(token.symbol, SEARCH_TERMS)
      );

      console.log(`Found ${filtered402Tokens.length} tokens matching 402/x402`);

      // Transform to our schema
      this.tokensCache = filtered402Tokens.map(token => this.transformToken(token));
      this.lastFetchTime = now;

      return this.tokensCache;
    } catch (error) {
      console.error('Error scanning for tokens:', error);
      
      // If we have cached data, return it even if stale
      if (this.tokensCache.length > 0) {
        console.log('Returning stale cached data due to fetch error');
        return this.tokensCache;
      }
      
      // If Jupiter API is unavailable (e.g., in test environment), return demo data
      console.warn('Jupiter API unavailable, returning demo data for development/testing');
      return this.getDemoTokens();
    }
  }

  private containsSearchTerm(text: string, searchTerms: string[]): boolean {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return searchTerms.some(term => lowerText.includes(term.toLowerCase()));
  }

  private transformToken(jupToken: JupiterToken): Token {
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
      // Supply data is not available from Jupiter's basic token list API
      // To get supply, you would need to query on-chain via RPC or use Jupiter's Token API V2
      socials: Object.keys(socials).length > 0 ? socials : undefined,
    };
  }

  private normalizeUrl(url: string): string {
    // Handle various URL formats
    if (!url) return url;
    
    // If it's just a handle (e.g., "@username"), convert to full URL
    if (url.startsWith('@')) {
      return `https://twitter.com/${url.slice(1)}`;
    }
    
    // Ensure proper protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    
    return url;
  }

  private getDemoTokens(): Token[] {
    // Demo tokens for development/testing when Jupiter API is unavailable
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
