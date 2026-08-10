import React from 'react';
import { Menu, Search, Settings, Terminal, Command } from 'lucide-react';
import { useDashboardStore, SEARCH_ENGINES } from '../../store/useDashboardStore';

interface DeveloperTopBarProps {
  onToggleMobileMenu: () => void;
  activeTab: string;
  onOpenCommandPalette?: () => void;
}

export const DeveloperTopBar: React.FC<DeveloperTopBarProps> = ({
  onToggleMobileMenu,
  activeTab,
  onOpenCommandPalette
}) => {
  const setSettingsOpen = useDashboardStore((state) => state.setSettingsOpen);
  const searchEngine = useDashboardStore((state) => state.settings.searchEngine);
  const [query, setQuery] = React.useState('');

  const currentEngine = SEARCH_ENGINES[searchEngine] || SEARCH_ENGINES.google;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const searchUrl = `${currentEngine.url}${encodeURIComponent(query.trim())}`;
    window.open(searchUrl, '_blank');
  };

  return (
    <header className="h-14 bg-[#11161D] border-b border-[#30363D] px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Left Area: Mobile Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22] border border-[#30363D] transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#8B949E] hidden sm:inline">workspace</span>
          <span className="text-[#30363D] hidden sm:inline">/</span>
          <span className="text-[#58A6FF] font-semibold capitalize">{activeTab}</span>
        </div>
      </div>

      {/* Middle Area: IDE Command/Search Bar */}
      <div className="flex-1 max-w-md flex items-center gap-2">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-[#8B949E] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${currentEngine.name} or type URL...`}
              className="w-full h-8 pl-8 pr-3 rounded-md bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] placeholder-[#8B949E] text-xs font-mono focus:outline-none focus:border-[#58A6FF] focus:ring-1 focus:ring-[#58A6FF] transition-all"
            />
          </div>
        </form>

        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="h-8 px-2.5 rounded-md bg-[#161B22] hover:bg-[#1C212B] border border-[#30363D] text-[10px] font-mono text-[#8B949E] hover:text-[#E6EDF3] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            title="Open Developer Command Palette (Ctrl+K)"
          >
            <Command className="w-3 h-3 text-[#58A6FF]" />
            <span className="hidden sm:inline font-bold text-[#E6EDF3]">Cmd Palette</span>
            <span className="px-1 bg-[#0D1117] border border-[#30363D] rounded text-[9px]">⌘K</span>
          </button>
        )}
      </div>

      {/* Right Area: Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#161B22] hover:bg-[#1C212B] border border-[#30363D] text-xs font-mono text-[#E6EDF3] transition-colors cursor-pointer"
          title="Open Dashboard Settings"
        >
          <Settings className="w-3.5 h-3.5 text-[#8B949E]" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
