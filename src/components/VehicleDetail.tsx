import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { jsPDF } from 'jspdf';
import { CarListing, Dealer } from '../types';
import { useCurrencyMode } from '../lib/currency';
import { ArrowLeft, Image as ImageIcon, MapPin, Share2, ShieldCheck, CheckCircle2, Gauge, Calendar, Droplet, Cog, Download, Phone, MessageCircle, Zap, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Lightbox } from './Lightbox';
import { dbFetchListingById } from '../lib/dbService';
import VehicleARInspectorModal from './VehicleARInspectorModal';

interface VehicleDetailProps {
  car: CarListing;
  dealer: Dealer;
  allListings?: CarListing[];
  onSelectListing?: (car: CarListing) => void;
  onClose?: () => void;
}

export function getContactDataForListing(car: CarListing, dealer?: Dealer) {
  const isIndividualSeller = 
    car.dealerId === 'private' || 
    car.dealerId === 'private-seller' || 
    car.dealerId === 'individual' || 
    car.sellerType === 'Individual' || 
    (car.sellerType as string) === 'individual' || 
    dealer?.id === 'private' || 
    !car.dealerId ||
    Boolean(car.sellerPhone && car.sellerName && car.sellerName !== 'Auto Choice');

  const resolvedSellerName = isIndividualSeller 
    ? (car.sellerName || car.createdBy || 'Individual User') 
    : (dealer?.name || 'Auto Choice Showroom');
  const resolvedSellerLocation = car.location || car.registrationCity || (isIndividualSeller ? 'Pakistan' : dealer?.location) || 'Peshawar, Pakistan';
  const resolvedSellerPhone = isIndividualSeller 
    ? (car.sellerPhone || car.phone || 'Contact Seller') 
    : (dealer?.phone || '+923159085086');
  const resolvedSellerWhatsApp = isIndividualSeller 
    ? (car.sellerWhatsApp || car.sellerPhone || car.phone || '') 
    : (dealer?.whatsapp || '923159085086');

  return {
    isPrivateSeller: isIndividualSeller,
    resolvedSellerName,
    resolvedSellerLocation,
    resolvedSellerPhone,
    resolvedSellerWhatsApp,
    formattedWhatsapp: (resolvedSellerWhatsApp || '').replace(/\D/g, ''),
  };
}

