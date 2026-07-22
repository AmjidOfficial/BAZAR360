import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, CheckCircle, Share2, Download, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dealer } from '../types';

interface ShowroomShareQRProps {
  isOpen: boolean;
  onClose: () => void;
  dealer: Dealer;
  accentColor?: string;
  isDark?: boolean;
}

export function ShowroomShareQR({ isOpen, onClose, dealer, accentColor = '#FF6B00', isDark = true }: ShowroomShareQRProps) {
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(200);
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate dynamic sharing link
  const cleanSlug = dealer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const shareUrl = `${window.location.origin}/showroom/${cleanSlug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svgElement = qrRef.current.querySelector('svg');
    if (!svgElement) return;

    // Convert SVG to Data URL and download
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URLObj = window.URL || window.webkitURL;
    const blobURL = URLObj.createObjectURL(svgBlob);
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, 1000, 1000);
        context.drawImage(image, 100, 100, 800, 800);
        
        const pngURL = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngURL;
        downloadLink.download = `${dealer.id}-showroom-qrcode.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  // Modern dealer logo fallback for center of QR code
  const logoUrl = dealer.avatarUrl && dealer.avatarUrl !== ''
    ? (dealer.avatarUrl.startsWith('http') ? dealer.avatarUrl : `${window.location.origin}${dealer.avatarUrl}`)
    : 'https://bazar360.online/favicon.ico';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative max-w-sm w-full rounded-3xl border ${
              isDark 
                ? 'bg-[#0f1118] border-white/5 text-white' 
                : 'bg-white border-slate-100 text-slate-900'
            } p-6 shadow-2xl overflow-hidden`}
          >
            {/* Ambient Background Glow matching accent color */}
            <div 
              className="absolute -top-12 -left-12 w-32 h-32 rounded-full blur-3xl opacity-10"
              style={{ backgroundColor: accentColor }}
            />
            <div 
              className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-10"
              style={{ backgroundColor: accentColor }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 relative z-10">
              <div className="flex items-center gap-2">
                <Share2 size={16} style={{ color: accentColor }} />
                <h3 className="font-display font-bold text-sm uppercase tracking-wider">Share Showroom</h3>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex flex-col items-center text-center space-y-5 relative z-10">
              <div>
                <h4 className="font-bold text-lg font-sans">{dealer.name}</h4>
                <p className={`text-[10px] uppercase font-mono tracking-widest mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Instant Device Gateway
                </p>
              </div>

              {/* QR Canvas frame */}
              <div className="relative group">
                {/* Glowing Border Line with scanning effect */}
                <div 
                  className="absolute -inset-1.5 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"
                  style={{ backgroundColor: accentColor }}
                />
                
                <div className={`relative p-5 rounded-3xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                } flex items-center justify-center overflow-hidden`}>
                  
                  {/* Dynamic Laser Scan Effect */}
                  <div 
                    className="absolute inset-x-0 h-0.5 opacity-50 animate-bounce pointer-events-none"
                    style={{ 
                      backgroundColor: accentColor, 
                      boxShadow: `0 0 12px 2px ${accentColor}`,
                      top: '15%'
                    }}
                  />

                  {/* High Quality SVG QR Code with excavate to allow central icon */}
                  <div ref={qrRef} className="bg-white p-3 rounded-2xl">
                    <QRCodeSVG
                      value={shareUrl}
                      size={qrSize}
                      bgColor="#ffffff"
                      fgColor={accentColor}
                      level="Q"
                      includeMargin={false}
                      imageSettings={{
                        src: logoUrl,
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'} leading-relaxed px-4`}>
                  Scan this code with a mobile camera to instantly access our live catalog of premium fleet vehicles.
                </p>
              </div>

              {/* Action Rows */}
              <div className="w-full grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition-all uppercase tracking-wider border cursor-pointer ${
                    copied
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : isDark
                        ? 'bg-white/5 hover:bg-white/10 border-white/5 text-gray-200'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle size={13} />
                      COPIED
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      COPY LINK
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadQR}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  <Download size={13} />
                  SAVE PNG
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
