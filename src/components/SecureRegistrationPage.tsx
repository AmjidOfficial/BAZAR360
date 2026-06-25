import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ShieldCheck, LogIn, Eye, EyeOff } from 'lucide-react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';

interface SecureRegistrationPageProps {
  onSuccess: (payload: {
    email: string;
    fullName: string;
    phoneNumber: string;
    userRole: 'customer' | 'showroom_admin' | 'admin';
    residentialCity: string;
  }) => void;
}

export default function SecureRegistrationPage({ onSuccess }: SecureRegistrationPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userRole, setUserRole] = useState<'customer' | 'showroom_admin'>('customer');
  const [city, setCity] = useState('Peshawar');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Authenticate existing user
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = credential.user;
        
        setSuccess(`Welcome back, ${user.displayName || user.email}! Session authorized successfully.`);
        
        onSuccess({
          email: user.email || email,
          fullName: user.displayName || 'Authorized Member',
          phoneNumber: phoneNumber || '+92 314 9198403',
          userRole: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
          residentialCity: city
        });
      } else {
        // Create new user credentials
        if (!fullName.trim() || !phoneNumber.trim()) {
          throw new Error('Please fill out your full name and mobile number.');
        }

        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = credential.user;

        // Sync displayName onto auth object
        await updateProfile(user, { displayName: fullName.trim() });

        setSuccess(`Account registered! Profile synchronized under ID: ${user.uid}.`);
        
        onSuccess({
          email: user.email || email,
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          userRole: userRole === 'showroom_admin' ? 'showroom_admin' : 'customer',
          residentialCity: city
        });
      }
    } catch (err: any) {
      console.warn("Auth pipeline message:", err);
      // Friendly, clean error categorization
      let errMsg = err.message || 'An error occurred during verification.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errMsg = 'Invalid email or password credentials. Please verify and retry.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already linked with an active account. Try Logging In.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Security strength failure: password must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'The email address format is invalid.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#1E293B] border border-white/5 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden text-left text-white">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldCheck size={24} className="text-sky-400" />
          <h3 className="text-lg font-sans font-black uppercase tracking-tight text-white">
            {isLogin ? 'SECURE SESSION LOGIN' : 'RECREATIONAL REGISTRATION'}
          </h3>
        </div>
        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-1">
          {isLogin ? 'Authorized Identity Gateway' : 'Create multi-tenant trade account'}
        </p>
      </div>

      {/* Forms */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-semibold">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-semibold">
            ✓ {success}
          </div>
        )}

        {!isLogin && (
          <>
            <div>
              <label className="text-[10px] font-mono uppercase text-gray-400 tracking-wider block mb-1">Full Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="Muhammad Amjid"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#111827] border border-white/5 rounded-xl p-3 pl-10 text-xs text-white focus:outline-none focus:border-[#2563EB] focus:bg-[#111827] transition-all placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-gray-400 tracking-wider block mb-1">Mobile Phone Number *</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  required
                  placeholder="03149198403"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#111827] border border-white/5 rounded-xl p-3 pl-10 text-xs text-white focus:outline-none focus:border-[#2563EB] focus:bg-[#111827] transition-all placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-gray-400 tracking-wider block mb-1">Onboarding Role</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setUserRole('customer')}
                  className={`py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all border ${
                    userRole === 'customer'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-sm'
                      : 'bg-[#111827] text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  Private Seller
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('showroom_admin')}
                  className={`py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all border ${
                    userRole === 'showroom_admin'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm'
                      : 'bg-[#111827] text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  Showroom Admin
                </button>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-[10px] font-mono uppercase text-gray-400 tracking-wider block mb-1">Email Address *</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              required
              placeholder="dealer@bazar360.online"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111827] border border-white/5 rounded-xl p-3 pl-10 text-xs text-white focus:outline-none focus:border-[#2563EB] focus:bg-[#111827] transition-all placeholder-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase text-gray-400 tracking-wider block mb-1">Security Password *</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111827] border border-white/5 rounded-xl p-3 pl-10 text-xs text-white focus:outline-none focus:border-[#2563EB] focus:bg-[#111827] transition-all placeholder-gray-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase text-gray-400 tracking-wider block mb-1">Primary Market City</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-[#111827] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#2563EB] cursor-pointer focus:bg-[#111827] transition-all"
          >
            <option value="Peshawar">Peshawar (Almas Car Valley)</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 text-white font-sans font-black py-3 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all mt-6 shadow-md cursor-pointer"
        >
          <LogIn size={14} />
          {loading ? 'Authenticating...' : isLogin ? 'Sign In Securely' : 'Complete Registration'}
        </button>
      </form>

      {/* Switcher */}
      <div className="text-center mt-6 border-t border-white/5 pt-4">
        <button
          onClick={() => {
            setError('');
            setIsLogin(!isLogin);
          }}
          className="text-[10px] font-mono text-gray-400 uppercase tracking-widest hover:text-[#38BDF8] underline transition-colors"
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
}
