import { RecentTab, Todo } from '../types';

export const INITIAL_RECENT_TABS: RecentTab[] = [
  {
    id: 't1',
    title: 'React 19 Documentation – Server Components & Hooks',
    url: 'https://react.dev/blog/2024/04/25/react-19',
    favIconUrl: 'https://react.dev/favicon.ico',
    lastAccessed: Date.now() - 1000 * 60 * 12, // 12 mins ago
    pinned: true
  },
  {
    id: 't2',
    title: 'Tailwind CSS v4.0 Release Notes',
    url: 'https://tailwindcss.com/blog/tailwindcss-v4',
    favIconUrl: 'https://tailwindcss.com/favicons/favicon.ico',
    lastAccessed: Date.now() - 1000 * 60 * 45, // 45 mins ago
    pinned: false
  },
  {
    id: 't3',
    title: 'Zustand State Management Guide',
    url: 'https://zustand-demo.pmnd.rs',
    favIconUrl: 'https://raw.githubusercontent.com/pmndrs/zustand/main/docs/favicon.ico',
    lastAccessed: Date.now() - 1000 * 60 * 120, // 2 hours ago
    pinned: false
  },
  {
    id: 't4',
    title: 'Manifest V3 Migration Checklist for Extensions',
    url: 'https://developer.chrome.com/docs/extensions/mv3/intro/',
    favIconUrl: 'https://www.google.com/favicon.ico',
    lastAccessed: Date.now() - 1000 * 60 * 240, // 4 hours ago
    pinned: false
  },
  {
    id: 't5',
    title: 'Google AI Studio – Gemini API Portal',
    url: 'https://ai.google.dev/',
    favIconUrl: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff784d78619.svg',
    lastAccessed: Date.now() - 1000 * 60 * 480, // 8 hours ago
    pinned: true
  }
];

export const INITIAL_TODOS: Todo[] = [
  {
    id: 'todo-1',
    text: 'Review pull request for new dashboard layout',
    completed: false,
    starred: true,
    createdAt: Date.now() - 3600000
  },
  {
    id: 'todo-2',
    text: 'Set up Manifest V3 extension permissions layer',
    completed: true,
    starred: false,
    createdAt: Date.now() - 7200000
  },
  {
    id: 'todo-3',
    text: 'Customize background wallpaper & blur overlay',
    completed: false,
    starred: false,
    createdAt: Date.now() - 1800000
  },
  {
    id: 'todo-4',
    text: 'Test dark mode accent color toggles',
    completed: true,
    starred: true,
    createdAt: Date.now() - 5400000
  }
];
