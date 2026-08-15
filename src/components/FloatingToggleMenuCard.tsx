import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Layers, 
  Car, 
  PlusSquare, 
  Users, 
  UserCheck, 
  Menu, 
  X,
  Sparkles,
  ExternalLink,
  Globe,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react';
import { UserProfile } from '../lib/dbService';

interface FloatingToggleMenuCardProps {
  currentTab?: string;
  setTab?: (tab: string) => void;
  currentUser?: UserProfile | null;
  onLoginClick?: () => void;
  onLogout?: () => void;
  onOpenMenu?: () => void;
  className?: string;
}

export default function FloatingToggleMenuCard({ 
  currentTab = 'home',
  setTab,
  currentUser,
  onLoginClick,
  onLogout,
  onOpenMenu,
  className = '' 
}: FloatingToggleMenuCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (onOpenMenu) {
      onOpenMenu();
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNavClick = (tabId: string, customAction?: () => void) => {
    setIsOpen(false);
    if (customAction) {
      customAction();
    } else if (setTab) {
      setTab(tabId);
    }
  };

  const menuItems = [
    {
      id: 'home',
      text: 'Home',
      icon: Home,
      hoverClass: 'hover:bg-blue-600 hover:text-white',
      badge: null
    },
    {
      id: 'services',
      text: 'Services Hub',
      icon: Layers,
      hoverClass: 'hover:bg-purple-600 hover:text-white',
      badge: 'PRO'
    },
    {
      id: 'inventory',
      text: 'Buy Cars',
      icon: Car,
      hoverClass: 'hover:bg-pink-600 hover:text-white',
      badge: 'Hot'
    },
    {
      id: 'sell',
      text: 'Post Adv.',
      icon: PlusSquare,
      hoverClass: 'hover:bg-orange-500 hover:text-white',
      badge: '+ Free'
    },
    {
      id: 'community',
      text: 'Community',
      icon: Users,
      hoverClass: 'hover:bg-emerald-600 hover:text-white',
      badge: 'Live'
    },
    {
      id: 'profile',
      text: currentUser ? 'My Profile' : 'Sign In',
      icon: UserCheck,
      hoverClass: 'hover:bg-slate-700 hover:text-white',
      action: !currentUser && onLoginClick ? onLoginClick : undefined,
      badge: currentUser ? currentUser.role || 'Member' : 'Login'
    }
  ];

  return (
    <nav ref={containerRef} className={`mobile-nav-container lg:hidden ${className}`}>
      {/* Menu Toggle Button */}
      <div 
        className="menu-toggle cursor-pointer" 
        onClick={handleToggle}
        aria-label="Toggle Navigation Menu"
        title={isOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </div>

      {/* Wrapper / Navigation Box overlaying below the button */}
      <div className={`wrapper ${isOpen ? 'active' : ''}`}>
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-orange-500" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Bazar360 Menu
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
            v2026
          </span>
        </div>

        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleNavClick(item.id, item.action)}
                  className={`group relative flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="icon text-orange-500 group-hover:text-white transition-colors">
                      <Icon size={18} />
                    </span>
                    <span className="text font-semibold ml-2 group-hover:text-white transition-colors">
                      {item.text}
                    </span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 group-hover:bg-white/20 group-hover:text-white transition-all">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Quick Social links bar at the bottom */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-around text-gray-400">
          <a href="https://bazar360.online" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors p-1" title="Website">
            <Globe size={16} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors p-1" title="Instagram">
            <Instagram size={16} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors p-1" title="Twitter">
            <Twitter size={16} />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition-colors p-1" title="YouTube">
            <Youtube size={16} />
          </a>
        </div>
      </div>
    </nav>
  );
}

