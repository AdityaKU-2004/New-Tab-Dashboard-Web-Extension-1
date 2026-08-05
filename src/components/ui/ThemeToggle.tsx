import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { IconButton } from './IconButton';
import { ThemeMode } from '../../types';

export const ThemeToggle: React.FC = () => {
  const { theme } = useDashboardStore((state) => state.settings);
  const updateSettings = useDashboardStore((state) => state.updateSettings);

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['dark', 'light', 'system'];
    const nextIndex = (modes.indexOf(theme) + 1) % modes.length;
    updateSettings({ theme: modes[nextIndex] });
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'dark':
        return <Moon className="w-4 h-4 text-indigo-400" />;
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
