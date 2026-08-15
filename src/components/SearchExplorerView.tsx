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
  Check,
  ArrowDownUp,
  WifiOff
} from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { VehicleCard } from './VehicleCard';
import { VehicleSkeletonCard } from './VehicleSkeletonCard';
import { motion } from 'motion/react';
import { PAKISTAN_BRANDS, PAKISTAN_CITIES as IMPORTED_CITIES, CAR_MODELS } from '../lib/pakistanCarData';

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
  ...IMPORTED_CITIES
];

const MAKES_LIST = [
  'All', 
  ...PAKISTAN_BRANDS
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
  const [filterSellerType, setFilterSellerType] = useState('All'); // 'All' | 'Individual' | 'Showroom'
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
  }, [localQuery, filterMake, filterModel, filterBodyCategory, filterCity, filterTransmission, filterFuel, filterCondition, filterAssembly, priceMin, priceMax, yearMin, yearMax, filterFavorites, filterRecentViews, sortBy, filterSellerType]);

  // Reset model filter if it does not belong to the selected make
  useEffect(() => {
    if (filterMake !== 'All' && CAR_MODELS[filterMake] && filterModel) {
      const isValidModel = CAR_MODELS[filterMake].some(
        m => m.toLowerCase() === filterModel.toLowerCase()
      );
      if (!isValidModel) {
        setFilterModel('');
      }
    }
  }, [filterMake]);

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
      yearNewest: "Year: Newest First",
      mileageLow: "Mileage: Lowest First",
      mileageHigh: "Mileage: Highest First",
      engineLow: "Engine: Lowest CC First",
      engineHigh: "Engine: Highest CC First",
      sellerType: "Seller Type",
      allSellers: "All Sellers",
      individualSellers: "Individual Users",
      showrooms: "Showrooms"
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
      yearNewest: "سال: جدید ترین پہلے",
      mileageLow: "مائلیج: کم سے زیادہ",
      mileageHigh: "مائلیج: زیادہ سے کم",
      engineLow: "انجن: کم سی سی پہلے",
      engineHigh: "انجن: زیادہ سی سی پہلے",
      sellerType: "بیچنے والے کی قسم",
      allSellers: "تمام بیچنے والے",
      individualSellers: "انفرادی صارفین",
      showrooms: "شورومز"
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
    setFilterSellerType('All');
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

  // Offline detection and source pool resolution
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  const sourceVehicles = useMemo(() => {
    const safeListings = listings || [];
    const safeRecentViews = recentViewsList || [];
    const safeFavorites = favoritesList || [];

    // If filtering by recent views, combine listings with recentViewsList so offline items remain fully viewable
    if (filterRecentViews) {
      if (safeListings.length === 0) return safeRecentViews;
      const existingIds = new Set(safeListings.map(c => c.id));
      const missingFromListings = safeRecentViews.filter(r => !existingIds.has(r.id));
      return [...safeListings, ...missingFromListings];
    }
    // If filtering by favorites, ensure offline saved favorites are preserved
    if (filterFavorites) {
      if (safeListings.length === 0) return safeFavorites;
      const existingIds = new Set(safeListings.map(c => c.id));
      const missingFromListings = safeFavorites.filter(f => !existingIds.has(f.id));
      return [...safeListings, ...missingFromListings];
    }
    // Fallback when network is offline or listings failed to fetch
    if ((safeListings.length === 0 || isOffline) && safeRecentViews.length > 0) {
      return safeRecentViews;
    }
    return safeListings;
  }, [listings, recentViewsList, favoritesList, filterRecentViews, filterFavorites, isOffline]);

  // Filtering Logic
  const filteredVehicles = useMemo(() => {
    return sourceVehicles.filter((car) => {
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

      // Seller Type
      if (filterSellerType !== 'All') {
        const isIndividual = car.dealerId === 'private' || car.sellerType === 'Individual';
        if (filterSellerType === 'Individual' && !isIndividual) {
          return false;
        }
        if (filterSellerType === 'Showroom' && isIndividual) {
          return false;
        }
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
  }, [sourceVehicles, localQuery, filterMake, filterModel, filterBodyCategory, filterCity, filterTransmission, filterFuel, filterCondition, filterAssembly, priceMin, priceMax, yearMin, yearMax, filterFavorites, filterRecentViews, favoritesList, recentViewsList, filterSellerType]);

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
    if (sortBy === 'MileageLow') {
      return list.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
    }
    if (sortBy === 'MileageHigh') {
      return list.sort((a, b) => (b.mileage || 0) - (a.mileage || 0));
    }
    if (sortBy === 'EngineCCLow') {
      return list.sort((a, b) => (a.engineCC || 0) - (b.engineCC || 0));
    }
    if (sortBy === 'EngineCCHigh') {
      return list.sort((a, b) => (b.engineCC || 0) - (a.engineCC || 0));
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
      <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4">
        <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-[#007979] flex items-center gap-1.5">
          <SlidersHorizontal size={14} />
          {t.filterTitle}
        </h3>
        <button
          onClick={handleResetFilters}
          className="text-xs font-sans text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          {t.resetAll}
        </button>
      </div>

      {/* Collections Selection Option Panel */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl space-y-3 shadow-xs">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#007979] block">Personal Collections</span>
        
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
                ? 'bg-rose-50 border-rose-300 text-rose-600 font-bold'
                : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#007979]/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-rose-500 font-black">❤️</span>
              Favorites ({favoritesList.length})
            </span>
            {filterFavorites && <span className="text-[9px] bg-rose-500 text-white font-mono font-bold px-1.5 py-0.2 rounded-md">ACTIVE</span>}
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
                ? 'bg-sky-50 border-sky-300 text-sky-600 font-bold'
                : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#007979]/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-sky-500 font-black">🕒</span>
              Recent Views ({recentViewsList.length})
            </span>
            {filterRecentViews && <span className="text-[9px] bg-sky-500 text-white font-mono font-bold px-1.5 py-0.2 rounded-md">ACTIVE</span>}
          </button>
        </div>
      </div>

      {/* 1. Body Type Category Dropdown */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">{t.bodyType}</label>
        <select
          value={filterBodyCategory}
          onChange={(e) => setFilterBodyCategory(e.target.value)}
          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl p-3 text-xs focus:border-[#007979] focus:ring-1 focus:ring-[#007979] outline-none shadow-2xs"
        >
          {BODY_CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.id === 'All' ? t.any : cat.label}</option>
          ))}
        </select>
      </div>

      {/* 2. Brand Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">{t.make}</label>
        <select
          value={filterMake}
          onChange={(e) => setFilterMake(e.target.value)}
          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl p-3 text-xs focus:border-[#007979] focus:ring-1 focus:ring-[#007979] outline-none shadow-2xs"
        >
          {MAKES_LIST.map(make => (
            <option key={make} value={make}>{make === 'All' ? t.any : make}</option>
          ))}
        </select>
      </div>

      {/* 3. Model select/text field */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">{t.model}</label>
        <div className="relative">
          {filterMake !== 'All' && CAR_MODELS[filterMake] ? (
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl p-3 text-xs focus:border-[#007979] focus:ring-1 focus:ring-[#007979] outline-none cursor-pointer shadow-2xs"
            >
              <option value="">{lang === 'ur' ? "تمام ماڈلز (کوئی بھی)" : "All Models (Any)"}</option>
              {CAR_MODELS[filterMake].map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          ) : (
            <>
              <input
                type="text"
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                placeholder={t.modelPlaceholder}
                className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl p-3 text-xs placeholder-[#94A3B8] focus:border-[#007979] focus:ring-1 focus:ring-[#007979] outline-none shadow-2xs"
              />
              {filterModel && (
                <button
                  onClick={() => setFilterModel('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. Year slider range */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-[11px]">
          <span className="font-sans font-bold uppercase tracking-wider text-[#64748B]">{t.yearRange}</span>
          <span className="font-mono text-xs text-[#007979] font-bold">{yearMin} - {yearMax}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="range"
            min="2000"
            max="2026"
            value={yearMin}
            onChange={(e) => setYearMin(parseInt(e.target.value))}
            className="w-full h-1.5 bg-[#E2E8F0] rounded appearance-none cursor-pointer accent-[#007979]"
          />
          <input
            type="range"
            min="2000"
            max="2026"
            value={yearMax}
            onChange={(e) => setYearMax(parseInt(e.target.value))}
            className="w-full h-1.5 bg-[#E2E8F0] rounded appearance-none cursor-pointer accent-[#007979]"
          />
        </div>
      </div>

      {/* 5. Price filter sliders */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-[11px]">
          <span className="font-sans font-bold uppercase tracking-wider text-[#64748B]">{t.priceRange}</span>
          <span className="font-mono text-xs text-[#007979] font-bold">{formatPriceNum(priceMax)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="120000000"
          step="500000"
          value={priceMax}
          onChange={(e) => setPriceMax(parseInt(e.target.value))}
          className="w-full h-1.5 bg-[#E2E8F0] rounded appearance-none cursor-pointer accent-[#007979]"
        />
      </div>

      {/* 6. City Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">{t.city}</label>
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl p-3 text-xs focus:border-[#007979] focus:ring-1 focus:ring-[#007979] outline-none shadow-2xs"
        >
          {PAKISTAN_CITIES.map(city => (
            <option key={city} value={city}>{city === 'All' ? t.any : city}</option>
          ))}
        </select>
      </div>

      {/* 7. Transmission dropdown */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">{t.transmission}</label>
        <select
          value={filterTransmission}
          onChange={(e) => setFilterTransmission(e.target.value)}
          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl p-3 text-xs focus:border-[#007979] focus:ring-1 focus:ring-[#007979] outline-none shadow-2xs"
        >
          <option value="All">{t.any}</option>
          <option value="Automatic">{t.automatic}</option>
          <option value="Manual">{t.manual}</option>
        </select>
      </div>

      {/* 8. Fuel Type dropdown */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">{t.fuelType}</label>
        <select
          value={filterFuel}
          onChange={(e) => setFilterFuel(e.target.value)}
          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl p-3 text-xs focus:border-[#007979] focus:ring-1 focus:ring-[#007979] outline-none shadow-2xs"
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
        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">{t.condition}</label>
        <select
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl p-3 text-xs focus:border-[#007979] focus:ring-1 focus:ring-[#007979] outline-none shadow-2xs"
        >
          <option value="All">{t.any}</option>
          <option value="New">{t.new}</option>
          <option value="Used">{t.used}</option>
        </select>
      </div>

      {/* 10. Assembly Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">{t.assembly}</label>
        <select
          value={filterAssembly}
          onChange={(e) => setFilterAssembly(e.target.value)}
          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl p-3 text-xs focus:border-[#007979] focus:ring-1 focus:ring-[#007979] outline-none shadow-2xs"
        >
          <option value="All">{t.any}</option>
          <option value="Local">Local Assembled</option>
          <option value="Imported">Imported</option>
        </select>
      </div>

      {/* 11. Seller Type Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">{t.sellerType}</label>
        <select
          value={filterSellerType}
          onChange={(e) => setFilterSellerType(e.target.value)}
          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl p-3 text-xs focus:border-[#007979] focus:ring-1 focus:ring-[#007979] outline-none shadow-2xs"
        >
          <option value="All">{t.allSellers}</option>
          <option value="Individual">{t.individualSellers}</option>
          <option value="Showroom">{t.showrooms}</option>
        </select>
      </div>
    </div>
  );

  return (
    <div 
      className={`flex flex-col space-y-6 animate-fade-in text-[#0F172A] font-sans ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Body Category Pills Bar */}
      <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-2xl space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#64748B] tracking-wider flex items-center gap-1.5">
            <Filter size={12} className="text-[#007979]" /> Quick Category Explorer
          </span>
          <span className="text-[10px] font-mono text-[#007979] font-bold">
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
                    ? 'bg-[#007979] text-white font-bold shadow-xs scale-102'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:border-[#007979]/40'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-white' : 'text-[#007979]'} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar Header */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4 justify-between shadow-xs">
        <div className="relative flex-grow w-full">
          <Search className={`text-[#94A3B8] absolute top-1/2 -translate-y-1/2 shrink-0 ${isRtl ? 'right-4' : 'left-4'}`} size={18} />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-sm rounded-2xl p-3.5 focus:border-[#007979] focus:bg-white focus:ring-1 focus:ring-[#007979] outline-none shadow-2xs ${
              isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'
            }`}
          />
          {localQuery && (
            <button
              onClick={() => { setLocalQuery(''); setSearchQuery(''); }}
              className={`absolute top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer ${isRtl ? 'left-4' : 'right-4'}`}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Sort selection */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2.5 rounded-2xl text-xs shadow-2xs hover:border-[#007979]/40 transition-all min-w-[170px]">
            <ArrowDownUp size={14} className="text-[#007979] shrink-0" />
            <span className="text-[#64748B] font-sans whitespace-nowrap">{t.sortBy}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[#0F172A] focus:outline-none font-bold outline-none cursor-pointer w-full text-xs"
            >
              <option value="Newest" className="bg-white text-[#0F172A]">{t.newest}</option>
              <option value="PriceLow" className="bg-white text-[#0F172A]">{t.priceLow}</option>
              <option value="PriceHigh" className="bg-white text-[#0F172A]">{t.priceHigh}</option>
              <option value="YearNewest" className="bg-white text-[#0F172A]">{t.yearNewest}</option>
              <option value="MileageLow" className="bg-white text-[#0F172A]">{t.mileageLow}</option>
              <option value="MileageHigh" className="bg-white text-[#0F172A]">{t.mileageHigh}</option>
              <option value="EngineCCLow" className="bg-white text-[#0F172A]">{t.engineLow}</option>
              <option value="EngineCCHigh" className="bg-white text-[#0F172A]">{t.engineHigh}</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden bg-[#007979] hover:bg-[#006060] text-white p-3 rounded-2xl border border-[#007979] active:scale-95 duration-100 flex items-center justify-center cursor-pointer font-bold text-xs gap-1.5 shadow-xs"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters.length > 0 && (
              <span className="bg-white text-[#007979] font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap bg-white border border-[#E2E8F0] p-2.5 rounded-2xl text-xs shadow-2xs">
          <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider px-1">Active Filters:</span>
          {activeFilters.map(item => (
            <button
              key={item.id}
              onClick={item.reset}
              className="bg-[#007979]/10 border border-[#007979]/30 text-[#007979] hover:bg-[#007979]/20 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs"
            >
              <span>{item.label}</span>
              <X size={12} className="hover:text-rose-500" />
            </button>
          ))}
          <button
            onClick={handleResetFilters}
            className="text-[10px] font-mono font-bold text-rose-500 hover:underline px-2 py-1 cursor-pointer ml-auto"
          >
            Clear All ({activeFilters.length})
          </button>
        </div>
      )}

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filters Sidebar (Hidden on mobile) */}
        <aside className="hidden lg:block bg-white border border-[#E2E8F0] p-6 rounded-3xl h-fit sticky top-24 shadow-xs">
          {filterSidebarContent}
        </aside>

        {/* Right Listings Grid */}
        <section className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-xs text-[#64748B] uppercase font-mono tracking-widest px-1">
            <span>
              {t.showing} <strong className="text-[#0F172A] font-bold">{sortedVehicles.length}</strong> {t.results}
            </span>
            <span className="hidden sm:inline">Bazar360 Verified Marketplace</span>
          </div>

          {dbLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <VehicleSkeletonCard key={i} />
              ))}
            </div>
          ) : sortedVehicles.length > 0 ? (
            <div className="space-y-8">
              <motion.div 
                key={`search-page-${currentPage}`}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.03
                    }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                {paginatedVehicles.map((car, index) => (
                  <motion.div
                    key={car.id}
                    variants={{
                      hidden: { opacity: 0, y: 22, scale: 0.96 },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          duration: 0.38,
                          ease: [0.215, 0.610, 0.355, 1.000],
                        }
                      }
                    }}
                  >
                    <VehicleCard
                      car={car}
                      index={index}
                      dealer={dealers.find((d) => d.id === car.dealerId)}
                      onSelect={onSelectListing}
                      onToggleCompare={onToggleCompare}
                      isComparing={compareList.some((c) => c.id === car.id)}
                      onToggleFavorite={onToggleFavorite}
                      isFavorite={favoritesList.some((f) => f.id === car.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Microsoft-Style Professional Pagination Card */}
              {totalPages > 1 && (
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs select-none text-[#0F172A] animate-fade-in" id="microsoft-style-pagination">
                  <span className="text-xs font-mono font-bold text-[#64748B] uppercase">
                    Page <strong className="text-[#0F172A] font-bold">{currentPage}</strong> of <strong className="text-[#0F172A] font-bold">{totalPages}</strong> ({sortedVehicles.length} total vehicles)
                  </span>
                  
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    {/* Previous Button */}
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 text-xs font-bold uppercase rounded-xl tracking-wider transition-all duration-150 ${
                        currentPage === 1
                          ? 'text-[#94A3B8] bg-[#F8FAFC] cursor-not-allowed border border-[#E2E8F0]'
                          : 'text-[#0F172A] hover:bg-[#F1F5F9] bg-white border border-[#E2E8F0] active:scale-95 cursor-pointer shadow-2xs'
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
                          return <span key={pageNum} className="px-1.5 text-[#94A3B8] font-bold">...</span>;
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
                          className={`w-9 h-9 text-xs font-bold rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-[#007979] text-white shadow-xs font-bold border border-[#007979]'
                              : 'text-[#0F172A] hover:bg-[#F1F5F9] bg-white border border-[#E2E8F0] shadow-2xs'
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
                      className={`px-4 py-2 text-xs font-bold uppercase rounded-xl tracking-wider transition-all duration-150 ${
                        currentPage === totalPages
                          ? 'text-[#94A3B8] bg-[#F8FAFC] cursor-not-allowed border border-[#E2E8F0]'
                          : 'text-[#0F172A] hover:bg-[#F1F5F9] bg-white border border-[#E2E8F0] active:scale-95 cursor-pointer shadow-2xs'
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-6 shadow-xs">
              <Car size={48} className="text-[#94A3B8] animate-pulse" />
              <p className="text-[#64748B] font-sans max-w-sm text-sm">
                {t.noResults}
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-[#007979] hover:bg-[#006060] text-white font-sans font-bold text-xs uppercase px-6 py-3 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                {t.clearFilters}
              </button>
            </div>
          )}
        </section>

      </div>

      {/* Collapsible Mobile Filters Drawer Backdrop */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-slate-900/60 z-[120] backdrop-blur-xs flex justify-end lg:hidden">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto flex flex-col relative border-l border-[#E2E8F0] animate-scale-fade shadow-2xl">
            
            {/* Close Mobile Filters button */}
            <button
              onClick={() => setShowMobileFilters(false)}
              className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] p-2 hover:bg-[#F1F5F9] rounded-xl cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Content drawer */}
            <div className="pt-8 flex-grow">
              {filterSidebarContent}
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-6 mb-20 w-full bg-[#007979] hover:bg-[#006060] text-white font-sans font-bold text-xs uppercase py-3.5 rounded-xl text-center cursor-pointer shadow-md relative z-10"
            >
              Apply Filters ({sortedVehicles.length} Cars)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

