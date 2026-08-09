import React, { useState } from 'react';
import { Wallpaper } from '../../types';
import { motion } from 'motion/react';
import { Check, PlayCircle, ImageOff } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { LiveCanvasWallpaper } from './LiveCanvasWallpaper';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({ wallpaper }) => {
  const selectedWallpaper = useDashboardStore((state) => state.selectedWallpaper);
  const setSelectedWallpaper = useDashboardStore((state) => state.setSelectedWallpaper);
  const enableAnimations = useDashboardStore((state) => state.settings.enableAnimations);
  const [imgError, setImgError] = useState(false);

  const isSelected = selectedWallpaper.id === wallpaper.id;
  
  const isGradientThumbnail = wallpaper.thumbnail?.startsWith('gradient:');
  const isGradientUrl = wallpaper.url?.startsWith('gradient:');
  const isGradient = isGradientThumbnail || isGradientUrl;
  const gradientStyle = isGradientThumbnail
    ? wallpaper.thumbnail.replace('gradient:', '')
    : isGradientUrl
    ? wallpaper.url.replace('gradient:', '')
    : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)';

  const isLive = wallpaper.isLive || wallpaper.category === 'live' || wallpaper.url.startsWith('live:');
  const isLiveCanvas = wallpaper.url.startsWith('live:canvas-') || (wallpaper.liveType && wallpaper.liveType.startsWith('canvas-'));
  const canvasType = wallpaper.liveType || wallpaper.url.replace('live:', '');

  return (
    <motion.div
      whileHover={enableAnimations ? { scale: 1.03 } : undefined}
      whileTap={enableAnimations ? { scale: 0.97 } : undefined}
      onClick={() => setSelectedWallpaper(wallpaper)}
      className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer group shadow-md bg-slate-900 ${
        isSelected
          ? 'border-accent ring-4 ring-accent/30 shadow-lg'
          : 'border-white/10 hover:border-white/30'
      }`}
    >
      {/* Background preview logic */}
      {isLiveCanvas ? (
        <div className="relative w-full h-full overflow-hidden">
          <LiveCanvasWallpaper type={canvasType} />
        </div>
      ) : isGradient ? (
        <div
          className="w-full h-full"
          style={{ background: gradientStyle }}
        />
      ) : imgError ? (
        <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-2 text-center text-slate-400">
          <ImageOff className="w-6 h-6 mb-1 text-slate-500" />
          <span className="text-[10px] font-mono">{wallpaper.name}</span>
        </div>
      ) : (
        <img
          src={wallpaper.thumbnail || wallpaper.url}
          alt={wallpaper.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      )}

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-accent/90 text-white flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase shadow-md backdrop-blur-sm z-10">
          <PlayCircle className="w-3 h-3 animate-pulse" />
          <span>LIVE</span>
        </div>
      )}

      {/* Selected overlay badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shadow-md z-10">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Caption overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-white z-10">
        <span className="block text-xs font-semibold truncate">{wallpaper.name}</span>
        {wallpaper.author && (
          <span className="block text-[10px] text-white/60 truncate">by {wallpaper.author}</span>
        )}
      </div>
    </motion.div>
  );
};
