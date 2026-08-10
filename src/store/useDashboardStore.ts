import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AppSettings,
  Bookmark,
  BookmarkFolder,
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
import { INITIAL_BOOKMARKS, INITIAL_FOLDERS } from '../mock/bookmarks';
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
  clockStyle: 'digital',
  clockFormat12: true,
  showSeconds: true,
  showGreeting: true,
  userName: 'Creator',
  searchEngine: 'google',
  backgroundBlur: 16,
  cardOpacity: 0.08,
  darkOverlayOpacity: 0.35,
  speedometerPlacement: 'background',
  enableAnimations: true,
  widgetVisibility: {
    clock: true,
    search: true,
    bookmarks: true,
    todo: true,
    dailyTasks: true,
    calendar: true,
    quote: true,
    recentTabs: true,
    wallpaperPicker: true,
    gmail: true,
    cyberSystemMonitor: true,
    cyberAudioPlayer: true
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

  // Bookmarks & Folders
  folders: BookmarkFolder[];
  addFolder: (name: string, parentId?: string) => void;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;

  bookmarks: Bookmark[];
  addBookmark: (
    title: string,
    url: string,
    category?: string,
    description?: string,
    tags?: string[],
    folderId?: string,
    isQuickLink?: boolean
  ) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => void;
  recordBookmarkClick: (id: string) => void;
  toggleFavoriteBookmark: (id: string) => void;
  toggleQuickLinkBookmark: (id: string) => void;
  reorderBookmarks: (newBookmarks: Bookmark[]) => void;

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
        set((state) => {
          const currentValue = state.settings.widgetVisibility?.[widgetKey];
          const newValue = currentValue === false ? true : false;
          return {
            settings: {
              ...state.settings,
              widgetVisibility: {
                ...DEFAULT_SETTINGS.widgetVisibility,
                ...state.settings.widgetVisibility,
                [widgetKey]: newValue
              }
            }
          };
        }),

      // Wallpaper State
      selectedWallpaper: INITIAL_WALLPAPERS[0],
      setSelectedWallpaper: (wallpaper) => set({ selectedWallpaper: wallpaper }),
      customWallpaperUrl: '',
      setCustomWallpaperUrl: (url) => set({ customWallpaperUrl: url }),

      // Folders & Bookmarks State
      folders: INITIAL_FOLDERS,
      addFolder: (name, parentId) => {
        if (!name.trim()) return;
        const newFolder: BookmarkFolder = {
          id: 'f_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: name.trim(),
          parentId,
          createdAt: Date.now()
        };
        set((state) => ({ folders: [...(state.folders || []), newFolder] }));
      },
      deleteFolder: (id) =>
        set((state) => {
          const currentFolders = state.folders || [];
          // Collect id and all child folder IDs recursively
          const folderIdsToDelete = new Set<string>([id]);
          let addedMore = true;
          while (addedMore) {
            addedMore = false;
            for (const f of currentFolders) {
              if (f.parentId && folderIdsToDelete.has(f.parentId) && !folderIdsToDelete.has(f.id)) {
                folderIdsToDelete.add(f.id);
                addedMore = true;
              }
            }
          }

          return {
            folders: currentFolders.filter((f) => !folderIdsToDelete.has(f.id)),
            bookmarks: (state.bookmarks || []).map((b) =>
              b.folderId && folderIdsToDelete.has(b.folderId) ? { ...b, folderId: undefined } : b
            )
          };
        }),
      renameFolder: (id, name) =>
        set((state) => ({
          folders: (state.folders || []).map((f) =>
            f.id === id ? { ...f, name: name.trim() } : f
          )
        })),

      bookmarks: INITIAL_BOOKMARKS,
      addBookmark: (title, url, category, description, tags, folderId, isQuickLink) => {
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
          description,
          tags,
          folderId,
          isQuickLink,
          createdAt: Date.now(),
          visitCount: 0
        };
        set((state) => ({ bookmarks: [newBm, ...(state.bookmarks || [])] }));
      },
      updateBookmark: (id, updates) =>
        set((state) => ({
          bookmarks: (state.bookmarks || []).map((b) =>
            b.id === id ? { ...b, ...updates } : b
          )
        })),
      deleteBookmark: (id) =>
        set((state) => ({
          bookmarks: (state.bookmarks || []).filter((b) => b.id !== id)
        })),
      recordBookmarkClick: (id) =>
        set((state) => ({
          bookmarks: (state.bookmarks || []).map((b) =>
            b.id === id
              ? {
                  ...b,
                  visitCount: (b.visitCount || 0) + 1,
                  lastUsedAt: Date.now()
                }
              : b
          )
        })),
      toggleFavoriteBookmark: (id) =>
        set((state) => ({
          bookmarks: (state.bookmarks || []).map((b) =>
            b.id === id ? { ...b, favorite: !b.favorite } : b
          )
        })),
      toggleQuickLinkBookmark: (id) =>
        set((state) => ({
          bookmarks: (state.bookmarks || []).map((b) =>
            b.id === id ? { ...b, isQuickLink: !b.isQuickLink } : b
          )
        })),
      reorderBookmarks: (newBookmarks) =>
        set({ bookmarks: newBookmarks }),

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
          folders: state.folders || INITIAL_FOLDERS,
          bookmarks: state.bookmarks || INITIAL_BOOKMARKS,
          todos: state.todos || INITIAL_TODOS,
          favoriteQuoteIds: state.favoriteQuoteIds || [],
          recentTabs: state.recentTabs || INITIAL_RECENT_TABS
        };
      },
      merge: (persistedState: any, currentState) => {
        const persisted = (persistedState as any) || {};
        const mergedSettings: AppSettings = {
          ...DEFAULT_SETTINGS,
          ...(persisted.settings || {}),
          widgetVisibility: {
            ...DEFAULT_SETTINGS.widgetVisibility,
            ...(persisted.settings?.widgetVisibility || {})
          }
        };

        const merged = {
          ...currentState,
          ...persisted,
          settings: mergedSettings
        };
        if (!merged.folders || !Array.isArray(merged.folders)) {
          merged.folders = INITIAL_FOLDERS;
        }
        if (!merged.bookmarks || !Array.isArray(merged.bookmarks)) {
          merged.bookmarks = INITIAL_BOOKMARKS;
        }
        return merged;
      }
    }
  )
);