export function VehicleDetail({ car: propCar, dealer, allListings = [], onSelectListing, onClose }: VehicleDetailProps) {
  const navigate = useNavigate();
  const { renderPrice } = useCurrencyMode();

  const [activeCar, setActiveCar] = useState<CarListing>(propCar);

  useEffect(() => {
    setActiveCar(propCar);
    
    // Dynamic fetch to guarantee absolute accurate seller details from the listing document
    if (propCar && propCar.id) {
      dbFetchListingById(propCar.id).then((fetched) => {
        if (fetched) {
          console.log('[VehicleDetail] Dynamically fetched fresh listing data for contact verification:', fetched);
          setActiveCar(fetched);
        }
      });
    }
  }, [propCar]);

  const car = activeCar;

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  const [showARModal, setShowARModal] = useState<boolean>(false);

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
        console.log('Shared successfully!');
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
        console.log('Vehicle link copied to clipboard!');
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

  const contactData = getContactDataForListing(car, dealer);
  const {
    isPrivateSeller,
    resolvedSellerName,
    resolvedSellerLocation,
    resolvedSellerPhone,
    resolvedSellerWhatsApp,
    formattedWhatsapp
  } = contactData;

  const carCity = (resolvedSellerLocation || 'Peshawar').split(',')[0].trim().toLowerCase();
  const similarListings = useMemo(() => {
    if (!allListings || allListings.length === 0) return [];
    return allListings
      .filter(item => item.id !== car.id)
      .filter(item => {
        const itemCity = (item.location || 'Peshawar').split(',')[0].trim().toLowerCase();
        return itemCity.includes(carCity) || carCity.includes(itemCity) || item.make.toLowerCase() === car.make.toLowerCase();
      })
      .slice(0, 4);
  }, [allListings, car.id, car.make, carCity]);

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
      doc.text(`Model Year: ${car.year} | Mileage: ${car.mileage ? Number(car.mileage).toLocaleString() : 'N/A'} km`, 14, 63);
      doc.text(`Asking Price: PKR ${Number(car.price).toLocaleString()}`, 14, 71);
      
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
        ['Location:', car.location || dealer?.location || 'Pakistan'],
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
      doc.text(isPrivateSeller ? 'Seller & Contact Information' : 'Showroom & Representative Contact', 14, startY);
      
      startY += 10;
      const dealerInfo = isPrivateSeller ? [
        ['Seller Category:', 'Individual User / External Seller'],
        ['Listing Owner:', resolvedSellerName],
        ['Owner Phone:', resolvedSellerPhone],
        ['Owner WhatsApp:', resolvedSellerWhatsApp ? `+${formattedWhatsapp}` : 'N/A'],
        ['Listing URL:', `https://bazar360.online/listings/${car.id}`]
      ] : [
        ['Showroom Name:', dealer?.name || 'Auto Choice - The Right Choice'],
        ['Representatives:', 'Malak Mazhar & Muhammad Amjid'],
        ['Phone Numbers:', '+92 315 9085086 / +92 314 9198403'],
        ['Official Email:', dealer?.email || 'support@bazar360.online'],
        ['Showroom URL:', `https://bazar360.online/dealers/${dealer?.id || 'auto-choice-peshawar'}`]
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
      console.log('Vehicle Fact Sheet PDF downloaded successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF Fact Sheet.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
            className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent-main)] transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setShowARModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Camera size={14} />
              <span className="hidden sm:inline">Inspect AR Dimensions</span>
              <span className="sm:hidden">AR Frame</span>
            </button>
            <button 
              onClick={handleDownloadFactSheet}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-orange-600 transition shadow-sm cursor-pointer"
            >
              <Download size={14} />
              <span className="hidden md:inline">Download Fact Sheet</span>
            </button>
            <a 
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this ${car.title} (${car.year}) listed on Bazar360 for ${renderPrice(car.price)}! View details here: ${window.location.href}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[var(--color-text-header)] font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              title="Share via WhatsApp"
            >
              <MessageCircle size={14} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Share via WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
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
            <div className="flex flex-wrap gap-2 items-center">
              {car.verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-md text-[10px] font-mono font-black uppercase tracking-widest border border-orange-500/20">
                  <ShieldCheck size={14} /> Verified Listing
                </span>
              )}
              {car.dealerId === 'private' || car.sellerType === 'Individual' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-400 rounded-md text-[10px] font-mono font-black uppercase tracking-widest border border-sky-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Individual Seller
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-md text-[10px] font-mono font-black uppercase tracking-widest border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Certified Showroom Partner
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-[#26344F] dark:text-[var(--color-text-header)]">
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
            <div className="text-3xl md:text-4xl font-black font-mono text-[var(--color-accent-main)]">
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
                  className="bg-black/50 hover:bg-black/80 backdrop-blur-md text-[var(--color-text-header)] px-5 py-4 rounded-xl text-sm md:text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-all cursor-pointer"
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
              <div className={`w-32 h-24 rounded-xl bg-bg-primary border-2 overflow-hidden relative flex items-center justify-center ${
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
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-[var(--color-text-header)] flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-[var(--color-text-header)] font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
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
                <Calendar className="text-[var(--color-accent-main)]" size={24} />
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Model Year</span>
                <span className="font-bold">{car.year}</span>
              </div>
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Gauge className="text-[var(--color-accent-main)]" size={24} />
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Mileage</span>
                <span className="font-bold">{car.mileage ? `${Number(car.mileage).toLocaleString()} km` : 'N/A'}</span>
              </div>
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Droplet className="text-[var(--color-accent-main)]" size={24} />
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Fuel Type</span>
                <span className="font-bold">{car.fuelType}</span>
              </div>
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Cog className="text-[var(--color-accent-main)]" size={24} />
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Transmission</span>
                <span className="font-bold">{car.transmission}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h2 className="text-xl font-black font-display uppercase tracking-widest text-[#26344F] dark:text-[var(--color-text-header)] border-b border-[var(--color-border-main)] pb-4">
                Vehicle Overview
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-base">
                {car.description || `This beautiful ${car.year} ${car.title} is available now at ${dealer.name}. It features a ${car.transmission.toLowerCase()} transmission and runs on ${car.fuelType.toLowerCase()}. Impeccably maintained and ready for a new owner.`}
              </p>
            </div>

            {/* Technical Specifications & AR Inspection Callout */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-main)] pb-4">
                <h2 className="text-xl font-black font-display uppercase tracking-widest text-[#26344F] dark:text-[var(--color-text-header)]">
                  Technical Specifications
                </h2>
                <button
                  onClick={() => setShowARModal(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Camera size={14} />
                  <span>Launch AR 3D Dimension Camera</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Make / Brand</span>
                  <span className="text-sm font-bold">{car.make || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Model Series</span>
                  <span className="text-sm font-bold">{car.model || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Year of Manufacture</span>
                  <span className="text-sm font-bold">{car.year || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Asking Price (PKR)</span>
                  <span className="text-sm font-bold font-mono text-orange-500">PKR {car.price ? Number(car.price).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Mileage (Driven)</span>
                  <span className="text-sm font-bold">{car.mileage ? `${Number(car.mileage).toLocaleString()} km` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Fuel Type</span>
                  <span className="text-sm font-bold">{car.fuelType || 'Petrol'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Transmission Type</span>
                  <span className="text-sm font-bold">{car.transmission || 'Automatic'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Engine Capacity</span>
                  <span className="text-sm font-bold">{car.engineCC ? `${car.engineCC} cc` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Exterior Color</span>
                  <span className="text-sm font-bold">{car.exteriorColor || car.specs?.color || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Body Condition / Touch-ups</span>
                  <span className="text-sm font-bold">{car.bodyCondition || 'Total Genuine'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Vehicle Condition</span>
                  <span className="text-sm font-bold">{car.condition || 'Used'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Assembly Type</span>
                  <span className="text-sm font-bold">{car.assemblyType || 'Local'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Document Type</span>
                  <span className="text-sm font-bold">{car.documentType || 'Smart Card'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Token Tax Status</span>
                  <span className={`text-sm font-bold ${car.tokenTaxPaid ? 'text-[var(--color-accent-main)]' : 'text-rose-500'}`}>{car.tokenTaxPaid ? 'Paid' : 'Unpaid'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Registration City</span>
                  <span className="text-sm font-bold">{car.registrationCity || 'N/A'}</span>
                </div>
                {car.specs?.horspower && (
                  <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                    <span className="text-sm text-[var(--color-text-muted)]">Horsepower</span>
                    <span className="text-sm font-bold">{car.specs.horspower}</span>
                  </div>
                )}
                {car.specs?.engineSize && (
                  <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                    <span className="text-sm text-[var(--color-text-muted)]">Engine Cylinder/Size</span>
                    <span className="text-sm font-bold">{car.specs.engineSize}</span>
                  </div>
                )}
                {car.specs?.regionalSpecs && (
                  <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                    <span className="text-sm text-[var(--color-text-muted)]">Regional Specifications</span>
                    <span className="text-sm font-bold">{car.specs.regionalSpecs}</span>
                  </div>
                )}
                {car.topSpeed && (
                  <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                    <span className="text-sm text-[var(--color-text-muted)]">Top Speed</span>
                    <span className="text-sm font-bold">{car.topSpeed}</span>
                  </div>
                )}
                {car.acceleration && (
                  <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                    <span className="text-sm text-[var(--color-text-muted)]">Acceleration (0-100 km/h)</span>
                    <span className="text-sm font-bold">{car.acceleration}</span>
                  </div>
                )}
                {car.range && (
                  <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50">
                    <span className="text-sm text-[var(--color-text-muted)]">Electric Range</span>
                    <span className="text-sm font-bold">{car.range}</span>
                  </div>
                )}
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50 sm:col-span-2">
                  <span className="text-sm text-[var(--color-text-muted)]">Seller Location / Address</span>
                  <span className="text-sm font-bold">{car.location || car.registrationCity || 'Pakistan'}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-[var(--color-border-main)]/50 sm:col-span-2">
                  <span className="text-sm text-[var(--color-text-muted)]">Seller Phone</span>
                  <span className="text-sm font-bold font-mono text-orange-500">{resolvedSellerPhone}</span>
                </div>
                {car.dentPaintDescription && (
                  <div className="flex flex-col py-4 border-b border-[var(--color-border-main)]/50 sm:col-span-2 text-left">
                    <span className="text-sm text-[var(--color-text-muted)] mb-1">Dent / Paint / Body Highlights</span>
                    <span className="text-sm font-medium bg-amber-500/5 text-amber-500 p-3 rounded-xl border border-amber-500/10 font-mono text-xs">{car.dentPaintDescription}</span>
                  </div>
                )}
              </div>

              {/* Dynamic Features List if present */}
              {car.features && car.features.length > 0 && (
                <div className="pt-4 space-y-3">
                  <h3 className="text-sm font-black font-display uppercase tracking-widest text-[#26344F] dark:text-[var(--color-text-header)]">
                    Installed Features & Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {car.features.map((feature, i) => (
                      <span 
                        key={i} 
                        className="text-xs font-mono font-bold uppercase tracking-wider bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                      >
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Connect Column */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 space-y-6 sticky top-24 shadow-sm">
              <div className="text-center space-y-2">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-3 ${
                  isPrivateSeller ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-inner' : 'bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)]'
                }`}>
                  {isPrivateSeller ? (
                    '👤'
                  ) : (dealer.logoUrl || dealer.logo) ? (
                    <img src={dealer.logoUrl || dealer.logo} alt="Logo" className="w-10 h-10 object-contain" />
                  ) : (
                    dealer.avatarLetter
                  )}
                </div>

                {isPrivateSeller ? (
                  <div className="space-y-1">
                    <span className="inline-block bg-sky-500/10 text-sky-500 dark:text-sky-400 text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-sky-500/20">
                      Individual Seller Listing
                    </span>
                    <h3 className="text-lg font-black text-[#26344F] dark:text-[var(--color-text-header)] uppercase tracking-tight">{resolvedSellerName}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1">
                      <MapPin size={12} /> {resolvedSellerLocation}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="inline-block bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-[var(--color-accent-main)]/20">
                      Auto Choice Certified Showroom
                    </span>
                    <h3 className="text-lg font-black text-[#26344F] dark:text-[var(--color-text-header)] uppercase tracking-tight">{resolvedSellerName}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1">
                      <MapPin size={12} /> {resolvedSellerLocation}
                    </p>
                  </div>
                )}

                <div className="pt-3 flex flex-col items-center justify-center gap-2">
                  <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">
                    {isPrivateSeller ? 'Direct Seller Contact:' : 'Showroom Main Phone:'}
                  </p>
                  <a 
                    href={`tel:${resolvedSellerPhone}`}
                    className="text-sm font-extrabold text-orange-500 font-mono tracking-widest bg-[var(--color-bg-primary)] hover:bg-slate-100 dark:hover:bg-bg-tertiary py-2.5 px-4 rounded-xl border border-[var(--color-border-main)] inline-flex items-center gap-2 select-all cursor-pointer shadow-sm transition-all"
                  >
                    <Phone size={14} className="text-orange-500" /> 
                    <span>{resolvedSellerPhone}</span>
                  </a>
                  {resolvedSellerWhatsApp && (
                    <a 
                      href={`https://wa.me/${formattedWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-extrabold text-[var(--color-accent-main)] font-mono tracking-widest bg-[var(--color-bg-primary)] hover:bg-slate-100 dark:hover:bg-bg-tertiary py-2 px-3 rounded-xl border border-[var(--color-border-main)] inline-flex items-center gap-2 select-all cursor-pointer shadow-sm transition-all"
                    >
                      <MessageCircle size={14} className="text-[var(--color-accent-main)]" /> 
                      <span>WhatsApp: {resolvedSellerWhatsApp}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons for Direct Owner Contact */}
              <div className="space-y-3">
                <a 
                  href={`tel:${resolvedSellerPhone}`}
                  className="w-full py-3.5 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)] dark:bg-white dark:text-[#26344F] dark:hover:bg-gray-200 text-[var(--color-text-header)] font-mono font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <Phone size={14} />
                  {isPrivateSeller ? 'Call Individual Seller' : 'Call Showroom'}
                </a>
                
                {formattedWhatsapp && (
                  <a 
                    href={`https://wa.me/${formattedWhatsapp}?text=Hi, I am interested in your ${car.year} ${car.title} listed for ${renderPrice(car.price)} on Bazar360.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-[var(--color-text-header)] font-mono font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <MessageCircle size={14} />
                    WhatsApp Owner
                  </a>
                )}
              </div>

              {/* High-Converting Auto Choice 360° Vehicle Inspection CTA */}
              <div className="pt-4 border-t border-[var(--color-border-main)] space-y-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/30 space-y-3 text-left">
                  <div className="flex items-center gap-2 text-orange-400">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-mono font-black uppercase tracking-wider">360° Digital Inspection</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                    Get an official Auto Choice 200+ point diagnostic check with UV light paint spectrum analysis for this vehicle before purchase.
                  </p>
                  <button
                    onClick={() => {
                      if (window.dispatchEvent) {
                        window.dispatchEvent(new CustomEvent('open-service-tab', { detail: car }));
                      }
                    }}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <Zap size={14} />
                    <span>Book Inspection for this Car</span>
                  </button>
                </div>
              </div>

              {/* Showroom Representatives & Advisory Contacts - Only shown for verified showrooms */}
              {!isPrivateSeller && car.dealerId !== 'private' && (
                <div className="pt-5 border-t border-[var(--color-border-main)] space-y-3">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)] text-left flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-orange-500" />
                    Showroom Representatives
                  </h4>
                  
                  <div className="space-y-2 text-left">
                    {/* Representative 1: Malak Mazhar */}
                    <div className="p-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#26344F] dark:text-[var(--color-text-header)]">Malak Mazhar</p>
                        <p className="text-[10px] font-mono text-[var(--color-text-muted)]">Sales & Inspection Advisory</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a 
                          href="tel:+923159085086"
                          className="p-2 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-[var(--color-text-header)] rounded-lg transition-all"
                          title="Call Malak Mazhar"
                        >
                          <Phone size={12} />
                        </a>
                        <a 
                          href="https://wa.me/923159085086"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-[var(--color-accent-main)]/10 hover:bg-[var(--color-accent-main)] text-[var(--color-accent-main)] hover:text-[var(--color-text-header)] rounded-lg transition-all"
                          title="WhatsApp Malak Mazhar"
                        >
                          <MessageCircle size={12} />
                        </a>
                      </div>
                    </div>

                    {/* Representative 2: Muhammad Amjid */}
                    <div className="p-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#26344F] dark:text-[var(--color-text-header)]">Muhammad Amjid</p>
                        <p className="text-[10px] font-mono text-[var(--color-text-muted)]">Platform & Technology Advisory</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a 
                          href="tel:+923149198403"
                          className="p-2 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-[var(--color-text-header)] rounded-lg transition-all"
                          title="Call Muhammad Amjid"
                        >
                          <Phone size={12} />
                        </a>
                        <a 
                          href="https://wa.me/923149198403"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-[var(--color-accent-main)]/10 hover:bg-[var(--color-accent-main)] text-[var(--color-accent-main)] hover:text-[var(--color-text-header)] rounded-lg transition-all"
                          title="WhatsApp Muhammad Amjid"
                        >
                          <MessageCircle size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-[var(--color-border-main)]">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-3 text-left">
                  Purchase Security
                </h4>
                <ul className="space-y-2 text-left">
                  <li className="flex items-start gap-2.5 text-xs text-[var(--color-text-muted)] leading-relaxed">
                    <CheckCircle2 size={15} className="text-[var(--color-accent-main)] shrink-0 mt-0.5" />
                    {isPrivateSeller ? 'Verified Personal Phone Number' : 'Verified Showroom Identity'}
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[var(--color-text-muted)] leading-relaxed">
                    <CheckCircle2 size={15} className="text-[var(--color-accent-main)] shrink-0 mt-0.5" />
                    Direct Buyer-to-Seller Communication
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[var(--color-text-muted)] leading-relaxed">
                    <CheckCircle2 size={15} className="text-[var(--color-accent-main)] shrink-0 mt-0.5" />
                    Auto Choice Inspection Support Available
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Listings in Your City */}
        {similarListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mt-12 pt-8 border-t border-[var(--color-border-main)] text-left"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black uppercase text-[var(--color-text-header)] tracking-tight">
                  Similar listings in your city
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Explore related {car.condition || 'new & used'} cars available in {dealer?.location?.split(',')[0] || 'Peshawar'}
                </p>
              </div>
            </div>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.05,
                  },
                },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {similarListings.map((simCar) => (
                <motion.div
                  key={simCar.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
                    },
                  }}
                  onClick={() => {
                    if (onSelectListing) {
                      onSelectListing(simCar);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-orange-500 rounded-2xl p-3 cursor-pointer transition-all hover:shadow-xl group"
                >
                  <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-black mb-3">
                    <img
                      src={simCar.imageUrl || (simCar.images && simCar.images[0]) || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80'}
                      alt={simCar.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-orange-500 text-[var(--color-text-header)] font-black text-[9px] uppercase px-2 py-0.5 rounded-md">
                      {simCar.condition}
                    </div>
                  </div>
                  <h4 className="font-bold text-xs text-[var(--color-text-header)] truncate group-hover:text-orange-500 transition-colors">
                    {simCar.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border-main)] text-[11px]">
                    <span className="font-mono font-black text-orange-500">{renderPrice(simCar.price)}</span>
                    <span className="text-[var(--color-text-muted)] text-[10px]">{simCar.year}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>

      <Lightbox 
        images={imagesList}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title={car.title}
      />

      {showARModal && (
        <VehicleARInspectorModal
          car={car}
          onClose={() => setShowARModal(false)}
        />
      )}
    </motion.div>
  );
}
