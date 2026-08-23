import React from 'react';
import { CarListing } from '../../types';
import { EmptyState } from './EmptyState';
import { Eye, MapPin, Gauge } from 'lucide-react';
import { useCurrencyMode } from '../../lib/currency';

interface RecentlyViewedProps {
  recentViews: CarListing[];
  onSelectListing?: (car: CarListing) => void;
  onBrowseMarketplace?: () => void;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  recentViews,
  onSelectListing,
  onBrowseMarketplace
}) => {
  const { renderPrice } = useCurrencyMode();

  if (recentViews.length === 0) {
    return (
      <EmptyState
        icon={Eye}
        title="You haven't viewed any vehicles yet"
        description="Vehicles you inspect while exploring the marketplace will be logged here for convenient re-visiting."
        actionLabel="Browse Marketplace"
        onAction={onBrowseMarketplace}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <h3 className="text-base font-bold font-display text-[var(--color-text-main)] flex items-center gap-2">
          <Eye className="w-4 h-4 text-sky-400" />
          Recently Viewed Vehicles ({recentViews.length})
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
          Real view history recorded during your active sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentViews.map((car) => (
          <div
            key={car.id}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-sky-500/30 transition-all cursor-pointer group shadow-sm"
            onClick={() => onSelectListing && onSelectListing(car)}
          >
            <div className="w-24 h-20 rounded-xl bg-bg-secondary overflow-hidden shrink-0 relative">
              <img
                src={car.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400'}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="font-bold text-xs font-display text-[var(--color-text-main)] truncate">
                {car.year} {car.make} {car.model}
              </h4>
              <div className="text-xs font-mono font-black text-sky-400">
                {renderPrice(car.price)}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] font-mono flex items-center gap-2">
                <span>{car.location || car.registrationCity || 'Peshawar'}</span>
                <span>•</span>
                <span>{car.mileage ? `${Number(car.mileage).toLocaleString()} KM` : 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
