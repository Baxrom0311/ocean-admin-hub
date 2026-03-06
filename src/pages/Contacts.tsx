import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

type FilterTab = 'all' | 'unread' | 'read';

const Contacts = () => {
  const [tab, setTab] = useState<FilterTab>('all');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contacts', tab],
    queryFn: () => api.get('/admin/contacts', {
      is_read: tab === 'unread' ? 'false' : tab === 'read' ? 'true' : undefined,
      per_page: 50,
    }),
  });

  const unreadQuery = useQuery({
    queryKey: ['admin-contacts-unread'],
    queryFn: () => api.get('/admin/contacts/unread-count'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/contacts/${id}`, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-contacts-unread'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-contacts-unread'] });
      toast({ title: "Xabar o'chirildi" });
      setDeleteId(null);
      setSelected(null);
    },
    onError: (err: Error) => {
      toast({ title: 'Xato', description: err.message, variant: 'destructive' });
    },
  });

  const contacts: Contact[] = data?.data?.items || [];
  const unreadCount = unreadQuery.data?.data?.count || 0;

  const handleSelect = (contact: Contact) => {
    setSelected(contact);
    if (!contact.is_read) {
      markReadMutation.mutate(contact.id);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: 'Barchasi', count: data?.data?.total },
    { key: 'unread', label: 'Yangi', count: unreadCount },
    { key: 'read', label: "O'qilgan" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Xabarlar</h1>
        {unreadCount > 0 && (
          <Badge className="bg-destructive text-destructive-foreground">{unreadCount} ta yangi</Badge>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label} {t.count !== undefined && <span className="ml-1 text-xs">({t.count})</span>}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-8 px-4 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ism</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tel / Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mavzu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sana</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(m => (
                <tr key={m.id} className="border-b border-border transition-colors last:border-0 hover:bg-secondary/50 cursor-pointer"
                  onClick={() => handleSelect(m)}>
                  <td className="px-4 py-3">
                    {!m.is_read && <span className="flex h-2.5 w-2.5 rounded-full bg-primary" />}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{m.phone || m.email || '—'}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{m.subject || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={e => { e.stopPropagation(); handleSelect(m); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={e => { e.stopPropagation(); setDeleteId(m.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {contacts.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">Xabarlar topilmadi</div>
          )}
        </div>
      )}

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[420px]">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-foreground">{selected.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2 text-sm">
                  {selected.phone && <p className="text-muted-foreground">📞 {selected.phone}</p>}
                  {selected.email && <p className="text-muted-foreground">📧 {selected.email}</p>}
                  {selected.subject && <p className="text-muted-foreground">📋 {selected.subject}</p>}
                  <p className="text-muted-foreground">🕐 {formatDate(selected.created_at)}</p>
                </div>
                <div className="border-t border-border" />
                <p className="text-sm text-foreground leading-relaxed">"{selected.message}"</p>
                <div className="border-t border-border" />
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1 ocean-gradient-btn text-primary-foreground" onClick={() => {
                    markReadMutation.mutate(selected.id);
                    toast({ title: "O'qildi deb belgilandi" });
                  }}>
                    <CheckCheck className="h-3.5 w-3.5" /> O'qildi
                  </Button>
                  {selected.email && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => window.open(`mailto:${selected.email}?subject=Re: ${selected.subject}`)}>
                      📧 Javob berish
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(selected.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xabarni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>Haqiqatan ham bu xabarni o'chirmoqchimisiz?</AlertDialogDescription>
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

export default Contacts;
