import React, { useState, useRef } from 'react';
import { Sparkles, QrCode, Download, Eye, Smartphone, Megaphone, CheckCircle2, TrendingUp, Users, ArrowUpRight, Copy, Loader2, Image, FileText } from 'lucide-react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CarListing, Dealer } from '../../types';
import { formatPkrPrice } from '../../lib/currency';
import { toast } from 'react-hot-toast';

interface MarketingSuiteProps {
  listings: CarListing[];
  dealer: Dealer;
}

type BadgeStyle = 'HOT DEAL' | 'SUPER CLEAN' | '100% ORIGINAL' | 'BARGAIN' | 'JUST ARRIVED';
type ThemeStyle = 'cosmic-dark' | 'emerald-luxury' | 'gold-premium' | 'sporty-crimson';

export const MarketingSuite: React.FC<MarketingSuiteProps> = ({ listings, dealer }) => {
  const flyerRef = useRef<HTMLDivElement>(null);
  const [selectedCarId, setSelectedCarId] = useState<string>(listings[0]?.id || 'custom');
  const [customTitle, setCustomTitle] = useState('Toyota Land Cruiser LC300');
  const [customPrice, setCustomPrice] = useState(78500000);
  const [customSpecs, setCustomSpecs] = useState('2024 • Automatic • Hybrid');
  
  const [badge, setBadge] = useState<BadgeStyle>('HOT DEAL');
  const [theme, setTheme] = useState<ThemeStyle>('cosmic-dark');
  const [customRemarks, setCustomRemarks] = useState('Spotless original condition. Immediate showroom delivery.');
  const [displayPhone, setDisplayPhone] = useState(dealer.socials?.whatsapp || '+92 315 9085086');

  const [downloadingFlyer, setDownloadingFlyer] = useState(false);

  // Find selected car or mock custom
  const selectedCar = listings.find(c => c.id === selectedCarId);
  const carTitle = selectedCar ? `${selectedCar.make} ${selectedCar.model}` : customTitle;
  const carPrice = selectedCar ? selectedCar.price : customPrice;
  const carSpecs = selectedCar 
    ? `${selectedCar.year} • ${selectedCar.transmission} • ${selectedCar.fuelType} • ${selectedCar.engineCC}cc`
    : customSpecs;
  const carImage = selectedCar?.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200';

  const qrUrl = `https://bazar360.online/dealer/${dealer.id}?car=${selectedCarId}`;

  // Handle template download trigger
  const handleDownloadFlyer = async (format: 'pdf' | 'png') => {
    if (!flyerRef.current) return;
    setDownloadingFlyer(true);
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      const imgData = canvas.toDataURL('image/png');
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `smart-signage-${dealer.id}-${selectedCarId}.png`;
        link.href = imgData;
        link.click();
      } else {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`smart-signage-${dealer.id}-${selectedCarId}.pdf`);
      }
      toast.success(`✓ Smart Signage Flyer (${format.toUpperCase()}) exported successfully!`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to export smart signage flyer.');
    } finally {
      setDownloadingFlyer(false);
    }
  };

  const handleDownloadQR = (format: 'png' | 'svg') => {
    try {
      if (format === 'svg') {
        const svgElement = document.getElementById('marketing-suite-qr-svg');
        if (svgElement) {
          const svgString = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          const link = document.createElement('a');
          link.href = svgUrl;
          link.download = `showroom-qr-${dealer.id}-${selectedCarId}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success('✓ QR Code SVG asset downloaded!');
        } else {
          toast.error('SVG QR element not found.');
        }
      } else {
        const canvas = document.getElementById('marketing-suite-qr-canvas') as HTMLCanvasElement;
        if (canvas) {
          const link = document.createElement('a');
          link.download = `showroom-qr-${dealer.id}-${selectedCarId}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          toast.success('✓ QR Code PNG asset downloaded!');
        } else {
          toast.error('Canvas QR element not found.');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to download QR code asset.');
    }
  };

  const handleCopyLink = () => {
    const link = qrUrl;
    navigator.clipboard.writeText(link);
    toast.success('Storefront QR link copied to clipboard!');
  };

  // Dynamic Theme Styling Map
  const getThemeStyles = () => {
    switch (theme) {
      case 'emerald-luxury':
        return {
          bg: 'bg-emerald-950 text-white border-emerald-500/20',
          gradient: 'from-emerald-900 to-emerald-950',
          accentText: 'text-amber-400',
          badgeBg: 'bg-amber-400 text-slate-950',
          accentBorder: 'border-amber-400/30',
          shadow: 'shadow-emerald-950/40',
          glow: 'bg-emerald-500/5'
        };
      case 'gold-premium':
        return {
          bg: 'bg-stone-950 text-stone-100 border-yellow-500/20',
          gradient: 'from-stone-900 to-stone-950',
          accentText: 'text-yellow-500',
          badgeBg: 'bg-yellow-500 text-stone-950',
          accentBorder: 'border-yellow-500/30',
          shadow: 'shadow-yellow-950/40',
          glow: 'bg-yellow-500/5'
        };
      case 'sporty-crimson':
        return {
          bg: 'bg-slate-950 text-slate-100 border-red-500/20',
          gradient: 'from-slate-900 to-slate-950',
          accentText: 'text-red-500',
          badgeBg: 'bg-red-500 text-white',
          accentBorder: 'border-red-500/30',
          shadow: 'shadow-red-950/40',
          glow: 'bg-red-500/5'
        };
      case 'cosmic-dark':
      default:
        return {
          bg: 'bg-slate-950 text-slate-100 border-orange-500/20',
          gradient: 'from-slate-900 to-slate-950',
          accentText: 'text-orange-400',
          badgeBg: 'bg-orange-500 text-slate-950',
          accentBorder: 'border-orange-500/30',
          shadow: 'shadow-orange-950/40',
          glow: 'bg-orange-500/5'
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <div className="space-y-6 text-left" id="showroom-marketing-suite-module">
      <div className="border-b border-[var(--color-border-main)] pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-black uppercase text-[var(--color-text-main)] font-display tracking-tight flex items-center gap-2">
            <Sparkles className="text-orange-500" size={20} /> Showroom Marketing Suite
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Produce branded smart signs, printable window display cards, and QR scan metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-1.5 rounded-2xl">
          <TrendingUp size={14} className="text-emerald-500" />
          <span className="text-[10px] font-mono font-black text-[var(--color-text-main)] uppercase">Smart Sign ROI: +24%</span>
        </div>
      </div>

      {/* 1. MARKETING METRICS PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[var(--color-bg-primary)] p-4 rounded-2xl border border-[var(--color-border-main)] space-y-1 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-orange-500/10">
            <QrCode size={40} />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono">Total QR Sticker Scans</p>
          <p className="text-2xl font-mono font-black text-[var(--color-text-main)]">148</p>
          <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-2">
            <TrendingUp size={12} />
            <span>+14.2% this week</span>
          </p>
        </div>

        <div className="bg-[var(--color-bg-primary)] p-4 rounded-2xl border border-[var(--color-border-main)] space-y-1 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-emerald-500/10">
            <Smartphone size={40} />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono">Flyer-to-Chat Leads</p>
          <p className="text-2xl font-mono font-black text-[var(--color-text-main)]">24</p>
          <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-2">
            <TrendingUp size={12} />
            <span>+8% Conversion</span>
          </p>
        </div>

        <div className="bg-[var(--color-bg-primary)] p-4 rounded-2xl border border-[var(--color-border-main)] space-y-1 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-blue-500/10">
            <Users size={40} />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono">Offline-to-Online Rate</p>
          <p className="text-2xl font-mono font-black text-[var(--color-text-main)]">18.4%</p>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-2">
            Via physically parked QR codes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 2. CREATIVE GENERATION CONTROL PANEL */}
        <div className="lg:col-span-5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-5 rounded-3xl space-y-5">
          <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-main)] font-mono flex items-center gap-2 border-b border-[var(--color-border-main)]/50 pb-2">
            <Megaphone size={14} className="text-orange-500" /> Customizer Settings
          </h4>

          {/* Vehicle Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono block">Select Showroom Vehicle</label>
            <select
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
              className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 font-mono"
            >
              <option value="custom">✍️ Manual Custom Vehicle Spec</option>
              {listings.map(car => (
                <option key={car.id} value={car.id}>🚗 {car.year} {car.make} {car.model}</option>
              ))}
            </select>
          </div>

          {selectedCarId === 'custom' && (
            <div className="space-y-3 p-3 bg-[var(--color-bg-primary)] rounded-2xl border border-[var(--color-border-main)]/50">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono block">Title</label>
                <input 
                  type="text" 
                  value={customTitle} 
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text-main)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono block">Price (PKR)</label>
                  <input 
                    type="number" 
                    value={customPrice} 
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono block">Specs</label>
                  <input 
                    type="text" 
                    value={customSpecs} 
                    onChange={(e) => setCustomSpecs(e.target.value)}
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text-main)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Theme Settings */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono block">Design Colorways</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'cosmic-dark', name: 'Cosmic Dark', color: 'bg-orange-500' },
                { id: 'emerald-luxury', name: 'Emerald Classic', color: 'bg-emerald-500' },
                { id: 'gold-premium', name: 'Premium Gold', color: 'bg-yellow-500' },
                { id: 'sporty-crimson', name: 'Sporty Crimson', color: 'bg-red-500' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ThemeStyle)}
                  className={`px-3 py-2 border rounded-xl text-[10px] font-mono font-black uppercase flex items-center gap-1.5 cursor-pointer ${
                    theme === t.id 
                      ? 'border-orange-500 text-[var(--color-text-main)] bg-[var(--color-bg-primary)] shadow-md' 
                      : 'border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Badge Select */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono block">Sticker Ribbon Overlay</label>
            <div className="flex flex-wrap gap-1.5">
              {(['HOT DEAL', 'SUPER CLEAN', '100% ORIGINAL', 'BARGAIN', 'JUST ARRIVED'] as BadgeStyle[]).map(b => (
                <button
                  key={b}
                  onClick={() => setBadge(b)}
                  className={`px-2.5 py-1 text-[8px] font-mono font-black uppercase rounded-lg cursor-pointer ${
                    badge === b 
                      ? 'bg-orange-500 text-slate-950 shadow-md' 
                      : 'bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Slogan Remarks */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono block">Custom Selling Remarks</label>
            <textarea
              value={customRemarks}
              onChange={(e) => setCustomRemarks(e.target.value)}
              rows={2}
              className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50"
              placeholder="e.g. Clean imported car..."
            />
          </div>

          {/* Phone Display */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono block">Display Contact Line</label>
            <input
              type="text"
              value={displayPhone}
              onChange={(e) => setDisplayPhone(e.target.value)}
              className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 font-mono"
            />
          </div>
        </div>

        {/* 3. FLYER & QR PREVIEW VIEWPORT */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-main)] font-mono flex items-center gap-1.5">
              <Eye size={13} className="text-emerald-500 animate-pulse" /> Live Window Signage Preview
            </h4>
            <div className="flex gap-2">
              <button 
                onClick={handleCopyLink}
                className="p-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-xl text-[10px] font-mono flex items-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Copy size={12} /> Copy link
              </button>
            </div>
          </div>

          {/* Poster Container Canvas */}
          <div ref={flyerRef} className={`p-6 sm:p-8 rounded-[36px] border ${themeStyles.bg} flex flex-col justify-between aspect-[3/4] max-w-sm mx-auto shadow-2xl relative overflow-hidden transition-all duration-300 ${themeStyles.shadow}`}>
            
            {/* Dynamic ambient backdrop light */}
            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[100px] pointer-events-none ${themeStyles.glow}`} />

            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
              <div className="text-left">
                <span className={`text-[8px] font-mono font-black uppercase tracking-[0.25em] ${themeStyles.accentText} block`}>
                  OFFICIAL VEHICLE SPONSOR
                </span>
                <h5 className="text-sm font-black uppercase tracking-wider text-white mt-0.5 leading-none">
                  {dealer.name}
                </h5>
                <p className="text-[7.5px] font-sans text-white/50 tracking-wider">
                  {dealer.location || 'Peshawar Auto Market'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[14px] font-black text-orange-500 font-display">BAZAR<span className="text-white">360</span></span>
              </div>
            </div>

            {/* Main Picture block */}
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 my-4 shadow-lg shrink-0">
              <img 
                src={carImage} 
                alt="Banner specs" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Ribbon Badge Overlay */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-md ${themeStyles.badgeBg} text-[8px] font-mono font-black uppercase tracking-widest shadow-md`}>
                {badge}
              </div>

              {/* Verified Sticker */}
              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md border border-white/15 px-2 py-0.5 rounded text-[7px] font-mono text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 size={8} /> Verified Stock
              </div>
            </div>

            {/* Spec info block */}
            <div className="text-left space-y-1 relative z-10">
              <span className={`text-[9px] font-mono font-black uppercase tracking-widest ${themeStyles.accentText} block`}>
                PREMIUM REVIEWS AT BAZAR360
              </span>
              <h2 className="text-lg font-black text-white uppercase leading-tight tracking-tight">
                {carTitle}
              </h2>
              <p className="text-[10px] font-sans font-bold text-white/70 leading-none">
                {carSpecs}
              </p>
              <p className="text-[9px] text-white/50 italic pt-1 border-t border-white/5 font-sans">
                "{customRemarks}"
              </p>
            </div>

            {/* Smart scan & footer conversion panel */}
            <div className="mt-4 pt-4 border-t border-dashed border-white/10 flex items-center justify-between gap-4 relative z-10 shrink-0">
              <div className="text-left flex-1 min-w-0">
                <span className="text-[7.5px] font-mono uppercase tracking-widest text-white/40 block leading-none">
                  PRICE VALUE:
                </span>
                <span className="text-lg font-black text-white font-sans block mt-1 truncate">
                  {formatPkrPrice(carPrice)}
                </span>
                <span className={`text-[8px] font-mono font-black uppercase tracking-wider block mt-1 ${themeStyles.accentText}`}>
                  WhatsApp: {displayPhone}
                </span>
              </div>

              {/* Real QR Code Canvas */}
              <div className="p-1.5 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-white/20">
                <QRCodeCanvas 
                  value={qrUrl}
                  size={60}
                  level="H"
                />
              </div>
            </div>

            {/* Small scan label */}
            <p className="text-[6.5px] font-mono font-black text-white/30 uppercase tracking-[0.25em] text-center mt-2.5">
              SCAN QR TO ACCESS WALKABOUT VIDEOS & SOUND CLIPS
            </p>
          </div>

          {/* Hidden high-res QR elements for flawless exports */}
          <div className="hidden">
            <QRCodeCanvas
              id="marketing-suite-qr-canvas"
              value={qrUrl}
              size={512}
              level="H"
            />
            <QRCodeSVG
              id="marketing-suite-qr-svg"
              value={qrUrl}
              size={512}
              level="H"
            />
          </div>

          {/* Enhanced Smart Signage Download Suite */}
          <div className="space-y-4 pt-2">
            <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl p-4 space-y-3">
              <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                Export Digital Signage Assets
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownloadFlyer('pdf')}
                  disabled={downloadingFlyer}
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  {downloadingFlyer ? <Loader2 className="animate-spin" size={13} /> : <FileText size={13} />}
                  <span>Flyer PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadFlyer('png')}
                  disabled={downloadingFlyer}
                  className="px-4 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-orange-500/20"
                >
                  {downloadingFlyer ? <Loader2 className="animate-spin" size={13} /> : <Image size={13} />}
                  <span>Flyer PNG</span>
                </button>
              </div>
            </div>

            <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl p-4 space-y-3">
              <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                Download Clean QR Stickers
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownloadQR('png')}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <QrCode size={13} />
                  <span>QR Code PNG</span>
                </button>
                <button
                  onClick={() => handleDownloadQR('svg')}
                  className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-500/20"
                >
                  <QrCode size={13} />
                  <span>QR Code SVG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
