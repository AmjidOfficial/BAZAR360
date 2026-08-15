export type { UserProfile } from './lib/dbService';

export interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number; // in PKR
  mileage: number; // in km
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  transmission: 'Automatic' | 'Manual';
  imageUrl: string;
  verified: boolean;
  featured: boolean;
  dealerId: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
  specs: {
    color: string;
    engineSize: string;
    horspower: string;
    regionalSpecs: string;
  };
  approved?: boolean;
  assignedSalesRepId?: string;
  createdBy?: string;
  region?: string;
  location?: string;
  phone?: string;
  sellerPhone?: string;
  sellerName?: string;
  sellerWhatsApp?: string;
  sellerType?: 'Individual' | 'Showroom';
  sellerAvatar?: string;

  // Auto Choice Exclusive strict properties
  condition: 'New' | 'Used';
  engineCC: number;
  exteriorColor: string;
  bodyCondition: 'Total Genuine' | 'Minor Touch-ups' | 'Major Repaint';
  registrationCity: string;
  documentType: 'Smart Card' | 'Original Book' | 'Duplicate';
  tokenTaxPaid: boolean;
  images: string[];
  primaryImage?: string;
  verifiedBadge?: boolean;
  
  // Requirement matrix extensions
  assemblyType?: 'Local' | 'Imported';
  features?: string[];
  dentPaintDescription?: string;
  tokenTaxStatus?: 'Paid' | 'Outstanding';
  
  isSold?: boolean;
  isPaused?: boolean;
  isArchived?: boolean;
  status?: 'Available' | 'Reserved' | 'Sold';

  // Cloudinary Integrated properties
  cloudinaryPublicId?: string;
  cloudinaryPublicIds?: string[];
  videoUrl?: string;
  videoCloudinaryPublicId?: string;
  pdfUrl?: string;
  pdfCloudinaryPublicId?: string;
  pdfTitle?: string;

  // Premium specs for hero banner matching elite reference images
  topSpeed?: string;
  acceleration?: string;
  range?: string;
}

export interface ShowroomMember {
  id: string;
  name: string;
  title: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  photoUrl?: string;
  active?: boolean;
  role?: 'Owner' | 'Manager' | 'Sales Executive' | 'Salesperson' | 'Marketing' | 'Admin';
  permissions?: string[];
}

export interface ShowroomThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  bgStyle?: 'dark' | 'light' | 'emerald' | 'gold';
}

export interface Dealer {
  id: string;
  slug?: string;
  ownerUid?: string;
  name: string;
  avatarLetter: string;
  avatarUrl?: string;
  profilePictureUrl?: string;
  logoUrl?: string;
  logo?: string;
  subtitle: string;
  location: string;
  rating: number;
  vehiclesCount: number;
  followersCount: string;
  coverImage: string;
  description: string;
  about?: string;
  phone: string;
  whatsapp: string;
  landline?: string;
  contactPerson?: string;
  email?: string;
  flagshipVerified?: boolean;
  verified?: boolean;
  likes_count?: number;
  likesCount?: number;
  socials: SocialMedia;
  socialAccounts?: SocialAccount[];
  activityFeed: ActivityPost[];
  teamMembers?: ShowroomMember[];
  theme_choice?: 'Cosmic' | 'Bone' | 'Emerald' | 'Gold';
  themeSettings?: ShowroomThemeSettings;
  gallery?: string[];
  media?: string[];
  tagline?: string;
  taglineCategory?: 'Professional' | 'Dynamic' | 'Convenience' | 'Short';
  updatedAt?: string;
}

export interface ActivityPost {
  id: string;
  timestamp: string;
  badge: string;
  imageUrl: string;
  title: string;
  description: string;
  price: string;
  carId?: string;
  status?: 'pending_approval' | 'approved';
  videoUrl?: string;
  videoDuration?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface GeneratedSEOListing {
  title: string;
  description: string;
  tags: string[];
  suggestedPricePKR: number;
  highlights: string[];
}

export interface IndustryConfig {
  activeIndustry: 'Automotive' | 'Footwear' | 'Apparel';
  industryName: string;
  slogan: string;
  heroBadge: string;
}

export interface VisitorLog {
  id: string;
  timestamp: string;
  visitorId: string;
  searchQueries: string[];
  filterChanges: {
    make?: string;
    city?: string;
    maxPrice?: number;
    transmission?: string;
  };
  deviceMetrics: {
    viewportWidth: number;
    viewportHeight: number;
    userAgent: string;
  };
}

export interface RegisteredUserLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  savedAlerts: string[];
  activityType: 'profile_view' | 'save_car' | 'message_sent' | 'comparative_eval';
  queryDetails?: string;
}

