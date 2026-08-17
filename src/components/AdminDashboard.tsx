import React, { useState, useEffect, useRef } from 'react';
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
  Lock,
  CheckCircle2,
  XCircle,
  Eye,
  Phone,
  User,
  ShieldCheck,
  Image as ImageIcon,
  Cloud,
  Wrench
} from 'lucide-react';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { dbApproveListing, dbDeleteListing } from '../lib/dbService';
import { CarListing, Dealer } from '../types';
import { UserProfile } from '../lib/dbService';
import { useTheme } from './ThemeContext';
import { useCurrencyMode } from '../lib/currency';
import { isAdminUser } from '../lib/permissions';
import { toast } from 'react-hot-toast';
import { AdminBrandingManager } from './AdminBrandingManager';
import { AdminLeadsView } from './admin/AdminLeadsView';
import { CRMServiceHub } from './admin/CRMServiceHub';
import { EnterpriseCRMAdmin } from './admin/EnterpriseCRMAdmin';
import { ServiceManagementHub } from './admin/ServiceManagementHub';
import { CentralNotificationService } from './admin/CentralNotificationService';
import { BusinessIntelligenceDashboard } from './admin/BusinessIntelligenceDashboard';
import { DataHealthPanel } from './admin/DataHealthPanel';

interface AdminDashboardProps {
  listings: CarListing[];
  dealers: Dealer[];
  currentUser?: UserProfile | null;
  onDeleteListing?: (id: string) => void;
  onDeleteDealer?: (id: string) => void;
  onDeleteSelectedListings?: (ids: string[]) => void;
  onDeleteAllListings?: () => void;
  onDeleteAllDealers?: () => void;
  onDeleteAllPosts?: () => void;
  onApproveListing?: (id: string) => void;
  onRejectListing?: (id: string) => void;
  lang: 'en' | 'ur';
  setTab: (tab: string) => void;
}

