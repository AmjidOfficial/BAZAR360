import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CarListing } from '../types';
import { formatPkrPrice } from '../lib/currency';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  ArrowRight, 
  Tag, 
  CheckCircle2, 
  Car, 
  FileCheck, 
  Sparkles,
  Lock,
  MessageCircle,
  X
} from 'lucide-react';

interface ShortlistCartViewProps {
  items: CarListing[];
  onRemoveItem: (carId: string) => void;
  onClearCart?: () => void;
  onProceedCheckout: (cartItems: CarListing[], totalPkr: number, promoCode: string) => void;
  onClose?: () => void;
  lang?: 'en' | 'ur';
}

export function ShortlistCartView({
  items,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
  onClose,
  lang = 'en'
}: ShortlistCartViewProps) {
  const isUrdu = lang === 'ur';
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const getQty = (id: string) => quantities[id] || 1;

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const subtotal = items.reduce((acc, item) => {
    return acc + (item.price * getQty(item.id));
  }, 0);

  const inspectionFee = items.length > 0 ? 15000 : 0; // Fixed 15,000 PKR 200-point inspection
  const estimatedTax = items.length > 0 ? 25000 : 0; // Estimated token tax clearance
  const grandTotal = Math.max(0, subtotal + inspectionFee + estimatedTax - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    if (promoCode.toUpperCase() === 'BAZAR360' || promoCode.toUpperCase() === 'AUTOCHOICE') {
      const disc = Math.round(subtotal * 0.05); // 5% promotional discount
      setDiscountAmount(disc);
      setAppliedPromo(promoCode.toUpperCase());
    } else {
      alert(isUrdu ? 'غلط پرومو کوڈ' : 'Invalid Promo Code. Try "AUTOCHOICE" or "BAZAR360"');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 text-[var(--color-text-main)] font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-main)]/15 border border-[var(--color-accent-main)]/30 flex items-center justify-center text-[var(--color-accent-main)] shadow-md">
            <ShoppingBag size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--color-text-header)]">
              {isUrdu ? 'میرا شارٹ لسٹ اور باسکٹ' : 'My Shortlist & Cart'}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">
              Auto Choice Certified Direct Showroom Inquiry Basket ({items.length} {items.length === 1 ? 'Vehicle' : 'Vehicles'})
            </p>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border-main)]">
          <Car size={48} className="mx-auto text-[var(--color-accent-main)]/50 mb-3" />
          <h3 className="text-lg font-bold text-[var(--color-text-header)]">
            {isUrdu ? 'آپ کا باسیٹ خالی ہے' : 'Your Shortlist Basket is Empty'}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            {isUrdu ? 'شو روم سے گاڑیاں شارٹ لسٹ کریں اور بہترین سودا طے کریں۔' : 'Browse verified stock and click the shortlist button to save vehicles for inspection and offers.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Shortlisted Items List matching Screen 4 in attached picture */}
          <div className="lg:col-span-7 space-y-4">
            <AnimatePresence>
              {items.map((car) => {
                const qty = getQty(car.id);
                const itemTotal = car.price * qty;

                return (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] shadow-lg hover:border-[var(--color-accent-main)]/40 transition-all group"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-full sm:w-28 h-24 rounded-xl overflow-hidden bg-black/40 shrink-0 relative">
                      <img 
                        src={car.imageUrl || (car.images && car.images[0]) || '/placeholder_car.jpg'} 
                        alt={car.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-1 left-1 bg-[var(--color-accent-main)] text-black text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                        Certified
                      </span>
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[var(--color-accent-main)] font-bold uppercase">
                          {car.make} • {car.year}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-[var(--color-text-header)] truncate uppercase">
                        {car.title}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
                        {car.fuelType || 'Petrol'} • {car.transmission || 'Automatic'} • {car.registrationCity || car.location || 'Peshawar'}
                      </p>

                      <div className="text-sm font-black text-[var(--color-accent-main)] font-mono pt-1">
                        {formatPkrPrice(itemTotal)}
                      </div>
                    </div>

                    {/* Quantity & Delete Action controls matching Screen 4 in mockup */}
                    <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      {/* Quantity / Offer Multiplier (`- 1 +`) */}
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-2 py-1">
                        <button
                          onClick={() => updateQty(car.id, -1)}
                          className="p-1 rounded-lg hover:bg-white/10 text-white transition-all cursor-pointer"
                          title="Decrease units"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-mono font-black text-white px-2">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQty(car.id, 1)}
                          className="p-1 rounded-lg hover:bg-white/10 text-white transition-all cursor-pointer"
                          title="Increase units"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Trash Delete Button */}
                      <button
                        onClick={() => onRemoveItem(car.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                        title="Remove vehicle"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* RIGHT: Order Summary & Voucher Section matching Screen 4 in attached picture */}
          <div className="lg:col-span-5 space-y-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 shadow-2xl">
            <h2 className="text-base font-black uppercase text-[var(--color-text-header)] border-b border-[var(--color-border-main)] pb-3 text-left">
              {isUrdu ? 'آرڈر اور انسپکشن کا خلاصہ' : 'Inquiry & Inspection Summary'}
            </h2>

            {/* Promo Code Input Box */}
            <form onSubmit={handleApplyPromo} className="space-y-2 text-left">
              <label className="text-[11px] font-mono font-bold uppercase text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Tag size={13} className="text-[var(--color-accent-main)]" />
                {isUrdu ? 'پرومو / واؤچر کوڈ' : 'Promo / Voucher Code'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. AUTOCHOICE or BAZAR360"
                  className="flex-1 bg-black/40 border border-[var(--color-border-main)] focus:border-[var(--color-accent-main)] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[var(--color-accent-main)] hover:bg-emerald-600 text-black font-black text-xs uppercase rounded-xl transition-all shadow cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <p className="text-[10px] font-mono font-bold text-[var(--color-accent-main)] flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} /> Voucher "{appliedPromo}" Applied (5% Discount)
                </p>
              )}
            </form>

            {/* Price Breakdown Stack */}
            <div className="space-y-3 pt-2 text-xs font-mono border-t border-[var(--color-border-main)]">
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-bold text-[var(--color-text-header)]">{formatPkrPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-[var(--color-accent-main)]" />
                  Digital 360° Inspection Fee
                </span>
                <span className="font-bold text-[var(--color-text-header)]">{formatPkrPrice(inspectionFee)}</span>
              </div>

              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <FileCheck size={12} className="text-[var(--color-accent-main)]" />
                  Est. Token Tax Clearance
                </span>
                <span className="font-bold text-[var(--color-text-header)]">{formatPkrPrice(estimatedTax)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[var(--color-accent-main)] font-bold">
                  <span>Promo Discount</span>
                  <span>- {formatPkrPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-[var(--color-text-header)] border-t border-dashed border-white/20 pt-3 text-[var(--color-accent-main)]">
                <span>Grand Total</span>
                <span>{formatPkrPrice(grandTotal)}</span>
              </div>
            </div>

            {/* CTA Button matching Screen 4 in mockup */}
            <button
              onClick={() => onProceedCheckout(items, grandTotal, appliedPromo || '')}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-black font-black py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-98 transition-all cursor-pointer font-sans"
            >
              <span>{isUrdu ? 'انسپکشن بک کریں / ڈائریکٹ آفر بھیجیں' : 'Proceed to Checkout / Send Offer'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Security Guarantee badge below button matching Screen 4 in attached photo */}
            <div className="pt-2 text-center flex items-center justify-center gap-2 text-[10px] font-mono text-[var(--color-text-muted)]">
              <Lock size={12} className="text-[var(--color-accent-main)] shrink-0" />
              <span>100% Verified Inspection Guarantee & Direct Showroom Deal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
