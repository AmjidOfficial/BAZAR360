import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  SlidersHorizontal, 
  Calendar, 
  DollarSign, 
  Activity, 
  Building, 
  Check, 
  RotateCcw, 
  TrendingUp, 
  ChevronRight, 
  Gauge, 
  FileText, 
  UserCheck, 
  Phone, 
  MessageSquare, 
  ArrowLeft, 
  Heart, 
  Shield, 
  Award, 
  Info,
  AlertTriangle,
  Layers,
  Wrench,
  CheckCircle,
  Clock,
  Briefcase
} from 'lucide-react';

// --- TS INTERFACES FOR TYPE-SAFETY ---
export interface PaintPanelStatus {
  panelName: string;
  status: 'Genuine' | 'Touch-Up' | 'Showered' | 'Dent';
  detail: string;
}

export interface PremiumVehicle {
  id: string;
  make: string;
  modelName: string;
  year: number;
  priceRaw: number;
  priceFormatted: string;
  imageUrl: string;
  category: string;
  cityRegistered: string;
  odometer: string;
  transmission: 'Automatic' | 'Manual';
  engineAndFuel: string;
  fuelEconomyRange: string;
  bodyType: string;
  color: string;
  specs: {
    engineSize: string;
    horsepower: string;
    conditionScore: number; // out of 10
    tireTread: number; // percentage
    engineCompression: number; // percentage
    interiorSanitation: number; // percentage
    suspensionHealth: number; // percentage
  };
  paintMap: PaintPanelStatus[];
  legal: {
    importProfile: string; // e.g. "Japan Import Auction Sheet Integrity (Grade 4.5B)"
    ownershipSequence: string; // "1st Owner", "2nd Owner"
    documentDeliveryProfile: 'Smart Card' | 'Original File' | 'Old Registration Book' | 'Duplicate Pages File';
    tokenTaxStatus: string; // "Paid and Cleared up to 2026"
  };
  logistics: {
    showroomAddress: string;
    timingWindows: string;
    documentHandling: 'In Office Safe' | 'Available By Hand';
    biometricInstantNadra: boolean;
    titleTransferTurnaround: string;
  };
  showroom: {
    name: string;
    tier: string;
    hotline: string;
    activeFeedStatus: string;
    whatsappNumber: string;
  };
  description: string;
}

// --- 12 CAR CATEGORY DATA DEFINITIONS ---
export interface CategoryMeta {
  id: string;
  label: string;
  iconText: string;
  count: number;
  vectorSvg: React.ReactNode;
}

