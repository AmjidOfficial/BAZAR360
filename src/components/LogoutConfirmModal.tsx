import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, AlertTriangle, X, ShieldAlert, Check, User, Landmark, Building2, Sparkles } from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { GlassCard } from './GlassCard';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  currentUser?: UserProfile | null;
  lang?: 'en' | 'ur';
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  currentUser,
  lang = 'en'
}: LogoutConfirmModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isUrdu = lang === 'ur';

  const t = {
    en: {
      title: 'Sign Out of Account?',
      subtitle: 'Confirm ending your active session on Bazar360.online',
      message: 'Are you sure you want to log out? You will need to sign back in to access your showroom HQ, post classified ads, or view active lead inquiries.',
      cancel: 'Cancel',
      confirm: 'Log Out Now',
      loggingOut: 'Signing Out...',
      sessionNote: 'Your saved drafts and settings remain securely stored.',
    },
    ur: {
      title: 'کیا آپ لاگ آؤٹ کرنا چاہتے ہیں؟',
      subtitle: 'اپنے Bazar360 اکاؤنٹ سیشن کو ختم کرنے کی تصدیق کریں',
      message: 'کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟ اپنی گاڑیوں کی فہرست، شو روم ڈیش بورڈ اور پیغامات تک دوبارہ رسائی کے لیے آپ کو سائن ان کرنا پڑے گا۔',
      cancel: 'کینسل',
      confirm: 'لاگ آؤٹ کریں',
      loggingOut: 'لاگ آؤٹ ہو رہا ہے...',
      sessionNote: 'آپ کی معلومات اور ترتیبات محفوظ رہیں گی۔',
    }
  }[lang];

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error("Logout execution error:", err);
    } finally {
      setIsLoggingOut(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={!isLoggingOut ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="relative w-full max-w-md z-10 text-white"
          >
            <GlassCard
              radius="24px"
              className="relative bg-[#0b121f] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              {/* Glowing Top Accent Gradient Line */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 z-20" />

              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isLoggingOut}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer z-30"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              <div className="space-y-6">
                {/* Header Icon Badge with Pulse Ring */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping opacity-75" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10">
                      <LogOut size={28} className="translate-x-0.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white font-display">
                      {t.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      {t.subtitle}
                    </p>
                  </div>
                </div>

                {/* User Info Capsule (If Logged In) */}
                {currentUser && (
                  <div className="bg-[#131c2e] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-base shrink-0">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User size={18} />}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {currentUser.displayName || 'Bazar360 Member'}
                        </span>
                        <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
                          {currentUser.role || 'Member'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-mono">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Confirmation Body Message */}
                <div className="bg-[#080d17] border border-white/5 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed text-center font-sans">
                  <p>{t.message}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-2 border-t border-white/5 pt-2 flex items-center justify-center gap-1.5">
                    <Sparkles size={11} className="text-amber-400 shrink-0" />
                    <span>{t.sessionNote}</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    disabled={isLoggingOut}
                    className="py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer text-center"
                  >
                    {t.cancel}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoggingOut}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        <span>{t.loggingOut}</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={14} />
                        <span>{t.confirm}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
