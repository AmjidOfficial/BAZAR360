/**
 * CarBazar-360 Authenticators & Backend Cloud Triggers
 * Architect: bazar360-architect
 * Target: Enterprise Multi-Tenant Automotive Marketplace
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize firebase admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const USERS_COLLECTION = 'users';

/**
 * 1. AUTOMATIC CLOUD FUNCTION TRIGGER (Auth onCreate)
 * Automatically runs the moment a brand new user authenticates with Bazar360
 * via any federated login provider (Google, Facebook, LinkedIn) or Email signup.
 * 
 * Guarantees zero-trust security and a single source-of-truth in the Firestore DB.
 */
export const onUserSignupTrigger = functions.auth.user().onCreate(async (userRecord) => {
  const { uid, email, displayName, phoneNumber, providerData } = userRecord;

  // Retrieve provider metadata to determine which federated system was used
  const providerId = providerData.length > 0 ? providerData[0].providerId : 'email';
  
  console.log(`Bazar360-Architect: Processing new user signup trigger for UID: ${uid} (via ${providerId})`);

  // Define long-term enterprise profile model matching our firebase-blueprint.json
  const defaultUserProfile = {
    uid: uid,
    email: email || '',
    displayName: displayName || (email ? email.split('@')[0] : 'Bazar360 Member'),
    phoneNumber: phoneNumber || '',
    phoneVerified: !!phoneNumber, // Automatically true if provider verified
    city: 'Lahore', // Default registration tier city
    state: 'Punjab', // Default registration tier state
    role: 'Buyer', // Default safe privilege level on first signup
    status: 'Active', // Default status upon successfully signing up
    socials: {
      website: '',
      instagram: '',
      facebook: '',
      linkedin: '',
      twitter: ''
    },
    federatedProvider: providerId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    const userDocRef = db.collection(USERS_COLLECTION).doc(uid);
    
    // Write atomically in Firestore using transactional check
    await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(userDocRef);
      if (!docSnap.exists) {
        transaction.set(userDocRef, defaultUserProfile);
        console.log(`✓ successfully initialized client document for UID: ${uid}`);
      } else {
        console.log(`Document already exists for UID: ${uid}. Skipping creation.`);
      }
    });
  } catch (error) {
    console.error(`❌ Fatal triggered signup routine for UID: ${uid}:`, error);
    throw new functions.https.HttpsError('internal', 'Autonomous registration sequence failed.');
  }
});


/**
 * 2. FEDERATED SOCIAL LOGINS CONFIGURATORS (Client-Side Guide)
 * Use these standard, validated SDK actions on the front-end to trigger logins.
 */
export const clientSocialLogins = {
  /**
   * Google Sign-in initialization & action
   */
  google: {
    scopes: ['email', 'profile'],
    customParameters: { prompt: 'select_account' }
  },

  /**
   * Facebook Sign-in configuration
   * Note: Requires Facebook App ID configured in the Firebase Console Settings.
   */
  facebook: {
    scopes: ['public_profile', 'email'],
    authUri: 'https://www.facebook.com/v12.0/dialog/oauth'
  },

  /**
   * LinkedIn Custom OpenID Connect configuration
   * Note: Handled via Firebase OAuthProvider using the custom 'linkedin.com' identity tenant.
   */
  linkedin: {
    providerId: 'oidc.linkedin',
    scopes: ['openid', 'profile', 'email']
  }
};
