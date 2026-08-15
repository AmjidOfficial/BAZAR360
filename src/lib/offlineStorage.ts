import { CarListing } from '../types';

const RECENT_VIEWS_KEY = 'bazar360_recent_views';
const IMAGE_CACHE_NAME = 'bazar360-images-v2';

/**
 * Pre-cache vehicle images (main imageUrl and additional images array) into the Service Worker cache
 * so they remain completely available when the device is offline.
 */
export async function precacheCarImages(car: CarListing): Promise<void> {
  if (!car) return;
  
  const urlsToCache: string[] = [];
  if (car.imageUrl && typeof car.imageUrl === 'string') {
    urlsToCache.push(car.imageUrl);
  }
  if (Array.isArray(car.images)) {
    car.images.forEach(img => {
      if (img && typeof img === 'string' && !urlsToCache.includes(img)) {
        urlsToCache.push(img);
      }
    });
  }

  if (urlsToCache.length === 0 || !('caches' in window)) return;

  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    for (const url of urlsToCache) {
      try {
        const existing = await cache.match(url);
        if (!existing) {
          // Fetch and store in image cache
          const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
          if (res.ok || res.type === 'opaque') {
            await cache.put(url, res);
          }
        }
      } catch (err) {
        // Ignore single image pre-cache errors (e.g., CORS restrictions)
      }
    }
  } catch (err) {
    console.warn('[OfflineStorage] Cache open warning:', err);
  }
}

/**
 * Get recently viewed cars from localStorage offline storage.
 */
export function getRecentViewsOffline(): CarListing[] {
  try {
    const raw = localStorage.getItem(RECENT_VIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save a vehicle listing to the offline-first recently viewed list in localStorage
 * and aggressively pre-cache its images in Service Worker cache.
 */
export function saveRecentViewOffline(car: CarListing): CarListing[] {
  if (!car || !car.id) return getRecentViewsOffline();

  try {
    const current = getRecentViewsOffline();
    const filtered = current.filter((c) => c.id !== car.id);
    const updated = [car, ...filtered].slice(0, 20); // Maintain top 20 recent views
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(updated));

    // Precache images in background
    precacheCarImages(car).catch(() => {});

    return updated;
  } catch (err) {
    console.warn('[OfflineStorage] Failed to save recent view:', err);
    return getRecentViewsOffline();
  }
}
