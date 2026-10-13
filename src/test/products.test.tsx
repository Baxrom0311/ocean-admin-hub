import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import Products from '@/pages/Products';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({ api: { get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() } }));
afterEach(cleanup);

it('sends null when an existing product price and description are cleared', async () => {
  vi.mocked(api.get).mockImplementation(async <T,>(url: string) => (url === '/admin/categories'
    ? { success: true, data: [] }
    : { success: true, data: { items: [{ id: 'product-1', name_uz: 'Water', desc_uz: 'Old description', original_price: 123, images: [], order_index: 0, is_active: true, is_on_sale: false, is_new: false, is_featured: false }], total: 1, pages: 1 } }) as T);
  vi.mocked(api.put).mockResolvedValue({ success: true, data: {} });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><Products /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Tahrirlash: Water' }));
  fireEvent.change(screen.getByDisplayValue('Old description'), { target: { value: '' } });
  fireEvent.change(screen.getByDisplayValue('123'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Saqlash' }));
  await waitFor(() => expect(api.put).toHaveBeenCalledWith('/admin/products/product-1', expect.objectContaining({ desc_uz: null, original_price: null })));
});
