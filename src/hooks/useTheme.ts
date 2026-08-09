import { useEffect } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { AccentColor } from '../types';

export const ACCENT_COLOR_CLASSES: Record<
  AccentColor,
  {
    bg: string;
    text: string;
    border: string;
    ring: string;
    gradient: string;
    hoverBg: string;
    lightBg: string;
    hex: string;
    rgb: string;
  }
> = {
  indigo: {
    bg: 'bg-indigo-600',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    ring: 'focus:ring-indigo-500',
    gradient: 'from-indigo-600 to-violet-600',
    hoverBg: 'hover:bg-indigo-500/20',
    lightBg: 'bg-indigo-500/10',
    hex: '#6366f1',
    rgb: '99, 102, 241'
  },
  emerald: {
    bg: 'bg-emerald-600',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    ring: 'focus:ring-emerald-500',
    gradient: 'from-emerald-600 to-teal-600',
    hoverBg: 'hover:bg-emerald-500/20',
    lightBg: 'bg-emerald-500/10',
    hex: '#10b981',
    rgb: '16, 185, 129'
  },
  violet: {
    bg: 'bg-violet-600',
    text: 'text-violet-400',
    border: 'border-violet-500/30',
    ring: 'focus:ring-violet-500',
    gradient: 'from-violet-600 to-fuchsia-600',
    hoverBg: 'hover:bg-violet-500/20',
    lightBg: 'bg-violet-500/10',
    hex: '#8b5cf6',
    rgb: '139, 92, 246'
  },
  rose: {
    bg: 'bg-rose-600',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    ring: 'focus:ring-rose-500',
    gradient: 'from-rose-600 to-pink-600',
    hoverBg: 'hover:bg-rose-500/20',
    lightBg: 'bg-rose-500/10',
    hex: '#f43f5e',
    rgb: '244, 63, 94'
  },
  amber: {
    bg: 'bg-amber-600',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    ring: 'focus:ring-amber-500',
    gradient: 'from-amber-500 to-orange-600',
    hoverBg: 'hover:bg-amber-500/20',
    lightBg: 'bg-amber-500/10',
    hex: '#f59e0b',
    rgb: '245, 158, 11'
  },
  cyan: {
    bg: 'bg-cyan-600',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    ring: 'focus:ring-cyan-500',
    gradient: 'from-cyan-500 to-blue-600',
    hoverBg: 'hover:bg-cyan-500/20',
    lightBg: 'bg-cyan-500/10',
    hex: '#06b6d4',
    rgb: '6, 182, 212'
  },
  slate: {
    bg: 'bg-slate-600',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    ring: 'focus:ring-slate-400',
    gradient: 'from-slate-600 to-zinc-700',
    hoverBg: 'hover:bg-slate-500/20',
    lightBg: 'bg-slate-500/10',
    hex: '#64748b',
    rgb: '100, 116, 139'
  }
};

export function useTheme() {
  const theme = useDashboardStore((state) => state.settings.theme);
  const accentColor = useDashboardStore((state) => state.settings.accentColor);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = theme === 'dark' || theme === 'cyberpunk';
      if (theme === 'system') {
        isDark = mediaQuery.matches;
      }

      if (theme === 'cyberpunk') {
        root.classList.add('dark', 'cyberpunk');
        root.classList.remove('light');
        root.style.setProperty('--accent-color', '#00f3ff');
        root.style.setProperty('--accent-rgb', '0, 243, 255');
      } else if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light', 'cyberpunk');
      } else {
        root.classList.remove('dark', 'cyberpunk');
        root.classList.add('light');
      }
    };

    applyTheme();

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const style = ACCENT_COLOR_CLASSES[accentColor] || ACCENT_COLOR_CLASSES.indigo;
    root.style.setProperty('--accent-color', style.hex);
    root.style.setProperty('--accent-rgb', style.rgb);
  }, [accentColor]);

  const accentStyles = ACCENT_COLOR_CLASSES[accentColor] || ACCENT_COLOR_CLASSES.indigo;

  return {
    theme,
    accentColor,
    accentStyles
  };
}
