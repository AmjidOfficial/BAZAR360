import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface PWAInstallBannerProps {
  lang: 'en' | 'ur';
}

export default function PWAInstallBanner({ lang }: PWAInstallBannerProps) {
  const isUrdu = lang === 'ur';
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        isUrdu
          ? 'ایپ کو انسٹال کرنے کے لیے اپنے براؤزر کا مینو کھولیں اور "صفحہ ہوم اسکرین میں شامل کریں" (Add to Home Screen) منتخب کریں۔'
          : 'To install Bazar360, tap your browser menu (3 dots or share button) and select "Add to Home Screen" or "Install App".'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || dismissed) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-[80] sm:max-w-md bg-[#0F172A]/95 backdrop-blur-md border border-[#F97316]/40 p-3.5 rounded-2xl shadow-2xl text-white flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#F97316]/20 border border-[#F97316]/40 flex items-center justify-center shrink-0">
          <Smartphone size={20} className="text-[#F97316]" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-white truncate">
              {isUrdu ? 'بازار 360 ایپ ڈاؤن لوڈ کریں' : 'Install Bazar360 App'}
            </span>
            <span className="bg-[#22C55E]/20 text-[#22C55E] text-[9px] font-bold px-1.5 py-0.2 rounded">
              PWA
            </span>
          </div>
          <p className="text-[10px] text-slate-300 truncate">
            {isUrdu
              ? 'موبائل پر فوری ڈیلز اور واٹس ایپ نوٹیفکیشن پائیں'
              : 'Fast offline access & instant WhatsApp dealer bargains'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
        >
          <Download size={14} />
          <span>{isUrdu ? 'انسٹال' : 'Install'}</span>
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
