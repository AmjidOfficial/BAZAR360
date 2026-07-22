import React from 'react';
import { notFound } from 'next/navigation';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getFirestore();
}

/**
 * 1. Server-side helper to query showroom profile and associated inventory
 */
async function fetchShowroomAndInventory(idOrSlug: string) {
  const db = getAdminDb();
  
  // Try directly by showroom ID
  const showroomsRef = db.collection('dealers');
  let showroomDoc = await showroomsRef.doc(idOrSlug).get();
  let showroomData: any = null;

  if (showroomDoc.exists) {
    showroomData = { id: showroomDoc.id, ...showroomDoc.data() };
  } else {
    // Try querying by custom slug field or name match
    const querySnapshot = await showroomsRef.where('id', '==', idOrSlug).get();
    if (!querySnapshot.empty) {
      showroomData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    } else {
      // High tolerance fallback
      const allShowrooms = await showroomsRef.get();
      const matched = allShowrooms.docs.find(doc => {
        const d = doc.data();
        const genSlug = d.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || '';
        return genSlug === idOrSlug.toLowerCase() || d.id === idOrSlug;
      });
      if (matched) {
        showroomData = { id: matched.id, ...matched.data() };
      }
    }
  }

  if (!showroomData) {
    return null;
  }

  // Fetch approved vehicles listing ledger
  const listingsRef = db.collection('listings');
  const listingsSnapshot = await listingsRef
    .where('dealerId', '==', showroomData.id)
    .where('approved', '==', true)
    .get();

  const inventory = listingsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return { showroom: showroomData, inventory };
}

interface ShowroomPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ShowroomPageProps) {
  const resolvedParams = await params;
  const data = await fetchShowroomAndInventory(resolvedParams.id);
  
  if (!data) {
    return {
      title: 'Showroom Not Recognized | Bazar360.online'
    };
  }

  const name = data.showroom.name;
  const location = data.showroom.location || 'Peshawar';
  const logo = data.showroom.logo || '';
  const descriptionText = `Explore verified high-quality automotive fleet at ${name} located in ${location}. Browse active stock, find competitive prices, verified documentation, and connect directly with showroom experts.`;

  return {
    title: `${name} | Showroom in ${location} | Bazar360.online`,
    description: descriptionText,
    keywords: [
      name,
      `showroom in ${location}`,
      `car dealer ${location}`,
      `${name} ${location}`,
      'Bazar360',
      'buy cars Peshawar',
      'verified vehicles',
      'used cars Pakistan'
    ],
    openGraph: {
      title: `${name} - Verified Showroom in ${location} | Bazar360`,
      description: descriptionText,
      url: `https://bazar360.online/showroom/${resolvedParams.id}`,
      siteName: 'Bazar360',
      images: logo ? [{ url: logo }] : [],
      type: 'profile'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} - Verified Showroom in ${location}`,
      description: descriptionText,
      images: logo ? [logo] : []
    }
  };
}

/**
 * Next.js 15 Server-side Component for Showroom Portal
 */
export default async function ShowroomPortalPage({ params }: ShowroomPageProps) {
  const resolvedParams = await params;
  const data = await fetchShowroomAndInventory(resolvedParams.id);

  if (!data) {
    notFound();
  }

  const { showroom, inventory } = data;

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      {/* 1. Dynamic Ambience Premium Header */}
      <div className="relative border-b border-white/5 overflow-hidden py-16 px-6 md:px-16">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-bold text-xl text-orange-500">
                {showroom.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans">
                    {showroom.name}
                  </h1>
                  {showroom.verified && (
                    <span className="bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider shrink-0">
                      Verified Showroom
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium mt-1">{showroom.subtitle || 'Verified Dealer Partner'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
              <span>📍 {showroom.location || 'Peshawar'}</span>
              <span>⭐ {showroom.rating || '5.0'} Showroom Rating</span>
            </div>
          </div>

          {/* Quick Connect Console */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 w-full md:w-80 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Official Channels</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5 font-mono">
                <span className="text-slate-500">Contact Desk</span>
                <span className="text-white font-bold">{showroom.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 font-mono">
                <span className="text-slate-500">Operating hours</span>
                <span className="text-white font-semibold">09:00 AM - 09:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Stock Grid Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-12 space-y-8">
        <div className="flex items-baseline justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white font-sans">Active Showroom Stock</h2>
            <p className="text-xs text-slate-400 font-mono">Real-time dealer vehicle inventory</p>
          </div>
          <span className="bg-slate-950/60 border border-white/5 text-[#38BDF8] px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider shrink-0">
            {inventory.length} UNITS
          </span>
        </div>

        {inventory.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/10 border border-dashed border-white/5 rounded-3xl space-y-3">
            <p className="text-sm font-bold text-slate-300">No Inventory Listed</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              This showroom has not posted any active vehicle stock. Please query our central concierge for specialized sourcing options.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((car: any) => (
              <div 
                key={car.id} 
                className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-orange-500/20 transition-all group flex flex-col h-full"
              >
                <div className="h-52 bg-slate-950 relative overflow-hidden shrink-0">
                  {car.imageUrl || (car.images && car.images[0]) ? (
                    <img 
                      src={car.imageUrl || car.images[0]} 
                      alt={car.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">No Vehicle Image Available</div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-slate-900/80 backdrop-blur-md border border-white/5 text-[9px] font-mono font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-md">
                      {car.condition || 'Used'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">{car.title || `${car.make} ${car.model}`}</h3>
                    <p className="text-xs text-slate-400 font-mono">{car.year} • {car.transmission || 'Automatic'} • {car.fuelType || 'Petrol'}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Price Demand</span>
                      <span className="text-sm font-bold text-orange-500">
                        {car.price ? `PKR ${(car.price / 100000).toFixed(1)} Lakh` : 'Inquire'}
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-slate-950 font-sans font-bold text-[10px] uppercase tracking-wider rounded-md transition-all">
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
