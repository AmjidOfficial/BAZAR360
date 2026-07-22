import React, { useState } from 'react';
import { ShieldCheck, Plus, Check, X, Trash2, Edit2, Car, MapPin } from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { UserProfile } from '../lib/dbService';

interface AdminModerationDeckProps {
  listings: CarListing[];
  dealers: Dealer[];
  onApproveListing: (id: string) => void;
  onRejectListing: (id: string) => void;
  currentUser?: UserProfile | null;
}

export default function AdminModerationDeck({
  listings,
  dealers,
  onApproveListing,
  onRejectListing,
  currentUser
}: AdminModerationDeckProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'post-car'>('pending');
  const [postMode, setPostMode] = useState<'individual' | 'showroom'>('individual');
  const [selectedDealerId, setSelectedDealerId] = useState('');
  
  // Basic Form State
  const [title, setTitle] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');

  const pendingListings = listings.filter((l) => l.approved === false);

  const handleAdminPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { collection, doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const newListing: any = {
        id: `lst-${Date.now()}`,
        title,
        make,
        model,
        year: 2024,
        price: Number(price),
        mileage: Number(mileage),
        fuelType: 'Petrol',
        transmission: 'Automatic',
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80',
        verified: true,
        featured: true,
        dealerId: postMode === 'showroom' ? selectedDealerId : 'admin-private',
        description: 'Posted by BAZAR360 Admin',
        createdAt: new Date().toISOString(),
        tags: [],
        specs: { color: 'Black', engineSize: '1.8L', horsepower: '140' },
        ownerId: currentUser?.uid || 'admin',
        approved: true
      };

      await setDoc(doc(db, 'listings', newListing.id), newListing);
      alert('Listing created successfully!');
      setTitle('');
      setMake('');
      setModel('');
      setPrice('');
      setMileage('');
    } catch (error: any) {
      alert(`Error posting: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-[var(--color-bg-secondary)] p-2 rounded-2xl border border-[var(--color-border-main)] overflow-x-auto">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-mono font-black uppercase text-[10px] tracking-wider rounded-xl transition duration-100 shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-orange-500 text-slate-950 shadow'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] bg-white/5'
          }`}
        >
          <ShieldCheck size={12} />
          Pending Approvals ({pendingListings.length})
        </button>
        <button 
          onClick={() => setActiveTab('post-car')}
          className={`px-4 py-2 font-mono font-black uppercase text-[10px] tracking-wider rounded-xl transition duration-100 shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'post-car'
              ? 'bg-orange-500 text-slate-950 shadow'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] bg-white/5'
          }`}
        >
          <Plus size={12} />
          Admin Post Car
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6">
          <h3 className="text-lg font-black text-[var(--color-text-header)] uppercase mb-4">Pending Approvals</h3>
          {pendingListings.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-xs">No pending listings.</p>
          ) : (
            <div className="space-y-4">
              {pendingListings.map(car => (
                <div key={car.id} className="flex justify-between items-center bg-[var(--color-bg-primary)] p-4 rounded-xl border border-[var(--color-border-main)]">
                  <div className="flex items-center gap-4">
                    <img src={car.imageUrl} alt={car.title} className="w-16 h-12 object-cover rounded-lg" />
                    <div>
                      <p className="text-[var(--color-text-header)] font-bold text-sm uppercase">{car.title}</p>
                      <p className="text-[var(--color-text-muted)] text-[10px] uppercase font-mono">ID: {car.id} | Dealer: {car.dealerId}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onApproveListing(car.id)} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20"><Check size={16} /></button>
                    <button onClick={() => onRejectListing(car.id)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20"><X size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'post-car' && (
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6">
          <h3 className="text-lg font-black text-[var(--color-text-header)] uppercase mb-4">Admin Vehicle Posting Module</h3>
          
          <form onSubmit={handleAdminPost} className="space-y-4">
            <div className="flex gap-4 p-4 bg-black/20 rounded-xl border border-[var(--color-border-main)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="postMode" 
                  checked={postMode === 'individual'} 
                  onChange={() => setPostMode('individual')}
                  className="accent-orange-500"
                />
                <span className="text-[var(--color-text-header)] text-xs font-bold uppercase tracking-wide">Individual Post</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="postMode" 
                  checked={postMode === 'showroom'} 
                  onChange={() => setPostMode('showroom')}
                  className="accent-orange-500"
                />
                <span className="text-[var(--color-text-header)] text-xs font-bold uppercase tracking-wide">On Behalf of Showroom</span>
              </label>
            </div>

            {postMode === 'showroom' && (
              <div className="space-y-2">
                <label className="text-[var(--color-text-muted)] text-[10px] font-mono uppercase">Select Showroom</label>
                <select 
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] text-xs focus:outline-none focus:border-orange-500"
                  value={selectedDealerId}
                  onChange={(e) => setSelectedDealerId(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Showroom --</option>
                  {dealers.map(dealer => (
                    <option key={dealer.id} value={dealer.id}>{dealer.name} ({dealer.location})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[var(--color-text-muted)] text-[10px] font-mono uppercase">Listing Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] text-xs focus:outline-none focus:border-orange-500" placeholder="e.g. Honda Civic Oriel 2024" />
              </div>
              <div className="space-y-2">
                <label className="text-[var(--color-text-muted)] text-[10px] font-mono uppercase">Price (PKR)</label>
                <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] text-xs focus:outline-none focus:border-orange-500" placeholder="8500000" />
              </div>
              <div className="space-y-2">
                <label className="text-[var(--color-text-muted)] text-[10px] font-mono uppercase">Make</label>
                <input type="text" required value={make} onChange={e => setMake(e.target.value)} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] text-xs focus:outline-none focus:border-orange-500" placeholder="Honda" />
              </div>
              <div className="space-y-2">
                <label className="text-[var(--color-text-muted)] text-[10px] font-mono uppercase">Model</label>
                <input type="text" required value={model} onChange={e => setModel(e.target.value)} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] text-xs focus:outline-none focus:border-orange-500" placeholder="Civic" />
              </div>
              <div className="space-y-2">
                <label className="text-[var(--color-text-muted)] text-[10px] font-mono uppercase">Mileage (km)</label>
                <input type="number" required value={mileage} onChange={e => setMileage(e.target.value)} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] text-xs focus:outline-none focus:border-orange-500" placeholder="15000" />
              </div>
            </div>

            <button type="submit" className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black uppercase text-xs rounded-xl shadow-lg transition-all w-full md:w-auto flex items-center justify-center gap-2">
              <Plus size={16} /> Publish Listing
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
