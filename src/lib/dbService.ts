import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { CarListing, Dealer, Review, Lead, SocialMedia, ServiceBooking, Conversation, DirectMessage, UserNotification, DetailedReview } from '../types';
import { validateLead } from './leadValidator';

import { toast } from 'react-hot-toast';
import { uploadBase64ToCloudinary } from './cloudinaryService';
import { fetchListingById, fetchInventoryPage, fetchLatestPublishedInventory } from './inventoryRepository';

// Standard User Profiles
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  city?: string;
  state?: string;
  role: 'Admin' | 'Showroom Owner' | 'Individual User' | 'Visitor' | 'Sales Rep' | 'Private Seller' | 'Buyer' | 'Dealer' | 'Sales Representative' | 'Super Admin';
  associatedShowroomId?: string;
  status: 'Active' | 'Pending Approval' | 'Suspended' | 'Pending' | 'Email Verified' | 'Blocked' | 'Deleted';
  socials?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  socialMedia?: SocialMedia;
  createdAt: string;
  lastLogin: string;
  updatedAt: string;
  region?: string;
  salesPodId?: string;
  dealerId?: string;
  logoUrl?: string;
  profilePhoto?: string;
  photoURL?: string;
  coverImage?: string;
  gender?: string;
  dob?: string;
  country?: string;
  province?: string;
  address?: string;
  bio?: string;
  acceptedTerms?: boolean;
  preferredLanguage?: 'en' | 'ur';
  preferredTheme?: 'light' | 'dark';
  whatsappNumber?: string;
  cnic?: string;
  postalCode?: string;
  occupation?: string;
  notificationSettings?: { emailAlerts?: boolean; smsAlerts?: boolean; whatsappAlerts?: boolean };
  privacySettings?: { showPhonePublicly?: boolean; showEmailPublicly?: boolean };
  githubRepoUrl?: string;
  githubUsername?: string;
  adminContactEmail?: string;
  githubConnected?: boolean;
  webAuthnCredentialId?: string;
  biometricRegisteredAt?: string;
}

const DEALERS_COLLECTION = 'dealers';
const LISTINGS_COLLECTION = 'listings';
const USERS_COLLECTION = 'users';

// Seed Database helper (Clean No-Op in Production)
export async function seedDatabaseIfEmpty(): Promise<void> {
  return Promise.resolve();
}

// Memory cache for dealers and listings to enable instantaneous showroom opening
let cachedDealers: Dealer[] | null = null;
let cachedListings: CarListing[] | null = null;

export function dbInvalidateCache() {
  cachedDealers = null;
  cachedListings = null;
}

// 1. Fetch Dealers
export async function dbFetchDealers(forceRefresh = true): Promise<Dealer[]> {
  if (!forceRefresh && cachedDealers) return cachedDealers;
  try {
    const snap = await getDocs(query(collection(db, DEALERS_COLLECTION), limit(100)));
    const list: Dealer[] = snap.docs.map((dealerDoc) => {
      const data = dealerDoc.data();
      const logoUrl = typeof data.logoUrl === 'string' ? data.logoUrl : undefined;
      const avatarUrl = typeof data.avatarUrl === 'string' ? data.avatarUrl : logoUrl;
      return {
        ...data,
        id: dealerDoc.id,
        name: typeof data.name === 'string' ? data.name : '',
        avatarLetter: typeof data.avatarLetter === 'string' ? data.avatarLetter : (typeof data.name === 'string' && data.name ? data.name.substring(0, 2).toUpperCase() : 'D'),
        avatarUrl,
        logo: typeof data.logo === 'string' ? data.logo : logoUrl,
        logoUrl,
        subtitle: typeof data.subtitle === 'string' ? data.subtitle : '',
        location: typeof data.location === 'string' ? data.location : '',
        rating: typeof data.rating === 'number' ? data.rating : 0,
        vehiclesCount: typeof data.vehiclesCount === 'number' ? data.vehiclesCount : 0,
        followersCount: typeof data.followersCount === 'string' || typeof data.followersCount === 'number' ? data.followersCount : '0',
        coverImage: typeof data.coverImage === 'string' ? data.coverImage : undefined,
        description: typeof data.description === 'string' ? data.description : '',
        phone: typeof data.phone === 'string' ? data.phone : '',
        whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : '',
        socials: data.socials || {},
        activityFeed: Array.isArray(data.activityFeed) ? data.activityFeed : []
      } as Dealer;
    });
    cachedDealers = list;
    return list;
  } catch (err) {
    console.error('dbFetchDealers Error:', err);
    return [];
  }
}

// 2. Canonical marketplace reads. Listing identity and factual fields come only from Firestore.
export async function dbFetchListingById(id: string): Promise<CarListing | null> {
  return fetchListingById(id);
}

export async function dbFetchListings(forceRefresh = true): Promise<CarListing[]> {
  if (!forceRefresh && cachedListings) return cachedListings;
  try {
    const latestListings = await fetchLatestPublishedInventory(48);
    cachedListings = latestListings;
    return cachedListings;
  } catch (err) {
    console.error('dbFetchListings Error:', err);
    return [];
  }
}

export async function dbFetchListingsPaginated(lastDocSnap?: any, limitCount: number = 24): Promise<{ listings: CarListing[], lastVisible: any }> {
  try {
    const page = await fetchInventoryPage(limitCount, lastDocSnap || null);
    return { listings: page.listings, lastVisible: page.lastVisible };
  } catch (err) {
    console.error('dbFetchListingsPaginated Error:', err);
    return { listings: [], lastVisible: null };
  }
}

// Helper to recursively remove undefined fields and sanitize raw base64 data strings from Firestore payloads to satisfy 1MB doc limits
function cleanPayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('data:') && obj.length > 5000) {
      console.warn('[cleanPayload] Stripped raw base64 data URL from payload to protect Firestore 1MB document limit.');
      return '' as any;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanPayload(item)).filter(item => item !== undefined) as any;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val !== undefined) cleaned[key] = cleanPayload(val);
    }
    return cleaned;
  }
  return obj;
}
