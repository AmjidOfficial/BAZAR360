import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';

interface ShowroomGalleryProps {
  images: string[];
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function ShowroomGallery({ images, onUpload, isUploading }: ShowroomGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden group">
      {/* Carousel */}
      {images.length > 0 ? (
        <>
          <img 
            src={images[activeIdx]} 
            alt="Showroom" 
            className="w-full h-full object-cover" 
            loading="lazy"
            width={800}
            height={256}
          />
          {images.length > 1 && (
            <>
              <button 
                onClick={() => setActiveIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <ChevronLeft />
              </button>
              <button 
                onClick={() => setActiveIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <ChevronRight />
              </button>
            </>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500">No images</div>
      )}

      {/* Upload trigger */}
      <div className="absolute top-4 right-4">
        <label className="cursor-pointer p-2 bg-white rounded-full shadow-lg hover:bg-slate-100">
          <Upload size={20} className="text-orange-500" />
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => e.target.files && onUpload(e.target.files[0])} 
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}
