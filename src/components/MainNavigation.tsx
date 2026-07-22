import React from 'react';
import { Compass, PlusCircle, Grid, Store, User, MessageCircle } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { Bazar360Logo } from './Bazar360Logo';
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
      <nav className="hidden md:flex sticky top-0 z-50 bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-[var(--color-border-main)] py-4 px-6 items-center justify-between">
        <Bazar360Logo showTagline={false} />
        
        <div className="flex items-center gap-6">
          {navItems.map(item => (
            item.url ? (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold uppercase text-green-500 hover:text-green-600">
                <item.icon size={18} />
                {item.label}
              </a>
            ) : (
              <button key={item.id} onClick={() => setTab(item.id)} className={`text-sm font-bold uppercase ${currentTab === item.id ? 'text-[#FF6B00]' : 'text-[#161D6F] hover:text-[#FF6B00]'}`}>
                {item.label}
              </button>
            )
          ))}
          {currentUser ? (
            <button onClick={onLogout} className="text-sm font-bold uppercase text-red-600 hover:text-red-800">Logout</button>
          ) : (
            <button onClick={onLoginClick} className="text-sm font-bold uppercase text-[#FF6B00] hover:text-[#e05e00]">Login</button>
          )}
          <ThemeSwitcher />
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav currentTab={currentTab} setTab={setTab} lang={lang} />
    </>
  );
}
