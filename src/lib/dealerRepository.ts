import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Dealer } from '../types';

const DEALERS_COLLECTION = 'dealers';

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function number(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function toDealer(id: string, data: Record<string, unknown>): Dealer {
  const name = id === 'auto-choice-peshawar' ? 'Auto Choice Peshawar' : (text(data.name) || '');
  const slug = id === 'auto-choice-peshawar' ? 'auto-choice-peshawar' : (text(data.slug) || '');
  const logo = text(data.logoUrl) || text(data.logo) || text(data.avatarUrl);
  return {
    ...data,
    id,
    name,
    slug,
    avatarLetter: text(data.avatarLetter) || (name ? name.substring(0, 2).toUpperCase() : undefined),
    avatarUrl: text(data.avatarUrl),
    profilePictureUrl: text(data.profilePictureUrl),
    logo,
    logoUrl: logo,
    subtitle: text(data.subtitle),
    location: text(data.location),
    rating: number(data.rating),
    vehiclesCount: number(data.vehiclesCount),
    followersCount: text(data.followersCount),
    coverImage: text(data.coverImage),
    description: text(data.description),
    about: text(data.about),
    phone: text(data.phone),
    whatsapp: text(data.whatsapp),
    landline: text(data.landline),
    contactPerson: text(data.contactPerson),
    email: text(data.email),
    verified: data.verified === true,
    flagshipVerified: data.flagshipVerified === true,
    likesCount: number(data.likesCount),
    likes_count: number(data.likes_count),
    tagline: text(data.tagline),
    updatedAt: text(data.updatedAt),
  };
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

/** Resolve exactly one showroom without loading the entire dealer collection. */
export async function fetchDealerByIdOrSlug(value: string): Promise<Dealer | null> {
  const key = value.trim();
  if (!key) return null;

  const direct = await getDoc(doc(db, DEALERS_COLLECTION, key));
  if (direct.exists()) return toDealer(direct.id, direct.data() as Record<string, unknown>);

  const candidates = await getDocs(query(
    collection(db, DEALERS_COLLECTION),
    where('slug', '==', key),
    limit(1),
  ));
  if (!candidates.empty) {
    const snap = candidates.docs[0];
    return toDealer(snap.id, snap.data() as Record<string, unknown>);
  }

  // Backward-compatible slug resolution only. It returns a real persisted dealer.
  const allByName = await getDocs(query(collection(db, DEALERS_COLLECTION), limit(100)));
  const match = allByName.docs.find(snap => slugify(text(snap.data().name) || '') === key.toLowerCase());
  return match ? toDealer(match.id, match.data() as Record<string, unknown>) : null;
}
