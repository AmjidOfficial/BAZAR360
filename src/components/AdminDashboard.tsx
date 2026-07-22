import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Car, 
  Users, 
  Clock, 
  Trash2, 
  ExternalLink, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Settings, 
  Sparkles, 
  MessageCircle,
  FileCheck2,
  Lock
} from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { useTheme } from './ThemeContext';
import { useCurrencyMode } from '../lib/currency';

interface AdminDashboardProps {
  listings: CarListing[];
  dealers: Dealer[];
  onDeleteListing?: (id: string) => void;
  onDeleteDealer?: (id: string) => void;
  lang: 'en' | 'ur';
  setTab: (tab: string) => void;
}

export default function AdminDashboard({
  listings,
  dealers,
  onDeleteListing,
  onDeleteDealer,
  lang,
  setTab
}: AdminDashboardProps) {
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    
  }, [setTheme]);
  const { renderPrice } = useCurrencyMode();
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<'listings' | 'showrooms'>('listings');
  const [searchTerm, setSearchTerm] = useState('');

  // Summarized metrics
  const totalListings = listings.length;
  const activeShowrooms = dealers.length;
  const pendingModeration = listings.filter(l => l.approved === false).length;
  const premiumFeatured = listings.filter(l => l.featured).length;

  // Single-Window operations using window.open
  const handleSingleWindowOpen = (url: string) => {
    // Isolated viewport targeting to maintain session security
    window.open(url, '_blank', 'noopener,noreferrer,width=1280,height=800');
  };

  const filteredListings = listings.filter(car => 
    car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDealers = dealers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-6 sm:p-8 font-sans pb-24">
      
      {/* Title section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border-main)] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl">
              <Lock size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-black font-display tracking-tight text-[var(--color-text-header)] uppercase">
                {isUrdu ? 'انتظامی ڈیش بورڈ' : 'BAZAR360 Administrative HQ'}
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                Central command center for showroom stock, dealer access, and compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSingleWindowOpen('/?tab=profile')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-[var(--color-text-header)] rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Settings size={13} />
            <span>Open Settings Module</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Row */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        
        {/* Total Vehicles Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest font-bold">Total Cars</span>
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20">
              <Car size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text-header)] mt-4 tracking-tight">{totalListings}</h2>
          <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">Vehicles in system</p>
        </div>

        {/* Active Showrooms Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest font-bold">Showrooms</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
              <Users size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text-header)] mt-4 tracking-tight">{activeShowrooms}</h2>
          <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">Registered Dealerships</p>
        </div>

        {/* Pending Moderation */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest font-bold">Moderation</span>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <Clock size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text-header)] mt-4 tracking-tight">{pendingModeration}</h2>
          <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">Awaiting verification</p>
        </div>

        {/* Premium Featured */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest font-bold">Featured Slots</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
              <Sparkles size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text-header)] mt-4 tracking-tight">{premiumFeatured}</h2>
          <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">Highlighted elite slots</p>
        </div>

      </div>

      {/* Main content grid */}
      <div className="max-w-7xl mx-auto bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Tab Controls & Search Lockup */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-950 p-1 border border-slate-800 rounded-xl self-start">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'listings' ? 'bg-orange-500 text-[var(--color-text-header)] shadow' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              Vehicles Inventory ({filteredListings.length})
            </button>
            <button
              onClick={() => setActiveTab('showrooms')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'showrooms' ? 'bg-orange-500 text-[var(--color-text-header)] shadow' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              Showrooms ({filteredDealers.length})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search administration logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-[var(--color-text-header)] placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Tabular Lists */}
        <div className="overflow-x-auto">
          {activeTab === 'listings' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/20 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">
                  <th className="p-4 font-bold">Vehicle details</th>
                  <th className="p-4 font-bold">Showroom ID</th>
                  <th className="p-4 font-bold">Price Spec</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs font-mono text-slate-500">
                      No matching vehicles in inventory directory.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((car) => (
                    <tr key={car.id} className="hover:bg-slate-900/30 transition-all text-xs">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={car.imageUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=100'} 
                            alt={car.title}
                            className="w-12 h-8 object-cover rounded-lg border border-slate-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-[var(--color-text-header)]">{car.title}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5 uppercase tracking-wide">
                              {car.make} • {car.model} • {car.year}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-300 font-bold">
                        {car.dealerId}
                      </td>
                      <td className="p-4 font-mono font-bold text-orange-400">
                        {renderPrice(car.price)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          car.approved ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        }`}>
                          {car.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleSingleWindowOpen(`/?tab=showroom&id=${car.dealerId}`)}
                            className="p-1.5 bg-slate-900 text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] border border-slate-800 rounded-lg cursor-pointer transition-all"
                            title="Inspect showroom single-window mode"
                          >
                            <ExternalLink size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteListing && onDeleteListing(car.id)}
                            className="p-1.5 bg-rose-500/10 text-rose-400 hover:text-[var(--color-text-header)] hover:bg-rose-500 border border-rose-500/20 rounded-lg cursor-pointer transition-all"
                            title="Delete Stock Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/20 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">
                  <th className="p-4 font-bold">Showroom name</th>
                  <th className="p-4 font-bold">Location context</th>
                  <th className="p-4 font-bold">Contact detail</th>
                  <th className="p-4 font-bold">Theme mode</th>
                  <th className="p-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredDealers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs font-mono text-slate-500">
                      No matching registered showrooms found.
                    </td>
                  </tr>
                ) : (
                  filteredDealers.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-slate-900/30 transition-all text-xs">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center font-black text-sm uppercase">
                            {dealer.name.substring(0,1)}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--color-text-header)]">{dealer.name}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5">
                              {dealer.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {dealer.location}
                      </td>
                      <td className="p-4 font-mono text-[var(--color-text-muted)]">
                        {dealer.phone}
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-mono font-bold text-orange-400">
                          {dealer.theme_choice || 'Cosmic'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleSingleWindowOpen(`/?tab=showroom&id=${dealer.id}`)}
                            className="p-1.5 bg-slate-900 text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] border border-slate-800 rounded-lg cursor-pointer transition-all"
                            title="Manage showroom single-window mode"
                          >
                            <ExternalLink size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteDealer && onDeleteDealer(dealer.id)}
                            className="p-1.5 bg-rose-500/10 text-rose-400 hover:text-[var(--color-text-header)] hover:bg-rose-500 border border-rose-500/20 rounded-lg cursor-pointer transition-all"
                            title="Delete Showroom"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
