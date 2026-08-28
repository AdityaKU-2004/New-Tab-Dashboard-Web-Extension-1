/**
 * Unified Browser API Abstraction Layer
 * Supports Chrome (MV3), Firefox (MV3), and graceful fallback to LocalStorage / Mock in Web Dev.
 */

// Define global types for WebExtension environments
declare const chrome: any;
declare const browser: any;

export interface BookmarkItem {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkItem[];
  dateAdded?: number;
}

export interface TabItem {
  id?: number | string;
  title?: string;
  url?: string;
  favIconUrl?: string;
  active?: boolean;
  pinned?: boolean;
  windowId?: number;
}

/**
 * Detect runtime environment
 */
export const isBrowserExtension = (): boolean => {
  return (
    (typeof chrome !== 'undefined' && (!!chrome.runtime?.id || !!chrome.storage)) ||
    (typeof browser !== 'undefined' && (!!browser.runtime?.id || !!browser.storage))
  );
};

export const getExtensionRuntime = () => {
  if (typeof browser !== 'undefined' && browser.runtime) return browser;
  if (typeof chrome !== 'undefined' && chrome.runtime) return chrome;
  return null;
};

/**
 * Storage Abstraction
 */
const storage = {
  local: {
    get: async <T>(key: string, defaultValue: T): Promise<T> => {
      const ext = getExtensionRuntime();
      if (ext?.storage?.local) {
        try {
          if (typeof ext.storage.local.get === 'function') {
            return new Promise<T>((resolve) => {
              ext.storage.local.get([key], (result: Record<string, any>) => {
                if (ext.runtime?.lastError) {
                  console.warn('storage.local.get error:', ext.runtime.lastError);
                  resolve(fallbackGet(key, defaultValue));
                  return;
                }
                resolve(result && result[key] !== undefined ? (result[key] as T) : defaultValue);
              });
            });
          }
        } catch (e) {
          console.warn('Storage API exception, falling back:', e);
        }
      }
      return fallbackGet(key, defaultValue);
    },

    set: async <T>(key: string, value: T): Promise<void> => {
      const ext = getExtensionRuntime();
      if (ext?.storage?.local) {
        try {
          if (typeof ext.storage.local.set === 'function') {
            return new Promise<void>((resolve) => {
              ext.storage.local.set({ [key]: value }, () => {
                fallbackSet(key, value);
                resolve();
              });
            });
          }
        } catch (e) {
          console.warn('Storage API set exception, falling back:', e);
        }
      }
      fallbackSet(key, value);
    },

    remove: async (key: string): Promise<void> => {
      const ext = getExtensionRuntime();
      if (ext?.storage?.local?.remove) {
        return new Promise<void>((resolve) => {
          ext.storage.local.remove([key], () => {
            try {
              localStorage.removeItem(key);
            } catch {}
            resolve();
          });
        });
      }
      try {
        localStorage.removeItem(key);
      } catch {}
    },

    clear: async (): Promise<void> => {
      const ext = getExtensionRuntime();
      if (ext?.storage?.local?.clear) {
        return new Promise<void>((resolve) => {
          ext.storage.local.clear(() => {
            try {
              localStorage.clear();
            } catch {}
            resolve();
          });
        });
      }
      try {
        localStorage.clear();
      } catch {}
    },
  },

  sync: {
    get: async <T>(key: string, defaultValue: T): Promise<T> => {
      const ext = getExtensionRuntime();
      if (ext?.storage?.sync) {
        try {
          return new Promise<T>((resolve) => {
            ext.storage.sync.get([key], (result: Record<string, any>) => {
              if (ext.runtime?.lastError) {
                resolve(storage.local.get(key, defaultValue));
                return;
              }
              resolve(result && result[key] !== undefined ? (result[key] as T) : defaultValue);
            });
          });
        } catch {}
      }
      return storage.local.get(key, defaultValue);
    },

    set: async <T>(key: string, value: T): Promise<void> => {
      const ext = getExtensionRuntime();
      if (ext?.storage?.sync) {
        try {
          return new Promise<void>((resolve) => {
            ext.storage.sync.set({ [key]: value }, () => {
              storage.local.set(key, value);
              resolve();
            });
          });
        } catch {}
      }
      return storage.local.set(key, value);
    },
  },
};

/**
 * Bookmarks Abstraction
 */
