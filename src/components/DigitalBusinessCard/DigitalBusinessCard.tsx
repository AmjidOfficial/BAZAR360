import React, { useState } from 'react';
import { Dealer } from '../../types';
import { BusinessCardFront } from './BusinessCardFront';
import { BusinessCardBack } from './BusinessCardBack';

interface DigitalBusinessCardProps {
  dealer: Dealer;
  onUpdateDealer?: (updated: Dealer) => void;
}

export const DigitalBusinessCard: React.FC<DigitalBusinessCardProps> = ({ dealer, onUpdateDealer }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = 'dark'; // Default theme for now

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="w-full max-w-[400px] cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {isFlipped ? (
            <div style={{ transform: 'rotateY(180deg)' }}>
                <BusinessCardBack dealer={dealer} theme={theme} />
            </div>
        ) : (
            <BusinessCardFront dealer={dealer} theme={theme} />
        )}
      </div>
      <p className="text-sm text-gray-500">Click card to flip</p>
    </div>
  );
};
