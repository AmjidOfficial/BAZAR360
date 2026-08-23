'use client';

import React from 'react';
import { motion } from 'motion/react';

interface AnimatedVehicleCardProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export function AnimatedVehicleCard({ children, index = 0, className = '' }: AnimatedVehicleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -6, 
        scale: 1.025,
        transition: { type: 'spring', stiffness: 350, damping: 22 }
      }}
      whileTap={{ scale: 0.985 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.07, 0.5),
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
