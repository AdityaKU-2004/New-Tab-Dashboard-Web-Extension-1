import React, { useState } from 'react';
import { useGitHubStore } from '../../../store/useGitHubStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { DeveloperTab } from '../DeveloperSidebar';
import { Github, ExternalLink, GitPullRequest, CircleDot, GitBranch, ArrowRight, Key, RefreshCw, AlertCircle } from 'lucide-react';

interface GitHubCompactCardProps {
  onNavigate?: (tab: DeveloperTab) => void;
}

export const GitHubCompactCard: React.FC<GitHubCompactCardProps> = ({ onNavigate }) => {
  const { settings } = useDashboardStore();
  const { token, user, repos, pullRequests, issues, commits, events, isLoading, error, connectWithToken } = useGitHubStore();
  const [showQuickTokenInput, setShowQuickTokenInput] = useState(false);
  const [quickToken, setQuickToken] = useState('');
  const [quickError, setQuickError] = useState<string | null>(null);

  if (settings.theme !== 'developer') {
    return null;
  }

  const handleQuickConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickToken.trim()) return;
    setQuickError(null);
    const success = await connectWithToken(quickToken.trim());
    if (success) {
      setQuickToken('');
      setShowQuickTokenInput(false);
    } else {
      setQuickError(useGitHubStore.getState().error || 'Failed to connect');
    }
  };

  // Process recent activity bullet points from events/commits
  const getActivityItems = () => {
    if (!events || events.length === 0) {
      if (commits && commits.length > 0) {
        return commits.slice(0, 3).map((c) => ({
          id: c.sha,
          text: `pushed "${c.message}" to ${c.repoName.split('/')[1] || c.repoName}`,
          url: c.htmlUrl
        }));
      }
      return [];
    }

    const items: Array<{ id: string; text: string; url?: string }> = [];
    for (const ev of events) {
      const repoShort = ev.repo?.name ? ev.repo.name.split('/')[1] || ev.repo.name : 'repo';
      if (ev.type === 'PushEvent') {
        const commitMsg = ev.payload?.commits?.[0]?.message || 'commits';
        items.push({
          id: ev.id,
          text: `pushed to ${repoShort}`,
          url: `https://github.com/${ev.repo?.name}`
        });
      } else if (ev.type === 'PullRequestEvent') {
        const action = ev.payload?.action || 'opened';
        const num = ev.payload?.number || ev.payload?.pull_request?.number || '';
        items.push({
          id: ev.id,
          text: `${action} PR #${num} in ${repoShort}`,
          url: ev.payload?.pull_request?.html_url
        });
      } else if (ev.type === 'IssuesEvent') {
        const action = ev.payload?.action || 'updated';
        const num = ev.payload?.issue?.number || '';
        items.push({
          id: ev.id,
          text: `${action} issue #${num} in ${repoShort}`,
          url: ev.payload?.issue?.html_url
        });
      } else if (ev.type === 'IssueCommentEvent') {
        const num = ev.payload?.issue?.number || '';
        items.push({
          id: ev.id,
          text: `commented on issue #${num} in ${repoShort}`,
          url: ev.payload?.comment?.html_url
        });
      } else if (ev.type === 'CreateEvent') {
        items.push({
          id: ev.id,
          text: `created ${ev.payload?.ref_type || 'branch'} in ${repoShort}`,
          url: `https://github.com/${ev.repo?.name}`
        });
      }

      if (items.length >= 3) break;
    }

    return items;
  };

  const activityItems = getActivityItems();

  return (
    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 font-mono space-y-3 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-[#30363D]">
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-[#58A6FF]" />
            <h2 className="text-xs font-bold text-[#E6EDF3]">GitHub</h2>
          </div>

          {user ? (
            <span className="text-[11px] text-[#58A6FF] font-semibold">@{user.login}</span>
          ) : (
            <span className="text-[10px] bg-[#161B22] text-[#8B949E] px-2 py-0.5 rounded border border-[#30363D]">
              DISCONNECTED
            </span>
          )}
        </div>

        {/* Content Body */}
        {!token || !user ? (
          <div className="py-3 space-y-3">
            <p className="text-xs text-[#8B949E] leading-relaxed">
              Connect your GitHub account via Personal Access Token to view repositories, pull requests, issues, and activity.
            </p>

            {showQuickTokenInput ? (
              <form onSubmit={handleQuickConnect} className="space-y-2">
                <input
                  type="password"
                  value={quickToken}
                  onChange={(e) => setQuickToken(e.target.value)}
                  placeholder="Paste GitHub PAT token..."
                  className="w-full px-2.5 py-1.5 bg-[#161B22] border border-[#30363D] rounded text-xs text-[#E6EDF3] focus:outline-none focus:border-[#58A6FF]"
                />
                {quickError && (
                  <p className="text-[10px] text-[#F85149]">{quickError}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-1 px-2 bg-[#238636] hover:bg-[#2EA043] text-white text-xs font-bold rounded cursor-pointer"
                  >
                    Save Token
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickTokenInput(false)}
                    className="py-1 px-2 bg-[#161B22] hover:bg-[#1C212B] text-[#8B949E] text-xs rounded border border-[#30363D] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowQuickTokenInput(true)}
                className="w-full py-1.5 px-3 bg-[#161B22] hover:bg-[#1C212B] border border-[#30363D] text-[#58A6FF] text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Connect with PAT</span>
              </button>
            )}
          </div>
        ) : (
          <div className="my-3 space-y-3">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-[#161B22] border border-[#30363D] rounded">
                <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
                  <span>Repositories</span>
                  <GitBranch className="w-3 h-3 text-[#58A6FF]" />
                </div>
                <div className="text-base font-bold text-[#E6EDF3]">{repos.length || user.public_repos}</div>
              </div>

              <div className="p-2 bg-[#161B22] border border-[#30363D] rounded">
                <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
                  <span>Open PRs</span>
                  <GitPullRequest className="w-3 h-3 text-[#3FB950]" />
                </div>
                <div className="text-base font-bold text-[#E6EDF3]">{pullRequests.length}</div>
              </div>

              <div className="p-2 bg-[#161B22] border border-[#30363D] rounded">
                <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
                  <span>Issues</span>
                  <CircleDot className="w-3 h-3 text-[#D29922]" />
                </div>
                <div className="text-base font-bold text-[#E6EDF3]">{issues.length}</div>
              </div>
            </div>

            {/* Recent Activity List */}
            <div>
              <span className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1.5">
                Recent Activity
              </span>
              <div className="space-y-1 text-xs">
                {activityItems.length === 0 ? (
                  <p className="text-[11px] text-[#8B949E] italic py-1">No recent activity found.</p>
                ) : (
                  activityItems.map((act) => (
                    <div key={act.id} className="flex items-center gap-1.5 text-[#E6EDF3] truncate">
                      <span className="text-[#58A6FF] shrink-0">•</span>
                      {act.url ? (
                        <a
                          href={act.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate text-[11px] text-[#C9D1D9] hover:text-[#58A6FF]"
                        >
                          {act.text}
                        </a>
                      ) : (
                        <span className="truncate text-[11px] text-[#C9D1D9]">{act.text}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-[#30363D]/60 flex items-center justify-between text-xs">
        {onNavigate ? (
          <button
            type="button"
            onClick={() => onNavigate('git')}
            className="text-[#58A6FF] hover:underline flex items-center gap-1 font-bold cursor-pointer"
          >
            <span>View Full Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <span />
        )}

        <a
          href={user ? user.html_url : 'https://github.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 rounded bg-[#161B22] hover:bg-[#1C212B] border border-[#30363D] text-[#E6EDF3] text-[11px] font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Open GitHub</span>
          <ExternalLink className="w-3 h-3 text-[#8B949E]" />
        </a>
      </div>
    </div>
  );
};
