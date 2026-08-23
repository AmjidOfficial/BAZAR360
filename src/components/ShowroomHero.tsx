import React, { useState, useEffect } from 'react';
import { Dealer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, Zap, Clock, Star } from 'lucide-react';

const babKhyberImg = new URL('../assets/images/bab_e_khyber_sunset_1783593379683.jpg', import.meta.url).href;

interface ShowroomHeroProps {
  dealer: Dealer;
}

const TAGLINE_DATA = {
  Professional: {
    taglines: [
      "Pristine Collection, Professional Service.",
      "Verified Stock. Certified Excellence.",
      "The Standard of Automotive Trust.",
    ],
    icon: <ShieldCheck className="text-blue-400" size={16} />
  },
  Dynamic: {
    taglines: [
      "Your Next Adventure Starts Here.",
      "Drive the Future Today.",
      "Unleash the Power of Quality.",
    ],
    icon: <Zap className="text-orange-400" size={16} />
  },
  Convenience: {
    taglines: [
      "Easy Purchases. Fast Documentation.",
      "Hassle-Free Buying Experience.",
      "From Our Floor to Your Door.",
    ],
    icon: <Clock className="text-[var(--color-accent-main)]" size={16} />
  },
  Short: {
    taglines: [
      "Drive Better.",
      "Elite Wheels.",
      "Pure Performance.",
    ],
    icon: <Star className="text-purple-400" size={16} />
  }
};

export const ShowroomHero: React.FC<ShowroomHeroProps> = ({ dealer }) => {
  const category = dealer.taglineCategory || 'Professional';
  const categoryData = TAGLINE_DATA[category as keyof typeof TAGLINE_DATA] || TAGLINE_DATA.Professional;
  const [taglineIndex, setTaglineIndex] = useState(() => Math.floor(Math.random() * categoryData.taglines.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex(prev => (prev + 1) % categoryData.taglines.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [categoryData.taglines.length]);

  return (
    <div className="relative h-56 sm:h-72 md:h-96 lg:h-[420px] xl:h-[460px] w-full overflow-hidden bg-bg-primary group" id="home">
      {/* Cover Image */}
      <img 
        src={dealer.coverImage || babKhyberImg} 
        alt={`${dealer.name} Full HD Cover`} 
        className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out opacity-65 mix-blend-overlay brightness-105" 
        style={{ imageRendering: 'crisp-edges' }}
        loading="eager"
      />
      <div className="absolute inset-0 bg-bg-primary/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />
      
      {/* Dynamic Tagline Engine */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
        <div className="text-center space-y-3 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${category}-${taglineIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-4"
            >
              <h1 className="text-3xl md:text-5xl font-sans font-black tracking-tight text-[var(--color-text-header)] drop-shadow-2xl">
                {categoryData.taglines[taglineIndex]}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-8 bg-orange-500/50" />
                <p className="text-xs md:text-sm font-sans text-orange-400 font-bold uppercase tracking-[0.2em] drop-shadow-md">
                  {dealer.subtitle || "Premium Automotive Partner"}
                </p>
                <div className="h-[1px] w-8 bg-orange-500/50" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Verified Badge */}
      {dealer.verified && (
        <div className="absolute top-6 left-6 z-10">
          <span className="bg-[var(--color-accent-main)]/20 border border-[var(--color-accent-main)]/40 text-[var(--color-accent-main)] px-3.5 py-1.5 rounded-full text-[9px] font-sans font-black uppercase tracking-widest shadow-xl backdrop-blur-md flex items-center gap-2">
            <ShieldCheck size={12} />
            Verified Showroom
          </span>
        </div>
      )}
    </div>
  );
};
