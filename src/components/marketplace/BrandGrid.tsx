import React from 'react';

interface Brand {
  name: string;
  slug: string;
}

const BRANDS_DATA: Brand[] = [
  { name: 'Toyota', slug: 'toyota' },
  { name: 'Honda', slug: 'honda' },
  { name: 'Suzuki', slug: 'suzuki' },
  { name: 'Hyundai', slug: 'hyundai' },
  { name: 'KIA', slug: 'kia' },
  { name: 'MG', slug: 'mg' },
  { name: 'Changan', slug: 'changan' },
  { name: 'Haval', slug: 'haval' },
  { name: 'BMW', slug: 'bmw' },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz' },
  { name: 'Audi', slug: 'audi' },
  { name: 'Nissan', slug: 'nissan' }
];

interface BrandGridProps {
  onBrandClick?: (brandName: string) => void;
  lang?: 'en' | 'ur';
}

export const BrandGrid: React.FC<BrandGridProps> = ({ onBrandClick, lang = 'en' }) => {
  return (
    <div className="w-full bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border-main)] p-4 sm:p-6 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {BRANDS_DATA.map((brand) => (
          <button
            key={brand.slug}
            onClick={() => onBrandClick?.(brand.name)}
            className="flex flex-col items-center justify-center py-4 px-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-slate-400 dark:hover:border-slate-600 rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm hover:-translate-y-0.5 select-none"
            title={`${lang === 'en' ? 'View' : 'دیکھیں'} ${brand.name}`}
          >
            <span className="text-sm font-bold text-[var(--color-text-main)] group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors tracking-wide font-sans">
              {brand.name}
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">
              Explore Fleet
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandGrid;

