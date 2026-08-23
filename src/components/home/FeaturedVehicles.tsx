import React, { useState, useEffect } from 'react';
import { CarListing, Dealer } from '../../types';
import { VehicleCard } from '../VehicleCard';
import { VehicleSkeletonCard } from '../VehicleSkeletonCard';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { dbFetchListingsPaginated } from '../../lib/dbService';

interface FeaturedVehiclesProps {
  lang: 'en' | 'ur';
  listings?: CarListing[]; // Kept for backwards compat if needed
  dealers: Dealer[];
  onSelectListing: (car: CarListing) => void;
  onToggleCompare: (car: CarListing) => void;
  compareList: CarListing[];
  onToggleFavorite: (car: CarListing) => void;
  favoritesList: CarListing[];
  dbLoading?: boolean;
}

export function FeaturedVehicles({
  lang, dealers, onSelectListing, onToggleCompare, compareList, onToggleFavorite, favoritesList, dbLoading: initialDbLoading
}: FeaturedVehiclesProps) {
  const [paginatedListings, setPaginatedListings] = useState<CarListing[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      const { listings, lastVisible: last } = await dbFetchListingsPaginated(null, 8);
      // Filter for verified/premium only if needed, though DB could do this if we had an index.
      // We assume dbFetchListingsPaginated returns recent listings, we can filter them locally for now.
      const premium = listings.filter(l => l.verified);
      setPaginatedListings(premium.length > 0 ? premium : listings);
      setLastVisible(last);
      setHasMore(listings.length === 8);
      setLoading(false);
    }
    loadInitial();
  }, []);

  const loadMore = async () => {
    if (!lastVisible || !hasMore) return;
    setLoadingMore(true);
    const { listings, lastVisible: last } = await dbFetchListingsPaginated(lastVisible, 8);
    const premium = listings.filter(l => l.verified);
    setPaginatedListings(prev => [...prev, ...(premium.length > 0 ? premium : listings)]);
    setLastVisible(last);
    setHasMore(listings.length === 8);
    setLoadingMore(false);
  };

  const isDbLoading = initialDbLoading || loading;

  return (
    <section className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-[var(--color-text-main)] tracking-tight">
            {lang === 'en' ? 'Premium Inventory' : 'بہترین گاڑیاں'}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] font-sans mt-2">
            {lang === 'en' ? 'Handpicked, physically inspected vehicles.' : 'منتخب کردہ، تصدیق شدہ گاڑیاں۔'}
          </p>
        </div>
        <button className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-sans font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer">
          {lang === 'en' ? 'View All' : 'سب دیکھیں'} <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 hide-scrollbar">
        {isDbLoading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start shrink-0">
              <VehicleSkeletonCard />
            </div>
          ))
        ) : paginatedListings.length > 0 ? (
          paginatedListings.map((car, idx) => (
            <div key={`${car.id}-${idx}`} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start shrink-0">
              <VehicleCard
                car={car}
                dealer={dealers.find(d => d.id === car.dealerId)}
                onSelect={onSelectListing}
                onToggleCompare={onToggleCompare}
                isComparing={compareList.some(c => c.id === car.id)}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favoritesList.some(f => f.id === car.id)}
              />
            </div>
          ))
        ) : (
          <div className="w-full py-12 text-center text-[var(--color-text-muted)] font-sans">
            No premium inventory available right now.
          </div>
        )}
      </div>

      {hasMore && !isDbLoading && paginatedListings.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-orange-500/50 text-[var(--color-text-main)] font-sans font-medium px-6 py-3 rounded-md transition-all disabled:opacity-50"
          >
            {loadingMore ? (
              <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {lang === 'en' ? 'Load More Vehicles' : 'مزید گاڑیاں دیکھیں'} <ChevronDown size={18} />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
