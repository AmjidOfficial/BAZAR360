import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight, Sparkles, Car, CheckCircle2, ChevronRight, Phone, Star } from 'lucide-react';


interface AutoChoiceOnboardingProps {
  onGetStarted: () => void;
  lang?: 'en' | 'ur';
}

export function AutoChoiceOnboarding({ onGetStarted, lang = 'en' }: AutoChoiceOnboardingProps) {
  const isUrdu = lang === 'ur';
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      tagline: 'CERTIFIED AUTOMOTIVE HUB',
      title: 'Drive Your Dreams Home',
      subtitle: 'Curated certified vehicles, verified 200+ point diagnostic checks, transparent showroom deals on Auto Choice powered by Bazar360.online.',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      badge: 'Certified Showrooms'
    },
    {
      id: 2,
      tagline: 'PAKISTAN #1 VERIFIED MARKETPLACE',
      title: 'Bring Quality Rides to Life',
      subtitle: 'Direct WhatsApp communication with verified dealers, zero hidden charges, and KP Excise registration assistance.',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
      badge: 'Biometric Verified'
    },
    {
      id: 3,
      tagline: 'PREMIUM LUXURY & SUV STOCK',
      title: 'Unmatched Variety & Value',
      subtitle: 'Explore hundreds of inspected sedans, SUVs, double cabins, and luxury vehicles at competitive prices.',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      badge: '360° Health Report'
    }
  ];

  const activeSlide = slides[currentSlide];

  return (
    <div className="relative w-full min-h-[500px] sm:min-h-[580px] rounded-[36px] overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-header)] my-4 border border-[var(--color-border-main)] shadow-2xl flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Backdrop Image with Dark Emerald Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={activeSlide.image} 
            alt={activeSlide.title} 
            className="w-full h-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B15] via-[#0B1B15]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1B15] via-transparent to-[#0B1B15]/60" />
        </motion.div>
      </AnimatePresence>

      {/* TOP HEADER BRANDING matching Screen 1 in attached picture */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl uppercase tracking-widest text-[var(--color-text-main)] hover:text-orange-500 transition-colors flex items-center gap-1">Bazar360 <span className="text-orange-500">.</span></span>
          <div className="flex flex-col text-left">
            <span className="text-sm font-black uppercase tracking-widest text-[var(--color-text-header)] font-sans">
              AUTO CHOICE
            </span>
            <span className="text-[9px] font-mono text-[var(--color-accent-main)] font-bold uppercase">
              POWERED BY BAZAR360.ONLINE
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[var(--color-accent-main)]/15 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] text-[10px] font-mono font-bold uppercase flex items-center gap-1.5">
          <ShieldCheck size={12} /> {activeSlide.badge}
        </span>
      </div>

      {/* CENTER GLASS CARD HERO CONTENT matching Screen 1 in attached picture */}
      <div className="relative z-10 max-w-2xl text-left my-8 space-y-4">
        <motion.span 
          key={`tagline-${activeSlide.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block text-[10px] font-mono font-black uppercase tracking-[0.25em] text-[var(--color-accent-main)] bg-[var(--color-accent-main)]/10 px-3.5 py-1 rounded-full border border-[var(--color-accent-main)]/20"
        >
          ★ {activeSlide.tagline}
        </motion.span>

        <motion.h1 
          key={`title-${activeSlide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[var(--color-text-header)] font-sans leading-tight"
        >
          {activeSlide.title}
        </motion.h1>

        <motion.p 
          key={`sub-${activeSlide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs sm:text-sm text-emerald-100/80 max-w-xl font-normal leading-relaxed"
        >
          {activeSlide.subtitle}
        </motion.p>

        {/* Action button & Dots pagination row matching Screen 1 in attached image */}
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={onGetStarted}
            className="px-6 py-3.5 bg-[var(--color-accent-main)] hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer font-sans"
          >
            <span>{isUrdu ? 'ابھی شروع کریں' : 'Get Started'}</span>
            <ArrowRight size={16} />
          </button>

          {/* Carousel dots pagination matching Screen 1 in mockup */}
          <div className="flex items-center gap-2 py-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-[var(--color-accent-main)]' : 'w-2 bg-white/20'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER STATS ROW */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[10px] font-mono text-emerald-300/70 gap-2">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={12} className="text-[var(--color-accent-main)]" /> 200+ Point Inspection Guarantee
        </span>
        <span className="flex items-center gap-1">
          <Star size={12} className="text-amber-400 fill-amber-400" /> 4.9/5 Rated Peshawar Showroom Hub
        </span>
        <span className="hidden sm:inline">
          AUTO CHOICE • BAZAR360.ONLINE
        </span>
      </div>
    </div>
  );
}
