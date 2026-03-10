import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';
import { deleteMediaUrl, deleteMediaUrls } from '@/lib/media';

interface Product {
  id: string;
  name_uz: string;
  name_ru?: string;
  name_en?: string;
  desc_uz?: string;
  desc_ru?: string;
  desc_en?: string;
  original_price?: number;
  discount_price?: number;
  is_on_sale: boolean;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  images: string[];
  category_id?: string;
  category?: { id: string; name_uz: string };
  order_index: number;
}

interface Category {
  id: string;
  name_uz: string;
  slug: string;
}

const emptyForm = {
  name_uz: '', name_ru: '', name_en: '', desc_uz: '', desc_ru: '', desc_en: '',
  original_price: '', discount_price: '',
  images: [] as string[],
  category_id: '', is_active: true, is_featured: false, is_new: false, is_on_sale: false, order_index: 0,
};

const Products = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const originalImagesRef = useRef<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search, statusFilter],
    queryFn: () => api.get('/admin/products', {
      page,
      per_page: 20,
      search: search || undefined,
      is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      is_on_sale: statusFilter === 'sale' ? true : undefined,
    }),
  });

  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/admin/categories'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Mahsulot yaratildi ✅' });
      resetDialog();
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/admin/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Mahsulot yangilandi ✅' });
      resetDialog();
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: "Mahsulot o'chirildi" });
      setDeleteId(null);
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditItem(null);
    originalImagesRef.current = [];
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditItem(p);
    originalImagesRef.current = [...(p.images || [])];
    setForm({
      name_uz: p.name_uz, name_ru: p.name_ru || '', name_en: p.name_en || '',
      desc_uz: p.desc_uz || '', desc_ru: p.desc_ru || '', desc_en: p.desc_en || '',
      original_price: p.original_price?.toString() || '', discount_price: p.discount_price?.toString() || '',
      images: p.images || [],
      category_id: p.category_id || p.category?.id || '',
      is_active: p.is_active, is_featured: p.is_featured, is_new: p.is_new, is_on_sale: p.is_on_sale,
      order_index: p.order_index,
    });
    setIsDialogOpen(true);
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditItem(null);
    setForm(emptyForm);
    originalImagesRef.current = [];
  };

  const closeDialog = async () => {
    const tempImages = form.images.filter((url) => url && !originalImagesRef.current.includes(url));
    await deleteMediaUrls(tempImages);
    resetDialog();
  };

  const handleSubmit = () => {
    if (!form.name_uz.trim()) { toast({ title: 'Nomi (UZ) majburiy', variant: 'destructive' }); return; }
    const payload: any = {
      name_uz: form.name_uz,
      name_ru: form.name_ru || undefined,
      name_en: form.name_en || undefined,
      desc_uz: form.desc_uz || undefined,
      desc_ru: form.desc_ru || undefined,
      desc_en: form.desc_en || undefined,
      original_price: form.original_price ? parseFloat(form.original_price) : undefined,
      discount_price: form.discount_price ? parseFloat(form.discount_price) : undefined,
      images: form.images,
      category_id: form.category_id || undefined,
      is_active: form.is_active,
      is_featured: form.is_featured,
      is_new: form.is_new,
      is_on_sale: form.is_on_sale,
      order_index: form.order_index,
    };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const products: Product[] = data?.data?.items || data?.data || [];
  const categories: Category[] = catData?.data || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const totalPages = data?.data?.pages || 1;

  const formatPrice = (n: number) => n.toLocaleString('uz-UZ') + " so'm";

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Mahsulotlar</h1>
          <Badge variant="secondary" className="bg-secondary text-primary">{products.length} ta</Badge>
        </div>
        <Button className="w-full gap-2 ocean-gradient-btn text-primary-foreground hover:opacity-90 sm:w-auto" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Yangi mahsulot
        </Button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative w-full min-w-0 sm:min-w-[200px] sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Holat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="inactive">Passiv</SelectItem>
            <SelectItem value="sale">Aksiya</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!isLoading && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Rasm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nomi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Kategoriya</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Narx</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Holat</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-border transition-colors last:border-0 hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name_uz} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{p.name_uz}</span>
                    {p.is_on_sale && <Badge className="ml-2 bg-accent/20 text-accent">🏷️ Aksiya</Badge>}
                    {p.is_new && <Badge className="ml-2 bg-primary/20 text-primary">🆕 Yangi</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{p.category?.name_uz || '—'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{p.original_price ? formatPrice(p.original_price) : '—'}</span>
                    {p.discount_price && (
                      <span className="ml-2 text-sm text-muted-foreground line-through">{formatPrice(p.discount_price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={p.is_active ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'}>
                      {p.is_active ? '● Aktiv' : '○ Passiv'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(p)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">Hech narsa topilmadi</div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Sahifa {page} / {totalPages}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(prev => Math.max(1, prev - 1))}>
              Oldingi
            </Button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? 'default' : 'outline'}
                  size="sm"
                  className={page === pageNumber ? 'ocean-gradient-btn text-primary-foreground hover:opacity-90' : ''}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}>
              Keyingi
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open && !isSaving) {
          void closeDialog();
        }
      }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nomi (UZ) *</label>
              <Input value={form.name_uz} onChange={e => setForm(f => ({ ...f, name_uz: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nomi (RU)</label>
                <Input value={form.name_ru} onChange={e => setForm(f => ({ ...f, name_ru: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nomi (EN)</label>
                <Input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tavsif (UZ)</label>
              <Textarea value={form.desc_uz} onChange={e => setForm(f => ({ ...f, desc_uz: e.target.value }))} rows={3} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Kategoriya</label>
              <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name_uz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Narx</label>
                <Input type="number" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Chegirma narx</label>
                <Input type="number" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))} placeholder="0" />
              </div>
            </div>

            {/* Image Upload */}
            <ImageUpload
              value={form.images}
              onChange={(urls) => setForm(f => ({ ...f, images: urls }))}
              onRemove={async (url) => {
                if (!originalImagesRef.current.includes(url)) {
                  await deleteMediaUrl(url);
                }
              }}
              folder="products"
              max={5}
              label="Mahsulot rasmlari"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Aktiv</label>
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Yangi</label>
                <Switch checked={form.is_new} onCheckedChange={v => setForm(f => ({ ...f, is_new: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Featured</label>
                <Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Aksiya</label>
                <Switch checked={form.is_on_sale} onCheckedChange={v => setForm(f => ({ ...f, is_on_sale: v }))} />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => void closeDialog()}>Bekor qilish</Button>
            <Button className="w-full ocean-gradient-btn text-primary-foreground sm:w-auto" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saqlanmoqda...' : editItem ? 'Saqlash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mahsulotni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>Haqiqatan ham bu mahsulotni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
