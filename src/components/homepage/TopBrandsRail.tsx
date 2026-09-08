import React from 'react';
import { Award, ChevronRight } from 'lucide-react';

interface TopBrandsRailProps {
  onSelectBrand: (brandName: string) => void;
  selectedBrand?: string;
  lang?: 'en' | 'ur';
}

const BRAND_LOGOS: Record<string, React.ReactNode> = {
  TOY: (
    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="12" rx="10" ry="6" />
      <ellipse cx="12" cy="12" rx="6" ry="3.5" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </svg>
  ),
  HON: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 7v10M16 7v10M8 12h8" />
    </svg>
  ),
  SUZ: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.5 4h-8.5l-4 5.5h6l-6 6.5h8.5l4-5.5h-6l6-6.5z" />
    </svg>
  ),
  KIA: (
    <svg viewBox="0 0 24 24" className="w-8 h-4 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 3l3.5 4.5L1 12h2.5L7 7.5 10.5 12H13V3H11v6.5L8 3.5h-1L4 9V3H1z" />
    </svg>
  ),
  HYU: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="12" rx="10" ry="6" />
      <path d="M9 8l1.5 8M15 8L13.5 16M9.7 12h4.6" strokeLinecap="round" />
    </svg>
  ),
  MGG: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none" strokeWidth="1.8" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,2 20,6 20,18 12,22 4,18 4,6" />
      <path d="M7.5 15V9l2.5 3 2.5-3v6M16.5 15h-2v-4h2v3c0 .5-.5 1-1 1M14.5 13h2" />
    </svg>
  ),
  CHN: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,3 21,7 21,17 12,21 3,17 3,7" />
      <path d="M8 9l4 5 4-5" />
    </svg>
  ),
  HVL: (
    <svg viewBox="0 0 24 24" className="w-10 h-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 4v8M1 8h4M5 4v8M10 4l-2.5 8M10 4l2.5 8M13 4l3 8 3-8M20 4v6.5a1.5 1.5 0 001.5 1.5H22" />
    </svg>
  )
};

export const TopBrandsRail: React.FC<TopBrandsRailProps> = ({
  onSelectBrand,
  selectedBrand,
  lang = 'en'
}) => {
  const isUrdu = lang === 'ur';

  // Key Pakistani market top brands with direct navigation
  const topPakistaniBrands = [
    { name: 'Toyota', tag: 'Leader', code: 'TOY' },
    { name: 'Honda', tag: 'Sedans', code: 'HON' },
    { name: 'Suzuki', tag: 'Economy', code: 'SUZ' },
    { name: 'KIA', tag: 'Crossovers', code: 'KIA' },
    { name: 'Hyundai', tag: 'Premium', code: 'HYU' },
    { name: 'MG', tag: 'Heritage', code: 'MGG' },
    { name: 'Changan', tag: 'Smart', code: 'CHN' },
    { name: 'Haval', tag: 'Luxury', code: 'HVL' },
  ];

  return (
    <section className="hidden md:block w-full bg-[var(--color-bg-primary)] py-8 px-4 sm:px-6 lg:px-8 border-b border-[var(--color-border-main)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] flex items-center justify-center shrink-0">
              <Award size={16} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-header)] tracking-tight">
                {isUrdu ? 'پاکستان کے مقبول ترین برانڈز' : 'Top Automotive Brands in Pakistan'}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                {isUrdu ? 'تلاش کو تیز کرنے کے لیے اہم برانڈز' : 'Fast-track discovery for Pakistan’s most searched vehicle manufacturers'}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Swipeable Rail & Desktop Grid Layout */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 lg:grid-cols-8">
          {topPakistaniBrands.map((brand) => {
            const isSelected = selectedBrand?.toLowerCase() === brand.name.toLowerCase();
            return (
              <button
                key={brand.name}
                type="button"
                onClick={() => onSelectBrand(brand.name)}
                className={`shrink-0 min-w-[140px] sm:min-w-0 p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group h-24 ${
                  isSelected
                    ? 'bg-[var(--color-accent-main)] border-[var(--color-accent-main)] text-[#090D14] shadow-md scale-[1.02]'
                    : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] border-[var(--color-border-main)] text-[var(--color-text-main)] hover:border-[var(--color-accent-main)]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected 
                      ? 'text-[#090D14]' 
                      : 'text-[var(--color-accent-main)]'
                  }`}>
                    {BRAND_LOGOS[brand.code] || <span className="font-mono font-bold text-[10px]">{brand.code}</span>}
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                    isSelected 
                      ? 'bg-[#090D14]/15 border-[#090D14]/20 text-[#090D14]' 
                      : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)]'
                  }`}>
                    {brand.tag}
                  </span>
                </div>

                <div className="flex items-center justify-between w-full pt-1.5 border-t border-[var(--color-border-main)]/30 mt-1">
                  <span className={`text-xs font-bold transition-colors ${
                    isSelected ? 'text-[#090D14]' : 'text-[var(--color-text-main)] group-hover:text-[var(--color-accent-main)]'
                  }`}>
                    {brand.name}
                  </span>
                  <ChevronRight size={14} className={`transition-all ${
                    isSelected ? 'text-[#090D14]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-main)] group-hover:translate-x-0.5'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
