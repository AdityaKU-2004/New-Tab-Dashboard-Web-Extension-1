import React, { useState } from 'react';
import { useGitHubStore } from '../../../store/useGitHubStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { GitHubCommitHeatmap } from './GitHubCommitHeatmap';
import { GitHubRepoCommitGraph } from './GitHubRepoCommitGraph';
import { AddGitHubEventModal } from './AddGitHubEventModal';
import {
  Github,
  GitBranch,
  GitPullRequest,
  CircleDot,
  GitCommit,
  Bell,
  Star,
  GitFork,
  ExternalLink,
  Search,
  RefreshCw,
  Lock,
  Key,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Tag,
  Flame,
  TrendingUp,
  Plus
} from 'lucide-react';

export type GitHubSubTab = 'heatmap' | 'graphs' | 'repos' | 'prs' | 'issues' | 'commits' | 'notifications';

interface GitHubDashboardProps {
  initialSubTab?: GitHubSubTab;
}

export const GitHubDashboard: React.FC<GitHubDashboardProps> = ({ initialSubTab = 'repos' }) => {
  const { settings } = useDashboardStore();
  const {
    token,
    user,
    repos,
    pullRequests,
    issues,
    commits,
    notifications,
    isLoading,
    error,
    connectWithToken,
    fetchGitHubData,
    clearError
  } = useGitHubStore();

  const [activeSubTab, setActiveSubTab] = useState<GitHubSubTab>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  if (settings.theme !== 'developer') {
    return null;
  }

  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    setConnectError(null);
    const success = await connectWithToken(inputToken.trim());
    if (success) {
      setInputToken('');
    } else {
      setConnectError(useGitHubStore.getState().error || 'Failed to authenticate token.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Filtered lists based on search query
  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.language && r.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPRs = pullRequests.filter(
    (pr) =>
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pr.repo_name && pr.repo_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredIssues = issues.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.repo_name && i.repo_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCommits = commits.filter(
    (c) =>
      c.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.repoName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotifications = notifications.filter(
    (n) =>
      n.subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.repository.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 sm:p-6 font-mono select-none space-y-6">
      {/* 1. HEADER & USER BAR */}
      <div className="pb-5 border-b border-[#30363D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-[#58A6FF]">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#E6EDF3] tracking-tight flex items-center gap-2">
              <span>GitHub Workspace</span>
              {user && (
                <span className="text-xs font-normal text-[#8B949E] bg-[#0D1117] px-2 py-0.5 rounded border border-[#30363D]">
                  @{user.login}
                </span>
              )}
            </h1>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Live GitHub repositories, pull requests, issues & commits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddEventOpen(true)}
            className="px-3 py-1.5 rounded bg-[#238636] hover:bg-[#2EA043] border border-[#3FB950] text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>

          {token && (
            <button
              type="button"
              onClick={fetchGitHubData}
              disabled={isLoading}
              className="px-3 py-1.5 rounded bg-[#0D1117] border border-[#30363D] text-xs font-bold text-[#E6EDF3] hover:border-[#58A6FF] transition-colors cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#58A6FF] ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}

          <a
            href={user ? user.html_url : 'https://github.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded bg-[#58A6FF] text-[#0D1117] font-bold text-xs hover:bg-[#58A6FF]/90 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Open GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* DISCONNECTED STATE BANNER */}
      {(!token || !user) && (
        <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-6 max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-3 text-[#58A6FF]">
            <Key className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-[#E6EDF3]">Connect Your GitHub Account</h3>
              <p className="text-xs text-[#8B949E] mt-0.5">
                Provide a GitHub Personal Access Token (PAT) with read permissions.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#161B22] border border-[#E3B341]/30 rounded text-xs text-[#E3B341] space-y-1">
            <div className="flex items-center gap-1 font-bold">
              <Lock className="w-3.5 h-3.5" /> Token Security & Sensitivity
            </div>
            <p className="opacity-90 leading-relaxed text-[11px]">
              Tokens are sensitive secrets. Your PAT is stored securely in browser local storage and is strictly used for client-side API requests to <code>api.github.com</code>.
            </p>
            <p className="text-[11px] text-[#8B949E]">
              Recommended Scopes: <code className="text-[#58A6FF]">repo</code>, <code className="text-[#58A6FF]">read:user</code>, <code className="text-[#58A6FF]">notifications</code>.
            </p>
          </div>

          {(error || connectError) && (
            <div className="p-3 bg-[#F85149]/10 border border-[#F85149]/30 rounded text-xs text-[#F85149] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{connectError || error}</span>
            </div>
          )}

          <form onSubmit={handleConnectToken} className="space-y-3">
            <input
              type="password"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Paste Personal Access Token (ghp_...)"
              className="w-full px-3 py-2 bg-[#161B22] border border-[#30363D] rounded text-xs text-[#E6EDF3] font-mono focus:outline-none focus:border-[#58A6FF]"
            />

            <button
              type="submit"
              disabled={isLoading || !inputToken.trim()}
              className="w-full py-2 px-4 bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white font-bold text-xs rounded border border-[#3FB950]/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Connect GitHub Token</span>
            </button>
          </form>
        </div>
      )}

      {/* CONNECTED STATE DASHBOARD */}
      {token && user && (
        <div className="space-y-5">
          {/* SUB-TABS & SEARCH BAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#30363D]">
            {/* SubTab navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setActiveSubTab('heatmap')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                  activeSubTab === 'heatmap'
                    ? 'bg-[#1C212B] text-[#39D353] border border-[#39D353]/40'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#0D1117]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-[#39D353]" />
                <span>Commit Heatmap</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('graphs')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                  activeSubTab === 'graphs'
                    ? 'bg-[#1C212B] text-[#3FB950] border border-[#3FB950]/40'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#0D1117]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#3FB950]" />
                <span>Repo Graphs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('repos')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                  activeSubTab === 'repos'
                    ? 'bg-[#1C212B] text-[#58A6FF] border border-[#58A6FF]/40'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#0D1117]'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Repositories</span>
                <span className="text-[10px] bg-[#0D1117] px-1.5 py-0.5 rounded text-[#8B949E]">
                  {repos.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('prs')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                  activeSubTab === 'prs'
                    ? 'bg-[#1C212B] text-[#3FB950] border border-[#3FB950]/40'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#0D1117]'
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Pull Requests</span>
                <span className="text-[10px] bg-[#0D1117] px-1.5 py-0.5 rounded text-[#8B949E]">
                  {pullRequests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('issues')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                  activeSubTab === 'issues'
                    ? 'bg-[#1C212B] text-[#D29922] border border-[#D29922]/40'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#0D1117]'
                }`}
              >
                <CircleDot className="w-3.5 h-3.5" />
                <span>Issues</span>
                <span className="text-[10px] bg-[#0D1117] px-1.5 py-0.5 rounded text-[#8B949E]">
                  {issues.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('commits')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                  activeSubTab === 'commits'
                    ? 'bg-[#1C212B] text-[#A371F7] border border-[#A371F7]/40'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#0D1117]'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>Commits</span>
                <span className="text-[10px] bg-[#0D1117] px-1.5 py-0.5 rounded text-[#8B949E]">
                  {commits.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('notifications')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                  activeSubTab === 'notifications'
                    ? 'bg-[#1C212B] text-[#F0883E] border border-[#F0883E]/40'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#0D1117]'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notifications</span>
                <span className="text-[10px] bg-[#0D1117] px-1.5 py-0.5 rounded text-[#8B949E]">
                  {notifications.length}
                </span>
              </button>
            </div>

            {/* Filter Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8B949E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter items..."
                className="w-full h-8 pl-8 pr-3 rounded bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] text-xs font-mono focus:outline-none focus:border-[#58A6FF]"
              />
            </div>
          </div>

          {/* SUBTAB CONTENT */}

          {/* 1. COMMIT HEATMAP */}
          {activeSubTab === 'heatmap' && (
            <div className="space-y-5">
              <GitHubCommitHeatmap />
              <GitHubRepoCommitGraph />
            </div>
          )}

          {/* 2. REPO COMMIT GRAPHS */}
          {activeSubTab === 'graphs' && (
            <div className="space-y-5">
              <GitHubRepoCommitGraph />
            </div>
          )}

          {/* 3. REPOSITORIES */}
          {activeSubTab === 'repos' && (
            <div className="space-y-3">
              {filteredRepos.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8B949E] bg-[#0D1117] border border-[#30363D] rounded-lg">
                  No repositories found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredRepos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 bg-[#0D1117] hover:bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/60 rounded-lg transition-all flex flex-col justify-between gap-2.5 group cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#58A6FF] group-hover:underline truncate">
                            {repo.name}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                              repo.private
                                ? 'bg-[#1C212B] text-[#D29922] border-[#D29922]/30'
                                : 'bg-[#1C212B] text-[#3FB950] border-[#3FB950]/30'
                            }`}
                          >
                            {repo.private ? 'Private' : 'Public'}
                          </span>
                        </div>

                        {repo.description && (
                          <p className="text-[11px] text-[#8B949E] line-clamp-2 mt-1">
                            {repo.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#8B949E] pt-2 border-t border-[#30363D]/50">
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="flex items-center gap-1 font-semibold text-[#E6EDF3]">
                              <span className="w-2 h-2 rounded-full bg-[#58A6FF]" />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#E3B341]" />
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3 h-3 text-[#8B949E]" />
                            {repo.forks_count}
                          </span>
                        </div>

                        <span className="text-[10px]">
                          Updated {formatDate(repo.updated_at)}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. PULL REQUESTS */}
          {activeSubTab === 'prs' && (
            <div className="space-y-2">
              {filteredPRs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8B949E] bg-[#0D1117] border border-[#30363D] rounded-lg">
                  No open pull requests found.
                </div>
              ) : (
                filteredPRs.map((pr) => (
                  <a
                    key={pr.id}
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#0D1117] hover:bg-[#161B22] border border-[#30363D] hover:border-[#3FB950]/60 rounded-lg transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <GitPullRequest className="w-4 h-4 text-[#3FB950] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#E6EDF3] group-hover:text-[#58A6FF] truncate">
                            {pr.title}
                          </span>
                          <span className="text-[10px] text-[#8B949E]">#{pr.number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#8B949E] mt-1">
                          <span className="text-[#58A6FF] font-medium">{pr.repo_name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {pr.user?.login}
                          </span>
                          <span>•</span>
                          <span>Updated {formatDate(pr.updated_at)}</span>
                        </div>
                      </div>
                    </div>

                    <ExternalLink className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-[#E6EDF3] shrink-0" />
                  </a>
                ))
              )}
            </div>
          )}

          {/* 3. ISSUES */}
          {activeSubTab === 'issues' && (
            <div className="space-y-2">
              {filteredIssues.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8B949E] bg-[#0D1117] border border-[#30363D] rounded-lg">
                  No open issues found.
                </div>
              ) : (
                filteredIssues.map((issue) => (
                  <a
                    key={issue.id}
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#0D1117] hover:bg-[#161B22] border border-[#30363D] hover:border-[#D29922]/60 rounded-lg transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <CircleDot className="w-4 h-4 text-[#D29922] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#E6EDF3] group-hover:text-[#58A6FF] truncate">
                            {issue.title}
                          </span>
                          <span className="text-[10px] text-[#8B949E]">#{issue.number}</span>

                          {issue.labels && issue.labels.map((lbl) => (
                            <span
                              key={lbl.id}
                              className="text-[9px] px-1.5 py-0.2 rounded font-semibold text-white/90"
                              style={{ backgroundColor: `#${lbl.color}` }}
                            >
                              {lbl.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#8B949E] mt-1">
                          <span className="text-[#58A6FF] font-medium">{issue.repo_name}</span>
                          <span>•</span>
                          <span>Updated {formatDate(issue.updated_at)}</span>
                        </div>
                      </div>
                    </div>

                    <ExternalLink className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-[#E6EDF3] shrink-0" />
                  </a>
                ))
              )}
            </div>
          )}

          {/* 4. COMMITS */}
          {activeSubTab === 'commits' && (
            <div className="space-y-2">
              {filteredCommits.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8B949E] bg-[#0D1117] border border-[#30363D] rounded-lg">
                  No recent commits found.
                </div>
              ) : (
                filteredCommits.map((commit, idx) => (
                  <a
                    key={commit.sha + idx}
                    href={commit.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#0D1117] hover:bg-[#161B22] border border-[#30363D] hover:border-[#A371F7]/60 rounded-lg transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <GitCommit className="w-4 h-4 text-[#A371F7] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-[#161B22] border border-[#30363D] text-[10px] font-mono text-[#A371F7] font-bold rounded">
                            {commit.sha}
                          </span>
                          <span className="text-xs font-bold text-[#E6EDF3] group-hover:text-[#58A6FF] truncate">
                            {commit.message}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#8B949E] mt-1">
                          <span className="text-[#58A6FF] font-medium">{commit.repoName}</span>
                          <span>•</span>
                          <span>By {commit.authorName}</span>
                          <span>•</span>
                          <span>{formatDate(commit.date)}</span>
                        </div>
                      </div>
                    </div>

                    <ExternalLink className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-[#E6EDF3] shrink-0" />
                  </a>
                ))
              )}
            </div>
          )}

          {/* 5. NOTIFICATIONS */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8B949E] bg-[#0D1117] border border-[#30363D] rounded-lg">
                  No unread notifications.
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <a
                    key={notif.id}
                    href={notif.repository.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#0D1117] hover:bg-[#161B22] border border-[#30363D] hover:border-[#F0883E]/60 rounded-lg transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Bell className="w-4 h-4 text-[#F0883E] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#E6EDF3] group-hover:text-[#58A6FF] truncate block">
                          {notif.subject.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-[#8B949E] mt-1">
                          <span className="text-[#58A6FF] font-medium">
                            {notif.repository.full_name}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{notif.reason}</span>
                          <span>•</span>
                          <span>{formatDate(notif.updated_at)}</span>
                        </div>
                      </div>
                    </div>

                    <ExternalLink className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-[#E6EDF3] shrink-0" />
                  </a>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Custom Event Modal */}
      <AddGitHubEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
      />
    </div>
  );
};
