import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { SingleFileUpload } from '@/components/ImageUpload';
import { deleteMediaUrl } from '@/lib/media';

interface Certificate {
  id: string;
  title_uz: string;
  title_ru?: string;
  title_en?: string;
  file_url: string;
  file_type: string;
  preview_url?: string;
  order_index: number;
}

const emptyForm = {
  title_uz: '', title_ru: '', title_en: '', file_url: '', file_type: 'image',
  preview_url: '', order_index: 0,
};

const Certificates = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Certificate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const originalFileRef = useRef('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-certificates'],
    queryFn: () => api.get('/admin/certificates'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/certificates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
      toast({ title: 'Sertifikat yaratildi ✅' });
      resetDialog();
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/admin/certificates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
      toast({ title: 'Sertifikat yangilandi ✅' });
      resetDialog();
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/certificates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
      toast({ title: "Sertifikat o'chirildi" });
      setDeleteId(null);
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditItem(null);
    originalFileRef.current = '';
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (c: Certificate) => {
    setEditItem(c);
    originalFileRef.current = c.file_url;
    setForm({
      title_uz: c.title_uz, title_ru: c.title_ru || '', title_en: c.title_en || '',
      file_url: c.file_url, file_type: 'image',
      preview_url: c.preview_url || '', order_index: c.order_index,
    });
    setIsDialogOpen(true);
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditItem(null);
    setForm(emptyForm);
    originalFileRef.current = '';
  };

  const closeDialog = async () => {
    if (form.file_url && form.file_url !== originalFileRef.current) {
      await deleteMediaUrl(form.file_url);
    }
    resetDialog();
  };

  const handleSubmit = () => {
    if (!form.title_uz.trim()) { toast({ title: 'Sarlavha (UZ) majburiy', variant: 'destructive' }); return; }
    if (!form.file_url.trim()) { toast({ title: 'Fayl yuklash majburiy', variant: 'destructive' }); return; }
    const payload: any = {
      ...form,
      file_type: 'image',
      title_ru: form.title_ru || undefined, title_en: form.title_en || undefined,
      preview_url: form.preview_url || undefined,
      is_active: true,
      is_downloadable: true,
    };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const certs: Certificate[] = data?.data?.items || data?.data || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Sertifikatlar</h1>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
          <Button variant="outline" size="icon" onClick={() => setView('grid')} className={view === 'grid' ? 'bg-secondary' : ''}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setView('list')} className={view === 'list' ? 'bg-secondary' : ''}>
            <List className="h-4 w-4" />
          </Button>
          <Button className="w-full gap-2 ocean-gradient-btn text-primary-foreground hover:opacity-90 sm:w-auto" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Yangi sertifikat
          </Button>
        </div>
      </motion.div>

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map(cert => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-xl border border-border bg-card ocean-shadow">
              <div className="flex h-40 items-center justify-center bg-muted">
                {cert.file_url && cert.file_type === 'image' ? (
                  <img src={cert.file_url} alt={cert.title_uz} className="h-full w-full object-cover" />
                ) : (
                  <Badge variant="outline">{cert.file_type?.toUpperCase() || 'FILE'}</Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{cert.title_uz}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Har doim aktiv va yuklab olinadi</p>
              </div>
              <div className="flex flex-wrap gap-1 border-t border-border p-3">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => openEdit(cert)}>
                  <Edit2 className="mr-1 h-3 w-3" /> Tahrir
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(cert.id)}>
                  <Trash2 className="mr-1 h-3 w-3" /> O'ch
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[680px]">
            <thead><tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sarlavha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tur</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amallar</th>
            </tr></thead>
            <tbody>
              {certs.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium text-foreground">{c.title_uz}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{c.file_type}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(c)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {certs.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">Sertifikatlar topilmadi</div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open && !isSaving) {
          void closeDialog();
        }
      }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Sertifikatni tahrirlash' : 'Yangi sertifikat'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Sarlavha (UZ) *</label>
              <Input value={form.title_uz} onChange={e => setForm(f => ({ ...f, title_uz: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Sarlavha (RU)</label>
                <Input value={form.title_ru} onChange={e => setForm(f => ({ ...f, title_ru: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Sarlavha (EN)</label>
                <Input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} />
              </div>
            </div>

            {/* File Upload */}
            <SingleFileUpload
              value={form.file_url}
              onChange={(url) => setForm(f => ({ ...f, file_url: url, file_type: 'image' }))}
              onRemove={async (url) => {
                if (url !== originalFileRef.current) {
                  await deleteMediaUrl(url);
                }
              }}
              folder="certificates"
              label="Sertifikat rasmi *"
              accept="image/*"
            />
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Sertifikatlar avtomatik aktiv va yuklab olinadigan holatda saqlanadi.
            </p>
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => void closeDialog()}>Bekor qilish</Button>
            <Button className="w-full ocean-gradient-btn text-primary-foreground sm:w-auto" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saqlanmoqda...' : editItem ? 'Saqlash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sertifikatni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>Haqiqatan ham bu sertifikatni o'chirmoqchimisiz?</AlertDialogDescription>
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

export default Certificates;
