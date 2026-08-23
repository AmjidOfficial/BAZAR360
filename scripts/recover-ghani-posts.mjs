import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'bazar360-2026';
const DATABASE_IDS = ['(default)', 'ai-studio-bazar360online-90162156-c190-465e-a44d-d2853657a61e'];
const TARGET_DATABASE_ID = 'ai-studio-bazar360online-90162156-c190-465e-a44d-d2853657a61e';
const TARGET_COLLECTION = 'posts';
const OWNER_NAME = 'Ghani Khan';
const OWNER_EMAILS = ['khattakghani94@gmail.com'];
const DRY_RUN = String(process.env.RECOVERY_DRY_RUN ?? 'true').toLowerCase() !== 'false';

if (!process.env.FIREBASE_SERVICE_ACCOUNT) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT');
const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (credentials.project_id !== PROJECT_ID) throw new Error(`Wrong Firebase project: ${credentials.project_id}`);
const app = admin.initializeApp({ credential: admin.credential.cert(credentials), projectId: PROJECT_ID });

const norm = value => String(value ?? '').trim().toLowerCase();
const ownerKeys = ['userName', 'authorName', 'createdByName', 'ownerName', 'displayName', 'name', 'user', 'author', 'createdBy'];
const emailKeys = ['userEmail', 'authorEmail', 'createdByEmail', 'ownerEmail', 'email'];
const idKeys = ['userId', 'authorId', 'createdByUid', 'uid', 'ownerId'];

function matchesGhani(data) {
  for (const key of emailKeys) {
    const value = data?.[key];
    if (typeof value === 'string' && OWNER_EMAILS.some(email => norm(value) === norm(email))) return true;
  }
  for (const key of ownerKeys) {
    const value = data?.[key];
    if (typeof value === 'string' && norm(value) === norm(OWNER_NAME)) return true;
    if (value && typeof value === 'object') {
      const nestedName = value.displayName || value.name || value.userName || value.authorName;
      const nestedEmail = value.email || value.userEmail || value.authorEmail;
      if (norm(nestedName) === norm(OWNER_NAME)) return true;
      if (OWNER_EMAILS.some(email => norm(nestedEmail) === norm(email))) return true;
    }
  }
  return idKeys.some(key => typeof data?.[key] === 'string' && norm(data[key]) === norm('khattakghani94@gmail.com'));
}

function looksLikePost(data) {
  const keys = Object.keys(data ?? {}).join(' ').toLowerCase();
  return /content|caption|mediaurl|mediaurls|post|createdat|likes|commentscount/.test(keys);
}

function normalizePost(data, source) {
  const copy = { ...data };
  if (!copy.userName) copy.userName = OWNER_NAME;
  if (!copy.userRole) copy.userRole = 'Admin';
  if (!copy.userEmail) copy.userEmail = OWNER_EMAILS[0];
  copy.approved = true;
  copy.recoveredAt = admin.firestore.FieldValue.serverTimestamp();
  copy.recoveredFromDatabase = source.databaseId;
  copy.recoveredFromCollection = source.path;
  copy.recoveredFromId = source.id;
  copy.recoveredBy = 'ghani-post-recovery';
  return copy;
}

async function scanCollection(ref, path, found, databaseId) {
  const snap = await ref.get();
  for (const document of snap.docs) {
    const data = document.data();
    const isPostPath = /(^|\/)(posts|communityPosts|socialPosts)(\/|$)/i.test(path);
    if (isPostPath && looksLikePost(data) && matchesGhani(data)) {
      found.push({ databaseId, path, id: document.id, data });
    }
    for (const sub of await document.ref.listCollections()) {
      await scanCollection(sub, `${path}/${document.id}/${sub.id}`, found, databaseId);
    }
  }
}

const found = [];
for (const databaseId of DATABASE_IDS) {
  let db;
  try {
    db = databaseId === '(default)' ? getFirestore(app) : getFirestore(app, databaseId);
  } catch (error) {
    console.log(`DATABASE_UNAVAILABLE ${databaseId}: ${error.message}`);
    continue;
  }
  for (const collection of await db.listCollections()) {
    await scanCollection(collection, collection.id, found, databaseId);
  }
}

const unique = [...new Map(found.map(x => [`${x.databaseId}:${x.path}/${x.id}`, x])).values()];
console.log(JSON.stringify({
  projectId: PROJECT_ID,
  databasesChecked: DATABASE_IDS,
  targetDatabase: TARGET_DATABASE_ID,
  dryRun: DRY_RUN,
  owner: OWNER_NAME,
  ownerEmails: OWNER_EMAILS,
  candidateCount: unique.length,
  candidates: unique.map(x => ({
    databaseId: x.databaseId,
    sourceCollection: x.path,
    sourceId: x.id,
    createdAt: x.data?.createdAt ?? null,
    contentPreview: String(x.data?.content ?? x.data?.caption ?? '').slice(0, 160)
  }))
}, null, 2));

if (DRY_RUN || unique.length === 0) process.exit(0);

const targetDb = getFirestore(app, TARGET_DATABASE_ID);
let restored = 0;
for (const item of unique) {
  const targetRef = targetDb.collection(TARGET_COLLECTION).doc(item.id);
  const existing = await targetRef.get();
  if (existing.exists) {
    const existingData = existing.data() || {};
    if (!matchesGhani(existingData)) {
      console.log(`SKIP ID collision with unrelated post: ${item.id}`);
      continue;
    }
  }
  await targetRef.set(normalizePost(item.data, item), { merge: true });
  restored++;
}
console.log(`Restored ${restored} Ghani Khan admin posts into ${TARGET_COLLECTION}.`);
