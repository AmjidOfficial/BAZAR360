import React, { useState, useMemo } from 'react';
import { CarListing, Dealer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  Car, 
  Shield, 
  Truck, 
  Zap, 
  Bike, 
  Sparkles, 
  Filter, 
  SlidersHorizontal,
  Gauge,
  Fuel,
  Settings2,
  X,
  RotateCcw,
  Check
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import VehicleListingCard from './VehicleListingCard';

interface InventoryGridProps {
  listings: CarListing[];
  dealer: Dealer;
  onSelectListing: (id: string) => void;
  onDeleteListing?: (car: CarListing) => void;
}

const BODY_CATEGORIES = [
  { id: 'All', label: 'All Stock', icon: LayoutGrid },
  { id: 'Sedan', label: 'Sedans', icon: Car },
  { id: 'SUV', label: 'SUVs & Jeeps', icon: Shield },
  { id: 'Hatchback', label: 'Hatchbacks', icon: Zap },
  { id: 'Crossover', label: 'Crossovers', icon: Sparkles },
  { id: 'Pickup', label: 'Pickups & 4x4s', icon: Truck },
  { id: 'Commercial', label: 'Vans & Commercial', icon: Truck },
  { id: 'Bike', label: 'Motorcycles', icon: Bike },
];

const MILEAGE_PRESETS = [
  { id: 'all', label: 'All Mileage' },
  { id: 'under_25k', label: 'Under 25k km', max: 25000 },
  { id: '25k_50k', label: '25k – 50k km', min: 25000, max: 50000 },
  { id: '50k_100k', label: '50k – 100k km', min: 50000, max: 100000 },
  { id: 'over_100k', label: '100k+ km', min: 100000 },
];

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-2.5 rounded-lg shadow-xl text-left">
        <p className="text-xs font-bold text-[var(--color-text-header)]">{data.name}</p>
        <p className="text-[11px] text-[var(--color-accent-secondary)] font-mono font-black mt-1">
          {data.count} {data.count === 1 ? 'Vehicle' : 'Vehicles'}
        </p>
        <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">Click bar to filter floor listings</p>
      </div>
    );
  }
  return null;
};

