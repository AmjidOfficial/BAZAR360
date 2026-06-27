import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Star, 
  Building2, 
  Users, 
  Car, 
  ChevronRight, 
  PlusCircle,
  Quote,
  CheckCircle2,
  ChevronDown,
  Percent,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  HelpCircle,
  Mail,
  Smartphone,
  Info,
  PhoneCall,
  Check
} from 'lucide-react';
import { Dealer, CarListing } from '../types';
import { UserProfile } from '../lib/dbService';
import { VehicleCard } from './VehicleCard';
import { VehicleSkeletonCard } from './VehicleSkeletonCard';

interface HomeViewProps {
  dealers: Dealer[];
  listings: CarListing[];
  dbLoading?: boolean;
  setTab: (tab: string) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  onSelectDealer: (id: string) => void;
  onSelectListing: (car: CarListing) => void;
  onToggleCompare?: (car: CarListing) => void;
  compareList?: CarListing[];
  currentCategory?: string;
  currentUser?: UserProfile | null;
  lang: 'en' | 'ur';
}

const HERO_SLIDES = [
  {
    id: 'slide-mg',
    brand: 'MG MOTORS PAKISTAN',
    title: 'MG HS Essence Redefines SUV Comfort',
    subtitle: 'British automotive heritage meets modern safety features and luxury interiors.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
    color: '#EF4444'
  },
  {
    id: 'slide-audi',
    brand: 'AUDI PAKISTAN',
    title: 'Audi e-tron GT Progressive luxury',
    subtitle: 'Experience fully electric sports performance with zero emission engineering.',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200',
    color: '#38BDF8'
  },
  {
    id: 'slide-suzuki',
    brand: 'SUZUKI PAKISTAN',
    title: 'Virtual 360° Showroom Experience',
    subtitle: 'Browse the entire new Suzuki inventory online from the comfort of your couch.',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
    color: '#10B981'
  }
];

const BODY_TYPES = [
  { id: 'sedan', name: 'Sedan', icon: '🚗', desc: 'Premium 3-box luxury passenger cars with excellent fuel economy.' },
  { id: 'suv', name: 'SUV', icon: '🚙', desc: 'Robust multi-terrain family utility vehicles with spacious cabins.' },
  { id: 'hatchback', name: 'Hatchback', icon: '🚘', desc: 'Compact, agile, and fuel-efficient commuters perfect for cities.' },
  { id: 'crossover', name: 'Crossover', icon: '🏎️', desc: 'Sleek, high-riding utility vehicles with sporty performance.' },
  { id: 'coupe', name: 'Coupe', icon: '🏎️', desc: 'Two-door high-performance sports models with aerodynamic lines.' },
  { id: 'pickup', name: 'Pickup Truck', icon: '🛻', desc: 'Rugged open-bed loading utility vehicles with immense power.' },
  { id: 'van', name: 'Minivan / Carrier', icon: '🚐', desc: 'Multi-row passenger carriers built for supreme family comfort.' }
];

const POPULAR_BRANDS = [
  { name: 'Toyota', logo: '🚗' },
  { name: 'Honda', logo: '🏎️' },
  { name: 'Suzuki', logo: '🚙' },
  { name: 'Hyundai', logo: '🚘' },
  { name: 'Kia', logo: '精' },
  { name: 'MG', logo: '🚗' },
  { name: 'Audi', logo: '🏎️' },
  { name: 'BMW', logo: '🏎️' },
  { name: 'Mercedes-Benz', logo: '🚘' },
  { name: 'Nissan', logo: '🏎️' },
  { name: 'Ford', logo: '🚙' },
  { name: 'Chevrolet', logo: '🚗' },
  { name: 'BYD', logo: '⚡' },
  { name: 'Tesla', logo: '⚡' },
  { name: 'Lexus', logo: '🚗' },
  { name: 'Porsche', logo: '🏎️' },
  { name: 'Isuzu', logo: '🛻' },
  { name: 'Mitsubishi', logo: '🛻' },
  { name: 'Changan', logo: '🚘' },
  { name: 'Haval', logo: '🚙' },
  { name: 'Peugeot', logo: '🚗' },
  { name: 'Volvo', logo: '🛡️' },
  { name: 'Land Rover', logo: '🚙' },
  { name: 'Jeep', logo: '🚙' }
];

function renderBrandLogo(name: string) {
  switch (name) {
    case 'Toyota':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="12" rx="10" ry="6" stroke="#EF4444" strokeWidth="2" />
          <ellipse cx="12" cy="12" rx="6" ry="6" stroke="#EF4444" strokeWidth="1.5" />
          <ellipse cx="12" cy="10" rx="3" ry="4" stroke="#EF4444" strokeWidth="1.5" />
        </svg>
      );
    case 'Honda':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="3" width="16" height="18" rx="4" stroke="#38BDF8" strokeWidth="2" />
          <path d="M7 6v12M17 6v12M7 12h10" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'Suzuki':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <path d="M17 5H9.5L7 9.5l7.5 5L17 19H7.5" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Hyundai':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="12" rx="10" ry="7" stroke="#3B82F6" strokeWidth="2" transform="rotate(-15 12 12)" />
          <path d="M8 8v8M16 8v8M8 12h8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" transform="rotate(-15 12 12)" />
        </svg>
      );
    case 'Kia':
    case 'KIA':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 60 20" fill="none">
          <path d="M5 2l7 8-7 8M14 2v16M22 18l6-16 6 16M25 12h6" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'MG':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="4" stroke="#EF4444" strokeWidth="2" />
          <text x="12" y="14" fill="#EF4444" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MG</text>
        </svg>
      );
    case 'Audi':
      return (
        <svg className="w-14 h-8 animate-fade-in" viewBox="0 0 40 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="16" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="24" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="32" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
        </svg>
      );
    case 'BMW':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#3B82F6" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" stroke="#94A3B8" strokeWidth="1" />
          <path d="M12 6a6 6 0 016 6h-6zM12 12v6a6 6 0 01-6-6z" fill="#3B82F6" />
        </svg>
      );
    case 'Mercedes-Benz':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#E2E8F0" strokeWidth="2" />
          <path d="M12 3v9M12 12l7 5M12 12L5 17" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'Nissan':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#94A3B8" strokeWidth="2.5" />
          <rect x="2" y="10" width="20" height="4" rx="1" fill="#94A3B8" />
        </svg>
      );
    case 'Ford':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <ellipse cx="20" cy="10" rx="18" ry="8" stroke="#3B82F6" strokeWidth="2" />
          <text x="20" y="13" fill="#3B82F6" fontSize="7" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">Ford</text>
        </svg>
      );
    case 'Chevrolet':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <path d="M15 6h10v2h4v4h-4v2H15v-2h-4V8h4V6z" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        </svg>
      );
    case 'BYD':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <rect x="2" y="4" width="36" height="12" rx="3" stroke="#3B82F6" strokeWidth="1.5" />
          <text x="20" y="12" fill="#3B82F6" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">BYD</text>
        </svg>
      );
    case 'Tesla':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <path d="M12 4c2.5 0 4.5 1.5 5 3.5h-10C7.5 5.5 9.5 4 12 4zM12 8c0 3.5-1.5 6.5-3.5 8h7c-2-1.5-3.5-4.5-3.5-8zM12 17c1.5 1.5 2.5 2.5 3 3.5H9c.5-1 1.5-2 3-3.5z" fill="#EF4444" />
        </svg>
      );
    case 'Lexus':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="12" rx="10" ry="7" stroke="#94A3B8" strokeWidth="2" />
          <path d="M6 16V8h3s3 0 3 2.5-1.5 2.5-3 2.5h-3M9 13l5 3" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Porsche':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <path d="M6 4h12l-2 12-4 4-4-4L6 4z" stroke="#F59E0B" strokeWidth="2" />
          <text x="12" y="12" fill="#F59E0B" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">PORSCHE</text>
        </svg>
      );
    case 'Isuzu':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <text x="20" y="13" fill="#EF4444" fontSize="8" fontWeight="black" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1">ISUZU</text>
        </svg>
      );
    case 'Mitsubishi':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l4 7h-8zM16 9l4 7h-8zM8 9l-4 7h8z" fill="#EF4444" />
        </svg>
      );
    case 'Changan':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#3B82F6" strokeWidth="2" />
          <path d="M7 9l5 6 5-6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Haval':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <rect x="2" y="4" width="36" height="12" rx="2" fill="#EF4444" />
          <text x="20" y="12" fill="#FFFFFF" fontSize="6" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">HAVAL</text>
        </svg>
      );
    case 'Peugeot':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <path d="M12 3a9 9 0 110 18 9 9 0 010-18z" stroke="#3B82F6" strokeWidth="1.5" />
          <path d="M10 8l4 2-2 3 3 3" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Volvo':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="13" r="7" stroke="#3B82F6" strokeWidth="2" />
          <path d="M16 8l4-4M15 4h5v5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Land Rover':
      return (
        <svg className="w-14 h-8 animate-fade-in" viewBox="0 0 44 20" fill="none">
          <ellipse cx="22" cy="10" rx="20" ry="9" stroke="#10B981" strokeWidth="2" />
          <text x="22" y="13" fill="#10B981" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ROVER</text>
        </svg>
      );
    case 'Jeep':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <text x="20" y="14" fill="#94A3B8" fontSize="10" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">Jeep</text>
        </svg>
      );
    case 'Mazda':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#94A3B8" strokeWidth="2" />
          <path d="M5 10c3 2 5 5 7 5s4-3 7-5c-2 2-4 3-7 3s-5-1-7-3z" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'DFSK':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="2" />
          <path d="M8 8h4a3 3 0 010 6H8V8z" stroke="#EF4444" strokeWidth="2" />
          <path d="M14 14l3 3" stroke="#EF4444" strokeWidth="2" />
        </svg>
      );
    case 'Proton':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#F59E0B" strokeWidth="2" />
          <path d="M9 15l4-6 3 4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return <span className="text-2xl">🚗</span>;
  }
}

