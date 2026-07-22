/**
 * NavigationAudit.tsx
 * Unified Layout Component.
 * Responsibilities:
 * 1. Handles the Desktop Top-Nav Sticky Header: [Logo] [Links: Home, Inventory, Showrooms, Sell] [Search Bar] [Profile/Login Dropdown].
 * 2. Handles Mobile Header with Hamburger side drawer trigger.
 * 3. Mounts MobileSideDrawer and Mobile Bottom Navigation bar.
 * 4. Ensures all buttons, focus targets, and CTAs use accessible high-contrast color styles.
 */

import React, { useState } from 'react';
import { 
  Menu, Sun, Moon, Search, User, Heart, ChevronDown, 
  LogOut, PlusCircle, Compass, Grid, Store, Sparkles, MessageCircle, ShieldAlert 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../lib/dbService';
import { useTheme } from './ThemeContext';
import { Bazar360Logo } from './Bazar360Logo';
import { ThemeSwitcher } from './ThemeSwitcher';
import MobileSideDrawer from './MobileSideDrawer';
import MobileBottomNav from './MobileBottomNav';

interface NavigationAuditProps {
  currentTab: string;
  setTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onLoginClick: () => void;
  lang: 'en' | 'ur';
  onLanguageToggle: () => void;
  favoritesCount?: number;
  onSearchChange?: (val: string) => void;
  children: React.ReactNode;
}

export default function NavigationAudit({
  currentTab,
  setTab,
  currentUser,
  onLogout,
  onLoginClick,
  lang,
  onLanguageToggle,
  favoritesCount = 0,
  onSearchChange,
  children
}: NavigationAuditProps) {
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const isUrdu = lang === 'ur';

  const t = {
    en: {
      home: 'Home',
      bookings: 'Bookings',
      bookNow: 'Book Now',
      myTrips: 'My Trips',
      profile: 'Profile',
      searchPlaceholder: 'Search cars, make, model...',
      login: 'Sign In',
      logout: 'Log Out',
      sell: 'Sell Car',
    },
    ur: {
      home: 'ہوم',
      bookings: 'بکنگز',
      bookNow: 'بک کریں',
      myTrips: 'میری سفر',
      profile: 'پروفائل',
      searchPlaceholder: 'گاڑی تلاش کریں...',
      login: 'سائن ان',
      logout: 'لاگ آؤٹ',
      sell: 'اشتہار دیں',
    }
  }[lang];

  const MALAK_MAZHAR_WHATSAPP = '923159085086'; // Placeholder for requested number

  const navLinks = [
    { id: 'home', label: t.home, icon: Compass },
    { id: 'inventory', label: 'Buy Cars', icon: Grid },
    { id: 'dealers', label: 'Showrooms', icon: Store },
    { id: 'community', label: 'Community', icon: Sparkles },
    { id: 'sell', label: 'Post Ad', icon: PlusCircle },
    ...(currentUser?.role === 'Admin' ? [{ id: 'admin', label: 'Admin', icon: ShieldAlert }] : [])
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchVal);
      setTab('inventory');
    }
  };

  const handleLinkClick = (id: string) => {
    if (id === 'auth') {
      currentUser ? onLogout() : onLoginClick();
    } else if (id === 'whatsapp') {
      window.open(`https://wa.me/${MALAK_MAZHAR_WHATSAPP}`, '_blank');
    } else {
      setTab(id);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-main)] flex flex-col pb-16 md:pb-0 font-sans">
      
      {/* ========================================================= */}
      {/* DESKTOP STICKY DOCKED HEADER                              */}
      {/* ========================================================= */}
      <header className="hidden md:block sticky top-0 z-50 w-full bg-[var(--color-bg-secondary)]/95 backdrop-blur-md border-b border-[var(--color-border-main)] shadow-md select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* A. Platform Logo Lockup (Bazar360.online) */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setTab('home')}>
            <Bazar360Logo showTagline={false} />
          </div>

          {/* B. Centered Main Navigation Links */}
          <nav className="flex items-center gap-1 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-full p-1.5 shrink-0">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id || (link.id === 'inventory' && currentTab === 'search');
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'text-[#FF6B00] font-black' 
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  }`}
                  id={`nav-link-${link.id}`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="auditTabIndicator"
                      className="absolute inset-0 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-full z-[-1]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* C. Header Action Utilities: Theme Switcher & Favorites */}
          <div className="flex items-center gap-3.5 shrink-0">
            
            {/* 1. Theme Switcher */}
            <ThemeSwitcher />

            {/* 2. Love / Favorites with counter */}
            <button
              onClick={() => setTab('inventory')}
              className="p-2.5 rounded-xl text-[var(--color-text-muted)] hover:text-rose-500 hover:bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] transition-all cursor-pointer relative bg-[var(--color-bg-primary)]"
              title="View Favorites"
            >
              <Heart size={15} className={favoritesCount > 0 ? "fill-rose-500 text-rose-500 animate-pulse" : ""} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
                  {favoritesCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MOBILE STICKY NAVIGATION HEADER                           */}
      {/* ========================================================= */}
      <header className="md:hidden sticky top-0 z-50 bg-[var(--color-bg-secondary)]/90 backdrop-blur-md border-b border-[var(--color-border-main)] px-4 py-3 flex items-center justify-between select-none">
        
        {/* Platform Logo (Bazar360.online) */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab('home')}>
          <Bazar360Logo showIcon={true} showText={true} showTagline={false} className="scale-90 origin-left" />
        </div>

        {/* Utilities on the right */}
        <div className="flex items-center gap-2.5">
          
          {/* 1. Theme toggle icon */}
          <ThemeSwitcher />

          {/* 2. Favorites quicklink */}
          <button
            onClick={() => setTab('inventory')}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] active:scale-90 transition-all cursor-pointer relative"
            title="Favorites"
          >
            <Heart size={15} className={favoritesCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-[8px] font-black px-1 rounded-full shadow-md">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* 3. Side Drawer 3 Lines (Hamburger) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] active:scale-90 transition-all cursor-pointer bg-[var(--color-bg-primary)] border border-[var(--color-border-main)]"
            title="Open side menu drawer"
            id="mobile-drawer-trigger"
          >
            <Menu size={16} />
          </button>

        </div>

      </header>

      {/* ========================================================= */}
      {/* MOBILE HAMBURGER SIDE-DRAWER                              */}
      {/* ========================================================= */}
      <AnimatePresence>
        {drawerOpen && (
          <MobileSideDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            currentTab={currentTab}
            setTab={setTab}
            currentUser={currentUser}
            onLogout={onLogout}
            onLoginClick={onLoginClick}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MAIN CONTAINER FOR PAGE VIEWS                             */}
      {/* ========================================================= */}
      <main className="flex-grow w-full relative">
        {children}
      </main>

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR                              */}
      {/* ========================================================= */}
      <MobileBottomNav currentTab={currentTab} setTab={setTab} lang={lang} />



    </div>
  );
}
