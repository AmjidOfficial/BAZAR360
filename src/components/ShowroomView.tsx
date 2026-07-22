import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'motion/react';
import { Dealer, CarListing, Review } from '../types';
import { 
  dbFetchDealers, 
  dbFetchListings,
  dbFetchReviews,
  dbAddReview
} from '../lib/dbService';
import { useAuth } from './AuthContext';
import { ShowroomLoading } from './ShowroomLoading';
import { VehicleDetail } from './VehicleDetail';
import ShowroomMiniSite from './ShowroomMiniSite';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export function ShowroomView() {
  const { showroomSlug, carId } = useParams<{ showroomSlug: string; carId?: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShowroomData = async () => {
      setLoading(true);
      try {
        const allDealers = await dbFetchDealers();
        const allListings = await dbFetchListings();
        
        const targetSlug = (showroomSlug || '').toLowerCase();
        const foundDealer = allDealers.find(d => {
          const generatedSlug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          return (
            generatedSlug === targetSlug || 
            d.id?.toLowerCase() === targetSlug || 
            (d.id === 'auto-choice-peshawar' && (targetSlug === 'auto-choice' || targetSlug === 'auto-choice-peshawar'))
          );
        });

        if (foundDealer) {
          setDealer(foundDealer);
          const filtered = allListings.filter(l => l.dealerId === foundDealer.id && l.approved);
          setListings(filtered);
          try {
            const revs = await dbFetchReviews(foundDealer.id);
            setReviews(revs || []);
          } catch (rErr) {
            console.warn('Error fetching reviews:', rErr);
          }
        }
      } catch (err) {
        console.error('[ShowroomView] Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadShowroomData();
  }, [showroomSlug]);

  const selectedCar = carId ? listings.find(l => l.id === carId) : null;

  if (loading) return <ShowroomLoading />;
  if (!dealer) return <NotFoundView onBack={() => navigate('/')} />;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-main)] font-sans">
      <Toaster position="top-center" theme="dark" richColors />
      
      <AnimatePresence mode="wait">
        {selectedCar && (
          <VehicleDetail 
            car={selectedCar} 
            dealer={dealer} 
            onClose={() => navigate(`/showroom/${showroomSlug}`)} 
          />
        )}
      </AnimatePresence>

      <ShowroomMiniSite
        dealer={dealer}
        listings={listings}
        reviews={reviews}
        onAddReview={async (comment, rating) => {
          try {
            const newRev: Review = {
              id: `rev-${Date.now()}`,
              author: currentUser?.displayName || 'Guest User',
              rating,
              comment,
              date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            };
            await dbAddReview(dealer.id, newRev);
            setReviews(prev => [newRev, ...prev]);
          } catch (err) {
            console.error(err);
          }
        }}
        onSelectListing={(listing) => {
          navigate(`/showroom/${showroomSlug}/car/${listing.id}`);
        }}
        currentUser={currentUser}
        onNavigateToSell={() => navigate('/')}
        onBack={() => {
          navigate('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

function NotFoundView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-6">
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-12 max-w-md w-full text-center shadow-2xl space-y-6">
        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-500">
          <ShieldCheck size={40} className="animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[var(--color-text-main)] font-sans uppercase tracking-tight">Showroom Not Recognized</h2>
          <p className="text-[var(--color-text-muted)] text-sm font-sans leading-relaxed">
            The requested showroom path does not exist or has been removed from our verified registry.
          </p>
        </div>
        <button 
          onClick={onBack}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black font-sans py-3.5 px-6 rounded-xl uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Return to Marketplace
        </button>
      </div>
    </div>
  );
}
