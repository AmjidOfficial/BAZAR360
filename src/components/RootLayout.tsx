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
import { Bazar360Logo } from './Bazar360Logo';
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
      <header className="md:hidden sticky top-0 z-50 bg-[var(--color-bg-secondary)]/90 backdrop-blur-md border-b border-[var(--color-border-main)] px-4 py-3 flex items-center justify-between select-none">
        
        {/* Hamburger trigger & branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] active:scale-90 transition-all cursor-pointer bg-[var(--color-bg-primary)] border border-[var(--color-border-main)]"
            title="Open side menu"
          >
            <Menu size={16} />
          </button>
          
          <div 
            onClick={() => setTab('home')}
            className="cursor-pointer active:scale-95 transition-transform"
          >
            <Bazar360Logo showTagline={false} className="scale-85 origin-left" />
          </div>
        </div>

        {/* Utilities on the right */}
        <div className="flex items-center gap-2.5">
          
          {/* Favorites quicklink */}
          <button
            onClick={() => setTab('inventory')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 active:scale-90 transition-colors cursor-pointer"
            title="Favorites"
          >
            <Heart size={16} className={favoritesCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
          </button>



          {/* User profile avatar or dynamic trigger icon */}
          {currentUser ? (
            <button
              onClick={() => setTab('profile')}
              className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 text-slate-950 flex items-center justify-center font-extrabold text-[9.5px] uppercase font-mono shadow active:scale-90 transition-all cursor-pointer"
            >
              {(currentUser.displayName || currentUser.email?.split('@')[0] || 'U').substring(0, 1).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 active:scale-90 transition-colors cursor-pointer"
            >
              <User size={15} />
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
