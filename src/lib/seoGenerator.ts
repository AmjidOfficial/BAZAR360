import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (lazy)
let app: App;
if (getApps().length === 0) {
  try {
    app = initializeApp();
  } catch (e) {
    app = getApp();
  }
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);

function ensureAbsoluteUrl(url: string | undefined): string {
  if (!url) return 'https://bazar360.online/auto_choice_logo_dark.jpg';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `https://bazar360.online/${url.replace(/^\//, '')}`;
}

export async function generateDealerSeo(dealerId: string): Promise<string> {
  try {
    const dealerDoc = await db.collection('dealers').doc(dealerId).get();
    if (!dealerDoc.exists) {
      return '';
    }
    const dealer = dealerDoc.data() as any;

    const title = `${dealer.name} - Verified Showroom | Bazar360 Online`;
    const description = dealer.subtitle || dealer.description || `Browse active pre-owned vehicle stock and contact ${dealer.name} directly on Bazar360.online.`;
    // Showroom shares prioritize Showroom Logo for clear branding preview
    const rawImage = dealer.logoUrl || dealer.logo || dealer.avatarUrl || dealer.coverImage;
    const imageUrl = ensureAbsoluteUrl(rawImage);
    const url = `https://bazar360.online/dealers/${dealerId}`;

    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `https://bazar360.online/dealers/${dealerId}#organization`,
        "name": dealer.name,
        "url": url,
        "logo": imageUrl,
        "description": description,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": dealer.phone || dealer.whatsapp || "+92-314-9198403",
          "contactType": "customer service",
          "areaServed": "PK",
          "availableLanguage": ["English", "Urdu"]
        }
      },
      {
        "@context": "https://schema.org",
        "@type": ["AutoDealer", "AutomotiveBusiness", "LocalBusiness"],
        "@id": `https://bazar360.online/dealers/${dealerId}#localbusiness`,
        "name": dealer.name,
        "image": imageUrl,
        "telephone": dealer.phone || dealer.whatsapp || "+92-314-9198403",
        "url": url,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": dealer.location || "Peshawar, KPK",
          "addressLocality": (dealer.location || "Peshawar").split(',')[0]?.trim() || "Peshawar",
          "addressRegion": (dealer.location || "KPK").split(',')[1]?.trim() || "KPK",
          "addressCountry": "PK"
        },
        "description": description,
        "priceRange": "$$$",
        "aggregateRating": dealer.rating ? {
          "@type": "AggregateRating",
          "ratingValue": dealer.rating,
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": dealer.reviewsCount || dealer.vehiclesCount || 10
        } : undefined
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://bazar360.online"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Showrooms",
            "item": "https://bazar360.online/dealers"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": dealer.name,
            "item": url
          }
        ]
      }
    ];

    return `
      <title>${title}</title>
      <meta name="description" content="${description}" />
      <meta property="og:site_name" content="Bazar360 Online" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:image:secure_url" content="${imageUrl}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content="${url}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${imageUrl}" />
      <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    `;
  } catch (e) {
    console.error('[SEO Generator] Error generating dealer SEO:', e);
    return '';
  }
}

export async function generateVehicleSeo(vehicleId: string): Promise<string> {
  try {
    const carDoc = await db.collection('listings').doc(vehicleId).get();
    if (!carDoc.exists) {
      return '';
    }
    const car = carDoc.data() as any;

    const title = `${car.make} ${car.model} ${car.year} for sale | Bazar360 Online`;
    const formattedPrice = car.price ? `PKR ${(car.price / 100000).toFixed(1)} Lakh` : 'Inquire Price';
    const description = `For Sale: ${car.title || `${car.make} ${car.model}`} (${car.year}) - ${formattedPrice}. ${car.condition || 'Used'} condition. Direct WhatsApp connection on Bazar360.online.`;
    
    // Vehicle shares prioritize Main/Full vehicle picture
    const rawImage = car.imageUrl || (car.images && car.images[0]);
    const imageUrl = ensureAbsoluteUrl(rawImage);
    const url = `https://bazar360.online/vehicle/${vehicleId}`;

    return `
      <title>${title}</title>
      <meta name="description" content="${description}" />
      <meta property="og:site_name" content="Bazar360 Online" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:image:secure_url" content="${imageUrl}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content="${url}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${imageUrl}" />
    `;
  } catch (e) {
    console.error('[SEO Generator] Error generating vehicle SEO:', e);
    return '';
  }
}

