import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  currentTab?: string;
}

export function ScrollToTopButton({ currentTab }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Show in inventory/search/explore/home views when scrolled > 500px
  const isTargetView = !currentTab || ['home', 'explore', 'search', 'inventory', 'dealer-storefront', 'showroom-hq'].includes(currentTab);

  if (!isTargetView) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          aria-label="Back to Top"
          className="fixed bottom-24 md:bottom-28 left-4 md:left-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] hover:from-[#8B5CF6] hover:to-[#2563EB] text-white shadow-xl shadow-[#7C3AED]/30 border border-[#7C3AED]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
        >
          <ArrowUp size={20} className="group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
