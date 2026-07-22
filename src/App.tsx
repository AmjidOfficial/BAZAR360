import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Home, PlusCircle, Grid, Store, User, LogIn, X, ShieldCheck, MapPin, Gauge, Fuel, Milestone, Star, Award, DollarSign, Send, Hourglass, Bell, Sparkles, Car, MessageSquare, Headphones, QrCode, Heart, Copy, ExternalLink, Share2, Users, Phone, ArrowLeft } from 'lucide-react';
import { CarListing, Dealer, Review } from './types';
import { INITIAL_DEALERS, INITIAL_LISTINGS, INITIAL_REVIEWS } from './data';

import { 
  dbFetchDealers, 
  dbFetchListings, 
  dbSaveListing, 
  dbRegisterDealership, 
  dbApproveListing, 
  dbAddReview, 
  dbFetchReviews,
  dbSaveUserProfile,
  dbFetchUserProfile,
  UserProfile,
  seedDatabaseIfEmpty,
  dbSaveSuggestion,
  dbTrackLeadAction,
  dbToggleFavorite,
  dbSaveRecentView,
  dbTrackShowroomEvent
} from './lib/dbService';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useCurrencyMode } from './lib/currency';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import ThemeEngine from './components/ThemeEngine';

import Footer from './components/Footer';
import NavigationAudit from './components/NavigationAudit';
import AuthModal from './components/AuthModal';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import ShowroomsHub from './components/ShowroomsHub';

// Use React.lazy for code splitting and performance optimization (Lighthouse 95+)
import DealerStorefrontView from './components/ShowroomMiniSite';
const HomeView = React.lazy(() => import('./components/HomeView'));
const SearchExplorerView = React.lazy(() => import('./components/SearchExplorerView'));

