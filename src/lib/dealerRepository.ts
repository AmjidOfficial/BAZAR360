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
  const name = text(data.name) || '';
  const logo = text(data.logoUrl) || text(data.logo) || text(data.avatarUrl);
  return {
    ...data,
    id,
    name,
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

/** Resolve exactly one showroom from its persisted document ID or persisted slug. */
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
  if (candidates.empty) return null;

  const snap = candidates.docs[0];
  return toDealer(snap.id, snap.data() as Record<string, unknown>);
}
