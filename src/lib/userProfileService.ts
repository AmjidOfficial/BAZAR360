import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile, dbUpdateProfile, dbSaveUserProfile, dbFetchUserProfile } from './dbService';
import { CarListing, UserNotification, Conversation } from '../types';

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string; // e.g. 'LOGIN', 'UPDATE_PROFILE', 'POST_VEHICLE', 'FAVORITE_ADD', 'FAVORITE_REMOVE', 'UPDATE_SECURITY'
  description: string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
}

export interface UserSavedSearch {
  id: string;
  userId: string;
  title: string;
  query: string;
  filters: {
    make?: string;
    model?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    bodyType?: string;
    fuelType?: string;
    transmission?: string;
  };
  alertsEnabled: boolean;
  createdAt: string;
}

// ==========================================
// DYNAMIC PROFILE COMPLETION CALCULATION
// ==========================================
export interface ProfileCompletionResult {
  percentage: number;
  completedFieldsCount: number;
  totalFieldsCount: number;
  missingFields: { key: string; label: string }[];
}

export function calculateProfileCompletion(profile: UserProfile | null): ProfileCompletionResult {
  if (!profile) {
    return { percentage: 0, completedFieldsCount: 0, totalFieldsCount: 10, missingFields: [] };
  }

  const fieldsToCheck: { key: string; label: string; isComplete: (p: UserProfile) => boolean }[] = [
    { key: 'displayName', label: 'Full Name', isComplete: (p) => !!p.displayName && p.displayName.trim() !== '' && p.displayName !== 'Guest User' },
    { key: 'phoneNumber', label: 'Mobile Number', isComplete: (p) => !!p.phoneNumber && p.phoneNumber.trim() !== '' },
    { key: 'email', label: 'Email Address', isComplete: (p) => !!p.email && p.email.trim() !== '' && !p.email.includes('guest') },
    { key: 'photoURL', label: 'Profile Photo', isComplete: (p) => !!(p.photoURL || p.profilePhoto) },
    { key: 'city', label: 'City', isComplete: (p) => !!p.city && p.city.trim() !== '' },
    { key: 'address', label: 'Address / Area', isComplete: (p) => !!p.address && p.address.trim() !== '' },
    { key: 'gender', label: 'Gender', isComplete: (p) => !!p.gender && p.gender.trim() !== '' },
    { key: 'dob', label: 'Date of Birth', isComplete: (p) => !!p.dob && p.dob.trim() !== '' },
    { key: 'bio', label: 'Biography', isComplete: (p) => !!p.bio && p.bio.trim() !== '' },
    { key: 'preferredLanguage', label: 'Preferred Language', isComplete: (p) => !!p.preferredLanguage }
  ];

  let completedCount = 0;
  const missing: { key: string; label: string }[] = [];

  fieldsToCheck.forEach(field => {
    if (field.isComplete(profile)) {
      completedCount++;
    } else {
      missing.push({ key: field.key, label: field.label });
    }
  });

  const percentage = Math.round((completedCount / fieldsToCheck.length) * 100);

  return {
    percentage,
    completedFieldsCount: completedCount,
    totalFieldsCount: fieldsToCheck.length,
    missingFields: missing
  };
}

// ==========================================
// USER ACTIVITY LOG SERVICES
// ==========================================
export async function dbLogUserActivity(logData: Omit<UserActivityLog, 'id' | 'timestamp'>): Promise<void> {
  const logId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const log: UserActivityLog = {
    ...logData,
    id: logId,
    timestamp: new Date().toISOString(),
    device: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'Web Browser'
  };

  try {
    const ref = doc(db, 'users', logData.userId, 'activity_logs', logId);
    await setDoc(ref, log);
  } catch (err) {
    console.warn('[ProfileService] Activity log Firestore write fallback to local cache:', err);
  }

  // Update local cache of activity
  try {
    const cached = JSON.parse(localStorage.getItem(`bazar360_activity_${logData.userId}`) || '[]');
    cached.unshift(log);
    localStorage.setItem(`bazar360_activity_${logData.userId}`, JSON.stringify(cached.slice(0, 50)));
  } catch (e) {}
}

