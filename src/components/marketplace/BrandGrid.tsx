import React from 'react';

interface Brand {
  name: string;
  slug: string;
  svgPath: React.ReactNode;
  viewBox?: string;
}

const BRANDS_DATA: Brand[] = [
  {
    name: 'Toyota',
    slug: 'toyota',
    viewBox: '0 0 100 100',
    svgPath: (
      <g>
        <path d="M50,15 C22.4,15 0,26.2 0,40 C0,53.8 22.4,65 50,65 C77.6,65 100,53.8 100,40 C100,26.2 77.6,15 50,15 Z M50,59.3 C27,59.3 8.3,50.7 8.3,40 C8.3,29.3 27,20.7 50,20.7 C73,20.7 91.7,29.3 91.7,40 C91.7,50.7 73,59.3 50,59.3 Z" fill="currentColor" />
        <path d="M50,22.2 C35,22.2 22.7,28.9 22.7,37.1 C22.7,45.3 35,52 50,52 C65,52 77.3,45.3 77.3,37.1 C77.3,28.9 65,22.2 50,22.2 Z M50,47 C38.5,47 29.2,42.5 29.2,37.1 C29.2,31.7 38.5,27.2 50,27.2 C61.5,27.2 70.8,31.7 70.8,37.1 C70.8,42.5 61.5,47 50,47 Z" fill="currentColor" />
        <path d="M50,20.7 C44.5,20.7 40,29.3 40,40 C40,50.7 44.5,59.3 50,59.3 C55.5,59.3 60,50.7 60,40 C60,29.3 55.5,20.7 50,20.7 Z M50,53.6 C47.2,53.6 45,47.5 45,40 C45,32.5 47.2,26.4 50,26.4 C52.8,26.4 55,32.5 55,40 C55,47.5 52.8,53.6 50,53.6 Z" fill="currentColor" />
      </g>
    )
  },
  {
    name: 'Honda',
    slug: 'honda',
    viewBox: '0 0 100 100',
    svgPath: (
      <path d="M15,10 C15,10 21,90 23,90 L77,90 C79,90 85,10 85,10 L70,10 C70,10 65,55 64,55 L36,55 C35,55 30,10 30,10 L15,10 Z M28.5,15 L32.5,47 L67.5,47 L71.5,15 L80,15 C80,15 74.5,84 73.5,84 L26.5,84 C25.5,84 20,15 20,15 L28.5,15 Z" fill="currentColor" />
    )
  },
  {
    name: 'Suzuki',
    slug: 'suzuki',
    viewBox: '0 0 100 100',
    svgPath: (
      <path d="M15,10 L55,10 C55,10 75,10 75,25 C75,40 55,45 55,45 L75,70 C75,70 85,82 85,90 L45,90 C45,90 25,90 25,75 C25,60 45,55 45,55 L25,30 C25,30 15,18 15,10 Z M33,26 L47,44 L70,44 C70,44 65,32 55,26 L33,26 Z M67,74 L53,56 L30,56 C30,56 35,68 45,74 L67,74 Z" fill="currentColor" />
    )
  },
  {
    name: 'Hyundai',
    slug: 'hyundai',
    viewBox: '0 0 100 100',
    svgPath: (
      <path d="M50,15 C25.1,15 5,28.4 5,45 C5,61.6 25.1,75 50,75 C74.9,75 95,61.6 95,45 C95,28.4 74.9,15 50,15 Z M50,70 C28.5,70 11,58.8 11,45 C11,31.2 28.5,20 50,20 C71.5,20 89,31.2 89,45 C89,58.8 71.5,70 50,70 Z M35,28 L43,28 L52,56 L65,28 L73,28 L59,62 L51,62 L35,28 Z M38.5,35 L45.5,35 L48.5,45 L38.5,45 Z M51.5,45 L54.5,35 L61.5,35 L61.5,45 Z" fill="currentColor" />
    )
  },
  {
    name: 'KIA',
    slug: 'kia',
    viewBox: '0 0 100 100',
    svgPath: (
      <g fill="currentColor">
        <path d="M15,30 L27,30 L38,55 L49,30 L61,30 L45,65 L33,65 Z" />
        <path d="M68,30 L80,30 L80,65 L68,65 Z" />
        <path d="M48,30 L55,42 L62,30 L70,30 L59,48 L70,65 L58,65 L51,54 L44,65 L32,65 Z" />
      </g>
    )
  },
  {
    name: 'MG',
    slug: 'mg',
    viewBox: '0 0 100 100',
    svgPath: (
      <g fill="currentColor">
        <path d="M50,5 C25.1,5 5,25.1 5,50 C5,74.9 25.1,95 50,95 C74.9,95 95,74.9 95,50 C95,25.1 74.9,5 50,5 Z M50,10 C72.1,10 90,27.9 90,50 C90,72.1 72.1,90 50,90 C27.9,90 10,72.1 10,50 C10,27.9 27.9,10 50,10 Z" />
        <path d="M25,35 L33,35 L42,55 L51,35 L59,35 L50,65 L42,65 L33,45 L25,65 L17,65 Z" />
        <path d="M68,35 C75,35 83,40 83,50 C83,60 75,65 68,65 L55,65 L55,35 Z M68,43 L63,43 L63,57 L68,57 C71,57 75,55 75,50 C75,45 71,43 68,43 Z" />
      </g>
    )
  }
];

interface BrandGridProps {
  onBrandClick?: (brandName: string) => void;
  lang?: 'en' | 'ur';
}

export const BrandGrid: React.FC<BrandGridProps> = ({ onBrandClick, lang = 'en' }) => {
  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {BRANDS_DATA.map((brand) => (
          <button
            key={brand.slug}
            onClick={() => onBrandClick?.(brand.name)}
            className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 hover:border-slate-300 rounded-2xl transition-all duration-300 cursor-pointer group hover:shadow-md hover:-translate-y-1 select-none"
            title={`${lang === 'en' ? 'View' : 'دیکھیں'} ${brand.name}`}
          >
            <div className="w-16 h-16 flex items-center justify-center text-slate-400 group-hover:text-slate-800 transition-colors duration-300">
              <svg
                viewBox={brand.viewBox || "0 0 100 100"}
                className="w-12 h-12 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
              >
                {brand.svgPath}
              </svg>
            </div>
            <span className="mt-3 text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-wider font-sans">
              {brand.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandGrid;
