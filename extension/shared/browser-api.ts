/**
 * Shared Browser API Abstraction for Extension scripts & Background Worker
 */

declare const chrome: any;
declare const browser: any;

export const getRuntime = () => {
  if (typeof browser !== 'undefined' && browser.runtime) return browser;
  if (typeof chrome !== 'undefined' && chrome.runtime) return chrome;
  return null;
};

export const isExtension = (): boolean => {
  return (
    (typeof chrome !== 'undefined' && (!!chrome.runtime?.id || !!chrome.storage)) ||
    (typeof browser !== 'undefined' && (!!browser.runtime?.id || !!browser.storage))
  );
};

export const extensionStorage = {
  get: async <T>(key: string, defaultValue: T): Promise<T> => {
    const ext = getRuntime();
    if (ext?.storage?.local) {
      return new Promise<T>((resolve) => {
        ext.storage.local.get([key], (result: Record<string, any>) => {
          if (ext.runtime?.lastError) {
            resolve(defaultValue);
          } else {
            resolve(result && result[key] !== undefined ? (result[key] as T) : defaultValue);
          }
        });
      });
    }
    return defaultValue;
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    const ext = getRuntime();
    if (ext?.storage?.local) {
      return new Promise<void>((resolve) => {
        ext.storage.local.set({ [key]: value }, () => resolve());
      });
    }
  },
};
