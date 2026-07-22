import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Store, 
  MapPin, 
  Star, 
  QrCode, 
  Search, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  SlidersHorizontal,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Dealer, CarListing } from '../types';
import { LazyImage } from './LazyImage';

interface ShowroomsHubProps {
  dealers: Dealer[];
  listings: CarListing[];
  onSelectDealer: (id: string) => void;
  setSelectedQrDealer: (dealer: Dealer) => void;
  lang: 'en' | 'ur';
}

export default function ShowroomsHub({
  dealers,
  listings,
  onSelectDealer,
  setSelectedQrDealer,
  lang
}: ShowroomsHubProps) {
  const isUrdu = lang === 'ur';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');

  const t = {
    en: {
      title: 'Verified Showrooms',
      subtitle: 'Browse elite dealership partners, inspect live inventories, and connect instantly',
      searchPlaceholder: 'Search showrooms by name or city...',
      allCities: 'All Cities',
      allSpecialties: 'All Specialties',
      activeListings: 'Active Cars',
      userRating: 'User Rating',
      specialtyTitle: 'Specialty',
      cityTitle: 'Location',
      viewStorefront: 'Visit Website',
      noResults: 'No showrooms match your filters. Try clearing filters or searching again.',
      verifiedShowroom: 'Verified Partner',
      flagshipTitle: 'Flagship Showroom',
      quickQr: 'QR Navigate',
      peshawar: 'Peshawar',
      islamabad: 'Islamabad',
      lahore: 'Lahore',
      karachi: 'Karachi'
    },
    ur: {
      title: 'تصدیق شدہ شورومز',
      subtitle: 'بazar360 کے بہترین شورومز کی لائیو انوینٹریز دیکھیں اور رابطہ کریں',
      searchPlaceholder: 'نام یا شہر سے شوروم تلاش کریں...',
      allCities: 'تمام شہر',
      allSpecialties: 'تمام مہارتیں',
      activeListings: 'فعال گاڑیاں',
      userRating: 'درجہ بندی',
      specialtyTitle: 'خصوصیت',
      cityTitle: 'مقام',
      viewStorefront: 'ویب سائٹ وزٹ کریں',
      noResults: 'کوئی شوروم دستیاب نہیں ہے۔ براہ کرم فلٹرز تبدیل کریں۔',
      verifiedShowroom: 'تصدیق شدہ پارٹنر',
      flagshipTitle: 'فلیگ شپ شوروم',
      quickQr: 'کیو آر کوڈ',
      peshawar: 'پشاور',
      islamabad: 'اسلام آباد',
      lahore: 'لاہور',
      karachi: 'کراچی'
    }
  }[lang];

  // Helper to resolve specialty of a dealer based on description & name
  const getDealerSpecialty = (dealer: Dealer): 'Exotic' | 'SUVs' | 'Imports' | 'Economy' => {
    const desc = (dealer.description || '').toLowerCase();
    const name = dealer.name.toLowerCase();
    
    if (name.includes('luxury') || desc.includes('exotic') || desc.includes('luxury') || desc.includes('premium')) {
      return 'Exotic';
    }
    if (desc.includes('suv') || desc.includes('4x4') || desc.includes('prado') || desc.includes('fortuner') || desc.includes('jeep')) {
      return 'SUVs';
    }
    if (desc.includes('import') || desc.includes('jdm') || desc.includes('japanese') || desc.includes('auction')) {
      return 'Imports';
    }
    return 'Economy';
  };

  // Human friendly labels for specialties
  const specialties = [
    { id: 'All', label: t.allSpecialties, color: 'border-white/5 bg-slate-950/20' },
    { id: 'Exotic', label: isUrdu ? 'لگژری اور امپورٹڈ' : 'Exotic & Luxury', color: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400' },
    { id: 'SUVs', label: isUrdu ? 'ایس یو وی اور فور بائی فور' : 'SUVs & 4x4', color: 'border-sky-500/20 bg-sky-500/5 text-sky-400' },
    { id: 'Imports', label: isUrdu ? 'جاپانی اور جے ڈی ایم' : 'Imports & JDM', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' },
    { id: 'Economy', label: isUrdu ? 'لوکل اور فیملی کارز' : 'Economy & Family', color: 'border-purple-500/20 bg-purple-500/5 text-purple-400' }
  ];

  const cities = ['All', 'Peshawar', 'Islamabad', 'Lahore', 'Karachi'];

  // Sub-second localized filter chain
  const filteredDealers = useMemo(() => {
    return dealers.filter((dealer) => {
      // 1. Text Search query filter
      const text = searchQuery.toLowerCase();
      const matchesSearch = 
        dealer.name.toLowerCase().includes(text) || 
        (dealer.description || '').toLowerCase().includes(text) ||
        dealer.location.toLowerCase().includes(text);
      
      if (!matchesSearch) return false;

      // 2. City filter
      if (selectedCity !== 'All') {
        const matchesCity = dealer.location.toLowerCase().includes(selectedCity.toLowerCase());
        if (!matchesCity) return false;
      }

      // 3. Specialty filter
      if (selectedSpecialty !== 'All') {
        const specialty = getDealerSpecialty(dealer);
        if (specialty !== selectedSpecialty) return false;
      }

      return true;
    });
  }, [dealers, searchQuery, selectedCity, selectedSpecialty]);

  const isRtl = lang === 'ur';

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-fade-in text-left text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* HEADER SECTION with dynamic subtle stats indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Compass size={16} className="animate-spin-slow" />
            </span>
            <span className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-widest block">{t.verifiedShowroom}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-orange-400">
            {t.title}
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Live Counter tag */}
        <div className="flex items-center gap-3 bg-slate-950/60 border border-white/5 rounded-2xl px-4 py-2.5 shrink-0 self-start md:self-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
            {dealers.length} {isUrdu ? 'ڈیلرز لائیو' : 'Dealers Online'}
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="bg-[#0A0B0E] border border-white/5 rounded-3xl p-5 md:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          
          {/* Main search field */}
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full bg-[#12141A]/50 border border-white/10 text-xs rounded-xl py-3.5 ${
                isRtl ? 'pl-11 pr-4' : 'pl-4 pr-11'
              } focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none text-white font-medium`}
            />
            <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
              isRtl ? 'left-4' : 'right-4'
            }`} />
          </div>

          {/* City selector row */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden lg:inline">{t.cityTitle}:</span>
            <div className="flex flex-wrap gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-white/5">
              {cities.map((city) => {
                const isSel = selectedCity === city;
                return (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSel 
                        ? 'bg-orange-500 text-white shadow-md' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {city === 'All' ? t.allCities : (isUrdu && city === 'Peshawar' ? 'پشاور' : isUrdu && city === 'Islamabad' ? 'اسلام آباد' : city)}
                  </button>
                );
              })}
            </div>
          </div>

        </div>



      </div>

      {/* SHOWROOM CARDS GRID */}
      {filteredDealers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDealers.map((dealer) => {
            const spec = getDealerSpecialty(dealer);
            const count = listings.filter((l) => l.dealerId === dealer.id).length;
            const specObj = specialties.find((s) => s.id === spec);

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                key={dealer.id}
                onClick={() => onSelectDealer(dealer.id)}
                className="bg-[#0A0B0E] border border-white/5 rounded-3xl overflow-hidden group hover:border-orange-500/50 hover:-translate-y-1 duration-300 cursor-pointer relative shadow-xl flex flex-col justify-between"
              >
                {/* Visual Top Branding Banner */}
                <div className="h-36 bg-[#030712] relative flex items-center justify-center overflow-hidden shrink-0">
                  <LazyImage
                    alt={dealer.name}
                    className="absolute inset-0 w-full h-full opacity-25 group-hover:opacity-40 transition-opacity duration-500"
                    src={dealer.coverImage || 'https://images.unsplash.com/photo-1562575214-da9fcf59b907?auto=format&fit=crop&w=800&q=80'}
                    width={400}
                    height={144}
                  />
                  
                  {/* Subtle Top-left specialty badge overlay */}
                  <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${specObj?.color}`}>
                    {specObj?.label}
                  </span>

                  {/* Floating QR Code button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQrDealer(dealer);
                    }}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-orange-500 text-orange-400 hover:text-slate-950 flex items-center justify-center border border-white/10 hover:border-orange-400/30 transition-all shadow duration-200"
                    title={t.quickQr}
                  >
                    <QrCode size={13} />
                  </button>

                  {/* Centered Overlaid Logo Badge */}
                  <div className="w-16 h-16 rounded-full bg-[#0E1117] flex items-center justify-center z-10 shadow-2xl border-4 border-[#0A0B0E] overflow-hidden">
                    {dealer.avatarUrl ? (
                      <LazyImage
                        src={dealer.avatarUrl}
                        alt={dealer.name}
                        className="w-full h-full"
                        width={64}
                        height={64}
                      />
                    ) : (
                      <span className="font-display font-black text-lg text-white uppercase">
                        {dealer.avatarLetter}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-black text-gray-100 text-sm group-hover:text-orange-400 transition-colors uppercase tracking-tight line-clamp-1">
                        {dealer.name}
                      </h3>
                      {dealer.flagshipVerified && (
                        <span className="text-[8px] bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">
                          {t.flagshipTitle}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-[10px] flex items-center gap-1 font-sans uppercase tracking-wider font-bold">
                      <MapPin size={11} className="text-orange-500" /> 
                      <span>{dealer.location}</span>
                    </p>

                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 pr-2 font-medium">
                      {dealer.description}
                    </p>
                  </div>

                  {/* Card bottom footer statistics */}
                  <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                    
                    {/* Rating display */}
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-300">
                      <Star size={11} className="fill-amber-500 text-amber-500" />
                      <span>{dealer.rating}</span>
                      <span className="text-gray-500">/ 5</span>
                    </div>

                    {/* Stock Counter */}
                    <div className="text-[10px] font-bold text-gray-300 flex items-center gap-1.5">
                      <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-lg border border-orange-500/15">
                        {count} {t.activeListings}
                      </span>
                    </div>

                  </div>

                </div>

                {/* Hover action card ribbon */}
                <div className="bg-white/5 border-t border-white/5 py-2 px-5 text-center text-[10px] font-black text-orange-400 group-hover:text-white uppercase tracking-widest transition-all flex items-center justify-center gap-1 rounded-b-3xl">
                  <span>{t.viewStorefront}</span>
                  <ChevronRight size={12} className="group-hover:translate-x-1 duration-150" />
                </div>

              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty feedback state */
        <div className="bg-[#0A0B0E] border border-white/5 rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-4">
          <Store size={36} className="text-gray-600 animate-pulse" />
          <p className="text-gray-400 text-xs max-w-sm mx-auto font-medium">
            {t.noResults}
          </p>
        </div>
      )}

    </div>
  );
}
