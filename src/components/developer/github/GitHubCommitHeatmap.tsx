import React, { useState, useMemo } from 'react';
import { useGitHubStore } from '../../../store/useGitHubStore';
import { Flame, Calendar, Trophy, Zap, Info, Filter } from 'lucide-react';

type TimeRange = '12' | '24' | '52'; // Weeks to display

interface DayData {
  dateStr: string; // YYYY-MM-DD
  dateObj: Date;
  count: number;
  level: number; // 0 to 4
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
}

export const GitHubCommitHeatmap: React.FC = () => {
  const { user, commits, events, repos, pullRequests, issues } = useGitHubStore();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('24');
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // Calculate daily contribution map
  const dailyActivityMap = useMemo(() => {
    const map = new Map<string, number>();

    // 1. Process recent commits
    if (commits && Array.isArray(commits)) {
      commits.forEach((c) => {
        if (c.date) {
          const dateStr = new Date(c.date).toISOString().split('T')[0];
          map.set(dateStr, (map.get(dateStr) || 0) + 1);
        }
      });
    }

    // 2. Process events
    if (events && Array.isArray(events)) {
      events.forEach((ev) => {
        if (ev.created_at) {
          const dateStr = new Date(ev.created_at).toISOString().split('T')[0];
          const increment = ev.type === 'PushEvent' ? (ev.payload?.commits?.length || 1) : 1;
          map.set(dateStr, (map.get(dateStr) || 0) + increment);
        }
      });
    }

    // 3. Process PRs and Issues updated timestamps
    if (pullRequests) {
      pullRequests.forEach((pr) => {
        if (pr.updated_at) {
          const dateStr = new Date(pr.updated_at).toISOString().split('T')[0];
          map.set(dateStr, (map.get(dateStr) || 0) + 1);
        }
      });
    }

    if (issues) {
      issues.forEach((iss) => {
        if (iss.updated_at) {
          const dateStr = new Date(iss.updated_at).toISOString().split('T')[0];
          map.set(dateStr, (map.get(dateStr) || 0) + 1);
        }
      });
    }

    // 4. Repo update timestamps
    if (repos) {
      repos.forEach((r) => {
        if (r.updated_at) {
          const dateStr = new Date(r.updated_at).toISOString().split('T')[0];
          if (!map.has(dateStr)) {
            map.set(dateStr, 1);
          }
        }
      });
    }

    return map;
  }, [commits, events, pullRequests, issues, repos]);

  // Generate calendar grid data for selected weeks count
  const numWeeks = parseInt(selectedRange, 10);

  const { weeksData, totalContributions, currentStreak, longestStreak, maxDaily } = useMemo(() => {
    const weeks: DayData[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the Sunday of the current week
    const currentDayOfWeek = today.getDay(); // 0 is Sunday
    const endDate = new Date(today);
    // End date is Saturday of current week to complete the week column
    endDate.setDate(today.getDate() + (6 - currentDayOfWeek));

    const totalDays = numWeeks * 7;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);

    let total = 0;
    let maxCount = 0;
    let currStreak = 0;
    let maxStreak = 0;
    let streakActive = true;

    // Build day list chronologically
    const allDays: DayData[] = [];
    const iter = new Date(startDate);

    while (iter <= endDate) {
      const dateStr = iter.toISOString().split('T')[0];
      const count = dailyActivityMap.get(dateStr) || 0;

      let level = 0;
      if (count >= 10) level = 4;
      else if (count >= 6) level = 3;
      else if (count >= 3) level = 2;
      else if (count >= 1) level = 1;

      const dayObj: DayData = {
        dateStr,
        dateObj: new Date(iter),
        count,
        level,
        dayOfWeek: iter.getDay()
      };

      allDays.push(dayObj);
      total += count;
      if (count > maxCount) maxCount = count;

      iter.setDate(iter.getDate() + 1);
    }

    // Calculate streaks
    // Sort reverse chronological to calculate current & longest streak
    const pastDays = [...allDays].filter((d) => d.dateObj <= today).reverse();
    let tempStreak = 0;

    for (let i = 0; i < pastDays.length; i++) {
      const d = pastDays[i];
      if (d.count > 0) {
        tempStreak++;
        if (streakActive) currStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        // If today has 0 commits, check yesterday before breaking active streak
        if (i === 0 && d.dateStr === today.toISOString().split('T')[0]) {
          // Today not ended yet, keep streak check open for previous days
          continue;
        }
        streakActive = false;
        tempStreak = 0;
      }
    }

    // Chunk into 7-day columns (weeks)
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return {
      weeksData: weeks,
      totalContributions: total,
      currentStreak: currStreak,
      longestStreak: maxStreak,
      maxDaily: maxCount
    };
  }, [dailyActivityMap, numWeeks]);

  const monthLabels = useMemo(() => {
    const labels: Array<{ name: string; weekIndex: number }> = [];
    let lastMonth = -1;

    weeksData.forEach((week, wIdx) => {
      const firstDayOfWeek = week[0];
      if (firstDayOfWeek) {
        const month = firstDayOfWeek.dateObj.getMonth();
        if (month !== lastMonth) {
          labels.push({
            name: firstDayOfWeek.dateObj.toLocaleString('default', { month: 'short' }),
            weekIndex: wIdx
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeksData]);

  const getCellColor = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-[#39D353] border-[#39D353] shadow-[0_0_6px_rgba(57,211,83,0.4)]';
      case 3:
        return 'bg-[#26A641] border-[#26A641]';
      case 2:
        return 'bg-[#006D32] border-[#006D32]';
      case 1:
        return 'bg-[#0E4429] border-[#0E4429]';
      default:
        return 'bg-[#161B22] border-[#30363D]/60 hover:border-[#8B949E]';
    }
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 sm:p-5 font-mono space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#30363D]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#161B22] border border-[#30363D] rounded text-[#3FB950]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2">
              <span>Commit Activity Heatmap</span>
              {user && <span className="text-[11px] text-[#8B949E]">@{user.login}</span>}
            </h2>
            <p className="text-[11px] text-[#8B949E]">
              Visual distribution of daily commits and push events
            </p>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-[#161B22] p-1 rounded-md border border-[#30363D]">
          <button
            type="button"
            onClick={() => setSelectedRange('12')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
              selectedRange === '12'
                ? 'bg-[#1C212B] text-[#58A6FF] border border-[#58A6FF]/40'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            3 Months
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('24')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
              selectedRange === '24'
                ? 'bg-[#1C212B] text-[#58A6FF] border border-[#58A6FF]/40'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            6 Months
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('52')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
              selectedRange === '52'
                ? 'bg-[#1C212B] text-[#58A6FF] border border-[#58A6FF]/40'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-lg">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span>Contributions</span>
            <Calendar className="w-3.5 h-3.5 text-[#58A6FF]" />
          </div>
          <div className="text-base font-extrabold text-[#E6EDF3]">{totalContributions}</div>
          <div className="text-[9px] text-[#8B949E] mt-0.5">In last {numWeeks} weeks</div>
        </div>

        <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-lg">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span>Current Streak</span>
            <Zap className="w-3.5 h-3.5 text-[#E3B341]" />
          </div>
          <div className="text-base font-extrabold text-[#E6EDF3]">{currentStreak} days</div>
          <div className="text-[9px] text-[#8B949E] mt-0.5">Consecutive activity</div>
        </div>

        <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-lg">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span>Longest Streak</span>
            <Trophy className="w-3.5 h-3.5 text-[#3FB950]" />
          </div>
          <div className="text-base font-extrabold text-[#E6EDF3]">{longestStreak} days</div>
          <div className="text-[9px] text-[#8B949E] mt-0.5">Best streak period</div>
        </div>

        <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-lg">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span>Peak Day</span>
            <Flame className="w-3.5 h-3.5 text-[#39D353]" />
          </div>
          <div className="text-base font-extrabold text-[#E6EDF3]">{maxDaily} commits</div>
          <div className="text-[9px] text-[#8B949E] mt-0.5">Max single day</div>
        </div>
      </div>

      {/* Heatmap Grid Section */}
      <div className="overflow-x-auto custom-scrollbar pb-2 pt-1">
        <div className="min-w-max space-y-1">
          {/* Month Header row */}
          <div className="flex text-[10px] text-[#8B949E] pl-6 h-4 relative">
            {monthLabels.map((lbl, idx) => (
              <span
                key={idx}
                className="absolute font-semibold"
                style={{ left: `${lbl.weekIndex * 15 + 24}px` }}
              >
                {lbl.name}
              </span>
            ))}
          </div>

          {/* Grid Rows (Days 0..6: Sun..Sat) */}
          <div className="flex items-start gap-1">
            {/* Day of Week Labels */}
            <div className="flex flex-col gap-1 text-[9px] text-[#8B949E] font-mono pr-1 select-none pt-[1px]">
              <span className="h-2.5 leading-none">Sun</span>
              <span className="h-2.5 leading-none">Mon</span>
              <span className="h-2.5 leading-none">Tue</span>
              <span className="h-2.5 leading-none">Wed</span>
              <span className="h-2.5 leading-none">Thu</span>
              <span className="h-2.5 leading-none">Fri</span>
              <span className="h-2.5 leading-none">Sat</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1">
              {weeksData.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <button
                      type="button"
                      key={day.dateStr}
                      onClick={() => setSelectedDay(day)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-2.5 h-2.5 rounded-[2px] border transition-all cursor-pointer ${getCellColor(
                        day.level
                      )} ${selectedDay?.dateStr === day.dateStr ? 'ring-2 ring-[#58A6FF]' : ''}`}
                      title={`${day.count} commits on ${day.dateStr}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tooltip & Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#30363D]/60 text-[11px] text-[#8B949E]">
        {/* Hover / Selected Status Display */}
        <div className="flex items-center gap-2 min-h-[22px]">
          {hoveredDay || selectedDay ? (
            <div className="flex items-center gap-2 text-[#E6EDF3] bg-[#161B22] px-2.5 py-1 rounded border border-[#30363D]">
              <span className="font-bold text-[#58A6FF]">
                {(hoveredDay || selectedDay)?.count} commit{(hoveredDay || selectedDay)?.count === 1 ? '' : 's'}
              </span>
              <span>on</span>
              <span className="font-mono text-[#C9D1D9]">
                {formatDateLabel((hoveredDay || selectedDay)!.dateStr)}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-[#8B949E] flex items-center gap-1">
              <Info className="w-3 h-3 text-[#58A6FF]" /> Hover over a day cell to view commit breakdown
            </span>
          )}
        </div>

        {/* Level Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#8B949E] self-end sm:self-auto">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#161B22] border border-[#30363D]" title="0 commits" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#0E4429] border border-[#0E4429]" title="1-2 commits" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#006D32] border border-[#006D32]" title="3-5 commits" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#26A641] border border-[#26A641]" title="6-9 commits" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#39D353] border border-[#39D353]" title="10+ commits" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
