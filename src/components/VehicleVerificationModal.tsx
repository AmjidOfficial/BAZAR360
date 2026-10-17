import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, AlertTriangle, FileText } from 'lucide-react';
import { CarListing } from '../types';
import { useTheme } from './ThemeContext';

interface VehicleVerificationModalProps {
  car: CarListing;
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleVerificationModal({ car, isOpen, onClose }: VehicleVerificationModalProps) {
  const { theme } = useTheme();
  const report = (car as any).inspectionReport;
  const reportSummary = typeof report?.summary === 'string' ? report.summary.trim() : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="vehicle-review-title">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg-primary/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.97, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 18, opacity: 0 }}
            className={`relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border shadow-2xl text-left ${
              (theme as string) === 'dark'
                ? 'bg-[var(--color-bg-secondary)] border-white/10 text-[var(--color-text-header)]'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-start justify-between gap-4 bg-[var(--color-bg-secondary)] p-6 border-b border-[var(--color-border-main)]">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <ShieldCheck size={18} className="text-[var(--color-accent-main)]" />
                  Platform review status
                </div>
                <h3 id="vehicle-review-title" className="mt-2 text-xl font-black">
                  {car.year} {car.title || `${car.make} ${car.model}`}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Listing ID: {car.id}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close review details"
                className="rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-500" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">Platform review is not a mechanical inspection</p>
                  <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                    A listing's platform status does not independently confirm mileage, accident history, paint originality, service history, ownership documents, or roadworthiness. Please inspect the vehicle and verify original documents before paying.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--color-border-main)] p-4">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <FileText size={17} className="text-[var(--color-accent-main)]" />
                  Independent inspection report
                </div>
                {reportSummary ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{reportSummary.slice(0, 3000)}</p>
                ) : (
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                    No independent inspection report is attached to this listing.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[var(--color-bg-primary)] p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Listing mileage</span>
                  <span className="mt-1 block font-mono font-bold">{Number.isFinite(car.mileage) ? `${car.mileage.toLocaleString()} km` : 'Not provided'}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Seller-provided data</span>
                </div>
                <div className="rounded-xl bg-[var(--color-bg-primary)] p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Listed condition</span>
                  <span className="mt-1 block font-bold">{car.condition || 'Not provided'}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Not independently verified</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-xl bg-[var(--color-accent-main)] px-4 py-3 text-sm font-black text-[var(--color-text-header)] transition hover:opacity-90"
              >
                Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
