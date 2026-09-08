/**
 * AuthService.ts
 * Centralized, production-ready authentication controller for Bazar360.online.
 * Handles Firebase Auth & profile state synchronization securely.
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, linkedinProvider } from '../firebase';
import { UserProfile, dbSaveUserProfile, dbFetchUserProfile } from '../lib/dbService';

export const AuthService = {
  /**
   * Log in with Email and Password
   */
  async loginWithEmail(email: string, password: string): Promise<UserProfile> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    let profile = await dbFetchUserProfile(result.user.uid);
    if (!profile) {
      profile = await this.createDefaultProfile(result.user);
    }
    return profile;
  },

  /**
   * Register with Email and Password
   */
  async registerWithEmail(email: string, password: string, displayName: string, role: string = 'Individual User'): Promise<UserProfile> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const profile: UserProfile = {
      uid: result.user.uid,
      email: result.user.email || email,
      displayName: displayName || 'New User',
      phoneNumber: '',
      phoneVerified: false,
      role: role as any,
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      city: 'Peshawar',
      state: 'Khyber Pakhtunkhwa'
    };
    await dbSaveUserProfile(profile);
    return profile;
  },

  /**
   * Google Social Auth Provider
   */
  async loginWithGoogle(): Promise<UserProfile> {
    const result = await signInWithPopup(auth, googleProvider);
    let profile = await dbFetchUserProfile(result.user.uid);
    if (!profile) {
      profile = await this.createDefaultProfile(result.user);
    }
    return profile;
  },

  /**
   * Facebook Social Auth Provider
   */
  async loginWithFacebook(): Promise<UserProfile> {
    const result = await signInWithPopup(auth, facebookProvider);
    let profile = await dbFetchUserProfile(result.user.uid);
    if (!profile) {
      profile = await this.createDefaultProfile(result.user);
    }
    return profile;
  },

  /**
   * LinkedIn Social Auth Provider
   */
  async loginWithLinkedIn(): Promise<UserProfile> {
    const result = await signInWithPopup(auth, linkedinProvider);
    let profile = await dbFetchUserProfile(result.user.uid);
    if (!profile) {
      profile = await this.createDefaultProfile(result.user);
    }
    return profile;
  },

  /**
   * Sign Out current user session
   */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Helper to create a fallback default profile if none exists in Firestore database
   */
  async createDefaultProfile(fUser: FirebaseUser): Promise<UserProfile> {
    const isDeveloper = fUser.email === 'amjid.bisconni@gmail.com' || 
                        fUser.email === 'amjid.psh@gmail.com' || 
                        fUser.email === 'khattakghani94@gmail.com';
    const isMalak = fUser.email === 'mazharsouls@gmail.com';

    const profile: UserProfile = {
      uid: fUser.uid,
      email: fUser.email || 'user@bazar360.online',
      displayName: isMalak ? 'Malak Mazhar' : (fUser.displayName || 'Guest User'),
      phoneNumber: isMalak ? '+923159085086' : (fUser.phoneNumber || ''),
      phoneVerified: isMalak || !!fUser.phoneNumber,
      role: isMalak ? 'Dealer' : (isDeveloper ? 'Admin' : 'Individual User'),
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      city: 'Peshawar',
      state: 'Khyber Pakhtunkhwa'
    };
    await dbSaveUserProfile(profile);
    return profile;
  }
};
