import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { IconButton } from '../ui/IconButton';
import { Sliders, Image, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const setSettingsOpen = useDashboardStore((state) => state.setSettingsOpen);
  const setWallpaperPickerOpen = useDashboardStore((state) => state.setWallpaperPickerOpen);

  return (
    <header className="flex items-center justify-between w-full py-4 px-2 select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 border border-white/20">
          <Sparkles className="w-4 h-4 animate-pulse text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wider text-white light:text-slate-900 uppercase">
            New Tab
          </h1>
          <span className="text-[10px] font-semibold text-white/50 light:text-slate-500 uppercase tracking-widest">
            Manifest V3 Extension
          </span>
        </div>
      </div>

      {/* Header Actions */}
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
    </header>
  );
};
