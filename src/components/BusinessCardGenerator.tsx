import React, { useState, useRef, useEffect } from 'react';
import { Download, Phone, Mail, MapPin, Loader2, Share2, Check, CreditCard, Layers, Edit3, Save, RefreshCw, UserCheck, Sparkles, Building2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { Dealer } from '../types';
import { GlassCard } from './GlassCard';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface BusinessCardGeneratorProps {
  dealer: Dealer;
  onUpdateDealer?: (updated: Dealer) => void;
}

// Vector Car Silhouette Logo
const CarSilhouette: React.FC<{ className?: string }> = ({ className = 'w-24 h-10' }) => (
  <svg className={className} viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M10 42 C 22 42, 24 33, 34 33 C 44 33, 46 42, 58 42 L 102 42 C 114 42, 116 33, 126 33 C 136 33, 138 42, 150 42 L 155 42 L 155 38 C 155 35, 150 31, 142 30 C 130 28, 115 25, 102 21 C 94 18, 86 11, 74 11 L 44 11 C 34 11, 26 18, 18 22 L 6 28 C 4 29, 3 32, 3 35 L 3 42 Z" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M48 11 L 42 22 L 72 22 L 72 11 Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinejoin="round" 
    />
    <path 
      d="M78 11 L 78 22 L 96 22 L 91 16 C 89 13, 85 11, 81 11 Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinejoin="round" 
    />
    <circle cx="34" cy="42" r="7" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <circle cx="126" cy="42" r="7" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <path d="M12 48 L 148 48" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
  </svg>
);

// Vector Infinity Loop for Bazar360.online Logo
const InfinityLogo: React.FC<{ className?: string; isNight?: boolean }> = ({ className = 'w-16 h-10', isNight = false }) => (
  <svg className={className} viewBox="0 0 100 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardBlueLoop" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0072FF" />
        <stop offset="100%" stopColor="#00D2FF" />
      </linearGradient>
      <linearGradient id="cardOrangeLoop" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF4B2B" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
    </defs>
    <path 
      d="M 30 22.5 C 15 7.5, 5 22.5, 15 37.5 C 25 47.5, 35 15, 50 22.5 C 65 30, 75 7.5, 85 22.5 C 95 37.5, 85 47.5, 70 37.5 C 55 27.5, 45 37.5, 30 22.5 Z" 
      stroke="url(#cardBlueLoop)" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      opacity={isNight ? 1.0 : 0.85}
    />
    <path 
      d="M 50 22.5 C 65 30, 75 7.5, 85 22.5 C 95 37.5, 85 47.5, 70 37.5 C 55 27.5, 45 37.5, 30 22.5" 
      stroke="url(#cardOrangeLoop)" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      opacity={isNight ? 1.0 : 0.85}
    />
  </svg>
);

export const BusinessCardGenerator: React.FC<BusinessCardGeneratorProps> = ({ dealer, onUpdateDealer }) => {
  const [activeTemplate, setActiveTemplate] = useState<'metal' | 'horizon' | 'night' | 'grid'>('metal');
  const [loading, setLoading] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [downloadingSheet, setDownloadingSheet] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // Editable Card Contact Fields
  const [cardData, setCardData] = useState({
    showroomName: dealer.name || 'Auto Choice',
    slogan: dealer.subtitle || 'Slogans slogans slogans.',
    tagline: dealer.tagline || '100% Verified Quality Vehicles',
    contactPerson: dealer.contactPerson || 'Malak Mazhar',
    contactRole: 'Owner & Partner',
    phone1: dealer.phone || '+92 346 9085033',
    phone2: dealer.whatsapp || '+92 315 9085086',
    email: dealer.email || 'Mazharsouls@gmail.com',
    location: dealer.location || 'Main G.T. Road, Near Askari Bank, Lahore, Pakistan',
    websiteUrl: `${window.location.origin}/dealers/${dealer.id}`,
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const fullSheetRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(850);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scaleFactor = Math.min(1, (containerWidth - 32) / 850);

  // Save changes to Firestore and parent state
  const handleSaveCardInfo = async () => {
    setSavingDetails(true);
    try {
      const updatedDealer: Dealer = {
        ...dealer,
        name: cardData.showroomName,
        subtitle: cardData.slogan,
        tagline: cardData.tagline,
        contactPerson: cardData.contactPerson,
        phone: cardData.phone1,
        whatsapp: cardData.phone2,
        email: cardData.email,
        location: cardData.location,
      };

      // Firestore persistence
      try {
        const dealerRef = doc(db, 'dealers', dealer.id);
        await setDoc(dealerRef, {
          name: cardData.showroomName,
          subtitle: cardData.slogan,
          tagline: cardData.tagline,
          contactPerson: cardData.contactPerson,
          phone: cardData.phone1,
          whatsapp: cardData.phone2,
          email: cardData.email,
          location: cardData.location,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore update warning:', err);
      }

      if (onUpdateDealer) {
        onUpdateDealer(updatedDealer);
      }

      toast.success('Business card details updated & saved successfully!');
      setIsEditingInfo(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save business card details.');
    } finally {
      setSavingDetails(false);
    }
  };

  const getTemplateStyle = (template: string) => {
    switch (template) {
      case 'metal': 
        return 'bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#0F172A] text-white border-[#475569] shadow-2xl relative overflow-hidden';
      case 'horizon': 
        return 'bg-[#FDFBF7] text-[#1E1E1E] border-[#E2E8F0] shadow-xl relative overflow-hidden';
      case 'night': 
        return 'bg-[#020205] text-white border-cyan-500/25 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden';
      case 'grid': 
        return 'bg-slate-50 text-slate-900 border-[#CBD5E1] bg-[linear-gradient(to_right,#0284c715_1px,transparent_1px),linear-gradient(to_bottom,#0284c715_1px,transparent_1px)] bg-[size:16px_16px] shadow-lg relative overflow-hidden';
      default: 
        return 'bg-white';
    }
  };

  // Single card download
  const handleDownloadSingle = async (format: 'png' | 'pdf') => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3.5 });
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `business-card-${dealer.id}-${activeTemplate}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`business-card-${dealer.id}-${activeTemplate}.pdf`);
      }
      toast.success(`Business Card ${format.toUpperCase()} downloaded!`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download business card.');
    } finally {
      setLoading(false);
    }
  };

  // Download complete 4-Card Design Options Sheet matching Image 7
  const handleDownloadCompleteSheet = async (format: 'png' | 'pdf') => {
    if (!fullSheetRef.current) return;
    setDownloadingSheet(true);
    try {
      const canvas = await html2canvas(fullSheetRef.current, { 
        scale: 2.5,
        backgroundColor: '#E2E8F0',
        useCORS: true,
        allowTaint: true
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `business-card-design-options-${dealer.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`business-card-design-options-${dealer.id}.pdf`);
      }
      toast.success(`Complete Business Card Options Sheet (${format.toUpperCase()}) downloaded!`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate complete options sheet.');
    } finally {
      setDownloadingSheet(false);
    }
  };

  // Render individual card inner matching Image 7 design specification
  const renderCardInner = (tmpl: 'metal' | 'horizon' | 'night' | 'grid', optionNumber?: string) => {
    return (
      <div 
        className={`w-[820px] h-[460px] rounded-[24px] p-9 relative border ${getTemplateStyle(tmpl)} flex flex-col justify-between text-left transition-all duration-300 shrink-0 select-none`}
      >
        {/* Brushed metallic glare / golden accents for Executive Metal */}
        {tmpl === 'metal' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none mix-blend-overlay opacity-40" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 w-32 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />
          </>
        )}

        {/* Minimalist Horizon warm organic accents */}
        {tmpl === 'horizon' && (
          <>
            <div className="absolute top-0 right-0 w-44 h-44 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-16 right-12 w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 opacity-20 blur-xl pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-1.5 h-16 bg-orange-500 rounded-r-full pointer-events-none" />
          </>
        )}

        {/* Night Driver Cyan Streak Glow & backlights */}
        {tmpl === 'night' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -bottom-10 -left-10 w-96 h-96 rounded-full bg-cyan-500/10 blur-[95px]" />
            <div className="absolute top-0 right-0 w-85 h-85 rounded-full bg-orange-500/5 blur-[85px]" />
            <div className="absolute bottom-12 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30" />
            <div className="absolute top-4 left-4 text-[7px] font-mono tracking-widest text-cyan-400/20 uppercase">
              // NIGHT_DRIVE_PASS //
            </div>
          </div>
        )}

        {/* Architectural Grid blueprint measurements and details */}
        {tmpl === 'grid' && (
          <>
            <div className="absolute top-3 left-4 text-[8px] font-mono text-sky-600/30 tracking-widest">
              W: 820px | H: 460px
            </div>
            <div className="absolute bottom-3 right-4 text-[8px] font-mono text-sky-600/30 tracking-widest">
              GRID_SYSTEM_V2.1
            </div>
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-sky-600/10 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/3 w-[1px] bg-sky-600/10 pointer-events-none" />
          </>
        )}

        {/* TOP ROW: SHOWROOM BRANDING (LEFT) & AUTO CHOICE WEB PLATFORM BRAND (RIGHT) */}
        <div className="flex items-start justify-between w-full relative z-10">
          
          {/* Top Left: Showroom Logo and Name */}
          <div className="flex items-center gap-3.5">
            <div className={`p-2 rounded-2xl flex items-center justify-center ${
              tmpl === 'night' ? 'text-cyan-400 bg-cyan-950/20' : tmpl === 'metal' ? 'text-amber-500 bg-amber-950/20' : 'text-orange-500 bg-orange-50'
            }`}>
              <CarSilhouette className="h-8 w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <h2 className={`text-2xl font-black uppercase tracking-[0.1em] leading-none ${
                tmpl === 'night' ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300' : tmpl === 'metal' ? 'text-white' : 'text-slate-900'
              }`}>
                {cardData.showroomName}
              </h2>
              <p className={`text-[10px] font-sans font-extrabold uppercase tracking-[0.15em] mt-1.5 ${
                tmpl === 'night' ? 'text-cyan-400' : tmpl === 'metal' ? 'text-amber-400/80' : 'text-orange-600'
              }`}>
                {cardData.slogan}
              </p>
            </div>
          </div>

          {/* Top Right: Bazar360.online Branding Loop */}
          <div className="flex items-center gap-2">
            <InfinityLogo className="w-11 h-7" isNight={tmpl === 'night'} />
            <div className="flex flex-col text-left leading-none">
              <span className={`text-base font-black tracking-tight uppercase leading-none ${
                tmpl === 'night' ? 'text-white' : tmpl === 'metal' ? 'text-white' : 'text-slate-900'
              }`}>
                Bazar360<span className="text-orange-500 font-extrabold">.online</span>
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: CUSTOM SHOWROOM TAGLINE / PROMOTIONAL MESSAGE */}
        {cardData.tagline && (
          <div className="w-full relative z-10 flex justify-center py-2 -my-2">
            <div className={`px-4 py-1.5 rounded-full border flex items-center gap-1.5 shadow-sm transition-all duration-300 ${
              tmpl === 'night'
                ? 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400'
                : tmpl === 'metal'
                ? 'bg-slate-800/40 border-amber-500/20 text-amber-400'
                : tmpl === 'grid'
                ? 'bg-slate-100/80 border-slate-300 text-slate-700 font-mono'
                : 'bg-orange-50/80 border-orange-200/50 text-orange-600'
            }`}>
              <Sparkles size={11} className={tmpl === 'night' ? 'text-cyan-400 animate-pulse' : tmpl === 'metal' ? 'text-amber-400' : 'text-orange-500'} />
              <span className="text-[10px] font-bold tracking-wider uppercase font-sans whitespace-nowrap">
                {cardData.tagline}
              </span>
            </div>
          </div>
        )}

        {/* BOTTOM ROW: QR CODE (LEFT) & CONTACT PERSON DETAILS (RIGHT) */}
        <div className="flex items-end justify-between w-full relative z-10 pt-5 border-t border-slate-200/10 dark:border-white/5">
          
          {/* Bottom Left: Crisp QR Code Frame */}
          <div className="flex flex-col items-start gap-1.5">
            <div className={`p-2.5 rounded-[1.25rem] bg-white shadow-xl border ${
              tmpl === 'night' 
                ? 'shadow-[0_0_20px_rgba(6,182,212,0.4)] border-cyan-400/30' 
                : tmpl === 'metal'
                ? 'border-slate-600 shadow-inner'
                : 'border-slate-200/80'
            }`}>
              <QRCodeCanvas 
                value={cardData.websiteUrl} 
                size={90}
                level="H"
              />
            </div>
            <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ml-1 ${
              tmpl === 'night' ? 'text-cyan-400/80' : tmpl === 'metal' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Scan Showroom Code
            </span>
          </div>

          {/* Bottom Right: Contact Person & Info */}
          <div className="text-right space-y-2.5 max-w-[420px]">
            <div>
              <h3 className={`text-xl font-extrabold tracking-tight uppercase leading-none ${
                tmpl === 'night' ? 'text-white' : tmpl === 'metal' ? 'text-white' : 'text-slate-900'
              }`}>
                {cardData.contactPerson}
              </h3>
              <p className={`text-[10px] font-extrabold tracking-wider uppercase mt-1 ${
                tmpl === 'night' ? 'text-cyan-400' : tmpl === 'metal' ? 'text-amber-500' : 'text-orange-600'
              }`}>
                {cardData.contactRole}
              </p>
            </div>

            <div className={`space-y-1 text-[11px] font-bold font-mono ${
              tmpl === 'night' ? 'text-slate-300' : tmpl === 'metal' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <p className="flex items-center justify-end gap-2 leading-none">
                <span>{cardData.phone1}</span>
                <Phone size={11} className={`opacity-85 ${tmpl === 'night' ? 'text-cyan-400' : tmpl === 'metal' ? 'text-amber-500' : 'text-orange-600'}`} />
              </p>
              {cardData.phone2 && (
                <p className="flex items-center justify-end gap-2 leading-none">
                  <span>{cardData.phone2}</span>
                  <Phone size={11} className={`opacity-85 ${tmpl === 'night' ? 'text-cyan-400' : tmpl === 'metal' ? 'text-amber-500' : 'text-orange-600'}`} />
                </p>
              )}
              <p className="flex items-center justify-end gap-2 leading-none">
                <span>{cardData.email}</span>
                <Mail size={11} className={`opacity-85 ${tmpl === 'night' ? 'text-cyan-400' : tmpl === 'metal' ? 'text-amber-500' : 'text-orange-600'}`} />
              </p>
              <p className="flex items-start justify-end gap-2 text-[10px] leading-tight">
                <span className="max-w-[280px]">{cardData.location}</span>
                <MapPin size={11} className={`opacity-85 shrink-0 mt-0.5 ${tmpl === 'night' ? 'text-cyan-400' : tmpl === 'metal' ? 'text-amber-500' : 'text-orange-600'}`} />
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const templatesInfo = [
    { id: 'metal' as const, num: '5. Executive Metal', desc: 'Platinum brushed steel gradient with metallic QR frame.' },
    { id: 'horizon' as const, num: '6. Minimalist Horizon', desc: 'Clean white card layout with crisp black typography.' },
    { id: 'night' as const, num: '7. Night Driver', desc: 'Dark obsidian card with glowing cyan/neon light streaks.' },
    { id: 'grid' as const, num: '8. Architectural Grid', desc: 'Subtle technical graph paper background with navy accents.' }
  ];

  return (
    <div className="space-y-10" id="business-card-module">

      {/* TOP BAR & EDIT CONTACT INFORMATION ACCORDION */}
      <GlassCard className="p-6 md:p-8 space-y-6 border border-[var(--color-border-main)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border-main)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <CreditCard size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-text-header)]">
                Showroom Business Card Options
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] font-mono">
                Generated corporate business cards matching exact showroom options.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditingInfo(!isEditingInfo)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-xs font-bold text-[var(--color-text-main)] hover:border-orange-500 transition cursor-pointer"
            >
              <Edit3 size={14} className="text-orange-500" />
              <span>{isEditingInfo ? 'Close Editor' : 'Edit Business Information'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadCompleteSheet('png')}
              disabled={downloadingSheet}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-orange-600 transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {downloadingSheet ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
              <span>Download All Options Sheet</span>
            </button>
          </div>
        </div>

        {/* EDIT CONTACT INFORMATION PANEL */}
        {isEditingInfo && (
          <div className="p-6 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-main)] flex items-center gap-2">
                <UserCheck size={16} className="text-orange-500" />
                Update Business Card Details
              </h3>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                Updates instant live preview on all 4 card styles below
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Showroom Name</label>
                <input 
                  type="text" 
                  value={cardData.showroomName}
                  onChange={(e) => setCardData({...cardData, showroomName: e.target.value})}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Showroom Slogan / Tagline</label>
                <input 
                  type="text" 
                  value={cardData.slogan}
                  onChange={(e) => setCardData({...cardData, slogan: e.target.value})}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Custom Showroom Tagline / Promo Message</label>
                <input 
                  type="text" 
                  value={cardData.tagline}
                  onChange={(e) => setCardData({...cardData, tagline: e.target.value})}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                  placeholder="e.g. 100% Verified Quality Vehicles"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Contact Person</label>
                <input 
                  type="text" 
                  value={cardData.contactPerson}
                  onChange={(e) => setCardData({...cardData, contactPerson: e.target.value})}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Role / Title</label>
                <input 
                  type="text" 
                  value={cardData.contactRole}
                  onChange={(e) => setCardData({...cardData, contactRole: e.target.value})}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Primary Phone</label>
                <input 
                  type="text" 
                  value={cardData.phone1}
                  onChange={(e) => setCardData({...cardData, phone1: e.target.value})}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Secondary Phone</label>
                <input 
                  type="text" 
                  value={cardData.phone2}
                  onChange={(e) => setCardData({...cardData, phone2: e.target.value})}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={cardData.email}
                  onChange={(e) => setCardData({...cardData, email: e.target.value})}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Location Address</label>
                <input 
                  type="text" 
                  value={cardData.location}
                  onChange={(e) => setCardData({...cardData, location: e.target.value})}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveCardInfo}
                disabled={savingDetails}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 text-slate-950 font-black text-xs uppercase hover:bg-orange-600 transition cursor-pointer disabled:opacity-50"
              >
                {savingDetails ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                <span>Save Business Info</span>
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* COMPLETE 4-OPTION DESIGN SHEET (MATCHING ATTACHED IMAGE 7) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="text-orange-500" size={20} />
            <h3 className="text-lg font-black uppercase tracking-wider text-[var(--color-text-header)]">
              Business Card Design Options
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadCompleteSheet('png')}
              disabled={downloadingSheet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-xs font-bold text-[var(--color-text-main)] hover:border-orange-500 transition cursor-pointer"
            >
              <Download size={12} className="text-orange-500" />
              <span>Download PNG Sheet</span>
            </button>
            <button
              onClick={() => handleDownloadCompleteSheet('pdf')}
              disabled={downloadingSheet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-xs font-bold text-[var(--color-text-main)] hover:border-orange-500 transition cursor-pointer"
            >
              <Download size={12} className="text-orange-500" />
              <span>Download PDF Sheet</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE / DOWNLOADABLE SHEET CANVAS */}
        <div className="overflow-x-auto pb-4">
          <div 
            ref={fullSheetRef}
            className="min-w-[1000px] p-10 bg-slate-200 dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 space-y-8 text-slate-900 dark:text-white shadow-2xl"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-400 dark:border-slate-700 pb-4">
              <h1 className="text-2xl font-black tracking-widest uppercase text-slate-900 dark:text-white">
                BUSINESS CARD DESIGN OPTIONS
              </h1>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <CarSilhouette className="h-6 w-auto" />
                  <span className="font-black text-sm uppercase">{cardData.showroomName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <InfinityLogo className="w-8 h-5" />
                  <span className="font-black text-sm uppercase">Bazar360.online</span>
                </div>
              </div>
            </div>

            {/* 2x2 Grid of the 4 Business Card Design Options */}
            <div className="grid grid-cols-2 gap-8 items-center justify-items-center">
              {templatesInfo.map((tmpl) => (
                <div key={tmpl.id} className="space-y-2 text-center w-full flex flex-col items-center">
                  {/* Scaled Preview Box */}
                  <div 
                    onClick={() => setActiveTemplate(tmpl.id)}
                    className={`cursor-pointer transition-all duration-300 rounded-[26px] p-2 border-2 ${
                      activeTemplate === tmpl.id 
                        ? 'border-orange-500 shadow-2xl scale-[1.01]' 
                        : 'border-transparent hover:border-slate-400'
                    }`}
                  >
                    {renderCardInner(tmpl.id, tmpl.num)}
                  </div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {tmpl.num}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE ACTIVE CARD STAGE & INDIVIDUAL DOWNLOAD */}
      <GlassCard className="p-8 space-y-6 border border-[var(--color-border-main)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-orange-500" size={18} />
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-header)]">
              Active High-Res Single Card Stage: {templatesInfo.find(t => t.id === activeTemplate)?.num}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {templatesInfo.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTemplate === t.id 
                    ? 'bg-orange-500 text-slate-950 font-black' 
                    : 'bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                {t.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Scaled viewport container for single active card */}
        <div ref={containerRef} className="flex justify-center py-4 overflow-hidden">
          <div 
            style={{ 
              width: '820px', 
              height: `${460 * scaleFactor}px`, 
              position: 'relative' 
            }}
          >
            <div 
              style={{ 
                transform: `scale(${scaleFactor})`, 
                transformOrigin: 'top left',
                width: '820px',
                height: '460px',
                position: 'absolute'
              }}
            >
              <div ref={cardRef}>
                {renderCardInner(activeTemplate)}
              </div>
            </div>
          </div>
        </div>

        {/* Single Card Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border-main)] pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownloadSingle('png')}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black uppercase tracking-wider hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
              <span>Download Active Card (PNG)</span>
            </button>

            <button
              onClick={() => handleDownloadSingle('pdf')}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] text-xs font-black uppercase tracking-wider hover:border-orange-500 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
              <span>Download Active Card (PDF)</span>
            </button>
          </div>

          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
            Full rights enabled: Edit, save, add & download all card parameters
          </span>
        </div>
      </GlassCard>
    </div>
  );
};
