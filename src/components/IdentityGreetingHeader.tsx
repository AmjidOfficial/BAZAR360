import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Shield, UserCheck, Star, ArrowUpRight, Plus, 
  MessageCircle, LayoutDashboard, Heart, FileText, CheckCircle
} from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { CarListing, Dealer } from '../types';

interface IdentityGreetingHeaderProps {
  currentUser: UserProfile | null;
  listings: CarListing[];
  dealers: Dealer[];
  favoritesList: CarListing[];
  onLoginClick?: () => void;
  onPostAdClick?: () => void;
  setTab: (tab: string) => void;
  lang: 'en' | 'ur';
}

export function IdentityGreetingHeader({
  currentUser,
  listings,
  dealers,
  favoritesList,
  onLoginClick,
  onPostAdClick,
  setTab,
  lang
}: IdentityGreetingHeaderProps) {
  // Classification logic
  const isGuest = !currentUser;
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const isShowroomOwner = currentUser?.role === 'Showroom Owner' || currentUser?.role === 'Dealer';
  const isRegistered = currentUser && !isAdmin && !isShowroomOwner;

  // Compute Stats
  const activePostingsCount = listings.filter(car => !car.approved).length;
  const userListingsCount = currentUser ? listings.filter(car => car.createdBy === currentUser.uid || (isShowroomOwner && car.dealerId === 'auto-choice-peshawar')).length : 0;
  const totalVehicles = listings.filter(car => car.approved).length;

  // Find associated showroom name
  const associatedShowroom = isShowroomOwner 
    ? dealers.find(d => d.id === currentUser?.associatedShowroomId || d.id === 'auto-choice-peshawar')
    : null;

  const showroomName = associatedShowroom?.name || 'Auto Choice Showroom';

  return (
    <div className="w-full bg-[var(--color-bg-primary)] border-b border-white/10 select-none relative overflow-hidden py-4 px-4 md:px-8 shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(56,189,248,0.03)_1px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none opacity-80" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        
        {/* Left side: Role Classification with Icon & Greeting */}
        <div className="flex items-center gap-3.5">
          {/* Circular Dynamic Role Badge */}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 shadow-lg ${
            isGuest 
              ? 'bg-zinc-500/10 border-zinc-500/35 text-zinc-400'
              : isAdmin
                ? 'bg-red-500/10 border-red-500/35 text-red-400'
                : isShowroomOwner
                  ? 'bg-[var(--color-accent-main)]/10 border-[var(--color-accent-main)]/35 text-[var(--color-accent-main)]'
                  : 'bg-orange-500/10 border-orange-500/35 text-orange-400'
          }`}>
            {isGuest ? (
              <UserCheck size={20} className="text-zinc-400" />
            ) : isAdmin ? (
              <Shield size={20} className="text-red-400" />
            ) : isShowroomOwner ? (
              <Star size={20} className="text-[var(--color-accent-main)]" />
            ) : (
              <Sparkles size={20} className="text-orange-400" />
            )}
          </div>

          {/* Dynamic Typographic Header */}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                isGuest 
                  ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/10'
                  : isAdmin
                    ? 'bg-red-500/10 text-red-400 border border-red-500/10'
                    : isShowroomOwner
                      ? 'bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/10'
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/10'
              }`}>
                {isGuest 
                  ? (lang === 'ur' ? 'مہمان صارف' : 'Guest Visitor')
                  : isAdmin
                    ? (lang === 'ur' ? 'سسٹم ایڈمن' : 'System Admin')
                    : isShowroomOwner
                      ? (lang === 'ur' ? 'شو روم پارٹنر' : 'Showroom Owner')
                      : (lang === 'ur' ? 'رجسٹرڈ صارف' : 'Registered Private Seller')
                }
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-main)] animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Peshawar Area Network</span>
            </div>

            {/* Personalized greeting copy */}
            <h2 className="text-sm sm:text-base font-black uppercase text-[var(--color-text-header)] tracking-tight mt-1">
              {isGuest && (
                lang === 'ur' 
                  ? 'السلام علیکم! بازار360 ڈاٹ آن لائن پر خوش آمدید' 
                  : 'Assalamu Alaikum! Welcome to Bazar360.online'
              )}
              {isAdmin && (
                lang === 'ur' 
                  ? `السلام علیکم، ${currentUser?.displayName || 'ایڈمن'}! سیکیورٹی سیشن لائیو`
                  : `Assalamu Alaikum, ${currentUser?.displayName || 'Admin'}! Live Security Session`
              )}
              {isShowroomOwner && (
                lang === 'ur' 
                  ? `السلام علیکم، ${currentUser?.displayName || 'شو روم اونر'}! شو روم کا نظم سنبھالیں`
                  : `Assalamu Alaikum, ${currentUser?.displayName || 'Showroom Owner'}! Managing ${showroomName}`
              )}
              {isRegistered && (
                lang === 'ur' 
                  ? `السلام علیکم، ${currentUser?.displayName || 'صارف'}! آپ کے پاس نوٹیفیکیشنز موجود ہیں`
                  : `Assalamu Alaikum, ${currentUser?.displayName || 'User'}! Active Trader Account`
              )}
            </h2>

            {/* Subtitle / Contextual Stats */}
            <p className="text-[11px] text-zinc-400 mt-0.5 font-medium leading-relaxed max-w-xl">
              {isGuest && (
                lang === 'ur'
                  ? 'پشاور اور خیبر پختونخوا کے معروف شو رومز سے جڑنے اور بہترین ڈیلز حاصل کرنے کے لیے سائن ان کریں۔'
                  : 'Connect with elite KPK showrooms like Auto Choice, access direct dealer pricing, and start listing vehicles.'
              )}
              {isAdmin && (
                lang === 'ur'
                  ? `بغیر منظوری کے ${activePostingsCount} گاڑیوں کے اشتہارات زیر التواء ہیں۔ پلیٹ فارم پر کل ${totalVehicles} گاڑیاں لائیو ہیں۔`
                  : `Founder Moderation Desk active. There are ${activePostingsCount} pending showroom listings to moderate. Total active inventory: ${totalVehicles}.`
              )}
              {isShowroomOwner && (
                lang === 'ur'
                  ? `آپ کے شو روم کے تحت ${userListingsCount} گاڑیاں لائیو ہیں۔ نئی انکوائریز کے لیے باقاعدگی سے لیڈز مانیٹر کریں۔`
                  : `Enterprise Console active for ${showroomName}. ${userListingsCount} vehicles on display, direct lead alerts live via WhatsApp Integration.`
              )}
              {isRegistered && (
                lang === 'ur'
                  ? `آپ کے پاس ${userListingsCount} لائیو اشتہارات اور ${favoritesList.length} پسندیدہ گاڑیاں محفوظ ہیں۔`
                  : `Private trade desk active. You have published ${userListingsCount} auto advertisements and stored ${favoritesList.length} favorites.`
              )}
            </p>
          </div>
        </div>

        {/* Right side: Dynamic Action Links / Widgets */}
        <div className="flex flex-wrap items-center gap-2 md:self-center">
          {isGuest ? (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-950/20 flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck size={14} className="stroke-[2.5]" />
              <span>{lang === 'ur' ? 'سائن ان کریں' : 'Register / Sign In'}</span>
            </button>
          ) : (
            <>
              {/* Profile Shortcut Button */}
              <button
                onClick={() => setTab('profile')}
                className="px-3.5 py-2 bg-bg-secondary border border-white/10 text-gray-300 hover:text-[var(--color-text-header)] hover:border-white/20 active:scale-95 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard size={13} className="text-orange-400" />
                <span>{lang === 'ur' ? 'میرا ڈیش بورڈ' : 'My Console'}</span>
              </button>

              {/* Contextual Action */}
              {isShowroomOwner && (
                <button
                  onClick={() => setTab('profile')}
                  className="px-3.5 py-2 bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] hover:bg-[var(--color-accent-main)]/20 active:scale-95 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>{lang === 'ur' ? 'نیا اشتہار لگائیں' : 'List New Vehicle'}</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setTab('admin')}
                  className="px-3.5 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 active:scale-95 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield size={13} />
                  <span>{lang === 'ur' ? 'ایڈمن ڈیش بورڈ' : 'Admin Hub'}</span>
                </button>
              )}

              {isRegistered && (
                <button
                  onClick={onPostAdClick}
                  className="px-3.5 py-2 bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] hover:bg-[var(--color-accent-main)]/20 active:scale-95 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>{lang === 'ur' ? 'اشتہار لگائیں' : 'Sell My Car'}</span>
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
