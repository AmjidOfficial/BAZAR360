import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Plus, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ShowroomFABMenuProps {
  whatsappNumber?: string;
  onNavigateToSell?: () => void;
}

export default function ShowroomFABMenu({ 
  whatsappNumber = '03159085086', 
  onNavigateToSell 
}: ShowroomFABMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Format whatsapp number: strip non-numeric and ensure PKR/92 prefix is clean if user specified 0315...
  const rawNum = whatsappNumber.replace(/\D/g, '');
  const cleanNumber = rawNum.startsWith('0') 
    ? '92' + rawNum.slice(1) 
    : rawNum.startsWith('92') 
      ? rawNum 
      : '92' + rawNum;

  const handlePostAd = () => {
    setIsOpen(false);
    if (onNavigateToSell) {
      onNavigateToSell();
    } else {
      navigate('/sell');
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-50 flex flex-col items-end gap-3 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-end gap-3"
          >
            {/* WhatsApp Contact Action */}
            <motion.a
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              href={`https://wa.me/${cleanNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-emerald-500/20 shadow-xl px-4 py-2.5 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 group transition-all duration-300 border-none"
            >
              <span className="text-xs font-sans font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                WhatsApp Contact
              </span>
              <div className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/20">
                <MessageCircle size={18} className="stroke-[2.5]" />
              </div>
            </motion.a>

            {/* Post an Ad Action */}
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePostAd}
              className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-orange-500/20 shadow-xl px-4 py-2.5 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-950/20 group transition-all duration-300 border-none cursor-pointer"
            >
              <span className="text-xs font-sans font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Post an Ad
              </span>
              <div className="w-10 h-10 bg-[#FF6B00] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#FF6B00]/20">
                <Plus size={18} className="stroke-[2.5]" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer border ${
          isOpen 
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-slate-200 shadow-slate-950/20' 
            : 'bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 dark:from-slate-950 dark:to-slate-900 text-orange-500 border-orange-200/50 dark:border-slate-800 shadow-orange-500/10'
        }`}
        title="Showroom Actions"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          {isOpen ? <X size={24} className="stroke-[2.5]" /> : <Menu size={24} className="stroke-[2.5]" />}
        </motion.div>
      </motion.button>
    </div>
  );
}
