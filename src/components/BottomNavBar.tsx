import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Clean import to ensure runtime stability
import { Home, Plus, Menu, X, ClipboardList, TrendingUp, User, Store, PhoneCall, Sun, Moon, Sparkles } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  currentCategory?: 'gateway' | 'auto' | 'footwear' | 'food';
  onCategoryChange?: (category: 'gateway' | 'auto' | 'footwear' | 'food') => void;
  lang: 'en' | 'ur';
  onLanguageToggle: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export default function BottomNavBar({ 
  currentTab, 
  setTab,
  currentCategory = 'gateway',
  onCategoryChange,
  lang,
  onLanguageToggle,
  theme,
  toggleTheme
}: BottomNavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuItemClick = (tabId: string) => {
    setTab(tabId);
    setIsMenuOpen(false);
  };

  // Translations dictionary for the bottom nav bar
  const t = {
    en: {
      home: 'Home',
      post: 'Post',
      menu: 'Menu',
      title: 'Bazar360 Navigator',
      subtitle: 'Quick access platform hubs',
      founder: 'Founder Active',
      helpline: 'Helpline Connect',
      items: {
        home: { label: 'Home Dashboard', desc: 'Main hub & spotlight features' },
        inventory: { label: 'Vehicle Inventory', desc: 'Faceted search & filters' },
        insights: { label: 'Market Insights', desc: 'Pricing indexes & analytics' },
        portal: { label: 'Profile & Auth', desc: 'Sign In / Sign Up suite' },
        dealers: { label: 'Showrooms', desc: 'Verified dealer storefronts' },
        services: { label: 'Auto Services', desc: 'Inspections & financing' },
        contact: { label: 'Contact Help', desc: '24/7 customer assistance' }
      }
    },
    ur: {
      home: 'ہوم',
      post: 'پوسٹ',
      menu: 'مینو',
      title: 'بازار 360 نیویگیٹر',
      subtitle: 'پلیٹ فارم کے مختلف حصوں تک فوری رسائی',
      founder: 'بانی ایکٹو',
      helpline: 'ہیلپ لائن رابطہ',
      items: {
        home: { label: 'ہوم ڈیش بورڈ', desc: 'مرکزی ہب اور اہم خصوصیات' },
        inventory: { label: 'گاڑیوں کی انوینٹری', desc: 'سرچ اور فلٹرز کے ساتھ گاڑیوں کی تلاش' },
        insights: { label: 'مارکیٹ کے تجزیات', desc: 'گاڑیوں کی قیمتوں کا موازنہ' },
        portal: { label: 'پروفائل اور لاگ ان', desc: 'سائن ان اور اکاؤنٹ بنائیں' },
        dealers: { label: 'شورومز', desc: 'تصدیق شدہ برانڈ شورومز' },
        services: { label: 'آٹو سروسز', desc: 'گاڑیوں کی انسپکشن اور فنانسنگ' },
        contact: { label: 'رابطہ کریں', desc: '24/7 کسٹمر سپورٹ رابطہ' }
      }
    }
  }[lang];

  const menuItems = [
    { id: 'home', label: t.items.home.label, icon: Home, desc: t.items.home.desc },
    { id: 'inventory', label: t.items.inventory.label, icon: ClipboardList, desc: t.items.inventory.desc },
    { id: 'dealers', label: t.items.dealers.label, icon: Store, desc: t.items.dealers.desc },
    { id: 'insights', label: t.items.insights.label, icon: TrendingUp, desc: t.items.insights.desc },
    { id: 'services', label: t.items.services.label, icon: PhoneCall, desc: t.items.services.desc },
    { id: 'portal', label: t.items.portal.label, icon: User, desc: t.items.portal.desc },
    { id: 'contact', label: t.items.contact.label, icon: PhoneCall, desc: t.items.contact.desc },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className={`md:hidden fixed bottom-0 left-0 w-full z-50 flex flex-col backdrop-blur-md border-t shadow-[0_-8px_30px_rgba(0,0,0,0.5)] pb-safe ${
        theme === 'light' ? 'bg-white/95 border-slate-200' : 'bg-[#030712]/95 border-white/5'
      }`}>
        <div className="relative flex justify-between items-center h-16 px-8">
          
          {/* 1. Home Button */}
          <button
            id="mobile-nav-home"
            onClick={() => setTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              currentTab === 'home' ? 'text-[#38BDF8]' : theme === 'light' ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white'
            }`}
            style={{ minHeight: '48px', minWidth: '48px' }}
          >
            <Home size={20} className={currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-[2]'} />
            <span className="text-[10px] font-sans font-bold tracking-wide mt-1 uppercase">{t.home}</span>
          </button>

          {/* 2. Elevated Post (+) Button */}
          <div className="relative -mt-6 flex flex-col items-center justify-center shrink-0">
            <button
              id="mobile-nav-post"
              onClick={() => setTab('sell')}
              className={`w-14 h-14 rounded-full flex items-center justify-center bg-[#0ea5e9] text-white font-black shadow-[0_4px_20px_rgba(14,165,233,0.4)] border-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                theme === 'light' ? 'border-white' : 'border-[#030712]'
              } ${currentTab === 'sell' ? 'bg-[#38BDF8] scale-105' : ''}`}
              title="Post an Ad"
              style={{ minHeight: '56px', minWidth: '56px' }}
            >
              <Plus size={26} strokeWidth={3} className="text-white" />
            </button>
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#38BDF8] mt-1 block">{t.post}</span>
          </div>

          {/* 3. Hamburger Menu Button */}
          <button
            id="mobile-nav-menu"
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              isMenuOpen ? 'text-[#38BDF8]' : theme === 'light' ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white'
            }`}
            style={{ minHeight: '48px', minWidth: '48px' }}
          >
            <Menu size={20} className={isMenuOpen ? 'stroke-[2.5]' : 'stroke-[2]'} />
            <span className="text-[10px] font-sans font-bold tracking-wide mt-1 uppercase">{t.menu}</span>
          </button>

        </div>
      </div>

      {/* Slide-Up Navigation Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/70 z-[110] backdrop-blur-sm md:hidden"
            />

            {/* Bottom Drawer Element */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto border-t rounded-t-[32px] p-6 pb-8 z-[111] shadow-[0_-12px_40px_rgba(0,0,0,0.3)] flex flex-col overflow-y-auto max-h-[85vh] md:hidden ${
                theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0f19] border-white/5 text-white'
              }`}
            >
              {/* Grab Notch UI */}
              <div className={`w-12 h-1.5 rounded-full mx-auto mb-4 shrink-0 ${theme === 'light' ? 'bg-slate-300' : 'bg-white/10'}`} />

              {/* Core Header Header Grid */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">{t.title}</h3>
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t.subtitle}</p>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className={`p-2 rounded-full cursor-pointer ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Unified Branding Header Block */}
              <div className={`flex items-center gap-4 p-4 rounded-2xl mb-5 border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#121826] border-white/5'
              }`}>
                <img 
                  src={theme === 'light' ? '/logo-light.jpg' : '/logo-dark.jpg'} 
                  alt="Bazar360 Logo" 
                  className="h-12 w-12 object-cover rounded-xl shadow-md shrink-0"
                  onError={(e) => {
                    // Fallback configuration if specific layout images are missing
                    e.currentTarget.src = theme === 'light' ? '/logo-dark.jpg' : '/logo-light.jpg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-wide uppercase">Bazar360</span>
                    <span className="bg-[#0ea5e9] text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-wider uppercase flex items-center gap-0.5">
                      <Sparkles size={8} className="fill-white" /> {t.founder}
                    </span>
                  </div>
                  <p className={`text-[11px] font-medium truncate ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t.helpline}: 0360-ONLINE
                  </p>
                </div>
              </div>

              {/* Scrollable Core Navigation Links Grid */}
              <div className="space-y-2 mb-6">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-150 text-left cursor-pointer group ${
                        isActive 
                          ? 'bg-[#0ea5e9]/10 text-[#38BDF8] border border-[#0ea5e9]/20' 
                          : theme === 'light' 
                            ? 'hover:bg-slate-50 border border-transparent text-slate-800' 
                            : 'hover:bg-white/5 border border-transparent text-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-[#0ea5e9] text-white' : theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-gray-400'}`}>
                        <IconComponent size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold tracking-tight">{item.label}</p>
                        <p className={`text-xs truncate ${isActive ? 'text-[#38BDF8]/80' : theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`}>{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Platform Settings Layer (System Controls Panel) */}
              <div className={`grid grid-cols-2 gap-3 pt-4 border-t ${theme === 'light' ? 'border-slate-100' : 'border-white/5'}`}>
                {/* Language Switch */}
                <button
                  onClick={onLanguageToggle}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  <span className="text-sm">🌐</span>
                  {lang === 'en' ? 'اردو (Urdu)' : 'English'}
                </button>

                {/* Theme Toggle Switch */}
                <button
                  onClick={toggleTheme}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  {theme === 'light' ? (
                    <>
                      <Moon size={14} className="text-slate-700" />
                      <span>Dark UI</span>
                    </>
                  ) : (
                    <>
                      <Sun size={14} className="text-amber-400 fill-amber-400" />
                      <span>Light UI</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}