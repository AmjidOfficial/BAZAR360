import React, { useState } from 'react';
import { CarListing } from '../../types';
import { UserProfile, dbSaveListing, dbDeleteListing } from '../../lib/dbService';
import { dbLogUserActivity } from '../../lib/userProfileService';
import { EmptyState } from './EmptyState';
import { 
  Car, PlusCircle, CheckCircle, Clock, XCircle, Trash2, Tag, 
  ExternalLink, Edit, Check, Eye
} from 'lucide-react';
import { useCurrencyMode } from '../../lib/currency';
import { toast } from 'sonner';

interface MyVehiclesProps {
  user: UserProfile;
  listings: CarListing[];
  onSelectListing?: (car: CarListing) => void;
  onDeleteListing?: (id: string) => void;
  onPostVehicleClick?: () => void;
}

export const MyVehicles: React.FC<MyVehiclesProps> = ({
  user,
  listings,
  onSelectListing,
  onDeleteListing,
  onPostVehicleClick
}) => {
  const { renderPrice } = useCurrencyMode();
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending' | 'sold'>('all');

  // Strict user filter: only listings created by this authenticated user UID or phone
  const userPostedVehicles = listings.filter((car) => {
    if (car.createdBy === user.uid) return true;
    if ((car as any).ownerId === user.uid) return true;
    if (user.phoneNumber && (car.sellerPhone === user.phoneNumber || car.phone === user.phoneNumber)) return true;
    return false;
  });

  const filteredVehicles = userPostedVehicles.filter((car) => {
    if (statusFilter === 'published') return !car.isSold && car.approved !== false;
    if (statusFilter === 'pending') return car.approved === false;
    if (statusFilter === 'sold') return car.isSold === true;
    return true;
  });

  const handleMarkSold = async (car: CarListing) => {
    try {
      const updated = { ...car, isSold: !car.isSold };
      await dbSaveListing(updated);
      
      await dbLogUserActivity({
        userId: user.uid,
        action: 'UPDATE_VEHICLE_STATUS',
        description: `Marked vehicle "${car.make} ${car.model} ${car.year}" as ${updated.isSold ? 'SOLD' : 'AVAILABLE'}.`
      });

      toast.success(updated.isSold ? 'Vehicle marked as Sold!' : 'Vehicle marked as Available!');
    } catch (err) {
      toast.error('Failed to update vehicle status.');
    }
  };

  const handleDelete = async (carId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete listing "${title}"?`)) return;

    try {
      await dbDeleteListing(carId);
      if (onDeleteListing) onDeleteListing(carId);

      await dbLogUserActivity({
        userId: user.uid,
        action: 'DELETE_VEHICLE',
        description: `Deleted listing ID "${carId}" (${title}).`
      });

      toast.success('Listing deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete listing.');
    }
  };

  if (userPostedVehicles.length === 0) {
    return (
      <EmptyState
        icon={Car}
        title="You haven't listed a vehicle yet"
        description="Share your car details with thousands of verified buyers across Pakistan on Bazar360."
        actionLabel="Sell Your Vehicle"
        onAction={onPostVehicleClick}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Header & Post New Vehicle CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <div>
          <h3 className="text-base font-bold font-display text-[var(--color-text-main)] flex items-center gap-2">
            <Car className="w-4 h-4 text-sky-400" />
            My Posted Vehicles ({userPostedVehicles.length})
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] font-sans">
            Manage your live marketplace listings, mark as sold, or post a new vehicle.
          </p>
        </div>

        <button
          onClick={onPostVehicleClick}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-[var(--color-text-header)] font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Vehicle</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
        {(['all', 'published', 'pending', 'sold'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-3.5 py-1.5 rounded-xl font-bold uppercase transition-all cursor-pointer ${
              statusFilter === filter
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text-main)]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVehicles.map((car) => (
          <div
            key={car.id}
            className="flex flex-col rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden shadow-sm hover:border-sky-500/30 transition-all"
          >
            <div className="relative h-44 bg-bg-secondary overflow-hidden">
              <img
                src={car.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400'}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Status Badge overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                {car.isSold ? (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/90 text-[var(--color-text-header)] font-mono text-[10px] font-black uppercase tracking-wider shadow-md">
                    Sold Out
                  </span>
                ) : car.approved === false ? (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/90 text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending Review
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--color-accent-main)]/90 text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Live
                  </span>
                )}
              </div>

              {/* Price Overlay */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-bg-primary/80 backdrop-blur-xs text-sky-400 font-mono font-black text-sm">
                {renderPrice(car.price)}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-sm font-display text-[var(--color-text-main)]">
                  {car.year} {car.make} {car.model}
                </h4>
                <div className="text-xs text-[var(--color-text-muted)] font-mono flex items-center gap-3 mt-1">
                  <span>{car.mileage ? `${Number(car.mileage).toLocaleString()} KM` : 'Unspecified KM'}</span>
                  <span>•</span>
                  <span>{car.fuelType || 'Petrol'}</span>
                  <span>•</span>
                  <span>{car.location || car.registrationCity || 'Peshawar'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
                <button
                  onClick={() => onSelectListing && onSelectListing(car)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-main)] flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" /> View
                </button>

                <button
                  onClick={() => handleMarkSold(car)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1 ${
                    car.isSold
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                      : 'bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/30 hover:bg-[var(--color-accent-main)]/20'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{car.isSold ? 'Re-list' : 'Mark Sold'}</span>
                </button>

                <button
                  onClick={() => handleDelete(car.id, `${car.year} ${car.make} ${car.model}`)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                  title="Delete Listing"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
