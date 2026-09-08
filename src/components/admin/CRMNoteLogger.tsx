import React, { useState } from 'react';
import { MessageSquarePlus, ShieldCheck, Clock, User, Send, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { dbAddCrmInternalNote } from '../../lib/dbService';

interface InternalNote {
  id: string;
  authorName: string;
  noteText: string;
  createdAt: string;
}

interface CRMNoteLoggerProps {
  recordId: string;
  collectionName?: string;
  notes?: InternalNote[];
  currentUserEmail?: string;
  currentUserName?: string;
  onNoteAdded?: (updatedNotes: InternalNote[]) => void;
}

export function CRMNoteLogger({
  recordId,
  collectionName = 'service_bookings',
  notes = [],
  currentUserEmail = 'Staff Admin',
  currentUserName = 'System Staff',
  onNoteAdded
}: CRMNoteLoggerProps) {
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noteList, setNoteList] = useState<InternalNote[]>(notes || []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmitting(true);
    try {
      const newNote: InternalNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        authorName: currentUserName || currentUserEmail || 'Staff',
        noteText: noteText.trim(),
        createdAt: new Date().toISOString()
      };

      const updated = [newNote, ...noteList];
      
      // Save to Firestore via dbService
      await dbAddCrmInternalNote(recordId, updated, collectionName);

      setNoteList(updated);
      setNoteText('');
      toast.success('Internal staff note logged successfully.');
      if (onNoteAdded) {
        onNoteAdded(updated);
      }
    } catch (err) {
      console.error('Failed to log CRM note:', err);
      toast.error('Failed to save internal note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-primary/60 border border-border-main rounded-2xl p-4 text-left">
      <div className="flex items-center justify-between mb-3 border-b border-border-main/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20">
            <MessageSquarePlus size={15} />
          </div>
          <div>
            <h4 className="text-xs font-black font-display uppercase tracking-wider text-[var(--color-text-header)]">
              Internal CRM Staff Notes
            </h4>
            <p className="text-[10px] text-text-muted font-mono">Confidential notes visible only to authorized staff</p>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-bg-secondary border border-border-main rounded-full text-[10px] font-mono text-text-muted">
          {noteList.length} Notes
        </span>
      </div>

      {/* Note submission form */}
      <form onSubmit={handleAddNote} className="space-y-2 mb-4">
        <textarea
          rows={2}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add confidential internal note regarding customer status, verification, or service updates..."
          className="w-full bg-bg-secondary border border-border-main focus:border-orange-500 text-[var(--color-text-header)] rounded-xl p-3 text-xs placeholder:text-text-muted focus:outline-none transition-all resize-none font-sans"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !noteText.trim()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wide rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Send size={12} />
            <span>{isSubmitting ? 'Logging...' : 'Log Internal Note'}</span>
          </button>
        </div>
      </form>

      {/* Existing notes list */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {noteList.length === 0 ? (
          <p className="text-center py-4 text-text-muted text-xs font-mono italic">
            No internal notes logged yet for this request record.
          </p>
        ) : (
          noteList.map((note) => (
            <div key={note.id} className="p-3 bg-bg-secondary/80 border border-border-main/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span className="flex items-center gap-1 font-bold text-orange-400">
                  <User size={10} />
                  <span>{note.authorName}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                </span>
              </div>
              <p className="text-xs text-text-main font-sans whitespace-pre-wrap">{note.noteText}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
