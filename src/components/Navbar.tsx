import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  ArrowRightLeft, 
  User, 
  PlusCircle, 
  Sun, 
  Moon, 
  LogOut, 
  Grid,
  Store,
  Compass,
  Sparkles,
  HelpCircle,
  Menu,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { useTheme } from './ThemeContext';
import { Bazar360Logo } from './Bazar360Logo';

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
  favoritesCount = 0,
  compareCount = 0
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const isUrdu = lang === 'ur';

  const t = {
    en: {
      home: 'Home',
      inventory: 'Inventory',
      showrooms: 'Showrooms',
      sell: 'Sell Ad',
      login: 'Sign In',
      logout: 'Log Out',
      favorites: 'Favorites',
      compare: 'Compare',
      profile: 'My Profile',
      guest: 'Guest'
    },
    ur: {
      home: 'ہوم',
      inventory: 'انوینٹری',
      showrooms: 'شورومز',
      sell: 'اشتہار دیں',
      login: 'سائن ان',
      logout: 'لاگ آؤٹ',
      favorites: 'محفوظ',
      compare: 'موازنہ',
      profile: 'پروفائل',
      guest: 'مہمان'
    }
  }[lang];

  const navLinks = [
    { id: 'home', label: t.home, icon: Compass },
    { id: 'inventory', label: t.inventory, icon: Grid },
    { id: 'dealers', label: t.showrooms, icon: Store },
    { id: 'sell', label: t.sell, icon: PlusCircle, highlight: true }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--color-bg-secondary)]/85 backdrop-blur-md border-b border-[var(--color-border-main)] shadow-lg select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LEFT BRAND: Flexbox logo and identity */}
        <div className="flex items-center gap-4 shrink-0">
          <div 
            onClick={() => setTab('home')} 
            className="cursor-pointer active:scale-95 transition-all"
            title="Bazar360"
          >
            <Bazar360Logo showTagline={true} className="scale-90 md:scale-95 origin-left" />
          </div>
        </div>

        {/* CENTER LINKS: Elegant spaced row for desktop navigation */}
        <nav className="hidden md:flex items-center justify-center space-x-1 lg:space-x-2 bg-[var(--color-bg-primary)]/50 border border-[var(--color-border-main)] rounded-full p-1 max-w-lg">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id || (link.id === 'inventory' && currentTab === 'search');
            
            if (link.highlight) {
              return (
                <button
                  key={link.id}
                  onClick={() => setTab(link.id)}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105'
                      : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 hover:scale-102'
                  }`}
                >
                  <PlusCircle size={14} className="stroke-[2.5]" />
                  <span>{link.label}</span>
                </button>
              );
            }

            return (
              <button
                key={link.id}
                onClick={() => setTab(link.id)}
                className={`relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'text-[var(--color-accent-main)] font-black' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-full z-[-1]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT UTILITIES & ACCOUNT CHIP */}
        <div className="flex items-center gap-3">
          
          {/* Favorites widget */}
          <button
            onClick={() => setTab('inventory')}
            className="relative p-2 rounded-xl text-[var(--color-text-muted)] hover:text-rose-400 hover:bg-[var(--color-bg-primary)] transition-all cursor-pointer"
            title={t.favorites}
          >
            <Heart size={16} className={favoritesCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Language Switch */}
          <button
            onClick={onLanguageToggle}
            className="px-2 py-1 bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] text-orange-500 font-mono font-black text-[10px] rounded-lg border border-[var(--color-border-main)] cursor-pointer transition-all active:scale-95 uppercase tracking-widest shrink-0"
            title={isUrdu ? "Switch to English" : "اردو تبدیل کریں"}
          >
            {isUrdu ? 'EN' : 'اردو'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] border border-[var(--color-border-main)] cursor-pointer transition-all active:scale-95 shrink-0"
            title={theme === 'dark' ? "Switch to Warm Tactile Light Theme" : "Switch to Obsidian Dark Theme"}
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-700" />}
          </button>



          <div className="h-5 w-[1px] bg-[var(--color-border-main)]" />

          {/* User Profile / Login dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-orange-500/50 rounded-full py-1.5 pl-1.5 pr-3 cursor-pointer text-xs select-none transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 text-white flex items-center justify-center font-extrabold text-[10px] uppercase font-mono shadow-inner shrink-0">
                  {(currentUser.displayName || currentUser.email?.split('@')[0] || 'U').substring(0, 1).toUpperCase()}
                </div>
                <span className="text-[var(--color-text-main)] font-bold max-w-[80px] truncate uppercase tracking-wider hidden lg:inline">
                  {(currentUser.displayName || currentUser.email?.split('@')[0] || 'User').split(' ')[0]}
                </span>
                <ChevronDown size={12} className="text-[var(--color-text-muted)] shrink-0" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-[#0E1117] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 animate-fade-in text-left">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-[9px] font-mono font-black text-orange-500 uppercase tracking-widest">{currentUser.role || 'Member'}</p>
                      <p className="text-xs font-bold text-white truncate">{currentUser.displayName || 'Bazar360 User'}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setTab('profile');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <User size={13} />
                      <span>{t.profile}</span>
                    </button>

                    <button
                      onClick={() => {
                        onLogout();
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-black text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-2 border-t border-white/5 mt-1"
                    >
                      <LogOut size={13} />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-full text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-orange-500/15"
            >
              <User size={13} />
              <span>{t.login}</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
