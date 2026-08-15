import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc,
  query,
  where,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Dealer, CarListing } from '../types';

const SHOWROOMS_COLLECTION = 'showrooms';
const LISTINGS_COLLECTION = 'listings';

export async function dbFetchShowroomBySlug(slug: string): Promise<Dealer | null> {
  try {
    const docRef = doc(db, SHOWROOMS_COLLECTION, slug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Dealer;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${SHOWROOMS_COLLECTION}/${slug}`);
    return null;
  }
}

export async function dbToggleShowroomLike(showroomId: string, increment: boolean): Promise<void> {
  try {
    const ref = doc(db, SHOWROOMS_COLLECTION, showroomId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        throw "Showroom does not exist!";
      }
      const data = snap.data();
      const currentLikes = data.likes_count || 0;
      const newLikes = increment ? currentLikes + 1 : Math.max(0, currentLikes - 1);
      transaction.update(ref, { likes_count: newLikes });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${SHOWROOMS_COLLECTION}/${showroomId}`);
  }
}

export async function dbUpdateShowroomProfile(showroomId: string, data: Partial<Dealer>): Promise<void> {
  try {
    const ref = doc(db, SHOWROOMS_COLLECTION, showroomId);
    await updateDoc(ref, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${SHOWROOMS_COLLECTION}/${showroomId}`);
  }
}

export async function dbFetchShowroomInventory(showroomId: string): Promise<CarListing[]> {
  try {
    const q = query(collection(db, LISTINGS_COLLECTION), where('dealerId', '==', showroomId));
    const snap = await getDocs(q);
    const list: CarListing[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as CarListing);
    });
    return list;
  } catch (err) {
    console.error('Error fetching showroom inventory:', err);
    return [];
  }
}
