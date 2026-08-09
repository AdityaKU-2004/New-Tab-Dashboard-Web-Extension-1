import React from 'react';
import { motion } from 'motion/react';
import { useClock } from '../../hooks/useClock';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Zap, Gauge, Flame, ShieldAlert } from 'lucide-react';

export const SpeedometerClock: React.FC = () => {
  const { clockFormat12, showSeconds, showGreeting, userName, enableAnimations } = useDashboardStore(
    (state) => state.settings
  );
  const { hours, minutes, seconds, ampm, dayName, formattedDate, greeting, rawDate } = useClock(clockFormat12);

  const secNum = rawDate.getSeconds();
  const minNum = rawDate.getMinutes();
  const hrNum = rawDate.getHours();

  // Speedometer geometry calculation (270 degree sweep from 135deg to 405deg)
  const START_ANGLE = 135;
  const TOTAL_SWEEP = 270;

  // Needle angle for seconds
  const secAngle = START_ANGLE + (secNum / 60) * TOTAL_SWEEP;
  const minAngle = START_ANGLE + (minNum / 60) * TOTAL_SWEEP;
  const hrAngle = START_ANGLE + (((hrNum % 12) + minNum / 60) / 12) * TOTAL_SWEEP;

  // Calculate coordinates on circle
  const getCoordinates = (angleDeg: number, radius: number, cx = 140, cy = 140) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  };

  // Generate ticks around 270deg arc (60 tick marks)
  const ticks = Array.from({ length: 61 }, (_, i) => {
    const angle = START_ANGLE + (i / 60) * TOTAL_SWEEP;
    const isMajor = i % 5 === 0;
    const isRedline = i >= 50;

    const innerR = isMajor ? 104 : 112;
    const outerR = 120;

    const p1 = getCoordinates(angle, innerR);
    const p2 = getCoordinates(angle, outerR);
    const textPos = getCoordinates(angle, 92);

    return {
      index: i,
      angle,
      isMajor,
      isRedline,
      p1,
      p2,
      textPos,
      label: isMajor ? `${i}` : null
    };
  });

  // Calculate SVG arc paths for progress meters
  const describeArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
    const start = getCoordinates(endAngle, radius, cx, cy);
    const end = getCoordinates(startAngle, radius, cx, cy);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  // Arc paths for gauge rendering
  const bgArcPath = describeArc(140, 140, 116, START_ANGLE, START_ANGLE + TOTAL_SWEEP);
  const minArcPath = describeArc(140, 140, 116, START_ANGLE, Math.max(START_ANGLE + 0.1, minAngle));
  const hrArcPath = describeArc(140, 140, 84, START_ANGLE, Math.max(START_ANGLE + 0.1, hrAngle));

  // Needle tip coordinates
  const needleTip = getCoordinates(secAngle, 106);

  return (
    <div className="flex flex-col items-center justify-center p-4 select-none relative">
      {/* Greeting Header */}
      {showGreeting && (
        <motion.div
          initial={enableAnimations ? { opacity: 0, y: -6 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs font-mono font-medium text-white/80 light:text-slate-700 mb-2 uppercase tracking-widest"
        >
          <span className="text-accent flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 animate-pulse" />
            {greeting},
          </span>
          <span className="font-bold text-white light:text-slate-900 border-b border-accent/60">
            {userName || 'Racer'}
          </span>
        </motion.div>
      )}

      {/* Speedometer Gauge Frame */}
      <div className="relative w-[280px] h-[280px] sm:w-[310px] sm:h-[310px] flex items-center justify-center">
        {/* Outer Glowing Metallic Rim */}
        <div className="absolute inset-0 rounded-full bg-slate-950/90 border-2 border-[#00f3ff]/40 shadow-[0_0_35px_rgba(0,243,255,0.25),inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl" />

        {/* Carbon Fiber Dial Pattern Overlay */}
        <div className="absolute inset-2 rounded-full opacity-20 pointer-events-none bg-[radial-gradient(#00f3ff_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* SVG Dial Markings & Needles */}
        <svg viewBox="0 0 280 280" className="w-full h-full relative z-10 overflow-visible">
          <defs>
            {/* Glowing Accent Linear Gradient */}
            <linearGradient id="speedoGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f3ff" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            {/* Redline Glow */}
            <linearGradient id="redlineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff0055" />
              <stop offset="100%" stopColor="#ff5500" />
            </linearGradient>

            {/* Drop Shadow Filter for Needle */}
            <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff0055" floodOpacity="0.9" />
            </filter>
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00f3ff" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={bgArcPath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Redline Danger Arc Zone (80% - 100% / 50-60 secs) */}
          <path
            d={describeArc(140, 140, 116, START_ANGLE + TOTAL_SWEEP * 0.833, START_ANGLE + TOTAL_SWEEP)}
            fill="none"
            stroke="rgba(255, 0, 85, 0.4)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Minutes Active Progress Arc */}
          <path
            d={minArcPath}
            fill="none"
            stroke="url(#speedoGlow)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#cyanGlow)"
          />

          {/* Hours Inner Progress Arc */}
          <path
            d={hrArcPath}
            fill="none"
            stroke="#a855f7"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Dial Ticks & Numbers */}
          {ticks.map((t) => (
            <g key={t.index}>
              <line
                x1={t.p1.x}
                y1={t.p1.y}
                x2={t.p2.x}
                y2={t.p2.y}
                stroke={t.isRedline ? '#ff0055' : t.isMajor ? '#00f3ff' : 'rgba(255, 255, 255, 0.3)'}
                strokeWidth={t.isMajor ? 2 : 1}
                opacity={t.isMajor ? 0.9 : 0.5}
              />
              {t.isMajor && (
                <text
                  x={t.textPos.x}
                  y={t.textPos.y + 3}
                  textAnchor="middle"
                  fill={t.isRedline ? '#ff0055' : '#ffffff'}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="select-none opacity-80"
                >
                  {t.label}
                </text>
              )}
            </g>
          ))}

          {/* Redline Warning Tag */}
          <text
            x="140"
            y="68"
            textAnchor="middle"
            fill="#ff0055"
            fontSize="8"
            fontWeight="900"
            letterSpacing="2"
            fontFamily="monospace"
            className="animate-pulse"
          >
            RPM REDLINE
          </text>

          {/* Smooth Tachometer Needle (Seconds) */}
          <line
            x1="140"
            y1="140"
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="#ff0055"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#needleShadow)"
            style={{
              transition: enableAnimations ? 'all 0.15s cubic-bezier(0.4, 2.08, 0.55, 0.44)' : 'none'
            }}
          />

          {/* Needle Center Cap */}
          <circle cx="140" cy="140" r="12" fill="#090d16" stroke="#ff0055" strokeWidth="2.5" />
          <circle cx="140" cy="140" r="5" fill="#00f3ff" />
        </svg>

        {/* Center Digital Readout Box (Speedometer Readout) */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          {/* Unit Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-[#00f3ff]/40 text-[9px] font-mono font-bold text-[#00f3ff] tracking-widest uppercase mb-1 shadow-sm">
            <Zap className="w-2.5 h-2.5 text-[#00f3ff]" />
            <span>KM/H • TIME</span>
          </div>

          {/* Main Time Readout (10:42) */}
          <div className="flex items-baseline justify-center font-mono font-extrabold tracking-tighter text-white drop-shadow-[0_0_12px_rgba(0,243,255,0.6)]">
            <span className="text-3xl sm:text-4xl text-white">{hours}</span>
            <span className="text-2xl sm:text-3xl text-[#00f3ff] animate-pulse mx-0.5">:</span>
            <span className="text-3xl sm:text-4xl text-white">{minutes}</span>

            {showSeconds && (
              <span className="text-xs sm:text-sm font-semibold text-[#ff0055] ml-1 font-mono">
                .{seconds}
              </span>
            )}
          </div>

          {/* Gear Shift Box & AM/PM */}
          <div className="flex items-center gap-2 mt-1.5">
            {/* Gear Shift Indicator */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 border border-white/20 text-[10px] font-mono font-bold text-white">
              <span className="text-white/40">GEAR</span>
              <span className="text-emerald-400 font-extrabold">[{ampm === 'PM' ? 'S' : 'D'}]</span>
            </div>

            {/* AM/PM Badge */}
            {clockFormat12 && (
              <span className="px-1.5 py-0.5 rounded bg-[#00f3ff]/20 border border-[#00f3ff]/50 text-[10px] font-mono font-bold text-[#00f3ff] uppercase">
                {ampm}
              </span>
            )}
          </div>

          {/* Trip Odometer Date */}
          <div className="mt-2 text-[10px] font-mono font-semibold tracking-wider text-white/60 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10">
            TRIP {formattedDate.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};
