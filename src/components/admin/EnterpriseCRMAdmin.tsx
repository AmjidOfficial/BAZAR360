import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Search, Filter, MessageSquare, Phone, User, Clock, CheckCircle2, 
  AlertCircle, FileText, Send, Star, Layers, Settings, Hammer, Plus, Check, MapPin, Wrench, Trash2, Award
} from 'lucide-react';
import { dbFetchServiceBookings, dbUpdateServiceBookingStatus, dbAddCrmInternalNote } from '../../lib/dbService';
import { ServiceBooking } from '../../types';
import { CRMRequestStatus } from './CRMRequestStatus';
import { syncToWhatsApp } from '../../lib/syncToWhatsApp';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';

interface EnterpriseCRMAdminProps {
  lang?: 'en' | 'ur';
}

export function EnterpriseCRMAdmin({ lang = 'en' }: EnterpriseCRMAdminProps) {
  const [records, setRecords] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  
  // Tab for the detailed inspector panel
  const [detailTab, setDetailTab] = useState<'info' | 'ops' | 'chat' | 'reviews'>('info');

  // Input states for assignments
  const [workshopInput, setWorkshopInput] = useState('');
  const [technicianInput, setTechnicianInput] = useState('');
  const [priorityInput, setPriorityInput] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [estCostInput, setEstCostInput] = useState(14500);
  const [estCompletionInput, setEstCompletionInput] = useState('');

  // Timeline stage logger
  const [customStageTitle, setCustomStageTitle] = useState('');
  const [customStageNote, setCustomStageNote] = useState('');

  // Photo adder
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  // Internal chat messenger
  const [adminReplyMessage, setAdminReplyMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const bookings = await dbFetchServiceBookings();
        setRecords(bookings);
        if (bookings.length > 0 && !selectedRecord) {
          setSelectedRecord(bookings[0]);
        }
      } catch (err) {
        console.error('Failed to load enterprise CRM records:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Update states whenever record selection shifts
  useEffect(() => {
    if (selectedRecord) {
      setWorkshopInput(selectedRecord.assignedWorkshop || '');
      setTechnicianInput(selectedRecord.assignedTechnician || '');
      setPriorityInput(selectedRecord.priority || 'High');
      setEstCostInput(selectedRecord.estimatedCost || 14500);
      setEstCompletionInput(selectedRecord.estimatedCompletion || '');
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [selectedRecord?.id]);

  const handleStatusChange = async (id: string, newStatus: ServiceBooking['status']) => {
    try {
      await dbUpdateServiceBookingStatus(id, newStatus);
      
      const updatedTimeline = [
        ...(selectedRecord.timelineLogs || []),
        {
          title: `Status set to ${newStatus}`,
          timestamp: new Date().toISOString(),
          note: `Staff updated service status parameters`,
          user: 'Enterprise CRM Admin'
        }
      ];

      // Update Firestore timeline alongside status
      const ref = doc(db, 'service_bookings', id);
      await updateDoc(ref, {
        timelineLogs: updatedTimeline
      });

      setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, timelineLogs: updatedTimeline } as any : r));
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(prev => prev ? { ...prev, status: newStatus, timelineLogs: updatedTimeline } : null);
      }
      toast.success(`CRM status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update CRM status');
    }
  };

  const handleSaveAssignments = async () => {
    if (!selectedRecord) return;

    try {
      const ref = doc(db, 'service_bookings', selectedRecord.id);
      
      const updatePayload = {
        assignedWorkshop: workshopInput.trim(),
        assignedTechnician: technicianInput.trim(),
        priority: priorityInput,
        estimatedCost: Number(estCostInput),
        estimatedCompletion: estCompletionInput,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(ref, updatePayload);

      // Append custom timeline events for assignments
      const timeline = selectedRecord.timelineLogs || [];
      const newEvent = {
        title: 'Operations Updated',
        timestamp: new Date().toISOString(),
        note: `Assigned: ${workshopInput} | Tech: ${technicianInput} | Priority: ${priorityInput}`,
        user: 'Enterprise CRM Admin'
      };

      await updateDoc(ref, {
        timelineLogs: [...timeline, newEvent]
      });

      const updatedRecord = {
        ...selectedRecord,
        ...updatePayload,
        timelineLogs: [...timeline, newEvent]
      };

      setSelectedRecord(updatedRecord);
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? (updatedRecord as any) : r));
      toast.success('Operations & workshop assignment securely saved.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save operation metrics.');
    }
  };

  const handleLogCustomStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !customStageTitle.trim()) return;

    try {
      const now = new Date().toISOString();
      const newStage = {
        title: customStageTitle.trim(),
        timestamp: now,
        note: customStageNote.trim() || 'No description supplied',
        user: 'Enterprise CRM Admin'
      };

      const timeline = selectedRecord.timelineLogs || [];
      const updatedTimeline = [...timeline, newStage];

      const ref = doc(db, 'service_bookings', selectedRecord.id);
      await updateDoc(ref, {
        timelineLogs: updatedTimeline,
        updatedAt: now
      });

      const updatedRecord = {
        ...selectedRecord,
        timelineLogs: updatedTimeline
      };

      setSelectedRecord(updatedRecord);
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? (updatedRecord as any) : r));
      setCustomStageTitle('');
      setCustomStageNote('');
      toast.success('Custom timeline stage registered live.');
    } catch {
      toast.error('Failed to log stage.');
    }
  };

  const handleAddVehiclePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !photoUrlInput.trim()) return;

    try {
      const photos = selectedRecord.photos || [];
      const updatedPhotos = [...photos, photoUrlInput.trim()];

      const ref = doc(db, 'service_bookings', selectedRecord.id);
      await updateDoc(ref, {
        photos: updatedPhotos,
        updatedAt: new Date().toISOString()
      });

      const updatedRecord = {
        ...selectedRecord,
        photos: updatedPhotos
      };

      setSelectedRecord(updatedRecord);
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? (updatedRecord as any) : r));
      setPhotoUrlInput('');
      toast.success('Vehicle photo log registered.');
    } catch {
      toast.error('Failed to register photo.');
    }
  };

  const handleSendAdminMessage = async () => {
    if (!adminReplyMessage.trim() || !selectedRecord) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      senderName: 'Enterprise Admin',
      message: adminReplyMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const currentMessages = selectedRecord.chatMessages || [];
    const updatedMessages = [...currentMessages, newMessage];

    try {
      const ref = doc(db, 'service_bookings', selectedRecord.id);
      await updateDoc(ref, {
        chatMessages: updatedMessages,
        updatedAt: new Date().toISOString()
      });

      const updatedRecord = { ...selectedRecord, chatMessages: updatedMessages };
      setSelectedRecord(updatedRecord);
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? (updatedRecord as any) : r));
      setAdminReplyMessage('');
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      toast.success('CRM Message dispatched directly.');
    } catch {
      toast.error('Failed to dispatch message.');
    }
  };

  const filtered = records.filter(r => {
    const matchesSearch = 
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.userPhone && r.userPhone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'ALL' || r.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* CRM Command Header */}
      <div className="bg-[var(--color-bg-tertiary)]/50 border border-white/10 rounded-3xl p-5 flex flex-col lg:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h3 className="text-lg font-black font-sans uppercase tracking-tight text-[var(--color-text-header)] flex items-center gap-2">
            <ShieldCheck className="text-orange-500" size={24} />
            <span>Enterprise 360° Service CRM Hub</span>
          </h3>
          <p className="text-xs text-text-muted font-mono mt-1">
            Aggregated workspace pipeline unifying service requests, assignments, 13-stage timelines, customer billing and real-time messaging.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 text-text-muted" size={15} />
            <input
              type="text"
              placeholder="Search Customer, ID, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-bg-secondary)] border border-white/10 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--color-text-header)] focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-[var(--color-bg-secondary)] border border-white/10 text-[var(--color-text-header)] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-orange-500 cursor-pointer"
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

      {/* Main CRM Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Central Records Table (7 Cols) */}
        <div className="lg:col-span-6 bg-[var(--color-bg-tertiary)]/20 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/5 bg-[var(--color-bg-secondary)]/60 font-mono text-xs uppercase font-bold text-text-muted flex justify-between items-center">
            <span>CRM Database Index ({filtered.length})</span>
            <span className="text-[10px] text-orange-400">Synced Real-Time</span>
          </div>

          <div className="overflow-x-auto max-h-[680px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[var(--color-bg-secondary)]/30 text-[10px] font-mono text-text-muted uppercase">
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Customer Specs</th>
                  <th className="p-3.5">Request Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-sans">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-text-muted font-mono">
                      No matching records in the CRM system.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRecord(r)}
                      className={`cursor-pointer transition-all hover:bg-white/5 ${
                        selectedRecord?.id === r.id ? 'bg-orange-500/10 border-l-4 border-orange-500' : ''
                      }`}
                    >
                      <td className="p-3.5 font-mono font-bold text-orange-400 whitespace-nowrap">{r.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-[var(--color-text-header)]">{r.userName}</div>
                        <div className="text-[10px] font-mono text-text-muted mt-0.5">{r.userPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-text-main line-clamp-1">{r.serviceTitle}</div>
                        <div className="text-[10px] font-mono text-text-muted mt-0.5">{r.vehicleTitle || 'General Fleet'}</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <CRMRequestStatus status={r.status} size="sm" />
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          r.priority === 'Critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                          r.priority === 'High' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-slate-500/10 border-slate-500/20 text-text-muted'
                        }`}>
                          {r.priority || 'High'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Selected CRM Detail Dashboard (5 Cols) */}
        <div className="lg:col-span-6">
          {selectedRecord ? (
            <div className="bg-[var(--color-bg-tertiary)]/40 border border-white/5 rounded-3xl p-5 sm:p-6 space-y-6 text-left backdrop-blur-md sticky top-6">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
                <div>
                  <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">{selectedRecord.id}</span>
                  <h4 className="text-base font-black text-[var(--color-text-header)] mt-0.5 uppercase">{selectedRecord.serviceTitle}</h4>
                </div>
                <CRMRequestStatus status={selectedRecord.status} size="md" />
              </div>

              {/* CRM Sub-Navigation Tabs */}
              <div className="flex bg-[var(--color-bg-secondary)] p-1 rounded-xl border border-white/5">
                {[
                  { id: 'info', label: 'Customer Specs' },
                  { id: 'ops', label: 'Operations' },
                  { id: 'chat', label: 'Messaging Center' },
                  { id: 'reviews', label: 'Performance' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`flex-1 py-2 text-[10px] uppercase font-mono font-black rounded-lg transition-all cursor-pointer ${
                      detailTab === tab.id 
                        ? 'bg-orange-500 text-slate-950 shadow-md' 
                        : 'text-text-muted hover:text-[var(--color-text-header)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: Customer Specs */}
              {detailTab === 'info' && (
                <div className="space-y-4 font-sans animate-fadeIn">
                  <div className="bg-[var(--color-bg-secondary)]/60 p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-text-muted">Customer Name:</span>
                      <span className="font-bold text-[var(--color-text-header)]">{selectedRecord.userName}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-text-muted">Mobile Phone:</span>
                      <span className="font-mono text-[var(--color-accent-main)] font-bold">{selectedRecord.userPhone}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-text-muted">Target Vehicle:</span>
                      <span className="text-text-main font-bold">{selectedRecord.vehicleTitle || 'General Fleet Inquiry'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-text-muted">Region/City:</span>
                      <span className="text-text-main">{selectedRecord.city || 'Peshawar'}</span>
                    </div>
                  </div>

                  {/* WhatsApp handoff backup */}
                  <button
                    onClick={() => syncToWhatsApp(selectedRecord.id, selectedRecord.vehicleTitle || selectedRecord.serviceTitle, selectedRecord.status, selectedRecord.userName, selectedRecord.userPhone)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-[var(--color-accent-main)] text-slate-950 font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp Handover Channel</span>
                  </button>

                  {/* Photo logs display / add */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-wider">Vehicle Photo Logs ({selectedRecord.photos?.length || 0})</span>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {(selectedRecord.photos || []).map((p: string, i: number) => (
                        <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-bg-primary border border-white/5 relative group">
                          <img src={p} alt="Inspection log" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddVehiclePhoto} className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Paste URL (e.g. Unsplash) to add inspection photo..."
                        value={photoUrlInput}
                        onChange={(e) => setPhotoUrlInput(e.target.value)}
                        className="flex-1 bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[var(--color-text-header)] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!photoUrlInput.trim()}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase rounded-xl shrink-0 cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: Operational Assignments & Stepper */}
              {detailTab === 'ops' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-[var(--color-bg-secondary)]/40 p-4 rounded-2xl border border-white/5 space-y-3.5">
                    <h5 className="text-[10px] font-mono font-bold text-orange-400 uppercase">Operational CRM Routing Parameters</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-text-muted uppercase font-bold">Assigned Workshop</label>
                        <input
                          type="text"
                          value={workshopInput}
                          onChange={(e) => setWorkshopInput(e.target.value)}
                          placeholder="e.g. Peshawar HQ"
                          className="w-full bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-[var(--color-text-header)] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-text-muted uppercase font-bold">Assigned Technician</label>
                        <input
                          type="text"
                          value={technicianInput}
                          onChange={(e) => setTechnicianInput(e.target.value)}
                          placeholder="e.g. Engr. Amjid"
                          className="w-full bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-[var(--color-text-header)] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-text-muted uppercase font-bold">Priority</label>
                        <select
                          value={priorityInput}
                          onChange={(e) => setPriorityInput(e.target.value as any)}
                          className="w-full bg-[var(--color-bg-secondary)] border border-white/10 text-[var(--color-text-header)] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-text-muted uppercase font-bold">Estimated Quote (PKR)</label>
                        <input
                          type="number"
                          value={estCostInput}
                          onChange={(e) => setEstCostInput(Number(e.target.value))}
                          className="w-full bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-[var(--color-text-header)] focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-text-muted uppercase font-bold">Est completion</label>
                        <input
                          type="text"
                          placeholder="e.g. 24 Hours"
                          value={estCompletionInput}
                          onChange={(e) => setEstCompletionInput(e.target.value)}
                          className="w-full bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-[var(--color-text-header)] focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveAssignments}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase rounded-xl transition cursor-pointer"
                    >
                      Save Assignments & Quote
                    </button>
                  </div>

                  {/* Lifecycle Status quick selectors */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-wider">Fast Transit CRM State Machine</span>
                    <div className="grid grid-cols-5 gap-1">
                      {(['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(selectedRecord.id, st)}
                          className={`py-1.5 px-1 rounded-lg text-[9px] font-mono font-black transition-all cursor-pointer ${
                            selectedRecord.status === st
                              ? 'bg-[var(--color-brand-orange)] text-slate-950 shadow'
                              : 'bg-[var(--color-bg-secondary)] hover:bg-bg-tertiary text-text-muted border border-white/5'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inline Timeline Log builder */}
                  <form onSubmit={handleLogCustomStage} className="bg-[var(--color-bg-secondary)]/30 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h5 className="text-[10px] font-mono font-bold text-text-muted uppercase">Log Custom Journey Stage (Syncs to Customer Timeline)</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Stage title (e.g. UV Laser Check)"
                        value={customStageTitle}
                        onChange={(e) => setCustomStageTitle(e.target.value)}
                        className="bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[var(--color-text-header)] focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Log detail note"
                        value={customStageNote}
                        onChange={(e) => setCustomStageNote(e.target.value)}
                        className="bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[var(--color-text-header)] focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-bg-tertiary hover:bg-slate-700 text-text-main font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                    >
                      Push Stage to Timeline Map
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: Multi-Party Live Chat messaging */}
              {detailTab === 'chat' && (
                <div className="space-y-4 animate-fadeIn flex flex-col h-[350px]">
                  <div className="bg-[var(--color-bg-secondary)]/60 flex-1 p-4 overflow-y-auto rounded-2xl border border-white/5 space-y-3 font-sans">
                    {(selectedRecord.chatMessages || [
                      {
                        id: 'welcome',
                        sender: 'admin',
                        senderName: 'System Bot',
                        message: 'Ask questions or log notes in this direct customer channel. Dispatched entries immediately show on customer dashboard.',
                        timestamp: selectedRecord.createdAt
                      }
                    ]).map((msg: any) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} space-y-1`}>
                          <span className="text-[8px] font-mono text-text-muted px-1">{msg.senderName || msg.sender.toUpperCase()}</span>
                          <div className={`p-2.5 rounded-xl max-w-[85%] text-xs ${
                            isAdmin 
                              ? 'bg-bg-tertiary text-[var(--color-text-header)] rounded-tr-none border border-border-main' 
                              : 'bg-orange-500 text-slate-950 rounded-tl-none'
                          }`}>
                            <p>{msg.message}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="flex gap-2 p-1">
                    <input
                      type="text"
                      placeholder="Type reply to customer..."
                      value={adminReplyMessage}
                      onChange={(e) => setAdminReplyMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendAdminMessage()}
                      className="flex-1 bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl px-3 py-2 text-xs text-[var(--color-text-header)] focus:outline-none font-sans"
                    />
                    <button
                      onClick={handleSendAdminMessage}
                      disabled={!adminReplyMessage.trim()}
                      className="p-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 rounded-xl transition cursor-pointer"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: Star rating feedback and logs */}
              {detailTab === 'reviews' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-[var(--color-bg-secondary)]/40 p-5 rounded-2xl border border-white/5 space-y-3.5">
                    <h5 className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wider">Customer Experience Audit</h5>
                    
                    {selectedRecord.review ? (
                      <div className="space-y-2.5 text-left font-sans">
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={15} 
                              className={i < (selectedRecord.review.rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-700"} 
                            />
                          ))}
                        </div>
                        <p className="text-[var(--color-text-header)] italic text-xs leading-relaxed">"{selectedRecord.review.comment}"</p>
                        <span className="text-[9px] font-mono text-text-muted block">Submitted: {new Date(selectedRecord.review.date).toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs font-mono text-text-muted">
                        No customer storefront review has been submitted yet for this record.
                      </div>
                    )}
                  </div>

                  {/* Audit Logs */}
                  <div className="bg-[var(--color-bg-secondary)]/40 p-4 rounded-2xl border border-white/5 space-y-2">
                    <h5 className="text-[10px] font-mono font-bold text-text-muted uppercase">Audit Records</h5>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto">
                      {(selectedRecord.timelineLogs || []).map((t: any, i: number) => (
                        <div key={i} className="text-[10px] font-mono text-text-muted border-b border-white/5 pb-1">
                          <span className="text-orange-400 font-bold">{t.title}</span> &bull; <span className="text-text-muted">{t.user || 'System'}</span>
                          <p className="text-[9px] text-text-muted mt-0.5">{t.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-[var(--color-bg-tertiary)]/20 border border-white/5 rounded-3xl p-16 text-center text-text-muted font-mono text-xs">
              Select a CRM record from the left database index to perform operations, chats, timeline updates & review ratings.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
