import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'bazar360-2026';
const DATABASE_IDS = ['(default)', 'ai-studio-bazar360online-90162156-c190-465e-a44d-d2853657a61e'];
const KNOWN_FAKE_IDS = new Set([
  'toyota-corolla-grande-2020',
  'haval-h6-hev-2024',
  'honda-civic-rs-2026',
  'honda-civic-oriel-2025',
  'honda-deluxe-125-2014',
  'suzuki-wagon-r-2013',
]);

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BAZAR360;
if (!raw) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_BAZAR360');
const credentials = JSON.parse(raw);
if (credentials.project_id !== PROJECT_ID) throw new Error(`Wrong Firebase project: ${credentials.project_id}`);
const app = admin.initializeApp({ credential: admin.credential.cert(credentials), projectId: PROJECT_ID });

let removed = 0;
for (const databaseId of DATABASE_IDS) {
  const db = databaseId === '(default)' ? getFirestore(app) : getFirestore(app, databaseId);
  for (const id of KNOWN_FAKE_IDS) {
    const ref = db.collection('listings').doc(id);
    const snap = await ref.get();
    if (!snap.exists) continue;
    const data = snap.data() || {};
    const fingerprint = `${data.title ?? ''} ${data.name ?? ''} ${data.sellerName ?? ''} ${data.dealerId ?? ''} ${JSON.stringify(data.images ?? [])}`.toLowerCase();
    const isKnownSeedShape = id === 'toyota-corolla-grande-2020' || id === 'haval-h6-hev-2024' || id === 'honda-civic-rs-2026' || id === 'honda-civic-oriel-2025' || id === 'honda-deluxe-125-2014' || id === 'suzuki-wagon-r-2013';
    const hasStockMedia = /unsplash|pexels|pixabay|shutterstock|freepik/.test(fingerprint);
    if (isKnownSeedShape && hasStockMedia) {
      await ref.delete();
      removed++;
      console.log(`Removed confirmed fake seed listing ${databaseId}/listings/${id}`);
    }
  }
}
console.log(`Known fake inventory cleanup complete. Removed ${removed} confirmed seed records.`);