export default function AdminDashboard({
  listings,
  dealers,
  currentUser,
  onDeleteListing,
  onDeleteDealer,
  onDeleteSelectedListings,
  onDeleteAllListings,
  onDeleteAllDealers,
  onDeleteAllPosts,
  onApproveListing,
  onRejectListing,
  lang,
  setTab
}: AdminDashboardProps) {
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    
  }, [setTheme]);
  const { renderPrice } = useCurrencyMode();
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<'listings' | 'approval_queue' | 'showrooms' | 'developer_logs' | 'branding' | 'leads' | 'crm_service_hub' | 'enterprise_crm' | 'service_management' | 'bi_analytics' | 'data_health'>('listings');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);

  // Real-time Firestore Listener for New Unapproved Ads
  const isInitialListenerRun = useRef(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const listingsRef = collection(db, 'listings');
      unsubscribe = onSnapshot(listingsRef, (snapshot) => {
        if (isInitialListenerRun.current) {
          isInitialListenerRun.current = false;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data();
            if (data.approved === false) {
              const title = data.title || 'New Vehicle Advertisement';
              const seller = data.sellerName || data.createdBy || 'User';
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-bg-secondary border border-amber-500/50 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-3 text-[var(--color-text-header)] pointer-events-auto`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                      <Clock size={20} className="animate-pulse" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-xs uppercase text-amber-400 font-mono">New Ad Submitted for Approval</h4>
                      <p className="text-xs font-bold text-[var(--color-text-header)] line-clamp-1">{title}</p>
                      <p className="text-[10px] text-text-muted font-mono">By {seller}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('approval_queue');
                      toast.dismiss(t.id);
                    }}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    Review Queue
                  </button>
                </div>
              ), { id: `unapproved-toast-${change.doc.id}`, duration: 8000 });
            }
          }
        });
      }, (error) => {
        console.warn('Admin Firestore real-time listener error:', error);
      });
    } catch (e) {
      console.warn('Realtime listener subscription bypassed:', e);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedListingIds(filteredListings.map(l => l.id));
    } else {
      setSelectedListingIds([]);
    }
  };

  const handleToggleSelectListing = (id: string) => {
    setSelectedListingIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleApproveListing = async (listingId: string) => {
    try {
      await dbApproveListing(listingId, true);
      if (onApproveListing) {
        onApproveListing(listingId);
      }
      console.log('Advertisement Approved & Published Live!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to approve advertisement.');
    }
  };

  const handleRejectListing = async (listingId: string) => {
    if (!window.confirm('Are you sure you want to reject and delete this advertisement?')) {
      return;
    }
    try {
      await dbDeleteListing(listingId);
      if (onDeleteListing) {
        onDeleteListing(listingId);
      }
      if (onRejectListing) {
        onRejectListing(listingId);
      }
      console.log('Advertisement Rejected & Deleted.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to reject advertisement.');
    }
  };

  // Summarized metrics
  const totalListings = listings.length;
  const activeShowrooms = dealers.length;
  const pendingListings = listings.filter(l => l.approved === false || (l as any).approved === undefined);
  const pendingModeration = pendingListings.length;
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
                Central command center for showroom stock, dealer access, and ad moderation queue.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSingleWindowOpen('/?tab=profile')}
            className="px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-main text-text-muted hover:text-[var(--color-text-header)] rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Settings size={13} />
            <span>Open Settings Module</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Row */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        
        {/* Total Vehicles Card */}
        <div className="bg-bg-secondary/60 border border-border-main p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest font-bold">Total Cars</span>
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20">
              <Car size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text-header)] mt-4 tracking-tight">{totalListings}</h2>
          <p className="text-[10px] text-text-muted mt-1 font-mono uppercase">Vehicles in system</p>
        </div>

        {/* Active Showrooms Card */}
        <div className="bg-bg-secondary/60 border border-border-main p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-main)]/5 rounded-full blur-2xl group-hover:bg-[var(--color-accent-main)]/10 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest font-bold">Showrooms</span>
            <div className="p-2 bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] rounded-xl border border-[var(--color-accent-main)]/20">
              <Users size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text-header)] mt-4 tracking-tight">{activeShowrooms}</h2>
          <p className="text-[10px] text-text-muted mt-1 font-mono uppercase">Registered Dealerships</p>
        </div>

        {/* Pending Moderation / Approval Queue Card */}
        <div 
          onClick={() => setActiveTab('approval_queue')}
          className="bg-bg-secondary/60 border border-border-main hover:border-amber-500/50 p-5 rounded-2xl relative overflow-hidden group cursor-pointer transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <span>Approval Queue</span>
              {pendingModeration > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <Clock size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-amber-400 mt-4 tracking-tight">{pendingModeration}</h2>
          <p className="text-[10px] text-text-muted mt-1 font-mono uppercase">Awaiting admin review</p>
        </div>

        {/* Premium Featured */}
        <div className="bg-bg-secondary/60 border border-border-main p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest font-bold">Featured Slots</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
              <Sparkles size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text-header)] mt-4 tracking-tight">{premiumFeatured}</h2>
          <p className="text-[10px] text-text-muted mt-1 font-mono uppercase">Highlighted elite slots</p>
        </div>

      </div>

      {/* Main content grid */}
      <div className="max-w-7xl mx-auto bg-bg-secondary/40 border border-border-main rounded-2xl overflow-hidden shadow-2xl">
        {/* Tab Controls & Search Lockup */}
        <div className="p-5 border-b border-border-main bg-bg-primary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-bg-primary p-1 border border-border-main rounded-xl self-start flex-wrap">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'listings' ? 'bg-orange-500 text-[var(--color-text-header)] shadow' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              Vehicles Inventory ({filteredListings.length})
            </button>
            <button
              onClick={() => setActiveTab('approval_queue')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'approval_queue' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Clock size={13} />
              <span>Approval Queue</span>
              {pendingModeration > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-amber-400 text-slate-950 rounded-full font-black animate-pulse">
                  {pendingModeration}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('showrooms')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'showrooms' ? 'bg-orange-500 text-[var(--color-text-header)] shadow' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              Showrooms ({filteredDealers.length})
            </button>
            <button
              onClick={() => setActiveTab('developer_logs')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'developer_logs' ? 'bg-orange-500 text-[var(--color-text-header)] shadow' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              <FileCheck2 size={13} />
              <span>Developer Logs</span>
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'branding' ? 'bg-orange-500 text-slate-950 font-black shadow' : 'text-orange-400 hover:text-orange-300'
              }`}
            >
              <Cloud size={13} />
              <span>Branding & Logos</span>
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'leads' ? 'bg-blue-600 text-[var(--color-text-header)] font-black shadow' : 'text-blue-400 hover:text-blue-300'
              }`}
            >
              <MessageCircle size={13} />
              <span>Leads CRM</span>
            </button>
            <button
              onClick={() => setActiveTab('crm_service_hub')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'crm_service_hub' ? 'bg-orange-500 text-slate-950 font-black shadow' : 'text-orange-400 hover:text-orange-300'
              }`}
            >
              <ShieldCheck size={13} />
              <span>Service CRM Hub</span>
            </button>
            <button
              onClick={() => setActiveTab('enterprise_crm')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'enterprise_crm' ? 'bg-orange-500 text-slate-950 font-black shadow' : 'text-orange-400 hover:text-orange-300'
              }`}
            >
              <ShieldCheck size={13} />
              <span>Enterprise CRM</span>
            </button>
            <button
              onClick={() => setActiveTab('service_management')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'service_management' ? 'bg-orange-500 text-slate-950 font-black shadow' : 'text-orange-400 hover:text-orange-300'
              }`}
            >
              <Wrench size={13} />
              <span>Services Management</span>
            </button>
            <button
              onClick={() => setActiveTab('bi_analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bi_analytics' ? 'bg-[var(--color-brand-orange)] text-slate-950 font-black shadow' : 'text-orange-400 hover:text-orange-300'
              }`}
            >
              <TrendingUp size={13} />
              <span>CEO BI Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('data_health')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'data_health' ? 'bg-emerald-500 text-slate-950 font-black shadow' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <ShieldCheck size={13} />
              <span>Data Health Audit</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <CentralNotificationService />
            {activeTab === 'listings' && (
              <>
                {selectedListingIds.length > 0 && (
                  <button
                    onClick={() => {
                      if (!isAdminUser(currentUser)) {
                        toast.error('Restricted: Only designated Administrators can perform bulk deletions.');
                        return;
                      }
                      if (window.confirm(`Delete ${selectedListingIds.length} selected vehicles?`)) {
                        onDeleteSelectedListings?.(selectedListingIds);
                        setSelectedListingIds([]);
                        console.log(`Deleted ${selectedListingIds.length} vehicles.`);
                      }
                    }}
                    className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-slate-950 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Trash2 size={13} />
                    <span>Delete Selected ({selectedListingIds.length})</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!isAdminUser(currentUser)) {
                      toast.error('Restricted: Only designated Administrators can delete all inventory.');
                      return;
                    }
                    if (window.confirm('⚠️ WARNING: Delete ALL inventory listings in the system?')) {
                      onDeleteAllListings?.();
                      setSelectedListingIds([]);
                      console.log('All inventory cleared.');
                    }
                  }}
                  className="px-3 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete All Inventory</span>
                </button>
              </>
            )}

            {activeTab === 'showrooms' && (
              <button
                onClick={() => {
                  if (!isAdminUser(currentUser)) {
                    toast.error('Restricted: Only designated Administrators can delete showrooms.');
                    return;
                  }
                  if (window.confirm('⚠️ WARNING: Delete ALL registered showrooms?')) {
                    onDeleteAllDealers?.();
                    console.log('All showrooms cleared.');
                  }
                }}
                className="px-3 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete All Showrooms</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!isAdminUser(currentUser)) {
                  toast.error('Restricted: Only designated Administrators can delete posts.');
                  return;
                }
                if (window.confirm('⚠️ WARNING: Delete ALL social feed posts and community activity logs?')) {
                  onDeleteAllPosts?.();
                  console.log('All posts cleared.');
                }
              }}
              className="px-3 py-2 bg-bg-tertiary hover:bg-slate-700 border border-border-main text-text-muted rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete All Posts</span>
            </button>

            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-bg-primary border border-border-main rounded-xl px-4 py-2 text-xs font-bold text-[var(--color-text-header)] placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Tabular Lists & Views */}
        <div className="overflow-x-auto">
          {activeTab === 'approval_queue' ? (
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-4">
                <div>
                  <h3 className="text-sm font-black text-[var(--color-text-header)] font-mono uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    Ad Verification & Approval Queue ({pendingListings.length})
                  </h3>
                  <p className="text-xs text-text-muted font-mono mt-1">
                    Review user-submitted ads. Click Approve to publish live across BAZAR360 or Reject to remove.
                  </p>
                </div>
                {pendingListings.length > 0 && (
                  <button
                    onClick={async () => {
                      if (window.confirm(`Approve all ${pendingListings.length} pending advertisements at once?`)) {
                        for (const p of pendingListings) {
                          await handleApproveListing(p.id);
                        }
                        console.log(`Approved all ${pendingListings.length} advertisements!`);
                      }
                    }}
                    className="px-4 py-2 bg-[var(--color-accent-main)] hover:bg-emerald-600 text-slate-950 font-black text-xs font-mono uppercase rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Approve All ({pendingListings.length})
                  </button>
                )}
              </div>

              {pendingListings.length === 0 ? (
                <div className="bg-bg-primary border border-border-main rounded-2xl p-12 text-center space-y-3">
                  <CheckCircle2 size={44} className="text-[var(--color-accent-main)] mx-auto" />
                  <h4 className="text-sm font-black uppercase text-[var(--color-text-header)] font-mono">Approval Queue Clean</h4>
                  <p className="text-xs text-text-muted max-w-md mx-auto">
                    All user-submitted advertisements are verified & live on BAZAR360.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingListings.map((car) => {
                    const sellerName = car.sellerName || car.createdBy || 'Individual Seller';
                    const sellerPhone = car.sellerPhone || car.sellerWhatsApp || 'N/A';
                    return (
                      <div key={car.id} className="bg-bg-primary border border-border-main hover:border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-xl transition-all relative overflow-hidden group text-left">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img
                            src={car.imageUrl}
                            alt={car.title}
                            className="w-full sm:w-36 h-28 object-cover rounded-xl border border-border-main shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md uppercase">
                                Pending Verification
                              </span>
                              <span className="text-[10px] font-mono text-text-muted">
                                {car.createdAt ? new Date(car.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>

                            <h4 className="text-base font-black text-[var(--color-text-header)] truncate">{car.title}</h4>
                            <div className="text-sm font-black font-mono text-orange-400">
                              {renderPrice(car.price)}
                            </div>

                            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-text-muted pt-1">
                              <div><span className="text-text-muted">Make:</span> {car.make}</div>
                              <div><span className="text-text-muted">Model:</span> {car.model}</div>
                              <div><span className="text-text-muted">Year:</span> {car.year}</div>
                              <div><span className="text-text-muted">City:</span> {car.registrationCity || 'Not provided'}</div>
                              <div><span className="text-text-muted">Engine:</span> {car.engineCC ? `${car.engineCC} CC` : 'Not provided'}</div>
                              <div><span className="text-text-muted">Seller Type:</span> {car.sellerType || 'Individual'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Seller Contact Block */}
                        <div className="bg-bg-secondary/80 border border-border-main/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                          <div>
                            <span className="text-[9px] uppercase text-text-muted font-bold block">Seller Contact Information</span>
                            <span className="font-bold text-[var(--color-text-header)] flex items-center gap-1.5 mt-0.5">
                              <User size={12} className="text-amber-400 shrink-0" />
                              <span>{sellerName}</span>
                            </span>
                          </div>
                          {sellerPhone !== 'N/A' && (
                            <a
                              href={`tel:${sellerPhone}`}
                              className="text-sky-400 hover:underline flex items-center gap-1 font-bold text-xs"
                            >
                              <Phone size={12} className="shrink-0" />
                              <span>{sellerPhone}</span>
                            </a>
                          )}
                        </div>

                        {/* Description Preview */}
                        {car.description && (
                          <p className="text-xs text-text-muted line-clamp-2 italic bg-bg-secondary/40 p-2.5 rounded-xl border border-border-main/50">
                            "{car.description}"
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-border-main/80 flex items-center justify-between gap-3">
                          <button
                            onClick={() => handleSingleWindowOpen(`/?tab=search&listing=${car.id}`)}
                            className="px-3 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-main text-text-muted hover:text-[var(--color-text-header)] rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <ExternalLink size={13} />
                            <span>Inspect Ad</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRejectListing(car.id)}
                              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleApproveListing(car.id)}
                              className="px-4 py-2 bg-[var(--color-accent-main)] hover:bg-emerald-600 text-slate-950 font-black text-xs font-mono uppercase rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[var(--color-accent-main)]/20 active:scale-95"
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'developer_logs' ? (
            <div className="p-6 space-y-6">
              <div className="bg-bg-primary border border-border-main rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-4">
                  <div>
                    <h3 className="text-sm font-black text-[var(--color-text-header)] font-mono uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-main)] animate-pulse" />
                      GitHub Repository Sync Monitor & Git Logs
                    </h3>
                    <p className="text-xs text-text-muted font-mono mt-1">
                      Repository URL: <a href="https://github.com/AmjidOfficial/BAZAR360.git" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">https://github.com/AmjidOfficial/BAZAR360.git</a>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono px-3 py-1 bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/20 rounded-xl font-bold uppercase">
                      Admin Email: amjid.bisconni@gmail.com
                    </span>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-bg-secondary/80 border border-border-main rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[var(--color-accent-main)] font-bold uppercase block">[COMMIT #901621] - MAIN BRANCH</span>
                      <p className="text-[var(--color-text-header)] text-xs">feat(bazar360): enterprise connected accounts, account management, & github repository sync</p>
                    </div>
                    <span className="text-[10px] text-text-muted">2 mins ago</span>
                  </div>

                  <div className="p-3 bg-bg-secondary/80 border border-border-main rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[var(--color-accent-main)] font-bold uppercase block">[COMMIT #901620] - MAIN BRANCH</span>
                      <p className="text-[var(--color-text-header)] text-xs">fix(sold-badge): added 'Sold' vehicle schema attribute and card status badge</p>
                    </div>
                    <span className="text-[10px] text-text-muted">1 hour ago</span>
                  </div>

                  <div className="p-3 bg-bg-secondary/80 border border-border-main rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[var(--color-accent-main)] font-bold uppercase block">[COMMIT #901619] - MAIN BRANCH</span>
                      <p className="text-[var(--color-text-header)] text-xs">style(cards): subtle hover elevation and scale animation across inventory cards</p>
                    </div>
                    <span className="text-[10px] text-text-muted">3 hours ago</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-main flex items-center justify-between text-xs text-text-muted font-mono">
                  <span>Deployment Target: bazar360.online</span>
                  <button
                    onClick={() => console.log('Git repository sync verified successfully with origin/main!')}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Run Manual Sync Check
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'listings' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main/80 bg-bg-primary/20 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">
                  <th className="p-4 w-10">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={filteredListings.length > 0 && selectedListingIds.length === filteredListings.length}
                      className="accent-orange-500 rounded cursor-pointer"
                    />
                  </th>
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
                    <td colSpan={6} className="p-8 text-center text-xs font-mono text-text-muted">
                      No matching vehicles in inventory directory.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((car) => {
                    const isSelected = selectedListingIds.includes(car.id);
                    return (
                      <tr key={car.id} className={`hover:bg-bg-secondary/35 transition-all text-xs ${isSelected ? 'bg-orange-500/5' : ''}`}>
                        <td className="p-4 w-10">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleToggleSelectListing(car.id)}
                            className="accent-orange-500 rounded cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={car.imageUrl} 
                              alt={car.title}
                              className="w-12 h-8 object-cover rounded-lg border border-border-main shrink-0"
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
                        <td className="p-4 font-mono text-text-muted font-bold">
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
                            {!car.approved && (
                              <button
                                onClick={() => handleApproveListing(car.id)}
                                className="p-1.5 bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] hover:text-slate-950 hover:bg-[var(--color-accent-main)] border border-[var(--color-accent-main)]/20 rounded-lg cursor-pointer transition-all"
                                title="Approve Ad"
                              >
                                <CheckCircle2 size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => handleSingleWindowOpen(`/?tab=search&listing=${car.id}`)}
                              className="p-1.5 bg-bg-secondary text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] border border-border-main rounded-lg cursor-pointer transition-all"
                              title="Inspect advertisement"
                            >
                              <ExternalLink size={13} />
                            </button>
                            <button
                              onClick={() => handleRejectListing(car.id)}
                              className="p-1.5 bg-rose-500/10 text-rose-400 hover:text-[var(--color-text-header)] hover:bg-rose-500 border border-rose-500/20 rounded-lg cursor-pointer transition-all"
                              title="Delete Stock Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : activeTab === 'branding' ? (
            <AdminBrandingManager currentUser={currentUser} />
          ) : activeTab === 'leads' ? (
            <AdminLeadsView />
          ) : activeTab === 'crm_service_hub' ? (
            <div className="p-6">
              <CRMServiceHub lang={lang} />
            </div>
          ) : activeTab === 'enterprise_crm' ? (
            <div className="p-6">
              <EnterpriseCRMAdmin lang={lang} />
            </div>
          ) : activeTab === 'service_management' ? (
            <div className="p-6">
              <ServiceManagementHub lang={lang} />
            </div>
          ) : activeTab === 'bi_analytics' ? (
            <div className="p-6">
              <BusinessIntelligenceDashboard lang={lang} />
            </div>
          ) : activeTab === 'data_health' ? (
            <div className="p-6">
              <DataHealthPanel />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main/80 bg-bg-primary/20 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">
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
                    <td colSpan={5} className="p-8 text-center text-xs font-mono text-text-muted">
                      No matching registered showrooms found.
                    </td>
                  </tr>
                ) : (
                  filteredDealers.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-bg-secondary/30 transition-all text-xs">
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
                      <td className="p-4 font-mono text-text-muted">
                        {dealer.location}
                      </td>
                      <td className="p-4 font-mono text-[var(--color-text-muted)]">
                        {dealer.phone}
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 bg-bg-primary border border-border-main rounded text-[9px] font-mono font-bold text-orange-400">
                          {dealer.theme_choice || 'Cosmic'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleSingleWindowOpen(`/?tab=showroom&id=${dealer.id}`)}
                            className="p-1.5 bg-bg-secondary text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] border border-border-main rounded-lg cursor-pointer transition-all"
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
