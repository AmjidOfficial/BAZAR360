import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const TAGLINES = [
  "Bazar360: Drive Your Future, Today.",
  "Auto Choice | The Right Choice: Where Every Road Leads to Your Perfect Ride.",
  "Bazar360: Seamless Journeys, Smarter Automotive Choices.",
  "Your Dream Vehicle Awaits: Backed by The Right Choice."
];

export function TaglineDisplay() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-20 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.h2
          key={TAGLINES[index]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight font-sans text-slate-100 text-center"
        >
          {TAGLINES[index]}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}
