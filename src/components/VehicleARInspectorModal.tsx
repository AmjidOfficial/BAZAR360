import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  X, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  AlertTriangle, 
  Ruler, 
  Sparkles, 
  Download, 
  Eye, 
  Grid, 
  Compass,
  Zap,
  Layers,
  Info,
  Car
} from 'lucide-react';
import { CarListing } from '../types';
import { requestCameraAccessPersistent } from '../lib/permissionPersistence';

interface VehicleARInspectorModalProps {
  car: CarListing;
  onClose: () => void;
}

// Typical dimensions mapping for popular car models / categories (in mm)
interface VehicleDimensionsSpec {
  lengthMM: number;
  widthMM: number;
  heightMM: number;
  clearanceMM: number;
  wheelbaseMM: number;
  category: string;
}

const DEFAULT_SPECS: Record<string, VehicleDimensionsSpec> = {
  'fortuner': { lengthMM: 4795, widthMM: 1855, heightMM: 1835, clearanceMM: 225, wheelbaseMM: 2745, category: 'SUV / 4x4' },
  'revo': { lengthMM: 5325, widthMM: 1855, heightMM: 1815, clearanceMM: 286, wheelbaseMM: 3085, category: '4x4 Pickup' },
  'civic': { lengthMM: 4674, widthMM: 1800, heightMM: 1415, clearanceMM: 134, wheelbaseMM: 2735, category: 'Sedan' },
  'corolla': { lengthMM: 4630, widthMM: 1780, heightMM: 1435, clearanceMM: 145, wheelbaseMM: 2700, category: 'Sedan' },
  'alto': { lengthMM: 3395, widthMM: 1475, heightMM: 1490, clearanceMM: 160, wheelbaseMM: 2460, category: 'Hatchback' },
  'vitz': { lengthMM: 3945, widthMM: 1695, heightMM: 1500, clearanceMM: 140, wheelbaseMM: 2510, category: 'Hatchback' },
  'vezel': { lengthMM: 4330, widthMM: 1790, heightMM: 1590, clearanceMM: 185, wheelbaseMM: 2610, category: 'Crossover' },
  'sportage': { lengthMM: 4485, widthMM: 1855, heightMM: 1635, clearanceMM: 172, wheelbaseMM: 2670, category: 'SUV' },
  'city': { lengthMM: 4553, widthMM: 1748, heightMM: 1467, clearanceMM: 150, wheelbaseMM: 2600, category: 'Sedan' },
  'suv': { lengthMM: 4700, widthMM: 1850, heightMM: 1750, clearanceMM: 200, wheelbaseMM: 2750, category: 'SUV' },
  'sedan': { lengthMM: 4600, widthMM: 1780, heightMM: 1450, clearanceMM: 145, wheelbaseMM: 2700, category: 'Sedan' },
  'hatchback': { lengthMM: 3600, widthMM: 1550, heightMM: 1500, clearanceMM: 155, wheelbaseMM: 2450, category: 'Hatchback' }
};

