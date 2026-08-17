import admin from 'firebase-admin';

const PROJECT_ID = 'bazar360-2026';
const TARGET_COLLECTION = 'listings';
const OWNER_NAMES = ['Umair', 'Mehran Bacha', 'Syed Zain', 'Ghani Khan'];
const DRY_RUN = String(process.env.RECOVERY_DRY_RUN ?? 'true').toLowerCase() !== 'false';

if (!process.env.FIREBASE_SERVICE_ACCOUNT) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT');
const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (credentials.project_id !== PROJECT_ID) throw new Error(`Wrong Firebase project: ${credentials.project_id}`);
admin.initializeApp({credential: admin.credential.cert(credentials), projectId: PROJECT_ID});
const db = admin.firestore();

const norm = v => String(v ?? '').trim().toLowerCase();
const strings = (v, p = '', out = []) => {
  if (v == null) return out;
  if (typeof v === 'string') out.push({path:p, value:v});
  else if (Array.isArray(v)) v.forEach((x,i)=>strings(x,`${p}[${i}]`,out));
  else if (typeof v === 'object') Object.entries(v).forEach(([k,x])=>strings(x,p?`${p}.${k}`:k,out));
  return out;
};
const ownerOf = data => {
  const vals = strings(data).map(x=>norm(x.value));
  return OWNER_NAMES.find(n => vals.some(v => v === norm(n) || v.includes(norm(n)))) ?? null;
};
const imagesOf = data => strings(data).map(x=>x.value).filter(v=>/^https?:\/\//i.test(v));
const vehicleLike = data => /(vehicle|car|make|model|year|mileage|price|registration|engine|variant|showroom|inventory|listing)/.test(`${Object.keys(data).join(' ')} ${strings(data).map(x=>x.value).join(' ')}`.toLowerCase());

async function scan(ref, path, found) {
  const snap = await ref.get();
  for (const doc of snap.docs) {
    const data = doc.data();
    const owner = ownerOf(data);
    const imgs = imagesOf(data);
    if (owner && (vehicleLike(data) || imgs.some(u => /cloudinary\.com|res\.cloudinary\.com/i.test(u)))) found.push({path,id:doc.id,owner,imgs,data});
    for (const sub of await doc.ref.listCollections()) await scan(sub,`${path}/${doc.id}/${sub.id}`,found);
  }
}

const roots = await db.listCollections();
const found=[];
for (const c of roots) await scan(c,c.id,found);
const unique=[...new Map(found.map(x=>[`${x.path}/${x.id}`,x])).values()];
console.log(JSON.stringify({projectId:PROJECT_ID,dryRun:DRY_RUN,owners:OWNER_NAMES,collections:roots.map(c=>c.id),candidateCount:unique.length,candidates:unique.map(x=>({sourceCollection:x.path,sourceId:x.id,owner:x.owner,imageCount:x.imgs.length,cloudinaryImages:x.imgs.filter(u=>/cloudinary\.com/i.test(u)),fields:Object.keys(x.data)}))},null,2));
if (DRY_RUN || unique.length===0) process.exit(0);
let restored=0;
for (const x of unique) {
  const ref=db.collection(TARGET_COLLECTION).doc(x.id);
  const existing=await ref.get();
  if (existing.exists && !existing.data()?.recoveredFromCollection) {
    console.log(`SKIP existing unrelated listing: ${x.id}`); continue;
  }
  await ref.set({...x.data,recoveredAt:admin.firestore.FieldValue.serverTimestamp(),recoveredFromCollection:x.path,recoveredFromId:x.id,recoveredBy:'production-inventory-recovery',recoveryOwner:x.owner},{merge:existing.exists});
  restored++;
}
console.log(`Restored ${restored} owner-matched records.`);
