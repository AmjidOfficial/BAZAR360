import * as admin from 'firebase-admin';

// Initialize Firebase Admin (lazy)
let app: admin.app.App;
try {
  app = admin.initializeApp();
} catch (e) {
  app = admin.app();
}
const db = admin.firestore();

export async function generateDealerSeo(dealerId: string): Promise<string> {
  const dealerDoc = await db.collection('dealers').doc(dealerId).get();
  if (!dealerDoc.exists) {
    return '';
  }
  const dealer = dealerDoc.data() as any;

  const title = `${dealer.name} | Bazar360`;
  const description = dealer.subtitle || 'Explore our exclusive automotive showroom inventory on Bazar360.online.';
  const imageUrl = dealer.logo || 'https://bazar360.online/og-image.png';
  const url = `https://bazar360.online/dealers/${dealerId}`;

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
  `;
}
