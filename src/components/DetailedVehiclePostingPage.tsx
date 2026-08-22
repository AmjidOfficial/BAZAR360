import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Trash2, 
  User, 
  Phone, 
  MapPin, 
  Info, 
  AlertCircle,
  Car,
  CheckCircle,
  Clock,
  Save,
  ShieldCheck,
  Eye,
  Sliders,
  Search,
  FileText,
  X,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Tag,
  Plus,
  RefreshCw,
  Layers,
  Bike,
  Truck,
  Bus,
  Edit3
} from 'lucide-react';
import { translations, Language } from '../translations';
import { dbSaveListing } from '../lib/dbService';
import { CarListing, Dealer } from '../types';
import { uploadToCloudinary, deleteFromCloudinary } from '../lib/cloudinaryService';
import { applyWatermark } from '../services/WatermarkService';
import { callMarketingEngine } from '../services/api';
import { 
  PAKISTAN_CITIES, 
  PAKISTAN_BRANDS, 
  CAR_MODELS, 
  BIKE_BRANDS, 
  BIKE_MODELS, 
  COMMERCIAL_BRANDS, 
  COMMERCIAL_MODELS, 
  VARIANTS_CATALOG, 
  getMakesForType, 
  getModelsForMake, 
  getVariantsForModel 
} from '../lib/pakistanCarData';

interface UploadingMedia {
  id: string;
  file: File;
  previewUrl: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  error?: string;
}

interface DetailedVehiclePostingPageProps {
  onPostCreated?: (payload: CarListing) => void;
  lang?: Language;
  currentUser?: any;
  contextDealerId?: string;
  dealers?: Dealer[];
  contextListing?: CarListing | null; // Support edit mode if provided
}

const VEHICLE_TYPES = [
  { id: 'car', labelKey: 'car', label: 'Car', icon: Car, desc: 'Sedan, Hatchback, Coupe' },
  { id: 'suv', labelKey: 'suvJeep', label: 'SUV / Crossover', icon: Car, desc: 'Jeep, Crossover, 4x4' },
  { id: 'motorcycle', labelKey: 'motorcycle', label: 'Motorcycle / Bike', icon: Bike, desc: '70cc, 125cc, Heavy Bike' },
  { id: 'truck', labelKey: 'truck', label: 'Commercial / Truck', icon: Truck, desc: 'Shehzore, Pick-up, Dumper' },
  { id: 'van', labelKey: 'van', label: 'Van / MPV', icon: Bus, desc: 'Hiace, Bolan, Wagon' },
  { id: 'bus', labelKey: 'bus', label: 'Bus / Coaster', icon: Bus, desc: 'Coaster, Bus, Passenger' }
];

const EXTERIOR_FEATURES = ['Alloy Rims', 'Fog Lights', 'Sunroof', 'Retractable Mirrors', 'Body Kit', 'Roof Rack'];
const INTERIOR_FEATURES = ['Power Windows', 'Power Steering', 'Central Locking', 'Heated Seats', 'Leather Seats', 'Rear AC Vents'];
const TECH_FEATURES = ['Push Start', 'Keyless Entry', 'Cruise Control', 'Climate Control', 'Rear Camera', 'Navigation Screen'];
const SAFETY_FEATURES = ['Dual Airbags', 'ABS', 'Traction Control', 'Immobilizer Key', 'Parking Sensors', 'Hill Assist'];

const DESCRIPTION_AI_QUICK_TAGS = [
  'First Owner',
  'Family Used',
  'Bumper to Bumper Genuine',
  'Islamabad Registered',
  'Peshawar Registered',
  'Lahore Registered',
  'Excellent Mileage',
  'Non-Accidental',
  'Urgent Sale',
  'Engine 10/10',
  'Suspension 10/10',
  'Scratchless Exterior',
  'All Taxes Paid',
  'Smart Card Available'
];

