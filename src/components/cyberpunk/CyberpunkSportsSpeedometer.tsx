import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import {
  Gauge,
  Zap,
  Flame,
  Thermometer,
  Fuel,
  Activity,
  Battery,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Disc,
  RotateCw
} from 'lucide-react';

interface CyberpunkSportsSpeedometerProps {
  isBackgroundMode?: boolean;
}

export const CyberpunkSportsSpeedometer: React.FC<CyberpunkSportsSpeedometerProps> = ({ isBackgroundMode }) => {
  const { cardOpacity, backgroundBlur, speedometerPlacement } = useDashboardStore((state) => state.settings);
  const isBg = isBackgroundMode ?? (speedometerPlacement === 'background');

  // Dynamic Telemetry States
  const [rpm, setRpm] = useState(6800);
  const [speed, setSpeed] = useState(259.4);
  const [gear, setGear] = useState('6');
  const [prnd, setPrnd] = useState<'P' | 'R' | 'N' | 'D'>('D');
  const [turboPsi, setTurboPsi] = useState(22.4);
  const [nitro, setNitro] = useState(88);
  const [fuelPercent, setFuelPercent] = useState(82);
  const [coolantTemp, setCoolantTemp] = useState(90); // Celsius
  const [batteryPercent, setBatteryPercent] = useState(98);
  const [unit, setUnit] = useState<'MPH' | 'KMH'>('MPH');
  const [driveMode, setDriveMode] = useState<'ECO' | 'NORMAL' | 'BOOST' | 'SPORT'>('SPORT');
  const [isRevving, setIsRevving] = useState(false);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [turnSignal, setTurnSignal] = useState<'left' | 'right' | 'hazard' | 'off'>('off');

  // Simulation Loop
  useEffect(() => {
    let phase = 0;
    const interval = setInterval(() => {
      if (isRevving) return;

      phase = (phase + 1) % 100;
      let targetRpm = 6800;
      let targetSpeed = 259.4;
      let targetPsi = 22.0;

      if (phase < 25) {
        targetRpm = 5200 + Math.sin(phase * 0.3) * 2400;
        targetSpeed = 210 + phase * 2.2;
        targetPsi = 18 + Math.random() * 5;
        setGear('5');
      } else if (phase < 50) {
        targetRpm = 7600 + Math.sin(phase * 0.2) * 1100;
        targetSpeed = 265 + Math.sin(phase * 0.1) * 15;
        targetPsi = 26 + Math.random() * 3;
        setGear('6');
      } else if (phase < 75) {
        targetRpm = 4100 + Math.cos(phase * 0.2) * 1800;
        targetSpeed = 180 - (phase - 50) * 2.5;
        targetPsi = 12 + Math.random() * 4;
        setGear('4');
      } else {
        targetRpm = 6200 + Math.sin(phase * 0.4) * 1500;
        targetSpeed = 240 + (phase - 75) * 1.2;
        targetPsi = 20 + Math.random() * 6;
        setGear('5');
      }

      setRpm((prev) => Math.round(prev + (targetRpm - prev) * 0.2));
      setSpeed((prev) => +(prev + (targetSpeed - prev) * 0.15).toFixed(1));
      setTurboPsi((prev) => +(prev + (targetPsi - prev) * 0.25).toFixed(1));

      if (phase % 15 === 0) {
        setFuelPercent((prev) => Math.max(12, +(prev - 0.1).toFixed(1)));
        setCoolantTemp((prev) => Math.min(115, Math.max(82, prev + (Math.random() - 0.5) * 2)));
      }
    }, 180);

    return () => clearInterval(interval);
  }, [isRevving]);

  // Turn signal flashing effect
  useEffect(() => {
    const blinkerInterval = setInterval(() => {
      setTurnSignal((prev) => {
        if (prev === 'hazard') return 'off';
        if (prev === 'off') return Math.random() > 0.8 ? 'hazard' : 'off';
        return prev;
      });
    }, 2500);
    return () => clearInterval(blinkerInterval);
  }, []);

  // Handle Interactive Engine Rev
  const handleRevEngine = () => {
    setIsRevving(true);
    let revStep = 0;
    const revInterval = setInterval(() => {
      revStep++;
      if (revStep < 8) {
        setRpm((prev) => Math.min(8800, prev + 850));
        setSpeed((prev) => +(prev + 8.5).toFixed(1));
        setTurboPsi((prev) => Math.min(29.5, +(prev + 2.5).toFixed(1)));
      } else if (revStep < 16) {
        setRpm((prev) => Math.max(2200, prev - 750));
        setSpeed((prev) => +(prev - 5.5).toFixed(1));
        setTurboPsi((prev) => Math.max(10, +(prev - 2).toFixed(1)));
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
    setNitro((prev) => Math.max(0, prev - 30));
    setRpm(8500);
    setSpeed((prev) => +(prev + 35).toFixed(1));
    setTurboPsi(30.0);

    setTimeout(() => {
      setIsNitroActive(false);
    }, 2200);
  };

  // Geometry calculations
  const displaySpeed = unit === 'KMH' ? +(speed * 1.60934).toFixed(1) : speed;

  // Dial angles: 0% = 135 deg, 100% = 405 deg (270 deg sweep)
  const getAngle = (ratio: number) => 135 + Math.min(1, Math.max(0, ratio)) * 270;

  const polarToCartesian = (cx: number, cy: number, radius: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  };

  // Left Dial (RPM: 0 to 9 x1000)
  const rpmRatio = Math.min(1, rpm / 9000);
  const rpmAngle = getAngle(rpmRatio);
  const rpmNeedleEnd = polarToCartesian(110, 110, 82, rpmAngle);

  // Right Dial (Speed: 0 to 280)
  const speedRatio = Math.min(1, displaySpeed / 280);
  const speedAngle = getAngle(speedRatio);
  const speedNeedleEnd = polarToCartesian(110, 110, 82, speedAngle);

  // Turbo Sub-Dial (0 to 30 PSI)
  const turboRatio = Math.min(1, turboPsi / 30);
  const turboAngle = 135 + turboRatio * 270;
  const turboNeedleEnd = polarToCartesian(50, 50, 36, turboAngle);

  // Nitrous Sub-Dial (0 to 100%)
  const nitroRatio = Math.min(1, nitro / 100);
  const nitroAngle = 135 + nitroRatio * 270;
  const nitroNeedleEnd = polarToCartesian(50, 50, 36, nitroAngle);

  // Background styling
  const bgAlpha = isBg
    ? Math.min(0.2, Math.max(0.02, cardOpacity * 0.3))
    : Math.max(0.15, cardOpacity * 0.8);

  const containerStyle: React.CSSProperties = isBg
    ? {
        backdropFilter: `blur(${Math.min(backgroundBlur, 8)}px)`,
        WebkitBackdropFilter: `blur(${Math.min(backgroundBlur, 8)}px)`,
        backgroundColor: `rgba(2, 6, 12, ${bgAlpha})`,
      }
    : {
        backdropFilter: `blur(${backgroundBlur}px)`,
        WebkitBackdropFilter: `blur(${backgroundBlur}px)`,
        backgroundColor: `rgba(4, 9, 18, ${bgAlpha})`,
      };

  return (
    <div
      style={containerStyle}
      className={
        isBg
          ? 'fixed inset-0 z-0 pointer-events-none w-full h-full p-4 sm:p-6 font-mono text-[#00ffd5] overflow-hidden select-none flex flex-col justify-between transition-all duration-500'
          : 'relative w-full rounded-3xl border border-[#00ffd5]/40 shadow-[0_0_40px_rgba(0,255,213,0.25)] p-4 sm:p-6 font-mono text-[#00ffd5] overflow-hidden transition-all duration-300 select-none'
      }
    >
      {/* Cyan wireframe grid overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00ffd5_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* TOP COMPACT CONTROL STRIP */}
      <div className={`relative z-10 flex items-center justify-between gap-4 pb-3 border-b border-[#00ffd5]/30 ${isBg ? 'mt-16 sm:mt-20' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#00ffd5]/15 border border-[#00ffd5]/50 shadow-[0_0_12px_rgba(0,255,213,0.3)]">
            <Disc className="w-4 h-4 animate-spin text-[#00ffd5]" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black tracking-widest text-white flex items-center gap-2">
              <span>FUTURISTIC HUD CLUSTER</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00ffd5]/20 border border-[#00ffd5]/60 text-[#00ffd5] font-bold">
                {isNitroActive ? '🔥 NITRO BOOST' : 'ONLINE'}
              </span>
            </h3>
          </div>
        </div>

        {/* Top Center: Drive Mode Selector */}
        <div className="hidden md:flex items-center gap-1.5 pointer-events-auto">
          {(['ECO', 'NORMAL', 'BOOST', 'SPORT'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDriveMode(m)}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                driveMode === m
                  ? 'bg-[#00ffd5] text-slate-950 border-[#00ffd5] shadow-[0_0_12px_#00ffd5] font-black'
                  : 'bg-black/60 text-[#00ffd5]/60 border-[#00ffd5]/30 hover:text-[#00ffd5]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Top Right: PRND Gear Selector & Interactive Actions */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* PRND */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-black/80 border border-[#00ffd5]/40 shadow-inner">
            {(['P', 'R', 'N', 'D'] as const).map((gearLetter) => {
              const isActive = prnd === gearLetter;
              return (
                <button
                  key={gearLetter}
                  type="button"
                  onClick={() => setPrnd(gearLetter)}
                  className={`text-xs font-black px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    isActive
                      ? 'text-slate-950 bg-[#00ffd5] shadow-[0_0_10px_#00ffd5]'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {gearLetter}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setUnit(unit === 'MPH' ? 'KMH' : 'MPH')}
            className="px-2 py-1 rounded-lg bg-[#00ffd5]/20 hover:bg-[#00ffd5]/35 border border-[#00ffd5]/50 text-xs font-bold transition-colors cursor-pointer text-white"
          >
            {unit}
          </button>

          <button
            type="button"
            onClick={handleRevEngine}
            disabled={isRevving}
            className="px-2.5 py-1 rounded-lg bg-[#00ffd5]/20 hover:bg-[#00ffd5]/40 border border-[#00ffd5] text-[#00ffd5] font-extrabold text-xs shadow-[0_0_12px_rgba(0,255,213,0.4)] transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">REV</span>
          </button>

          <button
            type="button"
            onClick={handleNitroBoost}
            disabled={nitro < 20 || isNitroActive}
            className="px-2.5 py-1 rounded-lg bg-[#00ffd5] hover:bg-white text-slate-950 font-black text-xs shadow-[0_0_15px_#00ffd5] transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-40"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">NITRO</span>
          </button>
        </div>
      </div>

      {/* MAIN FUTURISTIC DUAL-DIAL & CENTER HUD CLUSTER */}
      <div className="relative z-10 my-auto py-4 flex flex-col items-center justify-center w-full">
        
        {/* UPPER MAIN INSTRUMENTATION ROW (Left Dial, Center HUD, Right Dial) */}
        <div className="w-full max-w-[1400px] px-2 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center justify-items-center">
          
          {/* LEFT MAIN DIAL: TACHOMETER (RPM x1000) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center relative w-full">
            <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[340px] lg:h-[340px] transition-all duration-300">
              <svg viewBox="0 0 220 220" className="w-full h-full overflow-visible">
                <defs>
                  <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00ffd5" floodOpacity="0.9" />
                  </filter>
                </defs>

                {/* Outer Segmented Outer Ring */}
                <circle cx="110" cy="110" r="102" fill="none" stroke="rgba(0,255,213,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="110" cy="110" r="98" fill="none" stroke="rgba(0,255,213,0.6)" strokeWidth="2" />

                {/* Outer Notch Grips at 3, 9 o clock */}
                <path d="M 8 110 L 16 102 L 16 118 Z" fill="#00ffd5" opacity="0.8" />
                <path d="M 212 110 L 204 102 L 204 118 Z" fill="#00ffd5" opacity="0.8" />

                {/* Arc tick scale for RPM (135 deg to 405 deg) */}
                {Array.from({ length: 9 }).map((_, i) => {
                  const deg = 135 + (i / 8) * 270;
                  const p1 = polarToCartesian(110, 110, 96, deg);
                  const p2 = polarToCartesian(110, 110, 86, deg);
                  const pText = polarToCartesian(110, 110, 72, deg);
                  return (
                    <g key={i}>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#00ffd5" strokeWidth="2.5" />
                      <text x={pText.x} y={pText.y + 3} textAnchor="middle" fill="#00ffd5" fontSize="12" fontWeight="bold">
                        {i}
                      </text>
                    </g>
                  );
                })}

                {/* Sub-ticks between RPM numbers */}
                {Array.from({ length: 32 }).map((_, i) => {
                  const deg = 135 + (i / 32) * 270;
                  const p1 = polarToCartesian(110, 110, 96, deg);
                  const p2 = polarToCartesian(110, 110, 90, deg);
                  return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(0,255,213,0.5)" strokeWidth="1" />;
                })}

                {/* Inner Notched Cogged Mechanical Ring */}
                <circle cx="110" cy="110" r="54" fill="none" stroke="rgba(0,255,213,0.8)" strokeWidth="2" />
                {Array.from({ length: 16 }).map((_, i) => {
                  const angle = (i * 360) / 16;
                  return (
                    <rect
                      key={i}
                      x={107}
                      y={52}
                      width="6"
                      height="8"
                      rx="1"
                      fill="none"
                      stroke="#00ffd5"
                      strokeWidth="1.5"
                      transform={`rotate(${angle} 110 110)`}
                      opacity="0.85"
                    />
                  );
                })}

                {/* Inner RPM x1000 Label */}
                <text x="110" y="148" textAnchor="middle" fill="rgba(0,255,213,0.7)" fontSize="8" fontWeight="bold" letterSpacing="1">
                  1/min x 1000
                </text>

                {/* RPM Needle */}
                <line
                  x1="110"
                  y1="110"
                  x2={rpmNeedleEnd.x}
                  y2={rpmNeedleEnd.y}
                  stroke="#00ffd5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glowCyan)"
                  className="transition-all duration-150"
                />

                {/* Center Hub Pivot */}
                <circle cx="110" cy="110" r="14" fill="#02060c" stroke="#00ffd5" strokeWidth="2" />
                <circle cx="110" cy="110" r="6" fill="#00ffd5" filter="url(#glowCyan)" />
              </svg>
            </div>
          </div>

          {/* CENTER HUD DATA MODULE */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-black/60 border border-[#00ffd5]/40 backdrop-blur-md shadow-[0_0_25px_rgba(0,255,213,0.15)] w-full min-w-[260px] lg:min-w-[320px] text-center my-2 md:my-0">
            
            {/* Top Indicator Blinkers & Hazard */}
            <div className="flex items-center justify-center gap-6 mb-2">
              <ChevronLeft className={`w-5 h-5 ${turnSignal === 'left' || turnSignal === 'hazard' ? 'text-[#00ffd5] animate-ping' : 'text-[#00ffd5]/30'}`} />
              <div className="p-1 rounded bg-[#00ffd5]/10 border border-[#00ffd5]/40">
                <AlertTriangle className={`w-4 h-4 ${turnSignal === 'hazard' ? 'text-[#00ffd5] animate-pulse' : 'text-[#00ffd5]/70'}`} />
              </div>
              <ChevronRight className={`w-5 h-5 ${turnSignal === 'right' || turnSignal === 'hazard' ? 'text-[#00ffd5] animate-ping' : 'text-[#00ffd5]/30'}`} />
            </div>

            {/* SPEED Title */}
            <div className="text-xs font-black text-[#00ffd5]/80 tracking-[0.3em] uppercase mb-1">
              SPEED
            </div>

            {/* Large Futuristic Glow Digital Readout */}
            <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-[0_0_25px_#00ffd5] font-mono">
              {displaySpeed.toFixed(1)}
              <span className="text-sm sm:text-base text-[#00ffd5] font-bold ml-2 tracking-widest">{unit}</span>
            </div>

            {/* Center Status Indicators */}
            <div className="mt-4 pt-3 border-t border-[#00ffd5]/30 w-full flex flex-col gap-2 text-xs font-bold">
              {/* Battery Level Bar */}
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded bg-[#00ffd5]/10 border border-[#00ffd5]/30">
                <div className="flex items-center gap-1.5 text-[#00ffd5]">
                  <Battery className="w-4 h-4" />
                  <span>BATTERY LEVEL: {batteryPercent}%</span>
                </div>
                <div className="w-16 h-2.5 rounded bg-black border border-[#00ffd5]/50 overflow-hidden">
                  <div className="h-full bg-[#00ffd5]" style={{ width: `${batteryPercent}%` }} />
                </div>
              </div>

              {/* Seatbelt status badge */}
              <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#00ffd5]/10 border border-[#00ffd5]/30 text-[#00ffd5]">
                <ShieldCheck className="w-4 h-4" />
                <span>SEATBELT LOCKED</span>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN DIAL: SPEEDOMETER (0-280 MPH with inner KM/H scale) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center relative w-full">
            <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[340px] lg:h-[340px] transition-all duration-300">
              <svg viewBox="0 0 220 220" className="w-full h-full overflow-visible">
                {/* Outer Segmented Outer Ring */}
                <circle cx="110" cy="110" r="102" fill="none" stroke="rgba(0,255,213,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="110" cy="110" r="98" fill="none" stroke="rgba(0,255,213,0.6)" strokeWidth="2" />

                {/* Outer Notch Grips */}
                <path d="M 8 110 L 16 102 L 16 118 Z" fill="#00ffd5" opacity="0.8" />
                <path d="M 212 110 L 204 102 L 204 118 Z" fill="#00ffd5" opacity="0.8" />

                {/* Outer Scale: 0 to 280 (step 20) */}
                {Array.from({ length: 15 }).map((_, i) => {
                  const val = i * 20;
                  const deg = 135 + (i / 14) * 270;
                  const p1 = polarToCartesian(110, 110, 96, deg);
                  const p2 = polarToCartesian(110, 110, 86, deg);
                  const pText = polarToCartesian(110, 110, 72, deg);
                  return (
                    <g key={i}>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#00ffd5" strokeWidth="2" />
                      <text x={pText.x} y={pText.y + 3} textAnchor="middle" fill="#00ffd5" fontSize="9" fontWeight="bold">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Inner Scale: KM/H */}
                {Array.from({ length: 11 }).map((_, i) => {
                  const val = i * 40;
                  const deg = 135 + (i / 10) * 270;
                  const pText = polarToCartesian(110, 110, 58, deg);
                  return (
                    <text key={i} x={pText.x} y={pText.y + 2} textAnchor="middle" fill="rgba(0,255,213,0.6)" fontSize="7" fontWeight="bold">
                      {val}
                    </text>
                  );
                })}

                {/* Inner Notched Cogged Ring */}
                <circle cx="110" cy="110" r="48" fill="none" stroke="rgba(0,255,213,0.8)" strokeWidth="2" />
                <text x="110" y="146" textAnchor="middle" fill="rgba(0,255,213,0.7)" fontSize="8" fontWeight="bold" letterSpacing="1">
                  MPH / KMH
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
                  filter="url(#glowCyan)"
                  className="transition-all duration-150"
                />

                {/* Center Hub Pivot */}
                <circle cx="110" cy="110" r="14" fill="#02060c" stroke="#00ffd5" strokeWidth="2" />
                <circle cx="110" cy="110" r="6" fill="#00ffd5" filter="url(#glowCyan)" />
              </svg>
            </div>
          </div>

        </div>

        {/* LOWER SUB-GAUGES AND SWEEPING OUTER ARCS ROW */}
        <div className="w-full max-w-[1200px] flex flex-wrap items-center justify-between gap-6 mt-4 px-4 sm:px-8">
          
          {/* BOTTOM LEFT SWEEPING TEMPERATURE ARC (H / C) */}
          <div className="flex items-center gap-2">
            <div className="relative w-28 h-20">
              <svg viewBox="0 0 120 80" className="w-full h-full overflow-visible">
                {/* Arc path H (top left) to C (bottom left) */}
                <path d="M 30 10 A 55 55 0 0 0 10 70" fill="none" stroke="rgba(0,255,213,0.3)" strokeWidth="6" strokeLinecap="round" />
                {/* Filled arc proportion */}
                <path
                  d="M 30 10 A 55 55 0 0 0 10 70"
                  fill="none"
                  stroke="#00ffd5"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="100"
                  strokeDashoffset={100 - Math.min(100, Math.max(10, ((coolantTemp - 50) / 70) * 100))}
                  filter="url(#glowCyan)"
                />
                <text x="42" y="15" fill="#00ffd5" fontSize="10" fontWeight="extrabold">H</text>
                <text x="22" y="75" fill="#00ffd5" fontSize="10" fontWeight="extrabold">C</text>
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1 text-[11px] font-black text-[#00ffd5]">
                <Thermometer className="w-3.5 h-3.5" />
                <span>TEMP</span>
              </div>
              <div className="text-xs font-bold text-white">{coolantTemp}°C</div>
            </div>
          </div>

          {/* TWO BOTTOM CENTER MINI SUB-DIALS (TURBO BOOST & NITROUS) */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 my-1">
            
            {/* SUB-DIAL 1: TURBO BOOST */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,255,213,0.3)" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="41" fill="none" stroke="#00ffd5" strokeWidth="1" strokeDasharray="2 2" />
                  
                  {/* Ticks 0, 10, 20, 30 PSI */}
                  {Array.from({ length: 7 }).map((_, i) => {
                    const deg = 135 + (i / 6) * 270;
                    const p1 = polarToCartesian(50, 50, 41, deg);
                    const p2 = polarToCartesian(50, 50, 35, deg);
                    return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#00ffd5" strokeWidth="1.5" />;
                  })}

                  {/* Inner ring & Label */}
                  <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(0,255,213,0.6)" strokeWidth="1" />
                  <text x="50" y="68" textAnchor="middle" fill="#00ffd5" fontSize="6" fontWeight="bold">
                    PSI
                  </text>

                  {/* Needle */}
                  <line
                    x1="50"
                    y1="50"
                    x2={turboNeedleEnd.x}
                    y2={turboNeedleEnd.y}
                    stroke="#00ffd5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#glowCyan)"
                  />
                  <circle cx="50" cy="50" r="6" fill="#02060c" stroke="#00ffd5" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="text-[10px] font-black text-[#00ffd5] uppercase tracking-wider mt-1">
                TURBO BOOST
              </div>
              <div className="text-xs font-bold text-white">{turboPsi} PSI</div>
            </div>

            {/* SUB-DIAL 2: NITROUS */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,255,213,0.3)" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="41" fill="none" stroke="#00ffd5" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Sector Arc Ticks */}
                  {Array.from({ length: 6 }).map((_, i) => {
                    const deg = 135 + (i / 5) * 270;
                    const p1 = polarToCartesian(50, 50, 41, deg);
                    const p2 = polarToCartesian(50, 50, 33, deg);
                    return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#00ffd5" strokeWidth="2" />;
                  })}

                  <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(0,255,213,0.6)" strokeWidth="1" />
                  <text x="50" y="68" textAnchor="middle" fill="#00ffd5" fontSize="6" fontWeight="bold">
                    FD x 100
                  </text>

                  {/* Needle */}
                  <line
                    x1="50"
                    y1="50"
                    x2={nitroNeedleEnd.x}
                    y2={nitroNeedleEnd.y}
                    stroke="#00ffd5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#glowCyan)"
                  />
                  <circle cx="50" cy="50" r="6" fill="#02060c" stroke="#00ffd5" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="text-[10px] font-black text-[#00ffd5] uppercase tracking-wider mt-1">
                NITROUS
              </div>
              <div className="text-xs font-bold text-white">{nitro}%</div>
            </div>

          </div>

          {/* BOTTOM RIGHT SWEEPING FUEL ARC (F / E) */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-right">
              <div className="flex items-center justify-end gap-1 text-[11px] font-black text-[#00ffd5]">
                <Fuel className="w-3.5 h-3.5" />
                <span>FUEL</span>
              </div>
              <div className="text-xs font-bold text-white">{fuelPercent}%</div>
            </div>
            <div className="relative w-28 h-20">
              <svg viewBox="0 0 120 80" className="w-full h-full overflow-visible">
                {/* Arc path F (top right) to E (bottom right) */}
                <path d="M 90 10 A 55 55 0 0 1 110 70" fill="none" stroke="rgba(0,255,213,0.3)" strokeWidth="6" strokeLinecap="round" />
                <path
                  d="M 90 10 A 55 55 0 0 1 110 70"
                  fill="none"
                  stroke="#00ffd5"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="100"
                  strokeDashoffset={100 - fuelPercent}
                  filter="url(#glowCyan)"
                />
                <text x="75" y="15" fill="#00ffd5" fontSize="10" fontWeight="extrabold">F</text>
                <text x="95" y="75" fill="#00ffd5" fontSize="10" fontWeight="extrabold">E</text>
              </svg>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM FOOTER TELEMETRY STRIP */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-extrabold border-t border-[#00ffd5]/20 pt-2 text-[#00ffd5]/70">
        <div>SYS TEMP: 32°C | FUTURISTIC WIREFRAME HUD ACTIVE</div>
        <div className="hidden sm:block">CYBER-DRIVE TELEMETRY V5.0</div>
        <div className="text-white">LAT: 37.7749° N | LON: 122.4194° W</div>
      </div>
    </div>
  );
};
