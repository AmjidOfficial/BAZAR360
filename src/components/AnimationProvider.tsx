import React, { createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';

// Centralize our attractive animation variants
export const pageTransitions: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0], // smooth cubic-bezier
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

export const hoverEffects: any = {
  lift: {
    whileHover: { y: -4, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 }
  },
  expand: {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.96 }
  },
  subtle: {
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.99 }
  }
};

const AnimationContext = createContext({});

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AnimationContext.Provider value={{}}>
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </AnimationContext.Provider>
  );
};