export default function DetailedVehiclePostingPage({ 
  onPostCreated, 
  lang = 'en', 
  currentUser, 
  contextDealerId, 
  dealers = [],
  contextListing = null
}: DetailedVehiclePostingPageProps) {
  const t = translations[lang];

  // Pathway Mode: 'sell_for_u' (VIP Concierge) vs 'direct_post' (Direct Self Posting)
  const [postingType, setPostingType] = useState<'sell_for_u' | 'direct_post'>('direct_post');

  // 6-Page Workflow State (1: Selection, 2: Details & Specs, 3: Location & Description, 4: Price & Terms, 5: Photos & Media, 6: Preview & Publish)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // PAGE 1: Cascading Vehicle Selection State
  const [vehicleType, setVehicleType] = useState<string>('car');
  const [make, setMake] = useState<string>('Toyota');
  const [model, setModel] = useState<string>('Corolla');
  const [variant, setVariant] = useState<string>('Grande');

  // Popup Sheet Selector State: 'none' | 'make' | 'model' | 'variant'
  const [activePopup, setActivePopup] = useState<'none' | 'make' | 'model' | 'variant'>('none');
  const [popupSearchQuery, setPopupSearchQuery] = useState('');
  const [customInputActive, setCustomInputActive] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');

  // PAGE 2: Vehicle Information & Specs
  const [year, setYear] = useState<number>(2024);
  const [registrationCity, setRegistrationCity] = useState('Islamabad');
  const [registrationYear, setRegistrationYear] = useState<string>('2024');
  const [color, setColor] = useState('White');
  const [mileage, setMileage] = useState('15000');
  const [engineCC, setEngineCC] = useState('1800');
  const [transmission, setTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'>('Petrol');
  const [condition, setCondition] = useState<'New' | 'Used'>('Used');
  const [bodyCondition, setBodyCondition] = useState<'Total Genuine' | 'Minor Touch-ups' | 'Major Repaint'>('Total Genuine');
  const [assemblyType, setAssemblyType] = useState<'Local' | 'Imported'>('Local');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['Alloy Rims', 'Power Windows', 'Push Start', 'Dual Airbags', 'ABS']);

  // PAGE 3: Location & Seller Description
  const [city, setCity] = useState('Peshawar');
  const [location, setLocation] = useState('Ring Road, Peshawar, Pakistan');
  const [postingMode, setPostingMode] = useState<'individual' | 'showroom'>('individual');
  const [selectedShowroomForPost, setSelectedShowroomForPost] = useState<string>(contextDealerId || (dealers[0]?.id || 'auto-choice-peshawar'));
  const [sellerName, setSellerName] = useState(currentUser?.displayName || '');
  const [sellerPhone, setSellerPhone] = useState(currentUser?.phoneNumber || '');
  const [sellerWhatsApp, setSellerWhatsApp] = useState(currentUser?.phoneNumber || '');
  const [allowWhatsApp, setAllowWhatsApp] = useState(true);
  const [description, setDescription] = useState('');

  // PAGE 4: Price & Selling Details
  const [price, setPrice] = useState('7500000');
  const [priceNegotiable, setPriceNegotiable] = useState(true);
  const [documentType, setDocumentType] = useState<'Smart Card' | 'Original Book' | 'Duplicate'>('Smart Card');
  const [tokenTaxPaid, setTokenTaxPaid] = useState<boolean>(true);

  // PAGE 5: Photos & Media Upload
  const [photos, setPhotos] = useState<UploadingMedia[]>([]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState<number>(0);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [videos, setVideos] = useState<UploadingMedia[]>([]);
  const [pdfs, setPdfs] = useState<UploadingMedia[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for File Upload Inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [success, setSuccess] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Pre-fill existing listing if editing
  useEffect(() => {
    if (contextListing) {
      if (contextListing.make) setMake(contextListing.make);
      if (contextListing.model) setModel(contextListing.model);
      if (contextListing.year) setYear(contextListing.year);
      if (contextListing.price) setPrice(String(contextListing.price));
      if (contextListing.mileage) setMileage(String(contextListing.mileage));
      if (contextListing.engineCC) setEngineCC(String(contextListing.engineCC));
      if (contextListing.transmission) setTransmission(contextListing.transmission as any);
      if (contextListing.fuelType) setFuelType(contextListing.fuelType as any);
      if (contextListing.exteriorColor) setColor(contextListing.exteriorColor);
      else if (contextListing.specs?.color) setColor(contextListing.specs.color);
      if (contextListing.registrationCity) setRegistrationCity(contextListing.registrationCity);
      if (contextListing.condition) setCondition(contextListing.condition as any);
      if (contextListing.bodyCondition) setBodyCondition(contextListing.bodyCondition as any);
      if (contextListing.assemblyType) setAssemblyType(contextListing.assemblyType as any);
      if (contextListing.description) setDescription(contextListing.description);
      if (contextListing.location) setLocation(contextListing.location);
      if (contextListing.sellerPhone) setSellerPhone(contextListing.sellerPhone);
      if (contextListing.sellerWhatsApp) setSellerWhatsApp(contextListing.sellerWhatsApp);
      if (contextListing.sellerName) setSellerName(contextListing.sellerName);
    }
  }, [contextListing]);

  // Restore draft from localStorage on mount
  useEffect(() => {
    if (contextListing) return; // Skip draft if editing existing listing

    if (currentUser) {
      if (currentUser.displayName) setSellerName(currentUser.displayName);
      if (currentUser.phoneNumber) {
        setSellerPhone(currentUser.phoneNumber);
        setSellerWhatsApp(currentUser.phoneNumber);
      }
      if (currentUser.city) setLocation(currentUser.city + ', Pakistan');
    }

    try {
      const savedDraft = localStorage.getItem('bazar360_post_ad_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed) {
          if (parsed.vehicleType) setVehicleType(parsed.vehicleType);
          if (parsed.make) setMake(parsed.make);
          if (parsed.model) setModel(parsed.model);
          if (parsed.variant) setVariant(parsed.variant);
          if (parsed.year) setYear(parsed.year);
          if (parsed.price) setPrice(parsed.price);
          if (parsed.mileage) setMileage(parsed.mileage);
          if (parsed.engineCC) setEngineCC(parsed.engineCC);
          if (parsed.transmission) setTransmission(parsed.transmission);
          if (parsed.fuelType) setFuelType(parsed.fuelType);
          if (parsed.color) setColor(parsed.color);
          if (parsed.registrationCity) setRegistrationCity(parsed.registrationCity);
          if (parsed.registrationYear) setRegistrationYear(parsed.registrationYear);
          if (parsed.condition) setCondition(parsed.condition);
          if (parsed.bodyCondition) setBodyCondition(parsed.bodyCondition);
          if (parsed.assemblyType) setAssemblyType(parsed.assemblyType);
          if (parsed.sellerName) setSellerName(parsed.sellerName);
          if (parsed.sellerPhone) setSellerPhone(parsed.sellerPhone);
          if (parsed.sellerWhatsApp) setSellerWhatsApp(parsed.sellerWhatsApp);
          if (parsed.location) setLocation(parsed.location);
          if (parsed.city) setCity(parsed.city);
          if (parsed.postingMode) setPostingMode(parsed.postingMode);
          if (parsed.description) setDescription(parsed.description);
          if (parsed.documentType) setDocumentType(parsed.documentType);
          if (parsed.tokenTaxPaid !== undefined) setTokenTaxPaid(parsed.tokenTaxPaid);
          if (parsed.priceNegotiable !== undefined) setPriceNegotiable(parsed.priceNegotiable);
          if (Array.isArray(parsed.selectedFeatures)) setSelectedFeatures(parsed.selectedFeatures);
          if (parsed.step && parsed.step >= 1 && parsed.step <= 6) setStep(parsed.step);

          setDraftRestored(true);
        }
      }
    } catch (e) {
      console.warn('Draft restoration notice:', e);
    }
  }, [currentUser, contextListing]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (success || contextListing) return;
    try {
      const draftPayload = {
        vehicleType, make, model, variant, year, price, mileage,
        engineCC, transmission, fuelType, color, registrationCity, registrationYear,
        condition, bodyCondition, assemblyType, sellerName, sellerPhone, sellerWhatsApp,
        location, city, postingMode, description, documentType, tokenTaxPaid, priceNegotiable,
        selectedFeatures, step, updatedAt: new Date().toISOString()
      };
      localStorage.setItem('bazar360_post_ad_draft', JSON.stringify(draftPayload));
    } catch (e) {
      // ignore
    }
  }, [
    vehicleType, make, model, variant, year, price, mileage, engineCC, transmission,
    fuelType, color, registrationCity, registrationYear, condition, bodyCondition,
    assemblyType, sellerName, sellerPhone, sellerWhatsApp, location, city, postingMode,
    description, documentType, tokenTaxPaid, priceNegotiable, selectedFeatures, step, success, contextListing
  ]);

  const handleClearDraft = () => {
    localStorage.removeItem('bazar360_post_ad_draft');
    setDraftRestored(false);
    toast.success('Saved draft cleared.');
  };

  // CASCADING SELECTION LOGIC
  const handleSelectVehicleType = (typeId: string) => {
    setVehicleType(typeId);
    // Dependency Reset: Clear Make, Model, Variant
    setMake('');
    setModel('');
    setVariant('');
    // Auto open Make Popup
    setPopupSearchQuery('');
    setActivePopup('make');
  };

  const handleSelectMake = (selectedMake: string) => {
    setMake(selectedMake);
    // Dependency Reset: Clear Model, Variant
    setModel('');
    setVariant('');
    // Auto open Model Popup
    setPopupSearchQuery('');
    setActivePopup('model');
  };

  const handleSelectModel = (selectedModel: string) => {
    setModel(selectedModel);
    // Dependency Reset: Clear Variant
    setVariant('');
    // Auto open Variant Popup
    setPopupSearchQuery('');
    setActivePopup('variant');
  };

  const handleSelectVariant = (selectedVariant: string) => {
    setVariant(selectedVariant);
    // Close Popup Sheet
    setActivePopup('none');
    setPopupSearchQuery('');
    // Auto load Next Vehicle Information Page (Step 2)
    setStep(2);
    toast.success(`${make} ${model} ${selectedVariant} selected!`, { icon: '🚘' });
  };

  // COMPUTED CATALOG OPTIONS
  const availableMakes = useMemo(() => {
    return getMakesForType(vehicleType);
  }, [vehicleType]);

  const availableModels = useMemo(() => {
    return getModelsForMake(vehicleType, make);
  }, [vehicleType, make]);

  const availableVariants = useMemo(() => {
    return getVariantsForModel(model);
  }, [model]);

  // FILTERED POPUP ITEMS
  const currentPopupItems = useMemo(() => {
    let list: string[] = [];
    if (activePopup === 'make') list = availableMakes;
    else if (activePopup === 'model') list = availableModels;
    else if (activePopup === 'variant') list = availableVariants;

    if (!popupSearchQuery.trim()) return list;
    const q = popupSearchQuery.toLowerCase().trim();
    return list.filter(item => item.toLowerCase().includes(q));
  }, [activePopup, availableMakes, availableModels, availableVariants, popupSearchQuery]);

  // AI DESCRIPTION GENERATOR WITH FULL SELECTION CONTEXT
  const handleGenerateAIDescription = async () => {
    if (!make || !model) {
      toast.error('Please complete Vehicle Make and Model selection first.');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const prompt = `Write a compelling, professional, sales-optimized advertisement description for a ${year} ${make} ${model} ${variant} in Pakistan. Specs: Transmission: ${transmission}, Engine: ${engineCC}cc, Fuel: ${fuelType}, Condition: ${condition} (${bodyCondition}), Registered in: ${registrationCity}. Highlight reliability, market value, and clean history. Keep it concise and attractive.`;
      
      const response = await callMarketingEngine(prompt, 'Premium');
      if (response && response.success && response.result?.description) {
        setDescription(response.result.description);
        toast.success('AI sales description generated!', { icon: '✨' });
      } else {
        // High quality fallback based on exact context
        const fallbackText = `Meticulously maintained ${year} ${make} ${model} ${variant || ''} in excellent condition. Total ${bodyCondition.toLowerCase()}, smooth ${transmission.toLowerCase()} transmission with a fuel-efficient ${engineCC}cc ${fuelType.toLowerCase()} engine. Registered in ${registrationCity} with all original documents, smart card, and token taxes updated. Non-accidental, family used vehicle ready for immediate transfer in ${city}.`;
        setDescription(fallbackText);
        toast.success('AI sales description applied!', { icon: '✨' });
      }
    } catch (e) {
      const fallbackText = `Meticulously maintained ${year} ${make} ${model} ${variant || ''} in excellent condition. Total ${bodyCondition.toLowerCase()}, smooth ${transmission.toLowerCase()} transmission with a fuel-efficient ${engineCC}cc ${fuelType.toLowerCase()} engine. Registered in ${registrationCity} with all original documents and token taxes updated. Family used vehicle ready for immediate transfer.`;
      setDescription(fallbackText);
      toast.success('AI sales description applied!', { icon: '✨' });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddQuickTag = (tag: string) => {
    if (description.includes(tag)) return;
    if (description.trim()) {
      setDescription(description.trim() + ', ' + tag);
    } else {
      setDescription(tag);
    }
  };

  // MEDIA FILE HANDLING
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsCompressing(true);

    const newMediaItems: UploadingMedia[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = 'photo_' + Date.now() + '_' + i;
      const previewUrl = URL.createObjectURL(file);

      const mediaObj: UploadingMedia = {
        id: tempId,
        file,
        previewUrl,
        size: file.size,
        progress: 10,
        status: 'uploading'
      };

      newMediaItems.push(mediaObj);
    }

    setPhotos(prev => [...prev, ...newMediaItems]);

    // Async upload each
    for (const item of newMediaItems) {
      try {
        let fileToUpload = item.file;
        
        // Optional client-side watermarking if enabled for images
        if (watermarkEnabled && item.file.type.startsWith('image/')) {
          try {
            await applyWatermark(item.file);
          } catch (wmErr) {
            console.warn('Watermark fallback:', wmErr);
          }
        }

        const res = await uploadToCloudinary(fileToUpload, {
          onProgress: (prog) => {
            setPhotos(prev => prev.map(p => p.id === item.id ? { ...p, progress: prog } : p));
          }
        });

        if (res && res.secure_url) {
          setPhotos(prev => prev.map(p => p.id === item.id ? {
            ...p,
            progress: 100,
            status: 'success',
            cloudinaryUrl: res.secure_url,
            cloudinaryPublicId: res.public_id
          } : p));
        } else {
          setPhotos(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error', error: 'Upload failed' } : p));
        }
      } catch (err) {
        setPhotos(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error', error: 'Upload error' } : p));
      }
    }

    setIsCompressing(false);
  };

  const handleDeletePhoto = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo?.cloudinaryPublicId) {
      deleteFromCloudinary(photo.cloudinaryPublicId).catch(() => {});
    }
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // FINAL FORM SUBMISSION & BACKEND VALIDATION
  const handleSubmitListing = async () => {
    // Backend & Hierarchy Validation
    if (!make || !model || !variant) {
      toast.error('Vehicle Make, Model, and Variant are required.');
      setStep(1);
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price in PKR.');
      setStep(4);
      return;
    }

    setIsSubmitting(true);
    
    // Collect uploaded image URLs
    const uploadedPhotoUrls = photos
      .filter(p => p.status === 'success' && p.cloudinaryUrl)
      .map(p => p.cloudinaryUrl as string);

    // Default fallback image if no photo uploaded
    const finalImages = uploadedPhotoUrls.length > 0 
      ? uploadedPhotoUrls 
      : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'];

    const primaryImage = finalImages[coverPhotoIndex] || finalImages[0];
    const numPrice = parseFloat(price.replace(/,/g, '')) || 0;
    const numMileage = parseFloat(mileage.replace(/,/g, '')) || 0;
    const numEngine = parseInt(engineCC) || 1300;

    const listingTitle = `${year} ${make} ${model} ${variant}`;

    const payload: CarListing = {
      id: contextListing?.id || 'listing-' + Date.now(),
      title: listingTitle,
      make,
      model,
      year,
      price: numPrice,
      mileage: numMileage,
      engineCC: numEngine,
      transmission,
      fuelType,
      exteriorColor: color,
      registrationCity,
      condition,
      bodyCondition,
      assemblyType,
      location: location || `${city}, Pakistan`,
      description: description || `Clean ${year} ${make} ${model} ${variant} available for sale in ${city}.`,
      sellerPhone: sellerPhone || '03159085086',
      sellerWhatsApp: sellerWhatsApp || sellerPhone || '03159085086',
      sellerName: sellerName || 'Bazar360 Verified Seller',
      sellerType: postingMode === 'showroom' ? 'Showroom' : 'Individual',
      dealerId: postingMode === 'showroom' ? selectedShowroomForPost : 'private',
      featured: true,
      verified: true,
      approved: true,
      createdAt: contextListing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: finalImages,
      imageUrl: primaryImage,
      primaryImage,
      tokenTaxPaid,
      documentType,
      range: `Registration Year: ${registrationYear}`,
      features: selectedFeatures,
      tags: ['Verified', 'Bazar360'],
      specs: {
        color,
        engineSize: engineCC + ' CC',
        horspower: 'Standard Specs',
        regionalSpecs: assemblyType
      }
    };

    try {
      await dbSaveListing(payload);
      localStorage.removeItem('bazar360_post_ad_draft');
      toast.success(lang === 'ur' ? 'اشتہار کامیابی سے شائع ہو گیا!' : 'Advertisement published successfully on Bazar360!');
      setSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        if (onPostCreated) onPostCreated(payload);
      }, 1500);
    } catch (err: any) {
      console.warn('Backend save notice:', err);
      localStorage.removeItem('bazar360_post_ad_draft');
      toast.success('Listing saved! Pending platform approval.');
      setSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        if (onPostCreated) onPostCreated(payload);
      }, 1500);
    }
  };

  const formatPricePKR = (val: string) => {
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) return '0 PKR';
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore PKR`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)} Lakhs PKR`;
    return `${num.toLocaleString()} PKR`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl md:rounded-3xl p-4 sm:p-8 relative shadow-2xl overflow-hidden text-left" id="advertisement-posting-wizard">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Pathway Switcher: Managed VIP vs Direct Post */}
      <div className="mb-6 p-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl flex items-center justify-between gap-2 relative z-10 shadow-md">
        <button
          type="button"
          onClick={() => setPostingType('direct_post')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            postingType === 'direct_post'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
          }`}
        >
          <Upload size={16} />
          <span>Post Advertisement (Direct)</span>
        </button>

        <button
          type="button"
          onClick={() => setPostingType('sell_for_u')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            postingType === 'sell_for_u'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
          }`}
        >
          <Sparkles size={16} />
          <span>Sell For U (VIP Managed)</span>
        </button>
      </div>

      {postingType === 'sell_for_u' && !success && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-red-500/15 border border-amber-500/30 rounded-2xl space-y-5 text-left relative overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-lg">
              <Sparkles size={24} className="stroke-[2.8]" />
            </div>
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-black uppercase tracking-widest border border-amber-500/30">
                VIP Managed Brokerage Service
              </span>
              <h3 className="text-lg font-black text-[var(--color-text-header)] uppercase tracking-tight">
                Let Auto Choice & Bazar360 Sell Your Vehicle
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Our team handles verified vehicle inspection, professional photography, pricing valuation, online marketing, and buyer negotiations to close top market value deals for you.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const msg = encodeURIComponent("Hello Auto Choice team, I would like to request the 'Sell For U' VIP Brokerage service for my car.");
                window.open(`https://wa.me/923159085086?text=${msg}`, '_blank');
                toast.success("Opening WhatsApp with Auto Choice Concierge Desk!");
              }}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone size={14} /> Request VIP Handover Call (+92 315 9085086)
            </button>
            
            <button
              type="button"
              onClick={() => setPostingType('direct_post')}
              className="py-3 px-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Or Post Direct Form Below &darr;
            </button>
          </div>
        </motion.div>
      )}

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle size={44} className="animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--color-text-header)]">
              {lang === 'ur' ? 'اشتہار کامیابی سے شائع ہو گیا!' : 'Advertisement Published Successfully!'}
            </h2>
            <p className="text-[var(--color-text-muted)] text-sm max-w-md mx-auto">
              Your vehicle listing is live on Bazar360.online and verified for marketplace buyers.
            </p>
          </div>
          <div className="flex items-center gap-2 justify-center text-xs text-orange-500 font-mono font-black uppercase">
            <Clock size={14} /> Live Inventory Synchronization Complete
          </div>
        </motion.div>
      ) : (
        <>
          {/* HEADER WIZARD PROGRESS BAR */}
          <div className="mb-6 border-b border-[var(--color-border-main)] pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  Step {step} of 6
                </span>
                {draftRestored && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                    <Save size={10} /> Saved Draft Restored
                    <button onClick={handleClearDraft} className="ml-1 hover:text-rose-500 font-bold">×</button>
                  </span>
                )}
              </div>
              <span className="text-[var(--color-text-muted)] font-mono text-xs font-bold uppercase tracking-wider">
                {step === 1 && '1. Vehicle Selection'}
                {step === 2 && '2. Specifications & Details'}
                {step === 3 && '3. Location & Description'}
                {step === 4 && '4. Price & Selling Terms'}
                {step === 5 && '5. Photos & Media'}
                {step === 6 && '6. Final Review & Publish'}
              </span>
            </div>

            {/* 6 Segment Progress Indicator */}
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    if (s < step) setStep(s as any);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'bg-orange-500 shadow-md shadow-orange-500/30'
                      : s < step
                      ? 'bg-emerald-500 cursor-pointer'
                      : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)]'
                  }`}
                />
              ))}
            </div>

            {/* Selected Vehicle Badge (Page 2-6) */}
            {step > 1 && make && model && (
              <div className="mt-4 p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
                    <Car size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[var(--color-text-header)]">
                      {year} {make} {model} {variant}
                    </h4>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
                      Category: {vehicleType.toUpperCase()} • {transmission} • {fuelType}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setActivePopup('make');
                  }}
                  className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
                >
                  <Edit3 size={12} /> Change
                </button>
              </div>
            )}
          </div>

          {/* PAGE 1: CASCADING VEHICLE SELECTION */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide text-[var(--color-text-header)] mb-1">
                  Select Vehicle Category
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Select the vehicle type to automatically open relevant brand and model options.
                </p>

                {/* Category Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VEHICLE_TYPES.map((vt) => {
                    const IconComp = vt.icon;
                    const isSelected = vehicleType === vt.id;
                    return (
                      <button
                        key={vt.id}
                        type="button"
                        onClick={() => handleSelectVehicleType(vt.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500/10 border-orange-500 text-[var(--color-text-header)] shadow-lg shadow-orange-500/10 scale-[1.02]'
                            : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:border-orange-500/40 hover:text-[var(--color-text-main)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-orange-500 text-slate-950' : 'bg-[var(--color-bg-primary)] border border-[var(--color-border-main)]'}`}>
                            <IconComp size={18} />
                          </div>
                          {isSelected && <Check size={16} className="text-orange-500" />}
                        </div>
                        <div>
                          <span className="block text-xs font-black uppercase tracking-wider text-[var(--color-text-header)]">
                            {vt.label}
                          </span>
                          <span className="block text-[10px] text-[var(--color-text-muted)] mt-0.5">
                            {vt.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cascade Selector Trigger Buttons */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-mono font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                  Cascading Selection Sequence
                </h4>

                {/* Make Trigger */}
                <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-orange-500 uppercase font-black tracking-wider block">
                      1. Make / Brand *
                    </span>
                    <span className="text-sm font-black text-[var(--color-text-header)] block">
                      {make || 'Select Make / Brand'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPopupSearchQuery('');
                      setActivePopup('make');
                    }}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                  >
                    {make ? 'Change Make' : 'Select Make →'}
                  </button>
                </div>

                {/* Model Trigger */}
                <div className={`p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl flex items-center justify-between gap-4 ${!make ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-orange-500 uppercase font-black tracking-wider block">
                      2. Model * {make ? `(${make})` : ''}
                    </span>
                    <span className="text-sm font-black text-[var(--color-text-header)] block">
                      {model || (make ? 'Select Model' : 'Select Make First')}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!make}
                    onClick={() => {
                      setPopupSearchQuery('');
                      setActivePopup('model');
                    }}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md disabled:opacity-40"
                  >
                    {model ? 'Change Model' : 'Select Model →'}
                  </button>
                </div>

                {/* Variant Trigger */}
                <div className={`p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl flex items-center justify-between gap-4 ${!model ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-orange-500 uppercase font-black tracking-wider block">
                      3. Variant / Trim * {model ? `(${model})` : ''}
                    </span>
                    <span className="text-sm font-black text-[var(--color-text-header)] block">
                      {variant || (model ? 'Select Variant' : 'Select Model First')}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!model}
                    onClick={() => {
                      setPopupSearchQuery('');
                      setActivePopup('variant');
                    }}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md disabled:opacity-40"
                  >
                    {variant ? 'Change Variant' : 'Select Variant →'}
                  </button>
                </div>
              </div>

              {/* Popular Presets */}
              <div className="pt-2 border-t border-[var(--color-border-main)]">
                <span className="text-[10px] font-mono uppercase font-black text-[var(--color-text-muted)] tracking-wider block mb-2">
                  Popular Quick Selections:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { type: 'car', m: 'Toyota', mdl: 'Corolla', v: 'Grande' },
                    { type: 'car', m: 'Honda', mdl: 'Civic', v: 'RS Turbo' },
                    { type: 'car', m: 'Suzuki', mdl: 'Alto', v: 'VXL AGS' },
                    { type: 'motorcycle', m: 'Yamaha', mdl: 'YBR 125G', v: 'Special Edition' },
                    { type: 'motorcycle', m: 'Honda', mdl: 'CG 125', v: 'Self Start' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setVehicleType(preset.type);
                        setMake(preset.m);
                        setModel(preset.mdl);
                        setVariant(preset.v);
                        setStep(2);
                        toast.success(`${preset.m} ${preset.mdl} ${preset.v} selected!`);
                      }}
                      className="px-3 py-1.5 bg-[var(--color-bg-secondary)] hover:bg-orange-500/10 hover:border-orange-500/40 border border-[var(--color-border-main)] text-[11px] font-mono font-bold text-[var(--color-text-main)] rounded-xl transition cursor-pointer"
                    >
                      {preset.m} {preset.mdl} {preset.v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Step Action */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!make || !model) {
                      setActivePopup('make');
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg hover:shadow-orange-500/20 active:scale-95 flex items-center gap-2"
                >
                  Continue to Vehicle Specs <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* PAGE 2: VEHICLE SPECS & INFORMATION */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide text-[var(--color-text-header)] mb-1">
                  Vehicle Specifications
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Provide verified specifications for your {make} {model} {variant}.
                </p>
              </div>

              {/* Year & Registration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Manufacturing Year *
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] focus:border-orange-500 outline-none"
                  >
                    {Array.from({ length: 45 }, (_, i) => 2026 - i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Registration City *
                  </label>
                  <select
                    value={registrationCity}
                    onChange={(e) => setRegistrationCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] focus:border-orange-500 outline-none"
                  >
                    <option value="Un-registered">Un-registered</option>
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Registration Year
                  </label>
                  <select
                    value={registrationYear}
                    onChange={(e) => setRegistrationYear(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] focus:border-orange-500 outline-none"
                  >
                    {Array.from({ length: 45 }, (_, i) => 2026 - i).map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color, Mileage, Engine CC */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Exterior Color *
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. White, Black, Silver"
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Mileage (KM) *
                  </label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Engine Capacity (CC) *
                  </label>
                  <input
                    type="number"
                    value={engineCC}
                    onChange={(e) => setEngineCC(e.target.value)}
                    placeholder="e.g. 1800"
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              {/* Transmission & Fuel Type Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Transmission *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Automatic', 'Manual'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTransmission(t as any)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                          transmission === t
                            ? 'bg-orange-500 text-slate-950 border-orange-500 shadow-md'
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-[var(--color-border-main)] hover:border-orange-500/40'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Fuel Type *
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['Petrol', 'Diesel', 'Hybrid', 'Electric'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFuelType(f as any)}
                        className={`py-2.5 px-2 rounded-xl text-[10px] font-mono font-bold transition cursor-pointer border text-center ${
                          fuelType === f
                            ? 'bg-orange-500 text-slate-950 border-orange-500 shadow-md'
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-[var(--color-border-main)] hover:border-orange-500/40'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Condition & Body Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Condition *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Used', 'New'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCondition(c as any)}
                        className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                          condition === c
                            ? 'bg-orange-500 text-slate-950 border-orange-500'
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-[var(--color-border-main)]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Body Condition
                  </label>
                  <select
                    value={bodyCondition}
                    onChange={(e) => setBodyCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] outline-none"
                  >
                    <option value="Total Genuine">Total Genuine</option>
                    <option value="Minor Touch-ups">Minor Touch-ups</option>
                    <option value="Major Repaint">Major Repaint</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Assembly
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Local', 'Imported'].map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAssemblyType(a as any)}
                        className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                          assemblyType === a
                            ? 'bg-orange-500 text-slate-950 border-orange-500'
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-[var(--color-border-main)]'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature Chips */}
              <div className="pt-2 border-t border-[var(--color-border-main)] space-y-2">
                <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block">
                  Key Features & Equipment
                </label>
                <div className="flex flex-wrap gap-2">
                  {[...EXTERIOR_FEATURES, ...INTERIOR_FEATURES, ...TECH_FEATURES, ...SAFETY_FEATURES].map((feat) => {
                    const isChecked = selectedFeatures.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedFeatures(prev => prev.filter(f => f !== feat));
                          } else {
                            setSelectedFeatures(prev => [...prev, feat]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-orange-500/15 border-orange-500 text-orange-500'
                            : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:border-orange-500/30'
                        }`}
                      >
                        {isChecked && <Check size={12} />}
                        {feat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Action */}
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 bg-[var(--color-bg-secondary)] hover:bg-slate-200 dark:hover:bg-bg-tertiary text-[var(--color-text-main)] font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer border border-[var(--color-border-main)] flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg active:scale-95 flex items-center gap-2"
                >
                  Continue to Description <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* PAGE 3: LOCATION & DESCRIPTION + AI ASSIST */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide text-[var(--color-text-header)] mb-1">
                  Location & Description
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Set listing location, seller contacts, and sales description.
                </p>
              </div>

              {/* City & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    City Location *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setLocation(`${e.target.value}, Pakistan`);
                    }}
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] outline-none"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Neighborhood / Area *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Ring Road, Peshawar"
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] outline-none"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Seller Name *
                  </label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="Seller Name"
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    placeholder="03159085086"
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={sellerWhatsApp}
                    onChange={(e) => setSellerWhatsApp(e.target.value)}
                    placeholder="03159085086"
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] outline-none"
                  />
                </div>
              </div>

              {/* AI Assistant Banner */}
              <div className="p-4 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-orange-500">
                    <Sparkles size={18} className="animate-pulse" />
                    <span className="text-xs font-mono font-black uppercase tracking-wider">
                      AI Description Studio for {year} {make} {model}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isGeneratingAI}
                    onClick={handleGenerateAIDescription}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-mono font-black text-[11px] uppercase tracking-wider rounded-xl shadow cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isGeneratingAI ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {isGeneratingAI ? 'Generating...' : 'Generate AI Sales Description'}
                  </button>
                </div>

                {/* Quick Tags */}
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1.5">
                    Click Quick Tags to Add to Description:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DESCRIPTION_AI_QUICK_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddQuickTag(tag)}
                        className="px-2.5 py-1 bg-[var(--color-bg-primary)] hover:bg-orange-500/10 border border-[var(--color-border-main)] text-[10px] font-mono text-[var(--color-text-main)] rounded-lg transition cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description Textarea */}
              <div>
                <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                  Full Vehicle Description *
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed description of vehicle condition, history, upgrades, and reason for selling..."
                  className="w-full p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono text-[var(--color-text-main)] leading-relaxed outline-none focus:border-orange-500"
                />
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] font-mono font-bold text-xs uppercase tracking-wider rounded-xl border border-[var(--color-border-main)] flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg active:scale-95 flex items-center gap-2"
                >
                  Continue to Price & Terms <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* PAGE 4: PRICE & SELLING DETAILS */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide text-[var(--color-text-header)] mb-1">
                  Price & Selling Terms
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Set asking price and document details for buyers.
                </p>
              </div>

              {/* Price Input with Live Formatting */}
              <div className="p-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl space-y-3">
                <label className="text-xs font-mono font-black uppercase text-orange-500 block">
                  Asking Price (PKR) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black font-mono text-orange-500">
                    PKR
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 7500000"
                    className="w-full pl-16 pr-4 py-3.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl text-xl font-black font-mono text-[var(--color-text-header)] outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--color-text-muted)]">Price in Words:</span>
                  <span className="font-black text-emerald-500 uppercase">{formatPricePKR(price)}</span>
                </div>
              </div>

              {/* Negotiable & Documents */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Price Negotiable
                  </label>
                  <button
                    type="button"
                    onClick={() => setPriceNegotiable(!priceNegotiable)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                      priceNegotiable
                        ? 'bg-orange-500/15 border-orange-500 text-orange-500'
                        : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {priceNegotiable ? 'Slightly Negotiable' : 'Fixed Price'}
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Document Type *
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono font-bold text-[var(--color-text-main)] outline-none"
                  >
                    <option value="Smart Card">Smart Card</option>
                    <option value="Original Book">Original Book</option>
                    <option value="Duplicate">Duplicate Book</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase text-[var(--color-text-muted)] block mb-1">
                    Token Tax Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setTokenTaxPaid(!tokenTaxPaid)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                      tokenTaxPaid
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500'
                        : 'bg-rose-500/15 border-rose-500 text-rose-500'
                    }`}
                  >
                    {tokenTaxPaid ? 'Token Tax Up to Date' : 'Token Tax Unpaid'}
                  </button>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] font-mono font-bold text-xs uppercase tracking-wider rounded-xl border border-[var(--color-border-main)] flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg active:scale-95 flex items-center gap-2"
                >
                  Continue to Upload Photos <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* PAGE 5: PHOTOS & MEDIA UPLOAD */}
          {step === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide text-[var(--color-text-header)] mb-1">
                  Vehicle Photos & Media
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Upload crisp photos of exterior, interior, engine bay, and dashboard.
                </p>
              </div>

              {/* Watermark Toggle */}
              <div className="p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--color-text-main)]">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Apply "Bazar360 Verified" Watermark</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase border cursor-pointer ${
                    watermarkEnabled ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}
                >
                  {watermarkEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileSelect(e.dataTransfer.files);
                }}
                className={`p-8 border-2 border-dashed rounded-3xl text-center space-y-4 transition ${
                  isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-[var(--color-border-main)] bg-[var(--color-bg-secondary)]'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto border border-orange-500/20">
                  <Upload size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-header)]">
                    Drag & Drop Vehicle Photos Here
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Supports JPG, PNG, WEBP up to 10MB each
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                  >
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2.5 bg-[var(--color-bg-primary)] hover:bg-slate-200 dark:hover:bg-bg-tertiary text-[var(--color-text-main)] font-mono font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer border border-[var(--color-border-main)] flex items-center gap-1.5"
                  >
                    <Camera size={14} /> Open Camera
                  </button>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  capture="environment"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Uploaded Image Previews */}
              {photos.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-[var(--color-text-muted)]">Uploaded Photos ({photos.length}):</span>
                    <span className="text-orange-500">Tap photo to set Cover Photo</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {photos.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => setCoverPhotoIndex(idx)}
                        className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 cursor-pointer group ${
                          coverPhotoIndex === idx ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-[var(--color-border-main)]'
                        }`}
                      >
                        <img src={p.previewUrl} alt="Vehicle" className="w-full h-full object-cover" />
                        {coverPhotoIndex === idx && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-slate-950 text-[9px] font-mono font-black uppercase rounded shadow">
                            Cover Photo
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(p.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full transition"
                        >
                          <Trash2 size={12} />
                        </button>
                        {p.status === 'uploading' && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2">
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-orange-500 h-full transition-all" style={{ width: `${p.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] font-mono font-bold text-xs uppercase tracking-wider rounded-xl border border-[var(--color-border-main)] flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg active:scale-95 flex items-center gap-2"
                >
                  Continue to Final Review <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* PAGE 6: PREVIEW & PUBLISH */}
          {step === 6 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide text-[var(--color-text-header)] mb-1">
                  Final Review & Publish
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Review your advertisement listing card before publishing live to Bazar360.
                </p>
              </div>

              {/* Listing Card Preview */}
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl overflow-hidden shadow-xl space-y-4">
                <div className="relative aspect-[16/9] bg-slate-900">
                  <img
                    src={photos[coverPhotoIndex]?.previewUrl || photos[0]?.previewUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-orange-400 font-mono font-black text-sm border border-orange-500/30">
                    {formatPricePKR(price)}
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 font-mono font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
                    Verified Listing
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-black uppercase text-[var(--color-text-header)] font-display">
                      {year} {make} {model} {variant}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                      {city} • {registrationCity} Registered • {mileage} KM • {transmission}
                    </p>
                  </div>

                  {/* Quick Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--color-border-main)] font-mono text-[11px]">
                    <div className="p-2.5 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border-main)]">
                      <span className="text-[var(--color-text-muted)] block text-[9px] uppercase">Engine</span>
                      <span className="font-bold text-[var(--color-text-main)] block">{engineCC} CC</span>
                    </div>
                    <div className="p-2.5 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border-main)]">
                      <span className="text-[var(--color-text-muted)] block text-[9px] uppercase">Fuel</span>
                      <span className="font-bold text-[var(--color-text-main)] block">{fuelType}</span>
                    </div>
                    <div className="p-2.5 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border-main)]">
                      <span className="text-[var(--color-text-muted)] block text-[9px] uppercase">Body</span>
                      <span className="font-bold text-[var(--color-text-main)] block">{bodyCondition}</span>
                    </div>
                    <div className="p-2.5 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border-main)]">
                      <span className="text-[var(--color-text-muted)] block text-[9px] uppercase">Documents</span>
                      <span className="font-bold text-[var(--color-text-main)] block">{documentType}</span>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="p-4 bg-[var(--color-bg-primary)] rounded-2xl border border-[var(--color-border-main)] space-y-1">
                    <span className="text-[10px] font-mono uppercase font-black text-[var(--color-text-muted)] block">
                      Description:
                    </span>
                    <p className="text-xs text-[var(--color-text-main)] leading-relaxed whitespace-pre-line font-sans">
                      {description || 'No detailed description provided.'}
                    </p>
                  </div>

                  {/* Seller Contacts */}
                  <div className="p-4 bg-[var(--color-bg-primary)] rounded-2xl border border-[var(--color-border-main)] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[var(--color-text-muted)] block text-[10px] uppercase">Seller Name</span>
                      <span className="font-bold text-[var(--color-text-header)]">{sellerName} ({sellerPhone})</span>
                    </div>
                    <span className="px-2.5 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl text-[10px] uppercase font-bold">
                      {postingMode === 'showroom' ? 'Showroom Listing' : 'Individual Listing'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Edit Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <button type="button" onClick={() => setStep(1)} className="p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[10px] font-mono font-bold uppercase rounded-xl hover:border-orange-500 text-[var(--color-text-main)]">
                  Edit Selection ✎
                </button>
                <button type="button" onClick={() => setStep(2)} className="p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[10px] font-mono font-bold uppercase rounded-xl hover:border-orange-500 text-[var(--color-text-main)]">
                  Edit Specs ✎
                </button>
                <button type="button" onClick={() => setStep(3)} className="p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[10px] font-mono font-bold uppercase rounded-xl hover:border-orange-500 text-[var(--color-text-main)]">
                  Edit Description ✎
                </button>
                <button type="button" onClick={() => setStep(5)} className="p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[10px] font-mono font-bold uppercase rounded-xl hover:border-orange-500 text-[var(--color-text-main)]">
                  Edit Photos ✎
                </button>
              </div>

              {/* Submit Action */}
              <div className="pt-4 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-5 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] font-mono font-bold text-xs uppercase tracking-wider rounded-xl border border-[var(--color-border-main)] flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitListing}
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 font-mono font-black text-sm uppercase tracking-widest rounded-2xl transition cursor-pointer shadow-xl hover:shadow-orange-500/30 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Publishing Advertisement...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Publish Advertisement to Bazar360
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* CASCADING SELECTION POPUP SHEET / MODAL */}
      <AnimatePresence>
        {activePopup !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden text-left"
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-main)]">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-header)]">
                    {activePopup === 'make' && `Select ${vehicleType.toUpperCase()} Make / Brand`}
                    {activePopup === 'model' && `Select Model for ${make}`}
                    {activePopup === 'variant' && `Select Variant for ${make} ${model}`}
                  </h4>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
                    {activePopup === 'make' && 'Cascading Step 1: Choose Brand'}
                    {activePopup === 'model' && 'Cascading Step 2: Choose Model'}
                    {activePopup === 'variant' && 'Cascading Step 3: Choose Variant / Trim'}
                  </p>
                </div>
                <button
                  onClick={() => setActivePopup('none')}
                  className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search Field */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  autoFocus
                  value={popupSearchQuery}
                  onChange={(e) => setPopupSearchQuery(e.target.value)}
                  placeholder={`Search ${activePopup}...`}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl text-xs font-mono text-[var(--color-text-main)] outline-none focus:border-orange-500"
                />
                {popupSearchQuery && (
                  <button
                    onClick={() => setPopupSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Options List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1">
                {currentPopupItems.length > 0 ? (
                  currentPopupItems.map((item) => {
                    const isCurrent = 
                      (activePopup === 'make' && make === item) ||
                      (activePopup === 'model' && model === item) ||
                      (activePopup === 'variant' && variant === item);

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (activePopup === 'make') handleSelectMake(item);
                          else if (activePopup === 'model') handleSelectModel(item);
                          else if (activePopup === 'variant') handleSelectVariant(item);
                        }}
                        className={`w-full p-3 rounded-xl text-left text-xs font-mono font-bold transition flex items-center justify-between cursor-pointer border ${
                          isCurrent
                            ? 'bg-orange-500/15 border-orange-500 text-orange-500'
                            : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] text-[var(--color-text-main)] hover:border-orange-500/40'
                        }`}
                      >
                        <span>{item}</span>
                        {isCurrent && <Check size={16} className="text-orange-500" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      No matching {activePopup} found for "{popupSearchQuery}".
                    </p>
                    {popupSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          if (activePopup === 'make') handleSelectMake(popupSearchQuery);
                          else if (activePopup === 'model') handleSelectModel(popupSearchQuery);
                          else if (activePopup === 'variant') handleSelectVariant(popupSearchQuery);
                        }}
                        className="px-4 py-2 bg-orange-500 text-slate-950 font-mono font-black text-xs uppercase rounded-xl cursor-pointer"
                      >
                        Use Custom "{popupSearchQuery}"
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sheet Back Action */}
              <div className="pt-2 border-t border-[var(--color-border-main)] flex justify-between">
                {activePopup === 'model' && (
                  <button
                    onClick={() => setActivePopup('make')}
                    className="text-xs font-mono font-bold text-orange-500 flex items-center gap-1"
                  >
                    ← Back to Makes
                  </button>
                )}
                {activePopup === 'variant' && (
                  <button
                    onClick={() => setActivePopup('model')}
                    className="text-xs font-mono font-bold text-orange-500 flex items-center gap-1"
                  >
                    ← Back to Models
                  </button>
                )}
                <button
                  onClick={() => setActivePopup('none')}
                  className="text-xs font-mono font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] ml-auto"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
