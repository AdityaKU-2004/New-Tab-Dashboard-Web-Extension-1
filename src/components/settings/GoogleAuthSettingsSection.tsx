import React, { useState, useEffect } from 'react';
import {
  initAuthListener,
  signInWithGoogle,
  logoutGoogle,
  GoogleUser,
  isExtensionEnvironment,
  getOAuthClientId,
  setOAuthClientId,
  DEFAULT_CLIENT_ID,
} from '../../services/googleAuthService';
import { Mail, Check, AlertCircle, RefreshCw, Key, Shield, LogOut, ExternalLink } from 'lucide-react';

export const GoogleAuthSettingsSection: React.FC = () => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customClientId, setCustomClientId] = useState('');
  const [isSavedId, setIsSavedId] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isExt = isExtensionEnvironment();

  useEffect(() => {
    const unsub = initAuthListener(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setError(null);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    getOAuthClientId().then((id) => {
      setCustomClientId(id);
    });

    return () => unsub();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const res = await signInWithGoogle();
      setUser(res.user);
      setToken(res.accessToken);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
  };

  const handleSaveClientId = async () => {
    await setOAuthClientId(customClientId);
    setIsSavedId(true);
    setTimeout(() => setIsSavedId(false), 2000);
  };

  return (
    <div className="pt-4 border-t border-white/10 light:border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
          <Mail className="w-4 h-4" /> Google Account & Extension Auth
        </label>
        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
            isExt
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
          }`}
        >
          {isExt ? 'Extension Identity Active' : 'Web OAuth Mode'}
        </span>
      </div>

      {user ? (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 light:bg-slate-50 light:border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-red-500/30 object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                {user.name.charAt(0) || 'G'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-white light:text-slate-900">{user.name}</p>
              <p className="text-[10px] text-white/60 light:text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Sign out of Google"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoggingIn ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
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
            <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>
          {error && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1.5 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>
      )}

      {/* Advanced Extension Client ID Settings */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[10px] text-accent hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Key className="w-3 h-3" />
          <span>{showAdvanced ? 'Hide OAuth Client ID Config' : 'Configure Custom OAuth Client ID'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-2 p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 light:bg-slate-50 light:border-slate-200">
            <p className="text-[10px] text-white/70 light:text-slate-600">
              For unpacked/published Chrome Extensions, specify your Google Cloud OAuth 2.0 Web/Extension Client ID:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customClientId}
                onChange={(e) => setCustomClientId(e.target.value)}
                placeholder="Google OAuth Client ID"
                className="flex-1 px-2.5 py-1.5 text-[11px] rounded-lg bg-black/40 border border-white/20 text-white font-mono light:bg-white light:border-slate-300 light:text-slate-800"
              />
              <button
                type="button"
                onClick={handleSaveClientId}
                className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
              >
                {isSavedId ? <Check className="w-3.5 h-3.5" /> : 'Save'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setCustomClientId(DEFAULT_CLIENT_ID);
                setOAuthClientId(DEFAULT_CLIENT_ID);
              }}
              className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
            >
              Reset to Default Client ID
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
