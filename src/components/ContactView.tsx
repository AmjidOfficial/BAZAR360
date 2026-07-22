import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  CheckCircle, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  Users, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  TrendingUp,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ContactViewProps {
  lang: 'en' | 'ur';
  onOpenSupportDrawer?: () => void;
}

export default function ContactView({ lang, onOpenSupportDrawer }: ContactViewProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'help' | 'contact' | 'terms'>('about');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const isRtl = lang === 'ur';

  // Translation sets for all components
  const t = {
    en: {
      aboutTab: "About Us",
      helpTab: "Help Center",
      contactTab: "Contact Support",
      termsTab: "Terms & Conditions",
      title: "Corporate & Support Hub",
      subtitle: "Explore our vision, find answers to questions, contact our executive team, or read terms.",
      
      // About Us Translation
      aboutHeading: "Our Journey & Vision",
      aboutSub: "Peshawar's most trusted, digitally-integrated premium automotive marketplace.",
      aboutDesc1: "Bazar360 is a cutting-edge automotive platform that connects buyers directly with certified showrooms and individual sellers across Khyber Pakhtunkhwa. Founded with a vision to eliminate fraud, reduce intermediary commissions, and digitize the trading process, we offer an elite web-experience featuring offline persistence, multi-locale search capabilities, and live showroom virtual storefronts.",
      aboutDesc2: "Whether you are looking to purchase a modern electric vehicle, trade a rugged 4x4, or establish a customized digital showroom with scannable QR tags and direct URLs, Bazar360 provides the standard, high-fidelity infrastructure you need.",
      
      stat1Title: "Active Vehicle Postings",
      stat1Val: "1,200+",
      stat2Title: "Partner Showrooms",
      stat2Val: "45+",
      stat3Title: "Total Transacted Value",
      stat3Val: "PKR 4.2B+",
      stat4Title: "Customer Trust Rating",
      stat4Val: "4.9 / 5.0",

      teamHeading: "Meet Our Founders & Directors",
      teamSub: "The core architects of Bazar360 guiding dealership integrations and digital operations.",
      partner: "Services & Auto Choice Partner",
      partnerName: "Malak Mazhar",
      partnerBio: "Co-Founder and managing partner of Bazar360's flagship Auto Choice showroom. Leads business strategy, physical showroom coordination, and offline operations.",
      founder: "Founder",
      founderName: "Muhammad Amjid",
      founderBio: "Visionary Founder and technological architect. Oversees core platform security, international investor relationships, and multi-tenant engineering expansion.",

      // FAQ Translation
      faqHeading: "Frequently Asked Questions",
      faqSub: "Get instant answers regarding buying, selling, showroom verification, and transaction safety.",
      
      // Contact Translation
      contactHeading: "24/7 Support Desk",
      contactSub: "Need instant assistance? Send our helpdesk a direct ticket or reach out on WhatsApp.",
      formTitle: "Send Support Ticket",
      formSubtitle: "Our representatives usually reply on WhatsApp/Phone within 15 minutes.",
      namePlaceholder: "Enter Your Full Name",
      phonePlaceholder: "WhatsApp / Phone (e.g. 03001234567)",
      msgPlaceholder: "Detail your inquiry, listing URL, or showroom request...",
      sendBtn: "Submit Support Ticket",
      successTitle: "Ticket Received Successfully!",
      successDesc: "Thank you for contacting Bazar360 support. An executive officer will message you on WhatsApp or Call your phone shortly.",
      addressLabel: "Corporate Headquarters",
      address: "Peshawar Motorway Interchange, Auto Choice Flagship Showroom, Ring Road, Peshawar, Pakistan",
      timingTitle: "Support Hours",
      timingDesc: "9:00 AM - Midnight (PKT) | 7 Days a week",

      // Terms translation
      termsHeading: "Rules of Engagement & Legal Framework",
      termsSub: "Read about user responsibilities, dealership mandates, safety precautions, and policy guidelines."
    },
    ur: {
      aboutTab: "ہمارے بارے میں",
      helpTab: "ہیلپ سینٹر",
      contactTab: "رابطہ اور سپورٹ",
      termsTab: "قوانین و ضوابط",
      title: "کارپوریٹ اور سپورٹ حب",
      subtitle: "ہمارا نظریہ دیکھیں، سوالات کے جوابات حاصل کریں، انتظامی ٹیم سے رابطہ کریں، یا شرائط پڑھیں۔",
      
      // About Us Translation
      aboutHeading: "ہمارا سفر اور نظریہ",
      aboutSub: "پشاور کا سب سے قابل اعتماد، اور بہترین ڈیجیٹل آٹوموٹو مارکیٹ پلیس۔",
      aboutDesc1: "بازار360 ایک جدید ترین آٹوموٹو پلیٹ فارم ہے جو خریداروں کو براہ راست تصدیق شدہ شو رومز اور انفرادی فروخت کنندگان سے جوڑتا ہے۔ دھوکہ دہی کے خاتمے، کمیشن کم کرنے، اور گاڑیوں کی خرید و فروخت کو ڈیجیٹلائز کرنے کے وژن کے ساتھ قائم کردہ، ہم ایک بہترین ویب تجربہ پیش کرتے ہیں جس میں آف لائن سپورٹ اور لائیو شو رومز شامل ہیں۔",
      aboutDesc2: "چاہے آپ جدید الیکٹرک گاڑی خریدنا چاہیں، یا اپنا ذاتی ڈیجیٹل شو روم بنانا چاہیں، بازار360 آپ کو وہ تمام سہولیات اور پریمیم انفراسٹرکچر فراہم کرتا ہے جس کی آپ کو ضرورت ہے۔",
      
      stat1Title: "فعال گاڑیاں",
      stat1Val: "+1,200",
      stat2Title: "شراکت دار شو رومز",
      stat2Val: "+45",
      stat3Title: "مجموعی لین دین کی مالیت",
      stat3Val: "PKR 4.2B+",
      stat4Title: "صارفین کا اعتماد",
      stat4Val: "4.9 / 5.0",

      teamHeading: "ہمارے بانی اور ڈائریکٹرز",
      teamSub: "بازار360 کے بنیادی معمار جو ڈیجیٹل آپریشنز اور ڈیلرشپ کی رہنمائی کرتے ہیں۔",
      partner: "سروسز اور آٹو چوائس پارٹنر",
      partnerName: "ملک مظہر",
      partnerBio: "بازار360 کے فلیگ شپ آٹو چوائس شو روم کے شریک بانی اور مینیجنگ پارٹنر۔ بزنس اسٹریٹجی، فزیکل شو روم کوآرڈینیشن، اور آف لائن آپریشنز کی قیادت کرتے ہیں۔",
      founder: "بانی",
      founderName: "محمد امجد",
      founderBio: "وژنری بانی اور تکنیکی معمار۔ کور پلیٹ فارم سیکیورٹی اور ٹیکنالوجی کی توسیع کی نگرانی کرتے ہیں۔",

      // FAQ Translation
      faqHeading: "اکثر پوچھے گئے سوالات",
      faqSub: "خریداری، فروخت، شو روم کی تصدیق اور لین دین کی حفاظت کے بارے میں فوری معلومات حاصل کریں۔",
      
      // Contact Translation
      contactHeading: "24/7 سپورٹ ڈیسک",
      contactSub: "مدد کی ضرورت ہے؟ ہمیں براہ راست سپورٹ ٹکٹ بھیجیں یا واٹس ایپ پر رابطہ کریں۔",
      formTitle: "سپورٹ ٹکٹ جمع کروائیں",
      formSubtitle: "ہمارے نمائندے عام طور پر 15 منٹ کے اندر واٹس ایپ یا فون پر جواب دیتے ہیں۔",
      namePlaceholder: "اپنا پورا نام درج کریں",
      phonePlaceholder: "واٹس ایپ / فون نمبر",
      msgPlaceholder: "اپنے سوال یا شو روم کی تفصیلات درج کریں...",
      sendBtn: "سپورٹ ٹکٹ جمع کروائیں",
      successTitle: "سپورٹ ٹکٹ کامیابی سے موصول ہوا!",
      successDesc: "بازار360 سے رابطہ کرنے کا شکریہ۔ ہمارا نمائندہ جلد ہی آپ سے واٹس ایپ یا فون پر رابطہ کرے گا۔",
      addressLabel: "کارپوریٹ ہیڈ کوارٹر",
      address: "پشاور موٹر وے انٹرچینج، آٹو چوائس فلیگ شپ شو روم، رنگ روڈ، پشاور، پاکستان",
      timingTitle: "سپورٹ کے اوقات",
      timingDesc: "صبح 9:00 بجے سے آدھی رات تک (PKT) | ہفتے کے 7 دن",

      // Terms translation
      termsHeading: "قوانین اور قانونی فریم ورک",
      termsSub: "صارفین کی ذمہ داریوں، ڈیلرشپ کے قواعد، حفاظتی احتیاطی تدابیر اور پالیسیوں کے بارے میں پڑھیں۔"
    }
  }[lang];

  // Elite interactive FAQ collection
  const faqData = [
    {
      q: lang === 'en' ? "How do I check if a showroom listing is verified?" : "میں کیسے چیک کروں کہ شو روم کی گاڑی تصدیق شدہ ہے؟",
      a: lang === 'en' 
        ? "Look for the green 'Verified Showroom' shield badge on listings. This indicates the vehicle physically resides in one of our partner showrooms (like Auto Choice Peshawar) and has been pre-inspected by Bazar360 staff with papers verified."
        : "گاڑیوں کی تفصیلات پر سبز 'تصدیق شدہ شو روم' بیج دیکھیں۔ اس کا مطلب ہے کہ گاڑی ہمارے پارٹنر شو روم (جیسے آٹو چوائس پشاور) میں موجود ہے اور اس کے کاغذات کی تصدیق کی جا چکی ہے۔"
    },
    {
      q: lang === 'en' ? "Can I negotiate prices directly on the app?" : "کیا میں ایپ پر براہ راست قیمت پر بات چیت کر سکتا ہوں؟",
      a: lang === 'en'
        ? "Yes! Bazar360 features an interactive Bargain & Negotiation Portal. Log in, open any listing, and click 'Bargain Offer'. You can propose a custom PKR price and track the seller's counter-offers directly in your User Portal."
        : "جی ہاں! بازار360 پر ایک انٹرایکٹو سودا کاری پورٹل موجود ہے۔ لاگ ان کریں، کسی بھی لسٹنگ کو کھولیں اور 'Bargain Offer' پر کلک کر کے قیمت کی پیشکش بھیجیں۔"
    },
    {
      q: lang === 'en' ? "How can I register my physical showroom on Bazar360?" : "میں بازار360 پر اپنا فزیکل شو روم کیسے رجسٹر کروا سکتا ہوں؟",
      a: lang === 'en'
        ? "We welcome all reputable showrooms. Go to the Contact tab on this page, fill out the support form selecting 'Showroom Setup Request', or click the direct WhatsApp link to connect with Malak Mazhar. We provide custom subdomains, custom QR tags, and unique theme color customization for your showroom portal."
        : "ہم تمام معزز شو رومز کو خوش آمدید کہتے ہیں۔ اس صفحہ پر رابطہ فارم بھریں اور شو روم کی درخواست بھیجیں یا ڈائریکٹ واٹس ایپ پر ملک مظہر سے رابطہ کریں۔"
    },
    {
      q: lang === 'en' ? "Is there a registration fee to list a single personal vehicle?" : "کیا ذاتی گاڑی پوسٹ کرنے کی کوئی فیس ہے؟",
      a: lang === 'en'
        ? "Individual users can list their first 3 vehicles 100% free of charge! For higher posting volume or premium high-exposure featured listings, contact our billing helpdesk via the support ticketing form."
        : "انفرادی صارفین اپنی پہلی 3 گاڑیاں بالکل مفت پوسٹ کر سکتے ہیں! زیادہ تعداد میں گاڑیاں لگانے یا اشتہاری لسٹنگ کے لیے ہمارے ہیلپ ڈیسک سے رابطہ کریں۔"
    },
    {
      q: lang === 'en' ? "What precautions should I take when buying a car?" : "گاڑی خریدتے وقت مجھے کیا احتیاطی تدابیر اختیار کرنی چاہئیں؟",
      a: lang === 'en'
        ? "Always inspect the vehicle and original documents (Registration Book, File, Tax Token Status) physically before transferring funds. We strongly recommend meeting verified sellers in public spots or visiting our partner showroom hubs (e.g., Auto Choice Ring Road Peshawar) to conduct transactions safely."
        : "رقم منتقل کرنے سے پہلے ہمیشہ گاڑی اور اصل دستاویزات (رجسٹریشن بک، فائل، ٹیکس ٹوکن) کا جسمانی طور پر معائنہ کریں۔ ہم پرزور مشورہ دیتے ہیں کہ گاڑی کا سودا فزیکل شو رومز میں کریں۔"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      toast.error('Please fill in all fields before submitting.');
      return;
    }
    setSubmitted(true);
    toast.success('Support ticket submitted successfully!');
  };

  const handleReset = () => {
    setName('');
    Phone && setPhone('');
    setMessage('');
    setSubmitted(false);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div 
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8 animate-fade-in text-slate-900 dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      id="corporate-support-hub-page"
    >
      {/* 🚀 Header Branding & Dynamic Navigation Bar */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-b border-slate-200 dark:border-white/5 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider font-sans text-orange-500 flex items-center gap-2.5">
              <Award className="text-orange-500" />
              {t.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 font-sans">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* 🎛️ Unified Tab Controller (Premium Horizontal Rail) */}
        <div className="flex flex-wrap items-center gap-2 mt-6 p-1.5 bg-slate-100 dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 rounded-2xl md:max-w-max">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
              activeTab === 'about'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
            }`}
          >
            <Users size={14} />
            <span>{t.aboutTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
              activeTab === 'help'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
            }`}
          >
            <HelpCircle size={14} />
            <span>{t.helpTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
              activeTab === 'contact'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
            }`}
          >
            <MessageSquare size={14} />
            <span>{t.contactTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
              activeTab === 'terms'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
            }`}
          >
            <ShieldCheck size={14} />
            <span>{t.termsTab}</span>
          </button>
        </div>
      </div>

      {/* 📖 TAB CONTENT: 1. ABOUT US (Redesigned & Recreated) */}
      {activeTab === 'about' && (
        <div className="space-y-10">
          
          {/* Main Story Bento Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest font-mono">
                <Sparkles size={11} />
                Est. 2026 | Verified Portal
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase text-[var(--color-text-main)] font-sans">
                {t.aboutHeading}
              </h2>
              <p className="text-xs font-black text-orange-500 uppercase tracking-wider font-mono">
                {t.aboutSub}
              </p>
              <div className="space-y-4 text-sm text-[var(--color-text-muted)] leading-relaxed font-sans">
                <p>{t.aboutDesc1}</p>
                <p>{t.aboutDesc2}</p>
              </div>
            </div>

            {/* Platform Stats Grid */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] p-4 rounded-2xl text-center shadow-inner">
                <span className="block text-xl md:text-2xl font-black text-orange-500">{t.stat1Val}</span>
                <span className="block text-[9px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mt-1 leading-none">{t.stat1Title}</span>
              </div>
              <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] p-4 rounded-2xl text-center shadow-inner">
                <span className="block text-xl md:text-2xl font-black text-orange-500">{t.stat2Val}</span>
                <span className="block text-[9px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mt-1 leading-none">{t.stat2Title}</span>
              </div>
              <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] p-4 rounded-2xl text-center shadow-inner">
                <span className="block text-xl md:text-2xl font-black text-orange-500">{t.stat3Val}</span>
                <span className="block text-[9px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mt-1 leading-none">{t.stat3Title}</span>
              </div>
              <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] p-4 rounded-2xl text-center shadow-inner">
                <span className="block text-xl md:text-2xl font-black text-orange-500">{t.stat4Val}</span>
                <span className="block text-[9px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mt-1 leading-none">{t.stat4Title}</span>
              </div>
            </div>
          </div>

          {/* Leadership Team Layout */}
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <h3 className="text-lg md:text-xl font-black uppercase text-[var(--color-text-main)] font-sans">
                {t.teamHeading}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-sans">
                {t.teamSub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Malak Mazhar Director Card */}
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 relative flex flex-col justify-between shadow-md hover:border-orange-500/40 transition-colors group">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-sans font-black text-lg shadow-lg select-none">
                      MM
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold text-orange-500 uppercase tracking-widest">{t.partner}</span>
                      <h4 className="text-base font-sans font-black text-[var(--color-text-main)] uppercase leading-none mt-1">{t.partnerName}</h4>
                      <p className="text-[10px] font-mono text-emerald-500 mt-1">● WhatsApp Active Helpline</p>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed font-sans">
                    {t.partnerBio}
                  </p>
                </div>
                
                <a 
                  href="https://wa.me/923159085086" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Phone size={14} />
                  <span>Connect with Mazhar</span>
                </a>
              </div>

              {/* Muhammad Amjid Founder Card */}
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 relative flex flex-col justify-between shadow-md hover:border-orange-500/40 transition-colors group">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-slate-950 flex items-center justify-center font-sans font-black text-lg shadow-lg select-none">
                      MA
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-widest">{t.founder}</span>
                      <h4 className="text-base font-sans font-black text-[var(--color-text-main)] uppercase leading-none mt-1">{t.founderName}</h4>
                      <p className="text-[10px] font-mono text-emerald-500 mt-1">● WhatsApp Active Helpline</p>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed font-sans">
                    {t.founderBio}
                  </p>
                </div>
                
                <a 
                  href="https://wa.me/923149198403" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full py-3 bg-sky-500 hover:bg-sky-600 text-slate-950 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Phone size={14} />
                  <span>Connect with Amjid</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 📖 TAB CONTENT: 2. FAQ HELP CENTER */}
      {activeTab === 'help' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1 border-b border-[var(--color-border-main)] pb-4 mb-6">
            <h2 className="text-xl md:text-2xl font-black uppercase text-[var(--color-text-main)] font-sans">
              {t.faqHeading}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] font-sans">
              {t.faqSub}
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 flex items-center justify-between gap-4 text-left font-sans font-bold text-sm text-[var(--color-text-main)] cursor-pointer hover:bg-[var(--color-bg-secondary)]/80 transition-colors min-h-[44px]"
                  >
                    <span>{faq.q}</span>
                    <span className="shrink-0 text-orange-500">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-[var(--color-text-muted)] leading-relaxed font-sans border-t border-[var(--color-border-main)]/50 bg-black/5 dark:bg-black/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📖 TAB CONTENT: 3. CONTACT SUPPORT & HELPDESK */}
      {activeTab === 'contact' && (
        <div className="space-y-8">
          
          {/* Active 24/7 Helpline Drawer CTA */}
          {onOpenSupportDrawer && (
            <div className="bg-orange-500/5 border border-orange-500/15 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base font-sans font-black uppercase text-[var(--color-text-main)] tracking-wide flex items-center gap-2">
                  <Sparkles size={16} className="text-orange-500" />
                  Live Mobile Helpdesk Active
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-xl font-sans leading-relaxed">
                  Toggle our instant slide-up customer operations support panel to view active showrooms, live hotlines, and instant WhatsApp links.
                </p>
              </div>
              <button
                onClick={onOpenSupportDrawer}
                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-slate-950 font-sans font-extrabold text-xs uppercase px-6 py-3.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-orange-500/15 min-h-[44px]"
              >
                <MessageSquare size={14} />
                Open Live Helpdesk Panel
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Core Contact details & physical address */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-6 rounded-3xl shadow-md space-y-5">
                <h3 className="text-base font-sans font-black uppercase tracking-tight text-orange-500 border-b border-[var(--color-border-main)] pb-3">
                  Corporate Information
                </h3>
                
                <div className="space-y-4">
                  
                  {/* Address bento */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 border border-orange-500/20">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]">{t.addressLabel}</span>
                      <p className="text-xs md:text-sm font-sans text-[var(--color-text-main)] mt-0.5 leading-relaxed">{t.address}</p>
                    </div>
                  </div>

                  {/* Timing bento */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 border border-orange-500/20">
                      <Clock size={18} />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]">{t.timingTitle}</span>
                      <p className="text-xs md:text-sm font-sans text-[var(--color-text-main)] mt-0.5">{t.timingDesc}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Column: Ticket form */}
            <div className="lg:col-span-7 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-6 md:p-8 rounded-3xl shadow-lg">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-[var(--color-text-main)] font-sans">
                      {t.formTitle}
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-sans mt-0.5">
                      {t.formSubtitle}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-sm rounded-xl p-3 focus:border-orange-500 outline-none text-[var(--color-text-main)] placeholder-[var(--color-text-muted)]/50 min-h-[44px] font-sans"
                    />

                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-sm rounded-xl p-3 focus:border-orange-500 outline-none text-[var(--color-text-main)] placeholder-[var(--color-text-muted)]/50 min-h-[44px] font-mono"
                    />

                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.msgPlaceholder}
                      className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-sm rounded-xl p-3 focus:border-orange-500 outline-none text-[var(--color-text-main)] placeholder-[var(--color-text-muted)]/50 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-sans font-extrabold text-xs uppercase py-3.5 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 min-h-[44px] shadow-lg shadow-orange-500/10"
                  >
                    <Send size={14} />
                    {t.sendBtn}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6 py-10">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={36} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-[var(--color-text-main)] font-sans">
                      {t.successTitle}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed font-sans max-w-xs mx-auto">
                      {t.successDesc}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] border border-[var(--color-border-main)] font-sans font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px]"
                  >
                    Send Another Ticket
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 📖 TAB CONTENT: 4. TERMS & CONDITIONS */}
      {activeTab === 'terms' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1 border-b border-[var(--color-border-main)] pb-4 mb-6">
            <h2 className="text-xl md:text-2xl font-black uppercase text-[var(--color-text-main)] font-sans">
              {t.termsHeading}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] font-sans">
              {t.termsSub}
            </p>
          </div>

          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 space-y-6 shadow-md max-h-[600px] overflow-y-auto custom-scrollbar">
            
            <section className="space-y-2 font-sans text-sm text-[var(--color-text-muted)]">
              <h3 className="font-sans font-black uppercase text-orange-500 text-xs tracking-wider flex items-center gap-1.5 leading-none">
                <ShieldAlert size={14} />
                1. Marketplace Platform Agreement
              </h3>
              <p className="leading-relaxed">
                Bazar360 is a digital facilitation service and does not own, inventory, lease, or directly sell any vehicles posted by individual users. Showroom verification represents a physical verification of the showroom establishment and vehicle availability, but does not substitute for a professional mechanic check or legal document search.
              </p>
            </section>

            <section className="space-y-2 font-sans text-sm text-[var(--color-text-muted)]">
              <h3 className="font-sans font-black uppercase text-orange-500 text-xs tracking-wider flex items-center gap-1.5 leading-none">
                <ShieldAlert size={14} />
                2. User Obligations & Verifications
              </h3>
              <p className="leading-relaxed">
                Users are strictly prohibited from listing vehicles with stolen engines, tempered chassis numbers, fake documentation, or incorrect CC specifications. Any individual or showroom listing illegal vehicles, attempting advance-deposit frauds, or using bot accounts will suffer immediate profile termination, permanent IP bans, and complete report logging to Khyber Pakhtunkhwa Police and FIA Cyber Crime wing.
              </p>
            </section>

            <section className="space-y-2 font-sans text-sm text-[var(--color-text-muted)]">
              <h3 className="font-sans font-black uppercase text-orange-500 text-xs tracking-wider flex items-center gap-1.5 leading-none">
                <ShieldAlert size={14} />
                3. Showroom Owner Mandates
              </h3>
              <p className="leading-relaxed">
                All partner showroom owners (such as Showroom HQ, Auto Choice Peshawar, etc.) must maintain accurate listings on Bazar360. If a vehicle is sold physically at the showroom premises, the listing must be updated or marked 'Sold' within 12 hours of transaction completion to prevent false leads.
              </p>
            </section>

            <section className="space-y-2 font-sans text-sm text-[var(--color-text-muted)]">
              <h3 className="font-sans font-black uppercase text-orange-500 text-xs tracking-wider flex items-center gap-1.5 leading-none">
                <ShieldAlert size={14} />
                4. App Check & Security Compliance
              </h3>
              <p className="leading-relaxed">
                Our application integrates Google reCAPTCHA v3 and App Check tokens to enforce absolute bot deterrence. Scraping vehicle images, dealer information, or automated visitor tracking logs is strictly prohibited. Security breaches or reverse engineering attempts will be logged and prosecuted under Section 36 of Pakistan's Prevention of Electronic Crimes Act (PECA).
              </p>
            </section>

          </div>
        </div>
      )}

    </div>
  );
}
