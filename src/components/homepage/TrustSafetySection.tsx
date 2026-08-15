import React from 'react';
import { ShieldCheck, FileCheck, PhoneCall, DollarSign, Award, CheckCircle2 } from 'lucide-react';

interface TrustSafetySectionProps {
  lang: 'en' | 'ur';
}

export const TrustSafetySection: React.FC<TrustSafetySectionProps> = ({ lang }) => {
  const isUrdu = lang === 'ur';

  const pillars = [
    {
      title: isUrdu ? '۱۰۰٪ تصدیق شدہ ڈیلرز' : 'Verified Vehicles & Showrooms',
      desc: isUrdu 
        ? 'پشاور، اسلام آباد اور تمام بڑے شہروں کے ڈیلرز کے لائسنس اور بایومیٹرک ریکارڈز مکمل طور پر تصدیق شدہ ہیں۔'
        : 'Every showroom undergoes physical address validation, owner biometric checks, and legal verification.',
      icon: ShieldCheck,
    },
    {
      title: isUrdu ? '۲۰۰+ پوائنٹ انسپکشن' : '200+ Point Inspection',
      desc: isUrdu 
        ? 'انجن، گیئر، باڈی فلر، پینٹ گیج اور سسپنشن کا مکمل ڈیجیٹل معائنہ رپورٹ۔'
        : 'Comprehensive digital inspection covering engine compression, transmission, frame integrity, and paint analysis.',
      icon: FileCheck,
    },
    {
      title: isUrdu ? 'براہ راست واٹس ایپ سودا' : 'Direct Seller Connections',
      desc: isUrdu 
        ? 'بغیر کسی درمیانی ایجنٹ یا کمیشن کے براہ راست مالک یا شوروم کے ساتھ سودا کریں۔'
        : 'Connect directly with verified owners and showrooms via instant WhatsApp. Zero commission, 100% transparent deals.',
      icon: PhoneCall,
    },
    {
      title: isUrdu ? 'شفاف قیمتیں' : 'Real Seller Valuation',
      desc: isUrdu 
        ? 'پاکستان کے حقیقی آٹو مارکیٹ ریٹ کے مطابق شفاف قیمتیں۔'
        : 'Fair market valuation in PKR Lakh/Crore updated daily across all major Pakistani automotive hubs.',
      icon: DollarSign,
    }
  ];

  return (
    <section className="w-full bg-[#FFFFFF] py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-[#E2E8F0] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-[#007979]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#007979]/10 border border-[#007979]/20 text-[#007979] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Award size={14} />
            <span>{isUrdu ? 'بازار۳۶۰ کی ضمانت' : 'The Bazar360 Promise'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            {isUrdu ? 'ہم پر کیوں اعتماد کریں؟' : 'Why Choose Bazar360?'}
          </h2>
          <p className="text-sm text-[#64748B] mt-2 leading-relaxed font-medium">
            {isUrdu 
              ? 'پاکستان کے جدید ترین آٹوموٹو نیٹ ورک پر ہر سودا محفوظ، شفاف اور قابل اعتماد ہے۔'
              : 'Pakistan’s premier verified automotive marketplace connecting authentic buyers, sellers, and premier showrooms.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[#007979]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#007979]/10 border border-[#007979]/20 text-[#007979] flex items-center justify-center mb-5">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center gap-1.5 text-xs font-mono text-[#007979] font-bold">
                  <CheckCircle2 size={14} />
                  <span>Verified Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

