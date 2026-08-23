import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { dbSaveLead } from '../lib/dbService';

interface FirstTimeVisitorModalProps {
  onClose?: () => void;
}

export function FirstTimeVisitorModal({ onClose }: FirstTimeVisitorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if visitor has already completed or skipped the prompt
    const hasSeenPrompt = localStorage.getItem('bazar360_lead_prompt_seen');
    if (!hasSeenPrompt) {
      // Small delay so page renders smoothly first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSkip = () => {
    localStorage.setItem('bazar360_lead_prompt_seen', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setSubmitting(true);
    try {
      const leadId = `vlead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await dbSaveLead({
        id: leadId,
        type: 'First Time Visitor Lead',
        title: `🌟 Visitor Lead: ${name.trim()}`,
        userName: name.trim(),
        userPhone: phone.trim(),
        userEmail: '',
        city: 'Peshawar',
        details: 'First-time visitor preference registration on Bazar360.',
        customerId: 'visitor',
        showroomOwnerId: 'auto-choice-peshawar',
        inquiryDate: new Date().toISOString(),
        status: 'New',
        createdAt: new Date().toISOString()
      });

      localStorage.setItem('bazar360_lead_prompt_seen', 'true');
      localStorage.setItem('bazar360_visitor_name', name.trim());
      localStorage.setItem('bazar360_visitor_phone', phone.trim());

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.warn('Visitor lead registration bypass:', err);
      localStorage.setItem('bazar360_lead_prompt_seen', 'true');
      setIsOpen(false);
      if (onClose) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close / Skip X icon */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[var(--color-text-header)] rounded-full bg-black/10 hover:bg-black/30 transition-all cursor-pointer"
            aria-label="Skip"
          >
            <X size={18} />
          </button>

          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-accent-main)]/20 text-[var(--color-accent-main)] flex items-center justify-center border border-[var(--color-accent-main)]/30 animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black text-[var(--color-text-header)]">Welcome, {name}!</h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Your preference profile is set. Enjoy exploring new and used cars on Bazar360!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-mono font-black uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Personalized Experience</span>
              </div>

              {/* Title & Desc */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black uppercase text-[var(--color-text-header)] tracking-tight">
                  Welcome to Bazar360 & Auto Choice
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  Enter your contact details for instant WhatsApp bargain alerts, verified dealer contacts, and tailored vehicle recommendations.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-black tracking-wider text-[var(--color-text-muted)] flex items-center gap-1">
                    <User size={12} />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Muhammad Amjid"
                    className="w-full bg-black/5 dark:bg-white/5 border border-[var(--color-border-main)] rounded-xl px-4 py-3 text-xs text-[var(--color-text-header)] placeholder:text-gray-400 focus:outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-black tracking-wider text-[var(--color-text-muted)] flex items-center gap-1">
                    <Phone size={12} />
                    <span>Mobile Number</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0314 9198403"
                    className="w-full bg-black/5 dark:bg-white/5 border border-[var(--color-border-main)] rounded-xl px-4 py-3 text-xs text-[var(--color-text-header)] placeholder:text-gray-400 focus:outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-[var(--color-text-header)] font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Start Browsing</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSkip}
                    className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-[var(--color-border-main)]"
                  >
                    Skip
                  </button>
                </div>
              </form>

              <div className="pt-2 border-t border-[var(--color-border-main)] flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                <ShieldCheck size={14} className="text-orange-500 shrink-0" />
                <span>Zero spam. One-time setup stored locally in your browser.</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
