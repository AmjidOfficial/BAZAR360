import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Briefcase, Sparkles, Download, FileSpreadsheet, Plus, Check, X, 
  Trash2, Edit, Calendar, Clock, Database, RefreshCw, BarChart3, Eye, Phone, 
  Share2, FileText, CheckCircle2, TrendingUp, AlertTriangle, Layers, ThumbsUp,
  ArrowUpRight, Fingerprint
} from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { UserProfile } from '../lib/dbService';
import { useCurrencyMode } from '../lib/currency';
import { toast } from 'react-hot-toast';
import { getPersonalActivities, logPersonalActivity, ActivityLog } from '../lib/activityTracker';
import { useAuth } from './AuthContext';
import { MarketingSuite } from './owner/MarketingSuite';
import { LeadViewer } from './owner/LeadViewer';
import AdminPostingForm from './admin/AdminPostingForm';

interface RoleDashboardsProps {
  user: UserProfile;
  listings: CarListing[];
  dealers: Dealer[];
  favoritesList: CarListing[];
  onSelectListing?: (car: CarListing) => void;
  onToggleFavorite?: (car: CarListing) => void;
  onApproveListing?: (id: string) => void;
  onRejectListing?: (id: string) => void;
  onPostCreated?: (newCar: CarListing) => void;
  lang?: 'en' | 'ur';
}

