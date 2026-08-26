import { storageService } from './storageService';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
  isDemo?: boolean;
}

export interface AuthState {
  user: GoogleUser | null;
  accessToken: string | null;
  isExtension: boolean;
}

// Storage keys
const STORAGE_USER_KEY = 'dashboard_google_user';
const STORAGE_TOKEN_KEY = 'dashboard_google_access_token';
const STORAGE_CLIENT_ID_KEY = 'dashboard_google_client_id';

// Default Google OAuth Client ID (can be customized in extension or settings)
export const DEFAULT_CLIENT_ID = '217330540944-qvlrgelgpl3o216v1sfk6qvf27ohau4p.apps.googleusercontent.com';

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid',
].join(' ');

// In-memory cache
let cachedUser: GoogleUser | null = null;
let cachedAccessToken: string | null = null;
let authListeners: Array<(state: AuthState) => void> = [];

/**
 * Detects if the app is currently running inside a real Chrome extension environment
 */
export const isExtensionEnvironment = (): boolean => {
  return (
    typeof chrome !== 'undefined' &&
    !!chrome?.identity &&
    typeof chrome.identity?.getAuthToken === 'function'
  );
};

/**
 * Notify all subscribed auth listeners
 */
const notifyListeners = () => {
  const state: AuthState = {
    user: cachedUser,
    accessToken: cachedAccessToken,
    isExtension: isExtensionEnvironment(),
  };
  authListeners.forEach((listener) => {
    try {
      listener(state);
    } catch (err) {
      console.error('Error in auth listener:', err);
    }
  });
};

/**
 * Fetch Google User profile using access token
 */