// --- PREMIUM HARDCODED VEHICLES SEED DATABASE ---
const PREMIUM_CAR_RECORDS: PremiumVehicle[] = [
  {
    id: 'car-porsche-911',
    make: 'Porsche',
    modelName: '911 GT3 RS Touring',
    year: 2024,
    priceRaw: 85000000,
    priceFormatted: 'PKR 8.5 Crore',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600',
    category: 'Sports cars',
    cityRegistered: 'Islamabad Registered',
    odometer: '1,200 KM',
    transmission: 'Automatic',
    engineAndFuel: 'Gasoline 4.0L flat-six',
    fuelEconomyRange: '8.4 - 7.1 km/l',
    bodyType: 'Coupe',
    color: 'Chalk Gray Met.',
    specs: {
      engineSize: '3,996 cc',
      horsepower: '518 HP',
      conditionScore: 9.9,
      tireTread: 95,
      engineCompression: 99,
      interiorSanitation: 100,
      suspensionHealth: 98
    },
    paintMap: [
      { panelName: 'Hood', status: 'Genuine', detail: 'Original high-gloss protection film applied' },
      { panelName: 'Roof', status: 'Genuine', detail: 'Carbon fiber composite paint raw' },
      { panelName: 'Left Door', status: 'Genuine', detail: 'Immaculate structural sheen' },
      { panelName: 'Right Door', status: 'Genuine', detail: 'Original custom factory layer' },
      { panelName: 'Rear Bumper', status: 'Genuine', detail: 'Diffuser channel original wrap' }
    ],
    legal: {
      importProfile: 'Bespoke Import - Verified Japan Auction Grade 5.0A',
      ownershipSequence: '1st Owner (Single hand corporate driven)',
      documentDeliveryProfile: 'Smart Card',
      tokenTaxStatus: 'Paid and Cleared up to 2026'
    },
    logistics: {
      showroomAddress: 'Premium Launchpad 3, Auto Choice Hub, Ring Road, Peshawar',
      timingWindows: '10:00 AM - 08:00 PM (Monday to Saturday)',
      documentHandling: 'In Office Safe',
      biometricInstantNadra: true,
      titleTransferTurnaround: '2 Working Days'
    },
    showroom: {
      name: 'Auto Choice Flagship Showroom',
      tier: 'Tier-1 Elite Platinum Verified',
      hotline: '+92 315 9085086',
      activeFeedStatus: 'Active Showcase Live Feed Sync OK',
      whatsappNumber: '923159085086'
    },
    description: 'The Porsche 911 GT3 RS features an uncompromising track focus with active aerodynamics and a high-revving naturally aspirated engine. Specially imported, total pristine condition, raw carbon fiber package with complete history.'
  },
  {
    id: 'car-audi-etron',
    make: 'Audi',
    modelName: 'e-tron GT rs',
    year: 2023,
    priceRaw: 42000000,
    priceFormatted: 'PKR 4.2 Crore',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600',
    category: 'Electric cars',
    cityRegistered: 'Lahore Registered',
    odometer: '8,400 KM',
    transmission: 'Automatic',
    engineAndFuel: 'EV Dual-Motor Quattro',
    fuelEconomyRange: '4.8 km/kWh combined',
    bodyType: 'Sedan',
    color: 'Kemora Gray',
    specs: {
      engineSize: '93 kWh Electric',
      horsepower: '637 HP',
      conditionScore: 9.7,
      tireTread: 90,
      engineCompression: 100,
      interiorSanitation: 98,
      suspensionHealth: 97
    },
    paintMap: [
      { panelName: 'Hood', status: 'Genuine', detail: 'Pristine factory metallic paint' },
      { panelName: 'Left Fender', status: 'Touch-Up', detail: 'Minor aesthetic scratch resolved by official dealership' },
      { panelName: 'Roof', status: 'Genuine', detail: 'Panoramic glass structure seamless' },
      { panelName: 'Right Door', status: 'Genuine', detail: '100% paint depth matching' }
    ],
    legal: {
      importProfile: 'Official Audi Pakistan Imports - Certified Digital Sheet',
      ownershipSequence: '1st Owner (Prestige individual owner)',
      documentDeliveryProfile: 'Smart Card',
      tokenTaxStatus: 'Lifetime Tax Paid'
    },
    logistics: {
      showroomAddress: 'Almas Car Village, Main Block, Peshawar',
      timingWindows: '09:00 AM - 09:00 PM (Daily)',
      documentHandling: 'Available By Hand',
      biometricInstantNadra: true,
      titleTurnaround: 'Instant Transfer Support'
    } as any,
    showroom: {
      name: 'Almas Car Valley Hub',
      tier: 'Elite Certified Master Showroom',
      hotline: '+92 315 9085086',
      activeFeedStatus: 'Bazar360 Satellite Sync Active',
      whatsappNumber: '923159085086'
    },
    description: 'This Rs-tuned Audi e-tron GT displays breathtaking acceleration with absolute silent composure. Zero fuel cost, super fast 270kW charging curve, finished in pristine Kemora active gray tone.'
  },
  {
    id: 'car-civic-oriel',
    make: 'Honda',
    modelName: 'Civic Oriel Turbo',
    year: 2023,
    priceRaw: 9200000,
    priceFormatted: 'PKR 92.0 Lakh',
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=600',
    category: 'Automatic cars',
    cityRegistered: 'Peshawar Registered',
    odometer: '12,500 KM',
    transmission: 'Automatic',
    engineAndFuel: 'Gasoline 1.5L VTEC Turbo',
    fuelEconomyRange: '14.5 - 12.0 km/l',
    bodyType: 'Sedan',
    color: 'Meteoroid Gray Metallic',
    specs: {
      engineSize: '1,498 cc',
      horsepower: '176 HP',
      conditionScore: 9.8,
      tireTread: 88,
      engineCompression: 98,
      interiorSanitation: 95,
      suspensionHealth: 96
    },
    paintMap: [
      { panelName: 'Hood', status: 'Genuine', detail: 'Original scratchless metallic base' },
      { panelName: 'Left Door', status: 'Genuine', detail: 'Original factory profile verified' },
      { panelName: 'Right Door', status: 'Genuine', detail: 'Genuine factory depth' },
      { panelName: 'Left Real Quarter', status: 'Dent', detail: 'Minor soft parking dent, unpainted dry-dent pulled' }
    ],
    legal: {
      importProfile: 'Locally Assembled Flagship Variant - Factory Spec Card',
      ownershipSequence: '1st Owner',
      documentDeliveryProfile: 'Original File',
      tokenTaxStatus: 'Paid and Cleared up to 2026'
    },
    logistics: {
      showroomAddress: 'Auto Choice HQ, West Ring Road, Peshawar',
      timingWindows: '10:00 AM - 08:30 PM (Mon-Sat)',
      documentHandling: 'In Office Safe',
      biometricInstantNadra: true,
      titleTransferTurnaround: '3 Working Days'
    },
    showroom: {
      name: 'Auto Choice Premium Division',
      tier: 'Flagship Partner',
      hotline: '+92 315 9085086',
      activeFeedStatus: 'Showroom Live Active Connection',
      whatsappNumber: '923159085086'
    },
    description: 'Extremely popular premium local sedan featuring cutting-edge VTEC Turbo acceleration coupled with comfortable ride architecture and full legal paper clearance.'
  },
  {
    id: 'car-landcruiser-prado',
    make: 'Toyota',
    modelName: 'Prado TX L-Package',
    year: 2022,
    priceRaw: 58500000,
    priceFormatted: 'PKR 5.85 Crore',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
    category: 'Luxury Cars',
    cityRegistered: 'Peshawar Registered',
    odometer: '42,000 KM',
    transmission: 'Automatic',
    engineAndFuel: 'Gasoline 2.7L dual V-Twin',
    fuelEconomyRange: '10.2 - 8.5 km/l',
    bodyType: 'SUV',
    color: 'Super White II',
    specs: {
      engineSize: '2,694 cc',
      horsepower: '163 HP',
      conditionScore: 9.4,
      tireTread: 82,
      engineCompression: 95,
      interiorSanitation: 94,
      suspensionHealth: 92
    },
    paintMap: [
      { panelName: 'Hood', status: 'Genuine', detail: 'Genuine deep clear coat' },
      { panelName: 'Left Quarter', status: 'Showered', detail: 'Showered panel due to light wall scrape (No major accident impact)' },
      { panelName: 'Roof', status: 'Genuine', detail: 'Original paint integrity' },
      { panelName: 'Tailgate', status: 'Genuine', detail: 'Rear spare mount support healthy' }
    ],
    legal: {
      importProfile: 'Japan Import Catalog Grade 4.5B with verified Odo logs',
      ownershipSequence: '2nd Owner Verified',
      documentDeliveryProfile: 'Smart Card',
      tokenTaxStatus: 'Paid up to 2026'
    },
    logistics: {
      showroomAddress: 'Almas Car Village, Peshawar Ring Road, Peshawar',
      timingWindows: '10:00 AM - 08:00 PM',
      documentHandling: 'In Office Safe',
      biometricInstantNadra: true,
      titleTransferTurnaround: '4 Working Days'
    },
    showroom: {
      name: 'Auto Choice Peshawar Storefront',
      tier: 'Verified Prestige Dealer',
      hotline: '+92 315 9085086',
      activeFeedStatus: 'Active Connection',
      whatsappNumber: '923159085086'
    },
    description: 'A genuine luxury icon offering massive presence and extreme Pakistani terrain versatility. Complete Japan auction list certified, luxury leather interior configuration.'
  },
  {
    id: 'car-suzuki-carry',
    make: 'Suzuki',
    modelName: 'Every Join Turbo Daba',
    year: 2020,
    priceRaw: 3450000,
    priceFormatted: 'PKR 34.5 Lakh',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
    category: 'Carry Daba',
    cityRegistered: 'Rawalpindi Registered',
    odometer: '65,000 KM',
    transmission: 'Automatic',
    engineAndFuel: 'Gasoline 660cc Intercooler Turbo',
    fuelEconomyRange: '17.8 - 15.1 km/l',
    bodyType: 'Van',
    color: 'Silver Metallic',
    specs: {
      engineSize: '658 cc',
      horsepower: '64 HP',
      conditionScore: 8.9,
      tireTread: 78,
      engineCompression: 91,
      interiorSanitation: 90,
      suspensionHealth: 88
    },
    paintMap: [
      { panelName: 'Front Mask', status: 'Genuine', detail: 'Original silver pearl paint finish' },
      { panelName: 'Side Door Left', status: 'Touch-Up', detail: 'Slight cosmetic touch-up near running board' },
      { panelName: 'Sliding Door Right', status: 'Genuine', detail: 'Original sliding hardware tracks ok' }
    ],
    legal: {
      importProfile: 'Imported Japan van, handpicked via Grade 4.0 assessment',
      ownershipSequence: '1st Owner in Pakistan',
      documentDeliveryProfile: 'Old Registration Book',
      tokenTaxStatus: 'Cleared up to 2025'
    },
    logistics: {
      showroomAddress: 'Main Ring Road Sector B, Peshawar',
      timingWindows: '10:00 AM - 07:00 PM',
      documentHandling: 'Available By Hand',
      biometricInstantNadra: true,
      titleTransferTurnaround: '3 Working Days'
    },
    showroom: {
      name: 'Auto Choice Peshawar Storefront',
      tier: 'Verified Prestige Partner',
      hotline: '+92 315 9085086',
      activeFeedStatus: 'Synchronized Catalog OK',
      whatsappNumber: '923159085086'
    },
    description: 'The Join Turbo model features comfortable plush fabric 7-seat capability, climate controller and robust turbo boost giving remarkable power & fuel economy.'
  },
  {
    id: 'car-nissan-gtr',
    make: 'Nissan',
    modelName: 'GT-R R35 Stage 2+',
    year: 2017,
    priceRaw: 48000000,
    priceFormatted: 'PKR 4.8 Crore',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600',
    category: 'Modified Cars',
    cityRegistered: 'Islamabad Registered',
    odometer: '18,600 KM',
    transmission: 'Automatic',
    engineAndFuel: 'Gasoline 3.8L Twin-Turbo V6',
    fuelEconomyRange: '7.8 - 6.0 km/l',
    bodyType: 'Coupe',
    color: 'Katsura Orange',
    specs: {
      engineSize: '3,799 cc',
      horsepower: '720 HP',
      conditionScore: 9.3,
      tireTread: 85,
      engineCompression: 97,
      interiorSanitation: 96,
      suspensionHealth: 94
    },
    paintMap: [
      { panelName: 'Front Bumper', status: 'Showered', detail: 'Custom custom-mesh stone chip correction paint work' },
      { panelName: 'Left Door', status: 'Genuine', detail: 'Perfect paint luster' },
      { panelName: 'Roof', status: 'Genuine', detail: 'Carbon wrap applied over genuine paint' }
    ],
    legal: {
      importProfile: 'Spec-V US Import Spec with detailed custom logs base',
      ownershipSequence: '2nd Owner',
      documentDeliveryProfile: 'Smart Card',
      tokenTaxStatus: 'Paid up to 2026'
    },
    logistics: {
      showroomAddress: 'Auto Choice Performance Lab Terminal, Peshawar Block B',
      timingWindows: '12:00 PM - 09:00 PM',
      documentHandling: 'In Office Safe',
      biometricInstantNadra: true,
      titleTransferTurnaround: '2 Working Days'
    },
    showroom: {
      name: 'Auto Choice HQ Lab',
      tier: 'Tier-1 Certified Tuning Partner',
      hotline: '+92 315 9085086',
      activeFeedStatus: 'Realtime telemetry active',
      whatsappNumber: '923159085086'
    },
    description: 'A street weapon modified with absolute professional gear. Stage 2+ tune running high-flow custom intakes, titanium downpipes, and fully adjusted active traction management.'
  }
];

