import TokenCard from '../TokenCard';

export default function TokenCardExample() {
  return (
    <div className="p-6 bg-background">
      <TokenCard
        name="402 Protocol Token"
        symbol="402X"
        mintAddress="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
        supply="1,000,000,000"
        decimals={9}
        socials={{
          twitter: "https://twitter.com",
          telegram: "https://t.me",
          website: "https://example.com"
        }}
      />
    </div>
  );
}
