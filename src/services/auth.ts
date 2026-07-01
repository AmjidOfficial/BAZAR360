import { auth, googleProvider, facebookProvider, linkedinProvider, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Auth helper utilities for the app.
 * Provides email/password sign-up/sign-in and OAuth provider sign-in helpers.
 */

export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await createOrUpdateProfile(cred.user);
  return cred;
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await createOrUpdateProfile(cred.user);
  return cred;
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const cred = await signInWithPopup(auth, googleProvider);
  await createOrUpdateProfile(cred.user);
  return cred;
}

export async function signInWithFacebook(): Promise<UserCredential> {
  const cred = await signInWithPopup(auth, facebookProvider);
  await createOrUpdateProfile(cred.user);
  return cred;
}

export async function signInWithLinkedIn(): Promise<UserCredential> {
  const cred = await signInWithPopup(auth, linkedinProvider);
  await createOrUpdateProfile(cred.user);
  return cred;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

async function createOrUpdateProfile(user: any) {
  if (!user || !user.uid) return;
  try {
    const ref = doc(db, 'profiles', user.uid);
    const snapshot = await getDoc(ref);
    const defaultPhoto = '/auto_choice_logo_1781509565476.png';

    if (!snapshot.exists()) {
      await setDoc(ref, {
        id: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || defaultPhoto,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: 'showroom-owner',
      });
    } else {
      await setDoc(ref, {
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || defaultPhoto,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[Auth] Failed to create/update profile:', err);
  }
}

export default {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  signInWithLinkedIn,
  signOutUser,
};
