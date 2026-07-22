import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface LightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function Lightbox({ images, initialIndex, isOpen, onClose, title }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  
  // Swipe & Touch state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const startDistance = useRef<number | null>(null);
  const startScale = useRef<number>(1);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setRotation(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  // Keybindings for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images]);

  const handleNext = () => {
    setScale(1);
    setRotation(0);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setScale(1);
    setRotation(0);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Pinch-to-zoom logic
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2 fingers pinch
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      startDistance.current = dist;
      startScale.current = scale;
      setIsZooming(true);
    } else if (e.touches.length === 1) {
      // 1 finger swipe
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && startDistance.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / startDistance.current;
      const newScale = Math.max(1, Math.min(4, startScale.current * ratio));
      setScale(newScale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setIsZooming(false);
      startDistance.current = null;
    }

    if (e.touches.length === 0 && touchStartX.current !== null && !isZooming && scale === 1) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = touchStartX.current - endX;
      const diffY = touchStartY.current - endY;

      // Ensure it's mostly a horizontal swipe
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
        if (diffX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
      touchStartX.current = null;
      touchStartY.current = null;
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none touch-none overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Header Control Bar */}
        <div className="relative z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="text-left">
            {title && (
              <h4 className="text-sm font-black text-white uppercase tracking-wider line-clamp-1">
                {title}
              </h4>
            )}
            <p className="text-[10px] font-mono font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
              Image {currentIndex + 1} of {images.length}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRotate}
              className="p-2.5 bg-white/5 hover:bg-white/10 active:scale-95 text-white/80 hover:text-white rounded-full transition-all cursor-pointer"
              title="Rotate Image"
            >
              <RotateCw size={16} />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-2.5 bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white/80 hover:text-white rounded-full transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="p-2.5 bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white/80 hover:text-white rounded-full transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 rounded-full transition-all cursor-pointer ml-2 shadow-lg shadow-orange-500/20"
              title="Close Gallery"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Center Active Image Stage */}
        <div className="relative flex-grow flex items-center justify-center p-4">
          {/* Back Navigation Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 z-50 p-3 bg-black/40 hover:bg-black/70 active:scale-95 border border-white/5 text-white/80 hover:text-white rounded-full transition-all cursor-pointer hidden sm:block"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Main Visual Image Element */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <motion.img
              ref={imageRef}
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Active View - Image ${currentIndex + 1}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ 
                scale: scale, 
                opacity: 1, 
                rotate: rotation,
                transition: { type: 'spring', stiffness: 300, damping: 25 } 
              }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
              className="pointer-events-none shadow-2xl rounded-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Next Navigation Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 z-50 p-3 bg-black/40 hover:bg-black/70 active:scale-95 border border-white/5 text-white/80 hover:text-white rounded-full transition-all cursor-pointer hidden sm:block"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Bottom Thumbnail Strip Indicator */}
        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-3">
          <div className="flex gap-2.5 overflow-x-auto pb-1 mx-auto max-w-full no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setScale(1);
                  setRotation(0);
                  setCurrentIndex(idx);
                }}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer relative ${
                  currentIndex === idx 
                    ? 'border-orange-500 scale-105 shadow-md shadow-orange-500/20' 
                    : 'border-white/10 hover:border-white/40'
                }`}
              >
                <img 
                  src={img} 
                  alt={`Thumb ${idx + 1}`} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
          
          <div className="text-center text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest sm:hidden">
            ← Swipe to Navigate • Pinch to Zoom →
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
