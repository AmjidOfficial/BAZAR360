export type { UserProfile } from './lib/dbService';

export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
export type Transmission = 'Automatic' | 'Manual';
export type VehicleCondition = 'New' | 'Used';
export type BodyCondition = 'Total Genuine' | 'Minor Touch-ups' | 'Major Repaint';
export type DocumentType = 'Smart Card' | 'Original Book' | 'Duplicate';
export type SellerType = 'Individual' | 'Showroom';
export type ListingStatus = 'Available' | 'Reserved' | 'Sold';

export interface CarListing {
  id: string; title: string; make: string; model: string;
  year?: number; price?: number; mileage?: number; fuelType?: FuelType; transmission?: Transmission;
  imageUrl?: string; verified?: boolean; featured?: boolean; dealerId?: string; showroomId?: string; ownerId?: string;
  description?: string; createdAt?: string; updatedAt?: string; tags?: string[];
  specs?: { color?: string; engineSize?: string; horsepower?: string; horspower?: string; regionalSpecs?: string };
  approved?: boolean; assignedSalesRepId?: string; createdBy?: string; region?: string; location?: string;
  phone?: string; sellerPhone?: string; sellerName?: string; sellerWhatsApp?: string; sellerType?: SellerType; sellerAvatar?: string;
  condition?: VehicleCondition; engineCC?: number; exteriorColor?: string; bodyCondition?: BodyCondition;
  registrationCity?: string; documentType?: DocumentType; tokenTaxPaid?: boolean; images?: string[]; primaryImage?: string; verifiedBadge?: boolean;
  assemblyType?: 'Local' | 'Imported'; features?: string[]; dentPaintDescription?: string; tokenTaxStatus?: 'Paid' | 'Outstanding';
  isSold?: boolean; isPaused?: boolean; isArchived?: boolean; status?: ListingStatus;
  cloudinaryPublicId?: string; cloudinaryPublicIds?: string[]; videoUrl?: string; videoCloudinaryPublicId?: string;
  pdfUrl?: string; pdfCloudinaryPublicId?: string; pdfTitle?: string; topSpeed?: string; acceleration?: string; range?: string;
}

export interface ShowroomMember { id: string; name: string; title: string; phone: string; whatsapp?: string; email?: string; photoUrl?: string; active?: boolean; role?: 'Owner'|'Manager'|'Sales Executive'|'Salesperson'|'Marketing'|'Admin'; permissions?: string[]; }
export interface ShowroomThemeSettings { primaryColor?: string; secondaryColor?: string; fontFamily?: string; bgStyle?: 'dark'|'light'|'emerald'|'gold'; }
export interface Dealer {
  id: string; slug?: string; ownerUid?: string; name: string; avatarLetter?: string; avatarUrl?: string; profilePictureUrl?: string;
  logoUrl?: string; logo?: string; subtitle?: string; location?: string; rating?: number; vehiclesCount?: number; followersCount?: string;
  coverImage?: string; description?: string; about?: string; phone?: string; whatsapp?: string; landline?: string; contactPerson?: string; email?: string;
  flagshipVerified?: boolean; verified?: boolean; likes_count?: number; likesCount?: number; socials?: SocialMedia; socialAccounts?: SocialAccount[];
  activityFeed?: ActivityPost[]; teamMembers?: ShowroomMember[]; theme_choice?: 'Cosmic'|'Bone'|'Emerald'|'Gold'; themeSettings?: ShowroomThemeSettings;
  gallery?: string[]; media?: string[]; tagline?: string; taglineCategory?: 'Professional'|'Dynamic'|'Convenience'|'Short'; updatedAt?: string;
}
export interface ActivityPost { id:string; timestamp:string; badge:string; imageUrl?:string; title:string; description?:string; price?:string; carId?:string; status?:'pending_approval'|'approved'; videoUrl?:string; videoDuration?:number; }
export interface Review { id:string; author:string; rating:number; date:string; comment:string; }
export interface ChatMessage { id:string; sender:'user'|'agent'; text:string; timestamp:string; }
export interface GeneratedSEOListing { title:string; description:string; tags:string[]; suggestedPricePKR?:number; highlights:string[]; }
export interface IndustryConfig { activeIndustry:'Automotive'|'Footwear'|'Apparel'; industryName:string; slogan:string; heroBadge:string; }
export interface VisitorLog { id:string; timestamp:string; visitorId:string; searchQueries:string[]; filterChanges:{make?:string;city?:string;maxPrice?:number;transmission?:string}; deviceMetrics:{viewportWidth:number;viewportHeight:number;userAgent:string}; }
export interface RegisteredUserLog { id:string; timestamp:string; userId:string; userEmail:string; savedAlerts:string[]; activityType:'profile_view'|'save_car'|'message_sent'|'comparative_eval'; queryDetails?:string; }
export interface BargainOwnerLog { id:string; timestamp:string; dealerId:string; ownerEmail:string; action:'monetize_analytics'|'inventory_health_update'|'buyer_log_accessed'|'uploaded_listing'; details:string; inventoryCountSnapshot:number; }

/** Compatibility contracts for legacy/admin modules while they are migrated. */
export interface ServiceBooking { id:string; [key:string]: any; }
export interface Conversation {
  id:string;
  participants?: string[];
  participantDetails?: Record<string, { name?: string; avatar?: string; role?: string }>;
  unreadCount?: Record<string, number>;
  lastMessage?: string;
  lastMessageTime?: string;
  relatedListingId?: string;
  relatedListingTitle?: string;
  relatedServiceId?: string;
  [key:string]: any;
}
export interface DirectMessage { id:string; [key:string]: any; }
export interface UserNotification { id:string; [key:string]: any; }
export interface DetailedReview { id:string; author?:string; rating?:number; comment?:string; date?:string; [key:string]: any; }
export interface SocialPost { id:string; [key:string]: any; }
export interface SocialComment { id:string; [key:string]: any; }

export interface Lead { id:string; [key:string]: any; }
export interface SocialMedia { [key:string]: string | undefined; }
export interface SocialAccount { id?:string; platform:string; url:string; username?:string; [key:string]: any; }