const DetailedVehiclePostingPage = React.lazy(() => import('./components/DetailedVehiclePostingPage'));
const AdminModerationDeck = React.lazy(() => import('./components/AdminModerationDeck'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const RegistrationPortal = React.lazy(() => import('./components/RegistrationPortal'));
const NotificationsView = React.lazy(() => import('./components/NotificationsView'));
const AutoServicesView = React.lazy(() => import('./components/AutoServicesView'));
const ContactView = React.lazy(() => import('./components/ContactView'));
const UserProfileView = React.lazy(() => import('./components/UserDashboard'));
const SocialFeedView = React.lazy(() => import('./components/SocialFeedView'));

import { VehicleCard } from './components/VehicleCard';
import LeadCaptureForm from './components/LeadCaptureForm';
import { useAuth, AuthProvider } from './components/AuthContext';
import ContactDrawer from './components/ContactDrawer';
import { Bazar360Logo } from './components/Bazar360Logo';
import { motion, AnimatePresence } from 'motion/react';
import { initializeVisitorTracking, trackSearchQuery, trackVehicleView } from './lib/visitorTracking';
import { SEO } from './components/SEO';
import { TopBanner } from './components/layout/TopBanner';
import { SkeletonLoader } from './components/layout/SkeletonLoader';

const METRIC_TABS_DATA = {
  Design: [
    { label: "Aerodynamic Drag Coefficient", value: "0.24 Cd" },
    { label: "Chassis Composition", value: "High-Tensile Carbon-Infused Steel Ring" },
    { label: "Ground Physics", value: "Underbody Ground-Effect Venturi Tunnels" }
  ],
  Safety: [
    { label: "ADAS Autonomous Level", value: "Level 2+ Lidar lane-keep" },
    { label: "Structural anchors", value: "Isofix rigid alloy bindings" },
    { label: "Collision Mitigation", value: "Dynamic automated front & rear braking" }
  ],
  Luxury: [
    { label: "Acoustic Insulation", value: "Triple-pane laminated quiet-glass" },
    { label: "Climate Diffuser", value: "Ionized active forest breezer module" },
    { label: "Showroom Audio Setup", value: "Burmester 3D Surround sound structure" }
  ],
  Performance: [
    { label: "0-100 Speed Sprint", value: "3.8 seconds" },
    { label: "Torque Vectoring", value: "Dual-motor active traction differential" },
    { label: "Gearbox Synchro Ratio", value: "8-speed twin-clutch direct-shift" }
  ]
};

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
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          <ThemeEngine />
          <Router>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/dealers/:showroomSlug" element={<ShowroomProfile />} />
              <Route path="/dealers/:showroomSlug/listings/:listingId" element={<App />} />
              <Route path="/showroom/:showroomSlug" element={<ShowroomProfile />} />
              <Route path="/showroom/:showroomSlug/car/:carId" element={<ShowroomProfile />} />
            </Routes>
          </Router>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

import { useRole } from './contexts/RoleContext';

function App() {
  const navigate = useNavigate();
  const { renderPrice } = useCurrencyMode();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

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

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

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
    const path = window.location.pathname;
    let tab = 'home';
    let dealerId = 'auto-choice-peshawar';
    let listing: CarListing | null = null;

    if (path.startsWith('/dealers/')) {
      const segments = path.split('/').filter(Boolean);
      const dId = segments[1];
      if (dId) {
        dealerId = dId;
        tab = 'dealer-storefront';
        if (segments[2] === 'listings' && segments[3]) {
          const lId = segments[3];
          const found = INITIAL_LISTINGS.find(l => l.id === lId);
          if (found) {
            listing = found;
          }
        }
      }
    } else if (path !== '/' && path !== '') {
      const tName = path.slice(1);
      const validTabs = ['inventory', 'media', 'insights', 'concierge', 'dealers', 'sell', 'portal', 'search', 'favorites', 'admin', 'community'];
      if (validTabs.includes(tName)) {
        tab = tName;
      }
    }
    return { tab, dealerId, listing };
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
    setTab(newTab);
  };

  const [prevTab, setPrevTab] = useState<string>('home');
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState<boolean>(false);
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
    try {
      const saved = localStorage.getItem('bazar360_recent_views');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
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

    // Save to recently viewed list
    const filtered = recentViewsList.filter((r) => r.id !== car.id);
    const updated = [car, ...filtered].slice(0, 10);
    setRecentViewsList(updated);
    localStorage.setItem('bazar360_recent_views', JSON.stringify(updated));

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
    // 1. Compute target pathname based on current state variables
    let targetPath = '/';
    if (selectedListing) {
      targetPath = `/dealers/${selectedListing.dealerId || 'private'}/listings/${selectedListing.id}`;
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
  }, [currentTab, selectedDealerId, selectedListing]);

  useEffect(() => {
    // 3. Handle back/forward buttons (popstate event) or direct links and match state to URL
    const parseUrl = () => {
      const path = window.location.pathname;
      const activeListings = listings.length > 0 ? listings : INITIAL_LISTINGS;
      
      if (path === '/' || path === '') {
        setTab('home');
        setSelectedListing(null);
      } else if (path.startsWith('/dealers/')) {
        const segments = path.split('/').filter(Boolean);
        const dId = segments[1];
        if (dId) {
          if (segments[2] === 'listings' && segments[3]) {
            const lId = segments[3];
            const found = activeListings.find(l => l.id === lId);
            if (found) {
              setSelectedListing(found);
              setSelectedDealerId(dId);
            } else {
              setSelectedDealerId(dId);
              setTab('dealer-storefront');
              setSelectedListing(null);
            }
          } else {
            setSelectedDealerId(dId);
            setTab('dealer-storefront');
            setSelectedListing(null);
          }
        }
      } else {
        const tName = path.slice(1);
        const validTabs = ['inventory', 'media', 'insights', 'concierge', 'dealers', 'sell', 'portal', 'search'];
        if (validTabs.includes(tName)) {
          setTab(tName);
          setSelectedListing(null);
        }
      }
    };

    window.addEventListener('popstate', parseUrl);
    
    // Parse on initial load or transition when database listings/dealers populate
    parseUrl();

    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

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

  // Initial Sync and Seed workflow
  useEffect(() => {
    async function initDatabase() {
      setDbLoading(true);
      
      // Fast connection race-timer to guarantee instant rendering even if connection is firewalled or slow
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase connection timeout - loading high speed local layout')), 2500)
      );

      try {
        await Promise.race([
          (async () => {
            await seedDatabaseIfEmpty();
            
            const fetchedDealers = await dbFetchDealers();
            const fetchedListings = await dbFetchListings();
            
            setDealers(fetchedDealers);
            setListings(fetchedListings);
            
            // Load reviews in record
            const revsRecord: Record<string, Review[]> = {};
            for (const dl of fetchedDealers) {
              revsRecord[dl.id] = await dbFetchReviews(dl.id);
            }
            setReviewsMap(revsRecord);
          })(),
          timeoutPromise
        ]);
      } catch (err) {
        console.warn('Sandbox local sync fallback activated due to:', err);
        // Load highly responsive mock data instantly so the layout works flawlessly in offline / slow connection modes
        setDealers(INITIAL_DEALERS);
        setListings(INITIAL_LISTINGS);
        
        // Build reviews record from local backups
        const revsRecord: Record<string, Review[]> = {};
        for (const dl of INITIAL_DEALERS) {
          revsRecord[dl.id] = INITIAL_REVIEWS[dl.id] || [];
        }
        setReviewsMap(revsRecord);
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

          if (fetchedProfile) {
            // Force Super Admin for Ghani and Amjid if they log in, ensuring they always have Admin credentials
            if (isAmjid || isGhani) {
              if (fetchedProfile.role !== 'Admin') {
                console.log(`[Super Admin Elevation] Granting Super Admin role to: ${firebaseUser.email}`);
                fetchedProfile.role = 'Admin';
                await dbSaveUserProfile(fetchedProfile).catch(err => console.warn("Admin role update failed:", err));
              }
            } else if (isMalak) {
              // Malak Mazhar is Dealer (Owner/Partner of Auto Choice)
              if (fetchedProfile.role !== 'Dealer') {
                console.log(`[Dealer Assignment] Assigning Dealer role to Malak Mazhar: ${firebaseUser.email}`);
                fetchedProfile.role = 'Dealer';
                fetchedProfile.displayName = 'Malak Mazhar';
                fetchedProfile.phoneNumber = '+923159085086';
                fetchedProfile.city = 'Peshawar';
                await dbSaveUserProfile(fetchedProfile).catch(err => console.warn("Dealer role update failed:", err));
              }
            }
            setCurrentUser(fetchedProfile);
          } else {
            // First-time signup fallback: create a robust, rules-compliant profile
            const fallbackProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || 'amjid.bisconni@gmail.com',
              displayName: isMalak ? 'Malak Mazhar' : (isGhani ? 'Ghani Khan (Admin)' : 'Muhammad Amjid (Founder)'),
              phoneNumber: isMalak ? '+923159085086' : (isGhani ? '+92 355 6908995' : (firebaseUser.phoneNumber || '+92 314 3600000')),
              phoneVerified: isMalak || isGhani || !!firebaseUser.phoneNumber,
              city: (isMalak || isGhani) ? 'Peshawar' : 'Lahore',
              state: (isMalak || isGhani) ? 'Khyber Pakhtunkhwa' : 'Punjab',
              role: isMalak ? 'Dealer' : ((isAmjid || isGhani) ? 'Admin' : 'Buyer'),
              status: 'Active',
              socials: {
                facebook: 'https://facebook.com/amjid.bazar360',
                instagram: 'https://instagram.com/amjid_b360'
              },
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              region: 'Lahore'
            };
            setCurrentUser(fallbackProfile);
            await dbSaveUserProfile(fallbackProfile).catch(err => console.warn("Fallback profile save skip:", err));
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
      salesPodId = 'auto-choice-peshawar'; // Hard link to Auto Choice Peshawar for live sandbox tests!
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
    
    const finalListing: CarListing = {
      ...newListing,
      approved: isApprovedByDefault,
      assignedSalesRepId: currentUser?.uid || 'guest-seller',
      // If of Showroom Owner role, assign to their showroom
      dealerId: currentUser?.role === 'Showroom Owner' && currentUser?.salesPodId ? currentUser.salesPodId : 'private',
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
    try {
      await dbApproveListing(listingId, true);
    } catch (err) {
      console.warn(err);
    }
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, approved: true } : l))
    );
  };

  const handleRejectListing = async (listingId: string) => {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await deleteDoc(doc(db, 'listings', listingId));
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

  // Flagship Priority Injection: Sort auto-choice-peshawar entries to the absolute top of everything
  const prioritizedListings = React.useMemo(() => {
    const flagshipListings = visibleListings.filter(l => l.dealerId === 'auto-choice-peshawar');
    const ordinaryListings = visibleListings.filter(l => l.dealerId !== 'auto-choice-peshawar');
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
      <div className="bg-[var(--color-bg-primary)] text-[#E2E8F0] min-h-screen text-sm font-sans flex flex-col justify-start py-6 px-4 md:px-8 relative overflow-y-auto select-none">
        {/* Subtle, Sophisticated Background Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#2563EB]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none opacity-85"></div>

        {/* 1. REFINED PREMIUM GATEWAY NAVBAR */}
        {currentTab !== 'dealer-storefront' && (
          <header className="hidden md:flex w-full items-center justify-between py-3 border-b border-[var(--color-border-main)] relative z-20 mb-3 max-w-7xl mx-auto shrink-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-md sticky top-0 px-4 md:px-8">
            {/* Core Branding */}
            <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setTab('home')}>
              <svg className="w-11 h-11 select-none flex-shrink-0" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 45 70 C 45 32, 135 32, 135 70" stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" fill="none" className="stroke-[#00E5FF]" />
                <circle cx="62" cy="54" r="3.5" fill="#FFFFFF" />
                <path d="M 35 105 C 40 152, 128 152, 142 118" stroke="#F97316" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M 132 112 L 148 112 L 144 126 Z" fill="#F97316" stroke="#F97316" strokeWidth="3" strokeLinejoin="round" />
                <text x="32" y="112" fill="#FFFFFF" className="font-sans font-black" fontSize="64" letterSpacing="-4">360</text>
                <circle cx="132" cy="90" r="24" fill="url(#orangeLogoGradApp)" />
                <path d="M 118 80 L 122 80 L 126 94 L 140 94 L 144 84 L 124 84" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="127" cy="101" r="3" fill="#FFFFFF" />
                <circle cx="139" cy="101" r="3" fill="#FFFFFF" />
                <defs>
                  <linearGradient id="orangeLogoGradApp" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black text-[var(--color-text-header)] tracking-wider leading-none">BAZAR<span className="text-orange-500 font-extrabold">360</span><span className="text-xs font-black text-[#38BDF8] ml-0.5 lowercase">.online</span></span>
                <span className="text-[7.5px] font-bold text-[var(--color-text-muted)] tracking-[0.18em] uppercase pt-1 font-sans">
                  BUY <span className="text-orange-500 font-black">|</span> SELL <span className="text-orange-500 font-black">|</span> CONNECT
                </span>
              </div>
            </div>

            {/* Main Desktop Tabs */}
            <nav className="flex items-center gap-6">
              <button onClick={() => setTab('home')} className={`text-[11px] font-black uppercase tracking-wider transition-colors ${currentTab === 'home' ? 'text-[#38BDF8]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'}`}>Home</button>
              <button onClick={() => setTab('inventory')} className={`text-[11px] font-black uppercase tracking-wider transition-colors ${currentTab === 'inventory' ? 'text-[#38BDF8]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'}`}>Inventory</button>
              <button onClick={() => setTab('dealers')} className={`text-[11px] font-black uppercase tracking-wider transition-colors ${currentTab === 'dealers' ? 'text-[#38BDF8]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-header)]'}`}>Showrooms</button>
              
              {/* Prominent CTA for Post Ad */}
              <button
                onClick={() => setTab('sell')}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-[var(--color-text-header)] rounded-lg text-[11px] font-mono font-black tracking-wider uppercase transition-all shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <PlusCircle size={14} />
                <span>Post Ad</span>
              </button>

              <button 
                onClick={() => currentUser ? setTab('profile') : setIsAuthModalOpen(true)} 
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-300 hover:text-[var(--color-text-header)] transition-colors border border-[var(--color-border-main)] px-3 py-1.5 rounded-md"
              >
                {currentUser ? <User size={14} /> : <LogIn size={14} />}
                <span>{currentUser ? 'Profile' : 'Login / Register'}</span>
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <a 
                href="https://wa.me/923159085086" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#25D366] hover:text-green-400 transition-colors"
              >
                <MessageSquare size={14} />
                <span>WhatsApp</span>
              </a>
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
          <span className="text-[9px] uppercase font-mono font-black tracking-[0.25em] text-[#38BDF8] bg-[#38BDF8]/10 px-3.5 py-1.5 rounded-full border border-sky-500/20 shadow-sm">
            ★ Pakistan's Trusted Automotive Marketplace
          </span>
          <h1 className="text-2xl md:text-3.5xl lg:text-4xl font-black tracking-tight text-[var(--color-text-header)] uppercase leading-tight md:leading-snug">
            Unified Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-orange-500">Ecosystem Gateway</span>
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
              <span className="text-[10px] font-mono tracking-widest text-[#38BDF8] uppercase font-black">
                ● FLAGSHIP DIVISION LIVE
              </span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono px-2.5 py-0.5 border border-emerald-500/20 rounded-md font-black tracking-widest uppercase">
                100% Verified
              </span>
            </div>

            <div 
              onClick={() => handleSetCategory('auto')}
              className="flex-1 bg-[#1E293B] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#38BDF8]/30 hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer group select-none relative overflow-hidden"
            >
              {/* Decorative Subtle Overlay Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-5"></div>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#1E293B]/50 to-transparent pointer-events-none"></div>

              <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-start">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-mono text-orange-400 font-black tracking-widest uppercase bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20">
                    SECTOR 01 • ACTIVE MARKET
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#38BDF8] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>1,452 Connected Sellers</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <Bazar360Logo className="scale-110 origin-left" showTagline={true} themeMode="dark" />
                </div>

                <p className="text-gray-400 text-xs leading-relaxed font-sans text-left flex-1 min-h-0 overflow-y-auto no-scrollbar py-1">
                  Experience Pakistan’s elite digitized automotive platform. Browse certified SUVs, premium electric sedans, and high-performance imports with live valuation matrices, secure direct trade options, and instant spot-inspection alignments in Peshawar.
                </p>

                {/* Styled Vehicle Vector Graphic in premium dark colors */}
                <div className="py-2 opacity-85 group-hover:opacity-100 transition-opacity duration-300 shrink-0 hidden sm:block">
                  <svg className="w-full h-12 text-[#38BDF8]/15 group-hover:text-[#38BDF8]/25 transition-colors" viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 28 C 10 24, 25 24, 30 18 L 45 10 C 50 8, 70 8, 75 14 L 90 20 C 105 20, 110 24, 110 28 Z" />
                    <circle cx="30" cy="28" r="5" fill="#1E293B" stroke="currentColor" strokeWidth="2" />
                    <circle cx="85" cy="28" r="5" fill="#1E293B" stroke="currentColor" strokeWidth="2" />
                    <path d="M5 28 L 115 28" strokeWidth="0.8" strokeDasharray="3,3" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--color-border-main)] pt-3 mt-3 relative z-10 w-full shrink-0">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase group-hover:text-[#38BDF8] transition-colors">
                  Tap anywhere to launch portal
                </span>
                <div className="bg-[#2563EB] text-[var(--color-text-header)] rounded-xl px-4 py-2 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-sky-600/10 group-hover:bg-[#3B82F6] transition-all active:scale-[0.98]">
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
              <span className="text-[9px] bg-orange-500/10 text-orange-400 font-mono px-2.5 py-0.5 border border-orange-500/20 rounded-md font-black tracking-widest uppercase">
                Nationwide Expansion
              </span>
            </div>

            <div 
              className="flex-1 bg-[#1E293B] border border-[var(--color-border-main)] rounded-3xl p-5 md:p-6.5 flex flex-col justify-between transition-all duration-300 hover:border-orange-500/30 hover:shadow-2xl relative overflow-hidden group select-none"
            >
              {/* Backdrops */}
              <div className="absolute inset-0 bg-[radial-gradient(#f97316_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-5"></div>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#1E293B]/50 to-transparent pointer-events-none"></div>

              <div className="space-y-4.5 relative z-10 text-left flex-1 flex flex-col justify-start">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-mono text-[#38BDF8] font-black tracking-widest uppercase bg-[#38BDF8]/10 px-3 py-1 rounded-lg border border-sky-500/20">
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
                        : 'bg-[#111827] text-gray-400 hover:text-[var(--color-text-header)] border-[var(--color-border-main)]'
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
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
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
                      className="flex-1 bg-[#111827] border border-[var(--color-border-main)] rounded-xl px-3 py-2.5 text-xs text-[var(--color-text-header)] placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:bg-[#111827] transition-all"
                    />
                    <button
                      id="submit-suggestion-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOnSubmitSuggestion();
                      }}
                      disabled={isSubmittingSuggestion || !suggestionText.trim()}
                      className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-[#111827] disabled:text-gray-600 text-[var(--color-text-header)] font-sans font-black text-xs rounded-xl uppercase tracking-wider transition-all duration-200 cursor-pointer select-none active:scale-[0.98] shrink-0"
                    >
                      {isSubmittingSuggestion ? "Sending..." : "Submit Proposal"}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[8px] text-gray-500 font-mono font-bold uppercase">Presets:</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSuggestionText("Peshawar Almas Car Valley location listings filter"); }}
                      className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#111827]/85 text-[8px] font-mono text-gray-300 border border-[var(--color-border-main)] cursor-pointer transition-all"
                    >
                      + Almas Valley Filters
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSuggestionText("Smart inspection sheet uploading module"); }}
                      className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#111827]/85 text-[8px] font-mono text-gray-300 border border-[var(--color-border-main)] cursor-pointer transition-all"
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
                      ? 'bg-[#2563EB] text-[var(--color-text-header)] shadow-md shadow-sky-600/10'
                      : 'bg-transparent text-[#38BDF8] border border-[#38BDF8]/30 hover:border-[#38BDF8]/50 hover:bg-sky-500/5 shadow-sm'
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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
            <div className="bg-[#1E293B] border border-[var(--color-border-main)] max-w-lg w-full rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl relative text-[var(--color-text-header)] text-left animate-slide-up">
              <button 
                onClick={() => setComingSoonSector(null)} 
                className="absolute top-4 right-4 bg-[#111827] hover:bg-[#111827]/80 text-gray-400 hover:text-[var(--color-text-header)] p-2 rounded-xl transition-all cursor-pointer border border-[var(--color-border-main)]"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3.5 pt-2">
                <div className="text-3xl bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20 text-[#38BDF8] font-sans">{comingSoonSector.icon}</div>
                <div>
                  <h3 className="text-lg font-black uppercase text-[var(--color-text-header)] tracking-tight">{comingSoonSector.title}</h3>
                  <p className="text-[#38BDF8] font-mono text-[10px] font-black uppercase tracking-widest">Active Development Channel</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="bg-[#111827] p-4 rounded-2xl border border-[var(--color-border-main)]">
                  <span className="text-[8px] uppercase tracking-wider text-orange-400 font-mono block font-black mb-1">Target Mission Statement:</span>
                  <p className="text-[var(--color-text-header)] font-sans font-bold text-xs leading-relaxed">{comingSoonSector.tagline}</p>
                </div>

                <div className="bg-[#111827] p-4 rounded-2xl border border-[var(--color-border-main)]">
                  <span className="text-[8px] uppercase tracking-wider text-[#38BDF8] font-mono block font-black mb-1">Functional Outline:</span>
                  <p className="text-gray-400 text-xs font-sans leading-relaxed">{comingSoonSector.desc}</p>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-[10.5px] text-emerald-400 font-mono font-medium leading-relaxed">
                  🚀 Compliance: {comingSoonSector.spec}
                </div>
              </div>

              <div className="pt-2 text-center">
                <button 
                  onClick={() => setComingSoonSector(null)}
                  className="bg-[#2563EB] hover:bg-[#3B82F6] text-[var(--color-text-header)] font-mono font-black py-3.5 px-6 rounded-xl w-full text-xs uppercase active:scale-[0.98] duration-100 cursor-pointer shadow-lg"
                >
                  Dismiss & Return
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-slate-500 text-[9px] md:text-[10px] uppercase font-mono tracking-widest pb-[env(safe-area-inset-bottom)] md:pb-1 mt-1 shrink-0 relative z-10 border-t border-[var(--color-border-main)] pt-3">
          Built in Peshawar. Trusted Across Pakistan. 🇵🇰 &bull; Founder: Muhammad Amjid &bull; Helpline Connect: <a href="tel:03149198403" className="text-orange-500 hover:underline font-bold">03149198403</a> &bull; BAZAR360 Pakistan Enterprise &copy; 2026.
        </div>
      </div>
    );
  }

  if (currentCategory === 'footwear') {
    return (
      <div className="bg-[#030712] text-[var(--color-text-header)] min-h-screen text-sm font-sans flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

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
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-slate-950 font-mono font-bold hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 duration-100 rounded-xl text-xs uppercase cursor-pointer"
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
            <div className="bg-slate-900/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-amber-500/25 duration-150">
              <span className="text-2xl">👞</span>
              <h3 className="font-bold text-[var(--color-text-header)] uppercase">Prestige Peshawari</h3>
              <p className="text-xs text-gray-400 font-sans">Hand-stitched premium Charsadda calf leather with dual-density high-grip rubber soles.</p>
              <div className="text-amber-400 font-mono font-bold text-sm">Rs. 8,500</div>
            </div>
            <div className="bg-slate-900/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-amber-500/25 duration-150">
              <span className="text-2xl">👟</span>
              <h3 className="font-bold text-[var(--color-text-header)] uppercase">Apex Wave Runners</h3>
              <p className="text-xs text-gray-400 font-sans">Breathable PrimeKnit mesh with high energy return reactive shock absorber midsoles.</p>
              <div className="text-amber-400 font-mono font-bold text-sm">Rs. 14,800</div>
            </div>
            <div className="bg-slate-900/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-amber-500/25 duration-150">
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
      <div className="bg-[#030712] text-[var(--color-text-header)] min-h-screen text-sm font-sans flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_1px,transparent_1px] pointer-events-none"></div>

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
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-slate-950 font-mono font-bold hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 duration-100 rounded-xl text-xs uppercase cursor-pointer"
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
            <div className="bg-slate-900/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-emerald-500/25 duration-150">
              <span className="text-2xl text-yellow-400">🍯</span>
              <h3 className="font-bold text-[var(--color-text-header)] uppercase">Organic Hunza Honey</h3>
              <p className="text-xs text-gray-400 font-sans">100% natural, unfiltered wild honey gathered directly from highland Hunza blossoms.</p>
              <div className="text-emerald-400 font-mono font-bold text-sm">Rs. 3,200</div>
            </div>
            <div className="bg-slate-900/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-emerald-500/25 duration-150">
              <span className="text-2xl text-amber-500">🌾</span>
              <h3 className="font-bold text-[var(--color-text-header)] uppercase">Premium Super Basmati</h3>
              <p className="text-xs text-gray-400 font-sans">5kg of aged super-kernel premium basmati rice, famed for non-sticky extra-long grains.</p>
              <div className="text-emerald-400 font-mono font-bold text-sm">Rs. 1,950</div>
            </div>
            <div className="bg-slate-900/60 border border-[var(--color-border-main)] p-5 rounded-2xl space-y-3 shadow-xl hover:border-emerald-500/25 duration-150">
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
      <main className={`flex-grow w-full pb-28 md:pb-12 transition-all ${
        currentTab === 'home' 
          ? 'pt-0 px-0 md:px-0 max-w-full' 
          : `max-w-7xl mx-auto px-5 md:px-16 ${currentCategory === 'auto' ? 'pt-28' : 'pt-20'}`
      }`}>
        
        {activeIndustry !== 'Automotive' && (
          <div className="mb-6 bg-slate-950/90 backdrop-blur-md border border-[#38BDF8]/30 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-scale-fade shadow-xl">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 uppercase tracking-widest">
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
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 duration-150 text-slate-950 font-mono font-black text-[10px] uppercase py-2.5 px-4.5 rounded-xl block shrink-0 tracking-widest cursor-pointer"
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
              <NotificationsView lang={lang} />
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
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'en' 
                      ? 'Access and compare your hand-picked luxury vehicles anytime.' 
                      : 'اپنی پسندیدہ گاڑیوں کو یہاں محفوظ کریں اور ان کا موازنہ کریں۔'}
                  </p>
                </div>

                {favoritesList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoritesList.map((car) => (
                      <VehicleCard
                        key={car.id}
                        car={car}
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
                  <div className="bg-[#0b0f19] border border-[var(--color-border-main)] rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-4">
                    <Heart size={36} className="text-gray-600 animate-pulse" />
                    <p className="text-gray-400 text-xs font-sans">
                      {lang === 'en' ? 'No saved vehicles yet.' : 'کوئی پسندیدہ گاڑی محفوظ نہیں کی گئی۔'}
                    </p>
                    <button
                      onClick={() => setTab('search')}
                      className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-slate-950 font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-sky-500/10"
                    >
                      {lang === 'en' ? 'Discover Vehicles' : 'گاڑیاں تلاش کریں'}
                    </button>
                  </div>
                )}
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

            {currentTab === 'services' && (
              <div className="max-w-7xl mx-auto pb-16 px-4 md:px-8">
                <AutoServicesView lang={lang} />
              </div>
            )}

            {currentTab === 'contact' && (
              <div className="max-w-7xl mx-auto pb-16 px-4 md:px-8">
                <ContactView lang={lang} onOpenSupportDrawer={() => setIsContactDrawerOpen(true)} />
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
                onBack={() => handleSetTab('dealers')}
              />
            )}

            {currentTab === 'portal' && (
              <div className="max-w-7xl mx-auto space-y-6 md:space-y-12 pb-16 px-1.5 sm:px-4 md:px-8 text-left">
                {/* Secondary Registration Portal and Submissions forms */}
                <div className="border border-[var(--color-border-main)] rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-8 bg-[#0a0a0c] text-left">
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

            {currentTab === 'admin' && (
              <AdminDashboard
                listings={listings}
                dealers={dealers}
                onDeleteListing={(id) => setListings(prev => prev.filter(l => l.id !== id))}
                onDeleteDealer={(id) => setDealers(prev => prev.filter(d => d.id !== id))}
                lang={lang}
                setTab={handleSetTab}
              />
            )}

            {currentTab === 'sell' && (
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

      {/* DYNAMIC LISTING DETAILS FULL SCREEN MODAL */}
      <AnimatePresence>
        {selectedListing && (
          <VehicleDetail
            car={selectedListing}
            dealer={dealers.find(d => d.id === selectedListing.dealerId) || { id: 'private', name: 'Private Seller', location: 'Unknown', phone: '0000000000' } as any}
            onClose={() => setSelectedListing(null)}
          />
      )}
    </AnimatePresence>

      
      
      {/* STICKY VEHICLE COMPARISON DRAWER BAR */}
      {compareList.length > 0 && (
        <div className="fixed bottom-22 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-[500px] bg-[var(--color-bg-secondary)]/95 text-[var(--color-text-header)] border border-[#38BDF8]/40 p-3.5 rounded-2xl shadow-2xl backdrop-blur flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="bg-[#38BDF8] text-slate-950 font-mono font-black text-[9px] px-2 py-0.5 rounded-lg">
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
                    className="absolute -top-1 -right-1 bg-red-500 p-0.5 rounded-full text-[6px] hover:bg-red-600 border border-[#0c1221] w-3.5 h-3.5 flex items-center justify-center"
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
              className="text-[10px] text-gray-400 hover:text-[var(--color-text-header)] uppercase font-mono font-bold tracking-wider px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={() => setShowComparisonModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black font-mono text-[9px] uppercase px-3 py-2 rounded-xl transition-all shadow-md shadow-orange-950/20 tracking-wider active:scale-95 cursor-pointer"
            >
              Compare Matchup &rarr;
            </button>
          </div>
        </div>
      )}

      {/* DUAL COMPARISON DRAWER SPECIFICATIONS TABLE MODAL */}
      {showComparisonModal && compareList.length > 0 && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-[#0b121f] border border-[#1e293b] rounded-3xl max-w-3xl w-full text-xs font-sans shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col animate-scale-fade">
            
            <div className="bg-[#121a2a] p-4 border-b border-[#1e293b] flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-sans font-black text-[var(--color-text-header)] text-sm uppercase tracking-tight">BAZAR360 Dynamic Comparison Deck</h3>
                <p className="text-[9px] text-gray-400 font-mono tracking-wider mt-0.5">Dual car matchup analyzer with active spec matching.</p>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="text-gray-400 hover:text-[var(--color-text-header)] bg-[#1e293b] p-1.5 rounded-xl border border-[var(--color-border-main)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-5 space-y-6">
              
              {/* Product Comparison Header Grid */}
              <div className="grid grid-cols-2 gap-4">
                {compareList.map((car) => (
                  <div key={car.id} className="bg-[#121a2a] p-3 rounded-2xl border border-[var(--color-border-main)] space-y-3 relative">
                    <img 
                      src={car.imageUrl} 
                      alt={car.title} 
                      className="w-full h-32 md:h-44 object-cover rounded-xl"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono tracking-widest text-[#38BDF8] font-bold uppercase">{car.make}</span>
                      <h4 className="font-extrabold text-[#F97316] text-xs uppercase truncate leading-none">{car.title}</h4>
                      <p className="font-mono text-[var(--color-text-header)] text-[13px] font-black mt-1">{renderPrice(car.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specs Table Matrix */}
              <div className="border border-[var(--color-border-main)] rounded-2xl overflow-hidden bg-[#070c12]">
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
                    <div key={car.id} className="p-3 bg-[#111928] rounded-xl border border-[var(--color-border-main)] flex flex-col justify-between">
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
                <p id="compare_share_status" className="text-center font-mono text-[10px] text-[#38BDF8] font-bold"></p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 🔮 INTERACTIVE SHOWROOM SHARE CARD & QR CODE PORTAL */}
      {selectedQrDealer && (
        <div className="fixed inset-0 bg-[#0b121f] md:bg-black/95 md:backdrop-blur-md flex items-start justify-center z-[200] overflow-y-auto p-0 md:p-4 animate-fade-in">
          <div className="bg-[#0b121f] md:border md:border-[#1e293b] md:rounded-3xl max-w-md w-full text-xs font-sans shadow-2xl overflow-hidden relative animate-scale-fade flex flex-col p-6 space-y-6 min-h-screen md:min-h-0 md:my-8 pb-32 md:pb-6">
            
            {/* Sticky/Fixed Header for Perfect Viewport Alignment */}
            <div className="sticky top-0 bg-[#0b121f]/95 backdrop-blur-md z-30 pb-3 border-b border-[var(--color-border-main)] flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedQrDealer(null);
                  setQrCopied(false);
                }}
                className="flex items-center gap-1.5 text-gray-400 hover:text-[var(--color-text-header)] bg-[#1e293b] py-2 px-3.5 rounded-xl border border-[var(--color-border-main)] transition-colors cursor-pointer text-[10px] font-mono font-black uppercase tracking-widest"
              >
                <ArrowLeft size={14} /> {lang === 'ur' ? 'واپس' : 'Back'}
              </button>
              <div className="text-right flex flex-col items-end">
                <span className="bg-[#38bdf8]/10 text-[#38bdf8] text-[8.5px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#38bdf8]/20 block">
                  {lang === 'ur' ? 'شوو روم شیئرنگ' : 'SHOWROOM SHARE'}
                </span>
              </div>
            </div>

            {/* Content Layout */}
            <div className="space-y-5 pt-2">
              
              {/* Showroom Logo / Branding Header */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-[var(--color-border-main)] flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-[#38bdf8] overflow-hidden bg-[var(--color-bg-secondary)] shrink-0">
                  {selectedQrDealer.id === 'auto-choice-peshawar' ? (
                    <img 
                      src="/auto_choice_logo_1781509565476.png?v=20260719" 
                      alt="Auto Choice Logo" 
                      className="w-full h-full object-cover" 
                    />
                  ) : selectedQrDealer.avatarUrl ? (
                    <img 
                      src={`${selectedQrDealer.avatarUrl}?v=20260719`} 
                      alt={selectedQrDealer.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-sky-500 font-black text-[var(--color-text-header)] text-xl">
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
              <div className="space-y-2 bg-[#141b2b] p-4 rounded-2xl border border-[var(--color-border-main)]">
                <div className="flex gap-2 items-start text-[var(--color-text-header)]/80">
                  <MapPin size={16} className="text-[#38bdf8] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-mono font-black text-[#38bdf8] block">Showroom Address</span>
                    <p className="text-[11px] leading-relaxed font-sans text-slate-300">{selectedQrDealer.location}</p>
                  </div>
                </div>
                
                {/* Google Map Launch Button */}
                <a 
                  href={selectedQrDealer.id === 'auto-choice-peshawar'
                    ? "https://maps.google.com/?q=Auto+choice+Alamas+Car+Village+Ring+Road+Peshawar"
                    : `https://maps.google.com/?q=${encodeURIComponent(selectedQrDealer.location)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#0b121f] border border-[var(--color-border-main)] hover:border-[#38bdf8] text-[#38bdf8] hover:text-[var(--color-text-header)] py-2.5 px-3.5 rounded-xl text-[9px] uppercase font-mono font-bold tracking-widest flex items-center justify-center gap-1.5 duration-150 cursor-pointer mt-2"
                >
                  Launch Google Maps Navigation <ExternalLink size={11} />
                </a>
              </div>

              {/* Contacts & Showroom Team Desk */}
              <div className="bg-[#141b2b] p-4 rounded-2xl border border-[var(--color-border-main)] space-y-3">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-orange-400" />
                  <span className="text-[9px] uppercase tracking-wider font-mono font-black text-orange-400 block">Contacts & Showroom Team</span>
                </div>

                {selectedQrDealer.id === 'auto-choice-peshawar' ? (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-[#0b121f]/60 p-2 rounded-xl border border-[var(--color-border-main)]">
                        <span className="text-[var(--color-text-muted)] text-[8px] uppercase block">Malak Mazhar</span>
                        <a href="tel:03159085086" className="text-[var(--color-text-header)] font-bold block hover:text-[#38bdf8]">0315-9085086</a>
                      </div>
                      <div className="bg-[#0b121f]/60 p-2 rounded-xl border border-[var(--color-border-main)]">
                        <span className="text-[var(--color-text-muted)] text-[8px] uppercase block">Malak Waseem</span>
                        <a href="tel:03469085033" className="text-[var(--color-text-header)] font-bold block hover:text-[#38bdf8]">0346-9085033</a>
                      </div>
                      <div className="bg-[#0b121f]/60 p-2 rounded-xl border border-[var(--color-border-main)]">
                        <span className="text-[var(--color-text-muted)] text-[8px] uppercase block">M. Nasir Mirza</span>
                        <span className="text-[var(--color-text-header)] font-bold">Member</span>
                      </div>
                      <div className="bg-[#0b121f]/60 p-2 rounded-xl border border-[var(--color-border-main)]">
                        <span className="text-[var(--color-text-muted)] text-[8px] uppercase block">Asfandyar Zafar</span>
                        <span className="text-[var(--color-text-header)] font-bold">Member</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-sans text-[var(--color-text-muted)] text-center italic">
                      "Our Team & Contacts are fully verified and available for custom quotes."
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between items-center bg-[#0b121f]/60 p-2.5 rounded-xl border border-[var(--color-border-main)] font-mono">
                      <span>👤 {selectedQrDealer.contactPerson || 'Showroom Manager'}</span>
                      <a href={`tel:${selectedQrDealer.phone}`} className="text-[#38bdf8] font-bold">{selectedQrDealer.phone}</a>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center text-center space-y-3 bg-[#141b2b] p-4 rounded-2xl border border-[var(--color-border-main)]">
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
              <div className="bg-slate-950 p-3 rounded-xl border border-[var(--color-border-main)] flex items-center justify-between font-mono text-[9px] text-[var(--color-text-muted)]">
                <span className="truncate max-w-[240px] select-all">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/dealers/${selectedQrDealer.id}`
                    : `https://bazar360.online/dealers/${selectedQrDealer.id}`
                  }
                </span>
                <span className="text-[#38bdf8] font-bold text-[8px] uppercase">Link Url</span>
              </div>

            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-4 border-t border-[var(--color-border-main)]">
              <button
                onClick={async () => {
                  const url = typeof window !== 'undefined'
                    ? `${window.location.origin}/dealers/${selectedQrDealer.id}`
                    : `https://bazar360.online/dealers/${selectedQrDealer.id}`;
                  const mapLink = selectedQrDealer.id === 'auto-choice-peshawar'
                    ? "https://maps.google.com/?q=Auto+choice+Alamas+Car+Village+Ring+Road+Peshawar"
                    : `https://maps.google.com/?q=${encodeURIComponent(selectedQrDealer.location)}`;
                  
                  let text = `🚗 *${selectedQrDealer.name.toUpperCase()}* 🚗\n`;
                  text += `✨ Slogan: "${selectedQrDealer.subtitle || 'The Right Choice'}"\n`;
                  text += `📍 Address: ${selectedQrDealer.location}\n`;
                  text += `🗺️ Google Maps: ${mapLink}\n`;
                  
                  if (selectedQrDealer.id === 'auto-choice-peshawar') {
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
                    : 'bg-[#F97316] text-[var(--color-text-header)] hover:bg-orange-600 shadow-lg shadow-orange-950/25'
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
                className="w-full py-2.5 border border-[var(--color-border-main)] hover:bg-white/5 text-slate-300 font-bold text-xs rounded-xl uppercase tracking-wider transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
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
          <div className="bg-[var(--color-bg-secondary)]/95 dark:bg-[#030712]/95 border border-slate-200 dark:border-[var(--color-border-main)] backdrop-blur-md rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-800 dark:text-[var(--color-text-header)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                {/* Brand Logo inside Install Card */}
                <div className="w-11 h-11 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-sky-500/20 flex items-center justify-center">
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
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
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
                className="flex-1 py-2.5 border border-[var(--color-border-main)] hover:bg-white/5 rounded-xl text-xs font-bold text-slate-300 transition-all uppercase tracking-wider"
              >
                Maybe Later
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-90 active:scale-[0.98] rounded-xl text-xs font-black text-[var(--color-text-header)] transition-all uppercase tracking-wider shadow"
              >
                Install App
              </button>
            </div>
          </div>
        </div>
      )}

    </NavigationAudit>
  );
}
