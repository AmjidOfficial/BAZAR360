import { z } from 'zod';

/**
 * 1. Zod Schema for Vehicle Listings (CarListing)
 * Enforces strong validation on numeric bounds, string lengths, and required nested specs.
 */
export const VehicleValidationSchema = z.object({
  id: z.string().min(1, 'Document identifier is required').max(128),
  title: z.string().min(3, 'Title must be at least 3 characters long').max(150),
  make: z.string().min(1, 'Manufacturer brand (make) is required').max(100),
  model: z.string().min(1, 'Vehicle model is required').max(100),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  price: z.number().positive('Price must be greater than 0'),
  mileage: z.number().nonnegative('Mileage cannot be negative'),
  fuelType: z.enum(['Petrol', 'Diesel', 'Hybrid', 'Electric']),
  transmission: z.enum(['Automatic', 'Manual']),
  imageUrl: z.string().url('Primary image must be a valid URL'),
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  dealerId: z.string().min(1, 'Showroom ID is required').max(128),
  description: z.string().max(5000).default(''),
  createdAt: z.string(),
  tags: z.array(z.string()).default([]),
  
  // Specs Metadata Schema Block
  specs: z.object({
    color: z.string().max(50),
    engineSize: z.string().max(50),
    horspower: z.string().max(50),
    regionalSpecs: z.string().max(50)
  }),

  // Auto Choice Exclusive specs
  condition: z.enum(['New', 'Used']),
  engineCC: z.number().int().positive('Engine capacity must be a positive integer'),
  exteriorColor: z.string().max(50),
  bodyCondition: z.enum(['Total Genuine', 'Minor Touch-ups', 'Major Repaint']),
  registrationCity: z.string().max(100),
  documentType: z.enum(['Smart Card', 'Original Book', 'Duplicate']),
  tokenTaxPaid: z.boolean(),
  images: z.array(z.string()).default([]),

  // High-performance metrics (Porsche/Lamborghini)
  topSpeed: z.string().optional(),
  acceleration: z.string().optional(),
  range: z.string().optional(),
  approved: z.boolean().optional(),
  assignedSalesRepId: z.string().optional(),
  createdBy: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional(),
  sellerPhone: z.string().optional()
});

/**
 * 2. Zod Schema for Sourced Leads
 * Enforces buyer contact credentials and filters valid phone sequences.
 */
export const LeadValidationSchema = z.object({
  id: z.string().min(1).max(128).optional(),
  customerId: z.string().max(128).optional(),
  vehicleId: z.string().max(128).optional(),
  showroomOwnerId: z.string().min(1, 'Target showroom identifier is required').max(128),
  userName: z.string().min(2, 'Name must be at least 2 characters long').max(100),
  userPhone: z.string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(25)
    .regex(/^[\d\+\-\s\(\)]+$/, 'Invalid character format in phone sequence'),
  userEmail: z.string().email('Invalid email address format').or(z.literal('')).optional(),
  inquiryMessage: z.string().min(5, 'Inquiry must contain context details').max(3000),
  status: z.enum(['New', 'Contacted', 'Closed', 'Lost', 'Pending', 'Approved', 'Countered', 'Rejected']).default('New'),
  vehicleTitle: z.string().optional(),
  vehiclePrice: z.number().optional(),
  vehicleImage: z.string().optional(),
  createdAt: z.string(),

  // Older legacy fields support
  type: z.string().optional(),
  title: z.string().optional(),
  city: z.string().optional(),
  details: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

/**
 * Validates a vehicle listing object before Firestore insertion.
 * Throws an error with rich descriptions if invalid, otherwise returns the parsed data object.
 */
export function validateVehicleListing(data: unknown) {
  return VehicleValidationSchema.parse(data);
}

/**
 * Safe validation wrapper for vehicles (does not throw)
 */
export function safeValidateVehicleListing(data: unknown) {
  return VehicleValidationSchema.safeParse(data);
}

/**
 * Validates a sourced lead payload before Firestore insertion.
 */
export function validateLead(data: unknown) {
  return LeadValidationSchema.parse(data);
}

/**
 * Safe validation wrapper for leads
 */
export function safeValidateLead(data: unknown) {
  return LeadValidationSchema.safeParse(data);
}
