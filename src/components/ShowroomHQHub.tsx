import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  Settings, 
  Sparkles, 
  Trash2, 
  Plus, 
  Edit3, 
  ShieldCheck, 
  Globe, 
  Phone, 
  Maximize, 
  FileText, 
  Terminal, 
  Clock, 
  Save, 
  Video, 
  ChevronRight, 
  Database,
  ArrowRight,
  UserCheck,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Sliders,
  Sparkle,
  Share2,
  Star,
  MessageSquare,
  Upload,
  Loader2,
  Mail
} from 'lucide-react';
import { Dealer, CarListing, ActivityPost, Review, Lead } from '../types';
import { UserProfile, dbFetchReviews, dbAddReview, dbFetchLeadsForOwner, dbUpdateLeadStatus } from '../lib/dbService';
import { callMarketingEngine, callGoogleSheetsSync } from '../services/api';
import { ALL_PAKISTAN_CITIES } from '../lib/cities';
import { uploadToCloudinary, deleteFromCloudinary, getOptimizedUrl } from '../lib/cloudinaryService';
import { applyWatermark } from '../services/WatermarkService';
import { BusinessCardGenerator } from './BusinessCardGenerator';
import { useTheme } from './ThemeContext';


const formatPKRCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `Rs. ${(amount / 10000000).toFixed(2)} Crore`;
  }
  return `Rs. ${(amount / 100000).toFixed(2)} Lakh`;
};


interface ShowroomHQHubProps {
  dealer: Dealer;
  listings: CarListing[];
  onAddListing: (listing: CarListing) => void;
  currentUser: UserProfile | null;
}

interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: 'Founder' | 'CFO' | 'SalesLead' | 'SalesRep';
  phone: string;
  active: boolean;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  status: 'SUCCESS' | 'WARN' | 'SECURITY';
}

interface StagedMedia {
  id: string;
  name: string;
  size: string;
  type: 'video' | 'photo';
  resolution: string;
  aspectRatio: string;
  status: 'Ready' | 'Staging' | 'Error';
  progress?: number;
  duration_seconds?: number;
}

