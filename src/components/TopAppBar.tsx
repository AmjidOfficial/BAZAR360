import React, { useState, useEffect, useRef } from 'react';
import { useRole } from '../contexts/RoleContext';
import { 
  Bell, 
  PlusCircle, 
  User, 
  Menu, 
  MessageSquare, 
  Sparkles,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ShoppingBag
} from 'lucide-react';

import { UserProfile } from '../lib/dbService';
import { DualSwipingBrandLogo } from './DualSwipingBrandLogo';
import { getOptimizedUrl } from '../lib/cloudinaryService';

interface TopAppBarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onPostAdClick: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onBackToGateway: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  isWithTicker?: boolean;
  currentCategory?: 'gateway' | 'auto' | 'footwear' | 'food';
  onCategoryChange?: (category: 'gateway' | 'auto' | 'footwear' | 'food') => void;
  lang: 'en' | 'ur';
  onLanguageToggle: () => void;
  onSelectDealer?: (id: string) => void;
  favoritesCount?: number;
  compareCount?: number;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (category: string) => void;
}

export default function TopAppBar({ 
  currentTab, 
  setTab, 
  currentUser,
  favoritesCount = 0
}: TopAppBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navTabs: Array<{ id: string; label: string; action?: () => void }> = [
    { id: 'home', label: 'Home' },
    { id: 'inventory', label: 'Buy Cars' },
    { id: 'sell', label: 'Sell Car' },
    { id: 'dealers', label: 'Showrooms' },
    { id: 'services', label: 'Services' },
    { id: 'compare', label: 'Compare' },
    { id: 'finance', label: 'Finance' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <header 
      id="bazar360-app-header"
      className="bg-white text-[#0F172A] border-b border-[#E2E8F0] py-2.5 px-3 md:px-6 sticky top-0 z-50 transition-all flex items-center justify-between shadow-xs select-none min-h-[64px]"
    >
      {/* LEFT: Navigation Hamburger Menu & Desktop Tabs */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            const drawerBtn = document.getElementById('bazar360-drawer-toggle-btn');
            if (drawerBtn) {
              drawerBtn.click();
            } else {
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }
          }}
          className="p-2 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#F97316] border border-orange-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer w-10 h-10 shadow-xs"
          title="Open Menu Drawer"
        >
          <Menu size={20} className="stroke-[2.5]" />
        </button>

        <div className="hidden lg:flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-2xl border border-[#E2E8F0]">
          {navTabs.map((tab) => {
            const isActive = currentTab === tab.id || (tab.id === 'inventory' && currentTab === 'explore');
            
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.action) {
                    tab.action();
                  } else {
                    setTab(tab.id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F97316] text-white font-bold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER: Swiping Dual Logo & Priority Sell For U / Post Adv Buttons */}
      <div className="flex items-center justify-center gap-3 mx-2">
        <DualSwipingBrandLogo className="scale-90 md:scale-100" />
        
        {/* Standalone Sell For U & Post Adv Buttons */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setTab('sell')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider shadow-2xs transition-all cursor-pointer border border-amber-200"
            title="Hand over your vehicle selling process to platform experts (Sell For U)"
          >
            <Sparkles size={14} className="text-[#F97316]" />
            <span>Sell For U</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('sell')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all cursor-pointer border border-[#F97316]"
            title="Create and publish a direct vehicle listing"
          >
            <PlusCircle size={14} className="stroke-[2.5]" />
            <span>Post Your Car</span>
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Phone Support & Social Links */}
      <div className="flex items-center justify-end gap-3 shrink-0">
        {/* Direct Phone Numbers */}
        <div className="hidden md:flex flex-col items-end text-right">
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#0F172A]">
            <Phone size={11} className="text-[#F97316] shrink-0" />
            <span className="text-[#64748B] text-[10px]">Mazhar:</span>
            <a href="tel:+923159085086" className="hover:text-[#F97316] transition-colors">+92 315 9085086</a>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#0F172A]">
            <Phone size={11} className="text-[#F97316] shrink-0" />
            <span className="text-[#64748B] text-[10px]">Amjid:</span>
            <a href="tel:+923149198403" className="hover:text-[#F97316] transition-colors">03149198403</a>
          </div>
        </div>

        {/* Social Icons */}
        <div className="hidden sm:flex items-center gap-1.5">
          <a href="https://facebook.com/bazar360.online" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-[#F8FAFC] hover:bg-[#F97316] text-[#64748B] hover:text-white transition-colors border border-[#E2E8F0]">
            <Facebook size={14} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-[#F8FAFC] hover:bg-[#F97316] text-[#64748B] hover:text-white transition-colors border border-[#E2E8F0]">
            <Twitter size={14} />
          </a>
          <a href="https://instagram.com/bazar360.online" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-[#F8FAFC] hover:bg-[#F97316] text-[#64748B] hover:text-white transition-colors border border-[#E2E8F0]">
            <Instagram size={14} />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-[#F8FAFC] hover:bg-[#F97316] text-[#64748B] hover:text-white transition-colors border border-[#E2E8F0]">
            <Youtube size={14} />
          </a>
        </div>

        {/* Live Messaging Quick Action Button */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-b360-messaging', {
              detail: {}
            }));
          }}
          className="relative p-2 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[#0F172A] transition-all cursor-pointer w-9 h-9 flex items-center justify-center shrink-0 shadow-2xs"
          title="Open Live Conversations & Messages"
        >
          <MessageSquare size={18} className="stroke-[2.2]" />
        </button>

        {/* Cart Icon with Live Counter Badge */}
        <button
          type="button"
          onClick={() => setTab('inventory')}
          className="relative p-2 rounded-full bg-orange-50 border border-orange-200 hover:bg-orange-100 text-[#F97316] transition-all cursor-pointer w-9 h-9 flex items-center justify-center shrink-0 shadow-2xs"
          title="View Shortlist & Favorites"
        >
          <ShoppingBag size={18} className="stroke-[2.2]" />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#F97316] text-white font-mono font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* User Profile / Login Avatar Button */}
        {currentUser ? (
          <button
            type="button"
            onClick={() => setTab('profile')}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] transition-all cursor-pointer border border-[#E2E8F0] hover:border-[#F97316]/40 shrink-0 group"
            title="Open User Profile & Dashboard"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-white border border-[#F97316]/30 shrink-0">
              {currentUser.photoURL || (currentUser as any).avatar ? (
                <img
                  src={getOptimizedUrl(currentUser.photoURL || (currentUser as any).avatar, { width: 100, height: 100, quality: 'auto:best' })}
                  alt={currentUser.displayName || 'Profile'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-[#F97316] flex items-center justify-center font-bold text-[10px] text-white">
                  {(currentUser.displayName || (currentUser as any).name || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[10px] font-bold text-[#0F172A] leading-none max-w-[80px] truncate group-hover:text-[#F97316] transition-colors">
                {currentUser.displayName || (currentUser as any).name || 'Profile'}
              </span>
              <span className="text-[7.5px] font-mono font-bold text-[#F97316] uppercase tracking-wider leading-none mt-0.5">
                {String(currentUser.role).toLowerCase().includes('admin') ? 'ADMIN' : String(currentUser.role).toLowerCase().includes('showroom') || String(currentUser.role).toLowerCase().includes('dealer') ? 'SHOWROOM' : 'USER'}
              </span>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setTab('profile')}
            className="p-1.5 rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] transition-all cursor-pointer w-8 h-8 flex items-center justify-center shrink-0 border border-[#E2E8F0]"
            title="User Profile & Login"
          >
            <User size={15} />
          </button>
        )}
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div ref={navContainerRef} className="absolute top-full left-0 right-0 bg-white border-b border-[#E2E8F0] p-4 shadow-xl flex flex-col gap-2 lg:hidden z-50">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.action) tab.action();
                else setTab(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase text-[#0F172A] hover:bg-[#F97316] hover:text-white transition-colors"
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
