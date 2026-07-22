import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CarListing, Dealer } from '../types';
import { VehicleCard } from './VehicleCard';
import AutoChoiceHero from './AutoChoiceHero';
import VehicleListingCard from './VehicleListingCard';
import { hoverEffects, pageTransitions } from './AnimationProvider';
import { ShieldCheck, PlusCircle, MessageSquare, Sparkles, SlidersHorizontal, Grid, List, Film, Play, VolumeX, Volume2, Search, ArrowRight, Zap, Flame, Eye } from 'lucide-react';
import { useCurrencyMode } from '../lib/currency';

interface HomeFeedProps {
  listings: CarListing[];
  dealers: Dealer[];
  onSelectListing: (car: CarListing) => void;
  onToggleCompare: (car: CarListing) => void;
  compareList: CarListing[];
  onToggleFavorite: (car: CarListing) => void;
  favoritesList: CarListing[];
  lang: 'en' | 'ur';
  setTab: (tab: string) => void;
  setSelectedCategory?: (category: string) => void;
  setSearchQuery?: (query: string) => void;
}

export function HomeFeed({
  listings,
  dealers,
  onSelectListing,
  onToggleCompare,
  compareList,
  onToggleFavorite,
  favoritesList,
  lang,
  setTab,
  setSelectedCategory,
  setSearchQuery
}: HomeFeedProps) {
  const isUrdu = lang === 'ur';
  const { renderPrice } = useCurrencyMode();
  const [filterCondition, setFilterCondition] = useState<'All' | 'New' | 'Used'>('All');
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchVal, setSearchVal] = useState('');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Filter listings based on search and condition
  const filteredListings = useMemo(() => {
    return listings.filter(car => {
      const matchesSearch = searchVal
        ? car.title.toLowerCase().includes(searchVal.toLowerCase()) ||
          car.make.toLowerCase().includes(searchVal.toLowerCase()) ||
          car.model.toLowerCase().includes(searchVal.toLowerCase())
        : true;
      const matchesCondition = filterCondition === 'All' ? true : car.condition === filterCondition;
      return matchesSearch && matchesCondition;
    });
  }, [listings, searchVal, filterCondition]);

  // Infinite Scroll Trigger
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredListings.length) {
          setVisibleCount(prev => Math.min(prev + 6, filteredListings.length));
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => observer.disconnect();
  }, [filteredListings, visibleCount]);

  const displayedListings = useMemo(() => {
    return filteredListings.slice(0, visibleCount);
  }, [filteredListings, visibleCount]);

  // Real-time overlay premium vehicles over Bab-e-Khyber background
  const overlayVehicle = useMemo(() => {
    return listings.find(l => l.verified && l.imageUrl) || listings[0];
  }, [listings]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setSearchQuery) setSearchQuery(searchVal);
    setTab('explore');
  };

  return (
    <motion.div
      variants={pageTransitions}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-main)] overflow-x-hidden font-sans pb-24"
    >
      {/* 1. Immersive Auto Choice Hero Section */}
      <AutoChoiceHero 
        lang={lang} 
        onSearch={(query) => {
          if (setSearchQuery) setSearchQuery(query);
        }} 
        setTab={setTab} 
      />



      {/* 3. Responsive Dual View Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-display font-black tracking-tight flex items-center gap-2">
              <Sparkles className="text-orange-500" />
              <span>{isUrdu ? 'دستیاب لسٹنگز' : 'Popular Cars'}</span>
            </h2>
            <p className={`text-xs font-mono mt-1 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
              Showing {filteredListings.length} Premium verified vehicles from verified Peshawar showrooms.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {(['All', 'New', 'Used'] as const).map((cond) => (
              <button
                key={cond}
                onClick={() => setFilterCondition(cond)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer border ${
                  filterCondition === cond
                    ? 'bg-orange-500 text-[var(--color-text-header)] border-orange-500 shadow-lg shadow-orange-500/20'
                    : 'bg-slate-900/40 text-gray-300 border-[var(--color-border-main)] hover:border-[var(--color-border-main)] hover:bg-slate-900/60'
                }`}
              >
                {cond === 'All' ? (isUrdu ? 'تمام گاڑیاں' : 'All Stock') : cond}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Infinite Scroll / Responsive Masonry Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedListings.map((car) => {
            const dealer = dealers.find(d => d.id === car.dealerId);
            return (
              <div key={car.id} className="relative group">
                {/* Handle Video Playback support directly inside the feed */}
                {car.videoUrl && (
                  <div className="absolute top-3 left-3 z-30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlayingVideoId(playingVideoId === car.id ? null : car.id);
                      }}
                      className="w-8 h-8 rounded-full bg-orange-500/90 text-[var(--color-text-header)] flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer border border-white/20"
                    >
                      <Film size={14} />
                    </button>
                  </div>
                )}

                {playingVideoId === car.id && car.videoUrl ? (
                  <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-black border border-[var(--color-border-main)] h-[220px]">
                    <video
                      src={car.videoUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      className="w-full h-full object-cover"
                      playsInline
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 rounded-lg bg-black/60 text-[var(--color-text-header)] text-xs hover:bg-black/80"
                      >
                        {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      </button>
                      <button
                        onClick={() => setPlayingVideoId(null)}
                        className="p-1.5 rounded-lg bg-red-600 text-[var(--color-text-header)] text-[10px] font-black hover:bg-red-500"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <VehicleListingCard
                    car={car}
                    dealer={dealer}
                    onSelect={() => onSelectListing(car)}
                    onToggleFavorite={onToggleFavorite}
                    isFavorite={favoritesList.some(f => f.id === car.id)}
                  />
                )}
              </div>
            );
          })}

          {filteredListings.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-[var(--color-border-main)] rounded-3xl bg-[var(--color-bg-secondary)]">
              <Zap className="w-12 h-12 mx-auto text-orange-500 mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-1">No Vehicles Found</h3>
              <p className="text-[var(--color-text-muted)] text-xs">Try adjusting your search filters or check back later.</p>
            </div>
          )}
        </div>

        {/* Infinite Scroll Trigger element */}
        {visibleCount < filteredListings.length && (
          <div ref={loadMoreRef} className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
          </div>
        )}
      </div>

      {/* 4. Elegant floating action call (Modern Separated Stack) */}
      <div className="fixed bottom-24 right-4 md:right-6 z-40 flex flex-col gap-4 items-end">
        <motion.a
          variants={hoverEffects.lift}
          whileHover="whileHover"
          whileTap="whileTap"
          href="https://wa.me/923159085086"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-[#25D366] hover:bg-[#20bd5a] text-[var(--color-text-header)] rounded-full p-4 shadow-2xl flex items-center justify-center cursor-pointer border border-[#25D366]/50 shadow-[#25D366]/30 transition-all duration-300 w-14 h-14 md:w-auto md:h-auto md:px-5 md:py-3.5 md:rounded-2xl"
        >
          {/* Mobile Icon */}
          <div className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.061-.175-.299-.018-.461.13-.611.134-.135.304-.35.45-.525.148-.175.197-.299.297-.499.1-.2.05-.375-.025-.524-.075-.15-.67-1.62-.92-2.22-.24-.582-.486-.505-.67-.514-.173-.008-.37-.01-.569-.01-.197 0-.522.074-.795.373-.273.298-1.043 1.02-1.043 2.486s1.068 2.88 1.217 3.08c.148.199 2.096 3.2 5.077 4.487.71.306 1.265.489 1.696.625.713.226 1.363.194 1.874.118.572-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          {/* Desktop Icon + Text */}
          <div className="hidden md:flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.061-.175-.299-.018-.461.13-.611.134-.135.304-.35.45-.525.148-.175.197-.299.297-.499.1-.2.05-.375-.025-.524-.075-.15-.67-1.62-.92-2.22-.24-.582-.486-.505-.67-.514-.173-.008-.37-.01-.569-.01-.197 0-.522.074-.795.373-.273.298-1.043 1.02-1.043 2.486s1.068 2.88 1.217 3.08c.148.199 2.096 3.2 5.077 4.487.71.306 1.265.489 1.696.625.713.226 1.363.194 1.874.118.572-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="font-black text-sm uppercase tracking-wide">WhatsApp</span>
          </div>
          
          {/* Tooltip for Mobile */}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 text-[var(--color-text-header)] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none md:hidden shadow-xl border border-[var(--color-border-main)]">
            WhatsApp Support
          </span>
        </motion.a>
        
        <motion.button
          variants={hoverEffects.lift}
          whileHover="whileHover"
          whileTap="whileTap"
          onClick={() => setTab('sell')}
          className="bg-orange-500 hover:bg-orange-600 text-[var(--color-text-header)] rounded-full p-4 shadow-2xl hidden md:flex items-center gap-2 cursor-pointer font-black text-sm uppercase border border-white/20 shadow-orange-500/20"
        >
          <PlusCircle size={20} />
          <span>Post Ad</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