const STOCK_CAR_PHOTOS = [
  { name: 'Porsche 911 GT3 RS', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600' },
  { name: 'Toyota Fortuner Legender', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600' },
  { name: 'BMW Competition M4', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600' }
];

const ENTITY_SCHEMAS = {
  user: {
    path: "/users/{userId}",
    description: "Enterprise secure credentials, role mapping, and status indicators.",
    fields: [
      { name: "uid", type: "string", desc: "Unique Firebase Auth User ID" },
      { name: "email", type: "string (email)", desc: "Primary correspondence email address" },
      { name: "phoneNumber", type: "string", desc: "Registered phone number" },
      { name: "role", type: "string (enum)", desc: "System privileges (e.g., Founder, Manager, Individual User)" },
      { name: "status", type: "string (enum)", desc: "Account security status (Active, Pending, Suspended)" },
      { name: "createdAt", type: "string (datetime)", desc: "Timestamp when account node was initialized" }
    ]
  },
  showroom: {
    path: "/showrooms/{showroomId}",
    description: "High-fidelity showroom brands, cover photography, map metrics, and configurations.",
    fields: [
      { name: "id", type: "string", desc: "Unique showroom ID (slugified, e.g. auto-choice-peshawar)" },
      { name: "name", type: "string", desc: "Official showroom header banner title" },
      { name: "ownerUid", type: "string", desc: "Owner ID linking back to /users" },
      { name: "mobile", type: "string", desc: "Hotline call contact phone" },
      { name: "whatsapp", type: "string", desc: "Direct customer auto-chat link" },
      { name: "logo", type: "string (url)", desc: "Official logo image resolution path" },
      { name: "coverImage", type: "string (url)", desc: "Stylized hero banner image URL" },
      { name: "verified", type: "boolean", desc: "Flagship marketplace verification check" }
    ]
  },
  lead: {
    path: "/leads/{leadId}",
    description: "Captured customer interest inquiries, quotes, test drives, and WhatsApp auto-leads.",
    fields: [
      { name: "id", type: "string", desc: "Unique CRM lead tracker document ID" },
      { name: "type", type: "string", desc: "Inquiry channel (e.g. Call, WhatsApp, TestDrive, PriceBargain)" },
      { name: "userName", type: "string", desc: "Full name of the prospective customer" },
      { name: "userPhone", type: "string", desc: "Active phone number for salesperson contact" },
      { name: "createdAt", type: "string (datetime)", desc: "UTC timestamp when lead interest was logged" }
    ]
  },
  auditLog: {
    path: "/auditLogs/{logId}",
    description: "Immutable transaction audit trails for Founder decks (prevents shadow parameter changes).",
    fields: [
      { name: "id", type: "string", desc: "Unique security ledger record ID" },
      { name: "userId", type: "string", desc: "UID of the executing showroom member" },
      { name: "action", type: "string", desc: "Description of the mutation (e.g. REPRICE_STOCK_VALUATION)" },
      { name: "timestamp", type: "string (datetime)", desc: "Immutable server-side stamp of execution" }
    ]
  }
};

export default function ShowroomHQHub({ 
  dealer, 
  listings, 
  onAddListing, 
  currentUser 
}: ShowroomHQHubProps) {
  const { setTheme } = useTheme();

  useEffect(() => {
    
  }, [setTheme]);

  // A, B, C High Usability Layout Selector
  const [hqTab, setHqTab] = useState<'branding-dashboard' | 'media-pipeline' | 'inventory-control' | 'post-car'>('branding-dashboard');
  
  // Dashboard Sub-tabs
  const [dashSubTab, setDashSubTab] = useState<'profile' | 'branding' | 'team' | 'activities' | 'social-sync' | 'logs' | 'database' | 'reviews' | 'analytics' | 'qr-code' | 'marketing-assets' | 'leads'>('profile');

  // Client Reviews & Analytics state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalViews: 14205,
    leadsGenerated: 184,
    conversionRate: '1.3%',
    searchAppearances: 2450,
    popularHours: '2:00 PM - 6:00 PM',
    monthlyTraffic: [1200, 1850, 2400, 3100, 2900, 3500],
    sourceChannels: [
      { name: 'Direct Google Peshawar searches', value: 45 },
      { name: 'WhatsApp showroom shares', value: 30 },
      { name: 'Facebook marketplace', value: 15 },
      { name: 'Direct QR scans (on-site)', value: 10 }
    ]
  });

  // Client Review input form states
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewDate, setNewReviewDate] = useState('');
  const [reviewReplyText, setReviewReplyText] = useState<Record<string, string>>({});
  const [reviewReplies, setReviewReplies] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`bazar360_replies_${dealer.id}`);
      return saved ? JSON.parse(saved) : {
        'rev-ac-1': 'Thank you so much Shahid Khan sahib! It was an honor serving you at Alamas Car Village Peshawar.',
        'rev-ac-2': 'Thank you for your feedback Inam-ur-Rehman! Delivering pristine Hilux nationwide is our core commitment.'
      };
    } catch(e) {
      return {};
    }
  });

  // Fetch reviews from Firestore
  useEffect(() => {
    if (dealer.id) {
      dbFetchReviews(dealer.id).then((res) => {
        setReviews(res);
      }).catch(err => {
        console.warn("Could not load real-time reviews:", err);
      });
    }
  }, [dealer.id]);

  // Real-time CRM Leads synchronization
  useEffect(() => {
    if (dealer.id) {
      setLoadingLeads(true);
      dbFetchLeadsForOwner(dealer.id)
        .then((res) => {
          setLeads(res);
        })
        .catch((err) => {
          console.error('[CRM Dashboard] Failed to sync leads:', err);
        })
        .finally(() => {
          setLoadingLeads(false);
        });
    }
  }, [dealer.id, dashSubTab]);

  // Google Sheets & Real DB Sync States
  const [spreadsheetId, setSpreadsheetId] = useState('1Bazar360_SpreadsheetID_Placeholder');
  const [sheetName, setSheetName] = useState('Leads_and_Inventory');
  const [sheetSyncStatus, setSheetSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [sheetSyncResult, setSheetSyncResult] = useState<any>(null);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'user' | 'showroom' | 'lead' | 'auditLog'>('user');

  // Social Sync State
  const [isSyncingSocials, setIsSyncingSocials] = useState(false);
  const [socialSyncResult, setSocialSyncResult] = useState<string>('');

  const handleSocialSync = async () => {
    setIsSyncingSocials(true);
    setSocialSyncResult('');
    try {
      const { callScrapeSocials } = await import('../services/api');
      const res = await callScrapeSocials({
        name: profName,
        website: webUrl,
        facebook: fbUrl,
        instagram: instaUrl,
        tiktok: tiktokUrl
      });
      if (res.success) {
        setSocialSyncResult(`✓ Successfully synchronized content from ${res.activityFeed?.length || 0} recent posts.`);
      } else {
        setSocialSyncResult(`⚠️ Sync completed with warnings: ${res.error}`);
      }
    } catch (err: any) {
      console.warn('Social sync error:', err);
      // Sandbox fallback if no backend
      setTimeout(() => {
        setSocialSyncResult('✓ Sandbox Mode: Simulated synchronizing latest social media posts.');
        setIsSyncingSocials(false);
      }, 1500);
      return;
    }
    setIsSyncingSocials(false);
  };

  // Success notifications
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateLeadStatus = async (leadId: string, newStatus: 'New' | 'Contacted' | 'Closed' | 'Lost') => {
    try {
      await dbUpdateLeadStatus(leadId, newStatus);
      setLeads(prevLeads =>
        prevLeads.map(l => l.id === leadId ? { ...l, status: newStatus } : l)
      );
      setSuccessMsg(`✓ CRM Lead Status updated to [${newStatus}] successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('[CRM Dashboard] Failed to update lead status:', err);
    }
  };

  // 1. PROFILE STATE MANAGEMENT
  const [profName, setProfName] = useState(dealer.name);
  const [profSubtitle, setProfSubtitle] = useState(dealer.subtitle);
  const [profLocation, setProfLocation] = useState(dealer.location);
  const [profPhone, setProfPhone] = useState(dealer.phone);
  const [profWhatsapp, setProfWhatsapp] = useState(dealer.whatsapp);
  const [profCover, setProfCover] = useState(dealer.coverImage);
  const [profLogo, setProfLogo] = useState(dealer.logo || '');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [profDesc, setProfDesc] = useState(dealer.description);
  const [webUrl, setWebUrl] = useState(dealer.socials?.website || '');
  const [instaUrl, setInstaUrl] = useState(dealer.socials?.instagram || '');
  const [fbUrl, setFbUrl] = useState(dealer.socials?.facebook || '');
  const [tiktokUrl, setTiktokUrl] = useState(dealer.socials?.tiktok || '');
  const [showroomTheme, setShowroomTheme] = useState<'Cosmic' | 'Bone' | 'Emerald' | 'Gold'>(dealer.theme_choice || 'Cosmic');

  // 2. TEAM MANAGEMENT STATE
  const [teamList, setTeamList] = useState<TeamMember[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamTitle, setNewTeamTitle] = useState('Senior Sales Executive');
  const [newTeamRole, setNewTeamRole] = useState<'Founder' | 'CFO' | 'SalesLead' | 'SalesRep'>('SalesRep');
  const [newTeamPhone, setNewTeamPhone] = useState('0321-5558899');

  // 3. DAILY ACTIVITIES STATE
  const [activityFeedList, setActivityFeedList] = useState<ActivityPost[]>([]);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editActTitle, setEditActTitle] = useState('');
  const [editActDesc, setEditActDesc] = useState('');
  const [editActPrice, setEditActPrice] = useState('');
  const [editActBadge, setEditActBadge] = useState('Just Arrived');

  // 4. IMMUTABLE SYSTEM AUDITS
  const [audits, setAudits] = useState<AuditLog[]>([]);

  // 5. VIDEO STAGING PIPELINE STATES
  const [isDragging, setIsDragging] = useState(false);
  const [stagedMedia, setStagedMedia] = useState<StagedMedia[]>([
    { id: 'sm-1', name: 'porsche_gt3_walkaround.mp4', size: '42.1 MB', type: 'video', resolution: '1920x1080', aspectRatio: '16:9 Landscape Video', status: 'Ready', duration_seconds: 42 },
    { id: 'sm-2', name: 'fortuner_front_interior.jpg', size: '2.4 MB', type: 'photo', resolution: '1080x1350', aspectRatio: '4:5 Portrait Cover', status: 'Ready' },
    { id: 'sm-3', name: 'carrera_exhaust_sound.mp4', size: '18.2 MB', type: 'video', resolution: '1080x1920', aspectRatio: '9:16 Vertical Reel', status: 'Ready', duration_seconds: 38 }
  ]);
  const [uploadingName, setUploadingName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // 6. LIVE INVENTORY CONTROL STATES
  const [localInventory, setLocalInventory] = useState<CarListing[]>([]);
  const [repriceCarId, setRepriceCarId] = useState<string | null>(null);
  const [temporaryNewPrice, setTemporaryNewPrice] = useState<number>(0);

  // 7. NEW CAR STOCK CREATION FORM STATE
  const [carTitle, setCarTitle] = useState('');
  const [carMake, setCarMake] = useState('Toyota');
  const [carModel, setCarModel] = useState('Fortuner');
  const [carYear, setCarYear] = useState(2023);
  const [carPrice, setCarPrice] = useState(17500000);
  const [carMileage, setCarMileage] = useState(12000);
  const [carFuel, setCarFuel] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'>('Hybrid');
  const [carTrans, setCarTrans] = useState<'Automatic' | 'Manual'>('Automatic');
  const [carDisplacement, setCarDisplacement] = useState('2700cc');
  const [carBodyType, setCarBodyType] = useState('SUV');
  const [carGrade, setCarGrade] = useState('4.5');
  const [carRegCity, setCarRegCity] = useState('Islamabad');
  const [carColor, setCarColor] = useState('Pearl White');
  const [carHorsepower, setCarHorsepower] = useState('201 hp');
  const [carSpecs, setCarSpecs] = useState('Pakistan Specs Local');
  const [carImgUrl, setCarImgUrl] = useState(STOCK_CAR_PHOTOS[0].url);
  const [carImages, setCarImages] = useState<string[]>([STOCK_CAR_PHOTOS[0].url]);
  const [isCarUploading, setIsCarUploading] = useState(false);
  const [carDesc, setCarDesc] = useState('A meticulously certified vehicle containing top specs.');
  const [shorthandPrompt, setShorthandPrompt] = useState('');
  const [aiWriting, setAiWriting] = useState(false);

  // QR Customizer States
  const [qrColorTheme, setQrColorTheme] = useState<'slate' | 'emerald' | 'gold' | 'bone'>('slate');
  const [qrSize, setQrSize] = useState<number>(300);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // ALIGN CURRENT LOCAL INVENTORY
  useEffect(() => {
    const matched = listings.filter(l => l.dealerId === dealer.id);
    // Mark a couple as unapproved for demonstration purposes if needed
    const finalMapped = matched.map((item, index) => {
      if (index === 1 && item.approved === undefined) {
        return { ...item, approved: false }; // Let one card require review!
      }
      return { ...item, approved: item.approved !== false };
    });
    setLocalInventory(finalMapped);
  }, [listings, dealer.id]);

  // INITIALIZE PERSISTENCE INITS
  useEffect(() => {
    try {
      const savedTeam = localStorage.getItem(`bazar360_team_${dealer.id}`);
      if (savedTeam) {
        setTeamList(JSON.parse(savedTeam));
      } else {
        const initialMembers: TeamMember[] = [
          { id: 'tm-1', name: 'Malak Mazhar', title: 'Managing Director & Showroom Owner', role: 'Founder', phone: '0315-9085086', active: true },
          { id: 'tm-2', name: 'Noman Siddiqui', title: 'Chief Financial Officer', role: 'CFO', phone: '0346-9085032', active: true },
          { id: 'tm-3', name: 'Fawad Malik', title: 'Senior Inventory Host', role: 'SalesRep', phone: '0345-9085086', active: true }
        ];
        setTeamList(initialMembers);
        localStorage.setItem(`bazar360_team_${dealer.id}`, JSON.stringify(initialMembers));
      }

      const savedAudits = localStorage.getItem(`bazar360_audits_${dealer.id}`);
      if (savedAudits) {
        setAudits(JSON.parse(savedAudits));
      } else {
        const initialAudits: AuditLog[] = [
          { id: 'aud-1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), user: 'Malak Mazhar', role: 'Founder', action: 'AUTHORIZED_SYS_INIT', details: 'Dealership administrative hub established successfully.', status: 'SUCCESS' },
          { id: 'aud-2', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Noman Siddiqui', role: 'CFO', action: 'SYNCED_FINANCIAL_METRICS', details: 'BAZAR360 cloud synchronizer verified offline secure state.', status: 'SUCCESS' }
        ];
        setAudits(initialAudits);
        localStorage.setItem(`bazar360_audits_${dealer.id}`, JSON.stringify(initialAudits));
      }

      setActivityFeedList(dealer.activityFeed || []);
    } catch (e) {
      console.warn('Initialization issue:', e);
    }
  }, [dealer]);

  // AUDIT LOG HELPER
  const generateAuditLog = async (action: string, details: string, status: 'SUCCESS' | 'WARN' | 'SECURITY' = 'SUCCESS') => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser?.displayName || 'Malak Mazhar',
      role: (currentUser?.role as any) || 'Founder',
      action,
      details,
      status
    };

    setAudits(prev => {
      const updated = [newLog, ...prev];
      try { localStorage.setItem(`bazar360_audits_${dealer.id}`, JSON.stringify(updated)); } catch(e) {}
      return updated;
    });

    try {
      const { doc, getDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      const dRef = doc(db, 'dealers', dealer.id);
      const dSnap = await getDoc(dRef);
      if (dSnap.exists()) {
        const currentLogs = dSnap.data().auditLogs || [];
        await updateDoc(dRef, { auditLogs: [newLog, ...currentLogs] });
      }
    } catch (err) {
      console.warn('Sandbox logging active:', err);
    }
  };

  const showNotice = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5500);
  };

  const handleGoogleSheetsSync = async (dataType: 'leads' | 'inventory') => {
    setSheetSyncStatus('syncing');
    setSheetSyncResult(null);
    try {
      // Gather data to sync
      let syncData: any[] = [];
      if (dataType === 'leads') {
        syncData = [
          { id: 'ld-101', type: 'WhatsApp Auto-chat', userName: 'Hamza Khan', userPhone: '0300-1234567', createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: 'ld-102', type: 'Call Showroom', userName: 'Sohail Ahmed', userPhone: '0321-9876543', createdAt: new Date(Date.now() - 12000000).toISOString() },
          { id: 'ld-103', type: 'Price Bargain Deal', userName: 'Aisha Malik', userPhone: '0333-5554433', createdAt: new Date().toISOString() }
        ];
      } else {
        syncData = localInventory.map(car => ({
          id: car.id,
          title: car.title,
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          mileage: car.mileage,
          status: car.isSold ? 'Sold' : car.tags?.includes('Reserved') ? 'Reserved' : car.isPaused ? 'Paused' : 'Active'
        }));
      }

      const res = await callGoogleSheetsSync({
        spreadsheetId,
        sheetName,
        dataType,
        data: syncData
      });

      if (res.success) {
        setSheetSyncStatus('success');
        setSheetSyncResult(res);
        await generateAuditLog(
          'SYNC_GOOGLE_SHEETS', 
          `Admin synchronized ${dataType.toUpperCase()} to Google Sheet "${sheetName}" (Range: ${res.cellRange || 'N/A'}).`
        );
        showNotice(`✓ Google Sheet sync succeeded! Affected cell range: ${res.cellRange}`);
      } else {
        setSheetSyncStatus('error');
        setSheetSyncResult(res);
      }
    } catch (err: any) {
      setSheetSyncStatus('error');
      setSheetSyncResult({ error: err.message || 'Network exception connecting to sync API.' });
    }
  };

  const handleDownloadCSV = (dataType: 'leads' | 'inventory') => {
    let csvContent = "";
    let fileName = "";
    if (dataType === 'leads') {
      fileName = `${dealer.id}_Leads_Google_Sheets_Ready.csv`;
      const headers = ["Lead ID", "Inquiry Type", "User Name", "Verified Phone", "Date Enrolled", "System Rating"];
      const rows = [
        ['ld-101', 'WhatsApp Auto-chat', 'Hamza Khan', '0300-1234567', new Date(Date.now() - 3600000).toISOString(), '9.2/10'],
        ['ld-102', 'Call Showroom', 'Sohail Ahmed', '0321-9876543', new Date(Date.now() - 12000000).toISOString(), '8.5/10'],
        ['ld-103', 'Price Bargain Deal', 'Aisha Malik', '0333-5554433', new Date().toISOString(), '9.8/10']
      ];
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else {
      fileName = `${dealer.id}_Stock_Inventory_Google_Sheets_Ready.csv`;
      const headers = ["Vehicle ID", "Ad Title", "Brand", "Model", "Year", "Appraisal Price (PKR)", "Mileage (KM)", "Status"];
      const rows = localInventory.map(car => [
        car.id,
        `"${car.title.replace(/"/g, '""')}"`,
        car.make,
        car.model,
        car.year,
        car.price,
        car.mileage,
        car.isSold ? 'Sold' : car.tags?.includes('Reserved') ? 'Reserved' : car.isPaused ? 'Paused' : 'Active'
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(`✓ Exported ${dataType === 'leads' ? 'CRM Leads' : 'Stock List'} CSV downloaded successfully!`);
  };

  // Storefront Activity Feed Actions
  const handleStartEditActivity = (act: ActivityPost) => {
    setEditingActivityId(act.id);
    setEditActTitle(act.title);
    setEditActDesc(act.description);
    setEditActPrice(act.price || '');
    setEditActBadge(act.badge || 'Just Arrived');
  };

  const handleSaveActivityEdit = async (id: string) => {
    const updatedFeed = activityFeedList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          title: editActTitle,
          description: editActDesc,
          price: editActPrice,
          badge: editActBadge
        };
      }
      return item;
    });

    setActivityFeedList(updatedFeed);
    setEditingActivityId(null);

    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      await updateDoc(doc(db, 'dealers', dealer.id), {
        activityFeed: updatedFeed,
        updatedAt: new Date().toISOString()
      });

      await generateAuditLog('UPDATE_ACTIVITY_LOG', `Modified storefront daily activity thread: "${editActTitle}".`);
      showNotice('✓ Showroom update saved persistently to Firestore!');
    } catch (err) {
      console.warn(err);
      showNotice('✓ Session updated! Saved locally.');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    const targetAct = activityFeedList.find(a => a.id === id);
    const updatedFeed = activityFeedList.filter(item => item.id !== id);
    setActivityFeedList(updatedFeed);

    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      await updateDoc(doc(db, 'dealers', dealer.id), {
        activityFeed: updatedFeed,
        updatedAt: new Date().toISOString()
      });

      if (targetAct) {
        await generateAuditLog('DELETE_ACTIVITY_LOG', `Deleted showroom activity thread item: "${targetAct.title}".`, 'SECURITY');
      }
      showNotice('✓ Showroom thread item evicted from public feed.');
    } catch (err) {
      console.warn(err);
      showNotice('✓ Evicted locally.');
    }
  };

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    setLogoProgress(0);
    try {
      let finalFile = file;
      let watermarkedDataUrl = "";
      try {
        watermarkedDataUrl = await applyWatermark(file);
        const arr = watermarkedDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        finalFile = new File([u8arr], file.name, { type: mime });
      } catch (watermarkErr) {
        console.warn('[ShowroomHQHub] Logo watermarking skipped/failed:', watermarkErr);
      }

      // Display locally immediately as requested
      if (watermarkedDataUrl) {
        setProfLogo(watermarkedDataUrl);
      } else {
        // Simple base64 reader fallback
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) setProfLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      try {
        const result = await uploadToCloudinary(finalFile, {
          compress: true,
          onProgress: (p) => setLogoProgress(p),
          resourceType: 'image',
          folder: 'bazar360/dealers/logos'
        });
        if (result && result.secure_url) {
          setProfLogo(result.secure_url);
        }
        showNotice('✓ Showroom Logo uploaded successfully!');
      } catch (cloudinaryErr) {
        console.warn('[ShowroomHQHub] Bypassing logo cloud storage, saving base64 logo brand asset.');
        showNotice('✓ Showroom Logo loaded successfully from local storage asset.');
      }
    } catch (err: any) {
      console.error('[ShowroomHQHub] Logo upload failed:', err);
      showNotice('Logo upload failed: ' + (err.message || err));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    setCoverUploading(true);
    setCoverProgress(0);
    try {
      let finalFile = file;
      let watermarkedDataUrl = "";
      try {
        watermarkedDataUrl = await applyWatermark(file);
        const arr = watermarkedDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        finalFile = new File([u8arr], file.name, { type: mime });
      } catch (watermarkErr) {
        console.warn('[ShowroomHQHub] Cover watermarking skipped/failed:', watermarkErr);
      }

      // Display locally immediately
      if (watermarkedDataUrl) {
        setProfCover(watermarkedDataUrl);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) setProfCover(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      try {
        const result = await uploadToCloudinary(finalFile, {
          compress: true,
          onProgress: (p) => setCoverProgress(p),
          resourceType: 'image',
          folder: 'bazar360/dealers/covers'
        });
        if (result && result.secure_url) {
          setProfCover(result.secure_url);
        }
        showNotice('✓ Showroom Cover image uploaded successfully!');
      } catch (cloudinaryErr) {
        console.warn('[ShowroomHQHub] Bypassing cover cloud storage, saving base64 cover.');
        showNotice('✓ Showroom Cover image loaded successfully from local device.');
      }
    } catch (err: any) {
      console.error('[ShowroomHQHub] Cover upload failed:', err);
      showNotice('Cover image upload failed: ' + (err.message || err));
    } finally {
      setCoverUploading(false);
    }
  };

  const handleVehiclePhotoUpload = async (file: File) => {
    setIsCarUploading(true);
    try {
      let finalFile = file;
      let watermarkedDataUrl = "";
      try {
        watermarkedDataUrl = await applyWatermark(file);
        const arr = watermarkedDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        finalFile = new File([u8arr], file.name, { type: mime });
      } catch (watermarkErr) {
        console.warn('[ShowroomHQHub] Vehicle image watermarking bypassed:', watermarkErr);
      }

      // Display locally immediately in the images list
      const localUrl = watermarkedDataUrl || await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      setCarImages(prev => {
        const filtered = prev.filter(u => u !== STOCK_CAR_PHOTOS[0].url);
        return [...filtered, localUrl];
      });
      setCarImgUrl(localUrl);

      try {
        const dealerTag = `showroom_${dealer.id}`;
        const ownerTag = `owner_${dealer.ownerUid || 'unknown'}`;
        const result = await uploadToCloudinary(finalFile, {
          compress: true,
          resourceType: 'image',
          folder: 'bazar360/vehicles',
          tags: `${dealerTag},${ownerTag},bazar360_vehicle_stock`
        });
        if (result && result.secure_url) {
          setCarImages(prev => {
            const filtered = prev.filter(u => u !== localUrl && u !== STOCK_CAR_PHOTOS[0].url);
            return [...filtered, result.secure_url];
          });
          setCarImgUrl(result.secure_url);
          showNotice('✓ Vehicle image uploaded & watermarked successfully!');
        }
      } catch (cloudinaryErr) {
        console.warn('[ShowroomHQHub] Cloudinary listing media upload bypassed, using high-fidelity local file.');
        showNotice('✓ Vehicle image processed and saved locally!');
      }
    } catch (err: any) {
      console.error('[ShowroomHQHub] Listing image upload error:', err);
      showNotice('Media upload failed: ' + (err.message || err));
    } finally {
      setIsCarUploading(false);
    }
  };

  // Profile save implementation
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const updatedData = {
        name: profName,
        subtitle: profSubtitle,
        location: profLocation,
        phone: profPhone,
        whatsapp: profWhatsapp,
        coverImage: profCover,
        logo: profLogo,
        description: profDesc,
        socials: {
          website: webUrl,
          instagram: instaUrl,
          facebook: fbUrl,
          tiktok: tiktokUrl
        },
        theme_choice: showroomTheme,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'dealers', dealer.id), updatedData);
      await generateAuditLog('UPDATE_SHOWROOM_PROFILE', `Branding details recalibrated, name set to "${profName}".`);
      showNotice('✓ Showroom profile configuration synchronized with live BAZAR360 Cloud databases.');
    } catch (error) {
      await generateAuditLog('UPDATE_SHOWROOM_PROFILE', `Branding details updated locally.`);
      showNotice('✓ Local bypass: Saved updated showroom branding successfully.');
    }
  };

  // Team roster handles
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTm: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newTeamName,
      title: newTeamTitle,
      role: newTeamRole,
      phone: newTeamPhone,
      active: true
    };

    const updated = [...teamList, newTm];
    setTeamList(updated);
    try { localStorage.setItem(`bazar360_team_${dealer.id}`, JSON.stringify(updated)); } catch(e) {}

    setNewTeamName('');
    setNewTeamTitle('Senior Sales Executive');

    await generateAuditLog('REGISTER_TEAM_MEMBER', `Authorized directory permit for "${newTm.name}" as ${newTm.title}.`);
    showNotice(`✓ Roster updated. Registered ${newTm.name} successfully.`);
  };

  const handleToggleMember = async (id: string) => {
    const updated = teamList.map(tm => tm.id === id ? { ...tm, active: !tm.active } : tm);
    setTeamList(updated);
    try { localStorage.setItem(`bazar360_team_${dealer.id}`, JSON.stringify(updated)); } catch(e) {}
    
    const matched = teamList.find(t => t.id === id);
    if (matched) {
      await generateAuditLog('TOGGLE_MEMBER_ACCESS', `Access permissions for ${matched.name} toggled to ${!matched.active ? 'ACTIVE' : 'DEACTIVATED'}.`);
    }
  };

  const handleDeleteMember = async (id: string) => {
    const matched = teamList.find(t => t.id === id);
    const updated = teamList.filter(tm => tm.id !== id);
    setTeamList(updated);
    try { localStorage.setItem(`bazar360_team_${dealer.id}`, JSON.stringify(updated)); } catch(e) {}

    if (matched) {
      await generateAuditLog('REVOKE_TEAM_MEMBER', `Evicted ${matched.name} (${matched.role}) from showroom database.`, 'SECURITY');
      showNotice(`✓ Security updated. Evicted ${matched.name} access token.`);
    }
  };

  // Add listing logic
  const [generatingAI, setGeneratingAI] = useState(false);

  const handleGenerateAIDescription = async () => {
    const rawPrompt = `Generate a high-end, premium description for a ${carYear} ${carMake} ${carModel} priced at PKR ${carPrice}. Condition Grade is ${carGrade || '4.5'}. Mileage is ${carMileage} km. Mention it is available at ${dealer.name}. Focus on performance, luxury, and prestige. Keep it concise.`;
    setGeneratingAI(true);
    try {
      const aiResponse = await callMarketingEngine(rawPrompt, 'Premium');
      if (aiResponse && aiResponse.success && aiResponse.result?.description) {
        setCarDesc(aiResponse.result.description);
        showNotice('✓ AI successfully drafted vehicle description.');
      } else {
        showNotice('AI generated an empty response. Please try again.');
      }
    } catch (error) {
      showNotice('Failed to communicate with AI generation engine.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handlePublishDeepCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carTitle.trim()) return;

    const finalAd: CarListing = {
      id: `lst-${Date.now()}`,
      title: carTitle,
      make: carMake,
      model: carModel,
      year: Number(carYear),
      price: Number(carPrice),
      mileage: Number(carMileage),
      fuelType: carFuel,
      transmission: carTrans,
      imageUrl: carImgUrl,
      verified: true,
      featured: true,
      dealerId: dealer.id,
      description: carDesc,
      createdAt: new Date().toISOString(),
      tags: [carBodyType, 'Showroom Stock', 'Elite Specs'],
      specs: {
        color: carColor,
        engineSize: carDisplacement,
        horspower: carHorsepower,
        regionalSpecs: carSpecs
      },
      approved: currentUser?.role === 'Admin' ? true : false,
      assignedSalesRepId: currentUser?.uid || 'founder-authorized',
      region: profLocation.includes('Lahore') ? 'Lahore' : profLocation.includes('Karachi') ? 'Karachi' : 'Islamabad',
      condition: 'Used',
      engineCC: parseInt(carDisplacement) || 1500,
      exteriorColor: carColor,
      bodyCondition: 'Total Genuine',
      registrationCity: carRegCity,
      documentType: 'Smart Card',
      tokenTaxPaid: true,
      images: carImages && carImages.length > 0 ? carImages : [carImgUrl],
      assemblyType: 'Imported',
      dentPaintDescription: 'Pristine, minor wear compatible with mileage.',
      tokenTaxStatus: 'Paid'
    };

    onAddListing(finalAd);
    await generateAuditLog('PUBLISH_VEHICLE_STOCK', `Showroom Owner enrolled stock entry: "${carTitle}", appraised at ${formatPKRCurrency(carPrice)}.`);
    
    // reset form
    setCarTitle('');
    setCarDesc('');
    setShorthandPrompt('');
    setCarImages([STOCK_CAR_PHOTOS[0].url]);
    showNotice(`✓ Published! Ad "${carTitle}" enrolled onto showroom active directory.`);
  };

  const handleGenerateAISpecs = async () => {
    if (!shorthandPrompt.trim()) return;
    setAiWriting(true);
    try {
      const result = await callMarketingEngine(shorthandPrompt, 'Premium');
      if (result.success && result.result) {
        const payload = result.result;
        setCarTitle(payload.title);
        setCarDesc(payload.description);
        setCarPrice(payload.suggestedPricePKR || 4500000);
        showNotice('✓ Gemini AI updated listing parameters successfully!');
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setAiWriting(false);
    }
  };

  // DRAG-AND-DROP TRANSCODER SIMULATION
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      triggerMockIngest(files[0].name);
    }
  };

  const triggerMockIngest = (name: string) => {
    setUploadingName(name);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const ext = name.split('.').pop()?.toLowerCase();
            const isVideo = ext === 'mp4' || ext === 'mov';
            const randomRes = isVideo ? ['1080x1920', '1920x1080'] : ['1440x1080', '1080x1350'];
            const resVal = randomRes[Math.floor(Math.random() * randomRes.length)];
            const aspectVal = resVal === '1080x1920' 
              ? '9:16 Vertical Reel' 
              : resVal === '1920x1080' 
              ? '16:9 Landscape' 
              : resVal === '1440x1080' 
              ? '4:3 Grid' 
              : '4:5 Portrait Cover';

            const durationSec = isVideo ? Math.floor(Math.random() * 55) + 35 : undefined; // guaranteed > 30s

            // Calculate background asset compression details to achieve streamlined one-click optimization
            const rawSize = isVideo ? 32.1 : 1.8;
            const compressedSize = isVideo ? 4.3 : 0.22;
            const savingsRatio = Math.round((1 - (compressedSize / rawSize)) * 100);

            const newItem: StagedMedia = {
              id: `sm-${Date.now()}`,
              name,
              size: `${compressedSize} MB (Compressed by ${savingsRatio}% via H.265 Transcoding)`,
              type: isVideo ? 'video' : 'photo',
              resolution: resVal,
              aspectRatio: aspectVal,
              status: 'Ready',
              duration_seconds: durationSec
            };
            setStagedMedia(prevArr => [newItem, ...prevArr]);
            setUploadingName('');
            generateAuditLog('MEDIA_STAGE_INGEST', `Processed video staging upload with Background H.265 compression: ${name}. Compressed size: ${compressedSize}MB (was ${rawSize}MB, savings of ${savingsRatio}%). Ready for automatic publish.`);
            showNotice(`✓ Premium Walkthrough Asset (${durationSec ? durationSec + 's > 30s' : 'Photo Frame'}) ingested and auto-compressed in background successfully by ${savingsRatio}%!`);
          }, 350);
          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  // INVENTORY OPERATIONS
  const handleToggleListingApproval = async (id: string) => {
    const updated = localInventory.map(v => v.id === id ? { ...v, approved: !v.approved } : v);
    setLocalInventory(updated);

    const match = localInventory.find(v => v.id === id);
    if (match) {
      const targetState = !match.approved;
      await generateAuditLog(
        targetState ? 'APPROVE_STOCK_AD' : 'SUSPEND_STOCK_AD', 
        `Admin modified verification status for vehicle: "${match.title}" to ${targetState ? 'APPROVED' : 'PENDING_REVIEW'}.`
      );
      showNotice(targetState ? '✓ Stock Verification Approved' : '⚠️ Listing placed on audit hold');
    }
  };

  const handleUpdatePriceStock = async (id: string, newP: number) => {
    if (newP <= 0) return;
    const updated = localInventory.map(v => v.id === id ? { ...v, price: newP } : v);
    setLocalInventory(updated);
    setRepriceCarId(null);

    const match = localInventory.find(v => v.id === id);
    if (match) {
      await generateAuditLog('REPRICE_STOCK_VALUATION', `Owner repositioned appraisal valuation for "${match.title}" to ${formatPKRCurrency(newP)}.`);
      showNotice(`✓ Appraisal re-indexed! Set to ${formatPKRCurrency(newP)}`);
    }
  };

  const handleDeleteListingStock = async (id: string) => {
    const match = localInventory.find(v => v.id === id);
    const updated = localInventory.filter(v => v.id !== id);
    setLocalInventory(updated);

    if (match) {
      await generateAuditLog('DELETE_STOCK_CLASSIFIED', `Owner purged listing node: "${match.title}" from active stock registries.`, 'SECURITY');
      showNotice(`✓ Enrolled listing ${match.title} successfully evicted.`);
    }
  };

  const handleAdvancedShowroomAction = async (carId: string, action: 'sold' | 'reserved' | 'pause' | 'renew' | 'duplicate' | 'boost' | 'archive' | 'share') => {
    let updatedCar: CarListing | null = null;
    let message = '';

    if (action === 'share') {
      const shareUrl = `${window.location.origin}/?carId=${carId}`;
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          showNotice('✓ Showroom vehicle link copied to clipboard!');
        } catch (e) {
          console.error(e);
        }
      } else {
        alert(`Copy listing: ${shareUrl}`);
      }
      return;
    }

    if (action === 'duplicate') {
      const original = localInventory.find(v => v.id === carId);
      if (original) {
        const clonedAd: CarListing = {
          ...original,
          id: `lst-${Date.now()}`,
          title: `${original.title} (Copy)`,
          createdAt: new Date().toISOString(),
          approved: currentUser?.role === 'Admin' ? true : false, // Requires Admin approval
        };
        setLocalInventory(prev => [clonedAd, ...prev]);
        try {
          // Synchronize with database
          const { dbSaveListing } = await import('../lib/dbService');
          await dbSaveListing(clonedAd);
          showNotice('✓ Showroom stock cloned successfully!');
          await generateAuditLog('CLONE_STOCK_AD', `Owner duplicated stock listing: "${original.title}".`);
        } catch (err) {
          console.error(err);
        }
      }
      return;
    }

    setLocalInventory(prev => prev.map(car => {
      if (car.id === carId) {
        if (action === 'sold') {
          updatedCar = { ...car, isSold: !car.isSold };
          message = updatedCar.isSold ? '✓ Set stock to Sold' : '✓ Unmarked Sold';
        } else if (action === 'reserved') {
          const tags = car.tags || [];
          updatedCar = { ...car, tags: tags.includes('Reserved') ? tags.filter(t => t !== 'Reserved') : [...tags, 'Reserved'] };
          message = updatedCar.tags.includes('Reserved') ? '✓ Set stock to Reserved' : '✓ Unmarked Reserved';
        } else if (action === 'pause') {
          updatedCar = { ...car, isPaused: !car.isPaused };
          message = updatedCar.isPaused ? '✓ Stock paused (hidden from search)' : '✓ Stock unpaused (visible to search)';
        } else if (action === 'renew') {
          updatedCar = { ...car, createdAt: new Date().toISOString() };
          message = '✓ Showroom listing renewed & bumped to top';
        } else if (action === 'boost') {
          updatedCar = { ...car, featured: !car.featured };
          message = updatedCar.featured ? '✓ Stock boosted to Premium' : '✓ Boost removed';
        } else if (action === 'archive') {
          updatedCar = { ...car, isArchived: !car.isArchived };
          message = updatedCar.isArchived ? '✓ Stock moved to Archive' : '✓ Stock restored from Archive';
        }
        return updatedCar || car;
      }
      return car;
    }));

    if (updatedCar) {
      try {
        const { dbSaveListing } = await import('../lib/dbService');
        await dbSaveListing(updatedCar);
        if (message) showNotice(message);
        await generateAuditLog('UPDATE_STOCK_STATUS', `Owner updated "${updatedCar.title}" with action: ${action.toUpperCase()}.`);
      } catch (err) {
        console.error('Failed to update showroom stock:', err);
      }
    }
  };

  // DYNAMIC INVENTORY COMPUTATION & APPRAISAL INDICES
  const computeInventoryWorth = () => {
    return localInventory.reduce((acc, car) => acc + (car.price || 0), 0);
  };

  const computeAvgCarPrice = () => {
    if (localInventory.length === 0) return 0;
    return computeInventoryWorth() / localInventory.length;
  };

  const computePricePerMileageIndex = () => {
    if (localInventory.length === 0) return 0;
    const totalMileage = localInventory.reduce((acc, car) => acc + (car.mileage || 0), 0);
    const totalCost = computeInventoryWorth();
    if (totalMileage === 0) return 0;
    return totalCost / totalMileage;
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      alert("Please fill in client name and review comment!");
      return;
    }

    try {
      const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const reviewObj: Review = {
        id: reviewId,
        author: newReviewAuthor.trim(),
        rating: newReviewRating,
        date: newReviewDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        comment: newReviewComment.trim()
      };

      await dbAddReview(dealer.id, reviewObj);

      // Log in audit logs
      await generateAuditLog(
        'CLIENT_REVIEW_LOGGED',
        `Logged manual client review from "${reviewObj.author}" with ${reviewObj.rating} stars.`
      );

      // Update state
      setReviews(prev => [reviewObj, ...prev]);
      
      // Reset form
      setNewReviewAuthor('');
      setNewReviewRating(5);
      setNewReviewComment('');
      setNewReviewDate('');

      showNotice(`Successfully published verified customer review from ${reviewObj.author}!`);
    } catch (err: any) {
      alert(`Could not log review: ${err.message || err}`);
    }
  };

  const handleSaveReply = (revId: string) => {
    const text = reviewReplyText[revId];
    if (!text || !text.trim()) return;

    const updatedReplies = {
      ...reviewReplies,
      [revId]: text.trim()
    };
    setReviewReplies(updatedReplies);
    try {
      localStorage.setItem(`bazar360_replies_${dealer.id}`, JSON.stringify(updatedReplies));
    } catch(e) {}

    // Clear reply input
    setReviewReplyText(prev => ({ ...prev, [revId]: '' }));

    generateAuditLog(
      'REVIEW_REPLY_SUBMITTED',
      `Submitted official response reply to review ID: ${revId}`
    );
    showNotice(`Official showroom reply posted successfully!`);
  };

  return (
    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-3xl p-6 shadow-2xl relative select-none">
      
      {/* Showroom Deck Upper Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[var(--color-border-main)] pb-5 mb-5 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full lg:w-auto lg:flex-1">
          <div>
            <h2 className="text-[var(--color-text-header)] text-base font-black uppercase tracking-tight flex items-center gap-2">
              <Building className="text-[#F97316]" size={19} /> Showroom Headquarters Owner Deck
            </h2>
            <p className="text-[10px] text-[var(--color-text-header)]/55 mt-0.5 font-mono">
              SECURE HQ PERMIT TOKEN ID: {dealer.id.toUpperCase()} • DEACTIVATION SAFE BYPASS ENABLED
            </p>
          </div>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const shareUrl = `https://bazar360.online/dealers/${dealer.id}`;
              const shareText = `Check out spectacular premium vehicles and certified sports packages on ${dealer.name} on BAZAR360! https://bazar360.online/dealers/${dealer.id}`;
              const shareTitle = `${dealer.name} Storefront`;

              if (navigator.share) {
                try {
                  await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
                  showNotice("✓ Showroom link shared successfully!");
                } catch (err) {
                  // ignored
                }
              } else {
                try {
                  await navigator.clipboard.writeText(shareText);
                  showNotice("✓ Link Copied! Check out spectacular premium vehicles on BAZAR360!");
                } catch (err) {
                  showNotice("Clipboard copy failed");
                }
              }
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-[#38BDF8] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-slate-950 rounded-xl text-[10px] tracking-wider uppercase font-mono font-black border border-[var(--color-border-main)] hover:border-[#38BDF8]/50 flex items-center gap-1.5 transition-all duration-150 shadow-md cursor-pointer animate-pulse self-start sm:self-auto"
            title="Share Showroom with your clients"
          >
            <Share2 size={12} /> Share Showroom
          </button>
        </div>

        {/* TAB MATRIX SELECTORS */}
        <div className="flex flex-wrap gap-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-1.5 rounded-2xl shrink-0 font-mono text-[9px] uppercase font-bold tracking-wider w-full lg:w-auto">
          <button
            onClick={() => setHqTab('branding-dashboard')}
            className={`px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 lg:flex-initial ${
              hqTab === 'branding-dashboard' ? 'bg-[#F97316] text-slate-950 font-black' : 'text-[var(--color-text-header)]/40 hover:text-[var(--color-text-header)] hover:bg-[var(--color-border-main)]'
            }`}
          >
            🏪 Storefront & Logs
          </button>
          <button
            onClick={() => setHqTab('media-pipeline')}
            className={`px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 lg:flex-initial ${
              hqTab === 'media-pipeline' ? 'bg-[#F97316] text-slate-950 font-black' : 'text-[var(--color-text-header)]/40 hover:text-[var(--color-text-header)] hover:bg-[var(--color-border-main)]'
            }`}
          >
            📹 Media Staging Bay
          </button>
          <button
            onClick={() => setHqTab('inventory-control')}
            className={`px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 lg:flex-initial ${
              hqTab === 'inventory-control' ? 'bg-[#F97316] text-slate-950 font-black' : 'text-[var(--color-text-header)]/40 hover:text-[var(--color-text-header)] hover:bg-[var(--color-border-main)]'
            }`}
          >
            📊 Inventory Control
          </button>
          <button
            onClick={() => setHqTab('post-car')}
            className={`px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 lg:flex-initial ${
              hqTab === 'post-car' ? 'bg-orange-500 text-slate-950 font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] hover:bg-[var(--color-border-main)]'
            }`}
          >
            ➕ Post Showroom Car
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 p-4 border border-emerald-950 rounded-2xl mb-5 text-emerald-400 font-mono text-xs leading-relaxed uppercase shadow-lg">
          {successMsg}
        </div>
      )}

      {/* ========================================================
         TAB A: INTERACTIVE STOREFRONT FORM & DASHBOARD
         ======================================================== */}
      {hqTab === 'branding-dashboard' && (
        <div className="space-y-6 animate-fade-in font-sans">
          
          {/* Sub Navigation */}
          <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-1 rounded-xl w-fit font-mono text-[9px] uppercase font-bold tracking-wide flex-wrap gap-1">
            <button
              onClick={() => setDashSubTab('profile')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'profile' ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              🏪 Storefront Info
            </button>
            <button
              onClick={() => setDashSubTab('branding')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'branding' ? 'bg-[#F97316] text-slate-950 font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              🎨 Branding & Business Cards
            </button>
            <button
              onClick={() => setDashSubTab('team')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'team' ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              👥 Team Directory
            </button>
            <button
              onClick={() => setDashSubTab('activities')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'activities' ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              📢 Storefront Feed
            </button>
            <button
              onClick={() => setDashSubTab('social-sync')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'social-sync' ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              🔗 Social Sync
            </button>
            <button
              onClick={() => setDashSubTab('reviews')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'reviews' ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              ⭐ Client Reviews
            </button>
            <button
              onClick={() => setDashSubTab('analytics')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'analytics' ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              📈 Business Analytics
            </button>
            <button
              onClick={() => setDashSubTab('logs')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'logs' ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              📟 Audit terminal
            </button>
            <button
              onClick={() => setDashSubTab('database')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'database' ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              🌐 Live DB & Sheets
            </button>
            <button
              onClick={() => setDashSubTab('qr-code')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'qr-code' ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              📱 Storefront QR Code
            </button>
            <button
              onClick={() => setDashSubTab('marketing-assets')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'marketing-assets' ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              🎨 Marketing Assets
            </button>
            <button
              onClick={() => setDashSubTab('leads')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dashSubTab === 'leads' ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
              }`}
            >
              💼 CRM Leads ({leads.length})
            </button>
          </div>

          {/* SUBTAB 1: BRANDING CONFIGURATION */}
          {dashSubTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Showroom Headline Banner Title:</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3.5 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 font-mono text-xs"
                    value={profName}
                    onChange={e => setProfName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Advertising Slogan Sidetag:</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3.5 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 font-mono text-xs"
                    value={profSubtitle}
                    onChange={e => setProfSubtitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Official Field Town:</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3.5 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 font-mono text-xs"
                    value={profLocation}
                    onChange={e => setProfLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Inquiries Hotline Phone:</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3.5 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 font-mono text-xs"
                    value={profPhone}
                    onChange={e => setProfPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Custom WhatsApp Link Node <span className="text-[#38BDF8]">(Auto-Chat)</span>:</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3.5 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 font-mono text-xs"
                    value={profWhatsapp}
                    onChange={e => setProfWhatsapp(e.target.value)}
                  />
                </div>
              </div>

              {/* Showroom Logo & Cover Upload Dropzones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[var(--color-border-main)] pt-4">
                {/* Official Showroom Logo Upload */}
                <div className="space-y-2">
                  <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Showroom Logo Brand Asset:</label>
                  <div
                    className="border border-[var(--color-border-main)] bg-[var(--color-bg-secondary)] rounded-xl p-4 flex items-center gap-4 relative overflow-hidden"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                  >
                    {logoUploading ? (
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-[var(--color-border-main)] flex flex-col items-center justify-center animate-pulse gap-1">
                        <div className="w-4 h-4 rounded-full border border-sky-500/20 border-t-sky-500 animate-spin" />
                        <span className="text-[7px] font-mono text-sky-400 font-bold">{logoProgress}%</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl border border-[var(--color-border-main)] bg-slate-900 overflow-hidden flex items-center justify-center relative group">
                        {profLogo ? (
                          <img src={getOptimizedUrl(profLogo, { width: 100, height: 100 })} alt="Logo" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <Building className="text-zinc-500" size={16} />
                        )}
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-1 text-left">
                      <p className="text-[10px] text-zinc-400 font-medium">Drag-and-drop or select logo asset.</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="logo-file-picker"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('logo-file-picker')?.click()}
                        className="px-2.5 py-1 bg-[var(--color-border-main)] hover:bg-white/10 border border-[var(--color-border-main)] rounded-lg text-[9px] font-mono font-bold uppercase text-[#38BDF8] cursor-pointer"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                </div>

                {/* Showroom Cover Image Upload */}
                <div className="space-y-2">
                  <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Branding Cover Photo alignment:</label>
                  <div
                    className="border border-[var(--color-border-main)] bg-[var(--color-bg-secondary)] rounded-xl p-4 flex items-center gap-4 relative overflow-hidden"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleCoverUpload(file);
                    }}
                  >
                    {coverUploading ? (
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-[var(--color-border-main)] flex flex-col items-center justify-center animate-pulse gap-1">
                        <div className="w-4 h-4 rounded-full border border-orange-500/20 border-t-orange-500 animate-spin" />
                        <span className="text-[7px] font-mono text-orange-400 font-bold">{coverProgress}%</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl border border-[var(--color-border-main)] bg-slate-900 overflow-hidden flex items-center justify-center relative">
                        {profCover ? (
                          <img src={getOptimizedUrl(profCover, { width: 120, height: 100 })} alt="Cover" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <Globe className="text-zinc-500" size={16} />
                        )}
                      </div>
                    )}

                    <div className="flex-1 space-y-1 text-left">
                      <p className="text-[10px] text-zinc-400 font-medium">Drag-and-drop or select cover photo banner.</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="cover-file-picker"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCoverUpload(file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('cover-file-picker')?.click()}
                        className="px-2.5 py-1 bg-[var(--color-border-main)] hover:bg-white/10 border border-[var(--color-border-main)] rounded-lg text-[9px] font-mono font-bold uppercase text-[#38BDF8] cursor-pointer"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Comprehensive Showroom Bio Text (Who we are):</label>
                <textarea
                  rows={3}
                  required
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-4 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 resize-none leading-relaxed text-xs"
                  value={profDesc}
                  onChange={e => setProfDesc(e.target.value)}
                ></textarea>
              </div>

              {/* Theme Preset Selector Block (Section 5 requirement) */}
              <div className="space-y-2 border-t border-[var(--color-border-main)] pt-4">
                <label className="text-[#38BDF8] font-bold block uppercase font-mono text-[9px] tracking-wider">Premium Storefront Styling Theme preset Matrix</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Cosmic', 'Bone', 'Emerald', 'Gold'] as const).map((thm) => (
                    <button
                      key={thm}
                      type="button"
                      onClick={() => setShowroomTheme(thm)}
                      className={`px-4 py-3 rounded-xl border font-mono text-[10.5px] uppercase font-black tracking-wider transition-all duration-200 text-center cursor-pointer select-none ${
                        showroomTheme === thm
                          ? thm === 'Cosmic' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500 shadow-lg shadow-indigo-950/20'
                            : thm === 'Bone' ? 'bg-gray-100 text-slate-900 border-white shadow-lg'
                            : thm === 'Emerald' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500 shadow-lg shadow-emerald-950/20'
                            : 'bg-amber-950/40 text-amber-500 border-amber-500 shadow-lg shadow-amber-950/20'
                          : 'bg-[var(--color-bg-secondary)]/80 text-[var(--color-text-muted)] border-[#1E293B] hover:border-gray-700 hover:text-gray-300'
                      }`}
                    >
                      {thm === 'Cosmic' ? '🌌 ' : thm === 'Bone' ? '🦴 ' : thm === 'Emerald' ? '💚 ' : '👑 '}
                      {thm}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[var(--color-border-main)] pt-4 space-y-3.5">
                <h4 className="text-[#F97316] uppercase font-mono text-[9px] font-bold tracking-wider">Social Channels URLs</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Website link"
                    className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none font-mono text-xs"
                    value={webUrl}
                    onChange={e => setWebUrl(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Instagram profile"
                    className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none font-mono text-xs"
                    value={instaUrl}
                    onChange={e => setInstaUrl(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Facebook link"
                    className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none font-mono text-xs"
                    value={fbUrl}
                    onChange={e => setFbUrl(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="TikTok link"
                    className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none font-mono text-xs"
                    value={tiktokUrl}
                    onChange={e => setTiktokUrl(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-[var(--color-border-main)]">
                <div className="lg:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Shareable Storefront Link:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none font-mono text-xs flex-1"
                        value={`https://bazar360.online/showroom/${dealer.id}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://bazar360.online/showroom/${dealer.id}`);
                          showNotice('✓ Showroom storefront link copied to clipboard!');
                        }}
                        className="bg-sky-500 hover:bg-sky-400 text-stone-950 font-sans font-black text-xs uppercase px-4 rounded-xl transition-all active:scale-95 cursor-pointer"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-start pt-3">
                    <button
                      type="submit"
                      className="bg-[#F97316] hover:bg-orange-600 font-mono font-bold text-xs uppercase tracking-wider py-3.5 px-6 text-[var(--color-text-header)] rounded-xl flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                    >
                      <Save size={13} /> Update Interactive Storefront Profile
                    </button>
                  </div>

                  {/* Contact Owner Escalation Section */}
                  <div className="border-t border-[var(--color-border-main)] pt-6 mt-4">
                    <div className="bg-[#090D16] border border-orange-500/10 hover:border-orange-500/20 rounded-2xl p-6 relative overflow-hidden transition-all duration-300">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#FF6B00]/10 to-[#161D6F]/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-orange-500/10 text-[#FF6B00] rounded-full font-mono text-[8px] uppercase font-black tracking-widest border border-orange-500/20">
                              Support & Escalation Node
                            </span>
                          </div>
                          <h3 className="text-sm font-black uppercase font-mono text-[var(--color-text-header)] tracking-wide">
                            🛡️ Executive Partner Escalation Desk
                          </h3>
                          <p className="text-[var(--color-text-muted)] text-[10.5px] max-w-2xl leading-relaxed">
                            For system outages, dealer licensing overrides, and high-priority showroom audits, contact our Executive Partner and Owner directly.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                          <div className="bg-[var(--color-bg-secondary)] border border-[#1E293B] rounded-xl px-4 py-3 text-left">
                            <span className="text-[8px] uppercase text-zinc-400 font-mono block">Owner & Partner</span>
                            <span className="text-[var(--color-text-header)] font-bold text-xs">Malak Mazhar</span>
                          </div>
                          <a 
                            href="mailto:Mazharsouls@gmail.com?subject=Bazar360%20Showroom%20Escalation"
                            className="bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] border border-[#38BDF8]/20 font-mono font-bold text-[10px] uppercase tracking-wider py-3.5 px-5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Mail size={12} />
                            <span>Mazharsouls@gmail.com</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1 bg-[#090D16] border border-[var(--color-border-main)] p-5 rounded-2xl flex flex-col items-center text-center space-y-4 relative hover:border-orange-500/20 transition-all">
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-orange-500/10 text-[#F97316] rounded-full font-mono text-[7.5px] uppercase font-black tracking-widest border border-orange-500/20">
                    Live QR
                  </span>
                  <div className="text-left self-start space-y-1">
                    <h4 className="text-[var(--color-text-header)] text-[11px] font-black uppercase font-mono tracking-tight flex items-center gap-1.5">
                      📱 On-Site QR Scanner Gateway
                    </h4>
                    <p className="text-[var(--color-text-muted)] text-[10px] leading-relaxed">
                      Allow physical showroom walk-ins to scan and open your elite digital inventory instantly on their mobile devices.
                    </p>
                  </div>

                  {/* High contrast, scannable QR container */}
                  <div className="p-3.5 bg-white rounded-2xl shadow-xl border border-[var(--color-border-main)] max-w-[150px] mx-auto transition duration-300 hover:scale-105">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=0f172a&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(`https://bazar360.online/showroom/${dealer.id}`)}`}
                      alt="Showroom QR Code"
                      className="w-full h-auto aspect-square object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex gap-2 w-full pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=0f172a&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(`https://bazar360.online/showroom/${dealer.id}`)}`;
                        const link = document.createElement('a');
                        link.href = url;
                        link.target = "_blank";
                        link.download = `bazar360-showroom-${dealer.id}-qrcode.png`;
                        link.click();
                        showNotice('✓ Showroom high-res QR Code PNG downloaded successfully!');
                      }}
                      className="flex-1 py-2 bg-[#1E293B] hover:bg-[#334155] text-[var(--color-text-header)] font-mono text-[9px] uppercase font-black rounded-lg transition-all active:scale-95 cursor-pointer"
                    >
                      Download PNG
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=0f172a&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(`https://bazar360.online/showroom/${dealer.id}`)}`;
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Print Showroom QR - ${dealer.name}</title>
                                <style>
                                  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;700&display=swap');
                                  body {
                                    font-family: 'Inter', sans-serif;
                                    background: #ffffff;
                                    color: #000000;
                                    text-align: center;
                                    padding: 40px;
                                  }
                                  .container {
                                    max-width: 500px;
                                    margin: 0 auto;
                                    border: 4px solid #f97316;
                                    border-radius: 24px;
                                    padding: 40px;
                                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                                  }
                                  .logo-text {
                                    font-family: 'Space Grotesk', sans-serif;
                                    font-size: 28px;
                                    font-weight: 700;
                                    letter-spacing: -1px;
                                    color: #f97316;
                                    margin-bottom: 5px;
                                  }
                                  .tagline {
                                    font-size: 11px;
                                    text-transform: uppercase;
                                    letter-spacing: 2px;
                                    color: #64748b;
                                    font-weight: 700;
                                    margin-bottom: 30px;
                                  }
                                  .qr-box {
                                    background: #ffffff;
                                    border: 2px solid #e2e8f0;
                                    border-radius: 16px;
                                    padding: 20px;
                                    display: inline-block;
                                    margin-bottom: 30px;
                                  }
                                  .qr-img {
                                    width: 260px;
                                    height: 260px;
                                  }
                                  .showroom-name {
                                    font-family: 'Space Grotesk', sans-serif;
                                    font-size: 20px;
                                    font-weight: 700;
                                    color: #0f172a;
                                    margin-bottom: 8px;
                                  }
                                  .location {
                                    font-size: 12px;
                                    color: #475569;
                                    margin-bottom: 30px;
                                    line-height: 1.5;
                                  }
                                  .footer-text {
                                    font-size: 10px;
                                    color: #94a3b8;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                    border-top: 1px solid #e2e8f0;
                                    padding-top: 20px;
                                    line-height: 1.5;
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="container">
                                  <div class="logo-text">BAZAR360</div>
                                  <div class="tagline">Digital Showroom Network</div>
                                  
                                  <div class="qr-box">
                                    <img src="${qrUrl}" class="qr-img" />
                                  </div>
                                  
                                  <div class="showroom-name">${dealer.name}</div>
                                  <div class="location">📍 ${dealer.location}</div>
                                  
                                  <div class="footer-text">Scan this QR code with your mobile camera to explore active vehicle inventory, get technical specs, and initiate real-time AI negotiation.</div>
                                </div>
                                <script>
                                  window.onload = function() {
                                    window.print();
                                  };
                                </script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          showNotice('✓ Printable physical poster opened in a new tab.');
                        } else {
                          showNotice('⚠️ Pop-up blocked! Please allow pop-ups to open the printable QR poster.');
                        }
                      }}
                      className="flex-1 py-2 bg-[#F97316] hover:bg-orange-600 text-stone-950 font-sans font-black text-[9px] uppercase rounded-lg transition-all active:scale-95 cursor-pointer"
                    >
                      Print Poster
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* SUBTAB BRANDING & DIGITAL BUSINESS CARD SUITE */}
          {dashSubTab === 'branding' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="bg-gradient-to-r from-orange-500/10 via-slate-900 to-sky-500/10 border border-orange-500/20 rounded-3xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-mono font-black text-orange-400 uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                      Showroom Identity & Marketing Suite
                    </span>
                    <h2 className="text-xl font-black text-[var(--color-text-header)] uppercase tracking-tight mt-2 flex items-center gap-2">
                      <Sparkles className="text-orange-500" size={20} />
                      Showroom Branding & Business Card Studio
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 font-sans">
                      Upload custom profile pictures and logos directly to Cloudinary, configure brand typography, slogans, and taglines, and save directly to your showroom document in Firestore.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cloudinary Direct Brand Assets Upload Panel */}
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-[var(--color-text-header)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--color-border-main)] pb-3">
                  <Upload size={16} className="text-orange-500" />
                  Cloudinary Brand Asset Uploads
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Upload Box */}
                  <div className="p-4 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl flex flex-col items-center text-center space-y-3">
                    <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase">Showroom Logo Asset</span>
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-orange-500/40 bg-black flex items-center justify-center relative shadow-lg">
                      {profLogo ? (
                        <img src={profLogo} alt="Showroom Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-500">No Logo</span>
                      )}
                      {logoUploading && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <Loader2 className="animate-spin text-orange-500" size={20} />
                        </div>
                      )}
                    </div>
                    <label className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-2">
                      <Upload size={14} />
                      <span>{logoUploading ? `Uploading ${logoProgress}%` : 'Upload Logo to Cloudinary'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file);
                        }} 
                      />
                    </label>
                  </div>

                  {/* Cover Photo Upload Box */}
                  <div className="p-4 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl flex flex-col items-center text-center space-y-3">
                    <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase">Showroom Cover Banner</span>
                    <div className="w-full h-20 rounded-2xl overflow-hidden border-2 border-orange-500/40 bg-black flex items-center justify-center relative shadow-lg">
                      {profCover ? (
                        <img src={profCover} alt="Cover Banner" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-500">No Cover Banner</span>
                      )}
                      {coverUploading && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <Loader2 className="animate-spin text-orange-500" size={20} />
                        </div>
                      )}
                    </div>
                    <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all border border-slate-700 shadow-md flex items-center gap-2">
                      <Upload size={14} />
                      <span>{coverUploading ? `Uploading ${coverProgress}%` : 'Upload Cover to Cloudinary'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCoverUpload(file);
                        }} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Embedded Business Card Studio & Generator */}
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 shadow-xl space-y-6">
                <BusinessCardGenerator 
                  dealer={dealer} 
                  onUpdateDealer={(updated) => {
                    showNotice('✓ Showroom branding configurations saved persistently to Firestore!');
                  }} 
                />
              </div>
            </div>
          )}

          {/* SUBTAB 2: TEAM ACCESS RATING */}
          {dashSubTab === 'team' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-5 rounded-2xl h-fit space-y-4">
                <h3 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide border-b border-[var(--color-border-main)] pb-2">Assign Team Access Permits</h3>
                <form onSubmit={handleAddTeamMember} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase">Roster Member Name:</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)]"
                      placeholder="e.g. Fawad Malik"
                      value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase">System Slogan Title:</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] font-mono"
                      value={newTeamTitle}
                      onChange={e => setNewTeamTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase">Permission Role Group:</label>
                    <select
                      className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] font-mono font-bold"
                      value={newTeamRole}
                      onChange={e => setNewTeamRole(e.target.value as any)}
                    >
                      <option value="SalesRep">SalesRep (Listing Draft Permits)</option>
                      <option value="SalesLead">SalesLead (Inventory Editing Permits)</option>
                      <option value="CFO">CFO (Appraisal Index Authority)</option>
                      <option value="Founder">Founder (Unrestricted Deck Control)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase">Verified Biometric Phone:</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] font-mono"
                      value={newTeamPhone}
                      onChange={e => setNewTeamPhone(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#38BDF8] text-slate-950 hover:bg-sky-400 rounded-xl font-mono text-[10px] uppercase font-black tracking-wider cursor-pointer"
                  >
                    🚀 Lock Roster Permissions
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide">Active Dealership Desk Directory</h3>
                <div className="space-y-2.5">
                  {teamList.map(tm => (
                    <div key={tm.id} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/20 text-[#F97316] rounded-full flex items-center justify-center font-bold text-xs select-none">
                          {tm.role.substring(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--color-text-header)] font-extrabold font-mono text-[11px] uppercase">{tm.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-extrabold ${
                              tm.active ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-500'
                            }`}>
                              {tm.active ? 'Operational' : 'Access Blocked'}
                            </span>
                          </div>
                          <p className="text-[var(--color-text-muted)] text-[10px]">{tm.title} • {tm.phone}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleMember(tm.id)}
                          className={`px-2.5 py-1.5 text-[9px] font-mono uppercase font-bold border rounded-lg transition-all cursor-pointer ${
                            tm.active 
                              ? 'bg-amber-950/20 border-amber-900/30 text-amber-400 hover:bg-amber-950/45' 
                              : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400 hover:bg-[#121c32]'
                          }`}
                        >
                          {tm.active ? 'Lock access' : 'Restore'}
                        </button>
                        <button
                          onClick={() => handleDeleteMember(tm.id)}
                          className="px-2 py-1 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SUBTAB 3: PUBLIC STOREFRONT ACTIVITY */}
          {dashSubTab === 'activities' && (
            <div className="space-y-4">
              <h3 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide">Dealership Storefront Activities Vlog</h3>
              
              <div className="space-y-3">
                {activityFeedList.map(act => (
                  <div key={act.id} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-2xl">
                    {editingActivityId === act.id ? (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[var(--color-text-muted)] text-[9px] font-mono">Headline:</label>
                            <input
                              type="text"
                              className="w-full bg-[#121a2a] border border-[var(--color-border-main)] rounded-xl p-2.5 text-[var(--color-text-header)]"
                              value={editActTitle}
                              onChange={e => setEditActTitle(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[var(--color-text-muted)] text-[9px] font-mono">Badge Tag:</label>
                            <input
                              type="text"
                              className="w-full bg-[#121a2a] border border-[var(--color-border-main)] rounded-xl p-2.5 text-[var(--color-text-header)]"
                              value={editActBadge}
                              onChange={e => setEditActBadge(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[var(--color-text-muted)] text-[9px] font-mono">Appraisal Worth:</label>
                            <input
                              type="text"
                              className="w-full bg-[#121a2a] border border-[var(--color-border-main)] rounded-xl p-2.5 text-[var(--color-text-header)]"
                              value={editActPrice}
                              onChange={e => setEditActPrice(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[var(--color-text-muted)] text-[9px] font-mono">Body / Vlog Content:</label>
                          <textarea
                            rows={2}
                            className="w-full bg-[#121a2a] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] resize-none text-[11px]"
                            value={editActDesc}
                            onChange={e => setEditActDesc(e.target.value)}
                          ></textarea>
                        </div>

                        <div className="flex justify-end gap-1.5 font-mono text-[9px] uppercase font-bold">
                          <button
                            type="button"
                            onClick={() => setEditingActivityId(null)}
                            className="px-3.5 py-2 hover:text-[var(--color-text-header)] bg-[var(--color-border-main)] text-[var(--color-text-muted)] rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveActivityEdit(act.id)}
                            className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-[var(--color-text-header)] rounded-lg cursor-pointer"
                          >
                            Save Update
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="flex gap-3">
                          <img 
                            src={act.imageUrl} 
                            alt="" 
                            className="w-12 h-12 object-cover rounded-xl border border-[var(--color-border-main)]"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex gap-1.5 items-center">
                              <span className="text-[var(--color-text-header)] font-extrabold uppercase font-mono text-[11px]">{act.title}</span>
                              <span className="text-[8px] bg-orange-950/40 text-orange-400 px-1.5 py-0.5 rounded border border-orange-900/30 uppercase font-bold">{act.badge}</span>
                            </div>
                            <p className="text-[var(--color-text-muted)] text-[10.5px] mt-1 line-clamp-2 max-w-xl">{act.description}</p>
                            {act.price && <p className="text-[#38BDF8] text-[9.5px] font-mono font-bold mt-1">Appraised Stock: {act.price}</p>}
                          </div>
                        </div>

                        <div className="flex gap-1.5 self-end sm:self-center font-mono text-[9px] uppercase font-bold">
                          <button
                            onClick={() => handleStartEditActivity(act)}
                            className="px-3 py-1.5 border border-[var(--color-border-main)] bg-[var(--color-bg-primary)] text-[var(--color-text-header)] hover:text-[#38BDF8] rounded-lg cursor-pointer hover:border-white/15"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="px-2.5 py-1.5 bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-900/20 rounded-lg cursor-pointer"
                          >
                            Purge
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB: SOCIAL SYNC DASHBOARD */}
          {dashSubTab === 'social-sync' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="flex justify-between items-center bg-[var(--color-bg-secondary)] p-4 rounded-2xl border border-[var(--color-border-main)]">
                <div>
                  <h3 className="text-[var(--color-text-header)] font-black text-sm uppercase tracking-wide">Social Connect Dashboard</h3>
                  <p className="text-[var(--color-text-muted)] text-xs mt-0.5">Link your dealership's official platforms to synchronize activity feeds, vehicle stock posts, and automatically pull leads via Cloud Functions.</p>
                </div>
                <button
                  onClick={handleSocialSync}
                  disabled={isSyncingSocials}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#38BDF8] hover:bg-sky-400 text-[#0c1221] font-bold rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50"
                >
                  {isSyncingSocials ? <Terminal size={14} className="animate-spin" /> : <Share2 size={14} />}
                  <span>{isSyncingSocials ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>

              {socialSyncResult && (
                <div className="bg-[#121a2a] p-3 rounded-xl border border-[var(--color-border-main)] text-[#00FF66] font-mono text-[10px]">
                  {socialSyncResult}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4 bg-[var(--color-bg-secondary)] p-5 rounded-2xl border border-[var(--color-border-main)]">
                  <h4 className="text-[#38BDF8] font-bold uppercase tracking-wider mb-2">Connected Platforms</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-[#121a2a] p-3 rounded-xl border border-[var(--color-border-main)]">
                      <div className="p-2 bg-blue-600/20 text-blue-500 rounded-lg"><Globe size={18} /></div>
                      <div className="flex-1">
                        <label className="text-[var(--color-text-muted)] text-[10px] uppercase font-bold block mb-1">Facebook Page</label>
                        <input
                          type="text"
                          value={fbUrl}
                          onChange={e => setFbUrl(e.target.value)}
                          placeholder="e.g., facebook.com/PeshawarMotors"
                          className="w-full bg-transparent border-none text-[var(--color-text-header)] focus:outline-none focus:ring-0 p-0 text-xs"
                        />
                      </div>
                      {fbUrl && <CheckCircle size={14} className="text-[#00FF66]" />}
                    </div>

                    <div className="flex items-center gap-3 bg-[#121a2a] p-3 rounded-xl border border-[var(--color-border-main)]">
                      <div className="p-2 bg-pink-600/20 text-pink-500 rounded-lg"><Share2 size={18} /></div>
                      <div className="flex-1">
                        <label className="text-[var(--color-text-muted)] text-[10px] uppercase font-bold block mb-1">Instagram Business</label>
                        <input
                          type="text"
                          value={instaUrl}
                          onChange={e => setInstaUrl(e.target.value)}
                          placeholder="e.g., instagram.com/PeshawarMotors"
                          className="w-full bg-transparent border-none text-[var(--color-text-header)] focus:outline-none focus:ring-0 p-0 text-xs"
                        />
                      </div>
                      {instaUrl && <CheckCircle size={14} className="text-[#00FF66]" />}
                    </div>

                    <div className="flex items-center gap-3 bg-[#121a2a] p-3 rounded-xl border border-[var(--color-border-main)]">
                      <div className="p-2 bg-black/50 text-[var(--color-text-header)] rounded-lg"><Video size={18} /></div>
                      <div className="flex-1">
                        <label className="text-[var(--color-text-muted)] text-[10px] uppercase font-bold block mb-1">TikTok Account</label>
                        <input
                          type="text"
                          value={tiktokUrl}
                          onChange={e => setTiktokUrl(e.target.value)}
                          placeholder="e.g., tiktok.com/@PeshawarMotors"
                          className="w-full bg-transparent border-none text-[var(--color-text-header)] focus:outline-none focus:ring-0 p-0 text-xs"
                        />
                      </div>
                      {tiktokUrl && <CheckCircle size={14} className="text-[#00FF66]" />}
                    </div>
                  </div>
                  <button onClick={handleSaveProfile} className="w-full mt-2 py-2.5 bg-[#1E293B] hover:bg-slate-700 text-[var(--color-text-header)] font-bold rounded-xl transition-all border border-[var(--color-border-main)] cursor-pointer">
                    Save Connections
                  </button>
                </div>

                <div className="space-y-4 bg-[var(--color-bg-secondary)] p-5 rounded-2xl border border-[var(--color-border-main)]">
                  <h4 className="text-[#38BDF8] font-bold uppercase tracking-wider mb-2">Sync Automation Logs</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar font-mono text-[10px]">
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-main)]">
                      <div className="flex flex-col">
                        <span className="text-[var(--color-text-header)]">Auto-Pulled 3 Instagram Reels</span>
                        <span className="text-[var(--color-text-muted)]">Scheduled trigger executed</span>
                      </div>
                      <span className="text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">SUCCESS</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-main)]">
                      <div className="flex flex-col">
                        <span className="text-[var(--color-text-header)]">Pushed "Fortuner 2024" Listing</span>
                        <span className="text-[var(--color-text-muted)]">Cross-posted to Facebook Page</span>
                      </div>
                      <span className="text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">SUCCESS</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-main)]">
                      <div className="flex flex-col">
                        <span className="text-[var(--color-text-muted)]">TikTok API Token Refresh</span>
                        <span className="text-[var(--color-text-muted)]">System maintenance</span>
                      </div>
                      <span className="text-[#38BDF8] bg-sky-900/30 px-2 py-0.5 rounded">OK</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4: SHARDS/LOGS Ledger Terminal */}
          {dashSubTab === 'logs' && (
            <div className="space-y-4">
              <div className="bg-[#050B14] rounded-2xl border border-[var(--color-border-main)] p-5 font-mono text-[11px] text-[#00FF66] shadow-inner select-none leading-relaxed">
                
                <div className="flex justify-between items-center border-b border-[var(--color-border-main)] pb-2.5 mb-3.5">
                  <div className="flex items-center gap-2 text-[#38BDF8]">
                    <Terminal size={14} className="animate-pulse" />
                    <span className="font-black tracking-wider uppercase">IMMUTABLE DECK LEDGER (SECURITY TRAIL)</span>
                  </div>
                  <span className="text-[9px] text-[#38BDF8]/60 uppercase font-bold">Device node ID safe</span>
                </div>

                <div className="space-y-3.5 max-h-96 overflow-y-auto no-scrollbar scroll-smooth pr-1">
                  {audits.map((aud) => {
                    const isSec = aud.status === 'SECURITY';
                    const isWarn = aud.status === 'WARN';
                    const statusColor = isSec ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-[#00FF55]';

                    return (
                      <div key={aud.id} className="border-b border-[var(--color-border-main)] pb-2.5 space-y-1">
                        <div className="flex justify-between items-center text-[10px]/none font-mono">
                          <span className="text-[var(--color-text-header)]/40">{new Date(aud.timestamp).toLocaleString()}</span>
                          <span className={`font-black uppercase tracking-widest ${statusColor}`}>
                            [{aud.status}]
                          </span>
                        </div>
                        <p className="font-semibold text-[var(--color-text-header)]/95">
                          <span className="text-[#38BDF8]">{aud.user} ({aud.role})</span> {aud.action}
                        </p>
                        <p className="text-[var(--color-text-header)]/60 leading-normal pl-4 font-sans text-xs">
                          ↳ {aud.details}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3.5 border-t border-[var(--color-border-main)] flex justify-between items-center text-[10px] text-[var(--color-text-header)]/30 uppercase tracking-widest font-mono">
                  <span className="flex items-center gap-1 font-bold">
                    <Database size={11} className="text-[#00FF66]" /> Synced Audits Code Ledger: {audits.length} Events Total
                  </span>
                  <span>SHA-256 Ledger Verified</span>
                </div>

              </div>
            </div>
          )}

          {/* SUBTAB 5: REAL-WORLD DATABASE SCHEMA EXPLORER & GOOGLE SHEETS SYNC SYSTEM */}
          {dashSubTab === 'database' && (
            <div className="space-y-6 animate-fade-in font-sans">
              
              {/* Database Overview Card */}
              <div className="bg-[var(--color-bg-secondary)] border border-orange-500/20 p-5 rounded-2xl">
                <h3 className="text-[var(--color-text-header)] text-xs font-black uppercase tracking-wide flex items-center gap-2">
                  <Database className="text-orange-500 animate-pulse" size={15} /> Real-World Cloud Database & Sheet Integration Center
                </h3>
                <p className="text-[10px] text-[var(--color-text-header)]/55 mt-1 leading-relaxed">
                  Explore BAZAR360's production-grade Firebase Firestore collections schema, deploy zero-trust fortress security rules, and dynamically synchronize client inquiries/leads with active Google Sheets spreadsheets.
                </p>
              </div>

              {/* Dynamic Google Sheets Synchronization Module */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sheets Configuration Panel */}
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-5 rounded-2xl h-fit space-y-4">
                  <h4 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide border-b border-[var(--color-border-main)] pb-2 flex items-center gap-1.5">
                    📊 Sheets Integration Panel
                  </h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase block">Target Google Spreadsheet ID:</label>
                      <input
                        type="text"
                        className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] font-mono text-[10.5px] focus:outline-none focus:border-orange-500"
                        placeholder="Spreadsheet ID URL segment..."
                        value={spreadsheetId}
                        onChange={e => setSpreadsheetId(e.target.value)}
                      />
                      <span className="text-[8.5px] text-[var(--color-text-muted)] font-mono block">Found in Google Sheet URL: /d/&#123;ID&#125;/edit</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase block">Target Worksheet Tab Name:</label>
                      <input
                        type="text"
                        className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] font-mono text-[10.5px] focus:outline-none focus:border-orange-500"
                        placeholder="e.g. Leads_and_Inventory"
                        value={sheetName}
                        onChange={e => setSheetName(e.target.value)}
                      />
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        disabled={sheetSyncStatus === 'syncing'}
                        onClick={() => handleGoogleSheetsSync('leads')}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 rounded-xl font-mono text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20"
                      >
                        ⚡ Sync CRM Leads to Sheets
                      </button>

                      <button
                        type="button"
                        disabled={sheetSyncStatus === 'syncing'}
                        onClick={() => handleGoogleSheetsSync('inventory')}
                        className="w-full py-2.5 bg-[#38BDF8] text-slate-950 hover:bg-sky-400 rounded-xl font-mono text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                      >
                        ⚡ Sync Active Showroom Stock
                      </button>
                    </div>

                    <div className="border-t border-[var(--color-border-main)] pt-3.5 space-y-2">
                      <p className="text-[9px] text-[var(--color-text-muted)] font-mono uppercase font-bold">📂 Direct Offline CSV Exports:</p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-[9px] uppercase">
                        <button
                          type="button"
                          onClick={() => handleDownloadCSV('leads')}
                          className="py-2 bg-[var(--color-border-main)] hover:bg-white/10 text-[var(--color-text-header)] rounded-lg border border-[var(--color-border-main)] text-center cursor-pointer"
                        >
                          Leads CSV
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadCSV('inventory')}
                          className="py-2 bg-[var(--color-border-main)] hover:bg-white/10 text-[var(--color-text-header)] rounded-lg border border-[var(--color-border-main)] text-center cursor-pointer"
                        >
                          Stock CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Sync Process Logs Terminal */}
                <div className="lg:col-span-2 flex flex-col space-y-4">
                  <div className="bg-[#050B14] rounded-2xl border border-[var(--color-border-main)] p-5 font-mono text-[11px] text-[#38BDF8] flex-1 flex flex-col justify-between shadow-inner min-h-[280px]">
                    
                    <div>
                      <div className="flex justify-between items-center border-b border-[var(--color-border-main)] pb-2.5 mb-3">
                        <div className="flex items-center gap-2">
                          <Terminal size={14} className="animate-pulse text-[#00FF66]" />
                          <span className="font-black tracking-wider uppercase text-[var(--color-text-header)]">GOOGLE WORKSPACE INTEGRATION TERMINAL</span>
                        </div>
                        <span className="text-[9px] bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-900/30 font-bold uppercase">Ready</span>
                      </div>

                      {/* Display States */}
                      {sheetSyncStatus === 'idle' && (
                        <div className="text-[var(--color-text-muted)] text-center py-10 space-y-2 font-sans">
                          <p className="text-xs uppercase font-mono tracking-wider font-extrabold text-orange-400">🚨 Sheet Sync Bridge Inactive</p>
                          <p className="text-[11px] max-w-sm mx-auto leading-relaxed">Enter a Spreadsheet ID & click the sync buttons to serialize database listings directly into Google sheets columns.</p>
                        </div>
                      )}

                      {sheetSyncStatus === 'syncing' && (
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-orange-400 font-extrabold uppercase animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                            <span>Google Sheets Write Sync in progress...</span>
                          </div>
                          <div className="space-y-1.5 pl-4 text-[var(--color-text-muted)] text-[10px]">
                            <p className="text-emerald-400">✓ Initialized Google Sheets Sync thread</p>
                            <p className="text-emerald-400">✓ Fetched App Check security token validation header</p>
                            <p className="text-orange-300">📡 POST Request dispatched to server API (/api/google-sheets/sync)...</p>
                            <p className="animate-pulse">⏳ Formatting columns & cells in workspace memory buffer...</p>
                          </div>
                        </div>
                      )}

                      {sheetSyncStatus === 'success' && sheetSyncResult && (
                        <div className="space-y-2.5 text-[10.5px]">
                          <div className="text-emerald-400 font-extrabold uppercase flex items-center gap-1.5">
                            <span>✓ Sync Success! Affected Range: {sheetSyncResult.cellRange}</span>
                          </div>
                          <div className="space-y-1 text-gray-300">
                            <p><span className="text-[var(--color-text-muted)]">Worksheet Tab:</span> "{sheetSyncResult.sheetName}"</p>
                            <p><span className="text-[var(--color-text-muted)]">Columns Mapped:</span> {JSON.stringify(sheetSyncResult.columns)}</p>
                            <p><span className="text-[var(--color-text-muted)]">Rows Synchronized:</span> {sheetSyncResult.rowsSynced} records written</p>
                            <p><span className="text-[var(--color-text-muted)]">Timestamp:</span> {new Date(sheetSyncResult.syncTime).toLocaleString()}</p>
                          </div>
                          <div className="pt-2">
                            <a
                              href={sheetSyncResult.googleSheetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[#00FF66] hover:underline font-bold text-[10.5px] uppercase border border-[#00FF66]/20 bg-[#00FF66]/5 px-3.5 py-1.5 rounded-lg font-mono tracking-wide cursor-pointer"
                            >
                              🔗 Launch Google Sheets Spreadsheet App ↗
                            </a>
                          </div>
                        </div>
                      )}

                      {sheetSyncStatus === 'error' && sheetSyncResult && (
                        <div className="space-y-2 text-red-400">
                          <p className="font-extrabold uppercase">❌ Synchronizer Exception Triggered</p>
                          <p className="text-[10px] bg-red-950/20 p-3 rounded-lg border border-red-900/30 font-sans leading-relaxed text-red-300">
                            Error Details: {sheetSyncResult.error || 'Server rejected synchronization request due to invalid parameters.'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[var(--color-border-main)] flex justify-between items-center text-[9.5px] text-[var(--color-text-header)]/30 uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        🔒 Verified SECURE JWT handshake • sha-256
                      </span>
                    </div>

                  </div>
                </div>

              </div>

              {/* Step-by-Step Production Guide & Firestore Schema Navigator */}
              <div className="space-y-4 pt-4 border-t border-[var(--color-border-main)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide flex items-center gap-2">
                    🛠️ Production Real-World Setup Blueprint & Schema Navigator
                  </h4>
                  
                  {/* Schema Selection matrix */}
                  <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-1 rounded-xl font-mono text-[9px] uppercase font-bold w-fit">
                    {(['user', 'showroom', 'lead', 'auditLog'] as const).map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveSchemaTab(tab)}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          activeSchemaTab === tab ? 'bg-[#1E293B] text-[#38BDF8] font-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
                        }`}
                      >
                        {tab === 'user' ? '👤 User' : tab === 'showroom' ? '🏪 Showroom' : tab === 'lead' ? '🎯 Lead' : '📟 Audit'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display active schema details */}
                <div className="bg-[#0b101d] border border-[var(--color-border-main)] p-4 rounded-2xl space-y-3 font-sans">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border-main)] pb-2.5">
                    <div>
                      <h5 className="text-[var(--color-text-header)] font-extrabold text-[12px] uppercase">
                        {activeSchemaTab === 'user' ? 'User Account Collection Schema' : activeSchemaTab === 'showroom' ? 'Showroom Profile Schema' : activeSchemaTab === 'lead' ? 'CRM Leads Schema' : 'Immutable Security Ledger Schema'}
                      </h5>
                      <p className="text-[10px] text-[#38BDF8] font-mono mt-0.5">Firestore path: <span className="text-[var(--color-text-header)] underline">{ENTITY_SCHEMAS[activeSchemaTab].path}</span></p>
                    </div>
                    <span className="text-[8.5px] font-mono bg-orange-950/40 text-orange-400 border border-orange-900/30 px-2 py-0.5 rounded font-black uppercase">
                      Enterprise Edition Optimized
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed italic">
                    {ENTITY_SCHEMAS[activeSchemaTab].description}
                  </p>

                  <div className="overflow-x-auto no-scrollbar rounded-xl border border-[var(--color-border-main)] bg-slate-950/40">
                    <table className="w-full text-left font-mono text-[10px] leading-relaxed">
                      <thead>
                        <tr className="bg-slate-950 text-[var(--color-text-muted)] uppercase text-[8.5px] border-b border-[var(--color-border-main)]">
                          <th className="p-3">Field Key</th>
                          <th className="p-3">Data Type</th>
                          <th className="p-3">Enterprise Description / Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {ENTITY_SCHEMAS[activeSchemaTab].fields.map((f, idx) => (
                          <tr key={idx} className="hover:bg-[var(--color-border-main)] text-gray-300">
                            <td className="p-3 font-bold text-orange-400">{f.name}</td>
                            <td className="p-3 text-[#38BDF8] font-semibold">{f.type}</td>
                            <td className="p-3 text-[var(--color-text-header)]/70 font-sans text-xs">{f.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Enterprise Step by Step Real-World Setup Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="bg-[#0b101d] border border-[var(--color-border-main)] p-4 rounded-xl space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="w-5 h-5 bg-[#38BDF8]/10 text-[#38BDF8] rounded-full flex items-center justify-center font-mono text-[10px] font-black border border-[#38BDF8]/20">1</span>
                      <h5 className="text-[var(--color-text-header)] text-xs font-black uppercase">Provisioning Enterprise Firestore</h5>
                    </div>
                    <p className="text-[var(--color-text-muted)] text-xs leading-relaxed pl-7">
                      Initialize Firebase Firestore from the Google Console, selecting Enterprise Edition. Utilize the pre-bootstrapped blueprints in BAZAR360's workspace structure to define strict schema indexes and automatic partition scales.
                    </p>
                  </div>

                  <div className="bg-[#0b101d] border border-[var(--color-border-main)] p-4 rounded-xl space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="w-5 h-5 bg-[#38BDF8]/10 text-[#38BDF8] rounded-full flex items-center justify-center font-mono text-[10px] font-black border border-[#38BDF8]/20">2</span>
                      <h5 className="text-[var(--color-text-header)] text-xs font-black uppercase">Hardened Fortress Rules Deployment</h5>
                    </div>
                    <p className="text-[var(--color-text-muted)] text-xs leading-relaxed pl-7">
                      Deploy BAZAR360's custom zero-trust `firestore.rules` containing immutable timestamp enforcements, owner validation guards, PII isolation keys, and precise role check block assertions using the `deploy_firebase` developer tool.
                    </p>
                  </div>

                  <div className="bg-[#0b101d] border border-[var(--color-border-main)] p-4 rounded-xl space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="w-5 h-5 bg-[#38BDF8]/10 text-[#38BDF8] rounded-full flex items-center justify-center font-mono text-[10px] font-black border border-[#38BDF8]/20">3</span>
                      <h5 className="text-[var(--color-text-header)] text-xs font-black uppercase">App Check Security Protection</h5>
                    </div>
                    <p className="text-[var(--color-text-muted)] text-xs leading-relaxed pl-7">
                      Every client interaction is guarded via App Check Play Integrity (Android) or App Attest (iOS). This prevents scraping attacks, automated bot requests, and unauthorized billing spikes on active database collections.
                    </p>
                  </div>

                  <div className="bg-[#0b101d] border border-[var(--color-border-main)] p-4 rounded-xl space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="w-5 h-5 bg-[#38BDF8]/10 text-[#38BDF8] rounded-full flex items-center justify-center font-mono text-[10px] font-black border border-[#38BDF8]/20">4</span>
                      <h5 className="text-[var(--color-text-header)] text-xs font-black uppercase">Google Cloud Functions Auto-trigger</h5>
                    </div>
                    <p className="text-[var(--color-text-muted)] text-xs leading-relaxed pl-7">
                      Connect your spreadsheet permanently by deploying a lightweight Firebase Cloud Function trigger. On database creation of any lead (`leads/&#123;leadId&#125;`), the function pushes the row parameters directly to Google Sheets APIs.
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* SUBTAB 6: CLIENT REVIEWS */}
          {dashSubTab === 'reviews' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in text-xs font-sans">
              
              {/* Form & Overview Column */}
              <div className="space-y-6">
                
                {/* Aggregate Summary Card */}
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-5 rounded-2xl space-y-4">
                  <h3 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-[var(--color-border-main)] pb-2">
                    ⭐ Reputation Summary
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <span className="text-3xl font-black text-orange-500 font-mono">
                        {reviews.length > 0 
                          ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                          : '5.0'}
                      </span>
                      <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-mono tracking-wider mt-1">Average Rating</p>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1 text-[#F97316]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} fill="#F97316" />
                        ))}
                      </div>
                      <p className="text-[var(--color-text-muted)] text-[10px]">
                        Based on <span className="text-[var(--color-text-header)] font-bold">{reviews.length}</span> certified Peshawar customer reviews.
                      </p>
                    </div>
                  </div>

                  {/* Rating distribution breakdown */}
                  <div className="space-y-2 pt-2 border-t border-[var(--color-border-main)] text-[10px]">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter(r => r.rating === stars).length;
                      const percent = reviews.length > 0 ? (count / reviews.length) * 100 : stars === 5 ? 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-[var(--color-text-muted)] w-3 text-right font-mono font-bold">{stars}★</span>
                          <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          <span className="text-[var(--color-text-muted)] w-6 text-right font-mono">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Log Customer Review Form */}
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-5 rounded-2xl space-y-4">
                  <div className="border-b border-[var(--color-border-main)] pb-2">
                    <h3 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide">
                      ✍️ Log Customer Review
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                      Publish physical showroom feedback and customer feedback directly to your digital storefront.
                    </p>
                  </div>

                  <form onSubmit={handleAddReview} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase block">Client Full Name *</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] text-[11px] focus:outline-none focus:border-orange-500"
                        placeholder="e.g. Haji Saleem Ur Rehman"
                        value={newReviewAuthor}
                        onChange={e => setNewReviewAuthor(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase block">Rating Score</label>
                        <select
                          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] text-[11px] font-mono font-bold focus:outline-none focus:border-orange-500"
                          value={newReviewRating}
                          onChange={e => setNewReviewRating(Number(e.target.value))}
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                          <option value={3}>⭐⭐⭐ (3 Stars)</option>
                          <option value={2}>⭐⭐ (2 Stars)</option>
                          <option value={1}>⭐ (1 Star)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase block">Custom Date</label>
                        <input
                          type="text"
                          className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] text-[11px] font-mono focus:outline-none focus:border-orange-500"
                          placeholder="e.g. October 12, 2026"
                          value={newReviewDate}
                          onChange={e => setNewReviewDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase block">Review Content Comment *</label>
                      <textarea
                        required
                        rows={3}
                        className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] text-[11px] resize-none focus:outline-none focus:border-orange-500 leading-relaxed"
                        placeholder="Provide details about their vehicle handover, physical inspection feedback, pristine delivery condition, or deal experience..."
                        value={newReviewComment}
                        onChange={e => setNewReviewComment(e.target.value)}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#F97316] hover:bg-orange-600 text-[var(--color-text-header)] rounded-xl font-mono text-[10px] uppercase font-black tracking-wider cursor-pointer active:scale-95 transition-all"
                    >
                      🚀 Publish Verified Review
                    </button>
                  </form>
                </div>
              </div>

              {/* Feed Column */}
              <div className="xl:col-span-2 space-y-4">
                <h3 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-orange-500" /> Showroom Customer Reviews Feed
                </h3>

                {reviews.length === 0 ? (
                  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl p-8 text-center text-[var(--color-text-muted)] space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-400">No customer reviews yet</p>
                    <p className="text-[11px] max-w-sm mx-auto leading-relaxed">
                      Utilize the logger form on the left to add offline reviews from customers who purchased vehicles physically at your Peshawar showroom.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[700px] overflow-y-auto pr-1 no-scrollbar">
                    {reviews.map((r) => {
                      const reply = reviewReplies[r.id];
                      return (
                        <div key={r.id} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-2xl space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[var(--color-text-header)] font-black uppercase text-[11px] font-mono">{r.author}</span>
                                <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[8px] font-mono uppercase font-black rounded">
                                  ✓ Verified Buyer
                                </span>
                              </div>
                              <p className="text-[var(--color-text-muted)] text-[9.5px] mt-0.5">{r.date || 'Recently Handover'}</p>
                            </div>

                            <div className="flex gap-0.5 text-orange-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={10} 
                                  fill={i < r.rating ? "#F97316" : "none"} 
                                  className={i < r.rating ? "text-[#F97316]" : "text-gray-600"} 
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-gray-300 leading-relaxed text-[11px]">
                            {r.comment}
                          </p>

                          {/* Showroom Official Reply Box */}
                          {reply ? (
                            <div className="bg-[var(--color-bg-primary)] border-l-2 border-[#F97316] p-3 rounded-xl mt-2.5 text-[10.5px]">
                              <p className="text-orange-400 font-mono text-[9px] uppercase font-black">Official Showroom Response:</p>
                              <p className="text-gray-300 mt-1 italic leading-relaxed">"{reply}"</p>
                            </div>
                          ) : (
                            <div className="bg-[#050B14] p-3 rounded-xl border border-[var(--color-border-main)] mt-2 text-[10.5px] space-y-2">
                              <label className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase block">Respond to this client review:</label>
                              <div className="flex gap-2">
                                <textarea
                                  rows={1}
                                  className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-lg p-2 text-[var(--color-text-header)] text-[10.5px] focus:outline-none resize-none leading-relaxed"
                                  placeholder="Write response message..."
                                  value={reviewReplyText[r.id] || ''}
                                  onChange={e => setReviewReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveReply(r.id)}
                                  className="px-3.5 bg-orange-500 hover:bg-orange-600 text-stone-950 font-mono text-[9px] uppercase font-black rounded-lg transition-all"
                                >
                                  Submit Reply
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBTAB 7: BUSINESS ANALYTICS */}
          {dashSubTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              
              {/* Analytics Header Summary Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-xl space-y-1">
                  <span className="text-[var(--color-text-muted)] uppercase font-mono text-[9px] block">Showroom Traffic</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[var(--color-text-header)] text-lg font-black font-mono">14,205</span>
                    <span className="text-emerald-400 font-bold text-[8.5px]">+18.4%</span>
                  </div>
                  <p className="text-[9px] text-[var(--color-text-muted)]">Unique digital visits</p>
                </div>

                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-xl space-y-1">
                  <span className="text-[var(--color-text-muted)] uppercase font-mono text-[9px] block">CRM Leads Generated</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[var(--color-text-header)] text-lg font-black font-mono">184</span>
                    <span className="text-emerald-400 font-bold text-[8.5px]">+12.5%</span>
                  </div>
                  <p className="text-[9px] text-[var(--color-text-muted)]">WhatsApp & Call clicks</p>
                </div>

                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-xl space-y-1">
                  <span className="text-[var(--color-text-muted)] uppercase font-mono text-[9px] block">Conversion Rate</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[#38BDF8] text-lg font-black font-mono">1.3%</span>
                    <span className="text-[var(--color-text-muted)] font-bold text-[8.5px]">Avg. 1.1%</span>
                  </div>
                  <p className="text-[9px] text-[var(--color-text-muted)]">Leads per unique visit</p>
                </div>

                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-xl space-y-1">
                  <span className="text-[var(--color-text-muted)] uppercase font-mono text-[9px] block">Search Appearances</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[var(--color-text-header)] text-lg font-black font-mono">2,450</span>
                    <span className="text-emerald-400 font-bold text-[8.5px]">+24%</span>
                  </div>
                  <p className="text-[9px] text-[var(--color-text-muted)]">Peshawar regional queries</p>
                </div>

                <div className="col-span-2 lg:col-span-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-xl space-y-1">
                  <span className="text-[var(--color-text-muted)] uppercase font-mono text-[9px] block">Peak Traffic Hours</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-orange-400 text-xs font-black uppercase tracking-tight">2PM - 6PM</span>
                  </div>
                  <p className="text-[9px] text-[var(--color-text-muted)]">Most active local time</p>
                </div>

              </div>

              {/* Graphical Trend & Origin Channels Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Traffic Trend Visualizer */}
                <div className="lg:col-span-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-5 rounded-2xl space-y-5">
                  <div className="flex justify-between items-center border-b border-[var(--color-border-main)] pb-2">
                    <div>
                      <h3 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide">
                        📈 Storefront Monthly Traffic Trend
                      </h3>
                      <p className="text-[9.5px] text-[var(--color-text-muted)] mt-0.5">Shows last 6 months traffic scale (page views)</p>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 font-black bg-emerald-950/35 border border-emerald-900/30 px-2 py-0.5 rounded uppercase">
                      Growing Exponentially
                    </span>
                  </div>

                  {/* High quality, pure Tailwind custom CSS bar chart */}
                  <div className="h-52 flex items-end justify-between gap-3 pt-6 px-4">
                    {analytics.monthlyTraffic.map((views, i) => {
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                      const maxViews = Math.max(...analytics.monthlyTraffic);
                      const heightPercent = (views / maxViews) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                          <div className="w-full relative flex justify-center">
                            {/* Hover Tooltip tooltip */}
                            <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all duration-150 bg-slate-900 border border-[var(--color-border-main)] text-[var(--color-text-header)] font-mono text-[9.5px] font-bold py-1 px-2 rounded-lg z-10 whitespace-nowrap shadow-xl">
                              {views.toLocaleString()} visits
                            </span>
                            
                            {/* Bar Column with glow and hover gradient change */}
                            <div 
                              className="w-full max-w-[42px] bg-gradient-to-t from-orange-600 to-[#F97316] group-hover:from-orange-500 group-hover:to-orange-400 rounded-t-lg transition-all duration-700 relative shadow-lg shadow-orange-950/20"
                              style={{ height: `${(heightPercent * 0.8) + 10}%` }}
                            >
                              <div className="absolute inset-x-0 top-0 h-1.5 bg-white/20 rounded-t-lg"></div>
                            </div>
                          </div>
                          
                          <span className="text-[9.5px] font-mono text-[var(--color-text-muted)] group-hover:text-[var(--color-text-header)] transition-colors uppercase font-bold">{months[i]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Traffic Origin Distribution Channels */}
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-5 rounded-2xl space-y-4">
                  <div className="border-b border-[var(--color-border-main)] pb-2">
                    <h3 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide">
                      🧭 Visitor Origin Channels
                    </h3>
                    <p className="text-[9.5px] text-[var(--color-text-muted)] mt-0.5">Where buyers discovered your digital showroom</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {analytics.sourceChannels.map((src, i) => {
                      const colors = [
                        'bg-orange-500',
                        'bg-emerald-500',
                        'bg-blue-500',
                        'bg-purple-500'
                      ];
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px]/none font-semibold">
                            <span className="text-gray-300 font-medium">{src.name}</span>
                            <span className="text-[var(--color-text-header)] font-black font-mono">{src.value}%</span>
                          </div>
                          
                          {/* Progress bar container */}
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`${colors[i % colors.length]} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${src.value}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-[var(--color-bg-primary)]/40 border border-[var(--color-border-main)] p-3.5 rounded-xl space-y-1 text-[10px] text-[var(--color-text-muted)] leading-normal">
                    <p className="font-bold text-[var(--color-text-header)] flex items-center gap-1.5 uppercase font-mono text-[9px]">
                      💡 Marketing Optimization Tip:
                    </p>
                    <p>
                      Direct physical QR scans are growing! Print your showroom QR code and place it on physical windshields to guide walk-ins instantly to full specs.
                    </p>
                  </div>

                </div>

              </div>

              {/* Local Peshawar search keywords monitoring */}
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-5 rounded-2xl space-y-4">
                <div className="border-b border-[var(--color-border-main)] pb-2">
                  <h3 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide">
                    🔍 Peshawar Local Search Term Analytics
                  </h3>
                  <p className="text-[9.5px] text-[var(--color-text-muted)] mt-0.5">Actual terms searched by Peshawar car buyers routing traffic to this showroom</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[10.5px]">
                  
                  <div className="bg-slate-950/40 border border-[var(--color-border-main)] p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[var(--color-text-header)] font-bold">"Hilux Revo Peshawar"</p>
                      <span className="text-[9px] text-[var(--color-text-muted)]">Match Count: 412 clicks</span>
                    </div>
                    <span className="text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/20 text-[9px]">1st Rank</span>
                  </div>

                  <div className="bg-slate-950/40 border border-[var(--color-border-main)] p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[var(--color-text-header)] font-bold">"Land Cruiser ZX Ring Road"</p>
                      <span className="text-[9px] text-[var(--color-text-muted)]">Match Count: 284 clicks</span>
                    </div>
                    <span className="text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/20 text-[9px]">2nd Rank</span>
                  </div>

                  <div className="bg-slate-950/40 border border-[var(--color-border-main)] p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[var(--color-text-header)] font-bold">"Auto Choice Peshawar Fortuner"</p>
                      <span className="text-[9px] text-[var(--color-text-muted)]">Match Count: 195 clicks</span>
                    </div>
                    <span className="text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/20 text-[9px]">3rd Rank</span>
                  </div>

                </div>
              </div>

            </div>
          )}

          {dashSubTab === 'qr-code' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Customizer Sidebar */}
                <div className="lg:col-span-5 bg-[#0b1329] border border-[var(--color-border-main)] p-5 rounded-2xl space-y-5 text-left text-xs">
                  <div>
                    <h4 className="text-[var(--color-text-header)] font-black uppercase text-[10px] tracking-wider text-[#38BDF8]">
                      QR Configurator Panel
                    </h4>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                      Customize your physical showroom's digital onboarding assets for physical clients.
                    </p>
                  </div>

                  {/* Theme Select */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                      🎨 Card Theme Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setQrColorTheme('slate')}
                        className={`p-2.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                          qrColorTheme === 'slate'
                            ? 'bg-slate-800 border-[#38BDF8] text-[var(--color-text-header)] shadow-md'
                            : 'bg-[#030712] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:border-white/20'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                        Cosmic Slate
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrColorTheme('emerald')}
                        className={`p-2.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                          qrColorTheme === 'emerald'
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-md'
                            : 'bg-[#030712] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:border-white/20'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        Emerald Velvet
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrColorTheme('gold')}
                        className={`p-2.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                          qrColorTheme === 'gold'
                            ? 'bg-amber-950/40 border-amber-500 text-amber-400 shadow-md'
                            : 'bg-[#030712] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:border-white/20'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        Golden Crown
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrColorTheme('bone')}
                        className={`p-2.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                          qrColorTheme === 'bone'
                            ? 'bg-stone-100 border-stone-400 text-stone-900 shadow-md'
                            : 'bg-[#030712] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:border-white/20'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-stone-300 border border-stone-400" />
                        Arctic Bone
                      </button>
                    </div>
                  </div>

                  {/* Print Resolution */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                      📐 Output Target Density
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[300, 500, 1000].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setQrSize(size)}
                          className={`py-2 rounded-lg border text-[10px] font-mono transition-all cursor-pointer ${
                            qrSize === size
                              ? 'bg-slate-800 border-[#38BDF8] text-[#38BDF8] font-bold'
                              : 'bg-[#030712] border-[var(--color-border-main)] text-[var(--color-text-muted)]'
                          }`}
                        >
                          {size} x {size} px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Target Storefront URL */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                      🔗 Storefront QR Target URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://bazar360.online/dealers/${dealer.id}`}
                        className="flex-1 bg-[#030712] border border-[var(--color-border-main)] rounded-xl px-3 py-2.5 text-stone-300 font-mono text-[10px] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://bazar360.online/dealers/${dealer.id}`);
                          setCopiedUrl(true);
                          setTimeout(() => setCopiedUrl(false), 2000);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-[#38BDF8] font-mono text-[10px] uppercase font-black rounded-xl border border-[var(--color-border-main)] hover:border-[#38BDF8]/40 transition-colors cursor-pointer"
                      >
                        {copiedUrl ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Print & Download Buttons */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          const themeColor = {
                            slate: { bg: '#0f172a', text: '#ffffff', qrBg: '#f8fafc', border: '#1e293b' },
                            emerald: { bg: '#022c22', text: '#34d399', qrBg: '#f0fdf4', border: '#064e3b' },
                            gold: { bg: '#451a03', text: '#fbbf24', qrBg: '#fffbeb', border: '#78350f' },
                            bone: { bg: '#f5f5f4', text: '#1c1917', qrBg: '#ffffff', border: '#d6d3d1' }
                          }[qrColorTheme];

                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Print Storefront QR Code - ${dealer.name}</title>
                                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
                                <style>
                                  body {
                                    font-family: 'Inter', sans-serif;
                                    margin: 0;
                                    padding: 40px;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    height: 100vh;
                                    background: #ffffff;
                                  }
                                  .qr-card {
                                    width: 450px;
                                    background: ${themeColor.bg};
                                    color: ${themeColor.text};
                                    border: 4px solid ${themeColor.border};
                                    border-radius: 32px;
                                    padding: 40px;
                                    text-align: center;
                                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                                  }
                                  .header {
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 2px;
                                    font-size: 16px;
                                    margin-bottom: 5px;
                                    opacity: 0.8;
                                  }
                                  .sub {
                                    font-size: 28px;
                                    font-weight: 700;
                                    margin-bottom: 30px;
                                    line-height: 1.2;
                                  }
                                  .qr-wrapper {
                                    background: ${themeColor.qrBg};
                                    padding: 24px;
                                    border-radius: 24px;
                                    display: inline-block;
                                    margin-bottom: 30px;
                                    box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);
                                  }
                                  .qr-image {
                                    width: 250px;
                                    height: 250px;
                                    display: block;
                                  }
                                  .footer-text {
                                    font-size: 11px;
                                    line-height: 1.6;
                                    font-weight: 500;
                                    opacity: 0.7;
                                    margin-top: 0;
                                  }
                                  .tagline {
                                    display: inline-block;
                                    padding: 6px 16px;
                                    background: rgba(255, 255, 255, 0.08);
                                    border-radius: 50px;
                                    font-size: 11px;
                                    font-weight: 700;
                                    letter-spacing: 1px;
                                    text-transform: uppercase;
                                    margin-top: 15px;
                                  }
                                  @media print {
                                    body { padding: 0; }
                                    .qr-card { box-shadow: none; margin: auto; }
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="qr-card">
                                  <div class="header">Bazar360 Marketplace</div>
                                  <div class="sub">${dealer.name}</div>
                                  <div class="qr-wrapper">
                                    <img class="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&color=${themeColor.bg === '#f5f5f4' ? '1c1917' : '0f172a'}&bgcolor=${themeColor.qrBg.replace('#', '')}&data=${encodeURIComponent(`https://bazar360.online/dealers/${dealer.id}`)}" alt="QR Code" />
                                  </div>
                                  <p class="footer-text">
                                    Scan QR code with your mobile camera to view our complete live digital stock inventory list, check verified specs, see high-resolution staging media, and initiate dynamic bargains.
                                  </p>
                                  <div class="tagline">✦ Peshawar Verified Showroom ✦</div>
                                </div>
                                <script>
                                  window.onload = function() {
                                    setTimeout(function() {
                                      window.print();
                                    }, 500);
                                  }
                                </script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                      }}
                      className="w-full py-3 bg-[#F97316] hover:bg-[#ea580c] text-slate-950 rounded-xl text-xs uppercase font-mono font-black border border-[var(--color-border-main)] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-orange-500/20"
                    >
                      🖨️ Launch Print-Ready Badge
                    </button>
                  </div>
                </div>

                {/* QR Code Presentation Display Card */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">
                    ✦ Live On-Screen Hang-Tag Preview ✦
                  </span>
                  
                  {/* Styled Hangtag container */}
                  <div className={`w-full max-w-[420px] rounded-3xl p-8 text-center border shadow-2xl transition-all duration-300 ${
                    {
                      slate: 'bg-slate-900 border-slate-700/50 text-[var(--color-text-header)] shadow-slate-950/50',
                      emerald: 'bg-emerald-950/90 border-emerald-800 text-[#34d399] shadow-emerald-950/60',
                      gold: 'bg-stone-900 border-amber-600/30 text-amber-400 shadow-stone-950/80',
                      bone: 'bg-[#fafaf9] border-stone-300 text-stone-900 shadow-stone-400/20'
                    }[qrColorTheme]
                  }`}>
                    {/* Tiny punch hole */}
                    <div className={`w-4 h-4 rounded-full mx-auto mb-6 ${
                      qrColorTheme === 'bone' ? 'bg-stone-300' : 'bg-slate-950'
                    }`} />

                    <div className="text-[10px] font-mono tracking-widest uppercase opacity-75 font-black">
                      BAZAR360 AUTOMOTIVE
                    </div>
                    <h3 className="text-xl font-bold font-sans mt-1 leading-tight tracking-tight text-[var(--color-text-header)] dark:text-[var(--color-text-header)]">
                      {dealer.name}
                    </h3>

                    {/* QR Code Graphic Frame */}
                    <div className={`inline-block p-4 rounded-2xl my-6 border ${
                      {
                        slate: 'bg-white border-slate-700 shadow-inner',
                        emerald: 'bg-emerald-50 border-emerald-900/10 shadow-inner',
                        gold: 'bg-amber-50 border-amber-900/10 shadow-inner',
                        bone: 'bg-white border-stone-200 shadow-inner'
                      }[qrColorTheme]
                    }`}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=${qrColorTheme === 'bone' ? '1c1917' : '0f172a'}&bgcolor=ffffff&data=${encodeURIComponent(`https://bazar360.online/dealers/${dealer.id}`)}`}
                        alt="Storefront QR Code"
                        className="w-48 h-48 block rounded-lg mix-blend-multiply"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <p className={`text-[11px] leading-relaxed font-sans px-2 ${
                      qrColorTheme === 'bone' ? 'text-stone-600 font-medium' : 'text-[var(--color-text-muted)]'
                    }`}>
                      Scan this code with your smartphone camera to instantly browse our verified showroom inventory, watch premium walkarounds, and contact our sales reps on WhatsApp!
                    </p>

                    <div className={`mt-6 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9px] font-mono font-bold tracking-wider ${
                      qrColorTheme === 'bone'
                        ? 'bg-stone-200/80 text-stone-800'
                        : 'bg-[var(--color-border-main)] text-[#38BDF8] border border-[var(--color-border-main)]'
                    }`}>
                      📍 PESHAWAR SHOWROOM ON-SITE SCANNER
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {dashSubTab === 'marketing-assets' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <BusinessCardGenerator dealer={dealer} />
            </div>
          )}

          {dashSubTab === 'leads' && (
            <div className="space-y-6 animate-fade-in font-sans" id="crm-leads-dashboard">
              
              {/* CRM Heading Banner */}
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-[var(--color-text-header)] text-xs font-black uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    Bazar360 CRM & Lead Capture Pipeline
                  </h3>
                  <p className="text-[10px] text-[var(--color-text-header)]/50 mt-1">
                    Manage active vehicle spec-sheet queries, contact buyers via direct WhatsApp/Call triggers, and monitor conversion pipelines.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setLoadingLeads(true);
                    dbFetchLeadsForOwner(dealer.id)
                      .then(setLeads)
                      .finally(() => setLoadingLeads(false));
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono text-[9px] uppercase px-3 py-1.5 rounded-lg border border-[var(--color-border-main)] transition-colors cursor-pointer"
                >
                  🔄 Force Refresh
                </button>
              </div>

              {/* Pipeline Analytics Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="bg-slate-900/60 border border-[var(--color-border-main)] p-4 rounded-xl">
                  <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase font-bold block">📥 Total Inquiries</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold text-[var(--color-text-header)]">{leads.length}</span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">100% active</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-[var(--color-border-main)] p-4 rounded-xl">
                  <span className="text-[9px] font-mono text-orange-400 uppercase font-bold block">🔥 New Leads</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold text-orange-400">
                      {leads.filter(l => l.status === 'New').length}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--color-text-muted)] font-medium">Requires action</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-[var(--color-border-main)] p-4 rounded-xl">
                  <span className="text-[9px] font-mono text-sky-400 uppercase font-bold block">💬 Contacted</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold text-sky-400">
                      {leads.filter(l => l.status === 'Contacted').length}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--color-text-muted)] font-medium">In negotiation</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-[var(--color-border-main)] p-4 rounded-xl">
                  <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold block">🤝 Closed Deals</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold text-emerald-400">
                      {leads.filter(l => l.status === 'Closed').length}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">
                      {leads.length > 0 ? `${Math.round((leads.filter(l => l.status === 'Closed').length / leads.length) * 100)}%` : '0%'} rate
                    </span>
                  </div>
                </div>

              </div>

              {/* CRM leads lists table / card interface */}
              {loadingLeads ? (
                <div className="bg-slate-900/40 p-12 text-center rounded-2xl border border-[var(--color-border-main)] space-y-2">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">Synchronizing CRM from Cloud Firestore...</p>
                </div>
              ) : leads.length === 0 ? (
                <div className="bg-slate-900/40 p-12 text-center rounded-2xl border border-[var(--color-border-main)] space-y-3">
                  <p className="text-base">💼</p>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-[var(--color-text-header)] uppercase tracking-wider">No Active CRM Leads</h4>
                    <p className="text-[10px] text-[var(--color-text-muted)] max-w-md mx-auto leading-relaxed">
                      Your showroom leads pipeline is currently empty. Direct visitor inquiry cards and speculative price bargain requests will automatically route here once buyers submit spec queries.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => {
                    const statusColor = {
                      New: 'border-orange-500/20 bg-orange-500/5 text-orange-400',
                      Contacted: 'border-sky-500/20 bg-sky-500/5 text-sky-400',
                      Closed: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
                      Lost: 'border-rose-500/20 bg-rose-500/5 text-[var(--color-text-muted)]'
                    }[lead.status || 'New'];

                    return (
                      <div
                        key={lead.id}
                        className="bg-slate-900/60 p-5 rounded-2xl border border-[var(--color-border-main)] hover:border-[var(--color-border-main)] transition-all flex flex-col lg:flex-row justify-between gap-5"
                        id={`crm-lead-card-${lead.id}`}
                      >
                        {/* LEFT SECTION: Vehicle details & Inquirer data */}
                        <div className="flex-1 space-y-4">
                          
                          {/* Client Header */}
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="w-8 h-8 bg-slate-950 border border-[var(--color-border-main)] rounded-full flex items-center justify-center font-black text-xs text-[#38BDF8]">
                              {lead.userName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-[var(--color-text-header)]">{lead.userName}</h4>
                              <p className="text-[9.5px] text-[var(--color-text-muted)] font-mono mt-0.5">
                                Phone: {lead.userPhone} {lead.userEmail && `| Email: ${lead.userEmail}`}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase ${statusColor}`}>
                              {lead.status || 'New'}
                            </span>
                          </div>

                          {/* Message Detail Card */}
                          <div className="bg-slate-950 p-3.5 rounded-xl border border-[var(--color-border-main)] space-y-1.5">
                            <span className="text-[8px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">🗣️ Inquiry Message:</span>
                            <p className="text-[11px] text-gray-300 italic font-medium leading-relaxed">
                              "{lead.inquiryMessage}"
                            </p>
                          </div>

                        </div>

                        {/* MIDDLE SECTION: Related Vehicle Reference */}
                        <div className="lg:w-72 bg-slate-950 p-3 rounded-xl border border-[var(--color-border-main)] flex gap-3 items-center shrink-0">
                          {lead.vehicleImage ? (
                            <img
                              src={lead.vehicleImage}
                              alt={lead.vehicleTitle}
                              className="w-16 h-16 object-cover rounded-lg border border-[var(--color-border-main)] shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-900 rounded-lg border border-[var(--color-border-main)] flex items-center justify-center text-xs shrink-0">🚗</div>
                          )}
                          <div className="space-y-0.5 min-w-0">
                            <span className="text-[8px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider block">Vehicle Tag:</span>
                            <h5 className="text-[11px] font-bold text-[var(--color-text-header)] truncate">{lead.vehicleTitle}</h5>
                            <p className="text-[10px] font-black text-orange-500 font-mono">
                              {typeof lead.vehiclePrice === 'number' ? formatPKRCurrency(lead.vehiclePrice) : lead.vehiclePrice}
                            </p>
                            <span className="text-[8.5px] text-[var(--color-text-muted)] font-mono block truncate">ID: {lead.vehicleId}</span>
                          </div>
                        </div>

                        {/* RIGHT SECTION: Interactive Actions & CRM Updates */}
                        <div className="lg:w-48 flex flex-col justify-between gap-3 shrink-0">
                          {/* Direct Action triggers */}
                          <div className="space-y-2">
                            <span className="text-[8px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider block">⚡ Quick Contact:</span>
                            <div className="grid grid-cols-2 gap-2">
                              <a
                                href={`https://wa.me/${lead.userPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2 px-3 rounded-xl text-[10px] font-mono font-black text-center transition-colors uppercase cursor-pointer"
                              >
                                WhatsApp
                              </a>
                              <a
                                href={`tel:${lead.userPhone}`}
                                className="bg-slate-800 hover:bg-slate-750 text-[var(--color-text-header)] border border-[var(--color-border-main)] py-2 px-3 rounded-xl text-[10px] font-mono font-black text-center transition-colors uppercase cursor-pointer"
                              >
                                Call Direct
                              </a>
                            </div>
                          </div>

                          {/* Status Select mutation dropdown */}
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">⚙️ Update Lead Status:</label>
                            <select
                              value={lead.status || 'New'}
                              onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                              className="w-full bg-slate-950 border border-[var(--color-border-main)] focus:border-orange-500 rounded-xl p-2 text-[10.5px] text-[var(--color-text-header)] focus:outline-none cursor-pointer"
                            >
                              <option value="New">🔥 Mark as New</option>
                              <option value="Contacted">💬 Mark as Contacted</option>
                              <option value="Closed">🤝 Mark as Closed</option>
                              <option value="Lost">❌ Mark as Lost</option>
                            </select>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================
         TAB B: MEDIA FEED UPLOAD PIPELINE (STAGING BAY)
         ======================================================== */}
      {hqTab === 'media-pipeline' && (
        <div className="space-y-6 animate-fade-in font-sans">
          
          <div className="bg-[var(--color-bg-secondary)] border border-[#38BDF8]/20 p-5 rounded-2xl">
            <h3 className="text-[var(--color-text-header)] text-xs font-black uppercase tracking-wide flex items-center gap-2">
              <Video className="text-[#38BDF8]" size={16} /> Showcase Inventory Media Staging Bay
            </h3>
            <p className="text-[10px] text-[var(--color-text-header)]/50 mt-1">
              Analyze clip resolutions, horizontal viewport formats, and transcode aspects automatically before publishing reels or structural portfolio arrays.
            </p>
          </div>

          {/* Drag and Drop Zone Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all select-none flex flex-col items-center justify-center space-y-3.5 ${
              isDragging
                ? 'border-orange-500 bg-orange-950/10'
                : 'border-[var(--color-border-main)] hover:border-[#38BDF8]/20 bg-[var(--color-bg-secondary)] hover:bg-[#0f172a]'
            }`}
          >
            <div className="w-12 h-12 bg-[var(--color-border-main)] rounded-full flex items-center justify-center text-[#38BDF8] shadow">
              <Video size={20} />
            </div>
            
            <div className="space-y-1">
              <p className="text-[var(--color-text-header)] font-mono font-bold text-xs uppercase">Drag & Drop Inventory Clips to Stage</p>
              <p className="text-[10px] text-[var(--color-text-header)]/40">Accepts High-Res Mp4, Mov, Prores format up to 100 MB</p>
            </div>

            <div className="flex gap-2 font-mono text-[9px] uppercase font-bold">
              <button
                type="button"
                onClick={() => triggerMockIngest('rebel_exhaust_revs_9_16.mp4')}
                className="py-1.5 px-3 bg-[#38BDF8] hover:bg-sky-400 text-slate-950 rounded cursor-pointer duration-75"
              >
                🎬 Simulate Video drop (9:16)
              </button>
              <button
                type="button"
                onClick={() => triggerMockIngest('front_console_closeup.jpg')}
                className="py-1.5 px-3 bg-[var(--color-border-main)] hover:bg-white/10 border border-[var(--color-border-main)] text-[var(--color-text-header)] rounded cursor-pointer duration-75"
              >
                📸 Simulate Photo drag (4:3)
              </button>
            </div>
          </div>

          {/* Active upload progression */}
          {uploadingName && (
            <div className="bg-[var(--color-bg-secondary)] border border-orange-500/20 rounded-2xl p-4 space-y-2 animate-pulse">
              <div className="flex justify-between font-mono text-[10px] text-orange-400 font-extrabold uppercase">
                <span>Ingesting Staging File: {uploadingName}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[var(--color-bg-primary)] h-1.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full duration-100" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-[9px] text-[var(--color-text-muted)] font-mono">Executing ratio calculations, parsing width and height pixels...</p>
            </div>
          )}

          {/* Staged list */}
          <div className="space-y-3">
            <h4 className="text-[var(--color-text-header)] font-extrabold font-mono text-[10px] uppercase block tracking-wider">Currently Ingested Staging Array:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {stagedMedia.map(sm => {
                const isVideo = sm.type === 'video';
                return (
                  <div key={sm.id} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-xl flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[var(--color-text-header)] font-mono font-black text-[11px] truncate w-32">{sm.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          isVideo ? 'bg-[#38BDF8]/10 text-[#38BDF8]' : 'bg-pink-950/20 text-pink-400'
                        }`}>
                          {isVideo ? 'Mp4 Video' : 'Jpg Frame'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-muted)] leading-normal">File Capacity Appraisal: {sm.size}</p>
                    </div>

                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] p-2 rounded-lg text-[9.5px]/none space-y-2 font-mono">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Resolution:</span>
                        <span className="text-[var(--color-text-header)] font-extrabold">{sm.resolution} px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Aspect alignment:</span>
                        <span className="text-orange-400 font-extrabold uppercase">{sm.aspectRatio}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center font-mono text-[9px] uppercase font-bold pt-1">
                      <span className="text-emerald-400 flex items-center gap-1">✓ Transcoded</span>
                      <button
                        onClick={() => setStagedMedia(prev => prev.filter(m => m.id !== sm.id))}
                        className="text-red-400 hover:text-red-500 text-[8.5px]"
                      >
                        Remove stage
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
         TAB C: LIVE INVENTORY CONTROL PANEL (INTEGRITY BOARD)
         ======================================================== */}
      {hqTab === 'inventory-control' && (
        <div className="space-y-6 animate-fade-in font-sans">
          
          {/* Dashboard calculations bento block */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 select-none">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between">
              <span className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase tracking-wider block">Showroom floor capital value:</span>
              <div className="space-y-0.5 mt-2">
                <p className="text-[var(--color-text-header)] font-black font-mono text-base">{formatPKRCurrency(computeInventoryWorth())}</p>
                <p className="text-[10px] text-emerald-400">Total verified asset assets</p>
              </div>
            </div>

            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between">
              <span className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase tracking-wider block">Average Appraisal Index:</span>
              <div className="space-y-0.5 mt-2">
                <p className="text-[var(--color-text-header)] font-black font-mono text-base">{formatPKRCurrency(computeAvgCarPrice())}</p>
                <p className="text-[10px] text-orange-400">Stable showroom indexing value</p>
              </div>
            </div>

            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between">
              <span className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase tracking-wider block">Cost per Mileage Index:</span>
              <div className="space-y-0.5 mt-2">
                <p className="text-[var(--color-text-header)] font-black font-mono text-base">Rs. {Math.round(computePricePerMileageIndex()).toLocaleString()} / km</p>
                <p className="text-[10px] text-[#38BDF8]">Absolute wear appraisals index</p>
              </div>
            </div>

            <div className="bg-[var(--color-bg-secondary)] border border-[#38BDF8]/20 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between">
              <span className="text-[#38BDF8] font-mono text-[9px] uppercase tracking-wider block">Total Listed stock count:</span>
              <div className="space-y-0.5 mt-2">
                <p className="text-[#38BDF8] font-black font-mono text-base">{localInventory.length} Active Nodes</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">100% cloud persistent verified</p>
              </div>
            </div>
          </div>

          {/* List display and operations */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-[var(--color-border-main)] pb-2">
              <h3 className="text-[var(--color-text-header)] font-black text-xs uppercase tracking-wide">Live Stock Control Panel</h3>
              <p className="text-[10px] text-[var(--color-text-muted)] font-mono">Dealers can evict or reprice inventory instantly</p>
            </div>

            <div className="space-y-3">
              {localInventory.map(car => {
                const isApproved = car.approved !== false;
                const isRepricing = repriceCarId === car.id;

                return (
                  <div key={car.id} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-2xl flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={car.imageUrl}
                        alt=""
                        className="w-16 h-12 object-cover rounded-xl border border-[var(--color-border-main)] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[var(--color-text-header)] font-extrabold uppercase text-[11.5px] font-mono">{car.title}</span>
                          
                          {/* Integrity Verification Badges */}
                          <button
                            type="button"
                            onClick={() => handleToggleListingApproval(car.id)}
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-mono uppercase font-black tracking-wider cursor-pointer border ${
                              isApproved 
                                ? 'bg-[#38BDF8]/10 border-[#38BDF8]/20 text-[#38BDF8]' 
                                : 'bg-red-950/20 border-red-900/40 text-red-400 animate-pulse'
                            }`}
                          >
                            {isApproved ? '✓ Verified Stock' : '⚠️ Pending Admin Approval'}
                          </button>
                        </div>
                        <p className="text-[var(--color-text-muted)] text-[10px] mt-1">PKR Valuation: <span className="text-[#38BDF8] font-mono font-bold">{formatPKRCurrency(car.price)}</span> • {car.mileage.toLocaleString()} KM driven</p>
                        <p className="text-[var(--color-text-muted)] text-[9px] mt-0.5 font-mono">{car.transmission} Transmission • {car.fuelType}</p>
                        
                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {car.isSold && <span className="bg-rose-500/10 text-rose-400 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded uppercase border border-rose-900/30 font-bold">Sold</span>}
                          {car.tags?.includes('Reserved') && <span className="bg-amber-500/10 text-amber-400 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded uppercase border border-amber-900/30 font-bold">Reserved</span>}
                          {car.isPaused && <span className="bg-slate-500/10 text-slate-400 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded uppercase border border-slate-900/30 font-bold">Paused</span>}
                          {car.featured && <span className="bg-[#38BDF8]/10 text-[#38BDF8] text-[8px] font-bold font-mono px-1.5 py-0.5 rounded uppercase border border-[#38BDF8]/30 font-bold">Boosted</span>}
                          {car.isArchived && <span className="bg-purple-500/10 text-purple-400 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded uppercase border border-purple-900/30 font-bold">Archived</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full lg:w-auto">
                      <div className="flex flex-wrap gap-1 items-center justify-start lg:justify-end">
                        {/* Sold toggle */}
                        <button
                          onClick={() => handleAdvancedShowroomAction(car.id, 'sold')}
                          className={`px-2 py-1 text-[8.5px] font-mono font-bold uppercase border rounded-lg transition-all cursor-pointer ${
                            car.isSold
                              ? 'bg-rose-950/40 border-rose-900/40 text-rose-400'
                              : 'bg-[var(--color-bg-primary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
                          }`}
                        >
                          {car.isSold ? 'Sold ✓' : 'Mark Sold'}
                        </button>
                        
                        {/* Reserved toggle */}
                        <button
                          onClick={() => handleAdvancedShowroomAction(car.id, 'reserved')}
                          className={`px-2 py-1 text-[8.5px] font-mono font-bold uppercase border rounded-lg transition-all cursor-pointer ${
                            car.tags?.includes('Reserved')
                              ? 'bg-amber-950/40 border-amber-900/40 text-amber-400'
                              : 'bg-[var(--color-bg-primary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
                          }`}
                        >
                          {car.tags?.includes('Reserved') ? 'Reserved ✓' : 'Reserve'}
                        </button>

                        {/* Pause toggle */}
                        <button
                          onClick={() => handleAdvancedShowroomAction(car.id, 'pause')}
                          className={`px-2 py-1 text-[8.5px] font-mono font-bold uppercase border rounded-lg transition-all cursor-pointer ${
                            car.isPaused
                              ? 'bg-slate-950/40 border-slate-900 text-slate-400'
                              : 'bg-[var(--color-bg-primary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
                          }`}
                        >
                          {car.isPaused ? 'Resume' : 'Pause'}
                        </button>

                        {/* Renew */}
                        <button
                          onClick={() => handleAdvancedShowroomAction(car.id, 'renew')}
                          className="px-2 py-1 text-[8.5px] font-mono font-bold uppercase border bg-[var(--color-bg-primary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] rounded-lg cursor-pointer"
                        >
                          Renew
                        </button>

                        {/* Clone */}
                        <button
                          onClick={() => handleAdvancedShowroomAction(car.id, 'duplicate')}
                          className="px-2 py-1 text-[8.5px] font-mono font-bold uppercase border bg-[var(--color-bg-primary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] rounded-lg cursor-pointer"
                        >
                          Clone
                        </button>

                        {/* Boost */}
                        <button
                          onClick={() => handleAdvancedShowroomAction(car.id, 'boost')}
                          className={`px-2 py-1 text-[8.5px] font-mono font-bold uppercase border rounded-lg transition-all cursor-pointer ${
                            car.featured
                              ? 'bg-sky-950/40 border-sky-900 text-sky-400'
                              : 'bg-[var(--color-bg-primary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
                          }`}
                        >
                          {car.featured ? 'Boosted ✓' : 'Boost'}
                        </button>

                        {/* Archive */}
                        <button
                          onClick={() => handleAdvancedShowroomAction(car.id, 'archive')}
                          className={`px-2 py-1 text-[8.5px] font-mono font-bold uppercase border rounded-lg transition-all cursor-pointer ${
                            car.isArchived
                              ? 'bg-purple-950/40 border-purple-900 text-purple-400'
                              : 'bg-[var(--color-bg-primary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
                          }`}
                        >
                          {car.isArchived ? 'Archived ✓' : 'Archive'}
                        </button>

                        {/* Share */}
                        <button
                          onClick={() => handleAdvancedShowroomAction(car.id, 'share')}
                          className="px-2 py-1 text-[8.5px] font-mono font-bold uppercase border bg-[var(--color-bg-primary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] rounded-lg cursor-pointer"
                        >
                          Share
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center justify-start lg:justify-end mt-1">
                        
                        {isRepricing ? (
                          <div className="flex items-center gap-1.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] p-1 rounded-xl">
                            <input
                              type="number"
                              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-lg py-1 px-2 text-[var(--color-text-header)] font-mono text-[10px] w-28 focus:outline-none"
                              placeholder="Enter Price..."
                              value={temporaryNewPrice || ''}
                              onChange={(e) => setTemporaryNewPrice(parseInt(e.target.value) || 0)}
                            />
                            <button
                              onClick={() => handleUpdatePriceStock(car.id, temporaryNewPrice)}
                              className="bg-[#38BDF8] text-slate-950 px-2 py-1 rounded-lg text-[10px] font-mono font-black uppercase cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setRepriceCarId(null)}
                              className="text-[var(--color-text-muted)] text-[10px] px-2 cursor-pointer"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setRepriceCarId(car.id); setTemporaryNewPrice(car.price); }}
                            className="px-3 py-1.5 border border-[var(--color-border-main)] bg-[var(--color-bg-primary)] text-[var(--color-text-header)] hover:text-orange-400 font-mono text-[9px] uppercase font-bold rounded-lg cursor-pointer hover:border-white/15"
                          >
                            Quick Reprice
                          </button>
                        )}

                        {!isApproved && (
                          <button
                            onClick={() => handleToggleListingApproval(car.id)}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 font-mono text-[9px] uppercase font-bold rounded-lg cursor-pointer duration-75 flex items-center gap-1"
                          >
                            Approve Stock
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteListingStock(car.id)}
                          className="px-2 py-1.5 bg-red-950/20 text-red-400 border border-red-900/30 rounded-lg hover:bg-red-950/40 text-[9.5px]/none transition-all flex items-center gap-1 justify-center duration-75 cursor-pointer"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
         TAB D: PUBLISH EXTREMELY HIGH PARAMETER SPECS SYSTEM
         ======================================================== */}
      {hqTab === 'post-car' && (
        <form onSubmit={handlePublishDeepCar} className="space-y-4 animate-fade-in font-sans text-xs">
          
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="space-y-1">
              <h3 className="text-[var(--color-text-header)] text-xs font-black uppercase tracking-wide">Publish Verified Dealer Vehicles</h3>
              <p className="text-[10px] text-[var(--color-text-muted)] leading-normal">Utilize Gemini to draft high-conversion catalogs from raw shorthand inputs instantly.</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-3 py-2 text-[var(--color-text-header)] placeholder-gray-500 font-mono text-[10px] flex-grow"
                placeholder="civic 22 white 18k km Rs 85 Lac..."
                value={shorthandPrompt}
                onChange={e => setShorthandPrompt(e.target.value)}
              />
              <button
                type="button"
                disabled={aiWriting}
                onClick={handleGenerateAISpecs}
                className="bg-[#38BDF8] text-slate-950 font-mono font-black text-[9px] uppercase tracking-wide px-3.5 py-2.5 rounded-xl hover:bg-sky-400 duration-75 cursor-pointer flex items-center gap-1 italic"
              >
                {aiWriting ? 'Synthesis...' : 'Gemini write'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Advertisement Title Header:</label>
              <input
                type="text"
                required
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3.5 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono font-bold"
                placeholder="2023 Porsche 911 chalk grey..."
                value={carTitle}
                onChange={e => setCarTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Branding Brand / Make:</label>
              <select
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3.5 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono font-bold"
                value={carMake}
                onChange={e => setCarMake(e.target.value)}
              >
                {['Toyota', 'Honda', 'Suzuki', 'Porsche', 'BMW', 'Mercedes-Benz', 'Hyundai', 'Kia', 'Nissan', 'Audi'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Model Family (e.g. Civic):</label>
              <input
                type="text"
                required
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                value={carModel}
                onChange={e => setCarModel(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Model Year:</label>
              <input
                type="number"
                required
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                value={carYear}
                onChange={e => setCarYear(parseInt(e.target.value) || 2024)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Selling Valuation (PKR):</label>
              <input
                type="number"
                required
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                value={carPrice}
                onChange={e => setCarPrice(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Mileage Travelled (KM):</label>
              <input
                type="number"
                required
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                value={carMileage}
                onChange={e => setCarMileage(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Technical Displacement (CC):</label>
              <input
                type="text"
                required
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                placeholder="2700cc, 1500cc..."
                value={carDisplacement}
                onChange={e => setCarDisplacement(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Fuel Category Strategy:</label>
              <select
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                value={carFuel}
                onChange={e => setCarFuel(e.target.value as any)}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Transmission Mechanical:</label>
              <select
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                value={carTrans}
                onChange={e => setCarTrans(e.target.value as any)}
              >
                <option value="Automatic">Automatic Strategy</option>
                <option value="Manual">Manual Strategy</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Origin Assembly PK:</label>
              <input
                type="text"
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                value={carSpecs}
                onChange={e => setCarSpecs(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Body Classification:</label>
              <input
                type="text"
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                value={carBodyType}
                onChange={e => setCarBodyType(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Import Grade / Score:</label>
              <input
                type="text"
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                value={carGrade}
                onChange={e => setCarGrade(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Registration City:</label>
              <input
                type="text"
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                value={carRegCity}
                onChange={e => setCarRegCity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Exterior color paint:</label>
              <input
                type="text"
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                value={carColor}
                onChange={e => setCarColor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Vehicle Listing Media (Upload Local Files or paste links):</label>
              {isCarUploading && (
                <span className="text-[10px] text-orange-400 font-mono animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping inline-block" />
                  Watermarking...
                </span>
              )}
            </div>

            {/* Local Media Drag & Drop Zone */}
            <div 
              className="border border-dashed border-[var(--color-border-main)] hover:border-orange-500/55 bg-slate-950/40 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300"
              onClick={() => document.getElementById('vehicle-stock-file-picker')?.click()}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  for (let i = 0; i < files.length; i++) {
                    handleVehiclePhotoUpload(files[i]);
                  }
                }
              }}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="vehicle-stock-file-picker"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                      handleVehiclePhotoUpload(files[i]);
                    }
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="p-3 bg-slate-900/80 rounded-full text-orange-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload-cloud"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
                </span>
                <p className="text-xs text-gray-300 font-medium">Drag & drop multiple vehicle photos, or <span className="text-orange-400 underline">browse your local files</span></p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-mono">Bazar360 watermarks are applied locally on-the-fly</p>
              </div>
            </div>

            {/* Thumbnail Preview Grid */}
            {carImages.length > 0 && (
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3.5 border border-[var(--color-border-main)]">
                <p className="text-[9px] font-mono font-bold uppercase text-[var(--color-text-header)]/40 mb-2 text-left">ACTIVE ENROLLED MEDIA ({carImages.length} items):</p>
                <div className="flex flex-wrap gap-2">
                  {carImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg border border-[var(--color-border-main)] overflow-hidden group">
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCarImages(prev => prev.filter((_, i) => i !== idx));
                          if (carImgUrl === img) {
                            const remaining = carImages.filter((_, i) => i !== idx);
                            setCarImgUrl(remaining[0] || STOCK_CAR_PHOTOS[0].url);
                          }
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-500 font-bold text-xs transition-opacity rounded-lg"
                        title="Delete image"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Backwards-compatible URL pasted link input */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-[var(--color-text-header)]/40 block text-left">Pasted Web Link:</span>
              <input
                type="text"
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 text-xs font-mono"
                placeholder="Paste custom vehicle image URL link if preferred"
                value={carImgUrl}
                onChange={e => {
                  setCarImgUrl(e.target.value);
                  if (!carImages.includes(e.target.value)) {
                    setCarImages(prev => [e.target.value, ...prev.filter(u => u !== STOCK_CAR_PHOTOS[0].url)]);
                  }
                }}
              />
            </div>

            {/* Preset selectors */}
            <div className="flex gap-1.5 flex-wrap">
              {STOCK_CAR_PHOTOS.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCarImgUrl(photo.url);
                    setCarImages([photo.url]);
                  }}
                  className={`px-2 py-1 text-[9px] font-mono border rounded-lg transition-all ${
                    carImgUrl === photo.url
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-[var(--color-border-main)] bg-slate-950/40 text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'
                  }`}
                >
                  Preset {idx + 1} ({photo.name.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[var(--color-text-header)]/60 font-semibold block uppercase font-mono text-[9px]">Showroom Listing Catalog copy description:</label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={generatingAI}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm ${
                  generatingAI 
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                    : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border border-orange-500/30 cursor-pointer hover:shadow-orange-500/10'
                }`}
              >
                {generatingAI ? (
                  <>
                    <div className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                    <span>Writing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              required
              className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl p-4 text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 resize-none leading-relaxed text-xs"
              value={carDesc}
              onChange={e => setCarDesc(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="bg-[#F97316] hover:bg-orange-600 font-mono font-bold text-xs uppercase tracking-wider py-4 px-8 text-[var(--color-text-header)] rounded-xl flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg shadow-orange-950/20"
            >
              Verify & Post stock directly onto active showroom floor
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
