'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, X, RotateCcw, ArrowUpDown, Filter, Check } from 'lucide-react';
import { AnimatedVehicleCard } from './AnimatedVehicleCard';
import { getOptimizedUrl } from '../lib/cloudinaryService';

interface Vehicle {
  id: string;
  title?: string;
  make?: string;
  model?: string;
  year?: number | string;
  transmission?: string;
  fuelType?: string;
  condition?: string;
  price?: number;
  priceRaw?: number;
  imageUrl?: string;
  images?: string[];
  [key: string]: any;
}

interface ShowroomFilterableInventoryProps {
  inventory: Vehicle[];
}

export function ShowroomFilterableInventory({ inventory }: ShowroomFilterableInventoryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc'>('default');
  const [transmission, setTransmission] = useState<string>('all');
  const [minYear, setMinYear] = useState<string>('');
  const [maxYear, setMaxYear] = useState<string>('');
  const [minPriceLakh, setMinPriceLakh] = useState<string>('');
  const [maxPriceLakh, setMaxPriceLakh] = useState<string>('');

  // Extract available years for filter options
  const availableYears = useMemo(() => {
    const years = inventory
      .map((car) => Number(car.year))
      .filter((y) => !isNaN(y) && y > 1900)
      .sort((a, b) => b - a);
    return Array.from(new Set(years));
  }, [inventory]);

  // Extract helper for numeric price
  const getCarPrice = (car: Vehicle): number => {
    if (typeof car.price === 'number' && !isNaN(car.price)) return car.price;
    if (typeof car.priceRaw === 'number' && !isNaN(car.priceRaw)) return car.priceRaw;
    return 0;
  };

  // Active filter count logic
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (transmission !== 'all') count++;
    if (minYear !== '') count++;
    if (maxYear !== '') count++;
    if (minPriceLakh !== '') count++;
    if (maxPriceLakh !== '') count++;
    if (sortBy !== 'default') count++;
    return count;
  }, [transmission, minYear, maxYear, minPriceLakh, maxPriceLakh, sortBy]);

  // Filter and sort computation
  const filteredAndSortedInventory = useMemo(() => {
    let result = [...inventory];

    // Transmission Filter
    if (transmission !== 'all') {
      result = result.filter(
        (car) => car.transmission?.toLowerCase() === transmission.toLowerCase()
      );
    }

    // Year Filters
    if (minYear !== '') {
      const minY = Number(minYear);
      result = result.filter((car) => Number(car.year) >= minY);
    }
    if (maxYear !== '') {
      const maxY = Number(maxYear);
      result = result.filter((car) => Number(car.year) <= maxY);
    }

    // Price Filters (In Lakhs: 1 Lakh = 100,000 PKR)
    if (minPriceLakh !== '') {
      const minP = Number(minPriceLakh) * 100000;
      result = result.filter((car) => getCarPrice(car) >= minP);
    }
    if (maxPriceLakh !== '') {
      const maxP = Number(maxPriceLakh) * 100000;
      result = result.filter((car) => {
        const p = getCarPrice(car);
        return p > 0 && p <= maxP;
      });
    }

    // Sorting Logic
    if (sortBy === 'price-asc') {
      result.sort((a, b) => getCarPrice(a) - getCarPrice(b));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => getCarPrice(b) - getCarPrice(a));
    } else if (sortBy === 'year-desc') {
      result.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
    } else if (sortBy === 'year-asc') {
      result.sort((a, b) => Number(a.year || 0) - Number(b.year || 0));
    }

    return result;
  }, [inventory, transmission, minYear, maxYear, minPriceLakh, maxPriceLakh, sortBy]);

  const resetFilters = () => {
    setSortBy('default');
    setTransmission('all');
    setMinYear('');
    setMaxYear('');
    setMinPriceLakh('');
    setMaxPriceLakh('');
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Sort Bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-4 flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--color-text-header)] font-sans">
            Active Showroom Stock
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] font-mono">Real-time dealer vehicle inventory</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Count Badge */}
          <span className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-accent-main)] px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider shrink-0 shadow-sm">
            {filteredAndSortedInventory.length} / {inventory.length} UNITS
          </span>

          {/* Mobile & Desktop Slide-Out Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-brand-orange)] to-amber-500 hover:opacity-90 text-[var(--color-text-header)] font-sans font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            id="showroom-filter-btn"
          >
            <SlidersHorizontal size={15} />
            <span>Filter & Sort</span>
            {activeFilterCount > 0 && (
              <span className="bg-[var(--color-bg-primary)] text-[var(--color-brand-orange)] w-5 h-5 rounded-full text-[10px] font-mono font-black flex items-center justify-center border border-[var(--color-brand-orange)]/30">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Chips Preview */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-3 rounded-xl shadow-sm">
          <span className="text-[var(--color-text-muted)] text-[11px] font-bold uppercase mr-1">Active:</span>
          {sortBy !== 'default' && (
            <span className="bg-[var(--color-brand-orange)]/10 border border-[var(--color-brand-orange)]/30 text-[var(--color-brand-orange)] px-2.5 py-1 rounded-lg flex items-center gap-1">
              Sort: {sortBy === 'price-asc' ? 'Price ↑' : sortBy === 'price-desc' ? 'Price ↓' : sortBy === 'year-desc' ? 'Newest' : 'Oldest'}
              <button onClick={() => setSortBy('default')} className="hover:text-[var(--color-text-main)] cursor-pointer">
                <X size={12} />
              </button>
            </span>
          )}
          {transmission !== 'all' && (
            <span className="bg-[var(--color-brand-orange)]/10 border border-[var(--color-brand-orange)]/30 text-[var(--color-brand-orange)] px-2.5 py-1 rounded-lg flex items-center gap-1">
              {transmission}
              <button onClick={() => setTransmission('all')} className="hover:text-[var(--color-text-main)] cursor-pointer">
                <X size={12} />
              </button>
            </span>
          )}
          {(minYear || maxYear) && (
            <span className="bg-[var(--color-brand-orange)]/10 border border-[var(--color-brand-orange)]/30 text-[var(--color-brand-orange)] px-2.5 py-1 rounded-lg flex items-center gap-1">
              Year: {minYear || 'Any'} - {maxYear || 'Any'}
              <button onClick={() => { setMinYear(''); setMaxYear(''); }} className="hover:text-[var(--color-text-main)] cursor-pointer">
                <X size={12} />
              </button>
            </span>
          )}
          {(minPriceLakh || maxPriceLakh) && (
            <span className="bg-[var(--color-brand-orange)]/10 border border-[var(--color-brand-orange)]/30 text-[var(--color-brand-orange)] px-2.5 py-1 rounded-lg flex items-center gap-1">
              Price: {minPriceLakh ? `${minPriceLakh}L` : '0'} - {maxPriceLakh ? `${maxPriceLakh}L` : 'Any'}
              <button onClick={() => { setMinPriceLakh(''); setMaxPriceLakh(''); }} className="hover:text-[var(--color-text-main)] cursor-pointer">
                <X size={12} />
              </button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-orange)] text-[11px] underline ml-auto flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} /> Reset All
          </button>
        </div>
      )}

      {/* Vehicles Grid or Empty State */}
      {filteredAndSortedInventory.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-bg-secondary)] border border-dashed border-[var(--color-border-main)] rounded-3xl space-y-4 shadow-sm">
          <Filter className="w-10 h-10 text-[var(--color-text-muted)] mx-auto" />
          <p className="text-sm font-bold text-[var(--color-text-main)]">No Vehicles Match Your Selected Filters</p>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
            Try adjusting your year, price range, or transmission filters to view available vehicles.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-[var(--color-brand-orange)]/10 hover:bg-[var(--color-brand-orange)]/20 border border-[var(--color-brand-orange)]/30 text-[var(--color-brand-orange)] text-xs font-bold uppercase rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw size={14} /> Clear All Filters
          </button>
        </div>
      ) : (
        <motion.div
          id="showroom-inventory-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.04
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {filteredAndSortedInventory.map((car: Vehicle, idx: number) => {
            const rawP = getCarPrice(car);
            return (
              <AnimatedVehicleCard
                key={car.id}
                index={idx}
                className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl overflow-hidden hover:border-[var(--color-brand-orange)]/40 hover:shadow-lg transition-all duration-300 group flex flex-col h-full shadow-sm"
              >
                <div className="w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/10] bg-[var(--color-bg-tertiary)] relative overflow-hidden shrink-0">
                  {car.imageUrl || (car.images && car.images[0]) ? (
                    <img
                      src={getOptimizedUrl(car.imageUrl || car.images![0], {
                        width: 800,
                        height: 500,
                        crop: 'fill',
                        quality: 'auto',
                        format: 'auto',
                        watermark: false
                      })}
                      alt={car.title || 'Vehicle'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] font-mono text-xs">
                      No Vehicle Image Available
                    </div>
                  )}
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none z-10" />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-header)] px-2.5 py-1 rounded-md">
                      {car.condition || 'Used'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm md:text-base font-bold text-[var(--color-text-main)] tracking-tight line-clamp-1">
                      {car.title || `${car.make} ${car.model}`}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono">
                      {car.year} • {car.transmission || 'Automatic'} • {car.fuelType || 'Petrol'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border-main)]">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-mono block">
                        Price Demand
                      </span>
                      <span className="text-base font-extrabold text-[var(--color-brand-orange)]">
                        {rawP > 0 ? `PKR ${(rawP / 100000).toFixed(1)} Lakh` : 'Inquire'}
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-hover)] text-[var(--color-text-header)] font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm">
                      Inspect
                    </button>
                  </div>
                </div>
              </AnimatedVehicleCard>
            );
          })}
        </motion.div>
      )}

      {/* Slide-Out Mobile & Desktop Filter Menu Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Slide-Out Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[var(--color-bg-secondary)] border-l border-[var(--color-border-main)] text-[var(--color-text-main)] z-50 shadow-2xl flex flex-col overflow-hidden"
              id="showroom-mobile-filter-drawer"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[var(--color-border-main)] flex items-center justify-between bg-[var(--color-bg-tertiary)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-brand-orange)]/10 border border-[var(--color-brand-orange)]/20 text-[var(--color-brand-orange)] flex items-center justify-center">
                    <SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--color-text-main)] tracking-tight">Filter & Sort</h3>
                    <p className="text-[11px] text-[var(--color-text-muted)] font-mono">Showroom Inventory Filters</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
                  aria-label="Close Filter Menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body - Scrollable options */}
              <div className="flex-1 overflow-y-auto p-6 space-y-7">
                {/* 1. Sort Options */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-orange)] font-mono flex items-center gap-1.5">
                    <ArrowUpDown size={14} /> Sort By
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'default', label: 'Default / Featured' },
                      { id: 'price-asc', label: 'Price: Low to High' },
                      { id: 'price-desc', label: 'Price: High to Low' },
                      { id: 'year-desc', label: 'Year: Newest First' },
                      { id: 'year-asc', label: 'Year: Oldest First' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id as any)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          sortBy === opt.id
                            ? 'bg-[var(--color-brand-orange)]/10 border-[var(--color-brand-orange)] text-[var(--color-brand-orange)] shadow-sm'
                            : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-main)] text-[var(--color-text-main)] hover:border-[var(--color-text-muted)]/30'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.id && <Check size={14} className="text-[var(--color-brand-orange)]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Transmission Type */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-orange)] font-mono">
                    Transmission
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'Automatic', label: 'Automatic' },
                      { id: 'Manual', label: 'Manual' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTransmission(t.id)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          transmission.toLowerCase() === t.id.toLowerCase()
                            ? 'bg-[var(--color-brand-orange)]/10 border-[var(--color-brand-orange)] text-[var(--color-brand-orange)]'
                            : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-main)] text-[var(--color-text-main)] hover:border-[var(--color-text-muted)]/30'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Year Range Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-orange)] font-mono">
                    Model Year
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono block mb-1">Min Year</span>
                      <select
                        value={minYear}
                        onChange={(e) => setMinYear(e.target.value)}
                        className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] rounded-xl px-3 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-brand-orange)] font-mono"
                      >
                        <option value="">Any Min Year</option>
                        {availableYears.map((y) => (
                          <option key={`min-${y}`} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono block mb-1">Max Year</span>
                      <select
                        value={maxYear}
                        onChange={(e) => setMaxYear(e.target.value)}
                        className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] rounded-xl px-3 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-brand-orange)] font-mono"
                      >
                        <option value="">Any Max Year</option>
                        {availableYears.map((y) => (
                          <option key={`max-${y}`} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Price Range Filter (in Lakhs) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-orange)] font-mono">
                    Price Range (Lakh PKR)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono block mb-1">Min Price (Lakhs)</span>
                      <input
                        type="number"
                        placeholder="e.g. 20"
                        value={minPriceLakh}
                        onChange={(e) => setMinPriceLakh(e.target.value)}
                        className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] rounded-xl px-3 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-brand-orange)] font-mono placeholder:text-[var(--color-text-muted)]/50"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono block mb-1">Max Price (Lakhs)</span>
                      <input
                        type="number"
                        placeholder="e.g. 150"
                        value={maxPriceLakh}
                        onChange={(e) => setMaxPriceLakh(e.target.value)}
                        className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] rounded-xl px-3 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-brand-orange)] font-mono placeholder:text-[var(--color-text-muted)]/50"
                      />
                    </div>
                  </div>
                  {/* Quick Price Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { label: '< 30 Lakh', max: '30' },
                      { label: '30-60 Lakh', min: '30', max: '60' },
                      { label: '60-100 Lakh', min: '60', max: '100' },
                      { label: '> 100 Lakh', min: '100' },
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => {
                          setMinPriceLakh(preset.min || '');
                          setMaxPriceLakh(preset.max || '');
                        }}
                        className="text-[10px] font-mono px-2.5 py-1 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-lg transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-[var(--color-border-main)] bg-[var(--color-bg-tertiary)] flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 px-4 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-main)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[var(--color-border-main)]"
                >
                  <RotateCcw size={14} /> Reset
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[2] py-3 px-4 bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-hover)] text-[var(--color-text-header)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-orange-600/20"
                >
                  Apply Filters ({filteredAndSortedInventory.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
