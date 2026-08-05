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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 light:bg-slate-200 light:hover:bg-slate-300 text-xs font-semibold text-white light:text-slate-800 transition-colors border border-white/10 light:border-slate-300 cursor-pointer"
        title="Change search engine"
      >
        {ENGINE_ICONS[searchEngine]}
        <span className="hidden sm:inline">{current.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-44 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-white/15 dark:border-white/10 shadow-xl overflow-hidden p-1.5 z-50 text-white light:bg-white light:border-slate-200 light:text-slate-800"
          >
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-white/50 light:text-slate-400">
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
                  className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'hover:bg-white/10 light:hover:bg-slate-100 text-white/80 light:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
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
