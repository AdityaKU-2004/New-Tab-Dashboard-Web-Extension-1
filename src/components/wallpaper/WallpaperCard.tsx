import React from 'react';
import { Wallpaper } from '../../types';
import { motion } from 'motion/react';
import { Check, Video, PlayCircle } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({ wallpaper }) => {
  const selectedWallpaper = useDashboardStore((state) => state.selectedWallpaper);
  const setSelectedWallpaper = useDashboardStore((state) => state.setSelectedWallpaper);
  const enableAnimations = useDashboardStore((state) => state.settings.enableAnimations);

  const isSelected = selectedWallpaper.id === wallpaper.id;
  const isGradient = wallpaper.url.startsWith('gradient:');
  const isLive = wallpaper.isLive || wallpaper.category === 'live' || wallpaper.url.startsWith('live:');

  return (
    <motion.div
      whileHover={enableAnimations ? { scale: 1.03 } : undefined}
      whileTap={enableAnimations ? { scale: 0.97 } : undefined}
      onClick={() => setSelectedWallpaper(wallpaper)}
      className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer group shadow-md ${
        isSelected
          ? 'border-accent ring-4 ring-accent/30 shadow-lg'
          : 'border-white/10 hover:border-white/30'
      }`}
    >
      {isGradient ? (
        <div
          className="w-full h-full"
          style={{ background: wallpaper.url.replace('gradient:', '') }}
        />
      ) : (
        <img
          src={wallpaper.thumbnail}
          alt={wallpaper.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      )}

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-accent/90 text-white flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase shadow-md backdrop-blur-sm">
          <PlayCircle className="w-3 h-3 animate-pulse" />
          <span>LIVE</span>
        </div>
      )}

      {/* Selected overlay badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shadow-md">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Caption overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
        <span className="block text-xs font-semibold truncate">{wallpaper.name}</span>
        {wallpaper.author && (
          <span className="block text-[10px] text-white/60 truncate">by {wallpaper.author}</span>
        )}
      </div>
    </motion.div>
  );
};
