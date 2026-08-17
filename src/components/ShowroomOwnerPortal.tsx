import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { dbFetchDealers, dbRegisterDealership, dbSaveListing, dbSaveShowroomMedia, dbRemoveShowroomMedia, dbUpdateDealer } from '../lib/dbService';
import { uploadBase64ToCloudinary } from '../lib/cloudinaryService';
import { CarListing, Dealer } from '../types';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Car, CheckCircle2, ImagePlus, Instagram, Link2, LogOut, Pencil, Plus, Save, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SOCIAL_FIELDS = ['website', 'facebook', 'instagram', 'youtube', 'tiktok', 'linkedin', 'x', 'twitter'] as const;

type Tab = 'overview' | 'vehicles' | 'showroom' | 'media';

function normalizeDate(value: any) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value?.toDate) return value.toDate().toISOString();
  return '';
}

export default function ShowroomOwnerPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [editingVehicle, setEditingVehicle] = useState<CarListing | null>(null);
  const [vehicleForm, setVehicleForm] = useState({ title: '', price: '', mileage: '', year: '', make: '', model: '', description: '', imageUrl: '' });
  const [showroomForm, setShowroomForm] = useState({ name: '', subtitle: '', description: '', location: '', phone: '', whatsapp: '', email: '', website: '' });
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [mediaBusy, setMediaBusy] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const loadOwnerData = async (uid: string) => {
    setBusy(true);
    try {
      const dealerSnap = await getDocs(query(collection(db, 'dealers'), where('ownerUid', '==', uid), limit(10)));
      const dealerDoc = dealerSnap.docs[0];
      if (!dealerDoc) {
        setDealer(null);
        setListings([]);
        return;
      }
      const dealerData = { ...(dealerDoc.data() as any), id: dealerDoc.id } as Dealer;
      setDealer(dealerData);
      setShowroomForm({
        name: dealerData.name || '', subtitle: dealerData.subtitle || '', description: dealerData.description || dealerData.about || '',
        location: dealerData.location || '', phone: dealerData.phone || '', whatsapp: dealerData.whatsapp || '', email: dealerData.email || '',
        website: dealerData.socials?.website || dealerData.socialMedia?.website || ''
      });
      setSocials({ ...(dealerData.socials || {}), ...(dealerData.socialMedia || {}) });

      const listingSnap = await getDocs(query(collection(db, 'listings'), where('dealerId', '==', dealerDoc.id), limit(100)));
      const rows = listingSnap.docs.map(d => ({ ...(d.data() as any), id: d.id })) as CarListing[];
      rows.sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
      setListings(rows);
    } catch (error: any) {
      console.error('[ShowroomOwnerPortal] load error', error);
      toast.error(error?.message || 'Could not load showroom data.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user) loadOwnerData(user.uid);
  }, [user]);

  const counts = useMemo(() => ({
    total: listings.length,
    available: listings.filter(v => !v.isSold && !v.isArchived && !v.isPaused).length,
    sold: listings.filter(v => v.isSold || v.status === 'Sold').length,
    paused: listings.filter(v => v.isPaused).length,
    archived: listings.filter(v => v.isArchived).length
  }), [listings]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success('Owner access granted.');
    } catch (error: any) {
      toast.error(error?.message || 'Login failed.');
    } finally { setBusy(false); }
  };

  const resetPassword = async () => {
    if (!email.trim()) return toast.error('Enter your showroom owner email first.');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      toast.success('Password reset email sent.');
    } catch (error: any) {
      toast.error(error?.message || 'Could not send reset email.');
    }
  };

  const openVehicle = (vehicle?: CarListing) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleForm({
        title: vehicle.title || '', price: String(vehicle.price ?? ''), mileage: String(vehicle.mileage ?? ''), year: String(vehicle.year ?? ''),
        make: vehicle.make || '', model: vehicle.model || '', description: vehicle.description || '', imageUrl: vehicle.imageUrl || vehicle.primaryImage || vehicle.images?.[0] || ''
      });
    } else {
      setEditingVehicle(null);
      setVehicleForm({ title: '', price: '', mileage: '', year: '', make: '', model: '', description: '', imageUrl: '' });
    }
    setTab('vehicles');
  };

  const saveVehicle = async () => {
    if (!user || !dealer) return;
    if (!vehicleForm.title.trim() || !vehicleForm.price) return toast.error('Vehicle title and price are required.');
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const payload: CarListing = {
        id: editingVehicle?.id || `dealer-${dealer.id}-${Date.now()}`,
        title: vehicleForm.title.trim(), make: vehicleForm.make.trim(), model: vehicleForm.model.trim(),
        price: Number(vehicleForm.price), mileage: Number(vehicleForm.mileage || 0), year: Number(vehicleForm.year || new Date().getFullYear()),
        description: vehicleForm.description.trim(), imageUrl: vehicleForm.imageUrl.trim(), primaryImage: vehicleForm.imageUrl.trim(),
        images: vehicleForm.imageUrl.trim() ? [vehicleForm.imageUrl.trim()] : [],
        dealerId: dealer.id, showroomId: dealer.id, ownerId: user.uid, createdBy: user.uid, sellerType: 'Showroom',
        approved: editingVehicle?.approved ?? false, isSold: editingVehicle?.isSold ?? false, isPaused: editingVehicle?.isPaused ?? false,
        isArchived: editingVehicle?.isArchived ?? false, createdAt: editingVehicle?.createdAt || now, updatedAt: now
      };
      await dbSaveListing(payload);
      await loadOwnerData(user.uid);
      toast.success(editingVehicle ? 'Vehicle updated.' : 'Vehicle added.');
      setEditingVehicle(null);
    } catch (error: any) {
      toast.error(error?.message || 'Could not save vehicle.');
    } finally { setBusy(false); }
  };

  const setVehicleStatus = async (vehicle: CarListing, patch: Partial<CarListing>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'listings', vehicle.id), { ...patch, updatedAt: new Date().toISOString() });
      await loadOwnerData(user.uid);
      toast.success('Vehicle status updated.');
    } catch (error: any) { toast.error(error?.message || 'Could not update vehicle.'); }
  };

  const removeVehicle = async (vehicle: CarListing) => {
    if (!user || !confirm(`Delete ${vehicle.title}? This only deletes your showroom listing.`)) return;
    try {
      await deleteDoc(doc(db, 'listings', vehicle.id));
      await loadOwnerData(user.uid);
      toast.success('Vehicle deleted.');
    } catch (error: any) { toast.error(error?.message || 'Could not delete vehicle.'); }
  };

  const saveShowroom = async () => {
    if (!dealer) return;
    setBusy(true);
    try {
      await dbUpdateDealer(dealer.id, {
        name: showroomForm.name.trim(), subtitle: showroomForm.subtitle.trim(), description: showroomForm.description.trim(),
        location: showroomForm.location.trim(), phone: showroomForm.phone.trim(), whatsapp: showroomForm.whatsapp.trim(), email: showroomForm.email.trim(),
        socials: { ...socials, website: showroomForm.website.trim() }, socialMedia: { ...socials, website: showroomForm.website.trim() }
      } as any);
      if (user) await loadOwnerData(user.uid);
    } catch (_) {}
    finally { setBusy(false); }
  };

  const uploadShowroomMedia = async (file?: File) => {
    if (!file || !dealer) return;
    setMediaBusy(true);
    try {
      const reader = new FileReader();
      const url = await new Promise<string>((resolve, reject) => { reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const cloudUrl = await uploadBase64ToCloudinary(url, 'bazar360_showrooms');
      await dbSaveShowroomMedia(dealer.id, cloudUrl);
      if (user) await loadOwnerData(user.uid);
      toast.success('Showroom media added.');
    } catch (error: any) { toast.error(error?.message || 'Media upload failed.'); }
    finally { setMediaBusy(false); }
  };

  if (!user) {
    return <div className="min-h-screen bg-[#06111f] text-white flex items-center justify-center p-4">
      <form onSubmit={login} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6"><ShieldCheck className="text-cyan-300"/><div><h1 className="text-xl font-black">Showroom Owner Access</h1><p className="text-xs text-white/60">Secure Firebase account login</p></div></div>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="Owner email" className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 mb-3 outline-none focus:border-cyan-300" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Password" className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 mb-4 outline-none focus:border-cyan-300" />
        <button disabled={busy} className="w-full rounded-2xl bg-cyan-400 text-slate-950 font-black py-3 disabled:opacity-50">{busy ? 'Signing in…' : 'Enter My Showroom'}</button>
        <button type="button" onClick={resetPassword} className="w-full mt-3 py-2 text-sm text-cyan-200">Forgot password?</button>
        {resetSent && <p className="text-xs text-emerald-300 mt-2 text-center">Check your email for the reset link.</p>}
        <button type="button" onClick={() => navigate('/')} className="w-full mt-4 text-xs text-white/50 flex items-center justify-center gap-2"><ArrowLeft size={14}/> Back to Bazar360</button>
      </form>
    </div>;
  }

  if (!dealer && !busy) {
    return <div className="min-h-screen bg-[#06111f] text-white flex items-center justify-center p-4"><div className="max-w-lg text-center rounded-3xl border border-white/10 bg-white/[0.05] p-8"><ShieldCheck className="mx-auto mb-4 text-amber-300" size={38}/><h1 className="text-2xl font-black mb-2">No showroom assigned</h1><p className="text-white/65">Your account is valid, but an Admin has not assigned a showroom to this account yet. Showroom creation is Admin-only.</p><button onClick={() => signOut(auth)} className="mt-6 rounded-xl border border-white/10 px-4 py-2">Sign out</button></div></div>;
  }

  if (!dealer) return <div className="min-h-screen bg-[#06111f] text-white grid place-items-center">Loading showroom…</div>;

  const gallery = Array.from(new Set([...(dealer.gallery || []), ...(dealer.media || [])])).filter(Boolean);

  return <div className="min-h-screen bg-[#06111f] text-white">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#06111f]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0"><p className="text-[10px] tracking-[.2em] uppercase text-cyan-200">Showroom Owner Portal</p><h1 className="font-black truncate">{dealer.name}</h1></div>
        <div className="flex items-center gap-2"><button onClick={() => navigate(`/dealers/${dealer.slug || dealer.id}`)} className="hidden sm:inline-flex rounded-xl border border-white/10 px-3 py-2 text-xs">View showroom</button><button onClick={() => signOut(auth)} className="rounded-xl border border-white/10 p-2" title="Sign out"><LogOut size={17}/></button></div>
      </div>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {([['overview','Overview'],['vehicles','Vehicles'],['showroom','Showroom'],['media','Media & Social']] as const).map(([id,label]) => <button key={id} onClick={() => setTab(id)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${tab === id ? 'bg-cyan-300 text-slate-950' : 'bg-white/5 text-white/70'}`}>{label}</button>)}
      </nav>
    </header>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {tab === 'overview' && <section className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[['Vehicles',counts.total],['Available',counts.available],['Sold',counts.sold],['Paused',counts.paused]].map(([label,value]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-white/50">{label}</p><p className="text-2xl font-black mt-1">{value}</p></div>)}</div>
        <div className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 to-orange-300/5 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black">Your showroom. Your inventory.</h2><p className="text-sm text-white/60">You can manage only the showroom assigned to your account.</p></div><button onClick={() => openVehicle()} className="rounded-xl bg-cyan-300 text-slate-950 px-4 py-2 text-sm font-black inline-flex items-center gap-2"><Plus size={16}/> Add vehicle</button></div></div>
      </section>}

      {tab === 'vehicles' && <section className="space-y-5">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black">My Vehicles</h2><p className="text-xs text-white/50">Add, edit, sell, pause, archive or delete your own posts.</p></div><button onClick={() => openVehicle()} className="rounded-xl bg-cyan-300 text-slate-950 px-4 py-2 text-sm font-black inline-flex items-center gap-2"><Plus size={16}/> Add vehicle</button></div>
        {editingVehicle !== null || (!editingVehicle && vehicleForm.title !== '') ? <VehicleEditor form={vehicleForm} setForm={setVehicleForm} onSave={saveVehicle} onCancel={() => { setEditingVehicle(null); setVehicleForm({title:'',price:'',mileage:'',year:'',make:'',model:'',description:'',imageUrl:''}); }} busy={busy} /> : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{listings.map(vehicle => <article key={vehicle.id} className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden min-w-0"><div className="aspect-[16/10] bg-black/30 overflow-hidden">{(vehicle.imageUrl || vehicle.primaryImage || vehicle.images?.[0]) ? <img src={vehicle.imageUrl || vehicle.primaryImage || vehicle.images?.[0]} className="w-full h-full object-cover" loading="lazy"/> : <div className="h-full grid place-items-center text-white/30"><Car/></div>}</div><div className="p-4"><div className="flex justify-between gap-2"><h3 className="font-black line-clamp-2">{vehicle.title}</h3><span className={`shrink-0 text-[10px] px-2 py-1 rounded-full ${vehicle.isSold ? 'bg-red-400/15 text-red-200' : vehicle.isPaused ? 'bg-amber-400/15 text-amber-200' : 'bg-emerald-400/15 text-emerald-200'}`}>{vehicle.isSold ? 'SOLD' : vehicle.isPaused ? 'PAUSED' : vehicle.isArchived ? 'ARCHIVED' : 'AVAILABLE'}</span></div><p className="mt-2 text-cyan-200 font-black">PKR {Number(vehicle.price || 0).toLocaleString()}</p><p className="text-xs text-white/45 mt-1">Updated {normalizeDate(vehicle.updatedAt || vehicle.createdAt).slice(0,10) || '—'}</p><div className="grid grid-cols-2 gap-2 mt-4"><button onClick={() => openVehicle(vehicle)} className="rounded-xl border border-white/10 py-2 text-xs font-bold inline-flex items-center justify-center gap-1"><Pencil size={13}/> Edit</button><button onClick={() => setVehicleStatus(vehicle, { isSold: !vehicle.isSold, status: vehicle.isSold ? 'Available' : 'Sold' })} className="rounded-xl border border-white/10 py-2 text-xs font-bold">{vehicle.isSold ? 'Mark available' : 'Mark sold'}</button><button onClick={() => setVehicleStatus(vehicle, { isPaused: !vehicle.isPaused })} className="rounded-xl border border-white/10 py-2 text-xs font-bold">{vehicle.isPaused ? 'Resume' : 'Pause'}</button><button onClick={() => removeVehicle(vehicle)} className="rounded-xl border border-red-400/20 text-red-200 py-2 text-xs font-bold inline-flex items-center justify-center gap-1"><Trash2 size={13}/> Delete</button></div></div></article>)}</div>
        {listings.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">No showroom vehicles yet. Add your first vehicle above.</div>}
      </section>}

      {tab === 'showroom' && <section className="space-y-5"><div><h2 className="text-xl font-black">Showroom Profile</h2><p className="text-xs text-white/50">Update only the showroom assigned to your account.</p></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{Object.entries(showroomForm).map(([key,value]) => <label key={key} className="text-xs text-white/60">{key.replace(/([A-Z])/g,' $1')}<input value={value} onChange={e => setShowroomForm(s => ({...s,[key]:e.target.value}))} className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300" /></label>)}</div><div className="rounded-2xl border border-white/10 p-4"><h3 className="font-black mb-3">Social accounts</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{SOCIAL_FIELDS.map(field => <label key={field} className="text-xs text-white/50">{field}<input value={socials[field] || ''} onChange={e => setSocials(s => ({...s,[field]:e.target.value}))} placeholder={`https://${field}.com/...`} className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300" /></label>)}</div></div><button onClick={saveShowroom} disabled={busy} className="rounded-xl bg-cyan-300 text-slate-950 px-5 py-3 font-black inline-flex items-center gap-2"><Save size={16}/> Save showroom</button></section>}

      {tab === 'media' && <section className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Showroom Media</h2><p className="text-xs text-white/50">Upload your own showroom photos. Original Cloudinary URLs are preserved.</p></div><label className="cursor-pointer rounded-xl bg-cyan-300 text-slate-950 px-4 py-2 text-sm font-black inline-flex items-center gap-2">{mediaBusy ? 'Uploading…' : <><Upload size={16}/> Add media</>}<input type="file" accept="image/*" className="hidden" disabled={mediaBusy} onChange={e => uploadShowroomMedia(e.target.files?.[0])}/></label></div><div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">{gallery.map(url => <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/20 group"><img src={url} className="w-full h-full object-cover" loading="lazy"/><button onClick={async () => { await dbRemoveShowroomMedia(dealer.id, url); if (user) loadOwnerData(user.uid); }} className="absolute top-2 right-2 rounded-full bg-black/70 p-2 text-red-200 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14}/></button></div>)}</div>{gallery.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">No showroom media uploaded yet.</div>}</section>}
    </main>
  </div>;
}

function VehicleEditor({ form, setForm, onSave, onCancel, busy }: any) {
  const fields = [['title','Vehicle title'],['make','Make'],['model','Model'],['year','Year'],['price','Price PKR'],['mileage','Mileage'],['imageUrl','Cloudinary image URL']];
  return <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-5 space-y-4"><div className="flex justify-between"><div><h3 className="font-black">{form.title ? 'Edit vehicle' : 'Add vehicle'}</h3><p className="text-xs text-white/50">Only your showroom inventory can be changed here.</p></div><button onClick={onCancel}><X/></button></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{fields.map(([key,label]) => <label key={key} className="text-xs text-white/55">{label}<input value={form[key]} onChange={e => setForm((s:any)=>({...s,[key]:e.target.value}))} className="mt-1 w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none focus:border-cyan-300" /></label>)}<label className="text-xs text-white/55 sm:col-span-2">Description<textarea value={form.description} onChange={e=>setForm((s:any)=>({...s,description:e.target.value}))} rows={3} className="mt-1 w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none focus:border-cyan-300"/></label></div><div className="flex gap-2"><button onClick={onSave} disabled={busy} className="rounded-xl bg-cyan-300 text-slate-950 px-4 py-2 font-black inline-flex items-center gap-2"><CheckCircle2 size={15}/> Save</button><button onClick={onCancel} className="rounded-xl border border-white/10 px-4 py-2">Cancel</button></div></div>;
}
