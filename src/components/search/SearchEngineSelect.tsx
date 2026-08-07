import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Shield, Compass, Lock, Leaf, Globe, Video, Sparkles } from 'lucide-react';
import { SearchEngineId } from '../../types';
import { SEARCH_ENGINES } from '../../store/useDashboardStore';
import { useDashboardStore } from '../../store/useDashboardStore';
import { motion, AnimatePresence } from 'motion/react';

const ENGINE_ICONS: Record<SearchEngineId, React.ReactNode> = {
  google: <Search className="w-4 h-4 text-blue-400" />,
  duckduckgo: <Shield className="w-4 h-4 text-amber-500" />,
  bing: <Compass className="w-4 h-4 text-teal-400" />,
  brave: <Lock className="w-4 h-4 text-orange-400" />,
  ecosia: <Leaf className="w-4 h-4 text-emerald-400" />,
  yahoo: <Globe className="w-4 h-4 text-purple-400" />,
  youtube: <Video className="w-4 h-4 text-red-500" />,
  gemini: <Sparkles className="w-4 h-4 text-indigo-400" />
};

export const SearchEngineSelect: React.FC = () => {
  const { searchEngine } = useDashboardStore((state) => state.settings);
  const updateSettings = useDashboardStore((state) => state.updateSettings);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = SEARCH_ENGINES[searchEngine] || SEARCH_ENGINES.google;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-semibold text-slate-800 dark:text-white transition-colors border border-slate-300 dark:border-white/10 cursor-pointer shadow-sm"
        title="Change search engine"
      >
        {ENGINE_ICONS[searchEngine]}
        <span className="inline-block text-xs font-semibold">{current.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 backdrop-blur-xl border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden p-1.5 z-50 text-slate-800 dark:text-white"
          >
            <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-white/50">
              Search Engine
            </div>
            {(Object.keys(SEARCH_ENGINES) as SearchEngineId[]).map((engineId) => {
              const engine = SEARCH_ENGINES[engineId];
              const isSelected = engineId === searchEngine;
              return (
                <button
                  key={engineId}
                  type="button"
                  onClick={() => {
                    updateSettings({ searchEngine: engineId });
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-accent text-white font-semibold shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {ENGINE_ICONS[engineId]}
                    <span>{engine.name}</span>
                  </div>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
