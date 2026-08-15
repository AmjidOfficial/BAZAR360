import React from 'react';
import { Star, ChevronRight } from 'lucide-react';

interface PopularSearchesProps {
  onSelectTag: (tag: string) => void;
  lang?: 'en' | 'ur';
}

export const PopularSearches: React.FC<PopularSearchesProps> = ({ onSelectTag, lang = 'en' }) => {
  const isUrdu = lang === 'ur';

  const items = [
    { brand: 'Toyota', model: 'Corolla', logo: 'https://www.carlogos.org/car-logos/toyota-logo-2020-3d.png', query: 'Toyota Corolla' },
    { brand: 'Honda', model: 'Civic', logo: 'https://www.carlogos.org/car-logos/honda-logo-2000-full-download.png', query: 'Honda Civic' },
    { brand: 'Suzuki', model: 'Alto', logo: 'https://www.carlogos.org/car-logos/suzuki-logo-2014-full-download.png', query: 'Suzuki Alto' },
    { brand: 'KIA', model: 'Sportage', logo: 'https://www.carlogos.org/car-logos/kia-logo-2021-hex.png', query: 'Kia Sportage' },
    { brand: 'Hyundai', model: 'Tucson', logo: 'https://www.carlogos.org/car-logos/hyundai-logo-2011-full-download.png', query: 'Hyundai Tucson' },
    { brand: 'Toyota', model: 'Fortuner', logo: 'https://www.carlogos.org/car-logos/toyota-logo-2020-3d.png', query: 'Toyota Fortuner' },
    { brand: 'MG', model: 'HS', logo: 'https://www.carlogos.org/car-logos/mg-logo-2021.png', query: 'MG HS' },
    { brand: 'Honda', model: 'City', logo: 'https://www.carlogos.org/car-logos/honda-logo-2000-full-download.png', query: 'Honda City' },
  ];

  return (
    <div className="w-full bg-[#007979]/20 border-y border-[#24B1B1]/20 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-[#24B1B1] fill-[#24B1B1]" />
            <h2 className="text-base font-bold text-white tracking-wide">
              {isUrdu ? 'مقبول تلاش' : 'Popular Searches'}
            </h2>
          </div>
          <button 
            onClick={() => onSelectTag('Popular')}
            className="text-xs font-semibold text-[#24B1B1] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isUrdu ? 'سب دیکھیں' : 'View All'}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Grid/Rail of cards matching reference image */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {items.map((item) => (
            <button
              key={item.query}
              onClick={() => onSelectTag(item.query)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0A1820] hover:bg-[#007979]/40 border border-[#24B1B1]/20 hover:border-[#24B1B1] transition-all cursor-pointer text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#050B10] border border-[#24B1B1]/30 p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <img 
                  src={item.logo} 
                  alt={item.brand} 
                  className="w-full h-full object-contain filter brightness-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors truncate">{item.brand}</div>
                <div className="text-xs font-bold text-white group-hover:text-[#24B1B1] transition-colors truncate">{item.model}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
