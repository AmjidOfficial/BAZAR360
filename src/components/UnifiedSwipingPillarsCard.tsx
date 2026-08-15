import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  Building2, 
  MessageCircle, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Flame, 
  BadgePercent,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  Layers,
  Store
} from 'lucide-react';

interface UnifiedSwipingPillarsCardProps {
  setTab: (tab: string) => void;
  className?: string;
}

export default function UnifiedSwipingPillarsCard({ setTab, className = '' }: UnifiedSwipingPillarsCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const pillars = [
    {
      id: 'dual-inventory',
      title: 'Dual Inventory',
      subtitle: 'New & Used Car Marketplace',
      tag: '1000+ Verified Listings',
      icon: Car,
      bgGradient: 'from-[#7C3AED]/20 via-[#3B82F6]/10 to-transparent',
      borderColor: 'border-[#7C3AED]/30',
      glowColor: 'shadow-[0_15px_35px_rgba(124,58,237,0.25)]',
      accentBadge: 'bg-[#7C3AED] text-white',
      buttonBg: 'bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] hover:from-[#8B5CF6] hover:to-[#2563EB] text-white font-bold',
      description: 'Explore verified new & certified pre-owned vehicles with instant price estimation, 360° health reports, and multi-currency PKR/USD view.',
      features: [
        'Certified 100+ Point Inspection',
        'Direct Owner & Dealer Contact',
        'Filter by Peshawar, Islamabad, Lahore'
      ],
      actionText: 'Explore Marketplace',
      targetTab: 'inventory'
    },
    {
      id: 'auto-choice-hub',
      title: 'Auto Choice Hub',
      subtitle: 'Flagship Showrooms Network',
      tag: 'Verified Showrooms',
      icon: Store,
      bgGradient: 'from-[#3B82F6]/20 via-[#7C3AED]/10 to-transparent',
      borderColor: 'border-[#3B82F6]/30',
      glowColor: 'shadow-[0_15px_35px_rgba(59,130,246,0.25)]',
      accentBadge: 'bg-[#3B82F6] text-white',
      buttonBg: 'bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#8B5CF6] text-white font-bold',
      description: 'Connect directly with top-tier flagship auto showrooms across Pakistan. View digital storefronts, active inventory, and dealership credentials.',
      features: [
        'Exclusive Dealer Showroom Pages',
        'Official Credentials & Reviews',
        'Direct Location & Booking'
      ],
      actionText: 'Browse Flagship Showrooms',
      targetTab: 'dealers'
    },
    {
      id: 'instant-bargain',
      title: 'Instant Bargain',
      subtitle: 'Direct WhatsApp Deals & Offers',
      tag: 'Live Bargain Engine',
      icon: MessageCircle,
      bgGradient: 'from-[#22C55E]/20 via-[#7C3AED]/10 to-transparent',
      borderColor: 'border-[#22C55E]/30',
      glowColor: 'shadow-[0_15px_35px_rgba(34,197,94,0.25)]',
      accentBadge: 'bg-[#22C55E] text-slate-950 font-bold',
      buttonBg: 'bg-gradient-to-r from-[#22C55E] to-[#10B981] hover:from-[#16A34A] hover:to-[#059669] text-white font-bold',
      description: 'Submit instant offer proposals and counter-offers directly via WhatsApp. Lock in exclusive prices with zero middleman markup.',
      features: [
        'Real-time WhatsApp Negotiation',
        'Instant Counter-Offer Alerts',
        'Verified Dealer Best Prices'
      ],
      actionText: 'Start WhatsApp Bargain',
      targetTab: 'inventory'
    }
  ];

  // Auto-slide effect every 4.5 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % pillars.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, pillars.length]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % pillars.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + pillars.length) % pillars.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const currentPillar = pillars[activeIndex];
  const IconComponent = currentPillar.icon;

  return (
    <div 
      className={`relative w-full bg-bg-primary/90 backdrop-blur-2xl border ${currentPillar.borderColor} rounded-[28px] p-5 sm:p-6 text-[var(--color-text-header)] overflow-hidden transition-all duration-500 ${currentPillar.glowColor} ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Ambient Glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${currentPillar.bgGradient} rounded-full blur-3xl pointer-events-none transition-all duration-700`} />

      {/* Top Floating Pillar Selector Tabs */}
      <div className="relative z-10 flex items-center justify-between gap-1.5 p-1.5 bg-black/50 border border-white/10 rounded-2xl mb-4 overflow-x-auto custom-scrollbar">
        {pillars.map((pillar, idx) => {
          const PIcon = pillar.icon;
          const isActive = idx === activeIndex;
          return (
            <button
              key={pillar.id}
              onClick={() => setActiveIndex(idx)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                isActive 
                  ? `${pillar.accentBadge} shadow-md scale-[1.02]` 
                  : 'text-gray-400 hover:text-[var(--color-text-header)] hover:bg-white/5'
              }`}
            >
              <PIcon size={14} className={isActive ? 'stroke-[2.5]' : ''} />
              <span>{pillar.title}</span>
            </button>
          );
        })}
      </div>

      {/* Swiping Content Area with Framer Motion Slide */}
      <div className="relative z-10 min-h-[220px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPillar.id}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="space-y-3.5"
          >
            {/* Pillar Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-white/10 border ${currentPillar.borderColor} text-[var(--color-text-header)] shadow-inner`}>
                  <IconComponent size={24} className="stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-orange-400 block">
                    Pillar 0{activeIndex + 1} / 03
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[var(--color-text-header)] leading-snug">
                    {currentPillar.title}
                  </h3>
                  <p className="text-xs text-gray-300 font-medium">
                    {currentPillar.subtitle}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${currentPillar.accentBadge} shrink-0`}>
                {currentPillar.tag}
              </span>
            </div>

            {/* Pillar Description */}
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              {currentPillar.description}
            </p>

            {/* Feature Bullet Points */}
            <div className="space-y-1.5 pt-1">
              {currentPillar.features.map((feat, fIdx) => (
                <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-200">
                  <CheckCircle2 size={13} className="text-[var(--color-accent-main)] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Button & Carousel Swipe Controls */}
        <div className="pt-5 flex items-center justify-between gap-3 border-t border-white/10 mt-4">
          <button
            onClick={() => setTab(currentPillar.targetTab)}
            className={`flex-1 py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer ${currentPillar.buttonBg}`}
          >
            <span>{currentPillar.actionText}</span>
            <ArrowRight size={15} />
          </button>

          {/* Swipe Arrow Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[var(--color-text-header)] border border-white/10 transition-colors cursor-pointer active:scale-90"
              title="Previous Pillar"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[var(--color-text-header)] border border-white/10 transition-colors cursor-pointer active:scale-90"
              title="Next Pillar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Auto Progress Bar at Bottom */}
      <div className="relative z-10 w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
        <motion.div
          key={activeIndex}
          initial={{ width: '0%' }}
          animate={{ width: isPaused ? '100%' : '100%' }}
          transition={{ duration: isPaused ? 0 : 4.5, ease: 'linear' }}
          className="h-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#3B82F6]"
        />
      </div>
    </div>
  );
}
