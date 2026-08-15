import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Check, 
  Sliders, 
  Info, 
  Lock,
  Globe,
  Radio,
  Eye,
  RefreshCw
} from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { useTheme } from './ThemeContext';

// Default Deep Forest Emerald Theme Variables for Auto Choice powered by Bazar360.online
export const DEFAULT_THEME_VARIABLES = {
  bgPrimary: '#0B1B15', // Deep Forest Emerald Base
  bgSecondary: 'rgba(18, 42, 33, 0.85)', // Frosted Emerald Glass Cards
  textMain: '#ECFDF5', // Crisp Light Mint
  textHeader: '#FFFFFF', // Pure White
  textMuted: '#A7F3D0', // Soft Sage
  borderMain: 'rgba(134, 239, 172, 0.18)',
  accentMain: '#10B981', // Luminous Emerald
  accentHover: '#059669',
  fontFamilyHeader: '"Plus Jakarta Sans", sans-serif',
  fontFamilyBody: '"Inter", ui-sans-serif, system-ui, sans-serif'
};

// Preset Gateway Themes
export const PRESETS = [
  {
    id: 'gateway-cyber',
    name: 'Gateway Space Cyber',
    desc: 'Deep space obsidian with high-energy cybernetic sky blue.',
    vars: {
      bgPrimary: '#030712',
      bgSecondary: '#0b0f19',
      textMain: '#f3f4f6',
      textMuted: '#9ca3af',
      borderMain: 'rgba(56, 189, 248, 0.12)',
      accentMain: '#38BDF8',
      accentHover: '#0ea5e9'
    }
  },
  {
    id: 'khyber-emerald',
    name: 'Khyber Emerald Velvet',
    desc: 'Regal mountain emerald velvet with sharp gold accents.',
    vars: {
      bgPrimary: '#021812',
      bgSecondary: '#04281e',
      textMain: '#ecfdf5',
      textMuted: '#86efac',
      borderMain: 'rgba(16, 185, 129, 0.15)',
      accentMain: '#d4af37',
      accentHover: '#b4966e'
    }
  },
  {
    id: 'obsidian-gold',
    name: 'Bespoke Gold Prestige',
    desc: 'High-end champagne luxury with polished carbon black.',
    vars: {
      bgPrimary: '#070708',
      bgSecondary: '#0e0e11',
      textMain: '#fcf8f2',
      textMuted: '#b4966e',
      borderMain: 'rgba(197, 168, 128, 0.12)',
      accentMain: '#c5a880',
      accentHover: '#e1cdb5'
    }
  },
  {
    id: 'crisp-navy-light',
    name: 'Crisp Navy Light',
    desc: 'Clean crisp white and light grey with elegant deep navy text.',
    vars: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f1f5f9',
      textMain: '#0f172a',
      textMuted: '#475569',
      borderMain: '#cbd5e1',
      accentMain: '#1e40af',
      accentHover: '#1d4ed8'
    }
  }
];

