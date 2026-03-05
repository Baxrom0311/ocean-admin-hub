import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockUsers = [
  { id: '1', name: 'Baxrom Admin', email: 'baxrom@ecocompany.uz', role: 'super_admin', active: true, created: '2024-01-01' },
  { id: '2', name: 'Sardor Editor', email: 'sardor@ecocompany.uz', role: 'editor', active: true, created: '2024-06-15' },
  { id: '3', name: 'Test User', email: 'test@ecocompany.uz', role: 'editor', active: false, created: '2025-01-10' },
];

const UsersPage = () => {
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
            {mockUsers.map(u => (
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
                  <Badge className={u.active ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'}>
                    {u.active ? '● Aktiv' : '○ Passiv'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
