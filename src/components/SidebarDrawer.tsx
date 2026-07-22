/**
 * SidebarDrawer.tsx
 * Professional sliding navigation drawer for mobile screens (Hamburger menu).
 * Implements smooth spring-based sliding animations and glassmorphic aesthetics.
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Home, 
  Car, 
  MapPin, 
  PlusCircle, 
  User, 
  Heart, 
  Info, 
  PhoneCall, 
  Settings, 
  LogOut, 
  HelpCircle, 
  FileText, 
  Globe,
  Star
} from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { useTheme } from './ThemeContext';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onLoginClick: () => void;
  lang: 'en' | 'ur';
  onLanguageToggle: () => void;
}

export default function SidebarDrawer({
  isOpen,
  onClose,
  currentTab,
  setTab,
  currentUser,
  onLogout,
  onLoginClick,
  lang,
  onLanguageToggle
}: SidebarDrawerProps) {
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const t = {
    en: {
      navigation: "Navigation",
      secondary: "Secondary",
      about: "About Us",
      contact: "Contact Support",
      terms: "Terms & Conditions",
      help: "Help Center",
      home: "Home",
      inventory: "Inventory",
      showrooms: "Showrooms",
      sell: "Sell Your Vehicle",
      profile: "User Profile",
      showroomHq: "Showroom HQ",
      logout: "Log Out",
      login: "Login / Register",
      theme: "Theme Mode",
      language: "Language",
      dark: "Dark Mode",
      light: "Light Mode",
      tagline: "Your Ultimate Auto Marketplace"
    },
    ur: {
      navigation: "نیویگیشن",
      secondary: "دیگر لنکس",
      about: "ہمارے بارے میں",
      contact: "رابطہ کریں",
      terms: "شرائط و ضوابط",
      help: "مدد مرکز",
      home: "ہوم",
      inventory: "گاڑیاں",
      showrooms: "شورومز",
      sell: "گاڑی فروخت کریں",
      profile: "پروفائل",
      showroomHq: "شوروم ہیڈ کوارٹر",
      logout: "لاگ آؤٹ",
      login: "لاگ ان / رجسٹر",
      theme: "تھیم تبدیل کریں",
      language: "زبان",
      dark: "ڈارک موڈ",
      light: "لائٹ موڈ",
      tagline: "آپ کی بہترین آٹو مارکیٹ پلیس"
    }
  }[lang];

  const handleLinkClick = (tabId: string) => {
    setTab(tabId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Drawer Panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="absolute top-0 bottom-0 left-0 w-[280px] sm:w-[320px] bg-[#0E0F12] border-r border-white/5 flex flex-col justify-between overflow-y-auto text-gray-200"
      >
        <div className="flex-1">
          {/* Header Banner */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-orange-600/10 to-[#0E0F12]">
            <div>
              <h2 className="text-sm font-black tracking-widest text-[#FFF] uppercase font-sans">
                BAZAR<span className="text-orange-500">360</span>
              </h2>
              <p className="text-[9px] font-mono font-black text-orange-400 uppercase tracking-widest mt-0.5">
                {t.tagline}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* User Profile Summary Segment */}
          <div className="p-5 border-b border-white/5 bg-[#121318]">
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center font-extrabold text-base uppercase font-sans shadow shadow-orange-500/20">
                    {(currentUser.displayName || currentUser.email?.split('@')[0] || 'U').substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-white truncate">{currentUser.displayName || 'Bazar360 Member'}</h3>
                    <p className="text-[10px] text-gray-400 font-mono truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[8px] font-mono font-black uppercase tracking-wider rounded">
                      {currentUser.role || 'Member'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleLinkClick('profile')}
                    className="py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-mono font-bold text-center text-[#38BDF8] uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    {t.profile}
                  </button>
                  {(currentUser.role === 'Showroom Owner' || currentUser.role === 'Dealer' || currentUser.role === 'Admin') && (
                    <button
                      onClick={() => handleLinkClick('showroom-hq')}
                      className="py-1.5 px-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg text-[9px] font-mono font-bold text-center text-orange-400 uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      {t.showroomHq}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-400 text-center uppercase tracking-widest font-mono">
                  Access Premium Auto Showrooms & Perks
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onLoginClick();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User size={13} strokeWidth={3} />
                  {t.login}
                </motion.button>
              </div>
            )}
          </div>

          {/* Primary Tabs List */}
          <div className="p-4 space-y-4">
            <div>
              <p className="px-3 text-[9px] font-mono font-black text-orange-500/60 uppercase tracking-widest mb-2">
                {t.navigation}
              </p>
              <div className="space-y-1">
                {[
                  { id: 'home', label: t.home, icon: <Home size={15} /> },
                  { id: 'inventory', label: t.inventory, icon: <Car size={15} /> },
                  { id: 'dealers', label: t.showrooms, icon: <MapPin size={15} /> },
                  { id: 'sell', label: t.sell, icon: <PlusCircle size={15} className="text-orange-500 animate-pulse" /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleLinkClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                      currentTab === item.id 
                        ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20 font-bold' 
                        : 'text-zinc-300 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary/Utility Links */}
            <div>
              <p className="px-3 text-[9px] font-mono font-black text-[#38BDF8]/60 uppercase tracking-widest mb-2">
                {t.secondary}
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => handleLinkClick('about')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/5 uppercase tracking-wider cursor-pointer"
                >
                  <Info size={15} className="text-zinc-400" />
                  <span>{t.about}</span>
                </button>
                <button
                  onClick={() => handleLinkClick('contact')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/5 uppercase tracking-wider cursor-pointer"
                >
                  <PhoneCall size={15} className="text-zinc-400" />
                  <span>{t.contact}</span>
                </button>
                <button
                  onClick={() => handleLinkClick('help')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/5 uppercase tracking-wider cursor-pointer"
                >
                  <HelpCircle size={15} className="text-zinc-400" />
                  <span>{t.help}</span>
                </button>
                <button
                  onClick={() => handleLinkClick('terms')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/5 uppercase tracking-wider cursor-pointer"
                >
                  <FileText size={15} className="text-zinc-400" />
                  <span>{t.terms}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions block */}
        <div className="p-4 border-t border-white/5 bg-[#090A0D] space-y-3">
          {/* Controls bar (Language Toggle) */}
          <div className="w-full">
            {/* Lang Toggle */}
            <button
              onClick={onLanguageToggle}
              className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider text-center text-orange-400 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Globe size={11} />
              <span>{lang === 'en' ? 'اردو' : 'English'}</span>
            </button>
          </div>

          {/* Quick Exit trigger */}
          {currentUser && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <LogOut size={13} />
              <span>{t.logout}</span>
            </button>
          )}

          <div className="text-center">
            <span className="text-[7.5px] font-mono text-zinc-600 uppercase tracking-widest">
              Bazar360 &copy; 2026.online | Peshawar
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
