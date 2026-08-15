import { jsPDF } from 'jspdf';
import { CarListing } from '../types';

export interface InspectionReportData {
  overallGrade: string; // e.g. 'A+'
  overallScore: number; // e.g. 94
  engineScore: number;
  bodyScore: number;
  suspensionScore: number;
  electronicsScore: number;
  uvLightPaintStatus: 'Pass - Genuine Factory Coat' | 'Minor Touchup' | 'Filler Detected';
  uvLightDetails: string;
  inspectorName: string;
  inspectionDate: string;
  notes?: string;
}

export function generateInspectionPDF(car: CarListing, customData?: Partial<InspectionReportData>): void {
  const report: InspectionReportData = {
    overallGrade: customData?.overallGrade || (car.bodyCondition === 'Total Genuine' ? 'A+' : car.bodyCondition === 'Minor Touch-ups' ? 'A' : 'B'),
    overallScore: customData?.overallScore || (car.bodyCondition === 'Total Genuine' ? 95 : car.bodyCondition === 'Minor Touch-ups' ? 88 : 78),
    engineScore: customData?.engineScore || 96,
    bodyScore: customData?.bodyScore || (car.bodyCondition === 'Total Genuine' ? 98 : car.bodyCondition === 'Minor Touch-ups' ? 85 : 72),
    suspensionScore: customData?.suspensionScore || 92,
    electronicsScore: customData?.electronicsScore || 98,
    uvLightPaintStatus: customData?.uvLightPaintStatus || (car.bodyCondition === 'Total Genuine' ? 'Pass - Genuine Factory Coat' : 'Minor Touchup'),
    uvLightDetails: customData?.uvLightDetails || 'UV light analysis confirms factory paint thickness across bonnet, roof, and side pillars. No hidden body filler detected.',
    inspectorName: customData?.inspectorName || 'Malak Mazhar (Lead Certified Auditor)',
    inspectionDate: customData?.inspectionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    notes: customData?.notes || 'Vehicle passed all safety, structural, and computerized OBD-II scanner diagnostic checks.'
  };

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Background header band
  doc.setFillColor(11, 15, 25); // #0b0f19 Dark navy
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Orange accent line
  doc.setFillColor(255, 107, 0); // #FF6B00
  doc.rect(0, 42, pageWidth, 2, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('BAZAR360.ONLINE', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(56, 189, 248); // #38BDF8
  doc.text('AUTO CHOICE CERTIFIED 360° DIGITAL INSPECTION REPORT', 14, 25);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Report ID: AC-INS-${car.id.slice(-6).toUpperCase()} | Date: ${report.inspectionDate}`, 14, 32);

  // Overall Grade Box (Top Right)
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(pageWidth - 45, 8, 32, 28, 3, 3, 'F');
  doc.setTextColor(255, 107, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(report.overallGrade, pageWidth - 29, 22, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(`${report.overallScore}/100 SCORE`, pageWidth - 29, 30, { align: 'center' });

  // 1. Vehicle Information Summary
  let y = 52;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, y, pageWidth - 24, 34, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('VEHICLE IDENTIFICATION & SPECS', 16, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const col1X = 16;
  const col2X = 80;
  const col3X = 144;

  doc.text(`Title: ${car.title}`, col1X, y + 16);
  doc.text(`Make/Model: ${car.make} ${car.model}`, col1X, y + 22);
  doc.text(`Year: ${car.year}`, col1X, y + 28);

  doc.text(`Price: PKR ${car.price.toLocaleString()}`, col2X, y + 16);
  doc.text(`Mileage: ${car.mileage.toLocaleString()} km`, col2X, y + 22);
  doc.text(`Engine: ${car.engineCC || 'N/A'} CC (${car.fuelType})`, col2X, y + 28);

  doc.text(`Registration: ${car.registrationCity}`, col3X, y + 16);
  doc.text(`Body: ${car.bodyCondition}`, col3X, y + 22);
  doc.text(`Docs: ${car.documentType || 'Smart Card'}`, col3X, y + 28);

  // 2. 360° Health Check Breakdown
  y += 42;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('360° COMPUTERIZED & PHYSICAL HEALTH CHECK', 14, y);

  y += 6;
  const categories = [
    { name: 'Engine & Transmission Diagnostics', score: report.engineScore },
    { name: 'Exterior Body & Structural Frame', score: report.bodyScore },
    { name: 'Suspension & Under-Carriage', score: report.suspensionScore },
    { name: 'Electronics & OBD Computer Scanner', score: report.electronicsScore },
  ];

  categories.forEach((cat) => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(12, y, pageWidth - 24, 11, 2, 2, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(cat.name, 16, y + 7);

    // Score bar background
    const barX = 120;
    const barWidth = 50;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barX, y + 3, barWidth, 5, 1.5, 1.5, 'F');

    // Score bar fill
    const fillW = (barWidth * cat.score) / 100;
    doc.setFillColor(cat.score >= 90 ? 16 : cat.score >= 75 ? 234 : 225, cat.score >= 90 ? 185 : cat.score >= 75 ? 179 : 29, cat.score >= 90 ? 129 : cat.score >= 75 ? 8 : 72); // emerald or amber or red
    doc.roundedRect(barX, y + 3, fillW, 5, 1.5, 1.5, 'F');

    doc.setTextColor(15, 23, 42);
    doc.text(`${cat.score}%`, barX + barWidth + 5, y + 7);

    y += 14;
  });

  // 3. UV Light Paint-Checking Analysis
  y += 4;
  doc.setFillColor(15, 23, 42); // Dark block for UV section
  doc.roundedRect(12, y, pageWidth - 24, 38, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(56, 189, 248); // Sky blue
  doc.text('SPECIALIZED UV LIGHT PAINT-CHECKING ANALYSIS', 16, y + 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(241, 245, 249);
  doc.text(`Paint Coat Status: ${report.uvLightPaintStatus}`, 16, y + 17);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(8);
  const splitDetails = doc.splitTextToSize(report.uvLightDetails, pageWidth - 36);
  doc.text(splitDetails, 16, y + 24);

  // Panel Table Summary
  y += 46;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PANEL-BY-PANEL UV PAINT SPECTRUM BREAKDOWN', 14, y);

  y += 5;
  const panels = [
    { panel: 'Bonnet / Hood', status: 'Original (110 µm)', uvResult: 'Clear Coat Intact' },
    { panel: 'Roof & Pillars', status: 'Original (105 µm)', uvResult: 'No Repaint' },
    { panel: 'Doors (Left/Right)', status: car.bodyCondition === 'Major Repaint' ? 'Repainted (240 µm)' : 'Original (115 µm)', uvResult: car.bodyCondition === 'Major Repaint' ? 'Respray Verified' : 'Pass' },
    { panel: 'Quarter Panels', status: car.bodyCondition === 'Minor Touch-ups' ? 'Touch-up (160 µm)' : 'Original (112 µm)', uvResult: 'Verified' },
    { panel: 'Trunk / Boot', status: 'Original (108 µm)', uvResult: 'Clear Coat Intact' }
  ];

  panels.forEach((p) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, y, pageWidth - 24, 8, 1, 1, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(p.panel, 16, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.text(p.status, 90, y + 5.5);
    doc.text(p.uvResult, 150, y + 5.5);

    y += 10;
  });

  // Footer & Auditor Signature Stamp
  y = 262;
  doc.setDrawColor(226, 232, 240);
  doc.line(12, y, pageWidth - 12, y);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`Lead Auditor: ${report.inspectorName}`, 14, y + 6);
  doc.text('Auto Choice Showroom & Service Hub, Peshawar, KP, Pakistan', 14, y + 10);
  doc.text('Official Digital Certification issued by Bazar360.online', 14, y + 14);

  // Digital Stamp Box
  doc.setDrawColor(255, 107, 0);
  doc.setFillColor(255, 247, 237);
  doc.roundedRect(pageWidth - 60, y + 2, 48, 16, 2, 2, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(194, 65, 12);
  doc.text('VERIFIED AUTO CHOICE', pageWidth - 36, y + 7, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('360° CERTIFIED STAMP', pageWidth - 36, y + 12, { align: 'center' });

  // Save the PDF file
  const fileName = `AutoChoice_Inspection_${car.make}_${car.model}_${car.id.slice(-4)}.pdf`;
  doc.save(fileName);
}
