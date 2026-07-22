import React from 'react';
import { notFound } from 'next/navigation';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK lazily to avoid multi-app load issues on server restart
function getAdminDb() {
  if (getApps().length === 0) {
    // In production, Firebase Admin auto-configures via application default credentials
    // or through the environment variables
    initializeApp();
  }
  return getFirestore();
}

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const db = getAdminDb();
    const slug = params.slug;

    // Fetch showroom data directly by id/slug or search
    const showroomsRef = db.collection('dealers');
    const querySnapshot = await showroomsRef.where('id', '==', slug).get();
    
    let showroomData: any = null;
    if (!querySnapshot.empty) {
      showroomData = querySnapshot.docs[0].data();
    } else {
      // Try searching by generated slug name
      const allShowrooms = await showroomsRef.get();
      const matched = allShowrooms.docs.find(doc => {
        const d = doc.data();
        const genSlug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        return genSlug === slug;
      });
      if (matched) {
        showroomData = matched.data();
      }
    }

    if (!showroomData) {
      return {
        title: 'Showroom Not Found - Auto Choice',
      };
    }

    return {
      title: `${showroomData.name} - Auto Choice Verified Showroom`,
      description: `${showroomData.name} is a premier verified partner showroom. Location: ${showroomData.location || 'Peshawar'}. Browse actual vehicle listings with biometric verification and multi-point inspections.`,
    };
  } catch (error) {
    console.error('Metadata generation failed:', error);
    return {
      title: 'Auto Choice Verified Showroom',
    };
  }
}

export default async function ShowroomServerPage({ params }: PageProps) {
  const { slug } = params;
  let showroom: any = null;
  let listings: any[] = [];

  try {
    const db = getAdminDb();

    // 1. Fetch Showroom Document
    const showroomsRef = db.collection('dealers');
    const querySnapshot = await showroomsRef.where('id', '==', slug).get();

    if (!querySnapshot.empty) {
      showroom = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    } else {
      // High-tolerance fallback searching through all showrooms
      const allDocs = await showroomsRef.get();
      const matched = allDocs.docs.find(doc => {
        const d = doc.data();
        const genSlug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        return genSlug === slug || d.id === slug;
      });
      if (matched) {
        showroom = { id: matched.id, ...matched.data() };
      }
    }

    if (!showroom) {
      notFound();
    }

    // 2. Fetch Associated Approved Listings
    const listingsRef = db.collection('listings');
    const listingsSnapshot = await listingsRef
      .where('dealerId', '==', showroom.id)
      .where('approved', '==', true)
      .get();

    listings = listingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error(`[Server Component] Error resolving showroom params:`, error);
    // Render error state or fallback gracefully
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Premium Server-Rendered Showroom Header */}
      <div className="relative bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-500/20">
                Verified Showroom
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{showroom.name}</h1>
            <p className="text-slate-400 text-sm mt-2 flex items-center gap-1.5">
              <span>📍 {showroom.location || 'Peshawar, Pakistan'}</span>
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 md:w-80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Showroom</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold">{showroom.phone || 'N/A'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Timing:</span>
                <span className="font-semibold">{showroom.timings || '9:00 AM - 9:00 PM'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Showroom Fleet Display */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-baseline justify-between border-b border-slate-200 pb-4 mb-8">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-slate-800">
            Showroom Inventory ({listings.length})
          </h2>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl">
            <p className="text-slate-500 text-sm">This showroom does not have any active vehicle listings currently.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listings.map((car) => (
              <div key={car.id} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="h-48 bg-slate-100 relative">
                  {car.images && car.images[0] ? (
                    <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-xs">No Image</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-800 line-clamp-1">{car.title}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-black text-slate-900">PKR {car.priceRaw?.toLocaleString() || car.price}</span>
                    <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-bold text-slate-600 uppercase tracking-wider">{car.year}</span>
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
