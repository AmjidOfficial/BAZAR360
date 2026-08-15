/**
 * MobileSideDrawer.tsx
 * Premium responsive side navigation drawer supporting desktop, tablet, and mobile displays.
 * Integrates all structured sections: PROFILE, MAIN, SELL/POST, BUSINESS/SHOWROOM, SETTINGS, and ADMIN.
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Home, Search, Car, MapPin, Settings, LogOut, User, Sparkles, 
  ShieldAlert, Building2, Heart, MessageSquare, Bell, PlusCircle, 
  Image, Users, CreditCard, QrCode, Phone, ShieldCheck, Languages, 
  HelpCircle, Sun, Moon, Leaf, Flame
} from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { useTheme, ThemeClassType } from './ThemeContext';

interface MobileSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onLoginClick: () => void;
  lang: 'en' | 'ur';
  onLanguageToggle: () => void;
}

export default function MobileSideDrawer({
  isOpen,
  onClose,
  currentTab,
  setTab,
  currentUser,
  onLogout,
  onLoginClick,
  lang,
  onLanguageToggle
}: MobileSideDrawerProps) {
  const { currentTheme, setTheme } = useTheme();

  // Close drawer on ESC press & prevent background scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLinkClick = (tabId: string, subTab?: string) => {
    if (tabId === 'hq-hub') {
      try { sessionStorage.setItem('openHQTab', 'true'); } catch (e) {}
      setTab('hq-hub');
    } else {
      setTab(tabId);
    }
    if (subTab && window.dispatchEvent) {
      const event = new CustomEvent('set-profile-subtab', { detail: subTab });
      window.dispatchEvent(event);
    }
    onClose();
  };

  const isUrdu = lang === 'ur';

  // Available themes mapping
  const themeOptions = [
    { id: 'theme-luxury-light' as ThemeClassType, label: 'Luxury Light', icon: Sun, color: 'bg-white text-slate-800' },
    { id: 'theme-cosmic-dark' as ThemeClassType, label: 'Cosmic Dark', icon: Moon, color: 'bg-slate-950 text-slate-100' },
    { id: 'theme-emerald' as ThemeClassType, label: 'Emerald', icon: Leaf, color: 'bg-[#022C22] text-[#10B981]' },
    { id: 'theme-gold' as ThemeClassType, label: 'Gold', icon: Flame, color: 'bg-[#18181B] text-[#D4A373]' },
  ];

  const isAdmin = currentUser?.role === 'Admin' || 
                  currentUser?.role === 'Super Admin' || 
                  ['amjid.bisconni@gmail.com', 'khattakghani94@gmail.com', 'mazharsouls@gmail.com'].includes(currentUser?.email?.toLowerCase() || '');

  const isDealer = currentUser?.role?.toLowerCase().includes('showroom') || 
                   currentUser?.role?.toLowerCase().includes('dealer') || 
                   currentUser?.role?.toLowerCase().includes('owner');

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Main Responsive Drawer Slideout */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="relative h-full w-[85vw] sm:w-[360px] md:w-[380px] bg-[#071225] border-r border-white/10 flex flex-col justify-between overflow-y-auto text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.85)]"
      >
        <div>
          {/* A. Header Bar with Close Icon */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-widest text-white font-display">
                BAZAR<span className="text-[#007979]">360</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#007979]/20 border border-[#007979]/40 text-[#007979] text-[8px] font-mono font-bold uppercase tracking-wider">
                PREMIUM
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-[#007979]/20 text-slate-300 hover:text-[#007979] transition-all cursor-pointer border border-white/10 hover:border-[#007979]"
              title="Close Panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* B. PROFILE SECTION */}
          <div className="p-4 border-b border-white/10 bg-[#050B1A]/70">
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#007979] to-emerald-600 text-white flex items-center justify-center font-black text-sm uppercase shadow-md shrink-0">
                    {(currentUser.displayName || currentUser.email || 'U').substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="text-xs font-bold text-white truncate">
                      {currentUser.displayName || 'Bazar360 Member'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#007979]/20 border border-[#007979]/30 text-[#007979] text-[8px] font-mono font-bold uppercase tracking-wider rounded">
                      {currentUser.role || 'Individual User'}
                    </span>
                  </div>
                </div>
                
                {/* View / Edit Profile CTA shortcuts */}
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <button
                    onClick={() => handleLinkClick('profile', 'profile')}
                    className="py-1.5 px-3 rounded-lg bg-[#071225] border border-white/5 hover:border-[#007979]/30 hover:bg-[#007979]/10 text-slate-300 hover:text-white transition-all text-[9.5px] font-bold uppercase tracking-wider text-center cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleLinkClick('profile', 'profile')}
                    className="py-1.5 px-3 rounded-lg bg-[#007979] hover:bg-emerald-700 text-white transition-all text-[9.5px] font-bold uppercase tracking-wider text-center cursor-pointer shadow-sm"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-1">
                <p className="text-[9.5px] text-slate-400 text-center uppercase tracking-widest font-mono">
                  Welcome to Bazar360
                </p>
                <button
                  onClick={() => {
                    onLoginClick();
                    onClose();
                  }}
                  className="w-full py-2 bg-gradient-to-r from-[#007979] to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                >
                  <User size={13} strokeWidth={3} />
                  <span>Login / Register</span>
                </button>
              </div>
            )}
          </div>

          {/* C. MAIN SECTION */}
          <div className="p-3 border-b border-white/5 space-y-1">
            <p className="px-2 text-[8px] font-mono font-black text-[#007979] uppercase tracking-widest mb-1.5">
              Main Dashboard
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => handleLinkClick('home')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer hover:translate-x-1.5 ${
                  currentTab === 'home'
                    ? 'bg-[#007979]/15 text-[#007979] border-[#007979]/40 font-extrabold shadow-[0_0_15px_rgba(0,121,121,0.1)]'
                    : 'text-slate-300 hover:bg-[#0D1830] border-transparent hover:text-white'
                }`}
              >
                <Home size={15} className="transition-transform duration-300 group-hover:scale-110" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleLinkClick('inventory')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer hover:translate-x-1.5 ${
                  currentTab === 'inventory' || currentTab === 'search'
                    ? 'bg-[#007979]/15 text-[#007979] border-[#007979]/40 font-extrabold shadow-[0_0_15px_rgba(0,121,121,0.1)]'
                    : 'text-slate-300 hover:bg-[#0D1830] border-transparent hover:text-white'
                }`}
              >
                <Search size={15} className="transition-transform duration-300 group-hover:scale-110" />
                <span>Search vehicles</span>
              </button>

              <button
                onClick={() => handleLinkClick('dealers')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer hover:translate-x-1.5 ${
                  currentTab === 'dealers'
                    ? 'bg-[#007979]/15 text-[#007979] border-[#007979]/40 font-extrabold shadow-[0_0_15px_rgba(0,121,121,0.1)]'
                    : 'text-slate-300 hover:bg-[#0D1830] border-transparent hover:text-white'
                }`}
              >
                <Building2 size={15} className="transition-transform duration-300 group-hover:scale-110" />
                <span>Showrooms</span>
              </button>

              {currentUser && (
                <button
                  onClick={() => handleLinkClick('profile', 'posts')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer hover:translate-x-1.5 ${
                    currentTab === 'profile'
                      ? 'bg-[#007979]/15 text-[#007979] border-[#007979]/40 font-extrabold shadow-[0_0_15px_rgba(0,121,121,0.1)]'
                      : 'text-slate-300 hover:bg-[#0D1830] border-transparent hover:text-white'
                  }`}
                >
                  <Car size={15} className="transition-transform duration-300 group-hover:scale-110" />
                  <span>My Listings</span>
                </button>
              )}

              <button
                onClick={() => handleLinkClick('favorites')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer hover:translate-x-1.5 ${
                  currentTab === 'favorites'
                    ? 'bg-[#007979]/15 text-[#007979] border-[#007979]/40 font-extrabold shadow-[0_0_15px_rgba(0,121,121,0.1)]'
                    : 'text-slate-300 hover:bg-[#0D1830] border-transparent hover:text-white'
                }`}
              >
                <Heart size={15} className="text-rose-500 transition-transform duration-300 group-hover:scale-110" />
                <span>Saved Listings</span>
              </button>

              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-b360-messaging'));
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-[#007979] hover:translate-x-1.5 transition-all duration-300 cursor-pointer"
              >
                <MessageSquare size={15} />
                <span>Messages</span>
              </button>

              <button
                onClick={() => handleLinkClick('notifications')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer hover:translate-x-1.5 ${
                  currentTab === 'notifications'
                    ? 'bg-[#007979]/15 text-[#007979] border-[#007979]/40 font-extrabold shadow-[0_0_15px_rgba(0,121,121,0.1)]'
                    : 'text-slate-300 hover:bg-[#0D1830] border-transparent hover:text-white'
                }`}
              >
                <Bell size={15} className="transition-transform duration-300 group-hover:scale-110" />
                <span>Notifications</span>
              </button>
            </div>
          </div>

          {/* D. SELL / POST SECTION */}
          <div className="p-3 border-b border-white/5 space-y-1">
            <p className="px-2 text-[8px] font-mono font-black text-amber-500 uppercase tracking-widest mb-1.5">
              Sell & Advertisement
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => handleLinkClick('sell')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer hover:translate-x-1.5 ${
                  currentTab === 'sell'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    : 'text-slate-300 hover:bg-[#0D1830] border-transparent hover:text-amber-500'
                }`}
              >
                <Sparkles size={15} className="text-amber-500 transition-transform duration-300 group-hover:scale-110" />
                <span>Sell Vehicle (Managed)</span>
              </button>

              <button
                onClick={() => handleLinkClick('post-upload')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer hover:translate-x-1.5 ${
                  currentTab === 'post-upload'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    : 'text-slate-300 hover:bg-[#0D1830] border-transparent hover:text-amber-500'
                }`}
              >
                <PlusCircle size={15} className="transition-transform duration-300 group-hover:scale-110" />
                <span>Create Listing</span>
              </button>

              <button
                onClick={() => handleLinkClick('post-upload')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-amber-500 hover:translate-x-1.5 transition-all duration-300 cursor-pointer"
              >
                <Image size={15} />
                <span>Upload Media</span>
              </button>
            </div>
          </div>

          {/* E. BUSINESS / SHOWROOM SECTION */}
          {(isDealer || currentUser) && (
            <div className="p-3 border-b border-white/5 space-y-1">
              <p className="px-2 text-[8px] font-mono font-black text-emerald-500 uppercase tracking-widest mb-1.5">
                Business & Showroom HQ
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleLinkClick('hq-hub')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                    currentTab === 'hq-hub'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/35 font-extrabold'
                      : 'text-slate-300 hover:bg-[#0D1830] border-transparent hover:text-emerald-400'
                  }`}
                >
                  <Building2 size={15} />
                  <span>My Showroom</span>
                </button>

                <button
                  onClick={() => handleLinkClick('hq-hub')}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-emerald-400 cursor-pointer"
                >
                  <Car size={15} />
                  <span>Manage Inventory</span>
                </button>

                <button
                  onClick={() => handleLinkClick('hq-hub')}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-emerald-400 cursor-pointer"
                >
                  <Users size={15} />
                  <span>Showroom Members</span>
                </button>

                <button
                  onClick={() => handleLinkClick('hq-hub')}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-emerald-400 cursor-pointer"
                >
                  <CreditCard size={15} />
                  <span>Business Card</span>
                </button>

                <button
                  onClick={() => handleLinkClick('hq-hub')}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-emerald-400 cursor-pointer"
                >
                  <QrCode size={15} />
                  <span>QR Code</span>
                </button>

                <button
                  onClick={() => handleLinkClick('hq-hub')}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-emerald-400 cursor-pointer"
                >
                  <Phone size={15} />
                  <span>Contacts</span>
                </button>
              </div>
            </div>
          )}

          {/* F. SETTINGS & APP APPEARANCE SECTION */}
          <div className="p-3 border-b border-white/5 space-y-2">
            <p className="px-2 text-[8px] font-mono font-black text-violet-400 uppercase tracking-widest">
              Configuration Settings
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => handleLinkClick('profile', 'profile')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-violet-400 cursor-pointer"
              >
                <Settings size={15} />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => handleLinkClick('profile', 'privacy')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-violet-400 cursor-pointer"
              >
                <ShieldCheck size={15} />
                <span>Privacy & Security</span>
              </button>

              <button
                onClick={() => handleLinkClick('profile', 'notifications')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-violet-400 cursor-pointer"
              >
                <Bell size={15} />
                <span>Notifications Panel</span>
              </button>

              {/* Language Selector */}
              <button
                onClick={onLanguageToggle}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-violet-400 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Languages size={15} />
                  <span>Language</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-[#007979]/20 border border-[#007979]/40 text-[#007979] px-2 py-0.5 rounded uppercase">
                  {lang === 'ur' ? 'اردو (Urdu)' : 'English'}
                </span>
              </button>

              <button
                onClick={() => handleLinkClick('services')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-violet-400 cursor-pointer"
              >
                <HelpCircle size={15} />
                <span>Help & Support</span>
              </button>
            </div>

            {/* APPEARANCE / THEME INLINE SELECTOR CHANGER */}
            <div className="px-2 py-2 mt-2 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
              <span className="block text-[8.5px] font-mono font-black uppercase text-slate-400 tracking-wider">
                Appearance & Colors
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {themeOptions.map((opt) => {
                  const isSelected = currentTheme === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className={`px-2 py-1.5 rounded-lg border text-[9.5px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#007979] bg-[#007979]/10 text-white font-black'
                          : 'border-white/5 bg-slate-900/40 text-slate-400 hover:text-white hover:border-white/10'
                      }`}
                    >
                      <Icon size={12} className={isSelected ? 'text-[#007979]' : 'text-slate-400'} />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* G. ADMIN SECTION */}
          {isAdmin && (
            <div className="p-3 border-b border-white/5 bg-red-950/10 space-y-1">
              <p className="px-2 text-[8px] font-mono font-black text-red-500 uppercase tracking-widest mb-1.5">
                🔒 System Administration
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleLinkClick('admin')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'text-slate-300 hover:bg-[#0D1830] border-transparent hover:text-red-400'
                  }`}
                >
                  <ShieldAlert size={15} />
                  <span>Admin Dashboard</span>
                </button>

                <button
                  onClick={() => handleLinkClick('admin')}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-red-400 cursor-pointer"
                >
                  <Users size={15} />
                  <span>User Management</span>
                </button>

                <button
                  onClick={() => handleLinkClick('admin')}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-red-400 cursor-pointer"
                >
                  <Building2 size={15} />
                  <span>Showroom management</span>
                </button>

                <button
                  onClick={() => handleLinkClick('admin')}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-red-400 cursor-pointer"
                >
                  <Car size={15} />
                  <span>Content Management</span>
                </button>

                <button
                  onClick={() => handleLinkClick('admin')}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-300 hover:bg-[#0D1830] border border-transparent hover:text-red-400 cursor-pointer"
                >
                  <ShieldCheck size={15} />
                  <span>Reports & Audit Logs</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* H. Bottom Drawer Footer with Signout */}
        <div className="p-3 border-t border-white/10 bg-slate-950/60 space-y-2">
          {currentUser && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-lg text-[9.5px] font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <LogOut size={13} />
              <span>Sign Out Account</span>
            </button>
          )}

          <div className="text-center pt-1">
            <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest block">
              Bazar360 &copy; 2026.online
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
