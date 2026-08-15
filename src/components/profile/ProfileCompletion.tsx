import React from 'react';
import { UserProfile } from '../../lib/dbService';
import { calculateProfileCompletion } from '../../lib/userProfileService';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface ProfileCompletionProps {
  user: UserProfile;
  onCompleteField?: (fieldKey: string) => void;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  user,
  onCompleteField
}) => {
  const result = calculateProfileCompletion(user);

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] shadow-sm text-[var(--color-text-main)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <h4 className="text-[11px] font-mono font-black uppercase tracking-wider text-[var(--color-text-header)]">
            Profile Strength
          </h4>
        </div>
        <span className="text-xs font-mono font-black text-sky-500">
          {result.percentage}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[var(--color-bg-primary)] rounded-full overflow-hidden p-0.5 border border-[var(--color-border-main)] mb-2.5">
        <div 
          className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-[var(--color-accent-main)] rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${result.percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-sans mb-2">
        <span>{result.completedFieldsCount} of {result.totalFieldsCount} key details provided</span>
        {result.percentage === 100 ? (
          <span className="text-[var(--color-accent-main)] font-bold flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Completed!
          </span>
        ) : (
          <span className="text-amber-500 font-bold font-mono">
            {result.missingFields.length} field{result.missingFields.length > 1 ? 's' : ''} left
          </span>
        )}
      </div>

      {/* List missing fields */}
      {result.missingFields.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-[var(--color-border-main)]">
          <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Missing details:
          </p>
          <div className="flex flex-wrap gap-1">
            {result.missingFields.map((field) => (
              <button
                key={field.key}
                onClick={() => onCompleteField && onCompleteField(field.key)}
                className="px-2 py-0.5 rounded-md bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] text-[10px] text-[var(--color-text-main)] flex items-center gap-1 transition-all cursor-pointer font-sans"
              >
                <AlertCircle className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                <span>Add {field.label}</span>
                <ArrowRight className="w-2.5 h-2.5 text-sky-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
