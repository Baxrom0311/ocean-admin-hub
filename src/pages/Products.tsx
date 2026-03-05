import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const mockProducts = [
  { id: '1', name: 'ECO Toza 5L', category: 'Ichimlik', price: 12000, oldPrice: 15000, status: 'active', sale: true, image: '' },
  { id: '2', name: 'ECO Industrial 19L', category: 'Sanoat', price: 45000, oldPrice: null, status: 'active', sale: false, image: '' },
  { id: '3', name: 'ECO Premium 1.5L', category: 'Ichimlik', price: 5000, oldPrice: null, status: 'inactive', sale: false, image: '' },
  { id: '4', name: 'ECO Baby Water 0.5L', category: 'Bolalar', price: 8000, oldPrice: 10000, status: 'active', sale: true, image: '' },
];

const Products = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockProducts.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'active' && p.status !== 'active') return false;
    if (statusFilter === 'inactive' && p.status !== 'inactive') return false;
    if (statusFilter === 'sale' && !p.sale) return false;
    return true;
  });

  const formatPrice = (n: number) => n.toLocaleString('uz-UZ') + " so'm";

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Mahsulotlar</h1>
          <Badge variant="secondary" className="bg-secondary text-primary">{mockProducts.length} ta</Badge>
        </div>
        <Button className="gap-2 ocean-gradient-btn text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Yangi mahsulot
        </Button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Holat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="inactive">Passiv</SelectItem>
            <SelectItem value="sale">Aksiya</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Rasm</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nomi</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Kategoriya</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Narx</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Holat</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border transition-colors last:border-0 hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <div className="h-12 w-12 rounded-lg bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{p.name}</span>
                  {p.sale && <Badge className="ml-2 bg-accent/20 text-accent">🏷️ Aksiya</Badge>}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{p.category}</Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{formatPrice(p.price)}</span>
                  {p.oldPrice && (
                    <span className="ml-2 text-sm text-muted-foreground line-through">{formatPrice(p.oldPrice)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge className={
                    p.status === 'active'
                      ? 'bg-secondary text-primary'
                      : 'bg-muted text-muted-foreground'
                  }>
                    {p.status === 'active' ? '● Aktiv' : '○ Passiv'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">Hech narsa topilmadi</div>
        )}
      </div>
    </div>
  );
};

export default Products;
