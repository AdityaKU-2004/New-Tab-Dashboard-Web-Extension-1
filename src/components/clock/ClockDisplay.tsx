import React from 'react';
import { motion } from 'motion/react';
import { useClock } from '../../hooks/useClock';
import { useDashboardStore } from '../../store/useDashboardStore';
import { GlassCard } from '../ui/GlassCard';
import { Clock, Calendar as CalendarIcon, Gauge, Sparkles } from 'lucide-react';
import { SpeedometerClock } from './SpeedometerClock';

export const ClockDisplay: React.FC = () => {
  const { clockFormat12, showSeconds, showGreeting, userName, enableAnimations, clockStyle = 'digital' } = useDashboardStore(
    (state) => state.settings
  );
  const updateSettings = useDashboardStore((state) => state.updateSettings);
  const { hours, minutes, seconds, ampm, dayName, formattedDate, greeting } = useClock(clockFormat12);

  const toggleClockStyle = () => {
    updateSettings({ clockStyle: clockStyle === 'speedometer' ? 'digital' : 'speedometer' });
  };

  if (clockStyle === 'speedometer') {
    return (
      <GlassCard className="relative flex flex-col items-center justify-center py-4 px-6 text-center select-none group">
        {/* Quick Style Switcher Floating Badge */}
        <button
          onClick={toggleClockStyle}
          className="absolute top-3 right-3 px-2 py-1 rounded-full bg-slate-950/80 border border-[#00f3ff]/40 text-[#00f3ff] hover:bg-[#00f3ff]/20 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer opacity-70 group-hover:opacity-100 shadow-md z-30"
          title="Switch to Digital Clock"
        >
          <Clock className="w-3 h-3" />
          <span>DIGITAL</span>
        </button>

        <SpeedometerClock />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="relative flex flex-col items-center justify-center py-6 px-8 text-center select-none group">
      {/* Quick Style Switcher Floating Badge */}
      <button
        onClick={toggleClockStyle}
        className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/10 dark:bg-slate-900/60 border border-white/10 hover:border-accent hover:text-accent text-white/70 light:text-slate-600 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer opacity-70 group-hover:opacity-100 shadow-md"
        title="Switch to Sports Car Speedometer Clock"
      >
        <Gauge className="w-3.5 h-3.5 text-accent" />
        <span>SPEEDOMETER</span>
      </button>

      {showGreeting && (
        <motion.div
          initial={enableAnimations ? { opacity: 0, y: -6 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm font-medium text-white/70 light:text-slate-600 mb-1"
        >
          <span>{greeting},</span>
          <span className="font-semibold text-white light:text-slate-900 border-b border-dashed border-white/40 light:border-slate-400">
            {userName || 'Developer'}
          </span>
        </motion.div>
      )}

      {/* Main Digital Clock */}
      <div className="flex items-baseline justify-center font-mono font-bold tracking-tight text-white light:text-slate-900 drop-shadow-md">
        <span className="text-5xl sm:text-6xl md:text-7xl font-extrabold">{hours}</span>
        <span className="text-4xl sm:text-5xl md:text-6xl mx-1 text-white/60 light:text-slate-400 animate-pulse">:</span>
        <span className="text-5xl sm:text-6xl md:text-7xl font-extrabold">{minutes}</span>

        {showSeconds && (
          <span className="text-xl sm:text-2xl font-normal ml-2 text-white/60 light:text-slate-500 font-mono">
            :{seconds}
          </span>
        )}

        {clockFormat12 && (
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider ml-3 px-2 py-0.5 rounded-md bg-white/10 light:bg-slate-200 light:text-slate-700 border border-white/10">
            {ampm}
          </span>
        )}
      </div>

      {/* Day and Date */}
      <div className="flex items-center justify-center gap-3 mt-3 text-xs sm:text-sm font-medium text-white/80 light:text-slate-700">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-slate-900/40 light:bg-slate-200/80 border border-white/10">
          <CalendarIcon className="w-3.5 h-3.5 text-accent" />
          <span>{dayName}</span>
        </span>
        <span className="text-white/40 light:text-slate-400">•</span>
        <span>{formattedDate}</span>
      </div>
    </GlassCard>
  );
};

