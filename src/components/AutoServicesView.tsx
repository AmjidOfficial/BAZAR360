import React, { useState } from 'react';
import { ShieldCheck, Landmark, Shield, Calendar, Phone, CheckCircle, Sparkles, X } from 'lucide-react';

interface AutoServicesViewProps {
  lang: 'en' | 'ur';
}

export default function AutoServicesView({ lang }: AutoServicesViewProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');

  const t = {
    en: {
      title: "Auto Services",
      subtitle: "Professional automotive solutions tailored for your absolute peace of mind",
      bookBtn: "Book Now",
      successTitle: "Booking Request Received!",
      successDesc: "Your request has been registered. Our expert team will contact you on WhatsApp shortly.",
      closeBtn: "Close",
      formTitle: "Service Booking Request",
      formSubtitle: "Fill in the details below to secure your appointment",
      nameLabel: "Your Name",
      phoneLabel: "Phone / WhatsApp",
      submitBtn: "Confirm Booking",
      services: [
        {
          id: 'inspection',
          title: "Car Inspection",
          desc: "Get a highly comprehensive 200+ point detailed physical and computerized inspection report before purchasing any vehicle.",
          price: "Rs. 4,999 Only",
          features: ["Engine & Transmission diagnostics", "Suspension & Under-carriage check", "Paint & Accident body inspection", "Computerized OBD Scanner report"]
        },
        {
          id: 'financing',
          title: "Auto Financing",
          desc: "Unlock easy, tailor-made financing plans with our partner banks at Pakistan's lowest markup rates with quick approvals.",
          price: "Up to 5 Year Plans",
          features: ["Minimal processing fee", "Fast-track 3-day approval", "Partnerships with major Islamic banks", "Flexible markup structures"]
        },
        {
          id: 'insurance',
          title: "Car Insurance",
          desc: "Protect your asset with comprehensive vehicle insurance offering zero-depreciation and lightning-fast claim processing.",
          price: "Starting from 1.5% annually",
          features: ["Accident damage coverage", "Theft & Third-party liability", "Instant digital claim filing", "24/7 roadside assistance support"]
        }
      ]
    },
    ur: {
      title: "آٹو سروسز",
      subtitle: "آپ کے مکمل اطمینان کے لیے تیار کردہ بہترین آٹوموٹو سروسز اور حل",
      bookBtn: "ابھی بک کریں",
      successTitle: "بکنگ کی درخواست موصول ہو گئی!",
      successDesc: "آپ کی درخواست رجسٹر ہو گئی ہے۔ ہماری ماہر ٹیم جلد ہی آپ سے واٹس ایپ پر رابطہ کرے گی۔",
      closeBtn: "بند کریں",
      formTitle: "سروس بکنگ فارم",
      formSubtitle: "اپنی بکنگ کو یقینی بنانے کے لیے درج ذیل تفصیلات پُر کریں",
      nameLabel: "آپ کا نام",
      phoneLabel: "فون / واٹس ایپ نمبر",
      submitBtn: "بکنگ کی تصدیق کریں",
      services: [
        {
          id: 'inspection',
          title: "کار انسپکشن رپورٹ",
          desc: "کسی بھی گاڑی کو خریدنے سے پہلے 200 سے زائد پوائنٹس پر مشتمل تفصیلی فزیکل اور کمپیوٹرائزڈ انسپکشن رپورٹ حاصل کریں۔",
          price: "صرف 4,999 روپے",
          features: ["انجن اور گیئر باکس کی تفصیلی جانچ", "سسپنشن اور باڈی کا معائنہ", "پینٹ اور حادثاتی باڈی چیک", "کمپیوٹرائزڈ OBD اسکینر رپورٹ"]
        },
        {
          id: 'financing',
          title: "گاڑیوں کے لیے فنانسنگ",
          desc: "ہمارے شراکت دار بینکوں کے ساتھ پاکستان کے سب سے کم مارک اپ ریٹس پر آسان ترین اقساط کے پلانز حاصل کریں۔",
          price: "5 سال تک کا پلان",
          features: ["کم سے کم پروسیسنگ فیس", "صرف 3 دن میں فوری منظوری", "پاکستان کے نامور اسلامی بینکوں کے ساتھ پارٹنرشپ", "لچکدار مارک اپ پلانز"]
        },
        {
          id: 'insurance',
          title: "گاڑیوں کی انشورنس",
          desc: "فوری کلیمز پروسیسنگ اور بہترین کوریج کے ساتھ اپنی قیمتی گاڑی کو سیکیور اور انشورڈ کریں۔",
          price: "سالانہ صرف 1.5٪ سے شروع",
          features: ["حادثاتی نقصان کی مکمل کوریج", "چوری اور تھرڈ پارٹی کلیمز کوریج", "ڈیجیٹل دعویٰ فائلنگ سروس", "24/7 روڈ سائیڈ اسسٹنس سپورٹ"]
        }
      ]
    }
  }[lang];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone) return;
    setFormSubmitted(true);
  };

  const handleClose = () => {
    setSelectedService(null);
    setFormSubmitted(false);
    setBookingName('');
    setBookingPhone('');
  };

  const isRtl = lang === 'ur';

  return (
    <div 
      className={`space-y-12 animate-fade-in text-white ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header Banner */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider font-sans text-[#38BDF8] flex items-center gap-2">
          <Sparkles size={20} className="text-[#38BDF8]" />
          {t.title}
        </h2>
        <p className="text-xs md:text-sm text-gray-400 mt-1 font-sans">
          {t.subtitle}
        </p>
      </div>

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {t.services.map((serv, index) => {
          const icons = [ShieldCheck, Landmark, Shield];
          const IconComp = icons[index];

          return (
            <div 
              key={serv.id}
              className="bg-[#0b0f19] border border-white/5 hover:border-[#38bdf8]/40 p-6 rounded-3xl flex flex-col justify-between space-y-6 transition-all hover:-translate-y-1 shadow-lg"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center">
                  <IconComp size={24} />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-white font-sans">
                    {serv.title}
                  </h3>
                  <span className="text-xs text-[#38bdf8] font-mono font-bold mt-1 block">
                    {serv.price}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-sans">
                  {serv.desc}
                </p>

                {/* Features List */}
                <ul className="space-y-2 pt-2 text-xs text-gray-400 font-sans">
                  {serv.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedService(serv.title)}
                className="w-full bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-sans font-extrabold text-xs uppercase py-3 rounded-xl transition-all cursor-pointer active:scale-95 text-center shadow-md shadow-[#0ea5e9]/10"
                style={{ minHeight: '44px' }}
              >
                {t.bookBtn}
              </button>
            </div>
          );
        })}
      </div>

      {/* Booking Form Dialog Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-scale-fade text-white">
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-xl cursor-pointer"
            >
              <X size={16} />
            </button>

            {!formSubmitted ? (
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-black text-[#38bdf8] bg-[#38bdf8]/10 px-3 py-1 rounded-full border border-[#38bdf8]/20 uppercase tracking-widest">
                    {selectedService}
                  </span>
                  <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-white font-sans mt-3">
                    {t.formTitle}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    {t.formSubtitle}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-sans font-black uppercase tracking-wider text-gray-400 block">
                      {t.nameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="e.g. Muhammad Ali"
                      className="w-full bg-[#030712] border border-white/5 text-sm rounded-xl p-3 focus:border-[#38bdf8] outline-none text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-sans font-black uppercase tracking-wider text-gray-400 block">
                      {t.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      placeholder="e.g. 03149198403"
                      className="w-full bg-[#030712] border border-white/5 text-sm rounded-xl p-3 focus:border-[#38bdf8] outline-none text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-sans font-extrabold text-xs uppercase py-3.5 rounded-xl text-center cursor-pointer transition-all active:scale-95"
                  style={{ minHeight: '44px' }}
                >
                  {t.submitBtn}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6 py-6">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-white font-sans">
                    {t.successTitle}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-xs mx-auto">
                    {t.successDesc}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="bg-white/5 hover:bg-white/10 text-white font-sans font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all cursor-pointer border border-white/10"
                >
                  {t.closeBtn}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
