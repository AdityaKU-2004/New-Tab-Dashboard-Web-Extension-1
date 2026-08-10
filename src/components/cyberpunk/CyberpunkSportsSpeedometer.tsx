import React, { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Gauge, Zap, Flame, Compass, Activity, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

interface CyberpunkSportsSpeedometerProps {
  isBackgroundMode?: boolean;
}

export const CyberpunkSportsSpeedometer: React.FC<CyberpunkSportsSpeedometerProps> = ({ isBackgroundMode }) => {
  const { cardOpacity, backgroundBlur, speedometerPlacement } = useDashboardStore((state) => state.settings);
  const isBg = isBackgroundMode ?? (speedometerPlacement === 'background');

  // Dynamic Telemetry States (Driven by smooth simulation loop for show)
  const [rpm, setRpm] = useState(2400);
  const [speed, setSpeed] = useState(88);
  const [gear, setGear] = useState('4');
  const [turboPsi, setTurboPsi] = useState(14.5);
  const [nitro, setNitro] = useState(85);
  const [unit, setUnit] = useState<'MPH' | 'KMH'>('MPH');
  const [driveMode, setDriveMode] = useState<'SPORT+' | 'CYBER' | 'DRIFT'>('CYBER');
  const [isRevving, setIsRevving] = useState(false);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [gForce, setGForce] = useState({ x: 0.2, y: 0.4 });

  const animFrameRef = useRef<number | null>(null);

  // Driving Simulation Loop for Show
  useEffect(() => {
    let targetRpm = 2400;
    let targetSpeed = 88;
    let targetPsi = 12;
    let phase = 0;

    const interval = setInterval(() => {
      if (isRevving) return; // Handled by rev action

      phase = (phase + 1) % 100;

      // Realistic driving sequence simulation
      if (phase < 25) {
        // Accelerating
        targetRpm = 4500 + Math.sin(phase * 0.3) * 3200;
        targetSpeed = 95 + phase * 2.8;
        targetPsi = 18 + Math.random() * 8;
        setGear(phase < 10 ? '3' : phase < 20 ? '4' : '5');
      } else if (phase < 50) {
        // High Speed Cruising / Max Pull
        targetRpm = 6800 + Math.sin(phase * 0.2) * 1200;
        targetSpeed = 165 + Math.sin(phase * 0.1) * 20;
        targetPsi = 24 + Math.random() * 4;
        setGear('6');
      } else if (phase < 75) {
        // Deceleration / Cornering
        targetRpm = 3200 + Math.cos(phase * 0.2) * 1500;
        targetSpeed = 110 - (phase - 50) * 1.8;
        targetPsi = 8 + Math.random() * 3;
        setGear('4');
      } else {
        // Gentle acceleration reset
        targetRpm = 2200 + Math.sin(phase * 0.4) * 1800;
        targetSpeed = 75 + (phase - 75) * 0.8;
        targetPsi = 12 + Math.random() * 5;
        setGear('3');
      }

      // Smooth interpolation
      setRpm((prev) => Math.round(prev + (targetRpm - prev) * 0.25));
      setSpeed((prev) => Math.round(prev + (targetSpeed - prev) * 0.2));
      setTurboPsi((prev) => +(prev + (targetPsi - prev) * 0.3).toFixed(1));
      setGForce({
        x: +((Math.sin(phase * 0.1) * 0.8).toFixed(2)),
        y: +((Math.cos(phase * 0.15) * 0.9).toFixed(2)),
      });
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

  // Geometry calculations for Tachometer & Speedometer dials (240 deg sweep)
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

  // Speedometer Needle Angle (0 to 240 MPH)
  const displaySpeed = unit === 'KMH' ? Math.round(speed * 1.609) : speed;
  const maxSpeed = unit === 'KMH' ? 380 : 240;
  const speedRatio = Math.min(1, Math.max(0, displaySpeed / maxSpeed));
  const speedAngle = START_ANGLE + speedRatio * SWEEP_ANGLE;
  const speedTip = getCoordinates(speedAngle, 96);

  // Ticks for RPM gauge
  const rpmTicks = Array.from({ length: 10 }, (_, i) => {
    const angle = START_ANGLE + (i / 9) * SWEEP_ANGLE;
    const isRedline = i >= 7;
    const p1 = getCoordinates(angle, 98);
    const p2 = getCoordinates(angle, 112);
    const textPos = getCoordinates(angle, 82);
    return { val: i, angle, isRedline, p1, p2, textPos };
  });

  // Ticks for Speedometer gauge
  const speedTicks = Array.from({ length: 9 }, (_, i) => {
    const angle = START_ANGLE + (i / 8) * SWEEP_ANGLE;
    const val = Math.round((i / 8) * maxSpeed);
    const p1 = getCoordinates(angle, 98);
    const p2 = getCoordinates(angle, 112);
    const textPos = getCoordinates(angle, 80);
    return { val, angle, p1, p2, textPos };
  });

  // Shift light logic (5 LEDs)
  const shiftLightCount = Math.min(5, Math.floor((rpm / 9000) * 6));
  const isRedlineFlash = rpm > 7400;

  // Glassmorphic inline styles driven by user settings
  const bgAlpha = isBg
    ? Math.min(0.25, Math.max(0.01, cardOpacity * 0.35))
    : Math.max(0.15, cardOpacity * 0.8);

  const glassStyle: React.CSSProperties = {
    backdropFilter: `blur(${isBg ? Math.min(backgroundBlur, 6) : backgroundBlur}px)`,
    WebkitBackdropFilter: `blur(${isBg ? Math.min(backgroundBlur, 6) : backgroundBlur}px)`,
    backgroundColor: `rgba(8, 13, 26, ${bgAlpha})`,
  };

  const containerClasses = isBg
    ? 'fixed inset-0 z-0 pointer-events-none w-full h-full p-4 sm:p-8 font-mono text-[#00f3ff] overflow-hidden select-none flex flex-col justify-between transition-all duration-500'
    : 'relative w-full rounded-2xl border border-[#00f3ff]/40 shadow-[0_0_25px_rgba(0,243,255,0.2)] p-4 sm:p-6 font-mono text-[#00f3ff] overflow-hidden transition-all duration-300 select-none group';

  return (
    <div
      style={glassStyle}
      className={containerClasses}
    >
      {/* Carbon fiber grid effect overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00f3ff_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Top Telemetry Header Bar */}
      <div className={`relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 ${isBg ? 'mb-2 border-b border-[#00f3ff]/20' : 'mb-4 border-b border-[#00f3ff]/30'}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#00f3ff]/15 border border-[#00f3ff]/50 shadow-[0_0_10px_rgba(0,243,255,0.3)] text-[#00f3ff]">
            <Gauge className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-wider text-white flex items-center gap-2">
              <span>CYBER SPORTS COCKPIT</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff0055]/20 border border-[#ff0055]/50 text-[#ff0055] font-bold animate-pulse">
                {isNitroActive ? '🔥 NITRO BURST' : 'LIVE TELEMETRY'}
              </span>
            </h3>
            <p className="text-[11px] text-[#00f3ff]/70">
              Interactive Sports Car Speedometer & Performance Telemetry
            </p>
          </div>
        </div>

        {/* Top Controls: Drive Mode, Unit Toggle, Interactive Rev (pointer-events-auto for background mode) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Drive Mode Selector */}
          <div className="flex items-center bg-[#050811]/90 p-0.5 rounded-lg border border-[#00f3ff]/30 shadow-md">
            {(['CYBER', 'SPORT+', 'DRIFT'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDriveMode(mode)}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                  driveMode === mode
                    ? 'bg-[#00f3ff] text-slate-950 font-black shadow-[0_0_8px_rgba(0,243,255,0.6)]'
                    : 'text-[#00f3ff]/60 hover:text-[#00f3ff]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Unit Toggle */}
          <button
            type="button"
            onClick={() => setUnit(unit === 'MPH' ? 'KMH' : 'MPH')}
            className="px-2.5 py-1 rounded-lg bg-[#00f3ff]/20 hover:bg-[#00f3ff]/35 border border-[#00f3ff]/50 text-xs font-bold transition-colors cursor-pointer shadow-md text-white"
          >
            {unit}
          </button>

          {/* Rev Engine Button */}
          <button
            type="button"
            onClick={handleRevEngine}
            disabled={isRevving}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#ff0055] to-[#ff5500] hover:from-[#ff2a75] hover:to-[#ff7722] text-white font-extrabold text-xs shadow-[0_0_12px_rgba(255,0,85,0.6)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            <span>REV ENGINE</span>
          </button>

          {/* Nitro Button */}
          <button
            type="button"
            onClick={handleNitroBoost}
            disabled={nitro < 20 || isNitroActive}
            className="px-3 py-1 rounded-lg bg-[#00f3ff] hover:bg-[#55f7ff] text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(0,243,255,0.7)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>NITRO ({nitro}%)</span>
          </button>
        </div>
      </div>

      {/* Main Speedometer & Tachometer Instrumentation Grid */}
      <div className={`relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center ${isBg ? 'flex-1 my-auto' : ''}`}>
        {/* LEFT GAUGE: TACHOMETER (RPM 0 - 9000) */}
        <div className={`lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl border relative transition-all ${
          isBg
            ? 'bg-slate-950/20 border-[#00f3ff]/25 backdrop-blur-xs shadow-[0_0_15px_rgba(0,243,255,0.1)]'
            : 'bg-slate-950/40 border-[#00f3ff]/20'
        }`}>
          <div className="text-[10px] font-bold text-[#00f3ff]/80 tracking-widest uppercase mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-[#ff0055]" />
            <span>RPM TACHOMETER</span>
          </div>

          <div className="relative w-[210px] h-[210px]">
            <svg viewBox="0 0 260 260" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="rpmArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f3ff" />
                  <stop offset="70%" stopColor="#ffaa00" />
                  <stop offset="100%" stopColor="#ff0055" />
                </linearGradient>
                <filter id="glowFilt" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00f3ff" floodOpacity="0.8" />
                </filter>
                <filter id="redlineFilt" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ff0055" floodOpacity="0.9" />
                </filter>
              </defs>

              {/* Gauge Background Ring */}
              <circle
                cx="130"
                cy="130"
                r="105"
                fill="none"
                stroke="rgba(0, 243, 255, 0.15)"
                strokeWidth="10"
              />

              {/* Redline Zone Arc */}
              <circle
                cx="130"
                cy="130"
                r="105"
                fill="none"
                stroke="rgba(255, 0, 85, 0.35)"
                strokeWidth="10"
                strokeDasharray="500"
                strokeDashoffset="370"
                transform="rotate(140 130 130)"
              />

              {/* Ticks and Labels */}
              {rpmTicks.map((t) => (
                <g key={t.val}>
                  <line
                    x1={t.p1.x}
                    y1={t.p1.y}
                    x2={t.p2.x}
                    y2={t.p2.y}
                    stroke={t.isRedline ? '#ff0055' : '#00f3ff'}
                    strokeWidth={t.isRedline ? 2.5 : 1.5}
                    opacity={t.isRedline ? 1 : 0.7}
                  />
                  <text
                    x={t.textPos.x}
                    y={t.textPos.y + 3}
                    textAnchor="middle"
                    fill={t.isRedline ? '#ff0055' : '#ffffff'}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {t.val}
                  </text>
                </g>
              ))}

              {/* Dynamic RPM Needle */}
              <line
                x1="130"
                y1="130"
                x2={rpmTip.x}
                y2={rpmTip.y}
                stroke={isRedlineFlash ? '#ff0055' : '#00f3ff'}
                strokeWidth="4"
                strokeLinecap="round"
                filter={isRedlineFlash ? 'url(#redlineFilt)' : 'url(#glowFilt)'}
                className="transition-all duration-150"
              />

              {/* Center Cap */}
              <circle cx="130" cy="130" r="14" fill="#050811" stroke="#00f3ff" strokeWidth="2" />
              <circle cx="130" cy="130" r="6" fill={isRedlineFlash ? '#ff0055' : '#00f3ff'} />
            </svg>

            {/* RPM Readout inside center dial */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              <div
                className={`text-lg font-black tracking-tight ${
                  isRedlineFlash ? 'text-[#ff0055] animate-ping' : 'text-white'
                }`}
              >
                {rpm.toLocaleString()}
              </div>
              <div className="text-[9px] font-bold text-[#00f3ff]/60 uppercase">x1000 RPM</div>
            </div>
          </div>
        </div>

        {/* CENTER CLUSTER: DIGITAL SPEEDOMETER & SHIFT LIGHT COCKPIT */}
        <div className={`lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl border relative space-y-3 transition-all ${
          isBg
            ? 'bg-slate-950/30 border-[#00f3ff]/35 backdrop-blur-xs shadow-[0_0_20px_rgba(0,243,255,0.2)]'
            : 'bg-slate-950/60 border-[#00f3ff]/40 shadow-[0_0_20px_rgba(0,243,255,0.15)]'
        }`}>
          {/* Shift Light LED Array */}
          <div className="w-full flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg bg-black/80 border border-white/10">
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

          {/* Main Huge Digital Speed Readout */}
          <div className="text-center space-y-1">
            <div className="text-[10px] font-extrabold text-[#00f3ff] tracking-widest uppercase flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-[#ff0055]" />
              <span>VEHICLE SPEED</span>
            </div>
            <div className="text-5xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_18px_rgba(0,243,255,0.8)]">
              {displaySpeed}
            </div>
            <div className="text-xs font-black text-[#00f3ff] tracking-widest uppercase">
              {unit}
            </div>
          </div>

          {/* Gear Box & Drive Telemetry Badges */}
          <div className="flex items-center gap-3 pt-1">
            {/* Gear Box */}
            <div className="px-3 py-1 rounded-lg bg-black/90 border border-[#00f3ff]/60 flex items-center gap-2">
              <span className="text-[10px] text-[#00f3ff]/60 font-bold">GEAR</span>
              <span className="text-xl font-black text-[#ff0055]">{gear}</span>
            </div>

            {/* Turbo Pressure */}
            <div className="px-3 py-1 rounded-lg bg-black/90 border border-[#00f3ff]/40 flex items-center gap-2">
              <span className="text-[10px] text-[#00f3ff]/60 font-bold">TURBO</span>
              <span className="text-xs font-extrabold text-amber-400">{turboPsi} PSI</span>
            </div>
          </div>

          {/* G-Force Vector Radar */}
          <div className="w-full pt-2 border-t border-[#00f3ff]/20 flex items-center justify-between text-[10px]">
            <span className="text-[#00f3ff]/60 font-bold">LAT LATERAL G</span>
            <span className="text-white font-mono font-bold">
              X: {gForce.x > 0 ? `+${gForce.x}` : gForce.x}G | Y: {gForce.y > 0 ? `+${gForce.y}` : gForce.y}G
            </span>
          </div>
        </div>

        {/* RIGHT GAUGE: ANALOG SPEEDOMETER DIAL (0 - 240 MPH) */}
        <div className={`lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl border relative transition-all ${
          isBg
            ? 'bg-slate-950/20 border-[#00f3ff]/25 backdrop-blur-xs shadow-[0_0_15px_rgba(0,243,255,0.1)]'
            : 'bg-slate-950/40 border-[#00f3ff]/20'
        }`}>
          <div className="text-[10px] font-bold text-[#00f3ff]/80 tracking-widest uppercase mb-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#00f3ff]" />
            <span>SPEED GAUGE ({unit})</span>
          </div>

          <div className="relative w-[210px] h-[210px]">
            <svg viewBox="0 0 260 260" className="w-full h-full overflow-visible">
              {/* Gauge Background Ring */}
              <circle
                cx="130"
                cy="130"
                r="105"
                fill="none"
                stroke="rgba(0, 243, 255, 0.15)"
                strokeWidth="10"
              />

              {/* Ticks and Speed Numbers */}
              {speedTicks.map((t) => (
                <g key={t.val}>
                  <line
                    x1={t.p1.x}
                    y1={t.p1.y}
                    x2={t.p2.x}
                    y2={t.p2.y}
                    stroke="#00f3ff"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                  <text
                    x={t.textPos.x}
                    y={t.textPos.y + 3}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {t.val}
                  </text>
                </g>
              ))}

              {/* Speed Needle */}
              <line
                x1="130"
                y1="130"
                x2={speedTip.x}
                y2={speedTip.y}
                stroke="#ff0055"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#redlineFilt)"
                className="transition-all duration-150"
              />

              {/* Center Cap */}
              <circle cx="130" cy="130" r="14" fill="#050811" stroke="#ff0055" strokeWidth="2" />
              <circle cx="130" cy="130" r="6" fill="#ff0055" />
            </svg>

            {/* Nitro & Boost bar footer */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-3/4 text-center space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-[#00f3ff]">
                <span>NITRO BOOST</span>
                <span>{nitro}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-[#00f3ff]/30">
                <div
                  className="h-full bg-gradient-to-r from-[#00f3ff] to-[#ff0055] transition-all duration-300"
                  style={{ width: `${nitro}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
