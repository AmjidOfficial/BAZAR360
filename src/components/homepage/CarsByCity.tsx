import React from 'react';
import { MapPin, ArrowRight, Building2 } from 'lucide-react';

interface CarsByCityProps {
  onSelectCity: (city: string) => void;
  lang: 'en' | 'ur';
}

export const CarsByCity: React.FC<CarsByCityProps> = ({ onSelectCity, lang }) => {
  const isUrdu = lang === 'ur';

  const cities = [
    { name: 'Peshawar', tagline: 'Khyber Pakhtunkhwa Regional Hub', badge: 'Flagship Showrooms' },
    { name: 'Islamabad', tagline: 'Capital Federal Territory', badge: 'Verified Listings' },
    { name: 'Lahore', tagline: 'Punjab Regional Hub', badge: 'High Volume' },
    { name: 'Karachi', tagline: 'Sindh Regional Hub', badge: 'Coastal Imports' },
    { name: 'Rawalpindi', tagline: 'Twin City Network', badge: 'Suburban Market' },
    { name: 'Multan', tagline: 'South Punjab Market', badge: 'Growing Hub' },
    { name: 'Faisalabad', tagline: 'Central Industrial Hub', badge: 'Fast Trade' },
    { name: 'Gujranwala', tagline: 'GT Road Commercial Hub', badge: 'Direct Sellers' },
  ];

  return (
    <div className="w-full bg-[var(--color-bg-secondary)] py-10 px-4 sm:px-6 lg:px-8 border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400">
              {isUrdu ? 'شہروں کے لحاظ سے گاڑیاں' : 'Nationwide Vehicle Network'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-header)] mt-1 tracking-tight">
              {isUrdu ? 'اپنے قریب ترین شہر کی گاڑیاں تلاش کریں' : 'Browse Cars By City'}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <div
              key={city.name}
              onClick={() => onSelectCity(city.name)}
              className="group bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-header)] tracking-tight group-hover:text-amber-400 transition-colors">
                      {city.name}
                    </h3>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1">
                  {city.tagline}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-mono font-semibold text-[var(--color-text-main)] group-hover:text-amber-400">
                <span className="text-[10px] text-amber-400 uppercase font-mono">{city.badge}</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
