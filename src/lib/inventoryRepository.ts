import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CarListing } from '../types';

const LISTINGS_COLLECTION = 'listings';

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function optionalBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function optionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const values = value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map(item => item.trim());
  return values.length ? values : undefined;
}

/** Public inventory requires explicit approval. */
function isPublished(data: DocumentData): boolean {
  return data.approved === true &&
    data.isArchived !== true &&
    data.isPaused !== true &&
    data.isSold !== true &&
    data.status !== 'Sold';
}

/** Maps Firestore data without inventing factual marketplace values. */
export function mapCanonicalListing(id: string, data: DocumentData): CarListing {
  const year = optionalNumber(data.year);
  const price = optionalNumber(data.price);
  const mileage = optionalNumber(data.mileage);
  const engineCC = optionalNumber(data.engineCC);
  const imageUrl = optionalString(data.imageUrl);
  const images = optionalStringArray(data.images) || (imageUrl ? [imageUrl] : undefined);
  const horsepower = optionalString(data.horsepower) || optionalString(data.horspower);

  return {
    id,
    title: optionalString(data.title) || '',
    make: optionalString(data.make) || '',
    model: optionalString(data.model) || '',
    year,
    price,
    mileage,
    fuelType: optionalString(data.fuelType) as CarListing['fuelType'],
    transmission: optionalString(data.transmission) as CarListing['transmission'],
    imageUrl,
    verified: optionalBoolean(data.verified),
    featured: optionalBoolean(data.featured),
    approved: optionalBoolean(data.approved),
    dealerId: optionalString(data.dealerId),
    showroomId: optionalString(data.showroomId),
    ownerId: optionalString(data.ownerId),
    description: optionalString(data.description),
    createdAt: optionalString(data.createdAt),
    updatedAt: optionalString(data.updatedAt),
    tags: optionalStringArray(data.tags),
    specs: {
      color: optionalString(data.exteriorColor),
      engineSize: engineCC === undefined ? undefined : `${engineCC} CC`,
      horsepower,
      horspower: horsepower,
      regionalSpecs: optionalString(data.assemblyType),
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
    condition: optionalString(data.condition) as CarListing['condition'],
    engineCC,
    exteriorColor: optionalString(data.exteriorColor),
    bodyCondition: optionalString(data.bodyCondition) as CarListing['bodyCondition'],
    registrationCity: optionalString(data.registrationCity),
    documentType: optionalString(data.documentType) as CarListing['documentType'],
    tokenTaxPaid: optionalBoolean(data.tokenTaxPaid),
    images,
    primaryImage: optionalString(data.primaryImage),
    verifiedBadge: optionalBoolean(data.verifiedBadge),
    assemblyType: optionalString(data.assemblyType) as CarListing['assemblyType'],
    features: optionalStringArray(data.features),
    dentPaintDescription: optionalString(data.dentPaintDescription),
    tokenTaxStatus: optionalString(data.tokenTaxStatus) as CarListing['tokenTaxStatus'],
    isSold: optionalBoolean(data.isSold),
    isPaused: optionalBoolean(data.isPaused),
    isArchived: optionalBoolean(data.isArchived),
    status: optionalString(data.status) as CarListing['status'],
    cloudinaryPublicId: optionalString(data.cloudinaryPublicId),
    cloudinaryPublicIds: optionalStringArray(data.cloudinaryPublicIds),
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

async function fetchPage(
  constraints: QueryConstraint[],
  pageSize: number,
  cursor?: QueryDocumentSnapshot<DocumentData> | null,
): Promise<InventoryPage> {
  const q = cursor
    ? query(collection(db, LISTINGS_COLLECTION), ...constraints, startAfter(cursor))
    : query(collection(db, LISTINGS_COLLECTION), ...constraints);
  const snap = await getDocs(q);
  const docs = snap.docs;
  const visibleDocs = docs.filter(d => isPublished(d.data())).slice(0, pageSize);
  return {
    listings: visibleDocs.map(d => mapCanonicalListing(d.id, d.data())),
    lastVisible: visibleDocs.length ? visibleDocs[visibleDocs.length - 1] : null,
    hasMore: docs.length > pageSize,
  };
}

export async function fetchInventoryPage(pageSize = 24, cursor?: QueryDocumentSnapshot<DocumentData> | null): Promise<InventoryPage> {
  const safePageSize = Math.min(Math.max(Math.floor(pageSize), 1), 48);
  return fetchPage(
    [where('approved', '==', true), orderBy('createdAt', 'desc'), limit(safePageSize + 1)],
    safePageSize,
    cursor,
  );
}

/** Fetch only one showroom's approved inventory. */
export async function fetchShowroomInventoryPage(
  showroomId: string,
  pageSize = 24,
  cursor?: QueryDocumentSnapshot<DocumentData> | null,
): Promise<InventoryPage> {
  const id = showroomId.trim();
  if (!id) return { listings: [], lastVisible: null, hasMore: false };
  const safePageSize = Math.min(Math.max(Math.floor(pageSize), 1), 48);
  return fetchPage(
    [where('showroomId', '==', id), where('approved', '==', true), orderBy('createdAt', 'desc'), limit(safePageSize + 1)],
    safePageSize,
    cursor,
  );
}

export async function fetchPublishedInventory(): Promise<InventoryPage> {
  return fetchInventoryPage(24);
}
