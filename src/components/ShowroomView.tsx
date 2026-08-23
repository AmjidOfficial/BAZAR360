import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'motion/react';
import { Dealer, CarListing, Review } from '../types';
import { dbFetchReviews, dbAddReview } from '../lib/dbService';
import { fetchDealerByIdOrSlug } from '../lib/dealerRepository';
import { fetchShowroomInventoryPage } from '../lib/inventoryRepository';
import { useAuth } from './AuthContext';
import { ShowroomLoading } from './ShowroomLoading';
import { VehicleDetail } from './VehicleDetail';
import ShowroomMiniSite from './ShowroomMiniSite';
import DetailedVehiclePostingPage from './DetailedVehiclePostingPage';
import ContactDrawer from './ContactDrawer';
import { X, ArrowLeft, ShieldCheck } from 'lucide-react';

export function ShowroomView() {
  const { showroomSlug, carId } = useParams<{ showroomSlug: string; carId?: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostingModal, setShowPostingModal] = useState(false);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [contactDrawerMessage, setContactDrawerMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const foundDealer = await fetchDealerByIdOrSlug(showroomSlug || '');
        if (cancelled) return;
        setDealer(foundDealer);
        setLoading(false);
        if (!foundDealer) return;
        const showroomId = foundDealer.id;
        void fetchShowroomInventoryPage(showroomId, 24).then(page => {
          if (!cancelled) setListings(page.listings);
        }).catch(err => console.error('[ShowroomView] inventory load failed:', err));
        void dbFetchReviews(showroomId).then(revs => {
          if (!cancelled) setReviews(revs || []);
        }).catch(err => console.warn('[ShowroomView] reviews load failed:', err));
      } catch (err) {
        console.error('[ShowroomView] identity load failed:', err);
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [showroomSlug]);

  const selectedCar = carId ? listings.find(l => l.id === carId) : null;
  if (loading) return <ShowroomLoading />;
  if (!dealer) return <NotFoundView onBack={() => navigate('/')} />;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-main)] font-sans">
      <Toaster position="top-center" theme="dark" richColors />
      <AnimatePresence mode="wait">
        {selectedCar && <VehicleDetail car={selectedCar} dealer={dealer} onClose={() => navigate(`/showroom/${showroomSlug}`)} />}
      </AnimatePresence>
      <ShowroomMiniSite
        dealer={dealer}
        listings={listings}
        reviews={reviews}
        onAddReview={async (comment, rating) => {
          try {
            const newRev: Review = { id: `rev-${Date.now()}`, author: currentUser?.displayName || 'Guest User', rating, comment, date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) };
            await dbAddReview(dealer.id, newRev);
            setReviews(prev => [newRev, ...prev]);
          } catch (err) { console.error(err); }
        }}
        onSelectListing={listing => navigate(`/showroom/${showroomSlug}/car/${listing.id}`)}
        currentUser={currentUser}
        onNavigateToSell={() => setShowPostingModal(true)}
        onOpenSupportDrawer={msg => { setContactDrawerMessage(msg || ''); setIsContactDrawerOpen(true); }}
        onBack={() => navigate('/')}
      />
      <ContactDrawer isOpen={isContactDrawerOpen} onClose={() => setIsContactDrawerOpen(false)} lang="en" initialMessage={contactDrawerMessage} />
      {showPostingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <button onClick={() => setShowPostingModal(false)} className="absolute top-4 right-4 z-50 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] bg-white/10 rounded-full transition-all cursor-pointer" title="Close Posting Studio"><X size={18} /></button>
            <DetailedVehiclePostingPage currentUser={currentUser} contextDealerId={dealer.id} onPostCreated={() => setShowPostingModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function NotFoundView({ onBack }: { onBack: () => void }) {
  return <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-6"><div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-12 max-w-md w-full text-center shadow-2xl space-y-6"><div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-500"><ShieldCheck size={40} className="animate-pulse" /></div><div className="space-y-2"><h2 className="text-2xl font-black text-[var(--color-text-main)] font-sans uppercase tracking-tight">Showroom Not Recognized</h2><p className="text-[var(--color-text-muted)] text-sm font-sans leading-relaxed">The requested showroom path does not exist or has been removed from our verified registry.</p></div><button onClick={onBack} className="w-full bg-orange-600 hover:bg-orange-700 text-[var(--color-text-header)] font-black font-sans py-3.5 px-6 rounded-xl uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer"><ArrowLeft size={16} />Return to Marketplace</button></div></div>;
}
