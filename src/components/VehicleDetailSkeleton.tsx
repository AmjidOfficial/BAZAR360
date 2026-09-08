import React from 'react';
import { motion } from 'motion/react';
import { SkeletonBox } from './VehicleSkeletonCard';
import { ArrowLeft, X } from 'lucide-react';

interface VehicleDetailSkeletonProps {
  onClose?: () => void;
}

export function VehicleDetailSkeleton({ onClose }: VehicleDetailSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[var(--color-bg-primary)] min-h-screen text-[var(--color-text-main)] font-sans pb-24 fixed inset-0 z-[100] overflow-y-auto"
    >
      {/* Navigation Header Skeleton */}
      <div className="sticky top-0 z-50 bg-[var(--color-bg-primary)]/90 backdrop-blur-md border-b border-[var(--color-border-main)] shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-28 h-9 rounded-xl" />
            <SkeletonBox className="w-9 h-9 rounded-full" />
            {onClose && (
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-bg-tertiary flex items-center justify-center text-[var(--color-text-muted)]"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-10">
        {/* Title & Price Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 flex-1">
            <SkeletonBox className="w-32 h-5 rounded-md" />
            <SkeletonBox className="w-3/4 md:w-1/2 h-8 rounded-lg" />
            <SkeletonBox className="w-48 h-4 rounded-md" />
          </div>
          <div className="space-y-2">
            <SkeletonBox className="w-24 h-3 rounded-md" />
            <SkeletonBox className="w-40 h-8 rounded-lg" />
          </div>
        </div>

        {/* Hero Image & Thumbnails Skeleton */}
        <div className="space-y-4">
          <SkeletonBox className="w-full aspect-[16/9] md:aspect-[2.35/1] rounded-3xl" />
          <div className="flex gap-4 overflow-hidden">
            <SkeletonBox className="w-32 h-24 rounded-xl shrink-0" />
            <SkeletonBox className="w-32 h-24 rounded-xl shrink-0" />
            <SkeletonBox className="w-32 h-24 rounded-xl shrink-0" />
            <SkeletonBox className="w-32 h-24 rounded-xl shrink-0" />
          </div>
        </div>

        {/* Grid Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Main Column */}
          <div className="md:col-span-8 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-4 rounded-2xl border border-[var(--color-border-main)] space-y-2 flex flex-col items-center">
                  <SkeletonBox className="w-8 h-8 rounded-full" />
                  <SkeletonBox className="w-16 h-3 rounded-md" />
                  <SkeletonBox className="w-20 h-5 rounded-md" />
                </div>
              ))}
            </div>

            {/* Overview Skeleton */}
            <div className="space-y-3">
              <SkeletonBox className="w-40 h-6 rounded-md" />
              <SkeletonBox className="w-full h-4 rounded-md" />
              <SkeletonBox className="w-5/6 h-4 rounded-md" />
              <SkeletonBox className="w-4/6 h-4 rounded-md" />
            </div>

            {/* Specs Table Skeleton */}
            <div className="space-y-4">
              <SkeletonBox className="w-52 h-6 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="flex justify-between py-3 border-b border-[var(--color-border-main)]/50">
                    <SkeletonBox className="w-24 h-4 rounded-md" />
                    <SkeletonBox className="w-28 h-4 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="md:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl border border-[var(--color-border-main)] bg-[var(--color-bg-secondary)] space-y-6">
              <div className="flex flex-col items-center space-y-3 text-center">
                <SkeletonBox className="w-16 h-16 rounded-2xl" />
                <SkeletonBox className="w-32 h-5 rounded-md" />
                <SkeletonBox className="w-24 h-3 rounded-md" />
              </div>
              <SkeletonBox className="w-full h-12 rounded-xl" />
              <SkeletonBox className="w-full h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
