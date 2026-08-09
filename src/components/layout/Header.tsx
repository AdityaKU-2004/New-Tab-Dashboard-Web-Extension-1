import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { IconButton } from '../ui/IconButton';
import { Sliders, Image, Zap } from 'lucide-react';
import { CyberHudStats } from '../cyberpunk/CyberHudStats';

export const Header: React.FC = () => {
  const setSettingsOpen = useDashboardStore((state) => state.setSettingsOpen);
  const setWallpaperPickerOpen = useDashboardStore((state) => state.setWallpaperPickerOpen);
  const theme = useDashboardStore((state) => state.settings.theme);

  const isCyberpunk = theme === 'cyberpunk';

  return (
    <header className="flex flex-wrap items-center justify-between w-full py-4 px-2 select-none gap-4">
      <div className="flex items-center gap-2">
        {isCyberpunk && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/80 border border-[#00f3ff]/60 text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            <Zap className="w-4 h-4 animate-pulse text-[#00f3ff]" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase">CYBERPUNK v2.077</span>
          </div>
        )}
      </div>

      {/* Header Actions & Cyber HUD */}
      <div className="flex items-center gap-4 ml-auto">
        {isCyberpunk && <CyberHudStats />}

        <div className="flex items-center gap-2">
          <IconButton
            icon={<Image className="w-4 h-4" />}
            onClick={() => setWallpaperPickerOpen(true)}
            label="Wallpapers"
            variant="glass"
            size="sm"
            tooltip="Change Wallpaper & Appearance"
          />

          <ThemeToggle />

          <IconButton
            icon={<Sliders className="w-4 h-4" />}
            onClick={() => setSettingsOpen(true)}
            variant="glass"
            size="sm"
            tooltip="Dashboard Settings"
          />
        </div>
      </div>
    </header>
  );
};
