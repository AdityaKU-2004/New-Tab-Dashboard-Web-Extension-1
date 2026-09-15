import { storageService } from './storageService';
import { browserApi } from './browser/browserApi';

// Define global types for WebExtension environments
declare const chrome: any;
declare const browser: any;

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

// Default Google OAuth Client ID
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
 * Detects if the app is currently running inside an extension environment (Chrome or Firefox)
 */
export const isExtensionEnvironment = (): boolean => {
  return (
    (typeof chrome !== 'undefined' && (!!chrome?.identity || !!chrome?.runtime?.id)) ||
    (typeof browser !== 'undefined' && (!!browser?.identity || !!browser?.runtime?.id))
  );
};

/**
 * Detects if running in Firefox extension
 */
export const isFirefoxExtension = (): boolean => {
  return typeof browser !== 'undefined' && (!!browser?.identity || !!browser?.runtime?.id);
};

/**
 * Detects if running in Chrome / Chromium extension
 */
export const isChromeExtension = (): boolean => {
  return !isFirefoxExtension() && typeof chrome !== 'undefined' && (!!chrome?.identity || !!chrome?.runtime?.id);
};

/**
 * Checks if native chrome.identity.getAuthToken is supported
 */
export const hasChromeNativeIdentity = (): boolean => {
  return typeof chrome !== 'undefined' && typeof chrome?.identity?.getAuthToken === 'function';
};

/**
 * Checks if launchWebAuthFlow is available (Firefox or Chrome)
 */
export const hasWebAuthFlow = (): boolean => {
  return browserApi.identity.hasLaunchWebAuthFlow();
};

/**
 * Gets the current extension OAuth redirect URL
 */
