import React, { useState } from 'react';
import { Search, MapPin, Car, DollarSign } from 'lucide-react';

interface UnifiedSearchProps {
  lang: 'en' | 'ur';
  setTab: (tab: string) => void;
  setSelectedCategory?: (category: string) => void;
  setSearchQuery?: (query: string) => void;
}

const HOME_MAKES_LIST = [
  'All Makes', 'Toyota', 'Honda', 'Suzuki', 'Hyundai', 'KIA', 'MG', 'Changan', 'Haval', 'Mercedes-Benz', 'BMW', 'Audi'
];

const HOME_CITIES_LIST = [
  'All Cities', 'Peshawar', 'Islamabad', 'Lahore', 'Karachi', 'Rawalpindi', 'Mardan', 'Abbottabad'
];

export function UnifiedSearch({ lang, setTab, setSelectedCategory, setSearchQuery }: UnifiedSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [make, setMake] = useState('All Makes');
  const [city, setCity] = useState('All Cities');
  const [priceRange, setPriceRange] = useState('Any Price');
  const isUrdu = lang === 'ur';

  const handleSearchTrigger = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Determine the combined query
    let finalQuery = '';
    
    if (city !== 'All Cities') {
      finalQuery += city;
    }
    
    if (keyword.trim()) {
      finalQuery += (finalQuery ? ' ' : '') + keyword.trim();
    }

    if (setSelectedCategory) {
      setSelectedCategory(make === 'All Makes' ? 'All' : make);
    }
    
    if (setSearchQuery) {
      setSearchQuery(finalQuery);
    }

    // Redirect to inventory tab
    setTab('inventory');
  };

  return (
    <form 
      onSubmit={handleSearchTrigger}
      className="w-full bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-lg max-w-5xl mx-auto text-left" 
      id="unified-search-floating-bar"
    >
      <div className="flex flex-col lg:flex-row items-stretch gap-1.5">
        
        {/* 1. Keyword / Model Search input */}
        <div className="flex-1 min-w-[180px] flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-100 dark:border-slate-800 focus-within:border-slate-300 dark:focus-within:border-slate-700 transition-colors">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input 
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={isUrdu ? "گاڑی کا نام یا ماڈل تلاش کریں..." : "Search make, model, e.g. Fortuner, Civic..."}
            className="w-full bg-transparent border-none outline-none text-xs font-sans font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* 2. Make Selector */}
        <div className="flex-1 min-w-[140px] flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-100 dark:border-slate-800 transition-colors">
          <Car size={15} className="text-slate-400 shrink-0" />
          <select 
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-sans font-semibold text-slate-700 dark:text-slate-300 cursor-pointer focus:ring-0"
          >
            {HOME_MAKES_LIST.map((m) => (
              <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{m}</option>
            ))}
          </select>
        </div>

        {/* 3. City Selector */}
        <div className="flex-1 min-w-[140px] flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-100 dark:border-slate-800 transition-colors">
          <MapPin size={15} className="text-slate-400 shrink-0" />
          <select 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-sans font-semibold text-slate-700 dark:text-slate-300 cursor-pointer focus:ring-0"
          >
            {HOME_CITIES_LIST.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{c}</option>
            ))}
          </select>
        </div>

        {/* 4. Price Selector */}
        <div className="flex-1 min-w-[140px] flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-100 dark:border-slate-800 transition-colors">
          <DollarSign size={15} className="text-slate-400 shrink-0" />
          <select 
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-sans font-semibold text-slate-700 dark:text-slate-300 cursor-pointer focus:ring-0"
          >
            <option value="Any Price" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Any Price</option>
            <option value="Under 50 Lakh" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Under 50 Lakh (Rs. 5M)</option>
            <option value="Under 1 Crore" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Under 1 Crore (Rs. 10M)</option>
            <option value="Under 2 Crore" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Under 2 Crore (Rs. 20M)</option>
            <option value="Above 2 Crore" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Above 2 Crore</option>
          </select>
        </div>

        {/* 5. Primary Orange Action Button */}
        <button 
          type="submit"
          className="bg-[#FF6B00] hover:bg-[#E05B00] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-md px-6 py-3.5 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-orange-500/10 active:scale-[0.99] shrink-0"
        >
          <Search size={14} className="stroke-[3]" />
          <span>{isUrdu ? 'تلاش کریں' : 'Search'}</span>
        </button>

      </div>
    </form>
  );
}
