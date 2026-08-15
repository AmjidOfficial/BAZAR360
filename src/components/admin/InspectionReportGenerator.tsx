import React, { useState } from 'react';
import { Camera, FileText, CheckCircle, Download, Car } from 'lucide-react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function InspectionReportGenerator({ vehicleId, onComplete }: { vehicleId?: string, onComplete?: () => void }) {
  const [reportData, setReportData] = useState({
    inspectorName: '',
    vehicleMakeModel: '',
    vin: '',
    mileage: '',
    engineGrading: 'good',
    bodyGrading: 'good',
    suspensionGrading: 'good',
    electronicsGrading: 'good',
    notes: '',
  });

  const { lastSavedAt } = useAutoSave(`inspection_${vehicleId || 'new'}`, reportData, {
    delay: 1000,
    onSaveToCloud: async () => {}
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Auto Choice Digital Inspection Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Inspector: ${reportData.inspectorName}`, 14, 30);
    doc.text(`Vehicle: ${reportData.vehicleMakeModel}`, 14, 37);
    doc.text(`VIN: ${reportData.vin}`, 14, 44);
    doc.text(`Mileage: ${reportData.mileage} km`, 14, 51);

    autoTable(doc, {
      startY: 60,
      head: [['Category', 'Grade']],
      body: [
        ['Engine & Transmission', reportData.engineGrading],
        ['Body & Paint', reportData.bodyGrading],
        ['Suspension & Undercarriage', reportData.suspensionGrading],
        ['Electronics & OBD', reportData.electronicsGrading],
      ],
    });

    doc.text(`Notes: ${reportData.notes}`, 14, (doc as any).lastAutoTable.finalY + 10);
    doc.save(`inspection_report_${vehicleId || 'new'}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'fair': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'action_required': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const GradingRow = ({ label, field }: { label: string, field: keyof typeof reportData }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
      <span className="text-sm font-black uppercase text-slate-300 tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        {(['good', 'fair', 'action_required'] as const).map(status => (
          <button
            key={status}
            onClick={() => setReportData({ ...reportData, [field]: status })}
            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
              reportData[field] === status ? getStatusColor(status) : 'text-slate-500 border-slate-800 hover:border-slate-600'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
        <button className="p-2 ml-2 bg-slate-800 text-slate-400 hover:text-sky-400 rounded-lg transition-colors cursor-pointer border border-slate-700">
          <Camera size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black uppercase text-sky-400 flex items-center gap-2">
            <FileText size={20} />
            Digital Inspection Report
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Auto Choice Certified Health Check</p>
        </div>
        <div className="flex items-center gap-2">
          {lastSavedAt && (
             <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
               <CheckCircle size={10} /> Auto-saved {lastSavedAt.toLocaleTimeString()}
             </span>
          )}
          <button onClick={generatePDF} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="text" 
          placeholder="Inspector Name" 
          value={reportData.inspectorName}
          onChange={e => setReportData({...reportData, inspectorName: e.target.value})}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-sky-500 outline-none"
        />
        <input 
          type="text" 
          placeholder="Vehicle Make & Model" 
          value={reportData.vehicleMakeModel}
          onChange={e => setReportData({...reportData, vehicleMakeModel: e.target.value})}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-sky-500 outline-none"
        />
        <input 
          type="text" 
          placeholder="VIN / Chassis Number" 
          value={reportData.vin}
          onChange={e => setReportData({...reportData, vin: e.target.value})}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-sky-500 outline-none"
        />
        <input 
          type="text" 
          placeholder="Mileage (km)" 
          value={reportData.mileage}
          onChange={e => setReportData({...reportData, mileage: e.target.value})}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-sky-500 outline-none"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase text-slate-300 tracking-wider mb-2">Checklist & Grading</h3>
        <GradingRow label="Engine & Transmission" field="engineGrading" />
        <GradingRow label="Body & Paint" field="bodyGrading" />
        <GradingRow label="Suspension & Undercarriage" field="suspensionGrading" />
        <GradingRow label="Electronics & OBD" field="electronicsGrading" />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Additional Notes</label>
        <textarea 
          placeholder="Add specific remarks or findings..."
          value={reportData.notes}
          onChange={e => setReportData({...reportData, notes: e.target.value})}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-sky-500 outline-none h-24 resize-none"
        />
      </div>

      <button onClick={onComplete} className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg mt-6">
        Finalize & Submit Report
      </button>
    </div>
  );
}
