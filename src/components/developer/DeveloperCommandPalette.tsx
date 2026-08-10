import React, { useState, useEffect, useRef } from 'react';
import {
  Command,
  Github,
  GitBranch,
  GitPullRequest,
  CircleDot,
  Bell,
  Settings,
  House,
  Bookmark,
  CheckSquare,
  StickyNote,
  Timer,
  ExternalLink,
  Search,
  X
} from 'lucide-react';
import { DeveloperTab } from './DeveloperSidebar';
import { GitHubSubTab } from './github/GitHubDashboard';
import { useDashboardStore } from '../../store/useDashboardStore';

interface DeveloperCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: DeveloperTab, subTab?: GitHubSubTab) => void;
}

export const DeveloperCommandPalette: React.FC<DeveloperCommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { settings, setSettingsOpen } = useDashboardStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || settings.theme !== 'developer') return null;

  const commands = [
    {
      id: 'open-github',
      label: 'Open GitHub',
      icon: <Github className="w-4 h-4 text-[#58A6FF]" />,
      action: () => {
        window.open('https://github.com', '_blank');
        onClose();
      }
    },
    {
      id: 'view-repos',
      label: 'View Repositories',
      icon: <GitBranch className="w-4 h-4 text-[#58A6FF]" />,
      action: () => {
        onNavigate('git', 'repos');
        onClose();
      }
    },
    {
      id: 'view-prs',
      label: 'View Pull Requests',
      icon: <GitPullRequest className="w-4 h-4 text-[#3FB950]" />,
      action: () => {
        onNavigate('git', 'prs');
        onClose();
      }
    },
    {
      id: 'view-issues',
      label: 'View Issues',
      icon: <CircleDot className="w-4 h-4 text-[#D29922]" />,
      action: () => {
        onNavigate('git', 'issues');
        onClose();
      }
    },
    {
      id: 'view-notifications',
      label: 'View Notifications',
      icon: <Bell className="w-4 h-4 text-[#F0883E]" />,
      action: () => {
        onNavigate('git', 'notifications');
        onClose();
      }
    },
    {
      id: 'nav-home',
      label: 'Go to Home Dashboard',
      icon: <House className="w-4 h-4 text-[#8B949E]" />,
      action: () => {
        onNavigate('home');
        onClose();
      }
    },
    {
      id: 'nav-bookmarks',
      label: 'Go to Smart Link Bookmarks',
      icon: <Bookmark className="w-4 h-4 text-[#8B949E]" />,
      action: () => {
        onNavigate('bookmarks');
        onClose();
      }
    },
    {
      id: 'nav-tasks',
      label: 'Go to Tasks',
      icon: <CheckSquare className="w-4 h-4 text-[#8B949E]" />,
      action: () => {
        onNavigate('tasks');
        onClose();
      }
    },
    {
      id: 'nav-notes',
      label: 'Go to Notes',
      icon: <StickyNote className="w-4 h-4 text-[#8B949E]" />,
      action: () => {
        onNavigate('notes');
        onClose();
      }
    },
    {
      id: 'nav-focus',
      label: 'Go to Focus Timer',
      icon: <Timer className="w-4 h-4 text-[#8B949E]" />,
      action: () => {
        onNavigate('focus');
        onClose();
      }
    },
    {
      id: 'open-settings',
      label: 'Open Dashboard Settings',
      icon: <Settings className="w-4 h-4 text-[#8B949E]" />,
      action: () => {
        setSettingsOpen(true);
        onClose();
      }
    }
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? (filteredCommands.length || 1) - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm font-mono">
      <div
        className="bg-[#161B22] border border-[#30363D] w-full max-w-lg rounded-lg shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Input */}
        <div className="p-3 border-b border-[#30363D] flex items-center gap-2">
          <Command className="w-4 h-4 text-[#58A6FF]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#8B949E] hover:text-[#E6EDF3] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of commands */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#8B949E]">
              No matching commands.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C212B] text-[#58A6FF] font-bold border border-[#58A6FF]/30'
                      : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#0D1117]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {cmd.icon}
                    <span>{cmd.label}</span>
                  </div>
                  <span className="text-[10px] text-[#8B949E]">Jump</span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3 py-2 bg-[#0D1117] border-t border-[#30363D] flex items-center justify-between text-[10px] text-[#8B949E]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>Developer IDE</span>
        </div>
      </div>
    </div>
  );
};
