import React, { useState } from 'react';
import { useGitHubStore } from '../../../store/useGitHubStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { Github, Key, CheckCircle, AlertCircle, Trash2, LogOut, RefreshCw, Lock } from 'lucide-react';

export const GitHubSettingsSection: React.FC = () => {
  const { settings } = useDashboardStore();
  const {
    token,
    user,
    isConnecting,
    isLoading,
    error,
    connectWithToken,
    disconnect,
    deleteToken,
    fetchGitHubData,
    clearError
  } = useGitHubStore();

  const [inputToken, setInputToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Only render if Developer theme is active
  if (settings.theme !== 'developer') {
    return null;
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    const success = await connectWithToken(inputToken.trim());
    if (success) {
      setInputToken('');
      setShowTokenInput(false);
    }
  };

  return (
    <div className="pt-4 border-t border-[#30363D] font-mono">
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#58A6FF]">
          <Github className="w-4 h-4" /> GitHub Integration
        </label>
        {token && user && (
          <span className="flex items-center gap-1.5 text-[10px] text-[#3FB950] font-semibold bg-[#3FB950]/10 px-2 py-0.5 rounded border border-[#3FB950]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950] animate-pulse" />
            Connected
          </span>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2.5 bg-[#F85149]/10 border border-[#F85149]/30 rounded text-xs text-[#F85149] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold">GitHub Error</p>
            <p className="text-[11px] opacity-90 mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-[#8B949E] hover:text-[#E6EDF3] text-xs cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {token && user ? (
        <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-10 h-10 rounded-full border border-[#30363D]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#E6EDF3] truncate">
                {user.name || user.login}
              </p>
              <p className="text-[11px] text-[#8B949E] truncate">@{user.login}</p>
            </div>
            <button
              type="button"
              onClick={fetchGitHubData}
              disabled={isLoading}
              className="p-1.5 text-[#8B949E] hover:text-[#58A6FF] hover:bg-[#161B22] rounded border border-[#30363D] transition-colors cursor-pointer"
              title="Refresh GitHub Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-[#161B22] p-2 rounded border border-[#30363D]/60">
            <div>
              <span className="block font-bold text-[#E6EDF3] text-xs">{user.public_repos}</span>
              <span className="text-[#8B949E]">Repos</span>
            </div>
            <div>
              <span className="block font-bold text-[#E6EDF3] text-xs">
                {useGitHubStore.getState().pullRequests.length}
              </span>
              <span className="text-[#8B949E]">PRs</span>
            </div>
            <div>
              <span className="block font-bold text-[#E6EDF3] text-xs">
                {useGitHubStore.getState().issues.length}
              </span>
              <span className="text-[#8B949E]">Issues</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={disconnect}
              className="flex-1 py-1.5 px-2 bg-[#161B22] hover:bg-[#1C212B] border border-[#30363D] rounded text-xs text-[#E6EDF3] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#8B949E]" />
              <span>Disconnect</span>
            </button>

            <button
              type="button"
              onClick={deleteToken}
              className="py-1.5 px-2 bg-[#F85149]/10 hover:bg-[#F85149]/20 border border-[#F85149]/30 rounded text-xs text-[#F85149] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Delete stored PAT token"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Token</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {!showTokenInput ? (
            <button
              type="button"
              onClick={() => setShowTokenInput(true)}
              className="w-full py-2 px-3 bg-[#238636] hover:bg-[#2EA043] text-white font-bold text-xs rounded border border-[#3FB950]/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Github className="w-4 h-4" />
              <span>Connect GitHub</span>
            </button>
          ) : (
            <form onSubmit={handleConnect} className="space-y-3 bg-[#0D1117] p-3 rounded-lg border border-[#30363D]">
              <div className="flex items-center justify-between text-xs text-[#E6EDF3] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#58A6FF]" /> Personal Access Token (PAT)
                </span>
                <button
                  type="button"
                  onClick={() => setShowTokenInput(false)}
                  className="text-[#8B949E] hover:text-[#E6EDF3] text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="p-2 bg-[#161B22] border border-[#E3B341]/30 rounded text-[11px] text-[#E3B341] space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <Lock className="w-3 h-3" /> Token Sensitivity Warning
                </div>
                <p className="opacity-90 leading-relaxed text-[10px]">
                  Your Personal Access Token is sensitive. It will be stored locally in your browser and never sent to any server other than GitHub.
                </p>
                <p className="text-[10px] text-[#8B949E]">
                  Recommended scopes: <code className="text-[#58A6FF]">repo</code>, <code className="text-[#58A6FF]">read:user</code>, <code className="text-[#58A6FF]">notifications</code>.
                </p>
              </div>

              <input
                type="password"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-1.5 bg-[#161B22] border border-[#30363D] rounded text-xs text-[#E6EDF3] font-mono focus:outline-none focus:border-[#58A6FF]"
              />

              <button
                type="submit"
                disabled={isConnecting || !inputToken.trim()}
                className="w-full py-2 px-3 bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white font-bold text-xs rounded border border-[#3FB950]/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Token...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Save & Connect Token</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
