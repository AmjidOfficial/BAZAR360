import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { jsPDF } from 'jspdf';
import { CarListing, Dealer } from '../types';
import { useCurrencyMode } from '../lib/currency';
import { ArrowLeft, Image as ImageIcon, MapPin, Share2, ShieldCheck, CheckCircle2, Gauge, Calendar, Droplet, Cog, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Lightbox } from './Lightbox';

interface VehicleDetailProps {
  car: CarListing;
  dealer: Dealer;
  onClose?: () => void;
}

export function VehicleDetail({ car, dealer, onClose }: VehicleDetailProps) {
  const navigate = useNavigate();
  const { renderPrice } = useCurrencyMode();

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  useEffect(() => {
    setActiveMedia({
      type: 'image',
      url: car.imageUrl || (car.images && car.images[0]) || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80'
    });
  }, [car]);

  const videoUrl = car.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-car-headlights-in-the-dark-34440-large.mp4";

  const imagesList = useMemo(() => {
    if (car.images && car.images.length > 0) {
      return car.images;
    }
    if (car.imageUrl) {
      return [car.imageUrl];
    }
    return ['https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80'];
  }, [car.images, car.imageUrl]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleShare = async () => {
    const shareText = `Check out this ${car.title} (${car.year}) on Bazar360 for ${renderPrice(car.price)}!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: car.title,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('[Web Share API] Failed to share:', error);
          toast.error('Could not share vehicle details.');
        }
      }
    } else {
      // Fallback: clipboard copy
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Vehicle link copied to clipboard!');
      } catch (err) {
        console.error('[Clipboard] Failed to copy link:', err);
        toast.error('Failed to copy link.');
      }
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const formattedWhatsapp = (dealer.whatsapp || '').replace(/\D/g, '');

  const vehicleSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Car',
      name: car.title,
      description: car.description || `${car.year} ${car.make} ${car.model} available at ${dealer?.name || 'Bazar360'}`,
      image: imagesList[0],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'PKR',
        price: car.price,
        itemCondition: car.condition === 'Used' ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'AutoDealer',
          name: dealer?.name || 'Auto Choice Bazar360',
          telephone: dealer?.phone || '+923149198403'
        }
      },
      brand: {
        '@type': 'Brand',
        name: car.make || 'Automotive'
      },
      model: car.model,
      productionDate: car.year ? String(car.year) : undefined,
      mileageFromOdometer: car.mileage ? {
        '@type': 'QuantitativeValue',
        value: car.mileage,
        unitCode: 'KMT'
      } : undefined
    };
  }, [car, dealer, imagesList]);

  const handleDownloadFactSheet = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('BAZAR360.ONLINE', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(255, 107, 0);
      doc.text('OFFICIAL VEHICLE FACT SHEET & INSPECTION REPORT', 14, 30);
      
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(18);
      doc.text(car.title, 14, 55);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(`Model Year: ${car.year} | Mileage: ${car.mileage?.toLocaleString() || 'N/A'} km`, 14, 63);
      doc.text(`Asking Price: PKR ${car.price.toLocaleString()}`, 14, 71);
      
      doc.setLineWidth(0.5);
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 78, 196, 78);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Vehicle Specifications', 14, 90);
      
      const specs = [
        ['Make / Model:', `${car.make} ${car.model}`],
        ['Condition:', car.condition],
        ['Transmission:', car.transmission || 'Automatic'],
        ['Fuel Type:', car.fuelType || 'Petrol'],
        ['Engine CC:', `${car.engineCC || '1800'} CC`],
        ['Location:', dealer?.location || 'Pakistan'],
        ['Document Type:', car.documentType || 'Original / Clear'],
        ['Token Tax:', car.tokenTaxPaid ? 'Paid' : 'Unpaid']
      ];
      
      let startY = 100;
      specs.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(label, 14, startY);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(value, 60, startY);
        
        startY += 8;
      });
      
      startY += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Showroom & Dealer Contact', 14, startY);
      
      startY += 10;
      const dealerInfo = [
        ['Showroom Name:', dealer?.name || 'Auto Choice'],
        ['Contact Person:', dealer?.contactPerson || 'Muhammad Amjid (Founder)'],
        ['Phone Number:', dealer?.phone || '+92 314 9198403'],
        ['Email:', dealer?.email || 'support@bazar360.online'],
        ['Showroom URL:', `https://bazar360.online/dealers/${dealer?.id || ''}`]
      ];
      
      dealerInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(label, 14, startY);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(value, 60, startY);
        
        startY += 8;
      });
      
      doc.setFillColor(241, 245, 249);
      doc.rect(0, 275, 210, 22, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Verified by Bazar360.online • Pakistan s Premier Automotive Marketplace', 14, 287);
      
      doc.save(`Vehicle-Fact-Sheet-${car.make}-${car.model}-${car.year}.pdf`);
      toast.success('Vehicle Fact Sheet PDF downloaded successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF Fact Sheet.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-[var(--color-bg-primary)] min-h-screen text-[var(--color-text-main)] font-sans pb-24 fixed inset-0 z-[100] overflow-y-auto"
    >
      <Helmet>
        <title>{`${car.title} (${car.year}) | ${dealer?.name || 'Auto Choice'} - Bazar360`}</title>
        <meta name="description" content={car.description || `Buy ${car.title} (${car.year}) for PKR ${car.price} at ${dealer?.name || 'Bazar360'}. Verified inspection and authentic showroom listing.`} />
        <meta property="og:title" content={`${car.title} - ${dealer?.name || 'Auto Choice Bazar360'}`} />
        <meta property="og:description" content={`Verified ${car.year} ${car.make} ${car.model} in ${dealer?.location || 'Pakistan'}. Price: PKR ${car.price.toLocaleString()}`} />
        <meta property="og:image" content={imagesList[0]} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${car.title} | Bazar360`} />
        <meta name="twitter:image" content={imagesList[0]} />
        <script type="application/ld+json">
          {JSON.stringify(vehicleSchema)}
        </script>
      </Helmet>
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-[var(--color-bg-primary)]/90 backdrop-blur-md border-b border-[var(--color-border-main)] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[#FE805D] transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadFactSheet}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-orange-600 transition shadow-sm cursor-pointer"
            >
              <Download size={14} />
              <span>Download Fact Sheet</span>
            </button>
            <button 
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-orange-500 transition-colors"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-12">
        {/* Title & Price Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            {car.verified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-md text-[10px] font-mono font-black uppercase tracking-widest border border-orange-500/20">
                <ShieldCheck size={14} /> Verified Listing
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-[#26344F] dark:text-white">
              {car.title}
            </h1>
            <p className="text-sm font-mono text-[var(--color-text-muted)] uppercase tracking-widest">
              {car.year} • {car.transmission} • {car.fuelType}
            </p>
          </div>
          
          <div className="text-left md:text-right">
            <p className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">
              Asking Price
            </p>
            <div className="text-3xl md:text-4xl font-black font-mono text-[#FE805D]">
              {renderPrice(car.price)}
            </div>
          </div>
        </div>

        {/* Hero Image Section (Matches Home Page aspect ratio) */}
        <div className="flex flex-col gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full aspect-[16/9] md:aspect-[2.35/1] bg-black rounded-3xl overflow-hidden border border-[var(--color-border-main)] relative shadow-xl group"
          >
            {activeMedia?.type === 'video' ? (
              <video 
                src={activeMedia.url}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <img 
                src={activeMedia?.url || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80'} 
                alt={car.title}
                onClick={() => openLightbox(imagesList.indexOf(activeMedia?.url || ''))}
                className="w-full h-full object-cover object-center cursor-zoom-in hover:scale-[1.01] transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            )}
            {car.images && car.images.length > 1 && activeMedia?.type === 'image' && (
              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <button 
                  onClick={() => openLightbox(imagesList.indexOf(activeMedia?.url || ''))}
                  className="bg-black/50 hover:bg-black/80 backdrop-blur-md text-white px-5 py-4 rounded-xl text-sm md:text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ImageIcon size={14} /> View Gallery ({car.images.length})
                </button>
              </div>
            )}
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {car.images && car.images.map((img, idx) => (
              <div 
                key={`img-${idx}`}
                className="relative shrink-0 cursor-pointer hover:scale-[1.03] transition-all"
                onClick={() => {
                  setActiveMedia({ type: 'image', url: img });
                }}
              >
                <img 
                  src={img}
                  alt={`${car.title} - Image ${idx + 1}`}
                  className={`w-32 h-24 rounded-xl object-cover border-2 transition-all ${
                    activeMedia?.type === 'image' && activeMedia?.url === img 
                      ? 'border-orange-500 shadow-md scale-102' 
                      : 'border-[var(--color-border-main)] hover:border-[#FE805D]'
                  }`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}

            {/* Showroom Interactive Video Walkthrough */}
            <div 
              className="relative shrink-0 cursor-pointer hover:scale-[1.03] transition-all"
              onClick={() => {
                setActiveMedia({ type: 'video', url: videoUrl });
              }}
            >
              <div className={`w-32 h-24 rounded-xl bg-slate-950 border-2 overflow-hidden relative flex items-center justify-center ${
                activeMedia?.type === 'video' 
                  ? 'border-orange-500 shadow-md scale-102' 
                  : 'border-[var(--color-border-main)] hover:border-[#FE805D]'
              }`}>
                <video 
                  src={videoUrl}
                  className="w-full h-full object-cover opacity-60"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Walkthrough
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Main Specs Column */}
          <div className="md:col-span-8 space-y-12">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Calendar className="text-[#FE805D]" size={24} />
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Model Year</span>
                <span className="font-bold">{car.year}</span>
              </div>
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Gauge className="text-[#FE805D]" size={24} />
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Mileage</span>
                <span className="font-bold">{car.mileage.toLocaleString()} km</span>
              </div>
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Droplet className="text-[#FE805D]" size={24} />
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Fuel Type</span>
                <span className="font-bold">{car.fuelType}</span>
              </div>
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Cog className="text-[#FE805D]" size={24} />
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Transmission</span>
                <span className="font-bold">{car.transmission}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h2 className="text-xl font-black font-display uppercase tracking-widest text-[#26344F] dark:text-white border-b border-[var(--color-border-main)] pb-4">
                Vehicle Overview
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-base">
                {car.description || `This beautiful ${car.year} ${car.title} is available now at ${dealer.name}. It features a ${car.transmission.toLowerCase()} transmission and runs on ${car.fuelType.toLowerCase()}. Impeccably maintained and ready for a new owner.`}
              </p>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-6">
              <h2 className="text-xl font-black font-display uppercase tracking-widest text-[#26344F] dark:text-white border-b border-[var(--color-border-main)] pb-4">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Engine Capacity</span>
                  <span className="text-sm font-bold">{car.engineCC ? `${car.engineCC} cc` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Exterior Color</span>
                  <span className="text-sm font-bold">{car.exteriorColor || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Body Condition</span>
                  <span className="text-sm font-bold">{car.bodyCondition || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Condition</span>
                  <span className="text-sm font-bold">{car.condition}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Connect Column */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 space-y-8 sticky top-24">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-[#FE805D]/10 text-[#FE805D] flex items-center justify-center font-black text-2xl mx-auto mb-4">
                  {dealer.logo ? <img src={dealer.logo} alt="Logo" className="w-10 h-10 object-contain" /> : dealer.avatarLetter}
                </div>
                <h3 className="text-lg font-black text-[#26344F] dark:text-white uppercase tracking-tight">{dealer.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1">
                  <MapPin size={12} /> {dealer.location}
                </p>
              </div>

              <div className="space-y-3">
                <a 
                  href={`tel:${dealer.phone}`}
                  className="w-full py-4 bg-[#26344F] hover:bg-[#1e2a40] dark:bg-white dark:text-[#26344F] dark:hover:bg-gray-200 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg"
                >
                  Call Showroom
                </a>
                
                {dealer.whatsapp && (
                  <a 
                    href={`https://wa.me/${formattedWhatsapp}?text=Hi, I am interested in your ${car.year} ${car.title} listed for ${renderPrice(car.price)} on Bazar360.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-[#FE805D] hover:bg-[#e66c4a] text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-[#FE805D]/20"
                  >
                    WhatsApp Contact
                  </a>
                )}
              </div>
              
              <div className="pt-6 border-t border-[var(--color-border-main)]">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
                  Purchase Security
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-xs text-[var(--color-text-muted)] leading-relaxed">
                    <CheckCircle2 size={16} className="text-[#FE805D] shrink-0 mt-0.5" />
                    Verified Showroom Identity
                  </li>
                  <li className="flex items-start gap-3 text-xs text-[var(--color-text-muted)] leading-relaxed">
                    <CheckCircle2 size={16} className="text-[#FE805D] shrink-0 mt-0.5" />
                    Direct Seller Contact
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Lightbox 
        images={imagesList}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title={car.title}
      />
    </motion.div>
  );
}