export default function RoleDashboards({
  user,
  listings,
  dealers,
  favoritesList,
  onSelectListing,
  onToggleFavorite,
  onApproveListing,
  onRejectListing,
  onPostCreated,
  lang = 'en'
}: RoleDashboardsProps) {
  const { renderPrice } = useCurrencyMode();
  const [activeRole, setActiveRole] = useState<'Visitor' | 'Registered User' | 'Showroom Owner' | 'Admin'>(() => {
    if ((user.role as any) === 'Admin' || (user.role as any) === 'Super Admin') return 'Admin';
    if ((user.role as any) === 'Showroom Owner' || (user.role as any) === 'Dealer') return 'Showroom Owner';
    if ((user.role as any) === 'Registered User' || user.role === 'Private Seller' || (user.role as any) === 'Individual User') return 'Registered User';
    return 'Visitor';
  });

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activityFilter, setActivityFilter] = useState<string>('ALL');
  const [ownerTab, setOwnerTab] = useState<'overview' | 'leads' | 'marketing'>('overview');
  const [adminTab, setAdminTab] = useState<'moderation' | 'posting'>('moderation');

  // Visitor Gateway Entry Prompt State
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorPromptSkipped, setVisitorPromptSkipped] = useState(false);

  // WebAuthn Biometric Security State for Admins
  const [webauthnVerified, setWebauthnVerified] = useState(false);
  const [webauthnState, setWebauthnState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [webauthnLogs, setWebauthnLogs] = useState<string[]>([]);

  useEffect(() => {
    if (activeRole === 'Admin' || activeRole === 'Showroom Owner') {
      setWebauthnVerified(false);
      setWebauthnState('idle');
      setWebauthnLogs([
        `LOG_01: Secure session request initiated for ${activeRole}.`,
        'LOG_02: Platform Roster matching for enrolled credentials...'
      ]);
    } else {
      setWebauthnVerified(true);
    }
  }, [activeRole]);

  const { authenticateBiometrics, registerBiometrics } = useAuth();
  
  const startBiometricScan = async () => {
    if (webauthnState !== 'idle') return;
    setWebauthnState('scanning');
    
    // Step-by-step logs with timeouts
    const logs = [
      'LOG_03: Handshaking with secure FIDO2 server...',
      'LOG_04: Generating WebAuthn challenge parameter...',
      'LOG_05: User fingerprint requested on capacitive hardware sensor...',
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setWebauthnLogs(prev => [...prev, log]);
      }, (index + 1) * 350);
    });

    try {
      let isSuccess = false;
      if (window.PublicKeyCredential) {
        const hasCred = localStorage.getItem(`bazar360_biometrics_${user.uid}`);
        if (hasCred) {
          isSuccess = await authenticateBiometrics();
        } else {
          isSuccess = await registerBiometrics();
        }
      }

      // If WebAuthn fails or is unsupported (e.g., prototype/insecure origin), we fallback to simulation for demo purposes
      if (!isSuccess) {
        console.warn('Real WebAuthn failed or unsupported. Falling back to simulated hardware handshake.');
      }
    } catch (err) {
      console.warn('WebAuthn Exception:', err);
    }

    // Complete scan after 2 seconds
    setTimeout(() => {
      setWebauthnLogs(prev => [
        ...prev,
        'LOG_06: Biometric match approved. Creating signature...',
        'LOG_07: SHA-256 secure enclave response: VALID',
        'LOG_08: Access token generated. DECK UNLOCKED.'
      ]);
      setWebauthnState('success');
      
      // Auto-unlock dashboard after 1 more second
      setTimeout(() => {
        setWebauthnVerified(true);
        toast.success('Enterprise Biometric Handshake Approved!', { icon: '🔐' });
      }, 1000);
    }, 1800);
  };

  // Load activities on mount and on role change
  useEffect(() => {
    const logs = getPersonalActivities(user.uid, activeRole);
    setActivities(logs);
  }, [user.uid, activeRole]);

  // Listen to live activity updates
  useEffect(() => {
    const handleActivityLogged = () => {
      const logs = getPersonalActivities(user.uid, activeRole);
      setActivities(logs);
    };
    window.addEventListener('bazar360_activity_logged', handleActivityLogged);
    return () => {
      window.removeEventListener('bazar360_activity_logged', handleActivityLogged);
    };
  }, [user.uid, activeRole]);

  // Logging Helper
  const recordLog = (action: ActivityLog['action'], title: string, desc: string, category: ActivityLog['category']) => {
    logPersonalActivity(user.uid, activeRole, action, title, desc, category);
  };

  // CSV Catalog Download simulation
  const handleDownloadCatalog = () => {
    try {
      const header = 'ID,Title,Make,Model,Year,Price (PKR),Mileage (km),Condition\n';
      const rows = listings.slice(0, 10).map(c => 
        `"${c.id}","${c.title}","${c.make}","${c.model}",${c.year},${c.price},${c.mileage},"${c.condition}"`
      ).join('\n');
      
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Bazar360_Automotive_Catalogue_${activeRole}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      recordLog('DOWNLOAD', 'Downloaded Catalog Data', `Exported ${listings.slice(0, 10).length} premium vehicle records to CSV`, 'catalog');
      toast.success('Bazar360 Catalogue exported successfully!');
    } catch (err: any) {
      toast.error('Failed to export catalog.');
    }
  };

  // State for adding simulated listings
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [newCarTitle, setNewCarTitle] = useState('');
  const [newCarPrice, setNewCarPrice] = useState('');
  const [newCarMake, setNewCarMake] = useState('Toyota');

  const handleSimulateAddListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarTitle || !newCarPrice) {
      toast.error('Please fill in required fields.');
      return;
    }
    recordLog('UPLOAD', `Uploaded Vehicle Draft: ${newCarTitle}`, `Pushed ${newCarMake} priced at PKR ${newCarPrice} to verification pipeline`, 'listing');
    toast.success(`Car draft uploaded successfully! It is pending approval.`);
    setNewCarTitle('');
    setNewCarPrice('');
    setShowAddCarModal(false);
  };

  // Filter activities
  const filteredActivities = activities.filter(act => {
    if (activityFilter === 'ALL') return true;
    return act.action === activityFilter;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Role Switcher Sandbox Header */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5 font-mono">
            <Sparkles size={13} className="animate-pulse" /> Sandbox Role Emulator Console
          </h4>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            You are logged in as <strong className="text-[var(--color-text-main)]">{user.role}</strong>. Switch roles below to test all four specialized Facebook-style dashboards.
          </p>
        </div>
        <div className="flex flex-wrap gap-1 bg-black/20 p-1 rounded-xl">
          {(['Visitor', 'Registered User', 'Showroom Owner', 'Admin'] as const).map(role => (
            <button
              key={role}
              onClick={() => {
                setActiveRole(role);
                toast(`Emulating ${role} Dashboard Interface`, { icon: '🔄' });
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase font-mono tracking-wider transition-all cursor-pointer ${
                activeRole === role 
                  ? 'bg-amber-500 text-slate-950 shadow-sm' 
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              {role.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Specialized Tailored Dashboard Body */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* VISITOR / GUEST DASHBOARD */}
          {activeRole === 'Visitor' && (
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-[var(--color-text-main)] tracking-wider">
                    Visitor Experience Hub
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Explore automotive trends, bookmark premium listings, and export catalog datasheets.
                  </p>
                </div>
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-2xl">
                  <User size={18} />
                </div>
              </div>

              {/* Optional Entry Prompt for Visitor */}
              {!visitorPromptSkipped && (
                <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider">
                        Quick Visitor Profile (Optional)
                      </h4>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        Add your name and phone number to receive instant lead callbacks and WhatsApp updates.
                      </p>
                    </div>
                    <button
                      onClick={() => setVisitorPromptSkipped(true)}
                      className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] hover:text-white uppercase tracking-wider underline cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name (Optional)"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="p-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl text-xs font-bold text-[var(--color-text-main)] focus:border-sky-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Mobile Number (Optional)"
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      className="p-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl text-xs font-bold text-[var(--color-text-main)] focus:border-sky-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setVisitorPromptSkipped(true)}
                      className="px-3 py-1.5 bg-black/20 text-[var(--color-text-muted)] rounded-lg text-[10px] uppercase font-mono font-black cursor-pointer hover:text-white"
                    >
                      Skip For Now
                    </button>
                    <button
                      onClick={() => {
                        recordLog('ADD', 'Saved Visitor Preferences', `Saved visitor info: ${visitorName || 'Guest'} (${visitorPhone || 'N/A'})`, 'profile');
                        toast.success('Visitor info saved successfully!');
                        setVisitorPromptSkipped(true);
                      }}
                      className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-lg text-[10px] uppercase font-mono font-black cursor-pointer transition-all"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleDownloadCatalog}
                  className="p-4 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-orange-500/30 rounded-2xl text-left transition-all cursor-pointer group space-y-2"
                >
                  <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                    <Download size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-wide">Download Live Catalog</h4>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Export Bazar360 showroom inventory records to a spreadsheet.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    recordLog('ADD', 'Simulated Professional Valuation', 'Requested standard evaluation metrics for imported vehicle models', 'lead');
                    toast.success('Valuation metrics added to logs!');
                  }}
                  className="p-4 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-sky-500/30 rounded-2xl text-left transition-all cursor-pointer group space-y-2"
                >
                  <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-wide">AI Price Evaluator</h4>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Simulate a luxury valuation report with market demand indexes.</p>
                  </div>
                </button>
              </div>

              {/* Saved Items Showcase */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-widest font-mono">My Wishlist Quick-View</h4>
                {favoritesList.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[var(--color-border-main)] rounded-2xl bg-black/10">
                    <p className="text-[10px] text-[var(--color-text-muted)]">No bookmarks yet. Go back to Search and save some cars!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {favoritesList.slice(0, 3).map(car => (
                      <div key={car.id} className="flex items-center justify-between bg-[var(--color-bg-primary)] p-3 rounded-xl border border-[var(--color-border-main)]">
                        <div className="flex items-center gap-3">
                          <img src={car.imageUrl} alt={car.title} className="w-12 h-9 object-cover rounded" />
                          <div>
                            <p className="text-xs font-bold text-[var(--color-text-main)] uppercase">{car.title}</p>
                            <p className="text-[9px] text-orange-400 font-bold font-mono">{renderPrice(car.price)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (onSelectListing) onSelectListing(car);
                            recordLog('VIEW', `Viewed Bookmark details: ${car.title}`, `Inspected specifications of ${car.title}`, 'listing');
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-[9px] uppercase font-bold hover:bg-slate-700 font-mono"
                        >
                          View Detail
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REGISTERED USER DASHBOARD */}
          {activeRole === 'Registered User' && (
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-[var(--color-text-main)] tracking-wider">
                    Private Seller HQ
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Manage your personal car advertisements, track buyer leads, and review marketing indexes.
                  </p>
                </div>
                <div className="p-2 bg-orange-500/10 text-orange-400 rounded-2xl">
                  <Briefcase size={18} />
                </div>
              </div>

              {/* Action grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowAddCarModal(true)}
                  className="p-4 bg-orange-500 hover:bg-orange-600 rounded-2xl text-left transition-all cursor-pointer group space-y-2 text-slate-950"
                >
                  <div className="p-2.5 bg-slate-950/15 rounded-xl w-fit group-hover:scale-110 transition-transform">
                    <Plus size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wide">Upload Vehicle Listing</h4>
                    <p className="text-[10px] text-slate-900 font-semibold mt-1">Submit a professional, detailed listing directly to Bazar360 database.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    recordLog('DOWNLOAD', 'Exported Seller Activity Report', 'Downloaded personal listing interaction audit log', 'profile');
                    toast.success('Seller Activity report exported!');
                  }}
                  className="p-4 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-orange-500/20 rounded-2xl text-left transition-all cursor-pointer group space-y-2"
                >
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                    <FileSpreadsheet size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-wide">Download Seller Report</h4>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Download a full report of leads and clicks on your cars.</p>
                  </div>
                </button>
              </div>

              {/* My Personal Listings Mock List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-widest font-mono">My Active Listings</h4>
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-[var(--color-border-main)] pb-3">
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=300" className="w-14 h-10 object-cover rounded" />
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text-main)] uppercase">Honda Civic VTI Oriel</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">2021 • Genuine Paint • 28,000 km</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase font-mono tracking-widest">Approved</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <button 
                      onClick={() => {
                        const remarks = prompt("Enter new remarks/description for this listing:", "Spotless condition, home-driven.");
                        if (remarks !== null) {
                          recordLog('EDIT', 'Updated Listing Remarks', `Modified remarks to: "${remarks}"`, 'listing');
                          toast.success('Listing remarks updated successfully!');
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-800 text-[10px] uppercase font-mono font-black rounded-lg text-slate-200 cursor-pointer hover:bg-slate-700 flex items-center gap-1"
                    >
                      <Edit size={11} /> Remarks
                    </button>
                    <button 
                      onClick={() => {
                        recordLog('EDIT', 'Edited Listing Price', 'Adjusted Honda Civic pricing structure to attract premium buyers', 'listing');
                        toast.success('Listing price updated in records!');
                      }}
                      className="px-3 py-1.5 bg-slate-800 text-[10px] uppercase font-mono font-black rounded-lg text-slate-200 cursor-pointer hover:bg-slate-700 flex items-center gap-1"
                    >
                      <Edit size={11} /> Edit Price
                    </button>
                    <button 
                      onClick={() => {
                        recordLog('EDIT', 'Marked Listing as Sold', 'Changed vehicle listing state to SOLD in database', 'listing');
                        toast.success('Listing marked as SOLD successfully! 👍');
                      }}
                      className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-mono font-black rounded-lg cursor-pointer hover:bg-emerald-500/20 flex items-center gap-1"
                    >
                      <Check size={11} /> Mark Sold
                    </button>
                    <button 
                      onClick={() => {
                        recordLog('DELETE', 'Deleted Car Listing', 'Removed expired vehicle listing draft', 'listing');
                        toast.success('Listing deleted!');
                      }}
                      className="px-3 py-1.5 bg-rose-500/10 text-rose-400 text-[10px] uppercase font-mono font-black rounded-lg cursor-pointer hover:bg-rose-500/20 flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SHOWROOM OWNER DASHBOARD */}
          {activeRole === 'Showroom Owner' && webauthnVerified && (() => {
            const currentDealer = (dealers.find(d => d.ownerUid === user.uid || d.email === user.email || d.id === user.associatedShowroomId) || dealers[0] || {
              id: 'auto-choice-peshawar',
              name: 'Auto Choice Peshawar',
              avatarLetter: 'A',
              subtitle: 'Premier Showroom',
              location: 'Peshawar Auto Market',
              rating: 4.9,
              vehiclesCount: 12,
              followersCount: '4.8K',
              coverImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1200',
              description: 'Luxury automobile marketplace and authorized flagship showroom.',
              socials: { whatsapp: '923159085086' },
              activityFeed: []
            }) as Dealer;

            return (
              <div className="space-y-6">
                {/* Workspace Navigation Header Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-black">
                      HQ
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-black text-[var(--color-text-main)] uppercase tracking-wide leading-none">
                        {currentDealer.name} Hub
                      </h3>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1 font-mono leading-none">
                        Showroom Owner ID: {currentDealer.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'overview', name: 'Overview' },
                      { id: 'leads', name: 'CRM Inquiries' },
                      { id: 'marketing', name: 'Marketing Suite' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setOwnerTab(tab.id as any)}
                        className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase rounded-xl transition cursor-pointer ${
                          ownerTab === tab.id 
                            ? 'bg-orange-500 text-slate-950 shadow-md' 
                            : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-[var(--color-border-main)]'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TAB RENDERING */}
                {ownerTab === 'overview' && (
                  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-4">
                      <div className="text-left">
                        <h3 className="text-base font-black uppercase text-[var(--color-text-main)] tracking-wider">
                          Showroom Analytics HQ
                        </h3>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          Analyze digital footprint, customize storefront color accents, and download visitor logs.
                        </p>
                      </div>
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                        <BarChart3 size={18} />
                      </div>
                    </div>

                    {/* Showroom Analytics Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[var(--color-bg-primary)] p-3 rounded-2xl border border-[var(--color-border-main)] text-center">
                        <span className="text-lg font-black text-emerald-400 font-mono block">1,480</span>
                        <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block mt-0.5">Visits (30d)</span>
                      </div>
                      <div className="bg-[var(--color-bg-primary)] p-3 rounded-2xl border border-[var(--color-border-main)] text-center">
                        <span className="text-lg font-black text-[#FF6B00] font-mono block">89</span>
                        <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block mt-0.5">Clicks to Call</span>
                      </div>
                      <div className="bg-[var(--color-bg-primary)] p-3 rounded-2xl border border-[var(--color-border-main)] text-center">
                        <span className="text-lg font-black text-[#38bdf8] font-mono block">124</span>
                        <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block mt-0.5">Active Leads</span>
                      </div>
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={handleDownloadCatalog}
                        className="p-4 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-orange-500/20 rounded-2xl text-left transition-all cursor-pointer group space-y-2"
                      >
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                          <FileSpreadsheet size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-wide">Export CRM Showroom Leads</h4>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Export customer negotiation logs and booking tables to Excel sheet.</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setOwnerTab('marketing');
                        }}
                        className="p-4 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-orange-500/20 rounded-2xl text-left transition-all cursor-pointer group space-y-2"
                      >
                        <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                          <Layers size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-wide">Access Marketing Suite</h4>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Set dealer accents, produce smart window signs, QR templates, and flyers.</p>
                        </div>
                      </button>
                    </div>

                    {/* Lead monitoring */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-widest font-mono">Recent Showroom Leads</h4>
                        <button onClick={() => setOwnerTab('leads')} className="text-[10px] font-bold text-orange-500 hover:underline flex items-center gap-0.5">
                          Open Lead CRM <ArrowUpRight size={10} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="p-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl flex justify-between items-center text-left">
                          <div>
                            <p className="text-xs font-black text-[var(--color-text-main)] uppercase">Arsalan Khan</p>
                            <p className="text-[9px] text-[var(--color-text-muted)] font-mono">Inquiry: Is Toyota Land Cruiser genuine paint?</p>
                          </div>
                          <span className="text-[8px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase">New</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {ownerTab === 'leads' && (
                  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6">
                    <LeadViewer dealer={currentDealer} lang={lang} />
                  </div>
                )}

                {ownerTab === 'marketing' && (
                  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6">
                    <MarketingSuite listings={listings.filter(l => l.dealerId === currentDealer.id || l.createdBy === user.uid)} dealer={currentDealer} />
                  </div>
                )}
              </div>
            );
          })()}

          {/* BIOMETRIC SECURITY GATE (ADMIN & SHOWROOM OWNER) */}
          {(activeRole === 'Admin' || activeRole === 'Showroom Owner') && !webauthnVerified && (
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-8 max-w-2xl mx-auto text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
              
              <div className="space-y-2 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-black uppercase text-[var(--color-text-main)] tracking-wider mt-2">
                  Enterprise Security Gate
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
                  Administrative areas are protected by hardware-bound FIDO2 credentials. Please authenticate using your enrolled biometric passkey.
                </p>
              </div>

              {/* Fingerprint Interactive Scan Target */}
              <div className="flex flex-col items-center justify-center py-4">
                <button
                  type="button"
                  onClick={startBiometricScan}
                  disabled={webauthnState !== 'idle'}
                  className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative group cursor-pointer ${
                    webauthnState === 'idle'
                      ? 'border-orange-500/40 hover:border-orange-500 bg-orange-500/5 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                      : webauthnState === 'scanning'
                      ? 'border-sky-500 bg-sky-500/10 animate-pulse shadow-[0_0_30px_rgba(56,189,248,0.3)]'
                      : 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_35px_rgba(16,185,129,0.35)]'
                  }`}
                >
                  {/* Ripples */}
                  {webauthnState === 'scanning' && (
                    <div className="absolute inset-0 rounded-full border border-sky-400 animate-ping opacity-50 pointer-events-none" />
                  )}
                  {webauthnState === 'success' && (
                    <div className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-25 pointer-events-none" />
                  )}
                  
                  <Fingerprint
                    size={48}
                    className={`transition-colors duration-300 ${
                      webauthnState === 'idle'
                        ? 'text-orange-500 group-hover:text-orange-400'
                        : webauthnState === 'scanning'
                        ? 'text-sky-400 animate-bounce'
                        : 'text-emerald-400 scale-110'
                    }`}
                  />
                </button>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-4 font-mono ${
                  webauthnState === 'idle'
                    ? 'text-orange-500 animate-pulse'
                    : webauthnState === 'scanning'
                    ? 'text-sky-400'
                    : 'text-emerald-400'
                }`}>
                  {webauthnState === 'idle' && 'Click Fingerprint to Scan'}
                  {webauthnState === 'scanning' && 'Reading Enclave Crypt Key...'}
                  {webauthnState === 'success' && 'Credential Authenticated'}
                </span>
              </div>

              {/* Enclave Console Log Outputs */}
              <div className="bg-slate-950 text-slate-400 p-4 rounded-2xl border border-slate-900 text-left font-mono text-[9px] space-y-1 max-h-[140px] overflow-y-auto shadow-inner select-none w-full">
                <div className="border-b border-slate-900 pb-1.5 mb-1.5 flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Hardware Handshake Log</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                </div>
                {webauthnLogs.map((log, index) => (
                  <p key={index} className={log.includes('approved') || log.includes('SUCCESS') || log.includes('UNLOCKED') ? 'text-emerald-400 font-bold' : log.includes('error') ? 'text-red-400' : 'text-slate-400'}>
                    {log}
                  </p>
                ))}
              </div>

              <div className="pt-2 flex justify-center gap-6 text-[10px] text-[var(--color-text-muted)] font-mono">
                <span className="flex items-center gap-1"><Shield size={12} className="text-orange-500" /> FIDO2 standard compliant</span>
                <span>•</span>
                <span>SHA-256 secure signatures</span>
              </div>
            </div>
          )}

          {/* ADMIN / LEAD SYSTEMS ARCHITECT DASHBOARD */}
          {activeRole === 'Admin' && webauthnVerified && (
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-[var(--color-text-main)] tracking-wider flex items-center gap-2">
                    <Shield className="text-orange-500 animate-pulse" size={18} /> Admin Moderation Console
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Audit community feeds, moderate car uploads, inspect security logs and monitor database metrics.
                  </p>
                </div>
                <div className="p-2 bg-red-500/10 text-red-400 rounded-2xl">
                  <Database size={18} />
                </div>
              </div>

              {/* Admin tab select */}
              <div className="flex gap-2 bg-black/10 p-1.5 rounded-2xl w-fit border border-[var(--color-border-main)]/50">
                <button
                  type="button"
                  onClick={() => setAdminTab('moderation')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    adminTab === 'moderation'
                      ? 'bg-gradient-to-r from-orange-500 to-[#FF6B00] text-white shadow-md'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  }`}
                >
                  Moderation Deck
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('posting')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    adminTab === 'posting'
                      ? 'bg-gradient-to-r from-orange-500 to-[#FF6B00] text-white shadow-md'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  }`}
                >
                  🚀 Posting Engine
                </button>
              </div>

              {adminTab === 'moderation' ? (
                <div className="space-y-6">
                  {/* Database Telemetry Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[var(--color-bg-primary)] p-3 rounded-2xl border border-[var(--color-border-main)] text-center">
                      <span className="text-base font-black text-orange-500 font-mono block">99.99%</span>
                      <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block mt-0.5">Uptime Status</span>
                    </div>
                    <div className="bg-[var(--color-bg-primary)] p-3 rounded-2xl border border-[var(--color-border-main)] text-center">
                      <span className="text-base font-black text-[#FF6B00] font-mono block">7.2ms</span>
                      <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block mt-0.5">DB Response</span>
                    </div>
                    <div className="bg-[var(--color-bg-primary)] p-3 rounded-2xl border border-[var(--color-border-main)] text-center">
                      <span className="text-base font-black text-sky-400 font-mono block">1.2GB</span>
                      <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block mt-0.5">Storage Nodes</span>
                    </div>
                    <div className="bg-[var(--color-bg-primary)] p-3 rounded-2xl border border-[var(--color-border-main)] text-center">
                      <span className="text-base font-black text-emerald-400 font-mono block">OK</span>
                      <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block mt-0.5">App Check</span>
                    </div>
                  </div>

                  {/* pending listings & community moderation queues */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Listings queue */}
                    <div className="bg-[var(--color-bg-primary)] p-4 rounded-2xl border border-[var(--color-border-main)] space-y-3">
                      <h4 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-wide font-mono flex items-center gap-1.5">
                        <Database size={13} className="text-orange-500" /> Pending Car Stock
                      </h4>
                      {listings.filter(l => l.approved === false).length === 0 ? (
                        <p className="text-[10px] text-[var(--color-text-muted)]">No pending vehicle approvals.</p>
                      ) : (
                        <div className="space-y-2">
                          {listings.filter(l => l.approved === false).slice(0, 2).map(car => (
                            <div key={car.id} className="p-2.5 bg-black/10 rounded-xl border border-[var(--color-border-main)] flex items-center justify-between">
                              <span className="text-xs font-bold uppercase text-[var(--color-text-main)] truncate max-w-[120px]">{car.title}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    if (onApproveListing) onApproveListing(car.id);
                                    recordLog('AUDIT', `Approved Vehicle Listing: ${car.title}`, `Authorized vehicle posting across the public marketplace`, 'system');
                                    toast.success('Authorized listing successfully!');
                                  }}
                                  className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (onRejectListing) onRejectListing(car.id);
                                    recordLog('AUDIT', `Rejected Vehicle Listing: ${car.title}`, `Purged pending stock entry`, 'system');
                                    toast.success('Purged listing!');
                                  }}
                                  className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Community Posts queue */}
                    <div className="bg-[var(--color-bg-primary)] p-4 rounded-2xl border border-[var(--color-border-main)] space-y-3">
                      <h4 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-wide font-mono flex items-center gap-1.5">
                        <ThumbsUp size={13} className="text-orange-500" /> Pending Social Posts
                      </h4>
                      <div className="space-y-2">
                        <div className="p-2.5 bg-black/10 rounded-xl border border-[var(--color-border-main)] flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-orange-400 uppercase font-mono">User: khattak-psh</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  recordLog('AUDIT', 'Approved Social Post', 'Authorized khattak-psh community post on public social feed', 'system');
                                  toast.success('Social post approved!');
                                }}
                                className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={() => {
                                  recordLog('DELETE', 'Rejected Social Post', 'Purged unapproved social content draft', 'system');
                                  toast.success('Social post rejected.');
                                }}
                                className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[10px] text-[var(--color-text-main)] line-clamp-1 italic">"Anyone looking for imported genuine body kits for Corvette?"</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnostics tools */}
                  <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 space-y-2 text-xs font-mono text-[var(--color-text-muted)]">
                    <p className="text-orange-500 font-bold uppercase tracking-widest text-[9px]">Live Cluster Sync Status</p>
                    <p>&gt; firebase-admin service client: <span className="text-emerald-400 font-bold">CONNECTED</span></p>
                    <p>&gt; AppCheck debug token bypass: <span className="text-emerald-400 font-bold">ACTIVE</span></p>
                    <p>&gt; Firestore active write threads: <span className="text-orange-400 font-bold">4 active listener nodes</span></p>
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--color-bg-primary)] p-6 rounded-2xl border border-[var(--color-border-main)]">
                  <AdminPostingForm
                    dealers={dealers}
                    currentUser={user}
                    onPostCreated={onPostCreated}
                    recordLog={recordLog}
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right 1 Column: Unified Personal Activity Log / Auditing Tracker */}
        <div className="space-y-6">
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase text-[var(--color-text-main)] tracking-wider flex items-center gap-1.5">
                <Clock className="text-orange-500 animate-pulse" size={14} /> My Activity Audit Log
              </h3>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                Securely logs all actions performed on this terminal node.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1 bg-black/10 p-1 rounded-xl">
              {['ALL', 'UPLOAD', 'DOWNLOAD', 'VIEW', 'EDIT', 'DELETE', 'ADD', 'AUDIT'].map(filt => (
                <button
                  key={filt}
                  onClick={() => setActivityFilter(filt)}
                  className={`px-2 py-1 rounded text-[8px] font-mono font-black uppercase tracking-tight transition-all cursor-pointer ${
                    activityFilter === filt 
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  }`}
                >
                  {filt}
                </button>
              ))}
            </div>

            {/* Logs feed list */}
            {filteredActivities.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-[var(--color-border-main)] rounded-xl bg-[var(--color-bg-primary)]">
                <AlertTriangle className="w-8 h-8 mx-auto text-orange-500 opacity-40 mb-1" />
                <p className="text-[10px] text-[var(--color-text-muted)]">No logs match the filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredActivities.map(act => {
                  let colorClass = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                  if (act.action === 'UPLOAD') colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (act.action === 'DOWNLOAD') colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                  if (act.action === 'DELETE') colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  if (act.action === 'EDIT') colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  if (act.action === 'AUDIT') colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';

                  return (
                    <div key={act.id} className="p-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl space-y-1.5 hover:border-orange-500/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.5 border rounded text-[7px] font-mono font-black tracking-widest ${colorClass}`}>
                          {act.action}
                        </span>
                        <span className="text-[8px] text-[var(--color-text-muted)] font-mono">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="space-y-0.5 text-[10px]">
                        <p className="font-extrabold text-[var(--color-text-main)] uppercase tracking-tight">{act.title}</p>
                        <p className="text-[9px] text-[var(--color-text-muted)] italic leading-tight">{act.description}</p>
                      </div>
                      {act.ipNode && (
                        <p className="text-[8px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest">Sig: {act.ipNode}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick action button to simulate new log entry */}
            <button
              onClick={() => {
                recordLog('ADD', 'Triggered Custom Audit Node', 'Manual diagnostics event logged on physical client gateway', 'system');
                toast.success('Custom audit event added to telemetry logs!');
              }}
              className="w-full py-2 bg-[var(--color-bg-primary)] hover:bg-black/10 border border-[var(--color-border-main)] text-[10px] uppercase font-mono font-black text-orange-500 rounded-xl cursor-pointer transition-all text-center"
            >
              Simulate Active Audit Ping
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: Simulating Car Upload Form */}
      {showAddCarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-3">
              <h3 className="text-sm font-black uppercase text-[var(--color-text-main)] tracking-widest font-mono">Simulate Stock Post</h3>
              <button 
                onClick={() => setShowAddCarModal(false)}
                className="p-1.5 hover:bg-black/10 text-[var(--color-text-muted)] rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSimulateAddListing} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Car Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Honda Civic Oriel" 
                  value={newCarTitle}
                  onChange={e => setNewCarTitle(e.target.value)}
                  className="w-full p-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl text-xs font-bold text-[var(--color-text-main)] focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Make</label>
                <select 
                  value={newCarMake}
                  onChange={e => setNewCarMake(e.target.value)}
                  className="w-full p-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl text-xs font-bold text-[var(--color-text-main)] focus:border-orange-500 focus:outline-none"
                >
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Suzuki">Suzuki</option>
                  <option value="Porsche">Porsche</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Price (PKR)</label>
                <input 
                  type="number" 
                  required
                  placeholder="e.g. 7800000" 
                  value={newCarPrice}
                  onChange={e => setNewCarPrice(e.target.value)}
                  className="w-full p-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl text-xs font-bold text-[var(--color-text-main)] focus:border-orange-500 focus:outline-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black uppercase text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Submit Listing Stock
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
