import React, { useState } from 'react';
import { 
  Car, 
  MapPin, 
  Layers, 
  Compass, 
  CircleDollarSign, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface DiscoveryGridProps {
  lang: 'en' | 'ur';
  setTab: (tab: string) => void;
  setSelectedCategory?: (category: string) => void;
  setSearchQuery?: (query: string) => void;
}

export function DiscoveryGrid({ lang, setTab, setSelectedCategory, setSearchQuery }: DiscoveryGridProps) {
  const [activeTab, setActiveTab] = useState<'category' | 'budget' | 'city'>('category');
  const isUrdu = lang === 'ur';

  // Flat and clean line-art category items
  const categories = [
    { name: 'Sedans', icon: <Car className="w-5 h-5 text-slate-700 dark:text-slate-300" />, count: '240+ listings', query: 'Sedan' },
    { name: 'SUVs & Jeeps', icon: <Compass className="w-5 h-5 text-slate-700 dark:text-slate-300" />, count: '180+ listings', query: 'SUV' },
    { name: 'Hatchbacks', icon: <Layers className="w-5 h-5 text-slate-700 dark:text-slate-300" />, count: '110+ listings', query: 'Hatchback' },
    { name: 'EVs & Hybrids', icon: <Car className="w-5 h-5 text-slate-700 dark:text-slate-300" />, count: '65+ listings', query: 'Hybrid' },
    { name: 'Luxury Stock', icon: <Car className="w-5 h-5 text-slate-700 dark:text-slate-300" />, count: '40+ listings', query: 'Mercedes' },
    { name: 'Pickup Trucks', icon: <Layers className="w-5 h-5 text-slate-700 dark:text-slate-300" />, count: '30+ listings', query: 'Pickup' },
  ];

  // Flat price bracket items
  const budgets = [
    { label: 'Under 30 Lakh', count: 'Rs. 3.0M Max', query: '30 Lakh' },
    { label: '30 - 50 Lakh', count: 'Rs. 3.0M - 5.0M', query: '50 Lakh' },
    { label: '50 Lakh - 1 Crore', count: 'Rs. 5.0M - 10.0M', query: '1 Crore' },
    { label: '1 - 2 Crore', count: 'Rs. 10.0M - 20.0M', query: '2 Crore' },
    { label: 'Above 2 Crore', count: 'Premium Stock', query: 'Above 2 Crore' }
  ];

  // Flat city tags
  const cities = [
    { name: 'Peshawar', count: 'Flagship Hub', query: 'Peshawar' },
    { name: 'Islamabad', count: 'Federal Capital', query: 'Islamabad' },
    { name: 'Mardan', count: 'KP Market', query: 'Mardan' },
    { name: 'Abbottabad', count: 'KP Market', query: 'Abbottabad' },
    { name: 'Swat', count: 'KP Market', query: 'Swat' },
    { name: 'Lahore', count: 'Punjab Market', query: 'Lahore' },
    { name: 'Karachi', count: 'Sindh Port', query: 'Karachi' },
    { name: 'Rawalpindi', count: 'Punjab Central', query: 'Rawalpindi' },
  ];

  const handleSelection = (type: 'cat' | 'bud' | 'city', value: string) => {
    if (type === 'cat') {
      setSelectedCategory?.(value);
      setSearchQuery?.('');
    } else if (type === 'city') {
      setSelectedCategory?.('All');
      setSearchQuery?.(value);
    } else if (type === 'bud') {
      setSelectedCategory?.('All');
      setSearchQuery?.(value);
    }
    setTab('inventory');
  };

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800" id="clean-room-discovery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 text-left">
          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {isUrdu ? 'گاڑیوں کو ڈائریکٹری سے تلاش کریں' : 'Browse Classifieds'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-xl">
              {isUrdu 
                ? 'اپنی پسندیدہ قسم، بجٹ، یا شہر کے لحاظ سے فلٹر کر کے جلدی تلاش کریں۔'
                : 'Instantly query current dealer inventory by make, pre-sorted budget segments, or location.'}
            </p>
          </div>

          {/* Interactive Navigation - Uniform and sleek */}
          <div 
            className="flex bg-[var(--color-bg-secondary)] p-1 rounded-xl border border-[var(--color-border-main)] self-start shrink-0"
          >
            <button 
              onClick={() => setActiveTab('category')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'category' 
                  ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-main)] shadow-sm' 
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`}
            >
              {isUrdu ? 'قسم' : 'Category'}
            </button>
            <button 
              onClick={() => setActiveTab('budget')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'budget' 
                  ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-main)] shadow-sm' 
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`}
            >
              {isUrdu ? 'بجٹ' : 'Budget'}
            </button>
            <button 
              onClick={() => setActiveTab('city')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'city' 
                  ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-main)] shadow-sm' 
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`}
            >
              {isUrdu ? 'شہر' : 'City'}
            </button>
          </div>
        </div>

        {/* Dynamic Display Area with strict grid alignment */}
        <div id="discovery-clean-grid-container">
          
          {/* CATEGORY LISTING */}
          {activeTab === 'category' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <div 
                  key={cat.name}
                  onClick={() => handleSelection('cat', cat.query)}
                  className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-main)] p-4 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {React.cloneElement(cat.icon, { className: 'w-6 h-6 text-[var(--color-text-main)]' })}
                  </div>
                  <h3 className="font-bold text-xs text-[var(--color-text-main)] uppercase tracking-tight mb-1">{cat.name}</h3>
                  <p className="text-[9px] font-mono text-[var(--color-text-muted)] font-semibold">{cat.count}</p>
                </div>
              ))}
            </div>
          )}

          {/* BUDGET LISTING */}
          {activeTab === 'budget' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {budgets.map((bud) => (
                <div 
                  key={bud.label}
                  onClick={() => handleSelection('bud', bud.query)}
                  className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-main)] p-4 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <CircleDollarSign className="w-6 h-6 text-[var(--color-text-main)]" />
                  </div>
                  <h3 className="font-bold text-xs text-[var(--color-text-main)] uppercase tracking-tight mb-1">{bud.label}</h3>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold">{bud.count}</p>
                </div>
              ))}
            </div>
          )}

          {/* CITY LISTING */}
          {activeTab === 'city' && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
              {cities.map((city) => (
                <div 
                  key={city.name}
                  onClick={() => handleSelection('city', city.query)}
                  className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-main)] p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-[var(--color-text-main)]" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-xs text-[var(--color-text-main)] uppercase tracking-tight">{city.name}</h4>
                      <p className="text-[10px] font-mono text-[var(--color-text-muted)] font-semibold">{city.count}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)] transition-all" />
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
