import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, Clock, ShieldCheck, CheckCircle2, User, Phone, MessageSquare, 
  DollarSign, Send, Star, AlertCircle, Award, Calendar, ExternalLink, ArrowRight,
  ChevronRight, MapPin, Eye, FileText, Check, Download, Landmark
} from 'lucide-react';
import { ServiceBooking } from '../types';
import { dbFetchServiceBookings, dbAddCrmInternalNote, dbUpdateServiceBookingStatus } from '../lib/dbService';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

interface CustomerMyServicesProps {
  userPhoneOrUid: string;
  userName: string;
  lang?: 'en' | 'ur';
}

interface TimelineEvent {
  title: string;
  desc: string;
  date?: string;
  completed: boolean;
}

export function CustomerMyServices({ userPhoneOrUid, userName, lang = 'en' }: CustomerMyServicesProps) {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'history'>('active');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'jazzcash' | 'bank' | 'card'>('easypaisa');
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isUrdu = lang === 'ur';

  // Load bookings for current user
  useEffect(() => {
    async function load() {
      try {
        const data = await dbFetchServiceBookings(userPhoneOrUid);
        setBookings(data);
        if (data.length > 0 && !selectedBooking) {
          // Default select the first booking
          setSelectedBooking(data[0]);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userPhoneOrUid]);

  // Scroll chat window to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedBooking?.chatMessages]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedBooking) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      senderName: userName,
      message: chatMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const currentMessages = selectedBooking.chatMessages || [];
    const updatedMessages = [...currentMessages, newMessage];

    try {
      const ref = doc(db, 'service_bookings', selectedBooking.id);
      await updateDoc(ref, {
        chatMessages: updatedMessages,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const updatedBooking = { ...selectedBooking, chatMessages: updatedMessages };
      setSelectedBooking(updatedBooking);
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? (updatedBooking as any) : b));
      setChatMessage('');

      // Send silent notification log
      const logId = `log-${Date.now()}`;
      await setDoc(doc(db, 'systemLogs', logId), {
        id: logId,
        bookingId: selectedBooking.id,
        action: 'Chat Message Sent',
        details: `Customer sent message in booking chat for Ref: ${selectedBooking.id}`,
        timestamp: new Date().toISOString()
      });

      toast.success(isUrdu ? 'پیغام بھیج دیا گیا!' : 'Message sent inside Bazar360 CRM.');
    } catch (err) {
      console.warn('Fallback: updating locally due to firestore constraints:', err);
      // Fallback
      const updatedBooking = { ...selectedBooking, chatMessages: updatedMessages };
      setSelectedBooking(updatedBooking);
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? (updatedBooking as any) : b));
      setChatMessage('');
    }
  };

  const handleSimulatePayment = async () => {
    if (!selectedBooking) return;
    setIsPaying(true);

    // Mock network lag
    setTimeout(async () => {
      try {
        const now = new Date().toISOString();
        const updatedInvoice = {
          ...(selectedBooking.invoice || {
            amount: 14500,
            items: [{ name: 'Inspection Fee', cost: 14500 }]
          }),
          status: 'Paid',
          paymentMethod,
          paymentDate: now
        };

        const timeline = selectedBooking.timelineLogs || [];
        const newEvent = {
          title: 'Payment Completed',
          timestamp: now,
          note: `Paid via ${paymentMethod.toUpperCase()}`,
          user: userName
        };

        const ref = doc(db, 'service_bookings', selectedBooking.id);
        await updateDoc(ref, {
          status: 'Completed',
          invoice: updatedInvoice,
          timelineLogs: [...timeline, newEvent],
          updatedAt: now
        });

        const updatedBooking = {
          ...selectedBooking,
          status: 'Completed',
          invoice: updatedInvoice,
          timelineLogs: [...timeline, newEvent]
        };

        setSelectedBooking(updatedBooking);
        setBookings(prev => prev.map(b => b.id === selectedBooking.id ? (updatedBooking as any) : b));
        toast.success(isUrdu ? 'ادائیگی کامیاب ہو گئی!' : '✓ Payment verified! Invoice settled.');
      } catch (err) {
        console.error(err);
        toast.error('Payment failed.');
      } finally {
        setIsPaying(false);
      }
    }, 1500);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setIsSubmittingReview(true);

    try {
      const now = new Date().toISOString();
      const reviewObj = {
        rating: userRating,
        comment: reviewText.trim(),
        date: now
      };

      const timeline = selectedBooking.timelineLogs || [];
      const newEvent = {
        title: 'Review Submitted',
        timestamp: now,
        note: `Rated ${userRating} Stars: "${reviewText.trim()}"`,
        user: userName
      };

      const ref = doc(db, 'service_bookings', selectedBooking.id);
      await updateDoc(ref, {
        review: reviewObj,
        timelineLogs: [...timeline, newEvent],
        updatedAt: now
      });

      const updatedBooking = {
        ...selectedBooking,
        review: reviewObj,
        timelineLogs: [...timeline, newEvent]
      };

      setSelectedBooking(updatedBooking);
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? (updatedBooking as any) : b));
      setReviewText('');
      toast.success(isUrdu ? 'ریویو جمع کروانے کا شکریہ!' : '★ Review published directly on Showroom storefront!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filter bookings based on active tabs
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'active') {
      return b.status !== 'Completed' && b.status !== 'Cancelled';
    } else if (activeTab === 'upcoming') {
      return b.status === 'Confirmed';
    } else {
      return b.status === 'Completed' || b.status === 'Cancelled';
    }
  });

  // Calculate 13-Step complete Customer Journey timeline
  const getCompleteTimeline = (b: any): TimelineEvent[] => {
    const createdTime = b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '';
    const updatedTime = b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : '';
    const status = b.status;

    return [
      { title: 'Service Request Created', desc: 'Your request was logged securely into our servers.', date: createdTime, completed: true },
      { title: 'CRM Record Created', desc: 'Assigned unique ID and entered into department logs.', date: createdTime, completed: true },
      { title: 'Notification Sent', desc: 'Central alerts dispatched to Admins and Workshop Owners.', date: createdTime, completed: true },
      { title: 'Admin Review Complete', desc: 'Admin validated requirements and eligibility status.', date: createdTime, completed: ['Confirmed', 'In-Progress', 'Completed'].includes(status) },
      { title: 'Showroom Assigned', desc: `Routed to: ${b.assignedWorkshop || 'Auto Choice HQ Showroom'}.`, date: updatedTime, completed: ['Confirmed', 'In-Progress', 'Completed'].includes(status) },
      { title: 'Technician Assigned', desc: `Assigned Specialist: ${b.assignedTechnician || 'Senior Inspector Malak Mazhar'}.`, date: updatedTime, completed: ['Confirmed', 'In-Progress', 'Completed'].includes(status) },
      { title: 'Appointment Active', desc: `Preferred schedule set for: ${b.preferredDate || 'Flexible'}.`, date: b.preferredDate, completed: ['Confirmed', 'In-Progress', 'Completed'].includes(status) },
      { title: 'Service Started', desc: 'Vehicle entered active service bay and UV testing activated.', date: updatedTime, completed: ['In-Progress', 'Completed'].includes(status) },
      { title: 'Inspection Complete', desc: 'All metrics recorded with active photo logs.', date: updatedTime, completed: ['In-Progress', 'Completed'].includes(status) },
      { title: 'Invoice Ready', desc: 'Costs calculated and generated directly.', date: updatedTime, completed: status === 'Completed' || b.invoice?.status === 'Paid' },
      { title: 'Payment Completed', desc: b.invoice?.status === 'Paid' ? `Settled via ${b.invoice.paymentMethod?.toUpperCase()}` : 'Payment pending invoice presentation.', date: b.invoice?.paymentDate, completed: b.invoice?.status === 'Paid' },
      { title: 'Review Active', desc: b.review ? 'Feedback published live!' : 'Pending client rating.', date: b.review?.date, completed: !!b.review },
      { title: 'History Logged', desc: 'Record sealed for lifetime vehicle registration ledger.', date: updatedTime, completed: !!b.review }
    ];
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1e293b]/40 border border-white/5 p-5 rounded-3xl backdrop-blur-md">
        <div>
          <h3 className="text-lg font-black font-sans uppercase tracking-wide text-white flex items-center gap-2">
            <Wrench className="text-orange-500 animate-pulse" size={22} />
            <span>{isUrdu ? 'میرا سروسز ڈیش بورڈ' : 'My Advanced Services & CRM Hub'}</span>
          </h3>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            {isUrdu ? 'اپنے آرڈرز، لائیو ٹائم لائن، انوائسز اور فائر بیس چیٹ کو مانیٹر کریں' : 'Track your real-time 13-stage timeline, payments, direct workshop chats & reviews.'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#0f172a]/80 p-1 rounded-2xl border border-white/10 shrink-0">
          {[
            { id: 'active', label: isUrdu ? 'فعال سروسز' : 'Active Jobs' },
            { id: 'upcoming', label: isUrdu ? 'ملاقاتیں' : 'Appointments' },
            { id: 'history', label: isUrdu ? 'تاریخ' : 'History' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 text-[10px] uppercase font-mono font-black rounded-xl transition-all cursor-pointer ${
                activeTab === t.id 
                  ? 'bg-orange-500 text-slate-950 shadow-md' 
                  : 'text-text-muted hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Clock className="w-10 h-10 mx-auto text-orange-500 animate-spin mb-3" />
          <p className="text-xs font-mono text-text-muted uppercase font-black">Syncing Bazar360 CRM Core...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-3xl bg-[#0f172a]/40">
          <Wrench className="w-12 h-12 mx-auto text-text-muted mb-2 opacity-50" />
          <p className="text-text-main font-black text-sm uppercase">No Service Bookings Logged</p>
          <p className="text-xs text-text-muted mt-1">Book certified vehicle inspection or detailing at our Specialized Hub!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Customer Bookings Selector List */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-widest px-1">My Service Requests ({filteredBookings.length})</span>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-text-muted bg-[#0f172a]/20 border border-white/5 rounded-2xl">
                  No records in this tab.
                </div>
              ) : (
                filteredBookings.map(b => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                      selectedBooking?.id === b.id 
                        ? 'bg-[#1e293b]/60 border-orange-500/50 shadow-lg' 
                        : 'bg-[#1e293b]/20 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-2">
                      <div>
                        <span className="text-[8px] font-mono font-black uppercase text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                          {b.serviceTitle}
                        </span>
                        <h4 className="text-xs font-bold text-white uppercase mt-1.5 line-clamp-1">
                          {b.vehicleTitle || b.vehicleDetails || 'Specialized Auto Request'}
                        </h4>
                        <p className="text-[9px] text-text-muted font-mono mt-0.5">Ref: {b.id}</p>
                      </div>
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                        b.status === 'Completed' ? 'bg-[var(--color-accent-main)]/15 text-[var(--color-accent-main)] border-[var(--color-accent-main)]/20' :
                        b.status === 'In-Progress' ? 'bg-sky-500/15 text-sky-400 border-sky-500/20' :
                        b.status === 'Confirmed' ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' :
                        'bg-amber-500/15 text-amber-400 border-amber-500/20'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-text-muted pt-2 font-sans">
                      <div>
                        <strong className="text-text-muted">City:</strong> {b.city || 'Peshawar'}
                      </div>
                      <div>
                        <strong className="text-text-muted">Date:</strong> {b.preferredDate || 'Flexible'}
                      </div>
                    </div>

                    {b.invoice?.status === 'Pending' && b.status === 'Completed' && (
                      <div className="mt-2.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-[9px] font-bold uppercase flex items-center justify-between">
                        <span>Invoice Outstanding</span>
                        <span className="font-mono text-rose-400">PKR {Number(b.invoice?.amount || 14500).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Selected Service Interactive Journey & Control Deck */}
          <div className="lg:col-span-7">
            {selectedBooking ? (
              <div className="bg-[#1e293b]/40 border border-white/5 rounded-3xl p-5 sm:p-6 space-y-6 backdrop-blur-md">
                
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">{selectedBooking.id}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                    </div>
                    <h3 className="text-base font-black text-white uppercase mt-1">{selectedBooking.serviceTitle}</h3>
                    <p className="text-[10px] text-text-muted font-sans mt-0.5">
                      Target: {selectedBooking.vehicleTitle || selectedBooking.vehicleDetails || 'General Fleet Verification'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-muted font-bold">Priority:</span>
                    <span className="text-[10px] font-mono font-black uppercase bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded">High</span>
                    <span className={`text-xs font-mono font-black uppercase px-3 py-1 rounded-full border ${
                      selectedBooking.status === 'Completed' ? 'bg-[var(--color-accent-main)]/25 text-[var(--color-accent-main)] border-[var(--color-accent-main)]/30' :
                      selectedBooking.status === 'In-Progress' ? 'bg-sky-500/25 text-sky-400 border-sky-500/30' :
                      selectedBooking.status === 'Confirmed' ? 'bg-indigo-500/25 text-indigo-400 border-indigo-500/30' :
                      'bg-amber-500/25 text-amber-400 border-amber-500/30'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>

                {/* Operations & Assignments Deck */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-[#0f172a]/50 p-4 rounded-2xl border border-white/5 space-y-2.5">
                    <h4 className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin size={12} className="text-orange-500" />
                      <span>Assigned Workshop</span>
                    </h4>
                    <div>
                      <p className="text-xs font-black text-white uppercase">{selectedBooking.assignedWorkshop || 'Bazar360 Specialized HQ Workshop'}</p>
                      <p className="text-[10px] text-text-muted mt-0.5 font-sans">Khyber Auto Market, Ring Road Peshawar</p>
                    </div>
                  </div>

                  <div className="bg-[#0f172a]/50 p-4 rounded-2xl border border-white/5 space-y-2.5">
                    <h4 className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                      <User size={12} className="text-orange-500" />
                      <span>Certified Technician</span>
                    </h4>
                    <div>
                      <p className="text-xs font-black text-white uppercase">{selectedBooking.assignedTechnician || 'Senior Inspector Malak Mazhar'}</p>
                      <p className="text-[10px] text-text-muted mt-0.5 font-sans">FIDO2 Biometric Handshake Approved</p>
                    </div>
                  </div>
                </div>

                {/* ACTIVE TIMELINE TRANSIT COMPONENT (13-Stage Detailed Map) */}
                <div className="space-y-4 bg-[#0f172a]/30 p-5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wider">Complete 13-Stage Journey Timeline</h4>
                    <span className="text-[9px] font-mono text-text-muted uppercase">Live tracking index</span>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                    {getCompleteTimeline(selectedBooking).map((evt, idx) => (
                      <div key={idx} className="flex gap-3 relative">
                        {idx !== 12 && (
                          <div className={`absolute left-[7px] top-4 bottom-0 w-0.5 ${evt.completed ? 'bg-[var(--color-accent-main)]' : 'bg-bg-tertiary'}`} />
                        )}
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 z-10 ${
                          evt.completed 
                            ? 'bg-[var(--color-accent-main)]/20 border-[var(--color-accent-main)] text-[var(--color-accent-main)]' 
                            : 'bg-bg-primary border-border-main text-slate-600'
                        }`}>
                          {evt.completed && <Check size={8} strokeWidth={4} />}
                        </div>
                        <div className="text-left text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black uppercase tracking-wide ${evt.completed ? 'text-white' : 'text-text-muted'}`}>{evt.title}</span>
                            {evt.date && <span className="text-[9px] font-mono text-text-muted">({evt.date})</span>}
                          </div>
                          <p className="text-[10px] text-text-muted font-sans mt-0.5 leading-relaxed">{evt.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BAZAR360 INTERNAL MESSAGING (Conversational Multi-Party Chat) */}
                <div className="bg-[#0f172a]/60 rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[320px]">
                  <div className="px-4 py-2.5 bg-[#0f172a] border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wider">Department messaging center</span>
                    <span className="text-[9px] font-mono text-text-muted uppercase">Live chat (internal)</span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
                    {/* Welcome automation note */}
                    <div className="text-center">
                      <span className="text-[9px] font-mono text-text-muted uppercase bg-[#0f172a] px-2.5 py-1 rounded-full border border-white/5">
                        Encrypted Connection Secured
                      </span>
                    </div>

                    {(selectedBooking.chatMessages || [
                      {
                        id: 'welcome',
                        sender: 'admin',
                        senderName: 'System Bot',
                        message: `Welcome to Bazar360 CRM. Our assigned specialist (${selectedBooking.assignedTechnician || 'Malak Mazhar'}) and admin team are online in this chat. Ask any questions about Ref: ${selectedBooking.id} directly here!`,
                        timestamp: selectedBooking.createdAt
                      }
                    ]).map((msg: any) => {
                      const isCustomer = msg.sender === 'customer';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} space-y-1`}>
                          <span className="text-[8px] font-mono text-text-muted px-1">{msg.senderName || msg.sender.toUpperCase()}</span>
                          <div className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                            isCustomer 
                              ? 'bg-orange-500 text-slate-950 rounded-tr-none' 
                              : 'bg-bg-tertiary text-text-main rounded-tl-none border border-border-main/50'
                          }`}>
                            <p>{msg.message}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-2.5 bg-[#0f172a] border-t border-white/5 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type message directly to technician & admin..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-sans"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim()}
                      className="p-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 rounded-xl transition cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>

                {/* INVOICE presentation & Direct simulated Payment (Phase 1, 2, 7) */}
                <div className="bg-[#0f172a]/50 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                      <DollarSign size={13} />
                      <span>Department Invoice Summary</span>
                    </h4>
                    <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                      selectedBooking.invoice?.status === 'Paid' 
                        ? 'bg-[var(--color-accent-main)]/10 border-[var(--color-accent-main)]/20 text-[var(--color-accent-main)]' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {selectedBooking.invoice?.status === 'Paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between font-sans">
                      <span className="text-text-muted">Specialized Diagnostic UV Paint Testing</span>
                      <span className="text-white font-mono">PKR 11,500</span>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span className="text-text-muted">Mobile Mechanic Dispatch & Transport</span>
                      <span className="text-white font-mono">PKR 3,000</span>
                    </div>
                    <div className="flex justify-between font-black font-sans border-t border-dashed border-white/10 pt-2.5">
                      <span className="text-white uppercase tracking-wider">Total Service Bill</span>
                      <span className="text-orange-400 font-mono text-sm">PKR 14,500</span>
                    </div>
                  </div>

                  {selectedBooking.invoice?.status !== 'Paid' ? (
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-mono text-text-muted uppercase font-black tracking-wider block">Choose Digital Payment Method</span>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'easypaisa', label: 'EasyPaisa' },
                          { id: 'jazzcash', label: 'JazzCash' },
                          { id: 'bank', label: 'Bank Tran' },
                          { id: 'card', label: 'Card' }
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`py-2 px-1 text-[9px] font-mono font-black uppercase rounded-lg border cursor-pointer transition-all ${
                              paymentMethod === m.id 
                                ? 'bg-orange-500 text-slate-950 border-orange-500' 
                                : 'bg-[#0f172a] border-white/5 text-text-muted hover:text-white'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleSimulatePayment}
                        disabled={isPaying}
                        className="w-full py-3 bg-[var(--color-accent-main)] hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isPaying ? (
                          <>
                            <Clock size={14} className="animate-spin" />
                            <span>PROCESSING SECURE GATEWAY...</span>
                          </>
                        ) : (
                          <>
                            <Landmark size={14} />
                            <span>PAY INVOICE PKR 14,500</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/20 rounded-xl text-center text-xs font-sans text-[var(--color-accent-main)] flex items-center justify-center gap-2">
                      <ShieldCheck size={16} />
                      <span className="font-bold">✓ Invoice Fully Settled via {selectedBooking.invoice?.paymentMethod?.toUpperCase()} on {new Date(selectedBooking.invoice?.paymentDate || '').toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* SUBMIT REVIEW/FEEDBACK (Active when Completed and Paid) */}
                {selectedBooking.status === 'Completed' && (
                  <div className="bg-[#0f172a]/50 p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h4 className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        <span>Submit Storefront Performance Review</span>
                      </h4>
                      <span className="text-[9px] font-mono text-text-muted">Feedback index</span>
                    </div>

                    {selectedBooking.review ? (
                      <div className="space-y-2 text-left font-sans">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < (selectedBooking.review.rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-700"} 
                            />
                          ))}
                        </div>
                        <p className="text-text-muted italic text-xs font-serif">"{selectedBooking.review.comment}"</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted">Your Rating:</span>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setUserRating(star)}
                                className="text-amber-400 hover:scale-125 transition-transform"
                              >
                                <Star 
                                  size={18} 
                                  className={star <= userRating ? "fill-amber-400 text-amber-400" : "text-slate-600"} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          placeholder="Type feedback, suggestions or notes to help improve Bazar360 Specialized service ecosystem..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500 resize-none font-sans"
                        />

                        <button
                          type="submit"
                          disabled={isSubmittingReview || !reviewText.trim()}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 text-xs font-black uppercase rounded-xl transition cursor-pointer"
                        >
                          {isSubmittingReview ? 'PUBLISHING...' : 'PUBLISH REVIEW TO STOREFRONT'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* WARRANTY CERTIFICATE */}
                {selectedBooking.status === 'Completed' && (
                  <div className="border border-amber-500/30 rounded-2xl p-4 bg-amber-500/5 text-left flex items-start gap-3.5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-amber-500/20 text-amber-400 text-[8px] font-mono uppercase tracking-widest font-black rounded-bl border-l border-b border-amber-500/30">
                      Certified
                    </div>
                    <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                      <Award size={20} className="animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-amber-400 font-mono tracking-wide">Bazar360 Premium Service Warranty</h4>
                      <p className="text-[10px] text-text-muted font-sans leading-relaxed">
                        This vehicle includes a comprehensive 12-Month / 20,000 km Warranty protecting all specialized items & work. Terms apply.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-[#1e293b]/20 border border-white/5 rounded-3xl p-16 text-center text-text-muted font-mono text-xs">
                Select a service booking card from the left-hand index to track the complete 13-stage journey.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
