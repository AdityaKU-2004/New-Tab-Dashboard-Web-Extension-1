import { browserApi } from './browser/browserApi';

export const storageService = {
  sync: {
    get: async <T>(key: string, defaultValue: T): Promise<T> => {
      return browserApi.storage.sync.get<T>(key, defaultValue);
    },
    set: async <T>(key: string, value: T): Promise<void> => {
      return browserApi.storage.sync.set<T>(key, value);
    }
  },
  local: {
    get: async <T>(key: string, defaultValue: T): Promise<T> => {
      return browserApi.storage.local.get<T>(key, defaultValue);
    },
    set: async <T>(key: string, value: T): Promise<void> => {
      return browserApi.storage.local.set<T>(key, value);
    },
    remove: async (key: string): Promise<void> => {
      return browserApi.storage.local.remove(key);
    },
    clear: async (): Promise<void> => {
      return browserApi.storage.local.clear();
    }
  }
};

