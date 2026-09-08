import React from 'react';
import { motion } from 'motion/react';

interface SkeletonBoxProps {
  className?: string;
  delay?: number;
}

export function SkeletonBox({ className = '', delay = 0 }: SkeletonBoxProps) {
  return (
    <div className={`relative overflow-hidden bg-slate-200/80 dark:bg-bg-tertiary/60 rounded ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 dark:via-white/15 to-transparent pointer-events-none"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.8,
          delay,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

export function VehicleSkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0.7 }}
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      className="bg-white dark:bg-[var(--color-bg-primary)] border border-slate-200/80 dark:border-[#1d273a] rounded-3xl overflow-hidden shadow-sm flex flex-col h-full"
      id="vehicle-skeleton-card"
    >
      {/* Image Skeleton */}
      <div className="relative aspect-[16/10] bg-slate-100 dark:bg-[var(--color-bg-primary)] shrink-0 overflow-hidden">
        <SkeletonBox className="absolute inset-0 rounded-none" />
        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          <SkeletonBox className="w-16 h-4 bg-slate-300/80 dark:bg-slate-700/80 rounded-md" delay={0.1} />
          <SkeletonBox className="w-12 h-4 bg-slate-300/80 dark:bg-slate-700/80 rounded-md" delay={0.2} />
        </div>
        <div className="absolute bottom-3 right-3 z-10">
          <SkeletonBox className="w-10 h-4 bg-slate-300/80 dark:bg-slate-700/80 rounded-md" delay={0.3} />
        </div>
      </div>

      {/* Details Box Skeleton */}
      <div className="p-5 flex flex-col flex-1 space-y-3.5">
        {/* Title */}
        <SkeletonBox className="h-4.5 bg-slate-200 dark:bg-bg-tertiary rounded-md w-2/3" delay={0.1} />

        {/* Location Tag */}
        <SkeletonBox className="h-3 bg-slate-200 dark:bg-bg-tertiary/80 rounded-md w-1/3" delay={0.15} />

        {/* Technical Data Grid Skeleton */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-y border-slate-100 dark:border-white/5 py-3.5 my-1">
          <SkeletonBox className="h-3 bg-slate-200 dark:bg-bg-tertiary/80 rounded-md w-3/4" delay={0.2} />
          <SkeletonBox className="h-3 bg-slate-200 dark:bg-bg-tertiary/80 rounded-md w-1/2" delay={0.25} />
          <SkeletonBox className="h-3 bg-slate-200 dark:bg-bg-tertiary/80 rounded-md w-2/3" delay={0.3} />
          <SkeletonBox className="h-3 bg-slate-200 dark:bg-bg-tertiary/80 rounded-md w-1/2" delay={0.35} />
        </div>

        {/* Price & Primary Call to Action */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-4">
          <div className="flex flex-col space-y-1.5">
            <SkeletonBox className="h-2.5 bg-slate-200 dark:bg-bg-tertiary/80 rounded-md w-12" delay={0.2} />
            <SkeletonBox className="h-4.5 bg-slate-200 dark:bg-bg-tertiary/80 rounded-md w-28" delay={0.25} />
          </div>
          <div className="flex items-center gap-1.5">
            <SkeletonBox className="w-9 h-9 bg-slate-200 dark:bg-bg-tertiary/80 rounded-2xl" delay={0.3} />
            <SkeletonBox className="w-20 h-9 bg-slate-200 dark:bg-bg-tertiary/80 rounded-2xl" delay={0.35} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

