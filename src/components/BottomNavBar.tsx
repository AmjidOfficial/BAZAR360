import React from 'react';
import { motion } from 'motion/react';
import { Home, Search, Sparkles, PlusCircle, Store, User } from 'lucide-react';
import { UserProfile } from '../lib/dbService';

interface BottomNavBarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  lang: 'en' | 'ur';
  currentUser?: UserProfile | null;
  favoritesCount?: number;
  cartCount?: number;
  onCategoryChange?: (category: any) => void;
  onLanguageToggle?: () => void;
  theme?: any;
  toggleTheme?: () => void;
}

export default function BottomNavBar({ 
  currentTab, 
  setTab,
  lang,
  currentUser,
  favoritesCount = 0,
  cartCount = 0
}: BottomNavBarProps) {

  const t = {
    en: {
      home: 'Home',
      search: 'Search',
      sellAndPost: 'Sell / Post',
      dealers: 'Showrooms',
      profile: 'Profile'
    },
    ur: {
      home: 'ہوم',
      search: 'تلاش',
      sellAndPost: 'اشتہار / Sell',
      dealers: 'شورومز',
      profile: 'پروفائل'
    }
  }[lang];

  interface TabItem {
    id: string;
    label: string;
    icon: any;
    isPrimary?: boolean;
    badge?: number;
  }

  const tabs: TabItem[] = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'inventory', label: t.search, icon: Search },
    { id: 'sell', label: t.sellAndPost, icon: Sparkles, isPrimary: true },
    { id: 'dealers', label: t.dealers, icon: Store },
    { id: 'profile', label: t.profile, icon: User }
  ];

  return (
    <nav className="md:hidden lg:hidden fixed bottom-0 left-0 right-0 w-full z-[99] bg-[var(--color-bg-secondary)]/95 backdrop-blur-2xl border-t border-[var(--color-border-main)] shadow-[0_-10px_30px_rgba(0,0,0,0.8)] px-1 py-1.5 transition-all">
      <div className="max-w-md mx-auto flex justify-between items-center h-[54px] relative px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id || 
            (tab.id === 'inventory' && currentTab === 'search') || 
            (tab.id === 'profile' && currentTab === 'portal') ||
            (tab.id === 'sell' && currentTab === 'post-upload');

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className="relative flex flex-col items-center justify-center -mt-6 cursor-pointer group shrink-0 px-1"
                title={tab.label}
              >
                {/* Outer pulsing halo */}
                <div className="absolute inset-0 bg-[var(--color-accent-main)]/30 rounded-full animate-ping pointer-events-none" />
                
                {/* Elevated Primary Action Container */}
                <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-[var(--color-accent-main)] via-amber-400 to-[var(--color-accent-hover)] rounded-2xl text-slate-950 shadow-lg shadow-[var(--color-accent-main)]/40 border-2 border-[#080C14] group-hover:scale-105 active:scale-95 transition-all duration-300">
                  <Icon size={20} className="stroke-[2.8]" />
                </div>

                <span className="text-[8.5px] sm:text-[9px] font-black tracking-tight text-[var(--color-accent-main)] mt-0.5 uppercase whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 min-w-0 h-11 cursor-pointer group px-0.5"
              title={tab.label}
            >
              <div className={`relative p-1 transition-all duration-300 rounded-xl ${isActive ? 'bg-[var(--color-accent-main)]/15' : ''}`}>
                <Icon
                  size={19}
                  className={`transition-colors duration-300 ${
                    isActive
                      ? 'text-[var(--color-accent-main)] stroke-[2.5]'
                      : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-header)] stroke-[1.8]'
                  }`}
                />
              </div>
              <span 
                className={`text-[8.5px] sm:text-[9px] font-bold tracking-tight transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis ${
                  isActive ? 'text-[var(--color-accent-main)] font-extrabold' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

