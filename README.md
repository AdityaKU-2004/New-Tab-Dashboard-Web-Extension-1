# Cyberpunk Pro New Tab & HUD Dashboard (Manifest V3)

A high-performance, tactical Cyberpunk HUD New Tab browser extension built with React 19, TypeScript, Tailwind CSS, and Vite. Designed as a production-ready Manifest V3 extension for both **Google Chrome / Chromium** and **Mozilla Firefox**.

---

## ⚡ Quick Start

### 1. Development Mode
Run the development server locally with live hot-reloading:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to work on the UI. The dashboard automatically uses local storage / mock fallbacks when running outside an extension runtime.

### 2. Build for Production (Chrome & Firefox)
Generate self-contained, validated Manifest V3 extensions for both browsers with a single command:

```bash
npm run build
```

This compiles the React application, background service workers, and generates:

```
dist/
├── chrome-dist/
│   ├── manifest.json
│   ├── index.html
│   ├── service-worker.js
│   ├── assets/
│   │   ├── ...
│   └── icons/
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png
│
└── firefox-dist/
    ├── manifest.json
    ├── index.html
    ├── service-worker.js
    ├── assets/
    │   ├── ...
    └── icons/
        ├── icon16.png
        ├── icon32.png
        ├── icon48.png
        └── icon128.png
```

---

## 🚀 Browser Installation Instructions

### Chrome / Chromium (Brave, Edge, Opera)
1. Open Google Chrome and navigate to: `chrome://extensions`
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `dist/chrome-dist` folder in this project.
5. Open a new tab (`Ctrl + T` / `Cmd + T`) to enjoy your Cyberpunk HUD dashboard!

### Mozilla Firefox
1. Open Firefox and navigate to: `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select the `dist/firefox-dist/manifest.json` file.
4. Open a new tab to see the HUD dashboard active.

---

## 🏛️ Extension Architecture

- **Manifest V3 Standards**: Clean separation of Chrome (`extension/manifest.chrome.json`) and Firefox (`extension/manifest.firefox.json`) declarations.
- **Background Service Worker** (`extension/background/service-worker.ts`):
  - Lightweight lifecycle manager (`onInstalled`, `onStartup`).
  - Asynchronous message bus for storage, tab queries, and bookmarks.
- **Unified Browser API Abstraction** (`src/services/browser/browserApi.ts`):
  - Provides a single, unified interface for `storage`, `bookmarks`, `tabs`, `runtime`, and `identity`.
  - Supports both `chrome.*` and `browser.*` APIs.
  - Automatically falls back to `localStorage` during standard web development.
- **Strict Content Security Policy (CSP)**:
  - 100% self-contained JavaScript and CSS bundling.
  - No unsafe `eval()`, inline scripts, or remote CDN dependencies.
- **Preserved Application Features**:
  - Full Developer & Cyberpunk HUD themes.
  - Jet Avionics Telemetry & Attitude Indicator (PFD).
  - Unread Gmail synchronization with native `chrome.identity` support.
  - Bookmarks manager with live browser sync.
  - Active Tab switchboard & Quick Launch pads.
  - Daily Pomodoro, Tasks, Calendar, Notes, Quotes, and Wallpapers.