export async function dbFetchUserActivityLogs(userId: string): Promise<UserActivityLog[]> {
  try {
    const q = query(
      collection(db, 'users', userId, 'activity_logs'),
      orderBy('timestamp', 'desc'),
      limit(30)
    );
    const snap = await getDocs(q);
    const logs: UserActivityLog[] = [];
    snap.forEach(d => logs.push(d.data() as UserActivityLog));

    if (logs.length > 0) {
      try {
        localStorage.setItem(`bazar360_activity_${userId}`, JSON.stringify(logs));
      } catch (e) {}
      return logs;
    }
  } catch (err) {
    console.warn('[ProfileService] Fetch activity logs Firestore fallback to cache:', err);
  }

  // Fallback to local cache
  try {
    const cached = localStorage.getItem(`bazar360_activity_${userId}`);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  return [];
}

// ==========================================
// SAVED SEARCHES SERVICES
// ==========================================
export async function dbSaveUserSavedSearch(searchData: Omit<UserSavedSearch, 'id' | 'createdAt'>): Promise<string> {
  const searchId = `search-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const item: UserSavedSearch = {
    ...searchData,
    id: searchId,
    createdAt: new Date().toISOString()
  };

  try {
    const ref = doc(db, 'users', searchData.userId, 'saved_searches', searchId);
    await setDoc(ref, item);
  } catch (err) {
    console.warn('[ProfileService] Saved search Firestore fallback:', err);
  }

  // Local cache update
  try {
    const cached = JSON.parse(localStorage.getItem(`bazar360_saved_searches_${searchData.userId}`) || '[]');
    cached.unshift(item);
    localStorage.setItem(`bazar360_saved_searches_${searchData.userId}`, JSON.stringify(cached));
  } catch (e) {}

  return searchId;
}

export async function dbFetchUserSavedSearches(userId: string): Promise<UserSavedSearch[]> {
  try {
    const q = query(collection(db, 'users', userId, 'saved_searches'));
    const snap = await getDocs(q);
    const list: UserSavedSearch[] = [];
    snap.forEach(d => list.push(d.data() as UserSavedSearch));

    if (list.length > 0) {
      try {
        localStorage.setItem(`bazar360_saved_searches_${userId}`, JSON.stringify(list));
      } catch (e) {}
      return list;
    }
  } catch (err) {
    console.warn('[ProfileService] Fetch saved searches fallback:', err);
  }

  try {
    const cached = localStorage.getItem(`bazar360_saved_searches_${userId}`);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  return [];
}

export async function dbDeleteUserSavedSearch(userId: string, searchId: string): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'saved_searches', searchId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('[ProfileService] Delete saved search Firestore error:', err);
  }

  try {
    const cached: UserSavedSearch[] = JSON.parse(localStorage.getItem(`bazar360_saved_searches_${userId}`) || '[]');
    const filtered = cached.filter(s => s.id !== searchId);
    localStorage.setItem(`bazar360_saved_searches_${userId}`, JSON.stringify(filtered));
  } catch (e) {}
}

export async function dbToggleSavedSearchAlert(userId: string, searchId: string, enabled: boolean): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'saved_searches', searchId);
    await updateDoc(ref, { alertsEnabled: enabled });
  } catch (err) {
    console.warn('[ProfileService] Toggle saved search alert error:', err);
  }

  try {
    const cached: UserSavedSearch[] = JSON.parse(localStorage.getItem(`bazar360_saved_searches_${userId}`) || '[]');
    const updated = cached.map(s => s.id === searchId ? { ...s, alertsEnabled: enabled } : s);
    localStorage.setItem(`bazar360_saved_searches_${userId}`, JSON.stringify(updated));
  } catch (e) {}
}

// ==========================================
// ACCOUNT DELETION
// ==========================================
export async function dbDeleteUserAccount(userId: string): Promise<void> {
  try {
    // 1. Update user document to status = 'Deleted'
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'Deleted',
      updatedAt: new Date().toISOString()
    });

    // 2. Log final activity
    await dbLogUserActivity({
      userId,
      action: 'ACCOUNT_DELETED',
      description: 'Account requested soft-deletion and data privacy cleanup.'
    });

    // 3. Clear local storage caches
    localStorage.removeItem('bazar360_user');
    localStorage.removeItem(`bazar360_activity_${userId}`);
    localStorage.removeItem(`bazar360_saved_searches_${userId}`);
    localStorage.removeItem(`bazar360_favorites`);
  } catch (err) {
    console.error('[ProfileService] Account deletion error:', err);
    throw err;
  }
}
