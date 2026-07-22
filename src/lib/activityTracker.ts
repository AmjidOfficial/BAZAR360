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

const SEED_ACTIVITIES: Record<string, Omit<ActivityLog, 'userId'>[]> = {
  Visitor: [
    {
      id: 'act-v1',
      action: 'VIEW',
      title: 'Viewed Suzuki Alto VXL',
      description: 'Inspected vehicle specs and contact options',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      category: 'listing'
    },
    {
      id: 'act-v2',
      action: 'DOWNLOAD',
      title: 'Downloaded Vehicle Catalogue',
      description: 'Exported automotive price sheet to local PDF format',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      category: 'catalog'
    },
    {
      id: 'act-v3',
      action: 'ADD',
      title: 'Booked Free Inspection Schedule',
      description: 'Submitted booking slot inquiry to Auto Choice Peshawar',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      category: 'lead'
    }
  ],
  'Registered User': [
    {
      id: 'act-r1',
      action: 'UPLOAD',
      title: 'Created New Car Listing',
      description: 'Submitted draft advertisement for Toyota Corolla 2021',
      timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      category: 'listing'
    },
    {
      id: 'act-r2',
      action: 'EDIT',
      title: 'Updated Profile Avatar',
      description: 'Uploaded high-contrast corporate headshot',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      category: 'profile'
    },
    {
      id: 'act-r3',
      action: 'VIEW',
      title: 'Inspected Direct Chat History',
      description: 'Opened message log with Peshawar Showroom owner',
      timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      category: 'social'
    }
  ],
  'Showroom Owner': [
    {
      id: 'act-s1',
      action: 'UPLOAD',
      title: 'Synchronized Inventory to Sheets',
      description: 'Pushed active stock of 14 vehicles to showroom GSheet log',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      category: 'catalog'
    },
    {
      id: 'act-s2',
      action: 'EDIT',
      title: 'Updated Showroom Branding',
      description: 'Applied Emerald Accent theme to digital storefront',
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      category: 'profile'
    },
    {
      id: 'act-s3',
      action: 'DELETE',
      title: 'Archived Sold Vehicle',
      description: 'Removed Honda Civic Oriel advertisement (Marked Sold)',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      category: 'listing'
    }
  ],
  Admin: [
    {
      id: 'act-a1',
      action: 'AUDIT',
      title: 'Approved Car Listing',
      description: 'Passed gate approval for Fortuner Legender (ID: lst-fortuner)',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      category: 'system'
    },
    {
      id: 'act-a2',
      action: 'EDIT',
      title: 'Configured Firebase Rules Node',
      description: 'Synchronized firestore.rules and verified app check triggers',
      timestamp: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
      category: 'system'
    },
    {
      id: 'act-a3',
      action: 'DELETE',
      title: 'Purged Fraudulent Lead Spams',
      description: 'Removed 12 mock bot bookings from visitor lead tracking list',
      timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      category: 'system'
    }
  ]
};

/**
 * Fetch all activity logs for a user, automatically seeding default logs if empty
 */
export function getPersonalActivities(userId: string, role: string = 'Visitor'): ActivityLog[] {
  try {
    const key = `bazar360_activities_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Seed initial logs based on role
    const matchedRole = role || 'Visitor';
    const seedLogs = SEED_ACTIVITIES[matchedRole] || SEED_ACTIVITIES['Visitor'];
    
    const logsWithUser = seedLogs.map(log => ({
      ...log,
      userId
    })) as ActivityLog[];
    
    localStorage.setItem(key, JSON.stringify(logsWithUser));
    return logsWithUser;
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
