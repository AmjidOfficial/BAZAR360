import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Compass, 
  ArrowUpRight, 
  Heart, 
  Sparkles, 
  MapPin, 
  Mail,
  HelpCircle,
  Users,
  Lock,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle
} from 'lucide-react';
import { dbSaveSuggestion, Suggestion } from '../lib/dbService';
import { Bazar360Logo } from './Bazar360Logo';

interface FooterProps {
  lang?: 'en' | 'ur';
  setTab?: (tab: string) => void;
  onOpenSupportDrawer?: () => void;
}

export default function Footer({ lang = 'en', setTab, onOpenSupportDrawer }: FooterProps) {
  const [suggestionText, setSuggestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      const newSuggestion: Suggestion = {
        id: 'sug_' + Math.random().toString(36).substr(2, 9),
        user_id: null, // Anonymous or can be bound if user state is added
        suggestion_text: suggestionText.trim(),
        submitted_at: new Date().toISOString(),
      };

      await dbSaveSuggestion(newSuggestion);
      setSuggestionText('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error submitting suggestion:', err);
      setSubmitError(lang === 'ur' ? 'تجاویز جمع کرنے میں خرابی پیش آئی۔' : 'Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUrdu = lang === 'ur';

  // Localized texts
  const t = {
    vision: isUrdu 
      ? 'پاکستان کا سب سے آسان آٹوموٹو مارکیٹ پلیس۔ براہ راست معائنہ، تصدیق شدہ شورومز، اور فیس بک اسٹائل کے براہ راست سودے بغیر کسی کمیشن کے۔'
      : 'Peshawar\'s premium direct automotive network. Post ads in under 60 seconds, experience live inspections, and connect directly with verified showrooms.',
    tagline: isUrdu ? 'تیز۔ قابل اعتماد۔ آپ کا آٹو نیٹ ورک۔' : 'Fast. Reliable. Your Automotive Network.',
    copyright: isUrdu ? '© ۲۰۲۶ بازار۳۶۰۔ جملہ حقوق محفوظ ہیں۔' : '© 2026 Bazar360. All rights reserved.',
    navTitle: isUrdu ? 'نیٹ ورک لنکس' : 'Explore Network',
    supportTitle: isUrdu ? 'سپورٹ ڈیسک' : 'Support Desk',
    suggestionsTitle: isUrdu ? 'تجاویز باکس' : 'Send Suggestions',
    suggestionsSub: isUrdu 
      ? 'ہمیں بازار۳۶۰ کو مزید بہتر بنانے میں مدد کریں۔ آپ کی تجاویز براہ راست ہمارے ایڈمن تک پہنچتی ہیں۔'
      : 'Help us improve Bazar360. Your suggestions are delivered directly to our administration desk.',
    placeholder: isUrdu ? 'اپنی قیمتی تجویز یہاں لکھیں...' : 'Share your suggestion or feedback...',
    btnSend: isUrdu ? 'ارسال کریں' : 'Submit',
    successMsg: isUrdu ? 'تجویز جمع کرانے کا شکریہ! یہ ایڈمن کو ارسال کر دی گئی ہے۔' : 'Thank you! Your feedback has been registered.',
    openTicket: isUrdu ? 'سپورٹ ٹکٹ کھولیں' : 'Open Support Ticket',
    adminMazhar: isUrdu ? 'ملک مظہر (سروسز)' : 'Malak Mazhar (Services)',
    adminAmjid: isUrdu ? 'محمد امجد (بانی)' : 'Muhammad Amjid (Founder)',
    badgeNative: isUrdu ? 'پشاور نیٹورک' : 'Peshawar Regional',
  };

  return (
    <div id="bazar360-footer-container" className="w-full mt-auto relative z-10 select-none">
      {/* 1. Signature Wave Curve Divider (Inspired by Pic 1) */}
      <div className="w-full relative overflow-hidden -mt-1 pointer-events-none select-none">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block -mb-0.5">
          {/* Accent layered orange curves */}
          <path d="M0 60C240 15 480 15 720 50C960 85 1200 85 1440 40V100H0V60Z" fill="#F97316" opacity="0.1" />
          <path d="M0 70C240 30 480 30 720 60C960 90 1200 90 1440 50V100H0V70Z" fill="#F97316" />
          {/* Main Slate/Navy base wave curve */}
          <path d="M0 78C240 38 480 38 720 68C960 98 1200 98 1440 58V100H0V78Z" fill="#0B1329" />
        </svg>
      </div>

      {/* 2. Main High-Fidelity Footer Body */}
      <footer id="bazar360-main-footer" className="w-full bg-[#0B1329] border-t border-white/5 text-slate-300 pt-8 pb-8 px-4 md:px-8 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Main Grid: Clean & Well-Spaced 12-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-6 text-left">
                        {/* Column 1: Brand & Identity */}
            <div className="space-y-4 md:col-span-5 lg:col-span-4">
              <div className="pt-1">
                <Bazar360Logo showTagline={true} themeMode="dark" className="scale-95 origin-left" />
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed font-normal max-w-sm">
                {t.vision}
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2 pt-1">
                <a 
                  href="https://facebook.com/bazar360.online" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <Facebook className="w-3 h-3" />
                </a>
                <a 
                  href="https://instagram.com/bazar360.online" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <Instagram className="w-3 h-3" />
                </a>
                <a 
                  href="https://linkedin.com/company/bazar360" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <Linkedin className="w-3 h-3" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <Youtube className="w-3 h-3" />
                </a>
                <a 
                  href="https://wa.me/923149198403" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <MessageCircle className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Column 2: Streamlined Explore links */}
            <div className="space-y-3 md:col-span-3 lg:col-span-3">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  {lang === 'ur' ? 'روابط تلاش کریں' : 'QUICK EXPLORE'}
                </h3>
                <div className="h-[2px] w-6 bg-[#F97316]"></div>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li>
                  <button 
                    onClick={() => setTab && setTab('search')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="text-[#F97316] font-mono">&gt;</span> {lang === 'ur' ? 'گاڑیاں تلاش کریں' : 'Browse Cars'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTab && setTab('dealers')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="text-[#F97316]">&gt;</span> {lang === 'ur' ? 'تصدیق شدہ شورومز' : 'Verified Showrooms'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTab && setTab('portal')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="text-[#F97316]">&gt;</span> {lang === 'ur' ? 'سروسز آفرز' : 'Flagroom Services'}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onOpenSupportDrawer}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5 text-left"
                  >
                    <span className="text-[#F97316]">&gt;</span> {lang === 'ur' ? 'سپورٹ اور مدد' : 'Help & Support Desk'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: High-Fidelity "Our Team" segment */}
            <div className="space-y-4 md:col-span-4 lg:col-span-5">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  {lang === 'ur' ? 'ہماری ٹیم' : 'OUR TEAM'}
                </h3>
                <div className="h-[2px] w-6 bg-[#F97316]"></div>
              </div>
              <div className="space-y-4 pt-1">
                {/* Team Member 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-sans font-black text-[#F97316]">MA</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-100 flex flex-wrap items-center gap-1">
                      <span>Muhammad Amjid</span>
                      <span className="text-slate-500 font-normal">|</span>
                      <a href="tel:+923149198403" className="font-mono text-[11px] text-slate-400 hover:text-orange-500 transition-colors">03149198403</a>
                    </div>
                    <div className="text-[9px] font-bold text-[#F97316] uppercase tracking-wider">FOUNDER</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Product Strategy • Technology • Platform Development</div>
                  </div>
                </div>

                <div className="border-t border-white/5 my-1"></div>

                {/* Team Member 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-sans font-black text-[#F97316]">MM</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-100 flex flex-wrap items-center gap-1">
                      <span>Malak Mazhar</span>
                      <span className="text-slate-500 font-normal">|</span>
                      <a href="tel:+923159085086" className="font-mono text-[11px] text-slate-400 hover:text-orange-500 transition-colors">03159085086</a>
                    </div>
                    <div className="text-[9px] font-bold text-[#F97316] uppercase tracking-wider">HEAD OF AUTOMOTIVE SALES</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Vehicle Sales • Negotiations • Customer Advisory</div>
                  </div>
                </div>

                <div className="border-t border-white/5 my-1"></div>

                {/* Team Member 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-sans font-black text-[#F97316]">GK</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-100 flex flex-wrap items-center gap-1">
                      <span>Ghani Khan</span>
                      <span className="text-slate-500 font-normal">|</span>
                      <a href="tel:+923556908996" className="font-mono text-[11px] text-slate-400 hover:text-orange-500 transition-colors">03556908996</a>
                    </div>
                    <div className="text-[9px] font-bold text-[#F97316] uppercase tracking-wider">MEDIA & INVENTORY MANAGER</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Vehicle Listings • Media Management • Marketplace Operations</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom copyright segment */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 text-[11px] text-slate-500">
            <span>{t.copyright}</span>
            <div className="flex items-center gap-1">
              <span>{t.tagline}</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse ml-1" />
              <span>for {lang === 'ur' ? 'پشاور کا پریمیم آٹوموٹو نیٹ ورک' : 'Peshawar Premium Automotive Network'}</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
