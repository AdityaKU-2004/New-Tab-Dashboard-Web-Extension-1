import React, { useState } from 'react';
import { useGitHubStore } from '../../../store/useGitHubStore';
import { X, Plus, Calendar, GitCommit, GitPullRequest, CircleDot, Flame, Tag, CheckCircle2 } from 'lucide-react';

interface AddGitHubEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export const AddGitHubEventModal: React.FC<AddGitHubEventModalProps> = ({
  isOpen,
  onClose,
  defaultDate
}) => {
  const { repos, addCustomEvent, user } = useGitHubStore();

  const [repoName, setRepoName] = useState('');
  const [customRepo, setCustomRepo] = useState('');
  const [eventType, setEventType] = useState('PushEvent');
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [commitCount, setCommitCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalRepo =
      repoName === 'custom'
        ? customRepo.trim() || 'my-custom-project'
        : repoName || (repos[0] ? repos[0].full_name : `${user?.login || 'user'}/my-repo`);

    setIsSubmitting(true);

    try {
      await addCustomEvent({
        repoName: finalRepo,
        eventType,
        title: title.trim(),
        date: eventDate,
        commitCount
      });

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setTitle('');
        onClose();
      }, 800);
    } catch (err) {
      console.error('Failed to add event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 font-mono animate-fadeIn">
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#30363D] flex items-center justify-between bg-[#0D1117]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#1C212B] border border-[#30363D] rounded text-[#39D353]">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#E6EDF3]">Log Custom Developer Event</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#8B949E] hover:text-[#E6EDF3] rounded hover:bg-[#21262D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 bg-[#0E4429] border border-[#39D353] rounded-md text-[#39D353] flex items-center gap-2 text-xs font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Event logged successfully! Updating heatmap...</span>
            </div>
          )}

          {/* Event Type Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#8B949E]">Event Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEventType('PushEvent')}
                className={`p-2 rounded border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  eventType === 'PushEvent'
                    ? 'bg-[#1C212B] border-[#3FB950] text-[#3FB950] font-bold'
                    : 'bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                <GitCommit className="w-4 h-4" />
                <span className="text-[10px]">Push / Commit</span>
              </button>

              <button
                type="button"
                onClick={() => setEventType('PullRequestEvent')}
                className={`p-2 rounded border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  eventType === 'PullRequestEvent'
                    ? 'bg-[#1C212B] border-[#A371F7] text-[#A371F7] font-bold'
                    : 'bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                <GitPullRequest className="w-4 h-4" />
                <span className="text-[10px]">Pull Request</span>
              </button>

              <button
                type="button"
                onClick={() => setEventType('IssuesEvent')}
                className={`p-2 rounded border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  eventType === 'IssuesEvent'
                    ? 'bg-[#1C212B] border-[#D29922] text-[#D29922] font-bold'
                    : 'bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                <CircleDot className="w-4 h-4" />
                <span className="text-[10px]">Issue / Task</span>
              </button>
            </div>
          </div>

          {/* Repository Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#8B949E]">Target Repository</label>
            <select
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-md text-[#E6EDF3] focus:outline-none focus:border-[#58A6FF]"
            >
              <option value="">Choose repository...</option>
              {repos.map((r) => (
                <option key={r.id} value={r.full_name}>
                  {r.full_name}
                </option>
              ))}
              <option value="custom">✏️ Enter Custom Repository Name</option>
            </select>

            {repoName === 'custom' && (
              <input
                type="text"
                placeholder="e.g. username/my-new-project"
                value={customRepo}
                onChange={(e) => setCustomRepo(e.target.value)}
                className="w-full mt-2 px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-md text-[#E6EDF3] focus:outline-none focus:border-[#58A6FF]"
              />
            )}
          </div>

          {/* Event Title / Message */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#8B949E]">
              {eventType === 'PushEvent' ? 'Commit Message' : 'Event Description / Title'}
            </label>
            <input
              type="text"
              required
              placeholder={
                eventType === 'PushEvent'
                  ? 'e.g. feat: add real-time webhook listener'
                  : 'e.g. fix: resolve CORS policy error in proxy'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-md text-[#E6EDF3] focus:outline-none focus:border-[#58A6FF]"
            />
          </div>

          {/* Date & Commit Count Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#8B949E] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#58A6FF]" />
                <span>Event Date</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-md text-[#E6EDF3] focus:outline-none focus:border-[#58A6FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#8B949E] flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#39D353]" />
                <span>Commits Count</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={commitCount}
                onChange={(e) => setCommitCount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-md text-[#E6EDF3] focus:outline-none focus:border-[#58A6FF]"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-[#30363D] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-[#30363D] bg-[#0D1117] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#8B949E] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-1.5 rounded-md bg-[#238636] hover:bg-[#2EA043] border border-[#3FB950] font-bold text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Logging...' : 'Save Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
