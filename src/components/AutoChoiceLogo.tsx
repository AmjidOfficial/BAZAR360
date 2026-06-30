import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function AutoChoiceLogo({ className = '', showText = true }: LogoProps) {
  const [imgSrc, setImgSrc] = useState('/auto_choice_logo_1781509565476.png');
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (imgSrc === '/auto_choice_logo_1781509565476.png') {
      // Try jpg format as fallback first
      setImgSrc('/auto_choice_logo_1781509565476.jpg');
    } else {
      // If both fail, trigger the text fallback
      setHasError(true);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`} id="auto-choice-logo">
      {/* Luxury Gold & Deep Blue Crest */}
      <div className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center">
        {/* Soft Golden Pulsing Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 opacity-20 animate-pulse blur-[1px]" />
        
        {/* Logo Image Wrapper */}
        <div className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-amber-500/40 shadow-md overflow-hidden p-0.5">
          {!hasError ? (
            <img 
              src={imgSrc} 
              alt="Auto Choice Flagship" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0b0f19]">
              <span className="text-[10px] font-black text-amber-500 font-mono">AC</span>
            </div>
          )}
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-left font-sans">
          <span className="text-[14px] font-black text-[var(--color-text-main)] uppercase tracking-wider leading-none">
            Auto <span className="text-amber-500 font-black">Choice</span>
          </span>
          <span className="text-[7.5px] font-black text-orange-500 tracking-widest uppercase mt-1 leading-none">
            FLAGSHIP SHOWROOM
          </span>
        </div>
      )}
    </div>
  );
}
