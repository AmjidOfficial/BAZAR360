import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoSaveOptions<T> {
  delay?: number; // debounce delay in ms
  enabled?: boolean;
  onSaveToCloud?: (data: T) => Promise<void>;
  storageKeyPrefix?: string;
}

export function useAutoSave<T>(
  storageKey: string,
  data: T,
  options: AutoSaveOptions<T> = {}
) {
  const {
    delay = 800,
    enabled = true,
    onSaveToCloud,
    storageKeyPrefix = 'bazar360_autosave_'
  } = options;

  const fullKey = `${storageKeyPrefix}${storageKey}`;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const isFirstRender = useRef(true);

  // Debounced auto-save effect
  useEffect(() => {
    // Skip auto-save on initial mount to prevent overwriting stored draft with empty defaults
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled || data === undefined || data === null) {
      return;
    }

    setIsSaving(true);

    const timer = setTimeout(async () => {
      try {
        // 1. Save to LocalStorage
        const serialized = JSON.stringify(data);
        localStorage.setItem(fullKey, serialized);
        
        // 2. Save to Firestore Cloud Draft (if callback provided)
        if (onSaveToCloud) {
          await onSaveToCloud(data);
        }

        setLastSavedAt(new Date());
      } catch (err) {
        console.warn('[useAutoSave] Error auto-saving state:', err);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [fullKey, data, delay, enabled, onSaveToCloud]);

  // Utility to clear saved draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(fullKey);
      setLastSavedAt(null);
    } catch (err) {
      console.warn('[useAutoSave] Failed to clear draft:', err);
    }
  }, [fullKey]);

  // Utility to retrieve stored draft synchronously
  const loadDraft = useCallback((): T | null => {
    try {
      const stored = localStorage.getItem(fullKey);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (err) {
      console.warn('[useAutoSave] Failed to load draft:', err);
    }
    return null;
  }, [fullKey]);

  return {
    isSaving,
    lastSavedAt,
    clearDraft,
    loadDraft,
  };
}
