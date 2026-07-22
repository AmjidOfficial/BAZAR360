import React from 'react';

export function ShowroomLoading() {
  return (
    <div className="min-h-screen bg-[#030712] animate-pulse">
      {/* Cover Skeleton */}
      <div className="h-[45vh] md:h-[60vh] w-full bg-[#070b14]" />
      
      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="h-40 bg-[#070b14] rounded-2xl" />
            <div className="h-40 bg-[#070b14] rounded-2xl" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="h-8 bg-[#070b14] rounded w-1/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-[#070b14] rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