export interface BargainOwnerLog {
  id: string;
  timestamp: string;
  dealerId: string;
  ownerEmail: string;
  action: 'monetize_analytics' | 'inventory_health_update' | 'buyer_log_accessed' | 'uploaded_listing';
  details: string;
  inventoryCountSnapshot: number;
}

export interface Lead {
  id: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  createdAt: string;

  // New interactive CRM Lead schema properties
  vehicleId?: string;
  showroomOwnerId?: string;
  customerId?: string;
  inquiryMessage?: string;
  inquiryDate?: string;
  status?: 'New' | 'Contacted' | 'Converted' | 'Closed' | 'Lost' | 'Pending' | 'Approved' | 'Countered' | 'Rejected';
  vehicleTitle?: string;
  vehiclePrice?: number;
  vehicleImage?: string;

  // Older legacy fields for compatibility with existing subviews
  type?: string;
  title?: string;
  city?: string;
  details?: string;
  metadata?: Record<string, any>;
}

export interface ServiceBooking {
  id: string;
  serviceId: 'inspection' | 'excise' | 'detailing' | 'ceramic_ppf' | 'sell_for_u' | 'financing' | string;
  serviceTitle: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  city?: string;
  preferredDate?: string;
  vehicleDetails?: string;
  vehicleId?: string;
  vehicleTitle?: string;
  uvLightAnalysisRequested?: boolean;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'In-Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt?: string;
  userId?: string;

  // New CRM and Full-Lifecycle properties
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedWorkshop?: string;
  assignedTechnician?: string;
  estimatedCompletion?: string;
  photos?: string[];
  timelineLogs?: Array<{ title: string; timestamp: string; note: string; user?: string }>;
  chatMessages?: Array<{ id: string; sender: string; senderName: string; message: string; timestamp: string }>;
  invoice?: { amount?: number; status?: 'Pending' | 'Paid'; paymentMethod?: string; paidAt?: string };
  review?: { rating?: number; comment?: string; date?: string };
  warrantyId?: string;
  warrantyDuration?: string;
}

export interface SocialAccount {
  id: string;
  platform: string; // e.g., 'facebook', 'instagram', 'tiktok', 'whatsapp', 'website', 'youtube', 'linkedin', 'x', 'threads', 'snapchat', 'pinterest', 'telegram'
  username: string;
  url: string;
  enabled: boolean;
  sortOrder: number;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  tiktok?: string;
  website?: string;
  youtube?: string;
}

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: string;
  showroomId?: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  content: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  createdAt: string;
  likes: string[];
  commentsCount: number;
  approved?: boolean;
}

export interface SocialComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: string;
  text: string;
  createdAt: string;
}

// Enterprise BAZAR360 Messaging & Communication Models
export interface Conversation {
  id: string;
  participants: string[]; // UIDs or Phone numbers
  participantDetails: Record<string, {
    name: string;
    avatar?: string;
    role?: string;
    showroomTitle?: string;
  }>;
  relatedListingId?: string;
  relatedListingTitle?: string;
  relatedListingImage?: string;
  relatedListingPrice?: number;
  relatedShowroomId?: string;
  relatedServiceId?: string;
  relatedLeadId?: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSenderId: string;
  unreadCount: Record<string, number>; // UID -> unread count
  status: 'Active' | 'Archived' | 'Closed' | 'Flagged';
  priority?: 'Normal' | 'High' | 'Urgent';
  createdAt: string;
  updatedAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  message: string;
  attachments?: Array<{ url: string; name: string; type: 'image' | 'document' | 'pdf' }>;
  type: 'text' | 'image' | 'document' | 'system_event' | 'service_update' | 'listing_inquiry' | 'appointment_update';
  metadata?: {
    listingId?: string;
    listingTitle?: string;
    listingPrice?: number;
    listingImage?: string;
    serviceId?: string;
    serviceTitle?: string;
    appointmentDate?: string;
    referenceCode?: string;
  };
  read: boolean;
  delivered: boolean;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'messages' | 'leads' | 'services' | 'appointments' | 'payments' | 'reviews' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface DetailedReview {
  id: string;
  author: string;
  authorAvatar?: string;
  authorUid?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedTransaction?: boolean;
  transactionType?: 'Vehicle Purchase' | 'Service Completed' | 'Inspection';
  photos?: string[];
  reply?: {
    text: string;
    date: string;
    author: string;
  };
}



