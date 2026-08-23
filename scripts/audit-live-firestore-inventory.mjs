import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = 'bazar360-2026';
const databaseIds = ['(default)', 'ai-studio-bazar360online-90162156-c190-465e-a44d-d2853657a61e'];
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BAZAR360;
if (!raw) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_BAZAR360');
const serviceAccount = JSON.parse(raw);
if (serviceAccount.project_id !== projectId) throw new Error(`Wrong service-account project: ${serviceAccount.project_id}. Expected ${projectId}.`);
const app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId });

const suspiciousWords = /\b(dummy|sample|demo|placeholder|fake|test listing|test car|test vehicle)\b/i;
const owners = ['Umair', 'Mehran Bacha', 'Syed Zain', 'Ghani Khan'];
const norm = x => String(x ?? '').trim().toLowerCase();

function inspectListing(doc, databaseId, collection = 'listings') {
  const d = doc.data();
  const status = norm(d.status);
  const ownerText = [d.ownerName,d.sellerName,d.createdByName,d.userName,d.authorName,d.owner,d.seller,d.createdBy,d.user].filter(x => typeof x === 'string').join(' ');
  const ownerId = d.ownerId ?? d.userId ?? d.sellerId ?? d.createdBy ?? d.postedBy;
  const title = [d.title,d.name,d.make,d.model,d.description].filter(Boolean).join(' ');
  const images = Array.isArray(d.images) ? d.images : (Array.isArray(d.imageUrls) ? d.imageUrls : (d.imageUrl ? [d.imageUrl] : []));
  const cloudinary = images.filter(x => typeof x === 'string' && /cloudinary\.com/i.test(x));
  const blocked = images.filter(x => typeof x === 'string' && /(images\.unsplash\.com|unsplash\.com|pexels\.com|pixabay\.com|shutterstock\.com|freepik\.com)/i.test(x));
  const active = d.approved === true && d.isArchived !== true && d.isPaused !== true && d.isSold !== true && status !== 'sold';
  const ownerMatch = owners.find(x => norm(ownerText).includes(norm(x))) ?? null;
  const autoChoicePeshawar = norm(`${ownerText} ${d.showroomName ?? ''} ${d.dealerName ?? ''} ${d.location ?? ''} ${d.city ?? ''}`).includes('auto choice') && norm(`${d.location ?? ''} ${d.city ?? ''} ${ownerText}`).includes('peshawar');
  return { databaseId, collection, id: doc.id, owner: ownerMatch, ownerId: ownerId ?? null, title: String(d.title ?? d.name ?? ''), active, approved: d.approved === true, status, images: images.length, cloudinary: cloudinary.length, blocked, autoChoicePeshawar, missingOwner: !ownerId, missingCreatedAt: !d.createdAt, missingUpdatedAt: !d.updatedAt, missingImages: !images.length, suspicious: suspiciousWords.test(title) };
}

const all = [];
for (const databaseId of databaseIds) {
  let db;
  try { db = databaseId === '(default)' ? getFirestore(app) : getFirestore(app, databaseId); } catch (error) { console.log(`DATABASE_UNAVAILABLE ${databaseId}: ${error.message}`); continue; }
  let snap;
  try { snap = await db.collection('listings').get(); } catch (error) { console.log(`LISTINGS_UNAVAILABLE ${databaseId}: ${error.message}`); continue; }
  for (const doc of snap.docs) all.push(inspectListing(doc, databaseId));
}

const stats = { total: all.length, approved: all.filter(x => x.approved).length, activePublic: all.filter(x => x.active).length, sold: all.filter(x => x.status === 'sold').length, paused: all.filter(x => x.status === 'paused').length, archived: all.filter(x => x.status === 'archived').length, withoutOwner: all.filter(x => x.missingOwner).length, withoutCreatedAt: all.filter(x => x.missingCreatedAt).length, withoutUpdatedAt: all.filter(x => x.missingUpdatedAt).length, withoutImages: all.filter(x => x.missingImages).length, suspicious: all.filter(x => x.suspicious).length, activeBlockedMedia: all.filter(x => x.active && x.blocked.length).reduce((n, x) => n + x.blocked.length, 0), cloudinaryMedia: all.reduce((n, x) => n + x.cloudinary, 0), targetOwnerRecords: all.filter(x => x.owner).length, activeTargetOwnerRecords: all.filter(x => x.owner && x.active).length, autoChoicePeshawarRecords: all.filter(x => x.autoChoicePeshawar).length, activeAutoChoicePeshawarRecords: all.filter(x => x.autoChoicePeshawar && x.active).length };
const ownerCounts = Object.fromEntries(owners.map(owner => [owner, all.filter(x => x.owner === owner).length]));
console.log('LIVE FIRESTORE INVENTORY AUDIT');
console.log(JSON.stringify({ projectId, databasesChecked: databaseIds, collection: 'listings', ...stats, ownerCounts, records: all.slice(0, 500) }, null, 2));

const suspicious = all.filter(x => x.suspicious);
const mediaIssues = all.filter(x => x.active && x.blocked.length);
if (suspicious.length || mediaIssues.length) {
  console.log(JSON.stringify({ suspiciousRecords: suspicious.slice(0, 100), activeBlockedMediaRecords: mediaIssues.slice(0, 100) }, null, 2));
  console.error('Live inventory audit failed. No Firestore records were modified by the audit.');
  process.exitCode = 2;
}
console.log('Live Firestore audit completed. No records were modified by the audit.');
