import React from 'react';
import { ShieldCheck, FileCheck, Brush, Shield, Handshake, ArrowRight, Check } from 'lucide-react';

interface ServicesSectionProps {
  setTab: (tab: string) => void;
  lang: 'en' | 'ur';
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ setTab, lang }) => {
  const isUrdu = lang === 'ur';

  const services = [
    {
      id: 'inspection',
      title: 'Vehicle Inspection Report',
      subtitle: '200+ Point Health Check',
      desc: 'Complete digital health check covering engine performance, suspension, paint thickness gauge, and body filler analysis.',
      icon: ShieldCheck,
      badge: 'Certified Grading'
    },
    {
      id: 'excise',
      title: 'Excise & Registration',
      subtitle: 'Biometric & Smart Card',
      desc: 'Hassle-free biometric verification, official tax clearance, vehicle transfer, and smart card registration support.',
      icon: FileCheck,
      badge: 'Government Clearance'
    },
    {
      id: 'detailing',
      title: 'Detailing & Ceramic PPF',
      subtitle: 'Paint Protection & Polish',
      desc: 'Multi-stage rotary paint correction, self-healing TPU paint protection film (PPF), and interior sterilization.',
      icon: Brush,
      badge: 'Nano Protection'
    },
    {
      id: 'sell_for_u',
      title: 'Sell For U (Consignment)',
      subtitle: 'Managed Car Sales',
      desc: 'Let our team handle everything: 4K professional photography, buyer screening, negotiations, and safe financial transfers.',
      icon: Handshake,
      badge: 'VIP Managed Sale',
      targetTab: 'sell'
    }
  ];

  return (
    <section className="w-full bg-[var(--color-bg-primary)] py-16 px-4 sm:px-6 lg:px-8 border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-accent-main)]">
              {isUrdu ? 'سروسز' : 'Automotive Excellence'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-header)] tracking-tight mt-1">
              {isUrdu ? 'آٹو چوائس سروسز' : 'Professional Automotive Services'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 font-medium">
              End-to-end support for buyers, sellers, and vehicle enthusiasts across Pakistan.
            </p>
          </div>

          <button
            onClick={() => setTab('services')}
            className="px-4 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer w-fit shadow-sm hover:border-[var(--color-accent-main)]/40"
          >
            <span>View All Services</span>
            <ArrowRight size={14} className="text-[var(--color-accent-main)]" />
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                onClick={() => setTab(s.targetTab || 'services')}
                className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[var(--color-accent-main)]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-main)]/15 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/30 flex items-center justify-center group-hover:bg-[var(--color-accent-main)] group-hover:text-white transition-colors">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--color-text-header)] tracking-tight group-hover:text-[var(--color-accent-main)] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs font-mono text-[var(--color-accent-main)] font-semibold mt-0.5">
                    {s.subtitle}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-bold text-[var(--color-accent-main)]">
                  <span>Learn More</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
