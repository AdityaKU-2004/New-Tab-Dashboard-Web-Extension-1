export type ThemeMode = 'dark' | 'light' | 'system' | 'cyberpunk';

export type AccentColor = 'indigo' | 'emerald' | 'violet' | 'rose' | 'amber' | 'cyan' | 'slate';

export type SearchEngineId = 'google' | 'bing' | 'duckduckgo' | 'ecosia' | 'brave' | 'yahoo' | 'youtube' | 'gemini';

export interface SearchEngine {
  id: SearchEngineId;
  name: string;
  url: string; // Query placeholder e.g. https://www.google.com/search?q=
  icon: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
  createdAt: number;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  starred?: boolean;
  createdAt: number;
  dueDate?: string;
}

export type TodoFilter = 'all' | 'active' | 'completed';

export interface Quote {
  id: string;
  text: string;
  author: string;
  category?: string;
}

export type WallpaperCategory = 'nature' | 'abstract' | 'space' | 'mountains' | 'minimal' | 'gradient' | 'live';

export interface Wallpaper {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  category: WallpaperCategory;
  author?: string;
  isLive?: boolean;
  liveType?: 'video' | 'canvas-matrix' | 'canvas-[#id]' | 'canvas-particles' | 'canvas-cybergrid' | 'canvas-starfield' | 'canvas-rain';
  videoUrl?: string;
}

export interface RecentTab {
  id: string;
  title: string;
  url: string;
  favIconUrl?: string;
  lastAccessed: number; // timestamp
  pinned?: boolean;
}

export interface WidgetVisibility {
  clock: boolean;
  search: boolean;
  bookmarks: boolean;
  todo: boolean;
  calendar: boolean;
  quote: boolean;
  recentTabs: boolean;
  wallpaperPicker: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  clockFormat12: boolean;
  showSeconds: boolean;
  showGreeting: boolean;
  userName: string;
  searchEngine: SearchEngineId;
  backgroundBlur: number; // 0 to 20 px
  cardOpacity: number; // 0.2 to 1.0
  darkOverlayOpacity: number; // 0.0 to 0.8
  enableAnimations: boolean;
  widgetVisibility: WidgetVisibility;
}
