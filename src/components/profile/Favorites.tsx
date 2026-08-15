import React from 'react';
import { CarListing } from '../../types';
import { EmptyState } from './EmptyState';
import { Heart, Trash2, Eye, MapPin, Gauge } from 'lucide-react';
import { useCurrencyMode } from '../../lib/currency';

interface FavoritesProps {
  favoritesList: CarListing[];
  onSelectListing?: (car: CarListing) => void;
  onToggleFavorite?: (car: CarListing) => void;
  onExploreVehicles?: () => void;
}

export const Favorites: React.FC<FavoritesProps> = ({
  favoritesList,
  onSelectListing,
  onToggleFavorite,
  onExploreVehicles
}) => {
  const { renderPrice } = useCurrencyMode();

  if (favoritesList.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="You haven't saved any vehicles yet"
        description="Tap the heart icon on any vehicle listing while browsing to save it to your account wishlist."
        actionLabel="Explore Vehicles"
        onAction={onExploreVehicles}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <h3 className="text-base font-bold font-display text-[var(--color-text-main)] flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          Saved Wishlist ({favoritesList.length})
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
          Real saved vehicle records synced with your account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favoritesList.map((car) => {
          if (!car || !car.id) {
            return (
              <div key={Math.random()} className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs text-rose-400 font-mono">
                This vehicle is no longer available.
              </div>
            );
          }

          return (
            <div
              key={car.id}
              className="flex flex-col rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden shadow-sm hover:border-rose-500/30 transition-all group"
            >
              <div className="relative h-44 bg-bg-secondary overflow-hidden">
                <img
                  src={car.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400'}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Remove Favorite Toggle button */}
                <button
                  onClick={() => onToggleFavorite && onToggleFavorite(car)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-bg-primary/80 hover:bg-rose-500 text-rose-500 hover:text-[var(--color-text-header)] transition-all cursor-pointer shadow-md"
                  title="Remove from Saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-bg-primary/80 backdrop-blur-xs text-rose-400 font-mono font-black text-sm">
                  {renderPrice(car.price)}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-sm font-display text-[var(--color-text-main)]">
                    {car.year} {car.make} {car.model}
                  </h4>
                  <div className="text-xs text-[var(--color-text-muted)] font-mono flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-sky-400" />
                      {car.mileage ? `${Number(car.mileage).toLocaleString()} KM` : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-400" />
                      {car.location || car.registrationCity || 'Peshawar'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)]">
                    {car.isSold ? 'Sold' : 'Available'}
                  </span>

                  <button
                    onClick={() => onSelectListing && onSelectListing(car)}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Listing</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
