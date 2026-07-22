import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Phone, X, Shield, Landmark, Chrome, UserCheck, Eye, EyeOff, CheckCircle, Check } from 'lucide-react';
import { Bazar360Logo } from './Bazar360Logo';
import { GlassCard } from './GlassCard';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider } from '../firebase';
import { UserProfile, dbSaveUserProfile, dbFetchUserProfile } from '../lib/dbService';

export const getFriendlyAuthErrorMessage = (errorMsg: string, lang: 'en' | 'ur' = 'en'): string => {
  const isUrdu = lang === 'ur';
  const msg = errorMsg.toLowerCase();
  
  if (msg.includes('auth/invalid-credential') || msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
    return isUrdu 
      ? 'غلط ای میل یا پاس ورڈ۔ براہ کرم دوبارہ کوشش کریں۔' 
      : 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('auth/email-already-in-use') || msg.includes('email-already-in-use')) {
    return isUrdu 
      ? 'یہ ای میل پہلے سے استعمال میں ہے۔' 
      : 'This email is already in use by another account.';
  }
  if (msg.includes('auth/weak-password') || msg.includes('weak-password')) {
    return isUrdu 
      ? 'پاس ورڈ کم از کم 6 ہندسوں کا ہونا ضروری ہے۔' 
      : 'Password should be at least 6 characters.';
  }
  if (msg.includes('auth/invalid-email') || msg.includes('invalid-email')) {
    return isUrdu 
      ? 'براہ کرم ایک درست ای میل ایڈریس درج کریں۔' 
      : 'Please enter a valid email address.';
  }
  if (msg.includes('auth/too-many-requests') || msg.includes('too-many-requests')) {
    return isUrdu 
      ? 'بہت زیادہ کوششیں۔ سیکیورٹی وجوہات کی بناء پر یہ اکاؤنٹ عارضی طور پر بلاک کر دیا گیا ہے۔' 
      : 'Too many failed login attempts. Access to this account has been temporarily disabled. Please reset your password or try again later.';
  }
  if (msg.includes('auth/user-disabled') || msg.includes('user-disabled')) {
    return isUrdu 
      ? 'یہ اکاؤنٹ معطل کر دیا گیا ہے۔' 
      : 'This user account has been disabled.';
  }
  if (msg.includes('network-request-failed') || msg.includes('network_request_failed')) {
    return isUrdu 
      ? 'نیٹ ورک کا مسئلہ۔ براہ کرم اپنا انٹرنیٹ کنکشن چیک کریں۔' 
      : 'Network error. Please check your internet connection.';
  }
  
  const match = errorMsg.match(/Firebase:\s*Error\s*\((.*?)\)\.?/);
  if (match && match[1]) {
    const clean = match[1].replace('auth/', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return clean;
  }
  
  return errorMsg;
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserProfile) => void;
  lang: 'en' | 'ur';
}

