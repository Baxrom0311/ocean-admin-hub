import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';

interface AuditItem {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes?: any;
  ip_address?: string;
  created_at: string;
}

const actionStyles: Record<string, string> = {
  create: 'bg-secondary text-primary',
  update: 'bg-secondary text-primary',
  delete: 'bg-destructive/10 text-destructive',
};

const AuditLog = () => {
  const [entityFilter, setEntityFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', entityFilter],
    queryFn: () => api.get('/admin/audit-logs', {
      entity_type: entityFilter !== 'all' ? entityFilter : undefined,
      per_page: 50,
    }),
  });

  const logs: AuditItem[] = data?.data?.items || [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
      </motion.div>

      <div className="flex gap-3">
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Entity tur" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="certificate">Certificate</SelectItem>
            <SelectItem value="album">Album</SelectItem>
            <SelectItem value="setting">Setting</SelectItem>
            <SelectItem value="user">User</SelectItem>
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sana/Vaqt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ob'ekt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{log.user_name}</td>
                  <td className="px-4 py-3">
                    <Badge className={actionStyles[log.action] || 'bg-muted text-muted-foreground'}>{log.action.toUpperCase()}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{log.entity_type}</td>
                  <td className="px-4 py-3"><code className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{log.entity_id.slice(0, 8)}...</code></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{log.ip_address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">Loglar topilmadi</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLog;
