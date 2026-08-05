import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AppSettings,
  Bookmark,
  Quote,
  RecentTab,
  Todo,
  TodoFilter,
  Wallpaper,
  SearchEngineId,
  AccentColor,
  ThemeMode
} from '../types';
import { INITIAL_QUOTES } from '../mock/quotes';
import { INITIAL_WALLPAPERS } from '../mock/wallpapers';
import { INITIAL_BOOKMARKS } from '../mock/bookmarks';
import { INITIAL_TODOS, INITIAL_RECENT_TABS } from '../mock/todos';

export const SEARCH_ENGINES: Record<SearchEngineId, { name: string; url: string; icon: string }> = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'Search' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'Shield' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'Compass' },
  brave: { name: 'Brave', url: 'https://search.brave.com/search?q=', icon: 'Lock' },
  ecosia: { name: 'Ecosia', url: 'https://www.ecosia.org/search?q=', icon: 'Leaf' },
  yahoo: { name: 'Yahoo', url: 'https://search.yahoo.com/search?p=', icon: 'Globe' },
  youtube: { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: 'Video' },
  gemini: { name: 'Gemini', url: 'https://gemini.google.com/app?q=', icon: 'Sparkles' }
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: 'indigo',
  clockFormat12: true,
  showSeconds: true,
  showGreeting: true,
  userName: 'Creator',
  searchEngine: 'google',
  backgroundBlur: 16,
  cardOpacity: 0.08,
  darkOverlayOpacity: 0.35,
  enableAnimations: true,
  widgetVisibility: {
    clock: true,
    search: true,
    bookmarks: true,
    todo: true,
    calendar: true,
    quote: true,
    recentTabs: true,
    wallpaperPicker: true
  }
};

interface DashboardStore {
  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  toggleWidgetVisibility: (widgetKey: keyof AppSettings['widgetVisibility']) => void;

  // Wallpaper
  selectedWallpaper: Wallpaper;
  setSelectedWallpaper: (wallpaper: Wallpaper) => void;
  customWallpaperUrl: string;
  setCustomWallpaperUrl: (url: string) => void;

  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (title: string, url: string, category?: string) => void;
  deleteBookmark: (id: string) => void;

  // Todos
  todos: Todo[];
  todoFilter: TodoFilter;
  addTodo: (text: string, dueDate?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, text: string) => void;
  toggleStarTodo: (id: string) => void;
  setTodoFilter: (filter: TodoFilter) => void;
  clearCompletedTodos: () => void;

  // Quotes
  quotes: Quote[];
  currentQuoteIndex: number;
  favoriteQuoteIds: string[];
  nextRandomQuote: () => void;
  toggleFavoriteQuote: (id: string) => void;

  // Recent Tabs
  recentTabs: RecentTab[];
  removeRecentTab: (id: string) => void;
  togglePinRecentTab: (id: string) => void;

  // Modals / Drawers State
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  isWallpaperPickerOpen: boolean;
  setWallpaperPickerOpen: (open: boolean) => void;
  isAddBookmarkModalOpen: boolean;
  setAddBookmarkModalOpen: (open: boolean) => void;
  isFavoritesModalOpen: boolean;
  setFavoritesModalOpen: (open: boolean) => void;
}

