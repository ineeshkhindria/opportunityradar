const API_BASE = '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(body.detail || 'Request failed', res.status);
  }
  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; full_name: string }) =>
      request<{ access_token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ access_token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<any>('/auth/me'),
  },
  profile: {
    get: () => request<any>('/profile'),
    upsert: (data: any) =>
      request<any>('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: () =>
      request<void>('/profile', { method: 'DELETE' }),
  },
  opportunities: {
    list: (params?: Record<string, string | number>) => {
      const qs = params
        ? '?' + new URLSearchParams(
            Object.entries(params).map(([k, v]) => [k, String(v)])
          ).toString()
        : '';
      return request<{ items: any[]; total: number; page: number; page_size: number; total_pages: number }>(
        `/opportunities${qs}`
      );
    },
    getMatches: (params?: Record<string, string | number>) => {
      const qs = params
        ? '?' + new URLSearchParams(
            Object.entries(params).map(([k, v]) => [k, String(v)])
          ).toString()
        : '';
      return request<{ items: any[]; total: number }>(`/opportunities/match${qs}`);
    },
    get: (id: string) => request<any>(`/opportunities/${id}`),
  },
  applications: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ items: any[]; total: number }>(`/applications${qs}`);
    },
    create: (data: { opportunity_id: string; notes?: string }) =>
      request<any>('/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<any>(`/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/applications/${id}`, { method: 'DELETE' }),
    stats: () => request<any>('/applications/stats'),
  },
  digest: {
    getPreferences: () => request<any>('/digest/preferences'),
    updatePreferences: (data: any) =>
      request<any>('/digest/preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getLogs: (limit = 10) =>
      request<any[]>(`/digest/logs?limit=${limit}`),
  },
  admin: {
    triggerScrape: () =>
      request<{ message: string; results: Record<string, number> }>('/admin/scrape', {
        method: 'POST',
      }),
  },
};
