import React, { useState, useRef } from 'react';
import { MapPin, ArrowUpRight, ArrowRight, Heart, ChevronLeft, ChevronRight, Zap, Gauge, Flame, GitCompare, ShieldCheck } from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { getOptimizedUrl } from '../lib/cloudinaryService';
import { motion } from 'motion/react';
import { hoverEffects } from './AnimationProvider';
import { VehicleVerificationModal } from './VehicleVerificationModal';
import { LazyImage } from './LazyImage';
import { GlassCard } from './GlassCard';

// Swiper integration
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface VehicleCardProps {
  car: CarListing;
  dealer?: Dealer;
  variant?: 'grid' | 'list';
  onSelect: (car: CarListing) => void;
  onToggleCompare?: (car: CarListing) => void;
  isComparing?: boolean;
  onToggleFavorite?: (car: CarListing) => void;
  isFavorite?: boolean;
}

export function VehicleCard({ 
  car, 
  dealer, 
  variant = 'grid', 
  onSelect, 
  onToggleCompare, 
  isComparing = false,
  onToggleFavorite,
  isFavorite = false
}: VehicleCardProps) {
  const getStatus = (listing: CarListing): 'Available' | 'Reserved' | 'Sold' => {
    if (listing.isSold || listing.status === 'Sold') return 'Sold';
    if (listing.status) {
      const s = (listing.status as string).toLowerCase();
      if (s === 'sold') return 'Sold';
      if (s === 'reserved') return 'Reserved';
      if (s === 'available' || s === 'active') return 'Available';
    }
    const isReserved = listing.specs?.regionalSpecs === 'Reserved' || listing.tags?.includes('Reserved') || (listing as any).isReserved;
    if (isReserved) return 'Reserved';
    return 'Available';
  };
  const status = getStatus(car);

  const imagesList = car.images && car.images.length > 0 
    ? car.images 
    : [
        car.imageUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600'
      ];

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const swiperRef = useRef<any>(null);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `Rs. ${(price / 10000000).toFixed(2)} Crore`;
    }
    return `Rs. ${(price / 100000).toFixed(1)} Lakh`;
  };

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || url.includes('/video/upload/') || url.includes('video');
  };

  // Performance grid calculations with high-fidelity defaults mimicking premium spec sheets
  const calculatedTopSpeed = car.topSpeed || (
    car.engineCC > 3500 ? '280 km/h' :
    car.engineCC > 2400 ? '250 km/h' :
    car.engineCC > 1500 ? '220 km/h' : '190 km/h'
  );

  const calculatedAcceleration = car.acceleration || (
    car.engineCC > 3500 ? '3.8 s' :
    car.engineCC > 2400 ? '5.2 s' :
    car.engineCC > 1500 ? '7.5 s' : '9.8 s'
  );

  const calculatedHP = car.specs?.horspower 
    ? `${car.specs.horspower} HP` 
    : (
        car.engineCC > 3500 ? '450 HP' :
        car.engineCC > 2400 ? '280 HP' :
        car.engineCC > 1500 ? '160 HP' : '110 HP'
      );

  return (
    <motion.div
      variants={hoverEffects.lift}
      whileHover="whileHover"
      whileTap="whileTap"
      onClick={() => onSelect(car)}
      className="group relative flex flex-col bg-[var(--color-bg-secondary)] rounded-[24px] overflow-hidden cursor-pointer shadow-[var(--shadow-bento)] border border-[var(--color-border-main)] transition-all duration-300 hover:shadow-xl hover:border-[var(--color-accent-main)]"
      id={`vehicle-card-${car.id}`}
    >
      {/* 1. HERO MEDIA CANVAS - Top Section */}
      <div 
        className="relative w-full aspect-[4/3] sm:aspect-[1.4/1] overflow-hidden bg-[var(--color-bg-primary)] touch-pan-y"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('.custom-swiper-btn') || target.closest('.swiper-pagination')) {
            e.stopPropagation();
          }
        }}
      >
        <Swiper
          ref={swiperRef}
          modules={[Pagination]}
          pagination={{ clickable: true }}
          className="w-full h-full"
        >
          {imagesList.map((imgUrl, idx) => (
            <SwiperSlide key={idx} className="w-full h-full relative" onClick={() => onSelect(car)}>
              {isVideoUrl(imgUrl) ? (
                <video
                  src={imgUrl}
                  className="w-full h-full object-cover"
                  controls={false}
                  loop
                  muted
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={getOptimizedUrl(imgUrl, {
                    width: 600,
                    quality: 'auto',
                    format: 'auto',
                    watermark: true
                  })}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {imagesList.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                swiperRef.current?.swiper?.slidePrev();
              }}
              className="custom-swiper-btn absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[var(--color-accent-main)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 shadow-md active:scale-90 border border-white/20 cursor-pointer"
            >
              <ChevronLeft size={14} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                swiperRef.current?.swiper?.slideNext();
              }}
              className="custom-swiper-btn absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[var(--color-accent-main)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 shadow-md active:scale-90 border border-white/20 cursor-pointer"
            >
              <ChevronRight size={14} className="stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Dynamic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />

        {/* Dynamic Sold Overlay on image */}
        {status === 'Sold' && (
          <div className="absolute inset-0 bg-black/40 backdrop-grayscale-[40%] pointer-events-none z-15 flex items-center justify-center">
            <div className="bg-rose-600/90 text-white font-black text-xs uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border border-rose-400/40 shadow-2xl rotate-[-6deg] backdrop-blur-sm">
              Vehicle Sold
            </div>
          </div>
        )}

        {/* Condition & Validation Overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20 text-left items-start">
          {car.featured && (
            <span className="bg-[var(--color-accent-main)] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
              Featured
            </span>
          )}
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10">
              {car.condition}
            </span>
            {status === 'Sold' ? (
              <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg border border-rose-400/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Sold
              </span>
            ) : status === 'Reserved' ? (
              <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg border border-amber-300/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Reserved
              </span>
            ) : (
              <span className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />
                Available
              </span>
            )}
          </div>
        </div>

        {/* Action Overlays */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(car);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-md ${
                isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/40 text-gray-200 hover:text-white hover:bg-black/60 border border-white/10'
              }`}
            >
              <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}

          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(car);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-md ${
                isComparing
                  ? 'bg-[var(--color-accent-main)] text-white border border-[var(--color-accent-main)]/40'
                  : 'bg-black/40 text-gray-200 hover:text-white hover:bg-black/60 border border-white/10'
              }`}
            >
              <GitCompare size={14} className={isComparing ? 'animate-pulse' : ''} />
            </button>
          )}
        </div>

        {/* Model Year Stamp */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold text-white tracking-widest z-20">
          {car.year}
        </div>
        
        {car.verified && (
          <div className="absolute bottom-3 left-3 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsVerifyModalOpen(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[8px] font-sans font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg active:scale-95 transition-all cursor-pointer border border-emerald-400/20"
            >
              <ShieldCheck size={10} className="stroke-[3]" />
              <span>Verified</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. PRIMARY FACE INFO - Bottom Details Section */}
      <div className="p-4 flex flex-col justify-between flex-grow bg-[var(--color-bg-secondary)] z-30">
        <div>
          <span className="text-[9px] font-black uppercase text-[var(--color-accent-main)] tracking-[0.2em] block leading-none">{car.make}</span>
          <h3 className="text-base font-black text-[var(--color-text-main)] mt-1 leading-tight line-clamp-1">
            {car.model}
          </h3>
          <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide mt-1">
            {car.transmission} • {car.fuelType} • {car.engineCC}cc
          </p>

          {/* Specs Mini-Grid */}
          <div className="grid grid-cols-3 gap-1 mt-3 py-2 border-y border-[var(--color-border-main)] text-center">
            <div className="flex flex-col items-center justify-center">
              <Zap size={12} className="text-amber-500 mb-0.5" />
              <span className="text-[9px] font-bold text-[var(--color-text-main)] leading-none">{calculatedHP}</span>
            </div>
            <div className="flex flex-col items-center justify-center border-x border-[var(--color-border-main)]">
              <Gauge size={12} className="text-orange-500 mb-0.5" />
              <span className="text-[9px] font-bold text-[var(--color-text-main)] leading-none">{calculatedTopSpeed}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Flame size={12} className="text-rose-500 mb-0.5" />
              <span className="text-[9px] font-bold text-[var(--color-text-main)] leading-none">{calculatedAcceleration}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[15px] font-black text-[var(--color-text-main)] font-sans leading-none">
              {formatPrice(car.price)}
            </span>
          </div>
          <button
            type="button"
            className="bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-hover)] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-500/20 cursor-pointer flex items-center gap-1"
          >
            <span>Explore</span>
            <ArrowUpRight size={10} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      <VehicleVerificationModal 
        car={car} 
        isOpen={isVerifyModalOpen} 
        onClose={() => setIsVerifyModalOpen(false)} 
      />
    </motion.div>
  );
}
