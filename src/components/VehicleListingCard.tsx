import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowRight, Heart, Trash, Mail, X, CheckCircle, User, Phone, MessageSquare, ShieldCheck, Maximize2, Zap, Gauge, Flame, ChevronLeft, ChevronRight, Share2, Check } from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { useCurrencyMode } from '../lib/currency';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { dbSubmitLead, dbTrackShowroomEvent } from '../lib/dbService';
import { VehicleVerificationModal } from './VehicleVerificationModal';
import { getOptimizedUrl } from '../lib/cloudinaryService';
import { GlassCard } from './GlassCard';
import { Lightbox } from './Lightbox';

// Swiper integration
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface VehicleListingCardProps {
  car: CarListing;
  dealer?: Dealer;
  onSelect: (car: CarListing) => void;
  onToggleFavorite?: (car: CarListing) => void;
  isFavorite?: boolean;
  onDelete?: (car: CarListing) => void;
  index?: number;
}

export default function VehicleListingCard({
  car,
  dealer,
  onSelect,
  onToggleFavorite,
  isFavorite = false,
  onDelete,
  index = 0
}: VehicleListingCardProps) {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { renderPrice } = useCurrencyMode();

  // Enquiry state variables
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enqName, setEnqName] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqEmail, setEnqEmail] = useState('');
  const [enqMessage, setEnqMessage] = useState(`Hi, I am interested in your ${car.year} ${car.title || `${car.make} ${car.model}`}. Please get in touch with me with details.`);
  const [submitting, setSubmitting] = useState(false);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
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

  // Hidden UTM tracking parameters for lead source attribution
  const [utmSource] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('utm_source') || car.dealerId || 'direct';
  });
  const [utmMedium] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('utm_medium') || 'vehicle_listing_card';
  });
  const [utmCampaign] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('utm_campaign') || 'bazar360_marketplace';
  });

  const imagesList = car.images && car.images.length > 0 
    ? car.images 
    : [
        car.imageUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600'
      ];

  const displayImage = imagesList[0];

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || url.includes('/video/upload/') || url.includes('video');
  };

  // Determine car status based on existing fields and status field
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

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const leadData = {
        customerId: currentUser?.uid || 'guest',
        userName: enqName,
        userPhone: enqPhone,
        userEmail: enqEmail || 'visitor@bazar360.online',
        vehicleId: car.id,
        showroomOwnerId: car.dealerId || dealer?.id || 'auto-choice-peshawar',
        inquiryMessage: enqMessage,
        inquiryDate: new Date().toISOString(),
        status: 'New' as const,
        vehicleTitle: car.title || `${car.make} ${car.model} ${car.year}`,
        vehiclePrice: car.price,
        vehicleImage: displayImage,
        type: 'Car Inquiry',
        title: `Inquiry on ${car.title}`,
        metadata: {
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          referer: typeof document !== 'undefined' ? document.referrer : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
        }
      };
      
      await dbSubmitLead(leadData);
      dbTrackShowroomEvent(leadData.showroomOwnerId, 'lead', leadData.vehicleId, leadData.vehicleTitle).catch(() => {});
      alert('Your inquiry was submitted successfully! The showroom advisor has been notified and will contact you shortly.');
      setIsEnquiryOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to submit inquiry. Please retry or contact the advisor directly via the hotline.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        id={`vehicle-listing-${car.id}`}
        onClick={() => onSelect(car)}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          duration: 0.45,
          ease: [0.16, 1, 0.3, 1],
          delay: Math.min(index * 0.05, 0.35)
        }}
        whileHover={{ 
          y: -6, 
          scale: 1.015,
          transition: { type: 'spring', stiffness: 300, damping: 20 } 
        }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex flex-col bg-bg-primary/45 dark:bg-bg-primary/45 backdrop-blur-[16px] -webkit-backdrop-blur-[16px] rounded-3xl overflow-hidden cursor-pointer border border-white/10 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-orange-500/50 hover:shadow-[0_20px_45px_rgba(249,115,22,0.18)]"
      >
        {/* 1. HERO MEDIA CANVAS - Fills top section */}
        <div 
          className="relative w-full aspect-[16/10] overflow-hidden bg-[var(--color-bg-primary)] touch-pan-y"
          onClick={(e) => {
            // Prevent navigating when clicking on controls
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
                      width: 800,
                      height: 500,
                      crop: 'fill',
                      quality: 'auto',
                      format: 'auto',
                      watermark: false
                    })}
                    alt={car.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Interactive Image Carousel controls on hover */}
          {imagesList.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  swiperRef.current?.swiper?.slidePrev();
                }}
                className="custom-swiper-btn absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[var(--color-accent-main)] text-[var(--color-text-header)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 shadow-md active:scale-90 border border-white/20 cursor-pointer"
                title="Previous image"
              >
                <ChevronLeft size={16} className="stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  swiperRef.current?.swiper?.slideNext();
                }}
                className="custom-swiper-btn absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[var(--color-accent-main)] text-[var(--color-text-header)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 shadow-md active:scale-90 border border-white/20 cursor-pointer"
                title="Next image"
              >
                <ChevronRight size={16} className="stroke-[2.5]" />
              </button>
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />

          {/* Dynamic Sold Overlay on image */}
          {status === 'Sold' && (
            <div className="absolute inset-0 bg-black/40 backdrop-grayscale-[40%] pointer-events-none z-15 flex items-center justify-center">
              <div className="bg-rose-600/90 text-[var(--color-text-header)] font-black text-xs uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border border-rose-400/40 shadow-2xl rotate-[-6deg] backdrop-blur-sm">
                Vehicle Sold
              </div>
            </div>
          )}

          {/* Condition & Validation Overlays */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 text-left items-start select-none">
            {car.verified && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVerifyModalOpen(true);
                }}
                className="bg-[var(--color-accent-main)] hover:bg-emerald-600 border border-[var(--color-accent-main)]/25 text-[var(--color-text-header)] text-[9px] font-sans font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full shadow-md flex items-center gap-1 cursor-pointer animate-pulse"
                title="Bazar360 Verified. Click to view detailed inspection report."
              >
                <ShieldCheck size={10} className="stroke-[3.5]" />
                <span>Verified</span>
              </button>
            )}
            {status === 'Sold' ? (
              <span className="bg-rose-600 text-[var(--color-text-header)] text-[9px] font-sans font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg border border-rose-400/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Sold
              </span>
            ) : status === 'Reserved' ? (
              <span className="bg-amber-500 text-[var(--color-text-header)] text-[9px] font-sans font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg border border-amber-300/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Reserved
              </span>
            ) : (
              <span className="bg-emerald-600 text-[var(--color-text-header)] text-[9px] font-sans font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg border border-[var(--color-accent-main)]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />
                Available
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.85 }}
              type="button"
              onClick={handleShare}
              className={`p-2 rounded-full shadow-lg transition-all cursor-pointer border backdrop-blur-md ${
                copied
                  ? 'bg-[var(--color-accent-main)] text-[var(--color-text-header)] border-[var(--color-accent-main)]'
                  : 'bg-black/60 text-[var(--color-text-header)] hover:bg-orange-500 hover:text-slate-950 border-white/20'
              }`}
              title={copied ? 'Link Copied!' : 'Share Vehicle Link'}
            >
              {copied ? <Check size={12} className="stroke-[3] animate-bounce" /> : <Share2 size={12} className="stroke-[2.5]" />}
            </motion.button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const activeIndex = swiperRef.current?.swiper?.activeIndex || 0;
                setLightboxIndex(activeIndex);
                setIsLightboxOpen(true);
              }}
              className="p-2 bg-black/60 hover:bg-orange-500 hover:text-slate-950 text-[var(--color-text-header)] rounded-full shadow-lg active:scale-90 transition-all cursor-pointer border border-white/20 backdrop-blur-md"
              title="Click to magnify / pinch-to-zoom vehicle images"
            >
              <Maximize2 size={12} className="stroke-[2.5]" />
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(car);
                }}
                className="p-2 bg-rose-600 hover:bg-rose-700 text-[var(--color-text-header)] rounded-full shadow-lg active:scale-90 transition-all cursor-pointer border border-white/10"
                title="Delete vehicle listing"
              >
                <Trash size={12} className="stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Model Year Stamp */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold text-[var(--color-text-header)] tracking-widest z-20">
            {car.year}
          </div>
        </div>

        {/* 2. PRIMARY FACE INFO - Bottom Details Section */}
        <div className="p-3 sm:p-4 flex flex-col justify-between flex-grow bg-[var(--color-bg-secondary)] z-30">
          <div>
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-[9px] font-black uppercase text-[var(--color-accent-main)] tracking-[0.2em] block leading-none">{car.make || 'PREMIUM'}</span>
                <h3 className="text-xs sm:text-base font-black text-[var(--color-text-main)] mt-1 leading-tight line-clamp-1">
                  {car.title}
                </h3>
              </div>
            </div>
            <p className="text-[9px] sm:text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5 sm:mt-1 truncate">
              {car.transmission} • {car.fuelType}
            </p>

            {/* Specs Mini-Grid */}
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1 mt-2 sm:mt-3 py-1.5 sm:py-2 border-y border-[var(--color-border-main)] text-center">
              <div className="flex flex-col items-center justify-center">
                <Zap size={10} className="text-amber-500 mb-0.5" />
                <span className="text-[8px] sm:text-[9px] font-bold text-[var(--color-text-main)] leading-none truncate">
                  {car.specs?.horspower || (car.engineCC && car.engineCC > 2000 ? '280 HP' : '150 HP')}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center border-x border-[var(--color-border-main)]">
                <Gauge size={10} className="text-orange-500 mb-0.5" />
                <span className="text-[8px] sm:text-[9px] font-bold text-[var(--color-text-main)] leading-none truncate">
                  {car.topSpeed || (car.engineCC && car.engineCC > 2000 ? '240 km/h' : '190 km/h')}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Flame size={10} className="text-rose-500 mb-0.5" />
                <span className="text-[8px] sm:text-[9px] font-bold text-[var(--color-text-main)] leading-none truncate">
                  {car.acceleration || (car.engineCC && car.engineCC > 2000 ? '5.4s' : '9.2s')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 sm:pt-3 flex items-center justify-between mt-auto gap-1">
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs sm:text-[15px] font-black text-[var(--color-accent-main)] font-sans leading-none whitespace-nowrap truncate">
                {renderPrice(car.price)}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEnquiryOpen(true);
                }}
                className="bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-hover)] text-[var(--color-text-header)] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-500/20 cursor-pointer flex items-center gap-0.5 sm:gap-1 shrink-0"
              >
                <span>Enquire</span>
                <Mail size={10} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enquiry Modal */}
      <AnimatePresence>
        {isEnquiryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnquiryOpen(false)}
              className="fixed inset-0 bg-bg-primary/85 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className={`relative rounded-3xl w-full max-w-lg p-6 sm:p-8 overflow-hidden shadow-2xl z-10 text-left border ${
                (theme as string) === 'dark'
                  ? 'bg-[var(--color-bg-secondary)] border-white/10 text-[var(--color-text-header)]'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-red-600" />
              
              <button
                onClick={() => setIsEnquiryOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-[var(--color-text-header)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-orange-500">Direct Advisor Desk</span>
                  <h3 className="text-xl font-black tracking-tight font-display">Vehicle Inquiry</h3>
                  <p className="text-xs text-text-muted font-medium">Please submit your details below to request a callback or official showroom pricing.</p>
                </div>

                {/* Micro vehicle snippet inside modal */}
                <div className="flex gap-4 p-3 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <img 
                    src={displayImage} 
                    alt={car.title} 
                    className="w-20 h-16 object-cover rounded-xl shrink-0 border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col justify-center text-left">
                    <span className="text-[10px] font-mono text-text-muted uppercase font-black">{car.year} Model</span>
                    <h4 className="text-sm font-extrabold tracking-tight line-clamp-1">{car.title}</h4>
                    <span className="text-orange-500 font-black text-xs font-mono mt-0.5">{renderPrice(car.price)}</span>
                  </div>
                </div>

                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  {/* Hidden UTM tracking fields for lead source attribution */}
                  <input type="hidden" name="utm_source" value={utmSource} />
                  <input type="hidden" name="utm_medium" value={utmMedium} />
                  <input type="hidden" name="utm_campaign" value={utmCampaign} />
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Your Full Name</label>
                    <div className="relative flex items-center bg-slate-100/50 dark:bg-bg-primary/40 border border-slate-200 dark:border-white/10 rounded-xl focus-within:border-orange-500/50 transition-all">
                      <User size={14} className="absolute left-3.5 text-text-muted" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Malak Mazhar"
                        value={enqName}
                        onChange={(e) => setEnqName(e.target.value)}
                        className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs focus:outline-none placeholder-slate-400 font-medium text-slate-900 dark:text-[var(--color-text-header)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">WhatsApp or Phone Number</label>
                    <div className="relative flex items-center bg-slate-100/50 dark:bg-bg-primary/40 border border-slate-200 dark:border-white/10 rounded-xl focus-within:border-orange-500/50 transition-all">
                      <Phone size={14} className="absolute left-3.5 text-text-muted" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 03159085086"
                        value={enqPhone}
                        onChange={(e) => setEnqPhone(e.target.value)}
                        className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs focus:outline-none placeholder-slate-400 font-medium text-slate-900 dark:text-[var(--color-text-header)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Email Address (Optional)</label>
                    <div className="relative flex items-center bg-slate-100/50 dark:bg-bg-primary/40 border border-slate-200 dark:border-white/10 rounded-xl focus-within:border-orange-500/50 transition-all">
                      <Mail size={14} className="absolute left-3.5 text-text-muted" />
                      <input
                        type="email"
                        placeholder="e.g. buyer@example.com"
                        value={enqEmail}
                        onChange={(e) => setEnqEmail(e.target.value)}
                        className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs focus:outline-none placeholder-slate-400 font-medium text-slate-900 dark:text-[var(--color-text-header)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Inquiry Message</label>
                    <div className="relative flex items-start bg-slate-100/50 dark:bg-bg-primary/40 border border-slate-200 dark:border-white/10 rounded-xl focus-within:border-orange-500/50 transition-all p-2">
                      <MessageSquare size={14} className="mt-1 mr-2 text-text-muted shrink-0" />
                      <textarea
                        required
                        rows={3}
                        value={enqMessage}
                        onChange={(e) => setEnqMessage(e.target.value)}
                        className="w-full bg-transparent py-1 text-xs focus:outline-none placeholder-slate-400 font-medium text-slate-900 dark:text-[var(--color-text-header)] resize-none"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-[var(--color-text-header)] font-black py-3 px-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                      <>
                        <Mail size={12} className="stroke-[2.5]" />
                        <span>Submit Inquiry</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
        title={`${car.year} ${car.make} ${car.model}`}
      />
    </>
  );
}
