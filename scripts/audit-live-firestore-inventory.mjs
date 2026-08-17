import admin from 'firebase-admin';
const projectId = 'bazar360-2026';
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BAZAR360;
if (!raw) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_BAZAR360');
const serviceAccount = JSON.parse(raw);
if (serviceAccount.project_id !== projectId) throw new Error(`Wrong service-account project: ${serviceAccount.project_id}. Expected ${projectId}.`);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId });
const db = admin.firestore();
const snap = await db.collection('listings').get();
const suspiciousWords = /\b(dummy|sample|demo|placeholder|fake|test listing|test car|test vehicle)\b/i;
const owners = ['Umair', 'Mehran Bacha', 'Syed Zain', 'Ghani Khan'];
const stats = { total: snap.size, approved: 0, activePublic: 0, sold: 0, paused: 0, archived: 0, withoutOwner: 0, withoutCreatedAt: 0, withoutUpdatedAt: 0, withoutImages: 0, suspicious: 0, activeBlockedMedia: 0, cloudinaryMedia: 0, targetOwnerRecords: 0, autoChoicePeshawarRecords: 0, activeTargetOwnerRecords: 0, activeAutoChoicePeshawarRecords: 0 };
const suspicious = [], mediaIssues = [], ownerCounts = Object.fromEntries(owners.map(x => [x, 0]));
const norm = x => String(x ?? '').trim().toLowerCase();
for (const doc of snap.docs) {
  const d = doc.data();
  const status = norm(d.status);
  const ownerText = [d.ownerName,d.sellerName,d.createdByName,d.userName,d.authorName,d.owner,d.seller,d.createdBy,d.user].filter(x => typeof x === 'string').join(' ');
  const ownerId = d.ownerId ?? d.userId ?? d.sellerId ?? d.createdBy ?? d.postedBy;
  const title = [d.title,d.name,d.make,d.model,d.description].filter(Boolean).join(' ');
  const images = Array.isArray(d.images) ? d.images : (Array.isArray(d.imageUrls) ? d.imageUrls : (d.imageUrl ? [d.imageUrl] : []));
  const cloudinary = images.filter(x => typeof x === 'string' && /cloudinary\.com/i.test(x));
  const blocked = images.filter(x => typeof x === 'string' && /(images\.unsplash\.com|unsplash\.com|pexels\.com|pixabay\.com|shutterstock\.com|freepik\.com)/i.test(x));
  if (d.approved === true) stats.approved++;
  if (d.isSold === true || status === 'sold') stats.sold++;
  if (d.isPaused === true || status === 'paused') stats.paused++;
  if (d.isArchived === true || status === 'archived') stats.archived++;
  if (!ownerId) stats.withoutOwner++;
  if (!d.createdAt) stats.withoutCreatedAt++;
  if (!d.updatedAt) stats.withoutUpdatedAt++;
  if (!images.length) stats.withoutImages++;
  stats.cloudinaryMedia += cloudinary.length;
  const active = d.approved === true && d.isArchived !== true && d.isPaused !== true && d.isSold !== true && status !== 'sold';
  if (active) stats.activePublic++;
  const ownerMatch = owners.find(x => norm(ownerText).includes(norm(x)));
  if (ownerMatch) { stats.targetOwnerRecords++; ownerCounts[ownerMatch]++; if (active) stats.activeTargetOwnerRecords++; }
  const autoChoicePeshawar = norm(`${ownerText} ${d.showroomName ?? ''} ${d.dealerName ?? ''} ${d.location ?? ''} ${d.city ?? ''}`).includes('auto choice') && norm(`${d.location ?? ''} ${d.city ?? ''} ${ownerText}`).includes('peshawar');
  if (autoChoicePeshawar) { stats.autoChoicePeshawarRecords++; if (active) stats.activeAutoChoicePeshawarRecords++; }
  if (active && blocked.length) { stats.activeBlockedMedia += blocked.length; mediaIssues.push({ id: doc.id, blocked }); }
  if (suspiciousWords.test(title)) { stats.suspicious++; suspicious.push({ id: doc.id, title: String(d.title ?? d.name ?? ''), owner: ownerId ?? null }); }
}
console.log('LIVE FIRESTORE INVENTORY AUDIT');
console.log(JSON.stringify({ projectId, collection: 'listings', ...stats, ownerCounts }, null, 2));
if (suspicious.length || mediaIssues.length) {
  if (suspicious.length) { console.log('SUSPICIOUS RECORDS (NOT DELETED):'); console.log(JSON.stringify(suspicious.slice(0, 100), null, 2)); }
  if (mediaIssues.length) { console.log('ACTIVE RECORDS WITH BLOCKED STOCK MEDIA (NOT DELETED):'); console.log(JSON.stringify(mediaIssues.slice(0, 100), null, 2)); }
  console.error('Live inventory audit failed. No Firestore records were modified by the audit.');
  process.exitCode = 2;
}
console.log('Live Firestore audit completed. No records were modified by the audit.');
