import React from 'react';
import { ArrowRight, ChevronRight, ShieldCheck } from 'lucide-react';

interface ManufacturerLogosProps {
  onSelectBrand: (brandName: string) => void;
  selectedBrand?: string;
  lang?: 'en' | 'ur';
}

export const ManufacturerLogos: React.FC<ManufacturerLogosProps> = ({
  onSelectBrand,
  selectedBrand,
  lang = 'en'
}) => {
  const isUrdu = lang === 'ur';

  // Major brands in Pakistan with iconic accent styling
  const brandList = [
    { name: 'Toyota', code: 'TY', color: 'from-red-500/20 to-amber-500/10 border-red-500/30 text-red-400' },
    { name: 'Honda', code: 'HD', color: 'from-blue-500/20 to-sky-500/10 border-blue-500/30 text-blue-400' },
    { name: 'Suzuki', code: 'SZ', color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400' },
    { name: 'KIA', code: 'KA', color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400' },
    { name: 'Hyundai', code: 'HY', color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30 text-sky-400' },
    { name: 'MG', code: 'MG', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400' },
    { name: 'Changan', code: 'CG', color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400' },
    { name: 'Haval', code: 'HV', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400' },
    { name: 'Proton', code: 'PR', color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400' },
    { name: 'BMW', code: 'BMW', color: 'from-sky-500/20 to-blue-600/10 border-sky-400/40 text-sky-300' },
    { name: 'Mercedes-Benz', code: 'MB', color: 'from-amber-400/20 to-slate-400/10 border-amber-400/30 text-amber-300' },
    { name: 'Audi', code: 'AUD', color: 'from-slate-400/20 to-zinc-500/10 border-zinc-400/30 text-zinc-300' },
    { name: 'Nissan', code: 'NS', color: 'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-400' },
    { name: 'Mitsubishi', code: 'MT', color: 'from-red-600/20 to-amber-600/10 border-red-500/30 text-red-400' },
    { name: 'Isuzu', code: 'IZ', color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-400' },
    { name: 'Porsche', code: 'POR', color: 'from-amber-500/20 to-yellow-600/10 border-amber-400/30 text-amber-300' },
    { name: 'Land Rover', code: 'LR', color: 'from-emerald-600/20 to-green-600/10 border-emerald-500/30 text-emerald-400' },
  ];

  return (
    <section className="w-full bg-[#050B10] border-y border-[#24B1B1]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#007979]/30 border border-[#24B1B1]/30 text-[#24B1B1] text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
              <ShieldCheck size={12} />
              <span>{isUrdu ? 'آفیشل مینوفیکچررز' : 'Official Automotive Directory'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isUrdu ? 'آفیشل کار مینوفیکچررز براؤز کریں' : 'Explore By Official Manufacturer'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isUrdu ? 'پاکستان کے ٹاپ برانڈز کی گاڑیاں تلاش کریں' : 'Direct access to top automotive brands across Pakistan'}
            </p>
          </div>

          {selectedBrand && (
            <button
              onClick={() => onSelectBrand('')}
              className="text-xs font-bold text-[#24B1B1] hover:underline cursor-pointer self-start sm:self-auto transition-colors"
            >
              Clear Brand Filter ({selectedBrand})
            </button>
          )}
        </div>

        {/* Mobile-First Swipeable Rail & Desktop Flex Grid */}
        <div className="relative">
          {/* Rail Container */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {brandList.map((brand) => {
              const isSelected = selectedBrand?.toLowerCase() === brand.name.toLowerCase();
              return (
                <button
                  key={brand.name}
                  onClick={() => onSelectBrand(brand.name)}
                  className={`snap-start shrink-0 min-h-[52px] px-4 py-2.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-3 group ${
                    isSelected
                      ? 'bg-[#007979] border-[#24B1B1] text-white shadow-lg shadow-[#24B1B1]/20 scale-105'
                      : 'bg-[#0A1820] hover:bg-[#007979]/30 border-[#24B1B1]/20 text-slate-200 hover:border-[#24B1B1] hover:text-white'
                  }`}
                  aria-label={`Filter by ${brand.name}`}
                >
                  {/* Brand Monogram Badge */}
                  <div className="w-8 h-8 rounded-xl bg-[#050B10] border border-[#24B1B1]/30 text-[#24B1B1] flex items-center justify-center font-mono font-black text-xs tracking-wider shrink-0 group-hover:scale-110 transition-transform">
                    {brand.code}
                  </div>

                  <div className="text-left">
                    <span className="block text-xs font-bold tracking-wide text-white group-hover:text-[#24B1B1] transition-colors whitespace-nowrap">
                      {brand.name}
                    </span>
                    <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      Browse
                    </span>
                  </div>

                  <ChevronRight size={14} className="text-slate-500 group-hover:text-[#24B1B1] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </button>
              );
            })}
          </div>

          {/* Gradient indicators for touch horizontal scroll on mobile */}
          <div className="sm:hidden absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-[#050B10] to-transparent pointer-events-none" />
        </div>

      </div>
    </section>
  );
};
