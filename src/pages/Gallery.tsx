import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Edit2, Image as ImageIcon, Images, Plus, Trash2 } from 'lucide-react';
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
import ImageUpload, { SingleFileUpload } from '@/components/ImageUpload';
import { deleteMediaUrl, deleteMediaUrls } from '@/lib/media';

interface GalleryItem {
  id: string;
  file_url: string;
  file_type: string;
  thumbnail_url?: string;
  order_index: number;
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

const emptyReplaceForm = {
  file_url: '',
};

const Gallery = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editAlbum, setEditAlbum] = useState<Album | null>(null);
  const [isAlbumDialogOpen, setIsAlbumDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyAlbumForm);
  const [addItemsAlbumId, setAddItemsAlbumId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [manageAlbumId, setManageAlbumId] = useState<string | null>(null);
  const [replaceItem, setReplaceItem] = useState<{ albumId: string; item: GalleryItem } | null>(null);
  const [replaceForm, setReplaceForm] = useState(emptyReplaceForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: () => api.get('/admin/gallery/albums'),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyAlbumForm) => api.post('/admin/gallery/albums', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast({ title: 'Album yaratildi ✅' });
      resetAlbumDialog();
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof emptyAlbumForm }) => api.put(`/admin/gallery/albums/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast({ title: 'Album yangilandi ✅' });
      resetAlbumDialog();
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/gallery/albums/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast({ title: "Album o'chirildi" });
      setDeleteId(null);
      if (manageAlbumId === deleteId) {
        setManageAlbumId(null);
      }
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

  const updateItemMutation = useMutation({
    mutationFn: ({ albumId, itemId, data }: { albumId: string; itemId: string; data: any }) => api.put(`/admin/gallery/albums/${albumId}/items/${itemId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast({ title: 'Rasm yangilandi ✅' });
      resetReplaceDialog();
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({ albumId, itemId }: { albumId: string; itemId: string }) => api.delete(`/admin/gallery/albums/${albumId}/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast({ title: "Rasm o'chirildi" });
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const reorderMutation = useMutation({
    mutationFn: ({ albumId, items }: { albumId: string; items: { id: string; order_index: number }[] }) => api.post(`/admin/gallery/albums/${albumId}/items/reorder`, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
    },
    onError: (err: Error) => toast({ title: 'Xato', description: err.message, variant: 'destructive' }),
  });

  const albums: Album[] = data?.data || [];
  const manageAlbum = albums.find(album => album.id === manageAlbumId) || null;
  const sortedManageItems = [...(manageAlbum?.items || [])].sort((a, b) => a.order_index - b.order_index);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const resetAlbumDialog = () => {
    setIsAlbumDialogOpen(false);
    setEditAlbum(null);
    setForm(emptyAlbumForm);
  };

  const openCreate = () => {
    setEditAlbum(null);
    setForm(emptyAlbumForm);
    setIsAlbumDialogOpen(true);
  };

  const openEdit = (album: Album) => {
    setEditAlbum(album);
    setForm({
      title_uz: album.title_uz,
      title_ru: album.title_ru || '',
      title_en: album.title_en || '',
      description_uz: album.description_uz || '',
      category: album.category || '',
      is_active: album.is_active,
      order_index: album.order_index,
    });
    setIsAlbumDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title_uz.trim()) {
      toast({ title: 'Sarlavha (UZ) majburiy', variant: 'destructive' });
      return;
    }
    const payload: any = {
      ...form,
      title_ru: form.title_ru || undefined,
      title_en: form.title_en || undefined,
      description_uz: form.description_uz || undefined,
      category: form.category || undefined,
    };

    if (editAlbum) {
      updateMutation.mutate({ id: editAlbum.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openAddItems = (albumId: string) => {
    setAddItemsAlbumId(albumId);
    setItemForm(emptyItemForm);
  };

  const closeAddItemsDialog = async () => {
    await deleteMediaUrls(itemForm.images);
    setAddItemsAlbumId(null);
    setItemForm(emptyItemForm);
  };

  const handleAddItems = async () => {
    if (!addItemsAlbumId || itemForm.images.length === 0) return;

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

  const openReplaceDialog = (albumId: string, item: GalleryItem) => {
    setReplaceItem({ albumId, item });
    setReplaceForm({ file_url: item.file_url });
  };

  const resetReplaceDialog = () => {
    setReplaceItem(null);
    setReplaceForm(emptyReplaceForm);
  };

  const closeReplaceDialog = async () => {
    if (replaceItem && replaceForm.file_url && replaceForm.file_url !== replaceItem.item.file_url) {
      await deleteMediaUrl(replaceForm.file_url);
    }
    resetReplaceDialog();
  };

  const handleReplaceSave = () => {
    if (!replaceItem) return;
    if (!replaceForm.file_url.trim()) {
      toast({ title: 'Rasm majburiy', variant: 'destructive' });
      return;
    }

    updateItemMutation.mutate({
      albumId: replaceItem.albumId,
      itemId: replaceItem.item.id,
      data: {
        file_url: replaceForm.file_url,
        file_type: replaceItem.item.file_type,
        order_index: replaceItem.item.order_index,
      },
    });
  };

  const moveItem = (albumId: string, index: number, direction: -1 | 1) => {
    const items = [...sortedManageItems];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];

    reorderMutation.mutate({
      albumId,
      items: items.map((item, orderIndex) => ({
        id: item.id,
        order_index: orderIndex,
      })),
    });
  };

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
        <h1 className="text-2xl font-bold text-foreground">Galereya</h1>
        <Button className="w-full gap-2 ocean-gradient-btn text-primary-foreground hover:opacity-90 sm:w-auto" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Yangi album
        </Button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map(album => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group overflow-hidden rounded-xl border border-border bg-card ocean-shadow transition-all hover:ocean-shadow-lg"
          >
            <div className="flex h-44 items-center justify-center bg-muted">
              {album.items?.[0]?.file_url ? (
                <img src={album.items[0].file_url} alt={album.title_uz} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-foreground">{album.title_uz}</h3>
                {album.category && <Badge variant="outline">{album.category}</Badge>}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">{album.items?.length || 0} ta rasm</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Rasm qo'shish" onClick={(e) => { e.stopPropagation(); openAddItems(album.id); }}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Rasmlarni boshqarish" onClick={(e) => { e.stopPropagation(); setManageAlbumId(album.id); }}>
                    <Images className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); openEdit(album); }}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(album.id); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={openCreate}
          className="flex h-full min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="mb-2 h-8 w-8" />
          <span className="text-sm font-medium">Yangi album</span>
        </motion.div>
      </div>

      {albums.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">Albumlar topilmadi</div>
      )}

      <Dialog open={isAlbumDialogOpen} onOpenChange={(open) => !open && resetAlbumDialog()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editAlbum ? 'Albumni tahrirlash' : 'Yangi album'}</DialogTitle>
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
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={resetAlbumDialog}>Bekor qilish</Button>
            <Button className="w-full ocean-gradient-btn text-primary-foreground sm:w-auto" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saqlanmoqda...' : editAlbum ? 'Saqlash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!addItemsAlbumId} onOpenChange={(open) => {
        if (!open) {
          void closeAddItemsDialog();
        }
      }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Albumga rasm qo'shish</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <ImageUpload
              value={itemForm.images}
              onChange={(urls) => setItemForm(f => ({ ...f, images: urls }))}
              onRemove={async (url) => {
                await deleteMediaUrl(url);
              }}
              folder="gallery"
              max={10}
              label="Rasmlarni yuklang"
            />
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => void closeAddItemsDialog()}>Bekor qilish</Button>
            <Button className="w-full ocean-gradient-btn text-primary-foreground sm:w-auto" onClick={handleAddItems} disabled={addItemMutation.isPending || itemForm.images.length === 0}>
              {addItemMutation.isPending ? 'Saqlanmoqda...' : `${itemForm.images.length} ta rasm qo'shish`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!manageAlbumId} onOpenChange={(open) => !open && setManageAlbumId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{manageAlbum?.title_uz || 'Rasmlarni boshqarish'}</DialogTitle>
          </DialogHeader>
          {manageAlbum && sortedManageItems.length > 0 ? (
            <div className="space-y-3 py-2">
              {sortedManageItems.map((item, index) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
                  <div className="h-20 w-full overflow-hidden rounded-lg bg-muted sm:w-28">
                    <img src={item.thumbnail_url || item.file_url} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">Rasm #{index + 1}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.file_url}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="icon" disabled={index === 0 || reorderMutation.isPending} onClick={() => moveItem(manageAlbum.id, index, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" disabled={index === sortedManageItems.length - 1 || reorderMutation.isPending} onClick={() => moveItem(manageAlbum.id, index, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openReplaceDialog(manageAlbum.id, item)}>
                      <Edit2 className="mr-1 h-4 w-4" /> Almashtirish
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteItemMutation.mutate({ albumId: manageAlbum.id, itemId: item.id })}>
                      <Trash2 className="mr-1 h-4 w-4" /> O'chirish
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">Bu albumda hali rasm yo'q</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!replaceItem} onOpenChange={(open) => {
        if (!open) {
          void closeReplaceDialog();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rasmni almashtirish</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <SingleFileUpload
              value={replaceForm.file_url}
              onChange={(url) => setReplaceForm({ file_url: url })}
              onRemove={async (url) => {
                if (replaceItem && url !== replaceItem.item.file_url) {
                  await deleteMediaUrl(url);
                }
              }}
              folder="gallery"
              label="Yangi rasm"
              accept="image/*"
            />
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => void closeReplaceDialog()}>Bekor qilish</Button>
            <Button className="w-full ocean-gradient-btn text-primary-foreground sm:w-auto" onClick={handleReplaceSave} disabled={updateItemMutation.isPending}>
              {updateItemMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
