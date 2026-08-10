import React, { useState, useEffect } from 'react';
import { storageService } from '../../../services/storageService';
import { useDashboardStore } from '../../../store/useDashboardStore';
import {
  CheckSquare,
  Square,
  Plus,
  ExternalLink,
  Trash2,
  Calendar,
  Tag,
  Clock,
  Link as LinkIcon,
  CheckCircle2,
  Filter,
  Video,
  Code2,
  FileText,
  Repeat,
  Sparkles,
  BookOpen
} from 'lucide-react';

export interface DailyTask {
  id: string;
  title: string;
  linkUrl?: string;
  category: 'Coding Practice' | 'YouTube Tutorial' | 'Documentation' | 'Project Task' | 'General Reminder';
  date: string; // YYYY-MM-DD
  isEveryday: boolean; // Everyday recurring reminder
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'developer_daily_tasks_links';

interface GitHubDailyTasksProps {
  selectedDate?: string;
}

export const GitHubDailyTasks: React.FC<GitHubDailyTasksProps> = ({ selectedDate }) => {
  const theme = useDashboardStore((state) => state.settings.theme);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [taskTitle, setTaskTitle] = useState('');
  const [taskLink, setTaskLink] = useState('');
  const [taskCategory, setTaskCategory] = useState<DailyTask['category']>('Coding Practice');
  const [taskDate, setTaskDate] = useState(selectedDate || todayStr);
  const [isEveryday, setIsEveryday] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setTaskDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const saved = await storageService.local.get<DailyTask[]>(STORAGE_KEY, []);
        if (Array.isArray(saved)) {
          setTasks(saved);
        }
      } catch (e) {
        console.error('Failed to load daily tasks:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, []);

  const saveTasks = async (newTasks: DailyTask[]) => {
    setTasks(newTasks);
    await storageService.local.set(STORAGE_KEY, newTasks);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    let formattedLink = taskLink.trim();
    if (formattedLink && !/^https?:\/\//i.test(formattedLink)) {
      formattedLink = `https://${formattedLink}`;
    }

    const newTask: DailyTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: taskTitle.trim(),
      linkUrl: formattedLink || undefined,
      category: taskCategory,
      date: taskDate || todayStr,
      isEveryday,
      completed: false,
      createdAt: Date.now()
    };

    const updated = [newTask, ...tasks];
    await saveTasks(updated);

    setTaskTitle('');
    setTaskLink('');
    setIsEveryday(false);
    setIsAddFormOpen(false);
  };

  const toggleTaskCompleted = async (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    await saveTasks(updated);
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    await saveTasks(updated);
  };

  // Helper to detect link type and return appropriate icon/style
  const getLinkMetadata = (url?: string) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      return {
        label: 'YouTube Video',
        icon: Video,
        color: 'text-[#FF4E4E] light:text-rose-600',
        bgColor: 'bg-[#FF4E4E]/10 light:bg-rose-50 border-[#FF4E4E]/30 light:border-rose-200'
      };
    }
    if (
      lower.includes('leetcode.com') ||
      lower.includes('github.com') ||
      lower.includes('hackerrank.com') ||
      lower.includes('codeforces.com')
    ) {
      return {
        label: 'Coding Link',
        icon: Code2,
        color: 'text-[#39D353] light:text-emerald-600',
        bgColor: 'bg-[#0E4429] light:bg-emerald-50 border-[#26A641] light:border-emerald-200'
      };
    }
    if (lower.includes('docs') || lower.includes('developer.mozilla.org')) {
      return {
        label: 'Documentation',
        icon: FileText,
        color: 'text-[#D2A8FF] light:text-purple-600',
        bgColor: 'bg-[#271052] light:bg-purple-50 border-[#A371F7] light:border-purple-200'
      };
    }
    return {
      label: 'External Link',
      icon: ExternalLink,
      color: 'text-[#58A6FF] light:text-blue-600',
      bgColor: 'bg-[#1C212B] light:bg-blue-50 border-[#388BFD] light:border-blue-200'
    };
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  const getCategoryStyle = (cat: DailyTask['category']) => {
    switch (cat) {
      case 'Coding Practice':
        return 'bg-[#0E4429] light:bg-emerald-100 text-[#39D353] light:text-emerald-800 border-[#26A641] light:border-emerald-300';
      case 'YouTube Tutorial':
        return 'bg-[#3C0F13] light:bg-rose-100 text-[#FF7B72] light:text-rose-800 border-[#F85149] light:border-rose-300';
      case 'Documentation':
        return 'bg-[#271052] light:bg-purple-100 text-[#D2A8FF] light:text-purple-800 border-[#A371F7] light:border-purple-300';
      case 'Project Task':
        return 'bg-[#1C212B] light:bg-blue-100 text-[#58A6FF] light:text-blue-800 border-[#388BFD] light:border-blue-300';
      default:
        return 'bg-[#341A00] light:bg-amber-100 text-[#F2CC60] light:text-amber-800 border-[#D29922] light:border-amber-300';
    }
  };

