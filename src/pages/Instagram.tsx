import { motion } from 'framer-motion';
import { RefreshCw, Key, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockPosts = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  type: i % 3 === 0 ? 'VIDEO' : i % 3 === 1 ? 'IMAGE' : 'CAROUSEL_ALBUM',
  timestamp: `${i + 1} kun oldin`,
  permalink: 'https://instagram.com',
}));

const InstagramPage = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Instagram</h1>
      </motion.div>

      {/* Token status */}
      <div className="rounded-xl border border-border bg-card p-6 ocean-shadow">
        <h3 className="mb-4 text-lg font-semibold text-foreground">📸 Instagram Token Holati</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Holat:</span><span className="font-medium text-primary">✅ Faol</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Muddati:</span><span className="font-medium text-foreground">45 kun qoldi</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Yangilandi:</span><span className="text-muted-foreground">04.03.2026, 08:00</span></div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-primary text-primary hover:bg-secondary">
            <RefreshCw className="h-3.5 w-3.5" /> Keshni yangilash
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Key className="h-3.5 w-3.5" /> Tokenni yangilash
          </Button>
        </div>
      </div>

      {/* Cached posts */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">Keshlanган postlar</h3>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {mockPosts.map(post => (
            <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer"
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:ocean-shadow">
              <div className="flex h-32 items-center justify-center bg-muted">
                <Badge variant="outline" className="text-xs">{post.type === 'VIDEO' ? '🎥' : post.type === 'CAROUSEL_ALBUM' ? '🖼️' : '📷'} {post.type}</Badge>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstagramPage;
