import { RecentTab } from '../types';
import { INITIAL_RECENT_TABS } from '../mock/todos';
import { browserApi } from './browser/browserApi';

const RECENT_TABS_KEY = 'ntd_recent_tabs';

export const tabService = {
  /**
   * Fetches recent active tabs using browserApi or fallback
   */
  async getRecentTabs(): Promise<RecentTab[]> {
    try {
      const tabs = await browserApi.tabs.query({ currentWindow: true });
      if (tabs && tabs.length > 0) {
        const list: RecentTab[] = tabs
          .filter((t) => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('about:'))
          .map((t) => {
            let domain = 'google.com';
            try {
              domain = new URL(t.url || 'https://google.com').hostname;
            } catch {}
            return {
              id: String(t.id || Date.now()),
              title: t.title || 'Untitled Tab',
              url: t.url || '',
              favIconUrl: t.favIconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
              lastAccessed: Date.now() - Math.floor(Math.random() * 3600000),
              pinned: t.pinned || false
            };
          });
        if (list.length > 0) return list;
      }
    } catch (err) {
      console.warn('browserApi.tabs.query fallback:', err);
    }

    return browserApi.storage.local.get<RecentTab[]>(RECENT_TABS_KEY, INITIAL_RECENT_TABS);
  },

  async closeTab(id: string): Promise<void> {
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      try {
        await browserApi.tabs.remove(numericId);
      } catch (e) {
        console.warn('browserApi closeTab fallback:', e);
      }
    }
    const current = await browserApi.storage.local.get<RecentTab[]>(RECENT_TABS_KEY, INITIAL_RECENT_TABS);
    const updated = current.filter((t) => t.id !== id);
    await browserApi.storage.local.set(RECENT_TABS_KEY, updated);
  }
};

