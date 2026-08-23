import React from 'react';
import { 
  User, Car, Heart, Search, Eye, MessageSquare, Bell, 
  History, ShieldCheck, Settings, Sliders
} from 'lucide-react';

export type ProfileTab = 
  | 'overview' 
  | 'my_vehicles' 
  | 'favorites' 
  | 'saved_searches' 
  | 'recently_viewed' 
  | 'messages' 
  | 'notifications' 
  | 'activity' 
  | 'security' 
  | 'privacy';

interface AccountNavigationProps {
  activeTab: ProfileTab;
  onSelectTab: (tab: ProfileTab) => void;
  counts?: {
    vehicles?: number;
    favorites?: number;
    savedSearches?: number;
    recentViews?: number;
    unreadMessages?: number;
    unreadNotifications?: number;
  };
}

export const AccountNavigation: React.FC<AccountNavigationProps> = ({
  activeTab,
  onSelectTab,
  counts = {}
}) => {
  const navItems: { id: ProfileTab; label: string; icon: any; count?: number; highlightBadge?: boolean }[] = [
    { id: 'overview', label: 'My Profile', icon: User },
    { id: 'my_vehicles', label: 'My Vehicles', icon: Car, count: counts.vehicles },
    { id: 'favorites', label: 'Saved Vehicles', icon: Heart, count: counts.favorites },
    { id: 'saved_searches', label: 'Saved Searches', icon: Search, count: counts.savedSearches },
    { id: 'recently_viewed', label: 'Recently Viewed', icon: Eye, count: counts.recentViews },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: counts.unreadMessages, highlightBadge: (counts.unreadMessages || 0) > 0 },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: counts.unreadNotifications, highlightBadge: (counts.unreadNotifications || 0) > 0 },
    { id: 'activity', label: 'Activity Log', icon: History },
    { id: 'security', label: 'Security Center', icon: ShieldCheck },
    { id: 'privacy', label: 'Settings & Privacy', icon: Settings },
  ];

  return (
    <nav className="w-full">
      {/* Mobile Horizontal Scrollable Tab Pill Bar */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--color-border)] mb-4 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-sans shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-[var(--color-text-header)] shadow-md'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive 
                    ? 'bg-white/20 text-[var(--color-text-header)]' 
                    : item.highlightBadge 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-slate-700 text-zinc-300'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop Vertical Sidebar Menu */}
      <div className="hidden lg:flex flex-col gap-1 w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-2.5 shadow-sm">
        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono border-b border-[var(--color-border)] mb-1">
          Account Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-[var(--color-text-header)] shadow-md'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--color-text-header)]' : 'text-sky-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive 
                    ? 'bg-white/20 text-[var(--color-text-header)]' 
                    : item.highlightBadge 
                      ? 'bg-amber-500 text-slate-950 font-black' 
                      : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
