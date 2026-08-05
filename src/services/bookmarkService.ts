import { Bookmark } from '../types';
import { INITIAL_BOOKMARKS } from '../mock/bookmarks';
import { storage } from '../utils/storage';

const BOOKMARKS_KEY = 'ntd_bookmarks';

export const bookmarkService = {
  /**
   * Fetches bookmarks. Later can delegate to chrome.bookmarks.getTree()
   */
  async getBookmarks(): Promise<Bookmark[]> {
    if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.getTree) {
      // Future Manifest V3 extension integration path
      return new Promise((resolve) => {
        chrome.bookmarks.getTree((tree) => {
          const list: Bookmark[] = [];
          const traverse = (nodes: chrome.bookmarks.BookmarkTreeNode[]) => {
            for (const node of nodes) {
              if (node.url) {
                list.push({
                  id: node.id,
                  title: node.title || 'Untitled',
                  url: node.url,
                  icon: `https://www.google.com/s2/favicons?domain=${new URL(node.url).hostname}&sz=64`,
                  createdAt: node.dateAdded || Date.now()
                });
              }
              if (node.children) traverse(node.children);
            }
          };
          traverse(tree);
          resolve(list.length > 0 ? list : INITIAL_BOOKMARKS);
        });
      });
    }

    // Fallback to local storage
    return storage.get<Bookmark[]>(BOOKMARKS_KEY, INITIAL_BOOKMARKS);
  },

  async addBookmark(title: string, url: string, category?: string): Promise<Bookmark> {
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    let domain = formattedUrl;
    try {
      domain = new URL(formattedUrl).hostname;
    } catch {
      // keep fallback
    }

    const newBookmark: Bookmark = {
      id: 'bm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title,
      url: formattedUrl,
      icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      category: category || 'General',
      createdAt: Date.now()
    };

    if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.create) {
      try {
        await chrome.bookmarks.create({ title, url: formattedUrl });
      } catch (e) {
        console.warn('Chrome bookmark create failed, using local storage fallback:', e);
      }
    }

    const current = storage.get<Bookmark[]>(BOOKMARKS_KEY, INITIAL_BOOKMARKS);
    const updated = [newBookmark, ...current];
    storage.set(BOOKMARKS_KEY, updated);
    return newBookmark;
  },

  async deleteBookmark(id: string): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.remove) {
      try {
        await chrome.bookmarks.remove(id);
      } catch (e) {
        console.warn('Chrome bookmark remove failed:', e);
      }
    }
    const current = storage.get<Bookmark[]>(BOOKMARKS_KEY, INITIAL_BOOKMARKS);
    const updated = current.filter((b) => b.id !== id);
    storage.set(BOOKMARKS_KEY, updated);
  }
};
