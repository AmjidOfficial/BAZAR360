import { NO_IMAGE_SVG } from "../types";
import React, { useState, useRef } from 'react';
import { MapPin, ArrowUpRight, ArrowRight, Heart, ChevronLeft, ChevronRight, Zap, Gauge, Flame, GitCompare, ShieldCheck, ChevronDown, Share2, Check, Phone } from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { getOptimizedUrl } from '../lib/cloudinaryService';
import { motion, AnimatePresence } from 'motion/react';
import { VehicleVerificationModal } from './VehicleVerificationModal';
import { Lightbox } from './Lightbox';

// Swiper integration
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface VehicleCardProps {
  car: CarListing;
  dealer?: Dealer;
  variant?: 'grid' | 'list';
  onSelect: (car: CarListing) => void;
  onToggleCompare?: (car: CarListing) => void;
  isComparing?: boolean;
  onToggleFavorite?: (car: CarListing) => void;
  isFavorite?: boolean;
  index?: number;
}

export function VehicleCard({ 
  car, 
  dealer, 
  variant = 'grid', 
  onSelect, 
  onToggleCompare, 
  isComparing = false,
  onToggleFavorite,
  isFavorite = false,
  index = 0
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
        car.imageUrl || NO_IMAGE_SVG,
        NO_IMAGE_SVG,
        NO_IMAGE_SVG
      ];

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const swiperRef = useRef<any>(null);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#/vehicle/${car.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `PKR ${(price / 10000000).toFixed(2)} Crore`;
    }
    return `PKR ${(price / 100000).toFixed(1)} Lakh`;
  };

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || url.includes('/video/upload/') || url.includes('video');
  };

  const calculatedTopSpeed = car.topSpeed || 'N/A';
  const calculatedAcceleration = car.acceleration || 'N/A';
  
  const rawHp = car.specs?.horspower || '';
  const calculatedHP = rawHp 
    ? (rawHp.toString().toLowerCase().includes('hp') || rawHp.toString().toLowerCase().includes('bhp') ? rawHp : `${rawHp} HP`)
    : `${car.engineCC || 1500} CC`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(index * 0.04, 0.25)
      }}
      whileHover={{ 
        y: -8, 
        rotateX: 2.5,
        rotateY: -2,
        scale: 1.012,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
      }}
      whileTap={{ scale: 0.985 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      onClick={() => onSelect(car)}
      className={`group relative flex ${variant === 'list' ? 'flex-col md:flex-row' : 'flex-col'} bg-[var(--color-bg-secondary)] rounded-2xl overflow-hidden cursor-pointer border border-[var(--color-border-main)] transition-all duration-300 hover:border-[var(--color-accent-main)]/60 hover:shadow-lg`}
      id={`vehicle-card-${car.id}`}
    >
      {/* 1. HERO MEDIA CANVAS */}
      <div 
        className={`relative w-full ${variant === 'list' ? 'md:w-5/12 lg:w-4/12' : ''} aspect-[16/10] overflow-hidden bg-[#090D14] touch-pan-y shrink-0`}
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
                <div className="relative w-full h-full bg-[#090D14] overflow-hidden">
                  <img
                    src={getOptimizedUrl(imgUrl, {
                      width: 800,
                      height: 500,
                      crop: 'fill',
                      quality: 'auto',
                      format: 'auto',
                      watermark: false
                    })}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
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
              className="custom-swiper-btn absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-[var(--color-accent-main)] hover:text-[#090D14] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-30 shadow-md active:scale-90 border border-white/20 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                swiperRef.current?.swiper?.slideNext();
              }}
              className="custom-swiper-btn absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-[var(--color-accent-main)] hover:text-[#090D14] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-30 shadow-md active:scale-90 border border-white/20 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}

        {/* Dynamic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D14]/75 via-transparent to-[#090D14]/25 pointer-events-none z-10" />

        {/* Dynamic Sold Overlay */}
        {status === 'Sold' && (
          <div className="absolute inset-0 bg-black/50 backdrop-grayscale-[40%] pointer-events-none z-15 flex items-center justify-center">
            <div className="bg-rose-600/95 text-white font-bold text-xs uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-rose-400/40 shadow-2xl backdrop-blur-sm">
              Vehicle Sold
            </div>
          </div>
        )}

        {/* Condition & Showroom Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 text-left items-start max-w-[70%]">
          {dealer && (dealer.logoUrl || dealer.logo) && (
            <div className="flex items-center gap-1.5 bg-[#090D14]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-lg">
              <img 
                src={getOptimizedUrl(dealer.logoUrl || dealer.logo, { width: 120, quality: 'auto:best' })} 
                alt={dealer.name || 'Showroom Logo'} 
                className="w-4 h-4 object-contain rounded-full bg-white/10 p-0.5 shrink-0" 
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <span className="text-[9px] font-bold text-white max-w-[100px] truncate">{dealer.name}</span>
            </div>
          )}

          <div className="flex gap-1 flex-wrap items-center">
            {car.featured && (
              <span className="bg-[var(--color-accent-main)] text-[#090D14] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                Featured
              </span>
            )}
            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
              {car.condition}
            </span>
            {status === 'Sold' ? (
              <span className="bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg border border-rose-400/30 whitespace-nowrap">
                Sold
              </span>
            ) : status === 'Reserved' ? (
              <span className="bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg border border-amber-300/30 whitespace-nowrap">
                Reserved
              </span>
            ) : (
              <span className="bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg border border-emerald-400/30 whitespace-nowrap">
                Available
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Share, Favorite, Compare */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            title={copied ? 'Link Copied!' : 'Share Vehicle Link'}
            onClick={handleShare}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-md border ${
              copied
                ? 'bg-[var(--color-accent-main)] text-[#090D14] border-[var(--color-accent-main)]'
                : 'bg-black/50 text-gray-200 hover:text-white hover:bg-black/70 border-white/10'
            }`}
          >
            {copied ? <Check size={12} className="stroke-[3]" /> : <Share2 size={12} />}
          </button>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(car);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-md ${
                isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/50 text-gray-200 hover:text-white hover:bg-black/70 border border-white/10'
              }`}
            >
              <Heart size={12} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}

          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(car);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-md ${
                isComparing
                  ? 'bg-[var(--color-accent-main)] text-[#090D14] border border-[var(--color-accent-main)]'
                  : 'bg-black/50 text-gray-200 hover:text-white hover:bg-black/70 border border-white/10'
              }`}
            >
              <GitCompare size={12} />
            </button>
          )}
        </div>

        {/* Model Year & Verification Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-20">
          <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold text-white tracking-widest border border-white/10">
            {car.year}
          </div>
          {car.verified && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsVerifyModalOpen(true);
              }}
              className="bg-[var(--color-accent-main)] text-[#090D14] text-[8px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <ShieldCheck size={10} className="stroke-[3]" />
              <span>Verified</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. PRIMARY DETAILS SECTION */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-grow bg-[var(--color-bg-secondary)] z-30">
        <div>
          <span className="text-[9px] font-bold uppercase text-[var(--color-accent-main)] tracking-[0.15em] block leading-none">{car.make}</span>
          <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-header)] mt-1 leading-tight line-clamp-1">
            {car.model}
          </h3>
          <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5 truncate">
            {car.transmission} • {car.fuelType} • {car.engineCC ? `${car.engineCC}cc` : '1.5L'}
          </p>

          {/* Specs Mini-Grid */}
          <div className="grid grid-cols-3 gap-1 mt-2.5 py-1.5 border-y border-[var(--color-border-main)] text-center">
            <div className="flex flex-col items-center justify-center">
              <Zap size={11} className="text-[var(--color-accent-main)] mb-0.5" />
              <span className="text-[9px] font-bold text-[var(--color-text-main)] leading-none truncate">{calculatedHP}</span>
            </div>
            <div className="flex flex-col items-center justify-center border-x border-[var(--color-border-main)]">
              <Gauge size={11} className="text-[var(--color-accent-main)] mb-0.5" />
              <span className="text-[9px] font-bold text-[var(--color-text-main)] leading-none truncate">
                {car.mileage ? `${(car.mileage / 1000).toFixed(0)}k km` : 'Unreg.'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <MapPin size={11} className="text-[var(--color-accent-main)] mb-0.5" />
              <span className="text-[9px] font-bold text-[var(--color-text-main)] leading-none truncate">
                {car.registrationCity || car.location || 'Pakistan'}
              </span>
            </div>
          </div>
        </div>

        {/* Price & Actions Row */}
        <div className="pt-3 flex flex-col gap-1.5 mt-auto">
          <div className="flex items-center justify-between gap-1 w-full">
            <span className="text-sm sm:text-base font-extrabold text-[var(--color-accent-main)] font-sans leading-tight whitespace-nowrap truncate">
              {formatPrice(car.price)}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                title={isExpanded ? 'Collapse Specs' : 'Expand Specs'}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] cursor-pointer flex items-center gap-0.5 border border-[var(--color-border-main)]"
              >
                <span>Specs</span>
                <ChevronDown 
                  size={10} 
                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
                />
              </button>
              <button
                type="button"
                onClick={() => onSelect(car)}
                className="btn-gold-primary py-1 px-3 text-[9px] rounded-lg"
              >
                <span>View</span>
                <ArrowUpRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Core Specs Drawer */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()}
              className="mt-3 pt-3 border-t border-[var(--color-border-main)] space-y-2 text-left overflow-hidden"
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent-main)]">
                <span>Vehicle Specifications</span>
                <span className="text-[9px] text-[var(--color-text-muted)] font-mono">{car.registrationCity || 'Pakistan'}</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="bg-[var(--color-bg-tertiary)] p-2 rounded-xl border border-[var(--color-border-subtle)] flex flex-col justify-center">
                  <span className="text-[8px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Mileage</span>
                  <span className="font-bold text-[var(--color-text-header)] font-mono mt-0.5">
                    {car.mileage ? `${Number(car.mileage).toLocaleString()} km` : 'Unregistered'}
                  </span>
                </div>

                <div className="bg-[var(--color-bg-tertiary)] p-2 rounded-xl border border-[var(--color-border-subtle)] flex flex-col justify-center">
                  <span className="text-[8px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Transmission</span>
                  <span className="font-bold text-[var(--color-text-header)] mt-0.5">
                    {car.transmission}
                  </span>
                </div>

                <div className="bg-[var(--color-bg-tertiary)] p-2 rounded-xl border border-[var(--color-border-subtle)] flex flex-col justify-center">
                  <span className="text-[8px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Engine</span>
                  <span className="font-bold text-[var(--color-text-header)] font-mono mt-0.5">
                    {car.engineCC ? `${car.engineCC} cc` : car.fuelType}
                  </span>
                </div>

                <div className="bg-[var(--color-bg-tertiary)] p-2 rounded-xl border border-[var(--color-border-subtle)] flex flex-col justify-center">
                  <span className="text-[8px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Assembly</span>
                  <span className="font-bold text-[var(--color-text-header)] mt-0.5">
                    {car.assemblyType || 'Local'}
                  </span>
                </div>

                <div className="bg-[var(--color-bg-tertiary)] p-2 rounded-xl border border-[var(--color-border-subtle)] flex items-center justify-between col-span-2">
                  <div>
                    <span className="text-[8px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider block">Seller Contact</span>
                    <span className="font-bold text-[var(--color-accent-main)] font-mono text-[10px] text-left block">
                      {car.sellerPhone || car.phone || '+92 314 9198403'}
                    </span>
                  </div>
                  <a
                    href={`https://wa.me/${(car.sellerPhone || car.phone || '923149198403').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I am inquiring about the ${car.year} ${car.make} ${car.model} on Bazar360.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1"
                  >
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <VehicleVerificationModal 
        car={car} 
        isOpen={isVerifyModalOpen} 
        onClose={() => setIsVerifyModalOpen(false)} 
      />

      <Lightbox 
        images={imagesList}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title={`${car.make} ${car.model} (${car.year})`}
      />
    </motion.div>
  );
}
