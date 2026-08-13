import React, { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import cockpitWallpaperImg from '../../assets/images/cyberpunk_cockpit_wallpaper_1786628911452.jpg';
import { FIGHTER_JET_COCKPIT_WALLPAPER } from '../../mock/wallpapers';
import {
  Compass,
  Crosshair,
  ShieldAlert,
  Zap,
  Flame,
  Radio,
  Target,
  Wind,
  Layers,
  Gauge,
  Activity,
  Disc,
  RotateCw,
  Navigation,
  Shield,
  Plane,
  Crosshair as TargetIcon,
  AlertTriangle,
  RefreshCw,
  Eye,
  Cpu,
  Image as ImageIcon
} from 'lucide-react';

interface CyberpunkFighterJetHudProps {
  isBackgroundMode?: boolean;
}

interface RadarTarget {
  id: number;
  x: number; // -100 to 100
  y: number; // -100 to 100
  type: 'hostile' | 'friendly' | 'unknown';
  isLocked?: boolean;
  code: string;
}

type WeaponType = 'AMRAAM' | 'SIDEWINDER' | 'CANNON' | 'JDAM';

interface WeaponSlot {
  id: WeaponType;
  name: string;
  code: string;
  count: number;
  maxCount: number;
  status: 'HOT' | 'READY' | 'ARMED' | 'EMPTY';
  typeLabel: string;
}

export const CyberpunkFighterJetHud: React.FC<CyberpunkFighterJetHudProps> = ({ isBackgroundMode }) => {
  const { cardOpacity, backgroundBlur, speedometerPlacement } = useDashboardStore((state) => state.settings);
  const updateSettings = useDashboardStore((state) => state.updateSettings);
  const selectedWallpaper = useDashboardStore((state) => state.selectedWallpaper);
  const setSelectedWallpaper = useDashboardStore((state) => state.setSelectedWallpaper);
  const isBg = isBackgroundMode ?? (speedometerPlacement === 'background');

  // Flight Telemetry States
  const [airspeedKts, setAirspeedKts] = useState(640);
  const [altitudeFt, setAltitudeFt] = useState(24500);
  const [machNumber, setMachNumber] = useState(1.42);
  const [pitch, setPitch] = useState(4); // -30 to +30 deg
  const [roll, setRoll] = useState(-3); // -45 to +45 deg
  const [heading, setHeading] = useState(285); // 0 to 360 deg
  const [gForce, setGForce] = useState(2.8);
  const [aoa, setAoa] = useState(7.4); // Angle of Attack
  const [fuelPercent, setFuelPercent] = useState(78);
  const [flaresCount, setFlaresCount] = useState(30);
  const [chaffCount, setChaffCount] = useState(60);
  const [masterArm, setMasterArm] = useState<'ARMED' | 'SAFE'>('ARMED');
  const [flightMode, setFlightMode] = useState<'PATROL' | 'RECON' | 'COMBAT' | 'DOGFIGHT'>('COMBAT');
  const [unit, setUnit] = useState<'KTS' | 'MACH' | 'MPH'>('KTS');

  // Interactive Weapon Stores
  const [activeWeapon, setActiveWeapon] = useState<WeaponType>('AMRAAM');
  const [weapons, setWeapons] = useState<Record<WeaponType, WeaponSlot>>({
    AMRAAM: { id: 'AMRAAM', name: 'AIM-120C AMRAAM', code: 'A2A RADAR', count: 4, maxCount: 4, status: 'HOT', typeLabel: 'FOX-3 RADAR' },
    SIDEWINDER: { id: 'SIDEWINDER', name: 'AIM-9X SIDEWINDER', code: 'IR HEAT', count: 2, maxCount: 2, status: 'READY', typeLabel: 'FOX-2 IR' },
    CANNON: { id: 'CANNON', name: '20MM M61A2 CANNON', code: 'GUNS', count: 510, maxCount: 510, status: 'ARMED', typeLabel: '20MM VULCAN' },
    JDAM: { id: 'JDAM', name: 'GBU-31 JDAM', code: 'A2G GPS', count: 2, maxCount: 2, status: 'READY', typeLabel: 'GPS BOMB' },
  });
  const [firingLog, setFiringLog] = useState<string>('SYSTEM READY - SELECT TARGET');
  const [isFiringWeapon, setIsFiringWeapon] = useState(false);

  // Targeting Pod Mode
  const [podMode, setPodMode] = useState<'FLIR' | 'NIGHT' | 'TV'>('FLIR');

  // Interactive Action States
  const [isAfterburnerActive, setIsAfterburnerActive] = useState(false);
  const [isDeployingFlares, setIsDeployingFlares] = useState(false);
  const [isTargetLocked, setIsTargetLocked] = useState(false);

  // Dynamic Targeting Reticle Mouse Tracking (with Lag Effect & Fire FX)
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 50, y: 42 });
  const reticlePosRef = useRef({ x: 50, y: 42 });
  const outerPosRef = useRef({ x: 50, y: 42 });
  
  const [reticlePos, setReticlePos] = useState({ x: 50, y: 42 });
  const [outerPos, setOuterPos] = useState({ x: 50, y: 42 });
  const [recoilOffset, setRecoilOffset] = useState({ x: 0, y: 0 });
  const [screenFlashColor, setScreenFlashColor] = useState<string | null>(null);
  const [fireEffects, setFireEffects] = useState<
    Array<{ id: number; x: number; y: number; weapon: WeaponType; timestamp: number }>
  >([]);

  // 5-Second Missile Tracking Timer
  const [trackingSecsLeft, setTrackingSecsLeft] = useState<number | null>(null);
  const trackingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (trackingTimerRef.current) clearInterval(trackingTimerRef.current);
    };
  }, []);

  // Smooth Reticle Lag Interpolation (Lerp) Loop
  useEffect(() => {
    let animId: number;

    const animateReticle = () => {
      const tx = mousePosRef.current.x;
      const ty = mousePosRef.current.y;

      // Primary Reticle follows mouse with smooth weight (0.15)
      reticlePosRef.current.x += (tx - reticlePosRef.current.x) * 0.15;
      reticlePosRef.current.y += (ty - reticlePosRef.current.y) * 0.15;

      // Outer Lead Reticle lags slightly more (0.06) to simulate weapon lead computer
      outerPosRef.current.x += (tx - outerPosRef.current.x) * 0.06;
      outerPosRef.current.y += (ty - outerPosRef.current.y) * 0.06;

      setReticlePos({ ...reticlePosRef.current });
      setOuterPos({ ...outerPosRef.current });

      animId = requestAnimationFrame(animateReticle);
    };

    animId = requestAnimationFrame(animateReticle);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Mouse Movement Handler inside HUD Canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    mousePosRef.current = {
      x: Math.min(95, Math.max(5, x)),
      y: Math.min(92, Math.max(8, y))
    };
  };

  const handleMouseLeave = () => {
    // Reset reticle back to center on leave
    mousePosRef.current = { x: 50, y: 42 };
  };

  // Radar Targets
  const [targets, setTargets] = useState<RadarTarget[]>([
    { id: 1, x: 35, y: -45, type: 'hostile', isLocked: true, code: 'BOGEY-01' },
    { id: 2, x: -50, y: -20, type: 'hostile', code: 'BOGEY-02' },
    { id: 3, x: 20, y: 60, type: 'friendly', code: 'VIPER-04' },
    { id: 4, x: -30, y: 50, type: 'unknown', code: 'BANDIT-09' }
  ]);
  const [sweepAngle, setSweepAngle] = useState(0);

  // Radar Sweep & Target Dynamics Loop
  useEffect(() => {
    const sweepInterval = setInterval(() => {
      setSweepAngle((prev) => (prev + 4) % 360);

      // Drifting simulation for radar targets
      setTargets((prevTargets) =>
        prevTargets.map((t) => {
          const deltaX = (Math.random() - 0.48) * 1.5;
          const deltaY = (Math.random() - 0.48) * 1.5;
          return {
            ...t,
            x: Math.min(85, Math.max(-85, t.x + deltaX)),
            y: Math.min(85, Math.max(-85, t.y + deltaY))
          };
        })
      );
    }, 50);

    return () => clearInterval(sweepInterval);
  }, []);

  // Main Telemetry Simulation Loop
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      if (isAfterburnerActive) return;

      tick++;
      const speedOffset = Math.sin(tick * 0.15) * 18;
      const altOffset = Math.cos(tick * 0.1) * 120;
      const pitchOffset = Math.sin(tick * 0.2) * 3;
      const rollOffset = Math.cos(tick * 0.15) * 4;

      setAirspeedKts((prev) => +(640 + speedOffset).toFixed(0));
      setAltitudeFt((prev) => +(24500 + altOffset).toFixed(0));
      setMachNumber((prev) => +((640 + speedOffset) / 661.4).toFixed(2));
      setPitch((prev) => +(pitchOffset).toFixed(1));
      setRoll((prev) => +(rollOffset).toFixed(1));
      setHeading((prev) => (285 + Math.round(Math.sin(tick * 0.05) * 6)) % 360);
      setGForce((prev) => +(1.8 + Math.abs(speedOffset) * 0.06).toFixed(1));

      if (tick % 20 === 0) {
        setFuelPercent((prev) => Math.max(10, +(prev - 0.1).toFixed(1)));
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isAfterburnerActive]);

  // Interactive Afterburner Boost Trigger
  const handleAfterburner = () => {
    if (isAfterburnerActive) return;
    setIsAfterburnerActive(true);

    let step = 0;
    const boostInterval = setInterval(() => {
      step++;
      if (step < 10) {
        setAirspeedKts((prev) => Math.min(1250, prev + 55));
        setMachNumber((prev) => Math.min(2.45, +(prev + 0.12).toFixed(2)));
        setAltitudeFt((prev) => prev + 220);
        setGForce((prev) => Math.min(7.8, +(prev + 0.5).toFixed(1)));
        setPitch(14);
      } else if (step < 20) {
        setAirspeedKts((prev) => Math.max(640, prev - 45));
        setMachNumber((prev) => Math.max(0.95, +(prev - 0.1).toFixed(2)));
        setGForce((prev) => Math.max(2.1, +(prev - 0.4).toFixed(1)));
        setPitch(4);
      } else {
        clearInterval(boostInterval);
        setIsAfterburnerActive(false);
      }
    }, 120);
  };

  // Interactive Flare Countermeasure Deployment
  const handleDeployFlares = () => {
    if (flaresCount <= 0 || isDeployingFlares) return;
    setIsDeployingFlares(true);
    setFlaresCount((prev) => Math.max(0, prev - 3));
    setChaffCount((prev) => Math.max(0, prev - 5));

    setTimeout(() => {
      setIsDeployingFlares(false);
    }, 1800);
  };

  // Interactive Weapon Firing Simulation (5s tracking & auto-stop)
  const handleFireWeapon = (targetX?: number, targetY?: number) => {
    if (masterArm !== 'ARMED') {
      setFiringLog('⚠️ CANNOT FIRE: MASTER ARM IS SAFE');
      return;
    }

    const current = weapons[activeWeapon];
    if (current.count <= 0) {
      setFiringLog(`❌ NO AMMO: ${current.name} EMPTY`);
      return;
    }

    setIsFiringWeapon(true);
    const decrement = activeWeapon === 'CANNON' ? 30 : 1;
    const newCount = Math.max(0, current.count - decrement);

    setWeapons((prev) => ({
      ...prev,
      [activeWeapon]: {
        ...prev[activeWeapon],
        count: newCount,
        status: newCount === 0 ? 'EMPTY' : prev[activeWeapon].status
      }
    }));

    // Trigger Fire FX Instance at reticle position
    const fxX = targetX ?? reticlePosRef.current.x;
    const fxY = targetY ?? reticlePosRef.current.y;
    const effectId = Date.now() + Math.random();

    setFireEffects((prev) => [
      ...prev.slice(-3),
      { id: effectId, x: fxX, y: fxY, weapon: activeWeapon, timestamp: Date.now() }
    ]);

    // Recoil Jitter Offset
    const recoilAmount = activeWeapon === 'CANNON' ? 2 : activeWeapon === 'JDAM' ? 4 : 3;
    setRecoilOffset({
      x: (Math.random() - 0.5) * recoilAmount,
      y: (Math.random() - 0.5) * recoilAmount
    });

    // Screen Flash Color based on weapon
    const flash =
      activeWeapon === 'CANNON'
        ? 'rgba(0, 255, 213, 0.2)'
        : activeWeapon === 'JDAM'
        ? 'rgba(245, 158, 11, 0.25)'
        : 'rgba(225, 29, 72, 0.25)';
    setScreenFlashColor(flash);

    setTimeout(() => setRecoilOffset({ x: 0, y: 0 }), 150);
    setTimeout(() => setScreenFlashColor(null), 250);

    const initialLog =
      activeWeapon === 'AMRAAM'
        ? '🚀 FOX-3! AIM-120C AMRAAM AWAY [TRACKING: T-5s]'
        : activeWeapon === 'SIDEWINDER'
        ? '🔥 FOX-2! AIM-9X SIDEWINDER ENGAGED [TRACKING: T-5s]'
        : activeWeapon === 'CANNON'
        ? '⚡ GUNS GUNS GUNS! 20MM BURST [TARGETING: T-5s]'
        : '💣 PICKLE! GBU-31 JDAM RELEASED [GUIDANCE: T-5s]';
    setFiringLog(initialLog);

    // Reset and start 5-Second Missile Tracking Countdown & Auto-Stop
    if (trackingTimerRef.current) {
      clearInterval(trackingTimerRef.current);
    }

    setTrackingSecsLeft(5);

    let secs = 5;
    trackingTimerRef.current = setInterval(() => {
      secs -= 1;
      if (secs > 0) {
        setTrackingSecsLeft(secs);
        setFiringLog(`🎯 WEAPON TRACKING IN PROGRESS... [T-${secs}s]`);
      } else {
        if (trackingTimerRef.current) clearInterval(trackingTimerRef.current);
        setTrackingSecsLeft(null);
        setIsFiringWeapon(false);
        setFireEffects([]); // Stop missile tracking and clear animations after 5 seconds!
        setFiringLog('💥 TARGET IMPACT CONFIRMED - TRACKING TERMINATED (T+5.0s)');
      }
    }, 1000);
  };

  // Rearm / Reset Weapons
  const handleRearmWeapons = () => {
    setWeapons({
      AMRAAM: { id: 'AMRAAM', name: 'AIM-120C AMRAAM', code: 'A2A RADAR', count: 4, maxCount: 4, status: 'HOT', typeLabel: 'FOX-3 RADAR' },
      SIDEWINDER: { id: 'SIDEWINDER', name: 'AIM-9X SIDEWINDER', code: 'IR HEAT', count: 2, maxCount: 2, status: 'READY', typeLabel: 'FOX-2 IR' },
      CANNON: { id: 'CANNON', name: '20MM M61A2 CANNON', code: 'GUNS', count: 510, maxCount: 510, status: 'ARMED', typeLabel: '20MM VULCAN' },
      JDAM: { id: 'JDAM', name: 'GBU-31 JDAM', code: 'A2G GPS', count: 2, maxCount: 2, status: 'READY', typeLabel: 'GPS BOMB' },
    });
    setFlaresCount(30);
    setChaffCount(60);
    setFiringLog('🔄 WEAPONS & COUNTERMEASURES REARMED');
  };

  // Interactive Radar Target Locking
  const handleToggleTargetLock = () => {
    setIsTargetLocked((prev) => !prev);
  };

  // Convert Airspeed based on unit setting
  const getDisplaySpeed = () => {
    if (unit === 'MACH') return `MACH ${machNumber}`;
    if (unit === 'MPH') return `${(airspeedKts * 1.15078).toFixed(0)} MPH`;
    return `${airspeedKts} KTS`;
  };

  // Gauge Angle Helpers
  const getAngle = (ratio: number) => 135 + Math.min(1, Math.max(0, ratio)) * 270;
  const polarToCartesian = (cx: number, cy: number, radius: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  };

  // Airspeed Dial (0 - 1200 Kts)
  const speedRatio = Math.min(1, airspeedKts / 1200);
  const speedAngle = getAngle(speedRatio);
  const speedNeedleEnd = polarToCartesian(110, 110, 82, speedAngle);

  // Altitude Dial (0 - 60,000 Ft)
  const altRatio = Math.min(1, altitudeFt / 60000);
  const altAngle = getAngle(altRatio);
  const altNeedleEnd = polarToCartesian(110, 110, 82, altAngle);

  // Background style computation
  const bgAlpha = isBg
    ? Math.min(0.25, Math.max(0.02, cardOpacity * 0.35))
    : Math.max(0.18, cardOpacity * 0.85);

  const containerStyle: React.CSSProperties = isBg
    ? {
        backdropFilter: `blur(${Math.min(backgroundBlur, 8)}px)`,
        WebkitBackdropFilter: `blur(${Math.min(backgroundBlur, 8)}px)`,
        backgroundColor: `rgba(2, 10, 14, ${bgAlpha})`
      }
    : {
        backdropFilter: `blur(${backgroundBlur}px)`,
        WebkitBackdropFilter: `blur(${backgroundBlur}px)`,
        backgroundColor: `rgba(4, 14, 20, ${bgAlpha})`
      };

  return (
    <div
      style={containerStyle}
      className={
        isBg
          ? 'fixed inset-0 z-0 pointer-events-auto w-full h-full p-2 sm:p-3 lg:p-4 font-mono text-[#00ffd5] overflow-y-auto overflow-x-hidden select-none flex flex-col justify-between transition-all duration-500'
          : 'relative w-full rounded-3xl border border-[#00ffd5]/40 shadow-[0_0_40px_rgba(0,255,213,0.25)] p-2 sm:p-3 lg:p-4 font-mono text-[#00ffd5] overflow-y-auto overflow-x-hidden transition-all duration-300 select-none max-h-[92vh]'
      }
    >
      {/* Sci-Fi Cockpit Sky Background Wallpaper Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={cockpitWallpaperImg}
          alt="Fighter Jet Cockpit Wallpaper"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-70 scale-105 filter contrast-110 saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020a0e]/70 via-[#020a0e]/30 to-transparent" />
      </div>

      {/* Tactical Radar Grid / Crosshair background pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00ffd5_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* TOP HUD CONTROL STRIP */}
      <div className={`relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#00ffd5]/30 ${isBg ? 'mt-16 sm:mt-20' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#00ffd5]/15 border border-[#00ffd5]/50 shadow-[0_0_12px_rgba(0,255,213,0.3)]">
            <Plane className="w-4 h-4 text-[#00ffd5] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black tracking-widest text-white flex items-center gap-2">
              <span>FIGHTER JET COCKPIT HUD</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00ffd5]/20 border border-[#00ffd5]/60 text-[#00ffd5] font-bold">
                {isFiringWeapon
                  ? '💥 WEAPON FIRED'
                  : isAfterburnerActive
                  ? '🔥 AFTERBURNER'
                  : isDeployingFlares
                  ? '⚡ FLARES DEPLOYED'
                  : 'FLIGHT READY'}
              </span>
            </h3>
          </div>
        </div>

        {/* Center: HUD Switcher (Car vs Jet), Wallpaper Setter & Flight Mode Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Apply Cockpit Wallpaper Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedWallpaper(FIGHTER_JET_COCKPIT_WALLPAPER);
              setFiringLog('🌄 COCKPIT WALLPAPER APPLIED TO DASHBOARD');
            }}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedWallpaper?.id === FIGHTER_JET_COCKPIT_WALLPAPER.id
                ? 'bg-[#00ffd5]/20 border-[#00ffd5] text-[#00ffd5] shadow-[0_0_12px_rgba(0,255,213,0.4)] font-black'
                : 'bg-black/80 border-[#00ffd5]/30 text-white/70 hover:text-white hover:border-[#00ffd5]/60'
            }`}
            title="Set Sci-Fi Cockpit wallpaper as dashboard wallpaper"
          >
            <ImageIcon className="w-3 h-3 text-[#00ffd5]" />
            <span className="hidden sm:inline">Cockpit Wallpaper</span>
          </button>

          {/* Quick HUD Theme Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/80 border border-[#00ffd5]/40 shadow-inner">
            <button
              type="button"
              onClick={() => updateSettings({ cyberHudStyle: 'car' })}
              className="px-2 py-1 text-[10px] font-bold rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              title="Switch to Sports Car Speedometer"
            >
              <span>🚗</span>
              <span className="hidden sm:inline">Car</span>
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ cyberHudStyle: 'fighter_jet' })}
              className="px-2 py-1 text-[10px] font-black rounded-lg bg-[#00ffd5] text-slate-950 shadow-[0_0_10px_#00ffd5] cursor-pointer flex items-center gap-1"
              title="Active Fighter Jet Cockpit"
            >
              <span>✈️</span>
              <span className="hidden sm:inline">Jet</span>
            </button>
          </div>

          {/* Flight Mode Buttons */}
          <div className="hidden lg:flex items-center gap-1">
            {(['PATROL', 'RECON', 'COMBAT', 'DOGFIGHT'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFlightMode(m)}
                className={`px-2 py-1 text-[10px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                  flightMode === m
                    ? 'bg-[#00ffd5] text-slate-950 border-[#00ffd5] shadow-[0_0_12px_#00ffd5] font-black'
                    : 'bg-black/60 text-[#00ffd5]/60 border-[#00ffd5]/30 hover:text-[#00ffd5]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Master Arm & Interactive Actions */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Master Arm Toggle */}
          <button
            type="button"
            onClick={() => setMasterArm(masterArm === 'ARMED' ? 'SAFE' : 'ARMED')}
            className={`px-2 py-1 text-xs font-black rounded-lg border transition-all cursor-pointer ${
              masterArm === 'ARMED'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                : 'bg-[#00ffd5]/10 text-[#00ffd5]/60 border-[#00ffd5]/30'
            }`}
          >
            {masterArm}
          </button>

          {/* Speed Unit Selector */}
          <button
            type="button"
            onClick={() => {
              if (unit === 'KTS') setUnit('MACH');
              else if (unit === 'MACH') setUnit('MPH');
              else setUnit('KTS');
            }}
            className="px-2 py-1 rounded-lg bg-[#00ffd5]/20 hover:bg-[#00ffd5]/35 border border-[#00ffd5]/50 text-xs font-bold transition-colors cursor-pointer text-white"
          >
            {unit}
          </button>

          {/* Afterburner Button */}
          <button
            type="button"
            onClick={handleAfterburner}
            disabled={isAfterburnerActive}
            className="px-2.5 py-1 rounded-lg bg-[#00ffd5] hover:bg-white text-slate-950 font-black text-xs shadow-[0_0_15px_#00ffd5] transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">BURNER</span>
          </button>

          {/* Flare Deploy Button */}
          <button
            type="button"
            onClick={handleDeployFlares}
            disabled={flaresCount <= 0 || isDeployingFlares}
            className="px-2.5 py-1 rounded-lg bg-[#00ffd5]/20 hover:bg-[#00ffd5]/40 border border-[#00ffd5] text-[#00ffd5] font-extrabold text-xs shadow-[0_0_12px_rgba(0,255,213,0.4)] transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-40"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">FLARES ({flaresCount})</span>
          </button>
        </div>
      </div>

      {/* MAIN FULL-WIDTH COCKPIT HUD GRID */}
      <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center w-full">
        
        {/* UPPER INSTRUMENT ROW: AIRSPEED (LEFT) | PILOT HUD GLASS (CENTER) | ALTITUDE (RIGHT) */}
        <div className="w-full max-w-[1920px] px-2 sm:px-4 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center justify-items-center">
          
          {/* LEFT GAUGE: AIRSPEED & MACH DIAL */}
          <div className="w-full lg:col-span-3 order-1 flex flex-col items-center justify-center relative">
            <div className="relative w-[180px] h-[180px] sm:w-[210px] sm:h-[210px] lg:w-[240px] lg:h-[240px] xl:w-[260px] xl:h-[260px] transition-all duration-300">
              <svg viewBox="0 0 220 220" className="w-full h-full overflow-visible">
                <defs>
                  <filter id="glowCyanJet" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00ffd5" floodOpacity="0.9" />
                  </filter>
                </defs>

                {/* Outer Segmented Ring */}
                <circle cx="110" cy="110" r="102" fill="none" stroke="rgba(0,255,213,0.3)" strokeWidth="1.5" strokeDasharray="6 3" />
                <circle cx="110" cy="110" r="98" fill="none" stroke="rgba(0,255,213,0.6)" strokeWidth="2" />

                {/* Ticks: Airspeed 0 to 1200 KTS */}
                {Array.from({ length: 13 }).map((_, i) => {
                  const val = i * 100;
                  const deg = 135 + (i / 12) * 270;
                  const p1 = polarToCartesian(110, 110, 96, deg);
                  const p2 = polarToCartesian(110, 110, 86, deg);
                  const pText = polarToCartesian(110, 110, 72, deg);
                  return (
                    <g key={i}>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#00ffd5" strokeWidth="2" />
                      <text x={pText.x} y={pText.y + 3} textAnchor="middle" fill="#00ffd5" fontSize="8" fontWeight="bold">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Inner Ring with Mach Label */}
                <circle cx="110" cy="110" r="52" fill="none" stroke="rgba(0,255,213,0.7)" strokeWidth="1.5" strokeDasharray="12 4" />
                <text x="110" y="148" textAnchor="middle" fill="rgba(0,255,213,0.8)" fontSize="8" fontWeight="bold" letterSpacing="1">
                  AIRSPEED (KTS)
                </text>

                {/* Speed Needle */}
                <line
                  x1="110"
                  y1="110"
                  x2={speedNeedleEnd.x}
                  y2={speedNeedleEnd.y}
                  stroke="#00ffd5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glowCyanJet)"
                  className="transition-all duration-150"
                />

                {/* Pivot */}
                <circle cx="110" cy="110" r="14" fill="#020a0e" stroke="#00ffd5" strokeWidth="2" />
                <circle cx="110" cy="110" r="6" fill="#00ffd5" filter="url(#glowCyanJet)" />
              </svg>
            </div>
            <div className="mt-1 text-center">
              <div className="text-xs font-black text-[#00ffd5] tracking-widest uppercase">AIRSPEED INDICATOR</div>
              <div className="text-lg font-bold text-white font-mono">{getDisplaySpeed()}</div>
            </div>
          </div>

          {/* CENTER OF SCREEN: PILOT HUD GLASS MODULE */}
          <div className="w-full lg:col-span-6 order-2 flex flex-col items-center justify-center p-2 sm:p-4 rounded-3xl bg-black/10 border-2 border-[#00ffd5]/60 shadow-[0_0_40px_rgba(0,255,213,0.15)] text-center my-2 lg:my-0 relative overflow-visible transition-all duration-300">
            
            {/* Top Compass Heading Tape */}
            <div className="w-full flex items-center justify-between px-3 py-1.5 bg-black/20 border border-[#00ffd5]/40 rounded-xl text-xs font-black mb-2.5 shadow-[0_0_12px_rgba(0,255,213,0.15)]">
              <Compass className="w-4 h-4 text-[#00ffd5] animate-spin" style={{ animationDuration: '20s' }} />
              <div className="tracking-widest text-white font-mono text-sm">HDG: {heading}° NNE</div>
              <Navigation className="w-4 h-4 text-[#00ffd5]" />
            </div>

            {/* MAIN ARTIFICIAL HORIZON PILOT GLASS VIEWPORT (Overflow Visible to project laser & targeting components outside screen boundary) */}
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full h-[220px] sm:h-[260px] lg:h-[290px] xl:h-[310px] rounded-2xl border-2 border-[#00ffd5]/70 bg-transparent overflow-visible flex items-center justify-center cursor-crosshair group shadow-[0_0_20px_rgba(0,255,213,0.2)] pointer-events-auto"
            >
              {/* DYNAMIC TARGETING RETICLE & LASER OVERLAY - OVERFLOW VISIBLE OUTSIDE SCREEN BOUNDARY */}
              <div className="absolute inset-0 z-30 pointer-events-none overflow-visible">
                {/* SCREEN FLASH OVERLAY ON FIRE */}
                {screenFlashColor && (
                  <div
                    className="absolute inset-0 transition-opacity duration-100 pointer-events-none z-40 rounded-2xl"
                    style={{ backgroundColor: screenFlashColor }}
                  />
                )}

                {/* Outer Lead Computing Reticle (Lags behind primary targeting reticle) */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 text-[#00ffd5]/60 pointer-events-none z-30"
                  style={{
                    left: `${outerPos.x}%`,
                    top: `${outerPos.y}%`,
                  }}
                >
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-dashed border-[#00ffd5]/50 flex items-center justify-center animate-spin" style={{ animationDuration: '25s' }}>
                    <div className="w-2 h-2 rounded-full bg-[#00ffd5]/60" />
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest text-[#00ffd5]/80 bg-black/80 px-1.5 py-0.5 rounded border border-[#00ffd5]/40 shadow-lg">
                    LEAD 12.4°
                  </div>
                </div>

                {/* Dynamic Vector Lines & Laser Beams Layer (Emanating from CENTER OF DISPLAY) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                  {/* Center Laser Guidance Beam emanating from exact Center of Display (50%, 50%) to Target Reticle */}
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${reticlePos.x + recoilOffset.x}%`}
                    y2={`${reticlePos.y + recoilOffset.y}%`}
                    stroke={isFiringWeapon ? '#f43f5e' : isTargetLocked ? '#f59e0b' : '#00ffd5'}
                    strokeWidth={isFiringWeapon ? '4' : '2'}
                    strokeDasharray={isFiringWeapon ? 'none' : '6 4'}
                    filter="url(#glowCyanJet)"
                    className="animate-pulse"
                  />

                  {/* Pulsing Armament Laser Emitter Ring at Center of Display */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r={isFiringWeapon ? '12' : '7'}
                    fill="none"
                    stroke={isFiringWeapon ? '#f43f5e' : '#00ffd5'}
                    strokeWidth="2"
                    className="animate-ping"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="3.5"
                    fill={isFiringWeapon ? '#f43f5e' : '#ffffff'}
                  />

                  {/* Connecting Lag Vector between Outer Lead Reticle & Target Reticle */}
                  <line
                    x1={`${outerPos.x}%`}
                    y1={`${outerPos.y}%`}
                    x2={`${reticlePos.x + recoilOffset.x}%`}
                    y2={`${reticlePos.y + recoilOffset.y}%`}
                    stroke="rgba(0, 255, 213, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />

                  {/* Laser Tracer Beams Fired from CENTER OF DISPLAY (50%, 50%) towards Target Reticle */}
                  {fireEffects.map((ef) => (
                    <g key={ef.id} className="animate-ping" style={{ animationDuration: '0.4s' }}>
                      <line
                        x1="50%"
                        y1="50%"
                        x2={`${ef.x}%`}
                        y2={`${ef.y}%`}
                        stroke={ef.weapon === 'CANNON' ? '#00ffd5' : ef.weapon === 'JDAM' ? '#f59e0b' : '#f43f5e'}
                        strokeWidth={ef.weapon === 'CANNON' ? '6' : '10'}
                        strokeLinecap="round"
                        filter="url(#glowCyanJet)"
                      />
                      <circle
                        cx={`${ef.x}%`}
                        cy={`${ef.y}%`}
                        r={ef.weapon === 'CANNON' ? '10' : '18'}
                        fill={ef.weapon === 'CANNON' ? '#00ffd5' : '#f43f5e'}
                      />
                    </g>
                  ))}
                </svg>

                {/* Primary Targeting Reticle (Follows Mouse with Lag Effect & Recoil Offset) */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75 z-40"
                  style={{
                    left: `${reticlePos.x + recoilOffset.x}%`,
                    top: `${reticlePos.y + recoilOffset.y}%`,
                  }}
                >
                  <div className={`relative w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center transition-all ${isFiringWeapon ? 'scale-125' : 'scale-100'}`}>
                    
                    {/* Corner Reticle Brackets [ ] */}
                    <div className={`absolute inset-0 border-2 rounded-xl transition-all ${
                      isFiringWeapon
                        ? 'border-rose-500 shadow-[0_0_24px_#f43f5e] scale-110'
                        : isTargetLocked
                        ? 'border-rose-400 shadow-[0_0_12px_#f43f5e]'
                        : 'border-[#00ffd5] shadow-[0_0_12px_rgba(0,255,213,0.5)]'
                    }`}>
                      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />
                    </div>

                    {/* Inner Crosshair Pipper */}
                    <div className="relative flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${isFiringWeapon ? 'bg-rose-500 animate-ping' : 'bg-[#00ffd5]'}`} />
                      <div className="absolute w-6 h-0.5 bg-[#00ffd5]/80" />
                      <div className="absolute h-6 w-0.5 bg-[#00ffd5]/80" />
                    </div>

                    {/* Target Distance & Active Weapon Label */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 border border-[#00ffd5]/60 px-2 py-0.5 rounded text-[9px] font-extrabold font-mono text-[#00ffd5] flex items-center gap-1 shadow-xl">
                      <TargetIcon className="w-3 h-3 text-rose-400 animate-pulse" />
                      <span>{weapons[activeWeapon].id}</span>
                      <span className="text-white">| RNG: 1.8NM</span>
                      {trackingSecsLeft !== null && (
                        <span className="ml-1 text-rose-400 font-black animate-pulse bg-rose-950/80 px-1 rounded border border-rose-500/50">
                          🎯 T-{trackingSecsLeft}s
                        </span>
                      )}
                    </div>

                    {/* Firing Shockwave Explosion Ring */}
                    {isFiringWeapon && (
                      <div className="absolute inset-0 rounded-full border-4 border-rose-500 animate-ping shadow-[0_0_30px_#f43f5e]" />
                    )}
                  </div>
                </div>

                {/* Active Fire Burst Impact Flares */}
                {fireEffects.map((ef) => (
                  <div
                    key={ef.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 flex items-center justify-center"
                    style={{ left: `${ef.x}%`, top: `${ef.y}%` }}
                  >
                    {/* Expanding Burst Shockwave Ring */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-400 bg-rose-500/30 animate-ping shadow-[0_0_40px_#f59e0b]" />
                    <div className="absolute w-10 h-10 bg-white rounded-full blur-md animate-pulse" />
                    <div className="absolute text-[10px] font-black font-mono text-amber-300 bg-black/90 border border-amber-400 px-2 py-0.5 rounded shadow-xl -top-8 animate-bounce">
                      💥 {ef.weapon} IMPACT
                    </div>
                  </div>
                ))}
              </div>

              {/* Animated Pitch / Roll Horizon Grid Lines */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-150 pointer-events-none"
                style={{
                  transform: `rotate(${roll}deg) translateY(${pitch * 2.8}px)`
                }}
              >
                {/* Horizon Line */}
                <div className="w-full h-0.5 bg-[#00ffd5] shadow-[0_0_10px_#00ffd5]" />
                
                {/* Pitch Ladder Bars */}
                <div className="w-32 sm:w-44 h-0.5 border-t border-dashed border-[#00ffd5]/80 -mt-12 flex justify-between text-[9px] font-black">
                  <span>+10</span><span>+10</span>
                </div>
                <div className="w-40 sm:w-56 h-0.5 border-t-2 border-[#00ffd5] -mt-12 flex justify-between text-[9px] font-black">
                  <span>+20</span><span>+20</span>
                </div>
                <div className="w-32 sm:w-44 h-0.5 border-t border-dashed border-[#00ffd5]/80 mt-12 flex justify-between text-[9px] font-black">
                  <span>-10</span><span>-10</span>
                </div>
                <div className="w-40 sm:w-56 h-0.5 border-t-2 border-[#00ffd5] mt-12 flex justify-between text-[9px] font-black">
                  <span>-20</span><span>-20</span>
                </div>
              </div>

              {/* Fixed Waterline Aircraft reticle in center */}
              <div className="relative z-10 flex items-center justify-center pointer-events-none">
                {/* Center crosshair / Waterline reticle */}
                <div className="w-12 h-12 border-2 border-[#00ffd5] rounded-full flex items-center justify-center shadow-[0_0_15px_#00ffd5] bg-[#00ffd5]/10">
                  <div className="w-2.5 h-2.5 bg-[#00ffd5] rounded-full shadow-[0_0_8px_#00ffd5]" />
                </div>
                <div className="absolute w-28 h-0.5 bg-[#00ffd5] shadow-[0_0_8px_#00ffd5]" />
              </div>

              {/* Target Locking Toggle Button inside Glass Viewport */}
              <button
                type="button"
                onClick={handleToggleTargetLock}
                className="absolute top-3 right-3 z-40 pointer-events-auto cursor-pointer group"
                title="Toggle Target Lock"
              >
                <div className={`p-2 rounded-xl border transition-all ${isTargetLocked ? 'border-rose-500 bg-rose-500/30 text-rose-300 animate-pulse shadow-[0_0_15px_#f43f5e]' : 'border-[#00ffd5]/60 bg-black/80 text-[#00ffd5] hover:border-[#00ffd5]'}`}>
                  <Crosshair className="w-5 h-5" />
                </div>
              </button>

              {/* Digital Overlay Telemetry inside horizon (Showing G and KTS/Mach prominently) */}
              <div className="absolute top-3 left-3 z-20 text-left font-bold text-[#00ffd5] pointer-events-none bg-black/30 px-2 py-1 rounded-lg border border-[#00ffd5]/40 text-xs shadow-md">
                <div className="text-white font-extrabold text-xs">{getDisplaySpeed()}</div>
                <div className="text-[10px] text-[#00ffd5]/80">AoA: {aoa}°</div>
              </div>

              <div className="absolute bottom-3 left-3 z-20 text-left font-bold text-[#00ffd5] pointer-events-none bg-black/30 px-2.5 py-1 rounded-lg border border-[#00ffd5]/40 shadow-md">
                <div className="text-amber-400 font-extrabold text-sm flex items-center gap-1">
                  <span>G-FORCE:</span>
                  <span className="text-white font-mono">+{gForce} G</span>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 z-20 text-right font-bold text-[#00ffd5] pointer-events-none bg-black/30 px-2.5 py-1 rounded-lg border border-[#00ffd5]/40 shadow-md text-[10px]">
                <div className="text-white">RNG: 4.2 NM</div>
                <div className={isTargetLocked ? 'text-rose-400 font-black animate-pulse' : 'text-[#00ffd5]'}>
                  {isTargetLocked ? '🔒 LOCK ENGAGED' : '📡 SEARCHING'}
                </div>
              </div>
            </div>

            {/* Readout Strip under horizon */}
            <div className="mt-3 pt-2.5 border-t border-[#00ffd5]/40 w-full flex items-center justify-between text-xs font-extrabold">
              <div className="flex items-center gap-1.5 text-[#00ffd5]">
                <Activity className="w-4 h-4 text-[#00ffd5] animate-pulse" />
                <span>G-LIMIT: 9.0G</span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-[#00ffd5]/20 border border-[#00ffd5]/60 text-white font-mono text-xs shadow-[0_0_12px_rgba(0,255,213,0.3)]">
                {getDisplaySpeed()} | {altitudeFt.toLocaleString()} FT
              </div>
            </div>
          </div>

          {/* RIGHT GAUGE: ALTITUDE & CLIMB DIAL */}
          <div className="w-full lg:col-span-3 order-3 flex flex-col items-center justify-center relative">
            <div className="relative w-[180px] h-[180px] sm:w-[210px] sm:h-[210px] lg:w-[240px] lg:h-[240px] xl:w-[260px] xl:h-[260px] transition-all duration-300">
              <svg viewBox="0 0 220 220" className="w-full h-full overflow-visible">
                {/* Outer Segmented Ring */}
                <circle cx="110" cy="110" r="102" fill="none" stroke="rgba(0,255,213,0.3)" strokeWidth="1.5" strokeDasharray="6 3" />
                <circle cx="110" cy="110" r="98" fill="none" stroke="rgba(0,255,213,0.6)" strokeWidth="2" />

                {/* Ticks: Altitude 0 to 60k FT */}
                {Array.from({ length: 13 }).map((_, i) => {
                  const val = i * 5; // x1000 FT
                  const deg = 135 + (i / 12) * 270;
                  const p1 = polarToCartesian(110, 110, 96, deg);
                  const p2 = polarToCartesian(110, 110, 86, deg);
                  const pText = polarToCartesian(110, 110, 72, deg);
                  return (
                    <g key={i}>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#00ffd5" strokeWidth="2" />
                      <text x={pText.x} y={pText.y + 3} textAnchor="middle" fill="#00ffd5" fontSize="8" fontWeight="bold">
                        {val}k
                      </text>
                    </g>
                  );
                })}

                {/* Inner Ring with Baro label */}
                <circle cx="110" cy="110" r="52" fill="none" stroke="rgba(0,255,213,0.7)" strokeWidth="1.5" strokeDasharray="12 4" />
                <text x="110" y="148" textAnchor="middle" fill="rgba(0,255,213,0.8)" fontSize="8" fontWeight="bold" letterSpacing="1">
                  ALTITUDE (FT)
                </text>

                {/* Altitude Needle */}
                <line
                  x1="110"
                  y1="110"
                  x2={altNeedleEnd.x}
                  y2={altNeedleEnd.y}
                  stroke="#00ffd5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glowCyanJet)"
                  className="transition-all duration-150"
                />

                {/* Pivot */}
                <circle cx="110" cy="110" r="14" fill="#020a0e" stroke="#00ffd5" strokeWidth="2" />
                <circle cx="110" cy="110" r="6" fill="#00ffd5" filter="url(#glowCyanJet)" />
              </svg>
            </div>
            <div className="mt-1 text-center">
              <div className="text-xs font-black text-[#00ffd5] tracking-widest uppercase">ALTITUDE INDICATOR</div>
              <div className="text-lg font-bold text-white font-mono">{altitudeFt.toLocaleString()} FT</div>
            </div>
          </div>

        </div>

        {/* LOWER SYSTEM PANELS ROW: THREAT & TARGET POD (LEFT BOTTOM) | ARMAMENT STORE (RIGHT BOTTOM) */}
        <div className="w-full max-w-[1920px] px-2 sm:px-4 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 items-stretch">
          
          {/* LEFT BOTTOM PANEL: RWR THREAT WARNING & TARGET POD */}
          <div className="w-full p-3.5 rounded-2xl bg-black/70 border border-[#00ffd5]/40 backdrop-blur-md shadow-[0_0_25px_rgba(0,255,213,0.15)] flex flex-col gap-2.5 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-[#00ffd5]/30 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-white">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>RWR THREAT & TARGET POD</span>
              </div>
              <div className="flex items-center gap-1">
                {(['FLIR', 'NIGHT', 'TV'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPodMode(mode)}
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded border cursor-pointer ${
                      podMode === mode
                        ? 'bg-[#00ffd5] text-slate-950 border-[#00ffd5]'
                        : 'bg-black/50 text-[#00ffd5]/60 border-[#00ffd5]/30'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Radar Warning Receiver (RWR) Threat Matrix */}
            <div className="p-2.5 rounded-xl bg-black/60 border border-[#00ffd5]/25 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#00ffd5]/80">
                <span>RWR THREAT DETECTOR</span>
                <span className="text-emerald-400 font-mono">JAMMER: ACTIVE</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1 rounded bg-[#00ffd5]/10 border border-[#00ffd5]/20 text-[10px]">
                  <span className="text-rose-400 font-bold">MIG-35 BANDIT</span>
                  <span className="text-rose-400 font-black animate-pulse">LOCK WARNING</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 rounded bg-[#00ffd5]/10 border border-[#00ffd5]/20 text-[10px]">
                  <span className="text-amber-400 font-bold">SA-15 SAM RADAR</span>
                  <span className="text-amber-400 font-bold">TRACKING (32 NM)</span>
                </div>
              </div>
            </div>

            {/* Countermeasure Stores Dispenser */}
            <div className="p-2.5 rounded-xl bg-black/60 border border-[#00ffd5]/25 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#00ffd5]/80">
                <span>DEFENSIVE COUNTERMEASURES</span>
                <span className="text-white font-mono">{flaresCount + chaffCount} STORES</span>
              </div>

              {/* Flare Bar */}
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between font-bold">
                  <span>FLARE PODS</span>
                  <span>{flaresCount} / 30</span>
                </div>
                <div className="w-full h-1.5 rounded bg-slate-900 border border-[#00ffd5]/40 overflow-hidden">
                  <div className="h-full bg-[#00ffd5]" style={{ width: `${(flaresCount / 30) * 100}%` }} />
                </div>
              </div>

              {/* Chaff Bar */}
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between font-bold">
                  <span>CHAFF PODS</span>
                  <span>{chaffCount} / 60</span>
                </div>
                <div className="w-full h-1.5 rounded bg-slate-900 border border-[#00ffd5]/40 overflow-hidden">
                  <div className="h-full bg-[#00ffd5]" style={{ width: `${(chaffCount / 60) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* EOTS Targeting Pod Status */}
            <div className="p-2.5 rounded-xl bg-black/60 border border-[#00ffd5]/25 flex items-center justify-between text-[10px] font-mono">
              <div>
                <div className="text-white font-bold">LASER DESIGNATOR</div>
                <div className="text-[#00ffd5]/70">CODE: LZR-1688</div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-bold">TGT RANGE</div>
                <div className="text-white">4.2 NM (+380 KTS)</div>
              </div>
            </div>
          </div>

          {/* RIGHT BOTTOM PANEL: ARMAMENT STORES BAY */}
          <div className="w-full p-3.5 rounded-2xl bg-black/70 border border-[#00ffd5]/40 backdrop-blur-md shadow-[0_0_25px_rgba(0,255,213,0.15)] flex flex-col gap-2.5 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-[#00ffd5]/30 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-white">
                <TargetIcon className="w-4 h-4 text-[#00ffd5]" />
                <span>ARMAMENT STORES BAY</span>
              </div>
              <button
                type="button"
                onClick={handleRearmWeapons}
                className="text-[10px] px-2 py-0.5 rounded bg-[#00ffd5]/20 hover:bg-[#00ffd5]/40 border border-[#00ffd5]/50 text-[#00ffd5] font-bold flex items-center gap-1 cursor-pointer"
                title="Rearm all weapons and countermeasures"
              >
                <RefreshCw className="w-3 h-3" />
                <span>REARM</span>
              </button>
            </div>

            {/* Weapon Stores List / Interactive Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(Object.keys(weapons) as WeaponType[]).map((wKey) => {
                const w = weapons[wKey];
                const isSelected = activeWeapon === wKey;
                return (
                  <div
                    key={wKey}
                    onClick={() => setActiveWeapon(wKey)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#00ffd5]/20 border-[#00ffd5] shadow-[0_0_12px_rgba(0,255,213,0.3)]'
                        : 'bg-black/50 border-[#00ffd5]/25 hover:border-[#00ffd5]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-black text-white text-[11px]">
                        <span className={isSelected ? 'text-[#00ffd5]' : 'text-white/60'}>
                          {isSelected ? '▶' : '•'}
                        </span>
                        <span>{w.name}</span>
                      </div>
                      <div className="text-[9px] text-[#00ffd5]/80 font-mono tracking-wider">
                        {w.typeLabel}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-white">
                        {wKey === 'CANNON' ? `${w.count} RNDS` : `${w.count}/${w.maxCount}`}
                      </div>
                      <div
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                          w.count === 0
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                            : isSelected
                            ? 'bg-[#00ffd5] text-slate-950 border-[#00ffd5]'
                            : 'bg-[#00ffd5]/10 text-[#00ffd5] border-[#00ffd5]/30'
                        }`}
                      >
                        {w.count === 0 ? 'EMPTY' : w.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive FIRE WEAPON Button */}
            <button
              type="button"
              onClick={handleFireWeapon}
              disabled={weapons[activeWeapon].count <= 0}
              className={`w-full py-2.5 px-3 rounded-xl font-black text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md ${
                weapons[activeWeapon].count <= 0
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse'
              }`}
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>FIRE {weapons[activeWeapon].id}</span>
            </button>

            {/* Firing Log Terminal Output */}
            <div className="px-2.5 py-1.5 rounded-lg bg-black/80 border border-[#00ffd5]/30 text-[10px] font-mono text-[#00ffd5] truncate">
              {firingLog}
            </div>
          </div>

        </div>

      </div>

        {/* LOWER SUB-GAUGES & TACTICAL RADAR SWEEP ROW */}
        <div className="w-full max-w-[1850px] flex flex-wrap items-center justify-between gap-6 mt-4 px-4 sm:px-8">
          
          {/* TACTICAL RADAR SCOPE (Interactive 360 Sweep Display) */}
          <div className="flex items-center gap-3">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-[#00ffd5]/60 bg-black/80 overflow-hidden shadow-[0_0_20px_rgba(0,255,213,0.2)]">
              {/* Radar Rings */}
              <div className="absolute inset-2 rounded-full border border-[#00ffd5]/20 pointer-events-none" />
              <div className="absolute inset-6 rounded-full border border-[#00ffd5]/30 pointer-events-none" />
              <div className="absolute inset-10 rounded-full border border-[#00ffd5]/40 pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-[#00ffd5]/20" />
                <div className="h-full w-px bg-[#00ffd5]/20 absolute" />
              </div>

              {/* Sweeping Line */}
              <div
                className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent to-[#00ffd5] origin-left pointer-events-none shadow-[0_0_8px_#00ffd5]"
                style={{ transform: `rotate(${sweepAngle}deg)` }}
              />

              {/* Radar Targets (Blips) */}
              {targets.map((t) => (
                <div
                  key={t.id}
                  className={`absolute w-2.5 h-2.5 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                    t.type === 'hostile'
                      ? t.isLocked || isTargetLocked
                        ? 'bg-rose-500 border-2 border-white shadow-[0_0_10px_#f43f5e] animate-ping'
                        : 'bg-rose-400 shadow-[0_0_6px_#f43f5e]'
                      : 'bg-[#00ffd5] shadow-[0_0_6px_#00ffd5]'
                  }`}
                  style={{
                    left: `${50 + t.x * 0.4}%`,
                    top: `${50 + t.y * 0.4}%`
                  }}
                  title={`Target ${t.code}`}
                />
              ))}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1 text-[11px] font-black text-[#00ffd5]">
                <Radio className="w-3.5 h-3.5" />
                <span>RADAR SCOPE</span>
              </div>
              <div className="text-xs font-bold text-white">4 TARGETS IN RANGE</div>
              <div className="text-[10px] text-[#00ffd5]/70">RANGE: 40 NM (TWS)</div>
            </div>
          </div>

          {/* CENTER SYSTEM GAUGES (AoA & G-Force) */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 my-1">
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-xl bg-black/60 border border-[#00ffd5]/40 text-center min-w-[90px]">
                <div className="text-[10px] font-black text-[#00ffd5] uppercase">AoA INDEX</div>
                <div className="text-sm font-black text-white">{aoa}°</div>
                <div className="text-[9px] text-[#00ffd5]/60">OPTIMAL 8.0°</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-2 rounded-xl bg-black/60 border border-[#00ffd5]/40 text-center min-w-[90px]">
                <div className="text-[10px] font-black text-[#00ffd5] uppercase">G-FORCE</div>
                <div className="text-sm font-black text-white">+{gForce} G</div>
                <div className="text-[9px] text-[#00ffd5]/60">MAX +9.0G</div>
              </div>
            </div>
          </div>

          {/* SWEEPING FUEL & WEAPONS STATUS */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-right">
              <div className="flex items-center justify-end gap-1 text-[11px] font-black text-[#00ffd5]">
                <Shield className="w-3.5 h-3.5" />
                <span>WEAPONS / FUEL</span>
              </div>
              <div className="text-xs font-bold text-white">AMRAAM x{weapons.AMRAAM.count} | SIDW x{weapons.SIDEWINDER.count}</div>
              <div className="text-[10px] text-[#00ffd5]/80">INTERNAL FUEL: {fuelPercent}%</div>
            </div>
            <div className="relative w-24 h-16">
              <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(0,255,213,0.3)" strokeWidth="6" strokeLinecap="round" />
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#00ffd5"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="100"
                  strokeDashoffset={100 - fuelPercent}
                  filter="url(#glowCyanJet)"
                />
              </svg>
            </div>
          </div>

        </div>

      {/* FOOTER TELEMETRY STRIP */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-extrabold border-t border-[#00ffd5]/20 pt-2 text-[#00ffd5]/70">
        <div>SYS: F-35 CYBER COCKPIT HUD | FLIGHT SIM V4.2</div>
        <div className="hidden sm:block">TACTICAL DATA LINK 16 ACTIVE</div>
        <div className="text-white">COORDINATES: 37.7749° N | 122.4194° W</div>
      </div>
    </div>
  );
};

