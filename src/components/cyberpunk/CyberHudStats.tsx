import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Disc, Activity, Music } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

export const CyberHudStats: React.FC = () => {
  const widgetVisibility = useDashboardStore((state) => state.settings.widgetVisibility);
  const showSystemStats = widgetVisibility?.cyberSystemMonitor !== false;
  const showAudioPlayer = widgetVisibility?.cyberAudioPlayer !== false;

  const [cpu, setCpu] = useState(14.2);
  const [ram, setRam] = useState(42.8);
  const [disk, setDisk] = useState(27.5);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!showSystemStats) return;
    const interval = setInterval(() => {
      setCpu(+(12 + Math.random() * 8).toFixed(1));
      setRam(+(41 + Math.random() * 3).toFixed(1));
    }, 3000);
    return () => clearInterval(interval);
  }, [showSystemStats]);

  if (!showSystemStats && !showAudioPlayer) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 items-end text-xs text-[#00f3ff] font-mono select-none">
      {/* HUD System Monitor Pills */}
      {showSystemStats && (
        <div className="flex flex-col gap-2 items-end">
          {/* CPU */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-[#00f3ff]/50 backdrop-blur-md shadow-[0_0_12px_rgba(0,243,255,0.25)]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#00f3ff]/70">CPU</span>
            <span className="font-bold text-white tracking-widest">{cpu}%</span>
            <div className="w-5 h-5 rounded-full bg-[#00f3ff]/20 border border-[#00f3ff] flex items-center justify-center">
              <Cpu className="w-3 h-3 text-[#00f3ff]" />
            </div>
          </div>

          {/* RAM */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-[#00f3ff]/50 backdrop-blur-md shadow-[0_0_12px_rgba(0,243,255,0.25)]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#00f3ff]/70">RAM</span>
            <span className="font-bold text-white tracking-widest">{ram}%</span>
            <div className="w-5 h-5 rounded-full bg-[#00f3ff]/20 border border-[#00f3ff] flex items-center justify-center">
              <Activity className="w-3 h-3 text-[#00f3ff]" />
            </div>
          </div>

          {/* DISK */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-[#00f3ff]/50 backdrop-blur-md shadow-[0_0_12px_rgba(0,243,255,0.25)]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#00f3ff]/70">DISK</span>
            <span className="font-bold text-white tracking-widest">{disk}%</span>
            <div className="w-5 h-5 rounded-full bg-[#00f3ff]/20 border border-[#00f3ff] flex items-center justify-center">
              <HardDrive className="w-3 h-3 text-[#00f3ff]" />
            </div>
          </div>
        </div>
      )}

      {/* Cyber Mini Music Widget */}
      {showAudioPlayer && (
        <div className="mt-2 flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/85 border border-[#00f3ff]/40 backdrop-blur-md shadow-[0_0_15px_rgba(0,243,255,0.2)]">
          <div className="relative w-9 h-9 rounded-full bg-[#00f3ff]/20 border border-[#00f3ff] flex items-center justify-center overflow-hidden">
            <Disc className={`w-5 h-5 text-[#00f3ff] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </div>
          <div className="text-left min-w-[110px]">
            <div className="text-[10px] uppercase font-semibold text-[#00f3ff]/60 tracking-wider">Cyberpunk Audio</div>
            <div className="text-xs font-bold text-white truncate">Neon Samurai - Synthwave</div>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-full bg-[#00f3ff]/20 border border-[#00f3ff]/60 text-[#00f3ff] hover:bg-[#00f3ff]/30 transition-colors cursor-pointer"
            title={isPlaying ? "Pause music" : "Play music"}
          >
            <Music className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
