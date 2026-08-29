# 🌌 Cyberpunk Pro New Tab & HUD Dashboard

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-cyan.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Cyberpunk Pro New Tab & HUD Dashboard** is a high-performance, tactical browser extension that transforms your browser's default New Tab page into an immersive cockpit and developer command center. Engineered as a production-grade **Manifest V3** extension, it simultaneously targets both **Google Chrome / Chromium browsers** (Brave, Edge, Opera) and **Mozilla Firefox** with zero external runtime dependencies.

---

## 📑 Table of Contents

- [Features Overview](#-features-overview)
- [Tech Stack](#-tech-stack)
- [Architecture & Manifest V3 Design](#-architecture--manifest-v3-design)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development (`npm run dev`)](#1-local-development-mode)
  - [Production Extension Build (`npm run build`)](#2-production-extension-build)
- [Browser Installation Instructions](#-browser-installation-instructions)
  - [Google Chrome, Brave, Edge & Chromium](#google-chrome--chromium-based-browsers)
  - [Mozilla Firefox](#mozilla-firefox)
- [Security & Content Security Policy (CSP)](#-security--content-security-policy-csp)
- [Google & Extension Identity Configuration](#-google--extension-identity-configuration)
- [Available NPM Scripts](#-available-npm-scripts)
- [License](#-license)

---

## ⚡ Features Overview

### 1. 🛩️ Tactical Cockpit & Avionics Telemetry
- **Attitude Indicator (PFD)**: Real-time artificial horizon, pitch ladder, roll bank angle, and flight director crosshairs.
- **Flight Data Tapes**: Airspeed indicator (knots/mach), barometric altitude tape (MSL/FL), vertical speed gauge (FPM), and heading compass rose.
- **HUD Diagnostics**: Engine N1/EGT gauges, G-meter, Mach readouts, weapon/system radar sweeps, and live FPS telemetry.
- **Simulated & Interactive Mode**: Toggle between active telemetry simulations and interactive mouse/sensor control.

### 2. 📬 Unread Gmail Synchronization
- **Native Extension Identity**: Seamless 1-click Google authentication via `chrome.identity` with no popup redirection needed in unpacked extensions.
- **Web OAuth & Token Support**: Direct bearer token input option for testing in sandboxed web preview environments.
- **Inbox Zero Status**: Real-time unread badges, sender metadata, message snippet preview, relative timestamps, and 1-click deep links to Gmail.

### 3. 💻 Developer & GitHub Suite
- **Developer Theme**: High-contrast, clean GitHub Dark (`#0D1117`) theme built specifically for coding sessions.
- **GitHub Integration**: Monitor public/private repositories, pull requests, open issues, commit activity, and contribution graphs using Personal Access Tokens (PAT).
- **Quick Command Bar**: Keyboard-first tactical launcher for rapid access to developer tools, search engines, and shortcuts.

### 4. 🔖 Smart Link & Bookmarks Manager
- **Browser Bookmarks Sync**: Bi-directional integration with `chrome.bookmarks` and Firefox bookmarks via unified abstraction.
- **Categorization & Favicon Resolution**: Automatic category tagging and high-resolution favicon resolution with offline fallback.

### 5. 🗂️ Tab Switchboard & Session Manager
- **Live Tab Querying**: View and search all open tabs across browser windows via `chrome.tabs`.
- **1-Click Tab Actions**: Switch to active tabs, pin/unpin tabs, or close background tabs to reclaim system memory.

### 6. ⏱️ Focus & Productivity Tools
- **Pomodoro Timer**: Customizable focus intervals, short/long breaks, and audio/visual interval notifications.
- **Task & Goal Matrix**: Prioritized daily task checklist with completion progress tracking.
- **Scratchpad & Notes**: Persistent markdown-ready notes editor for capturing snippets, code, and thoughts.
- **Calendar & Daily Brief**: Synchronized daily schedule preview and weather/inspirational quote widgets.

### 7. 🎨 Themes & Customization
- **Cyberpunk HUD**: Neon cyan (`#00f3ff`) and magenta (`#ff0055`) tactical interface with scanlines and grid canvas.
- **Developer Mode**: Minimalist, distraction-free GitHub aesthetic.
- **Dark & Light Modes**: Neutral modern colorways with WCAG AA-compliant contrast ratios.
- **Wallpaper Engine**: Built-in curated cyberpunk wallpapers, custom image URL support, blur controls, and opacity adjustment.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | Component framework and state rendering |
| **TypeScript 5** | Strict type safety and unified interface definitions |
| **Tailwind CSS 4** | Ultra-performant CSS utility styling and theming |
| **Vite** | Bundler with relative asset resolution (`base: './'`) |
| **Zustand** | Lightweight, reactive state management with local persistence |
| **Lucide React** | Clean, scalable vector icon library |
| **esbuild** | Fast standalone compilation for background service workers |
| **Node.js Scripts** | Dual-browser automated Manifest V3 assembly pipeline |

---

## 🏛 Architecture & Manifest V3 Design

```
                     ┌────────────────────────────────┐
                     │   New Tab React Dashboard      │
                     │  (index.html + React 19 + UI)  │
                     └───────────────┬────────────────┘
                                     │
                     ┌───────────────▼────────────────┐
                     │   Browser API Abstraction      │
                     │ (src/services/browserApi.ts)   │
                     └───────┬───────────────┬────────┘
                             │               │
            ┌────────────────▼───┐       ┌───▼────────────────┐
            │  chrome.* APIs     │       │  browser.* APIs    │
            │  (Chrome / Edge)   │       │  (Mozilla Firefox) │
            └────────────────┬───┘       └───┬────────────────┘
                             │               │
                     ┌───────▼───────────────▼────────┐
                     │   Background Service Worker    │
                     │  (extension/service-worker.ts) │
                     └────────────────────────────────┘
```

- **Universal WebExtension Abstraction (`src/services/browser/browserApi.ts`)**: React UI components never call `chrome.*` or `browser.*` directly. The abstraction layer wraps `storage`, `bookmarks`, `tabs`, `runtime`, and `identity`, gracefully falling back to `localStorage` when running in a standard web browser.
- **Background Service Worker (`extension/background/service-worker.ts`)**: Compliant with Manifest V3 service worker lifecycle rules (`onInstalled`, `onStartup`) and acts as a central message bus.
- **Self-Contained Bundles**: No remote scripts or CDN dependencies are loaded at runtime, ensuring full compliance with browser store security policies.

---

## 📂 Project Directory Structure

```
.
├── extension/                       # WebExtension source definitions
│   ├── background/
│   │   └── service-worker.ts        # Manifest V3 service worker entry point
│   ├── shared/
│   │   └── browser-api.ts           # Background worker API helper
│   ├── manifest.chrome.json         # Chrome / Chromium Manifest V3 source
│   └── manifest.firefox.json        # Firefox Manifest V3 source (Gecko ID configured)
│
├── public/                          # Static assets
│   ├── icons/                       # Extension icons (16x16, 32x32, 48x48, 128x128)
│   └── manifest.json                # Web manifest fallback
│
├── scripts/                         # Build & validation toolchain
│   ├── build-extension.mjs          # Dual-browser Manifest V3 build pipeline
│   └── generate-icons.mjs           # Automated PNG icon generation script
│
├── src/                             # React Dashboard application source
│   ├── assets/                      # Bundled background wallpapers and graphics
│   ├── components/                  # UI widgets (Cockpit, Gmail, GitHub, Tabs, etc.)
│   │   ├── avionics/                # HUD, PFD, and flight telemetry widgets
│   │   ├── bookmarks/               # Smart bookmark manager
│   │   ├── gmail/                   # Unread Gmail inbox widget
│   │   ├── settings/                # Customization & OAuth settings drawer
│   │   └── tabs/                    # Active tab switchboard
│   ├── hooks/                       # Custom React hooks
│   ├── services/                    # Service layer
│   │   ├── browser/                 # Unified browser API abstraction
│   │   ├── bookmarkService.ts       # Bookmarks controller
│   │   ├── githubService.ts         # GitHub API client
│   │   ├── gmailService.ts          # Gmail REST API client
│   │   ├── googleAuthService.ts     # Chrome Identity & OAuth controller
│   │   ├── storageService.ts        # Storage persistence controller
│   │   └── tabService.ts            # Browser tabs controller
│   ├── store/                       # Zustand dashboard state stores
│   ├── types/                       # TypeScript interfaces and types
│   ├── App.tsx                      # Dashboard root layout component
│   ├── index.css                    # Tailwind CSS configuration
│   └── main.tsx                     # React application entry point
│
├── dist/                            # Generated production outputs (after npm run build)
│   ├── chrome-dist/                 # Self-contained Chrome / Chromium extension
│   └── firefox-dist/                # Self-contained Firefox extension
│
├── index.html                       # Extension HTML entry point
├── package.json                     # Project manifest and scripts
├── tsconfig.json                    # TypeScript compiler options
├── vite.config.ts                   # Vite bundler configuration
└── LICENSE                          # MIT License
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher (or Bun / Yarn)

### 1. Local Development Mode

To run the interactive dashboard in your browser with hot module reloading:

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev
```

Navigate to `http://localhost:3000`. In development mode, mock data and `localStorage` are automatically utilized whenever browser extension APIs are not present.

### 2. Production Extension Build

To compile and package the extension for both Chrome and Firefox in a single command:

```bash
npm run build
```

This single command executes the automated pipeline:
1. Generates icons in `public/icons/` (`icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`).
2. Cleans previous `dist/` artifacts.
3. Compiles the React dashboard using Vite with relative asset paths.
4. Bundles the background service worker using `esbuild`.
5. Assembles `dist/chrome-dist/` with `manifest.chrome.json` renamed to `manifest.json`.
6. Assembles `dist/firefox-dist/` with `manifest.firefox.json` renamed to `manifest.json`.
7. Performs automated validation verifying all required assets, HTML, and manifest schemas exist.

---

## 🌐 Browser Installation Instructions

### Google Chrome & Chromium-Based Browsers
*(Google Chrome, Brave, Microsoft Edge, Opera, Vivaldi, Arc)*

1. Run `npm run build` in the project root.
2. Open your browser and navigate to the Extensions management page:
   - **Chrome**: `chrome://extensions`
   - **Brave**: `brave://extensions`
   - **Edge**: `edge://extensions`
3. Toggle on **Developer mode** in the top-right corner.
4. Click the **Load unpacked** button in the top toolbar.
5. Select the **`dist/chrome-dist`** directory located in this project.
6. Open a new tab (`Ctrl + T` / `Cmd + T`). Your Cyberpunk Pro HUD Dashboard is now active!

---

### Mozilla Firefox

1. Run `npm run build` in the project root.
2. Open Firefox and navigate to:
   ```
   about:debugging#/runtime/this-firefox
   ```
3. Click the **Load Temporary Add-on...** button.
4. Browse to the project and select the file:
   ```
   dist/firefox-dist/manifest.json
   ```
5. Open a new tab (`Ctrl + T` / `Cmd + T`) to preview the extension.

---

## 🔒 Security & Content Security Policy (CSP)

This project strictly adheres to browser extension security standards:

- **Manifest V3 Compliant**: Uses background service workers instead of persistent Manifest V2 background pages.
- **No Remote Code**: Does not use `eval()`, `new Function()`, or dynamic remote script injections.
- **Strict Bundling**: All JavaScript, CSS, fonts, and assets are bundled locally into the extension distribution.
- **Minimal Permissions Principle**:
  - `storage`: For saving user settings, layout preferences, and custom widgets.
  - `bookmarks`: For reading and organizing bookmarks.
  - `tabs`: For the active tab manager switchboard.
  - `identity`: For native 1-click Google OAuth authentication in Chrome.

---

## 🔑 Google & Extension Identity Configuration

When installed as an unpacked Chrome Extension:
1. Open the dashboard and locate the **Unread Gmail** widget or open the **Settings** drawer.
2. Click **Sign in with Google**.
3. Chrome will automatically invoke `chrome.identity` using your current signed-in Google profile.
4. *(Optional)* If you wish to use a custom Google Cloud Project OAuth Client ID for your own published extension ID, open **Settings → Google & Extension Identity → Configure Custom OAuth Client ID** to provide your custom client ID.

---

## 📜 Available NPM Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts local Vite development server on port 3000 |
| `npm run build` | Builds complete `dist/chrome-dist` and `dist/firefox-dist` extension packages |
| `npm run build:extension` | Alias for the extension build pipeline |
| `npm run build:web` | Standard Vite build into `dist/` for web-only hosting |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Removes the `dist/` directory |

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.

```
Copyright (c) 2026 Cyberpunk Pro New Tab & HUD Dashboard Contributors
```
