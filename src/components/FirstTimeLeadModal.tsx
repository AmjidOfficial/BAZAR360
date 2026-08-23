import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, MapPin, Sparkles, X, ChevronRight, ShieldCheck, Car, Building2, CheckCircle2 } from 'lucide-react';
import { dbTrackLeadAction } from '../lib/dbService';

interface FirstTimeLeadModalProps {
  lang: 'en' | 'ur';
  onComplete?: () => void;
}

export default function FirstTimeLeadModal({ lang, onComplete }: FirstTimeLeadModalProps) {
  const isUrdu = lang === 'ur';
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Peshawar');
  const [intent, setIntent] = useState<'Buying' | 'Selling' | 'Showroom' | 'Inspection'>('Buying');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if user has already submitted or skipped onboarding
    const isDismissed = localStorage.getItem('bazar360_lead_modal_dismissed');
    if (!isDismissed) {
      // Delay prompt slightly for clean entering UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('bazar360_lead_modal_dismissed', 'true');
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    try {
      await dbTrackLeadAction({
        userName: name.trim(),
        userPhone: phone.trim(),
        userWhatsApp: phone.trim(),
        userEmail: `lead_${Date.now()}@bazar360.online`,
        actionType: 'session_start',
        details: `1st-time Lead Onboarding: ${name} (${city}) - Interested in ${intent}`,
        leadSource: 'Web PWA Gateway',
        leadScore: 100,
        leadCategory: 'Hot',
        visitorCategory: 'Guest',
        sessionHistory: [`Onboarding Form Submitted in ${city}`]
      });

      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 1400);
    } catch (err) {
      console.warn('Failed to save 1st time lead:', err);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#030712]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-[#0F172A] border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col"
        >
          {/* Top Decorative Glow & Banner */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#0B192C] border-b border-white/10">
            {/* Skip Button at Top Right */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{isUrdu ? 'اسپ ک کریں' : 'Skip for Now'}</span>
              <X size={14} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F97316]/20 border border-[#F97316]/40 flex items-center justify-center shrink-0">
                <Sparkles size={24} className="text-[#F97316]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#22C55E]">
                  {isUrdu ? 'خوش آمدید' : 'Welcome to Bazar360'}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {isUrdu ? 'پاکستان کے تصدیق شدہ آٹو مارکیٹ میں خوش آمدید' : 'Personalize Your Car Search'}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isUrdu
                ? 'بہترین کار ڈیلز، شوروومز اور قیمتوں کی معلومات حاصل کرنے کے لیے اپنی تفصیلات شامل کریں۔'
                : 'Connect with verified showrooms, get instant price alerts, and unlock exclusive WhatsApp bargains in Peshawar & across Pakistan.'}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {isUrdu ? 'شکریہ! تفصیلات محفوظ ہو گئیں' : 'Thank You! Preferences Saved'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isUrdu ? 'مارکیٹ پلیس میں خوش آمدید' : 'Redirecting to verified vehicle inventory...'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>{isUrdu ? 'آپ کا پورا نام' : 'Full Name'}</span>
                    <span className="text-[10px] text-[#F97316]">*Required</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isUrdu ? 'مثال: محمد علی' : 'e.g., Muhammad Ali'}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>{isUrdu ? 'موبائل / واٹس ایپ نمبر' : 'WhatsApp / Mobile Number'}</span>
                    <span className="text-[10px] text-[#F97316]">*Required</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={isUrdu ? '0300 1234567' : 'e.g., 0315 9085086'}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                </div>

                {/* City Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {isUrdu ? 'شہر منتخب کریں' : 'City / Location'}
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F97316] transition-colors appearance-none cursor-pointer"
                    >
                      <option value="Peshawar">Peshawar (پشاور)</option>
                      <option value="Islamabad">Islamabad (اسلام آباد)</option>
                      <option value="Lahore">Lahore (لاہور)</option>
                      <option value="Karachi">Karachi (کراچی)</option>
                      <option value="Rawalpindi">Rawalpindi (راولپنڈی)</option>

                    </select>
                  </div>
                </div>

                {/* Primary Intent Chips */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {isUrdu ? 'آپ کا ارادہ کیا ہے؟' : 'Primary Goal'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Buying', label: 'Buying a Car', icon: Car },
                      { id: 'Selling', label: 'Selling my Car', icon: ShieldCheck },
                      { id: 'Showroom', label: 'Showroom Owner', icon: Building2 },
                      { id: 'Inspection', label: 'Car Inspection', icon: Sparkles },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = intent === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setIntent(item.id as any)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            active
                              ? 'bg-[#F97316]/20 border-[#F97316] text-[#F97316]'
                              : 'bg-[#1E293B]/60 border-white/10 text-slate-300 hover:bg-[#1E293B]'
                          }`}
                        >
                          <Icon size={14} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? (isUrdu ? 'براہ کرم انتظار کریں...' : 'Saving...') : (isUrdu ? 'محفوظ کریں اور آگے بڑھیں' : 'Submit & Continue')}</span>
                    <ChevronRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="py-3 px-4 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {isUrdu ? 'بعد میں' : 'Skip'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