  const isCyberpunk = theme === 'cyberpunk';
  const isDeveloper = theme === 'developer';
  const isLight = theme === 'light';

  const containerClass = isCyberpunk
    ? 'bg-[#080d1a]/90 border border-[#00f3ff]/40 shadow-[0_0_15px_rgba(0,243,255,0.15)] text-[#00f3ff]'
    : isDeveloper
    ? 'bg-[#0D1117] border border-[#30363D] text-[#E6EDF3]'
    : isLight
    ? 'bg-white border border-slate-200 text-slate-900'
    : 'bg-slate-900/90 border border-slate-800 text-slate-100';

  const subHeaderBorder = isCyberpunk
    ? 'border-[#00f3ff]/30'
    : isDeveloper
    ? 'border-[#30363D]'
    : isLight
    ? 'border-slate-200'
    : 'border-slate-800';

  const badgeClass = isCyberpunk
    ? 'bg-[#00f3ff]/10 border border-[#00f3ff]/40 text-[#00f3ff]'
    : isDeveloper
    ? 'bg-[#161B22] border border-[#30363D] text-[#8B949E]'
    : isLight
    ? 'bg-slate-100 border border-slate-200 text-slate-600'
    : 'bg-slate-800 border border-slate-700 text-slate-300';

  const titleTextClass = isCyberpunk
    ? 'text-[#00f3ff]'
    : isDeveloper
    ? 'text-[#E6EDF3]'
    : isLight
    ? 'text-slate-900'
    : 'text-slate-100';

  const subTextClass = isCyberpunk
    ? 'text-[#00f3ff]/70'
    : isDeveloper
    ? 'text-[#8B949E]'
    : isLight
    ? 'text-slate-500'
    : 'text-slate-400';

  const addButtonClass = isCyberpunk
    ? 'bg-[#ff0055] hover:bg-[#ff2a75] border border-[#ff0055] text-white shadow-[0_0_10px_rgba(255,0,85,0.4)]'
    : isDeveloper
    ? 'bg-[#238636] hover:bg-[#2EA043] border border-[#3FB950] text-white'
    : isLight
    ? 'bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white'
    : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white';

  const formBgClass = isCyberpunk
    ? 'bg-[#0f172a]/95 border border-[#00f3ff]/50 shadow-[0_0_12px_rgba(0,243,255,0.2)]'
    : isDeveloper
    ? 'bg-[#161B22] border border-[#58A6FF]/40'
    : isLight
    ? 'bg-slate-50 border border-blue-300'
    : 'bg-slate-800/90 border border-indigo-500/30';

  const inputClass = isCyberpunk
    ? 'bg-[#050811] border border-[#00f3ff]/40 text-[#00f3ff] placeholder-[#00f3ff]/40 focus:outline-none focus:border-[#ff0055]'
    : isDeveloper
    ? 'bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] focus:outline-none focus:border-[#58A6FF]'
    : isLight
    ? 'bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500'
    : 'bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500';

  const taskCardClass = (completed: boolean) => {
    if (completed) {
      return isCyberpunk
        ? 'border-[#00f3ff]/20 bg-[#080d1a]/40 text-[#00f3ff]/50 opacity-60'
        : isDeveloper
        ? 'border-[#30363D]/60 bg-[#161B22]/40 opacity-70'
        : isLight
        ? 'border-slate-200 bg-slate-100/60 opacity-70'
        : 'border-slate-800 bg-slate-900/40 opacity-70';
    }
    return isCyberpunk
      ? 'bg-[#0c1427]/80 border border-[#00f3ff]/40 hover:border-[#ff0055]/80 text-[#00f3ff]'
      : isDeveloper
      ? 'bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/50 text-[#E6EDF3]'
      : isLight
      ? 'bg-slate-50/80 border border-slate-200 hover:border-blue-400 text-slate-800'
      : 'bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 text-slate-100';
  };

