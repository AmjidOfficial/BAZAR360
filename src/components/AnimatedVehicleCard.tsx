'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Lightbox } from './Lightbox';

export interface AnimatedVehicleCardProps {
  children?: React.ReactNode;
  car?: any;
  images?: string[];
  title?: string;
  index?: number;
  className?: string;
  onSelect?: (car?: any) => void;
  onImageClick?: (images: string[], initialIndex?: number) => void;
}

export function AnimatedVehicleCard({
  children,
  car,
  images,
  title,
  index = 0,
  className = '',
  onSelect,
  onImageClick,
}: AnimatedVehicleCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Extract all available vehicle images for the lightbox gallery
  const galleryImages = useMemo(() => {
    if (images && images.length > 0) return images;
    if (car?.images && Array.isArray(car.images) && car.images.length > 0) {
      return car.images;
    }
    if (car?.imageUrl) return [car.imageUrl];
    if (car?.image) return [car.image];
    return [];
  }, [images, car]);

  const galleryTitle = title || car?.title || `${car?.make || ''} ${car?.model || ''}`.trim() || 'Vehicle Photos';

  const handleOpenLightbox = (indexToOpen: number = 0, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (onImageClick && galleryImages.length > 0) {
      onImageClick(galleryImages, indexToOpen);
    }
    if (galleryImages.length > 0) {
      setActiveImageIndex(indexToOpen);
      setIsLightboxOpen(true);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Check if the clicked target is an image or specifically marked as a lightbox trigger
    const isImageElement = target.closest('[data-lightbox-trigger="true"]') || target.tagName.toLowerCase() === 'img' || target.closest('.lightbox-trigger');
    
    if (isImageElement && galleryImages.length > 0) {
      e.stopPropagation();
      handleOpenLightbox(0, e);
    } else if (onSelect) {
      onSelect(car);
    }
  };

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 32, scale: 0.96 },
          show: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 140,
              damping: 18
            }
          }
        }}
        whileHover={{ 
          y: -12, 
          rotateX: 4,
          rotateY: -3,
          scale: 1.025,
          boxShadow: '0 25px 50px -12px rgba(249, 115, 22, 0.25), 0 15px 35px -10px rgba(0, 0, 0, 0.5)',
          transition: { type: 'spring', stiffness: 380, damping: 22 }
        }}
        whileTap={{ scale: 0.985 }}
        style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
        onClick={handleCardClick}
        className={`w-full group/animated-card transition-all duration-300 ${className}`}
      >
        {children}
      </motion.div>

      {/* High-Resolution Gallery Lightbox Modal */}
      {galleryImages.length > 0 && (
        <Lightbox
          images={galleryImages}
          initialIndex={activeImageIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          title={galleryTitle}
        />
      )}
    </>
  );
}

