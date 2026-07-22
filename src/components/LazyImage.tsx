import React, { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onClick?: () => void;
}

export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  referrerPolicy = 'no-referrer',
  onClick
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  // Parse numeric dimensions or default to fill
  const style: React.CSSProperties = {
    aspectRatio: width && height ? `${width} / ${height}` : undefined,
  };

  return (
    <div 
      className={`relative overflow-hidden bg-[#F9FAFB]/50 ${className}`} 
      style={style}
      id={`lazy-image-${Math.random().toString(36).substring(2, 9)}`}
    >
      {/* CSS-based pulse placeholder matching official Bazar360 brand colors */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-[#161D6F]/10 via-[#98DED9]/10 to-[#FF6B00]/10 animate-pulse">
          {/* Subtle interlocked brand watermark */}
          <div className="w-8 h-8 opacity-20 border-2 border-t-[#FF6B00] border-r-[#161D6F] border-b-[#98DED9] rounded-full animate-spin" />
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        // @ts-ignore
        fetchPriority={priority ? 'high' : undefined}
        referrerPolicy={referrerPolicy}
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        className={`w-full h-full object-cover transition-all duration-700 ${
          loaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-95 blur-sm'
        }`}
      />
    </div>
  );
}
export default LazyImage;
