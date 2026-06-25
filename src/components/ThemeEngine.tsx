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

// Default Gateway Space Cyber Dark Theme Variables
export const DEFAULT_THEME_VARIABLES = {
  bgPrimary: '#0F172A',
  bgSecondary: '#111827',
  textMain: '#FFFFFF',
  textMuted: '#CBD5E1',
  borderMain: 'rgba(255,255,255,0.08)',
  accentMain: '#2563EB',
  accentHover: '#3B82F6'
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
  }
];

export default function ThemeEngine() {
  const [themeVars, setThemeVars] = useState(DEFAULT_THEME_VARIABLES);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [isLiveSynced, setIsLiveSynced] = useState(true);

  // Apply the variables directly to the root element :root
  const applyVariablesToRoot = (vars: typeof DEFAULT_THEME_VARIABLES) => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg-primary', vars.bgPrimary);
    root.style.setProperty('--color-bg-secondary', vars.bgSecondary);
    root.style.setProperty('--color-text-main', vars.textMain);
    root.style.setProperty('--color-text-muted', vars.textMuted);
    root.style.setProperty('--color-border-main', vars.borderMain);
    root.style.setProperty('--color-accent-main', vars.accentMain);
    root.style.setProperty('--color-accent-hover', vars.accentHover);
    
    // Set legacy theme overrides to prevent styling discrepancies
    root.style.setProperty('--brand-bg', vars.bgPrimary);
    root.style.setProperty('--brand-text', vars.textMain);
    root.style.setProperty('--brand-border', vars.borderMain);
    root.style.setProperty('--brand-accent', vars.accentMain);
    root.style.setProperty('--brand-accent-hover', vars.accentHover);
  };

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
  }, []);

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
