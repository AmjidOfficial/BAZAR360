import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset paths
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface ShowroomMapProps {
  lat: number;
  lng: number;
  showroomName: string;
  isDark?: boolean;
}

export function ShowroomMap({ lat, lng, showroomName, isDark = true }: ShowroomMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Safe destruction of map before initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Premium CartoDB basemaps matching current color style
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

    // Modern glowing pulse pointer
    const customIcon = L.divIcon({
      className: 'custom-map-pin-container',
      html: `
        <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
          <div class="absolute w-8 h-8 rounded-full bg-orange-500 animate-ping opacity-25"></div>
          <div class="absolute w-4 h-4 rounded-full bg-[#FF6B00] border-2 border-white shadow-xl"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    
    // Setup a modern popup
    marker.bindPopup(`
      <div class="p-1 font-sans text-center">
        <p class="font-bold text-slate-900 text-xs">${showroomName}</p>
        <p class="text-[9px] text-slate-500 mt-0.5">Click navigate for directions</p>
      </div>
    `, {
      closeButton: false,
      className: 'custom-leaflet-popup'
    }).openPopup();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, showroomName, isDark]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      
      {/* Absolute micro controls overlay */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1">
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-8 h-8 bg-slate-950/90 hover:bg-slate-900 border border-white/10 rounded-xl text-white font-bold flex items-center justify-center text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          title="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-8 h-8 bg-slate-950/90 hover:bg-slate-900 border border-white/10 rounded-xl text-white font-bold flex items-center justify-center text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          title="Zoom Out"
        >
          −
        </button>
      </div>

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 z-20 bg-slate-950/90 hover:bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold text-gray-200 tracking-wider flex items-center gap-1.5 transition-all shadow-lg hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
        NAVIGATE
      </a>
    </div>
  );
}
