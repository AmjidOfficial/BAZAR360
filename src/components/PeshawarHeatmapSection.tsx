import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Flame, 
  Search, 
  TrendingUp, 
  Filter, 
  Eye, 
  Compass, 
  Activity, 
  Zap, 
  Car, 
  Layers,
  ChevronRight,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { CarListing } from '../types';

interface HeatmapZone {
  id: string;
  name: string;
  urduName: string;
  description: string;
  xPercent: number; // Position on SVG/Canvas map (0 - 100)
  yPercent: number;
  searchVolume: number; // Monthly / daily search queries count
  surgeMultiplier: number; // e.g., 2.4x
  topCategory: 'SUV' | 'Sedan' | 'Hatchback' | 'Bikes' | 'Commercial';
  topModels: string[];
  avgPriceRangePKR: string;
  intensity: 'critical' | 'high' | 'moderate'; // critical = red, high = orange, moderate = cyan
  buyerLeadsToday: number;
}

const PESHAWAR_ZONES: HeatmapZone[] = [
  {
    id: 'ring-road',
    name: 'Ring Road Showroom Belt',
    urduName: 'رنگ روڈ شو روم مارکیٹ',
    description: 'Peshawar\'s largest mega-showroom cluster. Massive demand for 4x4 SUVs, Hilux Revo & Toyota Fortuner.',
    xPercent: 68,
    yPercent: 32,
    searchVolume: 14820,
    surgeMultiplier: 3.2,
    topCategory: 'SUV',
    topModels: ['Toyota Fortuner Legender', 'Hilux Revo Rocco', 'Land Cruiser V8'],
    avgPriceRangePKR: '1.2 Cr - 3.8 Cr PKR',
    intensity: 'critical',
    buyerLeadsToday: 342
  },
  {
    id: 'hayatabad-phase',
    name: 'Hayatabad Motor Hub (Phase 3 & 5)',
    urduName: 'حیات آباد فیز 3 اور 5',
    description: 'High-end residential buyer zone. Peak searches for pristine automatic sedans & imported hybrid crossover SUVs.',
    xPercent: 28,
    yPercent: 64,
    searchVolume: 12450,
    surgeMultiplier: 2.8,
    topCategory: 'SUV',
    topModels: ['Vezel Hybrid', 'Honda Civic RS', 'Hyundai Tucson', 'Kia Sportage'],
    avgPriceRangePKR: '65 Lac - 1.4 Cr PKR',
    intensity: 'critical',
    buyerLeadsToday: 289
  },
  {
    id: 'university-road',
    name: 'University Road Motor Corridor',
    urduName: 'یونیورسٹی روڈ آٹو مارکیٹ',
    description: 'High traffic educational & commercial hub. High search density for daily commuter sedans & 660cc Japanese mini cars.',
    xPercent: 48,
    yPercent: 48,
    searchVolume: 9840,
    surgeMultiplier: 2.1,
    topCategory: 'Sedan',
    topModels: ['Honda Civic Oriel', 'Toyota Corolla Grande', 'Alto VXR'],
    avgPriceRangePKR: '35 Lac - 85 Lac PKR',
    intensity: 'high',
    buyerLeadsToday: 215
  },
  {
    id: 'saddar-bazar',
    name: 'Saddar & Khyber Bazar Zone',
    urduName: 'صدر اور خیبر بازار',
    description: 'Downtown commercial core. Strong demand for economical hatchbacks & compact city parking vehicles.',
    xPercent: 58,
    yPercent: 58,
    searchVolume: 8210,
    surgeMultiplier: 1.8,
    topCategory: 'Hatchback',
    topModels: ['Suzuki Alto VXR', 'Toyota Vitz', 'Cultus VXL'],
    avgPriceRangePKR: '22 Lac - 42 Lac PKR',
    intensity: 'high',
    buyerLeadsToday: 178
  },
  {
    id: 'gulberg-auto',
    name: 'Gulberg Auto Market Sector',
    urduName: 'گلبدگ آٹو سیکٹر',
    description: 'Verified pre-owned car hub with active dealer trading. Focus on budget sedans and verified inspection cars.',
    xPercent: 62,
    yPercent: 70,
    searchVolume: 6730,
    surgeMultiplier: 1.6,
    topCategory: 'Sedan',
    topModels: ['Corolla GLi', 'Honda City Aspire', 'Suzuki Swift'],
    avgPriceRangePKR: '28 Lac - 55 Lac PKR',
    intensity: 'moderate',
    buyerLeadsToday: 142
  },
  {
    id: 'gt-road',
    name: 'G.T. Road Chamkani Terminal',
    urduName: 'جی ٹی روڈ چمکنی گو ڈاؤنز',
    description: 'Logistics and commercial gateway. Heavy search volume for commercial pickups, Shehzore, and Hilux single cabs.',
    xPercent: 82,
    yPercent: 42,
    searchVolume: 5120,
    surgeMultiplier: 1.4,
    topCategory: 'Commercial',
    topModels: ['Hyundai Shehzore', 'Suzuki Ravi', 'Hilux Single Cab'],
    avgPriceRangePKR: '18 Lac - 48 Lac PKR',
    intensity: 'moderate',
    buyerLeadsToday: 98
  },
  {
    id: 'charsadda-road',
    name: 'Charsadda Road Commercial Hub',
    urduName: 'چارسدہ روڈ موٹر فلیٹ',
    description: 'North-East suburban belt. High volume of motorcycle searches, local 70cc/125cc bikes, and low-budget family cars.',
    xPercent: 72,
    yPercent: 20,
    searchVolume: 4950,
    surgeMultiplier: 1.3,
    topCategory: 'Bikes',
    topModels: ['Honda CG125', 'Yamaha YBR125', 'Suzuki Mehran'],
    avgPriceRangePKR: '1.2 Lac - 18 Lac PKR',
    intensity: 'moderate',
    buyerLeadsToday: 86
  }
];

