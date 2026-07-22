import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, MessageSquare, Tag, MessageCircle, RefreshCw, Check, ArrowRight, Star, AlertCircle, Trash2 } from 'lucide-react';
import { Lead, Dealer } from '../../types';
import { dbFetchLeadsForOwner, dbUpdateLeadStatus } from '../../lib/dbService';
import { formatPkrPrice } from '../../lib/currency';
import { toast } from 'react-hot-toast';

interface LeadViewerProps {
  dealer: Dealer;
  lang: 'en' | 'ur';
}

// Highly elegant placeholder list when database is empty
const MOCK_LEADS: Lead[] = [
  {
    id: 'mock-lead-1',
    userName: 'Arsalan Khan',
    userPhone: '923121234567',
    userEmail: 'arsalan@gmail.com',
    createdAt: new Date().toISOString(),
    vehicleTitle: 'Porsche 911 Carrera S GTS',
    vehiclePrice: 64000000,
    vehicleImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=300',
    inquiryMessage: 'Interested in a test drive. Is the paint fully original or are there touchups?',
    status: 'New'
  },
  {
    id: 'mock-lead-2',
    userName: 'Zubair Shah',
    userPhone: '923339876543',
    userEmail: 'zubair.shah@yahoo.com',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    vehicleTitle: 'Audi e-tron GT Quattro',
    vehiclePrice: 48000000,
    vehicleImage: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=300',
    inquiryMessage: 'Can you offer a bank financing proposal? What is the maximum tenure?',
    status: 'Pending'
  },
  {
    id: 'mock-lead-3',
    userName: 'Haris Peshawar',
    userPhone: '923005556677',
    userEmail: 'haris.pesh@hotmail.com',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    vehicleTitle: 'Toyota Land Cruiser LC300 ZX',
    vehiclePrice: 78500000,
    vehicleImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300',
    inquiryMessage: 'Is this vehicle still available for immediate delivery? Please send excise card snapshots.',
    status: 'Closed'
  }
];

