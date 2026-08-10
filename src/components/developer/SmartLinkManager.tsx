import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, BookmarkFolder } from '../../types';
import { useDashboardStore } from '../../store/useDashboardStore';
import { SmartLinkCard } from './SmartLinkCard';
import { EditBookmarkModal } from './EditBookmarkModal';
import {
  Bookmark as BookmarkIcon,
  Search,
  Plus,
  FolderPlus,
  Folder,
  Star,
  Clock,
  TrendingUp,
  Tag,
  Zap,
  Check,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

export const SmartLinkManager: React.FC = () => {
  const bookmarks = useDashboardStore((state) => state.bookmarks);
  const folders = useDashboardStore((state) => state.folders);
  const addFolder = useDashboardStore((state) => state.addFolder);
  const deleteFolder = useDashboardStore((state) => state.deleteFolder);
  const renameFolder = useDashboardStore((state) => state.renameFolder);
  const recordBookmarkClick = useDashboardStore((state) => state.recordBookmarkClick);
  const reorderBookmarks = useDashboardStore((state) => state.reorderBookmarks);

  // Filter & Search states
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modals & Editing state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  // New Folder creation inline input
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Folder renaming state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  // Keyboard shortcut: Ctrl + K or Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Collect all unique tags across bookmarks
  const allTags = Array.from(
    new Set(bookmarks.flatMap((b) => b.tags || []).filter(Boolean))
  );

  // Filtered bookmarks calculation
  let displayedBookmarks = [...bookmarks];

  if (selectedFilter === 'favorites') {
    displayedBookmarks = displayedBookmarks.filter((b) => b.favorite);
  } else if (selectedFilter === 'recent') {
    displayedBookmarks = displayedBookmarks
      .filter((b) => b.lastUsedAt)
      .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0));
  } else if (selectedFilter === 'most_visited') {
    displayedBookmarks = displayedBookmarks
      .filter((b) => b.visitCount && b.visitCount > 0)
      .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0));
  } else if (selectedFilter !== 'all') {
    // Filter by specific folderId or category name match
    displayedBookmarks = displayedBookmarks.filter(
      (b) =>
        b.folderId === selectedFilter ||
        (b.category && b.category.toLowerCase() === selectedFilter.toLowerCase())
    );
  }

  // Tag filter
  if (selectedTag) {
    displayedBookmarks = displayedBookmarks.filter(
      (b) => b.tags && b.tags.includes(selectedTag)
    );
  }

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    displayedBookmarks = displayedBookmarks.filter((b) => {
      const matchTitle = b.title.toLowerCase().includes(query);
      const matchUrl = b.url.toLowerCase().includes(query);
      const matchDesc = b.description?.toLowerCase().includes(query);
      const matchCategory = b.category?.toLowerCase().includes(query);
      const matchTags = b.tags?.some((t) => t.toLowerCase().includes(query));
      return matchTitle || matchUrl || matchDesc || matchCategory || matchTags;
    });
  }

  // Quick Links list
  const quickLinks = bookmarks.filter((b) => b.isQuickLink || b.favorite);

  // Folder helper handlers
  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  const handleStartRenameFolder = (f: BookmarkFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(f.id);
    setEditingFolderName(f.name);
  };

  const handleSaveRenameFolder = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editingFolderName.trim()) {
      renameFolder(id, editingFolderName.trim());
    }
    setEditingFolderId(null);
  };

  const handleAddLinkClick = () => {
    setEditingBookmark(null);
    setIsEditModalOpen(true);
  };

  const handleEditLinkClick = (bm: Bookmark) => {
    setEditingBookmark(bm);
    setIsEditModalOpen(true);
  };

  // Reorder links handler
  const handleMoveLink = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= displayedBookmarks.length) return;
    const reordered = [...displayedBookmarks];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    reorderBookmarks(reordered);
  };

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 sm:p-5 font-mono select-none space-y-5">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#30363D]">
        <div className="flex items-center gap-2">
          <BookmarkIcon className="w-5 h-5 text-[#58A6FF]" />
          <div>
            <h1 className="text-base font-bold text-[#E6EDF3] leading-none">
              Smart Link Manager
            </h1>
            <p className="text-[11px] text-[#8B949E] mt-1">
              Organize, tag, search, and access developer shortcuts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleAddLinkClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#58A6FF] text-[#0D1117] hover:bg-[#58A6FF]/90 font-bold text-xs transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT SIDEBAR: Folders & System Views */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main System Filters */}
          <div className="space-y-1 bg-[#0D1117] border border-[#30363D] rounded p-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setSelectedFilter('all');
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                selectedFilter === 'all' && !selectedTag
                  ? 'bg-[#1C212B] text-[#58A6FF] font-bold border border-[#58A6FF]/30'
                  : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookmarkIcon className="w-3.5 h-3.5" />
                <span>All Links</span>
              </div>
              <span className="text-[10px] bg-[#161B22] px-1.5 py-0.5 rounded text-[#8B949E]">
                {bookmarks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedFilter('favorites');
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                selectedFilter === 'favorites' && !selectedTag
                  ? 'bg-[#1C212B] text-[#E3B341] font-bold border border-[#E3B341]/30'
                  : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-[#E3B341]" />
                <span>Favorites</span>
              </div>
              <span className="text-[10px] bg-[#161B22] px-1.5 py-0.5 rounded text-[#8B949E]">
                {bookmarks.filter((b) => b.favorite).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedFilter('recent');
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                selectedFilter === 'recent' && !selectedTag
                  ? 'bg-[#1C212B] text-[#58A6FF] font-bold border border-[#58A6FF]/30'
                  : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Recently Used</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedFilter('most_visited');
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                selectedFilter === 'most_visited' && !selectedTag
                  ? 'bg-[#1C212B] text-[#3FB950] font-bold border border-[#3FB950]/30'
                  : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#3FB950]" />
                <span>Most Visited</span>
              </div>
            </button>
          </div>

          {/* Folders List */}
          <div className="bg-[#0D1117] border border-[#30363D] rounded p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8B949E] px-1 pb-1 border-b border-[#30363D]/60">
              <span>FOLDERS</span>
              <button
                type="button"
                onClick={() => setIsAddingFolder(true)}
                className="p-1 rounded text-[#58A6FF] hover:bg-[#1C212B] transition-colors cursor-pointer"
                title="Create New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Folder creation input */}
            {isAddingFolder && (
              <form onSubmit={handleCreateFolderSubmit} className="flex items-center gap-1.5 my-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-2 py-1 bg-[#161B22] border border-[#58A6FF] rounded text-xs text-[#E6EDF3] focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-1 text-[#3FB950] hover:bg-[#1C212B] rounded cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingFolder(false)}
                  className="p-1 text-[#F85149] hover:bg-[#1C212B] rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <div className="space-y-1 max-h-[220px] overflow-y-auto custom-scrollbar">
              {folders.map((f) => {
                const isSelected = selectedFilter === f.id;
                const linkCount = bookmarks.filter(
                  (b) => b.folderId === f.id || b.category === f.name
                ).length;

                if (editingFolderId === f.id) {
                  return (
                    <form
                      key={f.id}
                      onSubmit={(e) => handleSaveRenameFolder(f.id, e)}
                      className="flex items-center gap-1 my-1"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        className="w-full px-2 py-1 bg-[#161B22] border border-[#58A6FF] rounded text-xs text-[#E6EDF3] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="p-1 text-[#3FB950] hover:bg-[#1C212B] rounded cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </form>
                  );
                }

                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedFilter(f.id);
                      setSelectedTag(null);
                    }}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1C212B] text-[#58A6FF] font-bold border border-[#58A6FF]/30'
                        : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="w-3.5 h-3.5 text-[#58A6FF]/80 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] bg-[#161B22] px-1.5 py-0.5 rounded text-[#8B949E]">
                        {linkCount}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleStartRenameFolder(f, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-[#8B949E] hover:text-[#E6EDF3] transition-opacity cursor-pointer"
                        title="Rename folder"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFolder(f.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-[#8B949E] hover:text-[#F85149] transition-opacity cursor-pointer"
                        title="Delete folder"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT MAIN AREA: Search, Quick Links, Tags & Cards Grid */}
        <div className="lg:col-span-9 space-y-4">
          {/* Powerful Search Field */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#8B949E]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search title, URL, description, folder, tags... (Press Ctrl + K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-16 py-2 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#8B949E] hover:text-[#E6EDF3] text-xs cursor-pointer"
              >
                Clear
              </button>
            ) : (
              <span className="absolute right-3 top-2.5 text-[10px] bg-[#161B22] border border-[#30363D] px-1.5 py-0.5 rounded text-[#8B949E]">
                Ctrl + K
              </span>
            )}
          </div>

          {/* Quick Links Section */}
          {quickLinks.length > 0 && (
            <div className="bg-[#0D1117] border border-[#30363D] rounded p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#E6EDF3]">
                <Zap className="w-3.5 h-3.5 text-[#D29922]" />
                <span>QUICK LINKS</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {quickLinks.map((ql, idx) => (
                  <a
                    key={ql.id}
                    href={ql.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordBookmarkClick(ql.id)}
                    className="flex items-center justify-between p-2 rounded bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF] hover:bg-[#1C212B] transition-all group text-xs text-[#E6EDF3] truncate cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {ql.icon ? (
                        <img
                          src={ql.icon}
                          alt={ql.title}
                          className="w-3.5 h-3.5 rounded object-contain shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <BookmarkIcon className="w-3.5 h-3.5 text-[#8B949E] shrink-0" />
                      )}
                      <span className="truncate group-hover:text-[#58A6FF] transition-colors">
                        {ql.title}
                      </span>
                    </div>

                    <span className="text-[9px] text-[#8B949E] shrink-0 ml-1">
                      ⌘{idx + 1}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tags Bar */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
              <span className="text-[#8B949E] flex items-center gap-1 shrink-0 font-bold">
                <Tag className="w-3 h-3 text-[#58A6FF]" /> Tags:
              </span>
              {selectedTag && (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="px-2 py-0.5 rounded bg-[#F85149]/10 text-[#F85149] border border-[#F85149]/30 hover:bg-[#F85149]/20 transition-colors cursor-pointer shrink-0"
                >
                  Clear filter (#{selectedTag}) ✕
                </button>
              )}
              {allTags.map((t) => {
                const isActive = selectedTag === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTag(isActive ? null : t)}
                    className={`px-2 py-0.5 rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#58A6FF] text-[#0D1117] font-bold border-[#58A6FF]'
                        : 'bg-[#0D1117] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3] hover:border-[#8B949E]'
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
          )}

          {/* Links Grid */}
          {displayedBookmarks.length === 0 ? (
            <div className="text-center py-12 bg-[#0D1117] border border-[#30363D] rounded text-xs text-[#8B949E]">
              No links found matching criteria. Click "+ Add Link" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {displayedBookmarks.map((bookmark, idx) => (
                <SmartLinkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  folders={folders}
                  onEdit={handleEditLinkClick}
                  index={idx}
                  total={displayedBookmarks.length}
                  onMoveUp={() => handleMoveLink(idx, idx - 1)}
                  onMoveDown={() => handleMoveLink(idx, idx + 1)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit / Add Bookmark Modal */}
      <EditBookmarkModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        bookmarkToEdit={editingBookmark}
      />
    </div>
  );
};
