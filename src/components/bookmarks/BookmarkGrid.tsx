import React, { useState } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { BookmarkCard } from './BookmarkCard';
import { IconButton } from '../ui/IconButton';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Bookmark as BookmarkIcon, Plus, Folder } from 'lucide-react';
import { AddBookmarkModal } from './AddBookmarkModal';

export const BookmarkGrid: React.FC = () => {
  const bookmarks = useDashboardStore((state) => state.bookmarks);
  const setAddModalOpen = useDashboardStore((state) => state.setAddBookmarkModalOpen);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(bookmarks.map((b) => b.category || 'General').filter(Boolean)))];

  const filteredBookmarks =
    selectedCategory === 'All' ? bookmarks : bookmarks.filter((b) => (b.category || 'General') === selectedCategory);

  return (
    <DashboardCard
      title="Bookmarks"
      subtitle={`${bookmarks.length} saved links`}
      icon={BookmarkIcon}
      headerAction={
        <IconButton
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setAddModalOpen(true)}
          label="Add"
          variant="glass"
          size="sm"
          tooltip="Add new bookmark"
        />
      }
    >
      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white/70 light:bg-slate-200 light:text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2.5">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center text-white/50 light:text-slate-400 my-auto">
          <Folder className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs">No bookmarks in this folder</p>
        </div>
      )}

      <AddBookmarkModal />
    </DashboardCard>
  );
};
