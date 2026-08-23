import React, { useState, useRef } from 'react';
import { MapPin, ArrowUpRight, ArrowRight, Heart, ChevronLeft, ChevronRight, Zap, Gauge, Flame, GitCompare, ShieldCheck, ZoomIn, ChevronDown, ChevronUp, Share2, Check } from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { getOptimizedUrl } from '../lib/cloudinaryService';
import { motion, AnimatePresence } from 'motion/react';
import { hoverEffects } from './AnimationProvider';
import { VehicleVerificationModal } from './VehicleVerificationModal';
import { LazyImage } from './LazyImage';
import { GlassCard } from './GlassCard';
import { Lightbox } from './Lightbox';

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
        car.imageUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600'
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

  const rawHp = car.specs?.horspower || '';
  const calculatedHP = rawHp 
    ? (rawHp.toString().toLowerCase().includes('hp') ? rawHp : `${rawHp} HP`)
    : (
        car.engineCC > 3500 ? '450 HP' :
        car.engineCC > 2400 ? '280 HP' :
        car.engineCC > 1500 ? '160 HP' : '110 HP'
      );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(index * 0.05, 0.35)
      }}
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(car)}
      className={`group relative flex ${variant === 'list' ? 'flex-col md:flex-row' : 'flex-col'} bg-white rounded-2xl overflow-hidden cursor-pointer border border-[#E2E8F0] transition-all duration-300 hover:border-[#007979]/60 hover:shadow-md`}
      id={`vehicle-card-${car.id}`}
    >
      {/* 1. HERO MEDIA CANVAS - Full Length View Widescreen Stage */}
      <div 
        className={`relative w-full ${variant === 'list' ? 'md:w-5/12 lg:w-4/12' : ''} aspect-[16/10] overflow-hidden bg-slate-900 touch-pan-y shrink-0`}
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
                <div className="relative w-full h-full bg-slate-900 overflow-hidden">
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
              className="custom-swiper-btn absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#007979] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 shadow-md active:scale-90 border border-white/20 cursor-pointer"
            >
              <ChevronLeft size={14} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                swiperRef.current?.swiper?.slideNext();
              }}
              className="custom-swiper-btn absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#007979] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 shadow-md active:scale-90 border border-white/20 cursor-pointer"
            >
              <ChevronRight size={14} className="stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Dynamic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none z-10" />

        {/* Dynamic Sold Overlay on image */}
        {status === 'Sold' && (
          <div className="absolute inset-0 bg-black/50 backdrop-grayscale-[40%] pointer-events-none z-15 flex items-center justify-center">
            <div className="bg-rose-600/95 text-white font-bold text-xs uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border border-rose-400/40 shadow-2xl rotate-[-6deg] backdrop-blur-sm">
              Vehicle Sold
            </div>
          </div>
        )}

        {/* Condition & Validation Overlays with Showroom Logo Space */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 text-left items-start max-w-[70%]">
          {dealer && (dealer.logoUrl || dealer.logo) && (
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-lg">
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
              <span className="bg-[#007979] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg">
                Featured
              </span>
            )}
            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10">
              {car.condition}
            </span>
            {status === 'Sold' ? (
              <span className="bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg border border-rose-400/30">
                Sold
              </span>
            ) : status === 'Reserved' ? (
              <span className="bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg border border-amber-300/30">
                Reserved
              </span>
            ) : (
              <span className="bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg border border-emerald-400/30">
                Available
              </span>
            )}
          </div>
        </div>

        {/* Action Overlays */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.85 }}
            type="button"
            title={copied ? 'Link Copied!' : 'Share Vehicle Link'}
            onClick={handleShare}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-md border ${
              copied
                ? 'bg-[#007979] text-white border-[#007979]'
                : 'bg-black/40 text-gray-200 hover:text-white hover:bg-black/60 border-white/10'
            }`}
          >
            {copied ? <Check size={14} className="stroke-[3] animate-bounce" /> : <Share2 size={14} />}
          </motion.button>

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
                  ? 'bg-[#007979] text-white border border-[#007979]/40'
                  : 'bg-black/40 text-gray-200 hover:text-white hover:bg-black/60 border border-white/10'
              }`}
            >
              <GitCompare size={14} className={isComparing ? 'animate-pulse' : ''} />
            </button>
          )}
        </div>

        {/* Model Year Badge */}
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
              className="bg-[#007979] hover:bg-[#006060] text-white text-[8px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg active:scale-95 transition-all cursor-pointer border border-[#007979]/20"
            >
              <ShieldCheck size={10} className="stroke-[3]" />
              <span>Verified</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. PRIMARY FACE INFO - Bottom Details Section */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-grow bg-white z-30">
        <div>
          <span className="text-[9px] font-bold uppercase text-[#007979] tracking-[0.2em] block leading-none">{car.make}</span>
          <h3 className="text-xs sm:text-base font-bold text-[#0F172A] mt-1 leading-tight line-clamp-1">
            {car.model}
          </h3>
          <p className="text-[9px] sm:text-[10px] font-medium text-[#64748B] uppercase tracking-wide mt-0.5 sm:mt-1 truncate">
            {car.transmission} • {car.fuelType} • {car.engineCC}cc
          </p>

          {/* Specs Mini-Grid */}
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 mt-2 sm:mt-3 py-1.5 sm:py-2 border-y border-[#E2E8F0] text-center">
            <div className="flex flex-col items-center justify-center">
              <Zap size={10} className="text-[#007979] mb-0.5" />
              <span className="text-[8px] sm:text-[9px] font-bold text-[#0F172A] leading-none truncate">{calculatedHP}</span>
            </div>
            <div className="flex flex-col items-center justify-center border-x border-[#E2E8F0]">
              <Gauge size={10} className="text-[#007979] mb-0.5" />
              <span className="text-[8px] sm:text-[9px] font-bold text-[#0F172A] leading-none truncate">{calculatedTopSpeed}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Flame size={10} className="text-rose-500 mb-0.5" />
              <span className="text-[8px] sm:text-[9px] font-bold text-[#0F172A] leading-none truncate">{calculatedAcceleration}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 sm:pt-3 flex flex-col gap-1.5 mt-auto">
          <div className="flex items-center justify-between gap-1 w-full">
            <span className="text-xs sm:text-[15px] font-bold text-[#007979] font-sans leading-tight whitespace-nowrap truncate">
              {formatPrice(car.price)}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                title={isExpanded ? 'Collapse Specs' : 'Expand Core Specs'}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider transition-all bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] cursor-pointer flex items-center gap-0.5 sm:gap-1 shadow-2xs active:scale-95"
              >
                <span>Specs</span>
                <ChevronDown 
                  size={10} 
                  className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
                />
              </button>
              <button
                type="button"
                onClick={() => onSelect(car)}
                className="bg-[#007979] hover:bg-[#006060] text-white px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-0.5 sm:gap-1"
              >
                <span>Explore</span>
                <ArrowUpRight size={10} className="stroke-[2.5]" />
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
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()}
              className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-2 text-left overflow-hidden"
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-[#007979]">
                <span>Core Vehicle Specs</span>
                <span className="text-[9px] text-[#64748B] font-mono">{car.registrationCity || 'Pakistan'}</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-sans">
                <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] flex flex-col justify-center">
                  <span className="text-[8px] text-[#64748B] uppercase font-bold tracking-wider">Mileage</span>
                  <span className="font-bold text-[#0F172A] font-mono mt-0.5">
                    {car.mileage ? `${Number(car.mileage).toLocaleString()} km` : 'Unregistered'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] flex flex-col justify-center">
                  <span className="text-[8px] text-[#64748B] uppercase font-bold tracking-wider">Transmission</span>
                  <span className="font-bold text-[#0F172A] mt-0.5">
                    {car.transmission}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] flex flex-col justify-center">
                  <span className="text-[8px] text-[#64748B] uppercase font-bold tracking-wider">Engine</span>
                  <span className="font-bold text-[#0F172A] font-mono mt-0.5">
                    {car.engineCC ? `${car.engineCC} cc` : car.fuelType}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] flex flex-col justify-center">
                  <span className="text-[8px] text-[#64748B] uppercase font-bold tracking-wider">Assembly</span>
                  <span className="font-bold text-[#0F172A] mt-0.5">
                    {car.assemblyType || 'Local'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] flex flex-col justify-center">
                  <span className="text-[8px] text-[#64748B] uppercase font-bold tracking-wider">Body Condition</span>
                  <span className="font-bold text-[#0F172A] mt-0.5 truncate" title={car.bodyCondition || car.condition}>
                    {car.bodyCondition || car.condition}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] flex flex-col justify-center">
                  <span className="text-[8px] text-[#64748B] uppercase font-bold tracking-wider">Documents</span>
                  <span className="font-bold text-[#007979] mt-0.5">
                    {car.documentType || 'Smart Card'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] flex flex-col justify-center col-span-2">
                  <span className="text-[8px] text-[#64748B] uppercase font-bold tracking-wider">Seller Location / Address</span>
                  <span className="font-bold text-[#0F172A] mt-0.5 truncate text-left" title={car.location || car.registrationCity || 'Pakistan'}>
                    {car.location || car.registrationCity || 'Pakistan'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] flex items-center justify-between col-span-2">
                  <div>
                    <span className="text-[8px] text-[#64748B] uppercase font-bold tracking-wider block">Contact & Messaging</span>
                    <span className="font-bold text-[#007979] font-mono text-[10px] text-left block">
                      {car.sellerPhone || car.phone || (car.dealerId !== 'private' ? '+92 314 9198403' : 'N/A')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.dispatchEvent(new CustomEvent('open-b360-messaging', {
                        detail: {
                          relatedListing: car,
                          recipientUser: {
                            uid: car.createdBy || car.dealerId || 'seller',
                            displayName: car.sellerName || `${car.make} ${car.model} Seller`,
                            phoneNumber: car.sellerPhone || car.phone
                          },
                          initialMessage: `Hi! Is the ${car.year} ${car.make} ${car.model} (Rs. ${car.price ? Number(car.price).toLocaleString() : 'N/A'}) still available?`
                        }
                      }));
                    }}
                    className="px-3 py-1.5 bg-[#007979] hover:bg-[#006060] text-white font-bold text-[9px] uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    Message Seller
                  </button>
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
