import React, { useState, useEffect } from 'react';
import { dbFetchLeads, dbUpdateLeadStatus } from '../../lib/dbService';
import { Lead } from '../../types';
import { MessageSquare, Phone, Mail, Download, RefreshCw, Filter, CheckCircle, Clock, AlertCircle, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AdminLeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await dbFetchLeads();
      setLeads(data);
    } catch (err) {
      console.error('Failed to load admin leads:', err);
      toast.error('Failed to load leads list from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      await dbUpdateLeadStatus(leadId, newStatus);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast.success(`Lead status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating lead status:', err);
      toast.error('Could not update status');
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      (l.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.userPhone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.vehicleTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'All' || (l.type || 'Buy') === filterType;
    const matchesStatus = filterStatus === 'All' || (l.status || 'New') === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Full Name', 'Phone Number', 'Email', 'Inquiry Type', 'Vehicle of Interest', 'Status', 'Date Submitted', 'Details'];
    const rows = filteredLeads.map(l => [
      `"${l.userName || ''}"`,
      `"${l.userPhone || ''}"`,
      `"${l.userEmail || ''}"`,
      `"${l.type || 'Buy'}"`,
      `"${l.vehicleTitle || l.title || ''}"`,
      `"${l.status || 'New'}"`,
      `"${new Date(l.createdAt).toLocaleString()}"`,
      `"${(l.details || l.inquiryMessage || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bazar360_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Leads exported to CSV successfully!');
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-black uppercase text-[var(--color-text-main)] tracking-wider">
              Lead Generation & Inquiry Management CRM
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Total Recorded Leads: <strong>{leads.length}</strong> | Filtered: <strong>{filteredLeads.length}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadLeads}
            className="p-2 bg-bg-tertiary hover:bg-slate-700 text-text-main rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Refresh Leads"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportToCSV}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-[var(--color-text-header)] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Search name, phone (+92...), or vehicle..."
          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 font-bold"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-main)] font-bold"
        >
          <option value="All">All Inquiry Types</option>
          <option value="Buy">Buy Inquiry</option>
          <option value="Sell">Sell / Post Lead</option>
          <option value="Showroom Partnership">Showroom Partnership</option>
          <option value="General Inquiry">General Inquiry</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-main)] font-bold"
        >
          <option value="All">All Lead Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Converted">Converted</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto border border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-secondary)] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)]">
              <th className="p-3">Customer Info</th>
              <th className="p-3">Verified Phone</th>
              <th className="p-3">Inquiry Type</th>
              <th className="p-3">Vehicle of Interest</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] text-xs">
            {filteredLeads.map((lead) => {
              const formattedPhone = lead.userPhone.startsWith('0') 
                ? '+92' + lead.userPhone.slice(1) 
                : lead.userPhone.startsWith('+92') 
                  ? lead.userPhone 
                  : lead.userPhone ? '+92' + lead.userPhone : 'N/A';

              return (
                <tr key={lead.id} className="hover:bg-blue-500/5 transition">
                  <td className="p-3">
                    <div className="font-bold text-[var(--color-text-main)]">{lead.userName || 'Visitor'}</div>
                    {lead.userEmail && <div className="text-[10px] text-[var(--color-text-muted)] font-mono">{lead.userEmail}</div>}
                  </td>
                  <td className="p-3 font-mono font-bold text-blue-600">
                    <a href={`tel:${formattedPhone}`} className="hover:underline flex items-center gap-1">
                      <Phone size={12} /> {formattedPhone}
                    </a>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 uppercase border border-blue-500/20">
                      {lead.type || 'Buy'}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-[var(--color-text-main)]">
                    {lead.vehicleTitle || lead.title || 'General Vehicle Query'}
                  </td>
                  <td className="p-3">
                    <select
                      value={lead.status || 'New'}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                      className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                        (lead.status || 'New') === 'New' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                        lead.status === 'Contacted' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                        lead.status === 'Converted' ? 'bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border-[var(--color-accent-main)]/30' :
                        'bg-slate-500/10 text-text-muted border-slate-500/30'
                      }`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="p-3 text-[10px] font-mono text-[var(--color-text-muted)]">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <a
                      href={`https://wa.me/${formattedPhone.replace(/\+/g, '')}?text=${encodeURIComponent(`Assalamu Alaikum ${lead.userName}, regarding your inquiry on Bazar360...`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-[var(--color-text-header)] rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition"
                    >
                      WhatsApp
                    </a>
                  </td>
                </tr>
              );
            })}

            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[var(--color-text-muted)] text-xs">
                  No lead records match your search filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
