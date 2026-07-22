import React from 'react';
import { motion } from 'motion/react';
import { Home, Search, PlusCircle, Bell, User, Store } from 'lucide-react';
import { UserProfile } from '../lib/dbService';

interface BottomNavBarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  lang: 'en' | 'ur';
  currentUser?: UserProfile | null;
  // Make these optional to avoid compilation errors from App.tsx
  onCategoryChange?: (category: any) => void;
  onLanguageToggle?: () => void;
  theme?: any;
  toggleTheme?: () => void;
}

export default function BottomNavBar({ 
  currentTab, 
  setTab,
  lang,
  currentUser
}: BottomNavBarProps) {

  // Translations dictionary for the 5-tab bar
  const t = {
    en: {
      home: 'Home',
      search: 'Search',
      sell: 'Sell',
      dealers: 'Showrooms',
      profile: 'Profile'
    },
    ur: {
      home: 'ہوم',
      search: 'تلاش',
      sell: 'اشتہار',
      dealers: 'شورومز',
      profile: 'پروفائل'
    }
  }[lang];

  const tabs = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'inventory', label: t.search, icon: Search },
    { id: 'sell', label: t.sell, icon: PlusCircle, isPrimary: true },
    { id: 'dealers', label: t.dealers, icon: Store },
    { id: 'profile', label: t.profile, icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0A0A0C]/90 backdrop-blur-lg border-t border-[var(--color-border-main)] shadow-[0_-8px_30px_rgba(0,0,0,0.4)] pb-safe">
      <div className="flex justify-around items-center h-[76px] px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          // Support 'inventory' or 'search' as synonymous for Search tab
          const isActive = tab.id === 'search' 
            ? (currentTab === 'search' || currentTab === 'inventory')
            : currentTab === tab.id || (tab.id === 'profile' && currentTab === 'portal');

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className="relative flex flex-col items-center justify-center -mt-8 cursor-pointer group"
              >
                {/* Outer pulsing ring in solid orange-500 */}
                <div className="absolute inset-0 bg-orange-500/40 rounded-full animate-ping opacity-75 blur-xs"></div>
                
                {/* Highly elevated orange-500 container */}
                <div className="relative flex items-center justify-center w-15 h-15 bg-gradient-to-tr from-orange-500 to-orange-600 rounded-full text-white shadow-[0_10px_25px_rgba(249,115,22,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-[#0A0A0C]">
                  <Icon size={28} className="stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-sans font-black tracking-wider mt-1.5 uppercase text-orange-500">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className="relative flex flex-col items-center justify-center w-16 transition-all duration-300 active:scale-90 cursor-pointer h-full pt-1"
            >
              {/* Icon Container with dynamic scaling and color */}
              <div className={`transition-all duration-200 ${isActive ? 'text-[var(--color-accent-main)] scale-110' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}>
                <Icon size={22} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
              </div>

              {/* Tab Label */}
              <span className={`text-[10.5px] font-sans tracking-wide mt-1 transition-all duration-200 ${
                isActive ? 'text-[var(--color-accent-main)] font-bold' : 'text-[var(--color-text-muted)]'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
