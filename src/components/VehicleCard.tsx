import React from 'react';
import { MapPin, Gauge, Fuel, ShieldCheck, Phone, ArrowUpRight } from 'lucide-react';
import { CarListing, Dealer } from '../types';

interface VehicleCardProps {
  car: CarListing;
  dealer?: Dealer;
  variant?: 'grid' | 'list';
  onSelect: (car: CarListing) => void;
  onToggleCompare?: (car: CarListing) => void;
  isComparing?: boolean;
}

export function VehicleCard({ 
  car, 
  dealer, 
  variant = 'grid', 
  onSelect, 
  onToggleCompare, 
  isComparing = false 
}: VehicleCardProps) {
  const isSold = car.isSold;
  const isReserved = car.specs?.regionalSpecs === 'Reserved' || car.tags?.includes('Reserved');

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `Rs. ${(price / 10000000).toFixed(2)} Crore`;
    }
    return `Rs. ${(price / 100000).toFixed(1)} Lakh`;
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const whatsappNum = dealer?.whatsapp || '923149198403';
    const text = `Hi, I am interested in your listed vehicle: ${car.year} ${car.make} ${car.model} (${formatPrice(car.price)}) on BAZAR360. Please share availability.`;
    window.open(`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNum = dealer?.phone || '03149198403';
    window.location.href = `tel:${phoneNum}`;
  };

  return (
    <div
      onClick={() => onSelect(car)}
      className="group bg-bg-secondary border border-border-main hover:border-accent-main rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full cursor-pointer text-text-main"
    >
      {/* Image & Status Area */}
      <div className="relative aspect-[16/10] overflow-hidden bg-bg-primary shrink-0">
        <img
          src={car.images?.[0] || car.imageUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600'}
          alt={`${car.make} ${car.model}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {car.featured && (
            <span className="bg-amber-500 text-stone-950 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded">
              Featured
            </span>
          )}
          {car.verified && (
            <span className="bg-bg-secondary/90 text-accent-main border border-accent-main/30 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs">
              <ShieldCheck size={11} /> Verified
            </span>
          )}
          <span className="bg-black/60 backdrop-blur text-stone-200 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded">
            {car.condition}
          </span>
        </div>

        {/* Compare Toggle Button in Top-Right */}
        {onToggleCompare && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(car);
            }}
            className={`absolute top-3 right-3 z-20 w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              isComparing
                ? 'bg-accent-main border-accent-main text-bg-primary'
                : 'bg-black/60 border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
            }`}
            title={isComparing ? 'Remove from compare list' : 'Add to compare list'}
          >
            <span className="text-[10px] font-mono font-black">{isComparing ? '✓' : '+'}</span>
          </button>
        )}

        {isSold ? (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-rose-500 text-white font-sans text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-lg rotate-[-5deg]">
              SOLD OUT
            </span>
          </div>
        ) : isReserved ? (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-amber-500 text-stone-950 font-sans text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-lg rotate-[-5deg]">
              RESERVED
            </span>
          </div>
        ) : null}

        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-gray-200">
          {car.year}
        </div>
      </div>

      {/* Details Box */}
      <div className="p-4 flex flex-col flex-1 text-left bg-bg-secondary">
        {/* Title */}
        <h3 className="text-sm font-sans font-black text-text-main group-hover:text-accent-main transition-colors line-clamp-1 flex items-center justify-between gap-2">
          <span>{car.make} {car.model}</span>
          <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-accent-main shrink-0" />
        </h3>

        {/* Location & City Tag */}
        <div className="flex items-center gap-1 text-text-muted text-[10px] mt-1 uppercase font-mono tracking-wider font-bold">
          <MapPin size={11} className="text-accent-main shrink-0" />
          <span>{car.registrationCity || 'Unregistered'}</span>
        </div>

        {/* Technical Data Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-y border-border-main py-3 my-3">
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-mono font-medium">
            <Gauge size={12} className="text-text-muted/60 shrink-0" />
            <span>{car.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-mono font-medium">
            <Fuel size={12} className="text-text-muted/60 shrink-0" />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-mono font-medium">
            <span className="text-[9px] font-black uppercase text-text-muted/60 tracking-wider shrink-0">TRANS</span>
            <span className="truncate">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-mono font-medium">
            <span className="text-[9px] font-black uppercase text-text-muted/60 tracking-wider shrink-0">ENGINE</span>
            <span>{car.engineCC ? `${car.engineCC}cc` : car.specs?.engineSize || 'N/A'}</span>
          </div>
        </div>

        {/* Price & Primary Call to Action */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono uppercase text-text-muted/70 tracking-wider font-bold">Asking Price</span>
            <span className="text-sm font-sans font-black text-accent-main tracking-tight">
              {formatPrice(car.price)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleWhatsAppClick}
              className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl transition-all hover:scale-105 cursor-pointer"
              title="Chat on WhatsApp"
            >
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.12 1 11.516 1 6.08 1 1.657 5.37 1.654 10.8c-.001 1.762.476 3.483 1.38 5.013l-.953 3.483 3.566-.942z"/>
              </svg>
            </button>
            <button
              onClick={handleCallClick}
              className="px-3.5 py-2.5 bg-accent-main hover:bg-accent-hover text-bg-primary font-sans font-black rounded-xl transition-all text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              <Phone size={12} /> Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
