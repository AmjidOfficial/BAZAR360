import React from 'react';
import { Compass, PlusCircle, Grid, Store, User, MessageCircle } from 'lucide-react';
import { useTheme } from './ThemeContext';

import { ThemeSwitcher } from './ThemeSwitcher';
import MobileBottomNav from './MobileBottomNav';

interface NavProps {
  currentTab: string;
  setTab: (tab: string) => void;
  lang: 'en' | 'ur';
  currentUser: any;
  onLogout: () => void;
  onLoginClick: () => void;
}

export function MainNavigation({ currentTab, setTab, lang, currentUser, onLogout, onLoginClick }: NavProps) {
  const { theme } = useTheme();

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'sell', label: 'Sell', icon: PlusCircle },
    { id: 'inventory', label: 'Buy', icon: Grid },
    { id: 'dealers', label: 'Showrooms', icon: Store },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, url: 'https://wa.me/923159085086' }
  ];

  return (
    <>
      {/* Desktop Sticky Nav */}
      <nav className="hidden md:flex sticky top-0 z-50 bg-[var(--color-bg-primary)]/90 backdrop-blur-md border-b border-[var(--color-border-main)] py-4 px-6 items-center justify-between">
        <button onClick={() => setTab('home')} className="font-black text-sm uppercase tracking-wider text-[var(--color-text-header)] hover:text-[var(--color-accent-main)] transition-colors cursor-pointer flex items-center gap-1">
          <span className="text-[var(--color-accent-main)]">BAZAR</span>
          <span>360</span>
        </button>
        
        <div className="flex items-center gap-6">
          {navItems.map(item => (
            item.url ? (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold uppercase text-emerald-400 hover:text-emerald-300 transition-colors">
                <item.icon size={18} />
                {item.label}
              </a>
            ) : (
              <button key={item.id} onClick={() => setTab(item.id)} className={`text-sm font-bold uppercase cursor-pointer transition-colors ${currentTab === item.id ? 'text-[var(--color-accent-main)] font-extrabold' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'}`}>
                {item.label}
              </button>
            )
          ))}
          {currentUser ? (
            <button onClick={onLogout} className="text-sm font-bold uppercase text-rose-500 hover:text-rose-400 transition-colors cursor-pointer">Logout</button>
          ) : (
            <button onClick={onLoginClick} className="text-sm font-bold uppercase text-[var(--color-accent-main)] hover:text-[var(--color-accent-hover)] transition-colors cursor-pointer">Login</button>
          )}
          <ThemeSwitcher />
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav currentTab={currentTab} setTab={setTab} lang={lang} />
    </>
  );
}