export const InventoryGrid: React.FC<InventoryGridProps> = ({ 
  listings, 
  dealer, 
  onSelectListing, 
  onDeleteListing 
}) => {
  // Smart Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('All');
  const [selectedFuel, setSelectedFuel] = useState<string>('All');
  const [selectedMileage, setSelectedMileage] = useState<string>('all');
  const [showSmartFilters, setShowSmartFilters] = useState<boolean>(true);

  // Dynamically extract unique Transmissions present in this showroom's active inventory
  const availableTransmissions = useMemo(() => {
    const types = new Set<string>();
    listings.forEach(car => {
      if (car.transmission) {
        types.add(car.transmission);
      }
    });
    return ['All', ...Array.from(types)];
  }, [listings]);

  // Dynamically extract unique Fuel Categories present in this showroom's active inventory
  const availableFuels = useMemo(() => {
    const fuels = new Set<string>();
    listings.forEach(car => {
      if (car.fuelType) {
        fuels.add(car.fuelType);
      }
    });
    return ['All', ...Array.from(fuels)];
  }, [listings]);

  // Compute dynamic mileage bins for the showroom's active fleet histogram
  const mileageDistributionData = useMemo(() => {
    const bins = [
      { id: 'under_25k', name: 'Under 25k km', count: 0, min: 0, max: 25000 },
      { id: '25k_50k', name: '25k – 50k km', count: 0, min: 25001, max: 50000 },
      { id: '50k_100k', name: '50k – 100k km', count: 0, min: 50001, max: 100000 },
      { id: 'over_100k', name: '100k+ km', count: 0, min: 100001, max: Infinity }
    ];

    listings.forEach(car => {
      const km = car.mileage || 0;
      for (const bin of bins) {
        if (km >= bin.min && km <= bin.max) {
          bin.count++;
          break;
        }
      }
    });

    return bins;
  }, [listings]);

  const handleBarClick = (entry: any) => {
    if (entry && entry.id) {
      setSelectedMileage(prev => prev === entry.id ? 'all' : entry.id);
    }
  };

  // Compound filter matching helper
  const filteredListings = useMemo(() => {
    return listings.filter((car) => {
      // 1. Body Category Filter
      if (selectedCategory !== 'All') {
        const text = `${car.title} ${car.make} ${car.model} ${car.description || ''} ${(car.tags || []).join(' ')}`.toLowerCase();
        if (selectedCategory === 'Sedan') {
          const match = text.includes('sedan') || text.includes('corolla') || text.includes('civic') || text.includes('city') || text.includes('yaris') || text.includes('alsvin') || text.includes('sonata') || text.includes('elantra') || text.includes('accord') || text.includes('camry');
          if (!match) return false;
        } else if (selectedCategory === 'SUV') {
          const match = text.includes('suv') || text.includes('jeep') || text.includes('fortuner') || text.includes('prado') || text.includes('land cruiser') || text.includes('sportage') || text.includes('tucson') || text.includes('sorento') || text.includes('haval') || text.includes('mg hs') || text.includes('oshan');
          if (!match) return false;
        } else if (selectedCategory === 'Hatchback') {
          const match = text.includes('hatchback') || text.includes('alto') || text.includes('cultus') || text.includes('wagon r') || text.includes('swift') || text.includes('vitz') || text.includes('mira') || text.includes('picanto');
          if (!match) return false;
        } else if (selectedCategory === 'Crossover') {
          const match = text.includes('crossover') || text.includes('vezel') || text.includes('stonic') || text.includes('cross') || text.includes('juke') || text.includes('h6');
          if (!match) return false;
        } else if (selectedCategory === 'Pickup') {
          const match = text.includes('pickup') || text.includes('revo') || text.includes('hilux') || text.includes('truck') || text.includes('d-max');
          if (!match) return false;
        } else if (selectedCategory === 'Commercial') {
          const match = text.includes('commercial') || text.includes('van') || text.includes('bolan') || text.includes('hiace') || text.includes('loader');
          if (!match) return false;
        } else if (selectedCategory === 'Bike') {
          const match = text.includes('bike') || text.includes('motorcycle') || text.includes('yamaha') || text.includes('honda 125') || text.includes('cd70');
          if (!match) return false;
        } else if (!text.includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // 2. Transmission Filter
      if (selectedTransmission !== 'All') {
        if (!car.transmission || car.transmission.toLowerCase() !== selectedTransmission.toLowerCase()) {
          return false;
        }
      }

      // 3. Fuel Category Filter
      if (selectedFuel !== 'All') {
        if (!car.fuelType || car.fuelType.toLowerCase() !== selectedFuel.toLowerCase()) {
          return false;
        }
      }

      // 4. Mileage Range Filter
      if (selectedMileage !== 'all') {
        const carMileage = car.mileage || 0;
        const preset = MILEAGE_PRESETS.find(p => p.id === selectedMileage);
        if (preset) {
          if (preset.min !== undefined && carMileage < preset.min) return false;
          if (preset.max !== undefined && carMileage > preset.max) return false;
        }
      }

      return true;
    });
  }, [listings, selectedCategory, selectedTransmission, selectedFuel, selectedMileage]);

  // Compute dynamic unit counts for current filter states
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: listings.length };
    BODY_CATEGORIES.forEach(cat => {
      if (cat.id === 'All') return;
      const count = listings.filter(car => {
        const text = `${car.title} ${car.make} ${car.model} ${car.description || ''} ${(car.tags || []).join(' ')}`.toLowerCase();
        if (cat.id === 'Sedan') return text.includes('sedan') || text.includes('corolla') || text.includes('civic') || text.includes('city') || text.includes('yaris') || text.includes('alsvin') || text.includes('sonata') || text.includes('elantra');
        if (cat.id === 'SUV') return text.includes('suv') || text.includes('jeep') || text.includes('fortuner') || text.includes('prado') || text.includes('land cruiser') || text.includes('sportage') || text.includes('tucson') || text.includes('haval');
        if (cat.id === 'Hatchback') return text.includes('hatchback') || text.includes('alto') || text.includes('cultus') || text.includes('wagon r') || text.includes('swift') || text.includes('vitz') || text.includes('mira');
        if (cat.id === 'Crossover') return text.includes('crossover') || text.includes('vezel') || text.includes('stonic') || text.includes('cross');
        if (cat.id === 'Pickup') return text.includes('pickup') || text.includes('revo') || text.includes('hilux') || text.includes('truck');
        if (cat.id === 'Commercial') return text.includes('commercial') || text.includes('van') || text.includes('bolan') || text.includes('hiace');
        if (cat.id === 'Bike') return text.includes('bike') || text.includes('motorcycle') || text.includes('yamaha') || text.includes('honda 125');
        return text.includes(cat.id.toLowerCase());
      }).length;
      counts[cat.id] = count;
    });
    return counts;
  }, [listings]);

  // Count active smart filter pills
  const activeSmartFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (selectedTransmission !== 'All') count++;
    if (selectedFuel !== 'All') count++;
    if (selectedMileage !== 'all') count++;
    return count;
  }, [selectedCategory, selectedTransmission, selectedFuel, selectedMileage]);

  const handleResetAllFilters = () => {
    setSelectedCategory('All');
    setSelectedTransmission('All');
    setSelectedFuel('All');
    setSelectedMileage('all');
  };

  if (listings.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-[var(--color-text-muted)] border border-[var(--color-border-main)] rounded-3xl bg-[var(--color-bg-secondary)] shadow-sm">
        <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-50 text-[var(--color-accent-secondary)]" />
        <p className="font-bold text-base text-[var(--color-text-header)]">No inventory available at the moment.</p>
        <p className="text-xs mt-1 text-[var(--color-text-muted)]">Check back soon for new arrivals from {dealer.name}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. MASTER SMART FILTER BAR */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl p-4 md:p-5 shadow-sm space-y-4 transition-all">
        
        {/* Top Header Row with Status & Quick Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/20 text-[var(--color-accent-main)] flex items-center justify-center">
              <SlidersHorizontal size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-header)]">
                  Smart Inventory Filter
                </span>
                {activeSmartFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-secondary)]/15 border border-[var(--color-accent-secondary)]/30 text-[var(--color-accent-secondary)] text-[10px] font-mono font-bold">
                    {activeSmartFilterCount} Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Filter by body type, transmission, fuel category, and mileage range
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[var(--color-accent-secondary)] bg-[var(--color-accent-secondary)]/10 border border-[var(--color-accent-secondary)]/20 px-2.5 py-1 rounded-lg">
              Showing {filteredListings?.length || 0} of {listings?.length || 0} Units
            </span>

            {activeSmartFilterCount > 0 && (
              <button
                onClick={handleResetAllFilters}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                title="Clear all filters"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={() => setShowSmartFilters(prev => !prev)}
              className="p-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] transition-all cursor-pointer md:hidden"
              title="Toggle filter controls"
            >
              <Filter size={14} />
            </button>
          </div>
        </div>

        {/* 2. BODY CATEGORY SELECTOR */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] tracking-wider">
            Vehicle Body Type
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {BODY_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`snap-start flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[var(--color-accent-main)] to-[var(--color-accent-secondary)] text-white border-transparent shadow-md scale-102 font-black'
                      : 'bg-[var(--color-bg-primary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] hover:border-[var(--color-accent-main)]/30'
                  }`}
                >
                  <Icon size={14} className={isSelected ? 'text-white' : 'text-[var(--color-accent-main)]'} />
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                    isSelected ? 'bg-black/20 text-white' : 'bg-black/10 dark:bg-white/10 text-[var(--color-text-muted)]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. DYNAMIC SMART FILTER CONTROLS (Transmission, Fuel, Mileage) */}
        <AnimatePresence>
          {showSmartFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-3 border-t border-[var(--color-border-subtle)] overflow-hidden"
            >
              {/* Transmission Smart Filter */}
              <div className="space-y-1.5 bg-[var(--color-bg-primary)] p-3 rounded-xl border border-[var(--color-border-main)]">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-text-header)]">
                  <span className="flex items-center gap-1.5">
                    <Settings2 size={13} className="text-[var(--color-accent-main)]" />
                    Transmission Type
                  </span>
                  {selectedTransmission !== 'All' && (
                    <button 
                      onClick={() => setSelectedTransmission('All')}
                      className="text-[10px] text-[var(--color-accent-secondary)] hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {availableTransmissions.map((trans) => {
                    const isSelected = selectedTransmission.toLowerCase() === trans.toLowerCase();
                    const count = trans === 'All' 
                      ? listings.length 
                      : listings.filter(c => c.transmission && c.transmission.toLowerCase() === trans.toLowerCase()).length;

                    return (
                      <button
                        key={trans}
                        onClick={() => setSelectedTransmission(trans)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-[var(--color-accent-main)] text-white border-[var(--color-accent-main)] shadow-sm'
                            : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] hover:border-[var(--color-accent-main)]/30'
                        }`}
                      >
                        {isSelected && <Check size={11} />}
                        <span>{trans}</span>
                        <span className={`text-[9px] font-mono px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-[var(--color-text-muted)]'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fuel Category Smart Filter */}
              <div className="space-y-1.5 bg-[var(--color-bg-primary)] p-3 rounded-xl border border-[var(--color-border-main)]">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-text-header)]">
                  <span className="flex items-center gap-1.5">
                    <Fuel size={13} className="text-[var(--color-accent-secondary)]" />
                    Fuel Category
                  </span>
                  {selectedFuel !== 'All' && (
                    <button 
                      onClick={() => setSelectedFuel('All')}
                      className="text-[10px] text-[var(--color-accent-secondary)] hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {availableFuels.map((fuel) => {
                    const isSelected = selectedFuel.toLowerCase() === fuel.toLowerCase();
                    const count = fuel === 'All' 
                      ? listings.length 
                      : listings.filter(c => c.fuelType && c.fuelType.toLowerCase() === fuel.toLowerCase()).length;

                    return (
                      <button
                        key={fuel}
                        onClick={() => setSelectedFuel(fuel)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-[var(--color-accent-secondary)] text-white border-[var(--color-accent-secondary)] shadow-sm'
                            : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] hover:border-[var(--color-accent-secondary)]/30'
                        }`}
                      >
                        {isSelected && <Check size={11} />}
                        <span>{fuel}</span>
                        <span className={`text-[9px] font-mono px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-[var(--color-text-muted)]'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mileage Range Smart Filter */}
              <div className="space-y-1.5 bg-[var(--color-bg-primary)] p-3 rounded-xl border border-[var(--color-border-main)]">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-text-header)]">
                  <span className="flex items-center gap-1.5">
                    <Gauge size={13} className="text-emerald-400" />
                    Mileage Range
                  </span>
                  {selectedMileage !== 'all' && (
                    <button 
                      onClick={() => setSelectedMileage('all')}
                      className="text-[10px] text-[var(--color-accent-secondary)] hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {MILEAGE_PRESETS.map((preset) => {
                    const isSelected = selectedMileage === preset.id;
                    const count = listings.filter(car => {
                      if (preset.id === 'all') return true;
                      const km = car.mileage || 0;
                      if (preset.min !== undefined && km < preset.min) return false;
                      if (preset.max !== undefined && km > preset.max) return false;
                      return true;
                    }).length;

                    return (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedMileage(preset.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-[var(--color-accent-main)] text-[#030712] border-[var(--color-accent-main)] shadow-sm'
                            : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] hover:border-[var(--color-accent-main)]/30'
                        }`}
                      >
                        {isSelected && <Check size={11} />}
                        <span>{preset.label}</span>
                        <span className={`text-[9px] font-mono px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-[var(--color-text-muted)]'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mileage Distribution Histogram Visualizer */}
              <div className="md:col-span-3 bg-[var(--color-bg-primary)] p-4 rounded-xl border border-[var(--color-border-main)] space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] font-mono font-bold text-[var(--color-accent-secondary)] uppercase tracking-wider block">
                      FLEET MILEAGE PROFILE
                    </span>
                    <h4 className="text-xs font-extrabold text-[var(--color-text-header)] uppercase tracking-wide flex items-center gap-1.5">
                      <Gauge size={13} className="text-[var(--color-accent-main)]" />
                      Usage & Age Distribution
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    Interactive Histogram • Click any bar to toggle active filter
                  </span>
                </div>

                <div className="w-full h-[120px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mileageDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis 
                        dataKey="name" 
                        stroke="var(--color-text-muted)" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={6}
                      />
                      <YAxis 
                        stroke="var(--color-text-muted)" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                      />
                      <ChartTooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} 
                      />
                      <Bar 
                        dataKey="count" 
                        radius={[4, 4, 0, 0]} 
                        cursor="pointer"
                      >
                        {mileageDistributionData.map((entry, index) => {
                          const isSelected = selectedMileage === entry.id;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={isSelected ? 'var(--color-accent-secondary)' : 'var(--color-accent-main)'}
                              onClick={() => handleBarClick(entry)}
                              className="transition-all duration-300 hover:opacity-85"
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Pill Bar */}
        {activeSmartFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">Active Filters:</span>
            
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/30 text-xs font-medium">
                Category: {selectedCategory}
                <X size={12} className="cursor-pointer hover:text-white" onClick={() => setSelectedCategory('All')} />
              </span>
            )}

            {selectedTransmission !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/30 text-xs font-medium">
                Transmission: {selectedTransmission}
                <X size={12} className="cursor-pointer hover:text-white" onClick={() => setSelectedTransmission('All')} />
              </span>
            )}

            {selectedFuel !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/30 text-xs font-medium">
                Fuel: {selectedFuel}
                <X size={12} className="cursor-pointer hover:text-white" onClick={() => setSelectedFuel('All')} />
              </span>
            )}

            {selectedMileage !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
                Mileage: {MILEAGE_PRESETS.find(p => p.id === selectedMileage)?.label}
                <X size={12} className="cursor-pointer hover:text-white" onClick={() => setSelectedMileage('all')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. GRID OF FILTERED VEHICLES */}
      {filteredListings.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[var(--color-border-main)] rounded-3xl bg-[var(--color-bg-secondary)] space-y-3 shadow-sm">
          <Car className="w-10 h-10 mx-auto text-[var(--color-accent-secondary)]/60" />
          <p className="text-base font-bold text-[var(--color-text-header)]">No vehicles match your active smart filter criteria</p>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
            Try adjusting your transmission, fuel category, or mileage range settings to view available stock.
          </p>
          {activeSmartFilterCount > 0 && (
            <div className="pt-2">
              <button
                onClick={handleResetAllFilters}
                className="px-4 py-2 bg-gradient-to-r from-[var(--color-accent-main)] to-[var(--color-accent-secondary)] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer border-none"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          key={`inventory-grid-${selectedCategory}-${selectedTransmission}-${selectedFuel}-${selectedMileage}`}
          id="showroom-inventory-grid"
          className="grid gap-4 md:gap-6 items-stretch w-full"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.02
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {filteredListings.map((car, index) => (
            <motion.div
              key={car.id}
              className="h-full group hover:z-10 transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.96 },
                show: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 280,
                    damping: 22
                  }
                }
              }}
              layout
            >
              <VehicleListingCard
                car={car}
                index={index}
                onSelect={() => onSelectListing(car.id)}
                onToggleFavorite={() => {}}
                isFavorite={false}
                onDelete={onDeleteListing}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
export default InventoryGrid;
