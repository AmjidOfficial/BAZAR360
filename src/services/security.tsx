import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return false;
    const role = userDoc.data().role;
    return role === 'Admin' || role === 'Super Admin' || role === 'Moderator';
  } catch {
    return false;
  }
}

export function protectRoute(isAdmin: boolean) {
  if (!isAdmin) {
    throw new Error('Unauthorized');
  }
}

export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  isAdmin: boolean
) {
  return (props: P) => {
    if (!isAdmin) {
      return null; // Or a redirect to access denied page
    }
    return <WrappedComponent {...props} />;
  };
}
