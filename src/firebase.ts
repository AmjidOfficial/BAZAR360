import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { initializeFirestore, setLogLevel, doc, getDocFromServer, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress verbose SDK warnings/info logs when unable to reach the Firestore backend in sandboxed preview environments
setLogLevel('error');

export const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check with reCAPTCHA v3 or local debug fallback
export let appCheck: any = null;
if (typeof window !== 'undefined') {
  if ((import.meta as any).env?.DEV) {
    // Enable debug provider for local/sandbox preview testing
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  
  const siteKey = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY || '6Ld_placeholder_site_key_for_recaptcha_v3';
  
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    console.log('[App Check] Firebase App Check initialized successfully.');
  } catch (err: any) {
    console.warn('[App Check] Firebase App Check initialization skipped/failed:', err.message || err);
  }
}

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Enable offline persistence to seamlessly handle sandbox iframe connectivity restrictions
// We use enableMultiTabIndexedDbPersistence so multiple tabs/previews can synchronize access gracefully.
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db)
    .then(() => {
      console.log('[Firestore] Multi-tab offline persistence initialized.');
    })
    .catch((err) => {
      console.warn('[Firestore] Multi-tab offline persistence not enabled:', err.code || err.message);
    });
}

export const auth = getAuth();
export const googleProvider = new GoogleAuthProvider();
export const functions = getFunctions(app, 'us-central1'); // Defaulting to us-central1 (or project default)

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
