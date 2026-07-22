import React from 'react';

export function VehicleSkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-[#1d273a] rounded-3xl overflow-hidden animate-pulse flex flex-col h-full" id="vehicle-skeleton-card">
      {/* Image Skeleton */}
      <div className="relative aspect-[16/10] bg-slate-100 dark:bg-[#070b14] shrink-0">
        <div className="absolute top-3 left-3 flex gap-1.5">
          <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="absolute bottom-3 right-3 w-10 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>

      {/* Details Box Skeleton */}
      <div className="p-5 flex flex-col flex-1 space-y-3">
        {/* Title */}
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>

        {/* Location Tag */}
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mt-1.5"></div>

        {/* Technical Data Grid Skeleton */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-y border-slate-100 dark:border-white/5 py-3.5 my-3.5">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        </div>

        {/* Price & Primary Call to Action */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-4">
          <div className="flex flex-col space-y-1">
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="w-20 h-9 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
