import React from 'react';
import { Car, Shield, Banknote, Headphones } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface FeatureCarouselProps {
  lang: 'en' | 'ur';
}

export default function FeatureCarousel({ lang }: FeatureCarouselProps) {
  const { theme } = useTheme();
  const isUrdu = lang === 'ur';

  const features = [
    {
      id: 'wide-range',
      title: isUrdu ? 'وسیع رینج' : 'Wide Range',
      desc: isUrdu ? 'پریمیم کاریں' : 'Premium Cars',
      icon: Car
    },
    {
      id: 'safe-secure',
      title: isUrdu ? 'محفوظ اور معتبر' : 'Safe & Secure',
      desc: isUrdu ? 'آپ کی حفاظت پہلی ترجیح' : 'Your Safety First',
      icon: Shield
    },
    {
      id: 'best-price',
      title: isUrdu ? 'بہترین قیمت' : 'Best Price',
      desc: isUrdu ? 'بغیر کسی اضافی چارجز کے' : 'No Hidden Cost',
      icon: Banknote
    },
    {
      id: 'support',
      title: isUrdu ? '24/7 سپورٹ' : '24/7 Support',
      desc: isUrdu ? 'ہمیشہ آپ کے لیے حاضر' : 'Always Here For You',
      icon: Headphones
    }
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 min-w-max sm:min-w-0">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.id}
              className={`flex items-start gap-4 p-5 rounded-3xl w-[260px] sm:w-auto transition-all duration-300 border ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-md border-white/5 shadow-[rgba(0,0,0,0.2)_0px_8px_30px]'
                  : 'bg-white border-slate-100 shadow-[0_8px_30px_rgb(241,245,249,0.5)]'
              } hover:border-orange-500/30 hover:translate-y-[-2px]`}
            >
              <div className={`p-3 rounded-2xl ${
                theme === 'dark' 
                  ? 'bg-white/[0.04] text-white' 
                  : 'bg-slate-50 text-slate-800'
              }`}>
                <Icon size={20} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className={`text-xs font-bold font-mono tracking-wide uppercase ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {feat.title}
                </h4>
                <p className={`text-[10px] font-sans ${
                  theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
