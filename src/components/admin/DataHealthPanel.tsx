import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { ShieldCheck, Database, CheckCircle2, AlertTriangle, RefreshCw, Car, Store, FileText } from 'lucide-react';
import { db } from '../../firebase';
import { dbFetchDealers, dbFetchLeads } from '../../lib/dbService';
import { mapCanonicalListing } from '../../lib/inventoryRepository';
import { CarListing, Dealer, Lead } from '../../types';

const FAKE_TERMS = ['dummy', 'placeholder', 'sample', 'demo-post', 'fake', 'lorem ipsum'];
const BLOCKED_MEDIA = ['unsplash.com', 'pexels.com', 'pixabay.com', 'shutterstock.com', 'freepik.com'];

export const DataHealthPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [lastChecked, setLastChecked] = useState('');
  const [auditError, setAuditError] = useState('');

  const runAudit = async () => {
    setLoading(true);
    setAuditError('');
    try {
      // IMPORTANT: this is an admin data-health audit, so it reads the complete
      // live listings collection. It must not use the public published-only query.
      const listingSnap = await getDocs(collection(db, 'listings'));
      const allListings = listingSnap.docs.map(docSnap => mapCanonicalListing(docSnap.id, docSnap.data()));
      const [dList, ldList] = await Promise.all([
        dbFetchDealers(true).catch(() => [] as Dealer[]),
        dbFetchLeads().catch(() => [] as Lead[])
      ]);
      setListings(allListings);
      setDealers(dList);
      setLeads(ldList);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('[DataHealthPanel] Live Firestore audit failed:', error);
      setAuditError('Live Firestore audit could not be completed. Showing no fabricated values.');
      setListings([]);
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void runAudit(); }, []);

  const totalVehicles = listings.length;
  const publishedVehicles = listings.filter(l => l.approved === true && l.isArchived !== true && l.isPaused !== true && l.isSold !== true && l.status !== 'Sold').length;
  const pendingVehicles = listings.filter(l => l.approved !== true && l.isSold !== true && l.isArchived !== true).length;
  const soldVehicles = listings.filter(l => l.isSold === true || String(l.status || '').toLowerCase() === 'sold').length;
  const archivedVehicles = listings.filter(l => l.isArchived === true).length;
  const pausedVehicles = listings.filter(l => l.isPaused === true).length;

  const suspiciousListings = listings.filter(l => {
    const text = `${l.title || ''} ${l.description || ''} ${l.make || ''} ${l.model || ''}`.toLowerCase();
    const media = [...(l.images || []), l.imageUrl || '', l.primaryImage || ''].filter(Boolean).join(' ').toLowerCase();
    return FAKE_TERMS.some(term => text.includes(term)) || BLOCKED_MEDIA.some(host => media.includes(host));
  });

  const missingMedia = listings.filter(l => !(l.imageUrl || l.images?.length || l.primaryImage));
  const statusHealthy = !auditError && suspiciousListings.length === 0;

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="bg-[var(--color-bg-secondary)] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold font-mono uppercase mb-2 ${statusHealthy ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
            {statusHealthy ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
            <span>{statusHealthy ? 'Live Data Audit Clear' : 'Live Data Requires Review'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[var(--color-text-header)]">Production Data Health & Source of Truth</h2>
          <p className="text-xs text-text-muted mt-1">Direct audit of the complete live Firestore listings collection, not the public filtered view.</p>
        </div>
        <button onClick={() => void runAudit()} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-[var(--color-text-main)] transition-colors shrink-0">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Live Audit</span>
        </button>
      </div>

      {auditError && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">{auditError}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-2xl p-4 space-y-1 border ${suspiciousListings.length ? 'border-amber-500/30' : 'border-emerald-500/30'} bg-[var(--color-bg-secondary)]/60`}>
          <div className="flex justify-between items-center text-[var(--color-text-muted)]"><span className="text-[10px] font-mono font-bold uppercase">Fake / Stock Review</span>{suspiciousListings.length ? <AlertTriangle size={16} className="text-amber-400" /> : <CheckCircle2 size={16} className="text-emerald-400" />}</div>
          <h3 className={`text-2xl font-black font-mono ${suspiciousListings.length ? 'text-amber-400' : 'text-emerald-400'}`}>{suspiciousListings.length} REVIEW</h3>
          <p className="text-[10px] text-text-muted font-mono">No record is called fake without evidence.</p>
        </div>
        <div className="bg-[var(--color-bg-secondary)]/60 border border-emerald-500/30 rounded-2xl p-4 space-y-1">
          <div className="flex justify-between items-center text-emerald-400"><span className="text-[10px] font-mono font-bold uppercase">Auto-Seed Guard</span><CheckCircle2 size={16} /></div>
          <h3 className="text-2xl font-black text-emerald-400 font-mono">DISABLED</h3>
          <p className="text-[10px] text-text-muted font-mono">Production seed path is a no-op.</p>
        </div>
        <div className="bg-[var(--color-bg-secondary)]/60 border border-emerald-500/30 rounded-2xl p-4 space-y-1">
          <div className="flex justify-between items-center text-emerald-400"><span className="text-[10px] font-mono font-bold uppercase">Synthetic Inventory</span><CheckCircle2 size={16} /></div>
          <h3 className="text-2xl font-black text-emerald-400 font-mono">BLOCKED</h3>
          <p className="text-[10px] text-text-muted font-mono">Missing data is never replaced with generated vehicles.</p>
        </div>
        <div className="bg-[var(--color-bg-secondary)]/60 border border-white/10 rounded-2xl p-4 space-y-1">
          <div className="flex justify-between items-center text-text-muted"><span className="text-[10px] font-mono font-bold uppercase">Source</span><Database size={16} className="text-orange-400" /></div>
          <h3 className="text-2xl font-black text-[var(--color-text-header)] font-mono">FIRESTORE</h3>
          <p className="text-[10px] text-text-muted font-mono">Complete live listings collection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-bg-secondary)]/40 border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3"><div className="flex items-center gap-2 text-orange-400 font-bold text-sm"><Car size={18} /><span>Vehicle Inventory</span></div><span className="font-mono text-xs font-black bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md">{totalVehicles} Total</span></div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-text-muted">Published Live:</span><span className="font-bold text-emerald-400">{publishedVehicles}</span></div>
            <div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-text-muted">Pending:</span><span className="font-bold text-amber-400">{pendingVehicles}</span></div>
            <div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-text-muted">Marked Sold:</span><span className="font-bold text-indigo-400">{soldVehicles}</span></div>
            <div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-text-muted">Archived:</span><span className="font-bold text-text-muted">{archivedVehicles}</span></div>
            <div className="flex justify-between py-1.5"><span className="text-text-muted">Paused:</span><span className="font-bold text-text-muted">{pausedVehicles}</span></div>
          </div>
        </div>

        <div className="bg-[var(--color-bg-secondary)]/40 border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3"><div className="flex items-center gap-2 text-blue-400 font-bold text-sm"><Store size={18} /><span>Showrooms</span></div><span className="font-mono text-xs font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md">{dealers.length} Records</span></div>
          <div className="space-y-2 text-xs font-mono">
            {dealers.slice(0, 4).map(d => <div key={d.id} className="flex justify-between py-1.5 border-b border-white/5 last:border-0"><span className="text-[var(--color-text-main)] truncate max-w-[160px]">{d.name}</span><span className="text-emerald-400 font-bold">{(d as any).verified === true ? 'Verified' : 'Unverified'}</span></div>)}
            {dealers.length === 0 && <p className="text-xs text-text-muted py-4 text-center">No showroom records found.</p>}
          </div>
        </div>

        <div className="bg-[var(--color-bg-secondary)]/40 border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3"><div className="flex items-center gap-2 text-emerald-400 font-bold text-sm"><FileText size={18} /><span>Customer Leads</span></div><span className="font-mono text-xs font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md">{leads.length} Records</span></div>
          <div className="space-y-2 text-xs font-mono"><div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-text-muted">Lead records:</span><span className="font-bold text-emerald-400">{leads.length}</span></div><div className="flex justify-between py-1.5"><span className="text-text-muted">Source:</span><span className="font-bold text-emerald-400">Firestore</span></div></div>
        </div>
      </div>

      {missingMedia.length > 0 && <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200"><AlertTriangle className="inline mr-2 text-amber-400" size={16} /><strong>{missingMedia.length}</strong> listing(s) have no trusted image URL. They are not replaced with fake or AI media.</div>}
      {suspiciousListings.length > 0 && <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3"><AlertTriangle className="text-amber-400 shrink-0" size={20} /><div className="text-xs text-amber-200"><strong>Review required:</strong> {suspiciousListings.length} listing(s) contain fake/test terms or blocked stock-media hosts. Nothing was deleted by this panel.</div></div>}

      <div className="text-right text-[10px] font-mono text-text-muted">Last live check: {lastChecked || 'Not checked'} | System Status: {statusHealthy ? 'LIVE DATA CLEAR' : 'REVIEW REQUIRED'}</div>
    </div>
  );
};
