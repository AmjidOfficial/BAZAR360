import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Images, Video, Trash, Plus, Image as ImageIcon, Play, Volume2, Maximize2, Upload, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LazyImage } from './LazyImage';
import { uploadToCloudinary, getOptimizedUrl } from '../lib/cloudinaryService';

// Swiper integration
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface MediaGalleryProps {
  media: string[];
  isOwner: boolean;
  onAddMedia: (url: string) => void;
  onRemoveMedia: (index: number) => void;
}

const isVideoUrl = (urlStr: string) => {
  return urlStr.match(/\.(mp4|webm|ogg|mov)$|cloudinary.*video/) || urlStr.includes('youtube.com') || urlStr.includes('vimeo.com') || urlStr.includes('video');
};

// Highly optimized virtualization card for media assets
function VirtualizedMediaCard({ 
  url, 
  idx, 
  isOwner, 
  onRemove, 
  onSelect 
}: { 
  url: string; 
  idx: number; 
  isOwner: boolean; 
  onRemove: (idx: number) => void; 
  onSelect: (url: string) => void 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '400px 0px', // Preload assets 400px before they enter view
        threshold: 0,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.div 
      ref={cardRef} 
      whileHover={{ 
        scale: 1.03,
        borderColor: "var(--color-accent-main)",
        boxShadow: "0 10px 30px -10px rgba(212, 175, 55, 0.25)"
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="break-inside-avoid relative group rounded-2xl overflow-hidden border border-[var(--color-border-main)] shadow-md bg-bg-secondary/40 min-h-[220px]"
    >
      {isVisible ? (
        <>
          {isVideoUrl(url) ? (
            <div className="aspect-video flex items-center justify-center bg-black relative cursor-pointer" onClick={() => onSelect(url)}>
              <Video size={32} className="text-[var(--color-text-header)]/20" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={40} className="text-[var(--color-text-header)] fill-white" />
              </div>
            </div>
          ) : (
            <div className="overflow-hidden w-full h-full cursor-pointer" onClick={() => onSelect(url)}>
              <LazyImage 
                src={getOptimizedUrl(url, { width: 640, height: 480, quality: 'auto' })} 
                alt={`Gallery Asset ${idx + 1}`} 
                className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                width={640}
                height={480}
              />
            </div>
          )}

          {/* High-end Backdrop Blur & Gradient overlay on Hover */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none flex flex-col justify-end p-4 bg-gradient-to-t from-[#050505]/95 via-[#050505]/40 to-transparent" />

          {/* Asset Labels & Captions */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-10">
            <span className="text-[10px] font-mono font-black text-[var(--color-accent-main)] uppercase tracking-widest">
              {isVideoUrl(url) ? 'Cinema Walkaround' : 'Showroom Asset'}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-[var(--color-text-header)] uppercase tracking-tight">
                {isVideoUrl(url) ? `Walkthrough Video #${idx + 1}` : `Physical Floor Photo #${idx + 1}`}
              </span>
              <span className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[8px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-header)]">
                {isVideoUrl(url) ? 'MP4' : 'JPEG'}
              </span>
            </div>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <button
              onClick={() => onRemove(idx)}
              className="absolute top-4 right-4 p-2 bg-rose-500/90 text-[var(--color-text-header)] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600 active:scale-95 cursor-pointer z-10"
            >
              <Trash size={14} />
            </button>
          )}
        </>
      ) : (
        <div className="w-full h-56 bg-[var(--color-bg-secondary)]/30 animate-pulse" />
      )}
    </motion.div>
  );
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ media, isOwner, onAddMedia, onRemoveMedia }) => {
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isAutoSlideGrid, setIsAutoSlideGrid] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    onAddMedia(newUrl.trim());
    setNewUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Only images and videos are allowed in the gallery.');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading media to Cloudinary...');
    try {
      console.log('[MediaGallery] Uploading file to Cloudinary:', file.name);
      const res = await uploadToCloudinary(file, {
        folder: 'bazar360_showroom_gallery',
        maxSizeKB: file.type.startsWith('video/') ? 10240 : 1024
      });
      
      console.log('[MediaGallery] Cloudinary upload success, url:', res.secure_url);
      if (res.secure_url) {
        onAddMedia(res.secure_url);
        toast.success('Successfully uploaded and added to showroom gallery!', { id: toastId });
      } else {
        throw new Error('Cloudinary response did not return secure_url');
      }
    } catch (err: any) {
      console.error('[MediaGallery] Cloudinary upload failed:', err);
      toast.error(err?.message || 'Failed to upload file to Cloudinary.', { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border-main)] pb-4">
        <div className="space-y-1">
          <h3 className="text-base font-black text-[var(--color-text-main)] font-display uppercase tracking-widest flex items-center gap-2">
            <Images size={16} className="text-[var(--color-accent-main)]" /> Showroom Media Hub
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] font-sans">High-resolution walkarounds and gallery snapshots.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          {/* Auto-Slide Grid Mode Toggle */}
          <button
            onClick={() => setIsAutoSlideGrid(!isAutoSlideGrid)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
              isAutoSlideGrid
                ? 'bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border-[var(--color-accent-main)]/30'
                : 'bg-white/5 border-white/10 text-[var(--color-text-muted)]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAutoSlideGrid ? 'bg-[var(--color-accent-main)] animate-pulse' : 'bg-gray-500'}`} />
            <span>Auto-Slide Grid: {isAutoSlideGrid ? 'ON' : 'OFF'}</span>
          </button>

          {isOwner && (
            <div className="flex gap-2 items-center">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-2.5 bg-bg-tertiary hover:bg-slate-700 text-[var(--color-text-header)] rounded-xl border border-border-main shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center disabled:opacity-50"
                title="Upload file directly to Cloudinary"
              >
                {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              </button>
              <input 
                type="text" 
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Media URL..."
                className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent-main)]/50 font-mono w-32 md:w-48"
              />
              <button
                onClick={handleAdd}
                className="p-2.5 bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-hover)] text-[#030712] rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                title="Add manual URL"
              >
                <Plus size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1. HIGH-PERFORMANCE MULTIMEDIA SWIPING CAROUSEL */}
      {media.length > 0 && (
        <div className="w-full rounded-3xl overflow-hidden border border-[var(--color-border-main)] shadow-xl bg-black relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9]">
          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className="w-full h-full"
          >
            {media.map((url, idx) => {
              const isVid = isVideoUrl(url);
              return (
                <SwiperSlide key={`swiper-slide-${idx}`} className="w-full h-full relative" onClick={() => !isVid && setSelectedMedia(url)}>
                  {isVid ? (
                    <div className="w-full h-full bg-black relative flex items-center justify-center">
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        controls
                        muted
                        playsInline
                        loop
                      />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-1.5 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider text-[var(--color-text-header)] flex items-center gap-1.5 z-20">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span>Showroom Walkaround Video</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative cursor-pointer">
                      <img
                        src={getOptimizedUrl(url, { width: 1200, height: 600, quality: 'auto:best' })}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-6 left-6 text-left space-y-1 z-10">
                        <span className="px-2 py-0.5 bg-[var(--color-accent-main)] text-slate-950 font-mono font-black text-[8px] uppercase tracking-widest rounded-md">
                          Delivery Journal & Update
                        </span>
                        <h4 className="text-sm md:text-base font-black text-[var(--color-text-header)] uppercase tracking-tight">Verified Media Update #{idx + 1}</h4>
                      </div>
                    </div>
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}

      {/* 2. GALLERY THUMBNAIL/MASONRY FEED */}
      {isAutoSlideGrid && media.length > 0 ? (
        <div className="w-full relative py-4 group/carousel select-none">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            loop={media.length > 3}
            speed={1200}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            className="w-full pb-12 media-auto-swiper"
          >
            {media.map((url, idx) => (
              <SwiperSlide key={`auto-grid-slide-${idx}`} className="h-full">
                <div className="p-1">
                  <VirtualizedMediaCard 
                    url={url}
                    idx={idx}
                    isOwner={isOwner}
                    onRemove={onRemoveMedia}
                    onSelect={setSelectedMedia}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {media.map((url, idx) => (
              <motion.div
                key={`${url}-${idx}`}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  show: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1, 
                    transition: { 
                      type: 'spring', 
                      stiffness: 140, 
                      damping: 16 
                    } 
                  },
                  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.25 } }
                }}
              >
                <VirtualizedMediaCard 
                  url={url}
                  idx={idx}
                  isOwner={isOwner}
                  onRemove={onRemoveMedia}
                  onSelect={setSelectedMedia}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {media.length === 0 && (
            <div className="col-span-full py-24 text-center text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border-main)] rounded-3xl bg-[var(--color-bg-secondary)]/50">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-[var(--color-accent-main)] opacity-50" />
              <p className="font-bold text-[var(--color-text-main)]">No media assets in gallery.</p>
              <p className="text-xs mt-1">Upload cinematic walkarounds and professional snapshots to engage buyers.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Media Modal (Lightbox) */}
      {(() => {
        const activeIndex = selectedMedia ? media.indexOf(selectedMedia) : -1;
        const currentUrl = activeIndex !== -1 ? media[activeIndex] : null;
        const isVid = currentUrl ? isVideoUrl(currentUrl) : false;

        const handlePrev = (e?: React.MouseEvent) => {
          if (e) e.stopPropagation();
          if (activeIndex > 0) {
            setSelectedMedia(media[activeIndex - 1]);
          }
        };

        const handleNext = (e?: React.MouseEvent) => {
          if (e) e.stopPropagation();
          if (activeIndex < media.length - 1) {
            setSelectedMedia(media[activeIndex + 1]);
          }
        };

        // Key bindings for keyboard navigation
        useEffect(() => {
          if (!selectedMedia) return;
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              setSelectedMedia(null);
            } else if (e.key === 'ArrowLeft') {
              if (activeIndex > 0) {
                setSelectedMedia(media[activeIndex - 1]);
              }
            } else if (e.key === 'ArrowRight') {
              if (activeIndex < media.length - 1) {
                setSelectedMedia(media[activeIndex + 1]);
              }
            }
          };
          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
        }, [selectedMedia, activeIndex]);

        return (
          <AnimatePresence>
            {selectedMedia && currentUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-8"
                onClick={() => setSelectedMedia(null)}
              >
                {/* Lightbox Header Controls */}
                <div className="w-full flex justify-between items-center z-10 max-w-7xl mx-auto px-4 select-none">
                  <div className="text-left">
                    <span className="text-[10px] font-mono font-black text-[var(--color-accent-main)] uppercase tracking-widest block">Showroom Theatre</span>
                    <h4 className="text-sm font-black text-[var(--color-text-header)] uppercase tracking-tight">
                      {isVid ? 'Cinema Walkaround Walkthrough' : 'HQ Floor Asset'}
                    </h4>
                  </div>
                  <button 
                    className="p-3 bg-white/5 border border-white/10 text-[var(--color-text-header)] hover:bg-white/15 hover:text-[var(--color-accent-main)] rounded-full transition-all cursor-pointer shadow-lg active:scale-95"
                    onClick={() => setSelectedMedia(null)}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Lightbox Center viewport */}
                <div className="flex-1 w-full flex items-center justify-between max-w-7xl mx-auto relative px-2 sm:px-16 my-4 select-none">
                  {/* Prev Arrow */}
                  {activeIndex > 0 ? (
                    <button
                      onClick={handlePrev}
                      className="absolute left-2 sm:left-4 z-10 p-4 bg-black/40 backdrop-blur-md border border-white/15 hover:border-[var(--color-accent-main)] hover:text-[var(--color-accent-main)] text-white rounded-full transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xl"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  ) : <div className="w-12 shrink-0 hidden sm:block" />}

                  {/* Active Media Frame */}
                  <div className="flex-1 max-w-full max-h-[75vh] flex items-center justify-center relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    {isVid ? (
                      <video
                        src={currentUrl}
                        className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                        controls
                        autoPlay
                        loop
                        playsInline
                      />
                    ) : (
                      <motion.img 
                        key={currentUrl}
                        initial={{ scale: 0.95, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0.8 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                        src={getOptimizedUrl(currentUrl, { width: 1920, height: 1080, quality: 'auto:best' })} 
                        alt="High Resolution Preview" 
                        className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                      />
                    )}
                  </div>

                  {/* Next Arrow */}
                  {activeIndex < media.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="absolute right-2 sm:right-4 z-10 p-4 bg-black/40 backdrop-blur-md border border-white/15 hover:border-[var(--color-accent-main)] hover:text-[var(--color-accent-main)] text-white rounded-full transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xl"
                    >
                      <ChevronRight size={24} />
                    </button>
                  ) : <div className="w-12 shrink-0 hidden sm:block" />}
                </div>

                {/* Lightbox Footer controls */}
                <div className="w-full text-center z-10 space-y-3 pb-4 select-none">
                  <div className="px-4 py-1.5 bg-white/5 border border-white/10 backdrop-blur-md rounded-full inline-flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-gray-300 font-bold">
                    <span>Asset {activeIndex + 1} of {media.length}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-main)]" />
                    <span className="text-[var(--color-accent-main)]">{isVid ? '4K MP4' : 'HQ JPEG'}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-sans">
                    Use Arrow Keys <span className="text-gray-300">←</span> or <span className="text-gray-300">→</span> to navigate • Press <span className="text-gray-300">ESC</span> to exit
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })()}
    </div>
  );
};
