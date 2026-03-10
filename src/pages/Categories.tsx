import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name_uz: string;
  name_ru?: string;
  name_en?: string;
  slug: string;
  order_index: number;
}

const emptyForm = { name_uz: '', name_ru: '', name_en: '', slug: '', order_index: 0 };

const Categories = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/admin/categories'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Kategoriya yaratildi ✅' });
      resetDialog();
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Kategoriya yangilandi ✅' });
      resetDialog();
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: "Kategoriya o'chirildi" });
      setDeleteId(null);
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditItem(c);
    setForm({ name_uz: c.name_uz, name_ru: c.name_ru || '', name_en: c.name_en || '', slug: c.slug, order_index: c.order_index });
    setIsDialogOpen(true);
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditItem(null);
    setForm(emptyForm);
  };

  const handleSubmit = () => {
    if (!form.name_uz.trim()) { toast({ title: 'Nomi (UZ) majburiy', variant: 'destructive' }); return; }
    if (!form.slug.trim()) { toast({ title: 'Slug majburiy', variant: 'destructive' }); return; }
    const payload = { ...form, name_ru: form.name_ru || undefined, name_en: form.name_en || undefined };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const autoSlug = (val: string) => val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const categories: Category[] = data?.data || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Kategoriyalar</h1>
        <Button className="w-full gap-2 ocean-gradient-btn text-primary-foreground hover:opacity-90 sm:w-auto" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Yangi kategoriya
        </Button>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!isLoading && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nomi (UZ)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nomi (RU)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-b border-border transition-colors last:border-0 hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium text-foreground">{c.name_uz}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.name_ru || '—'}</td>
                  <td className="px-4 py-3"><code className="rounded bg-muted px-2 py-0.5 text-xs">{c.slug}</code></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(c)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">Kategoriyalar topilmadi</div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open && !isSaving) {
          resetDialog();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nomi (UZ) *</label>
              <Input value={form.name_uz} onChange={e => { setForm(f => ({ ...f, name_uz: e.target.value, ...(!editItem ? { slug: autoSlug(e.target.value) } : {}) })); }} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nomi (RU)</label>
              <Input value={form.name_ru} onChange={e => setForm(f => ({ ...f, name_ru: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nomi (EN)</label>
              <Input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Slug *</label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: autoSlug(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={resetDialog}>Bekor qilish</Button>
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
            <AlertDialogTitle>Kategoriyani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>Haqiqatan ham bu kategoriyani o'chirmoqchimisiz?</AlertDialogDescription>
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

export default Categories;
