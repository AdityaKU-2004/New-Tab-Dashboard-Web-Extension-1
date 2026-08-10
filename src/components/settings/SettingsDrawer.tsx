import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDashboardStore, SEARCH_ENGINES } from '../../store/useDashboardStore';
import { AccentColor, SearchEngineId, ThemeMode } from '../../types';
import { ACCENT_COLOR_CLASSES } from '../../hooks/useTheme';
import { CYBERPUNK_WALLPAPER } from '../../mock/wallpapers';
import { GitHubSettingsSection } from '../developer/github/GitHubSettingsSection';
import {
  X,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  Zap,
  Code2,
  Clock,
  Search,
  Sliders,
  Eye,
  Sparkles,
  Check,
  User,
  Palette,
  LayoutGrid,
  Gauge
} from 'lucide-react';
import { AnimatedButton } from '../ui/AnimatedButton';
import { IconButton } from '../ui/IconButton';

export const SettingsDrawer: React.FC = () => {
  const isOpen = useDashboardStore((state) => state.isSettingsOpen);
  const setOpen = useDashboardStore((state) => state.setSettingsOpen);
  const { settings, updateSettings, resetSettings, toggleWidgetVisibility } = useDashboardStore();
  const enableAnimations = settings.enableAnimations;

  const accentColors: AccentColor[] = ['indigo', 'emerald', 'violet', 'rose', 'amber', 'cyan', 'slate'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={enableAnimations ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={enableAnimations ? { x: '100%' } : false}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-950/95 text-white backdrop-blur-2xl border-l border-white/10 shadow-2xl overflow-y-auto p-6 z-10 light:bg-white light:text-slate-900 light:border-slate-200 custom-scrollbar flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 light:border-slate-200">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-bold tracking-wide">Dashboard Settings</h2>
                </div>
                <IconButton
                  icon={<X className="w-5 h-5" />}
                  onClick={() => setOpen(false)}
                  variant="ghost"
                  size="sm"
                  tooltip="Close settings"
                />
              </div>

              {/* Settings Groups */}
              <div className="space-y-6 my-6">
                {/* 1. Theme & Appearance */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-3">
                    <Palette className="w-4 h-4" /> Theme & Accent
                  </label>

                  {/* Theme Mode Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                    {(['dark', 'light', 'cyberpunk', 'developer', 'system'] as ThemeMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          if (mode === 'cyberpunk') {
                            useDashboardStore.getState().setSelectedWallpaper(CYBERPUNK_WALLPAPER);
                          }
                          updateSettings({ theme: mode });
                        }}
                        className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                          settings.theme === mode
                            ? 'bg-accent text-white border-accent-full shadow-md'
                            : 'bg-white/10 hover:bg-white/20 border-white/10 light:bg-slate-100 light:border-slate-200 light:text-slate-800'
                        }`}
                      >
                        {mode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
                        {mode === 'dark' && <Moon className="w-3.5 h-3.5 text-accent" />}
                        {mode === 'cyberpunk' && <Zap className="w-3.5 h-3.5 text-[#00f3ff]" />}
                        {mode === 'developer' && <Code2 className="w-3.5 h-3.5 text-[#58a6ff]" />}
                        {mode === 'system' && <Laptop className="w-3.5 h-3.5 text-slate-300" />}
                        <span>{mode}</span>
                      </button>
                    ))}
                  </div>

                  {/* Accent Palette */}
                  <div>
                    <span className="block text-xs font-medium text-white/70 light:text-slate-600 mb-2">
                      Accent Color
                    </span>
                    <div className="flex items-center gap-2">
                      {accentColors.map((color) => {
                        const style = ACCENT_COLOR_CLASSES[color];
                        const isSelected = settings.accentColor === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => updateSettings({ accentColor: color })}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                              style.bg
                            } ${isSelected ? 'scale-110 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'}`}
                            title={color}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Clock & User Profile */}
                <div className="pt-4 border-t border-white/10 light:border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-3">
                    <Clock className="w-4 h-4" /> Clock & Greeting
                  </label>

                  <div className="space-y-3 text-xs">
                    {/* Clock Style Option */}
                    <div>
                      <span className="block font-medium text-white/80 light:text-slate-700 mb-2">
                        Clock Style
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateSettings({ clockStyle: 'digital' })}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                            (settings.clockStyle || 'digital') === 'digital'
                              ? 'bg-accent text-white border-accent-full shadow-md'
                              : 'bg-white/10 hover:bg-white/20 border-white/10 light:bg-slate-100 light:border-slate-200 light:text-slate-800'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Digital</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateSettings({ clockStyle: 'speedometer' })}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                            settings.clockStyle === 'speedometer'
                              ? 'bg-accent text-white border-accent-full shadow-md'
                              : 'bg-white/10 hover:bg-white/20 border-white/10 light:bg-slate-100 light:border-slate-200 light:text-slate-800'
                          }`}
                        >
                          <Gauge className="w-3.5 h-3.5 text-[#00f3ff]" />
                          <span>Speedometer</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white/80 light:text-slate-700">12-Hour Format</span>
                      <input
                        type="checkbox"
                        checked={settings.clockFormat12}
                        onChange={(e) => updateSettings({ clockFormat12: e.target.checked })}
                        className="w-4 h-4 rounded cursor-pointer accent-[var(--accent-color)]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white/80 light:text-slate-700">Show Seconds</span>
                      <input
                        type="checkbox"
                        checked={settings.showSeconds}
                        onChange={(e) => updateSettings({ showSeconds: e.target.checked })}
                        className="w-4 h-4 rounded cursor-pointer accent-[var(--accent-color)]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white/80 light:text-slate-700">Show Greeting</span>
                      <input
                        type="checkbox"
                        checked={settings.showGreeting}
                        onChange={(e) => updateSettings({ showGreeting: e.target.checked })}
                        className="w-4 h-4 rounded cursor-pointer accent-[var(--accent-color)]"
                      />
                    </div>

                    <div>
                      <span className="block font-medium text-white/80 light:text-slate-700 mb-1">
                        Your Name (for Greeting)
                      </span>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/40 light:text-slate-400" />
                        <input
                          type="text"
                          value={settings.userName}
                          onChange={(e) => updateSettings({ userName: e.target.value })}
                          placeholder="e.g. Alex"
                          className="w-full pl-8 pr-3 py-1.5 bg-white/10 dark:bg-slate-900/50 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:ring-1 ring-accent light:bg-slate-100 light:text-slate-900 light:border-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Search Engine */}
                <div className="pt-4 border-t border-white/10 light:border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-3">
                    <Search className="w-4 h-4" /> Default Search Engine
                  </label>

                  <select
                    value={settings.searchEngine}
                    onChange={(e) => updateSettings({ searchEngine: e.target.value as SearchEngineId })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-xl text-xs focus:outline-none focus:ring-2 ring-accent light:bg-slate-100 light:text-slate-900 light:border-slate-300"
                  >
                    {(Object.keys(SEARCH_ENGINES) as SearchEngineId[]).map((engineId) => (
                      <option key={engineId} value={engineId}>
                        {SEARCH_ENGINES[engineId].name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Glassmorphism & Background Customization */}
                <div className="pt-4 border-t border-white/10 light:border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-3">
                    <Eye className="w-4 h-4" /> Glassmorphism & Effects
                  </label>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-white/80 light:text-slate-700 mb-1">
                        <span>Card Opacity</span>
                        <span>{Math.round(settings.cardOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={settings.cardOpacity}
                        onChange={(e) => updateSettings({ cardOpacity: Number(e.target.value) })}
                        className="w-full cursor-pointer accent-[var(--accent-color)]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-white/80 light:text-slate-700 mb-1">
                        <span>Background Blur</span>
                        <span>{settings.backgroundBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={settings.backgroundBlur}
                        onChange={(e) => updateSettings({ backgroundBlur: Number(e.target.value) })}
                        className="w-full cursor-pointer accent-[var(--accent-color)]"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-white/80 light:text-slate-700">UI Motion Animations</span>
                      <input
                        type="checkbox"
                        checked={settings.enableAnimations}
                        onChange={(e) => updateSettings({ enableAnimations: e.target.checked })}
                        className="w-4 h-4 rounded cursor-pointer accent-[var(--accent-color)]"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Widget Visibility Toggles */}
                <div className="pt-4 border-t border-white/10 light:border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-3">
                    <LayoutGrid className="w-4 h-4" /> Visible Widgets
                  </label>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(
                      Object.keys(
                        settings.widgetVisibility
                      ) as (keyof typeof settings.widgetVisibility)[]
                    ).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleWidgetVisibility(key)}
                        className={`flex items-center justify-between p-2 rounded-xl border text-left cursor-pointer transition-colors ${
                          settings.widgetVisibility[key]
                            ? 'bg-accent-soft border-accent text-white light:text-slate-900'
                            : 'bg-white/5 border-white/10 text-white/40 light:bg-slate-100 light:border-slate-200'
                        }`}
                      >
                        <span className="capitalize font-medium">{key}</span>
                        <div
                          className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border ${
                            settings.widgetVisibility[key]
                              ? 'bg-accent border-accent text-white'
                              : 'border-white/30'
                          }`}
                        >
                          {settings.widgetVisibility[key] && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. GitHub Settings (Developer Theme Only) */}
                <GitHubSettingsSection />
              </div>
            </div>

            {/* Footer Reset Action */}
            <div className="pt-4 border-t border-white/10 light:border-slate-200">
              <AnimatedButton
                type="button"
                variant="danger"
                fullWidth
                onClick={resetSettings}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Reset All Settings to Default
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
