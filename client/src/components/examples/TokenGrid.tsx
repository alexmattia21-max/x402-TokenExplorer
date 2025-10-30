import TokenGrid from '../TokenGrid';

const mockTokens = [
  {
    name: "402 Protocol",
    symbol: "402X",
    mintAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    supply: "1,000,000,000",
    decimals: 9,
    socials: {
      twitter: "https://twitter.com",
      telegram: "https://t.me",
      website: "https://example.com"
    }
  },
  {
    name: "X402 Finance",
    symbol: "X402",
    mintAddress: "8yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV",
    supply: "500,000,000",
    decimals: 6,
  },
  {
    name: "402 DAO",
    symbol: "DAO402",
    mintAddress: "9zKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW",
    supply: "10,000,000",
    decimals: 9,
    socials: {
      discord: "https://discord.gg",
      website: "https://example.com"
    }
  }
];

export default function TokenGridExample() {
  return (
    <div className="p-6 bg-background">
      <TokenGrid tokens={mockTokens} />
    </div>
  );
}
