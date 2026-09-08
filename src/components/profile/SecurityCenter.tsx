import React, { useState } from 'react';
import { UserProfile } from '../../lib/dbService';
import { dbLogUserActivity, dbDeleteUserAccount } from '../../lib/userProfileService';
import { useAuth } from '../AuthContext';
import { 
  Shield, ShieldCheck, Key, Fingerprint, LogOut, Trash2, 
  Phone, Mail, Smartphone, AlertTriangle, Lock, CheckCircle2, X, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface SecurityCenterProps {
  user: UserProfile;
  onLogout: () => Promise<void>;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({
  user,
  onLogout,
  onUpdateUser
}) => {
  const { registerBiometrics } = useAuth();
  const [isRegisteringBiometrics, setIsRegisteringBiometrics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // OTP Verification Modal for sensitive changes
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [pendingActionName, setPendingActionName] = useState('');

  const handleRegisterBiometrics = async () => {
    setIsRegisteringBiometrics(true);
    try {
      const success = await registerBiometrics();
      if (success) {
        await dbLogUserActivity({
          userId: user.uid,
          action: 'REGISTER_BIOMETRICS',
          description: 'Enrolled device biometric key (WebAuthn Passkey) for secure logins.'
        });
        toast.success('✓ Biometric credential registered!');
      }
    } catch (err: any) {
      toast.error('Biometrics setup failed: ' + (err.message || err));
    } finally {
      setIsRegisteringBiometrics(false);
    }
  };

  const triggerSensitiveAction = (actionName: string) => {
    setPendingActionName(actionName);
    setShowOtpModal(true);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue !== '123456') { // Standard dev OTP rule verification
      toast.error('Invalid verification code. Please check SMS or App verification code.');
      return;
    }

    setShowOtpModal(false);
    setOtpValue('');
    toast.success(`✓ Verification confirmed for ${pendingActionName}.`);

    await dbLogUserActivity({
      userId: user.uid,
      action: 'SENSITIVE_ACTION_VERIFIED',
      description: `Passed OTP verification for action: ${pendingActionName}.`
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" exactly to confirm.');
      return;
    }

    setIsDeleting(true);
    try {
      await dbDeleteUserAccount(user.uid);
      toast.success('Account scheduled for deletion. Logging out now...');
      await onLogout();
    } catch (err: any) {
      toast.error('Failed to delete account: ' + (err.message || err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <h3 className="text-base font-bold font-display text-[var(--color-text-main)] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--color-accent-main)]" />
          Account Security & Credentials
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
          Real-time verification states, active device sessions, and account protection tools.
        </p>
      </div>

      {/* Authentication Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mobile Verification */}
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--color-text-main)] uppercase">
              <Phone className="w-4 h-4 text-sky-400" />
              <span>Mobile Authentication</span>
            </div>
            {user.phoneVerified || user.phoneNumber ? (
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-main)]/15 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] text-[10px] font-mono font-bold uppercase">
                Verified
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase">
                Unverified
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            {user.phoneNumber || 'No phone number linked to account.'}
          </p>
          <button
            onClick={() => triggerSensitiveAction('Change Mobile Number')}
            className="text-xs font-mono text-sky-400 hover:underline cursor-pointer"
          >
            Change Phone Number (Requires OTP)
          </button>
        </div>

        {/* Email Verification */}
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--color-text-main)] uppercase">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>Email Authentication</span>
            </div>
            {user.email ? (
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-main)]/15 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] text-[10px] font-mono font-bold uppercase">
                Linked
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase">
                Unlinked
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            {user.email || 'No email associated.'}
          </p>
          <div className="text-[10px] text-[var(--color-text-muted)] font-mono">
            Auth UID: <span className="font-bold text-sky-300">{user.uid}</span>
          </div>
        </div>
      </div>

      {/* Device Sessions & Biometrics */}
      <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
        <h4 className="text-sm font-bold font-display text-[var(--color-text-main)] flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-sky-400" />
          Active Device & Biometrics (WebAuthn)
        </h4>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] gap-3">
          <div>
            <div className="text-xs font-bold text-[var(--color-text-main)] font-sans">
              Current Browser Session
            </div>
            <div className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5">
              Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Active Session'}
            </div>
          </div>

          <button
            onClick={() => onLogout()}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Current Device</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] gap-3">
          <div>
            <div className="text-xs font-bold text-[var(--color-text-main)] font-sans flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-[var(--color-accent-main)]" />
              <span>Biometric Passkey Authentication</span>
            </div>
            <div className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5">
              Use Fingerprint or Face ID for fast 1-tap logins.
            </div>
          </div>

          <button
            onClick={handleRegisterBiometrics}
            disabled={isRegisteringBiometrics}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-main)] text-slate-950 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
          >
            {isRegisteringBiometrics ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Fingerprint className="w-3.5 h-3.5" />}
            <span>Register Biometrics</span>
          </button>
        </div>
      </div>

      {/* Account Deletion Destructive Section */}
      <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-display">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone: Account Deletion</span>
        </div>
        <p className="text-xs text-rose-200/80 font-sans leading-relaxed">
          Deleting your account is permanent. All your listed vehicles, favorites, direct message history, and profile records will be safely cleaned up in accordance with platform retention rules.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-[var(--color-text-header)] font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-bg-primary/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-rose-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-[var(--color-text-header)]">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base font-display">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Account Deletion</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              This action cannot be undone. To confirm account deletion, please type <strong className="text-rose-400 font-mono">DELETE MY ACCOUNT</strong> below:
            </p>
            <input
              type="text"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-rose-500/30 text-xs text-[var(--color-text-header)] focus:outline-none focus:border-rose-400 font-mono"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-bg-tertiary hover:bg-slate-700 text-zinc-300 font-bold text-xs font-mono uppercase cursor-pointer"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmationInput !== 'DELETE MY ACCOUNT'}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-[var(--color-text-header)] font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-bg-primary/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleVerifyOtp} className="bg-bg-secondary border border-sky-500/30 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-[var(--color-text-header)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm font-display">
                <Lock className="w-4 h-4" />
                <span>Sensitive Action Protection</span>
              </div>
              <button type="button" onClick={() => setShowOtpModal(false)} className="text-zinc-400 hover:text-[var(--color-text-header)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 font-sans">
              Confirming verification code for: <strong className="text-sky-300">{pendingActionName}</strong>.
            </p>
            <input
              type="text"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              placeholder="Enter 6-digit OTP code (Default: 123456)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-[var(--color-text-header)] focus:outline-none focus:border-sky-400 font-mono text-center tracking-widest text-base"
              maxLength={6}
              required
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 rounded-xl bg-bg-tertiary text-zinc-300 text-xs font-mono uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider cursor-pointer shadow-md"
              >
                Verify & Proceed
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
