import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  SlidersHorizontal, 
  X, 
  Car, 
  Gauge, 
  Fuel, 
  Maximize2, 
  Trash2, 
  RotateCcw
} from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { VehicleCard } from './VehicleCard';
import { motion } from 'motion/react';

interface SearchExplorerViewProps {
  listings: CarListing[];
  dealers: Dealer[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectListing: (car: CarListing) => void;
  onToggleCompare?: (car: CarListing) => void;
  compareList?: CarListing[];
  currentUser?: any;
  currentCategory?: 'gateway' | 'auto' | 'footwear' | 'food';
  lang: 'en' | 'ur';
}

const PAKISTAN_CITIES = [
  'All', 'Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Quetta'
];

const MAKES_LIST = [
  'All', 'Toyota', 'Honda', 'Suzuki', 'Hyundai', 'KIA', 'Nissan', 'Mitsubishi', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Land Rover', 'Mazda', 'Changan', 'DFSK', 'Proton'
];

export default function SearchExplorerView({
  listings,
  dealers,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onSelectListing,
  onToggleCompare,
  compareList = [],
  currentUser,
  currentCategory = 'auto',
  lang = 'en'
}: SearchExplorerViewProps) {
  
  // Filter States
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [filterMake, setFilterMake] = useState('All');
  const [filterModel, setFilterModel] = useState('');
  const [filterCity, setFilterCity] = useState('All');
  const [filterTransmission, setFilterTransmission] = useState('All');
  const [filterFuel, setFilterFuel] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(120000000); // 12 Crore Max default
  const [yearMin, setYearMin] = useState<number>(2000);
  const [yearMax, setYearMax] = useState<number>(2026);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('Newest');

  // Synchronize category or search query updates from Home view brand clicks
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All') {
      setFilterMake(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const t = {
    en: {
      filterTitle: "Filters",
      resetAll: "Reset All",
      searchPlaceholder: "Search make, model, or city...",
      make: "Make / Brand",
      model: "Model",
      modelPlaceholder: "e.g. Civic, Corolla",
      yearRange: "Year Range",
      priceRange: "Price Range",
      city: "Registration City",
      transmission: "Transmission",
      fuelType: "Fuel Type",
      condition: "Condition",
      any: "All",
      automatic: "Automatic",
      manual: "Manual",
      petrol: "Petrol",
      diesel: "Diesel",
      hybrid: "Hybrid",
      electric: "Electric",
      new: "New",
      used: "Used",
      showing: "Showing",
      results: "results",
      noResults: "No vehicles found. Try adjusting your filters to see more results.",
      clearFilters: "Clear Filters",
      sortBy: "Sort By",
      newest: "Newest First",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to Low",
      yearNewest: "Year: Newest First"
    },
    ur: {
      filterTitle: "فلٹرز",
      resetAll: "تمام ختم کریں",
      searchPlaceholder: "برانڈ، ماڈل یا شہر تلاش کریں...",
      make: "برانڈ / میک",
      model: "ماڈل",
      modelPlaceholder: "مثال کے طور پر سوک، کرولا",
      yearRange: "سال کی حد",
      priceRange: "قیمت کی حد",
      city: "رجسٹریشن کا شہر",
      transmission: "ٹرانسمیشن",
      fuelType: "فیول کی قسم",
      condition: "حالت",
      any: "تمام",
      automatic: "آٹومیٹک",
      manual: "مینول",
      petrol: "پٹرول",
      diesel: "ڈیزل",
      hybrid: "ہائبرڈ",
      electric: "الیکٹرک",
      new: "نئی",
      used: "استعمال شدہ",
      showing: "دیکھ رہے ہیں",
      results: "گاڑیاں",
      noResults: "کوئی گاڑی نہیں ملی۔ مزید نتائج دیکھنے کے لیے اپنے فلٹرز کو تبدیل کریں۔",
      clearFilters: "فلٹرز ختم کریں",
      sortBy: "ترتیب دیں",
      newest: "جدید ترین پہلے",
      priceLow: "قیمت: کم سے زیادہ",
      priceHigh: "قیمت: زیادہ سے کم",
      yearNewest: "سال: جدید ترین پہلے"
    }
  }[lang];

  // Reset Filters logic
  const handleResetFilters = () => {
    setLocalQuery('');
    setSearchQuery('');
    setSelectedCategory('All');
    setFilterMake('All');
    setFilterModel('');
    setFilterCity('All');
    setFilterTransmission('All');
    setFilterFuel('All');
    setFilterCondition('All');
    setPriceMin(0);
    setPriceMax(120000000);
    setYearMin(2000);
    setYearMax(2026);
  };

  // Filtering Logic
  const filteredVehicles = useMemo(() => {
    return listings.filter((car) => {
      // Approved only
      if (car.approved === false) return false;

      // Keyword query match
      if (localQuery) {
        const q = localQuery.toLowerCase();
        const matchTitle = car.title.toLowerCase().includes(q);
        const matchMake = car.make.toLowerCase().includes(q);
        const matchModel = car.model.toLowerCase().includes(q);
        const matchDesc = car.description?.toLowerCase().includes(q);
        const matchCity = car.registrationCity?.toLowerCase().includes(q);
        if (!matchTitle && !matchMake && !matchModel && !matchDesc && !matchCity) return false;
      }

      // Brand dropdown
      if (filterMake !== 'All' && car.make.toLowerCase() !== filterMake.toLowerCase()) {
        return false;
      }

      // Model text match
      if (filterModel && !car.model.toLowerCase().includes(filterModel.toLowerCase())) {
        return false;
      }

      // City/Location
      if (filterCity !== 'All' && car.registrationCity && car.registrationCity.toLowerCase() !== filterCity.toLowerCase()) {
        return false;
      }

      // Transmission
      if (filterTransmission !== 'All' && car.transmission !== filterTransmission) {
        return false;
      }

      // Fuel type
      if (filterFuel !== 'All' && car.fuelType !== filterFuel) {
        return false;
      }

      // Condition
      if (filterCondition !== 'All' && car.condition !== filterCondition) {
        return false;
      }

      // Price Limits
      if (car.price < priceMin || car.price > priceMax) {
        return false;
      }

      // Year Limits
      if (car.year && (car.year < yearMin || car.year > yearMax)) {
        return false;
      }

      return true;
    });
  }, [listings, localQuery, filterMake, filterModel, filterCity, filterTransmission, filterFuel, filterCondition, priceMin, priceMax, yearMin, yearMax]);

  // Sort Logic
  const sortedVehicles = useMemo(() => {
    const list = [...filteredVehicles];
    if (sortBy === 'Newest') {
      return list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }
    if (sortBy === 'PriceLow') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'PriceHigh') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'YearNewest') {
      return list.sort((a, b) => (b.year || 0) - (a.year || 0));
    }
    return list;
  }, [filteredVehicles, sortBy]);

