import React, { useState } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { IconButton } from '../ui/IconButton';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Quote as QuoteIcon, RefreshCw, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FavoriteQuotesModal } from './FavoriteQuotesModal';

export const QuoteCard: React.FC = () => {
  const [isRotating, setIsRotating] = useState(false);
  const quotes = useDashboardStore((state) => state.quotes);
  const currentQuoteIndex = useDashboardStore((state) => state.currentQuoteIndex);
  const nextRandomQuote = useDashboardStore((state) => state.nextRandomQuote);
  const favoriteIds = useDashboardStore((state) => state.favoriteQuoteIds);
  const toggleFavorite = useDashboardStore((state) => state.toggleFavoriteQuote);
  const setFavoritesModalOpen = useDashboardStore((state) => state.setFavoritesModalOpen);
  const enableAnimations = useDashboardStore((state) => state.settings.enableAnimations);

  const currentQuote = quotes[currentQuoteIndex] || quotes[0];
  const isFavorite = currentQuote ? favoriteIds.includes(currentQuote.id) : false;

  const handleRefresh = () => {
    setIsRotating(true);
    nextRandomQuote();
    setTimeout(() => setIsRotating(false), 500);
  };

  return (
    <DashboardCard
      title="Daily Inspiration"
      icon={QuoteIcon}
      headerAction={
        <div className="flex items-center gap-1">
          <IconButton
            icon={<Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />}
            onClick={() => currentQuote && toggleFavorite(currentQuote.id)}
            variant="ghost"
            size="sm"
            tooltip={isFavorite ? 'Remove from favorites' : 'Favorite quote'}
          />
          <IconButton
            icon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => setFavoritesModalOpen(true)}
            variant="ghost"
            size="sm"
            tooltip="View favorite quotes"
          />
          <IconButton
            icon={
              <RefreshCw
                className={`w-3.5 h-3.5 transition-transform duration-500 ${isRotating ? 'rotate-180' : ''}`}
              />
            }
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            tooltip="New random quote"
          />
        </div>
      }
    >
      <div className="flex flex-col justify-between h-full py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote?.id || 'quote'}
            initial={enableAnimations ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col justify-center"
          >
            <blockquote className="text-sm sm:text-base font-medium italic text-white/95 light:text-slate-800 leading-relaxed">
              “{currentQuote?.text}”
            </blockquote>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 light:border-slate-200">
              <span className="text-xs font-semibold text-accent">
                — {currentQuote?.author}
              </span>

              {currentQuote?.category && (
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-accent-soft text-accent">
                  {currentQuote.category}
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <FavoriteQuotesModal />
    </DashboardCard>
  );
};
