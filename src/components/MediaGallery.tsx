import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Images, Video, Trash, Plus, Image as ImageIcon, Play, Volume2, Maximize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LazyImage } from './LazyImage';

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
    <div 
      ref={cardRef} 
      className="break-inside-avoid relative group rounded-2xl overflow-hidden border border-[var(--color-border-main)] shadow-md bg-slate-900/40 min-h-[220px]"
    >
      {isVisible ? (
        <>
          {isVideoUrl(url) ? (
            <div className="aspect-video flex items-center justify-center bg-black relative">
              <Video size={32} className="text-white/20" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={40} className="text-white fill-white" />
              </div>
            </div>
          ) : (
            <LazyImage 
              src={url} 
              alt={`Gallery Asset ${idx + 1}`} 
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
              onClick={() => onSelect(url)}
              width={640}
              height={480}
            />
          )}

          {/* Asset Labels */}
          <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/20 rounded text-[8px] font-mono font-black uppercase tracking-widest text-white">
              {isVideoUrl(url) ? '4K Video' : 'HQ Photo'}
            </span>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <button
              onClick={() => onRemove(idx)}
              className="absolute top-4 right-4 p-2 bg-rose-500/90 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600 active:scale-95 cursor-pointer"
            >
              <Trash size={14} />
            </button>
          )}
        </>
      ) : (
        <div className="w-full h-56 bg-[var(--color-bg-secondary)]/30 animate-pulse" />
      )}
    </div>
  );
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ media, isOwner, onAddMedia, onRemoveMedia }) => {
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    onAddMedia(newUrl.trim());
    setNewUrl('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-black text-[var(--color-text-main)] font-display uppercase tracking-widest flex items-center gap-2">
            <Images size={16} className="text-orange-500" /> Showroom Media Hub
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] font-sans">High-resolution walkarounds and gallery snapshots.</p>
        </div>
        
        {isOwner && (
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Media URL..."
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 font-mono w-48 md:w-64"
            />
            <button
              onClick={handleAdd}
              className="p-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
              title="Add Media Asset"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
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
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-1.5 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider text-white flex items-center gap-1.5 z-20">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span>Showroom Walkaround Video</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative cursor-pointer">
                      <img
                        src={url}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-6 left-6 text-left space-y-1 z-10">
                        <span className="px-2 py-0.5 bg-orange-500 text-slate-950 font-mono font-black text-[8px] uppercase tracking-widest rounded-md">
                          Delivery Journal & Update
                        </span>
                        <h4 className="text-sm md:text-base font-black text-white uppercase tracking-tight">Verified Media Update #{idx + 1}</h4>
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
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        <AnimatePresence>
          {media.map((url, idx) => (
            <motion.div
              key={`${url}-${idx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
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
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-orange-500 opacity-50" />
            <p className="font-bold text-[var(--color-text-main)]">No media assets in gallery.</p>
            <p className="text-xs mt-1">Upload cinematic walkarounds and professional snapshots to engage buyers.</p>
          </div>
        )}
      </div>

      {/* Media Modal (Lightbox) */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedMedia} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
            <button 
              className="absolute top-8 right-8 p-4 text-white hover:text-orange-500 transition-colors"
              onClick={() => setSelectedMedia(null)}
            >
              <Plus size={32} className="rotate-45" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
