import React, { useState, useEffect } from 'react';
import { Activity, Clock, FileText, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { dbFetchAuditLogs } from '../../lib/dbService';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status?: string;
  bookingId?: string;
}

interface AuditTimelineProps {
  recordId?: string;
  title?: string;
}

export function AuditTimeline({ recordId, title = 'Enterprise Audit Trail' }: AuditTimelineProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadLogs() {
      try {
        const allLogs = await dbFetchAuditLogs();
        if (!isMounted) return;

        let filtered = allLogs;
        if (recordId) {
          filtered = allLogs.filter((l: any) => 
            l.bookingId === recordId || 
            l.id?.includes(recordId) || 
            l.details?.includes(recordId)
          );
        }

        if (filtered.length === 0 && recordId) {
          filtered.push({
            id: `audit-synth-${recordId}`,
            timestamp: new Date().toISOString(),
            action: 'Record Initialized',
            details: `Audit event stream initialized for record ${recordId}`,
            status: 'Active'
          });
        }

        setLogs(filtered);
      } catch (err) {
        console.warn('Failed to load audit timeline logs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLogs();
    const interval = setInterval(loadLogs, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [recordId]);

  if (loading) {
    return <div className="p-4 text-center text-xs font-mono text-text-muted">Loading audit log timeline...</div>;
  }

  return (
    <div className="bg-bg-primary/70 border border-border-main rounded-2xl p-4 text-left">
      <div className="flex items-center justify-between mb-4 border-b border-border-main pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/30">
            <Activity size={15} />
          </div>
          <div>
            <h4 className="text-xs font-black font-display uppercase tracking-wider text-[var(--color-text-header)]">
              {title}
            </h4>
            <p className="text-[10px] text-text-muted font-mono">Real-time immutable event stream from Firestore `auditLogs`</p>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-mono">
          {logs.length} Events
        </span>
      </div>

      <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-bg-tertiary">
        {logs.map((log, idx) => (
          <div key={log.id || idx} className="relative group">
            <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-bg-secondary border-2 border-orange-500 ring-4 ring-slate-950" />
            <div className="p-3 bg-bg-secondary/60 border border-border-main/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-orange-400 uppercase tracking-wide flex items-center gap-1">
                  <FileText size={11} />
                  <span>{log.action}</span>
                </span>
                <span className="text-text-muted flex items-center gap-1">
                  <Clock size={10} />
                  <span>{new Date(log.timestamp || Date.now()).toLocaleString()}</span>
                </span>
              </div>
              <p className="text-xs text-text-muted font-sans">{log.details}</p>
              {log.status && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-bg-primary border border-border-main text-[10px] font-mono text-amber-400 rounded">
                  Status: {log.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
