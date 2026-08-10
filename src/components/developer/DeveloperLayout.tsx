import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useGitHubStore } from '../../store/useGitHubStore';
import { DeveloperSidebar, DeveloperTab } from './DeveloperSidebar';
import { DeveloperTopBar } from './DeveloperTopBar';
import { DeveloperNotes } from './DeveloperNotes';
import { DeveloperFocusTimer } from './DeveloperFocusTimer';
import { TodoList } from '../todo/TodoList';
import { SmartLinkManager } from './SmartLinkManager';
import { DailyBrief } from './DailyBrief';
import { RecentTabsList } from '../recentTabs/RecentTabsList';
import { SettingsDrawer } from '../settings/SettingsDrawer';
import { GitHubDashboard, GitHubSubTab } from './github/GitHubDashboard';
import { GitHubDailyTasks } from './github/GitHubDailyTasks';
import { UnreadGmailWidget } from '../gmail/UnreadGmailWidget';
import { DeveloperCommandPalette } from './DeveloperCommandPalette';

export const DeveloperLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DeveloperTab>('home');
  const [gitSubTab, setGitSubTab] = useState<GitHubSubTab>('repos');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Initialize stored GitHub token on Developer layout mount
  useEffect(() => {
    useGitHubStore.getState().initToken();
  }, []);

  // Global shortcut (Ctrl+K or Cmd+K) for Command Palette in Developer layout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (tab: DeveloperTab, subTab?: GitHubSubTab) => {
    setActiveTab(tab);
    if (subTab) {
      setGitSubTab(subTab);
    }
  };

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
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto custom-scrollbar">
          {activeTab === 'home' && (
            <>
              {/* Daily Brief - Primary Dashboard Section */}
              <DailyBrief onNavigate={handleNavigate} />

              {/* Unread Gmail & Daily Tasks Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7">
                  <GitHubDailyTasks />
                </div>
                <div className="lg:col-span-5">
                  <UnreadGmailWidget />
                </div>
              </div>

              {/* Secondary Productivity Modules (Notes & Focus Timer) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DeveloperNotes />
                <DeveloperFocusTimer />
              </div>
            </>
          )}

          {/* Module Views */}
          {activeTab === 'git' && <GitHubDashboard initialSubTab={gitSubTab} />}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7">
                  <GitHubDailyTasks />
                </div>
                <div className="lg:col-span-5">
                  <UnreadGmailWidget />
                </div>
              </div>
              <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
                <TodoList />
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && <SmartLinkManager />}

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

      {/* Developer Command Palette */}
      <DeveloperCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};
