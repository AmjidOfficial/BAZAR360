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
  Trash2, 
  RotateCcw,
  LayoutGrid,
  Shield,
  Truck,
  Zap,
  Bike,
  Sparkles,
  Filter,
  Check
} from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { VehicleCard } from './VehicleCard';
import { VehicleSkeletonCard } from './VehicleSkeletonCard';
import { motion } from 'motion/react';

interface SearchExplorerViewProps {
  listings: CarListing[];
  dealers: Dealer[];
  dbLoading?: boolean;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectListing: (car: CarListing) => void;
  onToggleCompare?: (car: CarListing) => void;
  compareList?: CarListing[];
  onToggleFavorite?: (car: CarListing) => void;
  favoritesList?: CarListing[];
  recentViewsList?: CarListing[];
  currentUser?: any;
  currentCategory?: 'gateway' | 'auto' | 'footwear' | 'food';
  lang: 'en' | 'ur';
}

const PAKISTAN_CITIES = [
  'All', 
  'Islamabad', 
  'Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Kohat', 'Bannu', 'Dera Ismail Khan', 'Nowshera', 'Charsadda', 'Mansehra',
  'Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha', 'Sahiwal', 'Sheikhupura', 'Jhelum', 'Gujrat', 'Attock', 'Chiniot', 'Rahim Yar Khan', 'Kasur',
  'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpurkhas', 'Shikarpur', 'Jacobabad',
  'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Sibi', 'Chaman',
  'Muzaffarabad', 'Mirpur', 'Gilgit', 'Skardu', 'Hunza'
];

const MAKES_LIST = [
  'All', 
  'Toyota', 'Honda', 'Suzuki', 'Hyundai', 'KIA', 'MG', 'Changan', 'Haval', 'Chery', 'Proton', 'DFSK', 'United', 'Prince', 'FAW',
  'Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Lexus', 'Range Rover', 'Land Rover', 'Jaguar', 'Jeep', 'Volvo',
  'Tesla', 'BYD', 'Deepal', 'Nissan', 'Mitsubishi', 'Mazda', 'Ford', 'Chevrolet', 'Isuzu', 'Peugeot', 'BAIC', 'Gelly', 'GAC', 'Oshan', 'Daihatsu', 'Subaru'
];

