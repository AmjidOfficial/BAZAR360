import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  Info, 
  Award, 
  Compass, 
  Layers, 
  BookOpen, 
  ChevronRight, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface SpecInfo {
  id: string;
  make: string;
  model: string;
  variant: string;
  engine: string;
  power: string;
  fuelEconomy: string;
  chassisCode: string;
}

const SPEC_DATABASE: SpecInfo[] = [
  {
    id: 's-1',
    make: 'Toyota',
    model: 'Aqua',
    variant: 'S Grade Hybrid',
    engine: '1496cc Hybrid L4',
    power: '73 HP / 111 Nm',
    fuelEconomy: '26-29 km/L',
    chassisCode: 'NHP10'
  },
  {
    id: 's-2',
    make: 'Toyota',
    model: 'Fortuner',
    variant: 'Legender Sigma4',
    engine: '2755cc Turbo Diesel',
    power: '201 HP / 500 Nm',
    fuelEconomy: '10-12 km/L',
    chassisCode: 'GUN156'
  },
  {
    id: 's-3',
    make: 'Suzuki',
    model: 'Alto',
    variant: 'VXL AGS',
    engine: '658cc R06A I3',
    power: '39 HP / 56 Nm',
    fuelEconomy: '18-22 km/L',
    chassisCode: 'HA36S'
  },
  {
    id: 's-4',
    make: 'Honda',
    model: 'Civic',
    variant: 'Oriel Turbo',
    engine: '1498cc VTEC Turbo',
    power: '176 HP / 220 Nm',
    fuelEconomy: '12-14 km/L',
    chassisCode: 'FE1'
  },
  {
    id: 's-5',
    make: 'byd',
    model: 'Sealion 6',
    variant: 'PHEV AWD',
    engine: '1498cc Plug-In Hybrid',
    power: '318 HP / 550 Nm',
    fuelEconomy: '17-20 km/L (Hybrid)',
    chassisCode: 'SD-P'
  }
];

const VALUATION_DATA = [
  { year: '2021', Alto: 1.6, Aqua: 3.4, Civic: 4.2, Fortuner: 11.5 },
  { year: '2022', Alto: 2.1, Aqua: 4.1, Civic: 5.6, Fortuner: 14.5 },
  { year: '2023', Alto: 2.6, Aqua: 5.2, Civic: 7.8, Fortuner: 18.2 },
  { year: '2024', Alto: 2.9, Aqua: 5.8, Civic: 8.5, Fortuner: 19.8 },
];

