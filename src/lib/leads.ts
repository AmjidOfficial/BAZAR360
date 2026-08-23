import { z } from 'zod';

export const LeadSchema = z.object({
  customerId: z.string().min(1).default('guest'),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  showroomOwnerId: z.string().optional(),
  showroomId: z.string().optional(),
  inquiryDate: z.string().min(1, "Inquiry Date is required"),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Interested', 'Follow Up', 'Negotiating', 'Won', 'Lost', 'Closed', 'Pending', 'Approved', 'Countered', 'Rejected']).default('New'),
  source: z.enum(['vehicle_contact', 'showroom_contact', 'whatsapp', 'call_request', 'test_drive', 'price_request', 'information_request', 'unknown']).default('vehicle_contact'),
  userName: z.string().min(2, "Name is required"),
  userPhone: z.string().min(10, "Phone is required"),
  userEmail: z.string().email().optional().or(z.literal('')),
  vehicleTitle: z.string().optional(),
  vehiclePrice: z.number().optional(),
  inquiryMessage: z.string().max(2000).optional(),
  vehicleImage: z.string().url().optional().or(z.literal('')),
  assignedTo: z.string().optional(),
  lastActivityAt: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  dedupeKey: z.string().optional()
}).passthrough();

export type LeadInput = z.infer<typeof LeadSchema>;

export function validateLead(data: unknown) {
  return LeadSchema.parse(data);
}
