import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Check, 
  ShieldCheck, 
  Share2, 
  FileText,
  Rotate3d,
  Sparkles,
  User,
  Globe,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { safeHtml2Canvas } from '../lib/html2canvasSafe';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { Dealer } from '../types';

interface ShowroomBusinessCardProps {
  dealer: Dealer;
  onUpdateDealer?: (updated: Dealer) => void;
}

export const ShowroomBusinessCard: React.FC<ShowroomBusinessCardProps> = ({ dealer }) => {
  const [downloading, setDownloading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'interactive' | 'split'>('interactive');
  const [cardTheme, setCardTheme] = useState<'dark' | 'light'>('dark');
  const [cardStyle, setCardStyle] = useState<'modern-carbon' | 'classic-minimal' | 'championship-gold' | 'royal-blue' | 'emerald-prestige'>('modern-carbon');
  const [scale, setScale] = useState(1);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // QR Routing Validation & Canonical URL Formulation
  const getShowroomCanonicalUrl = (): string => {
    const slug = dealer.slug || dealer.id;
    if (!slug) {
      return 'https://bazar360.online/dealers';
    }
    return `https://bazar360.online/showroom/${slug}`;
  };

  const showroomUrl = getShowroomCanonicalUrl();

  // Responsive view scaling inside containers
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width < 480) {
          setScale(width / 480);
        } else {
          setScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Web Share API Integration with Fallback
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${dealer.name} - Official Digital Showroom`,
          text: `Explore verified premium vehicles at ${dealer.name} on Bazar360.online. Check our smart pass!`,
          url: showroomUrl
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyUrl();
        }
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(showroomUrl);
      toast.success('Showroom public link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link.');
    }
  };

  // High-Resolution Export functions using html2canvas
  const handleDownloadPNG = async (side: 'front' | 'back') => {
    const element = side === 'front' ? frontRef.current : backRef.current;
    if (!element) return;
    setDownloading(true);
    try {
      const originalStyle = element.getAttribute('style') || '';
      element.setAttribute('style', 'transform: none !important; transition: none !important;');
      
      const canvas = await safeHtml2Canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: cardTheme === 'dark' ? '#0b0f19' : '#ffffff'
      });
      
      element.setAttribute('style', originalStyle);

      const link = document.createElement('a');
      link.download = `${dealer.id}-${side}-business-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success(`Premium ${side} card face exported as high-res PNG!`);
    } catch (err) {
      console.error(err);
      toast.error('Export failed due to system rendering constraints.');
    } finally {
      setDownloading(false);
    }
  };

  // Export both sides as a unified PDF Card Pass
  const handleDownloadPDF = async () => {
    if (!frontRef.current || !backRef.current) return;
    setDownloading(true);
    try {
      const originalFrontStyle = frontRef.current.getAttribute('style') || '';
      const originalBackStyle = backRef.current.getAttribute('style') || '';
      
      frontRef.current.setAttribute('style', 'transform: none !important; transition: none !important;');
      backRef.current.setAttribute('style', 'transform: none !important; transition: none !important;');

      const canvasFront = await safeHtml2Canvas(frontRef.current, { scale: 3, useCORS: true });
      const canvasBack = await safeHtml2Canvas(backRef.current, { scale: 3, useCORS: true });

      frontRef.current.setAttribute('style', originalFrontStyle);
      backRef.current.setAttribute('style', originalBackStyle);

      const imgFront = canvasFront.toDataURL('image/jpeg', 0.98);
      const imgBack = canvasBack.toDataURL('image/jpeg', 0.98);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [90, 55] // Standard business card physical layout
      });

      // Front Face (Page 1)
      pdf.addImage(imgFront, 'JPEG', 0, 0, 90, 55);
      
      // Back Face (Page 2)
      pdf.addPage([90, 55], 'landscape');
      pdf.addImage(imgBack, 'JPEG', 0, 0, 90, 55);

      pdf.save(`Bazar360-${dealer.id}-digital-pass.pdf`);
      toast.success('Print-ready double-sided PDF exported perfectly!');
    } catch (err) {
      console.error(err);
      toast.error('Could not compile PDF document.');
    } finally {
      setDownloading(false);
    }
  };

  // Generate and export vCard (.vcf)
  const handleSaveVCard = () => {
    const cleanPhone = (dealer.phone || '').replace(/[^0-9+]/g, '');
    const cleanWhatsApp = (dealer.whatsapp || '').replace(/[^0-9+]/g, '');
    
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${dealer.name}
ORG:${dealer.name} - Bazar360 Showroom
TEL;TYPE=WORK,VOICE:${cleanPhone}
TEL;TYPE=CELL,MSG:${cleanWhatsApp}
EMAIL;TYPE=PREF,INTERNET:${dealer.email || 'info@bazar360.online'}
URL;TYPE=WORK:${showroomUrl}
ADR;TYPE=WORK,POSTAL,PARCEL:;;${dealer.location || 'Peshawar, Pakistan'};;;;
TITLE:${(dealer as any).designation || 'Showroom Owner'}
NOTE:Verified Showroom on Bazar360.online
REV:${new Date().toISOString()}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dealer.id}-contact.vcf`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Contact vCard downloaded successfully!');
  };

  // Logos configuration
  // Bazar360.online official master logo path
  const getBazarLogoSrc = (): string => {
    return cardTheme === 'dark' ? '/bazar360_official_logo.jpg' : '/bazar360_logo_light.jpg';
  };

  // Showroom specific logo path depending on card theme
  const getShowroomLogoSrc = (): string => {
    if (dealer.logo) return dealer.logo;
    return cardTheme === 'dark' ? '/auto_choice_logo_dark.jpg' : '/auto_choice_logo_light.jpg';
  };

  // Dynamic Theme Matrix & Presets
  const getStyleClasses = () => {
    const isDark = cardTheme === 'dark';
    
    switch (cardStyle) {
      case 'championship-gold':
        return {
          cardBg: isDark 
            ? 'bg-gradient-to-br from-[#120E06] via-[#1B150A] to-[#0A0803] border-amber-500/40 text-[#F5E6C4]' 
            : 'bg-gradient-to-br from-[#FCF9F2] via-[#F6EEE0] to-[#EBE0CD] border-[#D4AF37]/50 text-[#4A3B1B]',
          badge: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
          accentText: 'text-amber-500',
          borderLine: 'border-amber-500/20',
          decorOverlay: isDark ? 'bg-[radial-gradient(rgba(226,183,85,0.03)_1.2px,transparent_1.2px)]' : 'bg-[radial-gradient(rgba(175,134,44,0.02)_1.2px,transparent_1.2px)]',
          cornerGlow: 'from-[#E2B755]/10 to-transparent'
        };
      case 'emerald-prestige':
        return {
          cardBg: isDark 
            ? 'bg-gradient-to-br from-[#061C15] via-[#0B2E23] to-[#03110C] border-emerald-500/40 text-[#D1FAE5]' 
            : 'bg-gradient-to-br from-[#F0FDF4] via-[#DCFCE7] to-[#D1FAE5] border-emerald-500/50 text-[#064E3B]',
          badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
          accentText: 'text-emerald-500',
          borderLine: 'border-emerald-500/20',
          decorOverlay: isDark ? 'bg-[radial-gradient(rgba(16,185,129,0.03)_1.2px,transparent_1.2px)]' : 'bg-[radial-gradient(rgba(4,120,87,0.02)_1.2px,transparent_1.2px)]',
          cornerGlow: 'from-[#10B981]/10 to-transparent'
        };
      case 'royal-blue':
        return {
          cardBg: isDark 
            ? 'bg-gradient-to-br from-[#09152E] via-[#0E224A] to-[#040A17] border-[var(--color-accent-main)]/40 text-[#E0F2FE]' 
            : 'bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD] border-[#0284C7]/50 text-[#0369A1]',
          badge: 'bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border-[var(--color-accent-main)]/30',
          accentText: 'text-[var(--color-accent-main)]',
          borderLine: 'border-[var(--color-accent-main)]/20',
          decorOverlay: isDark ? 'bg-[radial-gradient(rgba(56,189,248,0.03)_1.2px,transparent_1.2px)]' : 'bg-[radial-gradient(rgba(2,132,199,0.02)_1.2px,transparent_1.2px)]',
          cornerGlow: 'from-[#38BDF8]/10 to-transparent'
        };
      case 'classic-minimal':
        return {
          cardBg: isDark 
            ? 'bg-[var(--color-bg-secondary)] border-border-main text-text-main' 
            : 'bg-white border-slate-200 text-slate-800 shadow-sm',
          badge: 'bg-slate-500/10 text-text-muted border-slate-500/20',
          accentText: isDark ? 'text-text-muted' : 'text-slate-700',
          borderLine: 'border-slate-500/10',
          decorOverlay: 'bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px)]',
          cornerGlow: 'from-slate-500/5 to-transparent'
        };
      case 'modern-carbon':
      default:
        return {
          cardBg: isDark 
            ? 'bg-gradient-to-br from-[#0F172A] via-[#080C14] to-[#020408] border-white/10 text-[var(--color-text-header)]' 
            : 'bg-gradient-to-br from-[#FFFFFF] via-[#F8FAFC] to-[#EFF6FF] border-slate-200 text-slate-900 shadow-sm',
          badge: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
          accentText: 'text-orange-500',
          borderLine: 'border-white/5',
          decorOverlay: isDark ? 'bg-[radial-gradient(rgba(255,255,255,0.015)_1.2px,transparent_1.2px)]' : 'bg-[radial-gradient(rgba(249,115,22,0.01)_1.2px,transparent_1.2px)]',
          cornerGlow: 'from-orange-500/10 to-transparent'
        };
    }
  };

  const currentStyle = getStyleClasses();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6 px-4" id="premium-showroom-business-card">
      {/* Visual Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border-main)] pb-6">
        <div className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-500 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles size={12} className="animate-pulse" /> Rebuilt Smart Pass v3
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[var(--color-text-main)] uppercase tracking-tight">
            Digital Showroom Identity
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] font-sans max-w-lg">
            A premium digital showroom business card that pairs your official brand with <strong className="text-orange-500 font-bold">Bazar360.online</strong>. Toggle presets to suit your showroom theme.
          </p>
        </div>

        {/* Presentation Controls Desk */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] uppercase font-bold select-none self-start md:self-auto">
          {/* Card Style Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-[var(--color-text-muted)] font-bold tracking-wider uppercase mb-0.5">Visiting Card Presets</span>
            <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-1 gap-1">
              {[
                { id: 'modern-carbon', label: 'Sunset' },
                { id: 'classic-minimal', label: 'Minimalist' },
                { id: 'championship-gold', label: 'Royal Gold' },
                { id: 'royal-blue', label: 'Sapphire' },
                { id: 'emerald-prestige', label: 'Emerald' }
              ].map((styleOpt) => (
                <button
                  key={styleOpt.id}
                  onClick={() => setCardStyle(styleOpt.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    cardStyle === styleOpt.id 
                      ? 'bg-orange-500 text-[var(--color-text-header)] shadow' 
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  }`}
                >
                  {styleOpt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-[var(--color-text-muted)] font-bold tracking-wider uppercase mb-0.5">Base Theme</span>
            <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-1 gap-1">
              <button 
                onClick={() => setCardTheme('dark')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  cardTheme === 'dark' 
                    ? 'bg-bg-secondary text-[var(--color-text-header)] shadow border border-border-main' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                Dark
              </button>
              <button 
                onClick={() => setCardTheme('light')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  cardTheme === 'light' 
                    ? 'bg-white text-slate-950 shadow border border-slate-200' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                Light
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-[var(--color-text-muted)] font-bold tracking-wider uppercase mb-0.5">Layout Mode</span>
            <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-1 gap-1">
              <button 
                onClick={() => setViewMode('interactive')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'interactive' 
                    ? 'bg-orange-500 text-[var(--color-text-header)] shadow' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                3D Flip
              </button>
              <button 
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'split' 
                    ? 'bg-orange-500 text-[var(--color-text-header)] shadow' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                Split
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER STAGE COVERS */}
      <div 
        ref={containerRef}
        className="w-full flex items-center justify-center min-h-[340px] py-4 overflow-hidden relative"
      >
        {/* INTERACTIVE 3D FLIP MODE */}
        {viewMode === 'interactive' ? (
          <div 
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            className="w-[450px] h-[275px] perspective-[1200px] select-none group relative transition-transform duration-300"
          >
            {/* Ambient Lighting Background behind interactive model */}
            <div className={`absolute inset-0 rounded-3xl blur-2xl opacity-40 transition-colors duration-500 pointer-events-none -m-4 ${currentStyle.cornerGlow}`} />

            {/* Interactive Transform container */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] cursor-pointer hover:shadow-2xl hover:shadow-orange-500/5 ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* Card Front face */}
              <div 
                ref={frontRef}
                className={`absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[24px] border p-6 flex flex-col justify-between transition-all duration-300 ${currentStyle.cardBg}`}
              >
                {/* Visual grid watermark details inside card */}
                <div className={`absolute inset-0 ${currentStyle.decorOverlay} [background-size:12px_12px] pointer-events-none rounded-[24px]`} />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 border-4 border-current opacity-5 rounded-full pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Card Front Header - Placing both logos beautifully! */}
                <div className="flex items-center justify-between z-10 shrink-0">
                  {/* Logo 1: Bazar360 Logo Image */}
                  <div className="flex items-center">
                    <img 
                      src={getBazarLogoSrc()} 
                      alt="Bazar360 Logo" 
                      className="h-8 w-auto object-contain rounded-md"
                      crossOrigin="anonymous" 
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <span className={`text-[8px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border shrink-0 ${currentStyle.badge}`}>
                    {dealer.theme_choice || 'Official'} Partner
                  </span>
                </div>

                {/* Showroom Central Hero */}
                <div className="flex flex-col items-center justify-center text-center space-y-2 z-10 my-auto">
                  {/* Logo 2: Showroom Specific Logo Image */}
                  <div className="relative group/logo flex items-center justify-center">
                    <img 
                      src={getShowroomLogoSrc()} 
                      alt={dealer.name} 
                      className={`w-14 h-14 rounded-2xl object-contain bg-white border shadow p-1.5 transition-transform duration-300 ${
                        cardTheme === 'dark' ? 'border-white/10' : 'border-slate-200'
                      }`}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallbackNode = e.currentTarget.parentElement?.querySelector('.fallback-avatar');
                        if (fallbackNode) fallbackNode.classList.remove('hidden');
                      }}
                    />

                    {/* Fallback initials */}
                    <div className={`fallback-avatar w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-lg border shadow-inner hidden ${
                      cardTheme === 'dark' 
                        ? 'bg-gradient-to-br from-slate-800 to-slate-950 border-white/10 text-[var(--color-text-header)]' 
                        : 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300 text-slate-700'
                    }`}>
                      {dealer.name ? dealer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'SR'}
                    </div>

                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-accent-main)] text-slate-950 flex items-center justify-center border-2 border-white dark:border-[#090d16] shadow-sm">
                      <Check size={10} className="stroke-[4]" />
                    </span>
                  </div>

                  {/* Showroom name with typography */}
                  <div className="space-y-0.5">
                    <h3 className="text-base sm:text-lg font-black font-display tracking-tight uppercase line-clamp-1 leading-tight">
                      {dealer.name}
                    </h3>
                    <p className={`text-[8.5px] font-mono tracking-widest uppercase line-clamp-1 font-bold ${cardTheme === 'dark' ? 'text-text-muted' : 'text-text-muted'}`}>
                      {dealer.subtitle || 'Verified Premium Dealership'}
                    </p>
                  </div>
                </div>

                {/* Card Front Footer details - NO UNITS STOCKED */}
                <div className={`flex items-center justify-between border-t ${currentStyle.borderLine} pt-3 mt-1 text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 z-10`}>
                  <span className="flex items-center gap-1 text-[var(--color-accent-main)]">
                    <ShieldCheck size={11} className="stroke-[2.5]" /> Verified Dealership
                  </span>
                  <span className="flex items-center gap-1 text-sky-500">
                    <Sparkles size={11} /> Est. 2024
                  </span>
                </div>

                {/* Tiny Flip Tip overlay icon */}
                <div className="absolute bottom-3 right-3 opacity-30 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <Rotate3d size={12} />
                </div>
              </div>

              {/* Card Back face */}
              <div 
                ref={backRef}
                className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[24px] border p-5 flex justify-between gap-4 transition-all duration-300 ${currentStyle.cardBg}`}
              >
                <div className={`absolute inset-0 ${currentStyle.decorOverlay} [background-size:16px_16px] pointer-events-none rounded-[24px]`} />

                {/* LEFT: Contact profile (62% width) */}
                <div className="flex flex-col justify-between w-[62%] h-full text-left z-10">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest block text-orange-500">
                      Official Contact Pass
                    </span>

                    {dealer.contactPerson ? (
                      <div className="space-y-0.5 mt-1.5">
                        <h4 className="text-sm font-black font-display uppercase tracking-tight leading-none">
                          {dealer.contactPerson}
                        </h4>
                        {((dealer as any).designation || (dealer as any).contactDesignation) && (
                          <span className="text-[7.5px] font-mono uppercase tracking-wider text-sky-500 font-extrabold block">
                            {(dealer as any).designation || (dealer as any).contactDesignation}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-0.5 mt-1.5">
                        <h4 className="text-sm font-black font-display uppercase tracking-tight leading-none">
                          Showroom Executive
                        </h4>
                        <span className="text-[7.5px] font-mono uppercase tracking-wider text-sky-500 font-extrabold block">
                          Sales Department
                        </span>
                      </div>
                    )}

                    <div className="w-10 h-0.5 bg-orange-500 my-1 rounded" />
                  </div>

                  {/* Interactive Dynamic Numbers & Location triggers */}
                  <div className="space-y-1.5 text-[9px] font-sans">
                    {dealer.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} className="text-orange-400 shrink-0" />
                        <span className={`font-mono font-bold leading-none ${cardTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {dealer.phone}
                        </span>
                      </div>
                    )}
                    {dealer.whatsapp && (
                      <div className="flex items-center gap-1.5">
                        <MessageCircle size={11} className="text-emerald-400 shrink-0" />
                        <span className={`font-mono font-bold leading-none ${cardTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {dealer.whatsapp}
                        </span>
                      </div>
                    )}
                    {dealer.location && (
                      <div className="flex items-start gap-1.5 max-w-[220px]">
                        <MapPin size={11} className="text-orange-400 shrink-0 mt-0.5" />
                        <span className={`line-clamp-2 leading-snug font-sans font-bold text-[8.5px] ${cardTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                          {dealer.location}
                        </span>
                      </div>
                    )}
                    
                    {/* Website and Socials (If Available) */}
                    {dealer.socials?.website && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <Globe size={11} className="text-orange-400 shrink-0" />
                        <span className={`font-mono font-bold leading-none text-[8.5px] truncate max-w-[180px] ${cardTheme === 'dark' ? 'text-sky-300' : 'text-sky-600'}`}>
                          {dealer.socials.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2.5 pt-1">
                      {dealer.socials?.facebook && (
                        <Facebook size={12} className={cardTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'} />
                      )}
                      {dealer.socials?.instagram && (
                        <Instagram size={12} className={cardTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'} />
                      )}
                      {dealer.socials?.youtube && (
                        <Youtube size={12} className={cardTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'} />
                      )}
                      {dealer.socials?.tiktok && (
                        <span className={`font-extrabold font-display text-[9px] uppercase tracking-tighter ${cardTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          TikTok
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`text-[7.5px] font-mono font-bold tracking-widest pt-1 border-t ${currentStyle.borderLine} uppercase text-[var(--color-text-muted)]`}>
                    POWERED BY BAZAR360.ONLINE
                  </div>
                </div>

                {/* RIGHT: High-resolution QR Code (35% width) */}
                <div className={`w-[35%] flex flex-col items-center justify-between h-full z-10 shrink-0 text-center border-l ${currentStyle.borderLine} pl-3`}>
                  <div className="my-auto flex flex-col items-center space-y-1.5">
                    {/* QR block encapsulated in clear white border to guarantee contrast scan */}
                    <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 transition-transform duration-300 hover:scale-105">
                      <QRCodeCanvas 
                        value={showroomUrl}
                        size={82}
                        bgColor="#ffffff"
                        fgColor="#080c14"
                        level="H" // High error tolerance
                        includeMargin={false}
                      />
                    </div>
                    
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono font-black uppercase tracking-wider text-orange-500 block">
                        Scan to View
                      </span>
                      <span className={`text-[6.5px] font-sans font-medium uppercase tracking-tight block ${cardTheme === 'dark' ? 'text-text-muted' : 'text-text-muted'}`}>
                        Live Stock List
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SIDE-BY-SIDE SPLIT VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl justify-items-center">
            {/* Front side card */}
            <div 
              className={`w-full max-w-[450px] aspect-[1.636] rounded-[24px] border p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${currentStyle.cardBg}`}
            >
              <div className={`absolute inset-0 ${currentStyle.decorOverlay} [background-size:12px_12px] pointer-events-none rounded-[24px]`} />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 border-4 border-current opacity-5 rounded-full pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center">
                  <img 
                    src={getBazarLogoSrc()} 
                    alt="Bazar360 Logo" 
                    className="h-8 w-auto object-contain rounded-md"
                    crossOrigin="anonymous" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className={`text-[8px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border shrink-0 ${currentStyle.badge}`}>
                  Partner
                </span>
              </div>

              {/* Showroom Identity */}
              <div className="flex flex-col items-center justify-center text-center space-y-2 z-10">
                <div className="relative flex items-center justify-center">
                  <img 
                    src={getShowroomLogoSrc()} 
                    alt={dealer.name} 
                    className={`w-14 h-14 rounded-2xl object-contain bg-white border shadow p-1.5 ${
                      cardTheme === 'dark' ? 'border-white/10' : 'border-slate-200'
                    }`}
                    crossOrigin="anonymous" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-accent-main)] text-slate-950 flex items-center justify-center border-2 border-white dark:border-[#090d16] shadow-sm">
                    <Check size={10} className="stroke-[4]" />
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-base font-black font-display tracking-tight uppercase line-clamp-1 leading-tight">
                    {dealer.name}
                  </h3>
                  <p className={`text-[8px] font-mono tracking-widest uppercase line-clamp-1 font-bold ${cardTheme === 'dark' ? 'text-text-muted' : 'text-text-muted'}`}>
                    {dealer.subtitle || 'Verified Premium Dealership'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className={`flex items-center justify-between border-t ${currentStyle.borderLine} pt-3 text-[9px] font-mono font-bold uppercase tracking-wider z-10`}>
                <span className="flex items-center gap-1 text-[var(--color-accent-main)]">
                  <ShieldCheck size={11} className="stroke-[2.5]" /> Verified Dealership
                </span>
                <span className="flex items-center gap-1 text-sky-500">
                  <Sparkles size={11} /> Est. 2024
                </span>
              </div>
            </div>

            {/* Back side card */}
            <div 
              className={`w-full max-w-[450px] aspect-[1.636] rounded-[24px] border p-5 flex justify-between gap-4 relative overflow-hidden transition-all duration-300 ${currentStyle.cardBg}`}
            >
              <div className={`absolute inset-0 ${currentStyle.decorOverlay} [background-size:16px_16px] pointer-events-none rounded-[24px]`} />

              {/* LEFT: Profile (62%) */}
              <div className="flex flex-col justify-between w-[62%] h-full text-left z-10">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest block text-orange-500">
                    Official Contact Pass
                  </span>

                  {dealer.contactPerson ? (
                    <div className="space-y-0.5 mt-1.5">
                      <h4 className="text-sm font-black font-display uppercase tracking-tight leading-none">
                        {dealer.contactPerson}
                      </h4>
                      {((dealer as any).designation || (dealer as any).contactDesignation) && (
                        <span className="text-[7.5px] font-mono uppercase tracking-wider text-sky-500 font-extrabold block">
                          {(dealer as any).designation || (dealer as any).contactDesignation}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-0.5 mt-1.5">
                      <h4 className="text-sm font-black font-display uppercase tracking-tight leading-none">
                        Showroom Executive
                      </h4>
                      <span className="text-[7.5px] font-mono uppercase tracking-wider text-sky-500 font-extrabold block">
                        Sales Department
                      </span>
                    </div>
                  )}

                  <div className="w-10 h-0.5 bg-orange-500 my-1 rounded" />
                </div>

                <div className="space-y-1.5 text-[8.5px] font-sans">
                  {dealer.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={10} className="text-orange-500 shrink-0" />
                      <span className="font-mono leading-none">{dealer.phone}</span>
                    </div>
                  )}
                  {dealer.whatsapp && (
                    <div className="flex items-center gap-1.5">
                      <MessageCircle size={10} className="text-[var(--color-accent-main)] shrink-0" />
                      <span className="font-mono leading-none">{dealer.whatsapp}</span>
                    </div>
                  )}
                  {dealer.location && (
                    <div className="flex items-start gap-1.5 max-w-[210px]">
                      <MapPin size={10} className="text-orange-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-snug font-sans text-[var(--color-text-muted)]">
                        {dealer.location}
                      </span>
                    </div>
                  )}

                  {/* Website and Socials (If Available) */}
                  {dealer.socials?.website && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Globe size={10} className="text-orange-500 shrink-0" />
                      <span className={`font-mono font-bold leading-none text-[8px] truncate max-w-[180px] ${cardTheme === 'dark' ? 'text-sky-300' : 'text-sky-600'}`}>
                        {dealer.socials.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-0.5">
                    {dealer.socials?.facebook && (
                      <Facebook size={11} className={cardTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'} />
                    )}
                    {dealer.socials?.instagram && (
                      <Instagram size={11} className={cardTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'} />
                    )}
                    {dealer.socials?.youtube && (
                      <Youtube size={11} className={cardTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'} />
                    )}
                    {dealer.socials?.tiktok && (
                      <span className={`font-extrabold font-display text-[8.5px] uppercase tracking-tighter ${cardTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        TikTok
                      </span>
                    )}
                  </div>
                </div>

                <div className={`text-[7.5px] font-mono font-bold tracking-widest pt-1 border-t ${currentStyle.borderLine} uppercase text-[var(--color-text-muted)]`}>
                  POWERED BY BAZAR360.ONLINE
                </div>
              </div>

              {/* RIGHT: QR code block */}
              <div className={`w-[35%] flex flex-col items-center justify-between h-full z-10 shrink-0 text-center border-l ${currentStyle.borderLine} pl-3`}>
                <div className="my-auto flex flex-col items-center space-y-1.5">
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow shadow-slate-200">
                    <QRCodeCanvas 
                      value={showroomUrl}
                      size={82}
                      bgColor="#ffffff"
                      fgColor="#080c14"
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider text-orange-500 block">
                      Scan to View
                    </span>
                    <span className={`text-[6.5px] font-sans font-medium uppercase tracking-tight block ${cardTheme === 'dark' ? 'text-text-muted' : 'text-text-muted'}`}>
                      Live Stock List
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK TAP ACTIONS FOR SMARTPHONES (Touch Targets >= 44px) */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-sm">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-extrabold text-orange-500 uppercase tracking-widest">
            Direct Connect Suite
          </span>
          <p className="text-xs text-[var(--color-text-muted)] font-sans">
            Tappable buttons optimized for immediate mobile call routing and secure negotiations.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {dealer.whatsapp && (
            <a
              href={`https://wa.me/${dealer.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, I scanned your business card on Bazar360.online and want to view your stock.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 h-11 rounded-xl bg-emerald-600 hover:bg-[var(--color-accent-main)] text-[var(--color-text-header)] font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
          )}
          {dealer.phone && (
            <a
              href={`tel:${dealer.phone.replace(/[^0-9+]/g, '')}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-[var(--color-text-header)] font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              <Phone size={15} /> Call Showroom
            </a>
          )}
        </div>
      </div>

      {/* REBUILT DOWNLOAD & SHARE ACTIONS */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => handleDownloadPNG('front')}
          disabled={downloading}
          className="px-4 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-main)] font-bold text-[11px] uppercase tracking-wider border border-[var(--color-border-main)] cursor-pointer transition-all flex items-center gap-1.5 shadow active:scale-95"
        >
          <Download size={13} className="text-orange-500" /> Save Front Face (PNG)
        </button>

        <button
          onClick={() => handleDownloadPNG('back')}
          disabled={downloading}
          className="px-4 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-main)] font-bold text-[11px] uppercase tracking-wider border border-[var(--color-border-main)] cursor-pointer transition-all flex items-center gap-1.5 shadow active:scale-95"
        >
          <Download size={13} className="text-orange-500" /> Save Back Face (PNG)
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="px-4 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-main)] font-bold text-[11px] uppercase tracking-wider border border-[var(--color-border-main)] cursor-pointer transition-all flex items-center gap-1.5 shadow active:scale-95"
        >
          <FileText size={13} className="text-orange-500" /> Print Double-Sided (PDF)
        </button>

        <button
          onClick={handleSaveVCard}
          className="px-4 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-main)] font-bold text-[11px] uppercase tracking-wider border border-[var(--color-border-main)] cursor-pointer transition-all flex items-center gap-1.5 shadow active:scale-95"
        >
          <User size={13} className="text-orange-500" /> Download Contact vCard
        </button>

        <button
          onClick={handleShare}
          className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-[var(--color-text-header)] font-bold text-[11px] uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 shadow active:scale-95"
        >
          <Share2 size={13} /> Share Card Link
        </button>
      </div>
    </div>
  );
};
