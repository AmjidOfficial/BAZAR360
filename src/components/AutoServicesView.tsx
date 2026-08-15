import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Shield, 
  Car, 
  Landmark, 
  CheckCircle, 
  Download, 
  X, 
  Zap, 
  Phone, 
  Clock, 
  Layers, 
  Award, 
  FileCheck,
  Search,
  Upload
} from 'lucide-react';
import { dbSubmitServiceBooking } from '../lib/dbService';
import { generateInspectionPDF } from '../lib/inspectionPdfService';
import { CarListing } from '../types';
import { ServiceManagementHub } from './admin/ServiceManagementHub';

interface AutoServicesViewProps {
  lang: 'en' | 'ur';
  preselectedCar?: CarListing | null;
  onSelectCarForService?: (car: CarListing) => void;
}

export default function AutoServicesView({ lang, preselectedCar }: AutoServicesViewProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Peshawar',
    date: new Date().toISOString().split('T')[0],
    vehicleInfo: preselectedCar ? `${preselectedCar.year} ${preselectedCar.make} ${preselectedCar.model}` : '',
    uvLightAnalysis: true,
    notes: ''
  });

  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [savedBookingId, setSavedBookingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const isUrdu = lang === 'ur';

  // 6 Primary Auto Choice Specialized Services
  const servicesList = [
    {
      id: 'inspection',
      title: isUrdu ? "گاڑیوں کی 360° انسپکشن رپورٹ" : "Vehicle Inspection Report (Digital 360° Health Check)",
      badge: "Most Popular",
      badgeColor: "bg-[#007979]/10 text-[#007979] border-[#007979]/20",
      icon: ShieldCheck,
      price: isUrdu ? "روپے 4,999" : "PKR 4,999",
      desc: isUrdu 
        ? "200 سے زائد پوائنٹس پر مشتمل تفصیلی کمپیوٹرائزڈ اور فزیکل انسپکشن رپورٹ بمعہ یو وی لائٹ پینٹ معائنہ" 
        : "Certified 200+ point diagnostic & physical health check covering Engine, Suspension, Frame, and Electronics with UV Light Paint Analysis.",
      features: [
        "Engine & Transmission computerized scanner diagnosis",
        "UV Light Paint-Checking (Detects hidden resprays & body filler)",
        "Under-carriage & Suspension load testing",
        "Instant Downloadable Branded PDF Inspection Certificate"
      ],
      hasPdfTool: true,
      category: 'inspection'
    },
    {
      id: 'excise',
      title: isUrdu ? "ایکائز و رجسٹریشن سروسز" : "Excise Services & Registration",
      badge: "Government Assistance",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      icon: FileCheck,
      price: isUrdu ? "فاسٹ ٹریک پروسیسنگ" : "Fast-Track Processing",
      desc: isUrdu 
        ? "سرمایہ کاری، ملکیتی تبدیلی، اسمارٹ کارڈ پروسیسنگ اور ٹوکن ٹیکس کی تصدیق کی مکمل قانونی سروسز" 
        : "Hassle-free ownership transfer, Smart Card registration, token tax clearance, and official KPK Excise verification.",
      features: [
        "Ownership Transfer & Biometric verification",
        "Smart Card & Duplicate Book application tracking",
        "Token tax calculation & instant clearing",
        "KP Excise & Law Enforcement record clearance"
      ],
      category: 'legal'
    },
    {
      id: 'detailing',
      title: isUrdu ? "کار ڈیٹیلنگ اور بحالی" : "Car Detailing & Rejuvenation",
      badge: "Premium Care",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: Sparkles,
      price: isUrdu ? "روپے 9,999 سے شروع" : "From PKR 9,999",
      desc: isUrdu 
        ? "انٹیریئر کی سٹیم کلیننگ، ملٹی اسٹیج پینٹ کریکشن اور بو کا مکمل خاتمہ" 
        : "Deep interior steam extraction, multi-stage rotary paint restoration, wheel de-ironing, and cabin sterilization.",
      features: [
        "Multi-stage machine paint polish & scratch removal",
        "Interior steam washing & leather nourishing",
        "Engine bay degreasing & protective dressing",
        "Odor elimination & anti-bacterial fogging"
      ],
      category: 'care'
    },
    {
      id: 'ceramic_ppf',
      title: isUrdu ? "سیرامک کوٹنگ اور پی پی ایف (PPF)" : "Ceramic Coating & Paint Protection (PPF)",
      badge: "Warranty Backed",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Award,
      price: isUrdu ? "5 سالہ وارنٹی" : "Up to 10 Yr Warranty",
      desc: isUrdu 
        ? "گاڑی کے پینٹ کی حفاظت کے لیے 9H نینو سیرامک اور سیلف ہیلنگ PPF فلم پیکیجز" 
        : "Military-grade 9H Nano Ceramic Coating & TPU Self-Healing Paint Protection Film (PPF) guarding against stone chips and UV oxidation.",
      features: [
        "9H Nano-Ceramic hydrophobic mirror finish",
        "Self-Healing TPU Clear or Gloss Black PPF installation",
        "Stone chip & UV ray fading resistance",
        "Official Auto Choice Multi-Year Warranty Certificate"
      ],
      category: 'care'
    },
    {
      id: 'sell_for_u',
      title: isUrdu ? "سیل فار یو (مینجڈ سیلز)" : "Sell For U (Consignment & Managed Sales)",
      badge: "End-to-End Managed",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Car,
      price: isUrdu ? "صفر پریشانی" : "0 Hassle Consignment",
      desc: isUrdu 
        ? "ہماری ٹیم آپ کی گاڑی کا معائنہ، پروفیشنل فوٹوگرافی، اور تصدیق شدہ خریداروں کے ساتھ بات چیت سنبھالتی ہے" 
        : "Let Auto Choice experts manage your car sale. We handle 4K photography, premium listing promotion, buyer filtering, and negotiation.",
      features: [
        "Professional 4K Studio Photography & HD Video",
        "Featured placement across Bazar360 & partner networks",
        "Screened buyer inquiries (No time-wasters)",
        "Secure payment transfer & biometric sign-off"
      ],
      category: 'sales'
    },
    {
      id: 'financing',
      title: isUrdu ? "آٹو فنانسنگ و انشورنس" : "Auto Financing & Insurance",
      badge: "Islamic & Conventional",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Landmark,
      price: isUrdu ? "کم ترین مارک اپ" : "Lowest Markup Rates",
      desc: isUrdu 
        ? "پاکستان کے اہم اسلامی اور روایتی بینکوں کے ساتھ آسان اقساط پر گاڑی حاصل کریں" 
        : "Tailored car financing plans with leading Islamic and conventional banks plus zero-depreciation insurance packages.",
      features: [
        "Minimal processing & fast-track approval (3 Days)",
        "Up to 5 years flexible installment terms",
        "Zero-depreciation comprehensive insurance add-on",
        "24/7 roadside emergency breakdown assistance"
      ],
      category: 'legal'
    }
  ];

  const handleOpenBooking = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSavingState('idle');
    setSavedBookingId(null);
  };

  const handleSilentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) return;

    setSavingState('saving');

    const serviceObj = servicesList.find(s => s.id === selectedServiceId);
    const serviceTitle = serviceObj ? serviceObj.title : 'General Auto Service';

    // Background silent save protocol
    const bookingId = await dbSubmitServiceBooking({
      serviceId: selectedServiceId || 'general',
      serviceTitle,
      userName: bookingForm.name,
      userPhone: bookingForm.phone,
      userEmail: bookingForm.email,
      city: bookingForm.city,
      preferredDate: bookingForm.date,
      vehicleDetails: bookingForm.vehicleInfo,
      vehicleId: preselectedCar?.id,
      vehicleTitle: preselectedCar?.title,
      uvLightAnalysisRequested: bookingForm.uvLightAnalysis,
      notes: bookingForm.notes
    });

    setSavedBookingId(bookingId);
    setSavingState('saved');
  };

  const handleDownloadSamplePDF = () => {
    if (!preselectedCar && (!bookingForm.vehicleInfo || !bookingForm.vehicleInfo.trim())) {
      alert('Please enter vehicle details in the form or select a vehicle from inventory to download an official inspection report.');
      return;
    }

    const carToInspect: CarListing = preselectedCar || {
      id: `car-insp-${Date.now()}`,
      title: bookingForm.vehicleInfo || 'Verified Vehicle Inspection',
      make: bookingForm.vehicleInfo?.split(' ')[0] || 'Toyota',
      model: bookingForm.vehicleInfo?.split(' ').slice(1).join(' ') || 'Inspection Record',
      year: 2023,
      price: 0,
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      imageUrl: '',
      images: [],
      verified: true,
      featured: false,
      dealerId: 'bazar360-hub',
      condition: 'Used',
      engineCC: 1800,
      description: 'Official diagnostic inspection report.',
      createdAt: new Date().toISOString(),
      tags: ['Inspected'],
      specs: { 
        color: 'White',
        engineSize: '1800 cc',
        horspower: '140 hp',
        regionalSpecs: 'Pakistani Assembly'
      },
      exteriorColor: 'White',
      bodyCondition: 'Total Genuine',
      registrationCity: 'Peshawar',
      documentType: 'Smart Card',
      tokenTaxPaid: true
    };

    generateInspectionPDF(carToInspect, {
      overallGrade: 'A+',
      overallScore: 96,
      uvLightPaintStatus: 'Pass - Genuine Factory Coat',
      uvLightDetails: '360° UV Light analysis confirms 100% factory original paint on bonnet, pillars, and roof. No filler or respray detected.'
    });
  };

  const filteredServices = activeCategory === 'all' 
    ? servicesList 
    : servicesList.filter(s => s.category === activeCategory);

  return (
    <div 
      className={`space-y-8 animate-fade-in text-[#0F172A] ${isUrdu ? 'text-right' : 'text-left'}`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* 1. Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#007979]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007979]/10 border border-[#007979]/20 text-[#007979] text-[10px] font-mono font-bold uppercase tracking-widest">
            <Sparkles size={14} />
            <span>Bazar360 Services Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] font-sans">
            {isUrdu ? 'آٹو چوائس اسپیشلائزڈ سروسز' : 'Specialized Automotive Services'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-sans max-w-2xl">
            {isUrdu 
              ? 'گاڑی کی 360° انسپکشن رپورٹ، ایکائز و رجسٹریشن، پینٹ پروٹیکشن (PPF)، اور کنسائنمنٹ سیلز کا بااعتماد مرکز'
              : 'Certified 360° vehicle inspections with UV paint analysis, hassle-free Excise registration, 9H Ceramic & PPF, and managed sales consignment.'}
          </p>

          {/* Quick PDF Report Generation CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadSamplePDF}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#007979] hover:bg-[#006060] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download size={16} />
              <span>{isUrdu ? 'نمونہ انسپکشن PDF ڈاؤن لوڈ کریں' : 'Download Sample Inspection Report (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: isUrdu ? 'تمام سروسز' : 'All Services' },
          { id: 'inspection', label: isUrdu ? 'انسپکشن رپورٹس' : 'Inspection & UV Health' },
          { id: 'legal', label: isUrdu ? 'ایکائز و فنانس' : 'Excise & Financing' },
          { id: 'care', label: isUrdu ? 'ڈیٹیلنگ و PPF' : 'Detailing & PPF Protection' },
          { id: 'sales', label: isUrdu ? 'سیل فار یو' : 'Sell For U Consignment' },
          { id: 'management', label: isUrdu ? 'سروس مینیجمنٹ' : 'Service Management Hub' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
              activeCategory === cat.id
                ? 'bg-[#007979] text-white border-[#007979] shadow-xs'
                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#007979]/40 hover:text-[#0F172A]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {activeCategory === 'management' ? (
        <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-4 sm:p-6 shadow-xs">
          <ServiceManagementHub lang={lang} />
        </div>
      ) : (
        /* 3. Specialized Service Cards Stacked Vertical Grid (Mobile & Desktop) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch w-full">
          {filteredServices.map((service) => {
            const IconComp = service.icon;

          return (
            <div
              key={service.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#007979]/40 p-5 sm:p-6 rounded-3xl flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-0.5 shadow-xs relative group overflow-hidden w-full"
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="p-3 rounded-2xl bg-[#007979]/10 border border-[#007979]/20 text-[#007979] group-hover:scale-105 transition-transform">
                    <IconComp size={22} />
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${service.badgeColor}`}>
                    {service.badge}
                  </span>
                </div>

                {/* Title & Price */}
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A] font-sans">
                    {service.title}
                  </h2>
                  <span className="text-xs sm:text-sm text-[#007979] font-mono font-bold mt-1 block">
                    {service.price}
                  </span>
                </div>

                <p className="text-xs text-[#64748B] leading-relaxed font-sans">
                  {service.desc}
                </p>

                {/* Features List */}
                <ul className="space-y-2 pt-2 border-t border-[#E2E8F0] text-xs text-[#475569] font-sans">
                  {service.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-[#007979] shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleOpenBooking(service.id)}
                  className="w-full min-h-[44px] bg-[#007979] hover:bg-[#006060] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer active:scale-95 text-center shadow-xs flex items-center justify-center gap-2"
                >
                  <Zap size={16} />
                  <span>{isUrdu ? 'ابھی بک کریں' : 'Request Service / Book Now'}</span>
                </button>

                {service.hasPdfTool && (
                  <button
                    onClick={handleDownloadSamplePDF}
                    className="w-full min-h-[44px] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#007979] font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer border border-[#E2E8F0] flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Download size={15} />
                    <span>{isUrdu ? 'انسپکشن رپورٹ PDF ڈاؤن لوڈ' : 'Sample PDF Inspection Report'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* 4. Interactive Booking Modal with Silent Auto-Save */}
      {selectedServiceId && (
        <div className="fixed inset-0 bg-slate-900/60 z-[120] backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl my-8 text-[#0F172A] max-h-[90vh] overflow-y-auto">
            
            {/* Close */}
            <button
              onClick={() => setSelectedServiceId(null)}
              className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] p-2 hover:bg-[#F1F5F9] rounded-xl cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#007979] bg-[#007979]/10 px-3 py-1 rounded-full border border-[#007979]/20 uppercase tracking-widest">
                  {servicesList.find(s => s.id === selectedServiceId)?.title}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] font-sans mt-3">
                  {isUrdu ? 'سروس بکنگ کی درخواست' : 'Book Automotive Service'}
                </h2>
                <p className="text-xs text-[#64748B] font-sans mt-1">
                  {isUrdu 
                    ? 'تفصیلات درج کریں، ہماری ٹیم فوری طور پر رابطہ کرے گی' 
                    : 'Submit your details. Background lead logging auto-saves your booking instantly.'}
                </p>
              </div>

              {savingState !== 'saved' ? (
                <form onSubmit={handleSilentSubmit} className="space-y-4">
                  
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">
                      {isUrdu ? 'آپ کا نام' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      placeholder="e.g. Muhammad Ali"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-sm rounded-xl p-3 focus:border-[#007979] focus:bg-white focus:ring-1 focus:ring-[#007979] outline-none text-[#0F172A] min-h-[44px]"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">
                      {isUrdu ? 'فون / واٹس ایپ نمبر' : 'Phone / WhatsApp Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      placeholder="e.g. 03149198403"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-sm rounded-xl p-3 focus:border-[#007979] focus:bg-white focus:ring-1 focus:ring-[#007979] outline-none text-[#0F172A] min-h-[44px]"
                    />
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">
                      {isUrdu ? 'گاڑی کی تفصیلات (میک/ماڈل/سال)' : 'Vehicle Make / Model / Year'}
                    </label>
                    <input
                      type="text"
                      value={bookingForm.vehicleInfo}
                      onChange={(e) => setBookingForm({ ...bookingForm, vehicleInfo: e.target.value })}
                      placeholder="e.g. 2023 Toyota Fortuner Legender"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-sm rounded-xl p-3 focus:border-[#007979] focus:bg-white focus:ring-1 focus:ring-[#007979] outline-none text-[#0F172A] min-h-[44px]"
                    />
                  </div>

                  {/* City & Preferred Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">
                        {isUrdu ? 'شہر' : 'City'}
                      </label>
                      <select
                        value={bookingForm.city}
                        onChange={(e) => setBookingForm({ ...bookingForm, city: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-sm rounded-xl p-3 focus:border-[#007979] focus:bg-white focus:ring-1 focus:ring-[#007979] outline-none text-[#0F172A] min-h-[44px]"
                      >
                        <option value="Peshawar">Peshawar</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Mardan">Mardan</option>
                        <option value="Swat">Swat</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">
                        {isUrdu ? 'پسندیدہ تاریخ' : 'Preferred Date'}
                      </label>
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-sm rounded-xl p-3 focus:border-[#007979] focus:bg-white focus:ring-1 focus:ring-[#007979] outline-none text-[#0F172A] min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Specialized UV Light Paint-Checking Option (for Inspection & Detailing) */}
                  {(selectedServiceId === 'inspection' || selectedServiceId === 'detailing' || selectedServiceId === 'ceramic_ppf') && (
                    <div className="p-3.5 rounded-2xl bg-[#007979]/5 border border-[#007979]/20 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bookingForm.uvLightAnalysis}
                          onChange={(e) => setBookingForm({ ...bookingForm, uvLightAnalysis: e.target.checked })}
                          className="w-4 h-4 accent-[#007979] rounded cursor-pointer"
                        />
                        <span className="text-xs font-bold uppercase tracking-wide text-[#007979]">
                          Include UV Light Paint-Checking Spectrum Analysis
                        </span>
                      </label>
                      <p className="text-[11px] text-[#64748B] pl-6 leading-normal">
                        Detects hidden body filler, resprays, quarter panel repairs, and clear coat thickness using specialized UV lamps.
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">
                      {isUrdu ? 'اضافی ہدایات' : 'Special Instructions / Notes'}
                    </label>
                    <textarea
                      rows={2}
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      placeholder="e.g. Requesting home location inspection in Peshawar..."
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-sm rounded-xl p-3 focus:border-[#007979] focus:bg-white focus:ring-1 focus:ring-[#007979] outline-none text-[#0F172A]"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={savingState === 'saving'}
                    className="w-full min-h-[44px] bg-[#007979] hover:bg-[#006060] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl text-center cursor-pointer transition-all active:scale-95 shadow-xs flex items-center justify-center gap-2 mt-4"
                  >
                    {savingState === 'saving' ? (
                      <span>Saving Booking...</span>
                    ) : (
                      <>
                        <Zap size={16} />
                        <span>{isUrdu ? 'بکنگ کی تصدیق کریں' : 'Confirm Service Booking'}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Silent Confirmation View */
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 bg-[#007979]/10 border border-[#007979]/20 text-[#007979] rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle size={36} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#0F172A] font-sans">
                      {isUrdu ? 'سروس بکنگ کی درخواست موصول ہوگئی!' : 'Booking Registered Successfully!'}
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed font-sans max-w-sm mx-auto">
                      {isUrdu 
                        ? 'آپ کی درخواست ہمارے CRM سسٹم میں محفوظ ہو گئی ہے۔ نمائندہ جلد آپ سے رابطہ کرے گا۔' 
                        : 'Your booking lead has been registered in the Bazar360 CRM. Our service desk will contact you via WhatsApp shortly.'}
                    </p>
                    {savedBookingId && (
                      <span className="inline-block text-[11px] font-mono font-bold text-[#007979] bg-[#007979]/10 px-3 py-1 rounded-full border border-[#007979]/20">
                        Reference ID: {savedBookingId}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setSelectedServiceId(null)}
                      className="min-h-[44px] w-full sm:w-auto bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all cursor-pointer border border-[#E2E8F0]"
                    >
                      {isUrdu ? 'بند کریں' : 'Close'}
                    </button>

                    {selectedServiceId === 'inspection' && (
                      <button
                        onClick={handleDownloadSamplePDF}
                        className="min-h-[44px] w-full sm:w-auto bg-[#007979] hover:bg-[#006060] text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                      >
                        <Download size={16} />
                        <span>Download PDF Inspection</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
