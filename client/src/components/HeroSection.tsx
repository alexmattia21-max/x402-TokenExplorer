import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  tokenCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function HeroSection({
  tokenCount,
  searchQuery,
  onSearchChange,
}: HeroSectionProps) {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-chart-3/5 to-chart-2/10 animate-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <Badge variant="secondary" className="text-sm font-medium px-4 py-1.5">
            <Sparkles className="h-3 w-3 mr-1.5 inline" />
            Powered by Solana
          </Badge>
        </div>

        <h1
          className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
          data-testid="text-hero-title"
        >
          Discover 402 Tokens
          <br />
          <span className="bg-gradient-to-r from-primary via-chart-3 to-chart-2 bg-clip-text text-transparent">
            On Solana
          </span>
        </h1>

        <p
          className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          data-testid="text-hero-subtitle"
        >
          Explore all SPL tokens containing "402" or "x402" in their name or
          symbol. Track prices, view social links, and analyze on Dexscreener.
        </p>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-lg blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative backdrop-blur-md bg-card/50 border border-card-border rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground ml-3" />
                <Input
                  type="search"
                  placeholder="Search by name, symbol, or mint address..."
                  className="border-0 bg-transparent focus-visible:ring-0 text-base"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
          <p className="text-sm text-muted-foreground" data-testid="text-token-count">
            <span className="font-semibold text-foreground">{tokenCount}</span>{" "}
            tokens discovered
          </p>
        </div>
      </div>
    </div>
  );
}
