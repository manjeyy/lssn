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

const ACCESS_KEY = 'lssn_access_token';
const REFRESH_KEY = 'lssn_refresh_token';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

export function getApiBaseUrl() {
  return API_BASE_URL;
}

function getStoredToken(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

function setStoredToken(key: string, value: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value);
}

function clearStoredToken(key: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export function getAccessToken(): string | null {
  return getStoredToken(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return getStoredToken(REFRESH_KEY);
}

export function setTokens(tokens: Tokens) {
  setStoredToken(ACCESS_KEY, tokens.accessToken);
  setStoredToken(REFRESH_KEY, tokens.refreshToken);
}

export function clearTokens() {
  clearStoredToken(ACCESS_KEY);
  clearStoredToken(REFRESH_KEY);
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

  return response.json() as Promise<T>;
}

async function refreshTokens(refreshToken: string): Promise<Tokens> {
  const data = await requestJson<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  const tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
  setTokens(tokens);
  return tokens;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = getAccessToken();
  const headers = {
    ...(init?.headers ?? {}),
    Authorization: accessToken ? `Bearer ${accessToken}` : '',
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    const refreshToken = getRefreshToken();
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

  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.user;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await requestJson<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }
  clearTokens();
}

export async function uploadImage(file: File) {
  const accessToken = getAccessToken();
  const form = new FormData();
  form.append('file', file);

  const response = await fetch(`${API_BASE_URL}/uploads/images`, {
    method: 'POST',
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
    body: form,
  });

  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const newTokens = await refreshTokens(refreshToken);
      const retry = await fetch(`${API_BASE_URL}/uploads/images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${newTokens.accessToken}`,
        },
        body: form,
      });

      if (!retry.ok) {
        const message = await retry.text();
        throw new Error(message || 'Upload failed');
      }

      return retry.json() as Promise<{ url: string }>;
    }
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Upload failed');
  }

  return response.json() as Promise<{ url: string }>;
}

export async function getMyStats() {
  return apiFetch<{ totalViews: number; totalLikes: number; totalLssns: number; avgRating: number }>(
    '/lssns/stats/me',
  );
}

export async function getMyLssns() {
  return apiFetch<any[]>('/lssns?mine=true');
}

export async function getCategories() {
  return apiFetch<any[]>('/categories');
}

export async function getTopics() {
  return apiFetch<any[]>('/topics');
}

export async function createLssn(payload: unknown) {
  return apiFetch<any>('/lssns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateLssn(id: number, payload: unknown) {
  return apiFetch<any>(`/lssns/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteLssn(id: number) {
  return apiFetch<void>(`/lssns/${id}`, { method: 'DELETE' });
}
