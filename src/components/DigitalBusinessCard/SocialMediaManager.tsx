import React from 'react';
import { Dealer, SocialAccount } from '../../types';

interface SocialMediaManagerProps {
  dealer: Dealer;
  onUpdateDealer: (updatedDealer: Dealer) => void;
}

export const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ dealer, onUpdateDealer }) => {
  const socialAccounts = dealer.socialAccounts || [];
  
  return (
    <div className="p-4 bg-slate-950 text-white rounded-2xl">
      <h3 className="text-lg font-bold">Manage Social Media</h3>
      {socialAccounts.map((account) => (
        <div key={account.id} className="flex justify-between items-center mt-2 p-2 bg-slate-800 rounded">
            <span>{account.platform}</span>
            <span>{account.username}</span>
        </div>
      ))}
    </div>
  );
};
