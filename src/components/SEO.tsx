import React, { useEffect } from 'react';
import { CarListing, Dealer } from '../types.ts';
import { getOptimizedUrl } from '../lib/cloudinaryService';
import { CENTRAL_FAQS } from '../data/faqs';

/**
 * Next.js-compatible metadata function to dynamically generate OpenGraph and Twitter cards
 * for individual vehicle listings using Cloudinary-optimized images.
 */
export async function generateMetadata({ vehicle, dealer }: { vehicle?: CarListing; dealer?: Dealer }) {
  if (!vehicle) return {};

  const rawLoc = dealer?.location || "Peshawar";
  const city = rawLoc.split(',')[0]?.trim() || "Peshawar";
  const categoryKeyword = vehicle.fuelType === 'Hybrid' ? 'Hybrid Car' : vehicle.fuelType === 'Electric' ? 'Electric Car' : 'Car';
  const intentPhrase = `Buy ${vehicle.condition} ${categoryKeyword} in ${city}`;

  const finalTitle = `${intentPhrase} | ${vehicle.make} ${vehicle.model} ${vehicle.year} - Auto Choice`;
  const finalDesc = `Looking to ${intentPhrase}? Browse ${vehicle.title} (${vehicle.year}) in pristine condition for sale. Features: ${vehicle.fuelType}, ${vehicle.transmission} transmission, ${vehicle.mileage} km. Direct WhatsApp connect with zero showroom commission.`;
  
  const baseImage = vehicle.imageUrl || (vehicle.images && vehicle.images[0]) || 'https://bazar360.online/favicon.png';
  const ogImage = getOptimizedUrl(baseImage, { width: 1200, height: 630, crop: 'fill', quality: 'auto' });
  const twitterImage = getOptimizedUrl(baseImage, { width: 600, height: 600, crop: 'fill', quality: 'auto' });

  return {
    title: finalTitle,
    description: finalDesc,
    openGraph: {
      title: finalTitle,
      description: finalDesc,
      url: `https://bazar360.online/vehicle/${vehicle.id}`,
      siteName: 'Auto Choice',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: vehicle.title,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDesc,
      images: [twitterImage],
      site: '@AutoChoice',
      creator: '@AutoChoice',
    }
  };
}

interface SEOProps {
  type: 'vehicle' | 'business' | 'both' | 'sitemap';
  vehicle?: CarListing;
  dealer?: Dealer;
  dealers?: Dealer[];
  listings?: CarListing[];
}

