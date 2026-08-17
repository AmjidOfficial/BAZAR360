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
import { fetchListingById, fetchInventoryPage } from './inventoryRepository';

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
  region?: string;    // Compatibility with existing subviews
  salesPodId?: string; // Compatibility with showroom manager bindings
  dealerId?: string;   // Associated dealer / showroom ID

  // Enterprise redesign fields
  logoUrl?: string;
  profilePhoto?: string;
  photoURL?: string; // Compatibility alias
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

  notificationSettings?: {
    emailAlerts?: boolean;
    smsAlerts?: boolean;
    whatsappAlerts?: boolean;
  };
  privacySettings?: {
    showPhonePublicly?: boolean;
    showEmailPublicly?: boolean;
  };

  // Connected accounts & Repository settings
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
    const page = await fetchInventoryPage(48);
    cachedListings = page.listings;
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
    // Prevent huge base64 data URLs (> 5KB) from corrupting Firestore documents
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
      if (val !== undefined) {
        cleaned[key] = cleanPayload(val);
      }
    }
    return cleaned;
  }
  return obj;
}

// 3. Register user profile
export async function dbSaveUserProfile(profile: UserProfile): Promise<void> {
  // Safe-guarding Firestore standard writes
  if (!profile || !profile.uid || profile.uid.startsWith('usr-default')) {
    console.log('Skipping active Firestore save for standard default offline/sandbox user profiles:', profile?.uid);
    return;
  }

  // Double check authorization mismatch to satisfy strict security rules
  if (!auth.currentUser) {
    console.log('No active authenticated session inside Firebase SDK. Postponing profile update for:', profile.uid);
    return;
  }

  if (auth.currentUser.uid !== profile.uid) {
    console.log(`Preventing writing profile payload of UID (${profile.uid}) under authenticated user session of (${auth.currentUser.uid})`);
    return;
  }

  try {
    const userDocRef = doc(db, USERS_COLLECTION, profile.uid);
    const profileDocRef = doc(db, 'profiles', profile.uid);
    const timeStr = new Date().toISOString();

    // Preserve immutable createdAt date from existing document or Auth metadata
    let finalCreatedAt = profile.createdAt;
    if (!finalCreatedAt) {
      const existingUserDoc = await getDoc(userDocRef);
      if (existingUserDoc.exists() && existingUserDoc.data().createdAt) {
        finalCreatedAt = existingUserDoc.data().createdAt;
      } else if (auth.currentUser.metadata?.creationTime) {
        finalCreatedAt = new Date(auth.currentUser.metadata.creationTime).toISOString();
      } else {
        finalCreatedAt = timeStr;
      }
    }

    // Automatically offload base64 data URLs to Cloudinary
    let photoURL = profile.photoURL || profile.profilePhoto || '';
    if (photoURL.startsWith('data:')) {
      photoURL = await uploadBase64ToCloudinary(photoURL, 'bazar360_profiles');
    }

    let logoUrl = profile.logoUrl || photoURL || '';
    if (logoUrl.startsWith('data:')) {
      logoUrl = await uploadBase64ToCloudinary(logoUrl, 'bazar360_logos');
    }

    const payload = cleanPayload({
      ...profile,
      photoURL,
      profilePhoto: photoURL,
      logoUrl,
      createdAt: finalCreatedAt,
      updatedAt: timeStr
    });

    // Save to /users with merge: true
    await setDoc(userDocRef, payload, { merge: true });

    // Save to /profiles (split-collection personal details) with merge: true
    await setDoc(profileDocRef, payload, { merge: true });

    // Sync Auth profile
    if (auth.currentUser && auth.currentUser.uid === profile.uid) {
      updateProfile(auth.currentUser, {
        displayName: profile.displayName || auth.currentUser.displayName || undefined,
        photoURL: photoURL || auth.currentUser.photoURL || undefined
      }).catch(e => console.warn('Auth profile sync skipped:', e));
    }

    // Sync localStorage
    try {
      localStorage.setItem('bazar360_user', JSON.stringify(payload));
    } catch (e) {}

    // Dispatch global custom event to trigger reactive cache invalidation in all contexts/components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bazar360_profile_updated', { detail: payload }));
    }

    console.log('User profile saved successfully to Firestore /users and /profiles:', profile.uid);
    toast.success('User profile saved successfully!', { id: `profile-saved-${profile.uid}` });

    // Save to /auditLogs
    await dbSaveAuditLog({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: profile.uid,
      userName: profile.displayName || 'System User',
      userRole: profile.role || 'Individual User',
      action: 'PROFILE_UPDATE',
      details: `Profile saved/updated in Firestore collections /users and /profiles.`,
      status: 'SUCCESS',
      timestamp: timeStr
    }).catch(e => console.warn('Audit logging skipped:', e));

  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${USERS_COLLECTION}/${profile.uid}`);
  }
}

// Helper to update social links for a user and optionally their showroom
export async function updateSocialLinks(userId: string, links: SocialMedia): Promise<void> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const profileDocRef = doc(db, 'profiles', userId);
    const timeStr = new Date().toISOString();

    const payload = {
      socialMedia: links,
      updatedAt: timeStr
    };

    // Update users and profiles
    await updateDoc(userDocRef, payload).catch(e => console.warn('Could not update users document:', e));
    await updateDoc(profileDocRef, payload).catch(e => console.warn('Could not update profiles document:', e));

    // Also try to update showroom if they own one
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      if (userData.associatedShowroomId) {
        const dealerRef = doc(db, DEALERS_COLLECTION, userData.associatedShowroomId);
        await updateDoc(dealerRef, {
          socialMedia: links,
          updatedAt: timeStr
        }).catch(e => console.warn('Could not update dealer socialMedia:', e));
      }
    }
    
    // Also log audit trail
    await dbSaveAuditLog({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId,
      userName: 'User ' + userId,
      userRole: 'Individual User',
      action: 'SOCIAL_LINKS_UPDATE',
      details: `Social links updated for user ${userId}.`,
      status: 'SUCCESS',
      timestamp: timeStr
    }).catch(e => console.warn('Audit logging skipped:', e));

  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${USERS_COLLECTION}/${userId}`);
  }
}

// 4. Fetch user profile
export async function dbFetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const profileDocRef = doc(db, 'profiles', uid);

    const [snap, profileSnap] = await Promise.all([
      getDoc(userDocRef).catch(() => null),
      getDoc(profileDocRef).catch(() => null)
    ]);

    const uData = (snap && snap.exists()) ? snap.data() : {};
    const pData = (profileSnap && profileSnap.exists()) ? profileSnap.data() : {};

    if (Object.keys(uData).length > 0 || Object.keys(pData).length > 0) {
      const merged = { ...pData, ...uData } as UserProfile;
      merged.uid = uid;

      const photo = merged.photoURL || merged.profilePhoto || (merged as any).avatar || '';
      merged.photoURL = photo;
      merged.profilePhoto = photo;

      if (!merged.createdAt) {
        if (auth.currentUser && auth.currentUser.uid === uid && auth.currentUser.metadata?.creationTime) {
          merged.createdAt = new Date(auth.currentUser.metadata.creationTime).toISOString();
        }
      }

      // Update local storage cache with fetched profile
      try {
        localStorage.setItem('bazar360_user', JSON.stringify(merged));
      } catch (e) {}

      return merged;
    }
  } catch (err) {
    console.warn(`Could not fetch profile for user ${uid} from Firestore, attempting local cache...`, err);
  }

  // Fallback to local storage cache if Firestore document is missing or network unavailable
  try {
    const stored = localStorage.getItem('bazar360_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && (parsed.uid === uid || !parsed.uid)) {
        return parsed as UserProfile;
      }
    }
  } catch (e) {}

  return null;
}

