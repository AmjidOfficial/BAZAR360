import { Bell, PlusCircle, User, ShieldAlert, LogOut, DollarSign, Wallet, Menu, Sun, Moon, Monitor } from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { useCurrencyMode } from '../lib/currency';

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
  onMobileMenuToggle: () => void;
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
  onMobileMenuToggle,
  lang,
  onLanguageToggle
}: TopAppBarProps) {
  const { currencyMode, changeCurrencyMode } = useCurrencyMode();

  return (
    <header className={`flex justify-between items-center w-full px-4 md:px-12 h-16 fixed top-0 z-50 bg-[#0F172A]/95 backdrop-blur-md border-b border-b-white/5 shadow-sm transition-all text-white`}>
      <div className="flex items-center gap-4">

        <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => setTab('home')}>
          {/* BAZAR360 Premium Responsive Logo Component */}
          <div className="flex items-center space-x-2 select-none">
            {/* Interactive 360-Degree Orbital Icon */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#1E293B] border border-white/10 shadow-sm transition-transform">
              <svg className="w-5 h-5 text-orange-500 animate-[spin_20s_linear_infinite]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
              </svg>
              <span className="absolute text-[9px] font-black text-[#38BDF8] tracking-tighter">360</span>
            </div>
            {/* Typography Wrapper */}
            <div className="flex items-center">
              <div className="flex flex-col text-left">
                <span className="text-[17px] font-black text-white tracking-widest leading-none font-sans">BAZAR<span className="text-orange-500">360</span></span>
                <span className="text-[8px] font-bold text-sky-400 tracking-[0.22em] uppercase pl-0.5 font-mono">Ecosystem</span>
              </div>
              {currentCategory === 'auto' && (
                <>
                  <div className="h-6 w-px bg-white/10 mx-3 hidden sm:block" id="brand-vertical-divider"></div>
                  <div className="flex flex-col text-left hidden sm:flex" id="brand-premium-tag">
                    <span className="text-xs font-black text-white uppercase tracking-wider leading-none font-sans">AUTO CHOICE</span>
                    <span className="text-[7.5px] font-black text-orange-500 tracking-widest uppercase mt-0.5 leading-none">PREMIUM PARTNER</span>
                  </div>
                </>
              )}
            </div>
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
                {(currentUser.displayName || currentUser.email || 'User').substring(0, 1).toUpperCase()}
              </div>
              <span className="text-white font-bold max-w-[90px] truncate">
                {(currentUser.displayName || currentUser.email || 'User').split(' ')[0]}
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

        <button
          onClick={onPostAdClick}
          className="flex bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-md shadow-rose-500/15 items-center gap-2 border border-rose-500/10 duration-150 tracking-wider uppercase cursor-pointer"
        >
          <PlusCircle size={15} />
          {lang === 'en' ? 'Post Your Ad' : 'اشتہار لگائیں'}
        </button>
      </div>

      {/* Mobile-Only Language & Menu Container */}
      <div className="flex md:hidden items-center gap-2">
        {/* Mobile-Only Language Switcher */}
        <button
          onClick={onLanguageToggle}
          className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono font-black text-[10px] rounded-xl border border-orange-400/20 cursor-pointer active:scale-95 select-none uppercase tracking-wider"
          style={{ minHeight: '36px' }}
        >
          {lang === 'en' ? 'اردو' : 'EN'}
        </button>

        {/* Mobile-Only Burger Menu Trigger Button */}
        <button
          onClick={onMobileMenuToggle}
          className="flex text-slate-300 hover:text-orange-500 transition-all p-2 bg-[#1E293B] rounded-xl border border-white/5 cursor-pointer active:scale-95"
          style={{ minHeight: '36px' }}
          id="mobile-drawer-toggle-btn"
          title="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
