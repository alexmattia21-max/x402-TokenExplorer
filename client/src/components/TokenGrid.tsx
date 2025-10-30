import TokenCard from "./TokenCard";
import { Loader2 } from "lucide-react";

interface Token {
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

interface TokenGridProps {
  tokens: Token[];
  loading?: boolean;
}

export default function TokenGrid({ tokens, loading }: TokenGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="loading-state">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Scanning blockchain...</p>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-20" data-testid="empty-state">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No tokens found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or check back later for new tokens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      data-testid="token-grid"
    >
      {tokens.map((token, index) => (
        <div
          key={token.mintAddress}
          className="animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
        >
          <TokenCard {...token} />
        </div>
      ))}
    </div>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