  return (
    <div className={`${containerClass} rounded-lg p-4 sm:p-5 font-mono space-y-4 shadow-sm transition-colors`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${subHeaderBorder}`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 ${badgeClass} rounded-lg`}>
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${titleTextClass} flex items-center gap-2`}>
              <span>Daily Tasks & Learning Reminders</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeClass}`}>
                {pendingCount} pending / {completedCount} done
              </span>
            </h3>
            <p className={`text-[11px] ${subTextClass}`}>
              Add everyday reminders, coding problem links, YouTube tutorials & reference docs
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className={`px-3 py-1.5 rounded-md ${addButtonClass} font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-xs`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task with Link</span>
        </button>
      </div>

      {/* Quick Add Form */}
      {isAddFormOpen && (
        <form
          onSubmit={handleAddTask}
          className={`p-4 ${formBgClass} rounded-lg space-y-3 animate-fadeIn`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#F2CC60] light:text-amber-500" />
              <span>Create Daily Task / Link Reminder</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className={`${subTextClass} hover:underline text-[11px] cursor-pointer`}
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Task Title */}
            <div>
              <label className={`text-[10px] font-bold ${subTextClass} mb-1 block`}>
                Task Description / Reminder Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Solve 2 LeetCode Medium problems, or Watch System Design YouTube video"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className={`w-full px-3 py-2 ${inputClass} rounded`}
              />
            </div>

            {/* Link URL & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] font-bold ${subTextClass} mb-1 flex items-center gap-1`}>
                  <LinkIcon className="w-3 h-3 text-[#58A6FF]" />
                  <span>Attach Link (YouTube, LeetCode, GitHub, Docs)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=... or https://leetcode.com/..."
                  value={taskLink}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTaskLink(val);
                    if (val.includes('youtube.com') || val.includes('youtu.be')) {
                      setTaskCategory('YouTube Tutorial');
                    } else if (val.includes('leetcode.com') || val.includes('github.com')) {
                      setTaskCategory('Coding Practice');
                    } else if (val.includes('docs') || val.includes('mdn')) {
                      setTaskCategory('Documentation');
                    }
                  }}
                  className={`w-full px-3 py-2 ${inputClass} rounded`}
                />
              </div>

              <div>
                <label className={`text-[10px] font-bold ${subTextClass} mb-1 flex items-center gap-1`}>
                  <Tag className="w-3 h-3 text-[#D2A8FF]" />
                  <span>Category</span>
                </label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as DailyTask['category'])}
                  className={`w-full px-3 py-2 ${inputClass} rounded cursor-pointer`}
                >
                  <option value="Coding Practice" className="bg-slate-900 text-white">💻 Coding Practice</option>
                  <option value="YouTube Tutorial" className="bg-slate-900 text-white">📺 YouTube Tutorial</option>
                  <option value="Documentation" className="bg-slate-900 text-white">📚 Documentation</option>
                  <option value="Project Task" className="bg-slate-900 text-white">🚀 Project Task</option>
                  <option value="General Reminder" className="bg-slate-900 text-white">📌 General Reminder</option>
                </select>
              </div>
            </div>

            {/* Date & Everyday Reminder Toggle */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div>
                <label className={`text-[10px] font-bold ${subTextClass} mb-1 flex items-center gap-1`}>
                  <Calendar className="w-3 h-3 text-[#3FB950]" />
                  <span>Target Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className={`px-3 py-1.5 ${inputClass} rounded`}
                />
              </div>

              <div className="flex items-center gap-2 mt-4 sm:mt-5">
                <input
                  type="checkbox"
                  id="isEveryday"
                  checked={isEveryday}
                  onChange={(e) => setIsEveryday(e.target.checked)}
                  className="w-4 h-4 rounded border-[#30363D] bg-transparent text-[#3FB950] focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="isEveryday"
                  className={`text-xs ${titleTextClass} font-bold flex items-center gap-1.5 cursor-pointer`}
                >
                  <Repeat className="w-3.5 h-3.5 text-[#F2CC60]" />
                  <span>Everyday Practice / Recurring Reminder</span>
                </label>
              </div>
            </div>
          </div>

          <div className={`flex justify-end gap-2 pt-2 border-t ${subHeaderBorder}`}>
            <button
              type="submit"
              disabled={!taskTitle.trim()}
              className={`px-4 py-1.5 rounded ${addButtonClass} font-bold text-xs transition-colors cursor-pointer disabled:opacity-50`}
            >
              Save Daily Task
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          <span className={`text-[10px] ${subTextClass} font-bold flex items-center gap-1 mr-1`}>
            <Filter className="w-3 h-3" /> Status:
          </span>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? isCyberpunk
                  ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/60'
                  : 'bg-[#1C212B] light:bg-blue-50 text-[#58A6FF] light:text-blue-700 border border-[#58A6FF]/40'
                : `${subTextClass} hover:underline`
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
              filterStatus === 'pending'
                ? isCyberpunk
                  ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/60'
                  : 'bg-[#1C212B] light:bg-amber-50 text-[#D29922] light:text-amber-700 border border-[#D29922]/40'
                : `${subTextClass} hover:underline`
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
              filterStatus === 'completed'
                ? isCyberpunk
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/60'
                  : 'bg-[#1C212B] light:bg-emerald-50 text-[#3FB950] light:text-emerald-700 border border-[#3FB950]/40'
                : `${subTextClass} hover:underline`
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`px-2 py-1 ${inputClass} rounded text-[10px] cursor-pointer`}
        >
          <option value="all" className="bg-slate-900 text-white">All Categories</option>
          <option value="Coding Practice" className="bg-slate-900 text-white">Coding Practice</option>
          <option value="YouTube Tutorial" className="bg-slate-900 text-white">YouTube Tutorial</option>
          <option value="Documentation" className="bg-slate-900 text-white">Documentation</option>
          <option value="Project Task" className="bg-slate-900 text-white">Project Task</option>
          <option value="General Reminder" className="bg-slate-900 text-white">General Reminder</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className={`p-6 text-center text-xs ${subTextClass} ${badgeClass} rounded-lg`}>
            Loading daily tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className={`p-8 text-center ${badgeClass} rounded-lg space-y-2`}>
            <BookOpen className={`w-8 h-8 ${subTextClass} mx-auto`} />
            <p className={`text-xs ${titleTextClass} font-bold`}>No daily tasks or reminders</p>
            <p className={`text-[11px] ${subTextClass}`}>
              {tasks.length === 0
                ? 'Click "Add Task with Link" above to add daily coding challenges, YouTube learning links, or project reminders.'
                : 'No tasks match your filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const linkMeta = getLinkMetadata(task.linkUrl);
              const LinkIconComp = linkMeta?.icon || ExternalLink;

              return (
                <div
                  key={task.id}
                  className={`p-3.5 ${taskCardClass(
                    task.completed
                  )} rounded-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group`}
                >
                  {/* Task details */}
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTaskCompleted(task.id)}
                      className="mt-0.5 text-[#8B949E] hover:text-[#3FB950] cursor-pointer transition-colors shrink-0"
                      title={task.completed ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-[#3FB950]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#8B949E]" />
                      )}
                    </button>

                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            task.completed
                              ? 'line-through opacity-60'
                              : `${titleTextClass}`
                          }`}
                        >
                          {task.title}
                        </span>

                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${getCategoryStyle(
                            task.category
                          )}`}
                        >
                          {task.category}
                        </span>

                        {task.isEveryday && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#341A00] light:bg-amber-100 text-[#F2CC60] light:text-amber-800 border-[#D29922] light:border-amber-300 font-bold flex items-center gap-1">
                            <Repeat className="w-2.5 h-2.5" />
                            <span>Everyday</span>
                          </span>
                        )}
                      </div>

                      {/* Date & Link info */}
                      <div className={`flex flex-wrap items-center gap-3 text-[10px] ${subTextClass}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {task.date}
                        </span>

                        {task.linkUrl && linkMeta && (
                          <a
                            href={task.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${linkMeta.bgColor} hover:underline font-mono truncate max-w-sm`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <LinkIconComp className={`w-3 h-3 ${linkMeta.color}`} />
                            <span className="truncate">{task.linkUrl}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {task.linkUrl && (
                      <a
                        href={task.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-2.5 py-1 ${badgeClass} hover:border-[#58A6FF] rounded text-[10px] font-bold flex items-center gap-1 transition-colors`}
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-[#8B949E] hover:text-[#FF7B72] hover:bg-[#21262D] rounded transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

