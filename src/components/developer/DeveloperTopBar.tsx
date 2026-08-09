import React from 'react';
import { Menu, Search, Settings, Terminal, Command } from 'lucide-react';
import { useDashboardStore, SEARCH_ENGINES } from '../../store/useDashboardStore';

interface DeveloperTopBarProps {
  onToggleMobileMenu: () => void;
  activeTab: string;
}

export const DeveloperTopBar: React.FC<DeveloperTopBarProps> = ({ onToggleMobileMenu, activeTab }) => {
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
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-[#8B949E] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${currentEngine.name} or type URL...`}
            className="w-full h-8 pl-8 pr-12 rounded-md bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] placeholder-[#8B949E] text-xs font-mono focus:outline-none focus:border-[#58A6FF] focus:ring-1 focus:ring-[#58A6FF] transition-all"
          />
          <div className="absolute right-2 px-1.5 py-0.5 rounded bg-[#161B22] border border-[#30363D] text-[10px] font-mono text-[#8B949E] hidden sm:flex items-center gap-0.5">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </form>

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
