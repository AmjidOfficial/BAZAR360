import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  MessageCircle, 
  UserCheck, 
  FileText, 
  Send,
  Plus
} from 'lucide-react';
import { dbFetchServiceBookings, dbUpdateServiceBookingStatus, dbAddCrmInternalNote } from '../../lib/dbService';
import { ServiceBooking } from '../../types';
import { CRMRequestStatus } from './CRMRequestStatus';
import { syncToWhatsApp } from '../../lib/syncToWhatsApp';
import { toast } from 'react-hot-toast';

interface ServiceManagementHubProps {
  lang?: 'en' | 'ur';
}

const EXPERT_TECHNICIANS = [
  'Ustad Tariq (Master Engine Specialist)',
  'Engineer Bilal (EV & Hybrid Diagnostics)',
  'Khan Muhammad (Chassis & Paint Inspection)',
  'Malik Sohail (Suspension & Transmission Lead)',
  'Zubair Khan (General Maintenance Supervisor)'
];

export function ServiceManagementHub({ lang = 'en' }: ServiceManagementHubProps) {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assignedTech, setAssignedTech] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadBookings() {
      try {
        const data = await dbFetchServiceBookings();
        if (!isMounted) return;
        setBookings(data);
        if (data.length > 0 && !selectedBooking) {
          setSelectedBooking(data[0]);
          setAssignedTech((data[0] as any).assignedTechnician || EXPERT_TECHNICIANS[0]);
        }
      } catch (err) {
        console.error('Failed to fetch service management bookings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: ServiceBooking['status']) => {
    try {
      await dbUpdateServiceBookingStatus(bookingId, newStatus);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast.success(`Service status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update service status');
    }
  };

  const handleAssignTechnician = async (techName: string) => {
    if (!selectedBooking) return;
    try {
      setAssignedTech(techName);
      const noteEntry = {
        id: `tech-${Date.now()}`,
        authorName: 'CRM Service Dispatch',
        noteText: `Assigned expert technician: ${techName}`,
        createdAt: new Date().toISOString()
      };
      const notes = [...((selectedBooking as any).internalNotes || []), noteEntry];
      await dbAddCrmInternalNote(selectedBooking.id, notes, 'service_bookings');

      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, internalNotes: notes } as any : b));
      setSelectedBooking(prev => prev ? { ...prev, internalNotes: notes, assignedTechnician: techName } as any : null);
      toast.success(`Technician assigned: ${techName}`);
    } catch {
      toast.error('Failed to assign technician');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedBooking) return;

    try {
      const noteEntry = {
        id: `note-${Date.now()}`,
        authorName: 'Service Admin',
        noteText: newNoteText.trim(),
        createdAt: new Date().toISOString()
      };
      const notes = [...((selectedBooking as any).internalNotes || []), noteEntry];
      await dbAddCrmInternalNote(selectedBooking.id, notes, 'service_bookings');

      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, internalNotes: notes } as any : b));
      setSelectedBooking(prev => prev ? { ...prev, internalNotes: notes } as any : null);
      setNewNoteText('');
      toast.success('Service CRM note logged successfully.');
    } catch {
      toast.error('Failed to log note.');
    }
  };

  const filtered = bookings.filter(b => {
    const matchesSearch = 
      b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.userPhone && b.userPhone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'ALL' || b.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-text-muted">
        Loading Enterprise Service Management Hub...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-bg-secondary/70 border border-border-main rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black font-display uppercase tracking-tight text-[var(--color-text-header)] flex items-center gap-2">
            <Wrench className="text-orange-500" size={22} />
            <span>Service & Maintenance Management Hub</span>
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
            End-to-end scheduling, appointment tracking, technician dispatch, and instant WhatsApp handoff for Auto Choice services.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 text-text-muted" size={15} />
            <input
              type="text"
              placeholder="Search service, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-primary border border-border-main focus:border-orange-500 rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--color-text-header)] placeholder:text-text-muted focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bg-primary border border-border-main text-[var(--color-text-header)] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Service Bookings Queue */}
        <div className="lg:col-span-5 bg-bg-secondary/40 border border-border-main rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-border-main bg-bg-primary/60 font-mono text-xs uppercase font-bold text-text-muted flex justify-between items-center">
            <span>Service Appointments ({filtered.length})</span>
            <span className="text-[10px] text-orange-400 font-mono">Firestore Connected</span>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-text-muted">
                No service bookings match filter criteria.
              </div>
            ) : (
              filtered.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBooking(b);
                    setAssignedTech((b as any).assignedTechnician || EXPERT_TECHNICIANS[0]);
                  }}
                  className={`p-4 transition-all cursor-pointer space-y-2 hover:bg-bg-tertiary/40 ${
                    selectedBooking?.id === b.id ? 'bg-orange-500/10 border-l-4 border-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-orange-400">{b.id}</span>
                    <CRMRequestStatus status={b.status} size="sm" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-text-header)] line-clamp-1">{b.serviceTitle}</h4>
                    <p className="text-[11px] text-text-muted font-sans mt-0.5">{b.userName} • {b.userPhone}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-blue-400" />
                      <span>{b.preferredDate || 'ASAP'}</span>
                    </span>
                    {(b as any).assignedTechnician && (
                      <span className="text-[var(--color-accent-main)] truncate max-w-[140px]">
                        Tech: {(b as any).assignedTechnician.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Service Detail & Dispatch Console */}
        <div className="lg:col-span-7">
          {selectedBooking ? (
            <div className="bg-bg-secondary/60 border border-border-main rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-orange-400">{selectedBooking.id}</span>
                    <CRMRequestStatus status={selectedBooking.status} size="md" />
                  </div>
                  <h3 className="text-xl font-black font-display text-[var(--color-text-header)] mt-1">
                    {selectedBooking.serviceTitle}
                  </h3>
                  <p className="text-xs text-text-muted font-mono mt-0.5">
                    Requested on {new Date(selectedBooking.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* WhatsApp Handoff */}
                <button
                  onClick={() => syncToWhatsApp(
                    selectedBooking.id,
                    selectedBooking.vehicleTitle || selectedBooking.serviceTitle,
                    selectedBooking.status,
                    selectedBooking.userName,
                    selectedBooking.userPhone
                  )}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-[var(--color-accent-main)] text-slate-950 font-black text-xs uppercase rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Handoff</span>
                </button>
              </div>

              {/* Customer & Appointment Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-primary/50 p-4 rounded-xl border border-border-main">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Customer Details</span>
                  <p className="text-xs font-bold text-[var(--color-text-header)] flex items-center gap-1.5">
                    <User size={13} className="text-orange-400" />
                    <span>{selectedBooking.userName} ({selectedBooking.city || 'Peshawar'})</span>
                  </p>
                  <p className="text-xs text-text-muted font-mono flex items-center gap-1.5">
                    <Phone size={13} className="text-[var(--color-accent-main)]" />
                    <span>{selectedBooking.userPhone}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Appointment Schedule</span>
                  <p className="text-xs font-bold text-[var(--color-text-header)] flex items-center gap-1.5">
                    <Calendar size={13} className="text-blue-400" />
                    <span>{selectedBooking.preferredDate || 'As Soon As Possible'}</span>
                  </p>
                  <p className="text-xs text-text-muted font-mono flex items-center gap-1.5">
                    <Car size={13} className="text-orange-400" />
                    <span className="truncate">{selectedBooking.vehicleTitle || selectedBooking.vehicleDetails || 'General Inspection'}</span>
                  </p>
                </div>
              </div>

              {/* Technician Assignment */}
              <div className="bg-bg-primary/60 p-4 rounded-xl border border-border-main space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-text-muted uppercase flex items-center gap-1.5">
                    <UserCheck size={14} className="text-orange-400" />
                    <span>Expert Technician Dispatch:</span>
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-accent-main)] bg-[var(--color-accent-main)]/10 px-2 py-0.5 rounded border border-[var(--color-accent-main)]/20">
                    {assignedTech || 'Unassigned'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EXPERT_TECHNICIANS.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => handleAssignTechnician(tech)}
                      className={`p-2 rounded-xl text-left text-xs font-mono transition-all cursor-pointer border ${
                        assignedTech === tech
                          ? 'bg-orange-500 text-slate-950 font-bold border-orange-400 shadow'
                          : 'bg-bg-secondary hover:bg-bg-tertiary text-text-muted border-border-main'
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selector */}
              <div className="bg-bg-primary/60 p-4 rounded-xl border border-border-main flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs font-mono font-bold text-text-muted uppercase">Update Status:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedBooking.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedBooking.status === st
                          ? 'bg-orange-500 text-slate-950 shadow'
                          : 'bg-bg-secondary hover:bg-bg-tertiary text-text-muted border border-border-main'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes Logger */}
              <div className="bg-bg-primary/60 p-4 rounded-xl border border-border-main space-y-3">
                <span className="text-xs font-mono font-bold text-text-muted uppercase flex items-center gap-1.5">
                  <FileText size={14} className="text-orange-400" />
                  <span>Service Notes & Inspection Remarks</span>
                </span>
                
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Log technician notes, diagnostic readings, or customer follow-up remarks..."
                    className="w-full bg-bg-secondary border border-border-main focus:border-orange-500 text-[var(--color-text-header)] rounded-xl p-3 text-xs placeholder:text-text-muted focus:outline-none resize-none font-sans"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
                    >
                      <Send size={12} />
                      <span>Log Note</span>
                    </button>
                  </div>
                </form>

                <div className="space-y-2 max-h-40 overflow-y-auto pt-2">
                  {((selectedBooking as any).internalNotes || []).length === 0 ? (
                    <p className="text-center text-[11px] font-mono text-text-muted italic py-2">
                      No internal notes recorded yet.
                    </p>
                  ) : (
                    ((selectedBooking as any).internalNotes || []).map((note: any) => (
                      <div key={note.id} className="p-2.5 bg-bg-secondary border border-border-main rounded-xl space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-text-muted">
                          <span className="font-bold text-orange-400">{note.authorName}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-text-main font-sans">{note.noteText}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-bg-secondary/60 border border-border-main rounded-2xl p-12 text-center text-text-muted font-mono text-xs">
              Select a service booking from the queue to manage appointment scheduling and technician dispatch.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
