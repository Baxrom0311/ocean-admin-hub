const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
export interface InstagramStatus {
  mode: string;
  is_configured: boolean;
  link_count: number;
  message: string;
}
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export function errorMessage(body: unknown): string {
  if (!body || typeof body !== 'object') return 'Server xatosi';
  const error = body as { message?: unknown; detail?: unknown };
  if (Array.isArray(error.detail)) {
    const messages = error.detail.map((item: unknown) => {
      if (!item || typeof item !== 'object') return '';
      const value = item as { message?: unknown; msg?: unknown };
      return typeof value.message === 'string' ? value.message : typeof value.msg === 'string' ? value.msg : '';
    }).filter(Boolean);
    if (messages.length) return messages.join('; ');
  }
  if (typeof error.message === 'string') return error.message;
  return typeof error.detail === 'string' ? error.detail : 'Server xatosi';
}

async function request<T>(method: string, url: string, data?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('eco_admin_token');
  if (token) headers.Authorization = `Bearer ${token}`;
  const isFormData = data instanceof FormData;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_BASE}${url}`, {
    method, headers,
    body: isFormData ? data : data === undefined ? undefined : JSON.stringify(data),
  });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && url !== '/auth/login') {
      localStorage.removeItem('eco_admin_token');
      localStorage.removeItem('eco_admin_user');
      window.dispatchEvent(new Event('eco-auth-expired'));
    }
    throw new ApiError(errorMessage(body), res.status);
  }
  return body as T;
}

type QueryValue = string | number | boolean | null | undefined;
export const api = {
  get: <T>(url: string, params: Record<string, QueryValue> = {}) => {
    const qs = new URLSearchParams(Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)])).toString();
    return request<T>('GET', qs ? `${url}?${qs}` : url);
  },
  post: <T = ApiResponse>(url: string, data?: unknown) => request<T>('POST', url, data),
  put: <T = ApiResponse>(url: string, data?: unknown) => request<T>('PUT', url, data),
  patch: <T = ApiResponse>(url: string, data?: unknown) => request<T>('PATCH', url, data),
  delete: (url: string) => request<ApiResponse>('DELETE', url),
  upload: (file: File, folder: string) => {
    const form = new FormData();
    form.append('file', file);
    return request<ApiResponse<{ url: string; public_id: string }>>('POST', `/admin/upload?folder=${encodeURIComponent(folder)}`, form);
  },
};
