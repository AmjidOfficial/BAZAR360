import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isFloatingMenuOpen: boolean;
  setIsFloatingMenuOpen: (open: boolean) => void;
  isMobileViewport: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState<boolean>(false);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isFloatingMenuOpen,
        setIsFloatingMenuOpen,
        isMobileViewport,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
