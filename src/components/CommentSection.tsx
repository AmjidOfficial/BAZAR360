import React, { useState, useEffect } from 'react';
import { Send, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { SocialComment } from '../types';
import { fetchSocialComments, createSocialComment } from '../services/api';

interface CommentSectionProps {
  postId: string;
  idToken: string | null;
  currentUser: any;
  commentsCount: number;
  onCommentAdded: (newComment: SocialComment) => void;
}

export default function CommentSection({
  postId,
  idToken,
  currentUser,
  commentsCount,
  onCommentAdded
}: CommentSectionProps) {
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadComments = async () => {
      setLoading(true);
      try {
        const res = await fetchSocialComments(postId);
        if (res.success && res.comments && active) {
          setComments(res.comments);
        }
      } catch (err: any) {
        console.error('Error fetching comments:', err);
        if (active) setError('Could not load comments.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadComments();
    return () => {
      active = false;
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !idToken || submitting) return;

    setSubmitting(true);
    setError(null);

    // Optimistic UI update: generate a temporary comment
    const tempComment: SocialComment = {
      id: `temp-${Date.now()}`,
      postId,
      userId: currentUser?.uid || 'anonymous',
      userName: currentUser?.displayName || currentUser?.name || 'You',
      userAvatar: currentUser?.profilePhoto || currentUser?.photoURL || '',
      userRole: currentUser?.role || 'Individual User',
      text: newCommentText,
      createdAt: new Date().toISOString()
    };

    setComments((prev) => [...prev, tempComment]);
    setNewCommentText('');

    try {
      const res = await createSocialComment(postId, tempComment.text, idToken);
      if (res.success && res.comment) {
        // Replace temp comment with real one
        setComments((prev) =>
          prev.map((c) => (c.id === tempComment.id ? res.comment : c))
        );
        onCommentAdded(res.comment);
      } else {
        // Remove temp comment and show error
        setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
        setNewCommentText(tempComment.text); // Restore text
        setError(res.error || 'Failed to submit comment.');
      }
    } catch (err: any) {
      setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      setNewCommentText(tempComment.text); // Restore text
      setError(err.message || 'Error sending comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
      case 'Super Admin':
        return 'bg-red-500/15 text-red-400 border border-red-500/30';
      case 'Showroom Owner':
      case 'Dealer':
        return 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30';
      case 'Sales Rep':
      case 'Sales Representative':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'Private Seller':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-slate-700/40 text-slate-300 border border-slate-600/30';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Recently';
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      if (seconds < 60) return 'just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'some time ago';
    }
  };

  return (
    <div className="border-t border-white/5 bg-[#121824]/40 p-4 space-y-4" id={`comment-section-${postId}`}>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono uppercase font-semibold">Comments ({commentsCount || comments.length})</span>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl" id={`comment-error-${postId}`}>
          {error}
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar scroll-smooth" id={`comment-list-${postId}`}>
        {loading && comments.length === 0 ? (
          <div className="flex justify-center items-center py-6 text-slate-400 space-x-2">
            <Loader2 size={16} className="animate-spin text-[#FF6B00]" />
            <span className="text-xs font-mono">Retrieving comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center justify-center space-y-1">
            <MessageSquare size={18} className="opacity-40" />
            <span>No comments yet. Be the first to express your thoughts!</span>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 duration-100"
              id={`comment-item-${comment.id}`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-white/10 flex items-center justify-center">
                {comment.userAvatar ? (
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs font-mono font-black text-slate-300">
                    {comment.userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-white leading-none">
                    {comment.userName}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-black uppercase tracking-wider scale-90 ${getRoleBadgeColor(comment.userRole)}`}>
                    {comment.userRole}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    • {formatTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans text-left break-words">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input Form */}
      {idToken ? (
        <form onSubmit={handleSubmit} className="flex gap-2" id={`add-comment-form-${postId}`}>
          <div className="flex-1 relative">
            <input
              id={`comment-input-${postId}`}
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write a supportive comment..."
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-2 pl-4 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00] duration-150"
              disabled={submitting}
            />
          </div>
          <button
            id={`comment-submit-btn-${postId}`}
            type="submit"
            disabled={!newCommentText.trim() || submitting}
            className="p-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black disabled:opacity-40 disabled:scale-100 transition-all cursor-pointer flex items-center justify-center"
            title="Submit comment"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      ) : (
        <div className="text-center p-3.5 bg-slate-900/50 rounded-2xl border border-white/5 text-[11px] text-slate-400">
          Please <span className="text-[#FF6B00] font-bold">Sign In</span> to leave comments and engage in BAZAR360 discussions.
        </div>
      )}
    </div>
  );
}
