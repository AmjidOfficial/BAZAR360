import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getFirestore();
}

/**
 * 2. Next.js 15 App Router API route for querying inventory
 * Filters by make, model, or city dynamically.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const makeFilter = searchParams.get('make');
    const modelFilter = searchParams.get('model');
    const cityFilter = searchParams.get('city');

    const db = getAdminDb();
    const listingsRef = db.collection('listings');
    
    // Fetch all active (approved) listings
    const snapshot = await listingsRef.where('approved', '==', true).get();
    
    if (snapshot.empty) {
      return NextResponse.json([]);
    }

    let listings = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        make: data.make || '',
        model: data.model || '',
        year: Number(data.year) || 2024,
        price: Number(data.price) || 0,
        mileage: Number(data.mileage) || 0,
        fuelType: data.fuelType || 'Petrol',
        transmission: data.transmission || 'Automatic',
        imageUrl: data.imageUrl || '',
        verified: !!data.verified,
        featured: !!data.featured,
        approved: data.approved !== false,
        dealerId: data.dealerId || 'private',
        description: data.description || '',
        createdAt: data.createdAt || new Date().toISOString(),
        tags: Array.isArray(data.tags) ? data.tags : [],
        specs: data.specs || {
          color: data.exteriorColor || 'Standard',
          engineSize: data.engineCC ? `${data.engineCC} CC` : '2000 CC',
          horspower: '150 hp',
          regionalSpecs: data.assemblyType || 'Local'
        },
        condition: data.condition || 'Used',
        engineCC: Number(data.engineCC) || 2000,
        exteriorColor: data.exteriorColor || data.specs?.color || 'Standard White',
        bodyCondition: data.bodyCondition || 'Total Genuine',
        registrationCity: data.registrationCity || 'Peshawar',
        documentType: data.documentType || 'Smart Card',
        tokenTaxPaid: data.tokenTaxPaid !== false,
        images: Array.isArray(data.images) ? data.images : (data.imageUrl ? [data.imageUrl] : [])
      };
    });

    // Apply filters server-side
    if (makeFilter) {
      const target = makeFilter.toLowerCase().trim();
      listings = listings.filter(l => l.make.toLowerCase().includes(target));
    }
    if (modelFilter) {
      const target = modelFilter.toLowerCase().trim();
      listings = listings.filter(l => l.model.toLowerCase().includes(target));
    }
    if (cityFilter) {
      const target = cityFilter.toLowerCase().trim();
      listings = listings.filter(l => l.registrationCity.toLowerCase().includes(target));
    }

    return NextResponse.json(listings);
  } catch (err: any) {
    console.error('[API Router GET Vehicles] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch vehicles ledger', details: err.message }, { status: 500 });
  }
}
