import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  SlidersHorizontal, 
  Calendar, 
  DollarSign, 
  Activity, 
  Building, 
  Check, 
  RotateCcw, 
  TrendingUp, 
  Video,
  ChevronRight,
  Gauge,
  Compass
} from 'lucide-react';
import { Dealer, CarListing, ActivityPost } from '../types';

interface HomeViewProps {
  dealers: Dealer[];
  listings: CarListing[];
  setTab: (tab: string) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  onSelectDealer: (id: string) => void;
  onSelectListing: (listing: CarListing) => void;
}

export default function HomeView({
  dealers,
  listings,
  setTab,
  setSelectedCategory,
  setSearchQuery,
  onSelectDealer,
  onSelectListing,
}: HomeViewProps) {
  // Real-time search filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterMake, setFilterMake] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterPriceRange, setFilterPriceRange] = useState<number>(35000000); // 3.5 Crore PKR Default max
  const [filterTransmission, setFilterTransmission] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Sync Categories with global triggers
  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    setSelectedCategory(category);
  };

  // Extract dynamically unique Makes and Cities from the current live products
  const uniqueMakes = ['All', ...new Set(listings.map(l => l.make))];
  const uniqueCities = ['All', 'Peshawar', 'Lahore', 'Karachi', 'Islamabad'];

  // 1. Dynamic filtering pipeline
  const filteredListings = listings.filter((car) => {
    // Only display approved items
    if (car.approved === false) return false;

    // Category filter
    if (activeCategory !== 'All') {
      const matchTag = car.tags && car.tags.some(t => t.toLowerCase() === activeCategory.toLowerCase());
      const matchFuel = car.fuelType?.toLowerCase() === activeCategory.toLowerCase();
      if (!matchTag && !matchFuel) return false;
    }

    // Keyword search
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      const matchTitle = car.title.toLowerCase().includes(q);
      const matchMake = car.make.toLowerCase().includes(q);
      const matchModel = car.model.toLowerCase().includes(q);
      const matchDesc = car.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchMake && !matchModel && !matchDesc) return false;
    }

    // Make dropdown filter
    if (filterMake !== 'All' && car.make !== filterMake) return false;

    // City location filter
    if (filterCity !== 'All') {
      const listingDealer = dealers.find(d => d.id === car.dealerId);
      const dealerLoc = listingDealer?.location || '';
      if (!dealerLoc.toLowerCase().includes(filterCity.toLowerCase())) return false;
    }

    // Max Price filter
    if (car.price > filterPriceRange) return false;

    // Transmission type
    if (filterTransmission !== 'All' && car.transmission !== filterTransmission) return false;

    return true;
  });

  // Sort logic - "Newly Uploaded" priority
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'Newest') {
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    } else if (sortBy === 'PriceLow') {
      return a.price - b.price;
    } else if (sortBy === 'PriceHigh') {
      return b.price - a.price;
    }
    return 0;
  });

  // Collect and aggregate real-time activity feeds from all dealers
  const aggregatedActivities = dealers.flatMap((dealer) => {
    return (dealer.activityFeed || []).map((feed) => ({
      ...feed,
      dealerId: dealer.id,
      dealerName: dealer.name,
      dealerAvatar: dealer.avatarUrl,
      dealerLetter: dealer.avatarLetter
    }));
  });

  // Reset all sidebar states to clear the query
  const handleResetFilters = () => {
    setFilterSearch('');
    setFilterMake('All');
    setFilterCity('All');
    setFilterPriceRange(35000000);
    setFilterTransmission('All');
    setActiveCategory('All');
    setSortBy('Newest');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Dynamic Header Badge banner */}
      <div className="flex items-center gap-2 bg-[#0a1120] border border-white/5 py-3 px-5 rounded-2xl w-full">
        <Sparkles size={16} className="text-[#38BDF8] animate-pulse" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/90">
          CarBazar-360 Live Engine: <span className="text-orange-400 font-extrabold">{listings.length} verified products</span> online. Zero dummy indicators.
        </span>
      </div>

      {/* Hero Welcome banner */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#121c30] via-[#080d19] to-[#121c30] p-6 md:p-10 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#38BDF8] opacity-5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-black tracking-widest text-[#38BDF8] uppercase bg-[#1e293b]/50 px-3 py-1 rounded-full border border-white/10">
            ★ ENTERPRISE AUTOMOTIVE PLATFORM
          </span>
          <h2 className="text-2xl md:text-4xl font-sans font-black uppercase text-white tracking-tight leading-none">
            Next-Gen Pakistan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-orange-400">Automotive Hub</span>
          </h2>
          <p className="text-white/60 text-xs md:text-sm max-w-2xl font-sans leading-relaxed">
            Directly connect with premium physical showrooms like <span className="text-white font-bold underline decoration-[#38BDF8]">Auto Choice Peshawar</span> and vetted private sellers. Filter listings instantly, view video walkarounds, and transact with absolute safety.
          </p>
        </div>
      </section>

      {/* CORE 3-COLUMN ARCHITECTURE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Community, Live Discovery & Clickable Dealers */}
        {/* ========================================================= */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card 1: Live Activities feed */}
          <div className="bg-[#121a2a]/95 border border-[#1e293b] rounded-2xl p-4 space-y-4 shadow-xl">
            <h3 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Activity size={14} className="text-[#38BDF8] animate-pulse" /> Live Activity Feed
            </h3>
            
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {aggregatedActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[10px] text-gray-500 font-mono">No recent activity found.</p>
                </div>
              ) : (
                aggregatedActivities.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => onSelectDealer(act.dealerId)}
                    className="w-full text-left bg-[#080d19] border border-white/5 hover:border-orange-500/30 p-2.5 rounded-xl block transition-all group duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono text-[8px] uppercase font-bold">
                        {act.badge}
                      </span>
                      <span className="text-[8px] text-gray-500 font-mono">{act.timestamp}</span>
                    </div>

                    <h4 className="text-white font-bold text-xs truncate group-hover:text-[#38BDF8] transition-colors uppercase tracking-tight">
                      {act.title}
                    </h4>
                    <p className="text-white/60 text-[10px] line-clamp-2 mt-1 leading-relaxed">
                      {act.description}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[9px] font-mono text-[#38BDF8]">
                      <span className="text-gray-400 truncate max-w-[120px] font-sans">
                        @{act.dealerName}
                      </span>
                      <span className="font-bold underline text-orange-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[8px] uppercase">
                        View Store <ChevronRight size={10} />
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Card 2: Clickable verified dealerships */}
          <div className="bg-[#121a2a]/95 border border-[#1e293b] rounded-2xl p-4 space-y-4 shadow-xl">
            <h3 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Building size={14} className="text-[#38BDF8]" /> Verified Showrooms
            </h3>

            <div className="space-y-2.5">
              {dealers.map((dl) => (
                <button
                  key={dl.id}
                  onClick={() => onSelectDealer(dl.id)}
                  className="w-full text-left bg-[#080d19] border border-white/5 hover:border-[#38BDF8]/40 hover:bg-white/[0.02] p-2.5 rounded-xl flex items-center gap-3 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                    {dl.avatarUrl ? (
                      <img
                        src={dl.avatarUrl}
                        alt={dl.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xs font-black text-white">{dl.avatarLetter}</span>
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate group-hover:text-[#38BDF8] transition-colors">
                      {dl.name}
                    </h4>
                    <span className="text-[9px] text-[#22c55e] font-mono flex items-center gap-1 mt-0.5">
                      ● Active Storefront
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-[#38BDF8] transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: Interactive Marketplace Product Feed */}
        {/* ========================================================= */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main category Selector slider */}
          <div className="bg-[#121a2a]/90 border border-[#1e293b] p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-lg">
            {['All', 'SUV', 'Sedan', 'Electric', 'Luxury'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryPress(cat)}
                className={`px-4.5 py-2 rounded-xl text-[10px] font-mono font-extrabold uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer select-none ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-900/30'
                    : 'bg-[#080d19] text-gray-400 border border-white/5 hover:border-[#38BDF8] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Feed Title & Sorter Control Bar */}
          <div className="flex justify-between items-center bg-[#0a1120] border border-white/5 px-4 py-2.5 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <Compass size={14} className="text-orange-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-[10px] font-black uppercase text-white font-mono tracking-wider">
                {sortedListings.length} results <span className="text-[#38BDF8]">matched</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-500 font-mono hidden sm:inline">SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#121a2a] border border-[#1e293b] text-white font-mono text-[9px] uppercase font-bold py-1 px-2.5 rounded-lg focus:outline-none focus:border-[#38BDF8] cursor-pointer"
              >
                <option value="Newest">🔥 Newly Uploaded</option>
                <option value="PriceLow">🪙 Price: Low to High</option>
                <option value="PriceHigh">📈 Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Listings grid board */}
          {sortedListings.length === 0 ? (
            <div className="bg-[#121a2a] border border-[#1e293b] rounded-3xl p-12 text-center space-y-4">
              <SlidersHorizontal className="mx-auto text-gray-600 animate-bounce" size={32} />
              <div className="space-y-1">
                <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">No matching inventory matches</h4>
                <p className="text-gray-500 text-[11px] max-w-sm mx-auto">Try broadening your active search parameters, resetting the price threshold slider, or changing categories.</p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4.5 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-orange-600 shadow"
              >
                Refresh Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {sortedListings.map((car) => {
                // Find associated dealer logo/avatar
                const carDealer = dealers.find(d => d.id === car.dealerId);
                const isAutoChoiceLogo = carDealer?.id === 'auto-choice-peshawar';
                
                return (
                  <div
                    key={car.id}
                    onClick={() => onSelectListing(car)}
                    className="bg-[#121a2a] border border-[#1e293b] hover:border-[#38BDF8]/60 rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between"
                  >
                    {/* Media viewport container */}
                    <div className="relative h-44 bg-[#080d19] overflow-hidden">
                      <img
                        alt={car.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        src={car.imageUrl}
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Interactive certification badge overlay */}
                      {car.verified && (
                        <div className="absolute top-2.5 left-2.5 bg-[#080d19]/90 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-lg text-white text-[8px] font-mono font-extrabold uppercase flex items-center gap-1 shadow-lg">
                          <ShieldCheck size={10} className="text-[#38BDF8]" /> Verified
                        </div>
                      )}

                      {/* Display model year overlay */}
                      <div className="absolute bottom-2.5 right-2 text-white bg-[#080d19]/90 border border-[#1e293b] text-[8px] font-mono font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                        {car.year} Model
                      </div>
                    </div>

                    {/* Meta descriptions and details wrapper */}
                    <div className="p-4 space-y-3.5 flex-grow flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[9px] text-[#38BDF8] font-mono uppercase font-black truncate max-w-[120px]">
                            {car.make} • {car.model}
                          </span>
                          {carDealer && (
                            <span className="text-[8px] text-gray-500 font-sans truncate bg-[#080d19] border border-white/5 px-2 py-0.5 rounded">
                              {carDealer.name}
                            </span>
                          )}
                        </div>

                        <h3 className="text-white text-xs font-bold uppercase tracking-tight truncate group-hover:text-[#38BDF8] transition-colors leading-tight">
                          {car.title}
                        </h3>

                        {/* Interactive highlights summary */}
                        <div className="flex items-center gap-1.5 text-[9px] text-white/50 font-mono uppercase flex-wrap">
                          <span className="bg-[#080d19] px-2 py-0.5 rounded flex items-center gap-1">
                            <Gauge size={10} className="text-[#38BDF8]" /> {car.mileage.toLocaleString()} KM
                          </span>
                          <span className="bg-[#080d19] px-2 py-0.5 rounded">{car.fuelType}</span>
                          <span className="bg-[#080d19] px-2 py-0.5 rounded">{car.transmission}</span>
                        </div>
                      </div>

                      {/* Line partition */}
                      <div className="pt-2 border-t border-white/5 flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono uppercase tracking-widest text-gray-500">Valuation</span>
                          <span className="text-sm font-black text-orange-400">
                            Rs. {car.price.toLocaleString()}
                          </span>
                        </div>

                        <div className="bg-[#080d19] border border-white/5 group-hover:bg-[#38BDF8]/20 group-hover:text-[#38BDF8] group-hover:border-[#38BDF8]/40 p-2 rounded-lg transition-all">
                          <Eye size={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Interactive Deep Search & Sticky Refiner */}
        {/* ========================================================= */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          
          <div className="bg-[#121a2a]/95 border border-[#1e293b] rounded-2xl p-4.5 space-y-5 shadow-xl">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#38BDF8]" /> Search & Refine
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-gray-500 hover:text-white transition-colors text-[9px] font-mono font-bold flex items-center gap-0.5 bg-[#080d19] px-2 py-1 rounded-lg border border-white/5"
                title="Reset active query state"
              >
                <RotateCcw size={10} /> Reset
              </button>
            </div>

            {/* Selector: Custom Text query */}
            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Keywords Input:</label>
              <div className="bg-[#080d19] border border-[#1e293b] p-2 rounded-xl flex items-center gap-2">
                <Search size={12} className="text-gray-600" />
                <input
                  type="text"
                  placeholder="e.g. Turbo, White, Peshawar..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="bg-transparent border-none text-[11px] text-white placeholder-gray-700 w-full focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Selector: Make Select */}
            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Manufacturer Brand:</label>
              <select
                value={filterMake}
                onChange={(e) => setFilterMake(e.target.value)}
                className="w-full bg-[#080d19] border border-[#1e293b] text-white font-mono text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#38BDF8] cursor-pointer block"
              >
                {uniqueMakes.map((mk) => (
                  <option key={mk} value={mk}>
                    {mk === 'All' ? '🌐 All Brands / Makers' : mk.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector: City selector */}
            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">City Location KPK/NWD:</label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full bg-[#080d19] border border-[#1e293b] text-white font-mono text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#38BDF8] cursor-pointer block"
              >
                {uniqueCities.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct === 'All' ? '🗺 Nationwide (All)' : ct}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector: Live Price range slide */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-mono">
                <span className="text-gray-400 font-bold uppercase tracking-wider">MAX BUDGET VALUE:</span>
                <span className="text-orange-400 font-extrabold uppercase">Rs. {(filterPriceRange / 100000).toLocaleString()} Lac</span>
              </div>
              <input
                type="range"
                min={2000000}
                max={50000000}
                step={500000}
                value={filterPriceRange}
                onChange={(e) => setFilterPriceRange(parseInt(e.target.value))}
                className="w-full h-1 bg-[#080d19] rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[8px] font-mono text-gray-600">
                <span>20 Lac</span>
                <span>5 Crore PKR</span>
              </div>
            </div>

            {/* Selector: Transmission Switch */}
            <div className="space-y-2">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Transmission Gearbox:</label>
              <div className="grid grid-cols-3 bg-[#080d19] p-1 rounded-xl border border-[#1e293b] text-[9px] font-mono font-bold leading-normal">
                {['All', 'Automatic', 'Manual'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterTransmission(mode)}
                    className={`py-1.5 rounded-lg text-center transition-all cursor-pointer select-none ${
                      filterTransmission === mode
                        ? 'bg-[#38BDF8] text-black shadow-md'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {mode === 'All' ? 'ALL' : mode.substring(0, 4).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual reassurance stamp */}
            <div className="bg-[#080d19] p-3 rounded-xl border border-white/5 text-center flex flex-col items-center gap-1.5 select-none">
              <ShieldCheck size={14} className="text-[#38BDF8] animate-pulse" />
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-white/80">Real-Time Sync Ready</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
