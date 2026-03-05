import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockLogs = [
  { id: '1', date: '04.03 14:32', admin: 'Baxrom', action: 'CREATE', entity: 'product', entityId: 'abc-123' },
  { id: '2', date: '04.03 12:00', admin: 'Sardor', action: 'UPDATE', entity: 'setting', entityId: 'logo_url' },
  { id: '3', date: '03.03 18:45', admin: 'Baxrom', action: 'DELETE', entity: 'certificate', entityId: 'def-456' },
  { id: '4', date: '03.03 10:20', admin: 'Baxrom', action: 'CREATE', entity: 'album', entityId: 'ghi-789' },
];

const actionStyles: Record<string, string> = {
  CREATE: 'bg-secondary text-primary',
  UPDATE: 'bg-secondary text-primary',
  DELETE: 'bg-destructive/10 text-destructive',
};

const AuditLog = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
      </motion.div>

      <div className="flex gap-3">
        <Select>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Entity tur" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="setting">Setting</SelectItem>
            <SelectItem value="certificate">Certificate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sana/Vaqt</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Admin</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ob'ekt</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map(log => (
              <tr key={log.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="px-4 py-3 text-sm text-muted-foreground">{log.date}</td>
                <td className="px-4 py-3 font-medium text-foreground">{log.admin}</td>
                <td className="px-4 py-3">
                  <Badge className={actionStyles[log.action] || ''}>{log.action}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{log.entity}</td>
                <td className="px-4 py-3"><code className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{log.entityId}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