export default function AutoChoiceEngine({
  allListings = [],
  onSelectExternalListing,
  onViewChange
}: {
  allListings?: any[];
  onSelectExternalListing?: (listingId: string) => void;
  onViewChange?: (view: 'dashboard' | 'drilldown') => void;
}) {
  // View states
  const [currentView, setCurrentView] = useState<'dashboard' | 'drilldown'>('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Filter states
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedMake, setSelectedMake] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [budgetLimit, setBudgetLimit] = useState<number>(100000000); // Max 10 Crore PKR

  // Active Dropdown selector UI toggles
  const [activeDropdownFilter, setActiveDropdownFilter] = useState<'Category' | 'City' | 'Make' | 'Model' | 'Budget' | 'BodyType' | null>(null);

  // Vertical Inspection tabs inside Drill-Down View
  const [activeTabId, setActiveTabId] = useState<'mechanical' | 'legal' | 'logistics' | 'showroom'>('mechanical');

  // Contact form state
  const [showInquirySent, setShowInquirySent] = useState<boolean>(false);

  // Combined searchable listings
  const filteredVehicles = PREMIUM_CAR_RECORDS.filter(car => {
    const matchesCategory = activeCategory === 'All' || car.category === activeCategory;
    const matchesCity = selectedCity === 'All' || car.cityRegistered.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesMake = selectedMake === 'All' || car.make.toLowerCase() === selectedMake.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
      car.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBudget = car.priceRaw <= budgetLimit;

    return matchesCategory && matchesCity && matchesMake && matchesSearch && matchesBudget;
  });

  const activeVehicle = PREMIUM_CAR_RECORDS.find(car => car.id === selectedVehicleId) || PREMIUM_CAR_RECORDS[0];

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
    setCurrentView('drilldown');
    if (onViewChange) onViewChange('drilldown');
    setActiveTabId('mechanical');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleReturnToDashboard = () => {
    setSelectedVehicleId(null);
    setCurrentView('dashboard');
    if (onViewChange) onViewChange('dashboard');
  };

  // 12 iconic categories grid
  const CATEGORIES_12_GRID: CategoryMeta[] = [
    { id: 'Sports cars', label: 'Sports Cars', iconText: '🏎️', count: 4, vectorSvg: <path d="M10 17c-1.1s-1-.9-1-2h6c0 1.1-.9 2-2 2H10zM1 12l2-4h18l2 4M3 14h18" strokeWidth="2" stroke="currentColor" fill="none" /> },
    { id: 'Electric cars', label: 'Electric Cars', iconText: '⚡', count: 3, vectorSvg: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2" stroke="currentColor" fill="none" /> },
    { id: 'Luxury Cars', label: 'Luxury Cars', iconText: '👑', count: 5, vectorSvg: <path d="M12 4l3 7h6l-5 4 2 7-6-4-6 4 2-7-5-4h6l3-7z" strokeWidth="2" stroke="currentColor" fill="none" /> },
    { id: 'Japanese cars', label: 'Japanese Cars', iconText: '🇯🇵', count: 12, vectorSvg: <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" /> },
    { id: 'Automatic cars', label: 'Automatic Cars', iconText: '⚙️', count: 9, vectorSvg: <circle cx="12" cy="12" r="7" strokeWidth="2" stroke="currentColor" fill="none" /> },
    { id: 'Old Cars', label: 'Old Cars', iconText: '🕰️', count: 2, vectorSvg: <path d="M12 8v4l3 3" strokeWidth="2" stroke="#00d2ff" fill="none" /> },
    { id: 'Hybrid cars', label: 'Hybrid Cars', iconText: '🍀', count: 6, vectorSvg: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10" strokeWidth="2" stroke="currentColor" fill="none" /> },
    { id: 'Carry Daba', label: 'Carry Daba', iconText: '🚐', count: 3, vectorSvg: <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" stroke="currentColor" fill="none" /> },
    { id: '7 Seater', label: '7 Seater', iconText: '👥', count: 4, vectorSvg: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="2" stroke="currentColor" fill="none" /> },
    { id: 'Accidental', label: 'Accidental/Rebuild', iconText: '⚠️', count: 1, vectorSvg: <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" stroke="currentColor" fill="none" className="text-orange-500" /> },
    { id: 'Modified Cars', label: 'Modified Cars', iconText: '🔧', count: 5, vectorSvg: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94" strokeWidth="1.5" stroke="currentColor" fill="none" /> },
    { id: 'Small cars', label: 'Small Hatchbacks', iconText: '🚗', count: 8, vectorSvg: <rect x="4" y="8" width="16" height="10" rx="1" strokeWidth="2" stroke="currentColor" fill="none" /> }
  ];

  const toggleDropdown = (filterName: 'Category' | 'City' | 'Make' | 'Model' | 'Budget' | 'BodyType') => {
    if (activeDropdownFilter === filterName) {
      setActiveDropdownFilter(null);
    } else {
      setActiveDropdownFilter(filterName);
    }
  };

  const handleQuickWhatsApp = (vehicle: PremiumVehicle) => {
    const textStr = encodeURIComponent(`Hello, I am interested in checking specifications on the verified ${vehicle.make} ${vehicle.modelName} listed at ${vehicle.priceFormatted} on BAZAR360 Auto Choice Peshawar. Please share the certified mechanical log sheet.`);
    window.open(`https://wa.me/${vehicle.showroom.whatsappNumber}?text=${textStr}`, '_blank');
  };

  return (
    <div id="auto-choice-premium-engine-viewport" className="w-full text-white font-sans bg-[#070c18] border border-white/5 rounded-3xl p-5 md:p-8 space-y-8 shadow-[0_20px_50px_rgba(3,5,10,0.6)]">
      
      {/* Inline Stylesheet for Hardware-Accelerated Conveyor Marquee */}
      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-slick-conveyor {
          display: flex;
          width: max-content;
          animation: marqueeLeft 45s linear infinite;
        }
        .animate-slick-conveyor:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* =========================================================================
          UNIFIED PRESENTATION BRANDING & CAR TRACK HUB (Inline side-by-side flex row)
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-center justify-between overflow-hidden gap-8 py-12 w-full border-b border-[#1f2937]">
        
        {/* 1. Left-Side Column: Rigid Branding & Text Anchor */}
        <div className="w-full lg:w-[42%] flex flex-col text-left space-y-6 z-10">
          
          {/* Branding Header Block */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white hover:text-[#00d2ff] duration-300 select-none">
              AUTO CHOICE
            </h1>
            <span className="inline-flex items-center gap-1 bg-[#ff6b00]/10 border border-[#ff6b00]/30 text-[#ff6b00] font-mono text-[9px] font-black tracking-widest px-2.5 py-1.5 rounded-full uppercase">
              + BAZAR360 PREMIUM PARTNER
            </span>
          </div>

          {/* Tagline Surface Box */}
          <div className="py-2.5 px-4 rounded-xl bg-[#0b1324] border border-[#1f2937]/50 inline-block self-start">
            <p className="text-xs md:text-sm font-semibold tracking-wide text-[#00d2ff] uppercase">
              PRECISION ENGINEERED. FUTURE DRIVEN. DISCOVER ELITE AUTOMOTIVE OPTIONS VERIFIED BY INTELLIGENCE.
            </p>
          </div>

          {/* Ecosystem Introduction Paragraph */}
          <p className="text-gray-400 text-xs md:text-[13px] leading-relaxed font-sans font-medium">
            Welcome to the Auto Choice division of BAZAR360—a premium ecosystem connecting high-performance local physical showrooms with elite buyers through real-time market verified analytics.
          </p>

        </div>

        {/* 2. Right-Side Column: Infinite Horizontal Moving Car Track */}
        <div className="w-full lg:w-[58%] overflow-hidden relative native-marquee-window">
          
          {/* Ambient overlays on edges to ground margins */}
          <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-[#070c18] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-[#070c18] to-transparent z-10 pointer-events-none"></div>

          {/* Moving Marquee Conveyor Track */}
          <div className="flex overflow-hidden relative w-full items-center py-2">
            <div className="animate-slick-conveyor flex gap-6 shrink-0">
              
              {/* Duplicated listing loop array for flawless looping */}
              {[...PREMIUM_CAR_RECORDS, ...PREMIUM_CAR_RECORDS].map((car, idx) => (
                <div
                  key={`conveyor-${car.id}-${idx}`}
                  onClick={() => handleSelectVehicle(car.id)}
                  className="group relative w-60 bg-transparent border border-[#1f2937]/50 hover:border-[#00d2ff] p-4.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(0,210,255,0.4)] cursor-pointer overflow-hidden shrink-0 select-none"
                >
                  {/* Subtle radial cyan glow projection circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-[#00d2ff]/8 rounded-full blur-2xl z-0 pointer-events-none group-hover:bg-[#00d2ff]/15 transition-all duration-300"></div>

                  {/* Micro Category Badge Floating at card top */}
                  <div className="flex justify-between items-center mb-2.5 relative z-10">
                    <span className="text-[7px] font-mono uppercase bg-black/55 text-[#00d2ff] border border-[#00d2ff]/20 px-2 py-0.5 rounded-full font-bold">
                      {car.category}
                    </span>
                    <span className="text-[7.5px] font-mono text-orange-500 font-bold">
                      ★ {car.specs.conditionScore} Specs
                    </span>
                  </div>

                  {/* Main Transparent Vehicle Image Asset */}
                  <div className="w-full h-24 flex items-center justify-center overflow-hidden relative z-10">
                    <img 
                      src={car.imageUrl} 
                      alt={`${car.make} ${car.modelName}`} 
                      className="max-h-[90%] max-w-[90%] object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)] duration-300 group-hover:-translate-y-1 transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Micro Specification Badges */}
                  <div className="text-left mt-3 relative z-10 space-y-1">
                    <h4 className="text-[11px] font-bold text-white uppercase truncate tracking-tight group-hover:text-[#00d2ff] duration-150">
                      {car.make} {car.modelName}
                    </h4>
                    <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
                      <span>Model: {car.year}</span>
                      <span className="text-[#00d2ff]">{car.transmission}</span>
                    </div>
                    
                    {/* Price Tag with high-conversion badge */}
                    <div className="mt-2.5 flex justify-between items-center border-t border-white/5 pt-2">
                      <span className="text-xs font-mono font-black text-white">
                        {car.priceFormatted}
                      </span>
                      <span className="bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00] text-[8px] font-mono font-bold px-1.5 py-0.5 rounded">
                        Inspect →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
          VIEW CONTROL: DASHBOARD METROPOLIS VS LUXURY SPEC DETAIL INSIGHT VIEW
          ========================================================================= */}
      {currentView === 'dashboard' ? (
        
        /* =========================================================================
            COMPONENT BLOCK 1: MACRO SEARCH & FILTER HUB (Dashboard layout)
            ========================================================================= */
        <div id="macro-discovery-hub" className="space-y-6 animate-scale-fade">
          
          {/* A. Horizontal Navigation Filter Tab-Array */}
          <div className="bg-[#0b1324] border border-[#1f2937] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-1 md:gap-2">
              <span className="text-[9px] font-mono font-black text-gray-500 uppercase tracking-widest px-2 select-none">Quick Filters</span>
              
              {/* Category selector button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('Category')}
                  className={`px-3 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
                    activeDropdownFilter === 'Category' || activeCategory !== 'All' 
                      ? 'bg-[#00d2ff]/10 text-[#00d2ff] border-[#00d2ff]/40' 
                      : 'bg-black/40 text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  Category: <span className="text-white font-black">{activeCategory}</span>
                </button>
                {activeDropdownFilter === 'Category' && (
                  <div className="absolute left-0 mt-2 w-48 bg-[#0b1324] border border-[#1f2937] rounded-xl shadow-2xl z-40 p-2 space-y-1 text-left animate-fade-in">
                    {['All', 'Sports cars', 'Electric cars', 'Luxury Cars', 'Automatic cars', 'Carry Daba', 'Modified Cars'].map(cat => (
                      <button
                        key={cat} type="button"
                        onClick={() => { setActiveCategory(cat); setActiveDropdownFilter(null); }}
                        className="w-full text-left font-mono text-[9px] uppercase tracking-wide px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City selector button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('City')}
                  className={`px-3 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
                    activeDropdownFilter === 'City' || selectedCity !== 'All' 
                      ? 'bg-[#00d2ff]/10 text-[#00d2ff] border-[#00d2ff]/40' 
                      : 'bg-black/40 text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  City: <span className="text-white font-black">{selectedCity}</span>
                </button>
                {activeDropdownFilter === 'City' && (
                  <div className="absolute left-0 mt-2 w-48 bg-[#0b1324] border border-[#1f2937] rounded-xl shadow-2xl z-40 p-2 space-y-1 text-left animate-fade-in">
                    {['All', 'Peshawar', 'Islamabad', 'Lahore', 'Rawalpindi'].map(city => (
                      <button
                        key={city} type="button"
                        onClick={() => { setSelectedCity(city); setActiveDropdownFilter(null); }}
                        className="w-full text-left font-mono text-[9px] uppercase tracking-wide px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                      >
                        {city} (Registered)
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Make selector button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('Make')}
                  className={`px-3 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
                    activeDropdownFilter === 'Make' || selectedMake !== 'All' 
                      ? 'bg-[#00d2ff]/10 text-[#00d2ff] border-[#00d2ff]/40' 
                      : 'bg-black/40 text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  Make: <span className="text-white font-black">{selectedMake}</span>
                </button>
                {activeDropdownFilter === 'Make' && (
                  <div className="absolute left-0 mt-2 w-40 bg-[#0b1324] border border-[#1f2937] rounded-xl shadow-2xl z-40 p-2 space-y-1 text-left animate-fade-in">
                    {['All', 'Porsche', 'Audi', 'Honda', 'Toyota', 'Suzuki', 'Nissan'].map(mk => (
                      <button
                        key={mk} type="button"
                        onClick={() => { setSelectedMake(mk); setActiveDropdownFilter(null); }}
                        className="w-full text-left font-mono text-[9px] uppercase tracking-wide px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                      >
                        {mk}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget Slider selector button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('Budget')}
                  className={`px-3 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
                    activeDropdownFilter === 'Budget' || budgetLimit < 100000000 
                      ? 'bg-[#00d2ff]/10 text-[#00d2ff] border-[#00d2ff]/40' 
                      : 'bg-black/40 text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  Max Budget: <span className="text-white font-black">{budgetLimit >= 100000000 ? 'Any' : `PKR ${(budgetLimit/100000).toFixed(0)} Lakh`}</span>
                </button>
                {activeDropdownFilter === 'Budget' && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0b1324] border border-[#1f2937] rounded-xl shadow-2xl z-40 p-4 space-y-3 text-left animate-fade-in">
                    <div className="flex justify-between items-center text-[9px] font-mono pb-1 border-b border-white/5">
                      <span className="text-gray-400">SELECT BUDGET RANGE</span>
                      <span className="text-[#00d2ff]">Lakh PKR</span>
                    </div>
                    <input 
                      type="range" 
                      min={2000000} 
                      max={100000000} 
                      step={1000000} 
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(Number(e.target.value))}
                      className="w-full accent-orange-500 bg-black/60 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                      <span>20 Lac</span>
                      <span>500 Lac</span>
                      <span>1,000 Lac</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setBudgetLimit(100000000); setActiveDropdownFilter(null); }}
                      className="w-full text-center bg-black/40 hover:bg-orange-500 text-[8px] hover:text-white font-mono uppercase tracking-widest py-1.5 rounded border border-white/5 text-gray-400"
                    >
                      Clear Budget Limit
                    </button>
                  </div>
                )}
              </div>

              {/* Reset to clear filters */}
              {(activeCategory !== 'All' || selectedCity !== 'All' || selectedMake !== 'All' || searchQuery !== '' || budgetLimit < 100000000) && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('All');
                    setSelectedCity('All');
                    setSelectedMake('All');
                    setSearchQuery('');
                    setBudgetLimit(100000000);
                  }}
                  className="px-2.5 py-2 rounded-xl text-[9px] font-mono uppercase text-orange-400 hover:text-white hover:bg-orange-500/10 border border-orange-500/20 transition-colors"
                >
                  Reset Auto Filter
                </button>
              )}
            </div>

            {/* Keyword Search Field inside horizontal array */}
            <div className="relative w-full md:w-52 shrink-0">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Find e.g. Civic or Porsche..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/35 rounded-xl border border-[#1f2937] hover:border-white/20 focus:border-[#00d2ff] pl-8.5 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* B. The 12-Card Iconic Profile Matrix (layout from image_669f9d.png) */}
          <div className="space-y-3 text-left">
            <h3 className="text-[10px] font-mono font-black text-[#00d2ff] uppercase tracking-widest pl-1">
              Select Curated Category Matrices
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CATEGORIES_12_GRID.map((block) => (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(block.id === activeCategory ? 'All' : block.id);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between h-[105px] relative overflow-hidden select-none cursor-pointer ${
                    activeCategory === block.id 
                      ? 'bg-[#00d2ff]/15 border-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.2)]'
                      : 'bg-[#0b1324] border-[#1f2937] hover:border-gray-500'
                  }`}
                >
                  {/* Subtle vector outline overlay background for artistic touch */}
                  <div className="absolute right-1 bottom-1 opacity-10 text-white group-hover:scale-110 duration-300">
                    <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      {block.vectorSvg}
                    </svg>
                  </div>

                  {/* Icon character placeholder and active status token */}
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-xl">{block.iconText}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${activeCategory === block.id ? 'bg-[#00d2ff] animate-ping' : 'bg-transparent'}`}></span>
                  </div>

                  {/* Text meta */}
                  <div className="relative z-10 pt-2">
                    <p className={`text-[10.5px] font-bold uppercase tracking-tight leading-none ${activeCategory === block.id ? 'text-[#00d2ff]' : 'text-white'}`}>
                      {block.label}
                    </p>
                    <span className="text-[8px] font-mono text-gray-500 mt-0.5 block uppercase">
                      {block.count} verified catalogs
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* C. Filtered Results Showcase */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-left border-b border-white/5 pb-2">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                Showing {filteredVehicles.length} of {PREMIUM_CAR_RECORDS.length} Signature Records
              </span>
              <span className="text-[8px] font-mono text-gray-500 uppercase">Interactive Grid Layout</span>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0b1324] border border-[#1f2937] space-y-3">
                <AlertTriangle className="mx-auto text-orange-500" size={32} />
                <p className="text-xs text-gray-400 font-mono uppercase">Unmatched Filter Parameters</p>
                <p className="text-[10px] text-gray-500">No active spec sheets matching current selection criteria. Adjust budget slider or toggle categoric nodes.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('All');
                    setSelectedCity('All');
                    setSelectedMake('All');
                    setBudgetLimit(100000000);
                  }}
                  className="bg-[#ff6b00] hover:bg-orange-600 text-white font-mono uppercase text-[9px] py-2 px-4 rounded-xl"
                >
                  Clear Discovery Grid
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {filteredVehicles.map((car) => (
                  <div
                    key={car.id}
                    onClick={() => handleSelectVehicle(car.id)}
                    className="bg-[#0b1324] border border-[#1f2937] rounded-2xl overflow-hidden group hover:border-[#00d2ff] duration-300 relative flex flex-col justify-between shadow-lg cursor-pointer"
                  >
                    {/* Top ambient highlight header */}
                    <div className="p-4 border-b border-white/5 bg-black/10 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono uppercase text-[#00d2ff] font-bold">
                          {car.make}
                        </span>
                        <h4 className="text-xs font-black uppercase text-white truncate max-w-[160px]">
                          {car.modelName}
                        </h4>
                      </div>
                      <span className="text-[8.5px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-gray-400">
                        {car.year}
                      </span>
                    </div>

                    {/* Image with underlying blur light floor marker */}
                    <div className="h-36 bg-[#040810] relative flex items-center justify-center p-4 overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#00d2ff]/5 rounded-full blur-2xl z-0 pointer-events-none"></div>
                      <img
                        src={car.imageUrl}
                        alt={`${car.make} ${car.modelName}`}
                        className="max-h-[90%] max-w-[85%] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] z-10 group-hover:scale-105 duration-300 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Info base specifications */}
                    <div className="p-4 space-y-3.5 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-2 text-[9.5px]/relaxed font-mono text-gray-400">
                        <div className="flex items-center gap-1">
                          <Gauge size={11} className="text-[#00d2ff]" />
                          <span>{car.odometer}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <MapPin size={11} className="text-[#00d2ff]" />
                          <span className="truncate">{car.cityRegistered.replace(' Registered', '')}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-gray-400 leading-relaxed font-sans line-clamp-2">
                        {car.description}
                      </p>

                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <div className="space-y-0.5">
                          <span className="text-[7.5px] font-mono uppercase text-gray-500">Target price demand</span>
                          <p className="text-sm font-mono font-black text-white">
                            {car.priceFormatted}
                          </p>
                        </div>
                        <span className="bg-[#ff6b00] hover:bg-orange-600 text-white font-mono uppercase text-[9px] font-black px-3.5 py-2 rounded-xl transition-colors duration-150 shadow-[0_4px_12px_rgba(255,107,0,0.2)]">
                          Inspect Track
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      ) : (

        /* =========================================================================
            COMPONENT BLOCK 2: SYSTEMATIC VEHICLE DETAIL DRILL-DOWN (Detailed view of image_669bfe.jpg)
            ========================================================================= */
        <div id="luxury-detail-drilldown" className="space-y-8 animate-scale-fade text-left">
          
          {/* Action breadcrumb return helper */}
          <div>
            <button
              type="button"
              onClick={handleReturnToDashboard}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0b1324] border border-[#1f2937] hover:border-[#00d2ff] hover:text-[#00d2ff] text-xs font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer"
            >
              <ArrowLeft size={14} className="text-orange-500" />
              Return to Discovery Hub
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* =========================================================================
                A. Visual Presentation Stage (Left layout 7/12 width)
                ========================================================================= */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Image Hero Presentation Stage Container */}
              <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#0e1628] to-[#040810] border border-white/10 p-6 overflow-hidden h-[360px] md:h-[460px] flex items-center justify-center shadow-inner">
                
                {/* Massive Model Heading Overlay with absolute styling */}
                <div className="absolute top-6 left-6 select-none pointer-events-none text-left z-0 max-w-lg">
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-[#000000] text-opacity-35 text-white/5 uppercase leading-none break-all">
                    {activeVehicle.make} {activeVehicle.modelName}
                  </h2>
                </div>

                {/* Faded Artistic Manufacturer logo/vector watermark backdrop */}
                <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.03] z-0">
                  <svg className="w-72 h-72 md:w-[480px] md:h-[480px] animate-[spin_120s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <circle cx="50" cy="50" r="45" strokeWidth="0.5" strokeDasharray="3 3" className="text-sky-400" />
                    <circle cx="50" cy="50" r="35" strokeWidth="0.25" className="text-white" />
                    <circle cx="50" cy="50" r="22" strokeWidth="0.5" strokeDasharray="5 5" className="text-orange-500" />
                    <path d="M 50 5 L 50 95 M 5 50 L 95 50" strokeWidth="0.25" className="text-white/40" />
                    <text x="50" y="45" textAnchor="middle" fontSize="3.5" fontWeight="950" fill="currentColor" letterSpacing="2.5" className="text-[#00d2ff] font-mono">INTELLIGENCE</text>
                    <text x="50" y="59" textAnchor="middle" fontSize="3.5" fontWeight="950" fill="currentColor" letterSpacing="2.5" className="text-[#ff6b00] font-mono">VERIFIED</text>
                  </svg>
                </div>

                {/* Grounding Perspective Ring with bright radial glow */}
                <div className="absolute bottom-12 w-[80%] h-[12%] rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 blur-md transform scale-x-110 z-0 text-center"></div>
                <div className="absolute bottom-10 w-[70%] h-[8%] rounded-full bg-black/60 blur-[3px] z-0"></div>

                {/* Interactive Transparent Vehicle image */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <img
                    src={activeVehicle.imageUrl}
                    alt={`${activeVehicle.make} ${activeVehicle.modelName}`}
                    className="max-w-[85%] max-h-[80%] object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Overlapping secured contact watermark floating badge */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <span className="bg-black/60 border border-white/5 backdrop-blur-md text-[8px] font-mono text-gray-400 px-2.5 py-1 rounded-lg uppercase tracking-wider block">
                    ID: {activeVehicle.id}
                  </span>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-[8px] font-mono text-emerald-400 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Verified Sheet OK
                  </span>
                </div>
              </div>

              {/* Description Summary Text Box */}
              <div className="p-5 rounded-2xl bg-[#0b1324] border border-[#1f2937] space-y-2">
                <span className="text-[8.5px] font-mono uppercase text-[#00d2ff] tracking-widest font-extrabold block">Architectural Concept</span>
                <p className="text-[11.5px] md:text-xs text-gray-300 leading-relaxed font-sans font-medium">
                  {activeVehicle.description}
                </p>
              </div>

            </div>

            {/* =========================================================================
                B. Left-Aligned Vertical Inspection Tabs & Details (Right layout 5/12 width)
                ========================================================================= */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Custom Vertical Tabs Selector Row */}
              <div className="grid grid-cols-4 gap-2 border-b border-white/5 pb-3">
                {[
                  { id: 'mechanical', label: 'Mechanical', icon: <Wrench size={12} /> },
                  { id: 'legal', label: 'Legal', icon: <FileText size={12} /> },
                  { id: 'logistics', label: 'Logistics', icon: <Clock size={12} /> },
                  { id: 'showroom', label: 'Showroom', icon: <Building size={12} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTabId(tab.id as any)}
                    className={`py-2 px-1 rounded-xl text-center text-[9px] font-mono uppercase tracking-wider transition-colors flex flex-col items-center justify-center gap-1.5 border min-h-[58px] cursor-pointer ${
                      activeTabId === tab.id
                        ? 'bg-[#00d2ff]/10 text-[#00d2ff] border-[#00d2ff]/40 shadow-inner'
                        : 'bg-black/30 text-gray-500 border-white/5 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span className="truncate w-full">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Inner Tab Info Blocks Panel */}
              <div className="bg-[#0b1324] border border-[#1f2937] rounded-3xl p-5 space-y-4 min-h-[290px] relative overflow-hidden text-left shadow-lg">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

                {activeTabId === 'mechanical' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[8px] font-mono uppercase text-[#00d2ff] tracking-widest font-bold">INSIGHT MODULE 1</span>
                      <h4 className="text-[11px] font-black uppercase text-white mt-0.5">Verified Structural health log</h4>
                    </div>

                    {/* Progress bars matrix */}
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between items-center text-[9px] font-mono uppercase mb-1">
                          <span className="text-gray-400">Engine Cylinder Compression</span>
                          <span className="text-[#00d2ff] font-bold">{activeVehicle.specs.engineCompression}% Bar</span>
                        </div>
                        <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#00d2ff] h-full" style={{ width: `${activeVehicle.specs.engineCompression}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-[9px] font-mono uppercase mb-1">
                          <span className="text-gray-400">Exterior Body Paint Depth score</span>
                          <span className="text-[#00d2ff] font-bold">{(activeVehicle.specs.conditionScore * 10).toFixed(0)}% Depth</span>
                        </div>
                        <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full" style={{ width: `${activeVehicle.specs.conditionScore * 10}%` }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-[7.5px] font-mono text-gray-500 uppercase block">Tyre Life Remaining</span>
                          <p className="text-[11px] font-mono font-black text-white mt-0.5">{activeVehicle.specs.tireTread}% Wear Left</p>
                        </div>
                        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-[7.5px] font-mono text-gray-500 uppercase block">Interior Sanitation index</span>
                          <p className="text-[11px] font-mono font-black text-white mt-0.5">{activeVehicle.specs.interiorSanitation}% Clean</p>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[7.5px] font-mono text-gray-500 uppercase block">Suspension/Under Carriage Health</span>
                        <p className="text-[11px] font-mono font-black text-[#00d2ff] mt-0.5">✓ {activeVehicle.specs.suspensionHealth}% Verified Rigid</p>
                      </div>
                    </div>

                    {/* Paint log map */}
                    <div className="pt-2">
                      <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1.5">Aesthetic Panel Mapping</span>
                      <div className="grid grid-cols-2 gap-2 text-[9px] font-sans">
                        {activeVehicle.paintMap.map((panel, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-black/20 p-2 rounded-lg border border-white/5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              panel.status === 'Genuine' ? 'bg-emerald-400' :
                              panel.status === 'Touch-Up' ? 'bg-yellow-400' :
                              panel.status === 'Showered' ? 'bg-[#00d2ff]' : 'bg-red-500'
                            }`} />
                            <div className="min-w-0">
                              <p className="text-white font-bold leading-none uppercase truncate">{panel.panelName}</p>
                              <p className="text-gray-500 text-[8px] truncate">{panel.status}: {panel.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTabId === 'legal' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[8px] font-mono uppercase text-[#00d2ff] tracking-widest font-bold">INSIGHT MODULE 2</span>
                      <h4 className="text-[11px] font-black uppercase text-white mt-0.5">Authorized registry & paper checklist</h4>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex gap-2 items-start bg-black/35 p-3 rounded-xl border border-white/5">
                        <ShieldCheck className="text-[#00d2ff] shrink-0" size={14} />
                        <div className="text-left">
                          <p className="text-[8px] font-mono text-gray-500 uppercase">Import auction credentials</p>
                          <p className="text-[10.5px] text-gray-300 font-sans font-bold">{activeVehicle.legal.importProfile}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 items-start bg-black/35 p-3 rounded-xl border border-white/5">
                        <UserCheck className="text-[#00d2ff] shrink-0" size={14} />
                        <div className="text-left">
                          <p className="text-[8px] font-mono text-gray-500 uppercase">Sequence sequence tracking</p>
                          <p className="text-[10.5px] text-gray-300 font-sans font-bold">✓ {activeVehicle.legal.ownershipSequence}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/35 p-2.5 rounded-xl border border-white/5">
                          <p className="text-[7.5px] font-mono text-gray-500 uppercase leading-none">Document Profile</p>
                          <p className="text-[10px] text-white font-sans font-bold mt-1 uppercase">📂 {activeVehicle.legal.documentDeliveryProfile}</p>
                        </div>
                        <div className="bg-black/35 p-2.5 rounded-xl border border-white/5">
                          <p className="text-[7.5px] font-mono text-gray-500 uppercase leading-none">Token Tax registry</p>
                          <p className="text-[10px] text-orange-400 font-sans font-bold mt-1 uppercase">✓ {activeVehicle.legal.tokenTaxStatus}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTabId === 'logistics' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[8px] font-mono uppercase text-[#00d2ff] tracking-widest font-bold">INSIGHT MODULE 3</span>
                      <h4 className="text-[11px] font-black uppercase text-white mt-0.5">Physical viewings & handovers</h4>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex gap-2 items-start. bg-black/35 p-3 rounded-xl border border-white/5">
                        <MapPin className="text-orange-500 shrink-0 mt-0.5" size={12} />
                        <div className="text-left">
                          <p className="text-[8px] font-mono text-gray-500 uppercase">Active inventory showroom venue</p>
                          <p className="text-[10px] text-gray-300 font-sans font-bold">{activeVehicle.logistics.showroomAddress}</p>
                        </div>
                      </div>

                      <div className="bg-black/35 p-3 rounded-xl border border-white/5 text-[9.5px] space-y-1 font-mono text-gray-400">
                        <div className="flex justify-between">
                          <span>Timing Window:</span>
                          <span className="text-white">{activeVehicle.logistics.timingWindows}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Physical Documents:</span>
                          <span className="text-white">{activeVehicle.legal.documentDeliveryProfile} Verified {activeVehicle.logistics.documentHandling}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Instant NADRA Biometrics:</span>
                          <span className="text-emerald-400 font-bold">{activeVehicle.logistics.biometricInstantNadra ? 'YES - At Showroom Desk' : 'No - Available Manual'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Handoff process:</span>
                          <span className="text-[#00d2ff]">{activeVehicle.logistics.titleTransferTurnaround}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTabId === 'showroom' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[8px] font-mono uppercase text-[#00d2ff] tracking-widest font-bold">INSIGHT MODULE 4</span>
                      <h4 className="text-[11px] font-black uppercase text-white mt-0.5">Verified showroom profile credentials</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-[#0c1425] p-3 rounded-xl border border-[#1f2937]/50 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-mono text-gray-500 uppercase">Distributor tier</p>
                          <h5 className="text-[11.5px] font-extrabold text-[#00d2ff] uppercase">{activeVehicle.showroom.name}</h5>
                          <p className="text-[8px] font-mono text-emerald-400 mt-0.5">{activeVehicle.showroom.tier}</p>
                        </div>
                        <Award className="text-orange-500 shrink-0" size={18} />
                      </div>

                      <div className="bg-black/35 p-3 rounded-xl border border-white/5 text-[9px] font-mono text-gray-400 space-y-1.5">
                        <div className="flex justify-between">
                          <span>Live catalog feeds sync:</span>
                          <span className="text-emerald-400">● {activeVehicle.showroom.activeFeedStatus}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Official dealer hotline:</span>
                          <span className="text-white">{activeVehicle.showroom.hotline}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* =========================================================================
              C. Base Hero Operational Telemetry Cards (Derived from layout)
              ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-b border-white/5 py-6">
            
            <div className="bg-[#0b1324] border border-[#1f2937] p-5.5 rounded-2xl text-center space-y-1">
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Odometer Reading Metric</span>
              <p className="text-2xl font-mono font-black text-white hover:text-[#00d2ff] duration-150">
                {activeVehicle.odometer}
              </p>
              <span className="text-[9.5px] font-sans text-gray-400 block font-medium">verified odometer distance</span>
            </div>

            <div className="bg-[#0b1324] border border-[#1f2937] p-5.5 rounded-2xl text-center space-y-1">
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Registration Plate Territory</span>
              <p className="text-2xl font-mono font-black text-white hover:text-[#00d2ff] duration-150">
                {activeVehicle.cityRegistered}
              </p>
              <span className="text-[9.5px] font-sans text-gray-400 block font-medium">excise registration domain</span>
            </div>

            <div className="bg-[#0b1324] border border-[#1f2937] p-5.5 rounded-2xl text-center space-y-1">
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Absolute Purchase Value</span>
              <p className="text-2xl font-mono font-black text-[#00d2ff] uppercase">
                {activeVehicle.priceFormatted}
              </p>
              <span className="text-[9.5px] font-sans text-gray-400 block font-medium">target demand price</span>
            </div>

          </div>

          {/* =========================================================================
              D. Overlapping Multi-Channel Action CTA Buttons (Split conversion mechanics)
              ========================================================================= */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#0b1324]/80 border border-[#1f2937] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-full bg-orange-500/5 -skew-x-12 z-0"></div>
            
            <div className="space-y-1 text-left relative z-10">
              <span className="text-[8.5px] font-mono text-[#00d2ff] tracking-widest uppercase font-black">Conversion Terminal</span>
              <h4 className="text-xs font-black uppercase text-white">Direct Verification Gateway active</h4>
              <p className="text-[9px] text-gray-500 font-mono">Select secure hotline dialer or message dealer with verified specs sheet token.</p>
            </div>

            {/* Split conversion engine buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto relative z-10 shrink-0">
              
              <button
                type="button"
                onClick={() => handleQuickWhatsApp(activeVehicle)}
                className="flex-grow sm:flex-none py-3 px-5 rounded-xl bg-black/40 hover:bg-[#00d2ff]/10 text-white font-mono text-[10px] uppercase tracking-wider border border-[#00d2ff]/30 text-center cursor-pointer flex items-center justify-center gap-1.5 duration-150"
              >
                <MessageSquare size={13} className="text-[#00d2ff]" />
                💬 WhatsApp Seller
              </button>

              <a
                href={`tel:${activeVehicle.showroom.hotline}`}
                className="flex-grow sm:flex-none py-3 px-6 rounded-xl bg-[#ff6b00] hover:bg-orange-600 text-slate-950 font-mono text-[10px] uppercase font-black tracking-widest text-center cursor-pointer flex items-center justify-center gap-1.5 duration-150 shadow-[0_4px_16px_rgba(255,107,0,0.3)] border border-[#ff6b00]/50"
              >
                <Phone size={13} className="text-slate-950" />
                📞 Secure Hotline
              </a>

            </div>
          </div>

        </div>

      )}

    </div>
  );
}
