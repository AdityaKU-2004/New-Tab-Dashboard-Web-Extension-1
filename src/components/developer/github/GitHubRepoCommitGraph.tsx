import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useGitHubStore } from '../../../store/useGitHubStore';
import {
  githubService,
  GitHubRepoCommitActivity,
  GitHubRepoCommitDetail
} from '../../../services/githubService';
import {
  GitBranch,
  GitCommit,
  Star,
  GitFork,
  ExternalLink,
  RefreshCw,
  BarChart2,
  TrendingUp,
  User,
  Calendar,
  Lock,
  Globe
} from 'lucide-react';

export const GitHubRepoCommitGraph: React.FC = () => {
  const { token, user, repos, commits, events } = useGitHubStore();
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>('all');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [repoActivity, setRepoActivity] = useState<GitHubRepoCommitActivity[]>([]);
  const [repoCommits, setRepoCommits] = useState<GitHubRepoCommitDetail[]>([]);
  const [isFetchingRepoData, setIsFetchingRepoData] = useState(false);

  // Fetch specific repo details when selectedRepoFullName changes
  useEffect(() => {
    if (!token || selectedRepoFullName === 'all') {
      setRepoActivity([]);
      setRepoCommits([]);
      return;
    }

    const [owner, repoName] = selectedRepoFullName.split('/');
    if (!owner || !repoName) return;

    let isMounted = true;
    setIsFetchingRepoData(true);

    Promise.all([
      githubService.getRepoCommitActivity(token, owner, repoName),
      githubService.getRepoCommits(token, owner, repoName)
    ]).then(([act, cList]) => {
      if (isMounted) {
        setRepoActivity(act);
        setRepoCommits(cList);
        setIsFetchingRepoData(false);
      }
    }).catch(() => {
      if (isMounted) setIsFetchingRepoData(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedRepoFullName, token]);

  const selectedRepoObj = useMemo(() => {
    if (selectedRepoFullName === 'all') return null;
    return repos.find((r) => r.full_name === selectedRepoFullName) || null;
  }, [repos, selectedRepoFullName]);

  // Generate chart data for "All Repositories" or "Specific Repository"
  const chartData = useMemo(() => {
    if (selectedRepoFullName !== 'all' && repoActivity.length > 0) {
      // Use real repo weekly commit activity from GitHub API
      return repoActivity.map((weekItem) => {
        const date = new Date(weekItem.week * 1000);
        const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return {
          name: label,
          commits: weekItem.total,
          timestamp: weekItem.week
        };
      });
    }

    // Fallback or "All Repositories": construct weekly aggregated trend from events and commits
    const weeksMap = new Map<string, { label: string; count: number; timestamp: number }>();
    const now = new Date();

    // Initialize past 12 weeks
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const weekLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      weeksMap.set(weekLabel, { label: weekLabel, count: 0, timestamp: d.getTime() });
    }

    // Map commits into weeks
    commits.forEach((c) => {
      if (c.date) {
        const d = new Date(c.date);
        const diffMs = now.getTime() - d.getTime();
        const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
        if (diffWeeks >= 0 && diffWeeks < 12) {
          const weekDate = new Date(now);
          weekDate.setDate(weekDate.getDate() - diffWeeks * 7);
          const label = weekDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const existing = weeksMap.get(label);
          if (existing) {
            existing.count += 1;
          }
        }
      }
    });

    // Map events
    events.forEach((ev) => {
      if (ev.type === 'PushEvent' && ev.created_at) {
        const d = new Date(ev.created_at);
        const diffMs = now.getTime() - d.getTime();
        const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
        if (diffWeeks >= 0 && diffWeeks < 12) {
          const weekDate = new Date(now);
          weekDate.setDate(weekDate.getDate() - diffWeeks * 7);
          const label = weekDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const existing = weeksMap.get(label);
          if (existing) {
            existing.count += ev.payload?.commits?.length || 1;
          }
        }
      }
    });

    return Array.from(weeksMap.values());
  }, [selectedRepoFullName, repoActivity, commits, events]);

  const totalChartCommits = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.commits, 0);
  }, [chartData]);

  const peakCommitWeek = useMemo(() => {
    if (chartData.length === 0) return 'N/A';
    const sorted = [...chartData].sort((a, b) => b.commits - a.commits);
    return sorted[0].commits > 0 ? `${sorted[0].commits} commits (${sorted[0].name})` : '0 commits';
  }, [chartData]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 sm:p-5 font-mono space-y-5">
      {/* Top Header & Repository Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#30363D]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#161B22] border border-[#30363D] rounded text-[#3FB950]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2">
              <span>Repository Commit Graph & Analytics</span>
            </h2>
            <p className="text-[11px] text-[#8B949E]">
              Track commit trends over time across all repositories or per project
            </p>
          </div>
        </div>

        {/* Controls: Repo Selector & Chart Type */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Repo Dropdown */}
          <div className="relative flex-1 sm:w-64">
            <select
              value={selectedRepoFullName}
              onChange={(e) => setSelectedRepoFullName(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#161B22] border border-[#30363D] rounded text-xs text-[#E6EDF3] focus:outline-none focus:border-[#58A6FF] font-mono cursor-pointer"
            >
              <option value="all">⚡ All Repositories (Combined)</option>
              {repos.map((r) => (
                <option key={r.id} value={r.full_name}>
                  {r.private ? '🔒' : '🌐'} {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 bg-[#161B22] p-1 rounded border border-[#30363D]">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                chartType === 'area'
                  ? 'bg-[#1C212B] text-[#58A6FF] border border-[#58A6FF]/40'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
              title="Area Trend Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-[#1C212B] text-[#58A6FF] border border-[#58A6FF]/40'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
              title="Bar Chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Repo Header Badge / Meta (if specific repo selected) */}
      {selectedRepoObj && (
        <div className="p-3 bg-[#161B22] border border-[#30363D] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#58A6FF] text-sm truncate">
                {selectedRepoObj.full_name}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${
                  selectedRepoObj.private
                    ? 'bg-[#1C212B] text-[#D29922] border-[#D29922]/30'
                    : 'bg-[#1C212B] text-[#3FB950] border-[#3FB950]/30'
                }`}
              >
                {selectedRepoObj.private ? 'Private' : 'Public'}
              </span>
            </div>
            {selectedRepoObj.description && (
              <p className="text-[11px] text-[#8B949E] mt-0.5 truncate">
                {selectedRepoObj.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#8B949E] shrink-0">
            {selectedRepoObj.language && (
              <span className="flex items-center gap-1 font-semibold text-[#E6EDF3]">
                <span className="w-2 h-2 rounded-full bg-[#58A6FF]" />
                {selectedRepoObj.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#E3B341]" /> {selectedRepoObj.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" /> {selectedRepoObj.forks_count}
            </span>
            <a
              href={selectedRepoObj.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-[#8B949E] hover:text-[#58A6FF] rounded border border-[#30363D] transition-colors"
              title="Open Repo on GitHub"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Recharts Commit Graph Container */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-[#8B949E]">
          <span className="font-bold text-[#E6EDF3] flex items-center gap-2">
            <span>Commit Frequency Over Time</span>
            {isFetchingRepoData && (
              <RefreshCw className="w-3 h-3 text-[#58A6FF] animate-spin" />
            )}
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Total Period Commits: <strong className="text-[#3FB950]">{totalChartCommits}</strong></span>
            <span>Peak: <strong className="text-[#E6EDF3]">{peakCommitWeek}</strong></span>
          </div>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="commitGreenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3FB950" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3FB950" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  stroke="#8B949E"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#30363D' }}
                />
                <YAxis
                  stroke="#8B949E"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#30363D' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1117',
                    borderColor: '#30363D',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#E6EDF3',
                    fontFamily: 'monospace'
                  }}
                  itemStyle={{ color: '#3FB950', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke="#3FB950"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#commitGreenGrad)"
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  stroke="#8B949E"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#30363D' }}
                />
                <YAxis
                  stroke="#8B949E"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#30363D' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1117',
                    borderColor: '#30363D',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#E6EDF3',
                    fontFamily: 'monospace'
                  }}
                  itemStyle={{ color: '#3FB950', fontWeight: 'bold' }}
                />
                <Bar dataKey="commits" fill="#3FB950" radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Specific Repo Recent Commits Table/Timeline (When a repo is selected) */}
      {selectedRepoObj && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-2">
            <GitCommit className="w-3.5 h-3.5 text-[#A371F7]" />
            <span>Recent Commits for {selectedRepoObj.name}</span>
          </h3>

          {isFetchingRepoData ? (
            <div className="p-6 text-center text-xs text-[#8B949E] bg-[#161B22] border border-[#30363D] rounded-lg">
              Loading repository commits...
            </div>
          ) : repoCommits.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8B949E] bg-[#161B22] border border-[#30363D] rounded-lg">
              No recent commits fetched for this repository.
            </div>
          ) : (
            <div className="space-y-1.5">
              {repoCommits.map((item) => (
                <a
                  key={item.sha}
                  href={item.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-[#161B22] hover:bg-[#1C212B] border border-[#30363D] hover:border-[#A371F7]/60 rounded-md transition-all flex items-center justify-between gap-3 group cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-1.5 py-0.5 bg-[#0D1117] border border-[#30363D] text-[10px] font-mono text-[#A371F7] font-bold rounded">
                      {item.sha.substring(0, 7)}
                    </span>
                    <span className="font-semibold text-[#E6EDF3] group-hover:text-[#58A6FF] truncate">
                      {item.commit.message}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#8B949E] shrink-0">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {item.commit.author.name}
                    </span>
                    <span>{formatDate(item.commit.author.date)}</span>
                    <ExternalLink className="w-3 h-3 text-[#8B949E] group-hover:text-[#E6EDF3]" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
