import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Grid, List, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockCerts = [
  { id: '1', title: 'ISO 9001:2015', issued_by: 'Bureau Veritas', date: '2024-01-15', type: 'pdf', downloadable: true },
  { id: '2', title: 'ISO 22000', issued_by: 'SGS', date: '2023-06-20', type: 'image', downloadable: true },
  { id: '3', title: "GOST sertifikati", issued_by: "O'zstandart", date: '2024-03-01', type: 'pdf', downloadable: false },
];

const Certificates = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Sertifikatlar</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setView('grid')} className={view === 'grid' ? 'bg-secondary' : ''}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setView('list')} className={view === 'list' ? 'bg-secondary' : ''}>
            <List className="h-4 w-4" />
          </Button>
          <Button className="gap-2 ocean-gradient-btn text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Yangi sertifikat
          </Button>
        </div>
      </motion.div>

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockCerts.map(cert => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-xl border border-border bg-card ocean-shadow">
              <div className="flex h-40 items-center justify-center bg-muted">
                <Badge variant="outline">{cert.type.toUpperCase()}</Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{cert.title}</h3>
                <p className="text-sm text-muted-foreground">{cert.issued_by}</p>
                <p className="text-xs text-muted-foreground">{cert.date}</p>
                {cert.downloadable && (
                  <Badge className="mt-2 bg-secondary text-primary"><Download className="mr-1 h-3 w-3" /> Yuklab olinadigan</Badge>
                )}
              </div>
              <div className="flex gap-1 border-t border-border p-3">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary"><Edit2 className="mr-1 h-3 w-3" /> Tahrir</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive"><Trash2 className="mr-1 h-3 w-3" /> O'ch</Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sarlavha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Beruvchi</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sana</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tur</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amallar</th>
            </tr></thead>
            <tbody>
              {mockCerts.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium text-foreground">{c.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.issued_by}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{c.type}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Certificates;
