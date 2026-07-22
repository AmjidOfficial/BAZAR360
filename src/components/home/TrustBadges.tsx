import React from 'react';
import { ShieldCheck, UserCheck, Lock } from 'lucide-react';

export function TrustBadges({ lang }: { lang: 'en' | 'ur' }) {
  const badges = [
    { icon: <ShieldCheck size={20} />, title: lang === 'en' ? 'Verified Vehicles' : 'تصدیق شدہ گاڑیاں' },
    { icon: <UserCheck size={20} />, title: lang === 'en' ? 'Certified Dealers' : 'تصدیق شدہ ڈیلرز' },
    { icon: <Lock size={20} />, title: lang === 'en' ? 'Secure Marketplace' : 'محفوظ مارکیٹ پلیس' },
  ];

  return (
    <div className="w-full py-4 border-y border-[var(--color-border-main)] my-4">
      <div className="flex flex-wrap justify-center gap-8 md:gap-16">
        {badges.map((badge, idx) => (
          <div key={idx} className="flex items-center gap-3 text-[var(--color-text-muted)]">
            <div className="text-orange-500">{badge.icon}</div>
            <span className="text-sm font-sans font-semibold uppercase tracking-wider">{badge.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
