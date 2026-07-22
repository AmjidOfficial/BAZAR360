import React from 'react';
import { Bell, Heart, Tag, Info } from 'lucide-react';

export default function NotificationsView({ lang }: { lang: 'en' | 'ur' }) {
  const isUrdu = lang === 'ur';
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--color-border-main)]">
        <Bell className="w-6 h-6 text-[var(--color-accent-main)]" />
        <h2 className="text-xl md:text-2xl font-black text-[var(--color-text-main)] uppercase tracking-tight">
          {isUrdu ? 'آپ کے پیغامات' : 'Your Alerts & Updates'}
        </h2>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Placeholder Notification 1 */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-2xl flex gap-4 transition-all hover:shadow-lg">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-primary)] flex items-center justify-center shrink-0 border border-[var(--color-border-main)]">
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--color-text-main)]">
              {isUrdu ? 'نئی پسندیدہ کاریں' : 'New favorites match'}
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {isUrdu ? 'آپ کی پسندیدہ تلاش کے لیے نئی کاریں دستیاب ہیں۔' : 'A 2022 Honda Civic RS just matched your search criteria.'}
            </p>
            <span className="text-[9px] font-mono text-[var(--color-text-muted)] mt-2 block">2 HOURS AGO</span>
          </div>
        </div>

        {/* Placeholder Notification 2 */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-2xl flex gap-4 transition-all hover:shadow-lg">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-primary)] flex items-center justify-center shrink-0 border border-[var(--color-border-main)]">
            <Tag className="w-4 h-4 text-[var(--color-accent-main)]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--color-text-main)]">
              {isUrdu ? 'قیمت میں کمی' : 'Price Drop Alert'}
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {isUrdu ? 'ایک کار کی قیمت میں کمی ہوئی ہے۔' : 'The Toyota Fortuner Legender you viewed dropped by Rs. 500k.'}
            </p>
            <span className="text-[9px] font-mono text-[var(--color-text-muted)] mt-2 block">1 DAY AGO</span>
          </div>
        </div>
        
        {/* Placeholder Notification 3 */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-2xl flex gap-4 transition-all hover:shadow-lg">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-primary)] flex items-center justify-center shrink-0 border border-[var(--color-border-main)]">
            <Info className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--color-text-main)]">
              {isUrdu ? 'سسٹم اپ ڈیٹ' : 'System Update'}
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {isUrdu ? 'نئے ڈیلرز سسٹم میں شامل ہو گئے ہیں۔' : 'Welcome to the new BAZAR360! Check out our new Dark Luxury theme.'}
            </p>
            <span className="text-[9px] font-mono text-[var(--color-text-muted)] mt-2 block">2 DAYS AGO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
