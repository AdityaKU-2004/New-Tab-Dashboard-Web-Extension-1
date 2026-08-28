/**
 * Background Service Worker for Manifest V3 (Chrome & Firefox)
 * Provides foundation for extension lifecycle, messaging, tab tracking, bookmarks, and future Focus/Pomodoro modes.
 */

declare const chrome: any;
declare const browser: any;

const ext = typeof browser !== 'undefined' && browser.runtime ? browser : (typeof chrome !== 'undefined' ? chrome : null);

console.log('[Cyberpunk Pro Dashboard] Background Service Worker initializing...');

// Extension Lifecycle: Install / Update
if (ext?.runtime?.onInstalled) {
  ext.runtime.onInstalled.addListener((details: { reason: string; previousVersion?: string }) => {
    console.log('[Cyberpunk Pro Dashboard] onInstalled event:', details.reason);
  });
}

// Extension Lifecycle: Startup
if (ext?.runtime?.onStartup) {
  ext.runtime.onStartup.addListener(() => {
    console.log('[Cyberpunk Pro Dashboard] Browser startup event detected.');
  });
}

// Message Bus Router for React App & Extension Features
if (ext?.runtime?.onMessage) {
  ext.runtime.onMessage.addListener((message: any, sender: any, sendResponse: (response?: any) => void) => {
    if (!message || !message.type) return false;

    const { type, payload } = message;

    switch (type) {
      case 'PING':
        sendResponse({ status: 'PONG', timestamp: Date.now() });
        return false;

      case 'GET_BOOKMARKS':
        if (ext.bookmarks?.getTree) {
          ext.bookmarks.getTree((tree: any) => {
            sendResponse({ success: true, data: tree });
          });
          return true; // async response
        } else {
          sendResponse({ success: false, error: 'Bookmarks API unavailable' });
          return false;
        }

      case 'CREATE_BOOKMARK':
        if (ext.bookmarks?.create && payload) {
          ext.bookmarks.create(payload, (newBookmark: any) => {
            sendResponse({ success: true, data: newBookmark });
          });
          return true;
        } else {
          sendResponse({ success: false, error: 'Invalid bookmark payload or API unavailable' });
          return false;
        }

      case 'GET_ACTIVE_TABS':
        if (ext.tabs?.query) {
          ext.tabs.query({ currentWindow: true }, (tabs: any[]) => {
            sendResponse({ success: true, data: tabs });
          });
          return true;
        } else {
          sendResponse({ success: false, error: 'Tabs API unavailable' });
          return false;
        }

      case 'CLOSE_TAB':
        if (ext.tabs?.remove && payload?.tabId) {
          ext.tabs.remove(payload.tabId, () => {
            sendResponse({ success: true });
          });
          return true;
        } else {
          sendResponse({ success: false, error: 'Tab ID missing or API unavailable' });
          return false;
        }

      case 'GET_STORAGE':
        if (ext.storage?.local && payload?.key) {
          ext.storage.local.get([payload.key], (res: any) => {
            sendResponse({ success: true, data: res?.[payload.key] });
          });
          return true;
        } else {
          sendResponse({ success: false, error: 'Storage API unavailable' });
          return false;
        }

      case 'SET_STORAGE':
        if (ext.storage?.local && payload?.key) {
          ext.storage.local.set({ [payload.key]: payload.value }, () => {
            sendResponse({ success: true });
          });
          return true;
        } else {
          sendResponse({ success: false, error: 'Storage API unavailable' });
          return false;
        }

      default:
        sendResponse({ success: true, acknowledged: true });
        return false;
    }
  });
}
