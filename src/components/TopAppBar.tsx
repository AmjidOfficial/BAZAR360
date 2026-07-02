import { Bell, PlusCircle, User, ShieldAlert, LogOut, DollarSign, Wallet, Menu, Sun, Moon, Monitor, LogOut as LogOutIcon } from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { useCurrencyMode } from '../lib/currency';
import { useTheme } from './ThemeContext';
import { Bazar360Logo } from './Bazar360Logo';
import { AutoChoiceLogo } from './AutoChoiceLogo';

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
  onLanguageToggle
}: TopAppBarProps) {
  const { currencyMode, changeCurrencyMode } = useCurrencyMode();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-12 h-16 fixed top-0 z-50 bg-[var(--color-bg-secondary)]/95 backdrop-blur-md border-b border-[var(--color-border-main)] shadow-sm transition-all text-[var(--color-text-main)]">
      <div className="flex items-center gap-4">

        <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => setTab('home')}>
          {/* BAZAR360 Premium Responsive Logo Component */}
          <div className="flex items-center space-x-2 select-none">
            <Bazar360Logo showTagline={true} />
            {currentCategory === 'auto' && (
              <>
                <div className="h-6 w-px bg-[var(--color-border-main)] mx-3 hidden sm:block" id="brand-vertical-divider"></div>
                <div className="hidden sm:block">
                  <AutoChoiceLogo showText={true} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Web Navigation (Hidden on Mobile) */}
      <nav className="hidden md:flex items-center gap-6 font-sans text-xs tracking-wider">
        {(() => {
          const navItems = {
            en: [
              { id: 'home', label: 'Home' },
              { id: 'inventory', label: 'Inventory' },
              { id: 'dealers', label: 'Showrooms' },
              { id: 'services', label: 'Services' },
              { id: 'contact', label: 'Contact' }
            ],
            ur: [
              { id: 'home', label: 'ہوم' },
              { id: 'inventory', label: 'انوینٹری' },
              { id: 'dealers', label: 'شورومز' },
              { id: 'services', label: 'سروسز' },
              { id: 'contact', label: 'رابطہ' }
            ]
          }[lang || 'en'];

          return navItems.map((item) => {
            const isActive = currentTab === item.id || (item.id === 'inventory' && currentTab === 'search');
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`font-extrabold transition-all duration-150 cursor-pointer uppercase ${
                  isActive
                    ? 'text-[#38BDF8] border-b-2 border-[#38BDF8] pb-1'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          });
        })()}
      </nav>

      {/* Desktop Navigation & Utilities (hidden on mobile < 768px) */}
      <div className="hidden md:flex items-center gap-4" id="desktop-right-utilities">

        {/* Sign In / Register Button for Guest Customers */}
        {!currentUser ? (
          <button
            onClick={() => setTab('portal')}
            className="text-xs font-sans font-extrabold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl cursor-pointer duration-100 uppercase tracking-wider"
          >
            Sign In / Register
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div 
              onClick={() => setTab('portal')}
              className="flex items-center gap-2 bg-[#1E293B] border border-white/5 rounded-full py-1.5 pl-2 pr-3.5 cursor-pointer text-xs select-none hover:border-[#38BDF8] transition-colors animate-fade-in"
              title="Manage profile & showroom roles"
            >
              <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold text-[9px] uppercase font-mono">
                {(currentUser.displayName || currentUser.email?.split('@')[0]?.split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'User').substring(0, 1).toUpperCase()}
              </div>
              <span className="text-white font-bold max-w-[90px] truncate">
                {(currentUser.displayName || currentUser.email?.split('@')[0]?.split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'User').split(' ')[0]}
              </span>
              <span className="bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded text-[8px] border border-amber-500/20 uppercase tracking-wider scale-90">
                {currentUser.role}
              </span>
            </div>
            
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
              title="Sign Out of session"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        {/* Desktop Language Switcher */}
        <button
          onClick={onLanguageToggle}
          className="px-3 py-1.5 bg-[#1E293B] hover:bg-slate-800 text-[#38BDF8] font-mono font-black text-[10px] rounded-xl border border-white/10 cursor-pointer transition-all active:scale-95 select-none uppercase tracking-wider"
          title={lang === 'en' ? "اردو میں تبدیل کریں" : "Switch to English"}
        >
          {lang === 'en' ? 'اردو' : 'English'}
        </button>

        {/* Desktop Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 bg-[#1E293B]/80 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#38BDF8] rounded-xl border border-white/10 cursor-pointer transition-all active:scale-95 select-none"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {currentUser ? (
          <button
            onClick={onPostAdClick}
            className="flex bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-md shadow-rose-500/15 items-center gap-2 border border-rose-500/10 duration-150 tracking-wider uppercase cursor-pointer"
          >
            <PlusCircle size={15} />
            {lang === 'en' ? 'Post Your Ad' : 'اشتہار لگائیں'}
          </button>
        ) : (
          <button
            onClick={() => setTab('portal')}
            className="flex bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-md shadow-sky-500/15 items-center gap-2 border border-sky-500/10 duration-150 tracking-wider uppercase cursor-pointer animate-pulse"
          >
            <User size={15} />
            {lang === 'en' ? 'Sign In / Sign Up' : 'لاگ ان / سائن اپ'}
          </button>
        )}
      </div>
    </header>
  );
}
