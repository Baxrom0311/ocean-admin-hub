import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockAlbums = [
  { id: '1', name: 'Zavod ko\'rgazmasi', category: 'production', count: 12 },
  { id: '2', name: 'Jamoamiz', category: 'team', count: 8 },
  { id: '3', name: 'Ofis', category: 'office', count: 5 },
];

const Gallery = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Galereya</h1>
        <Button className="gap-2 ocean-gradient-btn text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Yangi album
        </Button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockAlbums.map(album => (
          <motion.div key={album.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card ocean-shadow transition-all hover:ocean-shadow-lg">
            <div className="flex h-44 items-center justify-center bg-muted">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{album.name}</h3>
                <Badge variant="outline">{album.category}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{album.count} ta rasm</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add new */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex h-full min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <Plus className="mb-2 h-8 w-8" />
          <span className="text-sm font-medium">Yangi album</span>
        </motion.div>
      </div>
    </div>
  );
};

export default Gallery;
