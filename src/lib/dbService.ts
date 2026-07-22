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
  startAfter
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { CarListing, Dealer, Review, Lead, SocialMedia } from '../types';
import { validateLead } from './leadValidator';
import { INITIAL_DEALERS, INITIAL_LISTINGS, INITIAL_REVIEWS } from '../data';

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

  // Enterprise redesign fields
  profilePhoto?: string;
  photoURL?: string; // Compatibility alias
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
  webAuthnCredentialId?: string;
  biometricRegisteredAt?: string;
}

const DEALERS_COLLECTION = 'dealers';
const LISTINGS_COLLECTION = 'listings';
const USERS_COLLECTION = 'users';

// Seed Database helper
export async function seedDatabaseIfEmpty() {
  try {
    const oldDealerIds = ['almas-car-valley', 'elite-prestige-motors', 'apex-luxury-wheels'];

    // 1. Clean up old default demo dealers from Firestore database if they exist
    for (const dId of oldDealerIds) {
      try {
        const docRef = doc(db, DEALERS_COLLECTION, dId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log(`[Database Cleanup] Deleting old demo dealer: ${dId}`);
          await deleteDoc(docRef);
        }
      } catch (e) {
        console.warn(`[Database Cleanup] Failed to delete old dealer ${dId}:`, e);
      }
    }

    // 2. Migrate existing Firestore listings for those old dealers to auto-choice-peshawar
    for (const dId of oldDealerIds) {
      try {
        const listingsQuery = query(collection(db, LISTINGS_COLLECTION), where('dealerId', '==', dId));
        const listingsSnap = await getDocs(listingsQuery);
        for (const docL of listingsSnap.docs) {
          console.log(`[Database Migration] Migrating listing ${docL.id} from ${dId} to auto-choice-peshawar`);
          await updateDoc(docL.ref, { dealerId: 'auto-choice-peshawar' });
        }
      } catch (e) {
        console.warn(`[Database Migration] Failed to migrate listings for old dealer ${dId}:`, e);
      }
    }

    // 3. Ensure Auto Choice name is updated in Firestore to "Auto Choice - The Right Choice"
    try {
      const acRef = doc(db, DEALERS_COLLECTION, 'auto-choice-peshawar');
      const acSnap = await getDoc(acRef);
      if (acSnap.exists()) {
        const currentData = acSnap.data();
        if (currentData && currentData.name !== 'Auto Choice - The Right Choice') {
          console.log('[Database Sync] Updating Auto Choice name to "Auto Choice - The Right Choice"');
          await updateDoc(acRef, { name: 'Auto Choice - The Right Choice' });
        }
      }
    } catch (e) {
      console.warn('[Database Sync] Failed to check/update Auto Choice name:', e);
    }

    // Check sentinel document to avoid 20+ parallel read queries. This is extremely fast (1 document read)
    // and ensures that if Firestore is ever reset, it auto-re-seeds on the next visit.
    const sentinelRef = doc(db, 'system', 'seeded');
    const sentinelSnap = await getDoc(sentinelRef);
    if (sentinelSnap.exists() && sentinelSnap.data()?.completed === true) {
      console.log('Firestore backend reports database is already fully seeded.');
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('bazar360_db_seeded', 'true'); } catch(e) {}
      }
      return;
    }

    console.log('Sentinel document missing. Synchronizing initial dealers & listings to Firestore in parallel...');
    
    // Concurrently verify and write dealers
    const dealerPromises = INITIAL_DEALERS.map(async (d) => {
      const docRef = doc(db, DEALERS_COLLECTION, d.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          id: d.id,
          name: d.name,
          avatarLetter: d.avatarLetter,
          avatarUrl: d.avatarUrl || '',
          subtitle: d.subtitle,
          location: d.location,
          rating: d.rating,
          vehiclesCount: d.vehiclesCount,
          followersCount: d.followersCount,
          coverImage: d.coverImage,
          description: d.description,
          phone: d.phone,
          whatsapp: d.whatsapp,
          socials: d.socials || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

    // Concurrently verify and write listings
    const listingPromises = INITIAL_LISTINGS.map(async (l) => {
      const docRef = doc(db, LISTINGS_COLLECTION, l.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          ...l,
          approved: true, // Default list seeds approved
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

    // Concurrently verify and write reviews
    const reviewPromises: Promise<void>[] = [];
    for (const dId of Object.keys(INITIAL_REVIEWS)) {
      const revs = INITIAL_REVIEWS[dId];
      for (const r of revs) {
        reviewPromises.push((async () => {
          const docRef = doc(db, `${DEALERS_COLLECTION}/${dId}/reviews`, r.id);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            await setDoc(docRef, {
              id: r.id,
              author: r.author,
              rating: r.rating,
              comment: r.comment,
              createdAt: new Date().toISOString()
            });
          }
        })());
      }
    }

    // Run ALL checks and writes concurrently
    await Promise.all([...dealerPromises, ...listingPromises, ...reviewPromises]);

    // Set the sentinel document to true
    await setDoc(sentinelRef, { completed: true, timestamp: new Date().toISOString() });

    if (typeof window !== 'undefined') {
      try { localStorage.setItem('bazar360_db_seeded', 'true'); } catch(e) {}
    }
    console.log('BAZAR360 Seeding completed/verified.');
  } catch (err) {
    console.warn('Silent seeding warning:', err);
    throw err; // rethrow so calling routine knows synchronization was bypassed/timed out
  }
}

// Memory cache for dealers and listings to enable instantaneous showroom opening
let cachedDealers: Dealer[] | null = null;
let cachedListings: CarListing[] | null = null;

export function dbInvalidateCache() {
  cachedDealers = null;
  cachedListings = null;
}

// 1. Fetch Dealers
export async function dbFetchDealers(): Promise<Dealer[]> {
  if (cachedDealers && cachedDealers.length > 0) {
    return cachedDealers;
  }
  try {
    const snap = await getDocs(collection(db, DEALERS_COLLECTION));
    if (snap.empty) {
      const fallback = INITIAL_DEALERS.map(d => d.id === 'auto-choice-peshawar' ? { ...d, name: 'Auto Choice', avatarUrl: '/auto_choice_logo_1781509565476.png', logo: '/auto_choice_logo_1781509565476.png', flagshipVerified: true } : d);
      cachedDealers = fallback;
      return fallback;
    }
    
    const list: Dealer[] = [];
    let autoChoiceMerged: Dealer | null = null;

    snap.forEach((doc) => {
      const data = doc.data();
      const rawAvatar = data.avatarUrl || '';
      
      const isAutoChoice = doc.id === 'auto-choice-peshawar' || doc.id === 'auto-choice' || (data.name && data.name.toLowerCase().includes('auto choice'));
      
      const avatarUrl = isAutoChoice
        ? '/auto_choice_logo_1781509565476.png'
        : (rawAvatar.startsWith('.') ? rawAvatar.substring(1) : rawAvatar);

      const logo = isAutoChoice
        ? '/auto_choice_logo_1781509565476.png'
        : (data.logo || '');

      const currentDealer: Dealer = {
        id: doc.id,
        name: data.name || '',
        avatarLetter: data.avatarLetter || data.name?.substring(0, 2).toUpperCase() || 'D',
        avatarUrl,
        logo,
        subtitle: data.subtitle || '',
        location: data.location || '',
        rating: typeof data.rating === 'number' ? data.rating : 4.9,
        vehiclesCount: typeof data.vehiclesCount === 'number' ? data.vehiclesCount : 0,
        followersCount: data.followersCount || '0',
        coverImage: data.coverImage || (INITIAL_DEALERS.find((d) => d.id === doc.id || (doc.id === 'auto-choice' && d.id === 'auto-choice-peshawar'))?.coverImage) || '/src/assets/images/bab_e_khyber_sunset_1783593379683.jpg',
        description: data.description || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        socials: data.socials || {},
        activityFeed: Array.isArray(data.activityFeed) ? data.activityFeed : (INITIAL_DEALERS.find((d) => d.id === doc.id)?.activityFeed || [])
      };

      if (isAutoChoice) {
        if (!autoChoiceMerged) {
          autoChoiceMerged = {
            ...currentDealer,
            id: 'auto-choice-peshawar',
            name: 'Auto Choice',
            avatarUrl: '/auto_choice_logo_1781509565476.png',
            logo: '/auto_choice_logo_1781509565476.png',
            flagshipVerified: true
          };
        } else {
          // Consolidate the data metrics gracefully
          autoChoiceMerged.vehiclesCount = Math.max(autoChoiceMerged.vehiclesCount, currentDealer.vehiclesCount);
          if (currentDealer.phone) autoChoiceMerged.phone = currentDealer.phone;
          if (currentDealer.whatsapp) autoChoiceMerged.whatsapp = currentDealer.whatsapp;
          if (currentDealer.location && currentDealer.location.includes('Ring Road')) {
            autoChoiceMerged.location = currentDealer.location;
          }
          if (currentDealer.description && currentDealer.description.length > autoChoiceMerged.description.length) {
            autoChoiceMerged.description = currentDealer.description;
          }
          if (currentDealer.activityFeed && currentDealer.activityFeed.length > 0) {
            const existingIds = new Set(autoChoiceMerged.activityFeed.map(act => act.id));
            currentDealer.activityFeed.forEach(act => {
              if (!existingIds.has(act.id)) {
                autoChoiceMerged!.activityFeed.push(act);
              }
            });
          }
        }
      } else {
        list.push(currentDealer);
      }
    });

    // Ensure Auto Choice is at the front of the list and verified
    if (autoChoiceMerged) {
      list.unshift(autoChoiceMerged);
    } else {
      const initialAC = INITIAL_DEALERS.find(d => d.id === 'auto-choice-peshawar');
      if (initialAC) {
        list.unshift({
          ...initialAC,
          name: 'Auto Choice',
          avatarUrl: '/auto_choice_logo_1781509565476.png',
          logo: '/auto_choice_logo_1781509565476.png',
          flagshipVerified: true
        });
      }
    }

    cachedDealers = list;
    return list;
  } catch (err) {
    console.error('dbFetchDealers Error:', err);
    const fallback = INITIAL_DEALERS.map(d => d.id === 'auto-choice-peshawar' ? { ...d, name: 'Auto Choice', avatarUrl: '/auto_choice_logo_1781509565476.png', logo: '/auto_choice_logo_1781509565476.png', flagshipVerified: true } : d);
    cachedDealers = fallback;
    return fallback;
  }
}

// 2. Fetch Listings (all approved, as well as unapproved if requestor has permission)
export async function dbFetchListings(): Promise<CarListing[]> {
  if (cachedListings && cachedListings.length > 0) {
    return cachedListings;
  }
  try {
    const snap = await getDocs(collection(db, LISTINGS_COLLECTION));
    if (snap.empty) {
      cachedListings = INITIAL_LISTINGS;
      return INITIAL_LISTINGS;
    }
    const list: CarListing[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push(mapListingDoc(doc.id, data));
    });
    cachedListings = list;
    return list;
  } catch (err) {
    console.error('dbFetchListings Error:', err);
    return INITIAL_LISTINGS;
  }
}

export async function dbFetchListingsPaginated(lastDocSnap?: any, limitCount: number = 8): Promise<{ listings: CarListing[], lastVisible: any }> {
  try {
    let q = query(collection(db, LISTINGS_COLLECTION), orderBy('createdAt', 'desc'), limit(limitCount));
    
    if (lastDocSnap) {
      q = query(collection(db, LISTINGS_COLLECTION), orderBy('createdAt', 'desc'), startAfter(lastDocSnap), limit(limitCount));
    }
    
    const snap = await getDocs(q);
    if (snap.empty) {
      return { listings: [], lastVisible: null };
    }
    
    const list: CarListing[] = [];
    snap.forEach((doc) => {
      list.push(mapListingDoc(doc.id, doc.data()));
    });
    
    const lastVisible = snap.docs[snap.docs.length - 1];
    return { listings: list, lastVisible };
  } catch (err) {
    console.error('dbFetchListingsPaginated Error:', err);
    return { listings: [], lastVisible: null };
  }
}

function mapListingDoc(id: string, data: any): CarListing {
  return {
    id,
    title: data.title || '',
    make: data.make || '',
    model: data.model || '',
    year: Number(data.year) || 2024,
    price: Number(data.price) || 0,
    mileage: Number(data.mileage) || 0,
    fuelType: data.fuelType || 'Petrol',
    transmission: data.transmission || 'Automatic',
    imageUrl: data.imageUrl || '',
    verified: !!data.verified,
    featured: !!data.featured,
    approved: data.approved !== false,
    dealerId: (data.dealerId === 'auto-choice' || (data.dealerId && data.dealerId.includes('auto-choice'))) ? 'auto-choice-peshawar' : (data.dealerId || 'private'),
    description: data.description || '',
    createdAt: data.createdAt || new Date().toISOString(),
    tags: Array.isArray(data.tags) ? data.tags : [],
    specs: data.specs || {
      color: data.exteriorColor || 'Standard',
      engineSize: data.engineCC ? `${data.engineCC} CC` : '2000 CC',
      horspower: '150 hp',
      regionalSpecs: data.assemblyType || 'Local'
    },
    condition: data.condition || 'Used',
    engineCC: Number(data.engineCC) || 2000,
    exteriorColor: data.exteriorColor || data.specs?.color || 'Standard White',
    bodyCondition: data.bodyCondition || 'Total Genuine',
    registrationCity: data.registrationCity || 'Peshawar',
    documentType: data.documentType || 'Smart Card',
    tokenTaxPaid: data.tokenTaxPaid !== false,
    images: Array.isArray(data.images) ? data.images : (data.imageUrl ? [data.imageUrl] : []),
    assemblyType: data.assemblyType || 'Local',
    dentPaintDescription: data.dentPaintDescription || '',
    tokenTaxStatus: data.tokenTaxStatus || 'Paid'
  };
}

// Helper to recursively remove undefined fields from Firestore payloads to satisfy JS SDK rules
function cleanPayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanPayload(item)) as any;
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
    
    const payload = cleanPayload({
      ...profile,
      updatedAt: timeStr
    });

    // Save to /users
    await setDoc(userDocRef, payload);

    // Save to /profiles (split-collection personal details)
    await setDoc(profileDocRef, payload);

    console.log('User profile saved successfully to Firestore /users and /profiles:', profile.uid);

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
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn(`Could not fetch profile for user ${uid}, returning null`, err);
    return null;
  }
}

