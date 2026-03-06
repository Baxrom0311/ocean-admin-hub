import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  role: string;
  is_active: boolean;
  created_at?: string;
}

const UsersPage = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users'),
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

  const users: User[] = data?.data || [];

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
        <h1 className="text-2xl font-bold text-foreground">Foydalanuvchilar</h1>
        <Button className="gap-2 ocean-gradient-btn text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Yangi foydalanuvchi
        </Button>
      </motion.div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full">
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
                  <Badge className={u.role === 'super_admin'
                    ? 'bg-accent/20 text-accent'
                    : 'bg-secondary text-primary'
                  }>
                    {u.role === 'super_admin' ? '👑 ' : ''}{u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={u.is_active ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'}>
                    {u.is_active ? '● Aktiv' : '○ Passiv'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(u.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">Foydalanuvchilar topilmadi</div>
        )}
      </div>

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
