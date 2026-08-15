import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  SquarePen, 
  Search, 
  SlidersHorizontal, 
  Heart, 
  Home, 
  Plus, 
  MessageSquare, 
  User, 
  Check, 
  Rocket, 
  Edit3, 
  Store, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  Wifi,
  Signal,
  Battery,
  ArrowLeft,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { useTheme } from './ThemeContext';

interface MobileNativeExperienceProps {
  setTab?: (tab: string) => void;
  lang?: 'en' | 'ur';
}

export default function MobileNativeExperience({ setTab, lang = 'en' }: MobileNativeExperienceProps) {
  const { theme } = useTheme();
  const [activeScreen, setActiveScreen] = useState<'welcome' | 'messages' | 'profile'>('welcome');
  const [messagesCategory, setMessagesCategory] = useState<'all' | 'general' | 'support'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  // Chat Data for Messages Screen
  const chatList = [
    {
      id: '1',
      name: 'Tesla Certified Peshawar',
      avatar: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=120&q=80',
      message: 'Hi! Is the Model 3 Long Range still available for test drive?',
      time: '2m ago',
      online: true,
      category: 'general',
      badge: 'Certified'
    },
    {
      id: '2',
      name: 'Auto Choice Flagship',
      avatar: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=120&q=80',
      message: 'The Porsche 911 GT3 RS is prepped and available on Ring Road.',
      time: '1h ago',
      online: true,
      category: 'support',
      badge: 'Official'
    },
    {
      id: '3',
      name: 'BMW of Islamabad',
      avatar: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=120&q=80',
      message: 'Thanks for your interest in X5 M Competition! Token accepted.',
      time: '3h ago',
      online: false,
      category: 'general',
      badge: 'Dealer'
    },
    {
      id: '4',
      name: 'Muhammad Amjid (Founder)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      message: 'Welcome to Bazar360 Auto Choice ecosystem! Let us know if you need assistance.',
      time: 'Yesterday',
      online: true,
      category: 'support',
      badge: 'Founder'
    },
    {
      id: '5',
      name: 'John Smith (Verified Buyer)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      message: 'More interior pics sent via WhatsApp!',
      time: '2 days ago',
      online: false,
      category: 'general',
      badge: 'Buyer'
    }
  ];

  const filteredChats = chatList.filter(chat => {
    const matchesCategory = messagesCategory === 'all' || chat.category === messagesCategory;
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          chat.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[var(--color-bg-secondary)] py-8 px-2 sm:px-6 transition-colors duration-300 font-sans">
      
      {/* Top Banner Control */}
      <div className="max-w-6xl mx-auto mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles size={14} /> Mobile App Experience
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-[var(--color-text-header)] uppercase tracking-tight">
          Bazar360 <span className="text-orange-500">AutoMarket</span> Smartphone Interface
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
          Pixel-perfect native iOS/Android mobile app reproduction with interactive tabs, floating glass bottom navigation bar, live chat simulator, and showroom profile.
        </p>

        {/* Desktop Screen Switcher Buttons */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setActiveScreen('welcome')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeScreen === 'welcome'
                ? 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/25 scale-105'
                : 'bg-white dark:bg-bg-secondary text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-border-main hover:border-orange-500/50'
            }`}
          >
            1. Welcome Onboarding
          </button>
          <button
            onClick={() => setActiveScreen('messages')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeScreen === 'messages'
                ? 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/25 scale-105'
                : 'bg-white dark:bg-bg-secondary text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-border-main hover:border-orange-500/50'
            }`}
          >
            2. Messages Hub
          </button>
          <button
            onClick={() => setActiveScreen('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeScreen === 'profile'
                ? 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/25 scale-105'
                : 'bg-white dark:bg-bg-secondary text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-border-main hover:border-orange-500/50'
            }`}
          >
            3. User Profile
          </button>
        </div>
      </div>

      {/* 3 MOBILE PHONE MOCKUPS GRID (SHOW ALL 3 ON DESKTOP, OR SHOW ACTIVE SCREEN ON MOBILE) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center items-start">

        {/* ======================================================= */}
        {/* PHONE 1: WELCOME ONBOARDING SCREEN */}
        {/* ======================================================= */}
        <div className={`w-full max-w-[360px] bg-white text-slate-900 rounded-[44px] shadow-[0_25px_60px_rgba(0,0,0,0.18)] border-8 border-slate-900 dark:border-border-main overflow-hidden relative flex flex-col justify-between min-h-[720px] transition-all duration-300 ${
          activeScreen === 'welcome' ? 'ring-4 ring-orange-500 scale-[1.02]' : 'hidden md:flex opacity-90'
        }`}>
          {/* Status Bar */}
          <div className="flex items-center justify-between px-7 pt-3.5 pb-2 text-xs font-bold font-sans select-none shrink-0 text-slate-900">
            <span>9:30</span>
            <div className="flex items-center gap-1.5 text-slate-900">
              <Signal size={13} />
              <Wifi size={13} />
              <Battery size={15} />
            </div>
          </div>

          {/* Hero Porsche Vehicle Image */}
          <div className="relative w-full h-[250px] bg-gradient-to-b from-purple-100 via-purple-50 to-white flex items-center justify-center p-4">
            <img 
              src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80" 
              alt="Porsche GT3 RS"
              className="w-full h-full object-cover rounded-3xl shadow-md"
            />
            {/* Rocket Floating Icon */}
            <div className="absolute bottom-2 left-6 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur border border-purple-200 shadow-lg flex items-center justify-center text-purple-600">
              <Rocket size={20} />
            </div>
          </div>

          {/* Body Content */}
          <div className="px-6 py-4 flex-1 flex flex-col justify-between space-y-4 text-left">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Welcome to <br />
                <span className="text-orange-500">AutoMarket!</span>
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                Buy and sell cars with confidence. Join thousands of happy customers.
              </p>
            </div>

            {/* Feature Value Pills */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-bg-secondary text-[var(--color-text-header)] flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  AI - Powered Price valuation
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-bg-secondary text-[var(--color-text-header)] flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Verified Sellers & Buyers
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-bg-secondary text-[var(--color-text-header)] flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Secure In - App Messaging
                </span>
              </div>
            </div>

            {/* Dark Pill CTA Button */}
            <button 
              onClick={() => {
                if (setTab) setTab('sell');
              }}
              className="w-full py-4 rounded-full bg-bg-secondary hover:bg-black text-[var(--color-text-header)] font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>Sell Your Car</span>
              <Rocket size={15} className="text-orange-400" />
            </button>
          </div>

          {/* Bottom Bar Indicator */}
          <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto my-2 shrink-0" />
        </div>

        {/* ======================================================= */}
        {/* PHONE 2: MESSAGES HUB SCREEN */}
        {/* ======================================================= */}
        <div className={`w-full max-w-[360px] bg-slate-50 text-slate-900 rounded-[44px] shadow-[0_25px_60px_rgba(0,0,0,0.18)] border-8 border-slate-900 dark:border-border-main overflow-hidden relative flex flex-col justify-between min-h-[720px] transition-all duration-300 ${
          activeScreen === 'messages' ? 'ring-4 ring-orange-500 scale-[1.02]' : 'hidden md:flex opacity-90'
        }`}>
          {/* Status Bar */}
          <div className="flex items-center justify-between px-7 pt-3.5 pb-2 text-xs font-bold font-sans select-none shrink-0 text-slate-900 bg-slate-50">
            <span>9:30</span>
            <div className="flex items-center gap-1.5 text-slate-900">
              <Signal size={13} />
              <Wifi size={13} />
              <Battery size={15} />
            </div>
          </div>

          {/* Top Header */}
          <div className="px-6 pt-2 pb-3 flex items-center justify-between bg-slate-50 border-b border-slate-200/60">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Messages
            </h2>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-100 transition-colors">
                <Camera size={16} />
              </button>
              <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-100 transition-colors">
                <SquarePen size={16} />
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="px-5 py-3 space-y-3 bg-slate-50">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
              />
              <SlidersHorizontal size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted cursor-pointer" />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button 
                onClick={() => setMessagesCategory('all')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  messagesCategory === 'all'
                    ? 'bg-bg-secondary text-[var(--color-text-header)] shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setMessagesCategory('general')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  messagesCategory === 'general'
                    ? 'bg-bg-secondary text-[var(--color-text-header)] shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                General
              </button>
              <button 
                onClick={() => setMessagesCategory('support')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  messagesCategory === 'support'
                    ? 'bg-bg-secondary text-[var(--color-text-header)] shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Support
              </button>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto max-h-[360px] custom-scrollbar text-left">
            {filteredChats.map((chat) => (
              <div 
                key={chat.id}
                className="p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-400 transition-all flex items-center justify-between gap-3 shadow-sm cursor-pointer"
              >
                <div className="relative shrink-0">
                  <img 
                    src={chat.avatar} 
                    alt={chat.name} 
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--color-accent-main)] rounded-full border-2 border-white shadow-sm" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {chat.name}
                    </h4>
                    <span className="text-[10px] text-text-muted font-mono shrink-0">
                      {chat.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted truncate mt-0.5">
                    {chat.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Glassmorphism Floating Bottom Bar inside Phone */}
          <div className="p-3 bg-slate-50 flex items-center justify-center">
            <div className="w-full bg-white/90 backdrop-blur-md border border-slate-200 rounded-full p-1.5 shadow-lg flex items-center justify-between px-3">
              <button onClick={() => setActiveScreen('welcome')} className="p-2 text-text-muted hover:text-slate-900 transition-colors">
                <Home size={18} />
              </button>
              <button onClick={() => { if (setTab) setTab('sell'); }} className="p-2 text-text-muted hover:text-slate-900 transition-colors">
                <Plus size={18} />
              </button>
              <button onClick={() => setActiveScreen('messages')} className="px-3.5 py-1.5 rounded-full bg-bg-secondary text-[var(--color-text-header)] font-bold text-xs flex items-center gap-1.5 shadow-md">
                <MessageSquare size={14} />
                <span>Messages</span>
              </button>
              <button onClick={() => setActiveScreen('profile')} className="p-2 text-text-muted hover:text-slate-900 transition-colors">
                <User size={18} />
              </button>
            </div>
          </div>

          {/* Bottom Bar Indicator */}
          <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto my-2 shrink-0" />
        </div>

        {/* ======================================================= */}
        {/* PHONE 3: USER PROFILE & SHOWROOM HUB SCREEN */}
        {/* ======================================================= */}
        <div className={`w-full max-w-[360px] bg-slate-50 text-slate-900 rounded-[44px] shadow-[0_25px_60px_rgba(0,0,0,0.18)] border-8 border-slate-900 dark:border-border-main overflow-hidden relative flex flex-col justify-between min-h-[720px] transition-all duration-300 ${
          activeScreen === 'profile' ? 'ring-4 ring-orange-500 scale-[1.02]' : 'hidden md:flex opacity-90'
        }`}>
          {/* Status Bar */}
          <div className="flex items-center justify-between px-7 pt-3.5 pb-2 text-xs font-bold font-sans select-none shrink-0 text-slate-900 bg-white">
            <span>9:30</span>
            <div className="flex items-center gap-1.5 text-slate-900">
              <Signal size={13} />
              <Wifi size={13} />
              <Battery size={15} />
            </div>
          </div>

          {/* Hero Banner with Overlapping Avatar */}
          <div className="relative w-full h-[140px] bg-slate-200">
            <img 
              src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80" 
              alt="Porsche Banner"
              className="w-full h-full object-cover"
            />
            <button className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-slate-900 shadow">
              <ArrowLeft size={16} />
            </button>
            <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-slate-900 shadow">
              <MoreHorizontal size={16} />
            </button>

            {/* Overlapping Avatar */}
            <div className="absolute -bottom-10 left-6 relative">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" 
                alt="Steven Clark Avatar"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-bg-secondary text-[var(--color-text-header)] font-mono text-[9px] font-bold uppercase tracking-wider shadow">
                Pro
              </span>
            </div>
          </div>

          {/* Profile Name & Follow Action */}
          <div className="px-6 pt-12 pb-2 flex items-start justify-between text-left">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Muhammad Amjid
              </h3>
              <p className="text-xs text-text-muted font-medium">
                Top-rated user since 2020
              </p>
            </div>
            <button 
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isFollowing
                  ? 'bg-[var(--color-accent-main)] text-[var(--color-text-header)] shadow-md'
                  : 'bg-bg-secondary text-[var(--color-text-header)] hover:bg-black'
              }`}
            >
              <Heart size={12} className={isFollowing ? 'fill-white' : ''} />
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </button>
          </div>

          {/* Stats Grid Counters */}
          <div className="px-6 py-2 grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-sm">
              <span className="block text-lg font-black text-slate-900">3</span>
              <span className="text-[10px] text-text-muted font-bold uppercase">Listed</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-sm">
              <span className="block text-lg font-black text-slate-900">7</span>
              <span className="text-[10px] text-text-muted font-bold uppercase">Sold</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-sm">
              <span className="block text-lg font-black text-slate-900">12</span>
              <span className="text-[10px] text-text-muted font-bold uppercase">Saved</span>
            </div>
          </div>

          {/* Action Buttons Stack */}
          <div className="px-6 space-y-2 py-1">
            <button 
              onClick={() => { if (setTab) setTab('profile'); }}
              className="w-full py-2.5 rounded-2xl bg-bg-secondary hover:bg-black text-[var(--color-text-header)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>

            <button 
              onClick={() => { if (setTab) setTab('dealers'); }}
              className="w-full py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
            >
              <Store size={14} className="text-orange-500" />
              <span>Showroom HQ Hub</span>
            </button>
          </div>

          {/* Profile Settings Rows */}
          <div className="px-6 py-2 space-y-2 text-left">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Profile Settings
            </h4>
            <div 
              onClick={() => { if (setTab) setTab('favorites'); }}
              className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer hover:border-slate-400 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Heart size={16} className="text-rose-500" />
                <span>Saved Cars</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <span className="text-xs font-mono font-bold">12</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>

          {/* Floating Glass Bottom Nav */}
          <div className="p-3 bg-slate-50 flex items-center justify-center">
            <div className="w-full bg-white/90 backdrop-blur-md border border-slate-200 rounded-full p-1.5 shadow-lg flex items-center justify-between px-3">
              <button onClick={() => setActiveScreen('welcome')} className="p-2 text-text-muted hover:text-slate-900 transition-colors">
                <Home size={18} />
              </button>
              <button onClick={() => { if (setTab) setTab('sell'); }} className="p-2 text-text-muted hover:text-slate-900 transition-colors">
                <Plus size={18} />
              </button>
              <button onClick={() => setActiveScreen('messages')} className="p-2 text-text-muted hover:text-slate-900 transition-colors">
                <MessageSquare size={18} />
              </button>
              <button onClick={() => setActiveScreen('profile')} className="px-3.5 py-1.5 rounded-full bg-bg-secondary text-[var(--color-text-header)] font-bold text-xs flex items-center gap-1.5 shadow-md">
                <User size={14} />
                <span>Profile</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar Indicator */}
          <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto my-2 shrink-0" />
        </div>

      </div>
    </div>
  );
}