// 5. Create Dealership Programmatically
export async function dbRegisterDealership(dealer: Omit<Dealer, 'activityFeed'>): Promise<void> {
  try {
    await setDoc(doc(db, DEALERS_COLLECTION, dealer.id), {
      ...dealer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Showroom saved successfully:', dealer.id);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${DEALERS_COLLECTION}/${dealer.id}`);
  }
}

// 5b. Delete Dealership Programmatically
export async function dbDeleteDealership(dealerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, DEALERS_COLLECTION, dealerId));
    console.log('Showroom deleted successfully:', dealerId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${DEALERS_COLLECTION}/${dealerId}`);
  }
}

// 5c. Update Dealership Programmatically
export async function dbUpdateDealer(dealerId: string, data: Partial<Dealer>): Promise<void> {
  try {
    const ref = doc(db, DEALERS_COLLECTION, dealerId);
    await updateDoc(ref, cleanPayload({
      ...data,
      updatedAt: new Date().toISOString()
    }));
    if (cachedDealers) {
      cachedDealers = cachedDealers.map(d => d.id === dealerId ? { ...d, ...data } : d);
    }
    console.log('Showroom updated successfully:', dealerId);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${DEALERS_COLLECTION}/${dealerId}`);
  }
}

// 6. Post advertisement listed by Private Seller or Showroom dealer
export async function dbSaveListing(listing: CarListing): Promise<void> {
  // Enforce constraints
  if (listing.price < 0) throw new Error('Price cannot be negative');
  if (listing.year < 1980) throw new Error('Model year must be 1980 or later');

  try {
    await setDoc(doc(db, LISTINGS_COLLECTION, listing.id), cleanPayload({
      ...listing,
      createdAt: listing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    if (cachedListings) {
      const idx = cachedListings.findIndex(l => l.id === listing.id);
      if (idx > -1) {
        cachedListings[idx] = { ...cachedListings[idx], ...listing };
      } else {
        cachedListings = [listing, ...cachedListings];
      }
    }
    console.log('Listing saved to database:', listing.id);
  } catch (err) {
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
  } catch (err) {
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
    console.log('Listing deleted successfully:', listingId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${LISTINGS_COLLECTION}/${listingId}`);
  }
}

// Update User Profile (Partial)
export async function dbUpdateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const profileDocRef = doc(db, 'profiles', uid);
    const payload = cleanPayload({
      ...data,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(userDocRef, payload);
    await updateDoc(profileDocRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
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
    console.warn('Silent comment save fallback:', err);
    // If we're offline, save to local storage fallback
    try {
      const stored = localStorage.getItem(`bazar360_comments_${listingId}`);
      const comments = stored ? JSON.parse(stored) : [];
      comments.push(comment);
      localStorage.setItem(`bazar360_comments_${listingId}`, JSON.stringify(comments));
    } catch (e) {}
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
    console.warn('Silent lead action save fallback (local storage):', err);
    // LocalStorage fallback so the app continues operating perfectly offline
    try {
      const cached = localStorage.getItem('bazar360_offline_actions');
      const list = cached ? JSON.parse(cached) : [];
      list.push({ ...action, id: `offline-${Date.now()}`, createdAt: new Date().toISOString() });
      localStorage.setItem('bazar360_offline_actions', JSON.stringify(list));
    } catch (e) {}
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

export async function dbFetchNotifications(userId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
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
    const snap = await getDocs(collection(db, 'listings'));
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
          dealerId: userRole === 'Dealer' ? 'auto-choice-peshawar' : 'private',
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



