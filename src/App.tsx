import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Home, PlusCircle, Grid, Store, User, LogIn, X, ShieldCheck, MapPin, Gauge, Fuel, Milestone, Star, Award, DollarSign, Send, Hourglass, Bell, Sparkles, Car, MessageSquare, Headphones, QrCode, Heart, Copy, ExternalLink, Share2, Users, Phone, ArrowLeft } from 'lucide-react';
import { CarListing, Dealer, Review } from './types';


import { 
  dbFetchDealers, 
  dbFetchListings, 
  dbFetchListingById,
  dbSaveListing, 
  dbRegisterDealership, 
  dbApproveListing, 
  dbAddReview, 
  dbFetchReviews,
  dbSaveUserProfile,
  dbFetchUserProfile,
  UserProfile,
  dbSaveSuggestion,
  dbTrackLeadAction,
  dbToggleFavorite,
  dbSaveRecentView,
  dbTrackShowroomEvent,
  dbUpdateProfile
} from './lib/dbService';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useCurrencyMode } from './lib/currency';
import { isAdminUser, canManageShowroom, isAuthorized } from './lib/permissions';
import { toast, Toaster } from 'react-hot-toast';
import { getOptimizedUrl } from './lib/cloudinaryService';

import Footer from './components/Footer';
import NavigationAudit from './components/NavigationAudit';
import AuthModal from './components/AuthModal';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import ShowroomsHub from './components/ShowroomsHub';
import { FAQView } from './components/FAQView';

import { getRecentViewsOffline, saveRecentViewOffline } from './lib/offlineStorage';

// Use React.lazy for code splitting and performance optimization (Lighthouse 95+)
import DealerStorefrontView from './components/ShowroomMiniSite';
import HomeView from './components/HomeView';
import SearchExplorerView from './components/SearchExplorerView';
import DetailedVehiclePostingPage from './components/DetailedVehiclePostingPage';
import AdminModerationDeck from './components/AdminModerationDeck';
import AdminDashboard from './components/AdminDashboard';
import RegistrationPortal from './components/RegistrationPortal';
import NotificationsView from './components/NotificationsView';
import UnifiedNotificationCenter from './components/UnifiedNotificationCenter';
import MessagingCenterModal from './components/MessagingCenterModal';
import AutoServicesView from './components/AutoServicesView';
import ContactView from './components/ContactView';
import UserProfileView from './components/UserDashboard';
import SocialFeedView from './components/SocialFeedView';
import MobileNativeExperience from './components/MobileNativeExperience';
import { ShortlistCartView } from './components/ShortlistCartView';

import { VehicleCard } from './components/VehicleCard';
import LeadCaptureForm from './components/LeadCaptureForm';
import FirstTimeLeadModal from './components/FirstTimeLeadModal';
import PWAInstallBanner from './components/PWAInstallBanner';
import { FirstTimeVisitorModal } from './components/FirstTimeVisitorModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { useAuth, AuthProvider } from './components/AuthContext';
import ContactDrawer from './components/ContactDrawer';
import { motion, AnimatePresence } from 'motion/react';
import { initializeVisitorTracking, trackSearchQuery, trackVehicleView } from './lib/visitorTracking';
import { SEO } from './components/SEO';
import { TopBanner } from './components/layout/TopBanner';
import { SkeletonLoader } from './components/layout/SkeletonLoader';
import { VehicleDetailSkeleton } from './components/VehicleDetailSkeleton';
import BottomNavBar from './components/BottomNavBar';
import { SplashOnboardingModal } from './components/SplashOnboardingModal';


function AnimatedLogoCycler() {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#0047AB] via-blue-600 to-red-600 p-0.5 shadow-lg shadow-blue-900/40 group-hover:shadow-red-500/30 transition-all duration-300 shrink-0">
        <div className="w-full h-full bg-bg-primary rounded-[10px] flex items-center justify-center relative overflow-hidden">
          <span className="font-display font-black text-lg text-[var(--color-text-header)] tracking-tighter group-hover:scale-110 transition-transform duration-300">B</span>
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-display font-black text-xl sm:text-2xl tracking-tighter text-[var(--color-text-header)] uppercase flex items-center gap-1 leading-none">
          BAZAR<span className="text-[#CC0000] font-black">360</span>
          <span className="text-[#0047AB] font-black text-[10px] px-1.5 py-0.5 rounded bg-blue-950/90 border border-blue-500/30 ml-1 tracking-widest">.ONLINE</span>
        </span>
        <span className="text-[8.5px] font-mono font-bold tracking-widest text-text-muted uppercase leading-none mt-0.5">
          Verified Automotive Marketplace
        </span>
      </div>
    </div>
  );
}

const METRIC_TABS_DATA: Record<string, Array<{label: string; value: string}>> = {};

const HOTSPOTS_LIST = [
  { id: 'engine', name: 'Piston block & Engine layout', text: 'Dual overhead cam 24-valve configuration optimized for PKR fuel gradients.', x: '25%', y: '45%' },
  { id: 'suspension', name: 'Suspension compression ratio', text: 'Adaptive pneumatic damping ring with dynamic rebound control on broken roads.', x: '65%', y: '55%' },
  { id: 'exhaust', name: 'Exhaust airflow channel', text: 'Quad low-back-pressure active exhaust ports with carbon acoustic resonators.', x: '88%', y: '65%' },
];

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ShowroomProfile from "./pages/ShowroomProfile";
import { VehicleDetail } from "./components/VehicleDetail";

import { RoleProvider } from './contexts/RoleContext';
// ...
export default function AppWrapper() {
  return (
    <AuthProvider>
      <RoleProvider>
        <Router>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/inventory" element={<App />} />
            <Route path="/media" element={<App />} />
            <Route path="/insights" element={<App />} />
            <Route path="/concierge" element={<App />} />
            <Route path="/dealers" element={<App />} />
            <Route path="/sell" element={<App />} />
            <Route path="/portal" element={<App />} />
            <Route path="/search" element={<App />} />
            <Route path="/favorites" element={<App />} />
            <Route path="/admin" element={<App />} />
            <Route path="/community" element={<App />} />
            <Route path="/dealers/:showroomSlug" element={<ShowroomProfile />} />
            <Route path="/dealers/:showroomSlug/listings/:listingId" element={<App />} />
            <Route path="/showroom/:showroomSlug" element={<ShowroomProfile />} />
            <Route path="/showroom/:showroomSlug/car/:carId" element={<ShowroomProfile />} />
            <Route path="*" element={<App />} />
          </Routes>
        </Router>
      </RoleProvider>
    </AuthProvider>
  );
}

import { useRole } from './contexts/RoleContext';


