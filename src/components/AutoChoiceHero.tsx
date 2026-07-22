import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Grid, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Share2, 
  Lock, 
  Heart, 
  Maximize2, 
  MoreHorizontal, 
  ArrowUpRight, 
  Sparkles,
  Zap,
  Gauge,
  Flame,
  Play
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import { dbFetchListings } from '../lib/dbService';
import { CarListing } from '../types';
import TaglineBar from './TaglineBar';
import { toast } from 'react-hot-toast';

interface AutoChoiceHeroProps {
  lang: 'en' | 'ur';
  onSearch: (query: string) => void;
  setTab: (tab: string) => void;
}

const FALLBACK_PREMIUM_CARS = [
  {
    id: 'premium-mercedes',
    make: 'Mercedes-Benz',
    model: 'E-Class Showroom Spec',
    year: 2024,
    price: 36500000,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    engineCC: '2000',
    location: 'Main G.T. Road, Near Askari Bank, Peshawar',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200',
    hp: '255 HP',
    topSpeed: '250 km/h',
    accel: '6.2s'
  },
  {
    id: 'premium-rover',
    make: 'Range Rover',
    model: 'Vogue Autobiography LWB',
    year: 2023,
    price: 82000000,
    transmission: 'Automatic',
    fuelType: 'Diesel/Hybrid',
    engineCC: '3000',
    location: 'F-8 Markaz, Islamabad Showroom',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
    hp: '395 HP',
    topSpeed: '225 km/h',
    accel: '5.9s'
  },
  {
    id: 'premium-audi',
    make: 'Audi',
    model: 'e-tron GT Quattro',
    year: 2024,
    price: 48000000,
    transmission: 'Automatic',
    fuelType: 'Electric',
    engineCC: 'EV',
    location: 'Gulberg III, Lahore Hub',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=1200',
    hp: '522 HP',
    topSpeed: '245 km/h',
    accel: '4.1s'
  },
  {
    id: 'premium-toyota',
    make: 'Toyota',
    model: 'Land Cruiser LC300 ZX',
    year: 2024,
    price: 78500000,
    transmission: 'Automatic',
    fuelType: 'Petrol Twin Turbo',
    engineCC: '3500',
    location: 'University Road, Peshawar flagship',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
    hp: '409 HP',
    topSpeed: '210 km/h',
    accel: '6.7s'
  }
];

