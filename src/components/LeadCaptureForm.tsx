import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { dbSaveLead } from '../lib/dbService';

const LeadSchema = z.object({
  userName: z.string().min(2, "Name is required"),
  userPhone: z.string().min(10, "Phone is required"),
  vehicleTitle: z.string().min(1, "Vehicle is required"),
  inquiryMessage: z.string().optional(),
});

type LeadFormInput = z.infer<typeof LeadSchema>;

interface LeadCaptureFormProps {
  vehicleId: string;
  vehicleTitle: string;
  showroomOwnerId: string;
  customerId?: string;
}

export default function LeadCaptureForm({ vehicleId, vehicleTitle, showroomOwnerId, customerId }: LeadCaptureFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormInput>({
    resolver: zodResolver(LeadSchema),
    defaultValues: { vehicleTitle }
  });

  const onSubmit = async (data: LeadFormInput) => {
    setSubmitting(true);
    try {
      const leadId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await dbSaveLead({
        id: leadId,
        type: 'Showroom Inquiry',
        title: `🚨 Live Lead: ${data.vehicleTitle} Sourced`,
        userName: data.userName,
        userPhone: data.userPhone,
        userEmail: '', // Optional
        city: 'Peshawar', // Default
        details: data.inquiryMessage || '',
        customerId: customerId || 'guest',
        vehicleId,
        showroomOwnerId,
        inquiryDate: new Date().toISOString(),
        status: 'New',
        createdAt: new Date().toISOString()
      });
      
      toast.success('Inquiry submitted successfully!');
      reset();
    } catch (err) {
      toast.error('Failed to submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
      <h3 className="text-lg font-bold text-slate-100 font-sans tracking-tight">Request Info</h3>
      
      <input {...register("userName")} placeholder="Your Name" className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-slate-200" />
      {errors.userName && <p className="text-red-500 text-xs">{errors.userName.message}</p>}
      
      <input {...register("userPhone")} placeholder="Phone Number" className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-slate-200" />
      {errors.userPhone && <p className="text-red-500 text-xs">{errors.userPhone.message}</p>}
      
      <textarea {...register("inquiryMessage")} placeholder="Inquiry Message" className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-slate-200" />
      
      <button 
        type="submit"
        disabled={submitting}
        className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-2.5 px-6 rounded-md uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2"
      >
        {submitting ? 'Submitting...' : <><Send size={12} /> Submit Inquiry</>}
      </button>
    </form>
  );
}
