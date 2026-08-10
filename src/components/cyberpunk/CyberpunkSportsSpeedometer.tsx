import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import {
  Gauge,
  Zap,
  Flame,
  Compass,
  Activity,
  ShieldAlert,
  Cpu,
  Sparkles,
  Droplets,
  Thermometer,
  Battery,
  Navigation,
  Fan,
  Snowflake,
  AlertTriangle,
  Wrench,
  Radio
} from 'lucide-react';

interface CyberpunkSportsSpeedometerProps {
  isBackgroundMode?: boolean;
}

export const CyberpunkSportsSpeedometer: React.FC<CyberpunkSportsSpeedometerProps> = ({ isBackgroundMode }) => {
  const { cardOpacity, backgroundBlur, speedometerPlacement } = useDashboardStore((state) => state.settings);
  const isBg = isBackgroundMode ?? (speedometerPlacement === 'background');

  // Dynamic Telemetry States
  const [rpm, setRpm] = useState(2400);
  const [speed, setSpeed] = useState(88);
  const [gear, setGear] = useState('4');
  const [prnd, setPrnd] = useState<'P' | 'R' | 'N' | 'D'>('D');
  const [turboPsi, setTurboPsi] = useState(14.5);
  const [nitro, setNitro] = useState(85);
  const [fuelPercent, setFuelPercent] = useState(76);
  const [coolantTemp, setCoolantTemp] = useState(90); // Celsius
  const [batteryPercent, setBatteryPercent] = useState(98);
  const [cabinTemp, setCabinTemp] = useState(23);
  const [unit, setUnit] = useState<'MPH' | 'KMH'>('MPH');
  const [driveMode, setDriveMode] = useState<'ECO' | 'NORMAL' | 'BOOST' | 'SPORT'>('SPORT');
  const [isRevving, setIsRevving] = useState(false);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [gForce, setGForce] = useState({ x: 0.2, y: 0.4 });

  // Toggles
  const [torqueVectoring, setTorqueVectoring] = useState(true);
  const [tractionControl, setTractionControl] = useState(true);

  // Driving Simulation Loop
  useEffect(() => {
    let phase = 0;

    const interval = setInterval(() => {
      if (isRevving) return;

      phase = (phase + 1) % 100;

      let targetRpm = 2400;
      let targetSpeed = 88;
      let targetPsi = 12;

      if (phase < 25) {
        targetRpm = 4500 + Math.sin(phase * 0.3) * 3200;
        targetSpeed = 95 + phase * 2.8;
        targetPsi = 18 + Math.random() * 8;
        setGear(phase < 10 ? '3' : phase < 20 ? '4' : '5');
      } else if (phase < 50) {
        targetRpm = 6800 + Math.sin(phase * 0.2) * 1200;
        targetSpeed = 165 + Math.sin(phase * 0.1) * 20;
        targetPsi = 24 + Math.random() * 4;
        setGear('6');
      } else if (phase < 75) {
        targetRpm = 3200 + Math.cos(phase * 0.2) * 1500;
        targetSpeed = 110 - (phase - 50) * 1.8;
        targetPsi = 8 + Math.random() * 3;
        setGear('4');
      } else {
        targetRpm = 2200 + Math.sin(phase * 0.4) * 1800;
        targetSpeed = 75 + (phase - 75) * 0.8;
        targetPsi = 12 + Math.random() * 5;
        setGear('3');
      }

      setRpm((prev) => Math.round(prev + (targetRpm - prev) * 0.25));
      setSpeed((prev) => Math.round(prev + (targetSpeed - prev) * 0.2));
      setTurboPsi((prev) => +(prev + (targetPsi - prev) * 0.3).toFixed(1));
      setGForce({
        x: +((Math.sin(phase * 0.1) * 0.8).toFixed(2)),
        y: +((Math.cos(phase * 0.15) * 0.9).toFixed(2)),
      });

      // Slow fuel/temp fluctuations
      if (phase % 10 === 0) {
        setFuelPercent((prev) => Math.max(15, +(prev - 0.05).toFixed(1)));
        setCoolantTemp((prev) => Math.min(115, Math.max(82, prev + (Math.random() - 0.5) * 2)));
      }
    }, 180);

    return () => clearInterval(interval);
  }, [isRevving]);

  // Handle Interactive Engine Rev
  const handleRevEngine = () => {
    setIsRevving(true);
    let revStep = 0;
    const revInterval = setInterval(() => {
      revStep++;
      if (revStep < 8) {
        setRpm((prev) => Math.min(8800, prev + 900));
        setSpeed((prev) => Math.min(220, prev + 12));
        setTurboPsi((prev) => Math.min(28.5, prev + 3.2));
      } else if (revStep < 16) {
        setRpm((prev) => Math.max(2200, prev - 800));
        setSpeed((prev) => Math.max(80, prev - 8));
        setTurboPsi((prev) => Math.max(10, prev - 2.5));
      } else {
        clearInterval(revInterval);
        setIsRevving(false);
      }
    }, 100);
  };

  // Handle Interactive Nitro Boost
  const handleNitroBoost = () => {
    if (nitro < 20 || isNitroActive) return;
    setIsNitroActive(true);
    setNitro((prev) => Math.max(0, prev - 35));
    setRpm(8400);
    setSpeed((prev) => prev + 45);
    setTurboPsi(30.0);

    setTimeout(() => {
      setIsNitroActive(false);
    }, 2000);
  };

  // Geometry calculations for Dial (260 deg sweep)
  const START_ANGLE = 140;
  const SWEEP_ANGLE = 260;

  const getCoordinates = (angleDeg: number, radius: number, cx = 130, cy = 130) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  // RPM Needle Angle (0 to 9000 RPM)
  const rpmRatio = Math.min(1, Math.max(0, rpm / 9000));
  const rpmAngle = START_ANGLE + rpmRatio * SWEEP_ANGLE;
  const rpmTip = getCoordinates(rpmAngle, 96);

  // Speed Display
  const displaySpeed = unit === 'KMH' ? Math.round(speed * 1.609) : speed;

  // Ticks for RPM gauge
  const rpmTicks = Array.from({ length: 10 }, (_, i) => {
    const angle = START_ANGLE + (i / 9) * SWEEP_ANGLE;
    const isRedline = i >= 7;
    const p1 = getCoordinates(angle, 98);
    const p2 = getCoordinates(angle, 112);
    const textPos = getCoordinates(angle, 82);
    return { val: i, angle, isRedline, p1, p2, textPos };
  });

  // Shift light logic (5 LEDs)
  const shiftLightCount = Math.min(5, Math.floor((rpm / 9000) * 6));
  const isRedlineFlash = rpm > 7400;

  // Glass & Background styles
  const bgAlpha = isBg
    ? Math.min(0.2, Math.max(0.02, cardOpacity * 0.3))
    : Math.max(0.15, cardOpacity * 0.8);

  const containerStyle: React.CSSProperties = isBg
    ? {
        backdropFilter: `blur(${Math.min(backgroundBlur, 8)}px)`,
        WebkitBackdropFilter: `blur(${Math.min(backgroundBlur, 8)}px)`,
        backgroundColor: `rgba(4, 8, 18, ${bgAlpha})`,
      }
    : {
        backdropFilter: `blur(${backgroundBlur}px)`,
        WebkitBackdropFilter: `blur(${backgroundBlur}px)`,
        backgroundColor: `rgba(8, 13, 26, ${bgAlpha})`,
      };

  return (
    <div
      style={containerStyle}
      className={
        isBg
          ? 'fixed inset-0 z-0 pointer-events-none w-full h-full p-4 sm:p-8 font-mono text-[#00f3ff] overflow-hidden select-none flex flex-col justify-between transition-all duration-500'
          : 'relative w-full rounded-3xl border border-[#00f3ff]/40 shadow-[0_0_30px_rgba(0,243,255,0.2)] p-4 sm:p-6 font-mono text-[#00f3ff] overflow-hidden transition-all duration-300 select-none group'
      }
    >
      {/* Carbon fiber & glowing grid mesh overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f3ff_1.2px,transparent_1.2px)] [background-size:24px_24px]" />

      {/* TOP BAR / GPS NETWORK & PRND CLUSTER */}
      <div className="relative z-10 flex items-center justify-between gap-4 pb-2 border-b border-[#00f3ff]/30">
        {/* Left: Branding / Telemetry Status */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#00f3ff]/15 border border-[#00f3ff]/50 shadow-[0_0_12px_rgba(0,243,255,0.3)] text-[#00f3ff]">
            <Gauge className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black tracking-widest text-white flex items-center gap-2">
              <span>CYBER SPORTS HUD</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff0055]/20 border border-[#ff0055]/50 text-[#ff0055] font-bold animate-pulse">
                {isNitroActive ? '🔥 NITRO BURST' : 'SYSTEM READY'}
              </span>
            </h3>
            <p className="text-[10px] text-[#00f3ff]/70 hidden sm:block">
              GPS NETWORK: ONLINE | TELEMETRY SYNCED
            </p>
          </div>
        </div>

        {/* Top Center: GPS Navigation Trajectory Vector */}
        <div className="hidden md:flex flex-col items-center justify-center space-y-0.5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#00f3ff]/80 tracking-widest">
            <span className="text-emerald-400">◄</span>
            <Navigation className="w-3.5 h-3.5 text-[#00f3ff] animate-pulse" />
            <span>GPS NETWORK : READY</span>
            <span className="text-emerald-400">►</span>
          </div>
          <div className="w-24 h-5 relative flex items-center justify-center">
            {/* Curved road vector simulation */}
            <svg viewBox="0 0 100 20" className="w-full h-full">
              <path
                d="M10 18 Q 50 2, 90 18"
                fill="none"
                stroke="rgba(0,243,255,0.4)"
                strokeWidth="2"
              />
              <path
                d="M45 10 L50 2 L55 10 Z"
                fill="#00f3ff"
                className="animate-bounce"
              />
            </svg>
          </div>
        </div>

        {/* Top Right: PRND Gear Selector & Interactive Buttons */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* PRND Gear Indicators */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/80 border border-[#00f3ff]/40 shadow-inner">
            {(['P', 'R', 'N', 'D'] as const).map((gearLetter) => {
              const isActive = prnd === gearLetter;
              return (
                <button
                  key={gearLetter}
                  type="button"
                  onClick={() => setPrnd(gearLetter)}
                  className={`text-xs sm:text-sm font-black px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-400/20 border border-emerald-400/60 shadow-[0_0_10px_#34d399]'
                      : 'text-white/30 hover:text-white/70'
                  }`}
                >
                  {gearLetter}
                </button>
              );
            })}
          </div>

          {/* Unit Toggle */}
          <button
            type="button"
            onClick={() => setUnit(unit === 'MPH' ? 'KMH' : 'MPH')}
            className="px-2.5 py-1 rounded-lg bg-[#00f3ff]/20 hover:bg-[#00f3ff]/35 border border-[#00f3ff]/50 text-xs font-bold transition-colors cursor-pointer shadow-md text-white"
          >
            {unit}
          </button>

          {/* Rev Engine */}
          <button
            type="button"
            onClick={handleRevEngine}
            disabled={isRevving}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#ff0055] to-[#ff5500] hover:from-[#ff2a75] hover:to-[#ff7722] text-white font-extrabold text-xs shadow-[0_0_12px_rgba(255,0,85,0.6)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            <span className="hidden sm:inline">REV</span>
          </button>

          {/* Nitro */}
          <button
            type="button"
            onClick={handleNitroBoost}
            disabled={nitro < 20 || isNitroActive}
            className="px-3 py-1 rounded-lg bg-[#00f3ff] hover:bg-[#55f7ff] text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(0,243,255,0.7)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">NITRO</span>
          </button>
        </div>
      </div>

      {/* MAIN DASHBOARD HUD CLUSTER PODS (3-Pod Cockpit Layout) */}
      <div className={`relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto ${isBg ? 'py-4' : 'py-2'}`}>
        
        {/* LEFT WING POD: CLIMATE, DRIVE MODES & TOGGLES */}
        <div className={`lg:col-span-3 flex flex-col justify-between p-4 rounded-2xl border relative transition-all space-y-4 ${
          isBg
            ? 'bg-slate-950/25 border-[#00f3ff]/30 backdrop-blur-xs shadow-[0_0_20px_rgba(0,243,255,0.12)]'
            : 'bg-slate-950/50 border-[#00f3ff]/30'
        }`}>
          {/* Top: Navigation / System ON */}
          <div className="flex items-center justify-between text-[11px] font-bold border-b border-[#00f3ff]/20 pb-2">
            <span className="text-[#00f3ff]/70 tracking-widest">NAVIGATION SYSTEM</span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ON
            </span>
          </div>

          {/* Drive Mode Selector Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-[#00f3ff]/60 tracking-widest uppercase">
              DRIVE MODE PROFILE
            </span>
            <div className="grid grid-cols-4 gap-1 pointer-events-auto">
              {(['ECO', 'NORMAL', 'BOOST', 'SPORT'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDriveMode(m)}
                  className={`py-1 text-[9px] font-extrabold rounded-lg border transition-all cursor-pointer text-center ${
                    driveMode === m
                      ? 'bg-[#00f3ff] text-slate-950 border-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.7)] font-black'
                      : 'bg-black/60 text-[#00f3ff]/60 border-[#00f3ff]/20 hover:text-[#00f3ff]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Torque Vectoring & Traction Toggles */}
          <div className="space-y-2 pointer-events-auto text-[11px] font-bold">
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/60 border border-[#00f3ff]/20">
              <span className="text-white/80">TORQUE VECTORING</span>
              <button
                type="button"
                onClick={() => setTorqueVectoring(!torqueVectoring)}
                className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                  torqueVectoring ? 'text-emerald-400 bg-emerald-400/20' : 'text-slate-500 bg-slate-800'
                }`}
              >
                {torqueVectoring ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-black/60 border border-[#00f3ff]/20">
              <span className="text-white/80">TRACTION CONTROL</span>
              <button
                type="button"
                onClick={() => setTractionControl(!tractionControl)}
                className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                  tractionControl ? 'text-emerald-400 bg-emerald-400/20' : 'text-slate-500 bg-slate-800'
                }`}
              >
                {tractionControl ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Climate & Cabin Gear Display */}
          <div className="flex items-center justify-between pt-2 border-t border-[#00f3ff]/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff]">
                <Fan className="w-4 h-4 animate-spin [animation-duration:3s]" />
              </div>
              <div>
                <div className="text-base font-black text-white">{cabinTemp}°C</div>
                <div className="text-[9px] text-[#00f3ff]/60 font-bold">CABIN TEMP</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[9px] text-[#00f3ff]/60 font-bold uppercase">DIGITAL GEAR</div>
              <div className="text-2xl font-black text-[#ff0055] font-mono drop-shadow-[0_0_8px_#ff0055]">
                {gear}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER POD: HUGE TACHOMETER / SPEEDOMETER DIAL */}
        <div className={`lg:col-span-6 flex flex-col items-center justify-center p-4 rounded-3xl border relative space-y-3 transition-all ${
          isBg
            ? 'bg-slate-950/35 border-[#00f3ff]/40 backdrop-blur-xs shadow-[0_0_30px_rgba(0,243,255,0.2)]'
            : 'bg-slate-950/70 border-[#00f3ff]/50 shadow-[0_0_25px_rgba(0,243,255,0.2)]'
        }`}>
          {/* Shift Light LED Array */}
          <div className="w-full max-w-xs flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg bg-black/80 border border-white/10">
            <span className="text-[9px] font-bold text-white/50 mr-1">SHIFT</span>
            {[1, 2, 3, 4, 5].map((led) => {
              const isActive = led <= shiftLightCount;
              const ledColor =
                led <= 2
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : led <= 4
                  ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                  : 'bg-[#ff0055] shadow-[0_0_12px_#ff0055] animate-pulse';

              return (
                <div
                  key={led}
                  className={`h-2.5 flex-1 rounded-sm transition-all ${
                    isActive ? ledColor : 'bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          {/* Dial SVG Instrumentation */}
          <div className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px]">
            <svg viewBox="0 0 260 260" className="w-full h-full overflow-visible">
              <defs>
                <filter id="glowFiltMain" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00f3ff" floodOpacity="0.8" />
                </filter>
                <filter id="redlineFiltMain" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ff0055" floodOpacity="0.9" />
                </filter>
              </defs>

              {/* Gauge Outer Glowing Ring */}
              <circle
                cx="130"
                cy="130"
                r="105"
                fill="none"
                stroke="rgba(0, 243, 255, 0.2)"
                strokeWidth="12"
              />

              {/* Redline Zone Arc */}
              <circle
                cx="130"
                cy="130"
                r="105"
                fill="none"
                stroke="rgba(255, 0, 85, 0.45)"
                strokeWidth="12"
                strokeDasharray="500"
                strokeDashoffset="370"
                transform="rotate(140 130 130)"
              />

              {/* RPM Ticks and Labels */}
              {rpmTicks.map((t) => (
                <g key={t.val}>
                  <line
                    x1={t.p1.x}
                    y1={t.p1.y}
                    x2={t.p2.x}
                    y2={t.p2.y}
                    stroke={t.isRedline ? '#ff0055' : '#00f3ff'}
                    strokeWidth={t.isRedline ? 2.5 : 1.5}
                    opacity={t.isRedline ? 1 : 0.75}
                  />
                  <text
                    x={t.textPos.x}
                    y={t.textPos.y + 3}
                    textAnchor="middle"
                    fill={t.isRedline ? '#ff0055' : '#ffffff'}
                    fontSize="11"
                    fontWeight="extrabold"
                  >
                    {t.val}
                  </text>
                </g>
              ))}

              {/* RPM Needle */}
              <line
                x1="130"
                y1="130"
                x2={rpmTip.x}
                y2={rpmTip.y}
                stroke={isRedlineFlash ? '#ff0055' : '#00f3ff'}
                strokeWidth="4"
                strokeLinecap="round"
                filter={isRedlineFlash ? 'url(#redlineFiltMain)' : 'url(#glowFiltMain)'}
                className="transition-all duration-150"
              />

              {/* Center Cap */}
              <circle cx="130" cy="130" r="16" fill="#050811" stroke="#00f3ff" strokeWidth="2" />
              <circle cx="130" cy="130" r="7" fill={isRedlineFlash ? '#ff0055' : '#00f3ff'} />
            </svg>

            {/* Huge Center Digital Speedometer Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <div className="text-[10px] font-black text-[#00f3ff] tracking-widest uppercase">
                SPEED
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(0,243,255,0.9)]">
                {displaySpeed.toString().padStart(3, '0')}
              </div>
              <div className="text-xs font-black text-[#00f3ff] tracking-widest uppercase">
                {unit}
              </div>
            </div>
          </div>

          {/* Turbo & G-Force Footer Bar */}
          <div className="w-full flex items-center justify-between text-[10px] font-extrabold px-3 py-1.5 rounded-xl bg-black/80 border border-[#00f3ff]/30">
            <span className="text-amber-400">TURBO: {turboPsi} PSI</span>
            <span className="text-white">G-FORCE: X:{gForce.x}G | Y:{gForce.y}G</span>
            <span className="text-[#00f3ff]">RPM: {rpm}</span>
          </div>
        </div>

        {/* RIGHT WING POD: STYLISH GAUGES (FUEL, COOLANT, BATTERY) & WARNING ICON GRID */}
        <div className={`lg:col-span-3 flex flex-col justify-between p-4 rounded-2xl border relative transition-all space-y-4 ${
          isBg
            ? 'bg-slate-950/25 border-[#00f3ff]/30 backdrop-blur-xs shadow-[0_0_20px_rgba(0,243,255,0.12)]'
            : 'bg-slate-950/50 border-[#00f3ff]/30'
        }`}>
          {/* STYLISH GAUGES SECTION */}
          <div className="space-y-3">
            <div className="text-[11px] font-black text-white tracking-widest border-b border-[#00f3ff]/20 pb-1 flex items-center justify-between">
              <span>VEHICLE FLUIDS & POWER</span>
              <span className="text-xs text-emerald-400 font-extrabold">100% OK</span>
            </div>

            {/* 1. STYLISH FUEL GAUGE BAR */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="flex items-center gap-1.5 text-white">
                  <Droplets className="w-3.5 h-3.5 text-[#00f3ff]" />
                  <span>FUEL LEVEL</span>
                </span>
                <span className="text-[#00f3ff] font-extrabold">{fuelPercent}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold text-[#ff0055]">E</span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-900 border border-[#00f3ff]/40 overflow-hidden p-0.5 relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#ff0055] via-amber-400 to-[#00f3ff] transition-all duration-500 shadow-[0_0_10px_rgba(0,243,255,0.5)]"
                    style={{ width: `${fuelPercent}%` }}
                  />
                </div>
                <span className="text-[9px] font-extrabold text-[#00f3ff]">F</span>
              </div>
            </div>

            {/* 2. COOLANT TEMPERATURE GAUGE */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="flex items-center gap-1.5 text-white">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>COOLANT TEMP</span>
                </span>
                <span className="text-amber-400 font-extrabold">{coolantTemp}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold text-[#00f3ff]">C</span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-900 border border-[#00f3ff]/40 overflow-hidden p-0.5 relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00f3ff] via-emerald-400 to-[#ff0055] transition-all duration-500 shadow-[0_0_10px_rgba(255,170,0,0.5)]"
                    style={{ width: `${Math.min(100, Math.max(10, ((coolantTemp - 50) / 70) * 100))}%` }}
                  />
                </div>
                <span className="text-[9px] font-extrabold text-[#ff0055]">H</span>
              </div>
            </div>

            {/* 3. BATTERY CHARGE GAUGE */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="flex items-center gap-1.5 text-white">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BATTERY HEALTH</span>
                </span>
                <span className="text-emerald-400 font-extrabold">{batteryPercent}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-900 border border-[#00f3ff]/40 overflow-hidden p-0.5 relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-500 shadow-[0_0_10px_#34d399]"
                  style={{ width: `${batteryPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* HEXAGONAL WARNING & DIAGNOSTIC SYSTEM LIGHTS CLUSTER */}
          <div className="pt-2 border-t border-[#00f3ff]/20 space-y-2">
            <span className="text-[9px] font-extrabold text-[#00f3ff]/60 tracking-widest uppercase block">
              DIAGNOSTIC STATUS LIGHTS
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'ABS', icon: ShieldAlert, active: true, color: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' },
                { label: 'ENG', icon: Cpu, active: true, color: 'text-[#00f3ff] border-[#00f3ff]/40 bg-[#00f3ff]/10' },
                { label: 'OIL', icon: Droplets, active: false, color: 'text-slate-600 border-slate-800' },
                { label: 'CHK', icon: Wrench, active: true, color: 'text-amber-400 border-amber-400/40 bg-amber-400/10' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${item.color}`}
                >
                  <item.icon className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[8px] font-black">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM FOOTER STATUS TELEMETRY STRIP */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-extrabold border-t border-[#00f3ff]/20 pt-2 text-[#00f3ff]/70">
        <div>SYS TEMP: 32°C | HIGH PERFORMANCE MODE ACTIVE</div>
        <div className="hidden sm:block">CYBER-DRIVE TELEMETRY V4.8</div>
        <div className="text-white">LAT: 37.7749° N | LON: 122.4194° W</div>
      </div>
    </div>
  );
};
