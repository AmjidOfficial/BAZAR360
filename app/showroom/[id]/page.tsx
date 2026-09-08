import React from 'react';
import { notFound } from 'next/navigation';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ShowroomHeaderAnimated } from '../../../src/components/ShowroomHeaderAnimated';
import { ShowroomFilterableInventory } from '../../../src/components/ShowroomFilterableInventory';

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
    "@id": `https://bazar360.online/showroom/${dealer.id}`,
    "name": dealer.name,
    "image": dealer.coverImage || dealer.avatarUrl || dealer.logo || 'https://bazar360.online/logo_new.png',
    "telephone": dealer.phone || dealer.whatsapp || "+92 314 3600000",
    "url": `https://bazar360.online/showroom/${dealer.id}`,
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
  const passedIntegrity = checkBusinessIntegrity(data.showroom);
  const descriptionText = `Explore verified high-quality automotive fleet at ${name} located in ${location}. Browse active stock, find competitive prices, verified documentation, and connect directly with showroom experts.`;

  return {
    title: `${name} | Showroom in ${location} | Bazar360.online`,
    description: descriptionText,
    other: {
      'schema-integrity': passedIntegrity ? 'passed' : 'failed-missing-required-fields'
    },
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
  const schemas = generateBusinessSchemas(showroom);

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-main)] font-sans antialiased">
      {schemas && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
      )}
      {/* 1. Dynamic Ambience Premium Animated Header */}
      <ShowroomHeaderAnimated showroom={showroom} />

      {/* 2. Active Stock Grid Section with Mobile & Desktop Filter Menu */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-12">
        <ShowroomFilterableInventory inventory={inventory} />
      </section>
    </main>
  );
}
