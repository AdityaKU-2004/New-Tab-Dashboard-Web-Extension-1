import React, { useState } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useClock } from '../../hooks/useClock';
import { DeveloperSidebar, DeveloperTab } from './DeveloperSidebar';
import { DeveloperTopBar } from './DeveloperTopBar';
import { DeveloperNotes } from './DeveloperNotes';
import { DeveloperFocusTimer } from './DeveloperFocusTimer';
import { TodoList } from '../todo/TodoList';
import { BookmarkGrid } from '../bookmarks/BookmarkGrid';
import { RecentTabsList } from '../recentTabs/RecentTabsList';
import { SettingsDrawer } from '../settings/SettingsDrawer';
import {
  CheckSquare,
  PanelsTopLeft,
  Clock as ClockIcon,
  ExternalLink,
  Plus,
  StickyNote,
  Timer,
  Terminal,
  Bookmark
} from 'lucide-react';

export const DeveloperLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DeveloperTab>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { clockFormat12, userName } = useDashboardStore((state) => state.settings);
  const todos = useDashboardStore((state) => state.todos);
  const bookmarks = useDashboardStore((state) => state.bookmarks);
  const recentTabs = useDashboardStore((state) => state.recentTabs);
  const setAddBookmarkModalOpen = useDashboardStore((state) => state.setAddBookmarkModalOpen);

  const { hours, minutes, seconds, dayName, formattedDate, greeting } = useClock(clockFormat12);

  // Todo stats
  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Recent tabs stats
  const openTabsCount = recentTabs.length;

  return (
    <div className="min-h-screen w-full bg-[#0D1117] text-[#E6EDF3] font-mono flex flex-col lg:flex-row selection:bg-[#58A6FF] selection:text-[#0D1117]">
      {/* Persistent Left Sidebar */}
      <DeveloperSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <DeveloperTopBar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          activeTab={activeTab}
        />

        {/* Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto custom-scrollbar">
          {activeTab === 'home' && (
            <>
              {/* Header Greeting & Date */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E6EDF3] flex items-center gap-2">
                    <span>{greeting}</span>
                    {userName && <span className="text-[#58A6FF]">, {userName}</span>}
                  </div>
                  <div className="text-xs text-[#8B949E] mt-1 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
                    <span>{dayName}, {formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2.5 py-1 rounded bg-[#1C212B] border border-[#30363D] text-[11px] text-[#8B949E]">
                    v2.4.0 • STABLE
                  </span>
                </div>
              </div>

              {/* Productivity Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. TASK CARD */}
                <div
                  onClick={() => setActiveTab('tasks')}
                  className="bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/60 rounded-lg p-4 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#E6EDF3]">
                      <CheckSquare className="w-4 h-4 text-[#58A6FF]" />
                      <span>Tasks</span>
                    </div>
                    <span className="text-[10px] text-[#8B949E] group-hover:text-[#58A6FF] transition-colors">
                      View all →
                    </span>
                  </div>

                  <div className="my-4">
                    <div className="text-2xl font-extrabold text-[#E6EDF3]">
                      {completedCount} / {totalCount} <span className="text-xs font-normal text-[#8B949E]">completed</span>
                    </div>

                    <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden mt-3 border border-[#30363D]">
                      <div
                        className="h-full bg-[#3FB950] transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-[#8B949E] flex items-center justify-between">
                    <span>{pendingCount} pending</span>
                    <span className="text-[#3FB950] font-semibold">{progressPercent}%</span>
                  </div>
                </div>

                {/* 2. TABS CARD */}
                <div
                  onClick={() => setActiveTab('tabs')}
                  className="bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/60 rounded-lg p-4 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#E6EDF3]">
                      <PanelsTopLeft className="w-4 h-4 text-[#58A6FF]" />
                      <span>Recent Tabs</span>
                    </div>
                    <span className="text-[10px] text-[#8B949E] group-hover:text-[#58A6FF] transition-colors">
                      View all →
                    </span>
                  </div>

                  <div className="my-3">
                    <div className="text-2xl font-extrabold text-[#E6EDF3]">
                      {openTabsCount} <span className="text-xs font-normal text-[#8B949E]">open tabs</span>
                    </div>

                    {/* Preview list */}
                    <div className="mt-2 space-y-1">
                      {recentTabs.slice(0, 2).map((tab) => (
                        <div key={tab.id} className="text-[11px] text-[#8B949E] truncate flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#58A6FF]" />
                          <span className="truncate text-[#E6EDF3]/80">{tab.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-[#8B949E]">
                    Click to switch workspace tabs
                  </div>
                </div>

                {/* 3. CLOCK CARD */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#E6EDF3]">
                      <ClockIcon className="w-4 h-4 text-[#58A6FF]" />
                      <span>Clock</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C212B] text-[#58A6FF] border border-[#30363D]">
                      LOCAL
                    </span>
                  </div>

                  <div className="my-3">
                    <div className="text-3xl font-black text-[#E6EDF3] tracking-tight">
                      {hours}:{minutes}
                      <span className="text-sm font-normal text-[#58A6FF] ml-1">:{seconds}</span>
                    </div>
                    <div className="text-xs text-[#8B949E] mt-1 font-semibold">
                      {dayName}, {formattedDate}
                    </div>
                  </div>

                  <div className="text-[11px] text-[#8B949E]">
                    Developer System Time
                  </div>
                </div>
              </div>

              {/* Quick Links Section */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#30363D] mb-4">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-[#58A6FF]" />
                    <h2 className="text-sm font-bold text-[#E6EDF3]">Quick Links</h2>
                  </div>

                  <button
                    onClick={() => setAddBookmarkModalOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-[#1C212B] hover:bg-[#30363D] border border-[#30363D] text-[11px] text-[#8B949E] hover:text-[#E6EDF3] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Link</span>
                  </button>
                </div>

                {bookmarks.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#8B949E]">
                    No quick links yet. Click "Add Link" to create shortcuts.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {bookmarks.map((bm, index) => {
                      let shortcutKey = `⌘${index + 1}`;
                      return (
                        <a
                          key={bm.id}
                          href={bm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-md bg-[#0D1117] border border-[#30363D] hover:border-[#58A6FF] hover:bg-[#1C212B] transition-all group text-xs text-[#E6EDF3] truncate"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {bm.icon ? (
                              <img
                                src={bm.icon}
                                alt={bm.title}
                                className="w-4 h-4 rounded shrink-0 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Bookmark className="w-4 h-4 text-[#8B949E] shrink-0" />
                            )}
                            <span className="truncate font-medium group-hover:text-[#58A6FF] transition-colors">
                              {bm.title}
                            </span>
                          </div>

                          <span className="text-[10px] text-[#8B949E] font-mono shrink-0 ml-1">
                            {shortcutKey}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Productivity Modules Section (Notes & Focus Timer) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DeveloperNotes />
                <DeveloperFocusTimer />
              </div>
            </>
          )}

          {/* Module Views */}
          {activeTab === 'tasks' && (
            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
              <TodoList />
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
              <BookmarkGrid />
            </div>
          )}

          {activeTab === 'tabs' && (
            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
              <RecentTabsList />
            </div>
          )}

          {activeTab === 'notes' && <DeveloperNotes />}

          {activeTab === 'focus' && <DeveloperFocusTimer />}
        </main>
      </div>

      {/* Drawers & Modals */}
      <SettingsDrawer />
    </div>
  );
};
