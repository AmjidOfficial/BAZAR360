import React from 'react';
import { notFound } from 'next/navigation';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ShowroomHeaderAnimated } from '../../../src/components/ShowroomHeaderAnimated';
import { ShowroomFilterableInventory } from '../../../src/components/ShowroomFilterableInventory';

function checkBusinessIntegrity(dealer: any): boolean {
  if (!dealer) return false;
  const hasName = typeof dealer.name === 'string' && dealer.name.trim().length > 0;
  const hasAddress = Boolean(dealer.location || dealer.address);
  const hasPhone = Boolean(dealer.phone || dealer.whatsapp || dealer.contactPhone);
  return Boolean(hasName && hasAddress && hasPhone);
}

function generateBusinessSchemas(dealer: any) {
  if (!checkBusinessIntegrity(dealer)) return null;
  const orgSchema = {
    '@context': 'https://schema.org', '@type': 'Organization', '@id': 'https://bazar360.online/#organization',
    name: 'Bazar360 Marketplace', url: 'https://bazar360.online', logo: 'https://bazar360.online/logo_new.png'
  };
  const dealerSchema: Record<string, any> = {
    '@context': 'https://schema.org', '@type': 'AutoDealer', '@id': `https://bazar360.online/showroom/${dealer.id}`,
    name: dealer.name, url: `https://bazar360.online/showroom/${dealer.id}`,
    address: { '@type': 'PostalAddress', streetAddress: dealer.location || dealer.address, addressLocality: dealer.city || undefined, addressRegion: dealer.region || undefined, addressCountry: 'PK' },
  };
  const image = dealer.coverImage || dealer.avatarUrl || dealer.logo;
  const phone = dealer.phone || dealer.whatsapp || dealer.contactPhone;
  const description = dealer.description || dealer.subtitle;
  if (image) dealerSchema.image = image;
  if (phone) dealerSchema.telephone = phone;
  if (description) dealerSchema.description = description;
  if (dealer.rating !== undefined && dealer.rating !== null && dealer.reviewCount !== undefined) {
    dealerSchema.aggregateRating = { '@type': 'AggregateRating', ratingValue: dealer.rating, bestRating: '5', worstRating: '1', reviewCount: dealer.reviewCount };
  }
  return [orgSchema, dealerSchema];
}

function getAdminDb() { if (getApps().length === 0) initializeApp(); return getFirestore(); }

async function fetchShowroomAndInventory(idOrSlug: string) {
  const db = getAdminDb();
  const showroomsRef = db.collection('dealers');
  let showroomDoc = await showroomsRef.doc(idOrSlug).get();
  let showroomData: any = showroomDoc.exists ? { id: showroomDoc.id, ...showroomDoc.data() } : null;
  if (!showroomData) {
    const querySnapshot = await showroomsRef.where('id', '==', idOrSlug).get();
    if (!querySnapshot.empty) showroomData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  }
  if (!showroomData) {
    const allShowrooms = await showroomsRef.get();
    const matched = allShowrooms.docs.find(doc => {
      const d = doc.data();
      const genSlug = typeof d.name === 'string' ? d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
      return genSlug === idOrSlug.toLowerCase() || d.id === idOrSlug || d.slug === idOrSlug;
    });
    if (matched) showroomData = { id: matched.id, ...matched.data() };
  }
  if (!showroomData) return null;

  const listingsRef = db.collection('listings');
  const [showroomSnap, dealerSnap] = await Promise.all([
    listingsRef.where('showroomId', '==', showroomData.id).where('approved', '==', true).get(),
    listingsRef.where('dealerId', '==', showroomData.id).where('approved', '==', true).get(),
  ]);
  const inventoryMap = new Map<string, any>();
  [...showroomSnap.docs, ...dealerSnap.docs].forEach(doc => {
    const data = doc.data();
    if (data.isArchived === true || data.isPaused === true || data.isSold === true || data.status === 'Sold') return;
    inventoryMap.set(doc.id, { id: doc.id, ...data });
  });
  const inventory = [...inventoryMap.values()].sort((a, b) => {
    const time = (v: any) => typeof v?.toMillis === 'function' ? v.toMillis() : Date.parse(String(v || '')) || 0;
    return (time(b.updatedAt) || time(b.createdAt)) - (time(a.updatedAt) || time(a.createdAt));
  });
  return { showroom: showroomData, inventory };
}

interface ShowroomPageProps { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: ShowroomPageProps) {
  const resolvedParams = await params;
  const data = await fetchShowroomAndInventory(resolvedParams.id);
  if (!data) return { title: 'Showroom Not Recognized | Bazar360.online' };
  const name = data.showroom.name;
  const location = data.showroom.location || data.showroom.city;
  const logo = data.showroom.logo || data.showroom.coverImage;
  const descriptionText = data.showroom.description || data.showroom.subtitle || `${name}${location ? ` in ${location}` : ''} on Bazar360.online.`;
  return {
    title: `${name}${location ? ` | ${location}` : ''} | Bazar360.online`, description: descriptionText,
    other: { 'schema-integrity': checkBusinessIntegrity(data.showroom) ? 'passed' : 'failed-missing-required-fields' },
    keywords: [name, location, 'Bazar360', 'vehicles', 'showroom'].filter(Boolean),
    openGraph: { title: `${name} | Bazar360`, description: descriptionText, url: `https://bazar360.online/showroom/${resolvedParams.id}`, siteName: 'Bazar360', images: logo ? [{ url: logo }] : [], type: 'profile' },
    twitter: { card: 'summary_large_image', title: `${name} | Bazar360`, description: descriptionText, images: logo ? [logo] : [] }
  };
}

export default async function ShowroomPortalPage({ params }: ShowroomPageProps) {
  const resolvedParams = await params;
  const data = await fetchShowroomAndInventory(resolvedParams.id);
  if (!data) notFound();
  const { showroom, inventory } = data;
  const schemas = generateBusinessSchemas(showroom);
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-main)] font-sans antialiased">
      {schemas && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />}
      <ShowroomHeaderAnimated showroom={showroom} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12">
        <ShowroomFilterableInventory inventory={inventory} />
      </section>
    </main>
  );
}
