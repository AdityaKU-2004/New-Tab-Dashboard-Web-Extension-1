import React, { useState } from 'react';
import { Bookmark, BookmarkFolder } from '../../types';
import { useDashboardStore } from '../../store/useDashboardStore';
import {
  Globe,
  Star,
  Zap,
  Trash2,
  Edit3,
  ExternalLink,
  Tag as TagIcon,
  Folder as FolderIcon
} from 'lucide-react';

interface SmartLinkCardProps {
  bookmark: Bookmark;
  folders: BookmarkFolder[];
  onEdit: (bookmark: Bookmark) => void;
  index: number;
  total: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const SmartLinkCard: React.FC<SmartLinkCardProps> = ({
  bookmark,
  folders,
  onEdit,
  index,
  total,
  onMoveUp,
  onMoveDown
}) => {
  const [imgError, setImgError] = useState(false);
  const deleteBookmark = useDashboardStore((state) => state.deleteBookmark);
  const recordBookmarkClick = useDashboardStore((state) => state.recordBookmarkClick);
  const toggleFavoriteBookmark = useDashboardStore((state) => state.toggleFavoriteBookmark);
  const toggleQuickLinkBookmark = useDashboardStore((state) => state.toggleQuickLinkBookmark);

  const safeFolders = Array.isArray(folders) ? folders : [];
  const folder = safeFolders.find((f) => f.id === bookmark.folderId || f.name === bookmark.category);

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const formatLastUsed = (timestamp?: number) => {
    if (!timestamp) return null;
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleOpenLink = () => {
    recordBookmarkClick(bookmark.id);
  };

  return (
    <div className="group relative bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/60 rounded-lg p-3.5 transition-all flex flex-col justify-between gap-3 text-xs font-mono shadow-sm hover:shadow-md">
      {/* Card Header: Icon, Title, Domain, Star & QuickLink Toggles */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded bg-[#0D1117] border border-[#30363D] flex items-center justify-center shrink-0 p-1.5">
            {bookmark.icon && !imgError ? (
              <img
                src={bookmark.icon}
                alt={bookmark.title}
                onError={() => setImgError(true)}
                className="w-5 h-5 object-contain"
                loading="lazy"
              />
            ) : (
              <Globe className="w-4 h-4 text-[#8B949E]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenLink}
              className="font-bold text-[#E6EDF3] hover:text-[#58A6FF] transition-colors truncate block text-xs"
            >
              {bookmark.title}
            </a>
            <span className="text-[10px] text-[#8B949E] truncate block mt-0.5">
              {getDomain(bookmark.url)}
            </span>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* QuickLink Badge / Button */}
          <button
            type="button"
            onClick={() => toggleQuickLinkBookmark(bookmark.id)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              bookmark.isQuickLink
                ? 'text-[#D29922] bg-[#D29922]/10 border border-[#D29922]/30'
                : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#30363D]/50'
            }`}
            title={bookmark.isQuickLink ? 'Remove from Quick Links' : 'Add to Quick Links'}
          >
            <Zap className={`w-3.5 h-3.5 ${bookmark.isQuickLink ? 'fill-current' : ''}`} />
          </button>

          {/* Favorite Star Button */}
          <button
            type="button"
            onClick={() => toggleFavoriteBookmark(bookmark.id)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              bookmark.favorite
                ? 'text-[#E3B341] bg-[#E3B341]/10 border border-[#E3B341]/30'
                : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#30363D]/50'
            }`}
            title={bookmark.favorite ? 'Remove Favorite' : 'Mark as Favorite'}
          >
            <Star className={`w-3.5 h-3.5 ${bookmark.favorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Description if present */}
      {bookmark.description && (
        <p className="text-[11px] text-[#8B949E] line-clamp-2 leading-relaxed">
          {bookmark.description}
        </p>
      )}

      {/* Tags & Folder Badge */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {folder && (
          <span className="text-[10px] bg-[#1C212B] text-[#58A6FF] border border-[#30363D] px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
            <FolderIcon className="w-2.5 h-2.5" />
            {folder.name}
          </span>
        )}

        {bookmark.tags &&
          bookmark.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-[#0D1117] text-[#8B949E] border border-[#30363D] px-1.5 py-0.5 rounded flex items-center gap-0.5"
            >
              <TagIcon className="w-2.5 h-2.5 text-[#58A6FF]/70" />#{tag}
            </span>
          ))}
      </div>

      {/* Footer Meta & Hover Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[#30363D]/60 text-[10px] text-[#8B949E]">
        <div className="flex items-center gap-2">
          {bookmark.visitCount !== undefined && bookmark.visitCount > 0 && (
            <span>{bookmark.visitCount} visits</span>
          )}
          {bookmark.lastUsedAt && (
            <span className="text-[#8B949E]/80">• {formatLastUsed(bookmark.lastUsedAt)}</span>
          )}
        </div>

        {/* Hover Action Bar */}
        <div className="flex items-center gap-1">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenLink}
            className="p-1 rounded text-[#8B949E] hover:text-[#58A6FF] hover:bg-[#1C212B] transition-colors cursor-pointer"
            title="Open in new tab"
          >
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={() => onEdit(bookmark)}
            className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C212B] transition-colors cursor-pointer"
            title="Edit bookmark"
          >
            <Edit3 className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => deleteBookmark(bookmark.id)}
            className="p-1 rounded text-[#8B949E] hover:text-[#F85149] hover:bg-[#1C212B] transition-colors cursor-pointer"
            title="Delete bookmark"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
