import { create } from 'zustand';
import {
  githubService,
  GitHubUser,
  GitHubRepo,
  GitHubPullRequest,
  GitHubIssue,
  GitHubNotification,
  GitHubEvent,
  GitHubCommitItem,
  GitHubApiError
} from '../services/githubService';

import { storageService } from '../services/storageService';

const CUSTOM_EVENTS_KEY = 'github_custom_events';

interface AddCustomEventParams {
  repoName: string;
  eventType: string;
  title: string;
  date?: string;
  commitCount?: number;
}

interface GitHubState {
  token: string | null;
  user: GitHubUser | null;
  repos: GitHubRepo[];
  pullRequests: GitHubPullRequest[];
  issues: GitHubIssue[];
  notifications: GitHubNotification[];
  events: GitHubEvent[];
  customEvents: GitHubEvent[];
  commits: GitHubCommitItem[];
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
  lastFetched: number | null;

  initToken: () => Promise<void>;
  connectWithToken: (token: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  deleteToken: () => Promise<void>;
  fetchGitHubData: () => Promise<void>;
  addCustomEvent: (params: AddCustomEventParams) => Promise<void>;
  clearError: () => void;
}

export const useGitHubStore = create<GitHubState>((set, get) => ({
  token: null,
  user: null,
  repos: [],
  pullRequests: [],
  issues: [],
  notifications: [],
  events: [],
  customEvents: [],
  commits: [],
  isLoading: false,
  isConnecting: false,
  error: null,
  lastFetched: null,

  initToken: async () => {
    try {
      const storedToken = await githubService.getToken();
      const savedCustomEvents = await storageService.local.get<GitHubEvent[]>(CUSTOM_EVENTS_KEY, []);
      set({ customEvents: savedCustomEvents });

      if (storedToken) {
        set({ token: storedToken });
        await get().fetchGitHubData();
      } else {
        // Even if no token, load custom events into events
        set({ events: savedCustomEvents });
      }
    } catch (err: any) {
      console.error('Failed to initialize GitHub token:', err);
    }
  },

  connectWithToken: async (rawToken: string) => {
    const token = rawToken.trim();
    if (!token) {
      set({ error: 'Please enter a valid GitHub Personal Access Token.' });
      return false;
    }

    set({ isConnecting: true, error: null });

    try {
      // Validate token by fetching profile
      const user = await githubService.getUserProfile(token);
      await githubService.saveToken(token);

      set({ token, user, isConnecting: false, error: null });

      // Fetch user data
      await get().fetchGitHubData();
      return true;
    } catch (err: any) {
      const message =
        err instanceof GitHubApiError
          ? err.message
          : 'Failed to connect with GitHub. Please check your token and network connection.';
      set({ isConnecting: false, error: message });
      return false;
    }
  },

  disconnect: async () => {
    set({
      token: null,
      user: null,
      repos: [],
      pullRequests: [],
      issues: [],
      notifications: [],
      events: [],
      commits: [],
      error: null,
      lastFetched: null
    });
  },

  deleteToken: async () => {
    await githubService.deleteToken();
    await get().disconnect();
  },

  fetchGitHubData: async () => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true, error: null });

    try {
      const user = await githubService.getUserProfile(token);
      const username = user.login;

      const [repos, pullRequests, issues, notifications, events, commits] = await Promise.all([
        githubService.getUserRepos(token),
        githubService.getOpenPullRequests(token, username),
        githubService.getOpenIssues(token, username),
        githubService.getNotifications(token),
        githubService.getRecentEvents(token, username),
        githubService.getRecentCommits(token, username)
      ]);

      const combinedEvents = [...get().customEvents, ...events];

      set({
        user,
        repos,
        pullRequests,
        issues,
        notifications,
        events: combinedEvents,
        commits,
        isLoading: false,
        lastFetched: Date.now(),
        error: null
      });
    } catch (err: any) {
      const message =
        err instanceof GitHubApiError
          ? err.message
          : 'Failed to fetch GitHub data. Please check your internet connection.';
      set({ isLoading: false, error: message });
    }
  },

  addCustomEvent: async (params: AddCustomEventParams) => {
    const customEvent: GitHubEvent = {
      id: `custom-event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: params.eventType || 'PushEvent',
      repo: {
        name: params.repoName || 'my-project',
        url: `https://github.com/${params.repoName || 'my-project'}`
      },
      created_at: params.date
        ? new Date(params.date).toISOString()
        : new Date().toISOString(),
      payload: {
        commits: Array.from({ length: params.commitCount || 1 }, (_, i) => ({
          sha: Math.random().toString(36).substring(2, 9),
          message: params.title || `Custom commit ${i + 1}`
        })),
        title: params.title,
        description: params.title
      }
    };

    const newCustomEvents = [customEvent, ...get().customEvents];
    const newEvents = [customEvent, ...get().events];

    set({
      customEvents: newCustomEvents,
      events: newEvents
    });

    await storageService.local.set(CUSTOM_EVENTS_KEY, newCustomEvents);
  },

  clearError: () => set({ error: null })
}));
