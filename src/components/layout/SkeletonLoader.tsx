import React from 'react';

export const SkeletonLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F19]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-white font-black text-xs">360</span>
          </div>
        </div>
        <p className="text-orange-500 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Bazar360...</p>
      </div>
    </div>
  );
};
