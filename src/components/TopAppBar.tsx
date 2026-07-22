import React, { useState } from 'react';
import { useRole } from '../contexts/RoleContext';
import { 
  Bell, 
  PlusCircle, 
  User, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  Sun, 
  Moon, 
  ChevronDown, 
  Heart, 
  MessageSquare, 
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
  BookOpen,
  DollarSign,
  Search,
  ArrowRightLeft
} from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { useTheme } from './ThemeContext';
import { Bazar360Logo } from './Bazar360Logo';

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
  onPostAdClick, 
  currentUser,
  onLogout,
  onBackToGateway,
  currentTheme,
  onThemeChange,
  isWithTicker,
  currentCategory = 'gateway',
  onCategoryChange,
  lang,
  onLanguageToggle,
  onSelectDealer,
  favoritesCount = 0,
  compareCount = 0,
  searchQuery = '',
  setSearchQuery,
  selectedCategory = 'All',
  setSelectedCategory
}: TopAppBarProps) {
  const { isAdmin } = useRole();
  const { theme, setTheme } = useTheme();
  const [isAutoChoiceOpen, setIsAutoChoiceOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNotificationCount, setActiveNotificationCount] = useState(3);
  const [activeMessageCount, setActiveMessageCount] = useState(2);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);

  const isRtl = lang === 'ur';

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery?.(localSearchQuery);
    setTab('inventory');
    setIsMobileSearchVisible(false);
  };

  const handleAutoChoiceItemClick = (itemAction: string) => {
    setIsAutoChoiceOpen(false);
    setIsMobileMenuOpen(false);
    
    switch (itemAction) {
      case 'about':
        setTab('contact');
        break;
      case 'inventory':
        setTab('inventory');
        break;
      case 'finance':
        setTab('services');
        break;
      case 'reviews':
        if (onSelectDealer) {
          onSelectDealer('auto-choice-peshawar');
        } else {
          setTab('dealers');
        }
        break;
      case 'location':
        setTab('contact');
        break;
      case 'contact':
        setTab('contact');
        break;
      case 'inspection':
        setTab('services');
        break;
      default:
        break;
    }
  };

  return (
    <header 
      id="bazar360-app-header"
      className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-main)] py-2.5 px-4 md:px-8 sticky top-0 z-50 transition-all flex items-center justify-between shadow-sm select-none h-[64px]"
    >
      {/* LEFT: Parent Platform: BAZAR360.online */}
      <div className="flex items-center justify-start shrink-0">
        <div className="cursor-pointer hover:opacity-95 transition-all active:scale-[0.98]" onClick={() => setTab('home')}>
          <Bazar360Logo showTagline={false} className="scale-[0.88] sm:scale-95 origin-left" />
        </div>
      </div>

      {/* CENTER: Desktop Search */}
      <div className="hidden md:flex flex-1 max-w-xl mx-6">
        <form 
          onSubmit={handleSearchSubmit} 
          className="relative w-full flex items-center bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-full focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 overflow-hidden"
        >
          <Search size={16} className="text-[var(--color-text-muted)] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            placeholder="Search make, model, or city..."
            className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-[var(--color-text-main)] focus:outline-none"
          />
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-slate-950 px-4 py-2 text-sm font-bold uppercase transition-colors shrink-0">
            Search
          </button>
        </form>
      </div>

      {/* RIGHT SIDE: Interactive Utilities */}
      <div className="flex items-center justify-end gap-2 md:gap-3" id="header-right-utilities">
        
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setIsMobileSearchVisible(!isMobileSearchVisible)}
          className="md:hidden p-1.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all active:scale-95 shrink-0"
          title="Toggle Search"
        >
          <Search size={18} />
        </button>



        {/* Dedicated Theme Toggle Buttons (Sun / Moon) */}
        <div className="flex items-center p-0.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl gap-1 shrink-0" id="header-theme-toggle-group">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-transparent'
            }`}
            title="Switch to Light Theme"
            aria-label="Light Theme"
          >
            <Sun size={17} />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-transparent'
            }`}
            title="Switch to Dark Theme"
            aria-label="Dark Theme"
          >
            <Moon size={17} />
          </button>
        </div>

        {/* Favorites button */}
        <button 
          onClick={() => setTab('inventory')}
          className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer relative"
          title="Saved Favorites"
        >
          <Heart size={18} className={favoritesCount > 0 ? "fill-rose-500 text-rose-500" : "text-[var(--color-text-muted)]"} />
          {favoritesCount > 0 && (
            <span className="absolute top-0 right-0 bg-rose-500 text-white font-mono font-black text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full leading-none">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* USER PROFILE */}
        {currentUser ? (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div 
              onClick={() => setTab('profile')}
              className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-[var(--color-border-main)] rounded-full py-1 pl-1 pr-3 cursor-pointer text-xs select-none hover:border-orange-500 hover:bg-orange-500/5 transition-all"
              title="Go to Your Profile"
            >
              <div className="w-5.5 h-5.5 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center font-extrabold text-[10px] uppercase font-mono shadow-inner shrink-0">
                {(currentUser.displayName || currentUser.email?.split('@')[0] || 'U').substring(0, 1).toUpperCase()}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setTab('portal')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-orange-500/10 border border-[var(--color-border-main)] rounded-xl text-xs font-bold text-[var(--color-text-main)] transition-all cursor-pointer shrink-0"
          >
            <User size={13} className="text-[var(--color-text-muted)]" />
            <span>Log In</span>
          </button>
        )}

        {/* Mobile Hamburger Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl text-[var(--color-text-main)] bg-black/5 dark:bg-white/5 border border-[var(--color-border-main)] ml-1 cursor-pointer"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* MOBILE POPUP SEARCH CONTAINER */}
      {isMobileSearchVisible && (
        <div className="absolute top-full left-0 w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-main)] p-3 shadow-lg z-50 flex gap-2 animate-fade-in lg:hidden">
          <input
            type="text"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
            placeholder="Search Make, Model, City..."
            className="flex-grow bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={() => handleSearchSubmit()}
            className="bg-orange-500 hover:bg-orange-600 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase cursor-pointer"
          >
            Search
          </button>
        </div>
      )}

      {/* MOBILE DRAWER COLLAPSIBLE MENU PANEL */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 top-[56px] bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-[56px] left-0 w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-main)] p-5 shadow-2xl z-50 flex flex-col gap-4 text-left animate-fade-in lg:hidden">
            
            <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-2">
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest font-black">BAZAR360.online Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-orange-500 font-bold uppercase">Close</button>
            </div>

            {/* User Account / Profile Section for Mobile Users */}
            <div className="bg-[var(--color-bg-primary)] p-3.5 rounded-2xl border border-[var(--color-border-main)]">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center font-extrabold text-sm uppercase font-mono shadow-md">
                      {(currentUser.displayName || currentUser.email?.split('@')[0] || 'U').substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-black text-[var(--color-text-main)] uppercase tracking-wider block">
                        {currentUser.displayName || currentUser.email?.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest block">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                  
                  {/* High-visibility full-width LOGOUT button for mobile */}
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <LogOut size={13} className="stroke-[3]" />
                    <span>Log Out of Account</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                    Log in to message dealers, save favorites, compare specs, and post ads!
                  </p>
                  <button
                    onClick={() => {
                      setTab('portal');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <User size={13} />
                    <span>Sign In / Register</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => { setTab('home'); setIsMobileMenuOpen(false); }}
                className={`py-2.5 px-4 text-xs font-black rounded-xl border text-center transition-all uppercase tracking-wider cursor-pointer ${
                  currentTab === 'home' 
                    ? 'bg-orange-500 text-slate-950 border-orange-500' 
                    : 'bg-[var(--color-bg-primary)] text-[var(--color-text-main)] border-[var(--color-border-main)]'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => { setTab('inventory'); setIsMobileMenuOpen(false); }}
                className={`py-2.5 px-4 text-xs font-black rounded-xl border text-center transition-all uppercase tracking-wider cursor-pointer ${
                  currentTab === 'inventory' || currentTab === 'search' 
                    ? 'bg-orange-500 text-slate-950 border-orange-500' 
                    : 'bg-[var(--color-bg-primary)] text-[var(--color-text-main)] border-[var(--color-border-main)]'
                }`}
              >
                Buy (Cars)
              </button>
              <button 
                onClick={() => { setTab('sell'); setIsMobileMenuOpen(false); }}
                className={`py-2.5 px-4 text-xs font-black rounded-xl border text-center transition-all uppercase tracking-wider cursor-pointer ${
                  currentTab === 'sell' 
                    ? 'bg-orange-500 text-slate-950 border-orange-500' 
                    : 'bg-[var(--color-bg-primary)] text-[var(--color-text-main)] border-[var(--color-border-main)]'
                }`}
              >
                Sell Car
              </button>
              <button 
                onClick={() => { setTab('dealers'); setIsMobileMenuOpen(false); }}
                className={`py-2.5 px-4 text-xs font-black rounded-xl border text-center transition-all uppercase tracking-wider cursor-pointer ${
                  currentTab === 'dealers' 
                    ? 'bg-orange-500 text-slate-950 border-orange-500' 
                    : 'bg-[var(--color-bg-primary)] text-[var(--color-text-main)] border-[var(--color-border-main)]'
                }`}
              >
                Showrooms
              </button>
            </div>

            <div className="border-t border-[var(--color-border-main)] pt-3">
              <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-black block mb-2">⭐ Flagship Showroom</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleAutoChoiceItemClick('about')}
                  className="py-2 px-3 text-[10.5px] font-bold rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/15 text-left cursor-pointer"
                >
                  About Showroom
                </button>
                <button 
                  onClick={() => handleAutoChoiceItemClick('inventory')}
                  className="py-2 px-3 text-[10.5px] font-bold rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/15 text-left cursor-pointer"
                >
                  Our Car Stock
                </button>
                <button 
                  onClick={() => handleAutoChoiceItemClick('finance')}
                  className="py-2 px-3 text-[10.5px] font-bold rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/15 text-left cursor-pointer"
                >
                  Auto Finance
                </button>
                <button 
                  onClick={() => handleAutoChoiceItemClick('inspection')}
                  className="py-2 px-3 text-[10.5px] font-bold rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/15 text-left cursor-pointer"
                >
                  Book Inspection
                </button>
              </div>
            </div>

            <div className="border-t border-[var(--color-border-main)] pt-3 flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest font-black">App Appearance Theme</span>
              <div className="flex items-center gap-1 p-1 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 font-black'
                      : 'text-[var(--color-text-muted)] border border-transparent'
                  }`}
                >
                  <Sun size={14} className="text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-black'
                      : 'text-[var(--color-text-muted)] border border-transparent'
                  }`}
                >
                  <Moon size={14} className="text-sky-400" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            <div className="border-t border-[var(--color-border-main)] pt-3 flex flex-col gap-2">
              <button 
                onClick={() => { setTab('services'); setIsMobileMenuOpen(false); }}
                className="text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] py-1.5 uppercase text-left cursor-pointer"
              >
                News & Services Updates
              </button>
              <button 
                onClick={() => { setTab('contact'); setIsMobileMenuOpen(false); }}
                className="text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] py-1.5 uppercase text-left cursor-pointer"
              >
                About Our Platform
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
