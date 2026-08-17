import admin from 'firebase-admin';

const projectId = 'bazar360-2026';
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BAZAR360;

if (!raw) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_BAZAR360');

let serviceAccount;
try {
  serviceAccount = JSON.parse(raw);
} catch {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_BAZAR360 is not valid JSON');
}

if (serviceAccount.project_id !== projectId) {
  throw new Error(`Wrong service-account project: ${serviceAccount.project_id}. Expected ${projectId}.`);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId });
const db = admin.firestore();

const snap = await db.collection('listings').get();
const suspiciousWords = /\b(dummy|sample|demo|placeholder|fake|test listing|test car|test vehicle)\b/i;

const stats = {
  total: snap.size,
  approved: 0,
  activePublic: 0,
  sold: 0,
  paused: 0,
  archived: 0,
  withoutOwner: 0,
  withoutCreatedAt: 0,
  withoutUpdatedAt: 0,
  withoutImages: 0,
  suspicious: 0
};

const suspicious = [];

for (const doc of snap.docs) {
  const d = doc.data();
  const status = String(d.status ?? '').trim().toLowerCase();
  const owner = d.ownerId ?? d.userId ?? d.sellerId ?? d.createdBy ?? d.postedBy;
  const title = [d.title, d.name, d.make, d.model, d.description].filter(Boolean).join(' ');
  const images = Array.isArray(d.images) ? d.images : (Array.isArray(d.imageUrls) ? d.imageUrls : []);

  if (d.approved === true) stats.approved++;
  if (d.isSold === true || status === 'sold') stats.sold++;
  if (d.isPaused === true || status === 'paused') stats.paused++;
  if (d.isArchived === true || status === 'archived') stats.archived++;
  if (!owner) stats.withoutOwner++;
  if (!d.createdAt) stats.withoutCreatedAt++;
  if (!d.updatedAt) stats.withoutUpdatedAt++;
  if (images.length === 0) stats.withoutImages++;

  const active = d.approved === true && d.isArchived !== true && d.isPaused !== true && d.isSold !== true && status !== 'sold';
  if (active) stats.activePublic++;

  if (suspiciousWords.test(title)) {
    stats.suspicious++;
    suspicious.push({ id: doc.id, title: String(d.title ?? d.name ?? ''), owner: owner ?? null });
  }
}

console.log('LIVE FIRESTORE INVENTORY AUDIT');
console.log(JSON.stringify({ projectId, collection: 'listings', ...stats }, null, 2));

if (suspicious.length) {
  console.log('SUSPICIOUS RECORDS (NOT DELETED):');
  console.log(JSON.stringify(suspicious.slice(0, 100), null, 2));
  console.error(`Found ${suspicious.length} potentially fake/test records. No records were modified.`);
  process.exitCode = 2;
}

console.log('No obvious dummy/test inventory detected. No Firestore records were modified.');
