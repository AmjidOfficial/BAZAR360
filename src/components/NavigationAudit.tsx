/**
 * NavigationAudit.tsx
 * Unified layout and navigation wrapping component for Bazar360.
 * Sets up a clean, premium responsive top header and manages opening/closing the sidebar drawer.
 */

import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, MessageSquare, User } from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import MobileSideDrawer from './MobileSideDrawer';

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
  const [searchVal, setSearchVal] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const t = {
    en: {
      searchPlaceholder: 'Search cars, make, model...',
    },
    ur: {
      searchPlaceholder: 'گاڑی تلاش کریں...',
    }
  }[lang] || { searchPlaceholder: 'Search cars, make, model...' };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchVal);
      setTab('inventory');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-main)] flex flex-col pb-16 md:pb-0 font-sans">
      
      {/* ========================================================= */}
      {/* UNIFIED RESPONISVE TOP HEADER                             */}
      {/* ========================================================= */}
      <header
        id="bazar360-app-header"
        className="sticky top-0 z-50 h-16 w-full bg-white dark:bg-[#071225] border-b border-[#E2E8F0] dark:border-white/10 transition-all flex items-center px-4 md:px-8 select-none shadow-xs"
      >
        <div className="w-full max-w-7xl mx-auto flex items-center h-full">
          
          {/* DESKTOP LAYOUT GRID */}
          <div className="hidden md:flex items-center justify-between w-full h-full gap-4">
            
            {/* 1. MENU BUTTON */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="min-w-[40px] min-h-[40px] p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-[#007979] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer flex items-center justify-center border border-transparent hover:border-[#E2E8F0] dark:hover:border-white/10 active:scale-90 hover:scale-105 hover:shadow-xs"
              title="Open Navigation"
            >
              <Menu size={20} className="stroke-[2.5]" />
            </button>

            {/* 2. BAZAR360 LOGO */}
            <div className="flex items-center cursor-pointer shrink-0 transition-transform duration-300 hover:scale-105 active:scale-95" onClick={() => setTab('home')}>
              <span className="font-bold text-lg uppercase tracking-widest text-[#0F172A] dark:text-white flex items-center gap-1.5">
                <span className="text-[#007979] font-black font-display">BAZAR</span>
                <span className="font-black tracking-[0.15em] text-[#0F172A] dark:text-white">360</span>
                <span className="px-1.5 py-0.5 bg-[#007979]/10 border border-[#007979]/20 text-[#007979] text-[9px] font-mono font-bold tracking-widest rounded ml-1 transition-all duration-300 hover:bg-[#007979]/20">
                  .ONLINE
                </span>
              </span>
            </div>

            {/* 3. SEARCH AREA */}
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 w-64 lg:w-72 focus-within:ring-2 focus-within:ring-[#007979] focus-within:border-transparent focus-within:scale-105 transition-all duration-300 shrink-0 shadow-2xs">
              <Search size={14} className="text-slate-400 dark:text-slate-500 shrink-0 mr-2 transition-transform duration-300 group-focus-within:scale-110" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 w-full"
              />
            </form>

            {/* 4. SPACER */}
            <div className="flex-grow" />

            {/* 5. NOTIFICATIONS */}
            <button
              onClick={() => setTab('notifications')}
              className="min-w-[40px] min-h-[40px] p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#007979] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-110 hover:-rotate-6 cursor-pointer flex items-center justify-center border border-transparent hover:border-[#E2E8F0] dark:hover:border-white/10 active:scale-95 relative"
              title="Notifications"
            >
              <Bell size={18} />
              {favoritesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white font-mono text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* 6. MESSAGES */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-b360-messaging'))}
              className="min-w-[40px] min-h-[40px] p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#007979] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-110 hover:rotate-6 cursor-pointer flex items-center justify-center border border-transparent hover:border-[#E2E8F0] dark:hover:border-white/10 active:scale-95"
              title="Messages"
            >
              <MessageSquare size={18} />
            </button>

            {/* 7. PROFILE AVATAR / SIGN IN */}
            {currentUser ? (
              <button
                onClick={() => setTab('profile')}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-[#007979]/50 hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,121,121,0.15)] transition-all duration-300 cursor-pointer shrink-0"
                title="My Dashboard"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-white border border-[#007979]/20 shrink-0">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Avatar'}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#007979] flex items-center justify-center font-black text-[11px] text-white font-mono">
                      {(currentUser.displayName || currentUser.email || 'M')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col text-left pr-1.5">
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-none max-w-[80px] truncate">
                    {currentUser.displayName || 'Profile'}
                  </span>
                  <span className="text-[7.5px] font-mono font-black text-[#007979] uppercase tracking-wider leading-none mt-0.5">
                    {currentUser.role || 'Member'}
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-[#007979] hover:bg-[#005f5f] hover:shadow-[0_4px_15px_rgba(0,121,121,0.3)] hover:-translate-y-0.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer active:scale-95"
                title="Sign In"
              >
                Sign In
              </button>
            )}
          </div>

          {/* MOBILE LAYOUT GRID */}
          <div className="flex md:hidden items-center justify-between w-full h-full gap-2">
            
            {/* 1. MENU BUTTON */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="min-w-[38px] min-h-[38px] p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-[#007979] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-xs"
              title="Open Menu"
            >
              <Menu size={18} className="stroke-[2.5]" />
            </button>

            {/* 2. BAZAR360 LOGO */}
            <div className="flex items-center cursor-pointer shrink-0" onClick={() => setTab('home')}>
              <span className="font-bold text-sm uppercase tracking-widest text-[#0F172A] dark:text-white flex items-center gap-1">
                <span className="text-[#007979] font-black font-display">BAZAR</span>
                <span className="font-black text-[#0F172A] dark:text-white">360</span>
                <span className="px-1 py-0.2 bg-[#007979]/10 border border-[#007979]/20 text-[#007979] text-[8px] font-mono font-bold tracking-wider rounded">
                  .ONLINE
                </span>
              </span>
            </div>

            {/* 3. SPACER */}
            <div className="flex-grow" />

            {/* 4. SEARCH */}
            <button
              onClick={() => setTab('inventory')}
              className="min-w-[38px] min-h-[38px] p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#007979] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 active:scale-90 transition-all cursor-pointer flex items-center justify-center shadow-xs"
              title="Search Vehicles"
            >
              <Search size={16} />
            </button>

            {/* 5. PROFILE */}
            {currentUser ? (
              <button
                onClick={() => setTab('profile')}
                className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-[#007979]/20 shrink-0 shadow-xs cursor-pointer active:scale-90 transition-all"
                title="My Dashboard"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Avatar'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-[#007979] flex items-center justify-center font-black text-xs text-white font-mono">
                    {(currentUser.displayName || currentUser.email || 'M')[0].toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="min-w-[38px] min-h-[38px] p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#007979] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 active:scale-90 transition-all cursor-pointer flex items-center justify-center shadow-xs"
                title="Sign In"
              >
                <User size={16} />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTAINER FOR PAGE VIEWS                             */}
      {/* ========================================================= */}
      <main className="flex-grow w-full relative">
        {children}
      </main>

      {/* Sliding Hamburger Navigation Side Drawer (Responsive) */}
      <MobileSideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        setTab={setTab}
        currentUser={currentUser}
        onLogout={onLogout}
        onLoginClick={onLoginClick}
        lang={lang}
        onLanguageToggle={onLanguageToggle}
      />

    </div>
  );
}
