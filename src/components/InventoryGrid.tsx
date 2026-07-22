import React, { useState, useMemo } from 'react';
import { CarListing, Dealer } from '../types';
import { motion } from 'motion/react';
import { LayoutGrid, Car, Shield, Truck, Zap, Bike, Sparkles, Filter } from 'lucide-react';
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

export const InventoryGrid: React.FC<InventoryGridProps> = ({ listings, dealer, onSelectListing, onDeleteListing }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Category matching helper
  const filteredListings = useMemo(() => {
    if (selectedCategory === 'All') return listings;

    return listings.filter((car) => {
      const text = `${car.title} ${car.make} ${car.model} ${car.description || ''} ${(car.tags || []).join(' ')}`.toLowerCase();

      if (selectedCategory === 'Sedan') {
        return text.includes('sedan') || text.includes('corolla') || text.includes('civic') || text.includes('city') || text.includes('yaris') || text.includes('alsvin') || text.includes('sonata') || text.includes('elantra') || text.includes('accord') || text.includes('camry');
      }
      if (selectedCategory === 'SUV') {
        return text.includes('suv') || text.includes('jeep') || text.includes('fortuner') || text.includes('prado') || text.includes('land cruiser') || text.includes('sportage') || text.includes('tucson') || text.includes('sorento') || text.includes('haval') || text.includes('mg hs') || text.includes('oshan');
      }
      if (selectedCategory === 'Hatchback') {
        return text.includes('hatchback') || text.includes('alto') || text.includes('cultus') || text.includes('wagon r') || text.includes('swift') || text.includes('vitz') || text.includes('mira') || text.includes('picanto');
      }
      if (selectedCategory === 'Crossover') {
        return text.includes('crossover') || text.includes('vezel') || text.includes('stonic') || text.includes('cross') || text.includes('juke') || text.includes('h6');
      }
      if (selectedCategory === 'Pickup') {
        return text.includes('pickup') || text.includes('revo') || text.includes('hilux') || text.includes('truck') || text.includes('d-max');
      }
      if (selectedCategory === 'Commercial') {
        return text.includes('commercial') || text.includes('van') || text.includes('bolan') || text.includes('hiace') || text.includes('loader');
      }
      if (selectedCategory === 'Bike') {
        return text.includes('bike') || text.includes('motorcycle') || text.includes('yamaha') || text.includes('honda 125') || text.includes('cd70');
      }
      return text.includes(selectedCategory.toLowerCase());
    });
  }, [listings, selectedCategory]);

  // Compute category unit counts
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

  if (listings.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border-main)] rounded-2xl bg-[var(--color-bg-secondary)]/50">
        <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-50 text-orange-500" />
        <p className="font-bold text-[var(--color-text-main)]">No inventory available at the moment.</p>
        <p className="text-xs mt-1">Check back soon for new arrivals from {dealer.name}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter Pills Row */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-3 rounded-2xl space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] tracking-wider flex items-center gap-1.5">
            <Filter size={12} className="text-orange-500" /> Filter Showroom Category
          </span>
          <span className="text-[10px] font-mono text-orange-500 font-bold">
            Showing {filteredListings.length} of {listings.length} Units
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {BODY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`snap-start flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-orange-500 text-slate-950 font-black shadow-md scale-102'
                    : 'bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-orange-500/30'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-slate-950' : 'text-orange-500'} />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-black/10 dark:bg-white/10 text-[var(--color-text-muted)]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Vehicles */}
      {filteredListings.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-[var(--color-border-main)] rounded-2xl bg-[var(--color-bg-secondary)]/50 space-y-2">
          <Car className="w-10 h-10 mx-auto text-orange-500/50" />
          <p className="text-sm font-bold text-[var(--color-text-main)]">No vehicles found in "{selectedCategory}" category</p>
          <p className="text-xs text-[var(--color-text-muted)]">Try selecting "All Stock" to view the complete fleet.</p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="mt-2 px-4 py-1.5 bg-orange-500 text-slate-950 font-black text-xs uppercase rounded-xl hover:bg-orange-600 transition-all cursor-pointer"
          >
            Reset Category Filter
          </button>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {filteredListings.map((car) => (
            <motion.div
              key={car.id}
              className="h-full group hover:z-10 transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <VehicleListingCard
                car={car}
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

