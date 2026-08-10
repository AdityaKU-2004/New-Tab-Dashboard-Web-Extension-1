import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useClock } from '../../hooks/useClock';
import { DeveloperTab } from './DeveloperSidebar';
import { GitHubCompactCard } from './github/GitHubCompactCard';
import { GitHubDailyTasks } from './github/GitHubDailyTasks';
import { UpcomingEventsSection } from './UpcomingEventsSection';
import {
  CheckSquare,
  Timer,
  Quote as QuoteIcon,
  RefreshCw,
  Star,
  ArrowRight,
  Check,
  Zap,
  Play
} from 'lucide-react';

interface DailyBriefProps {
  onNavigate: (tab: DeveloperTab) => void;
}

export const DailyBrief: React.FC<DailyBriefProps> = ({ onNavigate }) => {
  const { clockFormat12, userName } = useDashboardStore((state) => state.settings);
  const todos = useDashboardStore((state) => state.todos);
  const toggleTodo = useDashboardStore((state) => state.toggleTodo);

  const quotes = useDashboardStore((state) => state.quotes);
  const currentQuoteIndex = useDashboardStore((state) => state.currentQuoteIndex);
  const favoriteQuoteIds = useDashboardStore((state) => state.favoriteQuoteIds);
  const nextRandomQuote = useDashboardStore((state) => state.nextRandomQuote);
  const toggleFavoriteQuote = useDashboardStore((state) => state.toggleFavoriteQuote);

  const { hours, minutes, dayName, formattedDate } = useClock(clockFormat12);

  // Time-of-day greeting logic
  const currentHour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (currentHour >= 17 && currentHour < 21) {
    timeGreeting = 'Good evening';
  } else if (currentHour >= 21 || currentHour < 5) {
    timeGreeting = 'Good night';
  }

  const fullGreeting = userName ? `${timeGreeting}, ${userName}` : timeGreeting;

  // Goals / Todo stats
  const completedGoalsCount = todos.filter((t) => t.completed).length;
  const totalGoalsCount = todos.length;
  const goalsProgress =
    totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  // Quote data
  const currentQuote = quotes[currentQuoteIndex] || quotes[0];
  const isQuoteFavorite = currentQuote ? favoriteQuoteIds.includes(currentQuote.id) : false;

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 sm:p-6 font-mono select-none space-y-6">
      {/* 1. DAILY GREETING & DATE HEADER */}
      <div className="pb-5 border-b border-[#30363D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E6EDF3] tracking-tight">
            {fullGreeting}
          </h1>
          <p className="text-xs text-[#8B949E] mt-1 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
            <span>
              {dayName}, {formattedDate}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded bg-[#0D1117] border border-[#30363D] text-xs font-semibold text-[#58A6FF]">
            DAILY BRIEF
          </span>
        </div>
      </div>

      {/* DAILY TASKS SECTION - Directly after greeting */}
      <GitHubDailyTasks />

      {/* 3-COLUMN GRID: TODAY'S GOALS, FOCUS & GITHUB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* TODAY'S GOALS */}
        <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#58A6FF]" />
                <h2 className="text-xs font-bold text-[#E6EDF3]">Today's Goals</h2>
              </div>

              <span className="text-[11px] text-[#3FB950] font-semibold">
                {completedGoalsCount} / {totalGoalsCount} completed
              </span>
            </div>

            {/* Tasks List */}
            <div className="mt-3 space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
              {todos.length === 0 ? (
                <div className="text-xs text-[#8B949E] py-4 text-center">
                  No goals set for today.
                </div>
              ) : (
                todos.slice(0, 4).map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-center gap-2.5 p-2 rounded bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/50 text-xs transition-colors cursor-pointer group"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        todo.completed
                          ? 'bg-[#3FB950] border-[#3FB950] text-[#0D1117]'
                          : 'border-[#8B949E] group-hover:border-[#58A6FF]'
                      }`}
                    >
                      {todo.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <span
                      className={`truncate flex-1 ${
                        todo.completed ? 'line-through text-[#8B949E]' : 'text-[#E6EDF3]'
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Progress Bar & Open Tasks Button */}
          <div className="pt-3 border-t border-[#30363D]/60 space-y-2">
            <div className="w-full h-1.5 bg-[#161B22] rounded-full overflow-hidden border border-[#30363D]">
              <div
                className="h-full bg-[#3FB950] transition-all duration-300"
                style={{ width: `${goalsProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8B949E] font-semibold">{goalsProgress}% completed</span>
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="text-[#58A6FF] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <span>Manage Tasks</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* FOCUS */}
        <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#58A6FF]" />
                <h2 className="text-xs font-bold text-[#E6EDF3]">Focus</h2>
              </div>

              <span className="text-[10px] bg-[#1C212B] text-[#58A6FF] px-2 py-0.5 rounded border border-[#30363D]">
                POMODORO
              </span>
            </div>

            <div className="my-4 space-y-2">
              <div className="text-3xl font-black text-[#E6EDF3] tracking-tight">
                2h 15m <span className="text-xs font-normal text-[#8B949E]">/ 4h goal</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8B949E]">
                <span className="flex items-center gap-1 text-[#3FB950] font-bold">
                  <Zap className="w-3.5 h-3.5" /> 3 sessions completed
                </span>
                <span>• Current: Work Mode</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#30363D]/60 flex items-center justify-between">
            <span className="text-[11px] text-[#8B949E]">25m work / 5m break</span>
            <button
              type="button"
              onClick={() => onNavigate('focus')}
              className="px-3 py-1.5 rounded bg-[#58A6FF] text-[#0D1117] font-bold text-xs hover:bg-[#58A6FF]/90 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Open Focus</span>
            </button>
          </div>
        </div>

        {/* GITHUB COMPACT CARD */}
        <GitHubCompactCard onNavigate={onNavigate} />
      </div>

      {/* 3. UPCOMING REMINDERS & EVENTS */}
      <UpcomingEventsSection />

      {/* 4. DAILY QUOTE */}
      {currentQuote && (
        <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <QuoteIcon className="w-5 h-5 text-[#58A6FF] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs italic text-[#E6EDF3] leading-relaxed">
                "{currentQuote.text}"
              </p>
              {currentQuote.author && (
                <p className="text-[11px] text-[#8B949E] mt-1 font-semibold">
                  — {currentQuote.author}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => toggleFavoriteQuote(currentQuote.id)}
              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                isQuoteFavorite
                  ? 'text-[#E3B341] bg-[#E3B341]/10 border-[#E3B341]/30'
                  : 'text-[#8B949E] bg-[#161B22] border-[#30363D] hover:text-[#E6EDF3]'
              }`}
              title={isQuoteFavorite ? 'Favorited' : 'Favorite Quote'}
            >
              <Star className={`w-3.5 h-3.5 ${isQuoteFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={nextRandomQuote}
              className="p-1.5 rounded bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] transition-colors cursor-pointer"
              title="Next Quote"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
