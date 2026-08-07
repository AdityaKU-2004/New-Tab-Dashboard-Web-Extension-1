import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { IconButton } from '../ui/IconButton';
import { Sliders, Image } from 'lucide-react';

export const Header: React.FC = () => {
  const setSettingsOpen = useDashboardStore((state) => state.setSettingsOpen);
  const setWallpaperPickerOpen = useDashboardStore((state) => state.setWallpaperPickerOpen);

  return (
    <header className="flex items-center justify-end w-full py-4 px-2 select-none">
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
