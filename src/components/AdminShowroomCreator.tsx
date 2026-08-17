import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, MapPin, Phone, Plus, ShieldCheck, Sparkles, Store, X } from 'lucide-react';
import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ADMIN_EMAILS, isAdminUser } from '../lib/permissions';
import { toast } from 'react-hot-toast';

type ShowroomDraft = {
  name: string; slug: string; city: string; region: string; address: string; phone: string;
  whatsapp: string; email: string; ownerUid: string; ownerName: string; description: string;
  logo: string; coverImage: string; tagline: string;
};

const EMPTY: ShowroomDraft = {
  name: '', slug: '', city: '', region: 'Khyber Pakhtunkhwa', address: '', phone: '', whatsapp: '',
  email: '', ownerUid: '', ownerName: '', description: '', logo: '', coverImage: '', tagline: '',
};

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

export default function AdminShowroomCreator() {
  const [draft, setDraft] = useState<ShowroomDraft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showrooms, setShowrooms] = useState<Array<Record<string, any>>>([]);
  const [showForm, setShowForm] = useState(true);

  const currentEmail = (auth.currentUser?.email || '').toLowerCase();
  const isAdmin = useMemo(() => {
    const user: any = auth.currentUser;
    return ADMIN_EMAILS.includes(currentEmail) || isAdminUser(user);
  }, [currentEmail]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!isAdmin) { if (alive) setLoading(false); return; }
      try {
        const snap = await getDocs(collection(db, 'dealers'));
        if (alive) setShowrooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('[AdminShowroomCreator] Failed to load showrooms:', error);
        if (alive) toast.error('Could not load live showroom records.');
      } finally { if (alive) setLoading(false); }
    };
    void load();
    return () => { alive = false; };
  }, [isAdmin]);

  const setField = (key: keyof ShowroomDraft, value: string) => setDraft(prev => ({ ...prev, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user || !isAdmin) { toast.error('Admin access is required.'); return; }
    const name = draft.name.trim();
    const slug = slugify(draft.slug || draft.name);
    if (!name || !slug || !draft.city.trim() || !draft.address.trim() || !draft.phone.trim()) {
      toast.error('Name, city, address and phone are required.'); return;
    }
    setBusy(true);
    try {
      const existing = await getDocs(collection(db, 'dealers'));
      if (existing.docs.some(existingDoc => existingDoc.id === slug)) {
        toast.error('A showroom with this ID already exists.'); return;
      }
      const payload: Record<string, any> = {
        name, slug, ownerUid: draft.ownerUid.trim() || user.uid, createdBy: user.uid,
        createdByEmail: user.email || undefined, description: draft.description.trim(),
        city: draft.city.trim(), region: draft.region.trim(), location: draft.address.trim(),
        address: draft.address.trim(), phone: draft.phone.trim(), verified: true, status: 'active',
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      };
      if (draft.ownerName.trim()) payload.ownerName = draft.ownerName.trim();
      if (draft.whatsapp.trim()) payload.whatsapp = draft.whatsapp.trim();
      if (draft.email.trim()) payload.email = draft.email.trim();
      if (draft.logo.trim()) payload.logo = draft.logo.trim();
      if (draft.coverImage.trim()) payload.coverImage = draft.coverImage.trim();
      if (draft.tagline.trim()) payload.tagline = draft.tagline.trim();
      await setDoc(doc(db, 'dealers', slug), payload);
      setShowrooms(prev => [...prev, { id: slug, ...payload }]);
      setDraft(EMPTY);
      toast.success('Showroom created in live Firestore.');
    } catch (error) {
      console.error('[AdminShowroomCreator] Create failed:', error);
      toast.error('Showroom could not be created. Check Firestore rules.');
    } finally { setBusy(false); }
  };

  if (!isAdmin) {
    return <section className="min-h-[70vh] flex items-center justify-center p-6 bg-[var(--color-bg-primary)]"><div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-bg-secondary/80 p-8 text-center shadow-2xl"><ShieldCheck className="mx-auto text-rose-400 mb-4" size={42} /><h1 className="text-xl font-black text-[var(--color-text-header)]">Admin access required</h1><p className="text-sm text-[var(--color-text-muted)] mt-2">This module writes directly to the live showroom registry.</p></div></section>;
  }

  const inputClass = 'w-full rounded-xl border border-border-main bg-bg-primary px-4 py-3 text-sm text-[var(--color-text-header)] outline-none focus:border-orange-500 transition-colors';
  const labelClass = 'text-[10px] font-mono font-black uppercase tracking-widest text-[var(--color-text-muted)]';
  const fields: Array<[keyof ShowroomDraft, string, string]> = [
    ['name', 'Showroom name', 'e.g. Auto Choice'], ['slug', 'URL slug', 'auto-choice-peshawar'], ['city', 'City', 'Peshawar'],
    ['region', 'Region', 'Khyber Pakhtunkhwa'], ['address', 'Full address', 'Exact showroom address'], ['phone', 'Phone', 'Exact public phone'],
    ['whatsapp', 'WhatsApp', 'Exact WhatsApp number'], ['email', 'Public email', 'Exact showroom email'], ['ownerUid', 'Owner Firebase UID', 'Optional, if owner already exists'],
    ['ownerName', 'Owner name', 'Optional'], ['logo', 'Logo URL', 'Cloudinary/Firebase URL'], ['coverImage', 'Cover image URL', 'Cloudinary/Firebase URL'], ['tagline', 'Tagline', 'Only if supplied'],
  ];

  return <section className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-main)] p-4 sm:p-6 lg:p-10"><div className="mx-auto max-w-7xl space-y-6">
    <header className="rounded-3xl border border-border-main bg-bg-secondary/70 p-5 sm:p-7 shadow-2xl backdrop-blur-xl"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-2 flex items-center gap-2 text-orange-400"><Store size={18} /><span className="text-[10px] font-mono font-black uppercase tracking-[0.2em]">Admin • Showroom Registry</span></div><h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-text-header)]">Create a real showroom</h1><p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">Every field is saved as provided. No ratings, inventory counts, addresses or images are invented.</p></div><button onClick={() => setShowForm(v => !v)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-orange-400 transition-colors">{showForm ? <X size={15} /> : <Plus size={15} />}{showForm ? 'Close form' : 'Create showroom'}</button></div></header>

    {showForm && <form onSubmit={submit} className="rounded-3xl border border-border-main bg-bg-secondary/70 p-5 sm:p-7 shadow-2xl"><div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map(([key, label, placeholder]) => <label key={key} className="space-y-2"><span className={labelClass}>{label}</span><input className={inputClass} value={draft[key]} placeholder={placeholder} onChange={e => setField(key, e.target.value)} /></label>)}
      <label className="space-y-2 sm:col-span-2 lg:col-span-3"><span className={labelClass}>Description</span><textarea className={`${inputClass} min-h-28 resize-y`} value={draft.description} placeholder="Real showroom description supplied by Admin." onChange={e => setField('description', e.target.value)} /></label>
    </div><div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[var(--color-text-muted)]"><span className="text-orange-400 font-bold">Live Firestore:</span> dealers/{slugify(draft.slug || draft.name) || 'showroom-id'}</p><button disabled={busy} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 disabled:opacity-50 hover:bg-orange-400 transition-colors"><CheckCircle2 size={15} />{busy ? 'Saving...' : 'Create showroom'}</button></div></form>}

    <div className="rounded-3xl border border-border-main bg-bg-secondary/70 p-5 sm:p-7 shadow-2xl"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-[var(--color-text-header)]">Live showroom registry</h2><p className="text-xs text-[var(--color-text-muted)] mt-1">{loading ? 'Reading Firestore...' : `${showrooms.length} real showroom record${showrooms.length === 1 ? '' : 's'}`}</p></div><Building2 size={20} className="text-orange-400" /></div>{showrooms.length === 0 && !loading ? <div className="rounded-2xl border border-dashed border-border-main p-10 text-center text-sm text-[var(--color-text-muted)]">No showroom records found in Firestore.</div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{showrooms.map(showroom => <article key={showroom.id} className="rounded-2xl border border-border-main bg-bg-primary/60 p-4 hover:border-orange-500/40 transition-colors"><div className="flex items-start gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border-main bg-bg-secondary flex items-center justify-center">{showroom.logo ? <img src={showroom.logo} alt="" className="h-full w-full object-contain" /> : <Building2 size={20} className="text-orange-400" />}</div><div className="min-w-0"><h3 className="font-black text-[var(--color-text-header)] truncate">{showroom.name}</h3><p className="text-[10px] text-[var(--color-text-muted)] font-mono truncate">{showroom.id}</p></div></div><div className="mt-4 space-y-2 text-xs text-[var(--color-text-muted)]">{showroom.city && <div className="flex items-center gap-2"><MapPin size={13} />{showroom.city}</div>}{showroom.phone && <div className="flex items-center gap-2"><Phone size={13} />{showroom.phone}</div>}{showroom.verified === true && <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 size={13} />Verified record</div>}</div></article>)}</div>}</div>
    <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 text-xs text-[var(--color-text-muted)]"><Sparkles size={15} className="inline mr-2 text-orange-400" />Media policy: use original showroom logos/photos from Cloudinary or Firebase Storage. Do not upload AI-generated or stock vehicle imagery.</div>
  </div></section>;
}
