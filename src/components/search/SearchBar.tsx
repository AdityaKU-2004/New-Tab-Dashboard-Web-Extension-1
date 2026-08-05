import React, { useState, useRef } from 'react';
import { SearchInput } from '../ui/SearchInput';
import { SearchEngineSelect } from './SearchEngineSelect';
import { useDashboardStore, SEARCH_ENGINES } from '../../store/useDashboardStore';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { GlassCard } from '../ui/GlassCard';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchEngine } = useDashboardStore((state) => state.settings);

  // Keyboard shortcut '/' to focus search input
  useKeyboardShortcut('/', () => {
    inputRef.current?.focus();
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const engine = SEARCH_ENGINES[searchEngine] || SEARCH_ENGINES.google;
    const targetUrl = `${engine.url}${encodeURIComponent(query.trim())}`;
    window.location.href = targetUrl;
  };

  return (
    <GlassCard className="p-3 sm:p-4 shadow-xl">
      <form onSubmit={handleSearch} className="flex items-center gap-3 w-full">
        <SearchEngineSelect />

        <div className="flex-1">
          <SearchInput
            autoFocusRef={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder={`Search ${SEARCH_ENGINES[searchEngine]?.name || 'the web'}...`}
            shortcutHint="/"
          />
        </div>
      </form>
    </GlassCard>
  );
};
