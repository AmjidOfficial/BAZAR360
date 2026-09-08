import React from 'react';
import { Home, PlusCircle, Grid, Store, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
  lang: 'en' | 'ur';
}

export default function MobileBottomNav({ currentTab, setTab, lang }: MobileBottomNavProps) {
  const isUrdu = lang === 'ur';

  const tabs = [
    { id: 'home', label: isUrdu ? 'ہوم' : 'Home', icon: Home },
    { id: 'inventory', label: isUrdu ? 'تلاش' : 'Cars', icon: Grid },
    { id: 'sell', label: isUrdu ? 'بیچیں' : 'Post Ad', icon: PlusCircle, isCentral: true },
    { id: 'dealers', label: isUrdu ? 'شورومز' : 'Showrooms', icon: Store },
    { id: 'profile', label: isUrdu ? 'پروفائل' : 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[var(--color-bg-secondary)]/95 border-t border-[var(--color-border-main)] shadow-2xl backdrop-blur-lg pb-safe">
      <div className="grid grid-cols-5 items-center h-[64px] px-2 max-w-md mx-auto relative w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id || (tab.id === 'inventory' && currentTab === 'search');

          if (tab.isCentral) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTab(tab.id)}
                className="relative flex flex-col items-center justify-center -mt-6 cursor-pointer select-none group justify-self-center"
              >
                <div className="flex items-center justify-center w-14 h-14 bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-hover)] rounded-full text-[#030712] shadow-lg border-4 border-[var(--color-bg-primary)] active:scale-95 transition-all">
                  <Icon size={24} className="stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold mt-0.5 text-[var(--color-accent-main)]">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className="flex flex-col items-center justify-center h-full pt-1 cursor-pointer select-none transition-all justify-self-center"
            >
              <div className={isActive ? 'text-[var(--color-accent-main)]' : 'text-[var(--color-text-muted)]'}>
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
              </div>
              <span className={`text-[10px] font-sans mt-0.5 ${
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
