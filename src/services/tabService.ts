import { RecentTab } from '../types';
import { INITIAL_RECENT_TABS } from '../mock/todos';
import { storage } from '../utils/storage';

const RECENT_TABS_KEY = 'ntd_recent_tabs';

export const tabService = {
  /**
   * Fetches recent tabs or simulates chrome.tabs API
   */
  async getRecentTabs(): Promise<RecentTab[]> {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      return new Promise((resolve) => {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          const list: RecentTab[] = tabs
            .filter((t) => t.url && !t.url.startsWith('chrome://'))
            .map((t) => ({
              id: String(t.id || Date.now()),
              title: t.title || 'Untitled Tab',
              url: t.url || '',
              favIconUrl: t.favIconUrl || `https://www.google.com/s2/favicons?domain=${new URL(t.url || 'https://google.com').hostname}&sz=32`,
              lastAccessed: Date.now() - Math.floor(Math.random() * 3600000),
              pinned: t.pinned || false
            }));
          resolve(list.length > 0 ? list : INITIAL_RECENT_TABS);
        });
      });
    }

    return storage.get<RecentTab[]>(RECENT_TABS_KEY, INITIAL_RECENT_TABS);
  },

  async closeTab(id: string): Promise<void> {
    const current = storage.get<RecentTab[]>(RECENT_TABS_KEY, INITIAL_RECENT_TABS);
    const updated = current.filter((t) => t.id !== id);
    storage.set(RECENT_TABS_KEY, updated);
  }
};
