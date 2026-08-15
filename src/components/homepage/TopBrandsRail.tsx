import React from 'react';
import { Award, ChevronRight, Zap } from 'lucide-react';

interface TopBrandsRailProps {
  onSelectBrand: (brandName: string) => void;
  selectedBrand?: string;
  lang?: 'en' | 'ur';
}

export const TopBrandsRail: React.FC<TopBrandsRailProps> = ({
  onSelectBrand,
  selectedBrand,
  lang = 'en'
}) => {
  const isUrdu = lang === 'ur';

  // Key Pakistani market top brands with direct navigation
  const topPakistaniBrands = [
    { name: 'Toyota', tag: 'Market Leader', code: 'TOY', tagBg: 'bg-red-500/20 text-red-300 border-red-500/30' },
    { name: 'Honda', tag: 'Popular Sedans', code: 'HON', tagBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { name: 'Suzuki', tag: 'Economy & City', code: 'SUZ', tagBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { name: 'KIA', tag: 'Modern Crossovers', code: 'KIA', tagBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { name: 'Hyundai', tag: 'Premium SUVs', code: 'HYU', tagBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
    { name: 'MG', tag: 'British Heritage', code: 'MGG', tagBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { name: 'Changan', tag: 'Smart Utility', code: 'CHN', tagBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { name: 'Haval', tag: 'Luxury SUVs', code: 'HVL', tagBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  ];

  return (
    <section className="w-full bg-[#FFFFFF] py-8 px-4 sm:px-6 lg:px-8 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#007979]/10 border border-[#007979]/20 text-[#007979] flex items-center justify-center shrink-0">
              <Award size={16} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                {isUrdu ? 'پاکستان کے مقبول ترین برانڈز' : 'Top Automotive Brands in Pakistan'}
              </h3>
              <p className="text-xs text-[#64748B]">
                {isUrdu ? 'تلاش کو تیز کرنے کے لیے اہم برانڈز' : 'Fast-track discovery for Pakistan’s most searched vehicle manufacturers'}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Swipeable Rail & Desktop Flex Layout */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 lg:grid-cols-8">
          {topPakistaniBrands.map((brand) => {
            const isSelected = selectedBrand?.toLowerCase() === brand.name.toLowerCase();
            return (
              <button
                key={brand.name}
                onClick={() => onSelectBrand(brand.name)}
                className={`snap-start shrink-0 min-w-[140px] sm:min-w-0 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-sm ${
                  isSelected
                    ? 'bg-[#007979] border-[#007979] text-white shadow-md scale-102'
                    : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A] hover:border-[#007979]/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg font-mono font-bold text-[10px] flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white border border-[#E2E8F0] text-[#007979]'
                  }`}>
                    {brand.code}
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                    isSelected 
                      ? 'bg-white/20 border-white/30 text-white' 
                      : 'bg-[#007979]/10 border-[#007979]/20 text-[#007979]'
                  }`}>
                    {brand.tag}
                  </span>
                </div>

                <div className="flex items-center justify-between w-full pt-1">
                  <span className={`text-xs font-bold transition-colors ${
                    isSelected ? 'text-white' : 'text-[#0F172A] group-hover:text-[#007979]'
                  }`}>
                    {brand.name}
                  </span>
                  <ChevronRight size={14} className={`transition-all ${
                    isSelected ? 'text-white' : 'text-[#94A3B8] group-hover:text-[#007979] group-hover:translate-x-0.5'
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