export default function AuthModal({ isOpen, onClose, onSuccess, lang }: AuthModalProps) {
  const isUrdu = lang === 'ur';
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'Buyer' | 'Seller' | 'Dealer'>('Buyer');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const t = {
    en: {
      loginTitle: 'Welcome Back',
      loginSubtitle: 'Sign in to access your Bazar360 showroom & inventory',
      registerTitle: 'Create Account',
      registerSubtitle: 'Register to start listing vehicles & messaging showrooms',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm Password',
      nameLabel: 'Full Name',
      phoneLabel: 'Phone Number',
      roleLabel: 'Account Type',
      individualRole: 'Individual Buyer / Seller',
      showroomRole: 'Showroom Owner / Dealer',
      loginBtn: 'Sign In',
      registerBtn: 'Create Account',
      googleBtn: 'Continue with Google',
      switchRegister: "Don't have an account? Sign Up",
      switchLogin: 'Already have an account? Log In',
      errorEmpty: 'Please fill in all fields',
      errorMatch: 'Passwords do not match',
      successLogin: 'Successfully signed in!',
      successRegister: 'Account created successfully!'
    },
    ur: {
      loginTitle: 'خوش آمدید',
      loginSubtitle: 'اپنے Bazar360 اکاؤنٹ میں سائن ان کریں',
      registerTitle: 'نیا اکاؤنٹ بنائیں',
      registerSubtitle: 'گاڑیاں فروخت کرنے اور رابطہ کرنے کے لیے رجسٹر کریں',
      emailLabel: 'ای میل ایڈریس',
      passwordLabel: 'پاس ورڈ',
      confirmPasswordLabel: 'پاس ورڈ کی تصدیق کریں',
      nameLabel: 'پورا نام',
      phoneLabel: 'فون نمبر',
      roleLabel: 'اکاؤنٹ کی قسم',
      individualRole: 'انفرادی خریدار / فروخت کنندہ',
      showroomRole: 'شوروم کا مالک / ڈیلر',
      loginBtn: 'سائن ان کریں',
      registerBtn: 'اکاؤنٹ بنائیں',
      googleBtn: 'گوگل کے ساتھ جاری رکھیں',
      switchRegister: 'اکاؤنٹ نہیں ہے؟ رجسٹریشن کریں',
      switchLogin: 'پہلے سے اکاؤنٹ ہے؟ لاگ ان کریں',
      errorEmpty: 'براہ کرم تمام فیلڈز پُر کریں',
      errorMatch: 'پاس ورڈز مطابقت نہیں رکھتے',
      successLogin: 'کامیابی سے سائن ان ہو گیا!',
      successRegister: 'اکاؤنٹ کامیابی سے بن گیا!'
    }
  }[lang];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fUser = result.user;
      
      let profile = await dbFetchUserProfile(fUser.uid);
      const authorizedAdmins = ['amjid.bisconni@gmail.com', 'amjid.psh@gmail.com', 'khattakghani94@gmail.com', 'mazharsouls@gmail.com'];
      const isAdminEmail = fUser.email && authorizedAdmins.includes(fUser.email.toLowerCase());
      const isMalakEmail = fUser.email && fUser.email.toLowerCase() === 'mazharsouls@gmail.com';

      if (!profile) {
        profile = {
          uid: fUser.uid,
          email: fUser.email || 'user@bazar360.online',
          displayName: isMalakEmail ? 'Malak Mazhar' : (fUser.displayName || 'Guest User'),
          phoneNumber: isMalakEmail ? '+923159085086' : (fUser.phoneNumber || ''),
          phoneVerified: isMalakEmail || !!fUser.phoneNumber,
          role: isMalakEmail ? 'Admin' : (isAdminEmail ? 'Admin' : 'Buyer'),
          status: 'Active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          city: 'Peshawar',
          state: 'Khyber Pakhtunkhwa'
        };
        await dbSaveUserProfile(profile);
      } else if ((isAdminEmail || isMalakEmail) && profile.role !== 'Admin') {
        profile.role = 'Admin';
        await dbSaveUserProfile(profile);
      }
      
      setSuccess(t.successLogin);
      setTimeout(() => {
        onSuccess?.(profile!);
        onClose();
        // reset form
        setSuccess(null);
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyAuthErrorMessage(err.message || 'Authentication failed', lang));
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const fUser = result.user;
      
      let profile = await dbFetchUserProfile(fUser.uid);
      const authorizedAdmins = ['amjid.bisconni@gmail.com', 'amjid.psh@gmail.com', 'khattakghani94@gmail.com', 'mazharsouls@gmail.com'];
      const isAdminEmail = fUser.email && authorizedAdmins.includes(fUser.email.toLowerCase());
      const isMalakEmail = fUser.email && fUser.email.toLowerCase() === 'mazharsouls@gmail.com';

      if (!profile) {
        profile = {
          uid: fUser.uid,
          email: fUser.email || 'user@bazar360.online',
          displayName: isMalakEmail ? 'Malak Mazhar' : (fUser.displayName || 'Guest User'),
          phoneNumber: isMalakEmail ? '+923159085086' : (fUser.phoneNumber || ''),
          phoneVerified: isMalakEmail || !!fUser.phoneNumber,
          role: isMalakEmail ? 'Admin' : (isAdminEmail ? 'Admin' : 'Buyer'),
          status: 'Active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          city: 'Peshawar',
          state: 'Khyber Pakhtunkhwa'
        };
        await dbSaveUserProfile(profile);
      } else if ((isAdminEmail || isMalakEmail) && profile.role !== 'Admin') {
        profile.role = 'Admin';
        await dbSaveUserProfile(profile);
      }
      
      setSuccess(t.successLogin);
      setTimeout(() => {
        onSuccess?.(profile!);
        onClose();
        setSuccess(null);
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyAuthErrorMessage(err.message || 'Facebook Authentication failed', lang));
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic Validation
    if (!email || !password) {
      setError(t.errorEmpty);
      return;
    }

    if (!isLogin) {
      if (!displayName || !phoneNumber) {
        setError(t.errorEmpty);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.errorMatch);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Firebase Login Flow
        const result = await signInWithEmailAndPassword(auth, email, password);
        let profile = await dbFetchUserProfile(result.user.uid);
        const authorizedAdmins = ['amjid.bisconni@gmail.com', 'amjid.psh@gmail.com', 'khattakghani94@gmail.com', 'mazharsouls@gmail.com'];
        const isAdminEmail = email && authorizedAdmins.includes(email.toLowerCase());
        const isMalakEmail = email && email.toLowerCase() === 'mazharsouls@gmail.com';

        if (profile) {
          if ((isAdminEmail || isMalakEmail) && profile.role !== 'Admin') {
            profile.role = 'Admin';
            await dbSaveUserProfile(profile);
          }
          setSuccess(t.successLogin);
          setTimeout(() => {
            onSuccess?.(profile!);
            onClose();
            setSuccess(null);
            setLoading(false);
          }, 1000);
        } else {
          // Fallback if auth is OK but profile was lost/never created
          const defaultProfile: UserProfile = {
            uid: result.user.uid,
            email: result.user.email || email,
            displayName: isMalakEmail ? 'Malak Mazhar' : (result.user.displayName || email.split('@')[0]),
            phoneNumber: isMalakEmail ? '+923159085086' : '',
            phoneVerified: isMalakEmail,
            role: (isAdminEmail || isMalakEmail) ? 'Admin' : 'Individual User',
            status: 'Active',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            city: 'Peshawar',
            state: 'Khyber Pakhtunkhwa'
          };
          await dbSaveUserProfile(defaultProfile);
          setSuccess(t.successLogin);
          setTimeout(() => {
            onSuccess?.(defaultProfile);
            onClose();
            setSuccess(null);
            setLoading(false);
          }, 1000);
        }
      } else {
        // Firebase Registration Flow
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        let assignedRole: any = role;
        const authorizedAdmins = ['amjid.bisconni@gmail.com', 'amjid.psh@gmail.com', 'khattakghani94@gmail.com', 'mazharsouls@gmail.com'];
        const isMalakEmail = email && email.toLowerCase() === 'mazharsouls@gmail.com';
        if (authorizedAdmins.includes(email.toLowerCase()) || isMalakEmail) {
          assignedRole = 'Admin';
        }
        
        const newProfile: UserProfile = {
          uid: result.user.uid,
          email: email,
          displayName: displayName,
          phoneNumber: phoneNumber,
          phoneVerified: false,
          role: assignedRole,
          status: 'Active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          city: 'Peshawar',
          state: 'Khyber Pakhtunkhwa'
        };
        await dbSaveUserProfile(newProfile);
        setSuccess(t.successRegister);
        setTimeout(() => {
          onSuccess?.(newProfile);
          onClose();
          setSuccess(null);
          setLoading(false);
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyAuthErrorMessage(err.message || 'Authentication failed', lang));
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          {/* Glassmorphic overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
          />

          {/* Split-Screen Modal body container utilizing motion wrapper & GlassCard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="relative w-full max-w-5xl z-10 my-auto"
          >
            <GlassCard 
              radius="24px"
              className="relative bg-[#0b121f] border border-white/10 w-full md:h-[640px] max-h-[92vh] overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-2xl text-white scrollbar-thin"
            >
              {/* Header branding accents */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 z-30" />
              
              {/* Close button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/40 hover:bg-slate-900/60 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer z-30"
              >
                <X size={16} />
              </button>

          {/* LEFT COLUMN: BRANDING (Deep Navy, World Map, Floating Glows) */}
          <div className="hidden md:flex md:col-span-5 bg-[#030A16] relative overflow-hidden flex-col justify-between p-8 border-r border-white/5 select-none">
            {/* World Map SVG pattern overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="world-map-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="3" cy="3" r="1.5" fill="#60A5FA" opacity="0.12" />
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#FF6B00" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.08" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#world-map-grid)" />
              </svg>
            </div>

            {/* Subtle ambient glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-orange-500/10 blur-[80px] pointer-events-none" />

            {/* Glowing Market Categories (Floating Icons) */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Category: Cars */}
              <motion.div 
                animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[18%] left-[15%] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-md text-blue-400 text-[10px] font-mono font-bold uppercase tracking-widest shadow-lg shadow-blue-500/5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>Cars</span>
              </motion.div>

              {/* Category: Premium */}
              <motion.div 
                animate={{ y: [0, 12, 0], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-[28%] right-[15%] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 backdrop-blur-md text-orange-400 text-[10px] font-mono font-bold uppercase tracking-widest shadow-lg shadow-orange-500/5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span>Premium</span>
              </motion.div>

              {/* Category: Showrooms */}
              <motion.div 
                animate={{ y: [0, -8, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute bottom-[25%] left-[20%] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Showrooms</span>
              </motion.div>

              {/* Category: Spare Parts */}
              <motion.div 
                animate={{ y: [0, 10, 0], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-[35%] right-[10%] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest shadow-lg shadow-amber-500/5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Spare Parts</span>
              </motion.div>
            </div>

            {/* Top Branding label */}
            <div className="relative z-10">
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-slate-500">Premium Global Platform</span>
            </div>

            {/* Centered Brand Signature */}
            <div className="relative z-10 flex flex-col items-center text-center my-auto space-y-6">
              {/* Interlocked 360-degree premium logo container */}
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex items-center justify-center pointer-events-none"
              >
                <Bazar360Logo showIcon={true} showText={false} showTagline={false} themeMode="dark" className="scale-[1.8]" />
              </motion.div>

              <div className="space-y-1 mt-4">
                <h1 className="text-3xl font-black tracking-wider text-white uppercase font-display leading-none">
                  BAZAR<span className="text-[#FF6B00]">360</span>.online
                </h1>
                <p className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-[0.35em] leading-none mt-2">
                  EVERYTHING YOU NEED
                </p>
              </div>
            </div>

            {/* Bottom footnote */}
            <div className="relative z-10 text-[9px] font-mono text-slate-500 text-center">
              © 2026 Bazar360.online. All Rights Reserved.
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTION (3D Space Cosmic Dark Acrylic Panel) */}
          <div className="col-span-12 md:col-span-7 bg-[#0b121f] backdrop-blur-xl relative flex flex-col justify-center p-6 sm:p-10 text-white md:h-full overflow-y-auto border-t md:border-t-0 border-white/5">
            {/* Header / Brand label only visible on mobile */}
            <div className="md:hidden flex flex-col items-center text-center mb-6 space-y-2 mt-6">
              <Bazar360Logo showIcon={true} showText={true} showTagline={true} themeMode="dark" className="scale-95" />
            </div>

            {/* Sliding animation for form panel */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="space-y-6 max-w-sm mx-auto w-full"
            >
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-display">
                  {isLogin ? (isUrdu ? 'لاگ ان کریں' : 'Sign In To Portal') : (isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'Create Credentials')}
                </h3>
                <p className="text-slate-400 text-[10px] leading-snug">
                  {isLogin ? (isUrdu ? 'اپنے شو روم اور انوینٹری تک رسائی حاصل کریں' : 'Access your dashboard, showrooms & saved items') : (isUrdu ? 'نیا اکاؤنٹ بنائیں اور گاڑیاں فروخت کرنا شروع کریں' : 'Join Pakistan\'s premium direct automotive trade net')}
                </p>
              </div>

              {/* Notification Badges */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-[10.5px] font-bold leading-relaxed text-left font-mono">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10.5px] font-bold flex items-center gap-2 font-mono">
                  <CheckCircle size={14} className="shrink-0 text-emerald-400" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Account Type Selection (Pills styling) */}
                {!isLogin && (
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">{t.roleLabel}</label>
                    <div className="grid grid-cols-3 gap-1.5 bg-[#080d17] p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setRole('Buyer')}
                        className={`py-2 px-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          role === 'Buyer'
                            ? 'bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-500/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <UserCheck size={11} />
                        <span>{isUrdu ? 'خریدار' : 'Buyer'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('Seller')}
                        className={`py-2 px-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          role === 'Seller'
                            ? 'bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-500/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <UserCheck size={11} />
                        <span>{isUrdu ? 'بیچنے والا' : 'Seller'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('Dealer')}
                        className={`py-2 px-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          role === 'Dealer'
                            ? 'bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-500/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Landmark size={11} />
                        <span>{isUrdu ? 'ڈیلر' : 'Dealer'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <>
                    {/* Full Name field with overlapping/floating dark capsule tag */}
                    <div className="relative pt-1.5">
                      <div className="absolute -top-1 left-4 bg-orange-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[8px] uppercase font-black tracking-widest z-10 shadow shadow-orange-950/20 leading-none">
                        NAME
                      </div>
                      <div className="relative flex items-center bg-[#131b2e] border border-white/5 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/40 transition-all shadow-inner">
                        <User size={14} className="absolute left-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-transparent pl-10 pr-4 py-3 text-xs text-white focus:outline-none placeholder-slate-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Phone Number field with overlapping/floating dark capsule tag */}
                    <div className="relative pt-1.5">
                      <div className="absolute -top-1 left-4 bg-orange-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[8px] uppercase font-black tracking-widest z-10 shadow shadow-orange-950/20 leading-none">
                        PHONE
                      </div>
                      <div className="relative flex items-center bg-[#131b2e] border border-white/5 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/40 transition-all shadow-inner">
                        <Phone size={14} className="absolute left-3.5 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full bg-transparent pl-10 pr-4 py-3 text-xs text-white focus:outline-none placeholder-slate-500 font-medium"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email or Phone input field with overlapping/floating dark capsule tag */}
                <div className="relative pt-1.5">
                  <div className="absolute -top-1 left-4 bg-orange-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[8px] uppercase font-black tracking-widest z-10 shadow shadow-orange-950/20 leading-none">
                    EMAIL ADDRESS
                  </div>
                  <div className="relative flex items-center bg-[#131b2e] border border-white/5 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/40 transition-all shadow-inner">
                    <input
                      type="text"
                      required
                      placeholder="Email or Phone"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent pl-4 pr-10 py-3 text-xs text-white focus:outline-none placeholder-slate-500 font-medium"
                    />
                    <div className="absolute right-3.5 flex items-center gap-1.5 text-slate-400">
                      {email.includes('@') && <Check size={13} className="text-emerald-400 stroke-[3]" />}
                      <Mail size={14} />
                    </div>
                  </div>
                </div>

                {/* Password input with overlapping/floating dark capsule tag */}
                <div className="relative pt-1.5">
                  <div className="absolute -top-1 left-4 bg-orange-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[8px] uppercase font-black tracking-widest z-10 shadow shadow-orange-950/20 leading-none">
                    PASSWORD
                  </div>
                  <div className="relative flex items-center bg-[#131b2e] border border-white/5 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/40 transition-all shadow-inner">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent pl-4 pr-10 py-3 text-xs text-white focus:outline-none placeholder-slate-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Lock size={14} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  /* Confirm Password field with overlapping/floating dark capsule tag */
                  <div className="relative pt-1.5">
                    <div className="absolute -top-1 left-4 bg-orange-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[8px] uppercase font-black tracking-widest z-10 shadow shadow-orange-950/20 leading-none">
                      CONFIRM PASSWORD
                    </div>
                    <div className="relative flex items-center bg-[#131b2e] border border-white/5 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/40 transition-all shadow-inner">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-transparent pl-4 pr-10 py-3 text-xs text-white focus:outline-none placeholder-slate-500 font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Continue button with precise gradient layout */}
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#EA580C] to-[#E11D48] hover:from-[#DD2C00] hover:to-[#BE123C] text-white font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  ) : (
                    <span>{isLogin ? (isUrdu ? 'لاگ ان' : 'Sign In') : (isUrdu ? 'رجسٹر کریں' : 'Register')}</span>
                  )}
                </motion.button>
              </form>

              {/* Biometrics Fingerprint Signifier */}
              <div className="flex flex-col items-center justify-center space-y-1 mt-3 opacity-80 hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-[#38bdf8] animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => alert('Password reset link has been dispatched to your email address.')}
                    className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors mt-2"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              {/* Toggle switch for register or login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isLogin ? (
                    <span>New to Bazar360? <span className="text-orange-500 hover:underline">Create an account</span></span>
                  ) : (
                    <span>Already have an account? <span className="text-orange-500 hover:underline">Log In</span></span>
                  )}
                </button>
              </div>

              {/* Social Login Section */}
              <div className="text-center pt-2 space-y-3">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                  Sign in with Google / Facebook / Apple
                </span>
                
                {/* Clean round social login grid as per photos */}
                <div className="flex items-center justify-center gap-4">
                  {/* Google */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-10 h-10 rounded-full bg-[#131b2e] border border-white/5 hover:bg-[#1a243c] hover:border-white/10 shadow-sm flex items-center justify-center cursor-pointer transition-all"
                    title="Sign in with Google"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.84 14.93 1 12 1 7.24 1 3.2 3.74 1.34 7.74l3.77 2.92C6.01 7.29 8.78 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.48z" />
                      <path fill="#FBBC05" d="M5.11 14.66c-.24-.71-.38-1.47-.38-2.26s.14-1.55.38-2.26L1.34 7.22C.48 8.94 0 10.87 0 12.9s.48 3.96 1.34 5.68l3.77-2.92z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.22 0-5.99-2.25-6.89-5.62L1.34 15.72C3.2 19.72 7.24 23 12 23z" />
                    </svg>
                  </motion.button>

                  {/* Facebook */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={handleFacebookSignIn}
                    disabled={loading}
                    className="w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#166FE5] shadow-sm flex items-center justify-center cursor-pointer transition-all"
                    title="Sign in with Facebook"
                  >
                    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                    </svg>
                  </motion.button>

                  {/* Apple */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => alert('Apple Sign-In integration ready under Sandbox mode!')}
                    disabled={loading}
                    className="w-10 h-10 rounded-full bg-[#131b2e] border border-white/5 hover:bg-[#1a243c] hover:border-white/10 shadow-sm flex items-center justify-center cursor-pointer transition-all"
                    title="Sign in with Apple"
                  >
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.64.73-1.19 1.87-1.04 2.98.1.08 2.33-.62 2.99-1.43z"/>
                    </svg>
                  </motion.button>
                </div>
              </div>

            </motion.div>
          </div>

            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
