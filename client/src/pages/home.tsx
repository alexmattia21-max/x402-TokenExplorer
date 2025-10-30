import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import TokenGrid from "@/components/TokenGrid";
import Footer from "@/components/Footer";
import type { Token } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tokens = [], isLoading, error } = useQuery<Token[]>({
    queryKey: ['/api/tokens'],
  });

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;
    
    const query = searchQuery.toLowerCase();
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query) ||
        token.mintAddress.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection
        tokenCount={filteredTokens.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-destructive mb-2">
                Error Loading Tokens
              </h3>
              <p className="text-muted-foreground">
                {error instanceof Error ? error.message : 'Failed to fetch tokens. Please try again later.'}
              </p>
            </div>
          </div>
        ) : (
          <TokenGrid tokens={filteredTokens} loading={isLoading} />
        )}
      </div>
      <Footer />
    </div>
  );
}
