import React, { useState } from 'react';
import { Sparkles, HelpCircle, Save, Sliders, ArrowRight, Clipboard, ChevronRight, Car, DollarSign } from 'lucide-react';
import { CarListing, GeneratedSEOListing } from '../types';
import { callMarketingEngine } from '../services/api';

interface SellWithAIViewProps {
  onAddListing: (listing: CarListing) => void;
  setTab: (tab: string) => void;
  currentUser: any;
}

const CAR_STOCK_IMAGE_CHOICES = [
  {
    name: 'Porsche 911 chalk grey',
    url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Porsche 911 GT3 RS grey',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'BMW M4 Competition white',
    url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Mercedes G63 AMG black',
    url: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&q=80&w=600',
  }
];

export function formatPKRCurrency(amount: number): string {
  if (isNaN(amount) || amount <= 0) return 'Rs. 0';
  if (amount >= 10000000) {
    return `Rs. ${(amount / 10000000).toFixed(2)} Crore`;
  } else if (amount >= 100000) {
    return `Rs. ${(amount / 100000).toFixed(2)} Lac`;
  }
  return `Rs. ${amount.toLocaleString()}`;
}

export default function SellWithAIView({ onAddListing, setTab, currentUser }: SellWithAIViewProps) {
  const [sellMode, setSellMode] = useState<'self' | 'bargain'>('self');
  const [postMethod, setPostMethod] = useState<'wizard' | 'ai'>('wizard');

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#121c32] border border-[#38BDF8]/20 flex items-center justify-center mx-auto shadow-lg text-[#38BDF8]">
          <Car size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-sans font-extrabold text-white tracking-tight uppercase">
            Sign In to Publish Ad
          </h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            In order to list vehicles on Pakistan's #1 digital marketplace and prevent duplicate or unverified classifieds, BAZAR360 requires a secure, validated login session.
          </p>
        </div>
        <button
          onClick={() => setTab('portal')}
          className="inline-flex bg-[#F97316] hover:bg-orange-600 border border-white/5 text-white font-bold py-3 pr-6 pl-6 rounded-xl text-xs uppercase font-mono tracking-wider active:scale-97 transition-all duration-75 shadow-lg shadow-orange-950/20 cursor-pointer animate-pulse"
        >
          AUTHENTICATE NOW &rarr;
        </button>
      </div>
    );
  }

  // ==== 3-STAGE INTERACTIVE WIZARD STATES ====
  const [activeStep, setActiveStep] = useState<number>(1);
  const [wizMake, setWizMake] = useState<string>('');
  const [wizModel, setWizModel] = useState<string>('');
  const [wizYear, setWizYear] = useState<number>(2024);
  const [wizCondition, setWizCondition] = useState<'New' | 'Used'>('Used');
  const [wizAssembly, setWizAssembly] = useState<'Local' | 'Imported'>('Imported');
  
  const [wizEngineCC, setWizEngineCC] = useState<number>(1500);
  const [wizTransmission, setWizTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [wizFuelType, setWizFuelType] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'>('Petrol');
  const [wizColor, setWizColor] = useState<string>('White');
  const [wizMileage, setWizMileage] = useState<number>(20000);
  const [wizBodyCondition, setWizBodyCondition] = useState<'Total Genuine' | 'Minor Touch-ups' | 'Major Repaint'>('Total Genuine');
  const [wizDentPaintDesc, setWizDentPaintDesc] = useState<string>('No scratches, sleek mint condition.');

  const [wizPrice, setWizPrice] = useState<number>(4500000);
  const [wizRegCity, setWizRegCity] = useState<string>('Lahore');
  const [wizTokenTaxStatus, setWizTokenTaxStatus] = useState<'Paid' | 'Outstanding'>('Paid');
  const [wizDocType, setWizDocType] = useState<'Smart Card' | 'Original Book' | 'Duplicate'>('Smart Card');
  const [wizPhotoIndex, setWizPhotoIndex] = useState<number>(0);
  
  const [wizardErrors, setWizardErrors] = useState<{ [key: string]: string }>({});

  // ==== SHORTHAND AI ENGINE STATES (TOGGLED) ====
  const [shorthandInput, setShorthandInput] = useState('civic 22 white neat condition 18k km price 85 lac');
  const [sellingTone, setSellingTone] = useState<'Premium' | 'Aggressive' | 'Friendly' | 'SEO'>('Premium');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  
  const [generatedData, setGeneratedData] = useState<GeneratedSEOListing | null>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualPrice, setManualPrice] = useState(8500000);
  const [manualMileage, setManualMileage] = useState(18000);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(2);
  const [manFuelType, setManFuelType] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'>('Petrol');
  const [manTransmission, setManTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [manualMake, setManualMake] = useState('Honda');
  const [manualModel, setManualModel] = useState('Civic');
  const [manualYear, setManualYear] = useState(2022);

  // WIZARD VALIDATION & FLOW CONTROLS
  const handleWizardNext = () => {
    const errs: { [key: string]: string } = {};
    if (activeStep === 1) {
      if (!wizMake) errs.make = 'Please choose a vehicle brand / make';
      if (!wizModel.trim()) errs.model = 'Please write the model family (e.g. Civic)';
      if (!wizYear || wizYear < 1960 || wizYear > 2027) errs.year = 'Provide a valid manufacture year';
      
      setWizardErrors(errs);
      if (Object.keys(errs).length > 0) return;
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (!wizEngineCC || wizEngineCC <= 0) errs.engineCC = 'Engine Capacity is required';
      if (wizMileage < 0) errs.mileage = 'Mileage cannot be negative';
      if (!wizColor.trim()) errs.color = 'Provide finish color';
      
      setWizardErrors(errs);
      if (Object.keys(errs).length > 0) return;
      setActiveStep(3);
    }
  };

  const handlePublishFromWizard = () => {
    const errs: { [key: string]: string } = {};
    if (!wizPrice || wizPrice <= 0) errs.price = 'Please set a valid target price';
    if (!wizRegCity.trim()) errs.regCity = 'State registration city';
    
    setWizardErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const finalAd: CarListing = {
      id: `wiz-pub-${Date.now()}`,
      title: `${wizYear} ${wizMake} ${wizModel} (${wizCondition})`,
      make: wizMake,
      model: wizModel,
      year: wizYear,
      price: wizPrice,
      mileage: wizCondition === 'New' ? 0 : wizMileage,
      fuelType: wizFuelType,
      transmission: wizTransmission,
      imageUrl: CAR_STOCK_IMAGE_CHOICES[wizPhotoIndex].url,
      verified: true,
      featured: true,
      dealerId: 'almas-car-valley',
      description: `Certified immaculate ${wizColor} ${wizYear} ${wizMake} ${wizModel}. Paint check: ${wizBodyCondition}. Handled with extreme care. Notes: ${wizDentPaintDesc}`,
      createdAt: new Date().toISOString(),
      tags: [wizCondition, wizFuelType, wizTransmission, wizAssembly],
      specs: {
        color: wizColor,
        engineSize: `${wizEngineCC}cc`,
        horspower: wizEngineCC > 1500 ? '160 hp' : '110 hp',
        regionalSpecs: wizAssembly === 'Local' ? 'Locally Assembled' : 'Imported'
      },
      condition: wizCondition,
      engineCC: wizEngineCC,
      exteriorColor: wizColor,
      bodyCondition: wizBodyCondition,
      registrationCity: wizRegCity,
      documentType: wizDocType,
      tokenTaxPaid: wizTokenTaxStatus === 'Paid',
      images: [CAR_STOCK_IMAGE_CHOICES[wizPhotoIndex].url],
      assemblyType: wizAssembly === 'Local' ? 'Local' : 'Imported',
      dentPaintDescription: wizDentPaintDesc,
      tokenTaxStatus: wizTokenTaxStatus
    };

    onAddListing(finalAd);
    setTab('search');
  };

  // AI NOTES ENGINE ACTIONS
  const startAiMarketingEngine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shorthandInput.trim()) return;

    setAiLoading(true);
    setAiError('');
    setGeneratedData(null);

    try {
      const data = await callMarketingEngine(shorthandInput, sellingTone);
      if (!data.success) {
        throw new Error(data.error || 'Server rejected request');
      }

      const parsed: GeneratedSEOListing = data.result;
      setGeneratedData(parsed);
      setManualTitle(parsed.title);
      setManualDescription(parsed.description);
      setManualPrice(parsed.suggestedPricePKR || 1500000);

      const textL = shorthandInput.toLowerCase();
      if (textL.includes('civic')) {
        setManualMake('Honda');
        setManualModel('Civic');
      } else if (textL.includes('corolla')) {
        setManualMake('Toyota');
        setManualModel('Corolla');
      } else if (textL.includes('porsche')) {
        setManualMake('Porsche');
        setManualModel('911 Carrera');
      } else if (textL.includes('mercedes') || textL.includes('g63')) {
        setManualMake('Mercedes-Benz');
        setManualModel('G63 AMG');
      } else if (textL.includes('bmw') || textL.includes('m4')) {
        setManualMake('BMW');
        setManualModel('M4 Competition');
      }

      const yearsMatch = shorthandInput.match(/\b(20\d{2}|\d{2})\b/);
      if (yearsMatch) {
        const yr = parseInt(yearsMatch[1]);
        setManualYear(yr < 100 ? 2000 + yr : yr);
      }

      const kmMatch = shorthandInput.match(/\b(\d+)\s*(k|lac|miles|km|thousand)\b/i);
      if (kmMatch) {
         const numeric = parseInt(kmMatch[1]);
         setManualMileage(kmMatch[2].toLowerCase() === 'lac' ? numeric * 100000 : numeric * 1000);
      }

    } catch (err: any) {
      setAiError(err.message || 'Error executing AI generation pipelines.');
      
      const fallbackObj: GeneratedSEOListing = {
        title: "Pristine 2022 Honda Civic White - Certified Premium State",
        description: `This immaculate Honda Civic represents high efficiency, modern styling, and pure performance reliability. Fitted with high-end safety ratings and completely pre-inspected. Sells rapidly directly from premium dealer portfolios.`,
        tags: ["Sedan", "Fuel Efficient", "Certified", "Immaculate"],
        suggestedPricePKR: 8500000,
        highlights: ["Shorthand notes optimized", "SEO structural tags embedded", "Pakistan compatible specs"]
      };
      setGeneratedData(fallbackObj);
      setManualTitle(fallbackObj.title);
      setManualDescription(fallbackObj.description);
      setManualPrice(fallbackObj.suggestedPricePKR);
    } finally {
      setAiLoading(false);
    }
  };

  const publishCarToWorkspace = () => {
    const finalAd: CarListing = {
      id: `ai-gen-${Date.now()}`,
      title: manualTitle,
      make: manualMake,
      model: manualModel,
      year: manualYear,
      price: manualPrice,
      mileage: manualMileage,
      fuelType: manFuelType,
      transmission: manTransmission,
      imageUrl: CAR_STOCK_IMAGE_CHOICES[selectedPhotoIndex].url,
      verified: true,
      featured: true,
      dealerId: 'almas-car-valley',
      description: manualDescription,
      createdAt: new Date().toISOString(),
      tags: generatedData?.tags || ['Luxury'],
      specs: {
        color: 'Slick Finish',
        engineSize: '2.0L Turbo',
        horspower: '190 hp',
        regionalSpecs: 'Imported Grade PK'
      },
      condition: 'Used',
      engineCC: 2000,
      exteriorColor: 'Slick Finish',
      bodyCondition: 'Total Genuine',
      registrationCity: 'Lahore',
      documentType: 'Smart Card',
      tokenTaxPaid: true,
      images: [CAR_STOCK_IMAGE_CHOICES[selectedPhotoIndex].url],
      assemblyType: 'Imported',
      dentPaintDescription: 'Pristine, zero touchups.',
      tokenTaxStatus: 'Paid'
    };

    onAddListing(finalAd);
    setTab('search');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* 100% Mobile-Fluid Dual Selling Pipeline Selector Matrix */}
      <div className="bg-[#121c32]/85 backdrop-blur-md border border-white/5 p-2 rounded-2xl flex gap-2 w-full font-mono text-[10px] font-black uppercase tracking-wider select-none">
        <button
          type="button"
          onClick={() => setSellMode('self')}
          className={`flex-1 py-3 px-4 rounded-xl text-center cursor-pointer transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95 ${
            sellMode === 'self'
              ? 'bg-orange-500 text-slate-950 shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          📣 Sell It Myself (AI Wizard)
        </button>
        <button
          type="button"
          onClick={() => setSellMode('bargain')}
          className={`flex-1 py-3 px-4 rounded-xl text-center cursor-pointer transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95 ${
            sellMode === 'bargain'
              ? 'bg-orange-500 text-slate-950 shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          ⭐ Bargain Channel (Auto Choice VIP)
        </button>
      </div>

      {sellMode === 'bargain' ? (
        /* Bargain Seller Channel VIP dispatch block */
        <div className="bg-gradient-to-br from-[#0c1221] via-[#0f172a] to-[#1a2e4c] border border-orange-500/30 p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-6 animate-fade-in select-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500 opacity-5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="space-y-2 relative z-10">
            <span className="text-[9px] font-mono font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 border border-orange-500/25 px-2.5 py-1 rounded">
              VIP Brokerage desk
            </span>
            <h2 className="text-xl md:text-2xl font-sans font-black text-white uppercase tracking-tight">
              Auto Choice Flagship Bargain Channel
            </h2>
            <p className="text-xs text-white/70 font-sans leading-relaxed max-w-xl">
              Connect your vehicle directly with BAZAR360's certified in-house field mechanics and transaction brokers. We oversee full biometric verification, inspect structural variables, code pricing indices, and close sales rapidly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-[#070c12] rounded-xl border border-white/5 space-y-1">
              <span className="text-[14px]">🛡️</span>
              <p className="text-white font-mono font-extrabold text-[10px] uppercase">180-Point Inspection</p>
              <p className="text-gray-400 text-[10px] font-sans leading-snug">Our agent visits your location, evaluates paints micrometer depths, and scans active suspension landmarks.</p>
            </div>
            <div className="p-4 bg-[#070c12] rounded-xl border border-white/5 space-y-1">
              <span className="text-[14px]">🔑</span>
              <p className="text-white font-mono font-extrabold text-[10px] uppercase">Excise Biometrics</p>
              <p className="text-gray-400 text-[10px] font-sans leading-snug">Secures swift ownership transfers and fingerprint registrations, ensuring peace of mind under legal guidelines.</p>
            </div>
            <div className="p-4 bg-[#070c12] rounded-xl border border-white/5 space-y-1">
              <span className="text-[14px]">📈</span>
              <p className="text-white font-mono font-extrabold text-[10px] uppercase">Auto Choice Fleet Boost</p>
              <p className="text-gray-400 text-[10px] font-sans leading-snug">Your vehicle gets approved and locked instantly into our flagship fleet slots for premium system visibility.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3 font-mono">
            <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider">📞 Contact in-house broker instantly</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="https://wa.me/923159085086?text=Hi%20Auto%20Choice%20Bargain%20Desk,%20I%20want%2520to%2520list%20my%2520car%2520via%252520the%252520VIP%2520channel."
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-center font-bold text-xs text-white duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>WhatsApp Connection</span>
              </a>
              <a 
                href="tel:+923159085086"
                className="flex-1 py-3 px-4 rounded-xl bg-[#1f2a3f] hover:bg-[#2e3b54] border border-white/10 text-center font-bold text-xs text-white duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Call +92 315 9085086</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Sell It Myself Module (Dual Mode Header Switcher) */
        <div className="space-y-6">
          <div className="flex border-b border-white/5 pb-3.5 items-center justify-between gap-4 select-none">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-orange-500 font-mono">Select Posting Protocol</span>
              <p className="text-white text-xs font-semibold">Ready to register your vehicle?</p>
            </div>
            <div className="bg-[#0c1221] border border-white/5 p-1 rounded-xl flex gap-1 font-mono text-[9px] font-bold">
              <button
                type="button"
                onClick={() => setPostMethod('wizard')}
                className={`py-1.5 px-3 rounded-lg cursor-pointer transition-all ${
                  postMethod === 'wizard' ? 'bg-[#38BDF8] text-slate-950 font-black font-mono' : 'text-gray-400 hover:text-white'
                }`}
              >
                📋 3-Stage Wizard
              </button>
              <button
                type="button"
                onClick={() => setPostMethod('ai')}
                className={`py-1.5 px-3 rounded-lg cursor-pointer transition-all ${
                  postMethod === 'ai' ? 'bg-[#38BDF8] text-slate-950 font-black font-mono' : 'text-gray-400 hover:text-white'
                }`}
              >
                ⚡ Shorthand AI
              </button>
            </div>
          </div>

          {postMethod === 'wizard' ? (
            /* ========================================================
               3-STAGE INTERACTIVE HIGH-CONVERSION WIZARD
               ======================================================== */
            <div className="bg-gradient-to-b from-[#121c32] to-[#0d1527] border border-white/5 p-6 rounded-3xl space-y-6 shadow-2xl animate-fade-in font-sans">
              
              {/* Visual Steps Indicator */}
              <div className="grid grid-cols-3 gap-3 select-none">
                {[
                  { step: 1, label: '1. Vehicle Identity' },
                  { step: 2, label: '2. Condition & Specs' },
                  { step: 3, label: '3. Price & Docs' }
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`py-3 px-2 text-center border rounded-xl font-mono text-[9px] uppercase font-bold tracking-wider transition-all duration-300 ${
                      activeStep === item.step
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-extrabold shadow-md'
                        : activeStep > item.step
                        ? 'bg-[#121c32] border-emerald-500/40 text-emerald-400'
                        : 'bg-[#0f172a] border-white/5 text-gray-500'
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>

              {/* STAGE 1: VEHICLE IDENTITY */}
              {activeStep === 1 && (
                <div className="space-y-6 select-none text-xs">
                  {/* Grid choosing make / brand */}
                  <div className="space-y-2">
                    <span className="text-white font-bold block text-sm">Select Vehicle Brand / Make <span className="text-red-500">*</span></span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { name: 'Toyota', icon: '🇯🇵' },
                        { name: 'Honda', icon: '🔴' },
                        { name: 'Suzuki', icon: '🟢' },
                        { name: 'BMW', icon: '🌀' },
                        { name: 'Mercedes-Benz', icon: '👑' },
                        { name: 'Porsche', icon: '🏁' },
                        { name: 'Hyundai', icon: '🏎️' },
                        { name: 'Kia', icon: '⚙️' },
                        { name: 'Nissan', icon: '🚙' },
                        { name: 'Audi', icon: '💍' }
                      ].map((m) => (
                        <button
                          key={m.name}
                          type="button"
                          onClick={() => { setWizMake(m.name); if (wizardErrors.make) setWizardErrors({...wizardErrors, make: ''}); }}
                          className={`p-3.5 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer font-mono font-bold ${
                            wizMake === m.name
                              ? 'bg-orange-500/10 border-orange-500 text-orange-400 scale-[1.02] ring-2 ring-orange-500/20'
                              : 'bg-[#0f172a] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-lg">{m.icon}</span>
                          <span className="text-[10px] truncate w-full">{m.name}</span>
                        </button>
                      ))}
                    </div>
                    {wizardErrors.make && (
                      <p className="text-red-400 text-[10px] font-mono font-bold uppercase">⚠️ {wizardErrors.make}</p>
                    )}
                  </div>

                  {/* Model input & manufacture year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-white font-bold block text-xs">Model Family (e.g. Civic, Accord, Fortuner) <span className="text-red-500">*</span></label>
                      <input
                        className="w-full bg-[#0f172a] border border-white/5 rounded-xl p-3.5 focus:outline-none focus:border-[#38BDF8] text-white text-xs font-mono font-bold"
                        type="text"
                        placeholder="e.g. Civic"
                        value={wizModel}
                        onChange={(e) => { setWizModel(e.target.value); if (wizardErrors.model) setWizardErrors({...wizardErrors, model: ''}); }}
                      />
                      {wizardErrors.model && (
                        <p className="text-red-400 text-[10px] font-mono font-bold uppercase">⚠️ {wizardErrors.model}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white font-bold block text-xs">Manufacture Model Year <span className="text-red-500">*</span></label>
                      <select
                        className="w-full bg-[#0f172a] border border-white/5 rounded-xl p-3.5 focus:outline-none focus:border-[#38BDF8] text-white text-xs font-mono font-bold"
                        value={wizYear}
                        onChange={(e) => { setWizYear(parseInt(e.target.value)); if (wizardErrors.year) setWizardErrors({...wizardErrors, year: ''}); }}
                      >
                        {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2008, 2005].map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                      {wizardErrors.year && (
                        <p className="text-red-400 text-[10px] font-mono font-bold uppercase">⚠️ {wizardErrors.year}</p>
                      )}
                    </div>
                  </div>

                  {/* Condition & Assembly Toggle Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-white font-bold block text-xs">Condition Grade Classification:</label>
                      <div className="flex bg-[#0f172a] border border-white/5 p-1 rounded-xl">
                        {(['New', 'Used'] as const).map((cond) => (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => { setWizCondition(cond); if (cond === 'New') { setWizMileage(0); } }}
                            className={`flex-1 py-2 rounded-lg font-mono font-bold text-[10px] uppercase text-center cursor-pointer transition-all ${
                              wizCondition === cond
                                ? 'bg-[#38BDF8] text-slate-950 font-black'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {cond === 'New' ? '🆕 Brand New' : '🚗 Used / Old'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white font-bold block text-xs">Origin Assembly Protocol:</label>
                      <div className="flex bg-[#0f172a] border border-white/5 p-1 rounded-xl">
                        {[
                          { id: 'Local', label: '🇵🇰 Locally Assembled' },
                          { id: 'Imported', label: '🚢 Imported' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setWizAssembly(item.id as any)}
                            className={`flex-1 py-2 rounded-lg font-mono font-bold text-[10px] uppercase text-center cursor-pointer transition-all ${
                              wizAssembly === item.id
                                ? 'bg-[#38BDF8] text-slate-950 font-black'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Next Trigger */}
                  <div className="flex justify-end pt-5 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handleWizardNext}
                      className="bg-[#F97316] hover:bg-orange-600 py-3.5 px-6 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      Stage 2: Specs & Condition <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: CONDITION & SPECIFICATIONS */}
              {activeStep === 2 && (
                <div className="space-y-6 select-none text-xs">
                  
                  {/* CC & KM driven */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-white font-bold block text-xs">Engine Displacement Capacity (CC) <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <input
                          className="flex-grow bg-[#0f172a] border border-white/5 rounded-xl p-3.5 focus:outline-none focus:border-[#38BDF8] text-white text-xs font-mono font-bold"
                          type="number"
                          placeholder="e.g. 1800"
                          value={wizEngineCC || ''}
                          onChange={(e) => { setWizEngineCC(parseInt(e.target.value) || 0); if (wizardErrors.engineCC) setWizardErrors({...wizardErrors, engineCC: ''}); }}
                        />
                        <span className="bg-[#0f172a] border border-white/5 rounded-xl px-4 flex items-center font-mono text-[10px] text-gray-500 font-bold">CC</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[660, 1000, 1300, 1500, 1800, 2000, 3000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => { setWizEngineCC(preset); if (wizardErrors.engineCC) setWizardErrors({...wizardErrors, engineCC: ''}); }}
                            className={`px-2 py-0.5 text-[8.5px] font-mono border rounded-md ${
                              wizEngineCC === preset ? 'border-orange-500 text-orange-400 bg-orange-950/20' : 'border-white/5 text-gray-500 bg-[#0f172a]'
                            }`}
                          >
                            {preset}cc
                          </button>
                        ))}
                      </div>
                      {wizardErrors.engineCC && (
                        <p className="text-red-400 text-[10px] font-mono font-bold uppercase">⚠️ {wizardErrors.engineCC}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-white font-bold text-xs">
                        <label className="block">Mileage Travelled (KM Driven) <span className="text-red-500">*</span></label>
                        <button
                          type="button"
                          onClick={() => setWizMileage(0)}
                          className="text-[#38BDF8] text-[9.5px] font-mono uppercase bg-[#38BDF8]/10 px-2 py-0.5 rounded cursor-pointer border border-[#38BDF8]/20"
                        >
                          Zero Meter
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          className="flex-grow bg-[#0f172a] border border-white/5 rounded-xl p-3.5 focus:outline-none focus:border-[#38BDF8] text-white text-xs font-mono font-bold"
                          type="number"
                          placeholder="e.g. 15000"
                          value={wizMileage || ''}
                          onChange={(e) => { setWizMileage(parseInt(e.target.value) || 0); if (wizardErrors.mileage) setWizardErrors({...wizardErrors, mileage: ''}); }}
                          disabled={wizCondition === 'New'}
                        />
                        <span className="bg-[#0f172a] border border-white/5 rounded-xl px-4 flex items-center font-mono text-[10px] text-gray-500 font-bold">KM</span>
                      </div>
                      {wizCondition === 'New' && (
                        <p className="text-[#38BDF8] text-[8.5px] font-mono mt-1">Locked (Zero Meter) for Brand New Condition Mode.</p>
                      )}
                    </div>
                  </div>

                  {/* Transmission strategy and fuel category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white font-bold block text-xs">Transmission Mechanism Strategy:</label>
                      <div className="flex bg-[#0f172a] border border-white/5 p-1 rounded-xl">
                        {(['Automatic', 'Manual'] as const).map((trans) => (
                          <button
                            key={trans}
                            type="button"
                            onClick={() => setWizTransmission(trans)}
                            className={`flex-1 py-1.5 rounded-lg font-mono font-bold text-[10px] uppercase text-center cursor-pointer transition-all ${
                              wizTransmission === trans
                                ? 'bg-[#38BDF8] text-slate-950 font-black'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {trans === 'Automatic' ? '⚡ Automatic' : '⚙️ Stick Manual'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white font-bold block text-xs">Propulsion Fuel Strategy:</label>
                      <div className="flex bg-[#0f172a] border border-white/5 p-1 rounded-xl gap-1">
                        {(['Petrol', 'Diesel', 'Hybrid', 'Electric'] as const).map((fuel) => (
                          <button
                            key={fuel}
                            type="button"
                            onClick={() => setWizFuelType(fuel)}
                            className={`flex-1 py-1.5 rounded-lg font-mono font-semibold text-[9.5px] uppercase text-center cursor-pointer transition-all ${
                              wizFuelType === fuel
                                ? 'bg-[#38BDF8] text-slate-950 font-black'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {fuel}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Paint finish & Body paint rating */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-white font-bold block text-xs">Exterior Paint Color <span className="text-red-500">*</span></label>
                      <input
                        className="w-full bg-[#0f172a] border border-white/5 rounded-xl p-3.5 focus:outline-none focus:border-[#38BDF8] text-white text-xs font-mono font-bold"
                        placeholder="e.g. White, Metalic Black..."
                        type="text"
                        value={wizColor}
                        onChange={(e) => { setWizColor(e.target.value); if (wizardErrors.color) setWizardErrors({...wizardErrors, color: ''}); }}
                      />
                      <div className="flex gap-1.5 mt-1.5">
                        {['White', 'Black', 'Silver', 'Grey', 'Blue'].map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => { setWizColor(col); if (wizardErrors.color) setWizardErrors({...wizardErrors, color: ''}); }}
                            className={`px-2 py-0.5 text-[9px] font-mono border rounded-md ${
                              wizColor === col ? 'border-[#38BDF8] text-[#38BDF8]' : 'border-white/5 text-gray-400 bg-[#0f172a]'
                            }`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                      {wizardErrors.color && (
                        <p className="text-red-400 text-[10px] font-mono font-bold uppercase">⚠️ {wizardErrors.color}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white font-bold block text-xs">Structural Paint State Rating:</label>
                      <select
                        className="w-full bg-[#0f172a] border border-white/5 rounded-xl p-3.5 focus:outline-none focus:border-[#38BDF8] text-white text-xs font-mono font-bold"
                        value={wizBodyCondition}
                        onChange={(e) => setWizBodyCondition(e.target.value as any)}
                      >
                        <option value="Total Genuine">Total Genuine (Showroom standard)</option>
                        <option value="Minor Touch-ups">Minor Touch-ups (Slight cosmetics)</option>
                        <option value="Major Repaint">Major Repaint (Spray-applied panels)</option>
                      </select>
                    </div>
                  </div>

                  {/* physical damage comments */}
                  <div className="space-y-1.5">
                    <label className="text-white font-bold block text-xs">Visual & Damage Inspection Comments:</label>
                    <textarea
                      rows={2}
                      className="w-full bg-[#0f172a] border border-white/5 rounded-xl p-3.5 focus:outline-none focus:border-[#38BDF8] text-white text-xs font-mono leading-relaxed resize-none"
                      placeholder="Comment on scratches, dents, engine compression values..."
                      value={wizDentPaintDesc}
                      onChange={(e) => setWizDentPaintDesc(e.target.value)}
                    />
                  </div>

                  {/* Stage navigation */}
                  <div className="flex justify-between pt-5 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="border border-white/5 hover:border-white/10 py-3.5 px-5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      &larr; Back to Stage 1
                    </button>
                    <button
                      type="button"
                      onClick={handleWizardNext}
                      className="bg-[#F97316] hover:bg-orange-600 py-3.5 px-6 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      Stage 3: Pricing & Docs <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: PRICING & LEGAL DOCUMENTS */}
              {activeStep === 3 && (
                <div className="space-y-6 select-none text-xs">
                  
                  {/* Price & Registration City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-white font-bold block text-xs">Target Selling Price (PKR) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-gray-500">Rs.</span>
                        <input
                          className="w-full bg-[#0f172a] border border-white/5 rounded-xl p-3.5 pl-10 focus:outline-none focus:border-[#38BDF8] text-white text-xs font-mono font-bold"
                          type="number"
                          placeholder="e.g. 4500000"
                          value={wizPrice || ''}
                          onChange={(e) => { setWizPrice(parseInt(e.target.value) || 0); if (wizardErrors.price) setWizardErrors({...wizardErrors, price: ''}); }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-[10.5px] font-mono bg-orange-950/20 text-orange-400 p-2.5 rounded-xl border border-orange-900/30">
                        <span>Valuation Mapping:</span>
                        <span className="font-extrabold">{formatPKRCurrency(wizPrice)}</span>
                      </div>
                      {wizardErrors.price && (
                        <p className="text-red-400 text-[10px] font-mono font-bold uppercase mt-1">⚠️ {wizardErrors.price}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white font-bold block text-xs">Registration City <span className="text-red-500">*</span></label>
                      <input
                        className="w-full bg-[#0f172a] border border-white/5 rounded-xl p-3.5 focus:outline-none focus:border-[#38BDF8] text-white text-xs font-mono font-bold"
                        placeholder="e.g. Lahore, Karachi, Peshawar, Islamabad"
                        type="text"
                        value={wizRegCity}
                        onChange={(e) => { setWizRegCity(e.target.value); if (wizardErrors.regCity) setWizardErrors({...wizardErrors, regCity: ''}); }}
                      />
                      
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Rawalpindi'].map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => { setWizRegCity(city); if (wizardErrors.regCity) setWizardErrors({...wizardErrors, regCity: ''}); }}
                            className={`px-2 py-0.5 text-[8.5px] font-mono border rounded-md ${
                              wizRegCity === city ? 'border-[#38BDF8] text-[#38BDF8]' : 'border-white/5 text-gray-500 bg-[#0f172a]'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                      {wizardErrors.regCity && (
                        <p className="text-red-400 text-[10px] font-mono font-bold uppercase mt-1">⚠️ {wizardErrors.regCity}</p>
                      )}
                    </div>
                  </div>

                  {/* Token tax paid + document type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white font-bold block text-xs">Token Tax Status State:</label>
                      <div className="flex bg-[#0f172a] border border-white/5 p-1 rounded-xl">
                        {[
                          { id: 'Paid', label: '✅ Paid up-to-date' },
                          { id: 'Outstanding', label: '⚠️ Outstanding' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setWizTokenTaxStatus(item.id as any)}
                            className={`flex-1 py-1.5 rounded-lg font-mono font-bold text-[10px] uppercase text-center cursor-pointer transition-all ${
                              wizTokenTaxStatus === item.id
                                ? 'bg-[#38BDF8] text-slate-950 font-black'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white font-bold block text-xs">Physical Registration File Type:</label>
                      <div className="flex bg-[#0f172a] border border-white/5 p-1 rounded-xl gap-1">
                        {[
                          { id: 'Smart Card', label: '💳 Smart Card' },
                          { id: 'Original Book', label: '📖 Original Book' },
                          { id: 'Duplicate', label: '⚠️ Duplicate file' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setWizDocType(item.id as any)}
                            className={`flex-1 py-1.5 rounded-lg font-mono font-bold text-[10px] uppercase text-center cursor-pointer transition-all ${
                              wizDocType === item.id
                                ? 'bg-[#38BDF8] text-slate-950 font-black'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Photo selection alignment */}
                  <div className="space-y-3">
                    <label className="text-white font-bold block text-xs">Link Dynamic Aesthetic Cover Photo:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0c1221] p-3 rounded-2xl border border-white/5">
                      {CAR_STOCK_IMAGE_CHOICES.map((choice, i) => (
                        <div
                          key={choice.name}
                          onClick={() => setWizPhotoIndex(i)}
                          className={`border rounded-xl overflow-hidden cursor-pointer relative transition-all ${
                            wizPhotoIndex === i
                              ? 'border-[#38BDF8] ring-4 ring-[#38BDF8]/10 bg-[#0F172A]'
                              : 'border-white/5 hover:border-white/25 bg-[#0F172A]'
                          }`}
                        >
                          <img
                            src={choice.url}
                            alt={choice.name}
                            className="h-16 w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[8px] text-[#38BDF8] uppercase bg-[#0B1121]/90 py-1 block truncate text-center font-mono font-bold">
                            {choice.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stage navigation */}
                  <div className="flex justify-between pt-5 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="border border-white/5 hover:border-white/10 py-3.5 px-5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      &larr; Back to Stage 2
                    </button>
                    <button
                      type="button"
                      onClick={handlePublishFromWizard}
                      className="bg-[#38BDF8] text-slate-950 font-bold py-3.5 px-8 rounded-xl font-mono text-[10px] uppercase tracking-wider hover:bg-sky-400 active:scale-95 transition-all duration-75 shadow-lg shadow-sky-950/20 cursor-pointer"
                    >
                      Commit & Post Verified Advertisement &rarr;
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* ========================================================
               SHORTHAND AI WRITER PORTAL (LEGACY FALLBACK)
               ======================================================== */
            <>
              <section className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-2xl animate-fade-in">
                <div className="absolute top-1/2 right-10 -translate-y-1/2 pointer-events-none select-none opacity-20">
                  <Sparkles className="text-[#38BDF8]" size={120} />
                </div>
                <div className="max-w-xl space-y-2 relative z-10">
                  <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase tracking-wider block bg-orange-950/40 w-fit px-2.5 py-1 rounded border border-white/5">
                    AI Marketing Pipeline
                  </span>
                  <h2 className="text-xl md:text-2xl font-sans font-extrabold text-white uppercase tracking-tight">
                    RAW SHORTHAND SELLS, TURNED INTO PREMIUM ADS.
                  </h2>
                  <p className="text-xs text-white/50 font-sans leading-relaxed">
                    Enter raw vehicle notes, condition descriptions, or pricing specifications. BAZAR360 will digest structural inputs through server-side AI frameworks and construct an SEO-optimized listing instantly.
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl select-none">
                  <h3 className="text-white font-bold text-xs uppercase tracking-wider block border-b border-white/5 pb-3.5">Seller Shorthand Notes</h3>
                  <form onSubmit={startAiMarketingEngine} className="space-y-4 font-sans text-xs">
                    <div className="space-y-1.5">
                      <label className="text-gray-400 block font-semibold">Raw Car Shorthand Inputs:</label>
                      <textarea
                        rows={4}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-3.5 text-white focus:outline-none focus:border-[#38BDF8] leading-relaxed resize-none font-mono text-xs"
                        placeholder="e.g. civic 22 white neat condition 18k km price 85 lac..."
                        value={shorthandInput}
                        onChange={(e) => setShorthandInput(e.target.value)}
                      ></textarea>
                      <span className="text-[10px] text-white/30 block mt-1">Mention brand, year, color, running, extra attributes.</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/60 block font-semibold">Listing Style/Tone Tuning:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'Premium', label: 'Premium Luxury' },
                          { id: 'Aggressive', label: 'Direct Force' },
                          { id: 'Friendly', label: 'Helpful & Safe' },
                          { id: 'SEO', label: 'Optimized SEO' },
                        ].map((tone) => (
                          <button
                            key={tone.id}
                            type="button"
                            onClick={() => setSellingTone(tone.id as any)}
                            className={`py-2 px-3 rounded-xl font-bold border text-left font-mono text-[10px] transition-all cursor-pointer ${
                              sellingTone === tone.id
                                ? 'bg-[#0F172A] text-[#38BDF8] border-[#38BDF8]'
                                : 'bg-[#0F172A] text-white/40 border-white/5 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {tone.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={aiLoading}
                      className="w-full py-3.5 bg-[#F97316] hover:bg-orange-600 border border-white/5 transition-colors rounded-xl font-bold text-white shadow-lg shadow-orange-950/20 active:scale-97 flex items-center justify-center gap-2 duration-100 uppercase tracking-widest text-[10px] cursor-pointer font-mono"
                    >
                      {aiLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Executing Synthesis...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Translate via AI Engine</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl flex flex-col justify-between shadow-xl relative min-h-[300px]">
                  {aiLoading && (
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center space-y-3 z-10">
                      <div className="relative animate-pulse">
                        <Sparkles className="text-[#38BDF8]" size={32} />
                      </div>
                      <p className="text-xs text-[#38BDF8] font-bold font-mono tracking-widest uppercase">Executing Gemini Synthesizer</p>
                      <p className="text-[9px] text-white/50 font-sans">Formatting copy arrays & suggested market index valuation...</p>
                    </div>
                  )}

                  {!generatedData && !aiLoading && (
                    <div className="flex-grow flex flex-col justify-center items-center text-center p-6 space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#0F172A] text-[#38BDF8] flex items-center justify-center shadow-lg border border-white/5">
                        <Sliders size={26} />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-white font-bold uppercase tracking-tight text-xs">Listing Generator Ready</h4>
                        <p className="text-xs text-white/50 font-sans max-w-xs leading-relaxed">
                          Enter raw specifications on the left pane and hit the AI translate accelerator.
                        </p>
                      </div>
                    </div>
                  )}

                  {generatedData && (
                    <div className="space-y-4 flex-grow flex flex-col justify-between font-sans text-xs">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-[#0F172A] p-3 rounded-xl border border-white/5 font-mono">
                          <span className="text-[10px] uppercase font-bold text-[#38BDF8]">Title optimization:</span>
                          <span className="text-[8px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/40 font-bold select-none uppercase tracking-wide">AI Completed</span>
                        </div>
                        
                        <div className="bg-[#0F172A] p-4 rounded-xl space-y-2 border border-white/5">
                          <div className="flex gap-3">
                            <Clipboard size={14} className="text-[#38BDF8] mt-0.5 shrink-0" />
                            <div>
                              <h4 className="font-bold text-white text-xs tracking-tight uppercase">{manualTitle}</h4>
                              <p className="text-white/60 text-[11px] leading-relaxed mt-2">{manualDescription}</p>
                            </div>
                          </div>
                        </div>

                        {generatedData.highlights && generatedData.highlights.length > 0 && (
                          <div className="space-y-1.5 pl-3.5 border-l-2 border-[#F97316] font-mono">
                            <span className="text-[9px] uppercase font-bold text-[#F97316] block tracking-wide">Engine highlights:</span>
                            <ul className="text-[10px] text-white/70 space-y-1">
                              {generatedData.highlights.map((h, i) => (
                                <li key={i} className="flex gap-1.5 items-center">
                                  <ChevronRight size={10} className="text-[#F97316]" /> {h}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {aiError && (
                        <p className="text-[10px] bg-red-950/30 text-red-400 p-2.5 rounded-xl border border-red-900/30 font-mono">
                          ⚠️ Note: {aiError} (Loaded sandbox template preset)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Manual tweaks once generated */}
              {generatedData && (
                <section className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-6 shadow-2xl font-sans text-xs animate-fade-in">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                      <Sliders size={14} className="text-[#F97316]" /> Review Technical Specifications & Choose Branding
                    </h3>
                    <p className="text-[10px] text-white/50 mt-1">Fine-tune listing metrics manually before publishing to BAZAR360 feeds.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Listing Header:</label>
                      <input
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                        type="text"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Selling Valuation (PKR):</label>
                      <input
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                        type="number"
                        value={manualPrice}
                        onChange={(e) => setManualPrice(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Mileage (km):</label>
                      <input
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                        type="number"
                        value={manualMileage}
                        onChange={(e) => setManualMileage(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Transmission:</label>
                      <select
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                        value={manTransmission}
                        onChange={(e) => setManTransmission(e.target.value as any)}
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Make Brand:</label>
                      <input
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                        type="text"
                        value={manualMake}
                        onChange={(e) => setManualMake(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Model Family:</label>
                      <input
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                        type="text"
                        value={manualModel}
                        onChange={(e) => setManualModel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Manufacture Year:</label>
                      <input
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                        type="number"
                        value={manualYear}
                        onChange={(e) => setManualYear(parseInt(e.target.value) || 2026)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Fuel Category:</label>
                      <select
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                        value={manFuelType}
                        onChange={(e) => setManFuelType(e.target.value as any)}
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Image Branding Cover:</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {CAR_STOCK_IMAGE_CHOICES.map((choice, i) => (
                        <div
                          key={choice.name}
                          onClick={() => setSelectedPhotoIndex(i)}
                          className={`border rounded-2xl overflow-hidden cursor-pointer relative transition-all ${
                            selectedPhotoIndex === i
                              ? 'border-[#38BDF8] ring-4 ring-[#38BDF8]/10 bg-[#0F172A]'
                              : 'border-white/5 hover:border-white/20 bg-[#0F172A]'
                          }`}
                        >
                          <img
                            src={choice.url}
                            alt={choice.name}
                            className="h-24 w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[9px] text-[#38BDF8] uppercase bg-[#0B1121]/90 py-1.5 block truncate text-center font-mono font-bold tracking-tight">
                            {choice.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-5 border-t border-white/5">
                    <button
                      onClick={publishCarToWorkspace}
                      className="bg-[#38BDF8] hover:bg-sky-400 font-mono font-bold text-xs py-3.5 px-8 text-slate-950 rounded-xl flex items-center justify-center gap-2 active:scale-95 duration-75 shadow-lg shadow-sky-950/20 uppercase tracking-wider cursor-pointer"
                    >
                      <Save size={14} /> Commit AI Listing and Publish
                    </button>
                  </div>
                </section>
              )}
            </>
          )}

        </div>
      )}

    </div>
  );
}
