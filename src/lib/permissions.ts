import { CarListing, Dealer } from '../types';
import { UserProfile } from './dbService';

export const ADMIN_EMAILS = ['amjid.bisconni@gmail.com', 'mazharsouls@gmail.com', 'khattakghani94@gmail.com'];
export const ADMIN_NAMES = ['Muhammad Amjid', 'Malak Mazhar', 'Ghani Khan'];

export function isAdminUser(user?: UserProfile | null): boolean {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  if (role === 'admin' || role === 'super admin' || (user as any).isAdmin === true) return true;
  const email = (user.email || '').toLowerCase();
  const name = user.displayName || (user as any).name || '';
  return ADMIN_EMAILS.includes(email) || ADMIN_NAMES.some(adminName => name.toLowerCase().includes(adminName.toLowerCase()));
}

function userShowroomIds(user?: UserProfile | null): string[] {
  if (!user) return [];
  const ids = [user.associatedShowroomId, (user as any).dealerId, (user as any).showroomId, (user as any).salesPodId];
  return ids.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
}

function ownsListing(user: UserProfile, listing: CarListing): boolean {
  if (listing.createdBy === user.uid || listing.ownerId === user.uid) return true;
  if (listing.dealerId === user.uid) return true;
  const ownedShowrooms = userShowroomIds(user);
  return Boolean(listing.showroomId && ownedShowrooms.includes(listing.showroomId));
}

export function canDeleteListing(user?: UserProfile | null, listing?: CarListing): boolean {
  if (!user || !listing) return false;
  return isAdminUser(user) || ownsListing(user, listing);
}

export function canEditListing(user?: UserProfile | null, listing?: CarListing): boolean {
  if (!user || !listing) return false;
  return isAdminUser(user) || ownsListing(user, listing);
}

export function canDeleteDealer(user?: UserProfile | null): boolean { return isAdminUser(user); }
export function canDeleteAllInventory(user?: UserProfile | null): boolean { return isAdminUser(user); }
export function canDeleteAllPosts(user?: UserProfile | null): boolean { return isAdminUser(user); }

export function canManageShowroom(user?: UserProfile | null, dealerId?: string): boolean {
  if (!user || !dealerId) return false;
  if (isAdminUser(user)) return true;
  return userShowroomIds(user).includes(dealerId);
}

export function isAuthorized(user?: UserProfile | null, action: string = 'read', resource?: { ownerId?: string; showroomId?: string; dealerId?: string }): boolean {
  if (!user) return false;
  if (isAdminUser(user)) return true;

  const role = String(user.role || '');
  const showroomRoles = ['Showroom Owner', 'Verified Seller', 'Sales Rep', 'Dealer', 'Sales Representative'];
  if (!showroomRoles.includes(role)) return action === 'read';

  if (resource?.showroomId || resource?.dealerId) {
    return canManageShowroom(user, resource.showroomId || resource.dealerId);
  }
  if (resource?.ownerId) return resource.ownerId === user.uid;

  return ['read', 'manage_own', 'create_own'].includes(action);
}
