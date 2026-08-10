import React, { useState, useEffect } from 'react';
import { Bookmark } from '../../types';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Globe, Tag, Folder, AlignLeft, Star, Zap, Check, X } from 'lucide-react';

interface EditBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkToEdit?: Bookmark | null;
}

export const EditBookmarkModal: React.FC<EditBookmarkModalProps> = ({
  isOpen,
  onClose,
  bookmarkToEdit
}) => {
  const rawFolders = useDashboardStore((state) => state.folders);
  const folders = Array.isArray(rawFolders) ? rawFolders : [];
  const addBookmark = useDashboardStore((state) => state.addBookmark);
  const updateBookmark = useDashboardStore((state) => state.updateBookmark);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [isQuickLink, setIsQuickLink] = useState(false);

  useEffect(() => {
    if (bookmarkToEdit) {
      setTitle(bookmarkToEdit.title || '');
      setUrl(bookmarkToEdit.url || '');
      setDescription(bookmarkToEdit.description || '');
      setFolderId(bookmarkToEdit.folderId || '');
      setTagsInput(bookmarkToEdit.tags ? bookmarkToEdit.tags.join(', ') : '');
      setFavorite(!!bookmarkToEdit.favorite);
      setIsQuickLink(!!bookmarkToEdit.isQuickLink);
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setFolderId(folders[0]?.id || '');
      setTagsInput('');
      setFavorite(false);
      setIsQuickLink(false);
    }
  }, [bookmarkToEdit, isOpen, folders]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const folder = folders.find((f) => f.id === folderId);
    const categoryName = folder ? folder.name : 'General';

    if (bookmarkToEdit) {
      updateBookmark(bookmarkToEdit.id, {
        title: title.trim() || url.trim(),
        url: url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`,
        description: description.trim(),
        folderId: folderId || undefined,
        category: categoryName,
        tags: parsedTags,
        favorite,
        isQuickLink
      });
    } else {
      addBookmark(
        title.trim() || url.trim(),
        url.trim(),
        categoryName,
        description.trim(),
        parsedTags,
        folderId || undefined,
        isQuickLink
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-mono text-xs">
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg w-full max-w-md p-5 shadow-2xl text-[#E6EDF3] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
          <h2 className="text-sm font-bold text-[#E6EDF3]">
            {bookmarkToEdit ? 'Edit Link' : 'Add New Link'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#8B949E] hover:text-[#E6EDF3] rounded hover:bg-[#30363D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8B949E] mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. GitHub Dashboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF]"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8B949E] mb-1">
              URL *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#8B949E]" />
              <input
                type="text"
                required
                placeholder="https://github.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0D1117] border border-[#30363D] rounded text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF]"
              />
            </div>
          </div>

          {/* Folder selection */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8B949E] mb-1">
              Folder
            </label>
            <div className="relative">
              <Folder className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#8B949E]" />
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0D1117] border border-[#30363D] rounded text-[#E6EDF3] focus:outline-none focus:border-[#58A6FF] cursor-pointer"
              >
                <option value="">No Folder (General)</option>
                {folders
                  .filter((f) => !f.parentId)
                  .flatMap((parent) => {
                    const children = folders.filter((child) => child.parentId === parent.id);
                    return [
                      <option key={parent.id} value={parent.id}>
                        {parent.name}
                      </option>,
                      ...children.map((child) => (
                        <option key={child.id} value={child.id}>
                          └ {parent.name} / {child.name}
                        </option>
                      ))
                    ];
                  })}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8B949E] mb-1">
              Description (Optional)
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#8B949E]" />
              <input
                type="text"
                placeholder="Short note about this link..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0D1117] border border-[#30363D] rounded text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF]"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8B949E] mb-1">
              Tags (Comma separated)
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#8B949E]" />
              <input
                type="text"
                placeholder="coding, work, research"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0D1117] border border-[#30363D] rounded text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF]"
              />
            </div>
          </div>

          {/* Checkbox Toggles */}
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-[#E6EDF3] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="rounded border-[#30363D] bg-[#0D1117] text-[#58A6FF] focus:ring-0 cursor-pointer"
              />
              <Star className="w-3.5 h-3.5 text-[#E3B341]" />
              <span>Favorite ★</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#E6EDF3] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isQuickLink}
                onChange={(e) => setIsQuickLink(e.target.checked)}
                className="rounded border-[#30363D] bg-[#0D1117] text-[#58A6FF] focus:ring-0 cursor-pointer"
              />
              <Zap className="w-3.5 h-3.5 text-[#D29922]" />
              <span>Quick Link</span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30363D]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#0D1117] hover:bg-[#1C212B] text-[#8B949E] border border-[#30363D] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#58A6FF] text-[#0D1117] font-bold hover:bg-[#58A6FF]/90 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{bookmarkToEdit ? 'Save Changes' : 'Add Link'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
