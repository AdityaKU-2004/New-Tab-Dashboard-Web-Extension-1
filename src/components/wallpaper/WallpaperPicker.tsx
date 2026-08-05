import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { WallpaperCard } from './WallpaperCard';
import { INITIAL_WALLPAPERS } from '../../mock/wallpapers';
import { useDashboardStore } from '../../store/useDashboardStore';
import { WallpaperCategory, Wallpaper } from '../../types';
import { Image as ImageIcon, Link, Upload, Check } from 'lucide-react';
import { AnimatedButton } from '../ui/AnimatedButton';

export const WallpaperPicker: React.FC = () => {
  const isOpen = useDashboardStore((state) => state.isWallpaperPickerOpen);
  const setOpen = useDashboardStore((state) => state.setWallpaperPickerOpen);
  const selectedWallpaper = useDashboardStore((state) => state.selectedWallpaper);
  const setSelectedWallpaper = useDashboardStore((state) => state.setSelectedWallpaper);
  const customUrl = useDashboardStore((state) => state.customWallpaperUrl);
  const setCustomUrl = useDashboardStore((state) => state.setCustomWallpaperUrl);

  const { backgroundBlur, darkOverlayOpacity } = useDashboardStore((state) => state.settings);
  const updateSettings = useDashboardStore((state) => state.updateSettings);

  const [activeCategory, setActiveCategory] = useState<WallpaperCategory | 'all'>('all');
  const [customInput, setCustomInput] = useState(customUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const compressImageDataUrl = (dataUrl: string, maxWidth = 1600, maxHeight = 900): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight && (height = maxHeight);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      if (rawDataUrl) {
        const compressedUrl = await compressImageDataUrl(rawDataUrl);
        const uploadedWP: Wallpaper = {
          id: 'uploaded_' + Date.now(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: compressedUrl,
          thumbnail: compressedUrl,
          category: 'minimal',
          author: 'Uploaded File'
        };
        setCustomUrl(compressedUrl);
        setCustomInput(compressedUrl);
        setSelectedWallpaper(uploadedWP);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Choose Wallpaper Background" maxWidth="xl">
      <div className="space-y-5">
        {/* Custom Upload / URL Quick Action Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 light:bg-slate-100 light:border-slate-200">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 light:text-slate-600 mb-1.5">
              Upload Local Image File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Choose Image from Device</span>
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 light:text-slate-600 mb-1.5">
              Custom Image Web URL
            </label>
            <form onSubmit={handleApplyCustomUrl} className="flex gap-1.5">
              <div className="relative flex-1">
                <Link className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/40 light:text-slate-400" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-white/10 dark:bg-slate-900/50 rounded-xl border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 ring-accent light:bg-white light:text-slate-900 light:border-slate-300"
                />
              </div>
              <AnimatedButton type="submit" variant="secondary" size="sm">
                Apply
              </AnimatedButton>
            </form>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-white/10 light:border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-accent text-white shadow-sm'
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
              className="w-full cursor-pointer accent-[var(--accent-color)]"
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
              className="w-full cursor-pointer accent-[var(--accent-color)]"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

