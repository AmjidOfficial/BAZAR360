import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, RotateCw, Sparkles, Zap, Shield, Gauge, Move } from 'lucide-react';

interface ThreeVehicleHeroProps {
  onExploreInventory?: () => void;
  lang?: 'en' | 'ur';
}

export const ThreeVehicleHero: React.FC<ThreeVehicleHeroProps> = ({ onExploreInventory, lang = 'en' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [activeTelemetry, setActiveTelemetry] = useState<'aero' | 'power' | 'battery'>('aero');
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch (e) {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1326, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.5);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Luxury lighting system
    const ambientLight = new THREE.AmbientLight(0x00d2ff, 1.2);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainKeyLight.position.set(5, 8, 5);
    scene.add(mainKeyLight);

    const amberRimLight = new THREE.PointLight(0xffb95f, 3.5, 20);
    amberRimLight.position.set(4, 3, 3);
    scene.add(amberRimLight);

    const electricBlueGlow = new THREE.PointLight(0x00d2ff, 3.0, 25);
    electricBlueGlow.position.set(-4, 1.5, -3);
    scene.add(electricBlueGlow);

    // Vehicle Group Structure
    const carGroup = new THREE.Group();

    // Materials
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x060e20,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d2ff,
      emissive: 0x003543,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2
    });

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb95f,
      emissive: 0x3a2000,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.2
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xa5e7ff,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      transmission: 0.7,
      ior: 1.5
    });

    // 1. Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(3.0, 0.45, 1.4);
    const chassis = new THREE.Mesh(chassisGeo, bodyMaterial);
    chassis.position.y = 0.45;
    carGroup.add(chassis);

    // 2. Aerodynamic Cockpit & Curved Glass
    const cabinGeo = new THREE.BoxGeometry(1.5, 0.5, 1.15);
    const cabin = new THREE.Mesh(cabinGeo, glassMaterial);
    cabin.position.set(-0.1, 0.85, 0);
    carGroup.add(cabin);

    // 3. Front Nose Splitter
    const noseGeo = new THREE.BoxGeometry(0.8, 0.2, 1.35);
    const nose = new THREE.Mesh(noseGeo, accentMaterial);
    nose.position.set(1.5, 0.35, 0);
    carGroup.add(nose);

    // 4. Rear Spoiler
    const wingGeo = new THREE.BoxGeometry(0.3, 0.08, 1.4);
    const wing = new THREE.Mesh(wingGeo, accentMaterial);
    wing.position.set(-1.45, 0.95, 0);
    carGroup.add(wing);

    // 5. LED Headlight Strips
    const headlightGeo = new THREE.BoxGeometry(0.1, 0.08, 0.45);
    const leftHeadlight = new THREE.Mesh(headlightGeo, new THREE.MeshBasicMaterial({ color: 0x00d2ff }));
    leftHeadlight.position.set(1.85, 0.45, 0.45);
    const rightHeadlight = leftHeadlight.clone();
    rightHeadlight.position.z = -0.45;
    carGroup.add(leftHeadlight);
    carGroup.add(rightHeadlight);

    // 6. LED Taillight Bar
    const taillightGeo = new THREE.BoxGeometry(0.08, 0.06, 1.3);
    const taillight = new THREE.Mesh(taillightGeo, new THREE.MeshBasicMaterial({ color: 0xff3b30 }));
    taillight.position.set(-1.52, 0.65, 0);
    carGroup.add(taillight);

    // 7. Turbine Alloy Wheels with Gold Trim
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 24);
    wheelGeo.rotateX(Math.PI / 2);

    const wheelPositions = [
      { x: 1.0, y: 0.36, z: 0.72 },
      { x: -1.0, y: 0.36, z: 0.72 },
      { x: 1.0, y: 0.36, z: -0.72 },
      { x: -1.0, y: 0.36, z: -0.72 }
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeo, goldMaterial);
      wheel.position.set(pos.x, pos.y, pos.z);
      carGroup.add(wheel);
    });

    scene.add(carGroup);

    // Cybernetic Glowing Floor Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x00d2ff, 0x171f33);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Interactive Drag / Orbit Mechanics
    let isDragging = false;
    let previousMouseX = 0;
    let rotationVelocity = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      previousMouseX = e.clientX;
      carGroup.rotation.y += deltaX * 0.012;
      rotationVelocity = deltaX * 0.005;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!isDragging) {
        if (isRotating) {
          carGroup.rotation.y += 0.008;
        } else {
          // Inertia decay
          carGroup.rotation.y += rotationVelocity;
          rotationVelocity *= 0.95;
        }
      }

      // Gentle floating suspension physics
      carGroup.position.y = Math.sin(elapsedTime * 2.2) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup WebGL resources
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose geometries and materials
      chassisGeo.dispose();
      cabinGeo.dispose();
      noseGeo.dispose();
      wingGeo.dispose();
      headlightGeo.dispose();
      taillightGeo.dispose();
      wheelGeo.dispose();
      renderer.dispose();
    };
  }, [isRotating]);

  if (!webGlSupported) {
    return (
      <div className="w-full h-80 rounded-2xl bg-[#060E20] border border-[#00D2FF]/20 flex flex-col items-center justify-center p-6 text-center text-[#DAE2FD]">
        <Gauge size={40} className="text-[#00D2FF] mb-2 animate-pulse" />
        <h3 className="font-display font-bold text-lg text-white">Interactive 3D Supercar Telemetry</h3>
        <p className="text-xs text-[#BBC9CF] max-w-sm mt-1">
          Explore Pakistan's finest certified vehicles with 360-degree precision inspection.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#0B1326] via-[#060E20] to-[#0B1326] border border-[#00D2FF]/25 shadow-[0_10px_40px_-10px_rgba(0,210,255,0.2)] overflow-hidden">
      {/* Top Header Controls Bar */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#00D2FF]/15 border border-[#00D2FF]/30 text-[#00D2FF] font-mono text-[11px] font-bold tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,210,255,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-ping" />
            3D REAL-TIME TELEMETRY
          </span>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-[#FFB95F]/15 border border-[#FFB95F]/30 text-[#FFB95F] font-mono text-[10px] font-bold">
            60 FPS WEBGL
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating((prev) => !prev)}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#171F33]/80 hover:bg-[#222A3D] border border-white/10 text-xs font-mono text-[#DAE2FD] flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
            title="Toggle Auto Rotation"
          >
            <RotateCw size={13} className={isRotating ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{isRotating ? 'Auto-Orbit' : 'Manual'}</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing select-none"
        title="Drag to rotate vehicle 360°"
      />

      {/* Drag Instruction Cue */}
      <div className="absolute bottom-16 sm:bottom-4 left-4 z-20 flex items-center gap-1.5 text-[10px] font-mono text-[#BBC9CF] bg-[#060E20]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 pointer-events-none">
        <Move size={12} className="text-[#00D2FF]" />
        <span>Drag to rotate in 360°</span>
      </div>

      {/* Interactive Telemetry Pills */}
      <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 pointer-events-auto">
        <button
          onClick={() => setActiveTelemetry('aero')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer backdrop-blur-md ${
            activeTelemetry === 'aero'
              ? 'bg-[#00D2FF] text-[#060E20] shadow-[0_0_12px_rgba(0,210,255,0.4)]'
              : 'bg-[#171F33]/80 text-[#BBC9CF] hover:text-white border border-white/10'
          }`}
        >
          0.24 Cd AERO
        </button>
        <button
          onClick={() => setActiveTelemetry('power')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer backdrop-blur-md ${
            activeTelemetry === 'power'
              ? 'bg-[#FFB95F] text-[#060E20] shadow-[0_0_12px_rgba(255,185,95,0.4)]'
              : 'bg-[#171F33]/80 text-[#BBC9CF] hover:text-white border border-white/10'
          }`}
        >
          522 HP DUAL
        </button>
        <button
          onClick={() => setActiveTelemetry('battery')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer backdrop-blur-md ${
            activeTelemetry === 'battery'
              ? 'bg-[#00D2FF] text-[#060E20] shadow-[0_0_12px_rgba(0,210,255,0.4)]'
              : 'bg-[#171F33]/80 text-[#BBC9CF] hover:text-white border border-white/10'
          }`}
        >
          3.8s SPRINT
        </button>
      </div>
    </div>
  );
};

export default ThreeVehicleHero;
