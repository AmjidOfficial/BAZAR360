import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Car, 
  Sparkles, 
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Building2,
  ArrowRight,
  PlusCircle,
  Pause,
  Play,
  MapPin,
  Flame,
  RefreshCw
} from 'lucide-react';
import { CarListing } from '../types';

interface AutoChoiceHeroProps {
  lang: 'en' | 'ur';
  onSearch: (query: string) => void;
  setTab: (tab: string) => void;
  listings?: CarListing[];
  onSelectListing?: (car: CarListing) => void;
}

// Helper function to format price in Lakh / Crore for Pakistan market
function formatPakPrice(price: number): string {
  if (!price || isNaN(price)) return 'Contact for Price';
  if (price >= 10000000) {
    return `PKR ${(price / 10000000).toFixed(2)} Crore`;
  }
  if (price >= 100000) {
    return `PKR ${(price / 100000).toFixed(1)} Lakh`;
  }
  return `PKR ${price.toLocaleString()}`;
}

export default function AutoChoiceHero({ lang, onSearch, setTab, listings = [], onSelectListing }: AutoChoiceHeroProps) {
  const isUrdu = lang === 'ur';
  const [searchInput, setSearchInput] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [searchMode, setSearchMode] = useState<'buy' | 'sell' | 'showroom'>('buy');
  
  // Hero Live Inventory Carousel State
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Filter valid live inventory from backend Firestore listings, sorted latest uploaded first
  const validPropListings = (listings || [])
    .filter(item => item && (item.images?.length > 0 || item.imageUrl || item.title || item.make))
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA; // Latest uploaded first
    });
  
  const heroVehicles = validPropListings;
  
  // Active selected vehicle
  const activeHeroCar = heroVehicles.length > 0 ? (heroVehicles[selectedHeroIndex % heroVehicles.length] || heroVehicles[0]) : null;

  // Auto cycle timer (every 4.5 seconds)
  useEffect(() => {
    if (!isAutoplay || isHovered || heroVehicles.length <= 1) return;
    
    const interval = setInterval(() => {
      setSelectedHeroIndex((prev) => (prev + 1) % heroVehicles.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoplay, isHovered, heroVehicles.length]);

  const handleNextHero = () => {
    setSelectedHeroIndex((prev) => (prev + 1) % heroVehicles.length);
  };

  const handlePrevHero = () => {
    setSelectedHeroIndex((prev) => (prev - 1 + heroVehicles.length) % heroVehicles.length);
  };

  const handleCombinedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === 'sell') {
      setTab('sell');
      return;
    }
    if (searchMode === 'showroom') {
      setTab('dealers');
      return;
    }
    const queryParts = [searchInput, selectedMake, selectedCity, selectedPrice, selectedCondition].filter(Boolean);
    const combinedQuery = queryParts.join(' ');
    onSearch(combinedQuery);
    setTab('search');
  };

  return (
    <div className="relative w-full bg-[#0B192C] text-white overflow-hidden pt-24 pb-12 lg:pt-32 lg:pb-20 border-b border-[#1E293B]">
      
      {/* Subtle Automotive Orange Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#F97316]/10 via-[#0F172A]/30 to-transparent rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* SECTION 1 ON MOBILE & LEFT COLUMN ON DESKTOP: Heading, Subtitle & Search Controls */}
          <div className="w-full lg:col-span-7 flex flex-col justify-center order-1">
            
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] text-xs font-semibold tracking-wide uppercase w-fit mb-3"
            >
              <Sparkles size={14} className="text-[#F97316]" />
              <span>{isUrdu ? 'پاکستان کا بہترین آٹوموٹو نیٹ ورک' : 'Verified Automotive Marketplace'}</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 leading-[1.15]"
            >
              {isUrdu ? 'اپنی اگلی گاڑی' : 'Find Your Next'}{' '}
              <span className="text-[#F97316]">
                {isUrdu ? 'تلاش کریں' : 'Dream Car'}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-sm sm:text-base text-[#94A3B8] max-w-xl mb-6 leading-relaxed font-normal"
            >
              {isUrdu
                ? 'پاکستان بھر سے تصدیق شدہ گاڑیوں، شو رومز اور معائنے کے ساتھ آسانی سے خریدیں اور بیچیں۔'
                : 'Buy, sell and discover trusted vehicles across Pakistan with verified seller badges and direct inspection.'}
            </motion.p>

            {/* Hero Search Panel Container */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="w-full bg-[#0F172A]/90 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl"
            >
              {/* Buy / Sell / Showrooms Mode Switch */}
              <div className="flex items-center gap-1.5 p-1 bg-[#1E293B] rounded-xl border border-white/10 w-fit mb-4 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSearchMode('buy')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    searchMode === 'buy'
                      ? 'bg-[#F97316] text-white shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Car size={14} />
                  <span>{isUrdu ? 'خریدیں' : 'Buy Cars'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchMode('sell')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    searchMode === 'sell'
                      ? 'bg-[#F97316] text-white shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <PlusCircle size={14} />
                  <span>{isUrdu ? 'بیچیں' : 'Sell Your Car'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchMode('showroom')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    searchMode === 'showroom'
                      ? 'bg-[#F97316] text-white shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Building2 size={14} />
                  <span>{isUrdu ? 'شورومز' : 'Showrooms'}</span>
                </button>
              </div>

              {/* Search Form Controls */}
              <form onSubmit={handleCombinedSearch} className="space-y-3">
                
                {/* Text Search Input */}
                <div className="relative group">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors duration-300 group-focus-within:text-[#F97316]" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={isUrdu ? "میک، ماڈل یا کی ورڈ تلاش کریں..." : "Search make, model, or city (e.g. Civic, Fortuner, Peshawar)..."}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1E293B] border border-white/10 rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all duration-300 hover:border-white/20 hover:bg-[#23334c]"
                  />
                </div>

                {/* Dropdowns Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <select
                    value={selectedMake}
                    onChange={(e) => setSelectedMake(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#1E293B] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 hover:border-white/20 hover:bg-[#23334c] hover:scale-102 transition-all duration-300 cursor-pointer"
                  >
                    <option value="">All Makes</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="KIA">KIA</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="MG">MG</option>
                    <option value="Changan">Changan</option>
                    <option value="Audi">Audi</option>
                    <option value="BMW">BMW</option>
                  </select>

                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#1E293B] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 hover:border-white/20 hover:bg-[#23334c] hover:scale-102 transition-all duration-300 cursor-pointer"
                  >
                    <option value="">All Cities</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Multan">Multan</option>
                  </select>

                  <select
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#1E293B] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 hover:border-white/20 hover:bg-[#23334c] hover:scale-102 transition-all duration-300 cursor-pointer"
                  >
                    <option value="">Any Price</option>
                    <option value="1500000">Under 15 Lakh</option>
                    <option value="3000000">Under 30 Lakh</option>
                    <option value="5000000">Under 50 Lakh</option>
                    <option value="10000000">Under 1 Crore</option>
                  </select>

                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#1E293B] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 hover:border-white/20 hover:bg-[#23334c] hover:scale-102 transition-all duration-300 cursor-pointer"
                  >
                    <option value="">All Conditions</option>
                    <option value="Used">Used</option>
                    <option value="New">New / Zero Meter</option>
                    <option value="Certified">Verified Only</option>
                  </select>
                </div>

                {/* Submit Search Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTab('search')}
                    className="text-xs text-[#94A3B8] hover:text-[#F97316] hover:scale-105 flex items-center justify-center sm:justify-start gap-1 font-semibold transition-all duration-300 cursor-pointer py-1"
                  >
                    <SlidersHorizontal size={14} className="transition-transform duration-300 hover:rotate-180" />
                    <span>Advanced Filters</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
                  >
                    <span>{isUrdu ? 'تلاش کریں' : 'Search Cars'}</span>
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </form>
            </motion.div>

          </div>

          {/* SECTION 2 ON MOBILE & RIGHT COLUMN ON DESKTOP: Floating & Dynamically Changing Live Inventory Showcase */}
          <div className="w-full lg:col-span-5 relative flex flex-col items-center justify-center order-2 mt-4 lg:mt-0">
            
            <div 
              className="w-full space-y-3"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Header Label Bar above Floating Card */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]"></span>
                  </span>
                  <span className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                    <Flame size={14} className="text-[#F97316]" />
                    <span>{isUrdu ? 'لائیو اسٹاک شوکیس' : 'Live Showroom Inventory'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#94A3B8] bg-[#1E293B] px-2 py-0.5 rounded-md border border-white/10">
                    {(selectedHeroIndex % heroVehicles.length) + 1} / {heroVehicles.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAutoplay(!isAutoplay)}
                    title={isAutoplay ? 'Pause auto rotation' : 'Start auto rotation'}
                    className="p-1 rounded-md bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white transition-colors cursor-pointer border border-white/10"
                  >
                    {isAutoplay ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                </div>
              </div>

              {/* Main Floating Hero Vehicle Showcase Inventory Card Container */}
              {heroVehicles.length === 0 ? (
                <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#0F172A] p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto text-orange-500">
                    <Car size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-sm">No Live Vehicles Posted Yet</h3>
                    <p className="text-xs text-slate-400">Be the first to list your vehicle on Bazar360.online!</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab('sell')}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <PlusCircle size={14} />
                    <span>Post Advertisement Now</span>
                  </button>
                </div>
              ) : activeHeroCar ? (
                <div className="space-y-3">
                  <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#0F172A] group flex flex-col">
                  
                  {/* Auto Rotation Progress Bar */}
                  {isAutoplay && !isHovered && heroVehicles.length > 1 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
                      <motion.div
                        key={selectedHeroIndex}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 4.5, ease: 'linear' }}
                        className="h-full bg-[#F97316]"
                      />
                    </div>
                  )}

                  {/* Top Image Canvas - Showing Full Length of Vehicle */}
                  <div className="relative w-full aspect-[16/9] bg-[#0B192C] overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeHeroCar.id || selectedHeroIndex}
                        src={activeHeroCar.images?.[0] || activeHeroCar.imageUrl || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200"}
                        alt={activeHeroCar.title || `${activeHeroCar.make} ${activeHeroCar.model}`}
                        initial={{ opacity: 0, scale: 1.03 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.35 }}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                    </AnimatePresence>

                    {/* Top Floating Badges */}
                    <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
                      <div className="bg-[#0F172A]/90 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[11px] font-bold text-white shadow-lg">
                        <ShieldCheck size={14} className="text-[#22C55E]" />
                        <span>Verified Stock</span>
                      </div>

                      {activeHeroCar.condition && (
                        <div className="bg-[#F97316]/90 backdrop-blur-md px-2 py-1 rounded-xl text-[10px] font-extrabold uppercase text-white shadow-sm">
                          {activeHeroCar.condition}
                        </div>
                      )}
                    </div>

                    {/* Top Right Model Year & Tag */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                      <div className="bg-[#0F172A]/90 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-white shadow-lg">
                        {activeHeroCar.year} Model
                      </div>
                    </div>

                    {/* Left & Right Interactive Floating Controls */}
                    {heroVehicles.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevHero}
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#0F172A]/85 hover:bg-[#F97316] text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-xl active:scale-95"
                          aria-label="Previous vehicle"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextHero}
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#0F172A]/85 hover:bg-[#F97316] text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-xl active:scale-95"
                          aria-label="Next vehicle"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Bottom Information Section - Situated strictly BELOW vehicle picture */}
                  <div className="p-4 sm:p-5 bg-[#0F172A] border-t border-white/10 space-y-3.5 flex-1 flex flex-col justify-between">
                    
                    {/* Row 1: Title & Demand Price */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F97316]">
                          {activeHeroCar.make}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
                          {activeHeroCar.model || activeHeroCar.title}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono uppercase text-[#94A3B8] block">Demand</span>
                        <span className="text-sm sm:text-base font-extrabold text-[#F97316]">
                          {formatPakPrice(activeHeroCar.price)}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Location & Showroom Name */}
                    <div className="flex items-center justify-between gap-2 text-xs text-[#94A3B8] pb-1 border-b border-white/10">
                      <div className="flex items-center gap-1 truncate text-white/90">
                        <MapPin size={13} className="text-[#F97316] shrink-0" />
                        <span className="truncate font-medium">
                          {activeHeroCar.registrationCity || activeHeroCar.location || 'Peshawar'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold text-white/80 bg-[#1E293B] px-2.5 py-0.5 rounded-lg border border-white/10">
                        <Building2 size={12} className="text-[#22C55E]" />
                        <span className="truncate max-w-[130px]">
                          {activeHeroCar.sellerName || 'Auto Choice'}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: Key Specs Grid (4 Badges) */}
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="bg-[#1E293B]/80 p-2 rounded-xl border border-white/5 flex flex-col justify-center">
                        <span className="text-[9px] font-mono text-[#94A3B8] uppercase">Mileage</span>
                        <span className="text-xs font-bold text-white font-mono truncate">
                          {activeHeroCar.mileage ? `${(activeHeroCar.mileage / 1000).toFixed(1)}k km` : 'Unreg.'}
                        </span>
                      </div>

                      <div className="bg-[#1E293B]/80 p-2 rounded-xl border border-white/5 flex flex-col justify-center">
                        <span className="text-[9px] font-mono text-[#94A3B8] uppercase">Engine</span>
                        <span className="text-xs font-bold text-white font-mono truncate">
                          {activeHeroCar.specs?.engineSize || (activeHeroCar.engineCC ? `${activeHeroCar.engineCC} CC` : 'N/A')}
                        </span>
                      </div>

                      <div className="bg-[#1E293B]/80 p-2 rounded-xl border border-white/5 flex flex-col justify-center">
                        <span className="text-[9px] font-mono text-[#94A3B8] uppercase">Trans.</span>
                        <span className="text-xs font-bold text-white truncate">
                          {activeHeroCar.transmission || 'Auto'}
                        </span>
                      </div>

                      <div className="bg-[#1E293B]/80 p-2 rounded-xl border border-white/5 flex flex-col justify-center">
                        <span className="text-[9px] font-mono text-[#94A3B8] uppercase">Fuel</span>
                        <span className="text-xs font-bold text-white truncate">
                          {activeHeroCar.fuelType || 'Petrol'}
                        </span>
                      </div>
                    </div>

                    {/* Row 4: Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectListing) {
                            onSelectListing(activeHeroCar);
                          } else {
                            setTab('inventory');
                          }
                        }}
                        className="group flex-1 py-2.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] hover:shadow-[0_0_20px_rgba(249,115,22,0.35)] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-md hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <span>View Vehicle Details</span>
                        <ChevronRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </button>

                      <a
                        href={`https://wa.me/${activeHeroCar.sellerWhatsApp || activeHeroCar.sellerPhone || '923159085086'}?text=${encodeURIComponent(`Hi, I am interested in your ${activeHeroCar.year} ${activeHeroCar.make} ${activeHeroCar.model} listed on Bazar360.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 hover:border-[#25D366]/60 text-xs font-bold flex items-center justify-center gap-1 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
                        title="Contact Seller on WhatsApp"
                      >
                        <span>WhatsApp</span>
                      </a>
                    </div>

                  </div>
                </div>

                {/* Replaceable / Selectable Live Inventory Thumbnails Rail */}
                {heroVehicles.length > 1 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
                        Replace / Select Live Vehicle:
                      </span>
                      <span className="text-[10px] text-[#F97316] font-semibold flex items-center gap-1">
                        <RefreshCw size={10} className="animate-spin text-[#F97316]" style={{ animationDuration: '6s' }} />
                        Auto Rotation On
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
                      {heroVehicles.map((car, idx) => {
                        const isSelected = idx === (selectedHeroIndex % heroVehicles.length);
                        return (
                          <button
                            key={car.id || idx}
                            type="button"
                            onClick={() => {
                              setSelectedHeroIndex(idx);
                              setIsAutoplay(false); // pause on manual selection
                            }}
                            className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 relative ${
                              isSelected
                                ? 'bg-[#1E293B] border-[#F97316] text-white shadow-md ring-1 ring-[#F97316]/50'
                                : 'bg-[#0F172A]/70 border-white/10 text-[#94A3B8] hover:text-white hover:border-white/20'
                            }`}
                          >
                            <img
                              src={car.images?.[0] || car.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300'}
                              alt={car.make || 'Car'}
                              className="w-9 h-9 rounded-lg object-cover"
                            />
                            <div className="text-left">
                              <p className="text-[10px] font-bold truncate max-w-[80px] sm:max-w-[100px]">{car.make} {car.model}</p>
                              <p className="text-[9px] text-[#F97316] font-extrabold">
                                {car.price ? formatPakPrice(car.price).replace('PKR ', '') : 'Call'}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F97316] border border-[#0F172A]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              ) : null}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
