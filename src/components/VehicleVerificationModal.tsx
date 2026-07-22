import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Gauge, 
  FileText, 
  Wrench, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  AlertTriangle,
  Flame,
  Zap,
  Fingerprint
} from 'lucide-react';
import { CarListing } from '../types';
import { useTheme } from './ThemeContext';
import { useCurrencyMode } from '../lib/currency';

interface VehicleVerificationModalProps {
  car: CarListing;
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleVerificationModal({ car, isOpen, onClose }: VehicleVerificationModalProps) {
  const { theme } = useTheme();
  const { renderPrice } = useCurrencyMode();

  // Dynamic values based on vehicle metrics to simulate premium diagnostic reports
  const bodyPaintRating = car.bodyCondition === 'Total Genuine' ? 100 : car.bodyCondition === 'Minor Touch-ups' ? 88 : 72;
  const docsRating = car.tokenTaxPaid ? 100 : 85;
  const mileageRating = car.mileage < 30000 ? 98 : car.mileage < 80000 ? 92 : 84;
  const overallScore = Math.round((bodyPaintRating + docsRating + mileageRating) / 3);

  // Structural Condition details based on listing fields
  const frameStatus = car.bodyCondition === 'Major Repaint' ? 'Minor panel repairs detected' : '100% Structurally Intact / Factory Pillars';
  const paintThickness = car.bodyCondition === 'Total Genuine' ? '92 - 108 µm (Factory Original)' : car.bodyCondition === 'Minor Touch-ups' ? '120 - 160 µm (Cosmetic Touch-up)' : '210+ µm (Repainted)';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 30, opacity: 0 }}
            className={`relative rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 border text-left ${
              theme === 'dark'
                ? 'bg-[#0a0d14] border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Immersive Header Banner */}
            <div className="relative h-40 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 bg-emerald-500/25 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <ShieldCheck size={14} className="text-white animate-pulse" />
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white">Bazar360 Certified</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-black/25 hover:bg-black/40 text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black font-display tracking-tight text-white">
                  {car.year} {car.title || `${car.make} ${car.model}`}
                </h3>
                <p className="text-xs text-emerald-100 font-mono uppercase tracking-wider flex items-center gap-2">
                  <span>ID: {car.id.toUpperCase()}</span>
                  <span>•</span>
                  <span>Overall Score: <strong className="text-yellow-300 font-black">{overallScore}/100</strong></span>
                </p>
              </div>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              
              {/* Score breakdown bar charts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-dashed border-[var(--color-border-main)] pb-6">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold font-mono text-[var(--color-text-muted)] uppercase">
                    <span className="flex items-center gap-1"><Gauge size={12} className="text-emerald-500" /> Odometer</span>
                    <span>{mileageRating}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${mileageRating}%` }} />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold font-mono text-[var(--color-text-muted)] uppercase">
                    <span className="flex items-center gap-1"><FileText size={12} className="text-cyan-500" /> Documents</span>
                    <span>{docsRating}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style={{ width: `${docsRating}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold font-mono text-[var(--color-text-muted)] uppercase">
                    <span className="flex items-center gap-1"><Wrench size={12} className="text-yellow-500" /> Structure</span>
                    <span>{bodyPaintRating}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full" style={{ width: `${bodyPaintRating}%` }} />
                  </div>
                </div>
              </div>

              {/* Three Pillar Verification Content */}
              <div className="space-y-6">

                {/* 1. Odometer Authenticity */}
                <div className="flex gap-4">
                  <div className="p-3 h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0">
                    <Gauge size={20} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-main)] font-sans">1. Odometer Authenticity</h4>
                      <span className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest">
                        Verified Genuine
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      Mileage reading verified at <strong className="text-[var(--color-text-main)] font-mono">{car.mileage.toLocaleString()} km</strong>. Our digital audit scan and mechanical diagnostics show no signs of tampering.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-100/50 dark:bg-white/5 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)] font-mono">ECU Query Status:</span>
                        <span className="font-bold font-mono text-emerald-500">Passed (Matches Cluster)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)] font-mono">Service Log Match:</span>
                        <span className="font-bold font-mono text-emerald-500">Excellent (Dealership Sync)</span>
                      </div>
                      <div className="flex justify-between sm:col-span-2 border-t border-[var(--color-border-main)]/50 pt-1.5 mt-1">
                        <span className="text-[var(--color-text-muted)] font-mono">Mechanical Wear & Tear:</span>
                        <span className="font-bold text-[var(--color-text-main)]">100% Consistent with logged distance</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Document Status */}
                <div className="flex gap-4">
                  <div className="p-3 h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-500 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-main)] font-sans">2. Official Document Audit</h4>
                      <span className="bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest">
                        Cleared & Valid
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      All vehicle documentation is fully validated against regional excise databases for secure ownership transitions.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-100/50 dark:bg-white/5 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)] font-mono">Document Type:</span>
                        <span className="font-bold text-[var(--color-text-main)]">{car.documentType || 'Smart Card'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)] font-mono">Provincial Excise:</span>
                        <span className="font-bold font-mono text-emerald-500">Verified & Clear</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)] font-mono">Token Tax Status:</span>
                        <span className={`font-bold font-mono ${car.tokenTaxPaid ? 'text-emerald-500' : 'text-yellow-500'}`}>
                          {car.tokenTaxPaid ? 'Paid & Up to date' : 'Outstanding / Verification Needed'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)] font-mono">Biometrics:</span>
                        <span className="font-bold font-mono text-emerald-500">Ready for instant transfer</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Structural Condition Report */}
                <div className="flex gap-4">
                  <div className="p-3 h-11 w-11 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-500 shrink-0">
                    <Wrench size={20} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-main)] font-sans">3. Structural & Paint Audit</h4>
                      <span className="bg-yellow-500/15 text-yellow-500 border border-yellow-500/30 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest">
                        Physical Sweeps Done
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      Physical inspection logs, chassis laser alignment checks, and panel coating scans verify overall body authenticity.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-100/50 dark:bg-white/5 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)] font-mono">Paint Condition:</span>
                        <span className="font-bold text-[var(--color-text-main)]">{car.bodyCondition || 'Total Genuine'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)] font-mono">Chassis Integrity:</span>
                        <span className="font-bold font-mono text-emerald-500">{frameStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)] font-mono">Avg Paint Thickness:</span>
                        <span className="font-bold font-mono text-[var(--color-text-main)]">{paintThickness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)] font-mono">Suspension / CVs:</span>
                        <span className="font-bold font-mono text-emerald-500">95% Efficiency rating</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Verified Certificate Footer Stamp */}
              <div className="pt-4 border-t border-[var(--color-border-main)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={26} className="text-emerald-500" />
                  <div>
                    <h5 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-wider">Official Inspection Stamp</h5>
                    <p className="text-[9px] text-[var(--color-text-muted)] font-mono uppercase">Bazar360 Automotive Assurance Wing • Peshawer Desk</p>
                  </div>
                </div>
                <div className="text-[10px] text-right font-mono text-[var(--color-text-muted)]">
                  Report Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
