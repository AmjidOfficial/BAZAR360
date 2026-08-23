import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

import { uploadToCloudinary } from '../lib/cloudinaryService';

interface ShowroomGalleryProps {
  dealerId?: string;
  images?: string[];
  onUpload?: (file: File) => void;
  isUploading?: boolean;
}

export function ShowroomGallery({ dealerId = 'auto-choice-peshawar', images: initialImages, onUpload, isUploading }: ShowroomGalleryProps) {
  const [images, setImages] = useState<string[]>(initialImages || [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200'
  ]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const q = query(collection(db, 'showroomGallery'), where('dealerId', '==', dealerId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const fetched = snap.docs
            .map(doc => doc.data().imageUrl)
            .filter(url => url && typeof url === 'string' && !url.startsWith('data:image'));
          if (fetched.length > 0) {
            setImages(fetched);
          }
        }
      } catch (err) {
        console.warn('Showroom gallery fetch fallback:', err);
      }
    }
    fetchGallery();
  }, [dealerId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onUpload) {
      onUpload(file);
      return;
    }

    setUploading(true);
    try {
      const res = await uploadToCloudinary(file, {
        compress: true,
        maxDim: 1920,
        quality: 0.88,
        folder: 'bazar360/gallery'
      });

      const cloudinaryUrl = res.secure_url || res.url;
      if (!cloudinaryUrl || cloudinaryUrl.startsWith('data:image')) {
        toast.error('Base64 image data cannot be stored in database. Please upload an image file using the Cloudinary upload button');
        return;
      }

      await addDoc(collection(db, 'showroomGallery'), {
        dealerId,
        imageUrl: cloudinaryUrl,
        createdAt: new Date().toISOString()
      });
      setImages(prev => [cloudinaryUrl, ...prev]);
      toast.success('Premises photo uploaded successfully!');
    } catch (err: any) {
      console.error('Gallery Cloudinary upload error:', err);
      toast.error(err?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const nextSlide = () => {
    setActiveIdx(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIdx(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-80 sm:h-96 bg-bg-primary rounded-2xl overflow-hidden shadow-2xl border border-border-main group">
      <AnimatePresence mode="wait">
        {images.length > 0 ? (
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={images[activeIdx]} 
              alt="Showroom Gallery" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2">
            <ImageIcon size={36} className="text-orange-500 animate-pulse" />
            <p className="text-xs font-mono">No physical showroom premises photos uploaded yet.</p>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-bg-secondary/80 hover:bg-orange-500 text-[var(--color-text-header)] rounded-full transition-all backdrop-blur-md shadow-lg border border-border-main cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-bg-secondary/80 hover:bg-orange-500 text-[var(--color-text-header)] rounded-full transition-all backdrop-blur-md shadow-lg border border-border-main cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-bg-primary/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-border-main">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === activeIdx ? 'bg-orange-500 w-6' : 'bg-slate-600 hover:bg-slate-400'}`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Upload trigger overlay */}
      <div className="absolute top-4 right-4 z-10">
        <label className="cursor-pointer px-3.5 py-2 bg-bg-secondary/90 hover:bg-orange-500 text-text-main hover:text-[var(--color-text-header)] rounded-xl shadow-xl transition-all border border-border-main flex items-center gap-2 text-xs font-mono font-bold backdrop-blur-md">
          <Upload size={14} className="text-orange-400" />
          <span>{uploading || isUploading ? 'Uploading...' : 'Add Photo'}</span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
            disabled={uploading || isUploading}
          />
        </label>
      </div>

      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="px-3 py-1 bg-bg-primary/70 text-[10px] font-mono text-orange-400 rounded-lg border border-orange-500/30 backdrop-blur-md flex items-center gap-1.5">
          <Sparkles size={11} />
          <span>Showroom Premises Live Feed</span>
        </span>
      </div>
    </div>
  );
}

