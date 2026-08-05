import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { AnimatedButton } from '../ui/AnimatedButton';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Plus, Globe, Tag } from 'lucide-react';

export const AddBookmarkModal: React.FC = () => {
  const isOpen = useDashboardStore((state) => state.isAddBookmarkModalOpen);
  const setOpen = useDashboardStore((state) => state.setAddBookmarkModalOpen);
  const addBookmark = useDashboardStore((state) => state.addBookmark);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    addBookmark(title.trim() || url.trim(), url.trim(), category.trim());
    setTitle('');
    setUrl('');
    setCategory('General');
    setOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Add New Bookmark">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 light:text-slate-600 mb-1.5">
            Title
          </label>
          <input
            type="text"
            placeholder="e.g. GitHub Dashboard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/10 dark:bg-slate-900/50 rounded-xl border border-white/15 dark:border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 light:bg-slate-100 light:text-slate-900 light:placeholder-slate-400 light:border-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 light:text-slate-600 mb-1.5">
            URL *
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 w-4 h-4 text-white/40 light:text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. https://github.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-white/10 dark:bg-slate-900/50 rounded-xl border border-white/15 dark:border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 light:bg-slate-100 light:text-slate-900 light:placeholder-slate-400 light:border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 light:text-slate-600 mb-1.5">
            Category (Optional)
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-3 w-4 h-4 text-white/40 light:text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Work, AI, Social"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-white/10 dark:bg-slate-900/50 rounded-xl border border-white/15 dark:border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 light:bg-slate-100 light:text-slate-900 light:placeholder-slate-400 light:border-slate-300"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 light:border-slate-200">
          <AnimatedButton type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </AnimatedButton>
          <AnimatedButton type="submit" variant="primary">
            <Plus className="w-4 h-4 mr-1.5" /> Save Bookmark
          </AnimatedButton>
        </div>
      </form>
    </Modal>
  );
};
