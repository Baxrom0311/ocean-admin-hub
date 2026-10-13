import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';

const fetchMock = vi.fn();
const values = new Map<string, string>();
const storage: Storage = {
  get length() { return values.size; },
  clear: () => values.clear(),
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => { values.set(key, String(value)); },
  removeItem: key => { values.delete(key); },
  key: index => [...values.keys()][index] ?? null,
};
beforeEach(() => { vi.stubGlobal('localStorage', storage); localStorage.clear(); vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); });
afterEach(() => vi.unstubAllGlobals());
const fail = (status: number, body: unknown) => fetchMock.mockResolvedValue({ ok: false, status, json: async () => body });

describe('API errors', () => {
  it('shows the server message for conflicts', async () => {
    fail(409, { message: 'Bu slug allaqachon mavjud', detail: null });
    await expect(api.post('/admin/categories', {})).rejects.toThrow('Bu slug allaqachon mavjud');
  });
  it('renders validation errors as text', async () => {
    fail(422, { message: 'Invalid', detail: [{ field: 'password', message: 'Parol kamida 8 ta belgi' }] });
    await expect(api.post('/admin/users', {})).rejects.toThrow('Parol kamida 8 ta belgi');
  });
  it('keeps login errors in the form without expiring another session', async () => {
    const expired = vi.fn(); window.addEventListener('eco-auth-expired', expired);
    localStorage.setItem('eco_admin_token', 'existing');
    fail(401, { message: "Email yoki parol noto'g'ri" });
    await expect(api.post('/auth/login', {})).rejects.toThrow("Email yoki parol noto'g'ri");
    expect(localStorage.getItem('eco_admin_token')).toBe('existing');
    expect(expired).not.toHaveBeenCalled();
    window.removeEventListener('eco-auth-expired', expired);
  });
  it('clears expired credentials and rejects protected requests', async () => {
    const expired = vi.fn(); window.addEventListener('eco-auth-expired', expired);
    localStorage.setItem('eco_admin_token', 'expired');
    fail(401, { message: 'Token yaroqsiz' });
    await expect(api.get('/auth/me')).rejects.toThrow('Token yaroqsiz');
    expect(localStorage.getItem('eco_admin_token')).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
    window.removeEventListener('eco-auth-expired', expired);
  });
});
