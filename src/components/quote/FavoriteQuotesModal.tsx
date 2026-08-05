import React from 'react';
import { Modal } from '../ui/Modal';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Heart, Trash2, Quote as QuoteIcon } from 'lucide-react';

export const FavoriteQuotesModal: React.FC = () => {
  const isOpen = useDashboardStore((state) => state.isFavoritesModalOpen);
  const setOpen = useDashboardStore((state) => state.setFavoritesModalOpen);
  const quotes = useDashboardStore((state) => state.quotes);
  const favoriteIds = useDashboardStore((state) => state.favoriteQuoteIds);
  const toggleFavorite = useDashboardStore((state) => state.toggleFavoriteQuote);

  const favoriteQuotes = quotes.filter((q) => favoriteIds.includes(q.id));

  return (
    <Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Favorite Quotes" maxWidth="lg">
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {favoriteQuotes.length > 0 ? (
          favoriteQuotes.map((q) => (
            <div
              key={q.id}
              className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-white/10 dark:bg-slate-900/60 border border-white/10 light:bg-slate-100 light:border-slate-200"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white light:text-slate-900 italic">“{q.text}”</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold text-indigo-400 light:text-indigo-600">— {q.author}</span>
                  {q.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white/70 light:bg-slate-200 light:text-slate-600">
                      {q.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleFavorite(q.id)}
                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 transition-colors cursor-pointer"
                title="Remove from favorites"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-white/50 light:text-slate-400">
            <Heart className="w-8 h-8 mx-auto mb-2 opacity-50 text-rose-400" />
            <p className="text-xs">No favorited quotes yet. Click the heart icon on any quote to save it!</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
