import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CarListing } from '../types';

const LISTINGS_COLLECTION = 'listings';

/**
 * Canonical marketplace inventory access.
 *
 * Rules:
 * - Firestore document ID is the only listing identity.
 * - No title/price/year/dealer deduplication.
 * - No hard-coded seller, showroom or vehicle facts.
 * - Public inventory is constrained by publication state.
 * - Cursor pagination is the normal access pattern.
 */

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function isPublished(data: DocumentData): boolean {
  return data.approved !== false && data.isArchived !== true && data.isPaused !== true && data.isSold !== true && data.status !== 'Sold';
}

/** Maps authoritative Firestore data without inventing factual values. */
export function mapCanonicalListing(id: string, data: DocumentData): CarListing {
  const year = optionalNumber(data.year);
  const price = optionalNumber(data.price);
  const mileage = optionalNumber(data.mileage);
  const engineCC = optionalNumber(data.engineCC);
  const fuelType = optionalString(data.fuelType) as CarListing['fuelType'] | undefined;
  const transmission = optionalString(data.transmission) as CarListing['transmission'] | undefined;
  const condition = optionalString(data.condition) as CarListing['condition'] | undefined;
  const bodyCondition = optionalString(data.bodyCondition) as CarListing['bodyCondition'] | undefined;
  const documentType = optionalString(data.documentType) as CarListing['documentType'] | undefined;

  // Legacy UI types currently require several fields. Undefined is intentionally
  // preserved at runtime for missing Firestore facts. UI components must render
  // missing values as "Not provided" rather than supplying defaults.
  return {
    id,
    title: optionalString(data.title) || '',
    make: optionalString(data.make) || '',
    model: optionalString(data.model) || '',
    year: year as number,
    price: price as number,
    mileage: mileage as number,
    fuelType: fuelType as CarListing['fuelType'],
    transmission: transmission as CarListing['transmission'],
    imageUrl: optionalString(data.imageUrl) || '',
    verified: data.verified === true,
    featured: data.featured === true,
    approved: data.approved !== false,
    dealerId: optionalString(data.dealerId) || '',
    description: optionalString(data.description) || '',
    createdAt: optionalString(data.createdAt) || '',
    updatedAt: optionalString(data.updatedAt),
    tags: Array.isArray(data.tags) ? data.tags.filter((v: unknown) => typeof v === 'string') : [],
    specs: {
      color: optionalString(data.exteriorColor) || '',
      engineSize: engineCC === undefined ? '' : `${engineCC} CC`,
      horspower: optionalString(data.horsepower) || optionalString(data.horspower) || '',
      regionalSpecs: optionalString(data.assemblyType) || '',
    },
    createdBy: optionalString(data.createdBy),
    assignedSalesRepId: optionalString(data.assignedSalesRepId),
    region: optionalString(data.region),
    location: optionalString(data.location),
    phone: optionalString(data.phone),
    sellerPhone: optionalString(data.sellerPhone),
    sellerName: optionalString(data.sellerName),
    sellerWhatsApp: optionalString(data.sellerWhatsApp),
    sellerType: optionalString(data.sellerType) as CarListing['sellerType'],
    condition: condition as CarListing['condition'],
    engineCC: engineCC as number,
    exteriorColor: optionalString(data.exteriorColor) as string,
    bodyCondition: bodyCondition as CarListing['bodyCondition'],
    registrationCity: optionalString(data.registrationCity) as string,
    documentType: documentType as CarListing['documentType'],
    tokenTaxPaid: data.tokenTaxPaid === true,
    images: Array.isArray(data.images) ? data.images.filter((v: unknown) => typeof v === 'string') : (optionalString(data.imageUrl) ? [data.imageUrl] : []),
    primaryImage: optionalString(data.primaryImage),
    verifiedBadge: data.verifiedBadge === true,
    assemblyType: optionalString(data.assemblyType) as CarListing['assemblyType'],
    features: Array.isArray(data.features) ? data.features.filter((v: unknown) => typeof v === 'string') : undefined,
    dentPaintDescription: optionalString(data.dentPaintDescription),
    tokenTaxStatus: optionalString(data.tokenTaxStatus) as CarListing['tokenTaxStatus'],
    isSold: data.isSold === true,
    isPaused: data.isPaused === true,
    isArchived: data.isArchived === true,
    status: optionalString(data.status) as CarListing['status'],
    cloudinaryPublicId: optionalString(data.cloudinaryPublicId),
    cloudinaryPublicIds: Array.isArray(data.cloudinaryPublicIds) ? data.cloudinaryPublicIds.filter((v: unknown) => typeof v === 'string') : undefined,
    videoUrl: optionalString(data.videoUrl),
    videoCloudinaryPublicId: optionalString(data.videoCloudinaryPublicId),
    pdfUrl: optionalString(data.pdfUrl),
    pdfCloudinaryPublicId: optionalString(data.pdfCloudinaryPublicId),
    pdfTitle: optionalString(data.pdfTitle),
  };
}

export async function fetchListingById(id: string): Promise<CarListing | null> {
  if (!id.trim()) return null;
  const snap = await getDoc(doc(db, LISTINGS_COLLECTION, id));
  if (!snap.exists() || !isPublished(snap.data())) return null;
  return mapCanonicalListing(snap.id, snap.data());
}

export interface InventoryPage {
  listings: CarListing[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export async function fetchInventoryPage(
  pageSize = 24,
  cursor?: QueryDocumentSnapshot<DocumentData> | null,
): Promise<InventoryPage> {
  const safePageSize = Math.min(Math.max(Math.floor(pageSize), 1), 48);
  const constraints = [orderBy('createdAt', 'desc'), limit(safePageSize + 1)];
  const q = cursor
    ? query(collection(db, LISTINGS_COLLECTION), ...constraints, startAfter(cursor))
    : query(collection(db, LISTINGS_COLLECTION), ...constraints);

  const snap = await getDocs(q);
  const docs = snap.docs;
  const hasMore = docs.length > safePageSize;
  const visibleDocs = docs.slice(0, safePageSize).filter(d => isPublished(d.data()));

  return {
    listings: visibleDocs.map(d => mapCanonicalListing(d.id, d.data())),
    lastVisible: visibleDocs.length ? visibleDocs[visibleDocs.length - 1] : null,
    hasMore,
  };
}

export async function fetchPublishedInventory(): Promise<InventoryPage> {
  return fetchInventoryPage(24);
}
