import React, { useState } from 'react';
import { UserProfile, dbUpdateProfile } from '../../lib/dbService';
import { dbLogUserActivity } from '../../lib/userProfileService';
import { Settings, Eye, Phone, Mail, Bell, MessageSquare, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PrivacySettingsProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  user,
  onUpdateUser
}) => {
  const [showPhonePublicly, setShowPhonePublicly] = useState(
    user.privacySettings?.showPhonePublicly ?? true
  );
  const [showEmailPublicly, setShowEmailPublicly] = useState(
    user.privacySettings?.showEmailPublicly ?? false
  );
  const [emailAlerts, setEmailAlerts] = useState(
    user.notificationSettings?.emailAlerts ?? true
  );
  const [smsAlerts, setSmsAlerts] = useState(
    user.notificationSettings?.smsAlerts ?? true
  );
  const [whatsappAlerts, setWhatsappAlerts] = useState(
    user.notificationSettings?.whatsappAlerts ?? true
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedFields: Partial<UserProfile> = {
        privacySettings: {
          showPhonePublicly,
          showEmailPublicly
        },
        notificationSettings: {
          emailAlerts,
          smsAlerts,
          whatsappAlerts
        },
        updatedAt: new Date().toISOString()
      };

      await dbUpdateProfile(user.uid, updatedFields);
      
      const updatedUser: UserProfile = {
        ...user,
        ...updatedFields
      };

      if (onUpdateUser) onUpdateUser(updatedUser);

      await dbLogUserActivity({
        userId: user.uid,
        action: 'UPDATE_PRIVACY_SETTINGS',
        description: 'Updated account privacy controls and notification preference toggles.'
      });

    } catch (err: any) {
      toast.error('Failed to update settings: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <h3 className="text-base font-bold font-display text-[var(--color-text-main)] flex items-center gap-2">
          <Settings className="w-4 h-4 text-sky-400" />
          Privacy Controls & Notification Channels
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
          Choose what contact information is visible to buyers and configure alert notifications.
        </p>
      </div>

      {/* Privacy Toggles */}
      <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-2">
          Profile Visibility Settings
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[var(--color-text-main)] font-sans flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>Show Mobile Number on Vehicle Listings</span>
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] font-sans">
                Allows interested buyers to call or WhatsApp you directly from your vehicle postings.
              </div>
            </div>
            <input
              type="checkbox"
              checked={showPhonePublicly}
              onChange={(e) => setShowPhonePublicly(e.target.checked)}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[var(--color-text-main)] font-sans flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>Show Email Address Publicly</span>
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] font-sans">
                Displays your email address on your public showroom / seller profile card.
              </div>
            </div>
            <input
              type="checkbox"
              checked={showEmailPublicly}
              onChange={(e) => setShowEmailPublicly(e.target.checked)}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-2">
          Notification Preferences
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[var(--color-text-main)] font-sans flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-sky-400" />
                <span>Email Notifications</span>
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] font-sans">
                Receive email alerts for listing moderation status, new direct messages, and saved searches.
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[var(--color-text-main)] font-sans flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[var(--color-accent-main)]" />
                <span>WhatsApp Instant Alerts</span>
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] font-sans">
                Receive high-priority WhatsApp messages when buyers send direct lead inquiries.
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>
    </div>
  );
};
