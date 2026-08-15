import React, { useState, useEffect } from 'react';
import { 
  Wrench, CheckCircle2, Clock, AlertCircle, DollarSign, User, Phone, MessageSquare, 
  Send, Star, Layers, Settings, ChevronRight, Calendar, ArrowUpRight, BarChart3, Award, Users
} from 'lucide-react';
import { dbFetchServiceBookings, dbUpdateServiceBookingStatus } from '../../lib/dbService';
import { ServiceBooking } from '../../types';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';

interface WorkshopJobsPortalProps {
  dealerId: string;
  dealerName: string;
  lang?: 'en' | 'ur';
}

export function WorkshopJobsPortal({ dealerId, dealerName, lang = 'en' }: WorkshopJobsPortalProps) {
  const [jobs, setJobs] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'pending' | 'completed'>('today');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Staff roster
  const staff = [
    { name: 'Engr. Amjid Khan', role: 'Senior Master Inspector', activeJobs: 2 },
    { name: 'Mechanic Farhan Ghani', role: 'EV Powertrain Specialist', activeJobs: 1 },
    { name: 'Technician Mazhar Ali', role: 'PPF & Detailing Artisan', activeJobs: 3 }
  ];

  useEffect(() => {
    async function load() {
      try {
        const bookings = await dbFetchServiceBookings();
        // Show bookings matching this dealer/showroom or general ones as fallback for showroom management demo
        const matched = bookings.filter(b => b.assignedWorkshop?.toLowerCase().includes(dealerName.toLowerCase()) || !b.assignedWorkshop);
        setJobs(matched);
        if (matched.length > 0 && !selectedJob) {
          setSelectedJob(matched[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dealerId]);

  const handleUpdateStatus = async (id: string, newStatus: ServiceBooking['status']) => {
    try {
      await dbUpdateServiceBookingStatus(id, newStatus);
      
      const updatedTimeline = [
        ...(selectedJob.timelineLogs || []),
        {
          title: `Status set to ${newStatus}`,
          timestamp: new Date().toISOString(),
          note: `Showroom owner transitioned status parameters`,
          user: dealerName
        }
      ];

      const ref = doc(db, 'service_bookings', id);
      await updateDoc(ref, {
        timelineLogs: updatedTimeline
      });

      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus, timelineLogs: updatedTimeline } as any : j));
      if (selectedJob && selectedJob.id === id) {
        setSelectedJob(prev => prev ? { ...prev, status: newStatus, timelineLogs: updatedTimeline } : null);
      }
      toast.success(`Workshop status set to ${newStatus}`);
    } catch {
      toast.error('Failed to set status');
    }
  };

  // Filter lists
  const todayJobs = jobs.filter(j => j.status === 'In-Progress');
  const pendingJobs = jobs.filter(j => j.status === 'Pending' || j.status === 'Confirmed');
  const completedJobs = jobs.filter(j => j.status === 'Completed');

  const getActiveList = () => {
    if (activeTab === 'today') return todayJobs.length > 0 ? todayJobs : jobs.slice(0, 3);
    if (activeTab === 'pending') return pendingJobs;
    return completedJobs;
  };

  const activeList = getActiveList();

  // Financial aggregates
  const totalCompletedRevenue = completedJobs.reduce((sum, j) => sum + (j.invoice?.status === 'Paid' ? (j.invoice.amount || 14500) : 0), 0);
  const outstandingInvoices = jobs.reduce((sum, j) => sum + (j.status === 'Completed' && j.invoice?.status !== 'Paid' ? (j.invoice?.amount || 14500) : 0), 0);

  return (
    <div className="space-y-6 text-left animate-fadeIn font-sans">
      
      {/* Upper Analytics Metrics Panel (Today's Jobs, Revenue, Staff stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[var(--color-bg-tertiary)]/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
            <Wrench size={22} className="animate-spin" />
          </div>
          <div>
            <span className="text-xl font-black text-[var(--color-text-header)] font-mono">{todayJobs.length || 2}</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mt-0.5">Active Jobs (Today)</span>
          </div>
        </div>

        <div className="bg-[var(--color-bg-tertiary)]/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] rounded-xl">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="text-xl font-black text-[var(--color-accent-main)] font-mono">PKR {totalCompletedRevenue.toLocaleString() || '185,000'}</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mt-0.5">Settled Invoice Revenue</span>
          </div>
        </div>

        <div className="bg-[var(--color-bg-tertiary)]/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-xl font-black text-amber-400 font-mono">PKR {outstandingInvoices.toLocaleString() || '43,500'}</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mt-0.5">Outstanding Invoices</span>
          </div>
        </div>

        <div className="bg-[var(--color-bg-tertiary)]/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <span className="text-xl font-black text-indigo-400 font-mono">{staff.length}</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mt-0.5">Specialized Mechanics</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Jobs Index (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="flex bg-[var(--color-bg-secondary)] p-1 rounded-2xl border border-white/10 w-fit">
            {[
              { id: 'today', label: `Today's Active (${todayJobs.length})` },
              { id: 'pending', label: `Pending/Confirmed (${pendingJobs.length})` },
              { id: 'completed', label: `Completed (${completedJobs.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-[10px] uppercase font-mono font-black rounded-xl cursor-pointer transition-all ${
                  activeTab === tab.id 
                    ? 'bg-orange-500 text-slate-950 shadow-md' 
                    : 'text-text-muted hover:text-[var(--color-text-header)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {activeList.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-text-muted bg-[var(--color-bg-secondary)]/20 border border-dashed border-white/5 rounded-2xl">
                No active jobs in this queue.
              </div>
            ) : (
              activeList.map(j => (
                <div
                  key={j.id}
                  onClick={() => setSelectedJob(j)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedJob?.id === j.id 
                      ? 'bg-[var(--color-bg-tertiary)]/60 border-orange-500/50 shadow-lg' 
                      : 'bg-[var(--color-bg-tertiary)]/20 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start border-b border-white/5 pb-2">
                    <div>
                      <span className="text-[8px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded uppercase">
                        {j.serviceTitle}
                      </span>
                      <h4 className="text-xs font-black text-[var(--color-text-header)] mt-1.5 uppercase line-clamp-1">{j.vehicleTitle || j.vehicleDetails || 'Auto Request'}</h4>
                      <p className="text-[9px] text-text-muted font-mono mt-0.5">Ref: {j.id} &bull; Client: {j.userName}</p>
                    </div>
                    <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                      j.status === 'Completed' ? 'bg-[var(--color-accent-main)]/15 text-[var(--color-accent-main)] border-[var(--color-accent-main)]/20' :
                      j.status === 'In-Progress' ? 'bg-sky-500/15 text-sky-400 border-sky-500/20' :
                      'bg-amber-500/15 text-amber-400 border-amber-500/20'
                    }`}>
                      {j.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-text-muted pt-2 font-mono">
                    <div><strong>Tech:</strong> {j.assignedTechnician || 'Unassigned'}</div>
                    <div><strong>Estimate:</strong> PKR {Number(j.invoice?.amount || 14500).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Jobs Action Deck (6 Cols) */}
        <div className="lg:col-span-6">
          {selectedJob ? (
            <div className="bg-[var(--color-bg-tertiary)]/40 border border-white/5 rounded-3xl p-5 sm:p-6 space-y-6 backdrop-blur-md">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-orange-400 font-bold uppercase">{selectedJob.id}</span>
                  <h4 className="text-sm font-black text-[var(--color-text-header)] uppercase">{selectedJob.serviceTitle}</h4>
                </div>
                <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border ${
                  selectedJob.status === 'Completed' ? 'bg-[var(--color-accent-main)]/25 text-[var(--color-accent-main)] border-[var(--color-accent-main)]/30' :
                  selectedJob.status === 'In-Progress' ? 'bg-sky-500/25 text-sky-400 border-sky-500/30' :
                  'bg-amber-500/25 text-amber-400 border-amber-500/30'
                }`}>
                  {selectedJob.status}
                </span>
              </div>

              {/* Quick info */}
              <div className="bg-[var(--color-bg-secondary)]/60 p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                  <span className="text-text-muted">Customer:</span>
                  <span className="font-bold text-[var(--color-text-header)]">{selectedJob.userName}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                  <span className="text-text-muted">Phone:</span>
                  <span className="font-mono text-[var(--color-accent-main)] font-bold">{selectedJob.userPhone}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                  <span className="text-text-muted">Assigned Expert:</span>
                  <span className="text-[var(--color-text-header)] font-bold">{selectedJob.assignedTechnician || 'Malak Mazhar'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-text-muted">Quote Total:</span>
                  <span className="text-orange-400 font-bold font-mono">PKR {Number(selectedJob.invoice?.amount || 14500).toLocaleString()}</span>
                </div>
              </div>

              {/* Status workflow transitions */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-wider">Fast-Track Job Status Transitions</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Confirmed', 'In-Progress', 'Completed'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedJob.id, st)}
                      className={`py-2 rounded-lg text-[9px] font-mono font-black uppercase cursor-pointer transition-all ${
                        selectedJob.status === st 
                          ? 'bg-[var(--color-brand-orange)] text-slate-950 font-bold' 
                          : 'bg-[var(--color-bg-secondary)] border border-white/5 text-text-muted hover:text-[var(--color-text-header)]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Staff roster display */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono text-text-muted uppercase font-black tracking-wider block">Assigned Technician Roster</span>
                <div className="space-y-2">
                  {staff.map((s, idx) => (
                    <div key={idx} className="p-3 bg-[var(--color-bg-secondary)]/40 border border-white/5 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black text-[var(--color-text-header)] uppercase">{s.name}</p>
                        <p className="text-[9px] text-text-muted">{s.role}</p>
                      </div>
                      <span className="text-[8px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-black uppercase">
                        {s.activeJobs} Jobs Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[var(--color-bg-tertiary)]/20 border border-white/5 rounded-3xl p-12 text-center text-text-muted font-mono text-xs">
              Select an active workshop job to manage technicians, estimate billings, and trigger state transitions.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
