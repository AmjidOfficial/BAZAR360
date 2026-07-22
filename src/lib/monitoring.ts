import { getAnalytics, logEvent } from "firebase/analytics";
import { getPerformance, trace } from "firebase/performance";

/**
 * Bazar360 Sales Rep Monitoring Strategy
 * Tracks activity for 500+ sales reps and showroom managers.
 */

export const trackSalesActivity = (
  repId: string, 
  showroomId: string, 
  action: 'lead_created' | 'vehicle_shared' | 'chat_response' | 'qr_scanned',
  metadata?: Record<string, any>
) => {
  const analytics = getAnalytics();
  
  logEvent(analytics, 'sales_rep_action', {
    rep_id: repId,
    showroom_id: showroomId,
    action_type: action,
    ...metadata,
    timestamp: new Date().toISOString()
  });
};

export const trackPerformance = async (name: string, callback: () => Promise<any>) => {
  const perf = getPerformance();
  const t = trace(perf, name);
  t.start();
  try {
    return await callback();
  } finally {
    t.stop();
  }
};

/**
 * Usage in Components:
 * 
 * useEffect(() => {
 *   if (currentUser?.role === 'Sales Rep') {
 *     trackSalesActivity(currentUser.uid, currentUser.showroomId, 'qr_scanned');
 *   }
 * }, []);
 */
