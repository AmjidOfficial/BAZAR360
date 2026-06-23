import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, Mail, Phone, Star, Building, ArrowLeft } from 'lucide-react';
import { Dealer, CarListing } from '../types';
import { dbFetchDealers, dbFetchListings } from '../lib/dbService';

export default function ShowroomProfile() {
  const { showroomSlug } = useParams<{ showroomSlug: string }>();
  const navigate = useNavigate();
  
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const allDealers = await dbFetchDealers();
        const allListings = await dbFetchListings();
        
        // Find dealer matching slug
        const target = allDealers.find(d => {
          const generatedSlug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          return generatedSlug === showroomSlug;
        });

        if (target) {
          setDealer(target);
          setListings(allListings.filter(l => l.dealerId === target.id && l.approved));
        } else {
          setDealer(null);
        }
      } catch (err) {
        console.error("Failed to resolve profile from DB:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [showroomSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070c18] flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-b-2 border-[#00d2ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-[#070c18] flex items-center justify-center px-4">
        <div className="bg-[#0b1324] border border-[#1f2937] rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building size={32} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Showroom Registered Profile Not Found</h2>
          <p className="text-gray-400 text-sm mb-8">
            The dealership link you followed is invalid or the showroom has been removed from the BAZAR360 network.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-white font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070c18] text-white">
      {/* Header Banner */}
      <div className="relative h-64 md:h-80 w-full bg-[#0b1324] overflow-hidden border-b border-[#1f2937]">
        {dealer.coverImage ? (
          <img 
            src={dealer.coverImage} 
            alt={dealer.name} 
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-[#0b1324]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-transparent to-transparent" />
        
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[#0b1324]/80 backdrop-blur border border-[#1f2937] hover:bg-white/5 text-gray-300 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xl"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                  {dealer.name}
                </h1>
                {dealer.verified && (
                  <div className="flex items-center gap-1 bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0 h-fit">
                    <ShieldCheck size={12} />
                    Verified Partner
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#00d2ff]" />
                  <span>{dealer.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span>{dealer.rating} / 5.0 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Widget */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0b1324] border border-[#1f2937] rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-6">Contact Showroom</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-[#00d2ff]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Direct Line</div>
                  <div className="font-mono font-bold text-sm text-white">{dealer.phone}</div>
                </div>
              </div>

              {dealer.whatsapp && (
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">WhatsApp</div>
                    <div className="font-mono font-bold text-sm text-white">{dealer.whatsapp}</div>
                  </div>
                </div>
              )}
            </div>

            <button 
              className="w-full bg-[#00d2ff] hover:bg-[#00d2ff]/90 text-slate-950 font-black py-4 rounded-xl mt-8 uppercase tracking-widest text-xs transition-all shadow-lg shadow-[#00d2ff]/20"
            >
              Request Call Back
            </button>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            Showroom Inventory <span className="bg-slate-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">{listings.length} Available</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {listings.map(car => (
              <div key={car.id} className="bg-[#0b1324] border border-[#1f2937] rounded-2xl overflow-hidden hover:border-slate-600 transition-colors group cursor-pointer shadow-lg hover:shadow-xl">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={car.images?.[0] || car.imageUrl} 
                    alt={car.title} 
                    className={`w-full h-full object-cover transition-transform duration-500 ${car.isSold ? 'grayscale contrast-125 brightness-75 opacity-90' : 'group-hover:scale-105'}`}
                  />
                  {car.isSold && (
                    <div className="absolute top-6 right-6 z-30 bg-[#ff6b00] text-white text-sm font-black tracking-widest uppercase px-4 py-1.5 rounded shadow-2xl border-2 border-white rotate-12 scale-110 select-none">
                      SOLD
                    </div>
                  )}
                  {car.featured && !car.isSold && (
                    <div className="absolute top-3 left-3 bg-[#ff6b00] text-white text-[10px] font-black px-2 py-0.5 rounded shadow z-10 uppercase">
                      Featured
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-lg border border-white/10 z-10">
                    {car.year} Mode
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-[15px] truncate mb-1">{car.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    <span>{car.mileage.toLocaleString()} km</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                    <span>{car.transmission}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#1f2937] pt-4">
                    <span className="font-black text-[#00d2ff] tracking-tight">PKR {Math.floor(car.price / 100000)} Lacs</span>
                    <button className="text-[10px] uppercase font-bold text-gray-400 hover:text-white transition-colors">View Details →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {listings.length === 0 && (
            <div className="bg-[#0b1324] border border-dashed border-[#1f2937] rounded-3xl p-12 text-center text-gray-500 font-medium">
              No verified vehicles are currently listed by this showroom.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
