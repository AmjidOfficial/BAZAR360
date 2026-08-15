/**
 * SidebarDrawer.tsx
 * Professional sliding navigation drawer for mobile screens (Hamburger menu).
 * Implements smooth spring-based sliding animations and glassmorphic aesthetics.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Home, 
  Car, 
  MapPin, 
  PlusCircle, 
  User, 
  Heart, 
  Info, 
  PhoneCall, 
  Settings, 
  LogOut, 
  HelpCircle, 
  FileText, 
  Globe,
  Star,
  Sparkles,
  ShieldCheck,
  Search,
  DollarSign,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { useTheme } from './ThemeContext';
import Bazar360Logo from './Bazar360Logo';

interface SidebarDrawerProps {
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

export default function SidebarDrawer({
  isOpen,
  onClose,
  currentTab,
  setTab,
  currentUser,
  onLogout,
  onLoginClick,
  lang,
  onLanguageToggle
}: SidebarDrawerProps) {
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const t = {
    en: {
      navigation: "Auto Choice Menu",
      home: "Home",
      inventory: "Search Fleet",
      showrooms: "Showrooms",
      sell: "Post Adv / Sell",
      profile: "User Profile",
      showroomHq: "Showroom HQ",
      logout: "Log Out",
      login: "Login / Register",
      language: "Language",
      tagline: "Powered by Bazar360.online",
      favorites: "Saved Vehicles",
      faq: "FAQ & Help",
      help: "Help & Support",
      terms: "Terms & Conditions"
    },
    ur: {
      navigation: "آٹو چوائس مینو",
      home: "ہوم",
      inventory: "گاڑیاں تلاش کریں",
      showrooms: "شورومز",
      sell: "اشتہار پوسٹ کریں",
      profile: "پروفائل",
      showroomHq: "شوروم ہیڈ کوارٹر",
      logout: "لاگ آؤٹ",
      login: "لاگ ان / رجسٹر",
      language: "زبان",
      tagline: "Powered by Bazar360.online",
      favorites: "محفوظ شدہ گاڑیاں",
      faq: "اکثر پوچھے گئے سوالات",
      help: "مدد اور تعاون",
      terms: "شرائط و ضوابط"
    }
  }[lang];

  const handleLinkClick = (tabId: string) => {
    setTab(tabId);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
        {/* Dark Emerald Glass Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[var(--color-bg-secondary)]/90 backdrop-blur-2xl"
        />

        {/* Full-screen Glassmorphic Navigation Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          className="relative w-full max-w-lg max-h-[90vh] bg-[var(--color-bg-secondary)]/90 border border-[var(--color-accent-main)]/30 rounded-[32px] p-6 sm:p-8 overflow-y-auto text-[var(--color-text-header)] shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10 flex flex-col justify-between"
        >
          {/* Top Bar with Dual Logos & Close */}
          <div className="flex items-center justify-between border-b border-[var(--color-accent-main)]/20 pb-4 mb-5">
            <Bazar360Logo variant="header" size="md" showTagline={true} />

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[var(--color-accent-main)]/10 hover:bg-[var(--color-accent-main)]/20 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/30 transition-all cursor-pointer active:scale-95"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Account Quick Tile */}
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-[var(--color-accent-main)]/20">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent-main)] overflow-hidden text-black font-extrabold flex items-center justify-center text-sm uppercase shrink-0 border border-[var(--color-accent-main)]/30">
                    {currentUser.photoURL || (currentUser as any).profilePhoto || (currentUser as any).avatar ? (
                      <img
                        src={currentUser.photoURL || (currentUser as any).profilePhoto || (currentUser as any).avatar}
                        alt={currentUser.displayName || 'Profile'}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--color-text-header)] truncate">{currentUser.displayName || 'Bazar360 Member'}</p>
                    <p className="text-[10px] text-emerald-300/80 font-mono truncate">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleLinkClick('profile')}
                  className="px-3 py-1.5 rounded-xl bg-[var(--color-accent-main)]/20 hover:bg-[var(--color-accent-main)]/30 border border-[var(--color-accent-main)]/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  {t.profile}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-200">Welcome to Auto Choice</p>
                  <p className="text-[10px] text-[var(--color-accent-main)]/80 font-sans">Sign in to post vehicles & chat</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onLoginClick();
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--color-accent-main)] text-black font-extrabold text-xs tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {t.login}
                </button>
              </div>
            )}
          </div>

          {/* Primary Mobile Navigation Grid (2-Columns) matching clean app design */}
          <div className="space-y-4 mb-6">
            <span className="text-[10px] font-mono font-bold text-[var(--color-accent-main)] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={13} /> {t.navigation}
            </span>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'home', label: t.home, icon: Home, desc: 'Main Marketplace' },
                { id: 'inventory', label: t.inventory, icon: Search, desc: 'Browse Vehicles' },
                { id: 'sell', label: 'Sell For U', icon: Sparkles, desc: 'VIP Brokerage Service', highlightAmber: true },
                { id: 'post-upload', label: 'Post Adv.', icon: PlusCircle, desc: 'Direct Vehicle Posting', highlightAzure: true },
                { id: 'dealers', label: t.showrooms, icon: MapPin, desc: 'Direct Dealers' },
                { id: 'services', label: 'Services', icon: ShieldCheck, desc: '200+ Point Inspection' },
                { id: 'faq', label: t.faq, icon: HelpCircle, desc: 'Help & Knowledge' },
                { id: 'favorites', label: t.favorites, icon: Heart, desc: 'Saved Stock' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleLinkClick(item.id)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group active:scale-95 ${
                      item.highlightAmber 
                        ? 'bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border-amber-400/50 hover:border-amber-400'
                        : item.highlightAzure
                        ? 'bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent border-blue-400/50 hover:border-blue-400'
                        : isActive
                        ? 'bg-[var(--color-accent-main)]/20 border-[var(--color-accent-main)]/60'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl ${item.highlightAmber ? 'bg-amber-500 text-slate-950 font-bold' : item.highlightAzure ? 'bg-blue-600 text-[var(--color-text-header)] font-bold' : 'bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)]'}`}>
                        <Icon size={18} />
                      </div>
                      <ShieldCheck size={14} className="text-[var(--color-accent-main)]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-text-header)] tracking-tight">{item.label}</p>
                      <p className="text-[10px] text-emerald-300/70 font-sans">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Utility Row (Language & Logout) */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">

            <button
              onClick={onLanguageToggle}
              className="py-3 px-3 rounded-2xl bg-emerald-950/60 border border-[var(--color-accent-main)]/30 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-emerald-900/60"
            >
              <Globe size={15} />
              <span>{lang === 'en' ? 'اردو' : 'EN'}</span>
            </button>

            {currentUser && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="py-3 px-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-red-500/20"
              >
                <LogOut size={15} />
                <span>{t.logout}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
