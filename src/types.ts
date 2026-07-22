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
  phone?: string;
  sellerPhone?: string;

  // Auto Choice Exclusive strict properties
  condition: 'New' | 'Used';
  engineCC: number;
  exteriorColor: string;
  bodyCondition: 'Total Genuine' | 'Minor Touch-ups' | 'Major Repaint';
  registrationCity: string;
  documentType: 'Smart Card' | 'Original Book' | 'Duplicate';
  tokenTaxPaid: boolean;
  images: string[];
  
  // Requirement matrix extensions
  assemblyType?: 'Local' | 'Imported';
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

export interface ShowroomThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  bgStyle?: 'dark' | 'light' | 'emerald' | 'gold';
}

export interface Dealer {
  id: string;
  ownerUid?: string;
  name: string;
  avatarLetter: string;
  avatarUrl?: string;
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
  activityFeed: ActivityPost[];
  theme_choice?: 'Cosmic' | 'Bone' | 'Emerald' | 'Gold';
  themeSettings?: ShowroomThemeSettings;
  gallery?: string[];
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
  status?: 'New' | 'Contacted' | 'Closed' | 'Lost' | 'Pending' | 'Approved' | 'Countered' | 'Rejected';
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

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
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


