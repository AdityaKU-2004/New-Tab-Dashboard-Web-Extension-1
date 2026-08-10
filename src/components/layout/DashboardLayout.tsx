import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Header } from './Header';
import { ClockDisplay } from '../clock/ClockDisplay';
import { SearchBar } from '../search/SearchBar';
import { BookmarkGrid } from '../bookmarks/BookmarkGrid';
import { TodoList } from '../todo/TodoList';
import { CalendarWidget } from '../calendar/CalendarWidget';
import { QuoteCard } from '../quote/QuoteCard';
import { RecentTabsList } from '../recentTabs/RecentTabsList';
import { SettingsDrawer } from '../settings/SettingsDrawer';
import { WallpaperPicker } from '../wallpaper/WallpaperPicker';
import { CyberHudStats } from '../cyberpunk/CyberHudStats';
import { CyberpunkSportsSpeedometer } from '../cyberpunk/CyberpunkSportsSpeedometer';
import { LiveCanvasWallpaper } from '../wallpaper/LiveCanvasWallpaper';
import { DeveloperLayout } from '../developer/DeveloperLayout';
import { GitHubDailyTasks } from '../developer/github/GitHubDailyTasks';
import { UnreadGmailWidget } from '../gmail/UnreadGmailWidget';
import { useTheme } from '../../hooks/useTheme';

export const DashboardLayout: React.FC = () => {
  const selectedWallpaper = useDashboardStore((state) => state.selectedWallpaper);
  const { widgetVisibility, darkOverlayOpacity, theme, speedometerPlacement } = useDashboardStore((state) => state.settings);
  useTheme(); // Initializes light/dark theme class and accent variables

  if (theme === 'developer') {
    return <DeveloperLayout />;
  }

  const isGradient = selectedWallpaper.url.startsWith('gradient:');
  const isLiveCanvas = selectedWallpaper.url.startsWith('live:canvas-') || (selectedWallpaper.liveType && selectedWallpaper.liveType.startsWith('canvas-'));
  const isLiveVideo = selectedWallpaper.liveType === 'video' || selectedWallpaper.url.endsWith('.mp4') || selectedWallpaper.url.endsWith('.webm') || selectedWallpaper.url.startsWith('data:video/');
  const canvasType = selectedWallpaper.liveType || selectedWallpaper.url.replace('live:', '');

  const isCyberpunk = theme === 'cyberpunk';

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden font-sans dark:text-slate-100 light:text-slate-900 flex flex-col justify-between selection:bg-accent selection:text-white ${isCyberpunk ? 'cyberpunk cyber-scanlines' : ''}`}>
      {/* Outer Rainmeter Cyberpunk Screen HUD Frame */}
      {isCyberpunk && <div className="cyberpunk-screen-frame pointer-events-none" />}

      {/* Wallpaper Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {isLiveCanvas ? (
          <LiveCanvasWallpaper type={canvasType} />
        ) : isLiveVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-all duration-700 scale-105"
            src={selectedWallpaper.videoUrl || selectedWallpaper.url}
          />
        ) : isGradient ? (
          <div
            className="w-full h-full transition-all duration-700"
            style={{ background: selectedWallpaper.url.replace('gradient:', '') }}
          />
        ) : (
          <img
            src={selectedWallpaper.url}
            alt={selectedWallpaper.name}
            className="w-full h-full object-cover transition-all duration-700 scale-105"
          />
        )}

        {/* Frosted Glass Mesh Gradient Blur Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-[35%] right-[25%] w-[40%] h-[40%] rounded-full bg-rose-600/15 blur-[130px] pointer-events-none" />

        {/* Customizable Dark/Light Tint Overlay */}
        <div
          className="absolute inset-0 dark:bg-slate-950 light:bg-slate-100 transition-colors duration-500"
          style={{ opacity: darkOverlayOpacity }}
        />
      </div>

      {/* Cyberpunk Theme Fullscreen Background Speedometer HUD Wallpaper */}
      {isCyberpunk && speedometerPlacement !== 'header' && (
        <CyberpunkSportsSpeedometer isBackgroundMode={true} />
      )}

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-screen justify-between">
        <Header />

        <main className="flex-1 my-4 space-y-6">
          {/* Cyberpunk Theme Sports Car Speedometer HUD (Header Block Mode) */}
          {isCyberpunk && speedometerPlacement === 'header' && (
            <div className="relative z-10">
              <CyberpunkSportsSpeedometer isBackgroundMode={false} />
            </div>
          )}

          {/* Row 1: Clock & Search Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {widgetVisibility.clock && (
              <div className={widgetVisibility.search ? 'lg:col-span-5' : 'lg:col-span-12'}>
                <ClockDisplay />
              </div>
            )}
            {widgetVisibility.search && (
              <div className={widgetVisibility.clock ? 'lg:col-span-7' : 'lg:col-span-12'}>
                <SearchBar />
              </div>
            )}
          </div>

          {/* Daily Tasks & Gmail Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className={widgetVisibility.gmail !== false ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <GitHubDailyTasks />
            </div>
            {widgetVisibility.gmail !== false && (
              <div className="lg:col-span-5">
                <UnreadGmailWidget />
              </div>
            )}
          </div>

          {/* Row 2: Calendar, Todo, Quote */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {widgetVisibility.calendar && <CalendarWidget />}
            {widgetVisibility.todo && <TodoList />}
            {widgetVisibility.quote && <QuoteCard />}
          </div>

          {/* Row 3: Bookmarks & Recent Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {widgetVisibility.bookmarks && (
              <div className={widgetVisibility.recentTabs ? 'lg:col-span-7' : 'lg:col-span-12'}>
                <BookmarkGrid />
              </div>
            )}
            {widgetVisibility.recentTabs && (
              <div className={widgetVisibility.bookmarks ? 'lg:col-span-5' : 'lg:col-span-12'}>
                <RecentTabsList />
              </div>
            )}
          </div>
        </main>

        {/* Footer info bar */}
        <footer className="py-3 text-center text-xs text-white/60 light:text-slate-600 font-medium select-none">
          <span>Press </span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 light:bg-slate-200 border border-white/20 font-mono text-[11px]">
            /
          </kbd>
          <span> to quick search • Built for Manifest V3 Extensions</span>
        </footer>
      </div>

      {/* Drawers & Modals */}
      <SettingsDrawer />
      <WallpaperPicker />
    </div>
  );
};
