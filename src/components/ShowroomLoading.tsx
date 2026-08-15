import React from 'react';

export function ShowroomLoading() {
  return (
    <div className="min-h-screen bg-bg-primary animate-pulse">
      {/* Cover Skeleton */}
      <div className="h-[45vh] md:h-[60vh] w-full bg-[var(--color-bg-primary)]" />
      
      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="h-40 bg-[var(--color-bg-primary)] rounded-2xl" />
            <div className="h-40 bg-[var(--color-bg-primary)] rounded-2xl" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="h-8 bg-[var(--color-bg-primary)] rounded w-1/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-[var(--color-bg-primary)] rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
