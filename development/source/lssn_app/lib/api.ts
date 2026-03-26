import AsyncStorage from '@react-native-async-storage/async-storage';

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'viewer' | 'creator' | 'admin';
  };
};

const ACCESS_KEY = 'lssn_app_access_token';
const REFRESH_KEY = 'lssn_app_refresh_token';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.40.125:5000';

export function getApiBaseUrl() {
  return API_BASE_URL;
}

async function getStoredToken(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

async function setStoredToken(key: string, value: string) {
  await AsyncStorage.setItem(key, value);
}

async function clearStoredToken(key: string) {
  await AsyncStorage.removeItem(key);
}

export async function getAccessToken(): Promise<string | null> {
  return getStoredToken(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getStoredToken(REFRESH_KEY);
}

export async function setTokens(tokens: Tokens) {
  await setStoredToken(ACCESS_KEY, tokens.accessToken);
  await setStoredToken(REFRESH_KEY, tokens.refreshToken);
}

export async function clearTokens() {
  await clearStoredToken(ACCESS_KEY);
  await clearStoredToken(REFRESH_KEY);
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function refreshTokens(refreshToken: string): Promise<Tokens> {
  const data = await requestJson<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  const tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
  await setTokens(tokens);
  return tokens;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = await getAccessToken();
  const headers = {
    ...(init?.headers ?? {}),
    Authorization: accessToken ? `Bearer ${accessToken}` : '',
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      const newTokens = await refreshTokens(refreshToken);
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          Authorization: `Bearer ${newTokens.accessToken}`,
        },
      });

      if (!retryResponse.ok) {
        const message = await retryResponse.text();
        throw new Error(message || 'Request failed');
      }

      if (retryResponse.status === 204) {
        return undefined as T;
      }

      return retryResponse.json() as Promise<T>;
    }
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const data = await requestJson<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.user;
}

export async function register(name: string, email: string, password: string) {
  const data = await requestJson<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.user;
}

export async function logout() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await requestJson<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }
  await clearTokens();
}

export async function getMe() {
  return apiFetch<AuthResponse['user']>('/auth/me');
}

export async function getCategories() {
  return apiFetch<Array<{ id: number; name: string; slug: string; thumbnailUrl?: string | null }>>(
    '/categories'
  );
}

export async function getPublishedLssns() {
  return apiFetch<any[]>('/lssns');
}

export async function getLssn(id: number) {
  return apiFetch<any>(`/lssns/${id}`);
}

export async function reactToSlide(id: number, slideIndex: number, reaction: 'like' | 'dislike') {
  return apiFetch(`/lssns/${id}/slides/${slideIndex}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reaction }),
  });
}

export async function getTopics() {
  return apiFetch<Array<{ id: number; name: string; slug: string }>>('/topics');
}

export async function getMyLssns() {
  return apiFetch<any[]>('/lssns?mine=true');
}

export function resolveAssetUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
}
