import React, { useState, useRef } from 'react';
import { 
  RotateCw, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Info, 
  Phone, 
  MessageSquare, 
  Car, 
  Maximize2,
  Minimize2,
  ChevronRight,
  Eye,
  Fuel,
  Wrench,
  Gauge
} from 'lucide-react';
import { CarListing } from '../types';

interface Vehicle360ViewerProps {
  car?: CarListing | null;
  onClose?: () => void;
  lang?: 'en' | 'ur';
}

interface Hotspot {
  id: string;
  title: string;
  score: string;
  status: 'Not assessed' | 'Information';
  description: string;
  xPercent: number;
  yPercent: number;
  category: 'mechanical' | 'body' | 'electrical' | 'documents';
}

const DEFAULT_HOTSPOTS: Hotspot[] = [
  {
    id: 'engine',
    title: 'Powertrain area',
    score: 'Not assessed',
    status: 'Not assessed',
    description: 'No independent engine or diagnostic report has been attached to this listing.',
    xPercent: 32,
    yPercent: 42,
    category: 'mechanical'
  },
  {
    id: 'body',
    title: 'Body and paint',
    score: 'Not assessed',
    status: 'Not assessed',
    description: 'This marker highlights the body area only. Paint originality and body condition have not been verified.',
    xPercent: 54,
    yPercent: 35,
    category: 'body'
  },
  {
    id: 'suspension',
    title: 'Suspension area',
    score: 'Not assessed',
    status: 'Not assessed',
    description: 'No independent suspension inspection results have been provided.',
    xPercent: 28,
    yPercent: 68,
    category: 'mechanical'
  },
  {
    id: 'brakes',
    title: 'Brakes and wheels',
    score: 'Not assessed',
    status: 'Not assessed',
    description: 'No brake or ABS inspection results have been provided.',
    xPercent: 74,
    yPercent: 62,
    category: 'mechanical'
  },
  {
    id: 'docs',
    title: 'Vehicle documents',
    score: 'Not provided',
    status: 'Not assessed',
    description: 'No government record verification is attached. Review original documents before buying.',
    xPercent: 65,
    yPercent: 24,
    category: 'documents'
  }
];