const bookmarks = {
  getTree: async (): Promise<BookmarkItem[]> => {
    const ext = getExtensionRuntime();
    if (ext?.bookmarks?.getTree) {
      return new Promise<BookmarkItem[]>((resolve, reject) => {
        ext.bookmarks.getTree((tree: BookmarkItem[]) => {
          if (ext.runtime?.lastError) {
            reject(new Error(ext.runtime.lastError.message));
          } else {
            resolve(tree || []);
          }
        });
      });
    }
    return [];
  },

  create: async (bookmark: { title: string; url?: string; parentId?: string }): Promise<BookmarkItem | null> => {
    const ext = getExtensionRuntime();
    if (ext?.bookmarks?.create) {
      return new Promise<BookmarkItem | null>((resolve, reject) => {
        ext.bookmarks.create(bookmark, (result: BookmarkItem) => {
          if (ext.runtime?.lastError) {
            reject(new Error(ext.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      });
    }
    return null;
  },

  remove: async (id: string): Promise<boolean> => {
    const ext = getExtensionRuntime();
    if (ext?.bookmarks?.remove) {
      return new Promise<boolean>((resolve) => {
        ext.bookmarks.remove(id, () => {
          resolve(!ext.runtime?.lastError);
        });
      });
    }
    return false;
  },

  search: async (query: string): Promise<BookmarkItem[]> => {
    const ext = getExtensionRuntime();
    if (ext?.bookmarks?.search) {
      return new Promise<BookmarkItem[]>((resolve) => {
        ext.bookmarks.search(query, (results: BookmarkItem[]) => {
          resolve(results || []);
        });
      });
    }
    return [];
  },
};

/**
 * Tabs Abstraction
 */
const tabs = {
  query: async (queryInfo: { currentWindow?: boolean; active?: boolean }): Promise<TabItem[]> => {
    const ext = getExtensionRuntime();
    if (ext?.tabs?.query) {
      return new Promise<TabItem[]>((resolve) => {
        ext.tabs.query(queryInfo, (resultTabs: TabItem[]) => {
          if (ext.runtime?.lastError) {
            console.warn('tabs.query error:', ext.runtime.lastError);
            resolve([]);
            return;
          }
          resolve(resultTabs || []);
        });
      });
    }
    return [];
  },

  create: async (createProperties: { url: string; active?: boolean }): Promise<TabItem | null> => {
    const ext = getExtensionRuntime();
    if (ext?.tabs?.create) {
      return new Promise<TabItem | null>((resolve) => {
        ext.tabs.create(createProperties, (tab: TabItem) => {
          resolve(tab || null);
        });
      });
    } else {
      window.open(createProperties.url, createProperties.active === false ? '_blank' : '_self');
      return null;
    }
  },

  remove: async (tabId: number): Promise<void> => {
    const ext = getExtensionRuntime();
    if (ext?.tabs?.remove) {
      return new Promise<void>((resolve) => {
        ext.tabs.remove(tabId, () => resolve());
      });
    }
  },

  getCurrent: async (): Promise<TabItem | null> => {
    const ext = getExtensionRuntime();
    if (ext?.tabs?.getCurrent) {
      return new Promise<TabItem | null>((resolve) => {
        ext.tabs.getCurrent((tab: TabItem) => resolve(tab || null));
      });
    }
    return null;
  },
};

/**
 * Runtime Messaging Abstraction
 */
const runtime = {
  sendMessage: async <T = any, R = any>(message: T): Promise<R | null> => {
    const ext = getExtensionRuntime();
    if (ext?.runtime?.sendMessage) {
      return new Promise<R | null>((resolve) => {
        ext.runtime.sendMessage(message, (response: R) => {
          if (ext.runtime?.lastError) {
            console.warn('runtime.sendMessage error:', ext.runtime.lastError);
            resolve(null);
          } else {
            resolve(response);
          }
        });
      });
    }
    return null;
  },

  onMessage: {
    addListener: (callback: (message: any, sender: any, sendResponse: (res?: any) => void) => void) => {
      const ext = getExtensionRuntime();
      if (ext?.runtime?.onMessage?.addListener) {
        ext.runtime.onMessage.addListener(callback);
      }
    },
    removeListener: (callback: (...args: any[]) => void) => {
      const ext = getExtensionRuntime();
      if (ext?.runtime?.onMessage?.removeListener) {
        ext.runtime.onMessage.removeListener(callback);
      }
    },
  },

  getURL: (path: string): string => {
    const ext = getExtensionRuntime();
    if (ext?.runtime?.getURL) {
      return ext.runtime.getURL(path);
    }
    return path;
  },

  openOptionsPage: (): void => {
    const ext = getExtensionRuntime();
    if (ext?.runtime?.openOptionsPage) {
      ext.runtime.openOptionsPage();
    }
  },
};

/**
 * Identity Abstraction (Chrome / Firefox OAuth)
 */
const identity = {
  getAuthToken: async (options: { interactive: boolean }): Promise<string> => {
    const ext = getExtensionRuntime();
    if (ext?.identity?.getAuthToken) {
      return new Promise<string>((resolve, reject) => {
        ext.identity.getAuthToken(options, (token: string) => {
          if (ext.runtime?.lastError || !token) {
            reject(new Error(ext.runtime?.lastError?.message || 'Failed to acquire auth token'));
          } else {
            resolve(token);
          }
        });
      });
    }
    throw new Error('Identity API not available in current environment');
  },

  launchWebAuthFlow: async (options: { url: string; interactive: boolean }): Promise<string> => {
    const ext = getExtensionRuntime();
    if (ext?.identity?.launchWebAuthFlow) {
      return new Promise<string>((resolve, reject) => {
        ext.identity.launchWebAuthFlow(options, (responseUrl: string) => {
          if (ext.runtime?.lastError || !responseUrl) {
            reject(new Error(ext.runtime?.lastError?.message || 'Web auth flow cancelled or failed'));
          } else {
            resolve(responseUrl);
          }
        });
      });
    }
    throw new Error('launchWebAuthFlow not available');
  },

  removeCachedAuthToken: async (options: { token: string }): Promise<void> => {
    const ext = getExtensionRuntime();
    if (ext?.identity?.removeCachedAuthToken) {
      return new Promise<void>((resolve) => {
        ext.identity.removeCachedAuthToken(options, () => resolve());
      });
    }
  },
};

// Fallback helpers for browser development without throwing
function fallbackGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function fallbackSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * Export unified Browser API instance
 */
export const browserApi = {
  isExtension: isBrowserExtension(),
  storage,
  bookmarks,
  tabs,
  runtime,
  identity,
};

export default browserApi;