export default function HomeView({
  dealers,
  listings,
  setTab,
  setSelectedCategory,
  setSearchQuery,
  onSelectDealer,
  onSelectListing,
  onToggleCompare,
  compareList = [],
  currentUser,
  lang = 'en',
  dbLoading = false
}: HomeViewProps) {
  // Modular toggle flags to hide unrequested sections as instructed
  const ENABLE_TRUST_METRICS = false;
  const ENABLE_DOWNLOAD_APP = false;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fallback beautiful slides if dynamic inventory is empty
  const fallbackSlides = useMemo<CarListing[]>(() => [
    {
      id: 'fallback-mg',
      title: 'MG HS Essence 1.5 Turbo',
      make: 'MG',
      model: 'HS Essence',
      year: 2023,
      price: 8200000,
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'],
      registrationCity: 'Islamabad',
      mileage: 12000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      featured: true,
      verified: true,
      dealerId: 'dealer-mg',
      description: 'The MG HS Essence 1.5 Turbo is a premium compact crossover SUV.',
      createdAt: new Date().toISOString(),
      tags: ['Premium', 'SUV', 'Verified'],
      specs: {
        color: 'White',
        engineSize: '1.5L Turbo',
        horspower: '160 hp',
        regionalSpecs: 'Local'
      },
      condition: 'Used',
      engineCC: 1500,
      exteriorColor: 'White',
      bodyCondition: 'Total Genuine',
      documentType: 'Smart Card',
      tokenTaxPaid: true
    },
    {
      id: 'fallback-audi',
      title: 'Audi e-tron GT Quattro',
      make: 'Audi',
      model: 'e-tron GT',
      year: 2022,
      price: 38500000,
      imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200',
      images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200'],
      registrationCity: 'Lahore',
      mileage: 8000,
      fuelType: 'Electric',
      transmission: 'Automatic',
      featured: true,
      verified: true,
      dealerId: 'dealer-audi',
      description: 'The spectacular pure electric grand tourer with Quattro all-wheel drive.',
      createdAt: new Date().toISOString(),
      tags: ['Electric', 'Premium', 'Verified'],
      specs: {
        color: 'Tactical Green',
        engineSize: 'Dual Electric Motors',
        horspower: '522 hp',
        regionalSpecs: 'Imported'
      },
      condition: 'Used',
      engineCC: 0,
      exteriorColor: 'Tactical Green',
      bodyCondition: 'Total Genuine',
      documentType: 'Smart Card',
      tokenTaxPaid: true
    }
  ], []);

  // Use live Firebase listings that are featured or premium. Fallback to pre-packaged slides if empty.
  const activeSlides = useMemo<CarListing[]>(() => {
    const approvedOnly = listings.filter(l => l.approved !== false && !l.isSold);
    const featured = approvedOnly.filter(l => l.featured || l.price >= 4000000);
    if (featured.length > 0) return featured.slice(0, 5);
    if (approvedOnly.length > 0) return approvedOnly.slice(0, 5);
    return fallbackSlides;
  }, [listings, fallbackSlides]);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `Rs. ${(price / 10000000).toFixed(2)} Crore`;
    }
    return `Rs. ${(price / 100000).toFixed(1)} Lakh`;
  };

  // Advanced Smart Search States
  const [localQuery, setLocalQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'used' | 'new'>('all');
  const [searchCity, setSearchCity] = useState<string>('All');
  const [searchPrice, setSearchPrice] = useState<string>('All');
  const [searchTransmission, setSearchTransmission] = useState<string>('All');
  const [searchFuel, setSearchFuel] = useState<string>('All');
  const [searchYear, setSearchYear] = useState<string>('All');
  const [searchSeller, setSearchSeller] = useState<'all' | 'showroom' | 'individual'>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic Tabs (Featured, Latest, Premium)
  const [inventoryTab, setInventoryTab] = useState<'featured' | 'latest' | 'premium'>('featured');

  // Interactive Finance / EMI Calculator State
  const [finPrice, setFinPrice] = useState<number>(3500000);
  const [finDownPercent, setFinDownPercent] = useState<number>(20);
  const [finInterest, setFinInterest] = useState<number>(14.5);
  const [finTenure, setFinTenure] = useState<number>(5);

  // Interactive Insurance Estimator State
  const [insValue, setInsValue] = useState<number>(4500000);
  const [insPlan, setInsPlan] = useState<'silver' | 'gold' | 'platinum'>('gold');
  const [insSuccess, setInsSuccess] = useState(false);

  // 200-Point Inspection Booking State
  const [inspectName, setInspectName] = useState('');
  const [inspectPhone, setInspectPhone] = useState('');
  const [inspectCarModel, setInspectCarModel] = useState('');
  const [inspectCity, setInspectCity] = useState('Peshawar');
  const [inspectDate, setInspectDate] = useState('');
  const [inspectSuccess, setInspectSuccess] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // FAQ Active State
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Auto Slider Effect
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  // Filter listings based on inventory tab
  const filteredInventoryListings = useMemo(() => {
    const approvedOnly = listings.filter(l => l.approved !== false);
    if (inventoryTab === 'featured') {
      const feat = approvedOnly.filter(l => l.featured);
      return feat.length > 0 ? feat.slice(0, 6) : approvedOnly.slice(0, 6);
    } else if (inventoryTab === 'latest') {
      return approvedOnly.slice().sort((a, b) => b.year - a.year).slice(0, 6);
    } else {
      // Premium listings (over 50 Lakhs / 5M PKR)
      const prem = approvedOnly.filter(l => l.price >= 5000000);
      return prem.length > 0 ? prem.slice(0, 6) : approvedOnly.slice().sort((a, b) => b.price - a.price).slice(0, 6);
    }
  }, [listings, inventoryTab]);

  // EMI Monthly Calculation
  const calculatedEMI = useMemo(() => {
    const loanAmount = finPrice * (1 - finDownPercent / 100);
    const monthlyRate = (finInterest / 100) / 12;
    const numberOfPayments = finTenure * 12;
    
    if (monthlyRate === 0) return loanAmount / numberOfPayments;
    
    const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    return Math.round(emi);
  }, [finPrice, finDownPercent, finInterest, finTenure]);

  // Insurance calculation
  const calculatedInsurance = useMemo(() => {
    const rates = { silver: 0.012, gold: 0.018, platinum: 0.025 };
    const rate = rates[insPlan];
    const annual = insValue * rate;
    const monthly = annual / 12;
    return {
      annual: Math.round(annual),
      monthly: Math.round(monthly)
    };
  }, [insValue, insPlan]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let combined = localQuery.trim();
    if (searchCity !== 'All') combined += ' ' + searchCity;
    if (searchType !== 'all') combined += ' ' + searchType;
    if (searchPrice !== 'All') combined += ' ' + searchPrice;
    if (searchTransmission !== 'All') combined += ' ' + searchTransmission;
    if (searchFuel !== 'All') combined += ' ' + searchFuel;
    if (searchYear !== 'All') combined += ' ' + searchYear;
    if (searchSeller !== 'all') combined += ' ' + searchSeller;
    
    setSearchQuery(combined);
    setTab('inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrandClick = (brandName: string) => {
    setSelectedCategory(brandName);
    setSearchQuery(brandName);
    setTab('inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBodyTypeClick = (bodyType: string) => {
    setSelectedCategory(bodyType);
    setSearchQuery(bodyType);
    setTab('inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectName || !inspectPhone || !inspectCarModel) return;
    setInspectSuccess(true);
    setTimeout(() => {
      setInspectSuccess(false);
      setInspectName('');
      setInspectPhone('');
      setInspectCarModel('');
    }, 5000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes('@')) return;
    setNewsletterSuccess(true);
    setTimeout(() => {
      setNewsletterSuccess(false);
      setNewsletterEmail('');
    }, 5000);
  };

  const isRtl = lang === 'ur';

  // Translation mapping
  const t = {
    en: {
      tagline: "★ PAKISTAN'S PREMIER AUTOMOTIVE PORTAL",
      searchHeader: "Discover Premium Vehicles",
      postAdBadge: "⚡ List In 60 Seconds",
      whySubtitle: "Redefining the automotive classified experience through transparency, security, and digital tools.",
      statsHeading: "BAZAR360 Trust Metrics",
      downloadHeading: "Download BAZAR360 App",
      downloadText: "Get real-time biometrics, premium inspect tools, and live vehicle pricing trackers on the go."
    },
    ur: {
      tagline: "★ پاکستان کا ممتاز ترین آٹوموٹو پورٹل",
      searchHeader: "شاندار گاڑیاں تلاش کریں",
      postAdBadge: "اشتہار صرف 60 سیکنڈز میں",
      whySubtitle: "سیکیورٹی، شفافیت اور جدید ترین ٹیکنالوجی کے ذریعے گاڑیوں کی خرید و فروخت کا بہترین تجربہ۔",
      statsHeading: "بازار360 اعتماد کی علامات",
      downloadHeading: "بازار360 موبائل ایپ ڈاؤن لوڈ کریں",
      downloadText: "ریئل ٹائم بائیومیٹرکس، انشورنس ٹریکرز اور لائیو قیمتوں کے تجزیے موبائل پر حاصل کریں۔"
    }
  }[lang];

  return (
    <div 
      id="bazar360-home-viewport" 
      className={`flex flex-col space-y-16 pb-16 animate-fade-in text-text-main font-sans ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* SECTION 1: AUTO SLIDER HERO BANNER */}
      <section 
        className="relative rounded-[32px] overflow-hidden border border-border-main bg-bg-secondary shadow-2xl h-[380px] sm:h-[460px] md:h-[560px] flex flex-col justify-end cursor-pointer group/hero select-none"
        onClick={() => {
          if (activeSlides[currentSlide]) {
            onSelectListing(activeSlides[currentSlide]);
          }
        }}
      >
        {/* Dynamic Image Slideshow with Fade */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            {activeSlides.map((slide, index) => {
              if (index !== currentSlide) return null;
              return (
                <motion.div
                  key={slide.id || index}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <img
                    src={slide.imageUrl || slide.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-40 md:opacity-60 transition-transform duration-700 group-hover/hero:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                  {/* Premium Ambient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/95 via-transparent to-bg-primary/20"></div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Slidable Content Text Controls overlay */}
        <div className="relative z-10 p-6 md:p-12 space-y-4 max-w-4xl text-left">
          {(() => {
            const slide = activeSlides[currentSlide];
            if (!slide) return null;
            const dealer = dealers.find(d => d.id === slide.dealerId);
            const showroomName = dealer ? dealer.name : 'Individual Seller';
            const showroomInitials = dealer ? (dealer.avatarLetter || dealer.name[0]) : 'P';
            return (
              <div className="space-y-4">
                {/* Dealer and Badges Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <div className="w-5 h-5 rounded-full bg-accent-main text-bg-primary flex items-center justify-center font-black text-[10px] uppercase">
                      {showroomInitials}
                    </div>
                    <span className="text-white text-[10px] font-mono font-black uppercase tracking-wider">
                      {showroomName}
                    </span>
                  </div>

                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-1">
                    🇵🇰 {slide.registrationCity || 'Unregistered'}
                  </span>

                  {slide.verified && (
                    <span className="bg-sky-500/15 text-sky-400 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-sky-500/20 inline-flex items-center gap-1">
                      <ShieldCheck size={11} className="text-sky-400" />
                      VERIFIED
                    </span>
                  )}

                  {(slide.featured || slide.price >= 5000000) && (
                    <span className="bg-accent-main/20 text-accent-main text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-accent-main/25 inline-flex items-center gap-1">
                      <Sparkles size={11} className="text-accent-main" />
                      PREMIUM
                    </span>
                  )}
                </div>

                {/* Title and details */}
                <div className="space-y-2">
                  <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-tight text-white drop-shadow-sm">
                    {slide.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 text-xs md:text-sm font-sans font-semibold">
                    <span className="flex items-center gap-1">📅 {slide.year}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">⚡ {slide.fuelType || 'Petrol'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">⚙️ {slide.transmission || 'Automatic'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">🛣️ {slide.mileage?.toLocaleString() || '0'} KM</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-2xl md:text-4xl font-mono font-black text-accent-main drop-shadow-md">
                  {formatPrice(slide.price)}
                </div>

                {/* Premium Call to Action Strip */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectListing(slide);
                    }}
                    className="bg-accent-main hover:bg-accent-hover text-bg-primary font-black font-sans text-xs uppercase px-6 py-3.5 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-accent-main/15 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const msg = `Hi, I am interested in your ${slide.title} (${slide.year}) listed on BAZAR360. Please share details.`;
                      window.open(`https://wa.me/923159085086?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black font-sans text-xs uppercase px-5 py-3.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('tel:+923159085086', '_blank');
                    }}
                    className="bg-[#1e293b]/80 hover:bg-[#1e293b] text-white border border-white/5 font-black font-sans text-xs uppercase px-5 py-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <PhoneCall size={12} />
                    <span>Call</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const shareUrl = `${window.location.origin}/?listing=${slide.id}`;
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        setToastMessage('Listing Link Copied to Clipboard!');
                        setTimeout(() => setToastMessage(null), 2500);
                      });
                    }}
                    className="bg-[#1e293b]/60 hover:bg-[#1e293b]/80 text-slate-300 border border-white/5 font-black font-sans text-xs uppercase px-4 py-3.5 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  >
                    <span>Share</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Dots Indicator */}
          <div className="flex gap-2 pt-4">
            {activeSlides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(i);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === currentSlide ? 'w-8 bg-accent-main' : 'w-2.5 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: SMART ADVANCED SEARCH PANEL */}
      <section className="relative z-20 max-w-6xl mx-auto w-full -mt-8 sm:-mt-16 md:-mt-24 px-4">
        <div className="bg-bg-secondary border border-border-main rounded-3xl p-5 md:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Decorative Corner Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-main/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <form onSubmit={handleSearchSubmit} className="space-y-4 relative z-10 text-text-main">
            {/* Header and Type Toggles */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm md:text-base font-black uppercase tracking-wide text-text-main flex items-center gap-2">
                  <span className="h-4 w-1 bg-accent-main rounded-full"></span>
                  {t.searchHeader}
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-bg-primary p-1 rounded-xl border border-border-main shrink-0 self-start lg:self-auto">
                {(['all', 'used', 'new'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSearchType(type)}
                    className={`px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-mono font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      searchType === type
                        ? 'bg-accent-main text-bg-primary shadow-md font-extrabold'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {type === 'all' ? (lang === 'en' ? 'ALL VEHICLES' : 'تمام گاڑیاں') : 
                     type === 'used' ? (lang === 'en' ? 'USED' : 'استعمال شدہ') : 
                     (lang === 'en' ? 'NEW' : 'نئی')}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Search Bar Row */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="flex-grow flex items-center gap-2 bg-bg-primary border border-border-main rounded-2xl p-3 focus-within:border-accent-main transition-all">
                <Search className="text-text-muted shrink-0" size={16} />
                <input
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  placeholder={lang === 'en' ? "Search make, model, variant, keyword..." : "برانڈ، ماڈل یا گاڑی تلاش کریں..."}
                  className="bg-transparent text-xs md:text-sm border-none outline-none focus:ring-0 text-text-main placeholder-text-muted/60 w-full font-sans"
                />
              </div>

              {/* Submit Search Button */}
              <button
                type="submit"
                className="bg-accent-main hover:bg-accent-hover text-bg-primary font-sans text-xs md:text-sm font-black uppercase tracking-widest px-6 py-4 rounded-2xl transition-all cursor-pointer whitespace-nowrap shadow-md shadow-accent-main/15 shrink-0 flex items-center justify-center gap-1"
              >
                <Search size={14} />
                {lang === 'en' ? 'SEARCH' : 'تلاش کریں'}
              </button>
            </div>

            {/* Default Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {/* City Selection */}
              <div>
                <label className="text-[9px] font-mono font-black uppercase text-accent-main tracking-widest block mb-1">
                  {lang === 'en' ? 'CHOOSE CITY' : 'شہر کا انتخاب'}
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                >
                  <option value="All">{lang === 'en' ? 'ALL PAKISTAN' : 'پورا پاکستان'}</option>
                  <option value="Peshawar">PESHAWAR</option>
                  <option value="Islamabad">ISLAMABAD</option>
                  <option value="Lahore">LAHORE</option>
                  <option value="Karachi">KARACHI</option>
                </select>
              </div>

              {/* Budget Range Selection */}
              <div>
                <label className="text-[9px] font-mono font-black uppercase text-accent-main tracking-widest block mb-1">
                  {lang === 'en' ? 'MAX BUDGET' : 'زیادہ سے زیادہ بجٹ'}
                </label>
                <select
                  value={searchPrice}
                  onChange={(e) => setSearchPrice(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                >
                  <option value="All">{lang === 'en' ? 'ANY PRICE' : 'کوئی بھی قیمت'}</option>
                  <option value="Under 15 Lakhs">{lang === 'en' ? 'UNDER 1.5 MILLION (15 LAKH)' : '15 لاکھ سے کم'}</option>
                  <option value="15-35 Lakhs">{lang === 'en' ? '1.5M - 3.5M (15-35 LAKH)' : '15 سے 35 لاکھ'}</option>
                  <option value="35-75 Lakhs">{lang === 'en' ? '3.5M - 7.5M (35-75 LAKH)' : '35 سے 75 لاکھ'}</option>
                  <option value="75+ Lakhs">{lang === 'en' ? 'ABOVE 7.5 MILLION (75 LAKH)' : '75 لاکھ سے اوپر'}</option>
                </select>
              </div>

              {/* Fuel Selection */}
              <div>
                <label className="text-[9px] font-mono font-black uppercase text-accent-main tracking-widest block mb-1">
                  {lang === 'en' ? 'FUEL CATEGORY' : 'فیول کی قسم'}
                </label>
                <select
                  value={searchFuel}
                  onChange={(e) => setSearchFuel(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                >
                  <option value="All">{lang === 'en' ? 'ANY FUEL' : 'تمام فیول'}</option>
                  <option value="Petrol">PETROL</option>
                  <option value="Diesel">DIESEL</option>
                  <option value="Hybrid">HYBRID</option>
                  <option value="Electric">ELECTRIC</option>
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="text-[9px] font-mono font-black uppercase text-accent-main tracking-widest block mb-1">
                  {lang === 'en' ? 'GEARBOX TRANSMISSION' : 'ٹرانسمیشن'}
                </label>
                <select
                  value={searchTransmission}
                  onChange={(e) => setSearchTransmission(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                >
                  <option value="All">{lang === 'en' ? 'ANY TRANSMISSION' : 'تمام ٹرانسمیشن'}</option>
                  <option value="Automatic">AUTOMATIC</option>
                  <option value="Manual">MANUAL</option>
                </select>
              </div>
            </div>

            {/* Toggle Advanced Button */}
            <div className="flex justify-between items-center pt-2 border-t border-border-main mt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-mono font-black text-accent-main hover:text-accent-hover flex items-center gap-1 cursor-pointer"
              >
                <span>{showAdvanced ? '➖ CLOSE ADVANCED FILTERS' : '➕ CHOOSE MORE ADVANCED FILTERS'}</span>
              </button>
            </div>

            {/* Advanced Filters Expandable block */}
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border-main/5"
              >
                {/* Year range option */}
                <div>
                  <label className="text-[9px] font-mono font-black uppercase text-accent-main tracking-widest block mb-1">
                    {lang === 'en' ? 'YEAR MODEL' : 'ماڈل سال'}
                  </label>
                  <select
                    value={searchYear}
                    onChange={(e) => setSearchYear(e.target.value)}
                    className="w-full bg-bg-primary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                  >
                    <option value="All">ANY YEAR</option>
                    <option value="2025">2025 & Above</option>
                    <option value="2023">2023 & Above</option>
                    <option value="2020">2020 & Above</option>
                    <option value="2015">2015 & Above</option>
                  </select>
                </div>

                {/* Seller Type filter */}
                <div>
                  <label className="text-[9px] font-mono font-black uppercase text-accent-main tracking-widest block mb-1">
                    {lang === 'en' ? 'SELLER TYPE' : 'بیچنے والے کی قسم'}
                  </label>
                  <div className="flex gap-1 bg-bg-primary border border-border-main p-1.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSearchSeller('all')}
                      className={`flex-1 py-1.5 rounded text-[10px] font-bold ${searchSeller === 'all' ? 'bg-accent-main text-bg-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                      ALL
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchSeller('showroom')}
                      className={`flex-1 py-1.5 rounded text-[10px] font-bold ${searchSeller === 'showroom' ? 'bg-accent-main text-bg-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                      DEALER
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchSeller('individual')}
                      className={`flex-1 py-1.5 rounded text-[10px] font-bold ${searchSeller === 'individual' ? 'bg-accent-main text-bg-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                      PRIVATE
                    </button>
                  </div>
                </div>

                {/* Info Text */}
                <div className="flex items-center gap-2 p-3.5 bg-bg-primary/50 border border-border-main rounded-xl text-[10px] text-text-muted">
                  <Info size={16} className="text-accent-main shrink-0" />
                  <span>Verified Badging filter will be applied to listings instantly upon searching.</span>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </section>

      {/* SECTION 3: BROWSE BY BODY TYPE */}
      <section className="space-y-6 max-w-7xl mx-auto w-full px-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-text-main">
            {lang === 'en' ? 'Browse by Body Type' : 'گاڑی کی باڈی ٹائپ منتخب کریں'}
          </h2>
          <p className="text-xs text-text-muted max-w-lg mx-auto">
            {lang === 'en' ? 'Pick a body profile matching your daily lifestyle, utility requirements, or seating preference.' : 'اپنی روزمرہ ضروریات کے مطابق گاڑی کا سائز اور باڈی منتخب کریں۔'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {BODY_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleBodyTypeClick(type.id)}
              className="bg-bg-secondary border border-border-main hover:border-accent-main p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:-translate-y-0.5 select-none"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
                {type.icon}
              </div>
              <div>
                <span className="text-xs font-sans font-black text-text-main group-hover:text-accent-main transition-colors uppercase tracking-tight block">
                  {type.name}
                </span>
                <span className="text-[9px] text-text-muted/70 leading-tight block mt-1 line-clamp-2 max-w-xs px-1">
                  {type.desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 4: POPULAR BRANDS GRID */}
      <section className="space-y-6 max-w-7xl mx-auto w-full px-4">
        <div className="flex justify-between items-baseline border-b border-border-main pb-3">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-text-main flex items-center gap-2">
            <span className="h-5 w-1 bg-accent-main rounded-full"></span>
            {lang === 'en' ? 'Popular Brands' : 'مقبول برانڈز'}
          </h2>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setTab('inventory');
            }}
            className="text-xs font-sans font-extrabold text-accent-main hover:text-accent-hover transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'VIEW ALL BRANDS →' : 'تمام برانڈز دیکھیں ←'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {POPULAR_BRANDS.map((brand, i) => (
            <button
              key={i}
              onClick={() => handleBrandClick(brand.name)}
              className="bg-bg-secondary border border-border-main hover:border-accent-main/40 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all active:scale-95 duration-150 cursor-pointer group hover:shadow-md select-none"
              style={{ minHeight: '96px' }}
            >
              <div className="h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                {renderBrandLogo(brand.name)}
              </div>
              <span className="text-xs font-sans font-black text-text-main group-hover:text-accent-main transition-colors uppercase tracking-tight">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 5: PREMIUM DYNAMIC INVENTORY HUB */}
      <section className="max-w-7xl mx-auto w-full px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Category-Segmented Vehicles (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border-main pb-2">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-text-main flex items-center gap-2">
              <span className="h-5 w-1 bg-accent-main rounded-full"></span>
              {lang === 'en' ? 'Explore Collections' : 'گاڑیاں تلاش کریں'}
            </h2>

            {/* Custom Tab Toggles */}
            <div className="flex items-center gap-1 bg-bg-secondary border border-border-main p-1 rounded-xl">
              {(['featured', 'latest', 'premium'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setInventoryTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    inventoryTab === tab
                      ? 'bg-accent-main text-bg-primary shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {tab === 'featured' ? (lang === 'en' ? 'FEATURED' : 'نمایاں') :
                   tab === 'latest' ? (lang === 'en' ? 'LATEST' : 'جدید ترین') :
                   (lang === 'en' ? 'PREMIUM' : 'مہنگی گاڑیاں')}
                </button>
              ))}
            </div>
          </div>

          {dbLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <VehicleSkeletonCard key={i} />
              ))}
            </div>
          ) : filteredInventoryListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {filteredInventoryListings.map((car) => (
                <VehicleCard
                  key={car.id}
                  car={car}
                  dealer={dealers.find((d) => d.id === car.dealerId)}
                  onSelect={onSelectListing}
                  onToggleCompare={onToggleCompare}
                  isComparing={compareList.some((c) => c.id === car.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-bg-secondary border border-border-main rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4">
              <Car size={36} className="text-text-muted animate-pulse" />
              <p className="text-text-muted text-sm font-sans">No vehicles match this section.</p>
              <button
                onClick={() => setTab('sell')}
                className="bg-accent-main hover:bg-accent-hover text-bg-primary font-sans font-black text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer"
              >
                {lang === 'en' ? 'Post Your Ad Free' : 'اشتہار لگائیں'}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Elite Dealerships list (1 col wide) */}
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-baseline border-b border-border-main pb-3">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-text-main flex items-center gap-2">
              <span className="h-5 w-1 bg-accent-main rounded-full"></span>
              {lang === 'en' ? 'Verified Showrooms' : 'تصدیق شدہ شورومز'}
            </h2>
            <button
              onClick={() => setTab('dealers')}
              className="text-xs font-sans font-extrabold text-accent-main hover:text-accent-hover transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'VIEW ALL' : 'سب دیکھیں'}
            </button>
          </div>

          <div className="space-y-4">
            {dbLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-bg-secondary border border-border-main p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-bg-primary shrink-0"></div>
                  <div className="flex-grow min-w-0 space-y-2">
                    <div className="h-3.5 bg-bg-primary rounded w-1/2"></div>
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 bg-bg-primary rounded w-8"></div>
                      <div className="h-2.5 bg-bg-primary rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : dealers.slice(0, 4).map((showroom) => (
              <div
                key={showroom.id}
                onClick={() => onSelectDealer(showroom.id)}
                className="bg-bg-secondary border border-border-main hover:border-accent-main p-4 rounded-2xl flex items-center gap-4 transition-all hover:-translate-y-0.5 cursor-pointer select-none group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-main/10 text-accent-main border border-accent-main/15 flex items-center justify-center font-black text-lg shadow-inner shrink-0">
                  {showroom.avatarLetter || showroom.name[0]}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-xs md:text-sm font-sans font-black text-text-main group-hover:text-accent-main transition-colors truncate uppercase">
                    {showroom.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-text-muted font-sans flex items-center gap-0.5 font-bold">
                      <Star size={10} className="fill-amber-500 text-amber-500" />
                      {showroom.rating || '4.9'}
                    </span>
                    <span className="text-[10px] text-text-muted font-sans flex items-center gap-1 font-bold uppercase">
                      <MapPin size={10} className="text-accent-main" />
                      {showroom.location.split(',')[0]}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-text-muted group-hover:text-text-main transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: INTERACTIVE VEHICLE COMPARISON DRAWER INSTRUCTIONS */}
      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="bg-gradient-to-r from-bg-secondary via-bg-primary to-bg-secondary border border-border-main rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <span className="bg-amber-500/15 text-amber-400 text-[9px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20">
              ⚡ COMPONENT MATRIX MATCHUP
            </span>
            <h3 className="text-lg md:text-xl font-black text-text-main uppercase tracking-tight">
              Compare Vehicles Side-by-Side
            </h3>
            <p className="text-text-muted text-xs md:text-sm leading-relaxed">
              Add any vehicle from the list to the comparison drawer. We will match their Engine, Price, Mileage, and Fuel specifications to help you pick the best ride.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <span className="text-xs font-mono font-black text-text-muted">
              COMPARING: {compareList.length} Vehicles
            </span>
            <button
              onClick={() => setTab('inventory')}
              className="bg-accent-main hover:bg-accent-hover text-bg-primary font-sans font-black text-xs uppercase px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1"
            >
              Browse Inventory <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 7: INTERACTIVE AUTO FINANCE & LOAN EMI CALCULATOR */}
      <section className="max-w-7xl mx-auto w-full px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-text-main flex items-center justify-center gap-2">
            <Percent size={20} className="text-accent-main" />
            {lang === 'en' ? 'BAZAR360 Auto Finance Calculator' : 'آٹو لون فنانس کیلکولیٹر'}
          </h2>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {lang === 'en' ? 'Get exact markup quotes and monthly installments dynamically based on down payment percent.' : 'اپنے بجٹ کے مطابق ماہانہ اقساط اور بینک مارک اپ کا لائیو حساب کریں۔'}
          </p>
        </div>

        <div className="bg-bg-secondary border border-border-main rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-lg text-left">
          {/* Controls Form Left (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Car Selection buttons */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-accent-main tracking-widest block">
                Quick Selection / Vehicle Valuation (PKR)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[1500000, 3500000, 6500000, 12000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFinPrice(val)}
                    className={`py-2 rounded-xl text-xs font-mono font-black border transition-all ${
                      finPrice === val
                        ? 'bg-accent-main border-accent-main text-bg-primary'
                        : 'bg-bg-primary border-border-main text-text-main hover:border-text-muted/40'
                    }`}
                  >
                    Rs. {(val / 100000).toFixed(0)} Lakh
                  </button>
                ))}
              </div>
              {/* Custom Input */}
              <div className="pt-2">
                <input
                  type="number"
                  value={finPrice}
                  onChange={(e) => setFinPrice(Math.max(100000, Number(e.target.value)))}
                  className="w-full bg-bg-primary border border-border-main rounded-xl p-3 text-xs font-mono text-text-main focus:outline-none focus:border-accent-main"
                  placeholder="Enter Custom Car Price..."
                />
              </div>
            </div>

            {/* Down Payment % Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase">
                <span className="text-text-muted">Down Payment Percent</span>
                <span className="text-accent-main font-mono">{finDownPercent}% (Rs. {((finPrice * finDownPercent) / 100).toLocaleString()} PKR)</span>
              </div>
              <input
                type="range"
                min="15"
                max="70"
                value={finDownPercent}
                onChange={(e) => setFinDownPercent(Number(e.target.value))}
                className="w-full h-2 bg-bg-primary rounded-lg appearance-none cursor-pointer accent-accent-main"
              />
              <div className="flex justify-between text-[9px] text-text-muted font-mono font-bold">
                <span>MIN 15%</span>
                <span>MAX 70%</span>
              </div>
            </div>

            {/* Interest rate / Markup % Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase">
                <span className="text-text-muted">Markup Rate (Per Annum)</span>
                <span className="text-accent-main font-mono">{finInterest}%</span>
              </div>
              <input
                type="range"
                min="8"
                max="24"
                step="0.5"
                value={finInterest}
                onChange={(e) => setFinInterest(Number(e.target.value))}
                className="w-full h-2 bg-bg-primary rounded-lg appearance-none cursor-pointer accent-accent-main"
              />
              <div className="flex justify-between text-[9px] text-text-muted font-mono font-bold">
                <span>8% (State Minimum)</span>
                <span>24% Commercial</span>
              </div>
            </div>

            {/* Loan Tenure years selection buttons */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-accent-main tracking-widest block">
                Financing Term / Tenure
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 5, 7].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setFinTenure(yr)}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-black border transition-all ${
                      finTenure === yr
                        ? 'bg-accent-main border-accent-main text-bg-primary'
                        : 'bg-bg-primary border-border-main text-text-main hover:border-text-muted/40'
                    }`}
                  >
                    {yr} Year{yr > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Right Panel (5 cols) */}
          <div className="lg:col-span-5 bg-bg-primary border border-border-main p-6 rounded-3xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="border-b border-border-main pb-2">
                <h4 className="text-xs font-mono font-black uppercase text-text-muted tracking-widest">
                  ESTIMATED INSTALLMENT
                </h4>
                <p className="text-3xl font-black text-accent-main font-mono mt-1">
                  Rs. {calculatedEMI.toLocaleString()}
                  <span className="text-xs text-text-muted font-sans font-bold"> / Month</span>
                </p>
              </div>

              {/* Financial breakdowns */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Vehicle Value:</span>
                  <span className="font-mono text-text-main font-bold">Rs. {finPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Financed Principal:</span>
                  <span className="font-mono text-text-main font-bold">Rs. {(finPrice * (1 - finDownPercent / 100)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Down Payment Amount:</span>
                  <span className="font-mono text-text-main font-bold">Rs. {((finPrice * finDownPercent) / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Interest Markup Tenure:</span>
                  <span className="font-mono text-text-main font-bold">{finTenure} Years @ {finInterest}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border-main/40">
              <p className="text-[10px] text-text-muted leading-relaxed font-sans">
                * Rates are indicative of current State Bank monetary benchmarks. Exact terms will vary depending on customer credit biometrics and active banking partner criteria.
              </p>
              <a
                href={`https://wa.me/923159085086?text=${encodeURIComponent(`Hi BAZAR360, I want to apply for Auto Finance on a vehicle worth Rs. ${finPrice.toLocaleString()} with Rs. ${((finPrice * finDownPercent) / 100).toLocaleString()} down payment.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-bg-primary font-sans font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer block text-center"
              >
                📥 Apply with Partner Bank
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: INTERACTIVE INSURANCE PACKAGES ESTIMATOR */}
      <section className="max-w-7xl mx-auto w-full px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-text-main flex items-center justify-center gap-2">
            <Shield size={22} className="text-accent-main" />
            {lang === 'en' ? 'BAZAR360 Premium Insurance Estimates' : 'انشورنس اور تحفظ کی خدمات'}
          </h2>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {lang === 'en' ? 'Instantly calculate your yearly premium and select custom secure coverages for complete safety.' : 'گاڑی کی مارکیٹ قیمت کے مطابق بہترین انشورنس پلانز اور ماہانہ قسط چیک کریں۔'}
          </p>
        </div>

        <div className="bg-bg-secondary border border-border-main rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-lg text-left">
          {/* Form left (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-accent-main tracking-widest block">
                Car Valuation Market Estimate (PKR)
              </label>
              <input
                type="number"
                value={insValue}
                onChange={(e) => setInsValue(Math.max(100000, Number(e.target.value)))}
                className="w-full bg-bg-primary border border-border-main rounded-xl p-3 text-xs font-mono text-text-main focus:outline-none focus:border-accent-main"
                placeholder="Car Value..."
              />
              <input
                type="range"
                min="1000000"
                max="25000000"
                step="200000"
                value={insValue}
                onChange={(e) => setInsValue(Number(e.target.value))}
                className="w-full h-2 bg-bg-primary rounded-lg appearance-none cursor-pointer accent-accent-main mt-2"
              />
              <div className="flex justify-between text-[9px] text-text-muted font-mono">
                <span>10 LAKH</span>
                <span>2.5 CRORE</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-accent-main tracking-widest block">
                Select Protection Package Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['silver', 'gold', 'platinum'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setInsPlan(tier)}
                    className={`py-3 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      insPlan === tier
                        ? 'bg-accent-main border-accent-main text-bg-primary shadow-xs'
                        : 'bg-bg-primary border-border-main text-text-main hover:border-text-muted/40'
                    }`}
                  >
                    <span className="text-xs font-sans font-black uppercase">{tier}</span>
                    <span className="text-[9px] font-mono opacity-80">
                      {tier === 'silver' ? '1.2%' : tier === 'gold' ? '1.8%' : '2.5%'} Rate
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* List of protections */}
            <div className="bg-bg-primary p-4 rounded-2xl border border-border-main space-y-2.5 text-xs text-text-muted">
              <div className="flex items-center gap-2 text-text-main font-bold">
                <ShieldCheck size={14} className="text-accent-main" />
                <span>Standard Covered Risks &amp; Benefits</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-5 list-disc">
                <li>Total Theft &amp; Snatching</li>
                <li>Third-Party Legal Liability</li>
                <li>Accidental Damage repair</li>
                <li>Natural Disaster cover</li>
                <li>Roadside Towing Help</li>
                <li>Biometric legal claim aid</li>
              </ul>
            </div>
          </div>

          {/* Results Summary Right Panel (6 cols) */}
          <div className="lg:col-span-6 bg-bg-primary border border-border-main p-6 rounded-3xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-black uppercase text-text-muted tracking-widest">
                PREMIUM ESTIMATION OUTCOME
              </h4>
              <div className="grid grid-cols-2 gap-4 border-b border-border-main pb-4">
                <div>
                  <span className="text-[9px] font-mono text-text-muted block uppercase">YEARLY PREMIUM</span>
                  <span className="text-2xl font-black text-accent-main font-mono">
                    Rs. {calculatedInsurance.annual.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-text-muted block uppercase">MONTHLY EQUIVALENT</span>
                  <span className="text-2xl font-black text-text-main font-mono">
                    Rs. {calculatedInsurance.monthly.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Plan Benefits explanation */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-text-muted block uppercase font-bold">PLAN ADVANTAGE FEATURES</span>
                {insPlan === 'silver' && (
                  <p className="text-xs text-text-muted leading-relaxed">
                    <strong>Silver basic package</strong> offers core protection ideal for budget commuting. Covers total accidental loss and standard third-party property damages.
                  </p>
                )}
                {insPlan === 'gold' && (
                  <p className="text-xs text-text-muted leading-relaxed">
                    <strong>Gold premium package</strong> is our most balanced tier. Includes towing services, snatched tracker coordination, and comprehensive accidental panel replacements.
                  </p>
                )}
                {insPlan === 'platinum' && (
                  <p className="text-xs text-text-muted leading-relaxed">
                    <strong>Platinum ultimate package</strong> is designed for high-value luxury sedans. Provides zero-depreciation coverage on paint, instant engine biometrics validation, and rent-a-car support during repair days.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border-main/40">
              {insSuccess ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-bold text-center">
                  ✓ Booking Request Received! An insurance counselor will call you within 1 hour.
                </div>
              ) : (
                <button
                  onClick={() => {
                    setInsSuccess(true);
                    setTimeout(() => setInsSuccess(false), 5000);
                  }}
                  className="w-full bg-accent-main hover:bg-accent-hover text-bg-primary font-sans font-black text-xs uppercase tracking-wider py-4 rounded-xl transition-all cursor-pointer"
                >
                  📥 Lock Premium Quote &amp; Book Counselor
                </button>
              )}
              <p className="text-[9px] text-text-muted text-center font-mono leading-tight">
                Subject to surveyor biometrics inspection. Standard terms apply.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: 200-POINT INSPECTION BOOKING DECK */}
      <section className="max-w-7xl mx-auto w-full px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-text-main flex items-center justify-center gap-2">
            <ShieldCheck size={22} className="text-accent-main" />
            {lang === 'en' ? 'BAZAR360 Certified 200-Point Inspection' : 'گاڑی کی تفصیلی انسپکشن رپورٹ'}
          </h2>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {lang === 'en' ? 'Avoid scam purchases. Get a complete mechanical, paint, battery, and diagnostic scan report.' : 'دھوکے سے بچیں! ہمارے ماہر میکانکس سے گاڑی کی بمپر ٹو بمپر مکمل تفصیلی رپورٹ حاصل کریں۔'}
          </p>
        </div>

        <div className="bg-bg-secondary border border-border-main rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-lg text-left items-center">
          {/* Information block Left (6 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="bg-accent-main/15 text-accent-main text-[9px] font-mono font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-accent-main/25">
              🛡️ BUMPER-TO-BUMPER VERIFICATION
            </span>
            <h3 className="text-xl md:text-2xl font-black text-text-main uppercase tracking-tight">
              Get 100% Peace of Mind
            </h3>
            <p className="text-text-muted text-xs md:text-sm leading-relaxed">
              Our certified inspection specialists use advanced paint thickness gauges, digital OBD-II diagnostic scanners, and engine compression metrics to inspect vehicles before you buy.
            </p>

            {/* Checklist of inspection items */}
            <div className="space-y-3">
              {[
                { title: "Engine & Transmission Diagnostic Scan", desc: "Digital scanning of ECU codes and sensor health." },
                { title: "Accidental Body Paint Thickness Check", desc: "Reveals any hidden structural repairs or re-paints." },
                { title: "Suspension, Brakes & Underbody", desc: "Bumper-to-bumper check for rust, leaks, or loose mounts." },
                { title: "Excise Registration & Biometrics Match", desc: "Legal verification of chassis serials and documentation." }
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-main/10 text-accent-main border border-accent-main/15 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-xs font-sans font-extrabold text-text-main uppercase tracking-tight">{item.title}</h5>
                    <p className="text-[10px] text-text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Booking Right Panel (7 cols) */}
          <div className="lg:col-span-7 bg-bg-primary border border-border-main p-6 rounded-3xl">
            {inspectSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-8 rounded-2xl text-center space-y-4">
                <CheckCircle2 size={44} className="mx-auto text-emerald-400" />
                <h4 className="font-extrabold text-base text-white">INSPECTION REGISTERED SUCCESSFUL!</h4>
                <p className="text-xs max-w-sm mx-auto text-text-muted">
                  Thank you! We have received your request. An inspection team supervisor will call you on your phone <strong>{inspectPhone}</strong> within 30 minutes to schedule the visit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookInspection} className="space-y-4">
                <h4 className="text-xs font-mono font-black uppercase text-accent-main tracking-widest border-b border-border-main pb-2">
                  SCHEDULE ON-SITE MECHANICAL VISIT
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={inspectName}
                      onChange={(e) => setInspectName(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main"
                      placeholder="e.g., Bilal Khan"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Contact Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={inspectPhone}
                      onChange={(e) => setInspectPhone(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main font-mono"
                      placeholder="e.g., 03149198403"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Car model */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Car Make &amp; Model</label>
                    <input
                      type="text"
                      required
                      value={inspectCarModel}
                      onChange={(e) => setInspectCarModel(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main"
                      placeholder="e.g., Honda Civic Oriel 2022"
                    />
                  </div>

                  {/* Inspection City */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Inspection City</label>
                    <select
                      value={inspectCity}
                      onChange={(e) => setInspectCity(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                    >
                      <option value="Peshawar">Peshawar</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Preferred Inspection Date</label>
                  <input
                    type="date"
                    required
                    value={inspectDate}
                    onChange={(e) => setInspectDate(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-accent-main hover:bg-accent-hover text-bg-primary font-sans font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer shadow-md shadow-accent-main/15"
                >
                  📅 Request On-Site 200-Point inspection
                </button>

                <p className="text-[9px] text-text-muted text-center font-sans">
                  Inspections start from just <strong>Rs. 4,500</strong>. Payable upon inspection completion.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 10: TRUSTWORTHY REVIEWS & ANONYMOUS ECOSYSTEM STATS */}
      <section className="space-y-12 max-w-7xl mx-auto w-full px-4">
        {/* Customer Reviews */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-text-main">
              {lang === 'en' ? 'What Our Customers Say' : 'صارفین کی آراء'}
            </h2>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              {lang === 'en' ? 'Real buyers and verified sellers share their success stories on BAZAR360.' : 'بازار360 پر گاڑیوں کی خریدو فروخت کا حقیقی اور تصدیق شدہ تجربہ۔'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Ahmed Khan", city: "Lahore", text: "Posting an ad was unbelievably simple. I sold my Civic within 3 days without any hassle. Highly recommended!" },
              { name: "Fatima Ali", city: "Islamabad", text: "The UI is incredibly clean and modern. I love the Urdu language option which makes it very accessible for everyone." },
              { name: "Bilal Ahmed", city: "Peshawar", text: "Connecting with verified showrooms in Peshawar was a great experience. Bazar360 is the future of auto market in Pakistan." }
            ].map((rev, i) => (
              <div
                key={i}
                className="bg-bg-secondary border border-border-main p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm relative text-left"
              >
                <Quote size={20} className="text-accent-main/10 absolute top-4 right-4" />
                
                {/* Stars */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={12} className="fill-amber-500 text-amber-500" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-text-muted text-xs md:text-sm leading-relaxed font-sans italic">
                  "{rev.text}"
                </p>

                {/* User Identity */}
                <div className="pt-4 border-t border-border-main/40 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-main/10 border border-accent-main/20 flex items-center justify-center text-accent-main font-sans font-black text-xs uppercase">
                    {rev.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-sans font-black text-text-main uppercase tracking-tight">
                      {rev.name}
                    </h4>
                    <p className="text-[10px] text-text-muted font-sans uppercase tracking-wider flex items-center gap-1 mt-0.5 font-bold">
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      {rev.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Trust Stats Grid */}
        {ENABLE_TRUST_METRICS && (
          <div className="space-y-6 pt-6 border-t border-border-main/30 animate-fade-in">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-center text-text-main font-sans">
              {t.statsHeading}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "LISTED VEHICLES", count: "12,500+", desc: "Actively updated every minute" },
                { label: "VERIFIED DEALERS", count: "350+", desc: "Authorized showroom partners" },
                { label: "CERTIFIED INSPECTIONS", count: "8,900+", desc: "Bumper-to-bumper mechanic tests" },
                { label: "HAPPY TRADERS", count: "50,000+", desc: "Successful buyers & sellers" }
              ].map((stat, i) => (
                <div key={i} className="bg-bg-secondary border border-border-main p-5 rounded-2xl text-center space-y-1.5">
                  <span className="text-[9px] font-mono font-black text-accent-main tracking-widest uppercase block">
                    {stat.label}
                  </span>
                  <span className="text-2xl md:text-3xl font-mono font-black text-text-main block">
                    {stat.count}
                  </span>
                  <span className="text-[10px] text-text-muted block leading-tight font-medium">
                    {stat.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 11: DOWNLOAD MOBILE APP BANNER */}
      {ENABLE_DOWNLOAD_APP && (
        <section className="max-w-7xl mx-auto w-full px-4 animate-fade-in">
          <div className="relative rounded-[32px] bg-gradient-to-r from-bg-secondary via-bg-primary to-bg-secondary border border-border-main p-8 md:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-left">
            {/* Decorative overlay glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-main/5 rounded-full blur-[90px] pointer-events-none"></div>

            <div className="space-y-3 max-w-2xl text-center md:text-left">
              <span className="text-[9px] font-mono font-black text-accent-main bg-accent-main/10 px-3 py-1 rounded-full border border-accent-main/20 uppercase tracking-widest inline-block">
                📱 BAZAR360 SMARTPHONE COMPANION
              </span>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-text-main uppercase tracking-tight leading-none font-sans">
                {t.downloadHeading}
              </h3>
              <p className="text-text-muted text-xs md:text-sm font-sans leading-relaxed">
                {t.downloadText}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              {/* Apple Store Button */}
              <a
                href="#app-store"
                onClick={(e) => { e.preventDefault(); alert("BAZAR360 Apple iOS app is pending public testflight release."); }}
                className="bg-bg-primary hover:bg-bg-secondary border border-border-main rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all duration-150 active:scale-95 group select-none"
              >
                <Smartphone size={20} className="text-text-main group-hover:text-accent-main transition-colors" />
                <div className="text-left font-sans">
                  <span className="text-[9px] text-text-muted block leading-none font-bold uppercase">Download on the</span>
                  <span className="text-xs text-text-main block leading-none font-black tracking-tight mt-1 group-hover:text-accent-main">App Store</span>
                </div>
              </a>

              {/* Google Play Button */}
              <a
                href="#play-store"
                onClick={(e) => { e.preventDefault(); alert("BAZAR360 Android Google Play app is pending production deployment."); }}
                className="bg-bg-primary hover:bg-bg-secondary border border-border-main rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all duration-150 active:scale-95 group select-none"
              >
                <Car size={20} className="text-text-main group-hover:text-accent-main transition-colors" />
                <div className="text-left font-sans">
                  <span className="text-[9px] text-text-muted block leading-none font-bold uppercase">GET IT ON</span>
                  <span className="text-xs text-text-main block leading-none font-black tracking-tight mt-1 group-hover:text-accent-main">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 12: FAQ ACCORDION SECTION */}
      <section className="max-w-4xl mx-auto w-full px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-text-main flex items-center justify-center gap-2">
            <HelpCircle size={20} className="text-accent-main" />
            {lang === 'en' ? 'Frequently Asked Questions' : 'عام سوالات کے جوابات'}
          </h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {lang === 'en' ? 'Clear answers to your queries about listing, verification, inspection, and auto financing.' : 'گاڑیوں کی خریدو فروخت، میکانکی معائنہ اور بینک فنانس سے متعلق تفصیلی سوال و جواب۔'}
          </p>
        </div>

        <div className="space-y-3 text-left">
          {[
            {
              q: "How do I list my car on BAZAR360?",
              a: "You can post your vehicle ad for free in under 60 seconds by clicking on the 'Sell Your Car' or 'Post Ad' button in the menu. Enter basic chassis and variant specifications, attach clear high-resolution images, set an asking price, and save. Our team will verify and approve the listing instantly."
            },
            {
              q: "What are BAZAR360 verified listings?",
              a: "Verified listings are denoted by a special blue shield badge. It means a certified BAZAR360 inspector has matched the physical chassis number with the excise database, verified the owner's biometric credentials, and completed a pre-screen engine health assessment to guarantee complete buyer security."
            },
            {
              q: "How does the side-by-side vehicle comparison work?",
              a: "When browsing car listings in our search center, click on the '+' or 'Compare' button in the top-right corner of any vehicle card to append it to your active matchup pool. Click on the comparison tray button on the bottom of your screen to open a dual specifications matrix comparing engine capacity, fuel type, transmission lines, and prices."
            },
            {
              q: "How can I book an inspection on BAZAR360?",
              a: "Fill out the certified mechanical on-site inspection form above with your name, phone number, vehicle model, and date. Alternatively, contact our inspection division desk managed by Malak Mazhar at +92 315 9085086 on WhatsApp/Call. Inspections start from just Rs. 4,500 PKR."
            },
            {
              q: "Can I estimate bank loan financing and insurance premiums?",
              a: "Yes! Use our integrated, fully interactive dynamic Auto Finance and Premium Insurance Calculator sections above. Select a custom vehicle valuation, adjust your preferred loan down payment percent or coverage plans, and see the exact calculated monthly and annual quotes updated on your screen instantly."
            }
          ].map((item, index) => {
            const isOpen = activeFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-bg-secondary border border-border-main rounded-2xl overflow-hidden transition-all duration-150"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                  className="w-full text-left p-5 flex justify-between items-center text-text-main font-sans font-black text-xs md:text-sm uppercase tracking-tight cursor-pointer hover:bg-bg-primary/30"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-accent-main transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 border-t border-border-main/10 text-xs md:text-sm text-text-muted leading-relaxed font-medium font-sans">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 13: NEWSLETTER FORM */}
      <section className="max-w-3xl mx-auto w-full px-4">
        <div className="bg-bg-secondary border border-border-main rounded-3xl p-6 md:p-8 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-accent-main/10 border border-accent-main/20 text-accent-main flex items-center justify-center mx-auto mb-2">
            <Mail size={22} className="text-accent-main" />
          </div>
          <h3 className="text-lg font-sans font-black uppercase tracking-wider text-text-main">
            {lang === 'en' ? 'Subscribe to BAZAR360 Insider' : 'تازہ ترین اپ ڈیٹس حاصل کریں'}
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {lang === 'en' ? 'Get weekly alerts on newly listed verified listings, price drops on premium sedans, and upcoming hybrid models.' : 'پاکستان بھر کی نئی انوینٹریز اور قیمتوں میں کمی کے نوٹیفیکیشنز بذریعہ ای میل حاصل کریں۔'}
          </p>

          {newsletterSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-bold max-w-md mx-auto">
              ✓ Subscribed Successful! We have registered your email for premium automotive updates.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-grow bg-bg-primary border border-border-main text-xs rounded-xl p-3 focus:outline-none focus:border-accent-main text-text-main placeholder-text-muted/60"
              />
              <button
                type="submit"
                className="bg-accent-main hover:bg-accent-hover text-bg-primary font-sans font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl cursor-pointer transition-all active:scale-95 whitespace-nowrap shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Dynamic Toast Notification Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] border border-emerald-500/30 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-sans font-bold text-xs"
          >
            <Check className="text-emerald-500" size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
