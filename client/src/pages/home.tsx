import { useState, useMemo } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import TokenGrid from "@/components/TokenGrid";
import Footer from "@/components/Footer";

// TODO: remove mock functionality - this will be replaced with real blockchain data
const mockTokens = [
  {
    name: "402 Protocol",
    symbol: "402X",
    mintAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    supply: "1,000,000,000",
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
    supply: "500,000,000",
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
    supply: "10,000,000",
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
    supply: "2,500,000,000",
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
    supply: "100,000,000,000",
    decimals: 6,
  },
  {
    name: "x402 Network",
    symbol: "x402NET",
    mintAddress: "CcKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsZ",
    supply: "50,000,000",
    decimals: 9,
    socials: {
      website: "https://x402network.com"
    }
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading] = useState(false); // TODO: remove mock functionality - will be true while fetching

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return mockTokens;
    
    const query = searchQuery.toLowerCase();
    return mockTokens.filter(
      (token) =>
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query) ||
        token.mintAddress.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection
        tokenCount={filteredTokens.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TokenGrid tokens={filteredTokens} loading={loading} />
      </div>
      <Footer />
    </div>
  );
}
