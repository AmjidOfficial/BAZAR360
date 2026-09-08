import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../lib/dbService';
import { 
  UserSavedSearch, dbFetchUserSavedSearches, dbDeleteUserSavedSearch, dbToggleSavedSearchAlert 
} from '../../lib/userProfileService';
import { EmptyState } from './EmptyState';
import { Search, Bell, BellOff, Trash2, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SavedSearchesProps {
  user: UserProfile;
  onRunSearch?: (search: UserSavedSearch) => void;
}

export const SavedSearches: React.FC<SavedSearchesProps> = ({
  user,
  onRunSearch
}) => {
  const [searches, setSearches] = useState<UserSavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dbFetchUserSavedSearches(user.uid)
      .then(setSearches)
      .finally(() => setIsLoading(false));
  }, [user.uid]);

  const handleToggleAlert = async (searchId: string, currentStatus: boolean) => {
    try {
      await dbToggleSavedSearchAlert(user.uid, searchId, !currentStatus);
      setSearches(prev => prev.map(s => s.id === searchId ? { ...s, alertsEnabled: !currentStatus } : s));
      toast.success(!currentStatus ? 'Alerts activated for this search' : 'Alerts paused for this search');
    } catch (err) {
      toast.error('Failed to update alert settings');
    }
  };

  const handleDelete = async (searchId: string) => {
    try {
      await dbDeleteUserSavedSearch(user.uid, searchId);
      setSearches(prev => prev.filter(s => s.id !== searchId));
      toast.success('Saved search removed');
    } catch (err) {
      toast.error('Failed to remove saved search');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center text-sky-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <span className="text-xs font-mono font-bold">Loading your saved searches...</span>
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No saved searches yet"
        description="Save your frequent search filters to quickly check for new vehicle listings matching your target budget and specifications."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <h3 className="text-base font-bold font-display text-[var(--color-text-main)] flex items-center gap-2">
          <Search className="w-4 h-4 text-sky-400" />
          Saved Searches & Alerts ({searches.length})
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
          Receive real-time notifications when matching vehicles enter the marketplace.
        </p>
      </div>

      <div className="space-y-3">
        {searches.map((search) => (
          <div
            key={search.id}
            className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm font-display text-[var(--color-text-main)]">
                  {search.title || 'Custom Vehicle Search'}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                  Created {new Date(search.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-300 font-mono">
                {search.filters.make && (
                  <span className="px-2 py-0.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[10px]">
                    Make: {search.filters.make}
                  </span>
                )}
                {search.filters.model && (
                  <span className="px-2 py-0.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[10px]">
                    Model: {search.filters.model}
                  </span>
                )}
                {search.filters.city && (
                  <span className="px-2 py-0.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[10px]">
                    City: {search.filters.city}
                  </span>
                )}
                {search.filters.minPrice && (
                  <span className="px-2 py-0.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[10px]">
                    Min: PKR {search.filters.minPrice.toLocaleString()}
                  </span>
                )}
                {search.filters.maxPrice && (
                  <span className="px-2 py-0.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[10px]">
                    Max: PKR {search.filters.maxPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleToggleAlert(search.id, search.alertsEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  search.alertsEnabled
                    ? 'bg-[var(--color-accent-main)]/15 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)]'
                    : 'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >
                {search.alertsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                <span>{search.alertsEnabled ? 'Alerts On' : 'Alerts Off'}</span>
              </button>

              {onRunSearch && (
                <button
                  onClick={() => onRunSearch(search)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  Run Search
                </button>
              )}

              <button
                onClick={() => handleDelete(search.id)}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                title="Delete Search"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
