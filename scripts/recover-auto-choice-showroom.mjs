import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'bazar360-2026';
const DATABASE_IDS = ['(default)', 'ai-studio-bazar360online-90162156-c190-465e-a44d-d2853657a61e'];
const TARGET_DB_ID = '(default)';
const CANONICAL_ID = 'auto-choice-peshawer';
const SEARCH_TERMS = ['auto choice', 'peshawar'];

if (!process.env.FIREBASE_SERVICE_ACCOUNT) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT');
const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (credentials.project_id !== PROJECT_ID) throw new Error(`Wrong Firebase project: ${credentials.project_id}`);
const app = admin.initializeApp({ credential: admin.credential.cert(credentials), projectId: PROJECT_ID });
const norm = v => String(v ?? '').trim().toLowerCase();
const flatten = (v, out = []) => { if (v == null) return out; if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(x => flatten(x, out)); else if (typeof v === 'object') Object.values(v).forEach(x => flatten(x, out)); return out; };
const matches = data => { const text = `${Object.keys(data).join(' ')} ${flatten(data).join(' ')}`.toLowerCase(); return SEARCH_TERMS.every(term => text.includes(term)); };
const clean = data => {
  const copy = { ...data };
  delete copy.rating; delete copy.ratings; delete copy.ratingCount; delete copy.reviewCount;
  delete copy.inventoryCount; delete copy.totalInventory; delete copy.stockCount;
  return copy;
};
const candidates = [];
for (const databaseId of DATABASE_IDS) {
  const db = databaseId === '(default)' ? getFirestore(app) : getFirestore(app, databaseId);
  for (const collectionName of ['dealers', 'showrooms']) {
    const snap = await db.collection(collectionName).get();
    for (const doc of snap.docs) {
      const data = doc.data();
      if (matches(data)) candidates.push({ databaseId, collectionName, id: doc.id, data });
    }
  }
}
const unique = [...new Map(candidates.map(x => [`${x.databaseId}:${x.collectionName}/${x.id}`, x])).values()];
console.log(JSON.stringify({ projectId: PROJECT_ID, candidates: unique.map(x => ({ databaseId: x.databaseId, collection: x.collectionName, id: x.id, fields: Object.keys(x.data) })) }, null, 2));
if (!unique.length) { console.log('No historical Auto Choice Peshawar showroom record found. No synthetic showroom was created.'); process.exit(0); }

const source = unique[0];
const targetDb = getFirestore(app, TARGET_DB_ID);
const targetRef = targetDb.collection('dealers').doc(CANONICAL_ID);
const existing = await targetRef.get();
if (existing.exists && !existing.data()?.recoveredFromDatabase) {
  console.log(`SKIP existing unrelated dealer record: ${CANONICAL_ID}`);
  process.exit(0);
}
const restored = clean(source.data);
await targetRef.set({
  ...restored,
  slug: CANONICAL_ID,
  recoveredAt: admin.firestore.FieldValue.serverTimestamp(),
  recoveredFromDatabase: source.databaseId,
  recoveredFromCollection: source.collectionName,
  recoveredFromId: source.id,
  recoveryMethod: 'historical-firestore-restoration'
}, { merge: true });
console.log(`Restored Auto Choice Peshawar showroom from ${source.databaseId}/${source.collectionName}/${source.id} to dealers/${CANONICAL_ID}`);