// 5. Create Dealership Programmatically
export async function dbRegisterDealership(dealer: Omit<Dealer, 'activityFeed'>): Promise<void> {
  try {
    let logoUrl = dealer.logoUrl || dealer.logo || '';
    let logo = dealer.logo || dealer.logoUrl || '';

    // Automatically offload base64 data URLs to Cloudinary
    if (logoUrl.startsWith('data:')) {
      logoUrl = await uploadBase64ToCloudinary(logoUrl, 'bazar360_logos');
      logo = logoUrl;
    }

    const payload = cleanPayload({
      ...dealer,
      logoUrl,
      logo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await setDoc(doc(db, DEALERS_COLLECTION, dealer.id), payload);
    console.log('Showroom saved successfully:', dealer.id);
    toast.success('Showroom profile registered!', { id: `dealer-reg-${dealer.id}` });
  } catch (err) {
    toast.error('Failed to register showroom.');
    handleFirestoreError(err, OperationType.WRITE, `${DEALERS_COLLECTION}/${dealer.id}`);
  }
}

// 5b. Delete Dealership Programmatically
export async function dbDeleteDealership(dealerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, DEALERS_COLLECTION, dealerId));
    console.log('Showroom deleted successfully:', dealerId);
    toast.success('Showroom deleted.', { id: `dealer-del-${dealerId}` });
  } catch (err) {
    toast.error('Failed to delete showroom.');
    handleFirestoreError(err, OperationType.DELETE, `${DEALERS_COLLECTION}/${dealerId}`);
  }
}

// 5c. Update Dealership Programmatically
export async function dbUpdateDealer(dealerId: string, data: Partial<Dealer>): Promise<void> {
  console.log(`[dbUpdateDealer] Initiating update for dealer: ${dealerId}`, { keys: Object.keys(data) });
  try {
    const ref = doc(db, DEALERS_COLLECTION, dealerId);

    // Strip createdAt to keep creation date strictly immutable
    const { createdAt, ...updatableData } = data as any;

    let logoUrl = updatableData.logoUrl || updatableData.logo;
    if (logoUrl && logoUrl.startsWith('data:')) {
      logoUrl = await uploadBase64ToCloudinary(logoUrl, 'bazar360_logos');
      updatableData.logoUrl = logoUrl;
      updatableData.logo = logoUrl;
      updatableData.avatarUrl = logoUrl;
    } else if (logoUrl) {
      updatableData.logoUrl = logoUrl;
      updatableData.logo = logoUrl;
      updatableData.avatarUrl = logoUrl;
    }

    let coverImage = updatableData.coverImage || updatableData.bannerImage;
    if (coverImage && coverImage.startsWith('data:')) {
      coverImage = await uploadBase64ToCloudinary(coverImage, 'bazar360_covers');
      updatableData.coverImage = coverImage;
    }

    const cleaned = cleanPayload({
      ...updatableData,
      updatedAt: new Date().toISOString()
    });
    console.log(`[dbUpdateDealer] Payload cleaned successfully. Writing to Firestore path: ${DEALERS_COLLECTION}/${dealerId}`);

    await setDoc(ref, cleaned, { merge: true });

    if (cachedDealers) {
      cachedDealers = cachedDealers.map(d => d.id === dealerId ? { ...d, ...updatableData } : d);
    }
    console.log('[dbUpdateDealer] Showroom updated successfully in Firestore & cache:', dealerId);
    toast.success('Showroom details updated!', { id: `dealer-upd-${dealerId}` });
  } catch (err: any) {
    console.error(`[dbUpdateDealer] ERROR updating showroom ${dealerId}:`, err);
    toast.error(err?.message || 'Failed to update showroom.');
    handleFirestoreError(err, OperationType.UPDATE, `${DEALERS_COLLECTION}/${dealerId}`);
    throw err;
  }
}

// 5d. Save / Append Showroom Media to Gallery using arrayUnion (prevents overwriting)
export async function dbSaveShowroomMedia(dealerId: string, url: string): Promise<void> {
  console.log(`[dbSaveShowroomMedia] Appending media URL to showroom ${dealerId}:`, url);
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid media URL provided.');
  }
  if (url.startsWith('data:image') || url.startsWith('data:')) {
    const errorMsg = 'Base64 image data cannot be stored in database. Please upload an image file using the Cloudinary upload button';
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
  try {
    const ref = doc(db, DEALERS_COLLECTION, dealerId);
    
    // We update both 'gallery' and 'media' fields to support maximum compatibility
    await updateDoc(ref, {
      gallery: arrayUnion(url),
      media: arrayUnion(url),
      updatedAt: new Date().toISOString()
    });

    if (cachedDealers) {
      cachedDealers = cachedDealers.map(d => {
        if (d.id === dealerId) {
          const currentGallery = Array.isArray(d.gallery) ? d.gallery : [];
          const currentMedia = Array.isArray(d.media) ? d.media : [];
          return {
            ...d,
            gallery: currentGallery.includes(url) ? currentGallery : [...currentGallery, url],
            media: currentMedia.includes(url) ? currentMedia : [...currentMedia, url]
          };
        }
        return d;
      });
    }

    console.log('[dbSaveShowroomMedia] Media added successfully via arrayUnion for dealer:', dealerId);
  } catch (err: any) {
    console.error(`[dbSaveShowroomMedia] ERROR appending media to dealer ${dealerId}:`, err);
    toast.error(err?.message || 'Failed to save showroom media to database.');
    handleFirestoreError(err, OperationType.UPDATE, `${DEALERS_COLLECTION}/${dealerId}`);
    throw err;
  }
}

// 5e. Remove Showroom Media from Gallery using arrayRemove
export async function dbRemoveShowroomMedia(dealerId: string, url: string): Promise<void> {
  console.log(`[dbRemoveShowroomMedia] Removing media URL from showroom ${dealerId}:`, url);
  try {
    const ref = doc(db, DEALERS_COLLECTION, dealerId);
    
    await updateDoc(ref, {
      gallery: arrayRemove(url),
      media: arrayRemove(url),
      updatedAt: new Date().toISOString()
    });

    if (cachedDealers) {
      cachedDealers = cachedDealers.map(d => {
        if (d.id === dealerId) {
          const currentGallery = Array.isArray(d.gallery) ? d.gallery : [];
          const currentMedia = Array.isArray(d.media) ? d.media : [];
          return {
            ...d,
            gallery: currentGallery.filter(item => item !== url),
            media: currentMedia.filter(item => item !== url)
          };
        }
        return d;
      });
    }

    console.log('[dbRemoveShowroomMedia] Media removed successfully via arrayRemove for dealer:', dealerId);
  } catch (err: any) {
    console.error(`[dbRemoveShowroomMedia] ERROR removing media from dealer ${dealerId}:`, err);
    toast.error(err?.message || 'Failed to remove showroom media from database.');
    handleFirestoreError(err, OperationType.UPDATE, `${DEALERS_COLLECTION}/${dealerId}`);
    throw err;
  }
}

