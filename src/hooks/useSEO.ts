import { useEffect } from 'react';
import { CarListing, Dealer } from '../types';

export interface UseSEOOptions {
  view?: string;
  vehicle?: CarListing;
  dealer?: Dealer;
  searchQuery?: string;
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
  canonicalUrl?: string;
}

export function useSEO({
  view = 'home',
  vehicle,
  dealer,
  searchQuery,
  customTitle,
  customDescription,
  customImage,
  canonicalUrl
}: UseSEOOptions) {
  useEffect(() => {
    // 1. Determine title and description based on view context
    let title = customTitle || 'Bazar360.online | Pakistan\'s Premier Automotive Marketplace & Showroom Hub';
    let description = customDescription || 'Discover verified pre-owned cars, elite showrooms in Peshawar and across Pakistan, professional auto inspection services, and zero-commission direct deals on Bazar360.';
    let imageUrl = customImage || 'https://bazar360.online/logo_new.png';
    let currentUrl = canonicalUrl || window.location.href;

    if (view === 'vehicle' && vehicle) {
      const city = vehicle.location || vehicle.region || 'Peshawar';
      const categoryKeyword = vehicle.fuelType === 'Hybrid' ? 'Hybrid Car' : vehicle.fuelType === 'Electric' ? 'Electric Car' : 'Car';
      title = `Buy ${vehicle.condition} ${vehicle.make} ${vehicle.model} ${vehicle.year} in ${city} | Bazar360`;
      description = `Looking to buy ${vehicle.title} (${vehicle.year}) in ${city}? Price: PKR ${vehicle.price.toLocaleString()}. Specs: ${vehicle.engineCC}CC, ${vehicle.transmission}, ${vehicle.fuelType}, ${vehicle.mileage} km. Verified documents & direct WhatsApp connect with zero commission.`;
      if (vehicle.imageUrl || (vehicle.images && vehicle.images[0])) {
        imageUrl = vehicle.imageUrl || vehicle.images[0];
      }
    } else if (view === 'showroom' && dealer) {
      title = `${dealer.name} - Verified Showroom in ${dealer.location || 'Peshawar'} | Bazar360`;
      description = `Explore verified automotive fleet and elite showroom stock at ${dealer.name} located in ${dealer.location || 'Peshawar'}. Rating: ${dealer.rating}/5. Direct contact & verified dealer accreditation.`;
      if (dealer.coverImage || dealer.logo || dealer.avatarUrl) {
        imageUrl = dealer.coverImage || dealer.logo || dealer.avatarUrl || imageUrl;
      }
    } else if (view === 'search') {
      const queryText = searchQuery ? ` for "${searchQuery}"` : '';
      title = `Search Verified Cars & Showrooms${queryText} | Bazar360 Auto Choice`;
      description = `Browse verified automotive inventory${queryText} across Pakistan with multi-point inspection reports, transparent pricing, and secure direct dealer communication on Bazar360.`;
    } else if (view === 'services') {
      title = `Specialized Auto Inspection & Maintenance Services | Bazar360`;
      description = `Book professional vehicle inspection, ceramic coating, detailing, tuning, and excise registration services with verified workshop technicians in Peshawar.`;
    } else if (view === 'showrooms') {
      title = `Flagship Showroom Directory & Verified Dealerships | Bazar360`;
      description = `Explore accredited automobile showrooms, verified dealer profiles, inventory showcases, and direct contact portals across Pakistan.`;
    }

    // 2. Update Document Title
    document.title = title;

    // 3. Update or create Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 4. Update OpenGraph Tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: view === 'vehicle' ? 'product' : 'website' },
      { property: 'og:site_name', content: 'Bazar360 Marketplace' },
      { property: 'twitter:card', content: 'summary_large_image' },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: description },
      { property: 'twitter:image', content: imageUrl },
      { name: 'geo.region', content: 'PK-PK' },
      { name: 'geo.placename', content: vehicle?.location || dealer?.location || 'Peshawar' },
      { name: 'geo.position', content: '34.0151;71.5249' },
      { name: 'ICBM', content: '34.0151, 71.5249' }
    ];

    ogTags.forEach(tag => {
      const attrKey = tag.property ? 'property' : 'name';
      const attrVal = tag.property || tag.name;
      let el = document.querySelector(`meta[${attrKey}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrKey, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', tag.content);
    });

    // 5. Update Canonical Link
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', currentUrl);

    // 6. Inject Structured JSON-LD Data for AEO / GEO
    let jsonLdEl = document.getElementById('bazar360-dynamic-json-ld') as HTMLScriptElement | null;
    if (!jsonLdEl) {
      jsonLdEl = document.createElement('script');
      jsonLdEl.id = 'bazar360-dynamic-json-ld';
      jsonLdEl.type = 'application/ld+json';
      document.head.appendChild(jsonLdEl);
    }

    let structuredData: any = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bazar360.online",
      "url": "https://bazar360.online",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://bazar360.online/?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    if (view === 'vehicle' && vehicle) {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Car",
        "name": vehicle.title,
        "model": vehicle.model,
        "brand": {
          "@type": "Brand",
          "name": vehicle.make
        },
        "vehicleConfiguration": vehicle.fuelType,
        "vehicleTransmission": vehicle.transmission,
        "mileageFromOdometer": {
          "@type": "QuantitativeValue",
          "value": vehicle.mileage,
          "unitCode": "KMT"
        },
        "itemCondition": vehicle.condition === 'New' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
        "offers": {
          "@type": "Offer",
          "priceCurrency": "PKR",
          "price": vehicle.price,
          "availability": vehicle.status === 'Sold' ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
          "seller": {
            "@type": "AutoDealer",
            "name": vehicle.sellerName || "Bazar360 Verified Partner"
          }
        },
        "image": imageUrl,
        "description": vehicle.description
      };
    } else if (view === 'showroom' && dealer) {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "name": dealer.name,
        "image": imageUrl,
        "telephone": dealer.phone || dealer.whatsapp,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": dealer.location || "Peshawar",
          "addressLocality": "Peshawar",
          "addressCountry": "PK"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": dealer.rating || 4.8,
          "reviewCount": dealer.vehiclesCount || 15
        }
      };
    }

    jsonLdEl.textContent = JSON.stringify(structuredData);

  }, [view, vehicle, dealer, searchQuery, customTitle, customDescription, customImage, canonicalUrl]);
}
