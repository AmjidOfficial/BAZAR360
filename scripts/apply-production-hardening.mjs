import fs from 'fs';

const dbPath = 'src/lib/dbService.ts';
let db = fs.readFileSync(dbPath, 'utf8');

if (!db.includes("from './inventoryRepository'")) {
  db = db.replace(
    "import { uploadBase64ToCloudinary } from './cloudinaryService';",
    "import { uploadBase64ToCloudinary } from './cloudinaryService';\nimport { fetchListingById, fetchInventoryPage } from './inventoryRepository';"
  );
}

const start = db.indexOf('// 1. Fetch Dealers');
const end = db.indexOf('// Helper to recursively remove undefined fields');
if (start === -1 || end === -1 || end <= start) throw new Error('Could not locate legacy marketplace read block');

const replacement = `// 1. Fetch Dealers
export async function dbFetchDealers(forceRefresh = true): Promise<Dealer[]> {
  if (!forceRefresh && cachedDealers) return cachedDealers;
  try {
    const snap = await getDocs(query(collection(db, DEALERS_COLLECTION), limit(100)));
    const list: Dealer[] = snap.docs.map((dealerDoc) => {
      const data = dealerDoc.data();
      const logoUrl = typeof data.logoUrl === 'string' ? data.logoUrl : undefined;
      const avatarUrl = typeof data.avatarUrl === 'string' ? data.avatarUrl : logoUrl;
      return {
        ...data,
        id: dealerDoc.id,
        name: typeof data.name === 'string' ? data.name : '',
        avatarLetter: typeof data.avatarLetter === 'string' ? data.avatarLetter : (typeof data.name === 'string' && data.name ? data.name.substring(0, 2).toUpperCase() : 'D'),
        avatarUrl,
        logo: typeof data.logo === 'string' ? data.logo : logoUrl,
        logoUrl,
        subtitle: typeof data.subtitle === 'string' ? data.subtitle : '',
        location: typeof data.location === 'string' ? data.location : '',
        rating: typeof data.rating === 'number' ? data.rating : 0,
        vehiclesCount: typeof data.vehiclesCount === 'number' ? data.vehiclesCount : 0,
        followersCount: typeof data.followersCount === 'string' || typeof data.followersCount === 'number' ? data.followersCount : '0',
        coverImage: typeof data.coverImage === 'string' ? data.coverImage : undefined,
        description: typeof data.description === 'string' ? data.description : '',
        phone: typeof data.phone === 'string' ? data.phone : '',
        whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : '',
        socials: data.socials || {},
        activityFeed: Array.isArray(data.activityFeed) ? data.activityFeed : []
      } as Dealer;
    });
    cachedDealers = list;
    return list;
  } catch (err) {
    console.error('dbFetchDealers Error:', err);
    return [];
  }
}

// 2. Canonical marketplace reads. Listing identity and factual fields come only from Firestore.
export async function dbFetchListingById(id: string): Promise<CarListing | null> {
  return fetchListingById(id);
}

export async function dbFetchListings(forceRefresh = true): Promise<CarListing[]> {
  if (!forceRefresh && cachedListings) return cachedListings;
  try {
    const page = await fetchInventoryPage(48);
    cachedListings = page.listings;
    return cachedListings;
  } catch (err) {
    console.error('dbFetchListings Error:', err);
    return [];
  }
}

export async function dbFetchListingsPaginated(lastDocSnap?: any, limitCount: number = 24): Promise<{ listings: CarListing[], lastVisible: any }> {
  try {
    const page = await fetchInventoryPage(limitCount, lastDocSnap || null);
    return { listings: page.listings, lastVisible: page.lastVisible };
  } catch (err) {
    console.error('dbFetchListingsPaginated Error:', err);
    return { listings: [], lastVisible: null };
  }
}

`;

db = db.slice(0, start) + replacement + db.slice(end);
fs.writeFileSync(dbPath, db);

const appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/const METRIC_TABS_DATA = \{[\s\S]*?\n\};\n/, 'const METRIC_TABS_DATA: Record<string, Array<{label: string; value: string}>> = {};\n');
app = app.replace(/\bauto-choice-peshawar\b/g, '');
fs.writeFileSync(appPath, app);

const serverPath = 'server.ts';
let server = fs.readFileSync(serverPath, 'utf8');
server = server.replace(/auto-choice-peshawar/g, '');
fs.writeFileSync(serverPath, server);

console.log('Production marketplace legacy read/fallback cleanup applied.');
