import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'editor';
  is_active: boolean;
  created_at?: string;
}

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'editor' as 'super_admin' | 'editor',
  is_active: true,
};

const UsersPage = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof emptyForm) => api.post('/admin/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Foydalanuvchi yaratildi ✅' });
      resetDialog();
    },
    onError: (err: Error) => {
      toast({ title: 'Xato', description: err.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<typeof emptyForm, 'password'> }) => api.put(`/admin/users/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Foydalanuvchi yangilandi ✅' });
      resetDialog();
    },
    onError: (err: Error) => {
      toast({ title: 'Xato', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: "Foydalanuvchi o'chirildi" });
      setDeleteId(null);
    },
    onError: (err: Error) => {
      toast({ title: 'Xato', description: err.message, variant: 'destructive' });
    },
  });

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditItem(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditItem(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast({ title: 'Ism majburiy', variant: 'destructive' });
      return;
    }
    if (!form.email.trim()) {
      toast({ title: 'Email majburiy', variant: 'destructive' });
      return;
    }

    if (editItem) {
      updateMutation.mutate({
        id: editItem.id,
        payload: {
          name: form.name,
          email: form.email,
          role: form.role,
          is_active: form.is_active,
        },
      });
      return;
    }

    if (!form.password.trim()) {
      toast({ title: 'Parol majburiy', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      is_active: form.is_active,
    });
  };

  const users: User[] = data?.data || [];
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
        <h1 className="text-2xl font-bold text-foreground">Foydalanuvchilar</h1>
        <Button className="w-full gap-2 ocean-gradient-btn text-primary-foreground hover:opacity-90 sm:w-auto" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Yangi foydalanuvchi
        </Button>
      </motion.div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Avatar</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ism</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Holat</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {u.name.charAt(0)}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge className={u.role === 'super_admin' ? 'bg-accent/20 text-accent' : 'bg-secondary text-primary'}>
                    {u.role === 'super_admin' ? '👑 ' : ''}{u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={u.is_active ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'}>
                    {u.is_active ? '● Aktiv' : '○ Passiv'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(u)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(u.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">Foydalanuvchilar topilmadi</div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ism *</label>
              <Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email *</label>
              <Input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            {!editItem && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">Parol *</label>
                <Input type="password" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Rol</label>
              <Select value={form.role} onValueChange={(value: 'super_admin' | 'editor') => setForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">editor</SelectItem>
                  <SelectItem value="super_admin">super_admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Aktiv</label>
              <Switch checked={form.is_active} onCheckedChange={value => setForm(prev => ({ ...prev, is_active: value }))} />
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Foydalanuvchini o'chirish</AlertDialogTitle>
            <AlertDialogDescription>Haqiqatan ham bu foydalanuvchini o'chirmoqchimisiz?</AlertDialogDescription>
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

export default UsersPage;