// 6. Post advertisement listed by Private Seller or Showroom dealer
export async function dbSaveListing(listing: CarListing): Promise<void> {
  // Enforce constraints
  if (listing.price < 0) throw new Error('Price cannot be negative');
  if (listing.year < 1980) throw new Error('Model year must be 1980 or later');

  const isBase64 = (str?: string) => typeof str === 'string' && (str.startsWith('data:image') || str.startsWith('data:'));
  if (isBase64(listing.imageUrl) || (Array.isArray(listing.images) && listing.images.some(isBase64))) {
    const errorMsg = 'Base64 image data cannot be stored in database. Please upload an image file using the Cloudinary upload button';
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  const prepared = cleanPayload({
    ...listing,
    createdAt: listing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Always update in-memory cache and localStorage immediately so the user's post is never lost
  if (cachedListings) {
    const idx = cachedListings.findIndex(l => l.id === listing.id);
    if (idx > -1) {
      cachedListings[idx] = { ...cachedListings[idx], ...prepared };
    } else {
      cachedListings = [prepared, ...cachedListings];
    }
  }
  try {
    const localCustom = JSON.parse(localStorage.getItem('bazar360_custom_listings') || '[]');
    const filtered = localCustom.filter((l: any) => l.id !== listing.id);
    localStorage.setItem('bazar360_custom_listings', JSON.stringify([prepared, ...filtered]));
  } catch (e) {
    console.warn('[LocalStorage] Could not sync local custom listings:', e);
  }

  try {
    await setDoc(doc(db, LISTINGS_COLLECTION, listing.id), prepared);
    console.log('Listing saved to database successfully:', listing.id);
    toast.success('Vehicle advertisement saved to database!', { id: `listing-save-${listing.id}` });
  } catch (err: any) {
    console.warn('[Firestore] Remote sync failed, listing saved locally in fallback cache:', err);
    toast.success('Vehicle post saved locally!', { id: `listing-save-local-${listing.id}` });
    handleFirestoreError(err, OperationType.WRITE, `${LISTINGS_COLLECTION}/${listing.id}`);
  }
}

// 7. Update Listing Approval status (Admin / Manager action)
export async function dbApproveListing(listingId: string, approved: boolean = true): Promise<void> {
  try {
    const ref = doc(db, LISTINGS_COLLECTION, listingId);
    await updateDoc(ref, {
      approved,
      updatedAt: new Date().toISOString()
    });
    if (cachedListings) {
      cachedListings = cachedListings.map(l => l.id === listingId ? { ...l, approved } : l);
    }
    console.log(`Listing ${listingId} approval status updated to:`, approved);
    toast.success(approved ? 'Listing approved & published!' : 'Listing pending/unapproved.', { id: `approve-${listingId}` });
  } catch (err) {
    toast.error('Failed to update listing approval.');
    handleFirestoreError(err, OperationType.UPDATE, `${LISTINGS_COLLECTION}/${listingId}`);
  }
}

// 7b. Delete Listing with cache synchronization
export async function dbDeleteListing(listingId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, LISTINGS_COLLECTION, listingId));
    if (cachedListings) {
      cachedListings = cachedListings.filter(l => l.id !== listingId);
    }
    try {
      const localCustom = JSON.parse(localStorage.getItem('bazar360_custom_listings') || '[]');
      const filtered = localCustom.filter((l: any) => l.id !== listingId);
      localStorage.setItem('bazar360_custom_listings', JSON.stringify(filtered));
    } catch (e) {}
    console.log('Listing deleted successfully:', listingId);
    toast.success('Listing deleted successfully.', { id: `delete-listing-${listingId}` });
  } catch (err) {
    toast.error('Failed to delete listing.');
    handleFirestoreError(err, OperationType.DELETE, `${LISTINGS_COLLECTION}/${listingId}`);
  }
}

// Update User Profile (Partial)
export async function dbUpdateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const profileDocRef = doc(db, 'profiles', uid);

    // Strip createdAt to ensure account creation date is strictly immutable
    const { createdAt, ...updatableData } = data as any;

    let photoURL = updatableData.photoURL || updatableData.profilePhoto;
    if (photoURL && photoURL.startsWith('data:')) {
      photoURL = await uploadBase64ToCloudinary(photoURL, 'bazar360_profiles');
      updatableData.photoURL = photoURL;
      updatableData.profilePhoto = photoURL;
    } else if (photoURL) {
      updatableData.photoURL = photoURL;
      updatableData.profilePhoto = photoURL;
    }

    const payload = cleanPayload({
      ...updatableData,
      updatedAt: new Date().toISOString()
    });

    // Use setDoc with merge: true so it creates or updates the document seamlessly
    await setDoc(userDocRef, payload, { merge: true }).catch(e => console.warn('Could not set/merge users document:', e));
    await setDoc(profileDocRef, payload, { merge: true }).catch(e => console.warn('Could not set/merge profiles document:', e));

    // Synchronize Firebase Auth profile if matching currentUser
    if (auth.currentUser && auth.currentUser.uid === uid) {
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (updatableData.displayName) authUpdates.displayName = updatableData.displayName;
      if (updatableData.photoURL) authUpdates.photoURL = updatableData.photoURL;
      if (Object.keys(authUpdates).length > 0) {
        updateProfile(auth.currentUser, authUpdates).catch(e => console.warn('Auth profile update skipped:', e));
      }
    }

    // Synchronize to local storage cache immediately
    let updated = { ...payload, uid };
    try {
      const stored = localStorage.getItem('bazar360_user');
      let currentObj = stored ? JSON.parse(stored) : {};
      if (!currentObj || typeof currentObj !== 'object') currentObj = {};
      updated = { ...currentObj, ...payload, uid };
      localStorage.setItem('bazar360_user', JSON.stringify(updated));
    } catch (e) {
      console.warn('Local storage sync error:', e);
    }

    // Dispatch global custom event to trigger reactive cache invalidation in all contexts/components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bazar360_profile_updated', { detail: updated }));
    }

    console.log('User profile updated in Firestore & localStorage:', uid);
    toast.success('Profile updated successfully!', { id: `profile-update-${uid}` });
  } catch (err) {
    toast.error('Failed to update profile.');
    handleFirestoreError(err, OperationType.UPDATE, `${USERS_COLLECTION}/${uid}`);
  }
}

// 10. Bargains & Leads DB layer
export interface Bargain {
  id: string;
  listingId: string;
  vehicleTitle: string;
  bidAmount: number;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  dealerId: string;
  status: 'Pending' | 'Approved' | 'Countered' | 'Rejected';
  createdAt: string;
}



export async function dbSaveBargain(bargain: Bargain): Promise<void> {
  try {
    await setDoc(doc(db, 'bargains', bargain.id), {
      ...bargain,
      createdAt: bargain.createdAt || new Date().toISOString()
    });
    console.log('Bargain saved:', bargain.id);
  } catch (err) {
    console.warn('Silent bargain save issue:', err);
  }
}

export async function dbFetchBargains(): Promise<Bargain[]> {
  try {
    const snap = await getDocs(collection(db, 'bargains'));
    const list: Bargain[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        listingId: data.listingId || '',
        vehicleTitle: data.vehicleTitle || 'Unknown Vehicle',
        bidAmount: Number(data.bidAmount) || 0,
        buyerName: data.buyerName || 'Anonymous',
        buyerPhone: data.buyerPhone || '',
        buyerEmail: data.buyerEmail || '',
        dealerId: data.dealerId || '',
        status: data.status || 'Pending',
        createdAt: data.createdAt || new Date().toISOString()
      });
    });
    return list;
  } catch (err) {
    console.error('dbFetchBargains Error:', err);
    return [];
  }
}

export async function dbSaveLead(lead: Lead): Promise<void> {
  try {
    await setDoc(doc(db, 'leads', lead.id), {
      ...lead,
      createdAt: lead.createdAt || new Date().toISOString()
    });
    console.log('Lead saved:', lead.id);
  } catch (err) {
    console.warn('Silent lead save issue:', err);
  }
}

export async function dbFetchLeads(): Promise<Lead[]> {
  try {
    const snap = await getDocs(collection(db, 'leads'));
    const list: Lead[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        type: data.type || 'General Inquiry',
        title: data.title || 'Inquiry',
        userName: data.userName || 'Anonymous Visitor',
        userPhone: data.userPhone || '',
        userEmail: data.userEmail || '',
        city: data.city || '',
        details: data.details || '',
        metadata: data.metadata || {},
        createdAt: data.createdAt || new Date().toISOString()
      });
    });
    return list;
  } catch (err) {
    console.error('dbFetchLeads Error:', err);
    return [];
  }
}

export async function dbFetchAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    snap.forEach((doc) => {
      list.push(doc.data() as UserProfile);
    });
    return list;
  } catch (err) {
    console.error('dbFetchAllUsers Error:', err);
    return [];
  }
}

export interface Suggestion {
  id: string;
  user_id: string | null;
  suggestion_text: string;
  submitted_at: string;
}

export async function dbSaveSuggestion(suggestion: Suggestion): Promise<void> {
  try {
    await setDoc(doc(db, 'suggestions', suggestion.id), {
      ...suggestion,
      submitted_at: suggestion.submitted_at || new Date().toISOString()
    });
    console.log('Suggestion saved to Firestore:', suggestion.id);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `suggestions/${suggestion.id}`);
  }
}

// ==========================================
// 11. Social Interactions: Likes & Comments
// ==========================================
export interface ListingComment {
  id: string;
  listingId: string;
  userName: string;
  userId?: string;
  text: string;
  createdAt: string;
}

export async function dbAddComment(listingId: string, comment: ListingComment): Promise<void> {
  try {
    const ref = doc(db, `listings/${listingId}/comments`, comment.id);
    await setDoc(ref, {
      ...comment,
      createdAt: comment.createdAt || new Date().toISOString()
    });
    console.log('Comment added to listing:', listingId);
  } catch (err) {
    console.error('Error adding comment to listing:', err);
    handleFirestoreError(err, OperationType.WRITE, `listings/${listingId}/comments`);
  }
}

