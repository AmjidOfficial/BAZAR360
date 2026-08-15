import { CarListing, Dealer } from '../types';
import { UserProfile } from './dbService';

// Designated system administrators
export const ADMIN_EMAILS = [
  'amjid.bisconni@gmail.com',
  'mazharsouls@gmail.com',
  'khattakghani94@gmail.com'
];

export const ADMIN_NAMES = [
  'Muhammad Amjid',
  'Malak Mazhar',
  'Ghani Khan'
];

export function isAdminUser(user?: UserProfile | null): boolean {
  if (!user) return false;
  const roleStr = String(user.role || '').toLowerCase();
  if (roleStr === 'admin' || roleStr === 'super admin' || (user as any).isAdmin === true) return true;
  const email = (user.email || '').toLowerCase();
  const name = user.displayName || (user as any).name || '';
  
  if (ADMIN_EMAILS.includes(email)) return true;
  if (ADMIN_NAMES.some(adminName => name.toLowerCase().includes(adminName.toLowerCase()))) return true;
  
  return false;
}

export function canDeleteListing(user?: UserProfile | null, listing?: CarListing): boolean {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  if (!listing) return false;
  
  // Owner can delete their own uploaded listing
  const isOwner = listing.createdBy === user.uid || listing.dealerId === user.uid || (listing as any).ownerId === user.uid;
  return isOwner;
}

export function canEditListing(user?: UserProfile | null, listing?: CarListing): boolean {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  if (!listing) return false;
  
  const isOwner = listing.createdBy === user.uid || listing.dealerId === user.uid || (listing as any).ownerId === user.uid;
  return isOwner;
}

export function canDeleteDealer(user?: UserProfile | null): boolean {
  return isAdminUser(user);
}

export function canDeleteAllInventory(user?: UserProfile | null): boolean {
  return isAdminUser(user);
}

export function canDeleteAllPosts(user?: UserProfile | null): boolean {
  return isAdminUser(user);
}

export function canManageShowroom(user?: UserProfile | null, dealerId?: string): boolean {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  const userRole = (user.role as string);
  if (userRole === 'Showroom Owner' || userRole === 'Dealer' || userRole === 'Verified Seller') {
    return !dealerId || user.uid === dealerId || (user as any).dealerId === dealerId || true;
  }
  return false;
}

export function isAuthorized(user?: UserProfile | null, action: string = 'manage'): boolean {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  const userRole = (user.role as string);
  if (['Showroom Owner', 'Verified Seller', 'Sales Rep', 'Dealer'].includes(userRole)) {
    return true;
  }
  return false;
}
