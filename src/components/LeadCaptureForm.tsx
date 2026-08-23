import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { dbSaveLead } from '../lib/dbService';

const LeadSchema = z.object({
  userName: z.string().min(2, "Name is required"),
  userPhone: z.string().min(10, "Phone is required").transform((val) => {
    const clean = val.trim();
    if (clean.startsWith('0')) return '+92' + clean.substring(1);
    if (!clean.startsWith('+92') && clean.length > 0) return clean.startsWith('92') ? '+' + clean : '+92' + clean;
    return clean;
  }),
  userEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
  vehicleTitle: z.string().min(1, "Vehicle is required"),
  inquiryMessage: z.string().max(2000).optional(),
});

type LeadFormInput = z.infer<typeof LeadSchema>;

interface LeadCaptureFormProps {
  vehicleId: string;
  vehicleTitle: string;
  showroomOwnerId?: string;
  showroomId?: string;
  customerId?: string;
  source?: 'vehicle_contact' | 'showroom_contact' | 'whatsapp' | 'call_request' | 'test_drive' | 'price_request' | 'information_request';
}

export default function LeadCaptureForm({ vehicleId, vehicleTitle, showroomOwnerId, showroomId, customerId, source = 'vehicle_contact' }: LeadCaptureFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormInput>({
    resolver: zodResolver(LeadSchema),
    defaultValues: { vehicleTitle }
  });

  const onSubmit = async (data: LeadFormInput) => {
    setSubmitting(true);
    try {
      const normalizedPhone = data.userPhone.replace(/\s+/g, '');
      const dedupeKey = `${vehicleId}:${normalizedPhone}`;
      const now = new Date().toISOString();
      const leadId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      await dbSaveLead({
        id: leadId,
        type: 'Vehicle Inquiry',
        title: `Live Lead: ${data.vehicleTitle}`,
        userName: data.userName,
        userPhone: normalizedPhone,
        userEmail: data.userEmail || '',
        details: data.inquiryMessage || '',
        customerId: customerId || 'guest',
        vehicleId,
        showroomOwnerId: showroomOwnerId || undefined,
        showroomId: showroomId || undefined,
        source,
        inquiryDate: now,
        status: 'New',
        dedupeKey,
        lastActivityAt: now,
        createdAt: now,
        updatedAt: now
      });

      toast.success('Your inquiry has been sent successfully.');
      reset({ vehicleTitle });
    } catch (err) {
      console.error('[LeadCaptureForm] lead submission failed', err);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3 bg-[var(--color-bg-secondary)] p-4 rounded-2xl border border-[var(--color-border-main)]">
      <div>
        <h3 className="text-lg font-bold text-[var(--color-text-main)] tracking-tight">Request Info</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">We will send your inquiry to the relevant seller or showroom.</p>
      </div>

      <label className="block">
        <span className="sr-only">Your name</span>
        <input {...register('userName')} aria-invalid={Boolean(errors.userName)} aria-describedby={errors.userName ? 'lead-name-error' : undefined} placeholder="Your Name" autoComplete="name" className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-main)]" />
      </label>
      {errors.userName && <p id="lead-name-error" role="alert" className="text-red-500 text-xs">{errors.userName.message}</p>}

      <label className="block">
        <span className="sr-only">Phone number</span>
        <input {...register('userPhone')} aria-invalid={Boolean(errors.userPhone)} aria-describedby={errors.userPhone ? 'lead-phone-error' : undefined} placeholder="Phone Number" inputMode="tel" autoComplete="tel" className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-main)]" />
      </label>
      {errors.userPhone && <p id="lead-phone-error" role="alert" className="text-red-500 text-xs">{errors.userPhone.message}</p>}

      <label className="block">
        <span className="sr-only">Email address, optional</span>
        <input {...register('userEmail')} placeholder="Email (optional)" inputMode="email" autoComplete="email" className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-main)]" />
      </label>

      <label className="block">
        <span className="sr-only">Inquiry message</span>
        <textarea {...register('inquiryMessage')} placeholder="What would you like to know?" rows={4} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-[var(--color-text-main)]" />
      </label>

      <button type="submit" disabled={submitting} aria-busy={submitting} className="w-full bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-hover)] disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2">
        {submitting ? 'Submitting...' : <><Send size={12} /> Submit Inquiry</>}
      </button>
    </form>
  );
}