export const Vehicle360Viewer: React.FC<Vehicle360ViewerProps> = ({ car, onClose, lang = 'en' }) => {
  const isUrdu = lang === 'ur';
  const [activeView, setActiveView] = useState<'exterior' | 'interior' | 'specs'>('exterior');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(DEFAULT_HOTSPOTS[0]);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  // Use real uploaded gallery images as frames. A single image is a photo preview,
  // not a simulated 360-degree inspection.
  const imageFrames = (car?.images || []).filter((image): image is string => typeof image === 'string' && image.length > 0);
  const normalizedAngle = ((rotationAngle % 360) + 360) % 360;
  const frameIndex = imageFrames.length > 1
    ? Math.floor((normalizedAngle / 360) * imageFrames.length) % imageFrames.length
    : 0;
  const displayImage = imageFrames[frameIndex] || car?.imageUrl || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80';

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - startXRef.current;
    startXRef.current = e.clientX;
    setRotationAngle((prev) => (prev + delta * 0.5) % 360);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const carTitle = car ? `${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim() || 'Vehicle details unavailable' : 'Vehicle details unavailable';
  const carPrice = typeof car?.price === 'number' && car.price > 0
    ? `PKR ${car.price.toLocaleString()}`
    : 'Price not provided';
  const sellerPhone = car?.sellerWhatsApp || car?.sellerPhone || car?.ownerDetails?.phone || '';

  const handleWhatsAppInquiry = () => {
    if (!sellerPhone) return;
    const text = encodeURIComponent(`Hi, I am viewing the 360° vehicle view for the ${carTitle} on Bazar360.online. I would like to ask about the vehicle and arrange a viewing.`);
    window.open(`https://wa.me/${sellerPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full bg-[#0B1326] text-[#DAE2FD] rounded-2xl border border-[rgba(56,189,248,0.2)] overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.5)] flex flex-col">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 bg-[#060E20] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/15 border border-[#00D2FF]/30 flex items-center justify-center text-[#00D2FF]">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFB95F] font-bold">
                Vehicle Preview
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#00D2FF]/15 text-[#00D2FF] text-[9px] font-mono font-bold">
                {imageFrames.length > 1 ? 'Multi-photo preview' : 'Photo preview'}
              </span>
            </div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight">
              {carTitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex p-1 rounded-xl bg-[#171F33] border border-white/10">
            <button
              onClick={() => setActiveView('exterior')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeView === 'exterior' ? 'bg-[#00D2FF] text-[#060E20] shadow' : 'text-[#BBC9CF] hover:text-white'
              }`}
            >
              Vehicle photos
            </button>
            <button
              onClick={() => setActiveView('specs')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeView === 'specs' ? 'bg-[#00D2FF] text-[#060E20] shadow' : 'text-[#BBC9CF] hover:text-white'
              }`}
            >
              Vehicle details
            </button>
          </div>
        </div>
      </div>

      {/* Main 360 Viewer Canvas Area */}
      <div className="relative w-full h-80 sm:h-[420px] bg-gradient-to-b from-[#060E20] via-[#0F172A] to-[#060E20] flex items-center justify-center overflow-hidden select-none">
        {/* Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,210,255,0.15)_0%,transparent_70%)]" />

        {/* Rotatable Vehicle Display Container */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          <img
            src={displayImage}
            alt={carTitle}
            className="max-h-[82%] max-w-[90%] object-contain pointer-events-none transition-transform duration-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
            style={{
              transform: 'scale(1.02)',
              filter: 'contrast(1.05) brightness(1.02)'
            }}
          />

          {/* Interactive Inspection Hotspots (Exterior View) */}
          {activeView === 'exterior' && DEFAULT_HOTSPOTS.map((hotspot) => {
            const isSelected = selectedHotspot?.id === hotspot.id;
            return (
              <button
                key={hotspot.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspot(hotspot);
                }}
                className={`absolute z-30 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-200 ${
                  isSelected ? 'scale-125' : 'hover:scale-110'
                }`}
                style={{
                  left: `${hotspot.xPercent}%`,
                  top: `${hotspot.yPercent}%`
                }}
              >
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border shadow-lg ${
                  isSelected 
                    ? 'bg-[#00D2FF] border-white text-[#060E20] shadow-[0_0_20px_rgba(0,210,255,0.8)]' 
                    : 'bg-[#060E20]/90 border-[#00D2FF]/60 text-[#00D2FF] hover:border-[#00D2FF]'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span className="absolute -inset-1 rounded-full border border-current opacity-40 animate-ping" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Drag Hint & Orbit Indicator */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-[#060E20]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono text-[#BBC9CF]">
          <RotateCw size={13} className="text-[#00D2FF] animate-spin" />
          <span>Interactive 360° Drag & Orbit</span>
        </div>

        {/* Overall Score Badge in Corner */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-[#060E20]/90 backdrop-blur-md p-2.5 sm:px-4 sm:py-2.5 rounded-2xl border border-[#00D2FF]/30 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-[#00D2FF]/15 border border-[#00D2FF]/40 flex flex-col items-center justify-center text-[#00D2FF]">
            <span className="font-display font-extrabold text-base leading-none">9.8</span>
            <span className="text-[8px] font-mono tracking-widest uppercase">Score</span>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[#FFB95F] text-xs font-bold">
              <ShieldCheck size={14} />
              <span>Inspection not verified</span>
            </div>
            <p className="text-[11px] text-[#BBC9CF]">No independent inspection report is attached to this listing.</p>
          </div>
        </div>
      </div>

      {/* Hotspot Detail Drawer / Inspection Telemetry */}
      {selectedHotspot && (
        <div className="p-4 sm:p-6 bg-[#171F33] border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30 uppercase">
                {selectedHotspot.category}
              </span>
              <span className="text-xs font-mono font-bold text-[#FFB95F]">
                {selectedHotspot.score}
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 size={13} /> {selectedHotspot.status}
              </span>
            </div>
            <h4 className="font-display font-bold text-base text-white">
              {selectedHotspot.title}
            </h4>
            <p className="text-xs text-[#BBC9CF] leading-relaxed">
              {selectedHotspot.description}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleWhatsAppInquiry}
              disabled={!sellerPhone}
              title={!sellerPhone ? 'Seller contact details have not been provided' : 'Contact seller on WhatsApp'}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageSquare size={15} />
              <span>WhatsApp Showroom</span>
            </button>
            {sellerPhone ? (
              <a
                href={`tel:${sellerPhone}`}
                className="px-3.5 py-2.5 rounded-xl bg-[#222A3D] hover:bg-[#2D3449] border border-white/10 text-white font-mono text-xs flex items-center justify-center transition"
                aria-label="Call seller"
              >
                <Phone size={14} />
              </a>
            ) : (
              <span className="px-3.5 py-2.5 text-xs text-[#BBC9CF]" title="Seller contact details have not been provided">Contact unavailable</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicle360Viewer;
