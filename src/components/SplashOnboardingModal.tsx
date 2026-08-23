import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Car, CheckCircle, ChevronRight, X } from 'lucide-react';
import { CarListing } from '../types';

interface SplashOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ur';
  listings?: CarListing[];
  onSelectListing?: (car: CarListing) => void;
}

export function SplashOnboardingModal({ isOpen, onClose, lang, listings = [], onSelectListing }: SplashOnboardingModalProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Drive Your Dream",
      subtitle: "Verified & Secure",
      desc: "Beautiful cars. Verified spaces. Better drive.",
      image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
      tag: "Bazar360 Certified"
    },
    {
      title: "Auto Choice Fleet",
      subtitle: "Direct Showrooms",
      desc: "Immaculate SUVs, Hybrid Sedans & Sports collection.",
      image: "https://images.unsplash.com/photo-1542362567-b07eac79094d?auto=format&fit=crop&w=1200&q=80",
      tag: "Top Rated 4.9★"
    },
    {
      title: "Instant Selling",
      subtitle: "Fast & Transparent",
      desc: "Sell your car directly to verified buyers nationwide.",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      tag: "Zero Brokerage"
    }
  ];

  // Swiping interval for background carousel
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen, slides.length]);

  if (!isOpen) return null;

  const currentSlide = slides[activeSlide];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-bg-primary)]/95 backdrop-blur-2xl overflow-y-auto"
      >
        {/* Ambient Dark Emerald Glass Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Animated Background Swiping Inventory Car Visual matching Screen 1 */}
        <div className="absolute inset-0 overflow-hidden opacity-25 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide.image}
              src={currentSlide.image}
              alt="Background vehicle"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#05110D] via-[#05110D]/70 to-[#05110D]/90" />
        </div>

        {/* Main Floating Glassmorphism Screen 1 Card */}
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-[36px] bg-[var(--color-bg-secondary)]/80 backdrop-blur-3xl border border-[var(--color-accent-main)]/20 p-6 md:p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10 flex flex-col items-center justify-between min-h-[520px]"
        >
          {/* Dismiss X Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 text-gray-400 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition-all cursor-pointer z-20 border border-white/10"
            aria-label="Skip splash onboarding"
            title="Skip onboarding"
          >
            <X size={16} />
          </button>

          {/* Top Brand Emblem & Interlocking Logos */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/30 flex items-center justify-center text-[var(--color-accent-main)] shadow-[0_0_25px_rgba(16,185,129,0.25)]">
              <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </div>

            {/* Dual Brand Logos Header matching Prompt */}
            <div className="space-y-0.5">
              <h1 className="text-2xl font-black font-display tracking-tight text-[var(--color-text-header)] flex items-center justify-center gap-2">
                <span>Auto Choice</span>
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-[var(--color-accent-main)] uppercase font-semibold">
                Powered by Bazar360.online
              </p>
            </div>
          </div>

          {/* Slide Content Area matching Screen 1 in Attached Image */}
          <div className="my-auto py-6 space-y-3 w-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-[var(--color-accent-main)]/20 text-emerald-300 border border-[var(--color-accent-main)]/30">
              <ShieldCheck size={12} /> {currentSlide.tag}
            </span>

            <h2 className="text-xl md:text-2xl font-bold text-[var(--color-text-header)] tracking-tight">
              {currentSlide.title}
            </h2>

            <p className="text-emerald-200/80 text-xs leading-relaxed max-w-xs mx-auto font-sans">
              {currentSlide.desc}
            </p>

            {/* 3-Dot Pagination Carousel Indicator */}
            <div className="flex items-center justify-center gap-2 pt-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeSlide === idx 
                      ? 'w-6 bg-[var(--color-accent-main)] shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                      : 'w-2 bg-emerald-900/60 hover:bg-emerald-700/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Glowing Green Pill CTA Button "Get Started ->" matching Screen 1 */}
          <div className="w-full pt-2">
            <button
              onClick={onClose}
              className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-black font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.6)] active:scale-95 transition-all cursor-pointer border border-emerald-300/40 group"
            >
              <span>{lang === 'ur' ? 'شروع کریں ←' : 'Get Started'}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
