import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface DualSwipingBrandLogoProps {
  className?: string;
  showText?: boolean;
  themeMode?: 'dark' | 'light';
  onSelectBrand?: (brand: 'bazar360' | 'autochoice') => void;
}

export function DualSwipingBrandLogo({
  className = '',
  showText = true,
  themeMode = 'dark',
  onSelectBrand
}: DualSwipingBrandLogoProps) {
  const [activeBrandIndex, setActiveBrandIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [customBazar360Logo, setCustomBazar360Logo] = useState<string>('/bazar360_official_logo.jpg');
  const [customAutoChoiceLogo, setCustomAutoChoiceLogo] = useState<string>('/auto_choice_logo_dark.jpg');
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({});

  // Realtime Firestore listener for custom Cloudinary uploaded logos
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const brandingRef = doc(db, 'system', 'branding');
      unsubscribe = onSnapshot(brandingRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.bazar360LogoUrl) setCustomBazar360Logo(data.bazar360LogoUrl);
          if (data.autoChoiceLogoUrl) setCustomAutoChoiceLogo(data.autoChoiceLogoUrl);
        }
      });
    } catch (err) {
      console.warn('DualSwipingBrandLogo Firestore subscription bypassed:', err);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // The two uploaded logo brands with fallback defaults
  const brands = [
    {
      id: 'bazar360',
      name: 'Bazar360.online',
      tagline: 'CONNECT | BUY | SELL',
      subtext: 'EVERYTHING YOU NEED',
      logoSrc: customBazar360Logo,
      badgeColor: 'from-blue-600 via-indigo-600 to-sky-500',
      accentColor: 'text-sky-400'
    },
    {
      id: 'autochoice',
      name: 'Auto Choice',
      tagline: 'The Right Choice',
      subtext: 'Peshawar Certified Showroom',
      logoSrc: customAutoChoiceLogo,
      badgeColor: 'from-orange-500 via-amber-500 to-red-600',
      accentColor: 'text-orange-400'
    }
  ];

  // Auto swiping / floating replacement interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveBrandIndex((prev) => (prev + 1) % brands.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, brands.length]);

  const currentBrand = brands[activeBrandIndex];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (activeBrandIndex + 1) % brands.length;
    setActiveBrandIndex(nextIdx);
    if (onSelectBrand) {
      onSelectBrand(brands[nextIdx].id as 'bazar360' | 'autochoice');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative inline-flex items-center gap-3 select-none cursor-pointer group p-1.5 rounded-2xl hover:bg-white/5 border border-transparent hover:border-orange-500/20 transition-all ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleToggle}
      title="Click or swipe to switch between Bazar360 & Auto Choice branding"
    >
      {/* Floating Animated Dual Logo Avatar Container */}
      <div className="relative flex items-center justify-center shrink-0">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`relative w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr ${currentBrand.badgeColor} shadow-xl shadow-orange-500/10 group-hover:shadow-orange-500/30 overflow-hidden transition-shadow duration-300`}
        >
          <div className="w-full h-full bg-[var(--color-bg-secondary)] rounded-[14px] overflow-hidden flex items-center justify-center relative p-1">
            <AnimatePresence mode="wait">
              {imageFailed[currentBrand.id] ? (
                <motion.div
                  key={'fallback-' + currentBrand.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-full h-full flex flex-col items-center justify-center text-center select-none"
                >
                  {currentBrand.id === 'autochoice' ? (
                    <div className="flex flex-col items-center justify-center leading-none">
                      <span className="font-black text-[13px] tracking-tighter text-amber-400 font-display">AUTO</span>
                      <span className="font-bold text-[8px] tracking-widest text-orange-500 uppercase font-mono">CHOICE</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center leading-none">
                      <span className="font-black text-[13px] tracking-tighter text-sky-400 font-display">BAZAR</span>
                      <span className="font-bold text-[8px] tracking-widest text-indigo-400 uppercase font-mono">360</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.img
                  key={currentBrand.id + '-' + currentBrand.logoSrc}
                  src={currentBrand.logoSrc}
                  alt={currentBrand.name}
                  onError={() => setImageFailed(prev => ({ ...prev, [currentBrand.id]: true }))}
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Small Swiping Trigger Pill Badge */}
        <div className="absolute -bottom-1 -right-1.5 w-5 h-5 rounded-full bg-bg-secondary border-2 border-orange-500 text-orange-400 flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:bg-orange-500 group-hover:text-slate-950 transition-all">
          <ArrowRightLeft size={10} className="animate-pulse" />
        </div>
      </div>

      {/* Text Branding Details */}
      {showText && (
        <div className="flex flex-col text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBrand.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-base md:text-lg tracking-tight text-[var(--color-text-main,#ffffff)] leading-none group-hover:text-orange-400 transition-colors">
                  {currentBrand.name}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 text-[9px] font-mono font-bold uppercase border border-orange-500/30">
                  Dual Ecosystem
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${currentBrand.accentColor} flex items-center gap-1`}>
                  <ShieldCheck size={11} /> {currentBrand.tagline}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}


