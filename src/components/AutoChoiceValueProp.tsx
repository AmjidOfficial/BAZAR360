import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  FileCheck,
  Brush,
  Shield,
  Handshake,
  Zap,
  ArrowRight
} from 'lucide-react';

interface AutoChoiceValuePropProps {
  setTab: (tab: string) => void;
  lang?: 'en' | 'ur';
}

export function AutoChoiceValueProp({ setTab, lang = 'en' }: AutoChoiceValuePropProps) {
  const [activeServiceIdx, setActiveServiceIdx] = useState(0);
  const [isServicePaused, setIsServicePaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const specializedServices = [
    {
      id: 'inspection',
      title: 'Vehicle Inspection Report',
      subtext: 'Digital 360° Health Check',
      pill: 'Certified Grading',
      icon: ShieldCheck,
      desc: '200+ point diagnostic check covering engine, suspension, paint thickness & body filler.',
      targetTab: 'services'
    },
    {
      id: 'excise',
      title: 'Excise Services & Registration',
      subtext: 'Government Verification Support',
      pill: 'Government Services',
      icon: FileCheck,
      desc: 'Hassle-free biometric verification, tax clearance, and official smart card processing.',
      targetTab: 'services'
    },
    {
      id: 'detailing',
      title: 'Car Detailing & Rejuvenation',
      subtext: 'Multi-stage rotary correction',
      pill: 'Polishing',
      icon: Brush,
      desc: 'Deep steam extraction, multi-stage paint polishing, engine bay cleaning, and sterilization.',
      targetTab: 'services'
    },
    {
      id: 'ceramic_ppf',
      title: 'Ceramic Coating & Paint Protection (PPF)',
      subtext: 'Military-grade nano coatings',
      pill: 'Nano-Ceramic',
      icon: Shield,
      desc: 'Self-healing clear TPU PPF film protecting against stone chips, scratches, and oxidation.',
      targetTab: 'services'
    },
    {
      id: 'sell_for_u',
      title: 'Sell For U',
      subtext: 'Consignment & Managed Sales',
      pill: 'Sell For U',
      icon: Handshake,
      desc: 'Let our experts sell your car with professional 4K shoots, filtered buyer calls & safe transfer.',
      targetTab: 'sell'
    }
  ];

  const currentService = specializedServices[activeServiceIdx];
  const ServiceIcon = currentService.icon;

  return (
    <div className="py-12 bg-[var(--color-bg-secondary)] relative border-y border-[var(--color-border-main)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] mb-3 shadow-sm"
          >
            <Zap size={14} className="text-orange-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-main)]">
              Bazar360 Ecosystem
            </span>
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[var(--color-text-main)] tracking-tight mb-2 leading-tight">
            More Than Just A Marketplace. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Premium Automotive Services</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-medium max-w-xl mx-auto leading-relaxed">
            Experience all 5 flagship services in one dynamic interactive card. Click or swipe to inspect each specialized pillar.
          </p>
        </div>

        {/* Interactive Swiping Card for All Services */}
        <div 
          className="relative bg-bg-primary/95 backdrop-blur-2xl border border-orange-500/30 rounded-3xl p-6 sm:p-8 text-[var(--color-text-header)] shadow-[0_20px_50px_rgba(249,115,22,0.15)] overflow-hidden transition-all duration-500"
          onMouseEnter={() => setIsServicePaused(true)}
          onMouseLeave={() => setIsServicePaused(false)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const diffX = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(diffX) > 40) {
              if (diffX > 0) setActiveServiceIdx((prev) => (prev + 1) % specializedServices.length);
              else setActiveServiceIdx((prev) => (prev - 1 + specializedServices.length) % specializedServices.length);
            }
            touchStartX.current = null;
          }}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Top Pill Navigation */}
          <div className="relative z-10 flex items-center justify-between gap-2 p-1 bg-black/60 border border-white/10 rounded-xl mb-6 overflow-x-auto no-scrollbar">
            {specializedServices.map((srv, idx) => {
              const SIcon = srv.icon;
              const isActive = idx === activeServiceIdx;
              return (
                <button
                  key={srv.id}
                  onClick={() => setActiveServiceIdx(idx)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                    isActive 
                      ? 'bg-orange-500 text-slate-950 shadow-lg scale-105' 
                      : 'text-gray-400 hover:text-[var(--color-text-header)] hover:bg-white/5'
                  }`}
                >
                  <SIcon size={14} className={isActive ? 'stroke-[2.5]' : ''} />
                  <span>{srv.pill}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Card Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentService.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="relative z-10 grid md:grid-cols-12 gap-6 items-center min-h-[180px]"
            >
              <div className="md:col-span-8 space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shadow-inner shrink-0">
                    <ServiceIcon size={24} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-orange-400 block">
                      Service 0{activeServiceIdx + 1} / 0{specializedServices.length}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[var(--color-text-header)] tracking-tight leading-snug">
                      {currentService.title}
                    </h3>
                    <p className="text-xs font-bold text-orange-400">
                      {currentService.subtext}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed pt-1">
                  {currentService.desc}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/30 text-[9px] font-mono font-bold uppercase">
                    ✓ Instant Booking Available
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-sky-400 border border-sky-500/30 text-[9px] font-mono font-bold uppercase">
                    ★ Certified Technicians
                  </span>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col justify-center items-center md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6">
                <button
                  onClick={() => setTab(currentService.targetTab)}
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Launch {currentService.pill}</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  onClick={() => setTab('services')}
                  className="text-[11px] font-bold text-gray-400 hover:text-[var(--color-text-header)] transition-colors flex items-center gap-1"
                >
                  <span>Explore All 5 Services</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Progress Bar */}
          <div className="relative z-10 pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {specializedServices.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveServiceIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeServiceIdx ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <span className="text-[9px] font-mono text-gray-400 uppercase">
              {isServicePaused ? 'Paused' : 'Auto-Swiping'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
