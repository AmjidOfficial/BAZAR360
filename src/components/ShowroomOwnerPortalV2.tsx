import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDocs, limit, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, CheckCircle2, ExternalLink, ImagePlus, Instagram, Link2, LogOut, Pencil, Plus, Save, ShieldCheck, Trash2, Upload, X, Facebook, Youtube, Linkedin, Globe, Phone, MapPin, MessageCircle, Ban, CircleCheck } from 'lucide-react';
import { auth, db } from '../firebase';
import { uploadBase64ToCloudinary } from '../lib/cloudinaryService';
import { Dealer, CarListing } from '../types';
import { toast } from 'react-hot-toast';

const SOCIAL_FIELDS = [
  ['website', 'Website', Globe],
  ['facebook', 'Facebook', Facebook],
  ['instagram', 'Instagram', Instagram],
  ['youtube', 'YouTube', Youtube],
  ['tiktok', 'TikTok', Link2],
  ['linkedin', 'LinkedIn', Linkedin],
  ['x', 'X / Twitter', Link2]
] as const;

type Tab = 'home' | 'vehicles' | 'showroom' | 'media' | 'account';
type VehicleForm = {
  title: string; make: string; model: string; year: string; price: string; mileage: string;
  description: string; condition: string; fuelType: string; transmission: string; bodyType: string;
  location: string; images: string[];
};

const emptyVehicle: VehicleForm = {
  title: '', make: '', model: '', year: '', price: '', mileage: '', description: '',
  condition: 'Used', fuelType: 'Petrol', transmission: 'Automatic', bodyType: 'Sedan', location: '', images: []
};

const asText = (v: any) => typeof v === 'string' ? v : '';
const dateText = (v: any) => {
  if (!v) return '—';
  if (typeof v === 'string') return v.slice(0, 10);
  if (v?.toDate) return v.toDate().toISOString().slice(0, 10);
  return '—';
};
const cleanUrl = (v: string) => {
  const value = v.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
};