// Safe LocalStorage wrapper to handle QuotaExceededError gracefully
const safeLocalStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name);
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      console.warn('LocalStorage setItem failed (QuotaExceededError):', e);
      try {
        // Fallback: strip heavy base64 data URLs to save quota
        const parsed = JSON.parse(value);
        if (parsed?.state?.selectedWallpaper?.url?.startsWith('data:')) {
          parsed.state.selectedWallpaper = INITIAL_WALLPAPERS[0];
        }
        if (parsed?.state?.customWallpaperUrl?.startsWith('data:')) {
          parsed.state.customWallpaperUrl = '';
        }
        localStorage.setItem(name, JSON.stringify(parsed));
      } catch (fallbackError) {
        console.warn('Storage fallback failed:', fallbackError);
      }
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch (e) {
      console.warn('Failed to remove item from localStorage:', e);
    }
  }
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      // Settings State
      settings: DEFAULT_SETTINGS,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
      toggleWidgetVisibility: (widgetKey) =>
        set((state) => ({
          settings: {
            ...state.settings,
            widgetVisibility: {
              ...state.settings.widgetVisibility,
              [widgetKey]: !state.settings.widgetVisibility[widgetKey]
            }
          }
        })),

      // Wallpaper State
      selectedWallpaper: INITIAL_WALLPAPERS[0],
      setSelectedWallpaper: (wallpaper) => set({ selectedWallpaper: wallpaper }),
      customWallpaperUrl: '',
      setCustomWallpaperUrl: (url) => set({ customWallpaperUrl: url }),

      // Bookmarks State
      bookmarks: INITIAL_BOOKMARKS,
      addBookmark: (title, url, category) => {
        const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
        let domain = 'google.com';
        try {
          domain = new URL(formattedUrl).hostname;
        } catch {
          // fallback
        }
        const newBm: Bookmark = {
          id: 'bm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          title: title || 'New Bookmark',
          url: formattedUrl,
          icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
          category: category || 'General',
          createdAt: Date.now()
        };
        set((state) => ({ bookmarks: [newBm, ...state.bookmarks] }));
      },
      deleteBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id)
        })),

      // Todos State
      todos: INITIAL_TODOS,
      todoFilter: 'all',
      addTodo: (text, dueDate) => {
        if (!text.trim()) return;
        const newTodo: Todo = {
          id: 'todo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          text: text.trim(),
          completed: false,
          starred: false,
          createdAt: Date.now(),
          dueDate
        };
        set((state) => ({ todos: [newTodo, ...state.todos] }));
      },
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        })),
      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id)
        })),
      editTodo: (id, text) =>
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, text } : t))
        })),
      toggleStarTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t))
        })),
      setTodoFilter: (filter) => set({ todoFilter: filter }),
      clearCompletedTodos: () =>
        set((state) => ({
          todos: state.todos.filter((t) => !t.completed)
        })),

      // Quotes State
      quotes: INITIAL_QUOTES,
      currentQuoteIndex: 0,
      favoriteQuoteIds: ['1', '20'],
      nextRandomQuote: () => {
        const total = INITIAL_QUOTES.length;
        const nextIndex = Math.floor(Math.random() * total);
        set({ currentQuoteIndex: nextIndex });
      },
      toggleFavoriteQuote: (id) =>
        set((state) => {
          const isFav = state.favoriteQuoteIds.includes(id);
          return {
            favoriteQuoteIds: isFav
              ? state.favoriteQuoteIds.filter((favId) => favId !== id)
              : [...state.favoriteQuoteIds, id]
          };
        }),

      // Recent Tabs State
      recentTabs: INITIAL_RECENT_TABS,
      removeRecentTab: (id) =>
        set((state) => ({
          recentTabs: state.recentTabs.filter((t) => t.id !== id)
        })),
      togglePinRecentTab: (id) =>
        set((state) => ({
          recentTabs: state.recentTabs.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))
        })),

      // Drawers/Modals
      isSettingsOpen: false,
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      isWallpaperPickerOpen: false,
      setWallpaperPickerOpen: (open) => set({ isWallpaperPickerOpen: open }),
      isAddBookmarkModalOpen: false,
      setAddBookmarkModalOpen: (open) => set({ isAddBookmarkModalOpen: open }),
      isFavoritesModalOpen: false,
      setFavoritesModalOpen: (open) => set({ isFavoritesModalOpen: open })
    }),
    {
      name: 'new_tab_dashboard_store_v1',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => {
        // Prevent storing huge base64 data strings > 300KB in localStorage
        const cleanSelectedWallpaper =
          state.selectedWallpaper?.url && state.selectedWallpaper.url.length > 300000
            ? INITIAL_WALLPAPERS[0]
            : state.selectedWallpaper;

        const cleanCustomWallpaperUrl =
          state.customWallpaperUrl && state.customWallpaperUrl.length > 300000
            ? ''
            : state.customWallpaperUrl;

        return {
          settings: state.settings,
          selectedWallpaper: cleanSelectedWallpaper,
          customWallpaperUrl: cleanCustomWallpaperUrl,
          bookmarks: state.bookmarks,
          todos: state.todos,
          favoriteQuoteIds: state.favoriteQuoteIds,
          recentTabs: state.recentTabs
        };
      }
    }
  )
);
