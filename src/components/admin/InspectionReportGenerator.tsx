import React, { useState } from 'react';
import { Camera, FileText, CheckCircle, Download, Car } from 'lucide-react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { jsPDF } from 'jspdf';

export default function InspectionReportGenerator({ vehicleId, onComplete }: { vehicleId?: string; onComplete?: () => void }) {
  const [reportData, setReportData] = useState({
    inspectorName: '', vehicleMakeModel: '', vin: '', mileage: '', engineGrading: 'good', bodyGrading: 'good',
    suspensionGrading: 'good', electronicsGrading: 'good', notes: '',
  });

  const { lastSavedAt } = useAutoSave(`inspection_${vehicleId || 'new'}`, reportData, { delay: 1000, onSaveToCloud: async () => {} });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Bazar360 Digital Inspection Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Inspector: ${reportData.inspectorName}`, 14, 30);
    doc.text(`Vehicle: ${reportData.vehicleMakeModel}`, 14, 37);
    doc.text(`VIN: ${reportData.vin}`, 14, 44);
    doc.text(`Mileage: ${reportData.mileage} km`, 14, 51);
    doc.setFontSize(11);
    const rows = [
      ['Engine & Transmission', reportData.engineGrading], ['Body & Paint', reportData.bodyGrading],
      ['Suspension', reportData.suspensionGrading], ['Electronics', reportData.electronicsGrading],
    ];
    let y = 65;
    rows.forEach(([category, grade]) => { doc.text(category, 14, y); doc.text(grade, 120, y); y += 8; });
    if (reportData.notes) {
      y += 5; doc.text('Notes:', 14, y); y += 7;
      doc.text(doc.splitTextToSize(reportData.notes, 180), 14, y);
    }
    doc.save(`bazar360-inspection-${vehicleId || 'new'}.pdf`);
    onComplete?.();
  };

  return <div>{/* Existing inspection form UI continues here. */}
    <button onClick={generatePDF} type="button">Generate Inspection Report</button>
  </div>;
}
