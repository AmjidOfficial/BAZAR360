import React, { useState, useEffect } from 'react';
import { ShieldCheck, MessageCircle, Clock, CheckCircle2, Car, Phone, User, FileText, Search, Activity, Calendar } from 'lucide-react';
import { dbFetchServiceBookings, dbUpdateServiceBookingStatus } from '../../lib/dbService';
import { ServiceBooking } from '../../types';
import { CRMRequestStatus } from './CRMRequestStatus';
import { CRMNoteLogger } from './CRMNoteLogger';
import { ServiceTimeline } from './ServiceTimeline';
import { toast } from 'react-hot-toast';

interface CRMServiceHubProps {
  lang: 'en' | 'ur';
}

export function CRMServiceHub({ lang }: CRMServiceHubProps) {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await dbFetchServiceBookings();
        setBookings(data);
        if (data.length > 0 && !selectedBooking) {
          setSelectedBooking(data[0]);
        }
      } catch (err) {
        console.error('Failed to load service bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: ServiceBooking['status']) => {
    try {
      await dbUpdateServiceBookingStatus(bookingId, newStatus);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update request status');
    }
  };

  const handleWhatsAppHandoff = (booking: ServiceBooking) => {
    const phoneNumber = '923000000000'; // Default Bazar360 CRM support line
    const text = `Hello Bazar360 CRM Support,%0A%0AMy CRM / Service ID: ${booking.id}%0AService: ${booking.serviceTitle}%0AVehicle: ${booking.vehicleTitle || booking.vehicleDetails || 'N/A'}%0ACurrent Status: ${booking.status}%0ACity: ${booking.city || 'Peshawar'}%0A%0APlease provide an update on my booking.`;
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
  };

  const filtered = bookings.filter(b => 
    b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.vehicleTitle && b.vehicleTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div className="bg-bg-secondary/60 border border-border-main rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black font-display uppercase tracking-tight text-[var(--color-text-header)] flex items-center gap-2">
            <ShieldCheck className="text-orange-500" size={20} />
            <span>Enterprise CRM & Service Request Hub</span>
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
            Centralized pipeline for tracking customer service bookings, internal notes, audit logs, and WhatsApp handoffs.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-text-muted" size={15} />
          <input
            type="text"
            placeholder="Search CRM ID, customer, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-primary border border-border-main focus:border-orange-500 rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--color-text-header)] placeholder:text-text-muted focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bookings List */}
        <div className="lg:col-span-5 bg-bg-secondary/40 border border-border-main rounded-2xl overflow-hidden shadow-xl max-h-[700px] overflow-y-auto">
          <div className="p-4 border-b border-border-main bg-bg-primary/60 font-mono text-xs uppercase font-bold text-text-muted">
            Service Inquiries ({filtered.length})
          </div>
          <div className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-text-muted">
                No service bookings found in CRM.
              </div>
            ) : (
              filtered.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className={`p-4 transition-all cursor-pointer text-left space-y-2 hover:bg-bg-tertiary/40 ${
                    selectedBooking?.id === b.id ? 'bg-orange-500/10 border-l-4 border-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-orange-400">ID: {b.id}</span>
                    <CRMRequestStatus status={b.status} size="sm" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-text-header)] line-clamp-1">{b.serviceTitle}</h4>
                    <p className="text-[11px] text-text-muted font-sans mt-0.5">{b.userName} • {b.userPhone}</p>
                  </div>
                  {b.vehicleTitle && (
                    <p className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                      <Car size={11} className="text-orange-400" />
                      <span className="truncate">{b.vehicleTitle}</span>
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Booking Detail & CRM Actions */}
        <div className="lg:col-span-7 space-y-6">
          {selectedBooking ? (
            <div className="bg-bg-secondary/60 border border-border-main rounded-2xl p-6 space-y-6">
              {/* Header Info */}
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

                {/* WhatsApp Handoff Button (Requirement 4) */}
                <button
                  onClick={() => handleWhatsAppHandoff(selectedBooking)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-[var(--color-accent-main)] text-slate-950 font-black text-xs uppercase rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0"
                >
                  <MessageCircle size={15} />
                  <span>Contact via WhatsApp</span>
                </button>
              </div>

              {/* Customer & Vehicle Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-primary/40 p-4 rounded-xl border border-border-main">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Customer Details</span>
                  <p className="text-xs font-bold text-[var(--color-text-header)] flex items-center gap-1.5">
                    <User size={13} className="text-orange-400" />
                    <span>{selectedBooking.userName}</span>
                  </p>
                  <p className="text-xs text-text-muted font-mono flex items-center gap-1.5">
                    <Phone size={13} className="text-[var(--color-accent-main)]" />
                    <span>{selectedBooking.userPhone}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Vehicle & Appointment</span>
                  <p className="text-xs font-bold text-[var(--color-text-header)] flex items-center gap-1.5">
                    <Car size={13} className="text-orange-400" />
                    <span>{selectedBooking.vehicleTitle || selectedBooking.vehicleDetails || 'General Service'}</span>
                  </p>
                  <p className="text-xs text-text-muted font-mono flex items-center gap-1.5">
                    <Calendar size={13} className="text-blue-400" />
                    <span>{selectedBooking.preferredDate || 'As Soon As Possible'}</span>
                  </p>
                </div>
              </div>

              {/* Status Selector */}
              <div className="bg-bg-primary/60 p-4 rounded-xl border border-border-main flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs font-mono font-bold text-text-muted uppercase">Update Request Status:</span>
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

              {/* CRM Note Logger (Requirement 1) */}
              <CRMNoteLogger
                recordId={selectedBooking.id}
                collectionName="service_bookings"
                notes={(selectedBooking as any).internalNotes || []}
              />

              {/* Service Timeline (Requirement 2) */}
              <ServiceTimeline recordId={selectedBooking.id} bookingTitle={selectedBooking.serviceTitle} />
            </div>
          ) : (
            <div className="bg-bg-secondary/60 border border-border-main rounded-2xl p-12 text-center text-text-muted font-mono text-xs">
              Select a service booking from the left list to view CRM details, audit logs, and internal notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
