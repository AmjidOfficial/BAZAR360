import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Activity, CloudUpload } from 'lucide-react';

export interface UploadHealthProps {
  originalSizeKB?: number;
  compressedSizeKB?: number;
  savedPercentage?: number;
  progress: number; // 0 - 100
  isUploading: boolean;
  error?: string | null;
  uploadedUrl?: string | null;
  presetName?: string;
}

export function UploadHealthIndicator({
  originalSizeKB,
  compressedSizeKB,
  savedPercentage,
  progress,
  isUploading,
  error,
  uploadedUrl,
  presetName = 'bazar360_upload',
}: UploadHealthProps) {
  if (!isUploading && !uploadedUrl && !error && !originalSizeKB) {
    return null; // Silent when inactive
  }

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2.5 text-xs text-slate-300 font-sans shadow-inner transition-all">
      {/* Top Header & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono font-bold uppercase text-[10px] tracking-wider text-slate-400">
          <Activity size={13} className={isUploading ? 'text-orange-400 animate-pulse' : 'text-[var(--color-accent-main)]'} />
          <span>Upload Health & Payload Guard</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Preset: {presetName}
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Real-Time Progress Bar */}
      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
            <span className="flex items-center gap-1">
              <CloudUpload size={12} className="animate-bounce text-orange-400" /> Uploading to Cloudinary...
            </span>
            <span className="text-orange-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-200"
              style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Payload Optimization Metrics */}
      {originalSizeKB !== undefined && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[11px] font-mono">
          <div>
            <span className="text-slate-500 text-[9px] uppercase block">Raw File</span>
            <span className="font-bold text-slate-200">{originalSizeKB} KB</span>
          </div>
          {compressedSizeKB !== undefined && (
            <div>
              <span className="text-slate-500 text-[9px] uppercase block">Canvas Compressed (400px)</span>
              <span className="font-bold text-[var(--color-accent-main)]">{compressedSizeKB} KB</span>
            </div>
          )}
          {savedPercentage !== undefined && savedPercentage > 0 && (
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 text-[9px] uppercase block">Storage Savings</span>
              <span className="font-bold text-orange-400">-{savedPercentage}% Payload</span>
            </div>
          )}
        </div>
      )}

      {/* Secure Offloading Assurance */}
      {uploadedUrl && !isUploading && !error && (
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
          <div className="flex items-center gap-1.5 text-[var(--color-accent-main)] font-bold">
            <ShieldCheck size={14} />
            <span>Optimized High-Speed Image Storage</span>
          </div>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline font-mono truncate max-w-[140px]"
            title={uploadedUrl}
          >
            HTTPS URL Valid
          </a>
        </div>
      )}
    </div>
  );
}
