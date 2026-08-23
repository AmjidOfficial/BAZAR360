import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Car, Clock, CheckCircle2, XCircle, Tag, Trash2, Edit2, 
  Sparkles, Eye
} from 'lucide-react';
import { CarListing } from '../types';
import { UserProfile, dbSaveListing, dbDeleteListing } from '../lib/dbService';
import { LazyImage } from './LazyImage';
import { useCurrencyMode } from '../lib/currency';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { canDeleteListing } from '../lib/permissions';

interface MyPostsProps {
  currentUser: UserProfile;
  listings: CarListing[];
  lang: 'en' | 'ur';
  onSelectListing?: (car: CarListing) => void;
  onPostCreated?: (car: CarListing) => void;
  onDeleteListing?: (listingId: string) => void;
}

export function MyPosts({
  currentUser,
  listings = [],
  lang,
  onSelectListing,
  onDeleteListing
}: MyPostsProps) {
  const { renderPrice } = useCurrencyMode();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'sold' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCar, setEditingCar] = useState<CarListing | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editMileage, setEditMileage] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Debounced auto-save for listing edit details
  const [listingAutoSaveStatus, setListingAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const isListingInitialMount = useRef(true);

  useEffect(() => {
    if (!editingCar) {
      isListingInitialMount.current = true;
      setListingAutoSaveStatus('idle');
      return;
    }

    if (isListingInitialMount.current) {
      isListingInitialMount.current = false;
      return;
    }

    setListingAutoSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const updated: CarListing = {
          ...editingCar,
          price: editPrice,
          mileage: editMileage
        };
        await dbSaveListing(updated);
        setListingAutoSaveStatus('saved');
        setTimeout(() => setListingAutoSaveStatus('idle'), 2500);
      } catch (err) {
        console.error('[Auto-save] listing update error:', err);
        setListingAutoSaveStatus('failed');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [editPrice, editMileage, editingCar]);

  // Filter listings assigned to or created by current user
  const userListings = useMemo(() => {
    return listings.filter(item => {
      const isOwner = item.createdBy === currentUser.uid;
      const isAssignedRep = item.assignedSalesRepId === currentUser.uid;
      const isDealerOwner = item.dealerId === currentUser.uid;
      const isPhoneMatch = currentUser.phoneNumber && (item.sellerPhone === currentUser.phoneNumber || item.phone === currentUser.phoneNumber);
      return isOwner || isAssignedRep || isDealerOwner || isPhoneMatch;
    });
  }, [listings, currentUser]);

  // Helper to check if a car is rejected
  const isCarRejected = (car: CarListing): boolean => {
    const raw = car as any;
    return raw.rejected === true || raw.status === 'rejected' || raw.approved === 'rejected';
  };

  // Apply search query and status filter
  const filteredListings = useMemo(() => {
    return userListings.filter(car => {
      const locationText = car.registrationCity || car.region || 'Peshawar';
      const matchesSearch = searchQuery === '' || 
        `${car.year} ${car.make} ${car.model} ${locationText}`.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status chip filter
      if (filterStatus === 'all') return true;
      if (filterStatus === 'sold') return car.isSold === true || car.status === 'Sold';
      if (filterStatus === 'rejected') return isCarRejected(car);
      if (filterStatus === 'pending') return car.approved === false && !isCarRejected(car) && !car.isSold && car.status !== 'Sold';
      if (filterStatus === 'active') return car.approved === true && !car.isSold && car.status !== 'Sold';

      return true;
    });
  }, [userListings, filterStatus, searchQuery]);

  // Count metrics
  const counts = useMemo(() => {
    return {
      all: userListings.length,
      active: userListings.filter(l => l.approved && !l.isSold && l.status !== 'Sold').length,
      pending: userListings.filter(l => !l.approved && !isCarRejected(l) && !l.isSold && l.status !== 'Sold').length,
      sold: userListings.filter(l => l.isSold || l.status === 'Sold').length,
      rejected: userListings.filter(l => isCarRejected(l)).length
    };
  }, [userListings]);

  // Handle Mark Sold / Mark Available toggle
  const handleToggleSold = async (car: CarListing) => {
    try {
      const updated: CarListing = { 
        ...car, 
        isSold: !car.isSold,
        status: !car.isSold ? 'Sold' : 'Available'
      };
      await dbSaveListing(updated);
      console.log(updated.isSold ? 'Listing marked as Sold!' : 'Listing marked as Available!');
    } catch (err) {
      toast.error('Failed to update listing status.');
    }
  };

  // Handle Edit Price & Mileage submission
  const handleSaveEdit = async () => {
    if (!editingCar) return;
    setIsUpdating(true);
    try {
      const updated: CarListing = {
        ...editingCar,
        price: editPrice,
        mileage: editMileage
      };
      await dbSaveListing(updated);
      console.log('Listing details updated successfully!');
      setEditingCar(null);
    } catch (err) {
      toast.error('Failed to save listing changes.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete
  const handleDelete = async (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    if (!canDeleteListing(currentUser as any, listing)) {
      toast.error('Permission Denied: You do not have authorization to delete this listing.');
      return;
    }

    if (window.confirm('Are you sure you want to permanently delete this vehicle post?')) {
      try {
        await dbDeleteListing(listingId);
        if (onDeleteListing) {
          onDeleteListing(listingId);
        }
        console.log('Post removed from database.');
      } catch (err) {
        toast.error('Failed to delete post.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 p-6 rounded-2xl border border-amber-500/20 shadow-lg relative overflow-hidden text-left">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-black text-[var(--color-text-header)] uppercase tracking-wider">
                {lang === 'ur' ? 'میرے اشتہارات اور میڈیا' : 'My Posts & Media Library'}
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-1 max-w-xl">
              {lang === 'ur'
                ? 'اپنے پوسٹ کردہ تمام وسائل اور گاڑیوں کی حیثیت کو ریئل ٹائم میں ٹریک اور اپ ڈیٹ کریں۔'
                : 'Track, edit, mark as sold, or update pricing and media for all your uploaded vehicles in real time.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-bg-primary/80 border border-border-main/60 rounded-xl text-xs font-mono text-amber-400 font-bold">
              Total Assets: {userListings.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--color-bg-secondary)] p-3 rounded-2xl border border-[var(--color-border-main)] shadow-sm">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Posts', count: counts.all, color: 'text-text-muted' },
            { id: 'active', label: 'Active', count: counts.active, color: 'text-[var(--color-accent-main)]' },
            { id: 'pending', label: 'Pending Review', count: counts.pending, color: 'text-amber-400' },
            { id: 'sold', label: 'Sold', count: counts.sold, color: 'text-blue-400' },
            { id: 'rejected', label: 'Rejected', count: counts.rejected, color: 'text-rose-400' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold scale-105'
                  : 'bg-bg-secondary/40 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-bg-tertiary/60 border border-[var(--color-border-main)]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] bg-bg-primary/40 font-mono ${tab.color}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Search my posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-primary/60 border border-[var(--color-border-main)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text-main)] placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Posts Grid */}
      {filteredListings.length === 0 ? (
        <div className="p-12 text-center bg-[var(--color-bg-secondary)] border border-dashed border-[var(--color-border-main)] rounded-3xl space-y-3">
          <Car className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-black uppercase text-[var(--color-text-main)] tracking-wider">
            No Vehicles Found in this Category
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
            {searchQuery 
              ? 'No listings matched your search query. Try clearing your search.' 
              : 'You haven\'t uploaded any vehicles matching this status filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredListings.map(car => {
              // Determine status badge
              let statusBadge = {
                label: 'Active',
                bg: 'bg-[var(--color-accent-main)]/15 border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)]',
                icon: <CheckCircle2 size={12} />
              };

              if (car.isSold || car.status === 'Sold') {
                statusBadge = {
                  label: 'Sold',
                  bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
                  icon: <Tag size={12} />
                };
              } else if (isCarRejected(car)) {
                statusBadge = {
                  label: 'Rejected',
                  bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
                  icon: <XCircle size={12} />
                };
              } else if (!car.approved) {
                statusBadge = {
                  label: 'Pending Approval',
                  bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
                  icon: <Clock size={12} />
                };
              }

              const cityText = car.registrationCity || car.region || 'Peshawar';

              return (
                <motion.div
                  key={car.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-amber-500/40 rounded-2xl overflow-hidden shadow text-left flex flex-col transition-all group"
                >
                  {/* Image & Status Overlay */}
                  <div className="relative h-44 bg-bg-primary overflow-hidden">
                    <LazyImage
                      src={car.images?.[0] || car.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-md shadow-md ${statusBadge.bg}`}>
                        {statusBadge.icon}
                        <span>{statusBadge.label}</span>
                      </span>
                    </div>

                    <div className="absolute bottom-2 right-2 bg-bg-primary/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border-main/60 text-xs font-mono font-black text-amber-400">
                      {renderPrice(car.price)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-black text-[var(--color-text-main)] uppercase tracking-wide truncate">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)] font-mono mt-0.5">
                        {cityText} • {car.mileage?.toLocaleString() || 0} KM • {car.condition || 'Used'}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-[var(--color-border-main)] flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSold(car)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          car.isSold || car.status === 'Sold'
                            ? 'bg-[var(--color-accent-main)]/15 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                        }`}
                        title={car.isSold ? 'Mark as Available' : 'Mark as Sold'}
                      >
                        {car.isSold || car.status === 'Sold' ? 'Available' : 'Mark Sold'}
                      </button>

                      <button
                        onClick={() => {
                          setEditingCar(car);
                          setEditPrice(car.price);
                          setEditMileage(car.mileage || 0);
                        }}
                        className="flex-1 py-1.5 bg-bg-tertiary hover:bg-slate-700 text-orange-400 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>

                      {onSelectListing && (
                        <button
                          onClick={() => onSelectListing(car)}
                          className="p-1.5 bg-bg-tertiary hover:bg-slate-700 text-text-muted rounded-lg transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(car.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      {editingCar && (
        <div className="fixed inset-0 z-50 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border-main)] pb-3">
              <h3 className="text-sm font-black uppercase text-[var(--color-text-main)] tracking-wider">
                Quick Update: {editingCar.year} {editingCar.make} {editingCar.model}
              </h3>
              {listingAutoSaveStatus !== 'idle' && (
                <div className="shrink-0">
                  {listingAutoSaveStatus === 'saving' && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono uppercase tracking-wider text-amber-500">
                      <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                      Saving...
                    </span>
                  )}
                  {listingAutoSaveStatus === 'saved' && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono uppercase tracking-wider text-[var(--color-accent-main)]">
                      Auto-Saved
                    </span>
                  )}
                  {listingAutoSaveStatus === 'failed' && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono uppercase tracking-wider text-red-500">
                      Failed
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-widest block mb-1">
                  Price (PKR)
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full bg-bg-primary border border-[var(--color-border-main)] rounded-xl px-3 py-2 text-sm font-mono text-[var(--color-text-main)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-widest block mb-1">
                  Mileage (KM)
                </label>
                <input
                  type="number"
                  value={editMileage}
                  onChange={(e) => setEditMileage(Number(e.target.value))}
                  className="w-full bg-bg-primary border border-[var(--color-border-main)] rounded-xl px-3 py-2 text-sm font-mono text-[var(--color-text-main)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border-main)]">
              <button
                onClick={() => setEditingCar(null)}
                className="px-4 py-2 bg-bg-tertiary hover:bg-slate-700 text-text-muted text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase rounded-xl shadow cursor-pointer"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
