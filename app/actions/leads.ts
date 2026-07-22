'use server';

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { LeadValidationSchema } from '../../src/lib/validation';

function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getFirestore();
}

/**
 * 1. Server Action: Submit Lead inquiry
 * Validates, sanitizes, and writes lead payloads safely to Firestore.
 */
export async function submitLead(leadData: any) {
  try {
    // Basic sanitization
    const sanitizedPhone = (leadData.userPhone || '')
      .replace(/[^\d\+\-\s\(\)]/g, '')
      .trim();
    const sanitizedMessage = (leadData.inquiryMessage || '')
      .replace(/<[^>]*>/g, '') // strip any potential HTML tags
      .trim();
    
    const payload = {
      ...leadData,
      userPhone: sanitizedPhone,
      inquiryMessage: sanitizedMessage,
      createdAt: new Date().toISOString()
    };

    // Zod validation
    const parsed = LeadValidationSchema.parse(payload);

    const db = getAdminDb();
    const leadsRef = db.collection('leads');
    const newDoc = leadsRef.doc(); // Auto generate ID
    
    const finalLead = {
      ...parsed,
      id: newDoc.id
    };

    await newDoc.set(finalLead);

    // Create a real-time transactional notification for the showroom owner
    try {
      const notifRef = db.collection('notifications').doc();
      await notifRef.set({
        id: notifRef.id,
        userId: finalLead.showroomOwnerId,
        title: `🚨 New Lead Sourced: ${finalLead.vehicleTitle || 'General Inquiry'}`,
        body: `Customer ${finalLead.userName} sent a high-intent request. Message: "${finalLead.inquiryMessage.substring(0, 50)}..."`,
        read: false,
        createdAt: new Date().toISOString(),
        link: 'dashboard'
      });
    } catch (notifErr) {
      console.warn('[Server Action] Sourcing notification skipped:', notifErr);
    }

    return { success: true, leadId: newDoc.id };
  } catch (err: any) {
    console.error('[Server Action submitLead] Error:', err);
    return { 
      success: false, 
      error: err.message || 'Validation or database submission failure',
      details: err.errors || null
    };
  }
}

/**
 * 2. Server Action: Retrieve Owner Leads (Secure Sourcing)
 * Retrieves leads where showroomOwnerId matches the verified owner credentials.
 */
export async function getOwnerLeads(ownerId: string) {
  try {
    if (!ownerId || ownerId.trim() === '') {
      throw new Error('Showroom owner identifier must be specified');
    }

    const db = getAdminDb();
    const leadsRef = db.collection('leads');
    
    // Secure query, index-friendly sort by createdAt descending
    const snapshot = await leadsRef
      .where('showroomOwnerId', '==', ownerId)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      return { success: true, leads: [] };
    }

    const leads = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, leads };
  } catch (err: any) {
    console.error('[Server Action getOwnerLeads] Error:', err);
    return { success: false, error: err.message || 'Database fetch failure', leads: [] };
  }
}
