import { z } from 'zod';

export const LeadSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  showroomOwnerId: z.string().min(1, "Showroom Owner ID is required"),
  inquiryDate: z.string().min(1, "Inquiry Date is required"),
  status: z.enum(['New', 'Contacted', 'Closed', 'Lost', 'Pending', 'Approved', 'Countered', 'Rejected']).default('New'),
  // Additional fields based on Lead interface in types.ts
  userName: z.string().optional(),
  userPhone: z.string().optional(),
  userEmail: z.string().optional(),
  vehicleTitle: z.string().optional(),
  vehiclePrice: z.number().optional(),
  inquiryMessage: z.string().optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;

export function validateLead(data: unknown) {
  return LeadSchema.parse(data);
}