const BODY_CATEGORIES = [
  { id: 'All', label: 'All Bodies', icon: LayoutGrid },
  { id: 'Sedan', label: 'Sedans', icon: Car },
  { id: 'SUV', label: 'SUVs & Jeeps', icon: Shield },
  { id: 'Hatchback', label: 'Hatchbacks', icon: Zap },
  { id: 'Crossover', label: 'Crossovers', icon: Sparkles },
  { id: 'Pickup', label: 'Pickups & 4x4s', icon: Truck },
  { id: 'Commercial', label: 'Vans & Commercial', icon: Truck },
  { id: 'Bike', label: 'Motorcycles', icon: Bike },
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
  onToggleFavorite,
  favoritesList = [],
  recentViewsList = [],
  currentUser,
  currentCategory = 'auto',
  lang = 'en',
  dbLoading = false
}: SearchExplorerViewProps) {
  
  // Filter States
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [filterMake, setFilterMake] = useState('All');
  const [filterModel, setFilterModel] = useState('');
  const [filterBodyCategory, setFilterBodyCategory] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterTransmission, setFilterTransmission] = useState('All');
  const [filterFuel, setFilterFuel] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterAssembly, setFilterAssembly] = useState('All');
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(120000000); // 12 Crore Max default
  const [yearMin, setYearMin] = useState<number>(2000);
  const [yearMax, setYearMax] = useState<number>(2026);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterRecentViews, setFilterRecentViews] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('Newest');

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Reset pagination to Page 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [localQuery, filterMake, filterModel, filterBodyCategory, filterCity, filterTransmission, filterFuel, filterCondition, filterAssembly, priceMin, priceMax, yearMin, yearMax, filterFavorites, filterRecentViews, sortBy]);

  // Synchronize category or search query updates from Home view brand clicks
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All') {
      // Check if it's a make or body category
      if (BODY_CATEGORIES.some(b => b.id.toLowerCase() === selectedCategory.toLowerCase())) {
        setFilterBodyCategory(selectedCategory);
      } else {
        setFilterMake(selectedCategory);
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const t = {
    en: {
      filterTitle: "Filters",
      resetAll: "Reset All",
      searchPlaceholder: "Search make, model, variant, or city...",
      make: "Make / Brand",
      model: "Model",
      modelPlaceholder: "e.g. Civic, Corolla",
      bodyType: "Body Category",
      yearRange: "Year Range",
      priceRange: "Price Range",
      city: "Registration City",
      transmission: "Transmission",
      fuelType: "Fuel Type",
      condition: "Condition",
      assembly: "Assembly Type",
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
      noResults: "No vehicles found matching your specific criteria.",
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
      bodyType: "باڈی کی قسم",
      yearRange: "سال کی حد",
      priceRange: "قیمت کی حد",
      city: "رجسٹریشن کا شہر",
      transmission: "ٹرانسمیشن",
      fuelType: "فیول کی قسم",
      condition: "حالت",
      assembly: "اسمبلی",
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
    setFilterBodyCategory('All');
    setFilterCity('All');
    setFilterTransmission('All');
    setFilterFuel('All');
    setFilterCondition('All');
    setFilterAssembly('All');
    setPriceMin(0);
    setPriceMax(120000000);
    setYearMin(2000);
    setYearMax(2026);
    setFilterFavorites(false);
    setFilterRecentViews(false);
  };

  // Helper to match body category
  const matchesBodyCategory = (car: CarListing, cat: string) => {
    if (cat === 'All') return true;
    const text = `${car.title} ${car.make} ${car.model} ${car.description || ''} ${(car.tags || []).join(' ')}`.toLowerCase();

    if (cat === 'Sedan') {
      return text.includes('sedan') || text.includes('corolla') || text.includes('civic') || text.includes('city') || text.includes('yaris') || text.includes('alsvin') || text.includes('sonata') || text.includes('elantra') || text.includes('accord') || text.includes('camry');
    }
    if (cat === 'SUV') {
      return text.includes('suv') || text.includes('jeep') || text.includes('fortuner') || text.includes('prado') || text.includes('land cruiser') || text.includes('sportage') || text.includes('tucson') || text.includes('sorento') || text.includes('haval') || text.includes('mg hs') || text.includes('oshan');
    }
    if (cat === 'Hatchback') {
      return text.includes('hatchback') || text.includes('alto') || text.includes('cultus') || text.includes('wagon r') || text.includes('swift') || text.includes('vitz') || text.includes('mira') || text.includes('picanto');
    }
    if (cat === 'Crossover') {
      return text.includes('crossover') || text.includes('vezel') || text.includes('stonic') || text.includes('cross') || text.includes('juke');
    }
    if (cat === 'Pickup') {
      return text.includes('pickup') || text.includes('revo') || text.includes('hilux') || text.includes('truck') || text.includes('d-max');
    }
    if (cat === 'Commercial') {
      return text.includes('commercial') || text.includes('van') || text.includes('bolan') || text.includes('hiace') || text.includes('loader');
    }
    if (cat === 'Bike') {
      return text.includes('bike') || text.includes('motorcycle') || text.includes('yamaha') || text.includes('honda 125') || text.includes('cd70');
    }
    return text.includes(cat.toLowerCase());
  };

  // Filtering Logic
  const filteredVehicles = useMemo(() => {
    return listings.filter((car) => {
      // Approved only, hide sold, paused, and archived from public searches
      if (car.approved === false || car.isSold || car.isPaused || car.isArchived) return false;

      // Keyword query match
      if (localQuery) {
        const q = localQuery.toLowerCase();
        const matchTitle = car.title.toLowerCase().includes(q);
        const matchMake = car.make.toLowerCase().includes(q);
        const matchModel = car.model.toLowerCase().includes(q);
        const matchDesc = car.description?.toLowerCase().includes(q);
        const matchCity = car.registrationCity?.toLowerCase().includes(q);
        const matchTags = car.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchMake && !matchModel && !matchDesc && !matchCity && !matchTags) return false;
      }

      // Brand dropdown
      if (filterMake !== 'All' && car.make.toLowerCase() !== filterMake.toLowerCase()) {
        return false;
      }

      // Model text match
      if (filterModel && !car.model.toLowerCase().includes(filterModel.toLowerCase())) {
        return false;
      }

      // Body category filter
      if (filterBodyCategory !== 'All' && !matchesBodyCategory(car, filterBodyCategory)) {
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

      // Assembly
      if (filterAssembly !== 'All' && car.assemblyType && car.assemblyType !== filterAssembly) {
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

      // My Favorites filter
      if (filterFavorites && !favoritesList.some((f) => f.id === car.id)) {
        return false;
      }

      // Recently Viewed filter
      if (filterRecentViews && !recentViewsList.some((r) => r.id === car.id)) {
        return false;
      }

      return true;
    });
  }, [listings, localQuery, filterMake, filterModel, filterBodyCategory, filterCity, filterTransmission, filterFuel, filterCondition, filterAssembly, priceMin, priceMax, yearMin, yearMax, filterFavorites, filterRecentViews, favoritesList, recentViewsList]);

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

  // Derived Pagination metrics
  const totalPages = Math.max(1, Math.ceil(sortedVehicles.length / itemsPerPage));
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedVehicles, currentPage]);

  const formatPriceNum = (num: number) => {
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(1)} Crore`;
    }
    return `${(num / 100000).toFixed(0)} Lakh`;
  };

  const isRtl = lang === 'ur';

  // Count active filters
  const activeFilters = useMemo(() => {
    const list: { id: string; label: string; reset: () => void }[] = [];
    if (localQuery) list.push({ id: 'query', label: `"${localQuery}"`, reset: () => { setLocalQuery(''); setSearchQuery(''); } });
    if (filterMake !== 'All') list.push({ id: 'make', label: `Brand: ${filterMake}`, reset: () => setFilterMake('All') });
    if (filterModel) list.push({ id: 'model', label: `Model: ${filterModel}`, reset: () => setFilterModel('') });
    if (filterBodyCategory !== 'All') list.push({ id: 'body', label: `Body: ${filterBodyCategory}`, reset: () => setFilterBodyCategory('All') });
    if (filterCity !== 'All') list.push({ id: 'city', label: `City: ${filterCity}`, reset: () => setFilterCity('All') });
    if (filterTransmission !== 'All') list.push({ id: 'transmission', label: filterTransmission, reset: () => setFilterTransmission('All') });
    if (filterFuel !== 'All') list.push({ id: 'fuel', label: filterFuel, reset: () => setFilterFuel('All') });
    if (filterCondition !== 'All') list.push({ id: 'condition', label: filterCondition, reset: () => setFilterCondition('All') });
    if (filterAssembly !== 'All') list.push({ id: 'assembly', label: filterAssembly, reset: () => setFilterAssembly('All') });
    if (priceMax < 120000000) list.push({ id: 'price', label: `Max ${formatPriceNum(priceMax)}`, reset: () => setPriceMax(120000000) });
    if (yearMin > 2000 || yearMax < 2026) list.push({ id: 'year', label: `${yearMin}-${yearMax}`, reset: () => { setYearMin(2000); setYearMax(2026); } });
    if (filterFavorites) list.push({ id: 'fav', label: 'Favorites', reset: () => setFilterFavorites(false) });
    if (filterRecentViews) list.push({ id: 'recent', label: 'Recent Views', reset: () => setFilterRecentViews(false) });
    return list;
  }, [localQuery, filterMake, filterModel, filterBodyCategory, filterCity, filterTransmission, filterFuel, filterCondition, filterAssembly, priceMax, yearMin, yearMax, filterFavorites, filterRecentViews]);

  const filterSidebarContent = (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-[var(--color-border-main)] pb-4">
        <h3 className="text-sm font-sans font-black uppercase tracking-wider text-orange-500 flex items-center gap-1.5">
          <SlidersHorizontal size={14} />
          {t.filterTitle}
        </h3>
        <button
          onClick={handleResetFilters}
          className="text-xs font-sans text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          {t.resetAll}
        </button>
      </div>

      {/* Collections Selection Option Panel */}
      <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] p-3 rounded-2xl space-y-3">
        <span className="text-[10px] font-sans font-black uppercase tracking-wider text-orange-500 block">Personal Collections</span>
        
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setFilterFavorites(!filterFavorites);
              if (!filterFavorites) {
                setFilterRecentViews(false);
              }
            }}
            className={`w-full py-2.5 px-3 rounded-xl border font-sans text-xs flex items-center justify-between transition-all cursor-pointer ${
              filterFavorites
                ? 'bg-rose-500/10 border-rose-500 text-rose-400 font-bold'
                : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] text-[var(--color-text-main)] hover:border-orange-500/30'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-rose-500 font-black">❤️</span>
              Favorites ({favoritesList.length})
            </span>
            {filterFavorites && <span className="text-[9px] bg-rose-500 text-slate-950 font-mono font-bold px-1.5 py-0.2 rounded-md">ACTIVE</span>}
          </button>

          <button
            onClick={() => {
              setFilterRecentViews(!filterRecentViews);
              if (!filterRecentViews) {
                setFilterFavorites(false);
              }
            }}
            className={`w-full py-2.5 px-3 rounded-xl border font-sans text-xs flex items-center justify-between transition-all cursor-pointer ${
              filterRecentViews
                ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-bold'
                : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] text-[var(--color-text-main)] hover:border-orange-500/30'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-sky-400 font-black">🕒</span>
              Recent Views ({recentViewsList.length})
            </span>
            {filterRecentViews && <span className="text-[9px] bg-sky-500 text-slate-950 font-mono font-bold px-1.5 py-0.2 rounded-md">ACTIVE</span>}
          </button>
        </div>
      </div>

      {/* 1. Body Type Category Dropdown */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[var(--color-text-muted)] block">{t.bodyType}</label>
        <select
          value={filterBodyCategory}
          onChange={(e) => setFilterBodyCategory(e.target.value)}
          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] rounded-xl p-3 text-xs focus:border-orange-500 outline-none"
        >
          {BODY_CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.id === 'All' ? t.any : cat.label}</option>
          ))}
        </select>
      </div>

      {/* 2. Brand Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[var(--color-text-muted)] block">{t.make}</label>
        <select
          value={filterMake}
          onChange={(e) => setFilterMake(e.target.value)}
          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] rounded-xl p-3 text-xs focus:border-orange-500 outline-none"
        >
          {MAKES_LIST.map(make => (
            <option key={make} value={make}>{make === 'All' ? t.any : make}</option>
          ))}
        </select>
      </div>

      {/* 3. Model text field */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[var(--color-text-muted)] block">{t.model}</label>
        <div className="relative">
          <input
            type="text"
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            placeholder={t.modelPlaceholder}
            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] rounded-xl p-3 text-xs placeholder-[var(--color-text-muted)] focus:border-orange-500 outline-none"
          />
          {filterModel && (
            <button
              onClick={() => setFilterModel('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Year slider range */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-[11px]">
          <span className="font-sans font-black uppercase tracking-wider text-[var(--color-text-muted)]">{t.yearRange}</span>
          <span className="font-mono text-xs text-orange-500 font-bold">{yearMin} - {yearMax}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="range"
            min="2000"
            max="2026"
            value={yearMin}
            onChange={(e) => setYearMin(parseInt(e.target.value))}
            className="w-full h-1 bg-[var(--color-bg-primary)] rounded appearance-none cursor-pointer accent-orange-500"
          />
          <input
            type="range"
            min="2000"
            max="2026"
            value={yearMax}
            onChange={(e) => setYearMax(parseInt(e.target.value))}
            className="w-full h-1 bg-[var(--color-bg-primary)] rounded appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      </div>

      {/* 5. Price filter sliders */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-[11px]">
          <span className="font-sans font-black uppercase tracking-wider text-[var(--color-text-muted)]">{t.priceRange}</span>
          <span className="font-mono text-xs text-orange-500 font-bold">{formatPriceNum(priceMax)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="120000000"
          step="500000"
          value={priceMax}
          onChange={(e) => setPriceMax(parseInt(e.target.value))}
          className="w-full h-1 bg-[var(--color-bg-primary)] rounded appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      {/* 6. City Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[var(--color-text-muted)] block">{t.city}</label>
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] rounded-xl p-3 text-xs focus:border-orange-500 outline-none"
        >
          {PAKISTAN_CITIES.map(city => (
            <option key={city} value={city}>{city === 'All' ? t.any : city}</option>
          ))}
        </select>
      </div>

      {/* 7. Transmission dropdown */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[var(--color-text-muted)] block">{t.transmission}</label>
        <select
          value={filterTransmission}
          onChange={(e) => setFilterTransmission(e.target.value)}
          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] rounded-xl p-3 text-xs focus:border-orange-500 outline-none"
        >
          <option value="All">{t.any}</option>
          <option value="Automatic">{t.automatic}</option>
          <option value="Manual">{t.manual}</option>
        </select>
      </div>

      {/* 8. Fuel Type dropdown */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[var(--color-text-muted)] block">{t.fuelType}</label>
        <select
          value={filterFuel}
          onChange={(e) => setFilterFuel(e.target.value)}
          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] rounded-xl p-3 text-xs focus:border-orange-500 outline-none"
        >
          <option value="All">{t.any}</option>
          <option value="Petrol">{t.petrol}</option>
          <option value="Diesel">{t.diesel}</option>
          <option value="Hybrid">{t.hybrid}</option>
          <option value="Electric">{t.electric}</option>
        </select>
      </div>

      {/* 9. Condition Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[var(--color-text-muted)] block">{t.condition}</label>
        <select
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] rounded-xl p-3 text-xs focus:border-orange-500 outline-none"
        >
          <option value="All">{t.any}</option>
          <option value="New">{t.new}</option>
          <option value="Used">{t.used}</option>
        </select>
      </div>

      {/* 10. Assembly Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-black uppercase tracking-wider text-[var(--color-text-muted)] block">{t.assembly}</label>
        <select
          value={filterAssembly}
          onChange={(e) => setFilterAssembly(e.target.value)}
          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] rounded-xl p-3 text-xs focus:border-orange-500 outline-none"
        >
          <option value="All">{t.any}</option>
          <option value="Local">Local Assembled</option>
          <option value="Imported">Imported</option>
        </select>
      </div>
    </div>
  );

  return (
    <div 
      className={`flex flex-col space-y-6 animate-fade-in text-[var(--color-text-main)] font-sans ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Body Category Pills Bar */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-3 rounded-2xl space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] tracking-wider flex items-center gap-1.5">
            <Filter size={12} className="text-orange-500" /> Quick Category Explorer
          </span>
          <span className="text-[10px] font-mono text-orange-500 font-bold">
            {sortedVehicles.length} Matches Found
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {BODY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = filterBodyCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setFilterBodyCategory(cat.id)}
                className={`snap-start flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-orange-500 text-slate-950 font-black shadow-md scale-102'
                    : 'bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-orange-500/30'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-slate-950' : 'text-orange-500'} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar Header */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
        <div className="relative flex-grow w-full">
          <Search className={`text-[var(--color-text-muted)] absolute top-1/2 -translate-y-1/2 shrink-0 ${isRtl ? 'right-4' : 'left-4'}`} size={18} />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] text-sm rounded-2xl p-3.5 focus:border-orange-500 outline-none ${
              isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'
            }`}
          />
          {localQuery && (
            <button
              onClick={() => { setLocalQuery(''); setSearchQuery(''); }}
              className={`absolute top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer ${isRtl ? 'left-4' : 'right-4'}`}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Sort selection */}
          <div className="flex items-center gap-2 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] px-3 py-2.5 rounded-2xl text-xs">
            <span className="text-[var(--color-text-muted)] font-sans">{t.sortBy}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[var(--color-text-main)] focus:outline-none font-bold outline-none cursor-pointer"
            >
              <option value="Newest" className="bg-[var(--color-bg-secondary)]">{t.newest}</option>
              <option value="PriceLow" className="bg-[var(--color-bg-secondary)]">{t.priceLow}</option>
              <option value="PriceHigh" className="bg-[var(--color-bg-secondary)]">{t.priceHigh}</option>
              <option value="YearNewest" className="bg-[var(--color-bg-secondary)]">{t.yearNewest}</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-2xl border border-orange-500 active:scale-95 duration-100 flex items-center justify-center cursor-pointer font-bold text-xs gap-1.5"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters.length > 0 && (
              <span className="bg-slate-950 text-orange-400 font-mono text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-main)] p-2.5 rounded-2xl text-xs">
          <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-1">Active Filters:</span>
          {activeFilters.map(item => (
            <button
              key={item.id}
              onClick={item.reset}
              className="bg-orange-500/10 border border-orange-500/30 text-orange-500 hover:bg-orange-500/20 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs"
            >
              <span>{item.label}</span>
              <X size={12} className="hover:text-rose-400" />
            </button>
          ))}
          <button
            onClick={handleResetFilters}
            className="text-[10px] font-mono font-bold text-rose-400 hover:underline px-2 py-1 cursor-pointer ml-auto"
          >
            Clear All ({activeFilters.length})
          </button>
        </div>
      )}

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filters Sidebar (Hidden on mobile) */}
        <aside className="hidden lg:block bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-6 rounded-3xl h-fit sticky top-24 shadow-sm">
          {filterSidebarContent}
        </aside>

        {/* Right Listings Grid */}
        <section className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)] uppercase font-mono tracking-widest px-1">
            <span>
              {t.showing} <strong className="text-[var(--color-text-main)] font-black">{sortedVehicles.length}</strong> {t.results}
            </span>
            <span className="hidden sm:inline">Bazar360 Verified Marketplace</span>
          </div>

          {dbLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <VehicleSkeletonCard key={i} />
              ))}
            </div>
          ) : sortedVehicles.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedVehicles.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index * 0.04, 0.4),
                      ease: [0.215, 0.610, 0.355, 1.000],
                    }}
                  >
                    <VehicleCard
                      car={car}
                      dealer={dealers.find((d) => d.id === car.dealerId)}
                      onSelect={onSelectListing}
                      onToggleCompare={onToggleCompare}
                      isComparing={compareList.some((c) => c.id === car.id)}
                      onToggleFavorite={onToggleFavorite}
                      isFavorite={favoritesList.some((f) => f.id === car.id)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Microsoft-Style Professional Pagination Card */}
              {totalPages > 1 && (
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm select-none text-[var(--color-text-main)] animate-fade-in" id="microsoft-style-pagination">
                  <span className="text-xs font-mono font-bold text-[var(--color-text-muted)] uppercase">
                    Page <strong className="text-[var(--color-text-main)] font-black">{currentPage}</strong> of <strong className="text-[var(--color-text-main)] font-black">{totalPages}</strong> ({sortedVehicles.length} total vehicles)
                  </span>
                  
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {/* Previous Button */}
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 text-xs font-extrabold uppercase rounded-xl tracking-wider transition-all duration-150 ${
                        currentPage === 1
                          ? 'text-[var(--color-text-muted)]/40 bg-[var(--color-bg-primary)]/50 cursor-not-allowed border border-[var(--color-border-main)]/50'
                          : 'text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] active:scale-95 cursor-pointer'
                      }`}
                    >
                      ← Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isVisible = Math.abs(currentPage - pageNum) <= 1 || pageNum === 1 || pageNum === totalPages;
                      
                      if (!isVisible) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return <span key={pageNum} className="px-1.5 text-[var(--color-text-muted)]/60 font-extrabold">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-9 h-9 text-xs font-black rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-orange-500 text-slate-950 shadow-md font-black border border-orange-500'
                              : 'text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 text-xs font-extrabold uppercase rounded-xl tracking-wider transition-all duration-150 ${
                        currentPage === totalPages
                          ? 'text-[var(--color-text-muted)]/40 bg-[var(--color-bg-primary)]/50 cursor-not-allowed border border-[var(--color-border-main)]/50'
                          : 'text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] active:scale-95 cursor-pointer'
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-6">
              <Car size={48} className="text-[var(--color-text-muted)] animate-pulse" />
              <p className="text-[var(--color-text-muted)] font-sans max-w-sm">
                {t.noResults}
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-orange-600 hover:bg-orange-700 text-white font-sans font-extrabold text-xs uppercase px-6 py-3 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md"
              >
                {t.clearFilters}
              </button>
            </div>
          )}
        </section>

      </div>

      {/* Collapsible Mobile Filters Drawer Backdrop */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-xs flex justify-end lg:hidden">
          <div className="bg-[var(--color-bg-secondary)] w-full max-w-xs h-full p-6 overflow-y-auto flex flex-col relative border-l border-[var(--color-border-main)] animate-scale-fade">
            
            {/* Close Mobile Filters button */}
            <button
              onClick={() => setShowMobileFilters(false)}
              className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] p-2 hover:bg-[var(--color-bg-primary)] rounded-xl cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Content drawer */}
            <div className="pt-8 flex-grow">
              {filterSidebarContent}
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-6 mb-20 w-full bg-orange-600 hover:bg-orange-700 text-white font-sans font-extrabold text-xs uppercase py-3.5 rounded-xl text-center cursor-pointer shadow-lg relative z-10"
            >
              Apply Filters ({sortedVehicles.length} Cars)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

