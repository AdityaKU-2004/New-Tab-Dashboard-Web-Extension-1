import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { WallpaperCard } from './WallpaperCard';
import { INITIAL_WALLPAPERS } from '../../mock/wallpapers';
import { useDashboardStore } from '../../store/useDashboardStore';
import { WallpaperCategory, Wallpaper } from '../../types';
import { Image, Sliders, Link, Sparkles } from 'lucide-react';
import { AnimatedButton } from '../ui/AnimatedButton';

export const WallpaperPicker: React.FC = () => {
  const isOpen = useDashboardStore((state) => state.isWallpaperPickerOpen);
  const setOpen = useDashboardStore((state) => state.setWallpaperPickerOpen);
  const setSelectedWallpaper = useDashboardStore((state) => state.setSelectedWallpaper);
  const customUrl = useDashboardStore((state) => state.customWallpaperUrl);
  const setCustomUrl = useDashboardStore((state) => state.setCustomWallpaperUrl);

  const { backgroundBlur, darkOverlayOpacity } = useDashboardStore((state) => state.settings);
  const updateSettings = useDashboardStore((state) => state.updateSettings);

  const [activeCategory, setActiveCategory] = useState<WallpaperCategory | 'all'>('all');
  const [customInput, setCustomInput] = useState(customUrl);

  const categories: { id: WallpaperCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'nature', label: 'Nature' },
    { id: 'mountains', label: 'Mountains' },
    { id: 'space', label: 'Space' },
    { id: 'abstract', label: 'Abstract' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'gradient', label: 'Gradients' }
  ];

  const filteredWallpapers =
    activeCategory === 'all'
      ? INITIAL_WALLPAPERS
      : INITIAL_WALLPAPERS.filter((w) => w.category === activeCategory);

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const customWP: Wallpaper = {
      id: 'custom_' + Date.now(),
      name: 'Custom Wallpaper',
      url: customInput.trim(),
      thumbnail: customInput.trim(),
      category: 'minimal',
      author: 'Custom URL'
    };

    setCustomUrl(customInput.trim());
    setSelectedWallpaper(customWP);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Wallpaper & Appearance" maxWidth="xl">
      <div className="space-y-5">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-white/10 light:border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white/70 light:bg-slate-100 light:text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Wallpaper Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {filteredWallpapers.map((wallpaper) => (
            <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} />
          ))}
        </div>

        {/* Custom Image URL */}
        <form onSubmit={handleApplyCustomUrl} className="pt-3 border-t border-white/10 light:border-slate-200">
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 light:text-slate-600 mb-1.5">
            Use Custom Image URL
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-2.5 w-4 h-4 text-white/40 light:text-slate-400" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/your-image.jpg"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/10 dark:bg-slate-900/50 rounded-xl border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 light:bg-slate-100 light:text-slate-900 light:border-slate-300"
              />
            </div>
            <AnimatedButton type="submit" variant="secondary" size="sm">
              Apply
            </AnimatedButton>
          </div>
        </form>

        {/* Background Overlay Effects Sliders */}
        <div className="space-y-3 pt-3 border-t border-white/10 light:border-slate-200">
          <div>
            <div className="flex justify-between text-xs font-semibold text-white/80 light:text-slate-700 mb-1">
              <span>Background Blur</span>
              <span>{backgroundBlur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={backgroundBlur}
              onChange={(e) => updateSettings({ backgroundBlur: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-white/80 light:text-slate-700 mb-1">
              <span>Dark Overlay Opacity</span>
              <span>{Math.round(darkOverlayOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={darkOverlayOpacity}
              onChange={(e) => updateSettings({ darkOverlayOpacity: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
