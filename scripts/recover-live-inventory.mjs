import admin from 'firebase-admin';

const PROJECT_ID = 'bazar360-2026';
const TARGET_COLLECTION = 'listings';
const OWNER_NAMES = ['Umair', 'Mehran Bacha', 'Syed Zain', 'Ghani Khan'];
const DRY_RUN = String(process.env.RECOVERY_DRY_RUN ?? 'true').toLowerCase() !== 'false';

if (!process.env.FIREBASE_SERVICE_ACCOUNT) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT');
const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (credentials.project_id !== PROJECT_ID) throw new Error(`Wrong Firebase project: ${credentials.project_id}`);
admin.initializeApp({ credential: admin.credential.cert(credentials), projectId: PROJECT_ID });
const db = admin.firestore();
const norm = v => String(v ?? '').trim().toLowerCase();
const strings = (v, p = '', out = []) => { if (v == null) return out; if (typeof v === 'string') out.push({ path: p, value: v }); else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${p}[${i}]`, out)); else if (typeof v === 'object') Object.entries(v).forEach(([k, x]) => strings(x, p ? `${p}.${k}` : k, out)); return out; };
const OWNER_KEYS = ['ownerName','sellerName','createdByName','userName','authorName','owner','seller','createdBy','user'];
const ownerOf = data => { for (const key of OWNER_KEYS) { const value = data?.[key]; if (typeof value === 'string') { const match = OWNER_NAMES.find(n => norm(value) === norm(n) || norm(value).includes(norm(n))); if (match) return match; } } return null; };
const imagesOf = data => strings(data).map(x => x.value).filter(v => /^https?:\/\//i.test(v));
const cloudinaryImages = data => imagesOf(data).filter(v => /cloudinary\.com/i.test(v));
const vehicleLike = data => /(vehicle|car|make|model|year|mileage|price|registration|engine|variant|showroom|inventory|listing|fuel|transmission)/.test(`${Object.keys(data).join(' ')} ${strings(data).map(x => x.value).join(' ')}`.toLowerCase());
const autoChoicePeshawar = data => { const text = `${strings(data).map(x => x.value).join(' ')} ${Object.keys(data).join(' ')}`.toLowerCase(); return text.includes('auto choice') && text.includes('peshawar'); };
const isAllowedSource = path => /^(listings|inventory|vehicles|dealerInventory|showrooms|dealers)(\/|$)/i.test(path);
function cleanMedia(data) { const copy = { ...data }; const media = cloudinaryImages(data); if (Array.isArray(data.images)) copy.images = data.images.filter(v => typeof v === 'string' && /cloudinary\.com/i.test(v)); if (typeof data.imageUrl === 'string' && !/cloudinary\.com/i.test(data.imageUrl)) delete copy.imageUrl; if (typeof data.primaryImage === 'string' && !/cloudinary\.com/i.test(data.primaryImage)) delete copy.primaryImage; if (media.length && !copy.imageUrl) copy.imageUrl = media[0]; if (media.length && (!Array.isArray(copy.images) || !copy.images.length)) copy.images = media; return copy; }
async function scan(ref, path, found) { const snap = await ref.get(); for (const document of snap.docs) { const data = document.data(); const owner = ownerOf(data); const media = cloudinaryImages(data); if (isAllowedSource(path) && vehicleLike(data) && media.length > 0 && (owner || autoChoicePeshawar(data))) found.push({ path, id: document.id, owner, media, data: cleanMedia(data) }); for (const sub of await document.ref.listCollections()) await scan(sub, `${path}/${document.id}/${sub.id}`, found); } }
const roots = await db.listCollections();
const found = []; for (const collection of roots) await scan(collection, collection.id, found);
const unique = [...new Map(found.map(x => [`${x.path}/${x.id}`, x])).values()];
console.log(JSON.stringify({ projectId: PROJECT_ID, dryRun: DRY_RUN, owners: OWNER_NAMES, candidateCount: unique.length, candidates: unique.map(x => ({ sourceCollection: x.path, sourceId: x.id, owner: x.owner, cloudinaryImageCount: x.media.length, fields: Object.keys(x.data) })) }, null, 2));
if (DRY_RUN || unique.length === 0) process.exit(0);
let restored = 0;
for (const x of unique) { const ref = db.collection(TARGET_COLLECTION).doc(x.id); const existing = await ref.get(); if (existing.exists && !existing.data()?.recoveredFromCollection) { console.log(`SKIP existing unrelated listing: ${x.id}`); continue; } await ref.set({ ...x.data, recoveredAt: admin.firestore.FieldValue.serverTimestamp(), recoveredFromCollection: x.path, recoveredFromId: x.id, recoveredBy: 'production-inventory-recovery', recoveryOwner: x.owner || 'Auto Choice Peshawar' }, { merge: true }); restored++; }
console.log(`Restored ${restored} verified owner/showroom records with Cloudinary media.`);