interface PeshawarHeatmapSectionProps {
  listings: CarListing[];
  onSelectCategory?: (category: string) => void;
  onSearchKeyword?: (query: string) => void;
  onOpenExplorer?: () => void;
}

export const PeshawarHeatmapSection: React.FC<PeshawarHeatmapSectionProps> = ({
  listings,
  onSelectCategory,
  onSearchKeyword,
  onOpenExplorer
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | 'peak'>('24h');
  const [activeZone, setActiveZone] = useState<HeatmapZone>(PESHAWAR_ZONES[0]);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Category filters
  const categories = ['All', 'SUV', 'Sedan', 'Hatchback', 'Bikes', 'Commercial'];

  // Filtered zones based on selected category
  const filteredZones = useMemo(() => {
    if (selectedCategoryFilter === 'All') return PESHAWAR_ZONES;
    return PESHAWAR_ZONES.filter(z => z.topCategory === selectedCategoryFilter);
  }, [selectedCategoryFilter]);

  // Total stats summary
  const totalHeatSearches = useMemo(() => {
    const base = PESHAWAR_ZONES.reduce((sum, z) => sum + z.searchVolume, 0);
    if (selectedTimeframe === '7d') return Math.round(base * 6.8);
    if (selectedTimeframe === 'peak') return Math.round(base * 0.45);
    return base;
  }, [selectedTimeframe]);

  const activeHotspotCount = PESHAWAR_ZONES.filter(z => z.intensity === 'critical').length;

  return (
    <div className="w-full my-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Flame size={12} className="animate-pulse text-orange-500" />
                Live Buyer Radar • Peshawar Engine
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Activity size={10} className="animate-spin" />
                Real-Time Spatial Search Visualizer
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text-header)] tracking-tight font-display">
              Peshawar Vehicle Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400">Heatmap & Interest Zones</span>
            </h2>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              Real-time spatial visualization of buyer search surges, high-demand car models, and vehicle category density across key Peshawar showroom hubs.
            </p>
          </div>

          {/* TIMEFRAME SELECTOR & OVERVIEW METRICS */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-bg-secondary/90 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setSelectedTimeframe('24h')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedTimeframe === '24h' 
                    ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20' 
                    : 'text-text-muted hover:text-[var(--color-text-header)]'
                }`}
              >
                Live 24h
              </button>
              <button
                onClick={() => setSelectedTimeframe('7d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedTimeframe === '7d' 
                    ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20' 
                    : 'text-text-muted hover:text-[var(--color-text-header)]'
                }`}
              >
                7 Days Trend
              </button>
              <button
                onClick={() => setSelectedTimeframe('peak')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedTimeframe === 'peak' 
                    ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20' 
                    : 'text-text-muted hover:text-[var(--color-text-header)]'
                }`}
              >
                Peak Hours
              </button>
            </div>

            <div className="flex items-center gap-4 bg-bg-secondary/80 border border-white/10 px-4 py-2 rounded-xl text-xs font-mono">
              <div>
                <span className="text-text-muted uppercase tracking-widest text-[9px] block">Total Queries</span>
                <span className="font-black text-[var(--color-text-header)] text-sm">{totalHeatSearches.toLocaleString()}</span>
              </div>
              <div className="w-px h-6 bg-white/10"></div>
              <div>
                <span className="text-text-muted uppercase tracking-widest text-[9px] block">Surge Hubs</span>
                <span className="font-black text-orange-400 text-sm flex items-center gap-1">
                  <Flame size={12} /> {activeHotspotCount} Zones
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <span className="text-xs font-mono text-text-muted uppercase tracking-wider flex items-center gap-1.5 shrink-0 mr-2">
            <Filter size={13} className="text-cyan-400" /> Filter Sector Demand:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategoryFilter === cat
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'bg-bg-secondary/60 border border-white/5 text-text-muted hover:text-[var(--color-text-header)] hover:border-white/20'
              }`}
            >
              {cat === 'SUV' && <span className="w-2 h-2 rounded-full bg-orange-400"></span>}
              {cat === 'Sedan' && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
              {cat === 'Hatchback' && <span className="w-2 h-2 rounded-full bg-[var(--color-accent-main)]"></span>}
              {cat}
            </button>
          ))}
        </div>

        {/* MAIN HEATMAP CONTAINER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 7 COLS: THE INTERACTIVE GEOSPATIAL HEATMAP MAP CANVAS */}
          <div className="lg:col-span-7 bg-bg-primary/90 border border-white/10 rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-2xl group">
            
            {/* Map Grid Background Graphics */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(56,189,248,0.1)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60"></div>
            
            {/* Top Bar Indicators */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <Compass size={14} className="text-cyan-400 animate-spin-slow" />
                <span className="font-bold uppercase tracking-wider">PESHAWAR METROPOLITAN AUTOMOTIVE RADAR</span>
              </div>
              
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Critical Surge
                </span>
                <span className="flex items-center gap-1 text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> High Volume
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Moderate
                </span>
              </div>
            </div>

            {/* THE MAP CANVAS STAGE */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-bg-secondary/80 rounded-2xl border border-white/10 overflow-hidden select-none">
              
              {/* Stylized Peshawar Topographical SVG Map Overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-30 stroke-cyan-500/20 fill-none pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Main Arterials (Ring Road Loop & G.T. Road) */}
                <path d="M 10 30 Q 50 10 90 40 Q 80 85 20 75 Z" strokeWidth="0.8" strokeDasharray="2 2" />
                <path d="M 5 50 L 95 45" strokeWidth="1.2" stroke="rgba(56,189,248,0.3)" />
                <path d="M 50 5 L 50 95" strokeWidth="0.8" stroke="rgba(249,115,22,0.2)" />
                <path d="M 25 65 L 75 25" strokeWidth="0.8" stroke="rgba(239,68,68,0.2)" />
                {/* Sector Outlines */}
                <circle cx="28" cy="64" r="14" strokeWidth="0.5" stroke="rgba(249,115,22,0.3)" fill="rgba(249,115,22,0.03)" />
                <circle cx="68" cy="32" r="18" strokeWidth="0.5" stroke="rgba(239,68,68,0.3)" fill="rgba(239,68,68,0.04)" />
                <circle cx="48" cy="48" r="12" strokeWidth="0.5" stroke="rgba(56,189,248,0.3)" fill="rgba(56,189,248,0.03)" />
              </svg>

              {/* DYNAMIC HEAT SPREAD BLOBS */}
              {PESHAWAR_ZONES.map((zone) => {
                const isSelected = activeZone.id === zone.id;
                const isFiltered = filteredZones.some(z => z.id === zone.id);
                
                if (!isFiltered) return null;

                let blobColor = 'from-cyan-500/30 via-cyan-500/10 to-transparent';
                let ringColor = 'border-cyan-400/50 bg-cyan-500';
                let pulseColor = 'bg-cyan-400';

                if (zone.intensity === 'critical') {
                  blobColor = 'from-red-500/45 via-orange-500/20 to-transparent';
                  ringColor = 'border-red-500/70 bg-red-500';
                  pulseColor = 'bg-red-500';
                } else if (zone.intensity === 'high') {
                  blobColor = 'from-orange-500/40 via-amber-500/15 to-transparent';
                  ringColor = 'border-orange-500/60 bg-orange-500';
                  pulseColor = 'bg-orange-400';
                }

                return (
                  <React.Fragment key={zone.id}>
                    {/* Glowing Heat Radiance Circle */}
                    <div
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial ${blobColor} transition-all duration-500 pointer-events-none ${
                        isSelected ? 'w-48 h-48 opacity-100 scale-110' : 'w-32 h-32 opacity-70'
                      }`}
                      style={{ left: `${zone.xPercent}%`, top: `${zone.yPercent}%` }}
                    />

                    {/* INTERACTIVE HOTSPOT PIN BEACON */}
                    <button
                      onClick={() => setActiveZone(zone)}
                      onMouseEnter={() => setHoveredZoneId(zone.id)}
                      onMouseLeave={() => setHoveredZoneId(null)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-all duration-300 focus:outline-none ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                      }`}
                      style={{ left: `${zone.xPercent}%`, top: `${zone.yPercent}%` }}
                    >
                      {/* Pulse Ring */}
                      <span className={`absolute -inset-2 rounded-full ${pulseColor} opacity-40 animate-ping`}></span>
                      
                      {/* Main Node Dot */}
                      <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${ringColor} text-slate-950 font-black font-mono text-[10px] shadow-xl shadow-black/80`}>
                        {zone.surgeMultiplier.toFixed(1)}x
                      </div>

                      {/* Tooltip Label Pill on Hover or Selection */}
                      <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap bg-bg-secondary/95 border border-white/20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-[var(--color-text-header)] shadow-2xl transition-all ${
                        isSelected || hoveredZoneId === zone.id ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 pointer-events-none'
                      }`}>
                        <div className="flex items-center gap-1">
                          <MapPin size={10} className="text-orange-400" />
                          <span>{zone.name.split(' ')[0]} {zone.name.split(' ')[1]}</span>
                          <span className="text-orange-400 font-extrabold">({zone.searchVolume.toLocaleString()})</span>
                        </div>
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}

              {/* Map Footer Disclaimer Ticker */}
              <div className="absolute bottom-3 left-3 right-3 bg-bg-primary/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent-main)] animate-pulse"></span>
                  Live Peshawar Search Aggregator Active
                </span>
                <span className="text-cyan-400 font-bold hidden sm:inline">Click Hotspot to Inspect Sector Analytics</span>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: SELECTED ZONE INSIGHTS & ACTION CARD */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeZone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Zone Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${
                        activeZone.intensity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        activeZone.intensity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {activeZone.intensity} Demand Surge ({activeZone.surgeMultiplier}x)
                      </span>
                      <span className="text-[10px] font-mono text-text-muted">{activeZone.topCategory} Corridor</span>
                    </div>
                    <h3 className="text-xl font-black text-[var(--color-text-header)] tracking-tight">{activeZone.name}</h3>
                    <p className="text-xs font-semibold text-cyan-400 font-sans mt-0.5">{activeZone.urduName}</p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                    <Flame size={24} className="animate-pulse" />
                  </div>
                </div>

                <p className="text-xs text-text-muted leading-relaxed">
                  {activeZone.description}
                </p>

                {/* METRICS GRID */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="bg-bg-primary/70 border border-white/5 p-3 rounded-2xl">
                    <span className="text-[9px] text-text-muted uppercase tracking-widest block mb-1">24h Search Volume</span>
                    <span className="text-lg font-black text-[var(--color-text-header)] flex items-center gap-1.5">
                      <Search size={14} className="text-cyan-400" />
                      {activeZone.searchVolume.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-bg-primary/70 border border-white/5 p-3 rounded-2xl">
                    <span className="text-[9px] text-text-muted uppercase tracking-widest block mb-1">Active Buyer Leads</span>
                    <span className="text-lg font-black text-[var(--color-accent-main)] flex items-center gap-1.5">
                      <TrendingUp size={14} />
                      {activeZone.buyerLeadsToday} Today
                    </span>
                  </div>
                </div>

                {/* TOP SEARCHED VEHICLES IN THIS SECTOR */}
                <div className="bg-bg-primary/70 border border-white/5 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <Car size={12} className="text-orange-400" /> Trending Models in Zone:
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{activeZone.avgPriceRangePKR}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {activeZone.topModels.map((model, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSearchKeyword?.(model);
                          onOpenExplorer?.();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-semibold text-text-main hover:text-[var(--color-text-header)] hover:border-orange-500/50 hover:bg-orange-500/10 transition-all flex items-center gap-1 group/btn"
                      >
                        <span>{model}</span>
                        <ArrowUpRight size={10} className="text-text-muted group-hover/btn:text-orange-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* QUICK ACTION BUTTONS */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      onSelectCategory?.(activeZone.topCategory);
                      onOpenExplorer?.();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search size={14} />
                    <span>Explore {activeZone.topCategory}s in {activeZone.name.split(' ')[0]}</span>
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PeshawarHeatmapSection;
