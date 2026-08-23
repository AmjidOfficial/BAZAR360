import React, { useState, useRef } from 'react';
import { 
  Sparkles, QrCode, Download, Eye, Smartphone, Megaphone, CheckCircle2, 
  TrendingUp, Users, ArrowUpRight, Copy, Loader2, Image, FileText, 
  Monitor, Tv, Tablet as TabletIcon, CreditCard, RefreshCw, Share2, 
  Phone, MapPin, Building2, ShieldCheck 
} from 'lucide-react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { safeHtml2Canvas } from '../../lib/html2canvasSafe';
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
type ActiveTool = 'signage' | 'card';
type DeviceMode = 'mobile' | 'tablet' | 'desktop' | 'tv';

export const MarketingSuite: React.FC<MarketingSuiteProps> = ({ listings, dealer }) => {
  const flyerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<ActiveTool>('signage');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');

  // Signage Customizer States
  const [selectedCarId, setSelectedCarId] = useState<string>(listings[0]?.id || 'custom');
  const [customTitle, setCustomTitle] = useState('Toyota Land Cruiser LC300');
  const [customPrice, setCustomPrice] = useState(78500000);
  const [customSpecs, setCustomSpecs] = useState('2024 • Automatic • Hybrid');
  const [badge, setBadge] = useState<BadgeStyle>('HOT DEAL');
  const [theme, setTheme] = useState<ThemeStyle>('cosmic-dark');
  const [customRemarks, setCustomRemarks] = useState('Spotless original condition. Immediate showroom delivery.');
  const [displayPhone, setDisplayPhone] = useState(dealer.whatsapp || dealer.phone || '+92 315 9085086');

  // Business Card Customizer States
  const [cardOwner, setCardOwner] = useState(dealer.contactPerson || (dealer as any).ownerName || 'Malak Mazhar');
  const [cardTitle, setCardTitle] = useState('Director / Chief Partner');
  const [cardPhone, setCardPhone] = useState(dealer.phone || '+92 315 9085086');
  const [cardSecondary, setCardSecondary] = useState('+92 355 6908995');
  const [cardAddress, setCardAddress] = useState(dealer.location || 'Alamas Car Village, Ring Road, Peshawar');
  const [cardSlogan, setCardSlogan] = useState('The Right Choice');
  const [isCardBack, setIsCardBack] = useState(false);

  const [downloading, setDownloading] = useState(false);

  // Selected vehicle calculation
  const selectedCar = listings.find(c => c.id === selectedCarId);
  const carTitle = selectedCar ? `${selectedCar.make} ${selectedCar.model}` : customTitle;
  const carPrice = selectedCar ? selectedCar.price : customPrice;
  const carSpecs = selectedCar 
    ? `${selectedCar.year} • ${selectedCar.transmission} • ${selectedCar.fuelType} • ${selectedCar.engineCC || 2000}cc`
    : customSpecs;
  const carImage = selectedCar?.images?.[0] || selectedCar?.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200';

  // Production-grade QR destinations
  const baseOrigin = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? window.location.origin
    : 'https://bazar360.online';
    
  const signageQrUrl = `${baseOrigin}/dealers/${dealer.id}?car=${selectedCarId}`;
  const cardQrUrl = `${baseOrigin}/dealers/${dealer.id}`;

  // Export handlers
  const handleDownloadFlyer = async (format: 'pdf' | 'png') => {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      const canvas = await safeHtml2Canvas(flyerRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      const imgData = canvas.toDataURL('image/png');
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `bazar360-signage-${dealer.id}-${selectedCarId}.png`;
        link.href = imgData;
        link.click();
      } else {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`bazar360-signage-${dealer.id}-${selectedCarId}.pdf`);
      }
      toast.success(`✓ Smart Signage exported (${format.toUpperCase()})`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to export signage.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await safeHtml2Canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      const link = document.createElement('a');
      link.download = `bazar360-business-card-${dealer.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('✓ Digital Business Card exported');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export business card.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadQR = (format: 'png' | 'svg') => {
    try {
      const targetUrl = activeTool === 'signage' ? signageQrUrl : cardQrUrl;
      if (format === 'svg') {
        const svgElement = document.getElementById('marketing-suite-qr-svg');
        if (svgElement) {
          const svgString = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          const link = document.createElement('a');
          link.href = svgUrl;
          link.download = `bazar360-qr-${dealer.id}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success('✓ SVG QR Code downloaded');
        }
      } else {
        const canvas = document.getElementById('marketing-suite-qr-canvas') as HTMLCanvasElement;
        if (canvas) {
          const link = document.createElement('a');
          link.download = `bazar360-qr-${dealer.id}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          toast.success('✓ PNG QR Code downloaded');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to download QR code.');
    }
  };

  const handleCopyLink = () => {
    const link = activeTool === 'signage' ? signageQrUrl : cardQrUrl;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  // Theme styles helper
  const getThemeStyles = () => {
    switch (theme) {
      case 'emerald-luxury':
        return {
          bg: 'bg-emerald-950 text-white border-emerald-500/20',
          accentText: 'text-amber-400',
          badgeBg: 'bg-amber-400 text-slate-950',
          shadow: 'shadow-emerald-950/40',
          glow: 'bg-emerald-500/10'
        };
      case 'gold-premium':
        return {
          bg: 'bg-stone-950 text-stone-100 border-yellow-500/20',
          accentText: 'text-yellow-400',
          badgeBg: 'bg-yellow-400 text-stone-950',
          shadow: 'shadow-yellow-950/40',
          glow: 'bg-yellow-500/10'
        };
      case 'sporty-crimson':
        return {
          bg: 'bg-slate-950 text-white border-red-500/20',
          accentText: 'text-red-400',
          badgeBg: 'bg-red-500 text-white',
          shadow: 'shadow-red-950/40',
          glow: 'bg-red-500/10'
        };
      case 'cosmic-dark':
      default:
        return {
          bg: 'bg-[#071225] text-white border-[#1C2942]',
          accentText: 'text-purple-400',
          badgeBg: 'bg-[#7C3AED] text-white',
          shadow: 'shadow-purple-950/40',
          glow: 'bg-[#7C3AED]/10'
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Device mode preview width classes
  const getDeviceWidthClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-full max-w-[340px]';
      case 'tablet':
        return 'w-full max-w-[500px]';
      case 'desktop':
        return 'w-full max-w-[640px]';
      case 'tv':
        return 'w-full max-w-[800px]';
    }
  };

  return (
    <div className="space-y-6 text-left font-sans" id="showroom-marketing-suite-module">
      {/* Module Top Navigation */}
      <div className="border-b border-[#1E293B] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-bold uppercase mb-2">
            <Sparkles size={14} />
            <span>Showroom Marketing Suite</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Smart Signage & Digital Business Identity
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create high-converting window signage, TV floor displays, and digital business cards for {dealer.name}.
          </p>
        </div>

        {/* Tool Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0F172A] border border-[#1E293B] rounded-2xl w-fit">
          <button
            onClick={() => setActiveTool('signage')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTool === 'signage'
                ? 'bg-[#7C3AED] text-white shadow-lg font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone size={14} />
            <span>Smart Signage</span>
          </button>
          <button
            onClick={() => setActiveTool('card')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTool === 'card'
                ? 'bg-[#7C3AED] text-white shadow-lg font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard size={14} />
            <span>Business Card</span>
          </button>
        </div>
      </div>

      {/* 1. MARKETING PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0B132B] p-4 rounded-2xl border border-[#1E293B] space-y-1 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-purple-500/10">
            <QrCode size={40} />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-mono">Total QR Sticker Scans</p>
          <p className="text-2xl font-mono font-extrabold text-white">148</p>
          <p className="text-[10px] text-purple-400 font-bold flex items-center gap-0.5 mt-2">
            <TrendingUp size={12} />
            <span>+14.2% this week</span>
          </p>
        </div>

        <div className="bg-[#0B132B] p-4 rounded-2xl border border-[#1E293B] space-y-1 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-emerald-500/10">
            <Smartphone size={40} />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-mono">Flyer-to-Chat Leads</p>
          <p className="text-2xl font-mono font-extrabold text-white">24</p>
          <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-2">
            <TrendingUp size={12} />
            <span>+8% Conversion</span>
          </p>
        </div>

        <div className="bg-[#0B132B] p-4 rounded-2xl border border-[#1E293B] space-y-1 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-blue-500/10">
            <Users size={40} />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-mono">Offline-to-Online Rate</p>
          <p className="text-2xl font-mono font-extrabold text-white">18.4%</p>
          <p className="text-[10px] text-slate-400 font-mono mt-2">
            Via physically parked QR codes
          </p>
        </div>
      </div>

      {/* 2. MAIN TOOL CANVAS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT CUSTOMIZER CONTROLS */}
        <div className="lg:col-span-5 bg-[#0B132B] border border-[#1E293B] p-5 rounded-3xl space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-white font-mono flex items-center gap-2 border-b border-[#1E293B] pb-2">
            <Megaphone size={14} className="text-purple-400" />
            {activeTool === 'signage' ? 'Signage Customizer Settings' : 'Business Card Customizer'}
          </h3>

          {activeTool === 'signage' ? (
            <>
              {/* Vehicle Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                  Select Vehicle Listing
                </label>
                <select
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  className="w-full bg-[#050B1A] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="custom">✍️ Manual Custom Vehicle Spec</option>
                  {listings.map(car => (
                    <option key={car.id} value={car.id}>🚗 {car.year} {car.make} {car.model}</option>
                  ))}
                </select>
              </div>

              {selectedCarId === 'custom' && (
                <div className="space-y-3 p-3 bg-[#050B1A] rounded-2xl border border-[#1E293B]">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 font-mono block">Vehicle Title</label>
                    <input 
                      type="text" 
                      value={customTitle} 
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full bg-[#0B132B] border border-[#1E293B] rounded-xl px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 font-mono block">Price (PKR)</label>
                      <input 
                        type="number" 
                        value={customPrice} 
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        className="w-full bg-[#0B132B] border border-[#1E293B] rounded-xl px-3 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 font-mono block">Specs</label>
                      <input 
                        type="text" 
                        value={customSpecs} 
                        onChange={(e) => setCustomSpecs(e.target.value)}
                        className="w-full bg-[#0B132B] border border-[#1E293B] rounded-xl px-3 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Theme Settings */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                  Design Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cosmic-dark', name: 'Cosmic Dark', color: 'bg-purple-500' },
                    { id: 'emerald-luxury', name: 'Emerald Classic', color: 'bg-emerald-500' },
                    { id: 'gold-premium', name: 'Premium Gold', color: 'bg-yellow-500' },
                    { id: 'sporty-crimson', name: 'Sporty Crimson', color: 'bg-red-500' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as ThemeStyle)}
                      className={`px-3 py-2 border rounded-xl text-[10px] font-mono font-bold uppercase flex items-center gap-2 cursor-pointer ${
                        theme === t.id 
                          ? 'border-purple-500 text-white bg-[#050B1A] shadow-md' 
                          : 'border-[#1E293B] text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ribbon Badge Overlay */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                  Sticker Badge Ribbon
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['HOT DEAL', 'SUPER CLEAN', '100% ORIGINAL', 'BARGAIN', 'JUST ARRIVED'] as BadgeStyle[]).map(b => (
                    <button
                      key={b}
                      onClick={() => setBadge(b)}
                      className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-lg cursor-pointer ${
                        badge === b 
                          ? 'bg-purple-500 text-white shadow-md font-extrabold' 
                          : 'bg-[#050B1A] border border-[#1E293B] text-slate-400 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remarks & Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                  Custom Selling Remarks
                </label>
                <textarea
                  value={customRemarks}
                  onChange={(e) => setCustomRemarks(e.target.value)}
                  rows={2}
                  className="w-full bg-[#050B1A] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                  Display Hotline Number
                </label>
                <input
                  type="text"
                  value={displayPhone}
                  onChange={(e) => setDisplayPhone(e.target.value)}
                  className="w-full bg-[#050B1A] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono"
                />
              </div>
            </>
          ) : (
            <>
              {/* Business Card Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-1">
                    Contact Person / Owner Name
                  </label>
                  <input
                    type="text"
                    value={cardOwner}
                    onChange={(e) => setCardOwner(e.target.value)}
                    className="w-full bg-[#050B1A] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-1">
                    Designation / Role Title
                  </label>
                  <input
                    type="text"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    className="w-full bg-[#050B1A] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-1">
                      Primary Phone
                    </label>
                    <input
                      type="text"
                      value={cardPhone}
                      onChange={(e) => setCardPhone(e.target.value)}
                      className="w-full bg-[#050B1A] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-1">
                      Secondary Line
                    </label>
                    <input
                      type="text"
                      value={cardSecondary}
                      onChange={(e) => setCardSecondary(e.target.value)}
                      className="w-full bg-[#050B1A] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-1">
                    Showroom Address
                  </label>
                  <input
                    type="text"
                    value={cardAddress}
                    onChange={(e) => setCardAddress(e.target.value)}
                    className="w-full bg-[#050B1A] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-1">
                    Showroom Slogan
                  </label>
                  <input
                    type="text"
                    value={cardSlogan}
                    onChange={(e) => setCardSlogan(e.target.value)}
                    className="w-full bg-[#050B1A] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-slate-200"
                  />
                </div>

                <button
                  onClick={() => setIsCardBack(!isCardBack)}
                  className="w-full py-2 bg-[#050B1A] border border-[#1E293B] hover:border-purple-500 rounded-xl text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RefreshCw size={14} />
                  <span>Flip Card (Currently: {isCardBack ? 'Back' : 'Front'})</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT LIVE PREVIEW AREA */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          {/* Header & Device Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B132B] border border-[#1E293B] p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-purple-400 animate-pulse" />
              <span className="text-xs font-bold uppercase text-white font-mono">
                {activeTool === 'signage' ? 'Live Signage Viewport' : 'Card Preview'}
              </span>
            </div>

            {activeTool === 'signage' && (
              <div className="flex items-center gap-1 bg-[#050B1A] p-1 rounded-xl border border-[#1E293B]">
                {[
                  { id: 'mobile', label: '375px', icon: <Smartphone size={12} /> },
                  { id: 'tablet', label: '768px', icon: <TabletIcon size={12} /> },
                  { id: 'desktop', label: '1024px', icon: <Monitor size={12} /> },
                  { id: 'tv', label: '1920px TV', icon: <Tv size={12} /> },
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDeviceMode(d.id as DeviceMode)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer transition-all ${
                      deviceMode === d.id 
                        ? 'bg-purple-500 text-white shadow font-extrabold' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d.icon}
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>
            )}

            <button 
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-[#050B1A] border border-[#1E293B] text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Copy size={12} /> Copy Link
            </button>
          </div>

          {/* MAIN PREVIEW CANVAS CONTAINER */}
          {activeTool === 'signage' ? (
            <div className="w-full flex justify-center overflow-x-auto py-2">
              <div 
                ref={flyerRef}
                className={`${getDeviceWidthClass()} p-6 sm:p-8 rounded-[32px] border ${themeStyles.bg} flex flex-col justify-between aspect-[3/4] shadow-2xl relative overflow-hidden transition-all duration-300 ${themeStyles.shadow}`}
              >
                {/* Dynamic Ambient Glow */}
                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[100px] pointer-events-none ${themeStyles.glow}`} />

                {/* Header Branding */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                  <div className="text-left">
                    <span className={`text-[8px] font-mono font-black uppercase tracking-[0.25em] ${themeStyles.accentText} block`}>
                      OFFICIAL SHOWROOM INVENTORY
                    </span>
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-white mt-0.5 leading-none">
                      {dealer.name}
                    </h4>
                    <p className="text-[8px] font-sans text-slate-300 tracking-wider mt-1">
                      {dealer.location || 'Alamas Car Village, Ring Road, Peshawar'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[14px] font-extrabold text-purple-400 font-display">BAZAR<span className="text-white">360</span></span>
                  </div>
                </div>

                {/* Picture Area */}
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 my-4 shadow-lg shrink-0">
                  <img 
                    src={carImage} 
                    alt="Vehicle Banner" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Badge Overlay */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-md ${themeStyles.badgeBg} text-[9px] font-mono font-extrabold uppercase tracking-widest shadow-md`}>
                    {badge}
                  </div>

                  {/* Verified Sticker */}
                  <div className="absolute bottom-3 right-3 bg-[#050B1A]/80 backdrop-blur-md border border-white/15 px-2.5 py-0.5 rounded text-[8px] font-mono text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={10} /> Verified Stock
                  </div>
                </div>

                {/* Specs Block */}
                <div className="text-left space-y-1 relative z-10">
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${themeStyles.accentText} block`}>
                    FEATURED VEHICLE
                  </span>
                  <h3 className="text-lg font-extrabold text-white uppercase leading-tight tracking-tight">
                    {carTitle}
                  </h3>
                  <p className="text-[11px] font-sans font-bold text-slate-300 leading-none">
                    {carSpecs}
                  </p>
                  <p className="text-[9.5px] text-slate-400 italic pt-1 border-t border-white/5 font-sans">
                    "{customRemarks}"
                  </p>
                </div>

                {/* Footer Conversion Panel */}
                <div className="mt-4 pt-4 border-t border-dashed border-white/10 flex items-center justify-between gap-4 relative z-10 shrink-0">
                  <div className="text-left flex-1 min-w-0">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block leading-none">
                      PRICE DEMAND:
                    </span>
                    <span className="text-lg font-extrabold text-white block mt-1 truncate">
                      {formatPkrPrice(carPrice)}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider block mt-1 ${themeStyles.accentText}`}>
                      WhatsApp: {displayPhone}
                    </span>
                  </div>

                  {/* Live QR Code */}
                  <div className="p-1.5 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-white/20">
                    <QRCodeCanvas 
                      value={signageQrUrl}
                      size={64}
                      level="H"
                    />
                  </div>
                </div>

                {/* Scan helper text */}
                <p className="text-[7px] font-mono font-extrabold text-slate-400/60 uppercase tracking-[0.25em] text-center mt-2.5">
                  SCAN QR TO VIEW FULL DETAILS & VIDEO WALKABOUT
                </p>
              </div>
            </div>
          ) : (
            /* DIGITAL BUSINESS CARD PREVIEW */
            <div className="w-full flex justify-center py-4">
              <div 
                ref={cardRef}
                className="w-full max-w-[420px] aspect-[1.75/1] bg-gradient-to-br from-[#0D1830] via-[#071225] to-[#050B1A] border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between text-left"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                {!isCardBack ? (
                  /* FRONT OF CARD */
                  <>
                    <div className="flex items-start justify-between border-b border-white/10 pb-3 relative z-10">
                      <div>
                        <div className="flex items-center gap-1.5 text-purple-400 text-[9px] font-mono font-bold uppercase tracking-widest">
                          <Building2 size={10} />
                          <span>Showroom Storefront</span>
                        </div>
                        <h3 className="text-base font-extrabold text-white tracking-wide uppercase mt-0.5">
                          {dealer.name}
                        </h3>
                        <p className="text-[9px] text-slate-400 italic">"{cardSlogan}"</p>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-extrabold text-xs shrink-0">
                        AC
                      </div>
                    </div>

                    <div className="space-y-1 relative z-10 my-2">
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">{cardOwner}</h4>
                      <p className="text-[10px] font-mono text-purple-400 font-bold uppercase">{cardTitle}</p>
                    </div>

                    <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-3 relative z-10">
                      <div className="space-y-1 text-[9px] font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Phone size={10} className="text-purple-400" />
                          <span>{cardPhone} {cardSecondary ? `• ${cardSecondary}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={10} className="text-purple-400" />
                          <span className="truncate max-w-[220px]">{cardAddress}</span>
                        </div>
                      </div>

                      <div className="p-1 bg-white rounded-lg shrink-0">
                        <QRCodeCanvas value={cardQrUrl} size={44} level="H" />
                      </div>
                    </div>
                  </>
                ) : (
                  /* BACK OF CARD */
                  <div className="h-full flex flex-col justify-between relative z-10 py-2">
                    <div className="text-center space-y-2 my-auto">
                      <span className="text-xl font-extrabold text-purple-400 font-display block">BAZAR<span className="text-white">360</span></span>
                      <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">{dealer.name}</p>
                      <p className="text-[10px] text-slate-400 max-w-xs mx-auto">{cardAddress}</p>
                    </div>
                    <div className="text-center pt-2 border-t border-white/10">
                      <p className="text-[8px] font-mono text-purple-400 uppercase tracking-widest">
                        Scan QR Code to view online stock at bazar360.online
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden high-res QR elements for exports */}
          <div className="hidden">
            <QRCodeCanvas
              id="marketing-suite-qr-canvas"
              value={activeTool === 'signage' ? signageQrUrl : cardQrUrl}
              size={512}
              level="H"
            />
            <QRCodeSVG
              id="marketing-suite-qr-svg"
              value={activeTool === 'signage' ? signageQrUrl : cardQrUrl}
              size={512}
              level="H"
            />
          </div>

          {/* EXPORT ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {activeTool === 'signage' ? (
              <>
                <button
                  onClick={() => handleDownloadFlyer('pdf')}
                  disabled={downloading}
                  className="px-4 py-3 bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  {downloading ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />}
                  <span>Export Signage Flyer PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadFlyer('png')}
                  disabled={downloading}
                  className="px-4 py-3 bg-[#0B132B] hover:bg-[#121E42] text-purple-400 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-purple-500/20"
                >
                  {downloading ? <Loader2 className="animate-spin" size={14} /> : <Image size={14} />}
                  <span>Download High-Res PNG</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="px-4 py-3 bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg sm:col-span-2"
                >
                  {downloading ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                  <span>Export Business Card PNG</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleDownloadQR('png')}
              className="px-4 py-2.5 bg-[#0B132B] hover:bg-[#121E42] text-emerald-400 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-500/20"
            >
              <QrCode size={14} />
              <span>Download Clean QR PNG</span>
            </button>
            <button
              onClick={() => handleDownloadQR('svg')}
              className="px-4 py-2.5 bg-[#0B132B] hover:bg-[#121E42] text-emerald-400 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-500/20"
            >
              <QrCode size={14} />
              <span>Download Clean QR SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
