import React, { useState } from 'react';
import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Send,
  Youtube,
  ShieldCheck,
  BadgeCheck,
  Headphones,
  ArrowUpRight,
} from 'lucide-react';
import { dbSaveSuggestion, Suggestion } from '../lib/dbService';

interface FooterProps {
  lang?: 'en' | 'ur';
  setTab?: (tab: string) => void;
  onOpenSupportDrawer?: () => void;
}

const footerLinkClass =
  'group inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors duration-200';

export default function Footer({ lang = 'en', setTab, onOpenSupportDrawer }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const isUrdu = lang === 'ur';

  const navigate = (tab: string) => {
    setTab?.(tab);
    window?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value || !/^\S+@\S+\.\S+$/.test(value)) {
      setMessage(isUrdu ? 'براہ کرم درست ای میل درج کریں۔' : 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const subscription: Suggestion = {
        id: `newsletter_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        user_id: null,
        suggestion_text: `Newsletter subscription: ${value}`,
        submitted_at: new Date().toISOString(),
      };
      await dbSaveSuggestion(subscription);
      setEmail('');
      setMessage(isUrdu ? 'آپ سبسکرائب ہو گئے ہیں۔ شکریہ!' : 'You are subscribed. Thank you!');
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setMessage(isUrdu ? 'ابھی سبسکرائب نہیں ہو سکا۔ دوبارہ کوشش کریں۔' : 'Could not subscribe right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer
      id="bazar360-main-footer"
      className="w-full overflow-hidden border-t border-white/10 bg-[#050F1D] text-slate-300"
    >
      <div className="mx-auto w-full max-w-[1500px] px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-12">
          {/* Brand */}
          <section className="lg:col-span-4">
            <a href="/" aria-label="Bazar360.online home" className="inline-flex flex-col gap-4">
              <img
                src="/Bazar360.online Logo.png"
                alt="Bazar360.online - Everything You Need"
                className="h-auto max-h-28 w-auto max-w-[330px] object-contain object-left drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
                loading="lazy"
              />
            </a>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              {isUrdu
                ? 'پاکستان کا آسان، تیز اور قابلِ اعتماد آن لائن مارکیٹ پلیس۔ گاڑیاں، بائیکس، شو رومز اور آٹو پارٹس ایک جگہ۔'
                : "Pakistan's simple, fast and trusted automotive marketplace. Buy, sell and discover cars, bikes, showrooms and auto parts in one place."}
            </p>

            <div className="mt-6 flex items-center gap-2.5" aria-label="Bazar360 social links">
              <a href="https://facebook.com/bazar360.online" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:-translate-y-0.5 hover:border-[#1877F2]/60 hover:bg-[#1877F2] hover:text-white"><Facebook size={18} /></a>
              <a href="https://instagram.com/bazar360.online" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:-translate-y-0.5 hover:border-[#E4405F]/60 hover:bg-[#E4405F] hover:text-white"><Instagram size={18} /></a>
              <a href="https://www.youtube.com/@bazar360online" target="_blank" rel="noreferrer" aria-label="YouTube" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:-translate-y-0.5 hover:border-[#FF0000]/60 hover:bg-[#FF0000] hover:text-white"><Youtube size={18} /></a>
              <a href="https://linkedin.com/company/bazar360" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:-translate-y-0.5 hover:border-[#0A66C2]/60 hover:bg-[#0A66C2] hover:text-white"><Linkedin size={18} /></a>
              <a href="https://wa.me/923149198403" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:-translate-y-0.5 hover:border-[#22C55E]/60 hover:bg-[#22C55E] hover:text-white"><MessageCircle size={18} /></a>
            </div>
          </section>

          {/* Buy */}
          <nav aria-label="Buy" className="lg:col-span-2">
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#55A8E8]">Buy</h3>
            <ul className="space-y-3.5">
              <li><button onClick={() => navigate('search')} className={footerLinkClass}>Browse Cars <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('search')} className={footerLinkClass}>Browse Bikes <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('search')} className={footerLinkClass}>Spare Parts <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('dealers')} className={footerLinkClass}>Showrooms <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('search')} className={footerLinkClass}>New Cars <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('search')} className={footerLinkClass}>Used Cars <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
            </ul>
          </nav>

          {/* Sell */}
          <nav aria-label="Sell" className="lg:col-span-2">
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#55A8E8]">Sell</h3>
            <ul className="space-y-3.5">
              <li><button onClick={() => navigate('sell')} className={footerLinkClass}>Post Your Ad <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('sell')} className={footerLinkClass}>Dealer Signup <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('services')} className={footerLinkClass}>How It Works <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('sell')} className={footerLinkClass}>Pricing <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('sell')} className={footerLinkClass}>Ad Packages <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company" className="lg:col-span-2">
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#55A8E8]">Company</h3>
            <ul className="space-y-3.5">
              <li><button onClick={() => navigate('about')} className={footerLinkClass}>About Us <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('blog')} className={footerLinkClass}>Blog <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('contact')} className={footerLinkClass}>Contact Us <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('guides')} className={footerLinkClass}>Terms of Use <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
              <li><button onClick={() => navigate('guides')} className={footerLinkClass}>Privacy Policy <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></button></li>
            </ul>
          </nav>

          {/* Support + newsletter */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 shadow-2xl shadow-black/10 lg:col-span-2">
            <h3 className="text-lg font-bold text-white">Stay Updated</h3>
            <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#55A8E8] to-[#F97316]" />
            <p className="mt-4 text-sm leading-6 text-slate-400">Subscribe for new listings, market updates and useful automotive news.</p>

            <form onSubmit={handleNewsletterSubmit} className="mt-5 space-y-3">
              <label htmlFor="bazar360-newsletter" className="sr-only">Email address</label>
              <input
                id="bazar360-newsletter"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-white/10 bg-[#0B1524] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#55A8E8]/70 focus:ring-2 focus:ring-[#55A8E8]/10"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#087FAE] to-[#F97316] px-4 text-sm font-bold text-white shadow-lg shadow-orange-950/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={15} />
                {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
              </button>
              {message && <p className="text-xs leading-5 text-slate-300" role="status">{message}</p>}
            </form>

            <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
              <button onClick={() => onOpenSupportDrawer ? onOpenSupportDrawer() : navigate('contact')} className="flex w-full items-center gap-2 text-left text-xs font-semibold text-slate-300 hover:text-white"><Headphones size={15} /> Help & Support</button>
              <button onClick={() => navigate('faq')} className="flex w-full items-center gap-2 text-left text-xs font-semibold text-slate-300 hover:text-white"><ShieldCheck size={15} /> Safety & FAQ</button>
            </div>
          </section>
        </div>

        {/* Auto Choice */}
        <div className="mt-12 border-t border-white/10 pt-10">
          <div className="flex min-h-40 items-center justify-center rounded-3xl bg-[#071423] px-6 py-8">
            <img
              src="/Auto Choice logo.png"
              alt="Auto Choice - The Right Choice"
              className="max-h-36 w-auto max-w-[420px] object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
              loading="lazy"
            />
          </div>
        </div>

        {/* Trust + legal bar */}
        <div className="mt-8 flex flex-col gap-6 border-t border-white/10 pt-7 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500">© {new Date().getFullYear()} Bazar360.online - All Rights Reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-slate-400">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={16} /> Secure Payments</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck size={16} /> Verified Sellers</span>
            <span className="inline-flex items-center gap-2"><Headphones size={16} /> 24/7 Support</span>
          </div>

          <div className="flex items-center gap-2" aria-label="Trust highlights">
            <span className="rounded-md bg-white/5 border border-white/10 px-3 py-1.5 font-bold text-slate-300">Certified Dealerships</span>
            <span className="rounded-md bg-white/5 border border-white/10 px-3 py-1.5 font-bold text-slate-300">200+ Pt Inspection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
