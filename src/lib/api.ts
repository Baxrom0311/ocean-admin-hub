const API_BASE = 'https://api.ecocompany.uz/api/v1';

const getToken = () => localStorage.getItem('eco_admin_token');

const request = async (method: string, url: string, data?: any, isFormData = false) => {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
  });

  if (res.status === 401) {
    localStorage.removeItem('eco_admin_token');
    localStorage.removeItem('eco_admin_user');
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Server xatosi');
  }

  return res.json();
};

export const api = {
  get: (url: string, params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    return request('GET', qs ? `${url}?${qs}` : url);
  },
  post: (url: string, data?: any) => request('POST', url, data),
  put: (url: string, data?: any) => request('PUT', url, data),
  patch: (url: string, data?: any) => request('PATCH', url, data),
  delete: (url: string) => request('DELETE', url),
  upload: (file: File, folder: string) => {
    const form = new FormData();
    form.append('file', file);
    return request('POST', `/admin/upload?folder=${folder}`, form, true);
  },
};
