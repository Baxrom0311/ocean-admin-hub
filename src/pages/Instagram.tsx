import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { RefreshCw, Key, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface InstagramPost {
  id: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp?: string;
}

const InstagramPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ['admin-instagram-token'],
    queryFn: () => api.get('/admin/instagram/token-status'),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['instagram-posts'],
    queryFn: () => api.get('/instagram/posts'),
  });

  const refreshMutation = useMutation({
    mutationFn: () => api.post('/admin/instagram/refresh'),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['instagram-posts'] });
      toast({ title: res?.message || 'Kesh yangilandi' });
    },
    onError: (err: Error) => {
      toast({ title: 'Xato', description: err.message, variant: 'destructive' });
    },
  });

  const refreshTokenMutation = useMutation({
    mutationFn: () => api.post('/admin/instagram/refresh-token'),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-instagram-token'] });
      toast({ title: res?.success ? 'Token yangilandi' : 'Token yangilanmadi', variant: res?.success ? 'default' : 'destructive' });
    },
    onError: (err: Error) => {
      toast({ title: 'Xato', description: err.message, variant: 'destructive' });
    },
  });

  const tokenStatus = tokenData?.data;
  const posts: InstagramPost[] = postsData?.data || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Instagram</h1>
      </motion.div>

      {/* Token status */}
      <div className="rounded-xl border border-border bg-card p-6 ocean-shadow">
        <h3 className="mb-4 text-lg font-semibold text-foreground">📸 Instagram Token Holati</h3>
        {tokenLoading ? (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : tokenStatus ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Holat:</span>
              <span className={`font-medium ${tokenStatus.is_valid ? 'text-primary' : 'text-destructive'}`}>
                {tokenStatus.is_valid ? '✅ Faol' : '❌ Muddati o\'tgan'}
              </span>
            </div>
            {tokenStatus.days_remaining !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Muddati:</span>
                <span className="font-medium text-foreground">{tokenStatus.days_remaining} kun qoldi</span>
              </div>
            )}
            {tokenStatus.last_refreshed && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yangilandi:</span>
                <span className="text-muted-foreground">{tokenStatus.last_refreshed}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Token sozlanmagan. .env faylda INSTAGRAM_ACCESS_TOKEN ni qo'shing.</p>
        )}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-primary text-primary hover:bg-secondary"
            onClick={() => refreshMutation.mutate()} disabled={refreshMutation.isPending}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} /> Keshni yangilash
          </Button>
          <Button variant="outline" size="sm" className="gap-2"
            onClick={() => refreshTokenMutation.mutate()} disabled={refreshTokenMutation.isPending}>
            <Key className="h-3.5 w-3.5" /> Tokenni yangilash
          </Button>
        </div>
      </div>

      {/* Cached posts */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">Keshlangan postlar</h3>
        {postsLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {posts.map(post => (
              <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer"
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:ocean-shadow">
                <div className="flex h-32 items-center justify-center bg-muted overflow-hidden">
                  {(post.media_url || post.thumbnail_url) ? (
                    <img src={post.thumbnail_url || post.media_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {post.media_type === 'VIDEO' ? '🎥' : post.media_type === 'CAROUSEL_ALBUM' ? '🖼️' : '📷'} {post.media_type}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {post.caption?.slice(0, 30) || post.media_type}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            Postlar topilmadi. "Keshni yangilash" tugmasini bosing.
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramPage;
