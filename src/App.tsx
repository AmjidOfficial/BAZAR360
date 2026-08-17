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
        <span className="text-[8.5px] font-mono font-bold tracking-widest text-text-muted uppercase leading-none mt-0.5">Verified Automotive Marketplace</span>
      </div>
    </div>
  );
}

const METRIC_TABS_DATA: Record<string, Array<{label: string; value: string}>> = {};
const HOTSPOTS_LIST: any[] = [];

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ShowroomProfile from "./pages/ShowroomProfile";
import AdminShowroomCreator from './components/AdminShowroomCreator';
import ShowroomOwnerPortal from './components/ShowroomOwnerPortal';
import { VehicleDetail } from "./components/VehicleDetail";
import { RoleProvider } from './contexts/RoleContext';

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
            <Route path="/owner" element={<ShowroomOwnerPortal />} />
            <Route path="/showroom-owner" element={<ShowroomOwnerPortal />} />
            <Route path="/search" element={<App />} />
            <Route path="/favorites" element={<App />} />
            <Route path="/admin/showrooms" element={<AdminShowroomCreator />} />
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
      <div className="flex items-center gap-2 font-black"><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>{identity}</div>
      <div className="hidden sm:block opacity-80">{greeting}</div>
    </div>
  );
}
function App() {
  const navigate = useNavigate();
  const { renderPrice } = useCurrencyMode();
  const [lang, setLang] = useState<'en' | 'ur'>(() => {
    try {
      const savedLang = localStorage.getItem('bazar360_lang');
      if (savedLang === 'en' || savedLang === 'ur') return savedLang;
      const browserLang = typeof navigator !== 'undefined' ? (navigator.language || '').toLowerCase() : '';
      if (browserLang.startsWith('ur')) return 'ur';
    } catch (e) { console.warn('Locale storage access restricted, reverting to default English locale.'); }
    return 'en';
  });
  const toggleLanguage = () => { const nextLang = lang === 'en' ? 'ur' : 'en'; setLang(nextLang); try { localStorage.setItem('bazar360_lang', nextLang); } catch (e) {} };
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [preselectedServiceCar, setPreselectedServiceCar] = useState<CarListing | null>(null);
