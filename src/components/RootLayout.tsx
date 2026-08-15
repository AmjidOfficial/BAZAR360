/**
 * RootLayout.tsx
 * Consolidated full-app layout coordinator.
 * Manages sticky Desktop top navigation, Mobile bottom navigation, and integration of Mobile SidebarDrawer.
 */

import React, { useState } from 'react';
import Navbar from './Navbar';
import BottomNavBar from './BottomNavBar';
import SidebarDrawer from './SidebarDrawer';
import { UserProfile } from '../lib/dbService';

import { useTheme } from './ThemeContext';
import { Menu, Sun, Moon, User, Heart } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

interface RootLayoutProps {
  currentTab: string;
  setTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onLoginClick: () => void;
  lang: 'en' | 'ur';
  onLanguageToggle: () => void;
  favoritesCount?: number;
  compareCount?: number;
  children: React.ReactNode;
}

export default function RootLayout({
  currentTab,
  setTab,
  currentUser,
  onLogout,
  onLoginClick,
  lang,
  onLanguageToggle,
  favoritesCount = 0,
  compareCount = 0,
  children
}: RootLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-main)] flex flex-col pb-20 md:pb-0 font-sans">
      
      {/* DESKTOP STICKY NAVBAR */}
      <div className="hidden md:block sticky top-0 z-50">
        <Navbar
          currentTab={currentTab}
          setTab={setTab}
          currentUser={currentUser}
          onLogout={onLogout}
          onLoginClick={onLoginClick}
          lang={lang}
          onLanguageToggle={onLanguageToggle}
          favoritesCount={favoritesCount}
          compareCount={compareCount}
        />
      </div>

      {/* MOBILE HEADER (Aligned layout with hamburger trigger) */}
      <header className="md:hidden sticky top-0 z-50 bg-[var(--color-bg-secondary)]/90 backdrop-blur-xl border-b border-[var(--color-border-main)] px-4 py-3 flex items-center justify-between select-none shadow-sm">
        
        {/* Hamburger trigger & branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl text-[var(--color-text-main)] active:scale-95 transition-all cursor-pointer bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] shadow-sm"
            title="Open side menu"
          >
            <Menu size={18} />
          </button>
          
          <button 
            onClick={() => setTab('home')}
            className="cursor-pointer font-black text-sm uppercase tracking-widest text-[var(--color-text-main)] flex items-center gap-1"
          >
            Bazar360 <span className="text-orange-500">.</span>
          </button>
        </div>

        {/* Utilities on the right */}
        <div className="flex items-center gap-3">
          
          {/* Favorites quicklink */}
          <button
            onClick={() => setTab('inventory')}
            className="relative p-2 rounded-xl text-[var(--color-text-muted)] hover:text-rose-500 active:scale-95 transition-colors cursor-pointer bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] shadow-sm"
            title="Favorites"
          >
            <Heart size={16} className={favoritesCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-[var(--color-text-header)] font-mono text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[var(--color-bg-secondary)] shadow-sm">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* User profile avatar or dynamic trigger icon */}
          {currentUser ? (
            <button
              onClick={() => setTab('profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-[var(--color-text-header)] flex items-center justify-center font-black text-[10px] uppercase font-mono shadow-md active:scale-95 transition-all cursor-pointer border-2 border-[var(--color-bg-secondary)]"
            >
              {(currentUser.displayName || currentUser.email?.split('@')[0] || 'U').substring(0, 1).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="p-2 rounded-xl text-orange-500 active:scale-95 transition-colors cursor-pointer bg-orange-500/10 border border-orange-500/20 shadow-sm"
            >
              <User size={16} className="stroke-[2.5]" />
            </button>
          )}

        </div>
      </header>

      {/* MOBILE NAVIGATION SIDE-DRAWER */}
      <AnimatePresence>
        {drawerOpen && (
          <SidebarDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            currentTab={currentTab}
            setTab={setTab}
            currentUser={currentUser}
            onLogout={onLogout}
            onLoginClick={onLoginClick}
            lang={lang}
            onLanguageToggle={onLanguageToggle}
          />
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER FOR PAGE VIEWS */}
      <main className="flex-grow w-full relative">
        {children}
      </main>

      {/* MOBILE BOTTOM NAV BAR */}
      <BottomNavBar
        currentTab={currentTab}
        setTab={setTab}
        lang={lang}
        currentUser={currentUser}
      />

    </div>
  );
}
