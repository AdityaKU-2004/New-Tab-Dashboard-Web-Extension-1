import React from 'react';
import {
  House,
  Github,
  PanelsTopLeft,
  Bookmark,
  CheckSquare,
  StickyNote,
  Timer,
  Settings,
  Terminal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

export type DeveloperTab = 'home' | 'git' | 'tabs' | 'bookmarks' | 'tasks' | 'notes' | 'focus';

interface DeveloperSidebarProps {
  activeTab: DeveloperTab;
  setActiveTab: (tab: DeveloperTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const DeveloperSidebar: React.FC<DeveloperSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const setSettingsOpen = useDashboardStore((state) => state.setSettingsOpen);

  const navItems: Array<{ id: DeveloperTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'home', label: 'Home', icon: <House className="w-4 h-4" /> },
    { id: 'git', label: 'GitHub', icon: <Github className="w-4 h-4" /> },
    { id: 'tabs', label: 'Tabs', icon: <PanelsTopLeft className="w-4 h-4" /> },
    { id: 'bookmarks', label: 'Bookmarks', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes', icon: <StickyNote className="w-4 h-4" /> },
    { id: 'focus', label: 'Focus', icon: <Timer className="w-4 h-4" /> }
  ];

  const handleNavClick = (tab: DeveloperTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 flex flex-col justify-between bg-[#11161D] border-r border-[#30363D] transition-all duration-200 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div>
          <div className="h-14 px-4 flex items-center justify-between border-b border-[#30363D]">
            <div className="flex items-center gap-2.5 overflow-hidden select-none">
              <div className="p-1.5 rounded-lg bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20">
                <Terminal className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-sm text-[#E6EDF3] tracking-tight">
                    MySpace
                  </span>
                  <span className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">
                    IDE DASHBOARD
                  </span>
                </div>
              )}
            </div>

            {/* Collapse Toggle Button (Desktop) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center p-1 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22] border border-transparent hover:border-[#30363D] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 mt-2">
            {!isCollapsed && (
              <div className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase text-[#8B949E] tracking-widest">
                Workspace
              </div>
            )}

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-mono transition-all cursor-pointer group relative ${
                    isActive
                      ? 'bg-[#1C212B] text-[#58A6FF] font-semibold border-l-2 border-[#58A6FF]'
                      : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={`transition-colors ${isActive ? 'text-[#58A6FF]' : 'group-hover:text-[#E6EDF3]'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Settings) */}
        <div className="p-2 border-t border-[#30363D]">
          <button
            onClick={() => {
              setSettingsOpen(true);
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-mono text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22] transition-colors cursor-pointer group"
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings className="w-4 h-4 text-[#8B949E] group-hover:text-[#E6EDF3] transition-colors" />
            {!isCollapsed && <span className="truncate">Settings</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
