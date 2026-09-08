import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Bazar360InfinityIcon } from './Bazar360Logo';

// High-fidelity Vector SVG representing the brand new Auto Choice car infinity logo
export function AutoChoiceInfinityIcon({ 
  className = "w-8 h-8", 
  lightMode = false 
}: { 
  className?: string; 
  lightMode?: boolean 
}) {
  return (
    <svg 
      viewBox="0 0 100 50" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        {/* Steel Blue Metallic Gradient */}
        <linearGradient id="carSteelBlue" x1="10" y1="15" x2="60" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E5B8C" />
          <stop offset="60%" stopColor="#2E79B5" />
          <stop offset="100%" stopColor="#123E63" />
        </linearGradient>
        {/* Rose Gold / Bronze Metallic Gradient */}
        <linearGradient id="carRoseGold" x1="50" y1="15" x2="90" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E4B192" />
          <stop offset="50%" stopColor="#C58B65" />
          <stop offset="100%" stopColor="#7B4C2D" />
        </linearGradient>
        {/* Chrome Silver for Rims */}
        <linearGradient id="chromeSilver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        {/* Shadow filter */}
        <filter id="carShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity={lightMode ? "0.15" : "0.45"} />
        </filter>
      </defs>
      <g filter="url(#carShadow)">
        {/* Sports Car Silhouette Body Outline */}
        <path 
          d="M10 30 L15 28 C18 27, 22 21, 28 20 C34 19, 40 16, 48 16 C58 16, 68 18, 75 20 C82 22, 86 26, 90 28 L92 30" 
          stroke="url(#carSteelBlue)" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M72 19 C76 19, 82 20, 85 22 C88 24, 91 25, 92 30 C92 30, 91 33, 87 34 L75 34" 
          stroke="url(#carRoseGold)" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M10 30 C12 32, 15 34, 18 34 L25 34 M40 34 L65 34" 
          stroke="url(#carSteelBlue)" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />

        {/* Embedded Mini Infinity Loop in the center cabin */}
        <path 
          d="M44 25 C44 20, 34 20, 34 25 C34 30, 44 30, 44 25 Z" 
          stroke="url(#carSteelBlue)" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        <path 
          d="M54 25 C54 20, 44 20, 44 25 C44 30, 54 30, 54 25 Z" 
          stroke="url(#carRoseGold)" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />

        {/* Wheels */}
        <circle cx="31.5" cy="33" r="5" fill="#0A0F1D" stroke="url(#carSteelBlue)" strokeWidth="1.5" />
        <circle cx="31.5" cy="33" r="3" fill="url(#chromeSilver)" />
        <path d="M31.5 29 L31.5 37 M27.5 33 L35.5 33" stroke="url(#chromeSilver)" strokeWidth="0.8" />

        <circle cx="70.5" cy="33" r="5" fill="#0A0F1D" stroke="url(#carRoseGold)" strokeWidth="1.5" />
        <circle cx="70.5" cy="33" r="3" fill="url(#chromeSilver)" />
        <path d="M70.5 29 L70.5 37 M66.5 33 L74.5 33" stroke="url(#chromeSilver)" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

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
  const [customBazar360Logo, setCustomBazar360Logo] = useState<string>('');
  const [customAutoChoiceLogo, setCustomAutoChoiceLogo] = useState<string>('');

  // Realtime Firestore listener for custom logo overrides
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

  // Dual ecosystem brands config
  const brands = [
    {
      id: 'bazar360',
      name: 'Bazar360.online',
      tagline: 'CONNECT | BUY | SELL',
      subtext: 'EVERYTHING YOU NEED',
      customLogo: customBazar360Logo,
      badgeColor: 'from-[#1E5B8C] via-[#2E79B5] to-[#C58B65]',
      accentColor: 'text-[var(--color-accent-secondary)]',
      renderIcon: (light: boolean) => <Bazar360InfinityIcon className="w-full h-full p-1" lightMode={light} />
    },
    {
      id: 'autochoice',
      name: 'Auto Choice',
      tagline: 'The Right Choice',
      subtext: 'Peshawar Certified Showroom',
      customLogo: customAutoChoiceLogo,
      badgeColor: 'from-[#1E5B8C] via-[#2E79B5] to-[#C58B65]',
      accentColor: 'text-[var(--color-accent-secondary)]',
      renderIcon: (light: boolean) => <AutoChoiceInfinityIcon className="w-full h-full p-1.5" lightMode={light} />
    }
  ];

  // Auto swiping interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveBrandIndex((prev) => (prev + 1) % brands.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, brands.length]);

  const currentBrand = brands[activeBrandIndex];
  const isLight = themeMode === 'light';

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
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative inline-flex items-center gap-3 select-none cursor-pointer group p-1.5 rounded-2xl hover:bg-white/5 border border-transparent hover:border-[var(--color-accent-main)]/20 transition-all ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleToggle}
      title="Click or swipe to toggle between Bazar360 & Auto Choice"
    >
      {/* Floating Animated Dual Logo Avatar Container */}
      <div className="relative flex items-center justify-center shrink-0">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`relative w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr ${currentBrand.badgeColor} shadow-xl shadow-[var(--color-accent-main)]/10 group-hover:shadow-[var(--color-accent-main)]/30 overflow-hidden transition-shadow duration-300`}
        >
          <div className="w-full h-full bg-[#0A0F1D] rounded-[14px] overflow-hidden flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {currentBrand.customLogo ? (
                <motion.img
                  key={currentBrand.id + '-' + currentBrand.customLogo}
                  src={currentBrand.customLogo}
                  alt={currentBrand.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <motion.div
                  key={'fallback-' + currentBrand.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {currentBrand.renderIcon(isLight)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Small Swiping Trigger Pill Badge */}
        <div className="absolute -bottom-1 -right-1.5 w-5 h-5 rounded-full bg-[#0A0F1D] border-2 border-[var(--color-accent-secondary)] text-[var(--color-accent-secondary)] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[var(--color-accent-secondary)] group-hover:text-[#0A0F1D] transition-all">
          <ArrowRightLeft size={10} className="animate-pulse" />
        </div>
      </div>

      {/* Text Branding Details */}
      {showText && (
        <div className="flex flex-col text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBrand.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-base md:text-lg tracking-tight text-[var(--color-text-main)] leading-none group-hover:text-[var(--color-accent-secondary)] transition-colors">
                  {currentBrand.name}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] text-[9px] font-mono font-bold uppercase border border-[var(--color-accent-main)]/20">
                  Dual Ecosystem
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${currentBrand.accentColor} flex items-center gap-1`}>
                  <ShieldCheck size={11} className="text-[var(--color-accent-main)]" /> {currentBrand.tagline}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