export default function ShowroomOwnerPortalV2() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [tab, setTab] = useState<Tab>('home');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>(emptyVehicle);
  const [showroomForm, setShowroomForm] = useState({ name: '', subtitle: '', description: '', location: '', phone: '', whatsapp: '', email: '', website: '' });
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const loadOwnerData = async (uid: string) => {
    setBusy(true);
    try {
      // Showroom creation is Admin-only. Owner access starts only after Admin assigns ownerUid.
      const dealerSnap = await getDocs(query(collection(db, 'dealers'), where('ownerUid', '==', uid), limit(2)));
      const dealerDoc = dealerSnap.docs[0];
      if (!dealerDoc) {
        setDealer(null);
        setListings([]);
        return;
      }
      const d = { ...(dealerDoc.data() as any), id: dealerDoc.id } as Dealer;
      setDealer(d);
      const mergedSocials = { ...(d.socials || {}), ...(d.socialMedia || {}) };
      setSocials(mergedSocials);
      setShowroomForm({
        name: asText(d.name), subtitle: asText(d.subtitle), description: asText(d.description || d.about),
        location: asText(d.location), phone: asText(d.phone), whatsapp: asText(d.whatsapp), email: asText(d.email),
        website: asText(mergedSocials.website || d.website)
      });

      // Read only this owner's listings. Public listings remain public elsewhere, but the owner portal never loads another owner's inventory.
      const listingSnap = await getDocs(query(collection(db, 'listings'), where('ownerId', '==', uid), limit(200)));
      const rows = listingSnap.docs
        .map(x => ({ ...(x.data() as any), id: x.id }))
        .filter((x: any) => x.dealerId === dealerDoc.id) as CarListing[];
      rows.sort((a: any, b: any) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
      setListings(rows);
    } catch (e: any) {
      console.error('[ShowroomOwnerPortalV2]', e);
      toast.error(e?.message || 'Could not load showroom data.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { if (user) void loadOwnerData(user.uid); }, [user]);

  const counts = useMemo(() => ({
    total: listings.length,
    available: listings.filter((v: any) => !v.isSold && !v.isArchived && !v.isPaused).length,
    sold: listings.filter((v: any) => v.isSold || v.status === 'Sold').length,
    paused: listings.filter((v: any) => v.isPaused).length,
    archived: listings.filter((v: any) => v.isArchived).length
  }), [listings]);

  const gallery = useMemo(() => Array.from(new Set([...(dealer?.gallery || []), ...(dealer?.media || [])])).filter(Boolean), [dealer]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return toast.error('Enter your showroom email and password.');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success('Secure showroom access granted.');
    } catch (e: any) {
      toast.error(e?.message || 'Login failed.');
    } finally { setBusy(false); }
  };

  const resetPassword = async () => {
    if (!email.trim()) return toast.error('Enter your showroom owner email first.');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      toast.success('Password reset email sent.');
    } catch (e: any) { toast.error(e?.message || 'Could not send reset email.'); }
  };

  const startVehicle = (vehicle?: any) => {
    if (vehicle) {
      setEditingId(vehicle.id);
      setVehicleForm({
        title: asText(vehicle.title), make: asText(vehicle.make), model: asText(vehicle.model), year: String(vehicle.year || ''),
        price: String(vehicle.price ?? ''), mileage: String(vehicle.mileage ?? ''), description: asText(vehicle.description),
        condition: asText(vehicle.condition) || 'Used', fuelType: asText(vehicle.fuelType) || 'Petrol',
        transmission: asText(vehicle.transmission) || 'Automatic', bodyType: asText(vehicle.bodyType) || 'Sedan',
        location: asText(vehicle.location), images: Array.isArray(vehicle.images) ? vehicle.images.filter(Boolean) : (vehicle.imageUrl ? [vehicle.imageUrl] : [])
      });
    } else {
      setEditingId(null);
      setVehicleForm(emptyVehicle);
    }
    setTab('vehicles');
  };

  const saveVehicle = async () => {
    if (!user || !dealer) return;
    if (!vehicleForm.title.trim() || !vehicleForm.price) return toast.error('Vehicle title and price are required.');
    setBusy(true);
    try {
      const id = editingId || doc(collection(db, 'listings')).id;
      const now = new Date().toISOString();
      const existing: any = editingId ? listings.find(x => x.id === editingId) : null;
      const payload: any = {
        id, title: vehicleForm.title.trim(), make: vehicleForm.make.trim(), model: vehicleForm.model.trim(),
        year: Number(vehicleForm.year || new Date().getFullYear()), price: Number(vehicleForm.price), mileage: Number(vehicleForm.mileage || 0),
        description: vehicleForm.description.trim(), condition: vehicleForm.condition, fuelType: vehicleForm.fuelType,
        transmission: vehicleForm.transmission, bodyType: vehicleForm.bodyType, location: vehicleForm.location.trim(),
        images: vehicleForm.images.filter(Boolean), imageUrl: vehicleForm.images[0] || '', primaryImage: vehicleForm.images[0] || '',
        dealerId: dealer.id, showroomId: dealer.id, ownerId: user.uid, createdBy: user.uid, sellerType: 'Showroom',
        approved: existing?.approved ?? false, isSold: existing?.isSold ?? false, isPaused: existing?.isPaused ?? false,
        isArchived: existing?.isArchived ?? false, status: existing?.status || 'Available', createdAt: existing?.createdAt || now, updatedAt: now
      };
      await setDoc(doc(db, 'listings', id), payload, { merge: !!editingId });
      await loadOwnerData(user.uid);
      setEditingId(null); setVehicleForm(emptyVehicle);
      toast.success(editingId ? 'Vehicle updated.' : 'Vehicle added.');
    } catch (e: any) { toast.error(e?.message || 'Could not save vehicle.'); }
    finally { setBusy(false); }
  };

  const updateVehicle = async (vehicle: any, patch: Record<string, any>, message = 'Vehicle updated.') => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'listings', vehicle.id), { ...patch, updatedAt: new Date().toISOString() });
      await loadOwnerData(user.uid);
      toast.success(message);
    } catch (e: any) { toast.error(e?.message || 'Could not update vehicle.'); }
  };

  const deleteVehicle = async (vehicle: any) => {
    if (!user || !confirm(`Delete ${vehicle.title}? This removes only your showroom listing.`)) return;
    try {
      await deleteDoc(doc(db, 'listings', vehicle.id));
      await loadOwnerData(user.uid);
      toast.success('Vehicle deleted.');
    } catch (e: any) { toast.error(e?.message || 'Could not delete vehicle.'); }
  };

  const uploadFiles = async (files: FileList | null, folder: string, onUrl: (url: string) => Promise<void>) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 12 * 1024 * 1024) throw new Error('Each image must be 12MB or smaller.');
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file);
        });
        const url = await uploadBase64ToCloudinary(dataUrl, folder);
        await onUrl(url);
      }
    } catch (e: any) { toast.error(e?.message || 'Image upload failed.'); }
    finally { setUploading(false); }
  };

  const uploadVehicleMedia = async (files: FileList | null) => {
    if (!editingId || !dealer) return toast.error('Save the vehicle first, then add media.');
    await uploadFiles(files, 'bazar360_vehicles', async (url) => {
      const next = Array.from(new Set([...vehicleForm.images, url]));
      setVehicleForm(f => ({ ...f, images: next }));
      await updateDoc(doc(db, 'listings', editingId), { images: next, imageUrl: next[0] || '', primaryImage: next[0] || '', updatedAt: new Date().toISOString() });
    });
    if (user) await loadOwnerData(user.uid);
  };

  const uploadShowroomMedia = async (files: FileList | null) => {
    if (!dealer) return;
    await uploadFiles(files, 'bazar360_showrooms', async (url) => {
      await updateDoc(doc(db, 'dealers', dealer.id), { gallery: arrayUnion(url), media: arrayUnion(url), updatedAt: new Date().toISOString() });
    });
    if (user) await loadOwnerData(user.uid);
    toast.success('Showroom media updated.');
  };

  const saveShowroom = async () => {
    if (!dealer) return;
    setBusy(true);
    try {
      const normalizedSocials: Record<string, string> = {};
      Object.entries(socials).forEach(([key, value]) => { if (String(value).trim()) normalizedSocials[key] = cleanUrl(String(value)); });
      normalizedSocials.website = cleanUrl(showroomForm.website);
      await updateDoc(doc(db, 'dealers', dealer.id), {
        name: showroomForm.name.trim(), subtitle: showroomForm.subtitle.trim(), description: showroomForm.description.trim(),
        location: showroomForm.location.trim(), phone: showroomForm.phone.trim(), whatsapp: showroomForm.whatsapp.trim(), email: showroomForm.email.trim(),
        website: normalizedSocials.website || '', socials: normalizedSocials, socialMedia: normalizedSocials, updatedAt: new Date().toISOString()
      });
      await loadOwnerData(user!.uid);
      toast.success('Showroom profile saved.');
    } catch (e: any) { toast.error(e?.message || 'Could not save showroom.'); }
    finally { setBusy(false); }
  };

  const removeShowroomMedia = async (url: string) => {
    if (!dealer) return;
    try {
      await updateDoc(doc(db, 'dealers', dealer.id), { gallery: arrayRemove(url), media: arrayRemove(url), updatedAt: new Date().toISOString() });
      if (user) await loadOwnerData(user.uid);
      toast.success('Media removed.');
    } catch (e: any) { toast.error(e?.message || 'Could not remove media.'); }
  };

  if (!user) return <LoginCard email={email} password={password} busy={busy} resetSent={resetSent} setEmail={setEmail} setPassword={setPassword} login={login} resetPassword={resetPassword} navigate={navigate} />;
  if (!dealer && !busy) return <div className="neo-page"><div className="neo-card max-w-xl mx-auto text-center p-8"><ShieldCheck size={42} className="mx-auto mb-4 text-cyan-300"/><h1 className="text-2xl font-black">No showroom assigned</h1><p className="text-slate-500 mt-2">Your Firebase account is valid, but an Admin has not assigned a showroom to it. Showroom creation is Admin-only.</p><button onClick={() => signOut(auth)} className="neo-button mt-6">Sign out</button></div></div>;
  if (!dealer) return <div className="neo-page grid place-items-center">Loading your showroom…</div>;

  return <div className="neo-page">
    <style>{` .neo-page{min-height:100vh;background:#e8edf3;color:#1c2633}.neo-card{background:#e8edf3;border-radius:28px;box-shadow:14px 14px 30px #c6ccd4,-14px -14px 30px #fff}.neo-inset{background:#e8edf3;border-radius:18px;box-shadow:inset 5px 5px 11px #c6ccd4,inset -5px -5px 11px #fff}.neo-button{border:0;border-radius:16px;padding:.72rem 1rem;font-weight:800;background:#e8edf3;box-shadow:7px 7px 14px #c6ccd4,-7px -7px 14px #fff;transition:.18s transform,.18s box-shadow}.neo-button:active{transform:translateY(1px);box-shadow:inset 4px 4px 8px #c6ccd4,inset -4px -4px 8px #fff}.neo-primary{background:#0f6f82;color:#fff;box-shadow:7px 7px 14px #c1c9d1,-7px -7px 14px #fff}.neo-danger{color:#b42318}.neo-input{width:100%;border:0;outline:0;border-radius:15px;background:#e8edf3;box-shadow:inset 4px 4px 9px #c6ccd4,inset -4px -4px 9px #fff;padding:.72rem .85rem;color:#1c2633}.neo-tab{white-space:nowrap;border:0;border-radius:14px;padding:.65rem .9rem;background:#e8edf3;box-shadow:5px 5px 10px #c6ccd4,-5px -5px 10px #fff;font-weight:800;font-size:.78rem}.neo-tab-active{color:#fff;background:#0f6f82}.neo-media{border-radius:20px;overflow:hidden;background:#e8edf3;box-shadow:7px 7px 14px #c6ccd4,-7px -7px 14px #fff}.neo-muted{color:#667386}@media(max-width:640px){.neo-card{border-radius:22px;box-shadow:9px 9px 20px #c6ccd4,-9px -9px 20px #fff}.neo-page{font-size:14px}}@media(prefers-reduced-motion:reduce){.neo-button{transition:none}}`}</style>
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 bg-[#e8edf3]/95 backdrop-blur-xl">
      <div className="neo-card max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0"><div className="text-[10px] uppercase tracking-[.2em] text-[#0f6f82] font-black">Showroom Owner</div><h1 className="font-black text-lg sm:text-xl truncate">{dealer.name}</h1></div>
        <div className="flex gap-2"><button className="neo-button hidden sm:inline-flex items-center gap-2" onClick={() => navigate(`/dealers/${dealer.slug || dealer.id}`)}><ExternalLink size={15}/> Public showroom</button><button className="neo-button p-3" onClick={() => signOut(auth)} title="Sign out"><LogOut size={16}/></button></div>
      </div>
      <nav className="max-w-7xl mx-auto py-3 flex gap-2 overflow-x-auto">{([['home','Overview'],['vehicles','Vehicles'],['showroom','Showroom'],['media','Media'],['account','Account']] as const).map(([id,label]) => <button key={id} className={`neo-tab ${tab===id?'neo-tab-active':''}`} onClick={() => setTab(id)}>{label}</button>)}</nav>
    </header>

    <main className="max-w-7xl mx-auto px-3 sm:px-6 pb-10">
      {tab === 'home' && <section className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{[['Vehicles',counts.total],['Available',counts.available],['Sold',counts.sold],['Paused',counts.paused],['Archived',counts.archived]].map(([label,value]) => <div className="neo-card p-4" key={String(label)}><div className="neo-muted text-xs">{label}</div><div className="text-2xl font-black mt-1">{value}</div></div>)}</div>
        <div className="neo-card p-5 sm:p-7"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-[#0f6f82]">Your showroom workspace</p><h2 className="text-2xl sm:text-3xl font-black mt-1">Manage your business from one place.</h2><p className="neo-muted mt-2 max-w-2xl">Add vehicles, upload original photos, update your showroom, connect social accounts and mark cars sold. You can only change the showroom assigned to your account.</p></div><button className="neo-button neo-primary shrink-0 inline-flex items-center justify-center gap-2" onClick={() => startVehicle()}><Plus size={17}/> Add vehicle</button></div></div>
      </section>}

      {tab === 'vehicles' && <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h2 className="text-2xl font-black">My inventory</h2><p className="neo-muted text-sm">Create, edit, publish, pause, sell, archive or delete your own showroom vehicles.</p></div><button className="neo-button neo-primary inline-flex items-center justify-center gap-2" onClick={() => startVehicle()}><Plus size={17}/> Add vehicle</button></div>
        {editingId !== null && <VehicleEditor form={vehicleForm} setForm={setVehicleForm} busy={busy} uploading={uploading} onSave={saveVehicle} onCancel={() => {setEditingId(null);setVehicleForm(emptyVehicle)}} onUpload={uploadVehicleMedia} onRemoveImage={async (url:string) => {const next=vehicleForm.images.filter(x=>x!==url);setVehicleForm(f=>({...f,images:next}));if(editingId) await updateDoc(doc(db,'listings',editingId),{images:next,imageUrl:next[0]||'',primaryImage:next[0]||'',updatedAt:new Date().toISOString()});}} />}
        {editingId === null && vehicleForm.title === '' && null}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{listings.map((v:any) => <article className="neo-card overflow-hidden min-w-0" key={v.id}><div className="aspect-[16/10] overflow-hidden bg-[#dfe5eb]">{(v.primaryImage||v.imageUrl||v.images?.[0])?<img src={v.primaryImage||v.imageUrl||v.images[0]} className="w-full h-full object-cover" loading="lazy"/>:<div className="h-full grid place-items-center neo-muted"><Car size={36}/></div>}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-black line-clamp-2">{v.title}</h3><span className="text-[10px] font-black px-2 py-1 rounded-full bg-white/60 shrink-0">{v.isSold||v.status==='Sold'?'SOLD':v.isPaused?'PAUSED':v.isArchived?'ARCHIVED':'AVAILABLE'}</span></div><div className="text-[#0f6f82] text-lg font-black mt-2">PKR {Number(v.price||0).toLocaleString()}</div><div className="neo-muted text-xs mt-1">{v.year||'—'} · {v.mileage?Number(v.mileage).toLocaleString()+' km':'Mileage not set'} · {dateText(v.updatedAt||v.createdAt)}</div><div className="grid grid-cols-2 gap-2 mt-4"><button className="neo-button text-xs inline-flex justify-center gap-1" onClick={()=>startVehicle(v)}><Pencil size={13}/> Edit</button><button className="neo-button text-xs" onClick={()=>updateVehicle(v,{isSold:!v.isSold,status:v.isSold?'Available':'Sold'},v.isSold?'Vehicle marked available.':'Vehicle marked sold.')}>{v.isSold?'Mark available':'Mark sold'}</button><button className="neo-button text-xs" onClick={()=>updateVehicle(v,{isPaused:!v.isPaused},v.isPaused?'Vehicle resumed.':'Vehicle paused.')}>{v.isPaused?'Resume':'Pause'}</button><button className="neo-button neo-danger text-xs inline-flex justify-center gap-1" onClick={()=>deleteVehicle(v)}><Trash2 size={13}/> Delete</button></div><button className="neo-button w-full mt-2 text-xs" onClick={()=>updateVehicle(v,{isArchived:!v.isArchived},v.isArchived?'Vehicle restored.':'Vehicle archived.')}>{v.isArchived?'Restore from archive':'Archive vehicle'}</button></div></article>)}</div>
        {listings.length===0 && <div className="neo-card p-10 text-center neo-muted">No vehicles are assigned to this showroom yet. Add your first vehicle.</div>}
      </section>}

      {tab === 'showroom' && <section className="space-y-5"><div><h2 className="text-2xl font-black">Showroom website</h2><p className="neo-muted text-sm">This is the business information customers see on your modern showroom page.</p></div><div className="neo-card p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">{Object.entries(showroomForm).map(([key,value])=><label className="text-xs font-bold neo-muted" key={key}>{key.replace(/([A-Z])/g,' $1')}<input className="neo-input mt-1" value={value} onChange={e=>setShowroomForm(s=>({...s,[key]:e.target.value}))}/></label>)}<label className="lg:col-span-2 text-xs font-bold neo-muted">Business description<textarea className="neo-input mt-1 min-h-32" value={showroomForm.description} onChange={e=>setShowroomForm(s=>({...s,description:e.target.value}))}/></label></div><div className="neo-card p-5"><h3 className="font-black text-lg">Social accounts</h3><p className="neo-muted text-sm mt-1">Add only your real business profiles. Empty fields stay hidden publicly.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">{SOCIAL_FIELDS.map(([key,label,Icon])=><label className="text-xs font-bold neo-muted" key={key}><span className="flex items-center gap-2"><Icon size={14}/> {label}</span><input className="neo-input mt-1" value={socials[key]||''} placeholder="https://..." onChange={e=>setSocials(s=>({...s,[key]:e.target.value}))}/></label>)}</div><button className="neo-button neo-primary mt-5 inline-flex items-center gap-2" disabled={busy} onClick={saveShowroom}><Save size={16}/> Save showroom</button></div></section>}

      {tab === 'media' && <section className="space-y-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h2 className="text-2xl font-black">Showroom media</h2><p className="neo-muted text-sm">Upload real showroom photos. Images are stored in Cloudinary and the URLs are saved in Firestore.</p></div><label className="neo-button neo-primary cursor-pointer inline-flex items-center justify-center gap-2">{uploading?<span>Uploading…</span>:<><Upload size={16}/> Add photos</>}<input className="hidden" type="file" accept="image/*" multiple disabled={uploading} onChange={e=>void uploadShowroomMedia(e.target.files)}/></label></div><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{gallery.map(url=><div className="neo-media aspect-square relative" key={url}><img src={url} className="w-full h-full object-cover" loading="lazy"/><button className="absolute top-2 right-2 rounded-full p-2 bg-white/85 text-red-700 shadow" onClick={()=>void removeShowroomMedia(url)}><Trash2 size={14}/></button></div>)}</div>{gallery.length===0&&<div className="neo-card p-10 text-center neo-muted">No showroom photos yet.</div>}</section>}

      {tab === 'account' && <section className="space-y-5"><div className="neo-card p-5"><h2 className="text-2xl font-black">Owner account</h2><p className="neo-muted mt-1">Signed in as {user.email}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5"><div className="neo-inset p-4"><div className="neo-muted text-xs">Security</div><div className="font-black mt-1">Firebase email/password authentication</div></div><div className="neo-inset p-4"><div className="neo-muted text-xs">Access scope</div><div className="font-black mt-1">Only your assigned showroom</div></div></div><div className="flex flex-wrap gap-3 mt-5"><button className="neo-button" onClick={()=>void resetPassword()}>Reset password</button><button className="neo-button neo-danger" onClick={()=>void signOut(auth)}><LogOut size={15}/> Sign out</button></div></div><div className="neo-card p-5"><h3 className="font-black">Owner rules</h3><ul className="neo-muted text-sm mt-3 space-y-2 list-disc pl-5"><li>Admin creates and assigns showrooms.</li><li>You can manage only your assigned showroom.</li><li>You can manage your own vehicle posts, media and business links.</li><li>You cannot change showroom ownership or platform Admin settings.</li></ul></div></section>}
    </main>
  </div>;
}

function LoginCard({email,password,busy,resetSent,setEmail,setPassword,login,resetPassword,navigate}:any){return <div className="neo-page grid place-items-center p-4"><style>{`.neo-page{min-height:100vh;background:#e8edf3;color:#1c2633}.neo-card{background:#e8edf3;border-radius:28px;box-shadow:14px 14px 30px #c6ccd4,-14px -14px 30px #fff}.neo-input{width:100%;border:0;outline:0;border-radius:15px;background:#e8edf3;box-shadow:inset 4px 4px 9px #c6ccd4,inset -4px -4px 9px #fff;padding:.78rem;color:#1c2633}.neo-button{border:0;border-radius:16px;padding:.75rem 1rem;font-weight:800;background:#e8edf3;box-shadow:7px 7px 14px #c6ccd4,-7px -7px 14px #fff}.neo-primary{background:#0f6f82;color:#fff}`}</style><form onSubmit={login} className="neo-card w-full max-w-md p-6 sm:p-8"><div className="flex items-center gap-3 mb-6"><div className="neo-inset p-3 rounded-2xl"><ShieldCheck className="text-[#0f6f82]"/></div><div><h1 className="text-2xl font-black">Showroom Owner Access</h1><p className="neo-muted text-sm">Secure private portal for your assigned showroom.</p></div></div><input className="neo-input mb-3" value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" placeholder="Owner email"/><input className="neo-input mb-4" value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Password"/><button disabled={busy} className="neo-button neo-primary w-full">{busy?'Signing in…':'Enter my showroom'}</button><button type="button" onClick={()=>void resetPassword()} className="w-full py-3 text-sm text-[#0f6f82] font-bold">Forgot password?</button>{resetSent&&<p className="text-xs text-emerald-700 text-center">Password reset email sent.</p>}<button type="button" onClick={()=>navigate('/')} className="w-full mt-3 neo-button inline-flex justify-center items-center gap-2"><ArrowLeft size={15}/> Back to Bazar360</button></form></div>}

function VehicleEditor({form,setForm,busy,uploading,onSave,onCancel,onUpload,onRemoveImage}:any){
  const fields:[keyof VehicleForm,string][]=[['title','Vehicle title'],['make','Make'],['model','Model'],['year','Year'],['price','Price PKR'],['mileage','Mileage KM'],['location','Location']];
  return <div className="neo-card p-5 space-y-4"><div className="flex items-center justify-between"><div><h3 className="text-xl font-black">{form.title?'Edit vehicle':'Add vehicle'}</h3><p className="neo-muted text-sm">Save the vehicle first, then add as many genuine photos as needed.</p></div><button className="neo-button p-2" onClick={onCancel}><X size={16}/></button></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{fields.map(([key,label])=><label className="text-xs font-bold neo-muted" key={key}>{label}<input className="neo-input mt-1" value={form[key] as string} onChange={e=>setForm((s:VehicleForm)=>({...s,[key]:e.target.value}))}/></label>)}<label className="text-xs font-bold neo-muted">Condition<select className="neo-input mt-1" value={form.condition} onChange={e=>setForm((s:VehicleForm)=>({...s,condition:e.target.value}))}><option>New</option><option>Used</option></select></label><label className="text-xs font-bold neo-muted">Fuel<select className="neo-input mt-1" value={form.fuelType} onChange={e=>setForm((s:VehicleForm)=>({...s,fuelType:e.target.value}))}><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option><option>CNG</option></select></label><label className="text-xs font-bold neo-muted">Transmission<select className="neo-input mt-1" value={form.transmission} onChange={e=>setForm((s:VehicleForm)=>({...s,transmission:e.target.value}))}><option>Automatic</option><option>Manual</option></select></label><label className="text-xs font-bold neo-muted">Body type<select className="neo-input mt-1" value={form.bodyType} onChange={e=>setForm((s:VehicleForm)=>({...s,bodyType:e.target.value}))}><option>Sedan</option><option>SUV</option><option>Hatchback</option><option>Crossover</option><option>Pickup</option><option>Van</option><option>Coupe</option><option>Other</option></select></label></div><label className="text-xs font-bold neo-muted">Description<textarea className="neo-input mt-1 min-h-28" value={form.description} onChange={e=>setForm((s:VehicleForm)=>({...s,description:e.target.value}))}/></label><div><div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-black">Vehicle media</h4><p className="neo-muted text-xs">Original photos only. No AI or stock images.</p></div><label className="neo-button neo-primary cursor-pointer inline-flex items-center gap-2"><ImagePlus size={15}/>{uploading?'Uploading…':'Add photos'}<input className="hidden" type="file" accept="image/*" multiple disabled={uploading||!form.title} onChange={e=>void onUpload(e.target.files)}/></label></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">{form.images.map((url:string)=><div className="neo-media aspect-square relative" key={url}><img src={url} className="w-full h-full object-cover"/><button className="absolute top-2 right-2 rounded-full p-2 bg-white/85 text-red-700 shadow" onClick={()=>void onRemoveImage(url)}><Trash2 size={13}/></button></div>)}</div></div><div className="flex flex-wrap gap-2"><button className="neo-button neo-primary inline-flex items-center gap-2" disabled={busy} onClick={onSave}><CheckCircle2 size={15}/> {busy?'Saving…':'Save vehicle'}</button><button className="neo-button" onClick={onCancel}>Cancel</button></div></div>;
}