export async function dbFetchComments(listingId: string): Promise<ListingComment[]> {
  try {
    const snap = await getDocs(collection(db, `listings/${listingId}/comments`));
    const list: ListingComment[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        listingId: listingId,
        userName: data.userName || 'Anonymous',
        userId: data.userId || '',
        text: data.text || '',
        createdAt: data.createdAt || new Date().toISOString()
      });
    });
    
    // Sort oldest first
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (err) {
    console.warn('Offline comment fetch fallback:', err);
    try {
      const stored = localStorage.getItem(`bazar360_comments_${listingId}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  }
}

export async function dbToggleLike(listingId: string, userId: string, isLiking: boolean): Promise<void> {
  try {
    const ref = doc(db, `listings/${listingId}/likes`, userId);
    if (isLiking) {
      await setDoc(ref, {
        userId,
        createdAt: new Date().toISOString()
      });
    } else {
      await deleteDoc(ref);
    }
    console.log(`Like status for listing ${listingId} updated to:`, isLiking);
  } catch (err) {
    console.warn('Silent like save fallback:', err);
    try {
      const stored = localStorage.getItem(`bazar360_likes_${listingId}`);
      let likes = stored ? JSON.parse(stored) : [];
      if (isLiking) {
        if (!likes.includes(userId)) likes.push(userId);
      } else {
        likes = likes.filter((id: string) => id !== userId);
      }
      localStorage.setItem(`bazar360_likes_${listingId}`, JSON.stringify(likes));
    } catch (e) {}
  }
}

export async function dbFetchLikes(listingId: string): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, `listings/${listingId}/likes`));
    const list: string[] = [];
    snap.forEach((doc) => {
      list.push(doc.id); // Each doc ID is the userId who liked it
    });
    return list;
  } catch (err) {
    console.warn('Offline like fetch fallback:', err);
    try {
      const stored = localStorage.getItem(`bazar360_likes_${listingId}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  }
}

// 12. Lead Activity Tracking Engine (BAZAR360 v3.0 PRO)
export interface TrackedLeadAction {
  id: string;
  userName: string;
  userPhone: string;
  userWhatsApp?: string;
  userEmail: string;
  actionType: 'search' | 'vehicle_view' | 'showroom_view' | 'favorite' | 'share' | 'call_click' | 'whatsapp_click' | 'message' | 'session_start';
  details: string; // e.g. "Searched for Toyota Fortuner"
  leadSource: string; // "Web" | "Mobile"
  leadScore: number;
  leadCategory: 'Cold' | 'Warm' | 'Hot' | 'VIP';
  visitorCategory: 'Guest' | 'Registered User' | 'Dealer' | 'Admin';
  timeOnSite?: number; // seconds
  sessionHistory?: string[];
  createdAt: string;
}

export async function dbTrackLeadAction(action: Omit<TrackedLeadAction, 'id' | 'createdAt'>): Promise<void> {
  try {
    const actionId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullAction: TrackedLeadAction = {
      ...action,
      id: actionId,
      createdAt: new Date().toISOString()
    };
    
    // Save details to lead_actions subcollection or general actions
    await setDoc(doc(db, 'lead_actions', actionId), fullAction);
    
    // Also update/aggregate a consolidated user profile under the "leads" collection
    const leadId = action.userPhone ? `lead-${action.userPhone}` : `lead-${action.userEmail.replace(/[@.]/g, '-')}`;
    const leadRef = doc(db, 'leads', leadId);
    
    const leadDoc = await getDoc(leadRef);
    let previousScore = 0;
    let previousHistory: string[] = [];
    
    if (leadDoc.exists()) {
      const data = leadDoc.data();
      previousScore = Number(data.leadScore) || 0;
      previousHistory = Array.isArray(data.sessionHistory) ? data.sessionHistory : [];
    }
    
    const newScore = previousScore + action.leadScore;
    const updatedHistory = [...previousHistory, `${action.actionType}: ${action.details}`].slice(-30); // Keep last 30 events
    
    // Determine categories
    let leadCategory: 'Cold' | 'Warm' | 'Hot' | 'VIP' = 'Cold';
    if (newScore > 250) leadCategory = 'VIP';
    else if (newScore > 120) leadCategory = 'Hot';
    else if (newScore > 50) leadCategory = 'Warm';
    
    await setDoc(leadRef, {
      id: leadId,
      userName: action.userName || 'Anonymous',
      userPhone: action.userPhone || '',
      userWhatsApp: action.userWhatsApp || action.userPhone || '',
      userEmail: action.userEmail || '',
      searchHistory: action.actionType === 'search' ? updatedHistory : previousHistory,
      leadSource: action.leadSource || 'Web',
      leadScore: newScore,
      leadCategory,
      visitorCategory: action.visitorCategory || 'Guest',
      timeOnSite: (Number(leadDoc.data()?.timeOnSite) || 0) + (action.timeOnSite || 15), // increment time
      sessionHistory: updatedHistory,
      updatedAt: new Date().toISOString(),
      createdAt: leadDoc.data()?.createdAt || new Date().toISOString()
    }, { merge: true });
    
    console.log(`Lead Activity logged successfully to Firebase. Score updated: ${newScore}`);
  } catch (err) {
    console.warn('Lead action logging warning:', err);
  }
}

export async function dbFetchLeadActions(): Promise<TrackedLeadAction[]> {
  try {
    const snap = await getDocs(collection(db, 'lead_actions'));
    const list: TrackedLeadAction[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        userName: data.userName || '',
        userPhone: data.userPhone || '',
        userWhatsApp: data.userWhatsApp || '',
        userEmail: data.userEmail || '',
        actionType: data.actionType || 'session_start',
        details: data.details || '',
        leadSource: data.leadSource || 'Web',
        leadScore: Number(data.leadScore) || 0,
        leadCategory: data.leadCategory || 'Cold',
        visitorCategory: data.visitorCategory || 'Guest',
        timeOnSite: data.timeOnSite || 0,
        sessionHistory: data.sessionHistory || [],
        createdAt: data.createdAt || new Date().toISOString()
      });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Offline lead actions fetch issue:', err);
    return [];
  }
}

// ==========================================================
// 13. REDESIGNED ENTERPRISE DATABASE LAYER (ALL 26 COLLECTIONS)
// ==========================================================

export async function dbSaveShowroom(showroom: any): Promise<void> {
  try {
    const ref = doc(db, 'showrooms', showroom.id);
    await setDoc(ref, {
      ...showroom,
      updatedAt: new Date().toISOString(),
      activeFlag: showroom.activeFlag !== false,
      status: showroom.status || 'Active'
    });
    console.log('Showroom saved to /showrooms:', showroom.id);
  } catch (err) {
    console.warn('Showroom save bypassed:', err);
  }
}

export async function dbFetchShowrooms(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'showrooms'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    console.warn('Showrooms fetch bypassed:', err);
    return [];
  }
}

export async function dbSaveShowroomStaff(staff: any): Promise<void> {
  try {
    const ref = doc(db, 'showroomStaff', staff.id);
    await setDoc(ref, {
      ...staff,
      updatedAt: new Date().toISOString(),
      activeFlag: staff.activeFlag !== false,
      status: staff.status || 'Active'
    });
  } catch (err) {
    console.warn('Showroom staff save bypassed:', err);
  }
}

