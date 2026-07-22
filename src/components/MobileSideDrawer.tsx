/**
 * MobileSideDrawer.tsx
 * The high-speed full-screen sliding Hamburger drawer component for mobile screens.
 * Contains: Home, Inventory, Showrooms, My Bookings, Saved Vehicles, Settings, and Logout.
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Home, 
  Car, 
  MapPin, 
  CalendarCheck, 
  Heart, 
  Settings, 
  LogOut, 
  User, 
  Sparkles,
  Info
} from 'lucide-react';
import { UserProfile } from '../lib/dbService';

interface MobileSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onLoginClick: () => void;
  lang: 'en' | 'ur';
}

export default function MobileSideDrawer({
  isOpen,
  onClose,
  currentTab,
  setTab,
  currentUser,
  onLogout,
  onLoginClick,
  lang
}: MobileSideDrawerProps) {

  if (!isOpen) return null;

  const handleLinkClick = (tabId: string, subTab?: string) => {
    setTab(tabId);
    if (subTab && window.dispatchEvent) {
      // Dispatch custom event to select sub-tab inside the profile dashboard
      const event = new CustomEvent('set-profile-subtab', { detail: subTab });
      window.dispatchEvent(event);
    }
    onClose();
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'inventory', label: 'Inventory', icon: <Car size={18} /> },
    { id: 'dealers', label: 'Showrooms', icon: <MapPin size={18} /> },
    { id: 'community', label: 'Community Hub', icon: <Sparkles size={18} className="text-orange-500 animate-pulse" /> },
    { id: 'profile', subTab: 'bookings', label: 'My Bookings', icon: <CalendarCheck size={18} /> },
    { id: 'favorites', label: 'Saved Vehicles', icon: <Heart size={18} className="text-rose-500" /> },
    { id: 'profile', subTab: 'settings', label: 'Settings', icon: <Settings size={18} /> }
  ];

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Backdrop with elegant blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Slideout Panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="absolute top-0 bottom-0 left-0 w-[300px] bg-slate-900 border-r border-slate-800 flex flex-col justify-between overflow-y-auto text-slate-100 shadow-2xl"
      >
        <div>
          {/* Header Banner */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-orange-600/20 to-slate-900">
            <div>
              <span className="text-lg font-black tracking-widest text-white font-display">
                BAZAR<span className="text-orange-500">360</span>
              </span>
              <p className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest mt-0.5">
                Automotive Hub
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700"
              title="Close Drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Account Segment */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/50">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center font-black text-lg uppercase shadow shadow-orange-500/20">
                  {(currentUser.displayName || currentUser.email || 'U').substring(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-xs font-bold text-white truncate">
                    {currentUser.displayName || 'Bazar360 Member'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/25 text-orange-400 text-[8px] font-mono font-bold uppercase tracking-wider rounded">
                    {currentUser.role || 'Member'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-mono">
                  Access Showrooms & Perks
                </p>
                <button
                  onClick={() => {
                    onLoginClick();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <User size={13} strokeWidth={3} />
                  <span>Login / Register</span>
                </button>
              </div>
            )}
          </div>

          {/* Main Drawer Navigation Links */}
          <div className="p-4 space-y-2">
            <p className="px-3 text-[9px] font-mono font-black text-orange-500/80 uppercase tracking-widest mb-3">
              Menu Navigation
            </p>
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={`${item.id}-${item.label}`}
                    onClick={() => handleLinkClick(item.id, item.subTab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                      isActive 
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                        : 'text-slate-300 hover:bg-slate-800/60 border-transparent hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Block */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
          {currentUser && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <LogOut size={14} />
              <span>Log Out Account</span>
            </button>
          )}

          <div className="text-center">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              Bazar360 &copy; 2026.online
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
