import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, RotateCw } from 'lucide-react';

const TAGLINE_CATEGORIES = [
  {
    category: "Professional & Trust-Oriented",
    tagline: "BAZAR360: Where Trust Meets Premium Automotive Choice.",
    sub: "Peshawar's Premier Marketplace with 100% Verified Showrooms.",
    color: "bg-orange-500/5 dark:bg-orange-500/10",
    borderColor: "border-orange-500/30",
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/25",
    icon: <ShieldCheck size={16} className="text-orange-500 animate-pulse" />
  },
  {
    category: "Dynamic & All-Encompassing",
    tagline: "Unleash Your Drive with bazar360.online Showroom Stock.",
    sub: "From Exotic Imports to Local Cruisers - We Have It All.",
    color: "bg-indigo-500/5 dark:bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/25",
    icon: <Sparkles size={16} className="text-indigo-500" />
  },
  {
    category: "Focused on Convenience & Speed",
    tagline: "Browse, Tap, Buy - Instant WhatsApp Dealer Connection.",
    sub: "Zero Friction Showroom Directory & Post Ads in 60 Seconds.",
    color: "bg-emerald-500/5 dark:bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
    icon: <Zap size={16} className="text-emerald-500 animate-bounce" />
  },
  {
    category: "Short & Impactful",
    tagline: "Drive Your Choice.",
    sub: "BAZAR360: Direct Showroom Gateway.",
    color: "bg-amber-500/5 dark:bg-amber-500/10",
    borderColor: "border-amber-500/30",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/25",
    icon: <Sparkles size={16} className="text-amber-500" />
  }
];

export default function TaglineBar({ lang }: { lang: 'en' | 'ur' }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Initial random index
    setCurrentIndex(Math.floor(Math.random() * TAGLINE_CATEGORIES.length));
    
    // Auto-cycle every 6 seconds
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % TAGLINE_CATEGORIES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const item = TAGLINE_CATEGORIES[currentIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl border ${item.borderColor} ${item.color} shadow-sm transition-all duration-700`}>
        {/* Background Ambient Grid lines */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-2.5 bg-white dark:bg-slate-950/80 border ${item.borderColor} rounded-xl shrink-0 mt-0.5 shadow-sm`}>
              {item.icon}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col"
              >
                <h2 className="text-sm sm:text-base font-black text-[var(--color-text-main)] tracking-tight leading-tight">
                  {lang === 'ur' && currentIndex === 3 ? 'اپنی پسندیدہ گاڑی چلائیں۔' : item.tagline}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5 font-mono leading-relaxed max-w-2xl">
                  {item.sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
