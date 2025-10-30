import { ExternalLink, Twitter, MessageCircle, Globe, Copy, Check } from "lucide-react";
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
