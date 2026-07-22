import React from 'react';
import { X, GitCompare, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CarListing } from '../types';

interface ShowroomComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: CarListing[];
  onRemove: (car: CarListing) => void;
  accentColor?: string;
  isDark?: boolean;
}

export function ShowroomComparisonModal({
  isOpen,
  onClose,
  compareList,
  onRemove,
  accentColor = '#FF6B00',
  isDark = true
}: ShowroomComparisonModalProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `Rs. ${(price / 10000000).toFixed(2)} Crore`;
    }
    return `Rs. ${(price / 100000).toFixed(1)} Lakh`;
  };

  const getSpecsList = (car: CarListing) => {
    const calculatedHP = car.specs?.horspower || (
      car.engineCC > 3500 ? '450 HP' :
      car.engineCC > 2400 ? '280 HP' :
      car.engineCC > 1500 ? '160 HP' : '110 HP'
    );

    const calculatedTopSpeed = car.topSpeed || (
      car.engineCC > 3500 ? '280 km/h' :
      car.engineCC > 2400 ? '250 km/h' :
      car.engineCC > 1500 ? '220 km/h' : '190 km/h'
    );

    return [
      { label: 'Price', value: formatPrice(car.price), highlight: true },
      { label: 'Year', value: car.year.toString() },
      { label: 'Condition', value: car.condition },
      { label: 'Engine Capacity', value: `${car.engineCC} CC` },
      { label: 'Transmission', value: car.transmission },
      { label: 'Fuel Type', value: car.fuelType },
      { label: 'Power', value: calculatedHP },
      { label: 'Top Speed', value: calculatedTopSpeed },
      { label: 'Body Condition', value: car.bodyCondition || 'Total Genuine' },
      { label: 'Documents', value: car.documentType || 'Smart Card' },
      { label: 'Tax Status', value: car.tokenTaxStatus || 'Paid' }
    ];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative w-full max-w-5xl rounded-3xl border overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${
              isDark 
                ? 'bg-[#0f1118] border-white/5 text-white' 
                : 'bg-white border-slate-100 text-slate-900'
            }`}
          >
            {/* Ambient Accent BG Glow */}
            <div 
              className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.03] pointer-events-none"
              style={{ backgroundColor: accentColor }}
            />

            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                  <GitCompare size={18} />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-lg md:text-xl">Fleet Comparison Desk</h3>
                  <p className={`text-[10px] uppercase font-mono tracking-widest mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Side-By-Side Spec Sheet ({compareList.length}/3 selected)
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 relative z-10">
              {compareList.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-500">
                    <GitCompare size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-300">Comparison Ledger Empty</p>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      Click the compare button (arrows) on any vehicle card in the showroom inventory grid to add them to this sheet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  compareList.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                  compareList.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-3'
                }`}>
                  {compareList.map((car) => {
                    const specs = getSpecsList(car);
                    return (
                      <div 
                        key={car.id} 
                        className={`relative rounded-2xl border flex flex-col overflow-hidden transition-all ${
                          isDark 
                            ? 'bg-white/[0.02] border-white/5 hover:border-white/10' 
                            : 'bg-slate-50 border-slate-100 hover:border-slate-200 shadow-sm'
                        }`}
                      >
                        {/* Remove Button */}
                        <button
                          onClick={() => onRemove(car)}
                          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove vehicle"
                        >
                          <X size={14} />
                        </button>

                        {/* Image Frame */}
                        <div className="aspect-video relative overflow-hidden bg-black/10 shrink-0">
                          <img
                            src={car.imageUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600'}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                          
                          <div className="absolute bottom-3 left-4 right-4 text-left">
                            <span className="text-[9px] font-mono font-bold text-orange-500 tracking-wider uppercase">
                              {car.make}
                            </span>
                            <h4 className="text-sm font-bold text-white truncate leading-snug mt-0.5">
                              {car.model}
                            </h4>
                          </div>
                        </div>

                        {/* Spec Table */}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="space-y-2 flex-1">
                            {specs.map((spec, i) => (
                              <div 
                                key={i} 
                                className={`flex justify-between items-center py-2 border-b border-white/[0.03] text-xs font-sans ${
                                  spec.highlight 
                                    ? 'border-b border-orange-500/20' 
                                    : ''
                                }`}
                              >
                                <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>
                                  {spec.label}
                                </span>
                                <span className={`font-mono ${
                                  spec.highlight 
                                    ? 'text-orange-500 font-bold text-sm' 
                                    : isDark ? 'text-slate-100' : 'text-slate-800'
                                }`}>
                                  {spec.value}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Quick CTA Actions */}
                          <div className="pt-4 mt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                            <a 
                              href={`tel:${car.price}`} // fallback, we'll prompt standard routing
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = `/?listing=${car.id}`;
                              }}
                              className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold font-mono uppercase tracking-wider transition-all"
                            >
                              <Sparkles size={11} />
                              EXPLORE
                            </a>
                            <a 
                              href={`https://wa.me/923159085086?text=${encodeURIComponent(`Hi, I am interested in comparing and purchasing the *${car.make} ${car.model}* listed on Bazar360.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider border transition-all ${
                                isDark 
                                  ? 'bg-white/5 hover:bg-white/10 border-white/5 text-gray-200' 
                                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                              }`}
                            >
                              <MessageCircle size={11} className="text-emerald-400" />
                              DISCUSS
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