export const SEO: React.FC<SEOProps> = ({ type, vehicle, dealer, dealers, listings }) => {
  useEffect(() => {
    if (type === 'sitemap') {
      const activeDealers = dealers || [];
      const activeListings = listings || [];

      // Generate XML Sitemap
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

      // Static routes
      const staticPages = [
        { loc: 'https://bazar360.online/', changefreq: 'daily', priority: '1.0' },
        { loc: 'https://bazar360.online/search', changefreq: 'daily', priority: '0.9' },
        { loc: 'https://bazar360.online/dealers', changefreq: 'weekly', priority: '0.8' },
        { loc: 'https://bazar360.online/contact', changefreq: 'monthly', priority: '0.5' }
      ];

      staticPages.forEach(p => {
        xml += `  <url>\n`;
        xml += `    <loc>${p.loc}</loc>\n`;
        xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
        xml += `    <priority>${p.priority}</priority>\n`;
        xml += `  </url>\n`;
      });

      // Showrooms / Dealers
      activeDealers.forEach(d => {
        xml += `  <url>\n`;
        xml += `    <loc>https://bazar360.online/dealers/${d.id}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.85</priority>\n`;
        xml += `  </url>\n`;
      });

      // Listings / Vehicle postings
      activeListings.forEach(l => {
        xml += `  <url>\n`;
        xml += `    <loc>https://bazar360.online/vehicle/${l.id}</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.75</priority>\n`;
        xml += `  </url>\n`;
      });

      xml += `</urlset>`;

      // Expose sitemap on window
      (window as any).bazar360SitemapXML = xml;
      (window as any).bazar360DownloadSitemap = () => {
        const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "sitemap.xml");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("[SEO Sitemap] Dynamic XML sitemap downloaded successfully.");
      };

      // Set sitemap link in head if it doesn't exist
      let linkTag = document.getElementById('bazar360-sitemap-head-link') as HTMLLinkElement;
      if (!linkTag) {
        linkTag = document.createElement('link');
        linkTag.id = 'bazar360-sitemap-head-link';
        linkTag.rel = 'sitemap';
        linkTag.type = 'application/xml';
        linkTag.title = 'Sitemap';
        linkTag.href = '/sitemap.xml';
        document.head.appendChild(linkTag);
      }

      // Metadata showing page count
      let metaTag = document.getElementById('bazar360-sitemap-meta') as HTMLMetaElement;
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.id = 'bazar360-sitemap-meta';
        metaTag.name = 'sitemap-info';
        document.head.appendChild(metaTag);
      }
      metaTag.content = `dealers: ${activeDealers.length}, listings: ${activeListings.length}`;

      return () => {
        const headLink = document.getElementById('bazar360-sitemap-head-link');
        if (headLink) headLink.remove();
        const infoMeta = document.getElementById('bazar360-sitemap-meta');
        if (infoMeta) infoMeta.remove();
      };
    }

    const schemas: any[] = [];

    // 1. Organization Schema (Global Brand)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://bazar360.online/#organization",
      "name": "Bazar360 Marketplace",
      "url": "https://bazar360.online",
      "logo": "https://bazar360.online/logo_new.png",
      "description": "Pakistan's premium decentralized automotive marketplace and verified showroom hub, connecting buyers directly to certified dealerships.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+92-314-9198403",
        "contactType": "customer service",
        "areaServed": "PK",
        "availableLanguage": ["English", "Urdu"]
      },
      "sameAs": [
        "https://www.facebook.com/bazar360",
        "https://www.linkedin.com/company/bazar360"
      ]
    });

    // 2. FAQ Schema (Entity & LSI Keyword Rich - Dynamic from Central Source)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://bazar360.online/#faq",
      "mainEntity": CENTRAL_FAQS.map(faq => ({
        "@type": "Question",
        "name": faq.questionEn,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answerEn
        }
      }))
    });

    // 3. Breadcrumb Schema (Paths mapping)
    const breadcrumbList: any[] = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://bazar360.online"
      }
    ];

    if (dealer) {
      breadcrumbList.push({
        "@type": "ListItem",
        "position": 2,
        "name": "Showrooms",
        "item": "https://bazar360.online/dealers"
      });
      breadcrumbList.push({
        "@type": "ListItem",
        "position": 3,
        "name": dealer.name,
        "item": `https://bazar360.online/dealers/${dealer.id}`
      });
      if (vehicle) {
        breadcrumbList.push({
          "@type": "ListItem",
          "position": 4,
          "name": vehicle.title,
          "item": `https://bazar360.online/dealers/${dealer.id}/listings/${vehicle.id}`
        });
      }
    } else if (vehicle) {
      breadcrumbList.push({
        "@type": "ListItem",
        "position": 2,
        "name": "Inventory",
        "item": "https://bazar360.online/search"
      });
      breadcrumbList.push({
        "@type": "ListItem",
        "position": 3,
        "name": vehicle.title,
        "item": `https://bazar360.online/vehicle/${vehicle.id}`
      });
    }

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbList
    });

    const activeDealer = dealer || dealers?.find(d => d.id === vehicle?.dealerId);

    // LocalBusiness (AutoDealer) Schema
    if ((type === 'business' || type === 'both') && activeDealer) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "@id": `https://bazar360.online/dealer/${activeDealer.id}`,
        "name": activeDealer.name,
        "image": activeDealer.coverImage || activeDealer.avatarUrl || 'https://bazar360.online/logo_new.png',
        "telephone": activeDealer.phone || activeDealer.whatsapp || "+92 314 3600000",
        "url": activeDealer.socials?.website || `https://bazar360.online/dealer/${activeDealer.id}`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": activeDealer.location,
          "addressLocality": activeDealer.location.split(',').pop()?.trim() || "Peshawar",
          "addressRegion": activeDealer.location.split(',')[1]?.trim() || "KPK",
          "addressCountry": "PK"
        },
        "description": activeDealer.description || activeDealer.subtitle,
        "priceRange": "$$$",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "34.0151",
          "longitude": "71.5249"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": activeDealer.rating || 4.9,
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": activeDealer.vehiclesCount || 15
        }
      });
    }

    // Vehicle Schema
    if ((type === 'vehicle' || type === 'both') && vehicle) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Vehicle",
        "@id": `https://bazar360.online/vehicle/${vehicle.id}`,
        "name": vehicle.title,
        "image": getOptimizedUrl(vehicle.imageUrl || vehicle.images?.[0] || 'https://bazar360.online/favicon.png', { width: 1200, height: 630, crop: 'fill', quality: 'auto' }),
        "description": vehicle.description,
        "brand": {
          "@type": "Brand",
          "name": vehicle.make
        },
        "model": vehicle.model,
        "vehicleModelDate": vehicle.year,
        "fuelType": vehicle.fuelType,
        "vehicleTransmission": vehicle.transmission,
        "vehicleEngine": {
          "@type": "EngineSpecification",
          "engineDisplacement": vehicle.engineCC ? `${vehicle.engineCC} cc` : vehicle.specs?.engineSize || "1800 cc"
        },
        "mileageFromOdometer": {
          "@type": "QuantitativeValue",
          "value": vehicle.mileage,
          "unitText": "km"
        },
        "color": vehicle.specs?.color || vehicle.exteriorColor || "White",
        "offers": {
          "@type": "Offer",
          "priceCurrency": "PKR",
          "price": vehicle.price,
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": vehicle.price,
            "priceCurrency": "PKR",
            "valueAddedTaxIncluded": true
          },
          "itemCondition": vehicle.condition === 'New' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
          "availability": vehicle.isSold ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          "url": `https://bazar360.online/vehicle/${vehicle.id}`,
          "seller": activeDealer ? {
            "@type": "AutoDealer",
            "name": activeDealer.name,
            "telephone": activeDealer.phone || activeDealer.whatsapp || "+92 314 3600000",
            "url": `https://bazar360.online/dealers/${activeDealer.id}`,
            "image": activeDealer.avatarUrl || 'https://bazar360.online/logo_new.png'
          } : {
            "@type": "Organization",
            "name": "Bazar360 Certified Dealer Network",
            "url": "https://bazar360.online"
          }
        }
      });
    }

    if (schemas.length === 0) return;

    // Remove any existing script injection to prevent duplicates
    const oldScript = document.getElementById('bazar360-seo-jsonld');
    if (oldScript) {
      oldScript.remove();
    }

    // Create and configure script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'bazar360-seo-jsonld';
    script.text = JSON.stringify(schemas, null, 2);
    
    // Append to head
    document.head.appendChild(script);

    // Dynamic Title & Meta tags injection
    const oldTitle = document.title;
    let oldDesc = '';
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      oldDesc = descMeta.getAttribute('content') || '';
    }

    const setMetaTag = (attrName: string, attrVal: string, contentVal: string, elementId: string) => {
      let meta = document.getElementById(elementId);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('id', elementId);
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', contentVal);
    };

    let finalTitle = 'Auto Choice - Peshawar\'s Premier Automotive Showroom Partner';
    let finalDesc = 'Find pre-owned cars, verified vehicle listings, and certified hybrid vehicle inventories on Bazar360 Pakistan. Direct dealer WhatsApp connect with zero commission.';
    let finalImage = 'https://bazar360.online/favicon.png';
    let finalUrl = 'https://bazar360.online';

    if (type === 'vehicle' && vehicle) {
      const matchedDealer = dealer || dealers?.find(d => d.id === vehicle.dealerId);
      const rawLoc = matchedDealer?.location || "Peshawar";
      const city = rawLoc.split(',')[0]?.trim() || "Peshawar";
      
      // Determine dynamic intent keyword base
      const categoryKeyword = vehicle.fuelType === 'Hybrid' ? 'Hybrid Car' : vehicle.fuelType === 'Electric' ? 'Electric Car' : 'Car';
      const intentPhrase = `Buy ${vehicle.condition} ${categoryKeyword} in ${city}`;
      
      finalTitle = `${intentPhrase} | ${vehicle.make} ${vehicle.model} ${vehicle.year} - Bazar360`;
      finalDesc = `Looking to ${intentPhrase}? Browse ${vehicle.title} (${vehicle.year}) in pristine condition for sale. Features: ${vehicle.fuelType}, ${vehicle.transmission} transmission, ${vehicle.mileage} km. Direct WhatsApp connect with zero showroom commission.`;
      const rawVehImg = vehicle.imageUrl || (vehicle.images && vehicle.images[0]) || 'https://bazar360.online/auto_choice_logo_dark.jpg';
      finalImage = rawVehImg.startsWith('http') ? rawVehImg : `https://bazar360.online/${rawVehImg.replace(/^\//, '')}`;
      finalUrl = `https://bazar360.online/vehicle/${vehicle.id}`;

      document.title = finalTitle;
      if (descMeta) {
        descMeta.setAttribute('content', finalDesc);
      } else {
        setMetaTag('name', 'description', finalDesc, 'bazar360-seo-desc');
      }
    } else if (type === 'business' && dealer) {
      const rawLoc = dealer.location || "Peshawar";
      const city = rawLoc.split(',')[0]?.trim() || "Peshawar";
      
      // High-intent localized showroom keyword
      const intentPhrase = `Buy Used Cars in ${city} from ${dealer.name}`;
      
      finalTitle = `${dealer.name} - Verified Showroom | Bazar360 Online`;
      finalDesc = `Looking to ${intentPhrase}? Explore their collection of verified pre-owned cars, hybrid vehicle inventories, and premium vehicles. Direct dealer connection and instant WhatsApp bargains on Bazar360.`;
      const rawLogoImg = dealer.logoUrl || dealer.logo || dealer.avatarUrl || dealer.coverImage || 'https://bazar360.online/auto_choice_logo_dark.jpg';
      finalImage = rawLogoImg.startsWith('http') ? rawLogoImg : `https://bazar360.online/${rawLogoImg.replace(/^\//, '')}`;
      finalUrl = `https://bazar360.online/dealers/${dealer.id}`;

      document.title = finalTitle;
      if (descMeta) {
        descMeta.setAttribute('content', finalDesc);
      } else {
        setMetaTag('name', 'description', finalDesc, 'bazar360-seo-desc');
      }
    } else if (type === 'both' && dealer && vehicle) {
      const rawLoc = dealer.location || "Peshawar";
      const city = rawLoc.split(',')[0]?.trim() || "Peshawar";
      
      const categoryKeyword = vehicle.fuelType === 'Hybrid' ? 'Hybrid Car' : 'Car';
      const intentPhrase = `Buy ${vehicle.condition} ${categoryKeyword} in ${city} at ${dealer.name}`;
      
      finalTitle = `${intentPhrase} | ${vehicle.title} - Bazar360`;
      finalDesc = `Get the best deal to ${intentPhrase}! Available for PKR ${vehicle.price.toLocaleString()} on Bazar360. Check specifications, verify documents, and initiate WhatsApp negotiations directly.`;
      const rawBothImg = vehicle.imageUrl || (vehicle.images && vehicle.images[0]) || dealer.logoUrl || dealer.logo || 'https://bazar360.online/auto_choice_logo_dark.jpg';
      finalImage = rawBothImg.startsWith('http') ? rawBothImg : `https://bazar360.online/${rawBothImg.replace(/^\//, '')}`;
      finalUrl = `https://bazar360.online/dealers/${dealer.id}/listings/${vehicle.id}`;

      document.title = finalTitle;
      if (descMeta) {
        descMeta.setAttribute('content', finalDesc);
      } else {
        setMetaTag('name', 'description', finalDesc, 'bazar360-seo-desc');
      }
    }

    // Generate optimized Cloudinary images specifically for OpenGraph and Twitter cards
    const ogImage = finalImage ? getOptimizedUrl(finalImage, { width: 1200, height: 630, crop: 'fill', quality: 'auto' }) : '';
    const twImage = finalImage ? getOptimizedUrl(finalImage, { width: 600, height: 600, crop: 'fill', quality: 'auto' }) : '';

    // Inject OpenGraph Meta Tags
    setMetaTag('property', 'og:title', finalTitle, 'seo-og-title');
    setMetaTag('property', 'og:description', finalDesc, 'seo-og-desc');
    setMetaTag('property', 'og:image', ogImage, 'seo-og-image');
    setMetaTag('property', 'og:image:secure_url', ogImage, 'seo-og-image-secure');
    setMetaTag('property', 'og:image:width', '1200', 'seo-og-image-width');
    setMetaTag('property', 'og:image:height', '630', 'seo-og-image-height');
    setMetaTag('property', 'og:image:type', 'image/jpeg', 'seo-og-image-type');
    setMetaTag('property', 'og:url', finalUrl, 'seo-og-url');
    setMetaTag('property', 'og:type', 'website', 'seo-og-type');
    setMetaTag('property', 'og:site_name', 'Auto Choice', 'seo-og-site');
    setMetaTag('property', 'og:locale', 'en_US', 'seo-og-locale');
 
    // Inject Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image', 'seo-tw-card');
    setMetaTag('name', 'twitter:title', finalTitle, 'seo-tw-title');
    setMetaTag('name', 'twitter:description', finalDesc, 'seo-tw-desc');
    setMetaTag('name', 'twitter:image', twImage, 'seo-tw-image');
    setMetaTag('name', 'twitter:site', '@AutoChoice', 'seo-tw-site');
    setMetaTag('name', 'twitter:creator', '@AutoChoice', 'seo-tw-creator');

    // Dynamic Canonical tag
    let canonicalLink = document.getElementById('bazar360-canonical') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.id = 'bazar360-canonical';
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = finalUrl;
 
    // Cleanup script and titles on unmount
    return () => {
      const existingScript = document.getElementById('bazar360-seo-jsonld');
      if (existingScript) {
        existingScript.remove();
      }
      const createdDesc = document.getElementById('bazar360-seo-desc');
      if (createdDesc) {
        createdDesc.remove();
      }
      const canonicalTag = document.getElementById('bazar360-canonical');
      if (canonicalTag) {
        canonicalTag.remove();
      }
      
      // Cleanup injected Meta tags
      [
        'seo-og-title', 'seo-og-desc', 'seo-og-image', 'seo-og-image-secure', 'seo-og-image-width', 
        'seo-og-image-height', 'seo-og-image-type', 'seo-og-url', 'seo-og-type', 'seo-og-site', 'seo-og-locale',
        'seo-tw-card', 'seo-tw-title', 'seo-tw-desc', 'seo-tw-image', 'seo-tw-site', 'seo-tw-creator'
      ].forEach(id => {
        const tag = document.getElementById(id);
        if (tag) tag.remove();
      });

      document.title = oldTitle;
      if (descMeta && oldDesc) {
        descMeta.setAttribute('content', oldDesc);
      }
    };
  }, [type, vehicle, dealer, dealers, listings]);

  return null;
};