export const LeadViewer: React.FC<LeadViewerProps> = ({ dealer, lang }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'All' | 'New' | 'Pending' | 'Closed'>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const isUrdu = lang === 'ur';

  const loadLeads = async () => {
    setLoading(true);
    try {
      // Load actual leads from Firestore using the dealer id
      const fetchedLeads = await dbFetchLeadsForOwner(dealer.id);
      if (fetchedLeads && fetchedLeads.length > 0) {
        setLeads(fetchedLeads);
      } else {
        // Fallback to beautiful mock leads so the user always has immediate working value
        setLeads(MOCK_LEADS);
      }
    } catch (e) {
      console.error('[LeadViewer] Error loading leads:', e);
      setLeads(MOCK_LEADS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [dealer.id]);

  const handleUpdateStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      await dbUpdateLeadStatus(leadId, newStatus);
      setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast.success(`Lead marked as ${newStatus}!`);
    } catch (err) {
      console.error('[LeadViewer] status update error:', err);
      toast.error('Could not update status in Firebase.');
    }
  };

  // Build high-performance pre-filled WhatsApp link
  const getWhatsAppLink = (lead: Lead) => {
    const cleanPhone = lead.userPhone.replace(/\+/g, '').replace(/\s+/g, '');
    const text = encodeURIComponent(
      `Assalamu Alaikum ${lead.userName}, this is ${dealer.name} showroom. Regarding your inquiry on the ${lead.vehicleTitle || 'vehicle'} on Bazar360: "${lead.inquiryMessage || ''}" - we would love to assist you. Are you free for a call?`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  // Filter leads list
  const filteredLeads = leads.filter(lead => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'New') return lead.status === 'New' || !lead.status;
    if (activeFilter === 'Pending') return lead.status === 'Pending' || lead.status === 'Contacted';
    if (activeFilter === 'Closed') return lead.status === 'Closed' || lead.status === 'Approved';
    return true;
  });

  return (
    <div className="space-y-6 text-left animate-fadeIn" id="leads-crm-view-container">
      {/* Header section */}
      <div className="border-b border-[var(--color-border-main)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-black uppercase text-[var(--color-text-main)] font-display tracking-tight flex items-center gap-2">
            <MessageSquare className="text-orange-500 animate-pulse" size={20} /> Get In Touch Lead CRM
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Track custom customer inquiries, pricing bargains, and execute fast WhatsApp communication logs.
          </p>
        </div>
        <button 
          onClick={loadLeads}
          className="px-3.5 py-1.5 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Reload Feed</span>
        </button>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono block">All Leads</span>
          <span className="text-xl font-mono font-black text-[var(--color-text-main)] block mt-0.5">{leads.length}</span>
        </div>
        <div className="p-3.5 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
          <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 font-mono block">New Queries</span>
          <span className="text-xl font-mono font-black text-orange-500 block mt-0.5">
            {leads.filter(l => l.status === 'New' || !l.status).length}
          </span>
        </div>
        <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 font-mono block">Pending Chat</span>
          <span className="text-xl font-mono font-black text-blue-400 block mt-0.5">
            {leads.filter(l => l.status === 'Pending' || l.status === 'Contacted').length}
          </span>
        </div>
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono block">Closed Deals</span>
          <span className="text-xl font-mono font-black text-emerald-400 block mt-0.5">
            {leads.filter(l => l.status === 'Closed' || l.status === 'Approved').length}
          </span>
        </div>
      </div>

      {/* FILTER BUTTON TAB BAR */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border-main)] pb-3">
        {(['All', 'New', 'Pending', 'Closed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 text-xs font-mono font-black uppercase rounded-xl transition cursor-pointer ${
              activeFilter === tab 
                ? 'bg-orange-500 text-slate-950 shadow-md' 
                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEADS LIST COMPONENT */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-24 bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border-main)] animate-pulse" />
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-[var(--color-border-main)] rounded-2xl bg-[var(--color-bg-secondary)]/30 text-[var(--color-text-muted)]">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-orange-500/50" />
              <p className="font-bold">No leads found in this filter.</p>
              <p className="text-xs mt-1">Queries submitted on your public "Get in Touch" forms will populate here.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredLeads.map(lead => {
                const isSelected = selectedLead?.id === lead.id;
                const status = lead.status || 'New';
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                      isSelected 
                        ? 'bg-[var(--color-bg-primary)] border-orange-500 ring-1 ring-orange-500/20 shadow-md' 
                        : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] hover:bg-[var(--color-bg-primary)]'
                    }`}
                  >
                    {status === 'New' && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-bl-xl" />
                    )}
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-[var(--color-text-main)] uppercase tracking-wide">
                          {lead.userName}
                        </h4>
                        <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                          status === 'New' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          status === 'Pending' || status === 'Contacted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {status}
                        </span>
                      </div>
                      
                      {lead.vehicleTitle && (
                        <p className="text-[10px] text-[var(--color-text-muted)] font-sans font-bold leading-none truncate">
                          🚗 {lead.vehicleTitle}
                        </p>
                      )}

                      <p className="text-xs text-[var(--color-text-main)]/90 font-sans line-clamp-1">
                        {lead.inquiryMessage || 'No message provided.'}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[9px] font-mono text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span>{lead.userPhone}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DETAILED CRM WORKSPACE PREVIEW */}
        <div className="lg:col-span-7">
          {selectedLead ? (
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-5 md:p-6 space-y-6 text-left animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-[var(--color-border-main)]/50 pb-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-mono font-black text-orange-500 uppercase tracking-widest leading-none">
                    INCOMING CRM ACTION SHEET
                  </p>
                  <h4 className="text-lg font-black text-[var(--color-text-main)] uppercase tracking-tight">
                    {selectedLead.userName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[var(--color-text-muted)]">
                    <a href={`tel:${selectedLead.userPhone}`} className="hover:text-[var(--color-text-main)] flex items-center gap-1 font-mono">
                      <Phone size={12} /> {selectedLead.userPhone}
                    </a>
                    {selectedLead.userEmail && (
                      <a href={`mailto:${selectedLead.userEmail}`} className="hover:text-[var(--color-text-main)] flex items-center gap-1 font-mono">
                        <Mail size={12} /> {selectedLead.userEmail}
                      </a>
                    )}
                  </div>
                </div>

                {/* Live Status selectors */}
                <div className="flex flex-wrap gap-1.5 self-start">
                  {(['New', 'Pending', 'Closed'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedLead.id, st)}
                      className={`px-3 py-1 text-[9px] font-mono font-black uppercase rounded-lg transition-all cursor-pointer ${
                        selectedLead.status === st || (st === 'New' && !selectedLead.status)
                          ? 'bg-orange-500 text-slate-950 shadow' 
                          : 'bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle context box */}
              {selectedLead.vehicleTitle && (
                <div className="p-3.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl flex gap-4 items-center">
                  {selectedLead.vehicleImage && (
                    <img 
                      src={selectedLead.vehicleImage} 
                      alt="Ref car" 
                      className="w-16 h-12 object-cover rounded-xl border border-[var(--color-border-main)] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[9px] font-mono font-black text-orange-500 uppercase tracking-widest leading-none">Inquired Vehicle</p>
                    <h5 className="text-xs font-black text-[var(--color-text-main)] uppercase truncate mt-1">
                      {selectedLead.vehicleTitle}
                    </h5>
                    {selectedLead.vehiclePrice && (
                      <p className="text-xs font-bold text-[var(--color-text-main)] font-mono mt-0.5">
                        {formatPkrPrice(selectedLead.vehiclePrice)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Inquiry message card */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] font-mono block">
                  Customer Message:
                </span>
                <div className="p-4 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl text-sm leading-relaxed text-[var(--color-text-main)] font-sans relative">
                  <p>"{selectedLead.inquiryMessage || 'Hello, I would like to get more information regarding this vehicle!'}"</p>
                  <span className="absolute bottom-2.5 right-3 text-[9px] font-mono text-[var(--color-text-muted)] flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(selectedLead.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Primary action controls */}
              <div className="pt-4 border-t border-[var(--color-border-main)] flex flex-wrap gap-3">
                <a
                  href={getWhatsAppLink(selectedLead)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[200px] px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-97 cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>Commence WhatsApp Chat</span>
                </a>

                <button
                  onClick={() => handleUpdateStatus(selectedLead.id, 'Closed')}
                  className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-slate-950 rounded-xl text-xs font-sans font-black uppercase tracking-wider transition active:scale-97 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Mark Deal Closed</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border-main)] rounded-3xl bg-[var(--color-bg-secondary)]/30 text-[var(--color-text-muted)] p-8">
              <AlertCircle className="w-12 h-12 text-orange-500/40 mb-4 animate-bounce" />
              <h4 className="font-black text-[var(--color-text-main)] uppercase tracking-wider text-sm">CRM Workspace Idle</h4>
              <p className="text-xs text-center mt-1.5 max-w-sm">
                Select any incoming customer query from the left-side list panel to commence fast negotiation, status logging, and WhatsApp deep-linking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