export const getExtensionRedirectUrl = (): string => {
  return browserApi.identity.getRedirectURL();
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
 * Initialize Auth state from storage / extension identity
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
      // If in Chrome extension with native identity, attempt silent token check
      if (hasChromeNativeIdentity()) {
        chrome.identity.getAuthToken({ interactive: false }, async (token: string) => {
          if (chrome.runtime?.lastError || !token) {
            await restoreFromStorage();
          } else {
            try {
              const user = await fetchGoogleUserProfile(token);
              cachedAccessToken = token;
              cachedUser = user;
              await storageService.local.set(STORAGE_USER_KEY, user);
              await storageService.local.set(STORAGE_TOKEN_KEY, token);
              notifyListeners();
            } catch {
              await restoreFromStorage();
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
 * 1. In Chrome Extension: attempts native chrome.identity.getAuthToken first,
 *    falling back to launchWebAuthFlow if needed.
 * 2. In Firefox Extension: uses launchWebAuthFlow directly (Firefox does not support getAuthToken).
 * 3. In Web / Preview / Tab: uses Google Identity Services or standard web popup flow.
 */
export const signInWithGoogle = async (): Promise<{ user: GoogleUser; accessToken: string }> => {
  // 1. Chrome Extension Environment Flow (Native Identity)
  if (hasChromeNativeIdentity()) {
    try {
      return await signInViaChromeNativeIdentity();
    } catch (chromeErr: any) {
      console.warn('Chrome native getAuthToken failed, falling back to launchWebAuthFlow:', chromeErr);
      if (hasWebAuthFlow()) {
        try {
          return await signInViaWebAuthFlow();
        } catch (webAuthErr: any) {
          throw webAuthErr;
        }
      }
      throw chromeErr;
    }
  }

  // 2. Firefox Extension or Extension with launchWebAuthFlow
  if (isExtensionEnvironment() && hasWebAuthFlow()) {
    return await signInViaWebAuthFlow();
  }

  // 3. Web / Browser / Standalone Tab Flow
  return await signInViaWebFlow();
};

/**
 * Chrome Native Identity flow via chrome.identity.getAuthToken
 */
const signInViaChromeNativeIdentity = async (): Promise<{ user: GoogleUser; accessToken: string }> => {
  return new Promise<{ user: GoogleUser; accessToken: string }>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, async (token: string) => {
      if (chrome.runtime?.lastError || !token) {
        const errorMsg = chrome.runtime?.lastError?.message || 'Failed to acquire auth token via chrome.identity';
        reject(new Error(errorMsg));
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
};

/**
 * Helper to generate high-entropy random string for PKCE
 */
const generateRandomString = (length = 64): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
};

/**
 * Generate SHA-256 base64url code challenge for PKCE
 */
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return verifier;
};

/**
 * Universal Extension OAuth flow using launchWebAuthFlow (Supported on both Chrome & Firefox)
 * Supports modern OAuth 2.0 PKCE Authorization Code flow with automatic token extraction fallback.
 */
export const signInViaWebAuthFlow = async (): Promise<{ user: GoogleUser; accessToken: string }> => {
  const clientId = await getOAuthClientId();
  const redirectUrl = getExtensionRedirectUrl();

  const codeVerifier = generateRandomString(64);
  let codeChallenge = '';
  try {
    codeChallenge = await generateCodeChallenge(codeVerifier);
  } catch (err) {
    console.warn('Could not generate SHA-256 code challenge, falling back to plain verifier', err);
    codeChallenge = codeVerifier;
  }

  // Construct PKCE Authorization URL
  const params: Record<string, string> = {
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUrl,
    scope: GMAIL_SCOPES,
    prompt: 'select_account',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'online',
  };

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(params).toString()}`;

  try {
    const responseUrl = await browserApi.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true,
    });

    if (!responseUrl) {
      throw new Error('OAuth flow returned an empty response');
    }

    let accessToken: string | null = null;
    let authCode: string | null = null;
    let oauthError: string | null = null;
    let oauthErrorDesc: string | null = null;

    try {
      const url = new URL(responseUrl);
      if (url.search) {
        const searchParams = new URLSearchParams(url.search);
        authCode = searchParams.get('code');
        accessToken = searchParams.get('access_token');
        oauthError = searchParams.get('error');
        oauthErrorDesc = searchParams.get('error_description');
      }
      if (url.hash) {
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
        if (!authCode) authCode = hashParams.get('code');
        if (!accessToken) accessToken = hashParams.get('access_token');
        if (!oauthError) oauthError = hashParams.get('error');
        if (!oauthErrorDesc) oauthErrorDesc = hashParams.get('error_description');
      }
    } catch {
      const codeMatch = responseUrl.match(/[?&]code=([^&]+)/);
      if (codeMatch) authCode = decodeURIComponent(codeMatch[1]);

      const tokenMatch = responseUrl.match(/[#?&]access_token=([^&]+)/);
      if (tokenMatch) accessToken = decodeURIComponent(tokenMatch[1]);

      const errorMatch = responseUrl.match(/[?&#]error=([^&]+)/);
      if (errorMatch) oauthError = decodeURIComponent(errorMatch[1]);
    }

    if (oauthError) {
      const desc = oauthErrorDesc ? ` (${oauthErrorDesc})` : '';
      if (oauthError === 'redirect_uri_mismatch' || oauthError.includes('invalid_request')) {
        throw new Error(
          `Google blocked request: "This app's request is invalid" / Error 400: ${oauthError}${desc}. Your extension's Redirect URI is: ${redirectUrl}. Add this URI to your Google Cloud Console OAuth Client Authorized Redirect URIs.`
        );
      }
      throw new Error(`Google OAuth error: ${oauthError}${desc}`);
    }

    // If PKCE authorization code was returned, exchange it for access token
    if (authCode) {
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            code: authCode,
            grant_type: 'authorization_code',
            redirect_uri: redirectUrl,
            code_verifier: codeVerifier,
          }),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          accessToken = tokenData.access_token;
        } else if (tokenData.error) {
          console.warn('Code exchange returned error:', tokenData);
          throw new Error(
            tokenData.error_description || tokenData.error || 'Failed to exchange authorization code for token'
          );
        }
      } catch (exchangeErr: any) {
        console.warn('PKCE exchange failed, checking if implicit token available:', exchangeErr);
        if (!accessToken) {
          throw exchangeErr;
        }
      }
    }

    if (!accessToken) {
      throw new Error(
        `No access token received from Google Sign-In. Redirect URI is: ${redirectUrl}`
      );
    }

    const user = await fetchGoogleUserProfile(accessToken);
    cachedAccessToken = accessToken;
    cachedUser = user;
    await storageService.local.set(STORAGE_USER_KEY, user);
    await storageService.local.set(STORAGE_TOKEN_KEY, accessToken);
    notifyListeners();
    return { user, accessToken };
  } catch (err: any) {
    const rawMsg = err?.message || String(err);
    if (rawMsg.toLowerCase().includes('cancelled') || rawMsg.toLowerCase().includes('closed')) {
      throw new Error(
        `Google Sign-In was cancelled or closed. Note: If Google displayed "This app's request is invalid" (Error 400: redirect_uri_mismatch), add this Authorized Redirect URI to your Google Cloud Console OAuth Client: ${redirectUrl}`
      );
    }
    if (rawMsg.toLowerCase().includes('invalid_request') || rawMsg.toLowerCase().includes('redirect_uri_mismatch')) {
      throw new Error(
        `Google Error: "This app's request is invalid" (Error 400: redirect_uri_mismatch). Add this URI in Google Cloud Console -> Credentials -> OAuth Client -> Authorized redirect URIs:\n${redirectUrl}`
      );
    }
    throw new Error(
      `Google OAuth failed: ${rawMsg}. Extension Redirect URI is: ${redirectUrl}`
    );
  }
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
 * Generic OAuth 2.0 Popup Flow for web environments
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

    const interval = setInterval(async () => {
      try {
        if (!popup || popup.closed) {
          clearInterval(interval);
          if (!isCompleted) {
            reject(
              new Error(
                'Google Sign-In popup was closed. In browser extensions, native identity is used. In web preview, use Demo Mode or paste a token below.'
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

  // Clear cached token via browserApi if in extension
  if (isExtensionEnvironment() && tokenToRevoke && tokenToRevoke !== 'demo_token') {
    try {
      await browserApi.identity.removeCachedAuthToken({ token: tokenToRevoke });
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
