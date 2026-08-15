#!/usr/bin/env node
// Safe development seed helper. This script WILL NOT run in production by default.
// To run locally, set RUN_DEV_SEED=1 and provide a Firebase Admin service account
// via FIREBASE_SERVICE_ACCOUNT (path) or set other appropriate env vars.

const path = require('path');
const { INITIAL_DEALERS, INITIAL_LISTINGS, INITIAL_REVIEWS } = require(path.join(__dirname, 'initial-data'));

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run dev seed in production environment.');
  process.exit(1);
}

if (!process.env.RUN_DEV_SEED) {
  console.log('Dev seed helper present. To actually seed local/dev Firestore, set RUN_DEV_SEED=1 and configure credentials.');
  console.log('This prevents accidental seeding of production. The seed data lives in scripts/seed-dev/initial-data.js');
  console.log(`Dealers: ${INITIAL_DEALERS.length}, Listings: ${INITIAL_LISTINGS.length}, Review groups: ${Object.keys(INITIAL_REVIEWS).length}`);
  process.exit(0);
}

// If RUN_DEV_SEED is set, attempt to seed using service account.
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('RUN_DEV_SEED is set but FIREBASE_SERVICE_ACCOUNT is not configured. Aborting.');
  process.exit(1);
}

try {
  const admin = require('firebase-admin');
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  (async () => {
    console.log('Seeding developers collections...');
    for (const dealer of INITIAL_DEALERS) {
      await db.collection('dealers').doc(dealer.id).set(dealer, { merge: true });
      console.log('Seeded dealer', dealer.id);
    }
    for (const listing of INITIAL_LISTINGS) {
      await db.collection('listings').doc(listing.id).set(listing, { merge: true });
      console.log('Seeded listing', listing.id);
    }
    for (const [dealerId, reviews] of Object.entries(INITIAL_REVIEWS)) {
      const batch = db.batch();
      const reviewsCol = db.collection('dealers').doc(dealerId).collection('reviews');
      for (const rev of reviews) {
        const docRef = reviewsCol.doc(rev.id);
        batch.set(docRef, rev, { merge: true });
      }
      await batch.commit();
      console.log('Seeded reviews for', dealerId);
    }
    console.log('Dev seeding complete.');
    process.exit(0);
  })();
} catch (err) {
  console.error('Failed to seed dev data:', err.message || err);
  process.exit(1);
}
