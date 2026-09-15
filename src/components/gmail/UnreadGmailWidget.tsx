import React, { useState, useEffect, useCallback } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import {
  signInWithGoogle,
  signInWithAccessToken,
  signInWithDemoAccount,
  logoutGoogle,
  initAuthListener,
  GoogleUser,
  isExtensionEnvironment,
  isFirefoxExtension,
  isChromeExtension,
  getExtensionRedirectUrl,
  getOAuthClientId,
  setOAuthClientId,
  DEFAULT_CLIENT_ID,
} from '../../services/googleAuthService';
import { fetchUnreadGmailMessages, GmailMessage } from '../../services/gmailService';
import {
  Mail,
  RefreshCw,
  ExternalLink,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  User as UserIcon,
  Key,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  HelpCircle,
  Sliders,
} from 'lucide-react';

export const UnreadGmailWidget: React.FC = () => {
  const theme = useDashboardStore((state) => state.settings.theme);

  const [user, setUser] = useState<GoogleUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [copiedRedirect, setCopiedRedirect] = useState(false);
  const isExt = isExtensionEnvironment();
  const isFirefox = isFirefoxExtension();
  const isChrome = isChromeExtension();
  const redirectUrl = getExtensionRedirectUrl();

  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [isSavedId, setIsSavedId] = useState(false);

  // Load custom client ID on mount
  useEffect(() => {
    getOAuthClientId().then((id) => {
      setCustomClientId(id);
    });
  }, []);

  // Initialize Auth Listener
  useEffect(() => {
    const unsubscribe = initAuthListener(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Unread Emails function
  const loadUnreadEmails = useCallback(async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUnreadGmailMessages(accessToken, 8);
      setMessages(data.messages);
      setUnreadCount(data.totalUnreadCount);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        setNeedsAuth(true);
        setError('Session expired or unauthorized. Please sign in again.');
      } else {
        setError(err.message || 'Failed to fetch unread emails');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch emails when token changes
  useEffect(() => {
    if (token) {
      loadUnreadEmails(token);
    }
  }, [token, loadUnreadEmails]);

  // Handle Login Click
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        setShowGuide(false);
        await loadUnreadEmails(result.accessToken);
      }
    } catch (err: any) {
      console.warn('Sign-in attempt notice:', err);
      const msg = err.message || 'Google Sign-in failed.';
      setError(msg);
      // Auto-open setup guide if error relates to invalid request or redirect URI
      if (
        msg.toLowerCase().includes('invalid') ||
        msg.toLowerCase().includes('redirect_uri') ||
        msg.toLowerCase().includes('cancel') ||
        msg.toLowerCase().includes('blocked')
      ) {
        setShowGuide(true);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle saving custom client ID
  const handleSaveClientId = async () => {
    if (!customClientId.trim()) return;
    await setOAuthClientId(customClientId.trim());
    setIsSavedId(true);
    setTimeout(() => setIsSavedId(false), 2000);
  };

  // Handle Demo Login
  const handleDemoLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await signInWithDemoAccount();
      setUser(result.user);
      setToken(result.accessToken);
      setNeedsAuth(false);
      await loadUnreadEmails(result.accessToken);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo mode');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCopyRedirectUri = () => {
    navigator.clipboard.writeText(redirectUrl);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2500);
  };

  // Handle Manual Token Submission
  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await signInWithAccessToken(manualToken.trim());
      setUser(result.user);
      setToken(result.accessToken);
      setNeedsAuth(false);
      setManualToken('');
      setShowTokenInput(false);
      await loadUnreadEmails(result.accessToken);
    } catch (err: any) {
      setError(err.message || 'Invalid access token');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout Click
  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setMessages([]);
    setUnreadCount(0);
    setNeedsAuth(true);
  };

  // Parse sender format: "John Doe <john@example.com>" -> { name: "John Doe", email: "john@example.com" }
  const parseSender = (fromStr: string) => {
    if (!fromStr) return { name: 'Unknown Sender', email: '' };
    const match = fromStr.match(/^(.*?)\s*<(.*?)>$/);
    if (match) {
      return {
        name: match[1].replace(/^["']|["']$/g, '').trim() || match[2],
        email: match[2],
      };
    }
    return { name: fromStr, email: fromStr };
  };

  // Format date helper
  const formatDate = (dateStr: string, internalDate: string) => {
    if (internalDate) {
      const ms = parseInt(internalDate, 10);
      if (!isNaN(ms)) {
        const d = new Date(ms);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        return isToday
          ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    }
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  // Theme styling calculations
  const isCyberpunk = theme === 'cyberpunk';
  const isDeveloper = theme === 'developer';
  const isLight = theme === 'light';

  const containerClass = isCyberpunk
    ? 'bg-[#080d1a]/90 border border-[#00f3ff]/40 shadow-[0_0_15px_rgba(0,243,255,0.15)] text-[#00f3ff]'
    : isDeveloper
    ? 'bg-[#0D1117] border border-[#30363D] text-[#E6EDF3]'
    : isLight
    ? 'bg-white border border-slate-200 text-slate-900 shadow-sm'
    : 'bg-slate-900/90 border border-slate-800 text-slate-100 shadow-sm';

  const subHeaderBorder = isCyberpunk
    ? 'border-[#00f3ff]/30'
    : isDeveloper
    ? 'border-[#30363D]'
    : isLight
    ? 'border-slate-200'
    : 'border-slate-800';

  const badgeClass = isCyberpunk
    ? 'bg-[#00f3ff]/10 border border-[#00f3ff]/40 text-[#00f3ff]'
    : isDeveloper
    ? 'bg-[#161B22] border border-[#30363D] text-[#8B949E]'
    : isLight
    ? 'bg-red-50 border border-red-200 text-red-600'
    : 'bg-rose-950/40 border border-rose-800/50 text-rose-300';

  const titleTextClass = isCyberpunk
    ? 'text-[#00f3ff]'
    : isDeveloper
    ? 'text-[#E6EDF3]'
    : isLight
    ? 'text-slate-900'
    : 'text-slate-100';

  const subTextClass = isCyberpunk
    ? 'text-[#00f3ff]/70'
    : isDeveloper
    ? 'text-[#8B949E]'
    : isLight
    ? 'text-slate-500'
    : 'text-slate-400';

  const itemHoverClass = isCyberpunk
    ? 'bg-[#0c1427]/80 border-l-2 border-l-[#ff0055] hover:border-[#00f3ff]'
    : isDeveloper
    ? 'bg-[#161B22] hover:bg-[#1C212B] border-l-2 border-l-[#58A6FF]'
    : isLight
    ? 'bg-slate-50 hover:bg-slate-100/80 border-l-2 border-l-red-500'
    : 'bg-slate-800/60 hover:bg-slate-800 border-l-2 border-l-rose-500';

  return (
    <div className={`${containerClass} rounded-lg p-4 sm:p-5 font-mono space-y-4 transition-colors`}>
      {/* Header Bar */}
      <div className={`flex items-center justify-between pb-3 border-b ${subHeaderBorder}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name || 'User'}
              className="w-9 h-9 rounded-lg border border-red-500/30 object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className={`text-sm font-bold ${titleTextClass} flex items-center gap-2 truncate`}>
              <span>{user ? user.name || 'Unread Gmail' : 'Unread Gmail'}</span>
              {!needsAuth && user && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badgeClass}`}>
                  {unreadCount} unread
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1.5 truncate">
              <p className={`text-[11px] ${subTextClass} truncate`}>
                {user ? user.email : 'Google Account unread inbox synchronization'}
              </p>
              {user && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    user.isDemo
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : isFirefox
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : isChrome
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {user.isDemo ? 'Demo Mode' : isFirefox ? 'Firefox WebAuth' : isChrome ? 'Chrome Identity' : 'OAuth'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {!needsAuth && token && (
            <button
              type="button"
              onClick={() => loadUnreadEmails(token)}
              disabled={isLoading}
              className={`p-1.5 rounded-md ${
                isCyberpunk
                  ? 'bg-[#00f3ff]/10 text-[#00f3ff] hover:bg-[#00f3ff]/20'
                  : isDeveloper
                  ? 'bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D]'
                  : isLight
                  ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              } transition-colors cursor-pointer`}
              title="Refresh inbox"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isCyberpunk
                ? 'bg-[#ff0055]/20 hover:bg-[#ff0055]/30 text-[#ff0055] border border-[#ff0055]/50'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <span>Gmail</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {!needsAuth && user && (
            <button
              type="button"
              onClick={handleLogout}
              className={`p-1.5 rounded-md text-slate-400 hover:text-rose-500 transition-colors cursor-pointer`}
              title="Sign out of Gmail"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body State */}
      {needsAuth || !user ? (
        /* Sign-in prompt state */
        <div
          className={`p-5 text-center space-y-4 rounded-lg ${
            isCyberpunk
              ? 'bg-[#050811] border border-[#00f3ff]/20'
              : isDeveloper
              ? 'bg-[#161B22]/60 border border-[#30363D]'
              : isLight
              ? 'bg-slate-50 border border-slate-200'
              : 'bg-slate-950/50 border border-slate-800'
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Mail className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className={`text-xs font-bold ${titleTextClass}`}>Connect Google / Extension Inbox</h4>
            <p className={`text-[11px] ${subTextClass}`}>
              {isChrome
                ? 'Chrome Extension MV3 detected: uses native Chrome Identity or WebAuthFlow.'
                : isFirefox
                ? 'Firefox Extension detected: uses WebAuthFlow with secure extension URI.'
                : 'Web preview: click Demo Mode for an instant preview, or connect via Google OAuth.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="group relative inline-flex items-center gap-2.5 px-4 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-300 shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
              )}
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign in with Google'}</span>
            </button>

            {/* Instant Demo Account */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-accent/20 hover:bg-accent/30 text-accent font-semibold text-xs border border-accent/40 transition-all cursor-pointer"
              title="Instant demo account with simulated emails"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Mode</span>
            </button>
          </div>

          {/* Setup Guide / "App's request is invalid" Explainer */}
          <div className="pt-2 border-t border-white/10 light:border-slate-200">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-[11px] text-accent hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer font-semibold py-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showGuide ? 'Hide Setup & Troubleshooting Guide' : "Seeing 'App's request is invalid'? Click for 1-minute fix"}</span>
              {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showGuide && (
              <div className="mt-2.5 p-3 rounded-xl bg-white/5 border border-white/10 light:bg-slate-100/80 light:border-slate-300 text-left text-[11px] space-y-3">
                <div className="space-y-1">
                  <p className="font-bold text-white light:text-slate-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Why Google shows "Access blocked: This app's request is invalid"</span>
                  </p>
                  <p className="text-white/70 light:text-slate-600 leading-relaxed text-[10px]">
                    Google OAuth 2.0 strictly requires that any browser extension or application connecting to personal Gmail data must have its exact Redirect URI registered in the Google Cloud Console for the OAuth Client ID being used.
                  </p>
                </div>

                {/* Step 1: Redirect URI */}
                <div className="space-y-1 p-2 rounded-lg bg-black/40 border border-white/10 light:bg-white light:border-slate-200">
                  <p className="text-[10px] font-bold text-white/90 light:text-slate-800">
                    Step 1: Copy your Extension Redirect URI:
                  </p>
                  <div className="flex items-center gap-1.5">
                    <code className="flex-1 text-[9px] font-mono text-accent light:text-blue-600 truncate select-all">
                      {redirectUrl}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyRedirectUri}
                      className="px-2 py-1 text-[10px] rounded bg-accent/20 hover:bg-accent/30 text-accent font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedRedirect ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedRedirect ? 'Copied!' : 'Copy URI'}</span>
                    </button>
                  </div>
                </div>

                {/* Step 2: Google Cloud Console */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/90 light:text-slate-800">
                    Step 2: Add URI in Google Cloud Console
                  </p>
                  <p className="text-[10px] text-white/60 light:text-slate-600 leading-relaxed">
                    Open{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline font-semibold inline-flex items-center gap-0.5"
                    >
                      Google Cloud Credentials
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    , select your OAuth 2.0 Client (type: Web Application), and paste the copied URI under <strong>Authorized redirect URIs</strong>.
                  </p>
                </div>

                {/* Step 3: Enter Client ID */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-white/90 light:text-slate-800">
                    Step 3: Paste your Google OAuth Client ID here:
                  </p>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={customClientId}
                      onChange={(e) => setCustomClientId(e.target.value)}
                      placeholder="Your Google OAuth Client ID (e.g. 123...apps.googleusercontent.com)"
                      className="flex-1 px-2.5 py-1 text-[10px] rounded-lg bg-black/40 border border-white/20 text-white font-mono light:bg-white light:border-slate-300 light:text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleSaveClientId}
                      className="px-3 py-1 bg-accent text-white rounded-lg text-[10px] font-semibold hover:opacity-90 transition-opacity cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      {isSavedId ? <Check className="w-3 h-3 text-emerald-300" /> : <Sliders className="w-3 h-3" />}
                      <span>{isSavedId ? 'Saved!' : 'Save Client ID'}</span>
                    </button>
                  </div>
                </div>

                {/* Zero Setup Alternatives */}
                <div className="pt-2 border-t border-white/10 light:border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-white/50 light:text-slate-500 font-semibold">
                    No Google Cloud setup?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      className="text-[10px] px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Demo Mode</span>
                    </button>
                    <a
                      href="https://developers.google.com/oauthplayground"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20 font-semibold cursor-pointer flex items-center gap-1 light:text-slate-700"
                    >
                      <span>OAuth Playground</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Direct Token Toggle */}
          <div className="pt-2 border-t border-white/5 light:border-slate-200">
            <button
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="text-[10px] text-white/50 light:text-slate-500 hover:text-white light:hover:text-slate-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <Key className="w-3 h-3" />
              <span>{showTokenInput ? 'Hide token entry' : 'Direct OAuth Access Token Entry'}</span>
              {showTokenInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showTokenInput && (
              <form onSubmit={handleManualTokenSubmit} className="mt-2.5 max-w-sm mx-auto flex gap-2">
                <input
                  type="password"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste Google OAuth Bearer Token (ya29...)"
                  className="flex-1 px-2.5 py-1.5 text-[11px] rounded bg-black/40 border border-white/20 text-white font-mono light:bg-white light:border-slate-300 light:text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!manualToken.trim() || isLoggingIn}
                  className="px-3 py-1.5 bg-accent text-white rounded text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  Connect
                </button>
              </form>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-left text-[11px] space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Sign-In Notice</span>
              </div>
              <p className="opacity-90 leading-relaxed">{error}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyRedirectUri}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono cursor-pointer transition-colors"
                >
                  {copiedRedirect ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRedirect ? 'Copied Redirect URI!' : 'Copy Extension Redirect URI'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Use Demo Mode</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : isLoading ? (
        /* Loading skeleton */
        <div className="space-y-2 py-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`p-3 rounded-lg animate-pulse ${
                isDeveloper ? 'bg-[#161B22]' : isLight ? 'bg-slate-100' : 'bg-slate-800/50'
              } flex flex-col gap-2`}
            >
              <div className="h-3 w-1/3 bg-slate-400/20 rounded" />
              <div className="h-3.5 w-3/4 bg-slate-400/30 rounded" />
              <div className="h-3 w-full bg-slate-400/10 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error banner */
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs space-y-2 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold">Gmail Sync Error</p>
            <p className="opacity-90">{error}</p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleLogin}
                className="px-3 py-1 bg-rose-600 text-white rounded text-[11px] font-bold cursor-pointer hover:bg-rose-700 transition-colors"
              >
                Retry Sign-in
              </button>
            </div>
          </div>
        </div>
      ) : messages.length === 0 ? (
        /* Empty unread state */
        <div
          className={`p-6 text-center rounded-lg space-y-2 ${
            isCyberpunk
              ? 'bg-[#050811] border border-[#00f3ff]/20'
              : isDeveloper
              ? 'bg-[#161B22]/50 border border-[#30363D]'
              : isLight
              ? 'bg-slate-50 border border-slate-200'
              : 'bg-slate-900/40 border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className={`text-xs font-bold ${titleTextClass}`}>Inbox Zero Clean!</h4>
          <p className={`text-[11px] ${subTextClass}`}>
            You have no unread emails right now in your main inbox.
          </p>
        </div>
      ) : (
        /* Unread Emails List */
        <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
          {messages.map((msg) => {
            const sender = parseSender(msg.from);
            const formattedTime = formatDate(msg.date, msg.internalDate);
            const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${msg.id}`;

            return (
              <a
                key={msg.id}
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-lg block transition-all ${itemHoverClass} group cursor-pointer space-y-1`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <UserIcon className={`w-3 h-3 ${subTextClass} shrink-0`} />
                    <span className={`text-xs font-bold ${titleTextClass} truncate group-hover:underline`}>
                      {sender.name}
                    </span>
                  </div>
                  {formattedTime && (
                    <span className={`text-[10px] ${subTextClass} shrink-0 flex items-center gap-1`}>
                      <Clock className="w-2.5 h-2.5" />
                      {formattedTime}
                    </span>
                  )}
                </div>

                <div className={`text-xs font-semibold ${titleTextClass} line-clamp-1`}>
                  {msg.subject}
                </div>

                {msg.snippet && (
                  <p className={`text-[11px] ${subTextClass} line-clamp-1 opacity-80 font-normal`}>
                    {msg.snippet}
                  </p>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
