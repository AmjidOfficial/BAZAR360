import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface RoleContextType {
  isAdmin: boolean;
  role: string | null;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType>({ isAdmin: false, role: null, loading: true });

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role);
            setIsAdmin(data.role === 'Admin' || data.role === 'Super Admin' || data.role === 'Moderator');
          }
        } catch (error) {
          console.error('Error fetching role:', error);
        }
      } else {
        setRole(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return <RoleContext.Provider value={{ isAdmin, role, loading }}>{children}</RoleContext.Provider>;
};

export const useRole = () => useContext(RoleContext);
