import HeroSection from '../HeroSection';
import { useState } from 'react';

export default function HeroSectionExample() {
  const [search, setSearch] = useState('');
  
  return (
    <div className="bg-background">
      <HeroSection
        tokenCount={42}
        searchQuery={search}
        onSearchChange={setSearch}
      />
    </div>
  );
}
