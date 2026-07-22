import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { UserProfile, dbSaveUserProfile, dbFetchUserProfile } from '../lib/dbService';
import { CarListing } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  role: 'Customer' | 'Showroom Owner' | 'Admin' | null;
  isCustomer: boolean;
  isShowroomOwner: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  toggleFavorite: (car: CarListing) => Promise<void>;
  favorites: CarListing[];
  recentViews: CarListing[];
  saveRecentView: (car: CarListing) => Promise<void>;
  alerts: string[];
  addAlert: (alertQuery: string) => Promise<void>;
  removeAlert: (alertQuery: string) => Promise<void>;
  registerBiometrics: () => Promise<boolean>;
  authenticateBiometrics: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bazar360_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Mapped client roles
  const [favorites, setFavorites] = useState<CarListing[]>(() => {
    try {
      const saved = localStorage.getItem('bazar360_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentViews, setRecentViews] = useState<CarListing[]>(() => {
    try {
      const saved = localStorage.getItem('bazar360_recent_views');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [alerts, setAlerts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bazar360_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isShowroomOwner = currentUser?.role === 'Showroom Owner' || currentUser?.role === 'Dealer';
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const isCustomer = !isShowroomOwner && !isAdmin;

  let derivedRole: 'Customer' | 'Showroom Owner' | 'Admin' | null = null;
  if (currentUser) {
    if (isAdmin) derivedRole = 'Admin';
    else if (isShowroomOwner) derivedRole = 'Showroom Owner';
    else derivedRole = 'Customer';
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          let profile = await dbFetchUserProfile(fUser.uid);
          
          // Elevate known developer roles for high-level administration testing
          const isDeveloper = fUser.email === 'amjid.bisconni@gmail.com' || 
                              fUser.email === 'amjid.psh@gmail.com' || 
                              fUser.email === 'khattakghani94@gmail.com';
          const isMalak = fUser.email === 'mazharsouls@gmail.com';

          if (!profile) {
            // New register onboarding with strict rules-compliant defaults
            profile = {
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
          } else {
            // Update last login
            profile = {
              ...profile,
              lastLogin: new Date().toISOString()
            };
            if (isDeveloper && profile.role !== 'Admin') {
              profile.role = 'Admin';
            }
            if (isMalak && profile.role !== 'Dealer') {
              profile.role = 'Dealer';
              profile.displayName = 'Malak Mazhar';
              profile.phoneNumber = '+923159085086';
              profile.city = 'Peshawar';
            }
            await dbSaveUserProfile(profile);
          }
          
          setCurrentUser(profile);
          localStorage.setItem('bazar360_user', JSON.stringify(profile));

          // Load profile's saved attributes if stored in Firestore
          // (Can integrate with DB favorites/alerts)
        } catch (err) {
          console.error('[AuthContext] Profile load failed:', err);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('bazar360_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('[AuthContext] Google sign-in failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('bazar360_user');
    } catch (err) {
      console.error('[AuthContext] Log out failed:', err);
      throw err;
    }
  };

  const updateProfile = async (updatedFields: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    const updatedProfile: UserProfile = {
      ...currentUser,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };

    try {
      await dbSaveUserProfile(updatedProfile);
      setCurrentUser(updatedProfile);
      localStorage.setItem('bazar360_user', JSON.stringify(updatedProfile));
    } catch (err) {
      console.error('[AuthContext] Update profile failed:', err);
      throw err;
    }
  };

  const toggleFavorite = async (car: CarListing) => {
    const exists = favorites.some((f) => f.id === car.id);
    let updated: CarListing[];
    
    if (exists) {
      updated = favorites.filter((f) => f.id !== car.id);
    } else {
      updated = [car, ...favorites];
    }
    
    setFavorites(updated);
    localStorage.setItem('bazar360_favorites', JSON.stringify(updated));

    if (currentUser) {
      try {
        // Save to Firestore collections
        const favRef = doc(db, 'users', currentUser.uid, 'favorites', car.id);
        if (exists) {
          // Delete
          const { deleteDoc } = await import('firebase/firestore');
          await deleteDoc(favRef);
        } else {
          // Set
          await setDoc(favRef, {
            id: car.id,
            addedAt: new Date().toISOString(),
            carSnapshot: {
              id: car.id,
              make: car.make,
              model: car.model,
              year: car.year,
              price: car.price,
              imageUrl: car.imageUrl,
              mileage: car.mileage,
              condition: car.condition,
              fuelType: car.fuelType,
              transmission: car.transmission
            }
          });
        }
      } catch (err) {
        console.warn('[AuthContext] DB toggle favorites failed:', err);
      }
    }
  };

  const saveRecentView = async (car: CarListing) => {
    const filtered = recentViews.filter((r) => r.id !== car.id);
    const updated = [car, ...filtered].slice(0, 10);
    setRecentViews(updated);
    localStorage.setItem('bazar360_recent_views', JSON.stringify(updated));

    if (currentUser) {
      try {
        const viewRef = doc(db, 'users', currentUser.uid, 'recent_views', car.id);
        await setDoc(viewRef, {
          id: car.id,
          viewedAt: new Date().toISOString(),
          carSnapshot: {
            id: car.id,
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price,
            imageUrl: car.imageUrl,
            mileage: car.mileage,
            condition: car.condition,
            fuelType: car.fuelType,
            transmission: car.transmission
          }
        });
      } catch (err) {
        console.warn('[AuthContext] DB save recent view failed:', err);
      }
    }
  };

  const addAlert = async (alertQuery: string) => {
    if (alerts.includes(alertQuery)) return;
    const updated = [alertQuery, ...alerts];
    setAlerts(updated);
    localStorage.setItem('bazar360_alerts', JSON.stringify(updated));

    if (currentUser) {
      try {
        const alertId = `alert-${Date.now()}`;
        const alertRef = doc(db, 'users', currentUser.uid, 'alerts', alertId);
        await setDoc(alertRef, {
          id: alertId,
          query: alertQuery,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[AuthContext] DB save alert failed:', err);
      }
    }
  };

  const removeAlert = async (alertQuery: string) => {
    const updated = alerts.filter((a) => a !== alertQuery);
    setAlerts(updated);
    localStorage.setItem('bazar360_alerts', JSON.stringify(updated));

    if (currentUser) {
      try {
        const alertRef = doc(db, 'users', currentUser.uid, 'alerts', alertQuery);
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(alertRef);
      } catch (err) {
        console.warn('[AuthContext] DB remove alert failed:', err);
      }
    }
  };

  // WebAuthn Biometric Implementation
  const registerBiometrics = async (): Promise<boolean> => {
    if (!window.PublicKeyCredential) {
      console.warn('WebAuthn not supported by this browser.');
      return false;
    }
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      const createOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Bazar360",
          id: window.location.hostname
        },
        user: {
          id: Uint8Array.from(currentUser?.uid || "user-id", c => c.charCodeAt(0)),
          name: currentUser?.email || "user@bazar360.online",
          displayName: currentUser?.displayName || "Bazar360 User"
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({ publicKey: createOptions }) as PublicKeyCredential;
      if (credential) {
        localStorage.setItem(`bazar360_biometrics_${currentUser?.uid}`, credential.id);
        if (currentUser) {
          await updateProfile({
            webAuthnCredentialId: credential.id,
            biometricRegisteredAt: new Date().toISOString()
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('[WebAuthn] Registration failed:', err);
      return false;
    }
  };

  const authenticateBiometrics = async (): Promise<boolean> => {
    if (!window.PublicKeyCredential) {
      console.warn('WebAuthn not supported by this browser.');
      return false;
    }
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const getOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({ publicKey: getOptions });
      if (assertion) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('[WebAuthn] Authentication failed:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      firebaseUser,
      loading,
      role: derivedRole,
      isCustomer,
      isShowroomOwner,
      isAdmin,
      loginWithGoogle,
      logout,
      updateProfile,
      toggleFavorite,
      favorites,
      recentViews,
      saveRecentView,
      alerts,
      addAlert,
      removeAlert,
      registerBiometrics,
      authenticateBiometrics
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
