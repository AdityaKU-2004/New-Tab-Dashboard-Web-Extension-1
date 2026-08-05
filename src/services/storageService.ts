import { storage } from '../utils/storage';

export const storageService = {
  sync: {
    get: async <T>(key: string, defaultValue: T): Promise<T> => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        return new Promise((resolve) => {
          chrome.storage.sync.get([key], (result) => {
            resolve(result[key] !== undefined ? (result[key] as T) : defaultValue);
          });
        });
      }
      return storage.get<T>(key, defaultValue);
    },
    set: async <T>(key: string, value: T): Promise<void> => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        return new Promise((resolve) => {
          chrome.storage.sync.set({ [key]: value }, () => resolve());
        });
      }
      storage.set<T>(key, value);
    }
  },
  local: {
    get: async <T>(key: string, defaultValue: T): Promise<T> => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.get([key], (result) => {
            resolve(result[key] !== undefined ? (result[key] as T) : defaultValue);
          });
        });
      }
      return storage.get<T>(key, defaultValue);
    },
    set: async <T>(key: string, value: T): Promise<void> => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.set({ [key]: value }, () => resolve());
        });
      }
      storage.set<T>(key, value);
    }
  }
};
