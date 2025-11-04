import { ExternalLink, Twitter, MessageCircle, Globe, Copy, Check, TrendingUp, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { SiDiscord, SiTelegram } from "react-icons/si";

interface TokenCardProps {
  name: string;
  symbol: string;
  mintAddress: string;
  supply?: string;
  decimals?: number;
  marketCap?: number;
  createdAt?: number;
  socials?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
  };
}

export default function TokenCard({
  name,
  symbol,
  mintAddress,
  supply,
  decimals,
  marketCap,
  createdAt,
  socials,
}: TokenCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatMarketCap = (marketCap?: number): string => {
    if (!marketCap || marketCap === 0) return 'N/A';
    
    if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    } else if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    } else if (marketCap >= 1_000) {
      return `$${(marketCap / 1_000).toFixed(2)}K`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  };

  const formatCreatedAt = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
      }
      return diffInHours === 1 ? '1h ago' : `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1w ago' : `${weeks}w ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? '1mo ago' : `${months}mo ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMarketCapColor = (marketCap?: number): string => {
    if (!marketCap || marketCap === 0) return 'text-muted-foreground';
    if (marketCap < 10_000) return 'text-red-500';
    if (marketCap < 100_000) return 'text-orange-500';
    if (marketCap < 1_000_000) return 'text-yellow-500';
    return 'text-green-500';
  };

  const dexscreenerUrl = `https://dexscreener.com/solana/${mintAddress}`;

  return (
    <Card
      className="p-6 hover-elevate transition-all duration-200 border-card-border backdrop-blur-sm"
      data-testid={`card-token-${mintAddress}`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 via-chart-3/20 to-chart-2/20 flex items-center justify-center flex-shrink-0 border border-primary/20">
              <span className="text-lg font-semibold text-primary">
                {symbol.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="font-semibold text-lg text-foreground truncate"
                data-testid={`text-token-name-${mintAddress}`}
              >
                {name}
              </h3>
              <Badge
                variant="secondary"
                className="mt-1 uppercase text-xs font-medium"
                data-testid={`badge-symbol-${mintAddress}`}
              >
                {symbol}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Mint Address</span>
            <div className="flex items-center gap-1">
              <code
                className="text-xs font-mono text-foreground"
                data-testid={`text-mint-address-${mintAddress}`}
              >
                {truncateAddress(mintAddress)}
              </code>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleCopy}
                data-testid={`button-copy-${mintAddress}`}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-chart-2" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Market Cap */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Market Cap
            </span>
            <span 
              className={`text-xs font-semibold ${getMarketCapColor(marketCap)}`}
              data-testid={`text-market-cap-${mintAddress}`}
            >
              {formatMarketCap(marketCap)}
            </span>
          </div>

          {/* Created At */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created
            </span>
            <span 
              className="text-xs font-medium text-foreground"
              data-testid={`text-created-at-${mintAddress}`}
            >
              {formatCreatedAt(createdAt)}
            </span>
          </div>

          {supply && supply !== "undefined" && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Supply</span>
              <span className="text-xs font-medium text-foreground" data-testid={`text-supply-${mintAddress}`}>
                {supply}
              </span>
            </div>
          )}

          {decimals !== undefined && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Decimals</span>
              <span className="text-xs font-medium text-foreground">
                {decimals}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-border">
          <Button
            asChild
            className="w-full"
            data-testid={`button-dexscreener-${mintAddress}`}
          >
            <a
              href={dexscreenerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              View on Dexscreener
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {socials && Object.keys(socials).length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground mr-2">Socials:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {socials.twitter && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  asChild
                  data-testid={`button-twitter-${mintAddress}`}
                >
                  <a
                    href={socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {socials.telegram && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  asChild
                  data-testid={`button-telegram-${mintAddress}`}
                >
                  <a
                    href={socials.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SiTelegram className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {socials.discord && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  asChild
                  data-testid={`button-discord-${mintAddress}`}
                >
                  <a
                    href={socials.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SiDiscord className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {socials.website && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  asChild
                  data-testid={`button-website-${mintAddress}`}
                >
                  <a
                    href={socials.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
