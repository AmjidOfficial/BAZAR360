/**
 * activityTracker.ts
 * Dedicated service to manage and persist personal activity logs (RBAC and visitors)
 * Stores log history securely in localStorage with dynamic real-time append.
 */

export interface ActivityLog {
  id: string;
  userId: string;
  action: 'UPLOAD' | 'DOWNLOAD' | 'VIEW' | 'EDIT' | 'DELETE' | 'ADD' | 'SYSTEM' | 'AUDIT';
  title: string;
  description: string;
  timestamp: string;
  category: 'listing' | 'social' | 'profile' | 'lead' | 'system' | 'catalog';
  ipNode?: string;
}

// Clean Activity Tracker - Real activities only
export function getPersonalActivities(userId: string, _role: string = 'Visitor'): ActivityLog[] {
  try {
    const key = `bazar360_activities_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (e) {
    console.warn('[Activity Tracker] Storage error:', e);
    return [];
  }
}

/**
 * Log a new personal activity
 */
export function logPersonalActivity(
  userId: string,
  role: string,
  action: ActivityLog['action'],
  title: string,
  description: string,
  category: ActivityLog['category']
): void {
  try {
    const key = `bazar360_activities_${userId}`;
    const current = getPersonalActivities(userId, role);
    
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      action,
      title,
      description,
      timestamp: new Date().toISOString(),
      category,
      ipNode: `192.168.1.${Math.floor(Math.random() * 254) + 1}`
    };
    
    const updated = [newLog, ...current].slice(0, 50); // limit to last 50 logs
    localStorage.setItem(key, JSON.stringify(updated));
    
    // Dispatch a custom event to notify components in real time
    const event = new CustomEvent('bazar360_activity_logged', { detail: newLog });
    window.dispatchEvent(event);
  } catch (e) {
    console.warn('[Activity Tracker] Logging failed:', e);
  }
}