  const formatPriceNum = (num: number) => {
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(1)} Crore`;
    }
    return `${(num / 100000).toFixed(0)} Lakh`;
  };

  const isRtl = lang === 'ur';

  const filterSidebarContent = (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-sm font-sans font-black uppercase tracking-wider text-[#38bdf8] flex items-center gap-1.5">
          <SlidersHorizontal size={14} />
          {t.filterTitle}
        </h3>
        <button
          onClick={handleResetFilters}
          className="text-xs font-sans text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          {t.resetAll}
        </button>
      </div>

      {/* 1. Brand Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-gray-400 block">{t.make}</label>
        <select
          value={filterMake}
          onChange={(e) => setFilterMake(e.target.value)}
          className="w-full bg-[#030712] border border-white/5 text-stone-200 rounded-xl p-3 text-xs focus:border-[#38bdf8] outline-none"
        >
          {MAKES_LIST.map(make => (
            <option key={make} value={make}>{make === 'All' ? t.any : make}</option>
          ))}
        </select>
      </div>

      {/* 2. Model text field */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-gray-400 block">{t.model}</label>
        <div className="relative">
          <input
            type="text"
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            placeholder={t.modelPlaceholder}
            className="w-full bg-[#030712] border border-white/5 text-stone-200 rounded-xl p-3 text-xs placeholder-gray-600 focus:border-[#38bdf8] outline-none"
          />
          {filterModel && (
            <button
              onClick={() => setFilterModel('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Year slider range */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-[11px]">
          <span className="font-sans font-black uppercase tracking-wider text-gray-400">{t.yearRange}</span>
          <span className="font-mono text-xs text-[#38bdf8]">{yearMin} - {yearMax}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="range"
            min="2000"
            max="2026"
            value={yearMin}
            onChange={(e) => setYearMin(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#38bdf8]"
          />
          <input
            type="range"
            min="2000"
            max="2026"
            value={yearMax}
            onChange={(e) => setYearMax(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#38bdf8]"
          />
        </div>
      </div>

      {/* 4. Price filter sliders */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-[11px]">
          <span className="font-sans font-black uppercase tracking-wider text-gray-400">{t.priceRange}</span>
          <span className="font-mono text-xs text-[#38bdf8]">{formatPriceNum(priceMax)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="120000000"
          step="500000"
          value={priceMax}
          onChange={(e) => setPriceMax(parseInt(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#38bdf8]"
        />
      </div>

      {/* 5. City Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-gray-400 block">{t.city}</label>
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="w-full bg-[#030712] border border-white/5 text-stone-200 rounded-xl p-3 text-xs focus:border-[#38bdf8] outline-none"
        >
          {PAKISTAN_CITIES.map(city => (
            <option key={city} value={city}>{city === 'All' ? t.any : city}</option>
          ))}
        </select>
      </div>

      {/* 6. Transmission dropdown */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-gray-400 block">{t.transmission}</label>
        <select
          value={filterTransmission}
          onChange={(e) => setFilterTransmission(e.target.value)}
          className="w-full bg-[#030712] border border-white/5 text-stone-200 rounded-xl p-3 text-xs focus:border-[#38bdf8] outline-none"
        >
          <option value="All">{t.any}</option>
          <option value="Automatic">{t.automatic}</option>
          <option value="Manual">{t.manual}</option>
        </select>
      </div>

      {/* 7. Fuel Type dropdown */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-gray-400 block">{t.fuelType}</label>
        <select
          value={filterFuel}
          onChange={(e) => setFilterFuel(e.target.value)}
          className="w-full bg-[#030712] border border-white/5 text-stone-200 rounded-xl p-3 text-xs focus:border-[#38bdf8] outline-none"
        >
          <option value="All">{t.any}</option>
          <option value="Petrol">{t.petrol}</option>
          <option value="Diesel">{t.diesel}</option>
          <option value="Hybrid">{t.hybrid}</option>
          <option value="Electric">{t.electric}</option>
        </select>
      </div>

      {/* 8. Condition Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-gray-400 block">{t.condition}</label>
        <select
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          className="w-full bg-[#030712] border border-white/5 text-stone-200 rounded-xl p-3 text-xs focus:border-[#38bdf8] outline-none"
        >
          <option value="All">{t.any}</option>
          <option value="New">{t.new}</option>
          <option value="Used">{t.used}</option>
        </select>
      </div>
    </div>
  );

  return (
    <div 
      className={`flex flex-col space-y-8 animate-fade-in text-white font-sans ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Search Bar Header */}
      <div className="bg-[#0b0f19] border border-white/5 p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4 justify-between shadow-lg">
        <div className="relative flex-grow w-full">
          <Search className={`text-gray-400 absolute top-1/2 -translate-y-1/2 shrink-0 ${isRtl ? 'right-4' : 'left-4'}`} size={18} />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full bg-[#030712] border border-white/5 text-sm rounded-2xl p-3.5 focus:border-[#38bdf8] outline-none ${
              isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'
            }`}
          />
          {localQuery && (
            <button
              onClick={() => { setLocalQuery(''); setSearchQuery(''); }}
              className={`absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-white ${isRtl ? 'left-4' : 'right-4'}`}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Sort selection */}
          <div className="flex items-center gap-2 bg-[#030712] border border-white/5 px-3 py-2.5 rounded-2xl text-xs">
            <span className="text-gray-400 font-sans">{t.sortBy}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-bold outline-none cursor-pointer"
            >
              <option value="Newest">{t.newest}</option>
              <option value="PriceLow">{t.priceLow}</option>
              <option value="PriceHigh">{t.priceHigh}</option>
              <option value="YearNewest">{t.yearNewest}</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden bg-[#0ea5e9] text-white p-3 rounded-2xl border border-sky-600 active:scale-95 duration-100 flex items-center justify-center cursor-pointer"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filters Sidebar (Hidden on mobile) */}
        <aside className="hidden lg:block bg-[#0b0f19] border border-white/5 p-6 rounded-3xl h-fit sticky top-24 shadow-lg">
          {filterSidebarContent}
        </aside>

        {/* Right Listings Grid */}
        <section className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-xs text-gray-400 uppercase font-mono tracking-widest px-1">
            <span>
              {t.showing} <strong className="text-white">{sortedVehicles.length}</strong> {t.results}
            </span>
            <span className="hidden sm:inline">Auto Choice Premium Partner</span>
          </div>

          {sortedVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedVehicles.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.04, 0.45),
                    ease: [0.215, 0.610, 0.355, 1.000],
                  }}
                >
                  <VehicleCard
                    car={car}
                    dealer={dealers.find((d) => d.id === car.dealerId)}
                    onSelect={onSelectListing}
                    onToggleCompare={onToggleCompare}
                    isComparing={compareList.some((c) => c.id === car.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-6">
              <Car size={48} className="text-gray-600 animate-pulse" />
              <p className="text-gray-400 font-sans max-w-sm">
                {t.noResults}
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-sans font-extrabold text-xs uppercase px-6 py-3 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                {t.clearFilters}
              </button>
            </div>
          )}
        </section>

      </div>

      {/* Collapsible Mobile Filters Drawer Backdrop */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-xs flex justify-end md:hidden">
          <div className="bg-[#0b0f19] w-full max-w-xs h-full p-6 overflow-y-auto flex flex-col relative border-l border-white/5 animate-scale-fade">
            
            {/* Close Mobile Filters button */}
            <button
              onClick={() => setShowMobileFilters(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-xl cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Content drawer */}
            <div className="pt-8 flex-grow">
              {filterSidebarContent}
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-6 w-full bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-sans font-extrabold text-xs uppercase py-3.5 rounded-xl text-center cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