export async function dbFetchShowroomStaff(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'showroomStaff'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveVehicle(vehicle: any): Promise<void> {
  try {
    const ref = doc(db, 'vehicles', vehicle.id);
    await setDoc(ref, {
      ...vehicle,
      updatedAt: new Date().toISOString(),
      activeFlag: vehicle.activeFlag !== false,
      status: vehicle.status || 'Approved'
    });
    console.log('Vehicle saved to /vehicles:', vehicle.id);
  } catch (err) {
    console.warn('Vehicle save bypassed:', err);
  }
}

export async function dbFetchVehicles(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'vehicles'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveVehicleImage(img: any): Promise<void> {
  try {
    const ref = doc(db, 'vehicleImages', img.id);
    await setDoc(ref, {
      ...img,
      createdAt: img.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('vehicleImages save bypassed:', err);
  }
}

export async function dbSaveVehicleVideo(vid: any): Promise<void> {
  try {
    const ref = doc(db, 'vehicleVideos', vid.id);
    await setDoc(ref, {
      ...vid,
      createdAt: vid.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('vehicleVideos save bypassed:', err);
  }
}

export async function dbToggleFavorite(userId: string, vehicleId: string, isFav: boolean): Promise<void> {
  try {
    const favId = `fav-${userId}-${vehicleId}`;
    const ref = doc(db, 'favorites', favId);
    if (isFav) {
      await setDoc(ref, {
        id: favId,
        userId,
        vehicleId,
        activeFlag: true,
        status: 'Active',
        createdAt: new Date().toISOString()
      });
    } else {
      await deleteDoc(ref);
    }
  } catch (err) {
    console.warn('Favorites write bypassed:', err);
  }
}

export async function dbFetchFavorites(userId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveMessage(msg: any): Promise<void> {
  try {
    const ref = doc(db, 'messages', msg.id);
    await setDoc(ref, {
      ...msg,
      timestamp: msg.timestamp || new Date().toISOString(),
      activeFlag: true,
      status: 'Delivered'
    });
  } catch (err) {
    console.warn('message save bypassed:', err);
  }
}

export async function dbFetchMessages(chatId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'messages'), where('chatId', '==', chatId), orderBy('timestamp', 'asc'));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveChat(chat: any): Promise<void> {
  try {
    const ref = doc(db, 'chats', chat.id);
    await setDoc(ref, {
      ...chat,
      lastMessageAt: chat.lastMessageAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('chat save bypassed:', err);
  }
}

export async function dbFetchChats(userId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'chats'), where('participantIds', 'array-contains', userId));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveNotification(notification: any): Promise<void> {
  try {
    const ref = doc(db, 'notifications', notification.id);
    await setDoc(ref, {
      ...notification,
      createdAt: notification.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('notification save bypassed:', err);
  }
}

export async function dbSaveSearchHistory(search: any): Promise<void> {
  try {
    const ref = doc(db, 'searchHistory', search.id);
    await setDoc(ref, {
      ...search,
      createdAt: search.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('searchHistory save bypassed:', err);
  }
}

export async function dbFetchSearchHistory(userId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'searchHistory'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveRecentView(view: any): Promise<void> {
  try {
    const ref = doc(db, 'recentViews', view.id);
    await setDoc(ref, {
      ...view,
      viewedAt: view.viewedAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('recentViews save bypassed:', err);
  }
}

export async function dbFetchRecentViews(userId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'recentViews'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveReview(review: any): Promise<void> {
  try {
    const ref = doc(db, 'reviews', review.id);
    await setDoc(ref, {
      ...review,
      createdAt: review.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Approved'
    });
  } catch (err) {
    console.warn('review save bypassed:', err);
  }
}

export async function dbAddReview(targetId: string, review: Review): Promise<void> {
  try {
    const reviewId = review.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullReview = {
      ...review,
      id: reviewId,
      targetId: targetId,
      date: review.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      activeFlag: true,
      status: 'Approved'
    };
    await setDoc(doc(db, 'reviews', reviewId), fullReview);
  } catch (err) {
    console.error('dbAddReview error:', err);
    throw err;
  }
}

export async function dbFetchReviews(targetId: string): Promise<Review[]> {
  try {
    const q = query(collection(db, 'reviews'), where('targetId', '==', targetId));
    const snap = await getDocs(q);
    const list: Review[] = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        author: data.author || 'Anonymous',
        rating: Number(data.rating) || 5,
        date: data.date || data.createdAt || new Date().toISOString(),
        comment: data.comment || ''
      });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.warn('Offline reviews fetch fallback:', err);
    return [];
  }
}

export async function dbSaveRating(rating: any): Promise<void> {
  try {
    const ref = doc(db, 'ratings', rating.id);
    await setDoc(ref, {
      ...rating,
      updatedAt: new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('rating save bypassed:', err);
  }
}

export async function dbFetchRatings(targetId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'ratings'), where('targetId', '==', targetId));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveSupportTicket(ticket: any): Promise<void> {
  try {
    const ref = doc(db, 'supportTickets', ticket.id);
    await setDoc(ref, {
      ...ticket,
      updatedAt: new Date().toISOString(),
      activeFlag: ticket.activeFlag !== false,
      status: ticket.status || 'Open'
    });
  } catch (err) {
    console.warn('supportTickets save bypassed:', err);
  }
}

export async function dbFetchSupportTickets(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'supportTickets'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSavePayment(payment: any): Promise<void> {
  try {
    const ref = doc(db, 'payments', payment.id);
    await setDoc(ref, {
      ...payment,
      createdAt: payment.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: payment.status || 'Completed'
    });
  } catch (err) {
    console.warn('payment save bypassed:', err);
  }
}

export async function dbFetchPayments(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'payments'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveSubscription(sub: any): Promise<void> {
  try {
    const ref = doc(db, 'subscriptions', sub.id);
    await setDoc(ref, {
      ...sub,
      createdAt: sub.createdAt || new Date().toISOString(),
      activeFlag: sub.activeFlag !== false,
      status: sub.status || 'Active'
    });
  } catch (err) {
    console.warn('subscription save bypassed:', err);
  }
}

export async function dbFetchSubscriptions(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'subscriptions'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveAdvertisement(ad: any): Promise<void> {
  try {
    const ref = doc(db, 'advertisements', ad.id);
    await setDoc(ref, {
      ...ad,
      createdAt: ad.createdAt || new Date().toISOString(),
      activeFlag: ad.activeFlag !== false,
      status: ad.status || 'Active'
    });
  } catch (err) {
    console.warn('advertisement save bypassed:', err);
  }
}

export async function dbFetchAdvertisements(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'advertisements'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveAnalytics(evt: any): Promise<void> {
  try {
    const ref = doc(db, 'analytics', evt.id);
    await setDoc(ref, {
      ...evt,
      timestamp: evt.timestamp || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('analytics save bypassed:', err);
  }
}

export async function dbFetchAnalytics(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'analytics'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveSetting(setting: any): Promise<void> {
  try {
    const ref = doc(db, 'settings', setting.id);
    await setDoc(ref, {
      ...setting,
      updatedAt: new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('settings save bypassed:', err);
  }
}

export async function dbFetchSettings(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'settings'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveAuditLog(log: any): Promise<void> {
  try {
    const ref = doc(db, 'auditLogs', log.id);
    await setDoc(ref, {
      ...log,
      timestamp: log.timestamp || new Date().toISOString(),
      activeFlag: true,
      status: 'Logged'
    });
  } catch (err) {
    console.warn('auditLogs save bypassed:', err);
  }
}

export async function dbFetchAuditLogs(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'auditLogs'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    return [];
  }
}

export async function dbSaveSeo(seo: any): Promise<void> {
  try {
    const ref = doc(db, 'seo', seo.id);
    await setDoc(ref, {
      ...seo,
      updatedAt: new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('seo save bypassed:', err);
  }
}

export async function dbFetchSeo(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'seo'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveSystemLog(log: any): Promise<void> {
  try {
    const ref = doc(db, 'systemLogs', log.id);
    await setDoc(ref, {
      ...log,
      timestamp: log.timestamp || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('systemLogs save bypassed:', err);
  }
}

export async function dbFetchSystemLogs(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'systemLogs'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

// Securely claim guest-posted ad listings matching a verified phone number
export async function dbClaimListingsByPhone(phoneNumber: string, userId: string, userRole: string): Promise<number> {
  try {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const formattedPhone = phoneNumber.trim();
    
    // Fetch all listings
    const snap = await getDocs(query(collection(db, 'listings'), limit(100)));
    let claimedCount = 0;
    
    for (const listingDoc of snap.docs) {
      const data = listingDoc.data();
      const listingId = listingDoc.id;
      
      // A listing is a guest listing if assignedSalesRepId or createdBy is 'guest-seller'
      const isGuest = data.assignedSalesRepId === 'guest-seller' || data.createdBy === 'guest-seller';
      
      let isPhoneMatch = false;
      
      if (data.phone) {
        const docPhoneClean = data.phone.replace(/[^0-9]/g, '');
        if (docPhoneClean === cleanPhone || data.phone === formattedPhone) {
          isPhoneMatch = true;
        }
      }
      if (data.sellerPhone) {
        const docPhoneClean = data.sellerPhone.replace(/[^0-9]/g, '');
        if (docPhoneClean === cleanPhone || data.sellerPhone === formattedPhone) {
          isPhoneMatch = true;
        }
      }
      
      // Fallback text check in description
      if (!isPhoneMatch && data.description && typeof data.description === 'string') {
        const desc = data.description;
        if (desc.includes(cleanPhone) || desc.includes(formattedPhone)) {
          isPhoneMatch = true;
        }
      }
      
      if (isGuest && isPhoneMatch) {
        const ref = doc(db, 'listings', listingId);
        await updateDoc(ref, {
          assignedSalesRepId: userId,
          createdBy: userId,
          
          updatedAt: new Date().toISOString()
        });
        claimedCount++;
      }
    }
    
    return claimedCount;
  } catch (err) {
    console.error('dbClaimListingsByPhone error:', err);
    throw err;
  }
}

// Submits a customer inquiry as a new lead, linking the customer to the showroom owner
export async function dbSubmitLead(leadData: Omit<Lead, 'id' | 'createdAt'>): Promise<string> {
  try {
    // Validate input
    const validatedData = validateLead(leadData);
    
    const leadsColl = collection(db, 'leads');
    const docRef = doc(leadsColl); // Generate id
    const newLead: Lead = {
      ...(validatedData as any), // Cast back to Lead as we validated structure
      id: docRef.id,
      createdAt: new Date().toISOString()
    };
    
    await setDoc(docRef, newLead);

    // Automatically trigger a transactional notification for the showroom owner
    try {
      const notifRef = doc(collection(db, 'notifications'));
      await setDoc(notifRef, {
        id: notifRef.id,
        userId: newLead.showroomOwnerId,
        title: `🚨 New Lead: ${newLead.vehicleTitle || 'Vehicle Inquiry'}`,
        body: `Customer ${newLead.userName} (${newLead.userPhone}) sent an inquiry: "${newLead.inquiryMessage?.substring(0, 60)}..."`,
        read: false,
        createdAt: new Date().toISOString(),
        link: 'dashboard'
      });
    } catch (notifErr) {
      console.warn('[CRM] Failed to create real-time notification document:', notifErr);
    }

    return docRef.id;
  } catch (err) {
    console.error('[CRM] dbSubmitLead error:', err);
    throw err;
  }
}

// Fetches leads for a specific showroom owner
export async function dbFetchLeadsForOwner(showroomOwnerId: string): Promise<Lead[]> {
  try {
    const q = query(
      collection(db, 'leads'),
      where('showroomOwnerId', '==', showroomOwnerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Lead);
  } catch (err) {
    console.error('[CRM] dbFetchLeadsForOwner error:', err);
    // Fallback to local storage or empty list
    return [];
  }
}

// Updates the CRM lead pipeline status
export async function dbUpdateLeadStatus(leadId: string, status: Lead['status']): Promise<void> {
  try {
    const leadRef = doc(db, 'leads', leadId);
    await updateDoc(leadRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[CRM] dbUpdateLeadStatus error:', err);
    throw err;
  }
}

export interface ShowroomAnalyticsEvent {
  id: string;
  dealerId: string;
  actionType: 'view' | 'whatsapp' | 'call' | 'lead';
  vehicleId: string;
  vehicleTitle: string;
  timestamp: string;
  device: 'Web' | 'Mobile';
  visitorId: string;
}

// Track customer engagement events securely in Firestore
export async function dbTrackShowroomEvent(
  dealerId: string, 
  actionType: 'view' | 'whatsapp' | 'call' | 'lead',
  vehicleId?: string,
  vehicleTitle?: string
): Promise<void> {
  try {
    if (!dealerId) return;
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const eventRef = doc(db, 'showroom_analytics', eventId);
    
    let visitorId = 'anonymous';
    try {
      visitorId = localStorage.getItem('bazar360_visitor_id') || 'anonymous';
    } catch {}

    const device = typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile' : 'Web';

    await setDoc(eventRef, {
      id: eventId,
      dealerId,
      actionType,
      vehicleId: vehicleId || '',
      vehicleTitle: vehicleTitle || '',
      timestamp: new Date().toISOString(),
      device,
      visitorId
    });
    console.log(`[Analytics] Tracked ${actionType} for showroom ${dealerId}`);
  } catch (err) {
    console.warn('[Analytics] Silent event track bypass:', err);
  }
}

// Silent auto-save service booking protocol & CRM lead generator
export async function dbSubmitServiceBooking(bookingData: Omit<ServiceBooking, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const bookingId = `sb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const fullBooking: ServiceBooking = {
    ...bookingData,
    id: bookingId,
    status: 'Pending',
    createdAt: now
  };

  try {
    // 1. Write to service_bookings collection
    await setDoc(doc(db, 'service_bookings', bookingId), fullBooking);

    // 2. Also register lead in CRM 'leads' collection
    const leadId = `lead-sb-${bookingId}`;
    await setDoc(doc(db, 'leads', leadId), {
      id: leadId,
      userName: bookingData.userName,
      userPhone: bookingData.userPhone,
      userEmail: bookingData.userEmail || '',
      type: `Service: ${bookingData.serviceTitle}`,
      title: `${bookingData.serviceTitle} Booking - ${bookingData.userName}`,
      inquiryMessage: `Service Booking for ${bookingData.serviceTitle}. Details: ${bookingData.vehicleDetails || 'General request'}. Notes: ${bookingData.notes || 'None'}. UV Paint Check: ${bookingData.uvLightAnalysisRequested ? 'Yes' : 'No'}`,
      city: bookingData.city || 'Peshawar',
      vehicleId: bookingData.vehicleId || '',
      vehicleTitle: bookingData.vehicleTitle || '',
      status: 'New',
      createdAt: now
    });

    // 3. Fallback to localStorage for offline cache
    try {
      const existing = JSON.parse(localStorage.getItem('bazar360_service_bookings') || '[]');
      existing.unshift(fullBooking);
      localStorage.setItem('bazar360_service_bookings', JSON.stringify(existing.slice(0, 50)));
    } catch {}

    console.log('[ServiceBooking] Silent auto-saved booking:', bookingId);
    return bookingId;
  } catch (err) {
    console.warn('[ServiceBooking] Firestore save fallback to local cache:', err);
    try {
      const existing = JSON.parse(localStorage.getItem('bazar360_service_bookings') || '[]');
      existing.unshift(fullBooking);
      localStorage.setItem('bazar360_service_bookings', JSON.stringify(existing.slice(0, 50)));
    } catch {}
    return bookingId;
  }
}

export async function dbFetchServiceBookings(userPhoneOrUid?: string): Promise<ServiceBooking[]> {
  try {
    const snap = await getDocs(collection(db, 'service_bookings'));
    const list: ServiceBooking[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as ServiceBooking;
      if (!userPhoneOrUid || data.userPhone === userPhoneOrUid || data.userId === userPhoneOrUid) {
        list.push({ ...data, id: doc.id });
      }
    });

    // Merge with offline cache
    let localBookings: ServiceBooking[] = [];
    try {
      localBookings = JSON.parse(localStorage.getItem('bazar360_service_bookings') || '[]');
    } catch {}

    const combined = [...list];
    localBookings.forEach(lb => {
      if (!combined.some(item => item.id === lb.id)) {
        combined.push(lb);
      }
    });

    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('[ServiceBooking] Fetching offline service bookings:', err);
    try {
      return JSON.parse(localStorage.getItem('bazar360_service_bookings') || '[]');
    } catch {
      return [];
    }
  }
}

export async function dbAddCrmInternalNote(recordId: string, notes: any[], collectionName = 'service_bookings'): Promise<void> {
  try {
    const ref = doc(db, collectionName, recordId);
    await updateDoc(ref, {
      internalNotes: notes,
      updatedAt: new Date().toISOString()
    });

    // Also record audit log
    const auditId = `audit-note-${Date.now()}`;
    await setDoc(doc(db, 'auditLogs', auditId), {
      id: auditId,
      bookingId: recordId,
      action: 'Internal Note Added',
      details: `Staff added an internal CRM note to record ${recordId}`,
      timestamp: new Date().toISOString(),
      activeFlag: true,
      status: 'Logged'
    });
  } catch (err) {
    console.warn('[CRM] dbAddCrmInternalNote Firestore update bypassed, updating localStorage cache:', err);
    try {
      const cacheKey = collectionName === 'service_bookings' ? 'bazar360_service_bookings' : 'bazar360_leads';
      const items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      const updated = items.map((i: any) => i.id === recordId ? { ...i, internalNotes: notes } : i);
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    } catch {}
  }
}

export async function dbUpdateServiceBookingStatus(bookingId: string, status: ServiceBooking['status']): Promise<void> {
  try {
    const ref = doc(db, 'service_bookings', bookingId);
    await updateDoc(ref, {
      status,
      updatedAt: new Date().toISOString()
    });

    // Log status change to auditLogs
    const auditId = `audit-status-${Date.now()}`;
    await setDoc(doc(db, 'auditLogs', auditId), {
      id: auditId,
      bookingId,
      action: 'Status Updated',
      details: `Service booking ${bookingId} status changed to ${status}`,
      status,
      timestamp: new Date().toISOString(),
      activeFlag: true
    });
  } catch (err) {
    console.warn('[ServiceBooking] Status update Firestore bypassed, updating localStorage:', err);
    try {
      const items = JSON.parse(localStorage.getItem('bazar360_service_bookings') || '[]');
      const updated = items.map((i: any) => i.id === bookingId ? { ...i, status } : i);
      localStorage.setItem('bazar360_service_bookings', JSON.stringify(updated));
    } catch {}
  }
}

// ==========================================
// ENTERPRISE MESSAGING & CONVERSATION ENGINE
// ==========================================

export async function dbCreateOrGetConversation(params: {
  senderUid: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  recipientUid: string;
  recipientName: string;
  recipientAvatar?: string;
  recipientRole?: string;
  relatedListing?: { id: string; title: string; image: string; price: number };
  relatedShowroomId?: string;
  relatedServiceId?: string;
  relatedLeadId?: string;
  initialMessage?: string;
}): Promise<string> {
  const {
    senderUid, senderName, senderAvatar, senderRole = 'Buyer',
    recipientUid, recipientName, recipientAvatar, recipientRole = 'Seller',
    relatedListing, relatedShowroomId, relatedServiceId, relatedLeadId,
    initialMessage
  } = params;

  try {
    // 1. Check existing conversations for matching participants
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', senderUid)
    );
    const snap = await getDocs(q);
    let existingConv: Conversation | null = null;

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Conversation;
      if (data.participants && data.participants.includes(recipientUid)) {
        if (relatedListing?.id ? data.relatedListingId === relatedListing.id : true) {
          existingConv = { ...data, id: docSnap.id };
        }
      }
    });

    if (existingConv) {
      const convId = (existingConv as Conversation).id;
      if (initialMessage) {
        await dbSendMessage({
          conversationId: convId,
          senderId: senderUid,
          senderName,
          senderAvatar,
          recipientId: recipientUid,
          message: initialMessage,
          type: relatedListing ? 'listing_inquiry' : 'text',
          metadata: relatedListing ? {
            listingId: relatedListing.id,
            listingTitle: relatedListing.title,
            listingImage: relatedListing.image,
            listingPrice: relatedListing.price
          } : undefined
        });
      }
      return convId;
    }

    // 2. Create brand new conversation
    const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newConversation: Conversation = {
      id: convId,
      participants: [senderUid, recipientUid],
      participantDetails: {
        [senderUid]: { name: senderName, avatar: senderAvatar || '', role: senderRole },
        [recipientUid]: { name: recipientName, avatar: recipientAvatar || '', role: recipientRole }
      },
      relatedListingId: relatedListing?.id,
      relatedListingTitle: relatedListing?.title,
      relatedListingImage: relatedListing?.image,
      relatedListingPrice: relatedListing?.price,
      relatedShowroomId,
      relatedServiceId,
      relatedLeadId,
      lastMessage: initialMessage || 'Conversation started',
      lastMessageTime: now,
      lastMessageSenderId: senderUid,
      unreadCount: {
        [senderUid]: 0,
        [recipientUid]: initialMessage ? 1 : 0
      },
      status: 'Active',
      createdAt: now,
      updatedAt: now
    };

    await setDoc(doc(db, 'conversations', convId), newConversation);

    // Offline cache update
    try {
      const cached = JSON.parse(localStorage.getItem('bazar360_conversations') || '[]');
      cached.unshift(newConversation);
      localStorage.setItem('bazar360_conversations', JSON.stringify(cached.slice(0, 50)));
    } catch {}

    if (initialMessage) {
      await dbSendMessage({
        conversationId: convId,
        senderId: senderUid,
        senderName,
        senderAvatar,
        recipientId: recipientUid,
        message: initialMessage,
        type: relatedListing ? 'listing_inquiry' : 'text',
        metadata: relatedListing ? {
          listingId: relatedListing.id,
          listingTitle: relatedListing.title,
          listingImage: relatedListing.image,
          listingPrice: relatedListing.price
        } : undefined
      });
    }

    return convId;
  } catch (err) {
    console.warn('[Messaging] Firestore create conversation bypass, using local store:', err);
    const fallbackId = `conv-${Date.now()}`;
    const now = new Date().toISOString();
    const fallbackConv: Conversation = {
      id: fallbackId,
      participants: [senderUid, recipientUid],
      participantDetails: {
        [senderUid]: { name: senderName, avatar: senderAvatar, role: senderRole },
        [recipientUid]: { name: recipientName, avatar: recipientAvatar, role: recipientRole }
      },
      relatedListingId: relatedListing?.id,
      relatedListingTitle: relatedListing?.title,
      relatedListingImage: relatedListing?.image,
      relatedListingPrice: relatedListing?.price,
      lastMessage: initialMessage || 'Conversation started',
      lastMessageTime: now,
      lastMessageSenderId: senderUid,
      unreadCount: { [senderUid]: 0, [recipientUid]: 1 },
      status: 'Active',
      createdAt: now,
      updatedAt: now
    };

    try {
      const cached = JSON.parse(localStorage.getItem('bazar360_conversations') || '[]');
      cached.unshift(fallbackConv);
      localStorage.setItem('bazar360_conversations', JSON.stringify(cached));
    } catch {}

    return fallbackId;
  }
}

export async function dbFetchUserConversations(userUidOrPhone: string): Promise<Conversation[]> {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userUidOrPhone)
    );
    const snap = await getDocs(q);
    const list: Conversation[] = [];
    snap.forEach((docSnap) => {
      list.push({ ...docSnap.data() as Conversation, id: docSnap.id });
    });

    // Merge local cache
    let localConvs: Conversation[] = [];
    try {
      localConvs = JSON.parse(localStorage.getItem('bazar360_conversations') || '[]');
    } catch {}

    const combined = [...list];
    localConvs.forEach(lc => {
      if (lc.participants?.includes(userUidOrPhone) && !combined.some(c => c.id === lc.id)) {
        combined.push(lc);
      }
    });

    return combined.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  } catch (err) {
    console.warn('[Messaging] Fetching conversations fallback to local cache:', err);
    try {
      const localConvs: Conversation[] = JSON.parse(localStorage.getItem('bazar360_conversations') || '[]');
      return localConvs.filter(c => c.participants?.includes(userUidOrPhone));
    } catch {
      return [];
    }
  }
}

export async function dbFetchConversationMessages(conversationId: string): Promise<DirectMessage[]> {
  try {
    const messagesColl = collection(db, `conversations/${conversationId}/messages`);
    const q = query(messagesColl, orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    const list: DirectMessage[] = [];
    snap.forEach((docSnap) => {
      list.push({ ...docSnap.data() as DirectMessage, id: docSnap.id });
    });

    // Offline cache merge
    let localMsgs: DirectMessage[] = [];
    try {
      localMsgs = JSON.parse(localStorage.getItem(`bazar360_msgs_${conversationId}`) || '[]');
    } catch {}

    const combined = [...list];
    localMsgs.forEach(lm => {
      if (!combined.some(m => m.id === lm.id)) {
        combined.push(lm);
      }
    });

    return combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (err) {
    console.warn('[Messaging] Fetching messages fallback to local cache:', err);
    try {
      return JSON.parse(localStorage.getItem(`bazar360_msgs_${conversationId}`) || '[]');
    } catch {
      return [];
    }
  }
}

export async function dbSendMessage(params: {
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  message: string;
  attachments?: Array<{ url: string; name: string; type: 'image' | 'document' | 'pdf' }>;
  type?: DirectMessage['type'];
  metadata?: DirectMessage['metadata'];
}): Promise<string> {
  const {
    conversationId, senderId, senderName, senderAvatar, recipientId, message,
    attachments, type = 'text', metadata
  } = params;

  const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newMsg: DirectMessage = {
    id: msgId,
    conversationId,
    senderId,
    senderName,
    senderAvatar,
    recipientId,
    message,
    attachments,
    type,
    metadata,
    read: false,
    delivered: true,
    createdAt: now
  };

  try {
    // 1. Add message doc
    const msgRef = doc(db, `conversations/${conversationId}/messages`, msgId);
    await setDoc(msgRef, newMsg);

    // 2. Update parent conversation metadata
    const convRef = doc(db, 'conversations', conversationId);
    const convSnap = await getDoc(convRef);
    let currentUnread = 1;
    if (convSnap.exists()) {
      const data = convSnap.data() as Conversation;
      currentUnread = (data.unreadCount?.[recipientId] || 0) + 1;
    }

    await updateDoc(convRef, {
      lastMessage: message,
      lastMessageTime: now,
      lastMessageSenderId: senderId,
      [`unreadCount.${recipientId}`]: currentUnread,
      updatedAt: now
    });

    // 3. Trigger notification document
    await dbCreateNotification({
      userId: recipientId,
      title: `📩 New Message from ${senderName}`,
      body: message.length > 80 ? message.substring(0, 80) + '...' : message,
      type: 'messages',
      link: `conversation:${conversationId}`,
      metadata: { conversationId, senderId }
    });

    // 4. Update local cache
    try {
      const localMsgs = JSON.parse(localStorage.getItem(`bazar360_msgs_${conversationId}`) || '[]');
      localMsgs.push(newMsg);
      localStorage.setItem(`bazar360_msgs_${conversationId}`, JSON.stringify(localMsgs));
    } catch {}

    return msgId;
  } catch (err) {
    console.warn('[Messaging] Send message Firestore bypass, saving locally:', err);
    try {
      const localMsgs = JSON.parse(localStorage.getItem(`bazar360_msgs_${conversationId}`) || '[]');
      localMsgs.push(newMsg);
      localStorage.setItem(`bazar360_msgs_${conversationId}`, JSON.stringify(localMsgs));
    } catch {}
    return msgId;
  }
}

export async function dbMarkConversationRead(conversationId: string, userId: string): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      [`unreadCount.${userId}`]: 0,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Messaging] dbMarkConversationRead error:', err);
  }
}

// ==========================================
// UNIFIED NOTIFICATION CENTER SERVICES
// ==========================================

export async function dbCreateNotification(data: Omit<UserNotification, 'id' | 'createdAt' | 'read'>): Promise<string> {
  const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const notif: UserNotification = {
    ...data,
    id: notifId,
    read: false,
    createdAt: now
  };

  try {
    await setDoc(doc(db, 'notifications', notifId), notif);

    // Save offline cache
    try {
      const localNotifs = JSON.parse(localStorage.getItem(`bazar360_notifs_${data.userId}`) || '[]');
      localNotifs.unshift(notif);
      localStorage.setItem(`bazar360_notifs_${data.userId}`, JSON.stringify(localNotifs.slice(0, 50)));
    } catch {}

    return notifId;
  } catch (err) {
    console.warn('[Notifications] Firestore create notification error, using local cache:', err);
    try {
      const localNotifs = JSON.parse(localStorage.getItem(`bazar360_notifs_${data.userId}`) || '[]');
      localNotifs.unshift(notif);
      localStorage.setItem(`bazar360_notifs_${data.userId}`, JSON.stringify(localNotifs.slice(0, 50)));
    } catch {}
    return notifId;
  }
}

export async function dbFetchNotifications(userId: string): Promise<UserNotification[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    const list: UserNotification[] = [];
    snap.forEach((docSnap) => {
      list.push({ ...docSnap.data() as UserNotification, id: docSnap.id });
    });

    // Merge offline cache
    let localNotifs: UserNotification[] = [];
    try {
      localNotifs = JSON.parse(localStorage.getItem(`bazar360_notifs_${userId}`) || '[]');
    } catch {}

    const combined = [...list];
    localNotifs.forEach(ln => {
      if (!combined.some(n => n.id === ln.id)) {
        combined.push(ln);
      }
    });

    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('[Notifications] Fetching notifications fallback to local cache:', err);
    try {
      return JSON.parse(localStorage.getItem(`bazar360_notifs_${userId}`) || '[]');
    } catch {
      return [];
    }
  }
}

export async function dbMarkNotificationRead(notifId: string, userId?: string): Promise<void> {
  try {
    const ref = doc(db, 'notifications', notifId);
    await updateDoc(ref, { read: true });

    if (userId) {
      try {
        const localNotifs: UserNotification[] = JSON.parse(localStorage.getItem(`bazar360_notifs_${userId}`) || '[]');
        const updated = localNotifs.map(n => n.id === notifId ? { ...n, read: true } : n);
        localStorage.setItem(`bazar360_notifs_${userId}`, JSON.stringify(updated));
      } catch {}
    }
  } catch (err) {
    console.warn('[Notifications] dbMarkNotificationRead error:', err);
  }
}

export async function dbMarkAllNotificationsRead(userId: string): Promise<void> {
  try {
    const notifs = await dbFetchNotifications(userId);
    const unread = notifs.filter(n => !n.read);
    const updatePromises = unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true }));
    await Promise.all(updatePromises);

    try {
      const localNotifs: UserNotification[] = JSON.parse(localStorage.getItem(`bazar360_notifs_${userId}`) || '[]');
      const updated = localNotifs.map(n => ({ ...n, read: true }));
      localStorage.setItem(`bazar360_notifs_${userId}`, JSON.stringify(updated));
    } catch {}
  } catch (err) {
    console.warn('[Notifications] dbMarkAllNotificationsRead error:', err);
  }
}

// ==========================================
// SHOWROOM REVIEWS & BUSINESS RESPONSES
// ==========================================

export async function dbAddDealerReview(dealerId: string, review: Omit<DetailedReview, 'id' | 'date'>): Promise<string> {
  const revId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const newReview: DetailedReview = {
    ...review,
    id: revId,
    date: now
  };

  try {
    const revRef = doc(db, `dealers/${dealerId}/reviews`, revId);
    await setDoc(revRef, newReview);

    // Update dealer average rating
    try {
      const dealerSnap = await getDoc(doc(db, 'dealers', dealerId));
      if (dealerSnap.exists()) {
        const dData = dealerSnap.data() as Dealer;
        const currentRating = dData.rating || 4.8;
        const newRating = Number(((currentRating + review.rating) / 2).toFixed(1));
        await updateDoc(doc(db, 'dealers', dealerId), { rating: newRating });
      }
    } catch {}

    return revId;
  } catch (err) {
    console.warn('[Reviews] dbAddDealerReview Firestore error, saving locally:', err);
    try {
      const localRevs = JSON.parse(localStorage.getItem(`bazar360_reviews_${dealerId}`) || '[]');
      localRevs.unshift(newReview);
      localStorage.setItem(`bazar360_reviews_${dealerId}`, JSON.stringify(localRevs));
    } catch {}
    return revId;
  }
}

export async function dbReplyToReview(dealerId: string, reviewId: string, replyText: string, authorName: string): Promise<void> {
  const replyObj = {
    text: replyText,
    date: new Date().toISOString(),
    author: authorName
  };

  try {
    const revRef = doc(db, `dealers/${dealerId}/reviews`, reviewId);
    await updateDoc(revRef, { reply: replyObj });
  } catch (err) {
    console.warn('[Reviews] dbReplyToReview error:', err);
  }
}






