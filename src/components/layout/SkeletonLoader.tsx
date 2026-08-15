import React from 'react';
import { motion } from 'motion/react';
import { VehicleSkeletonCard, SkeletonBox } from '../VehicleSkeletonCard';

export const SkeletonLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-primary)]">
      {/* Background ambient glow */}
      <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-5 relative z-10"
      >
        <div className="relative flex items-center justify-center">
          {/* Animated pulsing ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-16 h-16 border-4 border-border-main border-t-orange-500 border-r-orange-500/50 rounded-full shadow-lg shadow-orange-500/20"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[var(--color-text-header)] font-black text-xs font-mono tracking-tighter">360</span>
          </div>
        </div>

        <div className="space-y-1.5 text-center">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="text-orange-500 text-xs font-bold uppercase tracking-widest font-mono"
          >
            Loading Bazar360...
          </motion.p>
          <div className="w-32 h-1 bg-bg-tertiary rounded-full overflow-hidden mx-auto relative">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const RecentActivitySkeleton = () => {
  return (
    <div className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border-main)] p-6 space-y-4 shadow-sm">
      {/* Header Skeleton */}
      <div className="flex items-center gap-2">
        <SkeletonBox className="w-4 h-4 rounded-full shrink-0" />
        <SkeletonBox className="h-4 w-32 rounded-md" />
      </div>

      {/* Activity Items Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((item, idx) => (
          <div key={item} className="flex items-start gap-3 p-2.5 bg-[var(--color-bg-primary)] rounded-2xl border border-[var(--color-border-main)]">
            <SkeletonBox className="w-8 h-8 rounded-xl shrink-0" delay={idx * 0.1} />
            <div className="flex-grow space-y-1.5 min-w-0">
              <SkeletonBox className="h-3.5 w-3/4 rounded-md" delay={idx * 0.1 + 0.05} />
              <SkeletonBox className="h-2.5 w-1/4 rounded-md" delay={idx * 0.1 + 0.1} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ShowroomInventorySkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <VehicleSkeletonCard key={idx} />
      ))}
    </div>
  );
};