export default function AutoChoiceHero({ lang, onSearch, setTab }: AutoChoiceHeroProps) {
  const { theme } = useTheme();
  const [searchVal, setSearchVal] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [listings, setListings] = useState<CarListing[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const isUrdu = lang === 'ur';

  useEffect(() => {
    dbFetchListings().then(fetchedListings => {
      setListings(fetchedListings);
    });
  }, []);

  // Format data for the slider cards
  const sliderItems = FALLBACK_PREMIUM_CARS.map((car, idx) => {
    // If we have actual listings, override with some actual database info
    const dbListing = listings[idx % listings.length];
    if (listings.length > 0 && dbListing) {
      return {
        id: dbListing.id || car.id,
        make: dbListing.make,
        model: dbListing.model,
        year: dbListing.year,
        price: dbListing.price,
        transmission: dbListing.transmission || car.transmission,
        fuelType: dbListing.fuelType || car.fuelType,
        engineCC: dbListing.engineCC || car.engineCC,
        location: (dbListing as any).location || dbListing.registrationCity || dbListing.region || car.location,
        image: dbListing.images && dbListing.images.length > 0 ? dbListing.images[0] : car.image,
        hp: (dbListing as any).hp || car.hp,
        topSpeed: (dbListing as any).topSpeed || car.topSpeed,
        accel: (dbListing as any).accel || car.accel
      };
    }
    return car;
  });

  // Buttery-smooth Auto-Swipe Interval with Hover Suspension
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % sliderItems.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, sliderItems.length]);

  // Buttery smooth mobile touch swipe gesture engine
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 55) {
      handleNext(); // Swipe left
    } else if (diff < -55) {
      handlePrev(); // Swipe right
    }
    setTouchStartX(null);
  };

  const activeCar = sliderItems[activeIdx] || sliderItems[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal);
      setTab('explore');
    }
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % sliderItems.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const formatPrice = (price: number) => {
    if (lang === 'ur') {
      if (price >= 10000000) return `روپے ${(price / 10000000).toFixed(1)} کروڑ`;
      if (price >= 100000) return `روپے ${(price / 100000).toFixed(1)} لاکھ`;
      return `روپے ${price.toLocaleString()}`;
    }
    if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(2)} Crore`;
    if (price >= 100000) return `PKR ${(price / 100000).toFixed(2)} Lakh`;
    return `PKR ${price.toLocaleString()}`;
  };

  return (
    <section className="relative w-full flex flex-col items-center">
      
      {/* 1. VISION PRO STYLE BROWSER NAVIGATION BAR */}
      <div className="w-full max-w-5xl px-4 mt-6 z-30">
        <div className="bg-slate-900/40 dark:bg-black/45 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center justify-between gap-4 shadow-2xl transition-all hover:border-white/15">
          {/* Left Buttons: Grid, Chevrons */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button 
              onClick={() => setTab('inventory')}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              title="Grid View Stock"
            >
              <Grid size={15} />
            </button>
            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrev}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                title="Back"
              >
                <ChevronLeft size={15} className="stroke-[2.5]" />
              </button>
              <button 
                onClick={handleNext}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                title="Forward"
              >
                <ChevronRight size={15} className="stroke-[2.5]" />
              </button>
            </div>
            <span className="text-[10px] font-black text-white/50 tracking-wider hidden sm:inline select-none">AA</span>
          </div>

          {/* Center Capsule Address Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
            <div className="bg-black/30 dark:bg-black/50 border border-white/5 hover:border-white/10 focus-within:border-orange-500/50 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-inner transition-all group">
              <Lock size={11} className="text-emerald-400 shrink-0" />
              <span className="text-[10px] font-mono font-bold text-white/40 select-none hidden md:inline">bazar360.online/</span>
              <input
                type="text"
                placeholder={isUrdu ? "گاڑی یا مقام تلاش کریں..." : "Search premium vehicles & locations..."}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-transparent w-full text-xs placeholder-white/30 text-white focus:outline-none"
              />
              <button type="submit" className="text-white/40 hover:text-orange-500 transition cursor-pointer shrink-0">
                <Search size={13} className="stroke-[2.5]" />
              </button>
            </div>
          </form>

          {/* Right Buttons: Plus, Share, Flag */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setTab('sell')}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer hidden sm:flex"
              title="Post Ad"
            >
              <Plus size={15} />
            </button>
            <button 
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({ title: 'Bazar360 Premium Showrooms', url: window.location.href });
                  } catch (err) {
                    console.log('Share cancelled or failed:', err);
                  }
                }
              }}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              title="Share Page"
            >
              <Share2 size={14} />
            </button>
            <div className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full text-[8px] font-black tracking-wider uppercase select-none hidden md:inline-block">
              AUTO CHOICE
            </div>
          </div>
        </div>
      </div>

      {/* LEFT-ALIGNED HERO TYPOGRAPHY HEADER with SPLIT-COLOR EMPHASIS & PASTEL ACCENT BANDS */}
      <div className="w-full max-w-5xl px-6 mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        {/* Pastel Accent Bands */}
        <div className="absolute -top-12 left-1/4 w-72 h-32 bg-orange-200/10 dark:bg-orange-500/5 rounded-full blur-2xl transform rotate-12 -z-10" />
        <div className="absolute top-8 left-10 w-96 h-16 bg-blue-200/15 dark:bg-blue-500/5 rounded-full blur-xl transform -rotate-6 -z-10" />
        <div className="absolute -bottom-8 left-20 w-48 h-12 bg-emerald-100/15 dark:bg-emerald-500/5 rounded-full blur-xl -z-10" />

        {/* Left Side: Typography Content & CTA Actions */}
        <div className="md:col-span-7 space-y-6 text-left relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <Sparkles size={11} className="text-[var(--color-accent-main)] animate-pulse" />
            <span className="text-[10px] font-bold text-[var(--color-accent-main)] uppercase tracking-widest font-mono">
              {isUrdu ? 'پریمیم کار کیوریشن' : 'Premium Showroom Curation'}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1.05] font-display text-[var(--color-text-header)]">
            {isUrdu ? (
              <>
                اپنی <span className="text-[var(--color-accent-main)]">پسندیدہ ترین گاڑی</span> تلاش کریں اور چلائیں۔
              </>
            ) : (
              <>
                Uncompromising Performance. <br className="hidden md:inline" />
                Find Your <span className="text-[var(--color-accent-main)] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Perfect Drive</span>.
              </>
            )}
          </h1>

          <p className="text-xs md:text-sm font-sans font-medium text-[var(--color-text-main)] max-w-xl leading-relaxed">
            {isUrdu ? (
              'پشاور کی سب سے قابل اعتماد پریمیم آٹوموٹو مارکیٹ۔ جہاں ہر گاڑی معیار، خوبصورتی اور پائیداری کے اعلیٰ معیار پر پورا اترتی ہے۔'
            ) : (
              'Welcome to Auto Choice Peshawar. Explore our elite selection of handpicked premium imports, flagship SUVs, and luxury performance touring vehicles — backed by verified digital paperwork.'
            )}
          </p>

          {/* Core Integrated Search Bar Widget inside Hero */}
          <div className="w-full max-w-lg p-2.5 bg-[var(--color-bg-secondary)] backdrop-blur-xl rounded-2xl border border-[var(--color-border-main)] flex flex-col sm:flex-row items-center gap-2 shadow-bento transition-all duration-300">
            <div className="flex items-center gap-2 px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl flex-1 w-full">
              <Search size={14} className="text-[var(--color-accent-main)] shrink-0" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder={isUrdu ? 'کار کا ماڈل یا برانڈ تلاش کریں...' : 'Search premium models, SUVs, body styles...'}
                className="bg-transparent border-none text-xs text-[var(--color-text-header)] placeholder-[var(--color-text-muted)] focus:outline-none w-full font-sans"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearch(searchVal);
                    setTab('explore');
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="bg-black/5 dark:bg-white/5 text-[var(--color-text-main)] border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer min-w-[100px] flex-1 sm:flex-initial"
              >
                <option value="" className="bg-[var(--color-bg-primary)] text-[var(--color-text-header)]">{isUrdu ? 'تمام برانڈز' : 'All Brands'}</option>
                <option value="Mercedes-Benz" className="bg-[var(--color-bg-primary)] text-[var(--color-text-header)]">Mercedes-Benz</option>
                <option value="Audi" className="bg-[var(--color-bg-primary)] text-[var(--color-text-header)]">Audi</option>
                <option value="Toyota" className="bg-[var(--color-bg-primary)] text-[var(--color-text-header)]">Toyota</option>
                <option value="Honda" className="bg-[var(--color-bg-primary)] text-[var(--color-text-header)]">Honda</option>
              </select>
              <button
                onClick={() => {
                  const queryWithMake = [searchVal, selectedMake].filter(Boolean).join(' ');
                  onSearch(queryWithMake);
                  setTab('explore');
                }}
                className="px-4 py-2 bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-hover)] active:scale-95 text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>{isUrdu ? 'تلاش' : 'Search'}</span>
              </button>
            </div>
          </div>

          {/* Core Action triggers */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <button
              onClick={() => setTab('explore')}
              className="px-6 py-3 rounded-full bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-hover)] text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore Fleet</span>
              <ArrowUpRight size={13} className="stroke-[3]" />
            </button>

            <button
              onClick={() => {
                toast.success('Launching virtual showroom walkthrough video stream...');
              }}
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-[var(--color-text-header)] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border border-white/10"
            >
              <Play size={12} className="fill-[var(--color-text-header)] text-[var(--color-text-header)]" />
              <span>Watch Showroom Tour</span>
            </button>
          </div>
        </div>

        {/* Right Side: Realigned Swiping Vehicle Inventory Section Inline Opposite Typography */}
        <div 
          className="md:col-span-5 flex flex-col items-center justify-center relative w-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            key={activeCar.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative w-full max-w-[340px] rounded-[32px] overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl p-4 flex flex-col gap-3 group hover:border-orange-500/30 transition-all duration-500"
          >
            {/* Top Badge Overlay */}
            <div className="absolute top-3.5 left-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full z-20 shadow-lg border border-orange-400/20 flex items-center gap-1">
              <Sparkles size={9} className="animate-spin duration-3000 text-slate-950" />
              <span>Verified Showroom Stock</span>
            </div>

            {/* Breakout Soft-Rounded Container */}
            <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-black shrink-0 shadow-inner z-10">
              <img
                src={activeCar.image}
                alt={activeCar.model}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
              
              {/* Location Tag */}
              <div className="absolute bottom-3 left-3 bg-orange-500 text-slate-950 font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full z-15 shadow-md flex items-center gap-1">
                <MapPin size={8} />
                <span>{activeCar.location.split(',')[0]}</span>
              </div>

              {/* Model Year Stamp */}
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white font-mono text-[9px] px-2.5 py-0.5 rounded-md border border-white/10">
                {activeCar.year}
              </div>
            </div>

            {/* Swiping Card Details */}
            <div className="text-left space-y-2 z-10">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-orange-400 tracking-[0.2em] leading-none block">
                  {activeCar.make}
                </span>
                <span className="text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400">
                  {activeCar.transmission}
                </span>
              </div>

              <h3 className="text-base font-black text-white leading-tight truncate">
                {activeCar.model}
              </h3>

              {/* Specs Pills */}
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-white/5 border border-white/10 rounded-xl text-center">
                <div className="flex flex-col items-center py-0.5">
                  <Zap size={10} className="text-amber-400 mb-0.5" />
                  <span className="text-[9px] font-bold text-white leading-none">{activeCar.hp}</span>
                </div>
                <div className="flex flex-col items-center py-0.5 border-x border-white/10">
                  <Gauge size={10} className="text-orange-400 mb-0.5" />
                  <span className="text-[9px] font-bold text-white leading-none">{activeCar.topSpeed}</span>
                </div>
                <div className="flex flex-col items-center py-0.5">
                  <Flame size={10} className="text-rose-400 mb-0.5" />
                  <span className="text-[9px] font-bold text-white leading-none">{activeCar.accel}</span>
                </div>
              </div>

              {/* Price & CTA Row */}
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-emerald-400">
                    {formatPrice(activeCar.price)}
                  </span>
                  <span className="text-[8px] text-white/50 uppercase font-mono">Verified Value</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setTab('inventory')}
                  className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-[9px] uppercase tracking-wider rounded-full transition-all shadow-md cursor-pointer flex items-center gap-1"
                >
                  <span>Explore</span>
                  <ArrowUpRight size={10} />
                </button>
              </div>
            </div>

            {/* Inline Slider Swiper Controls */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition cursor-pointer"
                title="Previous Vehicle"
              >
                <ChevronLeft size={14} />
              </button>

              <div className="flex items-center gap-1.5">
                {sliderItems.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeIdx ? 'w-4 bg-orange-500' : 'w-1.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition cursor-pointer"
                title="Next Vehicle"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>



      {/* MOBILE OPTIMIZED HERO CAROUSEL STAGE - MOBILE ONLY */}
      <div 
        className="flex md:hidden relative w-full mt-6 flex-col items-center px-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Active Car Glassmorphic Card Container */}
        <div className="w-full max-w-sm rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-slate-950 flex flex-col relative">
          {/* Image Part on top */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
            <img
              src={activeCar.image}
              alt={activeCar.model}
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Subtle overlay only */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
            
            {/* Top Stamp Tags inside image container */}
            <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
              <div className="bg-orange-500 text-slate-950 font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <MapPin size={8} />
                <span>{activeCar.location.split(',')[0]}</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10">
                {activeCar.year}
              </div>
            </div>
          </div>

          {/* Details Part Strictly Below the Image */}
          <div className="w-full p-5 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col text-left">
            {/* Make and Title */}
            <div>
              <span className="text-[9px] font-black uppercase text-orange-400 tracking-[0.2em] block leading-none">
                {activeCar.make}
              </span>
              <h2 className="text-lg font-black text-white mt-1 leading-tight tracking-tight line-clamp-1 drop-shadow-md">
                {activeCar.model}
              </h2>
              <p className="text-[9px] font-semibold text-white/70 uppercase tracking-wider mt-1">
                {activeCar.transmission} • {activeCar.fuelType} • {activeCar.engineCC}cc
              </p>
            </div>

            {/* Performance Specs Mini Row */}
            <div className="grid grid-cols-3 gap-1 mt-3 p-1.5 bg-white/5 border border-white/15 backdrop-blur-xl rounded-xl text-center">
              <div className="flex flex-col items-center justify-center py-0.5">
                <span className="text-[9px] font-extrabold text-white leading-none">{activeCar.hp}</span>
                <span className="text-[6px] uppercase tracking-wider text-white/50 font-bold mt-0.5 font-mono">Power</span>
              </div>
              <div className="flex flex-col items-center justify-center py-0.5 border-x border-white/10">
                <span className="text-[9px] font-extrabold text-white leading-none">{activeCar.topSpeed}</span>
                <span className="text-[6px] uppercase tracking-wider text-white/50 font-bold mt-0.5 font-mono">Speed</span>
              </div>
              <div className="flex flex-col items-center justify-center py-0.5">
                <span className="text-[9px] font-extrabold text-white leading-none">{activeCar.accel}</span>
                <span className="text-[6px] uppercase tracking-wider text-white/50 font-bold mt-0.5 font-mono">0-100</span>
              </div>
            </div>

            {/* Price & Primary CTA */}
            <div className="mt-3 pt-3 border-t border-dashed border-white/10 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-base font-black text-white font-sans leading-none">
                  {formatPrice(activeCar.price)}
                </span>
                <span className="text-[7px] font-sans tracking-widest uppercase text-white/50 font-black mt-1">
                  Total Value
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTab('inventory');
                }}
                className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center gap-1 group/btn shrink-0"
              >
                <span>Explore</span>
                <ArrowUpRight size={9} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Swipe instruction helper tag for mobile user */}
        <p className="text-[8px] font-mono font-black text-white/30 tracking-[0.25em] uppercase mt-3 mb-1 animate-pulse select-none">
          ← Swipe to explore premium stock →
        </p>

        {/* 4. DOTS SLIDE INDICATOR PAGINATION FOR MOBILE */}
        <div className="flex items-center gap-1.5 z-20 mt-2 mb-1">
          {sliderItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIdx 
                  ? 'w-5 bg-orange-500 shadow-md shadow-orange-500/20' 
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <TaglineBar lang={lang} />
    </section>
  );
}