export default function MarketInsightsView() {
  const [dbSearch, setDbSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<SpecInfo | null>(SPEC_DATABASE[1]);

  const filteredSpecs = SPEC_DATABASE.filter(s =>
    s.make.toLowerCase().includes(dbSearch.toLowerCase()) ||
    s.model.toLowerCase().includes(dbSearch.toLowerCase()) ||
    s.variant.toLowerCase().includes(dbSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Banner */}
      <section className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#070c18] via-[#0b1121] to-[#1e293b] p-6 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500 opacity-5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl space-y-3">
          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black tracking-widest text-[#38BDF8] uppercase bg-[#38BDF8]/10 px-3 py-1 rounded-full border border-[#38BDF8]/25">
            <TrendingUp size={11} /> MARKET ANALYTICS MESH
          </span>
          <h2 className="text-xl md:text-3xl font-sans font-black uppercase text-white tracking-tight">
            Valuation Metrics & Specifications
          </h2>
          <p className="text-white/60 text-xs max-w-2xl font-sans leading-relaxed">
            Real-time charts plotting vehicle retail pricing across KPK markets, paired with a reliable specifications database for verified vehicles.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Valuation & Index chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0c1221] border border-[#1e293b] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="text-white font-black text-xs uppercase tracking-widest font-mono flex items-center gap-1.5">
                  📈 PKR Valuation Trend Matrix
                </h3>
                <p className="text-[10px] text-gray-400 font-sans">Visualizing standard market valuation indices (in Million PKR) from 2011 to current year.</p>
              </div>
            </div>

            {/* Recharts valuation lines */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={VALUATION_DATA}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#4b5563" 
                    tick={{ fill: '#a3b3cc', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    tick={{ fill: '#a3b3cc', fontSize: 10, fontFamily: 'monospace' }}
                    label={{ value: 'Million PKR', angle: -90, position: 'insideLeft', offset: 0, fill: '#6b7280', fontSize: 9 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0c1221', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontFamily: 'monospace',
                      fontSize: '11px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Fortuner" 
                    stroke="#f97316" 
                    strokeWidth={3} 
                    activeDot={{ r: 6 }} 
                    name="Fortuner (Legender)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Civic" 
                    stroke="#38bdf8" 
                    strokeWidth={2} 
                    name="Civic Oriel"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Aqua" 
                    stroke="#a855f7" 
                    strokeWidth={2} 
                    name="Aqua Hybrid"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Alto" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    name="Alto VXL"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-[#111928] rounded-xl border border-white/5 text-[10px] font-mono text-gray-400 mt-2">
              ⚠️ <span className="text-white font-extrabold uppercase">Pricing Guideline:</span> Values represent median auction-cleared and local showroom ledger points. True bargain metrics are prioritized dynamically under the <span className="text-orange-500 font-bold">Auto Choice Flagship</span>.
            </div>
          </div>

          {/* specifications database */}
          <div className="bg-[#0c1221] border border-[#1e293b] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-3">
              <div>
                <h3 className="text-white font-black text-xs uppercase tracking-widest font-mono flex items-center gap-1.5">
                  🔍 Technical Specifications Directory
                </h3>
                <p className="text-[10px] text-gray-400 font-sans">Quick-access directory for physical powertrain, displacement, and chassis ratings.</p>
              </div>

              {/* search input */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter specifications..."
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  className="w-full bg-[#070c18] border border-[#1e293b] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* list */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredSpecs.map((spec) => (
                  <div
                    key={spec.id}
                    onClick={() => setSelectedSpec(spec)}
                    className={`p-3 rounded-xl border cursor-pointer duration-100 flex items-center justify-between font-mono text-[10px] ${
                      selectedSpec?.id === spec.id
                        ? 'bg-orange-500/15 border-orange-500 text-white'
                        : 'bg-[#080d19] border-white/5 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-white uppercase">{spec.make} {spec.model}</p>
                      <p className="text-[9px] text-[#38BDF8] opacity-80">{spec.variant}</p>
                    </div>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] tracking-wide border border-white/10 uppercase">
                      Chassis: {spec.chassisCode}
                    </span>
                  </div>
                ))}
              </div>

              {/* selected details details sheet */}
              {selectedSpec ? (
                <div className="bg-[#111928] border border-white/5 p-4 rounded-xl space-y-3 font-mono text-[10px]">
                  <div className="border-b border-white/5 pb-2">
                    <h4 className="text-[#38BDF8] font-bold text-xs uppercase">{selectedSpec.make} {selectedSpec.model}</h4>
                    <p className="text-gray-400 text-[9px] uppercase font-bold">{selectedSpec.variant}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-0.5">
                      <p className="text-gray-500 uppercase text-[8px]">Power Output</p>
                      <p className="text-white font-extrabold">{selectedSpec.power}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-gray-500 uppercase text-[8px]">Fuel Consumption</p>
                      <p className="text-emerald-400 font-extrabold">{selectedSpec.fuelEconomy}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-gray-500 uppercase text-[8px]">Displacement Class</p>
                      <p className="text-white font-extrabold">{selectedSpec.engine}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-gray-500 uppercase text-[8px]">Chassis Code</p>
                      <p className="text-[#38bdf8] font-extrabold">{selectedSpec.chassisCode}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-[9px] text-gray-500 leading-snug">
                    ✓ Verified in our in-house database tool to match official manufacturer listings precisely.
                  </div>
                </div>
              ) : (
                <div className="h-full bg-[#111928]/50 border border-dashed border-white/5 rounded-xl flex items-center justify-center text-gray-500 font-mono text-[10px]">
                  Select a vehicle variant to examine exact parameters.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Editorial Buying Guides */}
        <div className="space-y-6">
          <div className="bg-[#121a2a] border border-[#1e293b] rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-white font-black text-xs uppercase tracking-widest font-mono flex items-center gap-2 border-b border-white/5 pb-2.5">
              <BookOpen size={14} className="text-orange-500" /> Executive Buyer Logs
            </h3>

            <div className="space-y-4">
              
              <div className="space-y-1.5 duration-150 hover:bg-white/[0.02] p-2 rounded-lg cursor-pointer">
                <span className="text-[8px] font-mono font-black py-0.5 px-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded uppercase">Checklist</span>
                <h5 className="text-white font-black text-xs uppercase leading-snug mt-1">PK title registration & Biometric transfer guidelines</h5>
                <p className="text-gray-400 text-[10px] font-sans leading-relaxed">
                  Avoid registration traps. Always trace genuine excise certificates, check smartcard active fields, and confirm biological fingerprint verification.
                </p>
              </div>

              <div className="space-y-1.5 duration-150 hover:bg-white/[0.02] p-2 rounded-lg cursor-pointer">
                <span className="text-[8px] font-mono font-black py-0.5 px-2 bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/20 rounded uppercase">Walkaround Tool</span>
                <h5 className="text-white font-black text-xs uppercase leading-snug mt-1">Assessing dynamic physical engine inspections</h5>
                <p className="text-gray-400 text-[10px] font-sans leading-relaxed">
                  Learn to spot suspension wear landmarks, examine structural frame integrity, and audit exhaust blow-by.
                </p>
              </div>

              <div className="space-y-1.5 duration-150 hover:bg-white/[0.02] p-2 rounded-lg cursor-pointer">
                <span className="text-[8px] font-mono font-black py-0.5 px-2 bg-orange-500/15 text-orange-400 border border-orange-500/20 rounded uppercase">Special Audit</span>
                <h5 className="text-white font-black text-xs uppercase leading-snug mt-1">Vetting hybrid and EV high-voltage battery life</h5>
                <p className="text-gray-400 text-[10px] font-sans leading-relaxed">
                  Procedures for reading live cell logs on Aqua, Prius, and brand Tesla imports. Keep thermal indices checked under bargain deals.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
