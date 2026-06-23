import React, { useState, useRef, useEffect } from 'react';
import { Store, Phone } from 'lucide-react';

export default function DealerSignup() {
  const [step, setStep] = useState<'details' | 'verification'>('details');
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const inputRefs = [ref0, ref1, ref2, ref3];

  const handleGetCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName && phoneNumber) {
      setStep('verification');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(value.length - 1);
    }
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  useEffect(() => {
    if (step === 'verification') {
      inputRefs[0].current?.focus();
    }
  }, [step]);

  return (
    <div className="bg-[#0b1324] border border-[#1f2937] rounded-3xl p-8 max-w-md w-full shadow-2xl mx-auto">
      {step === 'details' ? (
        <form onSubmit={handleGetCode} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Showroom Setup</h2>
            <p className="text-gray-400 text-sm mt-2">Zero-friction onboarding for verified dealers.</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Store className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-[#070c18] border border-[#1f2937] text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#00d2ff] transition-colors placeholder-gray-500 font-medium"
                placeholder="Showroom Business Name"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-[#070c18] border border-[#1f2937] text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#00d2ff] transition-colors placeholder-gray-500 font-medium"
                placeholder="Mobile Phone Number"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!businessName || !phoneNumber}
            className="w-full bg-[#00d2ff] hover:bg-[#00d2ff]/90 text-slate-950 font-black py-4 rounded-xl uppercase tracking-widest text-sm transition-all shadow-lg shadow-[#00d2ff]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Get Verification Code →
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-fade-in text-center">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Verification</h2>
            <p className="text-gray-400 text-sm mt-2">
              Enter the 4-digit code sent to <br /><span className="text-white font-mono">{phoneNumber}</span>
            </p>
          </div>

          <div className="flex justify-center gap-4 py-4">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-14 h-16 text-center text-2xl font-black text-[#00d2ff] bg-[#070c18] border border-[#1f2937] rounded-xl focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition-all"
              />
            ))}
          </div>

          <button
            type="button"
            className="text-gray-400 hover:text-white text-xs font-bold transition-colors underline decoration-gray-600 underline-offset-4"
            onClick={() => setStep('details')}
          >
            Change Phone Number
          </button>
        </div>
      )}
    </div>
  );
}