export const VehicleARInspectorModal: React.FC<VehicleARInspectorModalProps> = ({ car, onClose }) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermissionState, setCameraPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  // AR Controls State
  const [scale, setScale] = useState<number>(1.0); // 0.5 to 1.5
  const [rotationAngle, setRotationAngle] = useState<number>(30); // 0 to 360
  const [viewMode, setViewMode] = useState<'3d' | 'top' | 'side' | 'clearance'>('3d');
  const [selectedGarageSize, setSelectedGarageSize] = useState<'home' | 'compact' | 'suv' | 'street'>('home');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Compute Spec Dimensions for current vehicle
  const dimensions = useMemo<VehicleDimensionsSpec>(() => {
    const titleLower = car.title.toLowerCase();
    for (const key of Object.keys(DEFAULT_SPECS)) {
      if (titleLower.includes(key)) {
        return DEFAULT_SPECS[key];
      }
    }
    const catLower = (car.tags?.join(' ') || car.condition || car.title || '').toLowerCase();
    if (catLower.includes('suv') || catLower.includes('4x4')) return DEFAULT_SPECS['suv'];
    if (catLower.includes('hatchback')) return DEFAULT_SPECS['hatchback'];
    return DEFAULT_SPECS['sedan'];
  }, [car]);

  // Convert dimensions to active unit
  const lengthStr = unitSystem === 'metric' ? `${(dimensions.lengthMM / 1000).toFixed(2)} m` : `${(dimensions.lengthMM / 304.8).toFixed(1)} ft`;
  const widthStr = unitSystem === 'metric' ? `${(dimensions.widthMM / 1000).toFixed(2)} m` : `${(dimensions.widthMM / 304.8).toFixed(1)} ft`;
  const heightStr = unitSystem === 'metric' ? `${(dimensions.heightMM / 1000).toFixed(2)} m` : `${(dimensions.heightMM / 304.8).toFixed(1)} ft`;
  const clearanceStr = unitSystem === 'metric' ? `${dimensions.clearanceMM} mm` : `${(dimensions.clearanceMM / 25.4).toFixed(1)} in`;

  // Garage specs in mm (Length x Width)
  const GARAGE_SPECS = {
    home: { name: 'Standard Home Garage', lengthMM: 5000, widthMM: 2500 },
    compact: { name: 'Compact Parking Slot', lengthMM: 4500, widthMM: 2200 },
    suv: { name: 'Large SUV Bay', lengthMM: 5800, widthMM: 2800 },
    street: { name: 'Parallel Street Parking', lengthMM: 6000, widthMM: 2400 }
  };

  const currentGarage = GARAGE_SPECS[selectedGarageSize];
  const fitsLength = dimensions.lengthMM <= currentGarage.lengthMM;
  const fitsWidth = dimensions.widthMM <= currentGarage.widthMM;
  const fitStatus = (fitsLength && fitsWidth) 
    ? (currentGarage.lengthMM - dimensions.lengthMM > 600 ? 'perfect' : 'tight') 
    : 'oversized';

  // Camera start logic with persistent permission state tracking
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await requestCameraAccessPersistent();
      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraActive(true);
        setCameraPermissionState('granted');
      } else {
        throw new Error('Camera access denied or unfulfilled');
      }
    } catch (err: any) {
      console.warn('[VehicleARInspector] Camera start error:', err);
      setCameraError('Camera access unavailable or permission denied. Virtual AR Studio Mode enabled.');
      setCameraPermissionState('denied');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Capture Screenshot of AR Overlay over Video
  const handleTakeSnapshot = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1280;
    canvas.height = 720;

    // Draw background video or virtual grid
    if (cameraActive && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid pattern
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Overlay Watermark Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(40, 40, 440, 160);
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 440, 160);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(car.title.slice(0, 28), 60, 75);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`L: ${lengthStr} | W: ${widthStr} | H: ${heightStr}`, 60, 105);

    ctx.fillStyle = '#f97316';
    ctx.fillText(`Clearance: ${clearanceStr} | Garage Fit: ${fitStatus.toUpperCase()}`, 60, 135);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('Bazar360.online • AR Vehicle Dimension Inspector', 60, 165);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 font-sans select-none overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl bg-bg-secondary border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]"
      >
        
        {/* MODAL TOP HEADER */}
        <div className="flex items-center justify-between px-5 py-4 bg-bg-primary border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-500/20">
              <Camera size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AR 3D Inspector
                </span>
                <span className="text-xs font-mono text-text-muted">{dimensions.category}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--color-text-header)] tracking-tight leading-tight">
                {car.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Unit Toggle Button */}
            <button
              onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
              className="px-3 py-1.5 rounded-xl bg-bg-secondary border border-white/10 text-xs font-mono font-bold text-text-muted hover:text-[var(--color-text-header)] hover:border-cyan-400 transition-colors cursor-pointer"
            >
              Unit: {unitSystem === 'metric' ? 'Meters (m)' : 'Feet (ft)'}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-[var(--color-text-header)] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MAIN DISPLAY STAGE (CAMERA OR VIRTUAL AR STUDIO) */}
        <div className="relative flex-1 bg-bg-primary overflow-hidden flex items-center justify-center min-h-[360px] sm:min-h-[460px]">
          
          {/* Background Live Video Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              cameraActive ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Fallback Virtual AR Studio Backdrop (if camera off or denied) */}
          {!cameraActive && (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
              {/* Virtual Studio 3D Perspective Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(56,189,248,0.15)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none opacity-80"></div>
              <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-cyan-950/20 to-transparent"></div>
            </div>
          )}

          {/* AR OVERLAY BOX & SPECIFICATIONS GRAPHICS */}
          <div 
            className="relative z-20 w-full h-full flex flex-col items-center justify-center p-6 transition-all duration-300"
            style={{ transform: `scale(${scale}) rotate(${rotationAngle % 2 === 0 ? 0 : 0}deg)` }}
          >
            
            {/* 3D AR BOUNDING BOX OVERLAY */}
            <div className="relative w-72 sm:w-96 aspect-[16/10] border-2 border-dashed border-cyan-400/80 rounded-2xl p-4 bg-cyan-500/5 backdrop-blur-xs flex flex-col justify-between shadow-2xl shadow-cyan-500/20 group">
              
              {/* Corner Target Handles */}
              <div className="absolute -top-2 -left-2 w-5 h-5 border-t-3 border-l-3 border-orange-400"></div>
              <div className="absolute -top-2 -right-2 w-5 h-5 border-t-3 border-r-3 border-orange-400"></div>
              <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-3 border-l-3 border-orange-400"></div>
              <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-3 border-r-3 border-orange-400"></div>

              {/* Reticle Target Center Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-12 h-12 border border-cyan-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                </div>
              </div>

              {/* TOP LENGTH DIMENSION BAR */}
              <div className="absolute -top-7 inset-x-4 flex items-center justify-between text-[11px] font-mono font-black text-cyan-300 bg-bg-primary/90 border border-cyan-500/40 px-3 py-0.5 rounded-full shadow-lg">
                <span className="text-orange-400">LENGTH:</span>
                <span>{lengthStr} ({dimensions.lengthMM} mm)</span>
              </div>

              {/* SIDE HEIGHT DIMENSION BAR */}
              <div className="absolute -right-10 inset-y-8 flex flex-col justify-between text-[10px] font-mono font-black text-cyan-300 bg-bg-primary/90 border border-cyan-500/40 px-2 py-1 rounded-xl shadow-lg write-vertical">
                <span className="text-orange-400">HEIGHT:</span>
                <span>{heightStr}</span>
              </div>

              {/* BOTTOM WIDTH & CLEARANCE BAR */}
              <div className="absolute -bottom-7 inset-x-4 flex items-center justify-between text-[11px] font-mono font-black text-cyan-300 bg-bg-primary/90 border border-cyan-500/40 px-3 py-0.5 rounded-full shadow-lg">
                <span className="text-orange-400">WIDTH: {widthStr}</span>
                <span className="text-[var(--color-accent-main)]">CLEARANCE: {clearanceStr}</span>
              </div>

              {/* VEHICLE OUTLINE SILHOUETTE ICON */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Car size={64} className="text-cyan-400 opacity-90 transition-transform duration-300" style={{ transform: `rotateY(${rotationAngle}deg)` }} />
                <span className="text-xs font-mono font-bold text-[var(--color-text-header)] uppercase tracking-wider mt-2 bg-bg-secondary/80 px-2.5 py-1 rounded-md border border-white/10">
                  {car.title.slice(0, 24)}
                </span>
              </div>

            </div>

          </div>

          {/* LIVE STATUS BADGE OVERLAY */}
          <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-bg-primary/90 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono text-[var(--color-text-header)] shadow-xl">
              <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-[var(--color-accent-main)] animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{cameraActive ? 'Real Camera Feed Live' : 'Virtual AR Grid Mode'}</span>
            </div>

            {/* GARAGE FIT STATUS BADGE */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-xl border ${
              fitStatus === 'perfect' 
                ? 'bg-[var(--color-accent-main)]/20 border-[var(--color-accent-main)]/40 text-emerald-300' 
                : fitStatus === 'tight'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-red-500/20 border-red-500/40 text-red-300'
            }`}>
              {fitStatus === 'perfect' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>
                {currentGarage.name}: {fitStatus === 'perfect' ? 'FITS EASILY' : fitStatus === 'tight' ? 'TIGHT FIT' : 'TOO LARGE FOR BAY'}
              </span>
            </div>
          </div>

          {/* CAMERA FEED TOGGLE & CAMERA ERROR MESSAGES */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                <Camera size={14} />
                <span>Enable Camera</span>
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-3 py-1.5 rounded-xl bg-bg-secondary/90 border border-white/10 text-text-muted hover:text-[var(--color-text-header)] font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <X size={14} />
                <span>Disable Camera</span>
              </button>
            )}
          </div>

          {/* PHOTO SNAPSHOT PREVIEW MODAL */}
          {capturedPhoto && (
            <div className="absolute inset-0 z-40 bg-bg-primary/95 backdrop-blur-md p-6 flex flex-col items-center justify-center">
              <div className="relative max-w-lg w-full bg-bg-secondary border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">AR Snapshot Captured</span>
                  <button onClick={() => setCapturedPhoto(null)} className="text-text-muted hover:text-[var(--color-text-header)]">
                    <X size={18} />
                  </button>
                </div>

                <img src={capturedPhoto} alt="AR Snapshot" className="w-full rounded-xl border border-white/10" />

                <div className="flex items-center justify-end gap-3">
                  <a
                    href={capturedPhoto}
                    download={`bazar360-ar-${car.id}.jpg`}
                    className="px-4 py-2 rounded-xl bg-[var(--color-accent-main)] hover:bg-emerald-600 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[var(--color-accent-main)]/20"
                  >
                    <Download size={14} />
                    <span>Download Image</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM AR CONTROLS PANEL */}
        <div className="p-4 sm:p-5 bg-bg-primary border-t border-white/10 space-y-4 shrink-0">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            
            {/* SCALE / DISTANCE SLIDER */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                <span className="flex items-center gap-1"><Maximize2 size={12} className="text-cyan-400" /> Distance Scale:</span>
                <span className="font-bold text-[var(--color-text-header)]">{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-orange-500 bg-bg-tertiary h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* ROTATION ANGLE SLIDER */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                <span className="flex items-center gap-1"><RotateCcw size={12} className="text-orange-400" /> Rotate AR Frame:</span>
                <span className="font-bold text-[var(--color-text-header)]">{rotationAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-bg-tertiary h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* GARAGE PARKING SPACE SELECTOR */}
            <div className="space-y-1">
              <span className="text-xs font-mono text-text-muted block">Check Garage / Parking Bay:</span>
              <select
                value={selectedGarageSize}
                onChange={(e) => setSelectedGarageSize(e.target.value as any)}
                className="w-full bg-bg-secondary border border-white/10 text-xs font-mono font-bold text-[var(--color-text-header)] p-2 rounded-xl focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="home">Standard Home Garage (5.0m x 2.5m)</option>
                <option value="compact">Compact Slot (4.5m x 2.2m)</option>
                <option value="suv">Large SUV Bay (5.8m x 2.8m)</option>
                <option value="street">Parallel Street Slot (6.0m x 2.4m)</option>
              </select>
            </div>

          </div>

          {/* ACTION BUTTONS FOOTER */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-text-muted">
              <span className="flex items-center gap-1"><Ruler size={13} className="text-cyan-400" /> L: {lengthStr}</span>
              <span className="flex items-center gap-1"><Layers size={13} className="text-orange-400" /> W: {widthStr}</span>
              <span className="flex items-center gap-1"><Sparkles size={13} className="text-amber-400" /> H: {heightStr}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleTakeSnapshot}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera size={14} />
                <span>Capture AR Photo</span>
              </button>

              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default VehicleARInspectorModal;
