import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore, setLogLevel, doc, getDocFromServer } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import firebaseConfig from '../firebase-applet-config.json';

setLogLevel('silent');
export const app = initializeApp(firebaseConfig);

export let appCheck: any = null;
if (typeof window !== 'undefined') {
  const siteKey = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
  const hasRealKey = siteKey && siteKey !== '6Ld_placeholder_site_key_for_recaptcha_v3' && !siteKey.includes('placeholder') && siteKey.trim() !== '';
  if (hasRealKey) {
    try {
      appCheck = initializeAppCheck(app, { provider: new ReCaptchaV3Provider(siteKey), isTokenAutoRefreshEnabled: true });
    } catch (err: any) {
      console.warn('[App Check] initialization skipped/failed:', err?.message || err);
    }
  }
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

if (typeof window !== 'undefined') {
  void getDocFromServer(doc(db, 'system', 'connection-test')).catch((error: any) => {
    console.warn('[Firestore] Initial live connection check:', error?.message || error);
  });
}

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const linkedinProvider = new OAuthProvider('linkedin.com');
export const functions = getFunctions(app, 'us-central1');

export enum OperationType { CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write' }
export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: { userId?: string | null; email?: string | null; emailVerified?: boolean | null; isAnonymous?: boolean | null; tenantId?: string | null };
}
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: { userId: auth.currentUser?.uid, email: auth.currentUser?.email, emailVerified: auth.currentUser?.emailVerified, isAnonymous: auth.currentUser?.isAnonymous, tenantId: auth.currentUser?.tenantId },
    operationType, path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
