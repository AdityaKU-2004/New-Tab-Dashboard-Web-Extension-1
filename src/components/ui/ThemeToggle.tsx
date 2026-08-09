import React from 'react';
import { Sun, Moon, Laptop, Zap } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { IconButton } from './IconButton';
import { ThemeMode } from '../../types';
import { CYBERPUNK_WALLPAPER } from '../../mock/wallpapers';

export const ThemeToggle: React.FC = () => {
  const { theme } = useDashboardStore((state) => state.settings);
  const updateSettings = useDashboardStore((state) => state.updateSettings);
  const setSelectedWallpaper = useDashboardStore((state) => state.setSelectedWallpaper);

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['dark', 'light', 'cyberpunk', 'system'];
    const nextIndex = (modes.indexOf(theme) + 1) % modes.length;
    const nextTheme = modes[nextIndex];
    
    if (nextTheme === 'cyberpunk') {
      setSelectedWallpaper(CYBERPUNK_WALLPAPER);
    }
    updateSettings({ theme: nextTheme });
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'dark':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'cyberpunk':
        return <Zap className="w-4 h-4 text-[#00f3ff] drop-shadow-[0_0_8px_#00f3ff]" />;
      default:
        return <Laptop className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <IconButton
      icon={getIcon()}
      onClick={cycleTheme}
      tooltip={`Theme: ${theme.toUpperCase()} (Click to cycle)`}
      variant="glass"
      size="sm"
    />
  );
};