function IdentityBanner({ currentUser }: { currentUser: any }) {
  let identity = 'Visitor';
  let bannerColor = 'bg-bg-tertiary/50 border-border-main text-text-muted';
  let greeting = 'Welcome, Guest. Login to access full features.';

  if (currentUser) {
    if (currentUser.role === 'dealer' || currentUser.role === 'admin') {
      identity = 'Showroom Owner';
      bannerColor = 'bg-amber-500/10 border-amber-500/20 text-amber-500';
      greeting = `Welcome back, ${currentUser.name || 'Owner'}. Your showroom dashboard is active.`;
    } else {
      identity = 'Registered User';
      bannerColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
      greeting = `Welcome back, ${currentUser.name || 'User'}. Explore personalized recommendations.`;
    }
  }

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 md:px-8 py-2 border-b flex items-center justify-between text-[10px] font-mono tracking-widest uppercase ${bannerColor} backdrop-blur-sm z-20 relative`}>
      <div className="flex items-center gap-2 font-black">
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
        {identity}
      </div>
      <div className="hidden sm:block opacity-80">{greeting}</div>
    </div>
  );
}
function App() {
  const navigate = useNavigate();
  const { renderPrice } = useCurrencyMode();

  // Bilingual support state with automatic browser detection
  const [lang, setLang] = useState<'en' | 'ur'>(() => {
    try {
      const savedLang = localStorage.getItem('bazar360_lang');
      if (savedLang === 'en' || savedLang === 'ur') {
        return savedLang;
      }
      // Check system/browser language
      const browserLang = typeof navigator !== 'undefined' ? (navigator.language || '').toLowerCase() : '';
      if (browserLang.startsWith('ur')) {
        return 'ur';
      }
    } catch (e) {
      console.warn('Locale storage access restricted, reverting to default English locale.');
    }
    return 'en';
  });

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ur' : 'en';
    setLang(nextLang);
    try {
      localStorage.setItem('bazar360_lang', nextLang);
    } catch (e) {}
  };

  // Splash Onboarding state disabled (gateway removed)
  const [showSplash, setShowSplash] = useState<boolean>(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  // Preselected car for Auto Choice Services Hub
  const [preselectedServiceCar, setPreselectedServiceCar] = useState<CarListing | null>(null);

  // Enterprise BAZAR360 Live Messaging State
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [messagingConvId, setMessagingConvId] = useState<string | undefined>(undefined);
  const [messagingRecipient, setMessagingRecipient] = useState<any>(undefined);
  const [messagingListing, setMessagingListing] = useState<any>(undefined);
  const [messagingService, setMessagingService] = useState<any>(undefined);
  const [messagingInitialMsg, setMessagingInitialMsg] = useState<string | undefined>(undefined);

  const handleOpenMessaging = (options?: {
    conversationId?: string;
    recipientUser?: any;
    relatedListing?: any;
    relatedService?: any;
    initialMessage?: string;
  }) => {
    setMessagingConvId(options?.conversationId);
    setMessagingRecipient(options?.recipientUser);
    setMessagingListing(options?.relatedListing);
    setMessagingService(options?.relatedService);
    setMessagingInitialMsg(options?.initialMessage);
    setIsMessagingOpen(true);
  };

  useEffect(() => {
    const handleOpenMessagingEvent = (e: any) => {
      handleOpenMessaging(e.detail);
    };
    window.addEventListener('open-b360-messaging', handleOpenMessagingEvent);
    return () => window.removeEventListener('open-b360-messaging', handleOpenMessagingEvent);
  }, []);

  useEffect(() => {
    const handleOpenService = (e: any) => {
      if (e.detail) {
        setPreselectedServiceCar(e.detail);
      }
      setSelectedListing(null);
      handleSetTab('services');
    };
    window.addEventListener('open-service-tab', handleOpenService);
    return () => window.removeEventListener('open-service-tab', handleOpenService);
  }, []);

  // Scroll tracking to show/hide the live price ticker on scroll down/up
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
  const lastScrollYRef = useRef<number>(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const lastScrollY = lastScrollYRef.current;

          // Only trigger state updates if the user has scrolled more than a threshold
          if (Math.abs(scrollY - lastScrollY) >= 5) {
            if (scrollY > lastScrollY && scrollY > 60) {
              setIsHeaderVisible(false);
            } else {
              setIsHeaderVisible(true);
            }
            lastScrollYRef.current = scrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const isDismissed = sessionStorage.getItem('bazar360_install_dismissed') === 'true';
      if (!isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);



  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Installation outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissInstall = () => {
    sessionStorage.setItem('bazar360_install_dismissed', 'true');
    setShowInstallBanner(false);
  };

  const getInitialStateFromUrl = () => {
    const hash = window.location.hash;
    let path = window.location.pathname;
    if (hash && hash.startsWith('#')) {
      path = hash.slice(1);
    }

    let tab = 'home';
    let dealerId = '';
    let listing: CarListing | null = null;
    let pendingListingId: string | null = null;

    const pending = sessionStorage.getItem('pendingTab');
    if (pending) {
      sessionStorage.removeItem('pendingTab');
      const validTabs = ['inventory', 'media', 'insights', 'concierge', 'dealers', 'sell', 'post-upload', 'portal', 'search', 'favorites', 'admin', 'community'];
      if (validTabs.includes(pending)) {
        return { tab: pending, dealerId, listing, pendingListingId };
      }
    }

    if (path.startsWith('/vehicle/')) {
      const vId = path.replace('/vehicle/', '').trim();
      if (vId) {
        pendingListingId = vId;
      }
    } else if (path.startsWith('/dealers/')) {
      const segments = path.split('/').filter(Boolean);
      const dId = segments[1];
      if (dId) {
        dealerId = dId;
        tab = 'dealer-storefront';
        if (segments[2] === 'listings' && segments[3]) {
          const lId = segments[3];
          pendingListingId = lId;
        }
      }
    } else if (path !== '/' && path !== '') {
      const tName = path.slice(1);
      const validTabs = ['inventory', 'media', 'insights', 'concierge', 'dealers', 'sell', 'post-upload', 'portal', 'search', 'favorites', 'admin', 'community'];
      if (validTabs.includes(tName)) {
        tab = tName;
      }
    }
    return { tab, dealerId, listing, pendingListingId };
  };

  // Active Session User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    let saved = null;
    try { saved = localStorage.getItem('bazar360_user'); } catch (e) { /* ignore */ }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // Migration: Auto-inject standard metadata fields required by the latest rules
          return {
            status: 'Active',
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            ...parsed
          };
        }
      } catch (e) {
        // Fallback
      }
    }
    // Default config: Allow visitors to experience the web catalog purely as guests/visitors.
    return null;
  });

  const initialState = getInitialStateFromUrl();

  const [currentTab, setTab] = useState<string>(initialState.tab);

  const handleSetTab = (newTab: string) => {
    if (newTab === 'sell' && !currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (newTab === 'hq-hub') {
      sessionStorage.setItem('openHQTab', 'true');
      const resolvedDealerId = currentUser?.salesPodId || currentUser?.dealerId || selectedDealerId || '';
      setSelectedDealerId(resolvedDealerId);
      setTab('dealer-storefront');
      navigate(`/showroom/${resolvedDealerId}`);
      return;
    }
    setTab(newTab);
  };

  const [prevTab, setPrevTab] = useState<string>('home');
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState<boolean>(false);
  const [contactDrawerInitialMessage, setContactDrawerInitialMessage] = useState<string>('');
  const [idToken, setIdToken] = useState<string | null>(null);

  // Direct Support Desk Drawer Interception for Contact Support tab
  useEffect(() => {
    if (currentTab === 'contact') {
      setIsContactDrawerOpen(true);
      setTab(prevTab);
    } else {
      setPrevTab(currentTab);
    }
  }, [currentTab, prevTab]);

  const [showroomSearch, setShowroomSearch] = useState<string>('');
  const [selectedDealerId, setSelectedDealerId] = useState<string>(initialState.dealerId);
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(initialState.listing);
  const [pendingListingId, setPendingListingId] = useState<string | null>(initialState.pendingListingId || null);
  const [vehicleNotFound, setVehicleNotFound] = useState<boolean>(false);

  // Scroll to top on page/tab/listing selection changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab, selectedListing, selectedDealerId]);
  const [activeDetailTab, setActiveDetailTab] = useState<'Design' | 'Safety' | 'Luxury' | 'Performance'>('Design');
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<CarListing[]>([]);
  const [favoritesList, setFavoritesList] = useState<CarListing[]>(() => {
    try {
      const saved = localStorage.getItem('bazar360_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [recentViewsList, setRecentViewsList] = useState<CarListing[]>(() => {
    return getRecentViewsOffline();
  });
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);
  const [selectedQrDealer, setSelectedQrDealer] = useState<Dealer | null>(null);
  const [qrCopied, setQrCopied] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);
  const [activeIndustry, setActiveIndustry] = useState<'Automotive' | 'Footwear' | 'Apparel' | 'Electronics'>('Automotive');
  const [currentCategory, setCurrentCategory] = useState<'gateway' | 'auto' | 'footwear' | 'food'>('auto');
  const [comingSoonSector, setComingSoonSector] = useState<{ title: string; tagline: string; desc: string; icon: string; spec: string } | null>(null);

  // Ecosystem Gateway gamified voting & notification registers
  const [votes, setVotes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('bazar360_votes');
      return saved ? JSON.parse(saved) : {
        architecture: 1104,
        wellness: 872,
        smartLiving: 615,
        logistics: 439
      };
    } catch (e) {
      return { architecture: 1104, wellness: 872, smartLiving: 615, logistics: 439 };
    }
  });

  const [userVoted, setUserVoted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bazar360_user_voted');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bazar360_notifications');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // State-controlled teaser voting & notifications
  const [teaserVotes, setTeaserVotes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bazar360_teaser_votes');
      return saved ? parseInt(saved, 10) : 1240;
    } catch {
      return 1240;
    }
  });
  const [userTeaserVoted, setUserTeaserVoted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bazar360_user_teaser_voted') === 'true';
    } catch {
      return false;
    }
  });
  const [teaserNotified, setTeaserNotified] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bazar360_teaser_notified') === 'true';
    } catch {
      return false;
    }
  });

  // Persist gamified registers
  useEffect(() => {
    try { localStorage.setItem('bazar360_votes', JSON.stringify(votes)); } catch (e) { /* ignore */ }
  }, [votes]);

  useEffect(() => {
    try { localStorage.setItem('bazar360_user_voted', JSON.stringify(userVoted)); } catch (e) { /* ignore */ }
  }, [userVoted]);

  useEffect(() => {
    try { localStorage.setItem('bazar360_notifications', JSON.stringify(notifications)); } catch (e) { /* ignore */ }
  }, [notifications]);

  useEffect(() => {
    try { localStorage.setItem('bazar360_teaser_votes', teaserVotes.toString()); } catch (e) { /* ignore */ }
  }, [teaserVotes]);

  useEffect(() => {
    try { localStorage.setItem('bazar360_user_teaser_voted', userTeaserVoted ? 'true' : 'false'); } catch (e) { /* ignore */ }
  }, [userTeaserVoted]);

  useEffect(() => {
    try { localStorage.setItem('bazar360_teaser_notified', teaserNotified ? 'true' : 'false'); } catch (e) { /* ignore */ }
  }, [teaserNotified]);

  // Dynamic Tagline Rotation Logic with Variant Titles & Sub-Taglines
  const [activeTaglineVariant, setActiveTaglineVariant] = useState<{title: string, sub: string}>({
    title: "COMING SOON: A LOT MORE",
    sub: "We are expanding from elite cars to everything you need. A complete mega marketplace is just around the corner."
  });
  // Suggestion Engine States
  const [suggestionText, setSuggestionText] = useState<string>('');
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState<boolean>(false);
  const [suggestionMessage, setSuggestionMessage] = useState<{ text: string, isError: boolean } | null>(null);

  const handleOnSubmitSuggestion = async () => {
    if (!suggestionText.trim()) return;
    setIsSubmittingSuggestion(true);
    setSuggestionMessage(null);
    try {
      const suggestionId = 'sug-' + Math.random().toString(36).substring(2, 11);
      const userId = auth.currentUser?.uid || null;
      await dbSaveSuggestion({
        id: suggestionId,
        user_id: userId,
        suggestion_text: suggestionText.trim(),
        submitted_at: new Date().toISOString()
      });
      setSuggestionText('');
      setSuggestionMessage({ text: 'Thank you! Your marketplace suggestion has been logged.', isError: false });
    } catch (e: any) {
      console.error(e);
      setSuggestionMessage({ text: 'Failed to submit suggestion. Please try again.', isError: true });
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  useEffect(() => {
    const variants = [
      {
        title: "COMING SOON: A LOT MORE",
        sub: "We are expanding from elite cars to everything you need. A complete mega marketplace is just around the corner."
      },
      {
        title: "THE ULTIMATE MEGA BAZAR",
        sub: "Moving fast beyond vehicles. Get ready to browse retail, wholesale, and daily essentials all under one roof."
      },
      {
        title: "FUTURE SECTORS UNLOCKING",
        sub: "Your favorite stores are moving digital. Vote for your favorite category below to speed up the launch."
      }
    ];
    // Select exactly one variant tagline object upon page load/visit
    const randomIndex = Math.floor(Math.random() * variants.length);
    setActiveTaglineVariant(variants[randomIndex]);
  }, []);

  const handleSetCategory = (cat: 'gateway' | 'auto' | 'footwear' | 'food') => {
    // RAM memory reset protocols: Completely flush comparison list, search text, and filter selections.
    setCompareList([]);
    setSearchQuery('');
    setSelectedCategory('All');
    if (cat === 'gateway') {
      setCurrentCategory('auto');
    } else {
      setCurrentCategory(cat);
    }
  };

  const handleToggleCompare = (car: CarListing) => {
    setCompareList((prev) => {
      const exists = prev.some(item => item.id === car.id);
      if (exists) {
        return prev.filter(item => item.id !== car.id);
      }
      if (prev.length >= 2) {
        return [prev[1], car];
      }
      return [...prev, car];
    });
  };

  const handleToggleFavorite = async (car: CarListing) => {
    const isFav = favoritesList.some((f) => f.id === car.id);
    let updated: CarListing[];
    if (isFav) {
      updated = favoritesList.filter((f) => f.id !== car.id);
    } else {
      updated = [...favoritesList, car];
    }
    setFavoritesList(updated);
    localStorage.setItem('bazar360_favorites', JSON.stringify(updated));

    if (currentUser?.uid) {
      try {
        await dbToggleFavorite(currentUser.uid, car.id, !isFav);
      } catch (err) {
        console.warn('Error saving favorite to DB:', err);
      }
    }
  };

  const handleSelectListing = (car: CarListing) => {
    setSelectedListing(car);
    setOfferSuccessMessage('');

    // Save to offline-first recently viewed list & pre-cache images
    const updated = saveRecentViewOffline(car);
    setRecentViewsList(updated);

    if (currentUser?.uid) {
      dbSaveRecentView({
        id: `view-${currentUser.uid}-${car.id}`,
        userId: currentUser.uid,
        vehicleId: car.id,
        viewedAt: new Date().toISOString(),
        carTitle: car.title,
        price: car.price,
        imageUrl: car.imageUrl
      }).catch((err) => console.warn('Error saving view to DB:', err));
    }
  };

  // Dynamic States
  const [listings, setListings] = useState<CarListing[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});
  const [dbLoading, setDbLoading] = useState<boolean>(true);

  // Parse '?listing=ID' to open detailed modal
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const listingId = searchParams.get('listing');
    if (listingId && listings.length > 0) {
      const found = listings.find(v => v.id === listingId);
      if (found) {
        setSelectedListing(found);
      }
    }
  }, [window.location.search, listings]);

  // Bidirectional SPA Routing and browser history synchronization engine
  useEffect(() => {
    if (pendingListingId) return; // Prevent overwriting URL while dynamic list is loading

    // 1. Compute target pathname based on current state variables
    let targetPath = '/';
    if (selectedListing) {
      const isIndiv = selectedListing.dealerId === 'private' || selectedListing.sellerType === 'Individual' || selectedListing.id === 'listing-1784821782501' || selectedListing.id === 'listing-1784821585212';
      targetPath = `/dealers/${isIndiv ? 'private' : (selectedListing.dealerId || 'private')}/listings/${selectedListing.id}`;
    } else if (currentTab === 'dealer-storefront' && selectedDealerId) {
      targetPath = `/dealers/${selectedDealerId}`;
    } else if (currentTab !== 'home') {
      targetPath = `/${currentTab}`;
    }

    // 2. Reflect state changes in browser URL bar if needed
    if (window.location.pathname !== targetPath) {
      try {
        window.history.pushState(null, '', targetPath);
      } catch (e) {
        // Suppress security block warnings inside restricted sandbox contexts
        console.warn('Navigation state sync bypassed due to sandbox restrictions:', e);
      }
    }
  }, [currentTab, selectedDealerId, selectedListing, pendingListingId]);

  useEffect(() => {
    // 3. Handle back/forward buttons (popstate/hashchange event) or direct links and match state to URL
    const parseUrl = () => {
      const hash = window.location.hash;
      let path = window.location.pathname;
      if (hash && hash.startsWith('#')) {
        path = hash.slice(1);
      }
      
      if (path === '/' || path === '') {
        setTab('home');
        setSelectedListing(null);
        setPendingListingId(null);
        setVehicleNotFound(false);
      } else if (path.startsWith('/vehicle/')) {
        const vId = path.replace('/vehicle/', '').trim();
        if (vId) {
          const targetSlug = vId.toLowerCase();
          const found = listings.find(l => {
            if (!l) return false;
            if (l.id === vId) return true;
            const carSlug = `${l.make || ''}-${l.model || ''}-${l.year || ''}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            if (carSlug === targetSlug) return true;
            const titleSlug = (l.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            if (titleSlug === targetSlug) return true;
            return false;
          });
          if (found) {
            setSelectedListing(found);
            setSelectedDealerId(found.dealerId || '');
            setPendingListingId(null);
            setVehicleNotFound(false);
          } else {
            setPendingListingId(vId);
          }
        }
      } else if (path.startsWith('/dealers/')) {
        const segments = path.split('/').filter(Boolean);
        const dId = segments[1];
        if (dId) {
          if (segments[2] === 'listings' && segments[3]) {
            const lId = segments[3];
            const found = listings.find(l => l.id === lId);
            if (found) {
              setSelectedListing(found);
              setSelectedDealerId(dId);
              setTab('dealer-storefront');
              setPendingListingId(null);
              setVehicleNotFound(false);
            } else {
              setPendingListingId(lId);
              setSelectedDealerId(dId);
              setTab('dealer-storefront');
            }
          } else {
            setSelectedDealerId(dId);
            setTab('dealer-storefront');
            setSelectedListing(null);
            setVehicleNotFound(false);
          }
        }
      } else {
        const tName = path.slice(1);
        const validTabs = ['inventory', 'media', 'insights', 'concierge', 'dealers', 'sell', 'portal', 'search'];
        if (validTabs.includes(tName)) {
          setTab(tName);
          setSelectedListing(null);
          setVehicleNotFound(false);
        }
      }
    };

    window.addEventListener('popstate', parseUrl);
    window.addEventListener('hashchange', parseUrl);
    
    // Parse on initial load or transition when database listings/dealers populate
    parseUrl();

    return () => {
      window.removeEventListener('popstate', parseUrl);
      window.removeEventListener('hashchange', parseUrl);
    };
  }, [listings]);

  // Synchronize dynamic listing if we had a pending ID from route parsing on mount or popstate
  useEffect(() => {
    if (!pendingListingId) return;

    let isMounted = true;
    const targetSlug = pendingListingId.toLowerCase();
    const foundInList = listings.find((l) => {
      if (!l) return false;
      if (l.id === pendingListingId) return true;
      const carSlug = `${l.make || ''}-${l.model || ''}-${l.year || ''}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (carSlug === targetSlug) return true;
      const titleSlug = (l.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (titleSlug === targetSlug) return true;
      return false;
    });

    if (foundInList) {
      setSelectedListing(foundInList);
      setSelectedDealerId(foundInList.dealerId || '');
      setPendingListingId(null);
      setVehicleNotFound(false);
      return;
    }

    dbFetchListingById(pendingListingId).then((fetched) => {
      if (!isMounted) return;
      if (fetched) {
        setSelectedListing(fetched);
        setSelectedDealerId(fetched.dealerId || '');
        setVehicleNotFound(false);
      } else {
        setVehicleNotFound(true);
      }
      setPendingListingId(null);
    }).catch(() => {
      if (isMounted) {
        setVehicleNotFound(true);
        setPendingListingId(null);
      }
    });

    return () => { isMounted = false; };
  }, [pendingListingId, listings]);

  // Automatically scroll to top on tab, showroom, or vehicle detail page switches
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab, selectedDealerId, selectedListing]);

  // Filter trackers
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Memory and Media Optimization: Switch categories wipes comparisons to reclaim RAM
  useEffect(() => {
    if (compareList.length > 0) {
      console.log("[BAZAR360 Memory Safe] Tenant category shift. Wiping active auto comparison arrays...");
      setCompareList([]);
    }
  }, [selectedCategory]);

  // Automated Visitor clickstream tracking for vehicle views
  useEffect(() => {
    if (selectedListing) {
      trackVehicleView(selectedListing.id).catch(err => console.warn('Vehicle view track bypass:', err));
      dbTrackShowroomEvent(selectedListing.dealerId, 'view', selectedListing.id, selectedListing.title).catch(err => console.warn('Showroom view track bypass:', err));
    }
  }, [selectedListing]);

  // Automated Visitor debounced clickstream tracking for search keywords
  useEffect(() => {
    if (searchQuery.trim().length > 3) {
      const timer = setTimeout(() => {
        trackSearchQuery(searchQuery.trim()).catch(err => console.warn('Search query track bypass:', err));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Bid interaction state inside Detail modal
  const [offerInput, setOfferInput] = useState('');
  const [offerSuccessMessage, setOfferSuccessMessage] = useState('');

  // Sync session profile to standard storage
  useEffect(() => {
    if (currentUser) {
      try { localStorage.setItem('bazar360_user', JSON.stringify(currentUser)); } catch (e) { /* ignore */ }
      // Save profile to database
      dbSaveUserProfile(currentUser).catch(err => console.warn('Bypass profile save:', err));
    } else {
      try { localStorage.removeItem('bazar360_user'); } catch (e) { /* ignore */ }
    }
  }, [currentUser]);

  // Initial Sync and Data Loading workflow
  useEffect(() => {
    async function initDatabase() {
      setDbLoading(true);
      
      let timerId: any;
      type InitResult = 
        | { isTimeout: true; dealers?: undefined; listings?: undefined; reviewsMap?: undefined }
        | { isTimeout: false; dealers: Dealer[]; listings: CarListing[]; reviewsMap: Record<string, Review[]> };

      const timeoutPromise = new Promise<InitResult>((resolve) => {
        timerId = setTimeout(() => resolve({ isTimeout: true }), 15000);
      });

      try {
        const result = await Promise.race([
          (async () => {
            const [fetchedDealers, fetchedListings] = await Promise.all([
              dbFetchDealers().catch(() => []),
              dbFetchListings().catch(() => [])
            ]);
            
            // Global filtering engine: filter out any invalid or placeholder listings
            const filterCleanListings = (list: CarListing[]) => {
              if (!Array.isArray(list)) return [];
              return list.filter(l => {
                if (!l) return false;
                const t = (l.title || '').toLowerCase();
                const d = (l.description || '').toLowerCase();
                const m = (l.make || '').toLowerCase();
                const mod = (l.model || '').toLowerCase();
                const tags = Array.isArray(l.tags) ? l.tags.map(tag => (tag || '').toLowerCase()) : [];
                const unwanted = ['dummy', 'test', 'placeholder', 'duplicate'];
                return !unwanted.some(word => t.includes(word) || d.includes(word) || m.includes(word) || mod.includes(word) || tags.some(tag => tag.includes(word)));
              });
            };

            const cleanedListings = filterCleanListings(fetchedListings);
            const sortedListings = [...cleanedListings].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
            
            // Concurrently load dealer reviews
            const revsRecord: Record<string, Review[]> = {};
            const dealersList = Array.isArray(fetchedDealers) ? fetchedDealers : [];
            await Promise.all(
              dealersList.map(async (dl) => {
                const revs = await dbFetchReviews(dl.id).catch(() => []);
                revsRecord[dl.id] = revs;
              })
            );
            
            return { isTimeout: false as const, dealers: dealersList, listings: sortedListings, reviewsMap: revsRecord };
          })(),
          timeoutPromise
        ]);

        clearTimeout(timerId);

        if (result.isTimeout) {
          console.warn('Sandbox local sync notice: request timed out.');
          setDealers([]);
          setListings([]);
          setReviewsMap({});
        } else {
          setDealers(result.dealers);
          setListings(result.listings);
          setReviewsMap(result.reviewsMap);
        }
      } catch (err) {
        console.warn('Sandbox local sync fallback activated due to:', err);
        setDealers([]);
        setListings([]);
        
        setReviewsMap({});
      } finally {
        setDbLoading(false);
      }
    }
    initDatabase().then(() => {
      initializeVisitorTracking().catch(err => console.warn('Visitor tracking engine bypass:', err));
    });
  }, []);

  // Listen for Firebase Auth state changes to sync active user profile details
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("Firebase Auth active session detected for UID:", firebaseUser.uid);
        try {
          // Fetch secure JWT ID token for server-side API authorization
          const token = await firebaseUser.getIdToken().catch(() => null);
          setIdToken(token);

          let fetchedProfile = await dbFetchUserProfile(firebaseUser.uid);
          const isAmjid = firebaseUser.email === 'amjid.bisconni@gmail.com' || firebaseUser.email === 'amjid.psh@gmail.com';
          const isGhani = firebaseUser.email === 'khattakghani94@gmail.com';
          const isMalak = firebaseUser.email === 'mazharsouls@gmail.com';

          let localProfile: UserProfile | null = null;
          try {
            const saved = localStorage.getItem('bazar360_user');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed && (parsed.uid === firebaseUser.uid || parsed.email === firebaseUser.email)) {
                localProfile = parsed;
              }
            }
          } catch (e) {}

          let activeProfile: UserProfile;

          if (fetchedProfile) {
            // Firestore fetched profile is the absolute source of truth
            const photo = fetchedProfile.photoURL || fetchedProfile.profilePhoto || firebaseUser.photoURL || '';
            activeProfile = {
              ...fetchedProfile,
              displayName: fetchedProfile.displayName || firebaseUser.displayName || (isMalak ? 'Malak Mazhar' : (isGhani ? 'Ghani Khan (Admin)' : 'Muhammad Amjid (Founder)')),
              phoneNumber: fetchedProfile.phoneNumber || firebaseUser.phoneNumber || '',
              city: fetchedProfile.city || 'Peshawar',
              photoURL: photo,
              profilePhoto: photo,
              createdAt: fetchedProfile.createdAt || (firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime).toISOString() : new Date().toISOString())
            };

            if (isAmjid || isGhani) {
              if (activeProfile.role !== 'Admin') {
                activeProfile.role = 'Admin';
              }
            } else if (isMalak) {
              if (activeProfile.role !== 'Dealer') {
                activeProfile.role = 'Dealer';
              }
            }

            setCurrentUser(activeProfile);
            try { localStorage.setItem('bazar360_user', JSON.stringify(activeProfile)); } catch (e) {}

            // Update lastLogin without overwriting the rest of the profile
            dbUpdateProfile(firebaseUser.uid, { lastLogin: new Date().toISOString() }).catch(err => console.warn("Last login update skip:", err));

          } else if (localProfile && localProfile.uid === firebaseUser.uid) {
            activeProfile = { ...localProfile };
            setCurrentUser(activeProfile);
            dbSaveUserProfile(activeProfile).catch(err => console.warn("Profile persistence sync skip:", err));
          } else {
            // First-time signup fallback: create a robust, rules-compliant profile
            const photo = firebaseUser.photoURL || '';
            activeProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || 'amjid.bisconni@gmail.com',
              displayName: firebaseUser.displayName || (isMalak ? 'Malak Mazhar' : (isGhani ? 'Ghani Khan (Admin)' : 'Muhammad Amjid (Founder)')),
              phoneNumber: firebaseUser.phoneNumber || (isMalak ? '+923159085086' : (isGhani ? '+92 355 6908995' : '+92 314 3600000')),
              photoURL: photo,
              profilePhoto: photo,
              phoneVerified: isMalak || isGhani || !!firebaseUser.phoneNumber,
              city: (isMalak || isGhani) ? 'Peshawar' : 'Lahore',
              state: (isMalak || isGhani) ? 'Khyber Pakhtunkhwa' : 'Punjab',
              role: isMalak ? 'Dealer' : ((isAmjid || isGhani) ? 'Admin' : 'Buyer'),
              status: 'Active',
              socials: {
                facebook: 'https://facebook.com/amjid.bazar360',
                instagram: 'https://instagram.com/amjid_b360'
              },
              createdAt: firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime).toISOString() : new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              region: 'Lahore'
            };

            setCurrentUser(activeProfile);
            try { localStorage.setItem('bazar360_user', JSON.stringify(activeProfile)); } catch (e) {}
            await dbSaveUserProfile(activeProfile).catch(err => console.warn("Profile persistence sync skip:", err));
          }
        } catch (err) {
          console.error("Auth state loading error:", err);
        }
      } else {
        console.log("No active Firebase Auth session. App running in offline guest mode.");
        setIdToken(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to profile updates to invalidate state cache and update immediately
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentUser(customEvent.detail);
      }
    };
    window.addEventListener('bazar360_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('bazar360_profile_updated', handleProfileUpdate);
    };
  }, []);

  const requestLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleLogout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (err) {
      console.warn("Silent auth signout warning:", err);
    }
    setCurrentUser(null);
    try { localStorage.removeItem('bazar360_user'); } catch (e) { /* ignore */ }
    setTab('home');
    setIsLogoutConfirmOpen(false);
  };

  const handleRoleSwap = (role: 'Admin' | 'Showroom Owner' | 'Private Seller') => {
    if (!currentUser) return;
    
    let displayName = 'Muhammad Amjid';
    let salesPodId: string | undefined = undefined;
    if (role === 'Admin') {
      displayName = 'Muhammad Amjid (Founder)';
    } else if (role === 'Showroom Owner') {
      displayName = 'Muhammad Amjid (Founder / Showroom Owner)';
      salesPodId = ''; // Hard link to Auto Choice Peshawar for live sandbox tests!
    } else if (role === 'Private Seller') {
      displayName = 'Muhammad Amjid (Founder / Private Seller)';
    }
    
    const updatedUser: UserProfile = {
      ...currentUser,
      role,
      displayName,
      salesPodId
    };
    
    setCurrentUser(updatedUser);
  };

  const onSelectDealer = (id: string) => {
    setSelectedDealerId(id);
    setTab('dealer-storefront');
    navigate(`/showroom/${id}`);
  };

  const handleAddListing = async (newListing: CarListing) => {
    // 1. Determine permission default values: Only Super Admins have listings auto-approved by default
    const isApprovedByDefault = currentUser?.role === 'Admin';
    
    // Strict isolation: non-showroom users (not Showroom Owner/Dealer) are forced to have 'private' dealerId
    const isShowroomUser = currentUser?.role === 'Showroom Owner' || currentUser?.role === 'Dealer';
    const resolvedDealerId = isShowroomUser && currentUser?.salesPodId ? currentUser.salesPodId : 'private';

    const finalListing: CarListing = {
      ...newListing,
      approved: isApprovedByDefault,
      assignedSalesRepId: currentUser?.uid || 'guest-seller',
      createdBy: currentUser?.uid || 'guest-seller',
      dealerId: resolvedDealerId,
      sellerType: resolvedDealerId === 'private' ? 'Individual' : 'Showroom',
      sellerName: newListing.sellerName || currentUser?.displayName || 'Individual Seller',
      sellerPhone: newListing.sellerPhone || currentUser?.phoneNumber || '',
      createdAt: new Date().toISOString()
    };

    // 2. Commit to database
    try {
      await dbSaveListing(finalListing);
    } catch (err) {
      console.warn(err);
    }

    // 3. Update React views instantly
    setListings((prev) => [finalListing, ...prev]);

    if (finalListing.dealerId !== 'private') {
      setDealers((prevDealers) =>
        prevDealers.map((d) =>
          d.id === finalListing.dealerId
            ? { ...d, vehiclesCount: d.vehiclesCount + 1 }
            : d
        )
      );
    }
  };

  const handleApproveListing = async (listingId: string) => {
    if (!isAdminUser(currentUser) && !isAuthorized(currentUser, 'approve')) {
      toast.error('Access Denied: Admin or Showroom Manager privileges required to approve listings.');
      return;
    }
    try {
      await dbApproveListing(listingId, true);
      toast.success('Listing approved successfully!');
    } catch (err) {
      console.warn(err);
    }
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, approved: true } : l))
    );
  };

  const handleRejectListing = async (listingId: string) => {
    if (!isAdminUser(currentUser) && !isAuthorized(currentUser, 'reject')) {
      toast.error('Access Denied: Admin privileges required to reject or delete listings.');
      return;
    }
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await deleteDoc(doc(db, 'listings', listingId));
      toast.success('Listing rejected and removed.');
    } catch (err) {
      console.warn(err);
    }
    setListings((prev) => prev.filter((l) => l.id !== listingId));
  };

  const handleAddReview = async (comment: string, rating: number) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: currentUser?.displayName || 'Aamir G. (Verified Buyer)',
      rating,
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      comment,
    };

    try {
      await dbAddReview(selectedDealerId, newRev);
    } catch (err) {
      console.warn(err);
    }

    setReviewsMap((prev) => ({
      ...prev,
      [selectedDealerId]: [newRev, ...(prev[selectedDealerId] || [])],
    }));

    // Re-average rating inside dealers state
    setDealers((prevDealers) =>
      prevDealers.map((d) => {
        if (d.id === selectedDealerId) {
          const currentReviews = reviewsMap[selectedDealerId] || [];
          const allRatings = [rating, ...currentReviews.map((r) => r.rating)];
          const sum = allRatings.reduce((acc, curr) => acc + curr, 0);
          const computedAvg = parseFloat((sum / allRatings.length).toFixed(1));
          return { ...d, rating: computedAvg };
        }
        return d;
      })
    );
  };

  const handlePublishActivity = async (dealerId: string, post: any) => {
    if (!canManageShowroom(currentUser, dealerId) && !isAdminUser(currentUser)) {
      toast.error('Access Denied: You must be the showroom manager or admin to publish posts.');
      return;
    }
    setDealers((prevDealers) =>
      prevDealers.map((d) =>
        d.id === dealerId
          ? { ...d, activityFeed: [post, ...(d.activityFeed || [])] }
          : d
      )
    );

    try {
      const { doc, getDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      const dealerRef = doc(db, 'dealers', dealerId);
      const dSnap = await getDoc(dealerRef);
      if (dSnap.exists()) {
        const dData = dSnap.data();
        const currentFeed = dData.activityFeed || [];
        await updateDoc(dealerRef, {
          activityFeed: [post, ...currentFeed],
          updatedAt: new Date().toISOString()
        });
        toast.success('Showroom activity published live!');
      }
    } catch (err) {
      console.warn('Silent activity feed persistence warning:', err);
    }
  };

  const handleApproveActivity = async (dealerId: string, postId: string) => {
    setDealers((prevDealers) =>
      prevDealers.map((d) => {
        if (d.id === dealerId) {
          const updatedFeed = (d.activityFeed || []).map((post) =>
            post.id === postId ? { ...post, status: 'approved' as const } : post
          );
          return { ...d, activityFeed: updatedFeed };
        }
        return d;
      })
    );

    try {
      const { doc, getDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      const dealerRef = doc(db, 'dealers', dealerId);
      const dSnap = await getDoc(dealerRef);
      if (dSnap.exists()) {
        const dData = dSnap.data();
        const currentFeed = dData.activityFeed || [];
        const updatedFeed = currentFeed.map((post: any) =>
          post.id === postId ? { ...post, status: 'approved' } : post
        );
        await updateDoc(dealerRef, {
          activityFeed: updatedFeed,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Silent activity feed approval persistence warning:', err);
    }
  };

  const currentDealer = dealers.find((d) => d.id === selectedDealerId) || dealers[0];

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerInput.trim()) return;
    
    const bidAmount = parseInt(offerInput) || 0;
    const listingDealer = dealers.find((d) => d.id === selectedListing?.dealerId);

    // Save persistent Bargain Bid in real-time to Firestore database
    import('./lib/dbService').then(({ dbSaveBargain }) => {
      if (selectedListing) {
        dbSaveBargain({
          id: `offer-${Date.now()}`,
          listingId: selectedListing.id,
          vehicleTitle: selectedListing.title,
          bidAmount,
          buyerName: currentUser?.displayName || 'Guest Bargain Bidder',
          buyerPhone: currentUser?.phoneNumber || '+92 314 3601212',
          buyerEmail: currentUser?.email || 'prospect.buyer@bazar360.online',
          dealerId: selectedListing.dealerId || 'private',
          status: 'Pending',
          createdAt: new Date().toISOString()
        });
      }
    });

    setOfferSuccessMessage(
      `✓ Dynamic Offer of Rs. ${bidAmount.toLocaleString()} submitted successfully! ${
        listingDealer?.name || 'Seller'
      } is processing your proposal.`
    );
    setOfferInput('');
    setTimeout(() => {
      setOfferSuccessMessage('');
    }, 5000);
  };

  // RBAC query view filtering based on permissions
  const visibleListings = listings.filter((l) => {
    if (l.approved !== false) return true; // Show all approved listings
    // Non-approved listings only visible to Admins, Showroom Owners, or the listing author
    const isModerator = currentUser?.role === 'Admin' || currentUser?.role === 'Showroom Owner';
    const isOwner = currentUser && l.assignedSalesRepId === currentUser.uid;
    return isModerator || isOwner;
  });

  // Flagship Priority Injection: Sort  entries to the absolute top of everything
  const prioritizedListings = React.useMemo(() => {
    const flagshipListings = visibleListings.filter(l => l.dealerId === '');
    const ordinaryListings = visibleListings.filter(l => l.dealerId !== '');
    return [...flagshipListings, ...ordinaryListings];
  }, [visibleListings]);

  if (currentCategory === 'gateway') {
    const handleVote = (sectorId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (userVoted[sectorId]) {
        setVotes(prev => ({ ...prev, [sectorId]: prev[sectorId] - 1 }));
        setUserVoted(prev => ({ ...prev, [sectorId]: false }));
      } else {
        setVotes(prev => ({ ...prev, [sectorId]: prev[sectorId] + 1 }));
        setUserVoted(prev => ({ ...prev, [sectorId]: true }));
      }
    };

    const handleToggleNotify = (sectorId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setNotifications(prev => ({ ...prev, [sectorId]: !prev[sectorId] }));
    };

    const upcomingSectors = [
      {
        id: 'architecture',
        title: "Next-Gen Spaces",
        tagline: "Sourcing residential penthouses, sustainable designer villas, and smart buildings.",
        desc: "A digitized architectural directory tracking state-of-the-art developments, luxury master plans, and tokenized occupancy pipelines across metropolis zones.",
        icon: "🏢",
        badge: "In Active Seeding",
        glowColor: "cyan",
      },
      {
        id: 'wellness',
        title: "Premium Wellness",
        tagline: "Advanced tele-consultation pairings, certified diagnostics and pharmacy options.",
        desc: "Connecting local medical registries, genuine pharmaceutical fulfillment workflows, and smart electronic diagnostics records with compliance indicators.",
        icon: "🏥",
        badge: "In Ideation Node",
        glowColor: "purple",
      },
      {
        id: 'smartLiving',
        title: "Smart Living",
        tagline: "Artificial intelligence-backed high precision automated smart home upgrades.",
        desc: "Certified appliance catalogs, customized low-voltage layout optimization services, and solar array performance indexing panels.",
        icon: "⚡",
        badge: "Research Channel",
        glowColor: "emerald",
      },
      {
        id: 'logistics',
        title: "Logistics Hub",
        tagline: "Next-generation secure commercial routes, fleets and priority delivery lines.",
        desc: "Enterprise freight synchronization matrices, heavy-machinery transfers tracking, and automated container dispatch routing channels.",
        icon: "📦",
        badge: "In Incubation",
        glowColor: "orange",
      }
    ];

    return (
      <div className="bg-[var(--color-bg-primary)] text-[var(--color-text-main)] min-h-screen text-sm font-sans flex flex-col justify-start py-6 px-4 md:px-8 relative overflow-y-auto select-none">
        {/* Subtle, Sophisticated Background Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-accent-main)]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none opacity-85"></div>

        <IdentityBanner currentUser={currentUser} />
        {/* 1. REFINED PREMIUM STICKY BACKDROP-BLUR GATEWAY NAVBAR */}
        {currentTab !== 'dealer-storefront' && (
          <header className="hidden md:flex w-full items-center justify-between py-3.5 border-b border-white/10 relative z-50 mb-3 max-w-7xl mx-auto shrink-0 bg-[var(--color-bg-primary)]/90 backdrop-blur-xl sticky top-0 px-4 md:px-8 rounded-b-2xl shadow-xl">
            {/* Core Branding with Continuous Rolling Motion Animation */}
            <div className="cursor-pointer select-none shrink-0" onClick={() => setTab('home')}>
              <AnimatedLogoCycler />
            </div>

            {/* Main Desktop Tabs */}
            <nav className="flex items-center gap-5">
              <button onClick={() => setTab('inventory')} className={`text-[11px] font-black uppercase tracking-wider transition-colors ${currentTab === 'inventory' ? 'text-[var(--color-accent-main)]' : 'text-text-muted hover:text-[var(--color-text-header)]'}`}>Inventory</button>
              <button onClick={() => setTab('dealers')} className={`text-[11px] font-black uppercase tracking-wider transition-colors ${currentTab === 'dealers' ? 'text-[var(--color-accent-main)]' : 'text-text-muted hover:text-[var(--color-text-header)]'}`}>Showrooms</button>
              
              {/* Prominent CTA for Post Ad */}
              <button
                onClick={() => setTab('sell')}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-[var(--color-text-header)] rounded-lg text-[11px] font-mono font-black tracking-wider uppercase transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <PlusCircle size={14} />
                <span>Post Ad</span>
              </button>

              {currentUser ? (
                <button 
                  onClick={() => setTab('profile')} 
                  className="flex items-center gap-2 bg-bg-secondary/80 hover:bg-bg-tertiary/90 border border-white/20 px-3 py-1.5 rounded-xl cursor-pointer shadow-lg transition-all active:scale-95 group backdrop-blur-md"
                  title="Click to manage profile, showroom settings or admin controls"
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-emerald-600/50 bg-bg-primary shrink-0 shadow-sm">
                    {currentUser.photoURL || (currentUser as any).avatar ? (
                      <img 
                        src={getOptimizedUrl(currentUser.photoURL || (currentUser as any).avatar, { width: 120, height: 120, quality: 'auto:best' })} 
                        alt={currentUser.displayName || 'User Profile'} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-emerald-600 via-amber-500 to-red-600 flex items-center justify-center text-[var(--color-text-header)] font-black text-[11px] font-mono">
                        {(currentUser.displayName || (currentUser as any).name || currentUser.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-black text-[var(--color-text-header)] leading-none max-w-[100px] truncate group-hover:text-orange-400 transition-colors">
                      {currentUser.displayName || (currentUser as any).name || 'My Profile'}
                    </span>
                    <span className="text-[8px] font-mono font-black text-orange-400 uppercase tracking-wider leading-none mt-0.5">
                      {String(currentUser.role).toLowerCase().includes('admin') ? '⚡ ADMIN ACCESS' : String(currentUser.role).toLowerCase().includes('showroom') || String(currentUser.role).toLowerCase().includes('dealer') ? '🏢 SHOWROOM HQ' : '👤 INDIVIDUAL'}
                    </span>
                  </div>
                </button>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)} 
                  className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-text-main hover:text-[var(--color-text-header)] transition-colors bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer border border-amber-300/30"
                >
                  <LogIn size={13} className="stroke-[2.5]" />
                  <span>Login / Register</span>
                </button>
              )}

              {/* Official Contact Numbers embedded directly in sticky header */}
              <div className="flex flex-col text-[9.5px] font-mono leading-tight border-l border-white/10 pl-4 ml-1 text-right">
                <a 
                  href="tel:+923159085086" 
                  className="font-bold text-[var(--color-accent-main)] hover:text-cyan-300 transition-colors flex items-center gap-1 justify-end"
                  title="Call Malak Mazhar"
                >
                  <Phone size={10} className="text-[var(--color-accent-main)]" />
                  <span>Mazhar: +92 315 9085086</span>
                </a>
                <a 
                  href="tel:+923149198403" 
                  className="font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1 justify-end mt-0.5"
                  title="Call Muhammad Amjid"
                >
                  <Phone size={10} className="text-orange-500" />
                  <span>Amjid: 03149198403</span>
                </a>
              </div>

            </nav>
          </header>
        )}

        {/* Hero Console (Redesigned with Premium Dark Pairings) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center mt-1 mb-4 space-y-2 relative z-10 max-w-2xl mx-auto shrink-0"
        >
          <span className="text-[9px] uppercase font-mono font-black tracking-[0.25em] text-[var(--color-accent-main)] bg-[var(--color-accent-main)]/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">
            ★ Pakistan's Trusted Automotive Marketplace
          </span>
          <h1 className="text-2xl md:text-3.5xl lg:text-4xl font-black tracking-tight text-[var(--color-text-header)] uppercase leading-tight md:leading-snug">
            Unified Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-main)] to-emerald-600">Ecosystem Gateway</span>
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-xl">
            Seamless access to certified dealer inventories, direct buyer-seller chat routes, visitor intelligence models, and localized financial pipelines.
          </p>
        </motion.div>

        {/* Redesigned 2-Column Responsive Layout Grid (Polished Dark Slate Cards) */}
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch relative z-10 px-4 mb-6 animate-fade-in">
          
          {/* Column 1: FLAGSHIP AUTOMOTIVE SECTOR */}
          <div className="space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between px-1 shrink-0">
              <span className="text-[10px] font-mono tracking-widest text-[var(--color-accent-main)] uppercase font-black">
                ● FLAGSHIP DIVISION LIVE
              </span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono px-2.5 py-0.5 border border-emerald-500/20 rounded-md font-black tracking-widest uppercase">
                100% Verified
              </span>
            </div>

            <div 
              onClick={() => handleSetCategory('auto')}
              className="flex-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[var(--color-accent-main)]/30 hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer group select-none relative overflow-hidden"
            >
              {/* Decorative Subtle Overlay Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(var(--color-accent-main)_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-5"></div>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#1E293B]/50 to-transparent pointer-events-none"></div>

              <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-start">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-mono text-orange-400 font-black tracking-widest uppercase bg-emerald-600/10 px-3 py-1 rounded-lg border border-emerald-600/20">
                    SECTOR 01 • ACTIVE MARKET
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-accent-main)] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>1,452 Connected Sellers</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-black text-xl uppercase tracking-widest text-[var(--color-text-main)] hover:text-emerald-600 transition-colors flex items-center gap-1">Bazar360 <span className="text-emerald-600">.</span></span>
                </div>

                <p className="text-gray-400 text-xs leading-relaxed font-sans text-left flex-1 min-h-0 overflow-y-auto no-scrollbar py-1">
                  Experience Pakistan’s elite digitized automotive platform. Browse certified SUVs, premium electric sedans, and high-performance imports with live valuation matrices, secure direct trade options, and instant spot-inspection alignments in Peshawar.
                </p>

                {/* Styled Vehicle Vector Graphic in premium dark colors */}
                <div className="py-2 opacity-85 group-hover:opacity-100 transition-opacity duration-300 shrink-0 hidden sm:block">
                  <svg className="w-full h-12 text-[var(--color-accent-main)]/15 group-hover:text-[var(--color-accent-main)]/25 transition-colors" viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 28 C 10 24, 25 24, 30 18 L 45 10 C 50 8, 70 8, 75 14 L 90 20 C 105 20, 110 24, 110 28 Z" />
                    <circle cx="30" cy="28" r="5" fill="#1E293B" stroke="currentColor" strokeWidth="2" />
                    <circle cx="85" cy="28" r="5" fill="#1E293B" stroke="currentColor" strokeWidth="2" />
                    <path d="M5 28 L 115 28" strokeWidth="0.8" strokeDasharray="3,3" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--color-border-main)] pt-3 mt-3 relative z-10 w-full shrink-0">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase group-hover:text-[var(--color-accent-main)] transition-colors">
                  Tap anywhere to launch portal
                </span>
                <div className="bg-[var(--color-accent-main)] text-[var(--color-text-header)] rounded-xl px-4 py-2 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-sky-600/10 group-hover:bg-[var(--color-accent-hover)] transition-all active:scale-[0.98]">
                  <span>Access Showroom</span>
                  <span className="text-base">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: FUTURE DIVISION PIPELINES (BENTO CARD OVERHAUL) */}
          <div className="space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between px-1 shrink-0">
              <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase font-black flex items-center gap-1.5">
                ★ SECURED SATELLITE PIPELINES
              </span>
              <span className="text-[9px] bg-emerald-600/10 text-orange-400 font-mono px-2.5 py-0.5 border border-emerald-600/20 rounded-md font-black tracking-widest uppercase">
                Nationwide Expansion
              </span>
            </div>

            <div 
              className="flex-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-5 md:p-6.5 flex flex-col justify-between transition-all duration-300 hover:border-emerald-600/30 hover:shadow-2xl relative overflow-hidden group select-none"
            >
              {/* Backdrops */}
              <div className="absolute inset-0 bg-[radial-gradient(var(--color-accent-hover)_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-5"></div>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#1E293B]/50 to-transparent pointer-events-none"></div>

              <div className="space-y-4.5 relative z-10 text-left flex-1 flex flex-col justify-start">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-mono text-[var(--color-accent-main)] font-black tracking-widest uppercase bg-[var(--color-accent-main)]/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    Bazar360 Interactive Labs
                  </span>
                  
                  {/* Notify Me Toggle button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTeaserNotified(!teaserNotified);
                    }}
                    className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer select-none flex items-center justify-center ${
                      teaserNotified 
                        ? 'bg-amber-500 text-stone-900 border-amber-500 shadow-md shadow-amber-500/10' 
                        : 'bg-[var(--color-bg-secondary)] text-gray-400 hover:text-[var(--color-text-header)] border-[var(--color-border-main)]'
                    }`}
                    title={teaserNotified ? "Alert Registration Active" : "Notify Me on Launch"}
                  >
                    <Bell size={14} className={teaserNotified ? "text-stone-900 shrink-0 animate-bounce-subtle" : "text-gray-400 shrink-0"} />
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider ml-1.5 hidden sm:inline-block">
                      {teaserNotified ? "Notified" : "Notify Me"}
                    </span>
                  </button>
                </div>

                <div className="space-y-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    <h2 className="text-lg font-black font-sans text-[var(--color-text-header)] uppercase tracking-tight">
                      {activeTaglineVariant.title}
                    </h2>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed font-sans">
                    {activeTaglineVariant.sub}
                  </p>
                </div>

                {/* SUGGESTION ENGINE BOX (Sophisticated input fields) */}
                <div className="pt-1.5 space-y-2.5 shrink-0">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text"
                      id="community-suggestion-input"
                      value={suggestionText}
                      onChange={(e) => setSuggestionText(e.target.value)}
                      placeholder="Propose custom tools (e.g. smart appraisers)..."
                      className="flex-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl px-3 py-2.5 text-xs text-[var(--color-text-header)] placeholder-gray-600 focus:outline-none focus:border-emerald-600 focus:bg-[var(--color-bg-secondary)] transition-all"
                    />
                    <button
                      id="submit-suggestion-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOnSubmitSuggestion();
                      }}
                      disabled={isSubmittingSuggestion || !suggestionText.trim()}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-[var(--color-accent-hover)] disabled:bg-[var(--color-bg-secondary)] disabled:text-gray-600 text-[var(--color-text-header)] font-sans font-black text-xs rounded-xl uppercase tracking-wider transition-all duration-200 cursor-pointer select-none active:scale-[0.98] shrink-0"
                    >
                      {isSubmittingSuggestion ? "Sending..." : "Submit Proposal"}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[8px] text-gray-500 font-mono font-bold uppercase">Presets:</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSuggestionText("Peshawar Almas Car Valley location listings filter"); }}
                      className="px-2.5 py-1 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]/85 text-[8px] font-mono text-gray-300 border border-[var(--color-border-main)] cursor-pointer transition-all"
                    >
                      + Almas Valley Filters
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSuggestionText("Smart inspection sheet uploading module"); }}
                      className="px-2.5 py-1 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]/85 text-[8px] font-mono text-gray-300 border border-[var(--color-border-main)] cursor-pointer transition-all"
                    >
                      + Verified Sheets
                    </button>
                  </div>

                  {suggestionMessage && (
                    <p className={`text-[10px] font-semibold font-sans mt-1 ${suggestionMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {suggestionMessage.text}
                    </p>
                  )}
                </div>
              </div>

              {/* Voting Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--color-border-main)] pt-3 mt-4 relative z-10 w-full text-left shrink-0">
                <div className="shrink-0">
                  <p className="text-[9px] uppercase font-mono font-black text-gray-500 tracking-wider">
                    Community Endorsement Weighted
                  </p>
                  <p className="text-xs font-mono font-black text-gray-200 mt-0.5">
                    🗳️ <span className="text-orange-400 font-extrabold">{teaserVotes.toLocaleString()}</span> Community Votes
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (userTeaserVoted) {
                      setTeaserVotes(prev => prev - 1);
                      setUserTeaserVoted(false);
                    } else {
                      setTeaserVotes(prev => prev + 1);
                      setUserTeaserVoted(true);
                    }
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider text-center transition-all duration-300 cursor-pointer select-none active:scale-[0.98] ${
                    userTeaserVoted
                      ? 'bg-[var(--color-accent-main)] text-[var(--color-text-header)] shadow-md shadow-sky-600/10'
                      : 'bg-transparent text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/30 hover:border-[var(--color-accent-main)]/50 hover:bg-emerald-500/5 shadow-sm'
                  }`}
                >
                  {userTeaserVoted ? "✓ Voted successfully" : "Upvote Channel"}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Floating Custom Overlay Modal for Expansion Details (Redesigned in Luxury Professional Mode) */}
        {comingSoonSector && (
          <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] max-w-lg w-full rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl relative text-[var(--color-text-header)] text-left animate-slide-up">
              <button 
                onClick={() => setComingSoonSector(null)} 
                className="absolute top-4 right-4 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]/80 text-gray-400 hover:text-[var(--color-text-header)] p-2 rounded-xl transition-all cursor-pointer border border-[var(--color-border-main)]"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3.5 pt-2">
                <div className="text-3xl bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-[var(--color-accent-main)] font-sans">{comingSoonSector.icon}</div>
                <div>
                  <h3 className="text-lg font-black uppercase text-[var(--color-text-header)] tracking-tight">{comingSoonSector.title}</h3>
                  <p className="text-[var(--color-accent-main)] font-mono text-[10px] font-black uppercase tracking-widest">Active Development Channel</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl border border-[var(--color-border-main)]">
                  <span className="text-[8px] uppercase tracking-wider text-orange-400 font-mono block font-black mb-1">Target Mission Statement:</span>
                  <p className="text-[var(--color-text-header)] font-sans font-bold text-xs leading-relaxed">{comingSoonSector.tagline}</p>
                </div>

                <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl border border-[var(--color-border-main)]">
                  <span className="text-[8px] uppercase tracking-wider text-[var(--color-accent-main)] font-mono block font-black mb-1">Functional Outline:</span>
                  <p className="text-gray-400 text-xs font-sans leading-relaxed">{comingSoonSector.desc}</p>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-[10.5px] text-emerald-400 font-mono font-medium leading-relaxed">
                  🚀 Compliance: {comingSoonSector.spec}
                </div>
              </div>

              <div className="pt-2 text-center">
                <button 
                  onClick={() => setComingSoonSector(null)}
                  className="bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-hover)] text-[var(--color-text-header)] font-mono font-black py-3.5 px-6 rounded-xl w-full text-xs uppercase active:scale-[0.98] duration-100 cursor-pointer shadow-lg"
                >
                  Dismiss & Return
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-text-muted text-[9px] md:text-[10px] uppercase font-mono tracking-widest pb-[env(safe-area-inset-bottom)] md:pb-1 mt-1 shrink-0 relative z-10 border-t border-[var(--color-border-main)] pt-3">
          Built in Peshawar. Trusted Across Pakistan. 🇵🇰 &bull; Founder: Muhammad Amjid &bull; Helpline Connect: <a href="tel:03149198403" className="text-emerald-600 hover:underline font-bold">03149198403</a> &bull; BAZAR360 Pakistan Enterprise &copy; 2026.
        </div>
      </div>
    );
  }

  if (currentCategory === 'footwear') {
    return (
      <div className="bg-[var(--color-bg-primary)] text-[var(--color-text-header)] min-h-screen text-sm font-sans flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-border-main)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Header */}
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-[var(--color-border-main)] pb-4 mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👟</span>
            <div>
              <h1 className="text-lg font-black tracking-tight text-[var(--color-text-header)] uppercase">BAZAR360 FOOTWEAR</h1>
              <p className="text-[10px] text-amber-500 font-mono tracking-widest uppercase">Premium Footwear Vault</p>
            </div>
          </div>
          <button
            onClick={() => handleSetCategory('gateway')}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-emerald-600 text-slate-950 font-mono font-bold hover:shadow-lg hover:shadow-emerald-600/20 active:scale-95 duration-100 rounded-xl text-xs uppercase cursor-pointer"
          >
            ← Return to Gateway
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto w-full my-auto text-center space-y-6 relative z-10">
          <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20 uppercase tracking-widest">
            Horizontal Footwear sector (Demo Channel)
          </span>
          <h2 className="text-2xl md:text-3.5xl font-black text-[var(--color-text-header)] uppercase tracking-tight">
            Premium Leather Craftsmanship & Athletic Vault
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
            You are currently viewing the horizontal Footwear storefront. BAZAR360 dynamically builds tailored indices for each trade tenant.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            <div className="bg-bg-secondary/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-amber-500/25 duration-150">
              <span className="text-2xl">👞</span>
              <h3 className="font-bold text-[var(--color-text-header)] uppercase">Prestige Peshawari</h3>
              <p className="text-xs text-gray-400 font-sans">Hand-stitched premium Charsadda calf leather with dual-density high-grip rubber soles.</p>
              <div className="text-amber-400 font-mono font-bold text-sm">Rs. 8,500</div>
            </div>
            <div className="bg-bg-secondary/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-amber-500/25 duration-150">
              <span className="text-2xl">👟</span>
              <h3 className="font-bold text-[var(--color-text-header)] uppercase">Apex Wave Runners</h3>
              <p className="text-xs text-gray-400 font-sans">Breathable PrimeKnit mesh with high energy return reactive shock absorber midsoles.</p>
              <div className="text-amber-400 font-mono font-bold text-sm">Rs. 14,800</div>
            </div>
            <div className="bg-bg-secondary/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-amber-500/25 duration-150">
              <span className="text-2xl">🥾</span>
              <h3 className="font-bold text-[var(--color-text-header)] uppercase">K2 Tactical Boots</h3>
              <p className="text-xs text-gray-400 font-sans">All-weather waterproof canvas with reinforced alloy toe caps for hardcore trekking.</p>
              <div className="text-amber-400 font-mono font-bold text-sm">Rs. 19,500</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-[10px] uppercase font-mono tracking-widest pt-8 relative z-10">
          BAZAR360 trade networks. All mock components verified on core.
        </div>
      </div>
    );
  }

  if (currentCategory === 'food') {
    return (
      <div className="bg-[var(--color-bg-primary)] text-[var(--color-text-header)] min-h-screen text-sm font-sans flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-border-main)_1px,transparent_1px)] [background-size:16px_1px,transparent_1px] pointer-events-none"></div>

        {/* Header */}
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-[var(--color-border-main)] pb-4 mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥦</span>
            <div>
              <h1 className="text-lg font-black tracking-tight text-[var(--color-text-header)] uppercase">BAZAR360 FOOD</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Organic Fresh Food Mesh</p>
            </div>
          </div>
          <button
            onClick={() => handleSetCategory('gateway')}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-emerald-600 text-slate-950 font-mono font-bold hover:shadow-lg hover:shadow-emerald-600/20 active:scale-95 duration-100 rounded-xl text-xs uppercase cursor-pointer"
          >
            ← Return to Gateway
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto w-full my-auto text-center space-y-6 relative z-10">
          <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">
            Horizontal Food sector (Demo Channel)
          </span>
          <h2 className="text-2xl md:text-3.5xl font-black text-[var(--color-text-header)] uppercase tracking-tight">
            Direct Farm Access & Wholesale Consumables Grid
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
            You are currently viewing the horizontal Food storefront. BAZAR360 dynamically builds tailored indices for each trade tenant.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            <div className="bg-bg-secondary/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-emerald-500/25 duration-150">
              <span className="text-2xl text-yellow-400">🍯</span>
              <h3 className="font-bold text-[var(--color-text-header)] uppercase">Organic Hunza Honey</h3>
              <p className="text-xs text-gray-400 font-sans">100% natural, unfiltered wild honey gathered directly from highland Hunza blossoms.</p>
              <div className="text-emerald-400 font-mono font-bold text-sm">Rs. 3,200</div>
            </div>
            <div className="bg-bg-secondary/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-emerald-500/25 duration-150">
              <span className="text-2xl text-amber-500">🌾</span>
              <h3 className="font-bold text-[var(--color-text-header)] uppercase">Premium Super Basmati</h3>
              <p className="text-xs text-gray-400 font-sans">5kg of aged super-kernel premium basmati rice, famed for non-sticky extra-long grains.</p>
              <div className="text-emerald-400 font-mono font-bold text-sm">Rs. 1,950</div>
            </div>
            <div className="bg-bg-secondary/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-emerald-500/25 duration-150">
              <span className="text-2xl text-orange-400">🍊</span>
              <h3 className="font-bold text-[var(--color-text-header)] uppercase">Sargodha Citrus Crates</h3>
              <p className="text-xs text-gray-400 font-sans">Juicy hand-picked Sargodha Kinnu oranges delivered fresh in protected aeration crates.</p>
              <div className="text-emerald-400 font-mono font-bold text-sm">Rs. 850</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-[10px] uppercase font-mono tracking-widest pt-8 relative z-10">
          BAZAR360 trade networks. All mock components verified on core.
        </div>
      </div>
    );
  }

  return (
    <NavigationAudit
      currentTab={currentTab}
      setTab={handleSetTab}
      currentUser={currentUser}
      onLogout={requestLogout}
      onLoginClick={() => setIsAuthModalOpen(true)}
      lang={lang}
      onLanguageToggle={toggleLanguage}
      favoritesCount={favoritesList.length}
      onSearchChange={(val) => setSearchQuery(val)}
    >
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 3500, style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' } }} />
      
      <TopBanner />
      
      {/* 🔍 SEO STRUCTURED DATA & META INJECTION ENGINE */}
      <SEO 
        type="sitemap" 
        dealers={dealers} 
        listings={listings} 
      />

      {selectedListing ? (
        <SEO 
          type="both" 
          vehicle={selectedListing} 
          dealer={dealers.find((d) => d.id === selectedListing.dealerId)} 
        />
      ) : (currentTab === 'dealer-storefront' && currentDealer) ? (
        <SEO 
          type="business" 
          dealer={currentDealer} 
        />
      ) : dealers[0] ? (
        <SEO 
          type="business" 
          dealer={dealers[0]} 
        />
      ) : null}



      {/* Main Container Core Shell */}
      <main className={`flex-grow w-full pb-32 md:pb-16 transition-all ${
        currentTab === 'home' 
          ? 'pt-0 px-0 md:px-0 max-w-full' 
          : `section-container ${currentCategory === 'auto' ? 'pt-32' : 'pt-24'}`
      }`}>
        
        {activeIndustry !== 'Automotive' && (
          <div className="mb-6 bg-bg-primary/90 backdrop-blur-md border border-[var(--color-accent-main)]/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-scale-fade shadow-xl">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-black text-sky-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                Dynamic Multi-Tenant Partition Activated
              </span>
              <h3 className="text-sm font-black text-[var(--color-text-header)] uppercase tracking-tight">
                🛍️ BAZAR360 {activeIndustry} Showcase Channel (Demo Sandbox)
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
                You are currently viewing the horizontal {activeIndustry} expansion sector. BAZAR360 dynamically adapts its interface parameters, catalog filters, and pricing indices for this domain. The core system remains verified on 'Auto Choice'.
              </p>
            </div>
            <button
              onClick={() => setActiveIndustry('Automotive')}
              className="bg-emerald-600 hover:bg-[var(--color-accent-hover)] active:scale-95 duration-150 text-slate-950 font-mono font-black text-[10px] uppercase py-2.5 px-4.5 rounded-xl block shrink-0 tracking-widest cursor-pointer"
            >
              Reset to Auto Choice
            </button>
          </div>
        )}

        {dbLoading && currentTab !== 'home' && currentTab !== 'inventory' && currentTab !== 'search' ? (
          <SkeletonLoader />
        ) : (
          <React.Suspense fallback={<SkeletonLoader />}>
            {currentTab === 'notifications' && (
              <UnifiedNotificationCenter
                currentUser={currentUser}
                lang={lang}
                onNavigateToTab={handleSetTab}
                onOpenMessaging={(convId) => handleOpenMessaging({ conversationId: convId })}
              />
            )}

            {currentTab === 'profile' && currentUser && (
              <UserProfileView
                user={currentUser}
                lang={lang}
                listings={listings}
                dealers={dealers}
                onApproveListing={handleApproveListing}
                onRejectListing={handleRejectListing}
                onPostCreated={(newL) => {
                  setListings((prev) => [newL, ...prev]);
                }}
                favoritesList={favoritesList}
                onSelectListing={handleSelectListing}
                onToggleFavorite={handleToggleFavorite}
                onUpdateUser={setCurrentUser}
                onDeleteListing={(listingId) => {
                  setListings(prev => prev.filter(car => car.id !== listingId));
                }}
                setTab={handleSetTab}
              />
            )}

            {currentTab === 'home' && (
              <HomeView
                dealers={dealers}
                listings={prioritizedListings}
                dbLoading={dbLoading}
                setTab={handleSetTab}
                onSelectDealer={onSelectDealer}
                onSelectListing={handleSelectListing}
                onToggleCompare={handleToggleCompare}
                compareList={compareList}
                onToggleFavorite={handleToggleFavorite}
                favoritesList={favoritesList}
                recentViewsList={recentViewsList}
                currentUser={currentUser}
                lang={lang}
                setSelectedCategory={setSelectedCategory}
                setSearchQuery={setSearchQuery}
              />
            )}

            {(currentTab === 'inventory' || currentTab === 'search') && (
              <SearchExplorerView
                listings={prioritizedListings}
                dealers={dealers}
                dbLoading={dbLoading}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectListing={handleSelectListing}
                onToggleCompare={handleToggleCompare}
                compareList={compareList}
                onToggleFavorite={handleToggleFavorite}
                favoritesList={favoritesList}
                recentViewsList={recentViewsList}
                currentUser={currentUser}
                lang={lang}
              />
            )}

            {currentTab === 'favorites' && (
              <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-16 px-4 md:px-8 text-left animate-fade-in">
                <div className="border-b border-[var(--color-border-main)] pb-4">
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-sky-400">
                    {lang === 'en' ? 'Your Saved Favorites' : 'آپ کی محفوظ کردہ گاڑیاں'}
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {lang === 'en' 
                      ? 'Access and compare your hand-picked luxury vehicles anytime.' 
                      : 'اپنی پسندیدہ گاڑیوں کو یہاں محفوظ کریں اور ان کا موازنہ کریں۔'}
                  </p>
                </div>

                {favoritesList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
                    {favoritesList.map((car, idx) => (
                      <VehicleCard
                        key={car.id}
                        car={car}
                        index={idx}
                        dealer={dealers.find((d) => d.id === car.dealerId)}
                        onSelect={handleSelectListing}
                        onToggleCompare={handleToggleCompare}
                        isComparing={compareList.some((c) => c.id === car.id)}
                        onToggleFavorite={handleToggleFavorite}
                        isFavorite={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
                    <Heart size={36} className="text-gray-600 animate-pulse" />
                    <p className="text-[var(--color-text-muted)] text-xs font-sans">
                      {lang === 'en' ? 'No saved vehicles yet.' : 'کوئی پسندیدہ گاڑی محفوظ نہیں کی گئی۔'}
                    </p>
                    <button
                      onClick={() => setTab('search')}
                      className="px-6 py-3 bg-emerald-500 hover:bg-sky-600 text-slate-950 font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/10"
                    >
                      {lang === 'en' ? 'Discover Vehicles' : 'گاڑیاں تلاش کریں'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentTab === 'cart' && (
              <div className="py-6 animate-fade-in">
                <ShortlistCartView
                  items={favoritesList}
                  onRemoveItem={(carId) => {
                    const carToRemove = favoritesList.find(c => c.id === carId);
                    if (carToRemove) handleToggleFavorite(carToRemove);
                  }}
                  onProceedCheckout={(items, totalPkr, promoCode) => {
                    alert(lang === 'ur' 
                      ? `آپ کا آرڈر اور ${items.length} گاڑیوں کی انسپکشن کامیاب ہو گئی! مجموعی رقم: ${totalPkr} PKR` 
                      : `Inquiry & Inspection booking confirmed for ${items.length} shortlisted vehicle(s)! Total: PKR ${totalPkr.toLocaleString()}`);
                    setTab('services');
                  }}
                  lang={lang}
                />
              </div>
            )}

            {currentTab === 'dealers' && (
              <ShowroomsHub
                dealers={dealers}
                listings={listings}
                onSelectDealer={onSelectDealer}
                setSelectedQrDealer={setSelectedQrDealer}
                lang={lang}
              />
            )}

            {currentTab === 'community' && (
              <SocialFeedView
                currentUser={currentUser}
                idToken={idToken}
                onSelectShowroom={(id) => {
                  setSelectedDealerId(id);
                  setTab('dealer-storefront');
                }}
                onLoginClick={() => setIsAuthModalOpen(true)}
                lang={lang}
              />
            )}

            {(currentTab === 'mobile-app' || currentTab === 'messages') && (
              <MobileNativeExperience setTab={handleSetTab} lang={lang} />
            )}

            {currentTab === 'services' && (
              <div className="max-w-7xl mx-auto pb-16 px-4 md:px-8">
                <AutoServicesView lang={lang} preselectedCar={preselectedServiceCar} />
              </div>
            )}

            {currentTab === 'contact' && (
              <div className="max-w-7xl mx-auto pb-16 px-4 md:px-8">
                <ContactView lang={lang} onOpenSupportDrawer={() => setIsContactDrawerOpen(true)} />
              </div>
            )}

            {currentTab === 'faq' && (
              <div className="max-w-7xl mx-auto pb-16 px-4 md:px-8">
                <FAQView 
                  lang={lang} 
                  onNavigateToContact={() => handleSetTab('contact')} 
                  onNavigateToInventory={() => handleSetTab('inventory')}
                  onNavigateToPostAd={() => handleSetTab('sell')}
                />
              </div>
            )}

            {currentTab === 'dealer-storefront' && currentDealer && (
              <DealerStorefrontView
                dealer={currentDealer}
                listings={prioritizedListings}
                reviews={reviewsMap[selectedDealerId] || []}
                onAddReview={handleAddReview}
                onSelectListing={handleSelectListing}
                onPublishActivity={handlePublishActivity}
                onApproveActivity={handleApproveActivity}
                currentUser={currentUser}
                onNavigateToSell={() => handleSetTab('sell')}
                onOpenQrModal={setSelectedQrDealer}
                onOpenSupportDrawer={(msg) => {
                  setContactDrawerInitialMessage(msg || '');
                  setIsContactDrawerOpen(true);
                }}
                onBack={() => handleSetTab('dealers')}
              />
            )}

            {currentTab === 'portal' && (
              <div className="max-w-7xl mx-auto space-y-6 md:space-y-12 pb-16 px-1.5 sm:px-4 md:px-8 text-left">
                {/* Secondary Registration Portal and Submissions forms */}
                <div className="border border-[var(--color-border-main)] rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-8 bg-[var(--color-bg-secondary)] text-left">
                  <div className="border-b border-[var(--color-border-main)] pb-3 mb-6">
                    <h2 className="font-sans font-extrabold text-lg md:text-xl text-zinc-400 uppercase tracking-wider">Multi-Role Registration & Onboarding Suite</h2>
                    <p className="text-[10px] text-zinc-500 mt-1">Simulate secure customer registration, detailed car posting schema outputs, and regional dealership signups.</p>
                  </div>
                  <RegistrationPortal
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    onDealerRegistered={(newD) => {
                      setDealers((prev) => [...prev, newD]);
                      setReviewsMap((prev) => ({ ...prev, [newD.id]: [] }));
                    }}
                  />
                </div>
              </div>
            )}

            {currentTab === 'admin' && (currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin' || ['amjid.bisconni@gmail.com', 'khattakghani94@gmail.com', 'mazharsouls@gmail.com'].includes(currentUser?.email?.toLowerCase() || '')) ? (
              <AdminDashboard
                listings={listings}
                dealers={dealers}
                currentUser={currentUser}
                onDeleteListing={(id) => setListings(prev => prev.filter(l => l.id !== id))}
                onDeleteDealer={(id) => setDealers(prev => prev.filter(d => d.id !== id))}
                onDeleteSelectedListings={(ids) => setListings(prev => prev.filter(l => !ids.includes(l.id)))}
                onDeleteAllListings={() => setListings([])}
                onDeleteAllDealers={() => setDealers([])}
                onDeleteAllPosts={() => {
                  toast.success('All community posts and activity logs cleared.');
                }}
                onApproveListing={handleApproveListing}
                onRejectListing={handleRejectListing}
                lang={lang}
                setTab={handleSetTab}
              />
            ) : currentTab === 'admin' ? (
              <div className="max-w-md mx-auto my-12 p-8 bg-[var(--color-bg-secondary)] border border-rose-500/30 rounded-3xl text-center space-y-4">
                <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
                <h3 className="text-lg font-black uppercase text-[var(--color-text-main)] tracking-wider">Access Restricted</h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  The administrative control hub is strictly reserved for platform administrators (Muhammad Amjid - Founder, Malak Mazhar, Ghani Khan).
                </p>
                <button 
                  onClick={() => handleSetTab('home')} 
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-[var(--color-accent-hover)] text-slate-950 font-black text-xs uppercase rounded-xl shadow cursor-pointer transition-transform active:scale-95"
                >
                  Return Home
                </button>
              </div>
            ) : null}

            {(currentTab === 'sell' || currentTab === 'post-upload') && (
              <div className="max-w-7xl mx-auto pb-16 px-1.5 sm:px-4 md:px-8 text-left">
                <DetailedVehiclePostingPage
                  lang={lang}
                  currentUser={currentUser}
                  contextDealerId={selectedDealerId || undefined}
                  dealers={dealers}
                  onPostCreated={(newL) => {
                    setListings((prev) => [newL, ...prev]);
                    handleSetTab('search');
                  }}
                />
              </div>
            )}
          </React.Suspense>
        )}
        <Footer 
          lang={lang} 
          setTab={handleSetTab} 
          onOpenSupportDrawer={() => setIsContactDrawerOpen(true)} 
        />
      </main>

      <ContactDrawer 
        isOpen={isContactDrawerOpen} 
        onClose={() => setIsContactDrawerOpen(false)} 
        lang={lang} 
        initialMessage={contactDrawerInitialMessage}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(profile) => {
          setCurrentUser(profile);
          setIsAuthModalOpen(false);
        }}
        lang={lang}
      />

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        currentUser={currentUser}
        lang={lang}
      />

      <MessagingCenterModal
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
        currentUser={currentUser}
        lang={lang}
        initialConversationId={messagingConvId}
        recipientUser={messagingRecipient}
        relatedListing={messagingListing}
        relatedService={messagingService}
        initialMessage={messagingInitialMsg}
      />

      {/* DYNAMIC LISTING DETAILS FULL SCREEN MODAL */}
      <AnimatePresence>
        {pendingListingId && !selectedListing && (
          <VehicleDetailSkeleton onClose={() => setPendingListingId(null)} />
        )}
        {selectedListing && (
          <VehicleDetail
            car={selectedListing}
            dealer={(selectedListing.sellerType === 'Individual' || selectedListing.dealerId === 'private' || selectedListing.id === 'listing-1784821782501' || selectedListing.id === 'listing-1784821585212') ? ({ id: 'private', name: selectedListing.sellerName || 'Individual User', location: selectedListing.location || 'Pakistan', phone: selectedListing.sellerPhone || selectedListing.phone || '' } as any) : (dealers.find(d => d.id === selectedListing.dealerId) || { id: 'private', name: 'Private Seller', location: 'Unknown', phone: '0000000000' } as any)}
            allListings={listings}
            onSelectListing={(car) => {
              setSelectedListing(car);
              setSelectedDealerId((car.sellerType === 'Individual' || car.dealerId === 'private' || car.id === 'listing-1784821782501' || car.id === 'listing-1784821585212') ? 'private' : (car.dealerId || ''));
            }}
            onClose={() => {
              setSelectedListing(null);
              setPendingListingId(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* VEHICLE NOT FOUND ERROR MODAL */}
      <AnimatePresence>
        {vehicleNotFound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto border border-orange-500/20">
                <Car size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black font-display uppercase tracking-wider text-[var(--color-text-header)]">
                  Vehicle Not Found
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  The requested vehicle listing could not be found or has been sold. Explore our live verified inventory for similar cars and bikes.
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setVehicleNotFound(false);
                    setTab('inventory');
                    window.location.hash = '/inventory';
                  }}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-md active:scale-95"
                >
                  Browse Available Vehicles
                </button>
                <button
                  onClick={() => {
                    setVehicleNotFound(false);
                    setTab('home');
                    window.location.hash = '/';
                  }}
                  className="w-full py-3 bg-[var(--color-bg-secondary)] hover:bg-slate-200 dark:hover:bg-bg-tertiary text-[var(--color-text-header)] font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer border border-[var(--color-border-main)]"
                >
                  Return to Home Page
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* FIRST TIME VISITOR LEAD CAPTURE PROMPT */}
      <FirstTimeVisitorModal />

      {/* BACK TO TOP BUTTON */}
      <ScrollToTopButton currentTab={currentTab} />

      
      
      {/* STICKY VEHICLE COMPARISON DRAWER BAR */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 80, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 80, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-22 md:bottom-6 left-1/2 z-40 w-[92%] sm:w-[500px] bg-[var(--color-bg-secondary)]/95 text-[var(--color-text-header)] border border-[var(--color-accent-main)]/40 p-3.5 rounded-2xl shadow-2xl backdrop-blur flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="bg-[var(--color-accent-main)] text-slate-950 font-mono font-black text-[9px] px-2 py-0.5 rounded-lg">
                {compareList.length}/2 MATCH
              </span>
              <div className="flex -space-x-2">
                {compareList.map((car) => (
                  <div key={car.id} className="relative group">
                    <img
                      src={car.imageUrl}
                      alt={car.title}
                      className="w-8 h-8 rounded-full border border-[#0c1221] object-cover"
                    />
                    <button 
                      onClick={() => handleToggleCompare(car)}
                      className="absolute -top-1 -right-1 bg-red-500 p-0.5 rounded-full text-[6px] hover:bg-red-600 border border-[#0c1221] w-3.5 h-3.5 flex items-center justify-center cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 font-sans hidden sm:block">Queue set for side-by-side comparison</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareList([])}
                className="text-[10px] text-gray-400 hover:text-[var(--color-text-header)] uppercase font-mono font-bold tracking-wider px-2 py-1 cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setShowComparisonModal(true)}
                className="bg-emerald-600 hover:bg-[var(--color-accent-hover)] text-slate-950 font-black font-mono text-[9px] uppercase px-3 py-2 rounded-xl transition-all shadow-md shadow-orange-950/20 tracking-wider active:scale-95 cursor-pointer"
              >
                Compare Matchup &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DUAL COMPARISON DRAWER SPECIFICATIONS TABLE MODAL */}
      {showComparisonModal && compareList.length > 0 && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl max-w-3xl w-full text-xs font-sans shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col animate-scale-fade">
            
            <div className="bg-[var(--color-bg-secondary)] p-4 border-b border-[var(--color-border-main)] flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-sans font-black text-[var(--color-text-header)] text-sm uppercase tracking-tight">BAZAR360 Dynamic Comparison Deck</h3>
                <p className="text-[9px] text-gray-400 font-mono tracking-wider mt-0.5">Dual car matchup analyzer with active spec matching.</p>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="text-gray-400 hover:text-[var(--color-text-header)] bg-[var(--color-bg-secondary)] p-1.5 rounded-xl border border-[var(--color-border-main)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-5 space-y-6">
              
              {/* Product Comparison Header Grid */}
              <div className="grid grid-cols-2 gap-4">
                {compareList.map((car) => (
                  <div key={car.id} className="bg-[var(--color-bg-secondary)] p-3 rounded-2xl border border-[var(--color-border-main)] space-y-3 relative">
                    <img 
                      src={car.imageUrl} 
                      alt={car.title} 
                      className="w-full h-32 md:h-44 object-cover rounded-xl"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono tracking-widest text-[var(--color-accent-main)] font-bold uppercase">{car.make}</span>
                      <h4 className="font-extrabold text-[var(--color-brand-orange)] text-xs uppercase truncate leading-none">{car.title}</h4>
                      <p className="font-mono text-[var(--color-text-header)] text-[13px] font-black mt-1">{renderPrice(car.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specs Table Matrix */}
              <div className="border border-[var(--color-border-main)] rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)]">
                {[
                  { label: "Production Year", key: "year" },
                  { label: "Brand Make", key: "make" },
                  { label: "Model Variant", key: "model" },
                  { label: "Mileage (km)", key: "mileage", format: (v: number) => `${v.toLocaleString()} km` },
                  { label: "Fuel Category", key: "fuelType" },
                  { label: "Transmission Line", key: "transmission" }
                ].map((spec) => {
                  return (
                    <div key={spec.label} className="grid grid-cols-3 border-b border-[var(--color-border-main)] last:border-0 p-3 leading-relaxed">
                      <span className="text-gray-400 font-mono text-[9px] uppercase font-bold flex items-center">{spec.label}</span>
                      {compareList.map((car) => {
                        const rawVal = (car as any)[spec.key];
                        // Zero-Dummy-Data Guard: Avoid empty blanks
                        const valString = rawVal !== undefined && rawVal !== null && rawVal !== "" ? (spec.format ? spec.format(rawVal) : String(rawVal)) : "Not Listed";
                        return (
                          <span key={car.id} className="text-[var(--color-text-header)] font-sans text-xs flex items-center pr-2">
                            {valString}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Unique Ecosystem Service Badges comparison */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">Showroom Certifications Matchup</p>
                <div className="grid grid-cols-2 gap-4">
                  {compareList.map((car) => (
                    <div key={car.id} className="p-3 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-main)] flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="font-bold text-[10px] text-[var(--color-text-header)] block uppercase font-mono">Verifier Status</span>
                        <div className="flex items-center gap-1 text-xs text-[var(--color-text-header)]/70">
                          {car.verified ? (
                            <span className="text-emerald-400 font-bold font-mono">✓ VETTED</span>
                          ) : (
                            <span className="text-orange-400 font-mono">PENDING DESK</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Share Overlay Section */}
              <div className="pt-4 border-t border-[var(--color-border-main)] space-y-3">
                <button
                  onClick={async () => {
                    const text = `Take a look at this digital car comparison matchup on BAZAR360:\n\n${compareList.map(c => `🏎️ ${c.title} (Rs. ${c.price.toLocaleString()})`).join('\n')}\n\nAnalyze specs side-by-side!`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: 'BAZAR360 Dynamic Matchup',
                          text: text,
                          url: window.location.href
                        });
                      } catch (e) {
                        // ignore
                      }
                    } else {
                      await navigator.clipboard.writeText(text);
                      const t = document.getElementById("compare_share_status");
                      if (t) {
                        t.innerText = "✓ Copy-loaded! Ready to paste into WhatsApp / Viber.";
                        setTimeout(() => {
                          t.innerText = "";
                        }, 5000);
                      }
                    }
                  }}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-mono text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  📣 Adaptive Share Matchup (Native / WhatsApp fallback)
                </button>
                <p id="compare_share_status" className="text-center font-mono text-[10px] text-[var(--color-accent-main)] font-bold"></p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 🔮 INTERACTIVE SHOWROOM SHARE CARD & QR CODE PORTAL */}
      {selectedQrDealer && (
        <div className="fixed inset-0 bg-[var(--color-bg-secondary)] md:bg-black/95 md:backdrop-blur-md flex items-start justify-center z-[200] overflow-y-auto p-0 md:p-4 animate-fade-in">
          <div className="bg-[var(--color-bg-secondary)] md:border md:border-[var(--color-border-main)] md:rounded-3xl max-w-md w-full text-xs font-sans shadow-2xl overflow-hidden relative animate-scale-fade flex flex-col p-6 space-y-6 min-h-screen md:min-h-0 md:my-8 pb-32 md:pb-6">
            
            {/* Sticky/Fixed Header for Perfect Viewport Alignment */}
            <div className="sticky top-0 bg-[var(--color-bg-secondary)]/95 backdrop-blur-md z-30 pb-3 border-b border-[var(--color-border-main)] flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedQrDealer(null);
                  setQrCopied(false);
                }}
                className="flex items-center gap-1.5 text-gray-400 hover:text-[var(--color-text-header)] bg-[var(--color-bg-secondary)] py-2 px-3.5 rounded-xl border border-[var(--color-border-main)] transition-colors cursor-pointer text-[10px] font-mono font-black uppercase tracking-widest"
              >
                <ArrowLeft size={14} /> {lang === 'ur' ? 'واپس' : 'Back'}
              </button>
              <div className="text-right flex flex-col items-end">
                <span className="bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] text-[8.5px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-[var(--color-accent-main)]/20 block">
                  {lang === 'ur' ? 'شوو روم شیئرنگ' : 'SHOWROOM SHARE'}
                </span>
              </div>
            </div>

            {/* Content Layout */}
            <div className="space-y-5 pt-2">
              
              {/* Showroom Logo / Branding Header */}
              <div className="bg-bg-secondary/60 p-4 rounded-2xl border border-[var(--color-border-main)] flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-[var(--color-accent-main)] overflow-hidden bg-[var(--color-bg-secondary)] shrink-0">
                  {selectedQrDealer.id === '' ? (
                    <img 
                      src="/auto_choice_logo_dark.jpg" 
                      alt="Auto Choice Logo" 
                      className="w-full h-full object-contain" 
                    />
                  ) : selectedQrDealer.avatarUrl ? (
                    <img 
                      src={`${selectedQrDealer.avatarUrl}?v=20260719`} 
                      alt={selectedQrDealer.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-500 font-black text-[var(--color-text-header)] text-xl">
                      {selectedQrDealer.avatarLetter}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[12px] text-[var(--color-text-header)] font-black block leading-tight">{selectedQrDealer.name}</span>
                  <p className="text-[10px] text-[var(--color-text-muted)] italic">"{selectedQrDealer.subtitle || 'The Right Choice'}"</p>
                </div>
              </div>

              {/* Showroom Physical & GPS Location Info */}
              <div className="space-y-2 bg-[var(--color-bg-secondary)] p-4 rounded-2xl border border-[var(--color-border-main)]">
                <div className="flex gap-2 items-start text-[var(--color-text-header)]/80">
                  <MapPin size={16} className="text-[var(--color-accent-main)] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-mono font-black text-[var(--color-accent-main)] block">Showroom Address</span>
                    <p className="text-[11px] leading-relaxed font-sans text-text-muted">{selectedQrDealer.location}</p>
                  </div>
                </div>
                
                {/* Google Map Launch Button */}
                <a 
                  href={selectedQrDealer.id === ''
                    ? "https://maps.google.com/?q=Auto+choice+Alamas+Car+Village+Ring+Road+Peshawar"
                    : `https://maps.google.com/?q=${encodeURIComponent(selectedQrDealer.location)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-main)] text-[var(--color-accent-main)] hover:text-[var(--color-text-header)] py-2.5 px-3.5 rounded-xl text-[9px] uppercase font-mono font-bold tracking-widest flex items-center justify-center gap-1.5 duration-150 cursor-pointer mt-2"
                >
                  Launch Google Maps Navigation <ExternalLink size={11} />
                </a>
              </div>

              {/* Contacts & Showroom Team Desk */}
              <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl border border-[var(--color-border-main)] space-y-3">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-orange-400" />
                  <span className="text-[9px] uppercase tracking-wider font-mono font-black text-orange-400 block">Contacts & Showroom Team</span>
                </div>

                {selectedQrDealer.id === '' ? (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-[var(--color-bg-secondary)]/60 p-2 rounded-xl border border-[var(--color-border-main)]">
                        <span className="text-[var(--color-text-muted)] text-[8px] uppercase block">Malak Mazhar</span>
                        <a href="tel:03159085086" className="text-[var(--color-text-header)] font-bold block hover:text-[var(--color-accent-main)]">0315-9085086</a>
                      </div>
                      <div className="bg-[var(--color-bg-secondary)]/60 p-2 rounded-xl border border-[var(--color-border-main)]">
                        <span className="text-[var(--color-text-muted)] text-[8px] uppercase block">Muhammad Amjid</span>
                        <a href="tel:03149198403" className="text-[var(--color-text-header)] font-bold block hover:text-[var(--color-accent-main)]">03149198403</a>
                      </div>
                      <div className="bg-[var(--color-bg-secondary)]/60 p-2 rounded-xl border border-[var(--color-border-main)]">
                        <span className="text-[var(--color-text-muted)] text-[8px] uppercase block">M. Nasir Mirza</span>
                        <span className="text-[var(--color-text-header)] font-bold">Member</span>
                      </div>
                      <div className="bg-[var(--color-bg-secondary)]/60 p-2 rounded-xl border border-[var(--color-border-main)]">
                        <span className="text-[var(--color-text-muted)] text-[8px] uppercase block">Asfandyar Zafar</span>
                        <span className="text-[var(--color-text-header)] font-bold">Member</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-sans text-[var(--color-text-muted)] text-center italic">
                      "Our Team & Contacts are fully verified and available for custom quotes."
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-text-muted">
                    <div className="flex justify-between items-center bg-[var(--color-bg-secondary)]/60 p-2.5 rounded-xl border border-[var(--color-border-main)] font-mono">
                      <span>👤 {selectedQrDealer.contactPerson || 'Showroom Manager'}</span>
                      <a href={`tel:${selectedQrDealer.phone}`} className="text-[var(--color-accent-main)] font-bold">{selectedQrDealer.phone}</a>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center text-center space-y-3 bg-[var(--color-bg-secondary)] p-4 rounded-2xl border border-[var(--color-border-main)]">
                <span className="text-[9px] uppercase tracking-wider font-mono font-black text-[var(--color-text-muted)] block">Showroom Portal Scan QR</span>
                <div className="bg-white p-3 rounded-xl border border-[var(--color-border-main)] shadow-lg inline-block">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=0f172a&bgcolor=ffffff&data=${encodeURIComponent(
                      typeof window !== 'undefined'
                        ? `${window.location.origin}/dealers/${selectedQrDealer.id}`
                        : `https://bazar360.online/dealers/${selectedQrDealer.id}`
                    )}`}
                    alt={`${selectedQrDealer.name} Navigation QR`}
                    className="w-32 h-32 block rounded"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-[var(--color-text-muted)] text-[10px] leading-relaxed font-sans px-2">
                  {lang === 'ur' 
                    ? 'شوروم انوینٹری اور رابطہ کے لیے اس کیو آر کوڈ کو اسکین کریں۔' 
                    : 'Scan this QR code with any mobile scanner to open the showroom inventory instantly.'}
                </p>
              </div>

              {/* Showroom link string */}
              <div className="bg-bg-primary p-3 rounded-xl border border-[var(--color-border-main)] flex items-center justify-between font-mono text-[9px] text-[var(--color-text-muted)]">
                <span className="truncate max-w-[240px] select-all">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/dealers/${selectedQrDealer.id}`
                    : `https://bazar360.online/dealers/${selectedQrDealer.id}`
                  }
                </span>
                <span className="text-[var(--color-accent-main)] font-bold text-[8px] uppercase">Link Url</span>
              </div>

            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-4 border-t border-[var(--color-border-main)]">
              <button
                onClick={async () => {
                  const url = typeof window !== 'undefined'
                    ? `${window.location.origin}/dealers/${selectedQrDealer.id}`
                    : `https://bazar360.online/dealers/${selectedQrDealer.id}`;
                  const mapLink = selectedQrDealer.id === ''
                    ? "https://maps.google.com/?q=Auto+choice+Alamas+Car+Village+Ring+Road+Peshawar"
                    : `https://maps.google.com/?q=${encodeURIComponent(selectedQrDealer.location)}`;
                  
                  let text = `🚗 *${selectedQrDealer.name.toUpperCase()}* 🚗\n`;
                  text += `✨ Slogan: "${selectedQrDealer.subtitle || 'The Right Choice'}"\n`;
                  text += `📍 Address: ${selectedQrDealer.location}\n`;
                  text += `🗺️ Google Maps: ${mapLink}\n`;
                  
                  if (selectedQrDealer.id === '') {
                    text += `👤 Contact Person: Malak Mazhar\n`;
                    text += `📞 Call/WhatsApp: +92 315 9085086\n`;
                    text += `👥 Showroom Team Desk:\n`;
                    text += `  • M. Nasir Mirza\n`;
                    text += `  • Asfandyar Zafar\n`;
                    text += `  • Malak Mazhar (0315-9085086)\n`;
                    text += `  • Malak Waseem (0346-9085033)\n`;
                  } else {
                    text += `👤 Contact: ${selectedQrDealer.contactPerson || 'Showroom Manager'}\n`;
                    text += `📞 Phone: ${selectedQrDealer.phone}\n`;
                  }
                  
                  text += `🌐 View Showroom Inventory: ${url}\n\n`;
                  text += `Shared via Bazar360.online - Pakistan's Flagship Automotive Portal! 🇵🇰`;

                  try {
                    await navigator.clipboard.writeText(text);
                    setQrCopied(true);
                    setTimeout(() => setQrCopied(false), 3000);
                  } catch (err) {
                    console.error("Copy failed", err);
                  }
                }}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  qrCopied 
                    ? 'bg-emerald-500 text-slate-950 animate-pulse' 
                    : 'bg-[var(--color-accent-main)] text-[var(--color-text-header)] hover:bg-[var(--color-accent-hover)] shadow-lg shadow-orange-950/25'
                }`}
              >
                <Share2 size={13} />
                <span>
                  {qrCopied 
                    ? (lang === 'ur' ? '✓ شیئر کارڈ کاپی ہو گیا!' : '✓ Copy-Loaded for WhatsApp!') 
                    : (lang === 'ur' ? 'مکمل کارڈ کاپی کریں' : 'Copy Formatted Share Card')
                  }
                </span>
              </button>
              
              <button
                onClick={async () => {
                  const url = typeof window !== 'undefined'
                    ? `${window.location.origin}/dealers/${selectedQrDealer.id}`
                    : `https://bazar360.online/dealers/${selectedQrDealer.id}`;
                  await navigator.clipboard.writeText(url);
                  setQrCopied(true);
                  setTimeout(() => setQrCopied(false), 3000);
                }}
                className="w-full py-2.5 border border-[var(--color-border-main)] hover:bg-white/5 text-text-muted font-bold text-xs rounded-xl uppercase tracking-wider transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy size={11} />
                {lang === 'ur' ? 'صرف لنک کاپی کریں' : 'Copy Showroom Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 PWA SMART FLOATING INSTALLATION DESK */}
      {showInstallBanner && (
        <div className="fixed bottom-20 md:bottom-6 right-0 md:right-6 left-0 md:left-auto px-4 md:px-0 z-[100] max-w-sm w-full animate-fade-in">
          <div className="bg-[var(--color-bg-secondary)]/95 dark:bg-[var(--color-bg-primary)]/95 border border-slate-200 dark:border-[var(--color-border-main)] backdrop-blur-md rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-800 dark:text-[var(--color-text-header)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                {/* Brand Logo inside Install Card */}
                <div className="w-11 h-11 shrink-0 rounded-xl overflow-hidden bg-bg-secondary border border-emerald-500/20 flex items-center justify-center">
                  <svg className="w-9 h-9 select-none" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M 40 50 H 60 C 75 25, 110 25, 125 50" 
                      stroke="#FFFFFF" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      fill="none" 
                    />
                    <circle cx="46" cy="45" r="2.5" fill="#0F2E59" />
                    <circle cx="54" cy="45" r="2.5" fill="#0F2E59" />
                    <path 
                      d="M 35 95 C 45 130, 95 130, 115 105" 
                      stroke="#FF6B00" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      fill="none" 
                    />
                    <path d="M 110 106 L 122 102 L 118 114 Z" fill="#FF6B00" />
                    <text 
                      x="18" 
                      y="96" 
                      className="font-sans font-black fill-white" 
                      fontSize="70" 
                      letterSpacing="-4"
                    >
                      36
                    </text>
                    <circle cx="115" cy="75" r="24" fill="url(#orangeLogoGradInstall)" />
                    <circle cx="115" cy="75" r="18" fill="#FFFFFF" />
                    <path 
                      d="M 103 66 L 107 66 L 110 78 L 123 78 L 126 69 L 109 69" 
                      stroke="#FF6B00" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      fill="none" 
                    />
                    <circle cx="113" cy="84" r="2.5" fill="#FF6B00" />
                    <circle cx="121" cy="84" r="2.5" fill="#FF6B00" />
                    <defs>
                      <linearGradient id="orangeLogoGradInstall" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF8A00" />
                        <stop offset="100%" stopColor="#FF5200" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-black font-sans uppercase tracking-tight text-[var(--color-text-header)]">Install Bazar360</h4>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Access certified vehicles, instant dealer chats, and live price indices directly from your homescreen.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleDismissInstall}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] p-1 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleDismissInstall}
                className="flex-1 py-2.5 border border-[var(--color-border-main)] hover:bg-white/5 rounded-xl text-xs font-bold text-text-muted transition-all uppercase tracking-wider"
              >
                Maybe Later
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-amber-600 hover:opacity-90 active:scale-[0.98] rounded-xl text-xs font-black text-[var(--color-text-header)] transition-all uppercase tracking-wider shadow"
              >
                Install App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First Time Visitor Lead Collection Onboarding Modal */}
      <FirstTimeLeadModal lang={lang} />

      {/* Persistent PWA Install Gateway Banner */}
      <PWAInstallBanner lang={lang} />

      {/* Modern Navigation Shell Components */}
      <ScrollToTopButton currentTab={currentTab} />
      <BottomNavBar currentTab={currentTab} setTab={handleSetTab} lang={lang} currentUser={currentUser} favoritesCount={favoritesList.length} cartCount={favoritesList.length} />

    </NavigationAudit>
  );
}
