import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockCategories = [
  { id: '1', name_uz: 'Ichimlik suvi', name_ru: 'Питьевая вода', slug: 'ichimlik-suvi', count: 12, active: true },
  { id: '2', name_uz: 'Sanoat suvi', name_ru: 'Промышленная вода', slug: 'sanoat-suvi', count: 6, active: true },
  { id: '3', name_uz: 'Bolalar uchun', name_ru: 'Для детей', slug: 'bolalar-uchun', count: 4, active: false },
];

const Categories = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Kategoriyalar</h1>
        <Button className="gap-2 ocean-gradient-btn text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Yangi kategoriya
        </Button>
      </motion.div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nomi (UZ)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nomi (RU)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mahsulotlar</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Holat</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {mockCategories.map(c => (
              <tr key={c.id} className="border-b border-border transition-colors last:border-0 hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium text-foreground">{c.name_uz}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.name_ru}</td>
                <td className="px-4 py-3"><code className="rounded bg-muted px-2 py-0.5 text-xs">{c.slug}</code></td>
                <td className="px-4 py-3"><Badge variant="secondary">{c.count} ta</Badge></td>
                <td className="px-4 py-3">
                  <Badge className={c.active ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'}>
                    {c.active ? '● Aktiv' : '○ Passiv'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
