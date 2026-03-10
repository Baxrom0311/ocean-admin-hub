import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ExternalLink, Plus, Save, Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface InstagramVideo {
  id: string;
  url: string;
  permalink: string;
  embed_url: string;
  media_type: string;
  kind: string;
}

const InstagramPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [links, setLinks] = useState<string[]>(['']);

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['admin-instagram-status'],
    queryFn: () => api.get('/admin/instagram/token-status'),
  });

  const { data: linksData, isLoading: linksLoading } = useQuery({
    queryKey: ['admin-instagram-links'],
    queryFn: () => api.get('/admin/instagram/links'),
  });

  useEffect(() => {
    const savedLinks = (linksData?.data || []).map((item: InstagramVideo) => item.url);
    setLinks(savedLinks.length > 0 ? savedLinks : ['']);
  }, [linksData]);

  const saveMutation = useMutation({
    mutationFn: (items: string[]) => api.put('/admin/instagram/links', {
      items: items
        .map(url => url.trim())
        .filter(Boolean)
        .map(url => ({ url })),
    }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-instagram-links'] });
      queryClient.invalidateQueries({ queryKey: ['admin-instagram-status'] });
      queryClient.invalidateQueries({ queryKey: ['instagram-videos'] });
      toast({ title: res?.message || 'Instagram linklari saqlandi' });
    },
    onError: (err: Error) => {
      toast({ title: 'Xato', description: err.message, variant: 'destructive' });
    },
  });

  const status = statusData?.data;
  const videos: InstagramVideo[] = linksData?.data || [];
  const isLoading = statusLoading || linksLoading;

  const updateLink = (index: number, value: string) => {
    setLinks(prev => prev.map((item, current) => current === index ? value : item));
  };

  const addLink = () => setLinks(prev => [...prev, '']);
  const removeLink = (index: number) => {
    setLinks(prev => {
      const next = prev.filter((_, current) => current !== index);
      return next.length > 0 ? next : [''];
    });
  };

  const handleSave = () => saveMutation.mutate(links);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Instagram</h1>
      </motion.div>

      <div className="rounded-xl border border-border bg-card p-4 ocean-shadow sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">📸 Instagram video linklari</h3>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : status ? (
          <div className="space-y-3 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">Holat:</span>
              <span className={`font-medium ${status.is_configured ? 'text-primary' : 'text-destructive'}`}>
                {status.is_configured ? '✅ Linklar saqlangan' : '❌ Linklar kiritilmagan'}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">Video soni:</span>
              <span className="font-medium text-foreground">{status.link_count} ta</span>
            </div>
            <p className="rounded-lg bg-secondary/50 p-3 text-muted-foreground">{status.message}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Instagram videolarini qo'lda link orqali boshqaring.</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Linklarni boshqarish</h3>
            <p className="text-sm text-muted-foreground">Instagram `reel`, `post` yoki `tv` linklarini kiriting.</p>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto" onClick={addLink}>
            <Plus className="h-4 w-4" /> Link qo'shish
          </Button>
        </div>

        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={index} className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={link}
                onChange={e => updateLink(index, e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeLink(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button className="gap-2 ocean-gradient-btn text-primary-foreground" onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4" /> {saveMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">Saytdagi preview</h3>
        {videos.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {videos.map(video => (
              <div key={video.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-[9/16] bg-muted">
                  <iframe
                    src={video.embed_url}
                    title={`Instagram ${video.id}`}
                    className="h-full w-full border-0"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="h-4 w-4" />
                    {video.kind === 'reel' ? 'Reel' : 'Post'}
                  </div>
                  <a href={video.permalink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Ochish <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            Hozircha Instagram video linklari qo'shilmagan.
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramPage;
