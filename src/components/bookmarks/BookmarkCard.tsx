import React, { useState } from 'react';
import { Bookmark } from '../../types';
import { motion } from 'motion/react';
import { Globe, Trash2, ExternalLink } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark }) => {
  const [imgError, setImgError] = useState(false);
  const deleteBookmark = useDashboardStore((state) => state.deleteBookmark);
  const enableAnimations = useDashboardStore((state) => state.settings.enableAnimations);

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <motion.div
      whileHover={enableAnimations ? { scale: 1.03, y: -2 } : undefined}
      whileTap={enableAnimations ? { scale: 0.98 } : undefined}
      className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/15 dark:border-white/10 hover:border-indigo-400/50 hover:bg-white/20 transition-all shadow-sm cursor-pointer overflow-hidden text-center light:bg-white/70 light:border-slate-200 light:hover:bg-white light:shadow-slate-200/60"
    >
      {/* Delete button on hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          deleteBookmark(bookmark.id);
        }}
        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-sm"
        title="Delete bookmark"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      <a
        href={bookmark.url}
        target="_self"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center w-full h-full gap-2 text-decoration-none"
      >
        <div className="w-10 h-10 rounded-xl bg-white/10 light:bg-slate-100 flex items-center justify-center p-2 border border-white/10 light:border-slate-200 shadow-inner group-hover:scale-105 transition-transform">
          {bookmark.icon && !imgError ? (
            <img
              src={bookmark.icon}
              alt={bookmark.title}
              onError={() => setImgError(true)}
              className="w-6 h-6 object-contain rounded-sm"
              loading="lazy"
            />
          ) : (
            <Globe className="w-5 h-5 text-indigo-300 light:text-indigo-600" />
          )}
        </div>

        <div className="w-full px-1">
          <span className="block text-xs font-semibold text-white/90 light:text-slate-800 truncate">
            {bookmark.title}
          </span>
          <span className="block text-[10px] text-white/50 light:text-slate-500 truncate">
            {getDomain(bookmark.url)}
          </span>
        </div>
      </a>
    </motion.div>
  );
};
