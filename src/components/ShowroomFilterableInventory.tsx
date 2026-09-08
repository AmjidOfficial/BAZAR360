'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  ArrowUpDown, 
  Filter, 
  Check,
  Settings2,
  Fuel,
  Gauge,
  Sparkles,
  Car
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
  mileage?: number;
  imageUrl?: string;
  images?: string[];
  [key: string]: any;
}

interface ShowroomFilterableInventoryProps {
  inventory: Vehicle[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700/50 p-3 rounded-xl shadow-xl text-left max-w-[240px]">
        <p className="text-[11px] font-mono font-black text-amber-500 uppercase tracking-widest mb-1">{data.range}</p>
        <p className="text-xs text-white font-bold mb-1.5">{data.count} {data.count === 1 ? 'vehicle' : 'vehicles'}</p>
        {data.vehicles.length > 0 && (
          <div className="border-t border-slate-800 pt-1.5 space-y-1">
            {data.vehicles.slice(0, 3).map((car: any, idx: number) => (
              <p key={car.id || idx} className="text-[10px] text-slate-300 truncate font-sans">
                • {car.year} {car.make} {car.model}
              </p>
            ))}
            {data.vehicles.length > 3 && (
              <p className="text-[9px] text-slate-500 font-mono italic">+ {data.vehicles.length - 3} more</p>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function ShowroomFilterableInventory({ inventory }: ShowroomFilterableInventoryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc'>('default');
  const [transmission, setTransmission] = useState<string>('all');
  const [fuelType, setFuelType] = useState<string>('all');
  const [mileageRange, setMileageRange] = useState<string>('all');
  const [minYear, setMinYear] = useState<string>('');
  const [maxYear, setMaxYear] = useState<string>('');
  const [minPriceLakh, setMinPriceLakh] = useState<string>('');
  const [maxPriceLakh, setMaxPriceLakh] = useState<string>('');
  const [customMileageMin, setCustomMileageMin] = useState<number | null>(null);
  const [customMileageMax, setCustomMileageMax] = useState<number | null>(null);

  // Derivation of Histogram data
  const histogramData = useMemo(() => {
    const buckets = [
      { range: '0-20k km', min: 0, max: 20000, count: 0, vehicles: [] as Vehicle[] },
      { range: '20k-40k km', min: 20001, max: 40000, count: 0, vehicles: [] as Vehicle[] },
      { range: '40k-60k km', min: 40001, max: 60000, count: 0, vehicles: [] as Vehicle[] },
      { range: '60k-80k km', min: 60001, max: 80000, count: 0, vehicles: [] as Vehicle[] },
      { range: '80k-100k km', min: 80001, max: 100000, count: 0, vehicles: [] as Vehicle[] },
      { range: '100k-120k km', min: 100001, max: 120000, count: 0, vehicles: [] as Vehicle[] },
      { range: '120k+ km', min: 120001, max: Infinity, count: 0, vehicles: [] as Vehicle[] },
    ];

    inventory.forEach(car => {
      const mileage = Number(car.mileage);
      if (!isNaN(mileage)) {
        const bucket = buckets.find(b => mileage >= b.min && mileage <= b.max);
        if (bucket) {
          bucket.count++;
          bucket.vehicles.push(car);
        }
      }
    });

    return buckets;
  }, [inventory]);

  // Extract available years for filter options
  const availableYears = useMemo(() => {
    const years = inventory
      .map((car) => Number(car.year))
      .filter((y) => !isNaN(y) && y > 1900)
      .sort((a, b) => b - a);
    return Array.from(new Set(years));
  }, [inventory]);

  // Extract available transmissions dynamically
  const availableTransmissions = useMemo(() => {
    const types = new Set<string>();
    inventory.forEach((c) => {
      if (c.transmission) types.add(c.transmission);
    });
    return ['all', ...Array.from(types)];
  }, [inventory]);

  // Extract available fuels dynamically
  const availableFuels = useMemo(() => {
    const fuels = new Set<string>();
    inventory.forEach((c) => {
      if (c.fuelType) fuels.add(c.fuelType);
    });
    return ['all', ...Array.from(fuels)];
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
    if (fuelType !== 'all') count++;
    if (mileageRange !== 'all') count++;
    if (minYear !== '') count++;
    if (maxYear !== '') count++;
    if (minPriceLakh !== '') count++;
    if (maxPriceLakh !== '') count++;
    if (sortBy !== 'default') count++;
    if (customMileageMin !== null || customMileageMax !== null) count++;
    return count;
  }, [transmission, fuelType, mileageRange, minYear, maxYear, minPriceLakh, maxPriceLakh, sortBy, customMileageMin, customMileageMax]);

  // Filter and sort computation
  const filteredAndSortedInventory = useMemo(() => {
    let result = [...inventory];

    // Transmission Filter
    if (transmission !== 'all') {
      result = result.filter(
        (car) => car.transmission?.toLowerCase() === transmission.toLowerCase()
      );
    }

    // Fuel Category Filter
    if (fuelType !== 'all') {
      result = result.filter(
        (car) => car.fuelType?.toLowerCase() === fuelType.toLowerCase()
      );
    }

    // Mileage Filter
    if (mileageRange !== 'all') {
      result = result.filter((car) => {
        const km = car.mileage || 0;
        if (mileageRange === 'under_25k') return km <= 25000;
        if (mileageRange === '25k_50k') return km > 25000 && km <= 50000;
        if (mileageRange === '50k_100k') return km > 50000 && km <= 100000;
        if (mileageRange === 'over_100k') return km > 100000;
        return true;
      });
    }

    // Custom Interactive Histogram Mileage Filter
    if (customMileageMin !== null || customMileageMax !== null) {
      result = result.filter((car) => {
        const km = Number(car.mileage) || 0;
        const minVal = customMileageMin !== null ? customMileageMin : 0;
        const maxVal = customMileageMax !== null ? customMileageMax : Infinity;
        return km >= minVal && km <= maxVal;
      });
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
  }, [inventory, transmission, fuelType, mileageRange, minYear, maxYear, minPriceLakh, maxPriceLakh, sortBy, customMileageMin, customMileageMax]);

  const resetFilters = () => {
    setSortBy('default');
    setTransmission('all');
    setFuelType('all');
    setMileageRange('all');
    setMinYear('');
    setMaxYear('');
    setMinPriceLakh('');
    setMaxPriceLakh('');
    setCustomMileageMin(null);
    setCustomMileageMax(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Sort Bar */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-[var(--color-border-subtle)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-[var(--color-text-header)] font-sans">
                Active Showroom Stock
              </h2>
              <span className="bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider">
                {filteredAndSortedInventory?.length || 0} / {inventory?.length || 0} UNITS
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">Real-time dealer vehicle inventory</p>
          </div>

          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-rose-400 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset All</span>
              </button>
            )}

            {/* Slide-Out Advanced Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-accent-main)] to-[var(--color-accent-secondary)] hover:opacity-90 text-white font-sans font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border-none"
              id="showroom-filter-btn"
            >
              <SlidersHorizontal size={14} />
              <span>Smart Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-black/30 text-white w-5 h-5 rounded-full text-[10px] font-mono font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Quick Smart Pills Bar (Transmission, Fuel, Mileage) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Transmission Quick Chips */}
          <div className="bg-[var(--color-bg-primary)] p-2.5 rounded-xl border border-[var(--color-border-main)] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase shrink-0 flex items-center gap-1">
              <Settings2 size={12} className="text-[var(--color-accent-main)]" /> Trans:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {availableTransmissions.map((t) => (
                <button
                  key={t}
                  onClick={() => setTransmission(t)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    transmission.toLowerCase() === t.toLowerCase()
                      ? 'bg-[var(--color-accent-main)] text-white shadow-sm'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] border border-[var(--color-border-main)]'
                  }`}
                >
                  {t === 'all' ? 'All' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Quick Chips */}
          <div className="bg-[var(--color-bg-primary)] p-2.5 rounded-xl border border-[var(--color-border-main)] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase shrink-0 flex items-center gap-1">
              <Fuel size={12} className="text-[var(--color-accent-secondary)]" /> Fuel:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {availableFuels.map((f) => (
                <button
                  key={f}
                  onClick={() => setFuelType(f)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    fuelType.toLowerCase() === f.toLowerCase()
                      ? 'bg-[var(--color-accent-secondary)] text-white shadow-sm'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] border border-[var(--color-border-main)]'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Mileage Quick Chips */}
          <div className="bg-[var(--color-bg-primary)] p-2.5 rounded-xl border border-[var(--color-border-main)] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase shrink-0 flex items-center gap-1">
              <Gauge size={12} className="text-emerald-400" /> Mileage:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'under_25k', label: '<25k' },
                { id: '25k_50k', label: '25-50k' },
                { id: 'over_100k', label: '100k+' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMileageRange(m.id)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    mileageRange === m.id
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] border border-[var(--color-border-main)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet Mileage Distribution Histogram Chart Card */}
        <div className="bg-[var(--color-bg-primary)] p-4 rounded-xl border border-[var(--color-border-main)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-[var(--color-accent-main)]" />
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--color-text-main)]">
                Fleet Mileage Distribution & Usage Profile
              </span>
            </div>
            <div className="flex items-center gap-3">
              {(customMileageMin !== null || customMileageMax !== null) ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg font-mono border border-amber-500/20 font-semibold">
                    Filtered: {customMileageMin === 120001 ? '120k+ km' : `${(customMileageMin || 0) / 1000}k-${(customMileageMax || 0) / 1000}k km`}
                  </span>
                  <button 
                    onClick={() => { setCustomMileageMin(null); setCustomMileageMax(null); }}
                    className="text-[10px] font-mono uppercase font-bold text-rose-400 hover:text-rose-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    <X size={10} /> Clear
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-[var(--color-text-muted)] font-mono italic">Click any bar to instantly filter stock</span>
              )}
            </div>
          </div>

          <div className="h-28 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis 
                  dataKey="range" 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={{ stroke: 'var(--color-border-main)' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={{ stroke: 'var(--color-border-main)' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(data) => {
                    if (data && data.min !== undefined) {
                      setCustomMileageMin(Number(data.min));
                      setCustomMileageMax(Number(data.max));
                      // Clear standard mileage quick range filter to prevent overlap conflict
                      setMileageRange('all');
                    }
                  }}
                >
                  {histogramData.map((entry, index) => {
                    const isSelected = customMileageMin === entry.min && customMileageMax === entry.max;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isSelected ? 'var(--color-accent-main)' : 'rgba(30, 91, 140, 0.45)'}
                        stroke={isSelected ? 'var(--color-accent-main)' : 'rgba(30, 91, 140, 0.1)'}
                        strokeWidth={1}
                        className="transition-all duration-200 hover:fill-opacity-80"
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Filter Chips Preview */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono pt-2 border-t border-[var(--color-border-subtle)]">
            <span className="text-[var(--color-text-muted)] text-[11px] font-bold uppercase mr-1">Active Filters:</span>
            {sortBy !== 'default' && (
              <span className="bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] px-2.5 py-1 rounded-lg flex items-center gap-1">
                Sort: {sortBy === 'price-asc' ? 'Price ↑' : sortBy === 'price-desc' ? 'Price ↓' : sortBy === 'year-desc' ? 'Newest' : 'Oldest'}
                <button onClick={() => setSortBy('default')} className="hover:text-white cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}
            {transmission !== 'all' && (
              <span className="bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] px-2.5 py-1 rounded-lg flex items-center gap-1">
                Trans: {transmission}
                <button onClick={() => setTransmission('all')} className="hover:text-white cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}
            {fuelType !== 'all' && (
              <span className="bg-[var(--color-accent-secondary)]/10 border border-[var(--color-accent-secondary)]/30 text-[var(--color-accent-secondary)] px-2.5 py-1 rounded-lg flex items-center gap-1">
                Fuel: {fuelType}
                <button onClick={() => setFuelType('all')} className="hover:text-white cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}
            {mileageRange !== 'all' && (
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                Mileage: {mileageRange}
                <button onClick={() => setMileageRange('all')} className="hover:text-white cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}
            {(minYear || maxYear) && (
              <span className="bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] px-2.5 py-1 rounded-lg flex items-center gap-1">
                Year: {minYear || 'Any'} - {maxYear || 'Any'}
                <button onClick={() => { setMinYear(''); setMaxYear(''); }} className="hover:text-white cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}
            {(minPriceLakh || maxPriceLakh) && (
              <span className="bg-[var(--color-accent-secondary)]/10 border border-[var(--color-accent-secondary)]/30 text-[var(--color-accent-secondary)] px-2.5 py-1 rounded-lg flex items-center gap-1">
                Price: {minPriceLakh ? `${minPriceLakh}L` : '0'} - {maxPriceLakh ? `${maxPriceLakh}L` : 'Any'}
                <button onClick={() => { setMinPriceLakh(''); setMaxPriceLakh(''); }} className="hover:text-white cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}
            {(customMileageMin !== null || customMileageMax !== null) && (
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                Mileage Profile: {customMileageMin === 120001 ? '120k+ km' : `${(customMileageMin || 0) / 1000}k-${(customMileageMax || 0) / 1000}k km`}
                <button onClick={() => { setCustomMileageMin(null); setCustomMileageMax(null); }} className="hover:text-white cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Vehicles Grid or Empty State */}
      {inventory.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-bg-secondary)] border border-dashed border-[var(--color-border-main)] rounded-3xl space-y-4 shadow-sm">
          <Car className="w-10 h-10 text-[var(--color-text-muted)] mx-auto opacity-40" />
          <p className="text-sm font-bold text-[var(--color-text-header)]">No Live Vehicles Posted Yet</p>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
            This showroom has not listed any vehicles for sale yet. Check back later or contact the owner.
          </p>
        </div>
      ) : filteredAndSortedInventory.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-bg-secondary)] border border-dashed border-[var(--color-border-main)] rounded-3xl space-y-4 shadow-sm">
          <Filter className="w-10 h-10 text-[var(--color-accent-secondary)] mx-auto" />
          <p className="text-sm font-bold text-[var(--color-text-main)]">No Vehicles Match Your Selected Filters</p>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
            Try adjusting your year, price range, transmission, or fuel category filters to view available stock.
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gradient-to-r from-[var(--color-accent-main)] to-[var(--color-accent-secondary)] text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 border-none shadow-md"
            >
              <RotateCcw size={14} /> Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <motion.div
          id="showroom-inventory-grid"
          className="grid gap-4 md:gap-6"
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
            const imageCount = (car.images && car.images.length) || (car.imageUrl ? 1 : 0);

            return (
              <AnimatedVehicleCard
                key={car.id}
                index={idx}
                car={car}
                className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl overflow-hidden hover:border-[var(--color-accent-main)]/60 transition-all duration-300 group/card flex flex-col h-full shadow-md hover:shadow-xl"
              >
                {/* Vehicle Image Container */}
                <div 
                  data-lightbox-trigger="true"
                  className="w-full aspect-[16/10] bg-[var(--color-bg-tertiary)] relative overflow-hidden shrink-0 cursor-pointer group/img"
                  title="Click to view full-screen high-resolution gallery"
                >
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
                      alt={car.title || `${car.make || ''} ${car.model || ''}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-108 relative z-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] font-mono text-xs">
                      No Vehicle Image Available
                    </div>
                  )}
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none z-10" />
                  
                  {/* Top Left Badge: Condition */}
                  <div className="absolute top-3 left-3 z-20 pointer-events-none">
                    <span className="bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-header)] px-2.5 py-1 rounded-md">
                      {car.condition || 'Used'}
                    </span>
                  </div>

                  {/* Top Right Badge: Image Count / Gallery Indicator */}
                  {imageCount > 0 && (
                    <div className="absolute top-3 right-3 z-20 pointer-events-none">
                      <span className="bg-[var(--color-accent-secondary)] text-white border border-white/20 text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
                        📸 {imageCount} {imageCount === 1 ? 'Photo' : 'Photos'}
                      </span>
                    </div>
                  )}
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
                      <span className="text-base font-extrabold text-[var(--color-accent-secondary)]">
                        {rawP > 0 ? `PKR ${(rawP / 100000).toFixed(1)} Lakh` : 'Inquire'}
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-[var(--color-accent-main)] to-[var(--color-accent-secondary)] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm border-none">
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
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/20 text-[var(--color-accent-main)] flex items-center justify-center">
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
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-main)] font-mono flex items-center gap-1.5">
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
                            ? 'bg-[var(--color-accent-main)]/10 border-[var(--color-accent-main)] text-[var(--color-accent-main)] shadow-sm'
                            : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-main)] text-[var(--color-text-main)] hover:border-[var(--color-text-muted)]/30'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.id && <Check size={14} className="text-[var(--color-accent-main)]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Transmission Type */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-main)] font-mono">
                    Transmission
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTransmissions.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTransmission(t)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          transmission.toLowerCase() === t.toLowerCase()
                            ? 'bg-[var(--color-accent-main)]/10 border-[var(--color-accent-main)] text-[var(--color-accent-main)]'
                            : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-main)] text-[var(--color-text-main)] hover:border-[var(--color-text-muted)]/30'
                        }`}
                      >
                        {t === 'all' ? 'All' : t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Fuel Category */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-secondary)] font-mono">
                    Fuel Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableFuels.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFuelType(f)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          fuelType.toLowerCase() === f.toLowerCase()
                            ? 'bg-[var(--color-accent-secondary)]/10 border-[var(--color-accent-secondary)] text-[var(--color-accent-secondary)]'
                            : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-main)] text-[var(--color-text-main)] hover:border-[var(--color-text-muted)]/30'
                        }`}
                      >
                        {f === 'all' ? 'All' : f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Year Range Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-main)] font-mono">
                    Model Year
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono block mb-1">Min Year</span>
                      <select
                        value={minYear}
                        onChange={(e) => setMinYear(e.target.value)}
                        className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] rounded-xl px-3 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent-main)] font-mono"
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
                        className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] rounded-xl px-3 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent-main)] font-mono"
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

                {/* 5. Price Range Filter (in Lakhs) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-secondary)] font-mono">
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
                        className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] rounded-xl px-3 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent-secondary)] font-mono placeholder:text-[var(--color-text-muted)]/50"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono block mb-1">Max Price (Lakhs)</span>
                      <input
                        type="number"
                        placeholder="e.g. 150"
                        value={maxPriceLakh}
                        onChange={(e) => setMaxPriceLakh(e.target.value)}
                        className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] rounded-xl px-3 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent-secondary)] font-mono placeholder:text-[var(--color-text-muted)]/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-[var(--color-border-main)] bg-[var(--color-bg-tertiary)] flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 px-4 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-main)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[var(--color-border-main)]"
                >
                  <RotateCcw size={14} /> Reset
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[2] py-3 px-4 bg-gradient-to-r from-[var(--color-accent-main)] to-[var(--color-accent-secondary)] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg border-none"
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
