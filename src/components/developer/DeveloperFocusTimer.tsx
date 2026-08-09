import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Zap, CheckCircle2 } from 'lucide-react';

export const DeveloperFocusTimer: React.FC = () => {
  const WORK_TIME = 25 * 60; // 25 min
  const BREAK_TIME = 5 * 60;  // 5 min

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      if (mode === 'work') {
        setCompletedSessions((prev) => prev + 1);
        setMode('break');
        setTimeLeft(BREAK_TIME);
      } else {
        setMode('work');
        setTimeLeft(WORK_TIME);
      }
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalDuration = mode === 'work' ? WORK_TIME : BREAK_TIME;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#30363D] mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-[#58A6FF]" />
          <h2 className="text-sm font-bold text-[#E6EDF3]">Developer Focus Timer</h2>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#8B949E]">Sessions:</span>
          <span className="px-2 py-0.5 rounded bg-[#1C212B] text-[#3FB950] font-bold border border-[#30363D]">
            {completedSessions} ✓
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4 space-y-4">
        {/* Mode Selector */}
        <div className="flex items-center gap-2 p-1 bg-[#0D1117] rounded-md border border-[#30363D]">
          <button
            onClick={() => switchMode('work')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              mode === 'work'
                ? 'bg-[#58A6FF] text-[#0D1117] font-bold'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            Coding (25m)
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              mode === 'break'
                ? 'bg-[#3FB950] text-[#0D1117] font-bold'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            Rest (5m)
          </button>
        </div>

        {/* Digital Time Display */}
        <div className="text-5xl font-black text-[#E6EDF3] tracking-tighter my-2 drop-shadow-sm">
          {formattedTime}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md h-2 bg-[#0D1117] rounded-full overflow-hidden border border-[#30363D]">
          <div
            className={`h-full transition-all duration-300 ${
              mode === 'work' ? 'bg-[#58A6FF]' : 'bg-[#3FB950]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-5 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
              isRunning
                ? 'bg-[#D29922] text-[#0D1117] hover:bg-[#D29922]/90'
                : 'bg-[#58A6FF] text-[#0D1117] hover:bg-[#58A6FF]/90'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'PAUSE' : 'START FOCUS'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-2 rounded-md bg-[#0D1117] hover:bg-[#1C212B] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
