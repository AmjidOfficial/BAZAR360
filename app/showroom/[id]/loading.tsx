import React from 'react';

/**
 * Next.js 15 Showroom Skeleton loading view
 * Minimalist, ultra-clean design adhering to the "Clean-Room" aesthetic.
 */
export default function ShowroomLoading() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      {/* Skeleton Header Area */}
      <div className="relative border-b border-white/5 py-16 px-6 md:px-16 animate-pulse">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* Avatar circle skeleton */}
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 shrink-0" />
              <div className="space-y-2">
                {/* Title skeleton */}
                <div className="h-6 w-48 bg-slate-900 rounded-md" />
                {/* Subtitle skeleton */}
                <div className="h-3.5 w-32 bg-slate-900 rounded-md" />
              </div>
            </div>
            
            {/* Metadata badges skeleton */}
            <div className="flex items-center gap-4 pt-1">
              <div className="h-3 w-20 bg-slate-900 rounded-md" />
              <div className="h-3 w-24 bg-slate-900 rounded-md" />
            </div>
          </div>

          {/* Quick connect console skeleton */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 w-full md:w-80 space-y-4">
            <div className="h-3 w-16 bg-slate-900 rounded-md" />
            <div className="space-y-2.5">
              <div className="h-3 w-full bg-slate-900 rounded-md" />
              <div className="h-3 w-full bg-slate-900 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Content Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-12 space-y-8 animate-pulse">
        <div className="flex items-baseline justify-between border-b border-white/5 pb-4">
          <div className="space-y-2">
            <div className="h-5 w-36 bg-slate-900 rounded-md" />
            <div className="h-3.5 w-48 bg-slate-900 rounded-md" />
          </div>
          <div className="h-6 w-16 bg-slate-900 rounded-full" />
        </div>

        {/* Dynamic skeleton card grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden space-y-5 flex flex-col h-full">
              {/* Media area */}
              <div className="h-52 bg-slate-950" />
              
              {/* Card body skeleton */}
              <div className="p-5 flex-grow space-y-6 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="h-4 w-40 bg-slate-900 rounded-md" />
                  <div className="h-3 w-28 bg-slate-900 rounded-md" />
                </div>
                
                {/* Lower metadata skeleton */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-12 bg-slate-900 rounded-md" />
                    <div className="h-4 w-20 bg-slate-900 rounded-md" />
                  </div>
                  <div className="h-7 w-16 bg-slate-900 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
