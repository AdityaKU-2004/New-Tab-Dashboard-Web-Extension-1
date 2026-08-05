import React, { useState } from 'react';
import { RecentTab } from '../../types';
import { Globe, Pin, X, ExternalLink } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

interface RecentTabItemProps {
  tab: RecentTab;
}

export const RecentTabItem: React.FC<RecentTabItemProps> = ({ tab }) => {
  const [imgError, setImgError] = useState(false);
  const removeRecentTab = useDashboardStore((state) => state.removeRecentTab);
  const togglePinRecentTab = useDashboardStore((state) => state.togglePinRecentTab);

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <motion.div
      layout
      className={cn(
        'group flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all backdrop-blur-md',
        tab.pinned
          ? 'bg-white/15 border-white/20 text-white light:bg-indigo-50 light:border-indigo-200'
          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white light:bg-white light:border-slate-200 light:text-slate-800'
      )}
    >
      <a
        href={tab.url}
        target="_self"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 flex-1 min-w-0"
      >
        <div className="w-7 h-7 rounded-lg bg-white/10 light:bg-slate-100 flex items-center justify-center flex-shrink-0 p-1 border border-white/10">
          {tab.favIconUrl && !imgError ? (
            <img
              src={tab.favIconUrl}
              alt={tab.title}
              onError={() => setImgError(true)}
              className="w-4 h-4 object-contain rounded-xs"
            />
          ) : (
            <Globe className="w-4 h-4 text-indigo-300 light:text-indigo-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span className="block text-xs font-medium text-white/90 light:text-slate-800 truncate group-hover:text-indigo-300 light:group-hover:text-indigo-600 transition-colors">
            {tab.title}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-white/50 light:text-slate-500">
            <span className="truncate">{getDomain(tab.url)}</span>
            <span>•</span>
            <span>{formatTimeAgo(tab.lastAccessed)}</span>
          </div>
        </div>
      </a>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => togglePinRecentTab(tab.id)}
          className={cn(
            'p-1 rounded text-white/50 hover:text-indigo-300 transition-colors cursor-pointer',
            tab.pinned && 'text-indigo-400 opacity-100'
          )}
          title={tab.pinned ? 'Unpin tab' : 'Pin tab'}
        >
          <Pin className={cn('w-3.5 h-3.5', tab.pinned && 'fill-indigo-400')} />
        </button>

        <button
          type="button"
          onClick={() => removeRecentTab(tab.id)}
          className="p-1 rounded text-white/50 hover:text-rose-400 transition-colors cursor-pointer"
          title="Close tab from list"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
