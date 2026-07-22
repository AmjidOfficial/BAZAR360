import React, { useEffect, useState } from 'react';
import { CarListing } from '../../types';
import { dbFetchListings } from '../../lib/dbService';

interface BrandLogosProps {
  onSelectBrand?: (brand: string) => void;
}

export function BrandLogos({ onSelectBrand }: BrandLogosProps) {
  const [brands, setBrands] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const listings = await dbFetchListings();
        const counts: Record<string, number> = {};
        
        listings.forEach(listing => {
          if (listing.make && listing.approved !== false) {
            const normalized = listing.make.trim();
            counts[normalized] = (counts[normalized] || 0) + 1;
          }
        });

        const sortedBrands = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        if (sortedBrands.length > 0) {
          setBrands(sortedBrands);
        } else {
          // Stable fallback if database is loading or empty
          const fallbacks = ['Porsche', 'Tesla', 'Lamborghini', 'Toyota', 'Honda', 'Suzuki', 'Audi'];
          setBrands(fallbacks.map(f => ({ name: f, count: 0 })));
        }
      } catch (err) {
        console.warn('Error fetching dynamic brand categories:', err);
        const fallbacks = ['Porsche', 'Tesla', 'Lamborghini', 'Toyota', 'Honda', 'Suzuki', 'Audi'];
        setBrands(fallbacks.map(f => ({ name: f, count: 0 })));
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  return (
    <div className="w-full pb-8">
      <div className="text-center mb-6 border-b border-[var(--color-border-main)] pb-4 inline-block">
        <span className="text-[9px] font-mono font-black uppercase text-[var(--color-text-muted)] tracking-widest block">Available Stock Categories</span>
        <h4 className="text-xs font-mono font-extrabold text-[var(--color-text-main)] mt-1 uppercase">Dynamic Database Manufacturer Index</h4>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
        {brands.map(brand => (
          <button
            key={brand.name}
            onClick={() => onSelectBrand?.(brand.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-main)] text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="font-extrabold uppercase tracking-tight">{brand.name}</span>
            {brand.count > 0 && (
              <span className="px-1.5 py-0.2 text-[8px] font-black rounded-full bg-[var(--color-bg-primary)] text-[var(--color-accent-main)] border border-[var(--color-border-main)] font-sans">
                {brand.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
