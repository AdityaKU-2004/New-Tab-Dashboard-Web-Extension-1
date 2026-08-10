import { storageService } from './storageService';

const GITHUB_API_BASE = 'https://api.github.com';
const TOKEN_STORAGE_KEY = 'github_pat_token';

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  total_private_repos?: number;
  bio?: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
  language: string | null;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  repository_url: string;
  repo_name?: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  user: {
    login: string;
  };
  created_at: string;
  updated_at: string;
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  repository_url: string;
  repo_name?: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  repo: {
    name: string;
    url: string;
  };
  created_at: string;
  payload: any;
}

export interface GitHubNotification {
  id: string;
  repository: {
    full_name: string;
    html_url: string;
  };
  subject: {
    title: string;
    url: string;
    type: string;
  };
  reason: string;
  unread: boolean;
  updated_at: string;
}

export interface GitHubCommitItem {
  sha: string;
  message: string;
  repoName: string;
  authorName: string;
  date: string;
  htmlUrl: string;
}

export class GitHubApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

async function fetchWithAuth<T>(endpoint: string, token: string): Promise<T> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new GitHubApiError('Invalid or expired Personal Access Token.', 401);
      }
      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        if (rateLimitRemaining === '0') {
          throw new GitHubApiError('GitHub API rate limit exceeded. Please try again later.', 403);
        }
        throw new GitHubApiError('Permission denied or scope forbidden for this resource.', 403);
      }
      if (response.status === 404) {
        throw new GitHubApiError('GitHub resource not found.', 404);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new GitHubApiError(
        errorData.message || `GitHub API request failed with status ${response.status}`,
        response.status
      );
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof GitHubApiError) {
      throw err;
    }
    throw new GitHubApiError(
      err.message || 'Network error occurred while reaching GitHub API.'
    );
  }
}

export interface GitHubRepoCommitActivity {
  total: number;
  week: number; // Unix timestamp in seconds
  days: number[]; // 7 elements [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
}

export interface GitHubRepoCommitDetail {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export const githubService = {
  // Token management
  getToken: async (): Promise<string | null> => {
    return storageService.local.get(TOKEN_STORAGE_KEY, null as string | null);
  },

  saveToken: async (token: string): Promise<void> => {
    await storageService.local.set(TOKEN_STORAGE_KEY, token.trim());
  },

  deleteToken: async (): Promise<void> => {
    await storageService.local.set(TOKEN_STORAGE_KEY, null as string | null);
  },

  // API Methods
  async getUserProfile(token: string): Promise<GitHubUser> {
    return fetchWithAuth<GitHubUser>('/user', token);
  },

  async getUserRepos(token: string): Promise<GitHubRepo[]> {
    return fetchWithAuth<GitHubRepo[]>('/user/repos?sort=updated&per_page=50&type=all', token);
  },

  async getRepoCommitActivity(token: string, owner: string, repo: string): Promise<GitHubRepoCommitActivity[]> {
    try {
      const res = await fetchWithAuth<GitHubRepoCommitActivity[] | {}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stats/commit_activity`, token);
      if (Array.isArray(res)) {
        return res;
      }
      return [];
    } catch {
      return [];
    }
  },

  async getRepoCommits(token: string, owner: string, repo: string): Promise<GitHubRepoCommitDetail[]> {
    try {
      return await fetchWithAuth<GitHubRepoCommitDetail[]>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=30`, token);
    } catch {
      return [];
    }
  },

  async getOpenPullRequests(token: string, username: string): Promise<GitHubPullRequest[]> {
    try {
      const data = await fetchWithAuth<{ items: any[] }>(
        `/search/issues?q=is:pr+is:open+author:${encodeURIComponent(username)}&sort=updated&per_page=20`,
        token
      );
      return (data.items || []).map((item) => {
        const repoName = item.repository_url ? item.repository_url.replace(`${GITHUB_API_BASE}/repos/`, '') : '';
        return {
          id: item.id,
          number: item.number,
          title: item.title,
          html_url: item.html_url,
          state: item.state,
          user: item.user || { login: username, avatar_url: '' },
          created_at: item.created_at,
          updated_at: item.updated_at,
          repository_url: item.repository_url,
          repo_name: repoName
        };
      });
    } catch {
      return [];
    }
  },

  async getOpenIssues(token: string, username: string): Promise<GitHubIssue[]> {
    try {
      const data = await fetchWithAuth<{ items: any[] }>(
        `/search/issues?q=is:issue+is:open+author:${encodeURIComponent(username)}&sort=updated&per_page=20`,
        token
      );
      return (data.items || []).map((item) => {
        const repoName = item.repository_url ? item.repository_url.replace(`${GITHUB_API_BASE}/repos/`, '') : '';
        return {
          id: item.id,
          number: item.number,
          title: item.title,
          html_url: item.html_url,
          state: item.state,
          user: item.user || { login: username },
          created_at: item.created_at,
          updated_at: item.updated_at,
          labels: item.labels || [],
          repository_url: item.repository_url,
          repo_name: repoName
        };
      });
    } catch {
      return [];
    }
  },

  async getNotifications(token: string): Promise<GitHubNotification[]> {
    try {
      return await fetchWithAuth<GitHubNotification[]>('/notifications?per_page=20', token);
    } catch {
      return [];
    }
  },

  async getRecentEvents(token: string, username: string): Promise<GitHubEvent[]> {
    try {
      return await fetchWithAuth<GitHubEvent[]>(`/users/${encodeURIComponent(username)}/events?per_page=20`, token);
    } catch {
      return [];
    }
  },

  async getRecentCommits(token: string, username: string): Promise<GitHubCommitItem[]> {
    try {
      const events = await this.getRecentEvents(token, username);
      const pushEvents = events.filter((e) => e.type === 'PushEvent');
      const commits: GitHubCommitItem[] = [];

      for (const ev of pushEvents) {
        if (ev.payload && Array.isArray(ev.payload.commits)) {
          for (const c of ev.payload.commits) {
            commits.push({
              sha: (c.sha || '').substring(0, 7),
              message: c.message || 'No commit message',
              repoName: ev.repo ? ev.repo.name : 'Repository',
              authorName: c.author?.name || username,
              date: ev.created_at,
              htmlUrl: `https://github.com/${ev.repo?.name}/commit/${c.sha}`
            });
            if (commits.length >= 15) break;
          }
        }
        if (commits.length >= 15) break;
      }
      return commits;
    } catch {
      return [];
    }
  }
};
