import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, MessageSquare, Send, CheckCircle, Sparkles, MapPin, Clock, ExternalLink } from 'lucide-react';
import { dbSaveLead, Lead } from '../lib/dbService';

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ur';
}

export default function ContactDrawer({ isOpen, onClose, lang }: ContactDrawerProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const t = {
    en: {
      title: "24/7 Support Desk",
      subtitle: "Get instant assistance from BAZAR360 representatives",
      helpline: "Helpline Connectivity",
      partnerLabel: "Services & Auto Choice Partner",
      founderLabel: "Founder & CEO",
      malakName: "Malak Mazhar",
      amjidName: "Muhammad Amjid",
      btnWhatsApp: "WhatsApp",
      btnCall: "Call Now",
      formTitle: "Instant Support Request",
      formDesc: "Submit your inquiry and we will get back to you instantly",
      placeholderName: "Your Full Name",
      placeholderPhone: "Phone / WhatsApp Number",
      placeholderMsg: "Describe your requirements...",
      btnSend: "Send Inquiry",
      btnSending: "Submitting...",
      successTitle: "Inquiry Sent!",
      successDesc: "Your request has been logged successfully. Representative will connect with you.",
      btnReset: "Submit Another",
      addressLabel: "Support Center",
      addressValue: "Peshawar, KP, Pakistan",
      availability: "Response time: < 15 mins",
    },
    ur: {
      title: "24/7 سپورٹ ڈیسک",
      subtitle: "بازار360 کے نمائندوں سے فوری مدد حاصل کریں",
      helpline: "ہیلپ لائن رابطہ",
      partnerLabel: "سروسز اور آٹو چوائس پارٹنر",
      founderLabel: "بانی اور سی ای او",
      malakName: "ملک مظہر",
      amjidName: "محمد امجد",
      btnWhatsApp: "واٹس ایپ",
      btnCall: "کال کریں",
      formTitle: "فوری سپورٹ فارم",
      formDesc: "اپنی انکوائری جمع کروائیں، ہم فوری رابطہ کریں گے",
      placeholderName: "آپ کا نام",
      placeholderPhone: "فون یا واٹس ایپ نمبر",
      placeholderMsg: "تفصیلات یہاں لکھیں...",
      btnSend: "انکوائری بھیجیں",
      btnSending: "بھیجا جا رہا ہے...",
      successTitle: "انکوائری موصول ہوئی!",
      successDesc: "آپ کی انکوائری کامیابی سے درج ہو چکی ہے۔ ہمارا نمائندہ جلد رابطہ کرے گا۔",
      btnReset: "دوسری انکوائری",
      addressLabel: "سپورٹ سینٹر",
      addressValue: "پشاور، خیبر پختونخوا، پاکستان",
      availability: "جواب کا وقت: 15 منٹ سے کم",
    }
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;

    setIsSubmitting(true);
    const newLead: Lead = {
      id: `support-lead-${Date.now()}`,
      type: 'Support Request',
      title: `Support Inquiry from ${name}`,
      userName: name,
      userPhone: phone,
      userEmail: 'support-desk@bazar360.online',
      details: message,
      metadata: {
        source: 'Contact Drawer 24/7',
        device: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'
      },
      createdAt: new Date().toISOString()
    };

    try {
      await dbSaveLead(newLead);
      setSubmitted(true);
      setName('');
      setPhone('');
      setMessage('');
    } catch (error) {
      console.error("Error saving support inquiry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRtl = lang === 'ur';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Ambient Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-sm"
          />

          {/* Premium Bottom Drawer Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 210 }}
            className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-[#0b0f19] border-t border-slate-200 dark:border-white/5 rounded-t-[32px] p-6 pb-12 z-[121] shadow-[0_-15px_45px_rgba(0,0,0,0.4)] overflow-y-auto max-h-[92vh] text-slate-900 dark:text-white ${
              isRtl ? 'text-right font-sans' : 'text-left font-sans'
            }`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Grab Bar Handle */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-5 shrink-0" />

            {/* Header section */}
            <div className="flex items-center justify-between mb-6 shrink-0 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-[#38BDF8]/10 text-sky-500 dark:text-[#38BDF8] flex items-center justify-center">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-base font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                    {t.title}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 animate-pulse">
                      Live
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 font-sans mt-0.5">
                    {t.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label="Close Support Drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Response speed label */}
            <div className="flex items-center justify-between gap-2 p-2.5 px-3.5 mb-5 rounded-xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/10 text-[10px] font-sans font-bold tracking-tight text-sky-600 dark:text-sky-400 uppercase">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {t.availability}
              </span>
              <span>24/7 HELPDESK</span>
            </div>

            {/* Content Body: Direct Helpline Options */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {t.helpline}
              </h4>

              {/* 1. Malak Mazhar Card */}
              <div className="bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center font-sans font-black text-sm select-none shrink-0 border border-amber-500/15">
                    MM
                  </div>
                  <div>
                    <span className="text-[9px] font-sans font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider block">
                      {t.partnerLabel}
                    </span>
                    <h5 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase leading-tight mt-0.5">
                      {t.malakName}
                    </h5>
                    <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                      <Phone size={11} className="text-amber-500" />
                      +92 315 9085086
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://wa.me/923159085086"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center text-[10px] font-black uppercase font-sans px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-stone-950 border border-emerald-500/20 hover:border-transparent transition-all flex items-center justify-center gap-1 min-h-[44px]"
                  >
                    <MessageSquare size={12} />
                    {t.btnWhatsApp}
                  </a>
                  <a
                    href="tel:+923159085086"
                    className="flex-1 sm:flex-none text-center text-[10px] font-black uppercase font-sans px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-[#38BDF8] text-sky-600 dark:text-[#38BDF8] hover:text-stone-950 border border-sky-500/20 hover:border-transparent transition-all flex items-center justify-center gap-1 min-h-[44px]"
                  >
                    <Phone size={12} />
                    {t.btnCall}
                  </a>
                </div>
              </div>

              {/* 2. Muhammad Amjid Card */}
              <div className="bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center font-sans font-black text-sm select-none shrink-0 border border-sky-500/15">
                    MA
                  </div>
                  <div>
                    <span className="text-[9px] font-sans font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                      {t.founderLabel}
                    </span>
                    <h5 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase leading-tight mt-0.5">
                      {t.amjidName}
                    </h5>
                    <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                      <Phone size={11} className="text-[#38BDF8]" />
                      +92 314 9198403
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://wa.me/923149198403"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center text-[10px] font-black uppercase font-sans px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-stone-950 border border-emerald-500/20 hover:border-transparent transition-all flex items-center justify-center gap-1 min-h-[44px]"
                  >
                    <MessageSquare size={12} />
                    {t.btnWhatsApp}
                  </a>
                  <a
                    href="tel:+923149198403"
                    className="flex-1 sm:flex-none text-center text-[10px] font-black uppercase font-sans px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-[#38BDF8] text-sky-600 dark:text-[#38BDF8] hover:text-stone-950 border border-sky-500/20 hover:border-transparent transition-all flex items-center justify-center gap-1 min-h-[44px]"
                  >
                    <Phone size={12} />
                    {t.btnCall}
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive Quick Ticket / Inquiry Form */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-mono font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      {t.formTitle}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-gray-400 mt-0.5 font-sans leading-snug">
                      {t.formDesc}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.placeholderName}
                      className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/5 text-sm rounded-xl p-3 focus:border-sky-500 dark:focus:border-[#38bdf8] outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 min-h-[44px]"
                    />

                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.placeholderPhone}
                      className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/5 text-sm rounded-xl p-3 focus:border-sky-500 dark:focus:border-[#38bdf8] outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 min-h-[44px]"
                    />

                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.placeholderMsg}
                      className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/5 text-sm rounded-xl p-3 focus:border-sky-500 dark:focus:border-[#38bdf8] outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-sky-500 hover:bg-sky-600 dark:bg-[#0ea5e9] dark:hover:bg-[#38bdf8] text-white font-sans font-extrabold text-xs uppercase py-3.5 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                  >
                    <Send size={13} />
                    {isSubmitting ? t.btnSending : t.btnSend}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-4 py-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-5 rounded-2xl">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/15">
                    <CheckCircle size={24} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-sm font-sans font-black uppercase text-slate-900 dark:text-white">
                      {t.successTitle}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-snug font-sans max-w-xs mx-auto">
                      {t.successDesc}
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white font-sans font-bold uppercase tracking-wider px-5 py-2 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-white/10"
                  >
                    {t.btnReset}
                  </button>
                </div>
              )}
            </div>

            {/* Location & Support physical presence card */}
            <div className="mt-5 flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#030712]/40 border border-slate-200 dark:border-white/5 text-[11px] text-slate-500 dark:text-gray-400">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 dark:bg-[#38bdf8]/10 text-sky-500 dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                <MapPin size={14} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-sans font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">
                  {t.addressLabel}
                </span>
                <p className="font-sans text-slate-700 dark:text-gray-300 truncate mt-0.5">
                  {t.addressValue}
                </p>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
