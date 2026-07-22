import React, { useState } from 'react';
import { Store, User, Search, Check, AlertTriangle, Plus, Trash, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { CarListing, Dealer } from '../../types';
import { dbSaveListing } from '../../lib/dbService';
import { toast } from 'react-hot-toast';
import { callMarketingEngine } from '../../services/api';

interface AdminPostingFormProps {
  dealers: Dealer[];
  currentUser: any;
  onPostCreated?: (newCar: CarListing) => void;
  recordLog?: (action: string, title: string, details: string, mode: string) => void;
}

export default function AdminPostingForm({
  dealers = [],
  currentUser,
  onPostCreated,
  recordLog
}: AdminPostingFormProps) {
  // Post Type state: 'private' | 'showroom'
  const [postType, setPostType] = useState<'private' | 'showroom'>('private');
  
  // Showroom Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShowroom, setSelectedShowroom] = useState<Dealer | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [price, setPrice] = useState<number>(3500000);
  const [mileage, setMileage] = useState<number>(12000);
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'>('Petrol');
  const [transmission, setTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [condition, setCondition] = useState<'New' | 'Used'>('Used');
  const [engineCC, setEngineCC] = useState<number>(1800);
  const [exteriorColor, setExteriorColor] = useState('Standard White');
  const [bodyCondition, setBodyCondition] = useState<'Total Genuine' | 'Minor Touch-ups' | 'Major Repaint'>('Total Genuine');
  const [registrationCity, setRegistrationCity] = useState('Peshawar');
  const [documentType, setDocumentType] = useState<'Smart Card' | 'Original Book' | 'Duplicate'>('Smart Card');
  const [tokenTaxPaid, setTokenTaxPaid] = useState<boolean>(true);
  const [assemblyType, setAssemblyType] = useState<'Local' | 'Imported'>('Local');
  const [description, setDescription] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);

  const handleGenerateAIDescription = async () => {
    if (!make.trim() || !model.trim()) {
      toast.error('Please specify Make and Model before generating description.');
      return;
    }
    setGeneratingAI(true);
    try {
      const rawPrompt = `Generate a high-end description for a ${year} ${make} ${model} with ${mileage} km mileage. Transmission: ${transmission}, Fuel Type: ${fuelType}, Engine CC: ${engineCC}cc, Assembly: ${assemblyType}, Condition: ${condition}, Body: ${bodyCondition}, Document: ${documentType}.`;
      const aiResponse = await callMarketingEngine(rawPrompt, 'Premium');
      if (aiResponse && aiResponse.success && aiResponse.result?.description) {
        setDescription(aiResponse.result.description);
        toast.success('Professional sales-optimized description generated!');
      } else {
        toast.error('AI generated an empty response. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to communicate with AI generation engine.');
    } finally {
      setGeneratingAI(false);
    }
  };
  
  // Images list
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Loading state
  const [loading, setLoading] = useState(false);

  // Filter showrooms based on search query
  const filteredDealers = dealers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    if (!newImageUrl.startsWith('http://') && !newImageUrl.startsWith('https://')) {
      toast.error('Image must be a valid HTTP/HTTPS URL');
      return;
    }
    setImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    toast.success('Image link appended.');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateDemoImages = () => {
    const demos = [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'
    ];
    setImages(demos);
    toast.success('Injected premium demonstration images');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !make.trim() || !model.trim()) {
      toast.error('Please specify Title, Make, and Model of the vehicle.');
      return;
    }

    if (price <= 0) {
      toast.error('Vehicle price must be positive.');
      return;
    }

    if (year < 1980 || year > 2027) {
      toast.error('Please enter a valid model year (1980 - 2027)');
      return;
    }

    if (postType === 'showroom' && !selectedShowroom) {
      toast.error('Please select a target showroom to post on behalf of.');
      return;
    }

    setLoading(true);
    try {
      const targetDealerId = postType === 'showroom' && selectedShowroom ? selectedShowroom.id : 'private';
      const listingId = `car-admin-${Date.now()}`;

      const newListing: CarListing = {
        id: listingId,
        title: title.trim(),
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        price: Number(price),
        mileage: Number(mileage),
        fuelType,
        transmission,
        imageUrl: images[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
        verified: true, // Admin posted is pre-verified!
        featured: true, // Admin posted gets featured placement!
        approved: true, // Admin posted is pre-approved!
        dealerId: targetDealerId,
        description: description.trim() || `${year} ${make} ${model} in perfect running condition. Highly maintained.`,
        createdAt: new Date().toISOString(),
        tags: [make, model, condition, fuelType],
        specs: {
          color: exteriorColor,
          engineSize: `${engineCC} CC`,
          horspower: '180 hp',
          regionalSpecs: assemblyType === 'Local' ? 'Local' : 'Imported'
        },
        condition,
        engineCC: Number(engineCC),
        exteriorColor,
        bodyCondition,
        registrationCity,
        documentType,
        tokenTaxPaid,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'],
        assemblyType,
        isSold: false,
        isPaused: false,
        status: 'Available'
      };

      // Save to database
      await dbSaveListing(newListing);

      if (onPostCreated) {
        onPostCreated(newListing);
      }

      if (recordLog) {
        recordLog(
          'ADD',
          `Posted Vehicle: ${newListing.title}`,
          `Admin authorized vehicle stock listing mapping directly to ID ${targetDealerId}`,
          'system'
        );
      }

      toast.success('Successfully posted vehicle to the marketplace (auto-approved & verified)!');

      // Reset Form fields
      setTitle('');
      setMake('');
      setModel('');
      setYear(2024);
      setPrice(3500000);
      setMileage(12000);
      setDescription('');
      setSelectedShowroom(null);
      setSearchTerm('');
      setImages(['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800']);
    } catch (err: any) {
      console.error('Error posting vehicle:', err);
      toast.error(err.message || 'Error occurred while saving listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border-main)] pb-4">
        <h4 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-main)] font-mono">
          🚀 Advanced Automotive Posting Engine
        </h4>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
          Authorized Admin-tier posting interface. Listings bypass moderation queues, getting flagged as <span className="text-emerald-400 font-bold">VERIFIED</span> and <span className="text-orange-400 font-bold">FEATURED</span> instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Governance Mode */}
        <div className="bg-[var(--color-bg-primary)] p-4 rounded-2xl border border-[var(--color-border-main)] space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] block">
            Select Listing Ownership Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setPostType('private');
                setSelectedShowroom(null);
              }}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                postType === 'private'
                  ? 'bg-orange-500/10 border-orange-500/30 text-[var(--color-text-main)]'
                  : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${postType === 'private' ? 'bg-orange-500/20 text-orange-400' : 'bg-black/20'}`}>
                <User size={16} />
              </div>
              <div>
                <span className="text-xs font-black uppercase block">Private Individual</span>
                <span className="text-[8px] opacity-75 block">Map listing to the general public catalog</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPostType('showroom')}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                postType === 'showroom'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--color-text-main)]'
                  : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${postType === 'showroom' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-black/20'}`}>
                <Store size={16} />
              </div>
              <div>
                <span className="text-xs font-black uppercase block">On Behalf of Showroom</span>
                <span className="text-[8px] opacity-75 block">Map listing directly to a showroom inventory</span>
              </div>
            </button>
          </div>

          {/* Showroom search mapping */}
          {postType === 'showroom' && (
            <div className="space-y-3 pt-3 border-t border-[var(--color-border-main)]/50">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] block">
                Search & Link Showroom ID
              </label>
              
              {selectedShowroom ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-black flex items-center justify-center text-xs">
                      {selectedShowroom.avatarLetter || 'S'}
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-400 uppercase">{selectedShowroom.name}</p>
                      <p className="text-[8px] text-[var(--color-text-muted)] font-mono">Linked Showroom ID: <span className="font-bold">{selectedShowroom.id}</span></p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedShowroom(null);
                      setSearchTerm('');
                    }}
                    className="text-[10px] font-bold text-red-400 hover:underline cursor-pointer"
                  >
                    Change Link
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" size={14} />
                    <input
                      type="text"
                      placeholder="Type showroom name or location (e.g. Auto Choice)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] pl-9 pr-4 py-2 rounded-xl text-xs focus:border-orange-500 outline-none text-[var(--color-text-main)]"
                    />
                  </div>

                  {searchTerm.trim().length > 0 && (
                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl max-h-[160px] overflow-y-auto divide-y divide-[var(--color-border-main)]/50">
                      {filteredDealers.length === 0 ? (
                        <p className="p-3 text-[10px] text-[var(--color-text-muted)] italic text-center">No matching showrooms found.</p>
                      ) : (
                        filteredDealers.map(showroom => (
                          <button
                            key={showroom.id}
                            type="button"
                            onClick={() => {
                              setSelectedShowroom(showroom);
                              setSearchTerm('');
                            }}
                            className="w-full p-2 text-left hover:bg-orange-500/10 flex items-center justify-between text-xs transition-colors cursor-pointer"
                          >
                            <div>
                              <span className="font-black text-[var(--color-text-main)] block uppercase">{showroom.name}</span>
                              <span className="text-[8px] text-[var(--color-text-muted)] block">{showroom.location}</span>
                            </div>
                            <span className="text-[8px] font-mono bg-black/30 text-orange-400 px-1.5 py-0.5 rounded uppercase">Link ID</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Car Specs */}
        <div className="bg-[var(--color-bg-primary)] p-4 rounded-2xl border border-[var(--color-border-main)] space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] block border-b border-[var(--color-border-main)] pb-2">
            Technical Specs & Particulars
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Listing Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Toyota Land Cruiser ZX"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Make</label>
              <input
                type="text"
                required
                placeholder="e.g. Toyota"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Model</label>
              <input
                type="text"
                required
                placeholder="e.g. Land Cruiser"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Model Year</label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)] font-mono"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Price (PKR)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)] font-mono text-orange-400 font-bold"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Mileage (KM)</label>
              <input
                type="number"
                required
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as any)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-2 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Transmission</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as any)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-2 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-2 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              >
                <option value="Used">Used</option>
                <option value="New">New</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Assembly Type</label>
              <select
                value={assemblyType}
                onChange={(e) => setAssemblyType(e.target.value as any)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-2 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              >
                <option value="Local">Local Assembly</option>
                <option value="Imported">Imported</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Engine CC</label>
              <input
                type="number"
                value={engineCC}
                onChange={(e) => setEngineCC(Number(e.target.value))}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)] font-mono"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Exterior Color</label>
              <input
                type="text"
                value={exteriorColor}
                onChange={(e) => setExteriorColor(e.target.value)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Body Condition</label>
              <select
                value={bodyCondition}
                onChange={(e) => setBodyCondition(e.target.value as any)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-2 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              >
                <option value="Total Genuine">Total Genuine</option>
                <option value="Minor Touch-ups">Minor Touch-ups</option>
                <option value="Major Repaint">Major Repaint</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Registration City</label>
              <input
                type="text"
                value={registrationCity}
                onChange={(e) => setRegistrationCity(e.target.value)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as any)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-2 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              >
                <option value="Smart Card">Smart Card</option>
                <option value="Original Book">Original Book</option>
                <option value="Duplicate">Duplicate</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="tokenTax"
                checked={tokenTaxPaid}
                onChange={(e) => setTokenTaxPaid(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded border-[var(--color-border-main)] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="tokenTax" className="text-xs font-bold text-[var(--color-text-main)] select-none cursor-pointer">
                Token Tax Paid / Up to Date
              </label>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] block">Seller Remarks / Description</label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={generatingAI}
                className="text-[9px] font-black uppercase tracking-wider text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {generatingAI ? (
                  <>
                    <Loader2 size={11} className="animate-spin text-orange-500" />
                    <span className="font-mono font-bold animate-pulse text-orange-500">Formulating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={11} className="text-orange-500" />
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Provide a comprehensive technical summary, options description or special notes here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)] resize-none"
            />
          </div>
        </div>

        {/* Step 3: Media */}
        <div className="bg-[var(--color-bg-primary)] p-4 rounded-2xl border border-[var(--color-border-main)] space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--color-border-main)] pb-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] flex items-center gap-1.5">
              <ImageIcon size={13} className="text-orange-500" /> Media & Vehicle Images
            </label>
            <button
              type="button"
              onClick={handleGenerateDemoImages}
              className="text-[9px] font-bold text-orange-500 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Inject Demo Suite
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste direct HTTPS image link (e.g. Unsplash URL)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-grow bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] px-3 py-2 rounded-xl text-xs outline-none text-[var(--color-text-main)]"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* List of current image links */}
            {images.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[var(--color-border-main)] rounded-xl">
                <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 opacity-50 mb-1" />
                <p className="text-[10px] text-[var(--color-text-muted)]">No images added yet. A standard fallback icon will be used.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-xl overflow-hidden p-1.5 flex flex-col justify-between gap-1.5">
                    <img
                      src={img}
                      alt={`Vehicle item ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-16 object-cover rounded-lg"
                      onError={(e) => {
                        // fallback broken image
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="flex items-center justify-between text-[8px] text-[var(--color-text-muted)] pr-1">
                      <span className="truncate max-w-[80px] font-mono">{img}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-red-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-[#FF6B00] hover:opacity-95 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/10"
        >
          {loading ? 'Publishing Vehicle Stock...' : 'Publish Live Stock Listing'}
        </button>
      </form>
    </div>
  );
}