export const fetchGoogleUserProfile = async (accessToken: string): Promise<GoogleUser> => {
  // If demo token, return mock user
  if (accessToken === 'demo_token' || accessToken.startsWith('demo_')) {
    return {
      id: 'demo-user-12345',
      email: 'pilot.operator@cyberdash.io',
      name: 'Tactical Pilot (Demo)',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      givenName: 'Tactical',
      familyName: 'Pilot',
      isDemo: true,
    };
  }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile (${response.status})`);
  }

  const data = await response.json();
  return {
    id: data.sub || data.id || '',
    email: data.email || '',
    name: data.name || data.email?.split('@')[0] || 'Google User',
    picture: data.picture || '',
    givenName: data.given_name || '',
    familyName: data.family_name || '',
    isDemo: false,
  };
};

/**
 * Gets configured OAuth Client ID (stored or default)
 */
export const getOAuthClientId = async (): Promise<string> => {
  const storedId = await storageService.local.get<string>(STORAGE_CLIENT_ID_KEY, '');
  return storedId.trim() || DEFAULT_CLIENT_ID;
};

/**
 * Sets custom OAuth Client ID
 */
export const setOAuthClientId = async (clientId: string): Promise<void> => {
  await storageService.local.set(STORAGE_CLIENT_ID_KEY, clientId.trim());
};

/**
 * Initialize Auth state from storage / Chrome extension identity
 */
export const initAuthListener = (
  onSuccess: (user: GoogleUser, token: string) => void,
  onFailure: () => void
) => {
  const listener = (state: AuthState) => {
    if (state.user && state.accessToken) {
      onSuccess(state.user, state.accessToken);
    } else {
      onFailure();
    }
  };

  authListeners.push(listener);

  // Restore initial state asynchronously
  (async () => {
    try {
      // 1. Try Chrome extension silent identity check first
      if (isExtensionEnvironment()) {
        chrome.identity.getAuthToken({ interactive: false }, async (token) => {
          if (chrome.runtime.lastError || !token) {
            // Check storage backup
            restoreFromStorage();
          } else {
            try {
              const user = await fetchGoogleUserProfile(token);
              cachedAccessToken = token;
              cachedUser = user;
              await storageService.local.set(STORAGE_USER_KEY, user);
              await storageService.local.set(STORAGE_TOKEN_KEY, token);
              notifyListeners();
            } catch {
              restoreFromStorage();
            }
          }
        });
      } else {
        await restoreFromStorage();
      }
    } catch {
      onFailure();
    }
  })();

  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter((l) => l !== listener);
  };
};

/**
 * Helper to restore cached session from storageService
 */
async function restoreFromStorage() {
  const savedUser = await storageService.local.get<GoogleUser | null>(STORAGE_USER_KEY, null);
  const savedToken = await storageService.local.get<string | null>(STORAGE_TOKEN_KEY, null);

  if (savedUser && savedToken) {
    if (savedToken.startsWith('demo_')) {
      cachedUser = savedUser;
      cachedAccessToken = savedToken;
      notifyListeners();
      return;
    }

    // Validate real token
    try {
      const user = await fetchGoogleUserProfile(savedToken);
      cachedUser = user;
      cachedAccessToken = savedToken;
      notifyListeners();
      return;
    } catch {
      // Token expired or invalid, clear cached token
      await storageService.local.set(STORAGE_TOKEN_KEY, null);
    }
  }

  cachedUser = null;
  cachedAccessToken = null;
  notifyListeners();
}

/**
 * Sign in with Demo / Preview Test Account
 * Perfect for development preview when running outside of an unpacked Chrome Extension!
 */
export const signInWithDemoAccount = async (
  email = 'pilot.operator@cyberdash.io',
  name = 'Tactical Pilot (Demo)'
): Promise<{ user: GoogleUser; accessToken: string }> => {
  const demoUser: GoogleUser = {
    id: 'demo-user-12345',
    email,
    name,
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    givenName: name.split(' ')[0],
    familyName: name.split(' ')[1] || '',
    isDemo: true,
  };

  const demoToken = 'demo_token';
  cachedAccessToken = demoToken;
  cachedUser = demoUser;

  await storageService.local.set(STORAGE_USER_KEY, demoUser);
  await storageService.local.set(STORAGE_TOKEN_KEY, demoToken);

  notifyListeners();
  return { user: demoUser, accessToken: demoToken };
};

/**
 * Sign in directly with an OAuth access token (e.g. from Google OAuth Playground or custom flow)
 */
export const signInWithAccessToken = async (
  token: string
): Promise<{ user: GoogleUser; accessToken: string }> => {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error('Access token cannot be empty');
  }

  const user = await fetchGoogleUserProfile(cleanToken);
  cachedAccessToken = cleanToken;
  cachedUser = user;

  await storageService.local.set(STORAGE_USER_KEY, user);
  await storageService.local.set(STORAGE_TOKEN_KEY, cleanToken);

  notifyListeners();
  return { user, accessToken: cleanToken };
};

/**
 * Main Sign In with Google Method:
 * - In Chrome Extension: uses native chrome.identity.getAuthToken
 * - In Web / Preview / Tab: uses Google Identity Services or standard OAuth flow with demo fallback
 */
export const signInWithGoogle = async (): Promise<{ user: GoogleUser; accessToken: string }> => {
  // 1. Chrome Extension Environment Flow
  if (isExtensionEnvironment()) {
    return new Promise<{ user: GoogleUser; accessToken: string }>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, async (token) => {
        if (chrome.runtime.lastError || !token) {
          const errorMsg = chrome.runtime.lastError?.message || 'Failed to acquire auth token via chrome.identity';
          console.warn('chrome.identity.getAuthToken error:', errorMsg);

          // Fallback to launchWebAuthFlow if getAuthToken fails
          if (typeof chrome.identity.launchWebAuthFlow === 'function') {
            try {
              const res = await signInViaWebAuthFlow();
              resolve(res);
            } catch (fallbackErr: any) {
              reject(new Error(fallbackErr?.message || errorMsg));
            }
          } else {
            reject(new Error(errorMsg));
          }
          return;
        }

        try {
          const user = await fetchGoogleUserProfile(token);
          cachedAccessToken = token;
          cachedUser = user;
          await storageService.local.set(STORAGE_USER_KEY, user);
          await storageService.local.set(STORAGE_TOKEN_KEY, token);
          notifyListeners();
          resolve({ user, accessToken: token });
        } catch (err: any) {
          reject(new Error(err.message || 'Failed to fetch user info with token'));
        }
      });
    });
  }

  // 2. Web / Browser / Standalone Tab Flow
  return signInViaWebFlow();
};

/**
 * Secondary extension auth flow using launchWebAuthFlow
 */
const signInViaWebAuthFlow = async (): Promise<{ user: GoogleUser; accessToken: string }> => {
  const clientId = await getOAuthClientId();
  const redirectUrl = chrome.identity.getRedirectURL();
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: clientId,
      response_type: 'token',
      redirect_uri: redirectUrl,
      scope: GMAIL_SCOPES,
      prompt: 'select_account',
    }).toString();

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, async (responseUrl) => {
      if (chrome.runtime.lastError || !responseUrl) {
        reject(new Error(chrome.runtime.lastError?.message || 'Web auth flow was cancelled or failed'));
        return;
      }

      const url = new URL(responseUrl);
      const hashParams = new URLSearchParams(url.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (!accessToken) {
        reject(new Error('No access token found in OAuth response'));
        return;
      }

      try {
        const user = await fetchGoogleUserProfile(accessToken);
        cachedAccessToken = accessToken;
        cachedUser = user;
        await storageService.local.set(STORAGE_USER_KEY, user);
        await storageService.local.set(STORAGE_TOKEN_KEY, accessToken);
        notifyListeners();
        resolve({ user, accessToken });
      } catch (err: any) {
        reject(err);
      }
    });
  });
};

/**
 * Web & Preview OAuth Flow using Google Identity Services (GSI) Token Client or Popup
 */
const signInViaWebFlow = async (): Promise<{ user: GoogleUser; accessToken: string }> => {
  const clientId = await getOAuthClientId();

  // Method A: Check if Google Identity Services (GSI) token client is available
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    return new Promise((resolve, reject) => {
      try {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GMAIL_SCOPES,
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              const errDesc = tokenResponse.error_description || tokenResponse.error;
              reject(new Error(`Google OAuth error: ${errDesc}`));
              return;
            }
            if (!tokenResponse.access_token) {
              reject(new Error('No access token received from Google Sign-In'));
              return;
            }
            try {
              const user = await fetchGoogleUserProfile(tokenResponse.access_token);
              cachedAccessToken = tokenResponse.access_token;
              cachedUser = user;
              await storageService.local.set(STORAGE_USER_KEY, user);
              await storageService.local.set(STORAGE_TOKEN_KEY, tokenResponse.access_token);
              notifyListeners();
              resolve({ user, accessToken: tokenResponse.access_token });
            } catch (err: any) {
              reject(err);
            }
          },
          error_callback: (nonOAuthError: any) => {
            reject(new Error(nonOAuthError?.message || 'Google OAuth request failed (origin not authorized)'));
          }
        });
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err: any) {
        signInViaPopup(clientId).then(resolve).catch(reject);
      }
    });
  }

  // Method B: Direct Standard OAuth 2.0 Web Popup
  return signInViaPopup(clientId);
};

/**
 * Generic OAuth 2.0 Popup Flow with clean error handling
 */
const signInViaPopup = (clientId: string): Promise<{ user: GoogleUser; accessToken: string }> => {
  return new Promise((resolve, reject) => {
    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      new URLSearchParams({
        client_id: clientId,
        response_type: 'token',
        redirect_uri: redirectUri,
        scope: GMAIL_SCOPES,
        prompt: 'select_account',
      }).toString();

    const popupWidth = 500;
    const popupHeight = 650;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popup = window.open(
      authUrl,
      'google_oauth_popup',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this page or use Demo Mode / Direct Token.'));
      return;
    }

    let isCompleted = false;

    // Polling interval to check popup response
    const interval = setInterval(async () => {
      try {
        if (!popup || popup.closed) {
          clearInterval(interval);
          if (!isCompleted) {
            reject(
              new Error(
                'Google Sign-In popup was closed. (Note: Google OAuth rejects unregistered preview URLs. In Chrome Extension, native chrome.identity works automatically! Or use "Demo Sign-in" in preview).'
              )
            );
          }
          return;
        }

        let hash = '';
        try {
          if (popup.location.origin === window.location.origin) {
            hash = popup.location.hash;
          }
        } catch {
          // Cross-origin access error while on google.com - expected
        }

        if (hash && hash.includes('access_token=')) {
          isCompleted = true;
          clearInterval(interval);
          popup.close();

          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');

          if (!accessToken) {
            reject(new Error('Failed to retrieve access token from popup response'));
            return;
          }

          const user = await fetchGoogleUserProfile(accessToken);
          cachedAccessToken = accessToken;
          cachedUser = user;
          await storageService.local.set(STORAGE_USER_KEY, user);
          await storageService.local.set(STORAGE_TOKEN_KEY, accessToken);
          notifyListeners();
          resolve({ user, accessToken });
        }
      } catch (err: any) {
        clearInterval(interval);
        if (popup && !popup.closed) popup.close();
        reject(err);
      }
    }, 500);

    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (popup && !popup.closed) popup.close();
    }, 120000);
  });
};

/**
 * Logout from Google Account & revoke/clear tokens
 */
export const logoutGoogle = async (): Promise<void> => {
  const tokenToRevoke = cachedAccessToken;

  // Clear in-memory
  cachedUser = null;
  cachedAccessToken = null;

  // Clear storage
  await storageService.local.set(STORAGE_USER_KEY, null);
  await storageService.local.set(STORAGE_TOKEN_KEY, null);

  // Clear Chrome extension cached token if in extension
  if (isExtensionEnvironment() && tokenToRevoke && tokenToRevoke !== 'demo_token') {
    try {
      chrome.identity.removeCachedAuthToken({ token: tokenToRevoke }, () => {
        // done
      });
    } catch {
      // ignore
    }
  }

  // Revoke token with Google if real token
  if (tokenToRevoke && tokenToRevoke !== 'demo_token' && !tokenToRevoke.startsWith('demo_')) {
    try {
      fetch(`https://oauth2.googleapis.com/revoke?token=${tokenToRevoke}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).catch(() => {});
    } catch {
      // ignore network errors
    }
  }

  notifyListeners();
};

/**
 * Get current cached access token
 */
export const getCachedAccessToken = () => cachedAccessToken;

/**
 * Get current cached user
 */
export const getCachedUser = () => cachedUser;
