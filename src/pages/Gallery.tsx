import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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

interface GalleryItem {
  id: string;
  file_url: string;
  file_type: string;
  thumbnail_url?: string;
}

interface Album {
  id: string;
  title_uz: string;
  title_ru?: string;
  title_en?: string;
  description_uz?: string;
  category?: string;
  is_active: boolean;
  order_index: number;
  items?: GalleryItem[];
}

const emptyAlbumForm = {
  title_uz: '', title_ru: '', title_en: '', description_uz: '',
  category: '', is_active: true, order_index: 0,
};

const emptyItemForm = {
  images: [] as string[],
};

const Gallery = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Album | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyAlbumForm);
  // Add items dialog
  const [addItemsAlbumId, setAddItemsAlbumId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: () => api.get('/admin/gallery/albums'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/gallery/albums', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast({ title: 'Album yaratildi ✅' });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/admin/gallery/albums/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast({ title: 'Album yangilandi ✅' });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/gallery/albums/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast({ title: "Album o'chirildi" });
      setDeleteId(null);
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const addItemMutation = useMutation({
    mutationFn: ({ albumId, data }: { albumId: string; data: any }) => api.post(`/admin/gallery/albums/${albumId}/items`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const openCreate = () => { setEditItem(null); setForm(emptyAlbumForm); setIsDialogOpen(true); };

  const openEdit = (a: Album) => {
    setEditItem(a);
    setForm({
      title_uz: a.title_uz, title_ru: a.title_ru || '', title_en: a.title_en || '',
      description_uz: a.description_uz || '', category: a.category || '',
      is_active: a.is_active, order_index: a.order_index,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => { setIsDialogOpen(false); setEditItem(null); setForm(emptyAlbumForm); };

  const handleSubmit = () => {
    if (!form.title_uz.trim()) { toast({ title: 'Sarlavha (UZ) majburiy', variant: 'destructive' }); return; }
    const payload: any = {
      ...form,
      title_ru: form.title_ru || undefined, title_en: form.title_en || undefined,
      description_uz: form.description_uz || undefined, category: form.category || undefined,
    };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openAddItems = (albumId: string) => {
    setAddItemsAlbumId(albumId);
    setItemForm(emptyItemForm);
  };

  const handleAddItems = async () => {
    if (!addItemsAlbumId || itemForm.images.length === 0) return;
    // Add each image as a gallery item
    for (const url of itemForm.images) {
      await addItemMutation.mutateAsync({
        albumId: addItemsAlbumId,
        data: { file_url: url, file_type: 'image' },
      });
    }
    toast({ title: `${itemForm.images.length} ta rasm qo'shildi ✅` });
    setAddItemsAlbumId(null);
    setItemForm(emptyItemForm);
  };

  const albums: Album[] = data?.data || [];
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Galereya</h1>
        <Button className="gap-2 ocean-gradient-btn text-primary-foreground hover:opacity-90" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Yangi album
        </Button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map(album => (
          <motion.div key={album.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="group overflow-hidden rounded-xl border border-border bg-card ocean-shadow transition-all hover:ocean-shadow-lg">
            <div className="flex h-44 items-center justify-center bg-muted">
              {album.items?.[0]?.file_url ? (
                <img src={album.items[0].file_url} alt={album.title_uz} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{album.title_uz}</h3>
                {album.category && <Badge variant="outline">{album.category}</Badge>}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{album.items?.length || 0} ta rasm</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
                    title="Rasm qo'shish" onClick={(e) => { e.stopPropagation(); openAddItems(album.id); }}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={(e) => { e.stopPropagation(); openEdit(album); }}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); setDeleteId(album.id); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add new card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={openCreate}
          className="flex h-full min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <Plus className="mb-2 h-8 w-8" />
          <span className="text-sm font-medium">Yangi album</span>
        </motion.div>
      </div>

      {albums.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">Albumlar topilmadi</div>
      )}

      {/* Create/Edit Album Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={v => !v && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Albumni tahrirlash' : 'Yangi album'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Sarlavha (UZ) *</label>
              <Input value={form.title_uz} onChange={e => setForm(f => ({ ...f, title_uz: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Sarlavha (RU)</label>
                <Input value={form.title_ru} onChange={e => setForm(f => ({ ...f, title_ru: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Sarlavha (EN)</label>
                <Input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tavsif (UZ)</label>
              <Textarea value={form.description_uz} onChange={e => setForm(f => ({ ...f, description_uz: e.target.value }))} rows={3} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Kategoriya</label>
              <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="photo, video, event..." />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Aktiv</label>
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Bekor qilish</Button>
            <Button className="ocean-gradient-btn text-primary-foreground" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saqlanmoqda...' : editItem ? 'Saqlash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Items Dialog */}
      <Dialog open={!!addItemsAlbumId} onOpenChange={v => !v && setAddItemsAlbumId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Albumga rasm qo'shish</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <ImageUpload
              value={itemForm.images}
              onChange={(urls) => setItemForm(f => ({ ...f, images: urls }))}
              folder="gallery"
              max={10}
              label="Rasmlarni yuklang"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemsAlbumId(null)}>Bekor qilish</Button>
            <Button className="ocean-gradient-btn text-primary-foreground" onClick={handleAddItems}
              disabled={addItemMutation.isPending || itemForm.images.length === 0}>
              {addItemMutation.isPending ? 'Saqlanmoqda...' : `${itemForm.images.length} ta rasm qo'shish`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Albumni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>Haqiqatan ham bu albumni va undagi barcha rasmlarni o'chirmoqchimisiz?</AlertDialogDescription>
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

export default Gallery;
