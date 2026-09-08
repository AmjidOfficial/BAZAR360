import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  User, 
  PlusCircle, 
  LogOut, 
  Grid,
  Store,
  ChevronDown,
  Wrench,
  BookOpen,
  MapPin
} from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import Bazar360Logo from './Bazar360Logo';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onLoginClick: () => void;
  lang: 'en' | 'ur';
  onLanguageToggle: () => void;
  favoritesCount?: number;
  compareCount?: number;
}

export default function Navbar({
  currentTab,
  setTab,
  currentUser,
  onLogout,
  onLoginClick,
  lang,
  onLanguageToggle,
  favoritesCount = 0
}: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const isUrdu = lang === 'ur';

  const t = {
    en: {
      home: 'Home',
      buy: 'Buy Cars',
      sell: 'Sell Your Car',
      showrooms: 'Showrooms',
      services: 'Services',
      guides: 'Car Guides',
      locations: 'Locations',
      login: 'Sign In',
      logout: 'Log Out',
      favorites: 'Favorites',
      postCar: 'Post Your Car',
      profile: 'My Profile',
      guest: 'Guest'
    },
    ur: {
      home: 'ہوم',
      buy: 'گاڑیاں خریدیں',
      sell: 'گاڑی بیچیں',
      showrooms: 'شورومز',
      services: 'سروسز',
      guides: 'رہنمائی',
      locations: 'مقامات',
      login: 'سائن ان',
      logout: 'لاگ آؤٹ',
      favorites: 'محفوظ',
      postCar: 'گاڑی کا اشتہار دیں',
      profile: 'پروفائل',
      guest: 'مہمان'
    }
  }[lang];

  const navLinks = [
    { id: 'inventory', label: t.buy, icon: Grid },
    { id: 'sell', label: t.sell, icon: PlusCircle },
    { id: 'dealers', label: t.showrooms, icon: Store },
    { id: 'services', label: t.services, icon: Wrench },
    { id: 'guides', label: t.guides, icon: BookOpen },
    { id: 'locations', label: t.locations, icon: MapPin },
  ];

  return (
    <header className="fixed top-3 left-0 right-0 z-50 w-full px-3 sm:px-6 pointer-events-none flex justify-center">
      <motion.div 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-7xl bg-[var(--color-bg-secondary)]/95 backdrop-blur-2xl border border-[var(--color-border-main)] shadow-2xl rounded-[1.5rem] h-16 flex items-center justify-between px-4 sm:px-6 pointer-events-auto"
      >
        
        {/* LEFT BRAND LOGO */}
        <div className="flex items-center gap-3 shrink-0">
          <Bazar360Logo 
            variant="header" 
            size="sm" 
            onClick={() => setTab('home')} 
          />
        </div>

        {/* CENTER LINKS */}
        <nav className="hidden lg:flex items-center justify-center space-x-1 p-1">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id || (link.id === 'inventory' && currentTab === 'search');

            return (
              <button
                key={link.id}
                type="button"
                onClick={() => setTab(link.id)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'text-white bg-[var(--color-bg-tertiary)] border border-[var(--color-accent-main)]/40 shadow-sm' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] hover:bg-[var(--color-bg-tertiary)]/60'
                }`}
              >
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT UTILITIES & ACCOUNT CHIP */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Favorites widget */}
          <button
            type="button"
            onClick={() => setTab('inventory')}
            className="relative p-2.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] hover:bg-[var(--color-bg-tertiary)] transition-all cursor-pointer border border-transparent hover:border-[var(--color-border-main)]"
            title={t.favorites}
            aria-label="View Favorites"
          >
            <Heart size={18} className={favoritesCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--color-accent-main)] text-[#030712] font-mono font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-[var(--color-border-main)]">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Language Switch */}
          <button 
            type="button"
            onClick={onLanguageToggle}
            className="hidden sm:flex items-center justify-center px-2.5 py-1.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] text-xs font-bold text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent-main)]/40 transition-all cursor-pointer"
            title={isUrdu ? "Switch to English" : "اردو میں تبدیل کریں"}
          >
            <span>{isUrdu ? 'EN' : 'اردو'}</span>
          </button>

          {/* Primary Post Your Car CTA Button */}
          <button
            type="button"
            onClick={() => setTab('sell')}
            className="px-4 py-2 rounded-xl bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-hover)] text-[#030712] text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md transform active:scale-98"
          >
            <PlusCircle size={15} />
            <span className="hidden sm:inline">{t.postCar}</span>
            <span className="sm:hidden">{t.sell}</span>
          </button>

          <div className="h-5 w-px bg-white/10 hidden sm:block mx-0.5" />

          {/* Profile Dropdown */}
          <div className="relative">
            {currentUser ? (
              <button 
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent-main)]/40 transition-all cursor-pointer group"
              >
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || ''} 
                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[var(--color-accent-main)] text-[#030712] flex items-center justify-center text-xs font-extrabold uppercase font-mono shadow-inner">
                    {(currentUser.displayName || currentUser.email?.split('@')[0] || 'U').substring(0, 1)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-bold text-white group-hover:text-[var(--color-accent-main)] transition-colors truncate max-w-[80px]">
                    {(currentUser.displayName || currentUser.email?.split('@')[0] || t.guest).split(' ')[0]}
                  </p>
                </div>
                <ChevronDown size={14} className="text-[var(--color-text-muted)] group-hover:text-white transition-colors" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onLoginClick}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary)]/80 text-[var(--color-text-header)] rounded-xl border border-[var(--color-border-main)] text-xs font-bold tracking-wide transition-all hover:border-[var(--color-accent-main)]/40 cursor-pointer"
              >
                <User size={14} className="text-[var(--color-accent-main)]" />
                <span>{t.login}</span>
              </button>
            )}
            
            {/* Dropdown Menu */}
            {profileOpen && currentUser && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                >
                  <div className="px-4 py-3 border-b border-[var(--color-border-main)] mb-2">
                    <p className="text-[10px] font-bold text-[var(--color-accent-main)] uppercase tracking-wider mb-1">{currentUser.role || 'Member'}</p>
                    <p className="text-xs font-bold text-[var(--color-text-header)] truncate">{currentUser.displayName || 'User'}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">{currentUser.email}</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); setTab('profile'); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-[var(--color-text-header)] hover:bg-[var(--color-bg-tertiary)] rounded-xl flex items-center transition-colors cursor-pointer group"
                  >
                    <User size={14} className="mr-2.5 text-[var(--color-text-muted)] group-hover:text-white transition-colors" />
                    {t.profile}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); onLogout(); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center transition-colors cursor-pointer mt-1"
                  >
                    <LogOut size={14} className="mr-2.5" />
                    {t.logout}
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </header>
  );
}
