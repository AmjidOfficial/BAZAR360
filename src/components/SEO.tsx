import React, { useEffect } from 'react';
import { CarListing, Dealer } from '../types.ts';

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

    // 2. FAQ Schema (Entity & LSI Keyword Rich)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://bazar360.online/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I purchase verified cars in Peshawar via Bazar360?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Browse our certified partner showrooms on Bazar360, check official inspection PDFs, request high-definition media portfolios, and initiate WhatsApp bargains directly with the showroom owner without intermediate commission fees."
          }
        },
        {
          "@type": "Question",
          "name": "What is the dynamic bargain engine on Bazar360?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The dynamic bargain system allows registered buyers and sellers to negotiate vehicle prices in real-time in Pakistani Rupees (PKR) or United States Dollars (USD) mode, establishing formal leads on the marketplace."
          }
        },
        {
          "@type": "Question",
          "name": "How can dealerships register on Bazar360?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dealers can register via our Multi-Role Registration Portal, customize their theme branding (Cosmic Slate, Emerald Velvet, Golden Crown, Arctic Bone), generate physical QR code hang-tags, and upload complete stock lists."
          }
        }
      ]
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

    // LocalBusiness (AutoDealer) Schema
    if ((type === 'business' || type === 'both') && dealer) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "@id": `https://bazar360.online/dealer/${dealer.id}`,
        "name": dealer.name,
        "image": dealer.coverImage || dealer.avatarUrl || 'https://bazar360.online/logo_new.png',
        "telephone": dealer.phone || dealer.whatsapp || "+92 314 3600000",
        "url": dealer.socials?.website || `https://bazar360.online/dealer/${dealer.id}`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": dealer.location,
          "addressLocality": dealer.location.split(',').pop()?.trim() || "Peshawar",
          "addressRegion": dealer.location.split(',')[1]?.trim() || "KPK",
          "addressCountry": "PK"
        },
        "description": dealer.description || dealer.subtitle,
        "priceRange": "$$$",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "34.0151",
          "longitude": "71.5249"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": dealer.rating || 4.9,
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": dealer.vehiclesCount || 15
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
        "image": vehicle.imageUrl || vehicle.images?.[0],
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
          "url": `https://bazar360.online/vehicle/${vehicle.id}`
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
      
      finalTitle = `${intentPhrase} | ${vehicle.make} ${vehicle.model} ${vehicle.year} - Auto Choice`;
      finalDesc = `Looking to ${intentPhrase}? Browse ${vehicle.title} (${vehicle.year}) in pristine condition for sale. Features: ${vehicle.fuelType}, ${vehicle.transmission} transmission, ${vehicle.mileage} km. Direct WhatsApp connect with zero showroom commission.`;
      finalImage = vehicle.imageUrl || (vehicle.images && vehicle.images[0]) || 'https://bazar360.online/favicon.png';
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
      
      finalTitle = `${intentPhrase} | Verified Showroom Hub - Auto Choice`;
      finalDesc = `Looking to ${intentPhrase}? Explore their collection of verified pre-owned cars, hybrid vehicle inventories, and premium vehicles. Direct dealer connection and instant WhatsApp bargains on Bazar360.`;
      finalImage = dealer.coverImage || dealer.avatarUrl || 'https://bazar360.online/favicon.png';
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
      
      finalTitle = `${intentPhrase} | ${vehicle.title} - Auto Choice`;
      finalDesc = `Get the best deal to ${intentPhrase}! Available for PKR ${vehicle.price.toLocaleString()} on Bazar360. Check specifications, verify documents, and initiate WhatsApp negotiations directly.`;
      finalImage = vehicle.imageUrl || (vehicle.images && vehicle.images[0]) || dealer.coverImage || 'https://bazar360.online/favicon.png';
      finalUrl = `https://bazar360.online/dealers/${dealer.id}/listings/${vehicle.id}`;

      document.title = finalTitle;
      if (descMeta) {
        descMeta.setAttribute('content', finalDesc);
      } else {
        setMetaTag('name', 'description', finalDesc, 'bazar360-seo-desc');
      }
    }

    // Inject OpenGraph Meta Tags
    setMetaTag('property', 'og:title', finalTitle, 'seo-og-title');
    setMetaTag('property', 'og:description', finalDesc, 'seo-og-desc');
    setMetaTag('property', 'og:image', finalImage, 'seo-og-image');
    setMetaTag('property', 'og:image:secure_url', finalImage, 'seo-og-image-secure');
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
    setMetaTag('name', 'twitter:image', finalImage, 'seo-tw-image');
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
