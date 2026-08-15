import React from 'react';
import { notFound } from 'next/navigation';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ShowroomHeaderAnimated } from '../../../src/components/ShowroomHeaderAnimated';
import { AnimatedVehicleCard } from '../../../src/components/AnimatedVehicleCard';
import { getOptimizedUrl } from '../../../src/lib/cloudinaryService';

// Initialize Firebase Admin SDK lazily to avoid multi-app load issues on server restart
function getAdminDb() {
  if (getApps().length === 0) {
    // In production, Firebase Admin auto-configures via application default credentials
    // or through the environment variables
    initializeApp();
  }
  return getFirestore();
}

function checkBusinessIntegrity(dealer: any): boolean {
  if (!dealer) return false;
  const hasName = Boolean(dealer.name && typeof dealer.name === 'string' && dealer.name.trim().length > 0);
  const hasAddress = Boolean(dealer.location || dealer.address);
  const hasPhone = Boolean(dealer.phone || dealer.whatsapp || dealer.contactPhone);
  return Boolean(hasName && hasAddress && hasPhone);
}

function generateBusinessSchemas(dealer: any) {
  if (!checkBusinessIntegrity(dealer)) {
    return null;
  }
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://bazar360.online/#organization",
    "name": "Bazar360 Marketplace",
    "url": "https://bazar360.online",
    "logo": "https://bazar360.online/logo_new.png"
  };

  const dealerSchema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `https://bazar360.online/dealers/${dealer.id}`,
    "name": dealer.name,
    "image": dealer.coverImage || dealer.avatarUrl || dealer.logo || 'https://bazar360.online/logo_new.png',
    "telephone": dealer.phone || dealer.whatsapp || "+92 314 3600000",
    "url": `https://bazar360.online/dealers/${dealer.id}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": dealer.location || dealer.address || "Peshawar",
      "addressLocality": dealer.city || (dealer.location || "").split(',')[0]?.trim() || "Peshawar",
      "addressRegion": dealer.region || "KPK",
      "addressCountry": "PK"
    },
    "description": dealer.description || dealer.subtitle || `${dealer.name} - Verified Showroom on Bazar360.online`,
    "priceRange": "$$$",
    "aggregateRating": dealer.rating ? {
      "@type": "AggregateRating",
      "ratingValue": dealer.rating,
      "bestRating": "5",
      "worstRating": "1",
      "reviewCount": dealer.vehiclesCount || 10
    } : undefined
  };

  return [orgSchema, dealerSchema];
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
        const genSlug = d.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        return genSlug === slug || d.id === slug;
      });
      if (matched) {
        showroomData = matched.data();
      }
    }

    if (!showroomData) {
      return {
        title: 'Showroom Not Found - Bazar360 Auto Choice',
        description: 'The requested verified showroom on Bazar360.online could not be found.',
      };
    }

    const passedIntegrity = checkBusinessIntegrity(showroomData);
    // Showroom link share -> priority is Showroom Logo (logoUrl / logo) then coverImage or Bazar360 default logo
    const shareLogoOrCover = showroomData.logoUrl || showroomData.logo || showroomData.coverImage || 'https://bazar360.online/logo_new.png';
    const pageTitle = `${showroomData.name} - Verified Showroom | Bazar360 Auto Choice`;
    const locationStr = showroomData.location || showroomData.address || 'Peshawar';
    const pageDesc = `${showroomData.name} is a verified auto showroom in ${locationStr}. Browse direct vehicle inventory, verified biometric registration docs, and connect via WhatsApp/Call.`;

    return {
      title: pageTitle,
      description: pageDesc,
      openGraph: {
        title: pageTitle,
        description: pageDesc,
        url: `https://bazar360.online/dealers/${slug}`,
        siteName: 'Bazar360 Auto Choice',
        type: 'profile',
        images: [
          {
            url: shareLogoOrCover,
            width: 1200,
            height: 630,
            alt: `${showroomData.name} Showroom Logo`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDesc,
        images: [shareLogoOrCover],
      },
      other: {
        'schema-integrity': passedIntegrity ? 'passed' : 'failed-missing-required-fields'
      }
    };
  } catch (error) {
    console.error('Metadata generation failed:', error);
    return {
      title: 'Auto Choice Verified Showroom | Bazar360',
      description: 'Explore verified automotive showrooms and direct vehicle stock on Bazar360.online.',
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
        const genSlug = d.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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
  }

  const schemas = generateBusinessSchemas(showroom);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {schemas && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
      )}
      
      {/* Facebook Profile-Style Showroom Header */}
      <ShowroomHeaderAnimated showroom={showroom} />

      {/* Showroom Fleet Display Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 sm:mb-8 gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span>Showroom Fleet Stock</span>
              <span className="text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-full font-bold border border-orange-500/20">
                {listings.length} {listings.length === 1 ? 'Vehicle' : 'Vehicles'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Direct inventory available on showroom floor at {showroom?.name}
            </p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-sm my-6">
            <div className="w-14 h-14 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner border border-orange-500/20">
              🚘
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
              No Active Vehicles in Fleet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-6">
              This showroom does not have any active vehicle listings currently available.
            </p>
            <a
              href="/#/search"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span>Browse All Vehicles</span>
              <span className="text-sm">→</span>
            </a>
          </div>
        ) : (
          <div id="showroom-inventory-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {listings.map((car, idx) => {
              const displayPrice = typeof car.priceRaw === 'number' 
                ? `PKR ${car.priceRaw.toLocaleString()}` 
                : (car.price ? (car.price.toString().startsWith('PKR') ? car.price : `PKR ${car.price}`) : 'Price on Call');

              const firstImage = car.images && car.images[0] ? car.images[0] : null;

              return (
                <AnimatedVehicleCard 
                  key={car.id} 
                  index={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-500/50 motion-reduce:transform-none transition-colors duration-300 flex flex-col group h-full cursor-pointer relative"
                >
                  {/* Aspect Ratio Controlled Image Container (CLS Prevention) */}
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0">
                    {firstImage ? (
                      <img 
                        src={getOptimizedUrl(firstImage, { width: 600, quality: 'auto', format: 'auto' })} 
                        alt={car.title || `${car.make} ${car.model}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out aspect-[16/10]" 
                        loading={idx === 0 ? "eager" : "lazy"}
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        width={600}
                        height={375}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800 font-mono text-xs gap-1 aspect-[16/10]">
                        <span className="text-2xl">🚗</span>
                        <span>No Image</span>
                      </div>
                    )}
                    {car.condition && (
                      <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/10">
                        {car.condition}
                      </span>
                    )}
                    {car.verified && (
                      <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                        Verified
                      </span>
                    )}

                    {/* Single Official Bazar360.online Stamp */}
                    <div className="absolute bottom-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-sky-500/30 text-[8px] font-mono font-bold text-sky-400 tracking-wider z-20 flex items-center gap-1 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                      <span>Bazar360.online</span>
                    </div>
                  </div>

                  {/* Vehicle Meta & Pricing Info */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {car.title || `${car.make} ${car.model}`}
                      </h3>
                      {car.location && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          📍 {car.location}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Asking Price</span>
                        <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate block">
                          {displayPrice}
                        </span>
                      </div>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-bold shrink-0 border border-slate-200/60 dark:border-slate-700">
                        {car.year}
                      </span>
                    </div>
                  </div>
                </AnimatedVehicleCard>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