export default function ThemeEngine() {
  const { theme, setTheme } = useTheme();
  const [themeVars, setThemeVars] = useState<typeof DEFAULT_THEME_VARIABLES>(() => {
    try {
      const savedVars = localStorage.getItem('bazar360_theme_vars');
      if (savedVars) {
        return JSON.parse(savedVars);
      }
    } catch (e) {
      console.warn('Failed to parse theme_vars from localStorage:', e);
    }
    return DEFAULT_THEME_VARIABLES;
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [isLiveSynced, setIsLiveSynced] = useState(true);

  // Apply the variables directly to the root element :root
  const applyVariablesToRoot = (vars: typeof DEFAULT_THEME_VARIABLES) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      // In dark mode, we let standard dark classes handle colors
      root.style.removeProperty('--color-bg-primary');
      root.style.removeProperty('--color-bg-secondary');
      root.style.removeProperty('--color-text-main');
      root.style.removeProperty('--color-text-muted');
      root.style.removeProperty('--color-border-main');
      root.style.removeProperty('--color-accent-main');
      root.style.removeProperty('--color-accent-hover');
      root.style.removeProperty('--font-family-header');
      root.style.removeProperty('--font-family-body');
      
      root.style.removeProperty('--brand-bg');
      root.style.removeProperty('--brand-text');
      root.style.removeProperty('--brand-border');
      root.style.removeProperty('--brand-accent');
      root.style.removeProperty('--brand-accent-hover');
      return;
    }

    if (theme === 'light') {
      // In light mode, if vars equals default dark vars, clean up root properties so .light in index.css takes full effect
      if (!vars || vars.bgPrimary === DEFAULT_THEME_VARIABLES.bgPrimary) {
        root.style.removeProperty('--color-bg-primary');
        root.style.removeProperty('--color-bg-secondary');
        root.style.removeProperty('--color-text-main');
        root.style.removeProperty('--color-text-header');
        root.style.removeProperty('--color-text-muted');
        root.style.removeProperty('--color-border-main');
        root.style.removeProperty('--color-accent-main');
        root.style.removeProperty('--color-accent-hover');
        root.style.removeProperty('--font-family-header');
        root.style.removeProperty('--font-family-body');
        
        root.style.removeProperty('--brand-bg');
        root.style.removeProperty('--brand-text');
        root.style.removeProperty('--brand-text-header');
        root.style.removeProperty('--brand-border');
        root.style.removeProperty('--brand-accent');
        root.style.removeProperty('--brand-accent-hover');
        return;
      }
    }

    root.style.setProperty('--color-bg-primary', vars.bgPrimary);
    root.style.setProperty('--color-bg-secondary', vars.bgSecondary);
    root.style.setProperty('--color-text-main', vars.textMain);
    root.style.setProperty('--color-text-header', vars.textHeader);
    root.style.setProperty('--color-text-muted', vars.textMuted);
    root.style.setProperty('--color-border-main', vars.borderMain);
    root.style.setProperty('--color-accent-main', vars.accentMain);
    root.style.setProperty('--color-accent-hover', vars.accentHover);
    root.style.setProperty('--font-family-header', vars.fontFamilyHeader);
    root.style.setProperty('--font-family-body', vars.fontFamilyBody);
    
    // Set legacy theme overrides to prevent styling discrepancies
    root.style.setProperty('--brand-bg', vars.bgPrimary);
    root.style.setProperty('--brand-text', vars.textMain);
    root.style.setProperty('--brand-text-header', vars.textHeader);
    root.style.setProperty('--brand-border', vars.borderMain);
    root.style.setProperty('--brand-accent', vars.accentMain);
    root.style.setProperty('--brand-accent-hover', vars.accentHover);
  };

  // Re-apply when theme mode or themeVars changes and persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bazar360_theme', theme);
      if (themeVars) {
        localStorage.setItem('bazar360_theme_vars', JSON.stringify(themeVars));
      }
    } catch (e) {
      // ignore
    }
    applyVariablesToRoot(themeVars);
  }, [theme, themeVars]);

  // Initial mount retrieval from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('bazar360_theme') as 'dark' | 'light';
      if (savedTheme === 'dark' || savedTheme === 'light') {
        if (savedTheme !== theme) {
          setTheme(savedTheme);
        }
      }
      const savedVars = localStorage.getItem('bazar360_theme_vars');
      if (savedVars) {
        const parsed = JSON.parse(savedVars);
        setThemeVars(parsed);
        applyVariablesToRoot(parsed);
      }
    } catch (e) {
      console.warn('Error reading theme from localStorage:', e);
    }
  }, []);

  // Listen to the Firestore "system/theme" document in real-time
  useEffect(() => {
    const themeDocRef = doc(db, 'system', 'theme');
    
    // First, verify if we need to seed
    const checkAndSeed = async () => {
      try {
        const snap = await getDoc(themeDocRef);
        if (!snap.exists()) {
          console.log('Theme document does not exist. Seeding default Gateway variables...');
          await setDoc(themeDocRef, DEFAULT_THEME_VARIABLES);
        }
      } catch (err) {
        console.warn('Unable to query/seed theme document, falling back to real-time listener or static state:', err);
      }
    };
    checkAndSeed();

    const unsubscribe = onSnapshot(themeDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as typeof DEFAULT_THEME_VARIABLES;
        // Basic schema verification
        if (data.bgPrimary && data.accentMain && data.textMain) {
          setThemeVars(data);
          applyVariablesToRoot(data);
          setIsLiveSynced(true);
        }
      } else {
        // Fallback to defaults
        applyVariablesToRoot(DEFAULT_THEME_VARIABLES);
      }
      setLoading(false);
    }, (error) => {
      console.warn('Real-time theme engine listener status: Offline (using defaults)', error);
      // Non-critical fallback
      applyVariablesToRoot(DEFAULT_THEME_VARIABLES);
      setIsLiveSynced(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [theme]); // Add theme as a dependency so it captures the latest state when listener triggers

  const handleUpdateField = (key: keyof typeof DEFAULT_THEME_VARIABLES, val: string) => {
    const updated = { ...themeVars, [key]: val };
    setThemeVars(updated);
    applyVariablesToRoot(updated);
  };

  const handleApplyPreset = (presetVars: typeof DEFAULT_THEME_VARIABLES) => {
    setThemeVars(presetVars);
    applyVariablesToRoot(presetVars);
  };

  const handleResetToDefault = () => {
    setThemeVars(DEFAULT_THEME_VARIABLES);
    applyVariablesToRoot(DEFAULT_THEME_VARIABLES);
  };

  const handlePushToFirestore = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const themeDocRef = doc(db, 'system', 'theme');
      await setDoc(themeDocRef, themeVars);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save variables globally to Firestore:', err);
      alert('Failed to save to Firestore. Verify database rules or connection.');
    } finally {
      setIsSaving(false);
    }
  };

  // If loading and we haven't applied styles yet, render a silent indicator or nothing to prevent layout flashing
  if (loading) {
    return null;
  }

  return null;
}
