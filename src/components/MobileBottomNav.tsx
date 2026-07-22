import React from 'react';
import { Home, PlusCircle, Grid, Store, User, MessageCircle } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface MobileBottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
  lang: 'en' | 'ur';
}

export default function MobileBottomNav({ currentTab, setTab, lang }: MobileBottomNavProps) {
  const { theme } = useTheme();
  
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'sell', label: 'Post Ad', icon: PlusCircle, isCentral: true },
    { id: 'dealers', label: 'Showrooms', icon: Store },
  ];

  return (
    <div className={`md:hidden fixed bottom-0 left-0 w-full z-50 transition-colors duration-300 pb-safe ${
      theme === 'dark'
        ? 'bg-[#0A0B10]/95 border-t border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]'
        : 'bg-white/95 border-t border-slate-100 shadow-[0_-8px_30px_rgba(15,23,42,0.06)]'
    } backdrop-blur-lg`}>
      <div className="flex justify-around items-center h-[72px] px-1 max-w-md mx-auto relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isCentral) {
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className="relative flex flex-col items-center justify-center -mt-8 cursor-pointer select-none group"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full text-white shadow-lg group-hover:scale-105 active:scale-95 transition-all duration-200 border-4 border-[var(--color-bg-primary)]">
                  <Icon size={28} className="stroke-[2]" />
                </div>
                <span className="text-[10px] font-bold mt-1 text-orange-500">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className="flex flex-col items-center justify-center w-14 h-full pt-1 cursor-pointer select-none transition-all duration-200"
            >
              <div className={`transition-all duration-200 ${
                isActive
                  ? 'text-orange-500'
                  : theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-slate-500'
              }`}>
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
              </div>
              <span className={`text-[10px] font-sans tracking-wide mt-1 ${
                isActive
                  ? 'text-orange-500 font-bold'
                  : theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-slate-500'
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
