import { Bookmark } from '../types';
import { INITIAL_BOOKMARKS } from '../mock/bookmarks';
import { browserApi, BookmarkItem } from './browser/browserApi';

const BOOKMARKS_KEY = 'ntd_bookmarks';

export const bookmarkService = {
  /**
   * Fetches bookmarks using browserApi with fallback to stored/mock bookmarks
   */
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const tree = await browserApi.bookmarks.getTree();
      if (tree && tree.length > 0) {
        const list: Bookmark[] = [];
        const traverse = (nodes: BookmarkItem[]) => {
          for (const node of nodes) {
            if (node.url) {
              let domain = 'google.com';
              try {
                domain = new URL(node.url).hostname;
              } catch {}
              list.push({
                id: node.id,
                title: node.title || 'Untitled',
                url: node.url,
                icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
                createdAt: node.dateAdded || Date.now()
              });
            }
            if (node.children) traverse(node.children);
          }
        };
        traverse(tree);
        if (list.length > 0) return list;
      }
    } catch (err) {
      console.warn('browserApi.bookmarks.getTree fallback:', err);
    }

    // Fallback to extension/local storage
    return browserApi.storage.local.get<Bookmark[]>(BOOKMARKS_KEY, INITIAL_BOOKMARKS);
  },

  async addBookmark(title: string, url: string, category?: string): Promise<Bookmark> {
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    let domain = formattedUrl;
    try {
      domain = new URL(formattedUrl).hostname;
    } catch {}

    const newBookmark: Bookmark = {
      id: 'bm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title,
      url: formattedUrl,
      icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      category: category || 'General',
      createdAt: Date.now()
    };

    try {
      await browserApi.bookmarks.create({ title, url: formattedUrl });
    } catch (e) {
      console.warn('browserApi bookmark create fallback:', e);
    }

    const current = await browserApi.storage.local.get<Bookmark[]>(BOOKMARKS_KEY, INITIAL_BOOKMARKS);
    const updated = [newBookmark, ...current];
    await browserApi.storage.local.set(BOOKMARKS_KEY, updated);
    return newBookmark;
  },

  async deleteBookmark(id: string): Promise<void> {
    try {
      await browserApi.bookmarks.remove(id);
    } catch (e) {
      console.warn('browserApi bookmark remove fallback:', e);
    }
    const current = await browserApi.storage.local.get<Bookmark[]>(BOOKMARKS_KEY, INITIAL_BOOKMARKS);
    const updated = current.filter((b) => b.id !== id);
    await browserApi.storage.local.set(BOOKMARKS_KEY, updated);
  }
};

