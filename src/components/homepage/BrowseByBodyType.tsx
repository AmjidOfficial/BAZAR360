import React from 'react';
import { 
  Car, 
  ShieldCheck, 
  Zap, 
  Truck, 
  ArrowRight, 
  Sparkles,
  Crown,
  Gauge
} from 'lucide-react';

interface BrowseByBodyTypeProps {
  onSelectType: (type: string) => void;
  lang?: 'en' | 'ur';
}

export const BrowseByBodyType: React.FC<BrowseByBodyTypeProps> = ({ onSelectType, lang = 'en' }) => {
  const isUrdu = lang === 'ur';

  // Vehicle Categories
  const categories = [
    { id: 'sedan', name: isUrdu ? 'سیڈان' : 'Sedan', icon: Car, count: '4-Door Comfort' },
    { id: 'suv', name: isUrdu ? 'ایس یو وی' : 'SUV & 4x4', icon: ShieldCheck, count: 'All-Terrain 4WD' },
    { id: 'hatchback', name: isUrdu ? 'ہیچ بیک' : 'Hatchback', icon: Gauge, count: 'City Commuters' },
    { id: 'crossover', name: isUrdu ? 'کراس اوور' : 'Crossover', icon: Gauge, count: 'Compact Utility' },
    { id: 'pickup', name: isUrdu ? 'پک اپ / ریوو' : 'Pickup & Revo', icon: Truck, count: 'Heavy Duty 4x4' },
    { id: 'luxury', name: isUrdu ? 'لکژری گاڑیاں' : 'Luxury Series', icon: Crown, count: 'Executive Class' },
    { id: 'electric', name: isUrdu ? 'الیکٹرک اور ہائبرڈ' : 'Electric & Hybrid', icon: Zap, count: 'EV & High Mileage' },
    { id: 'convertible', name: isUrdu ? 'کنورٹیبل' : 'Convertible', icon: Sparkles, count: 'Open Top Luxury' },
  ];

  return (
    <section className="hidden md:block w-full bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#F97316]">
              {isUrdu ? 'گاڑی کی اقسام' : 'Explore Fleet'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mt-1">
              {isUrdu ? 'قسم کے لحاظ سے تلاش کریں' : 'Browse By Category'}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
              {isUrdu ? 'ہر سفر کے لیے بہترین گاڑی تلاش کریں۔' : 'Find the perfect car tailored for every journey across Pakistan.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectType('all')}
            className="text-xs font-bold text-[#0F172A] hover:text-[#F97316] flex items-center gap-1.5 cursor-pointer bg-white px-4 py-2 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#F97316]/40 transition-all"
          >
            <span>{isUrdu ? 'تمام دیکھیں' : 'View All Categories'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectType(cat.id)}
                className="group relative bg-white hover:bg-slate-50 border border-[#E2E8F0] hover:border-[#F97316]/50 p-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F97316] border border-orange-100 flex items-center justify-center mb-4 group-hover:bg-[#F97316] group-hover:text-white transition-all">
                    <Icon size={22} />
                  </div>

                  <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#F97316] transition-colors tracking-tight">
                    {cat.name}
                  </h3>
                  <span className="block text-xs text-[#64748B] mt-0.5">
                    {cat.count}
                  </span>
                </div>

                <div className="mt-6 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#F97316]">
                  <span>Filter Stock</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-[#F97316]" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
