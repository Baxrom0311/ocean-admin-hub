import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Globe, Home, BarChart3, Palette, Bot, Lock, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const tabs = [
  { key: 'contact', label: 'Kontakt', icon: Phone },
  { key: 'social', label: 'Ijtimoiy', icon: Globe },
  { key: 'hero', label: 'Hero', icon: Home },
  { key: 'about', label: 'Haqimizda', icon: Info },
  { key: 'stats', label: 'Statistika', icon: BarChart3 },
  { key: 'brand', label: 'Brand', icon: Palette },
  { key: 'chatbot', label: 'Chatbot', icon: Bot },
  { key: 'secret', label: 'Maxfiy', icon: Lock, superAdmin: true },
];

// Group settings by tab
const settingsLayout: Record<string, { key: string; label: string; type?: string; rows?: number; maxLength?: number }[]> = {
  contact: [
    { key: 'phone_1', label: 'Telefon 1' },
    { key: 'phone_2', label: 'Telefon 2' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'address_uz', label: 'Manzil (UZ)' },
    { key: 'address_ru', label: 'Manzil (RU)' },
    { key: 'working_hours', label: 'Ish vaqti' },
    { key: 'map_embed', label: 'Xarita embed', type: 'textarea', rows: 3 },
  ],
  social: [
    { key: 'instagram_url', label: '📷 Instagram' },
    { key: 'telegram_url', label: '✈️ Telegram' },
    { key: 'facebook_url', label: '👤 Facebook' },
    { key: 'youtube_url', label: '▶️ YouTube' },
  ],
  hero: [
    { key: 'hero_title_uz', label: 'Sarlavha (UZ)' },
    { key: 'hero_title_ru', label: 'Sarlavha (RU)' },
    { key: 'hero_title_en', label: 'Sarlavha (EN)' },
    { key: 'hero_subtitle_uz', label: 'Kichik matn (UZ)' },
    { key: 'hero_button_text', label: 'Tugma matni' },
  ],
  about: [
    { key: 'about_title_uz', label: 'Sarlavha (UZ)' },
    { key: 'about_text_uz', label: 'Matn (UZ)', type: 'textarea', rows: 4 },
    { key: 'about_title_ru', label: 'Sarlavha (RU)' },
    { key: 'about_text_ru', label: 'Matn (RU)', type: 'textarea', rows: 4 },
  ],
  stats: [
    { key: 'stat_years', label: 'Yillar tajriba' },
    { key: 'stat_clients', label: 'Mijozlar' },
    { key: 'stat_products', label: 'Mahsulotlar' },
    { key: 'stat_cities', label: 'Shaharlar' },
  ],
  brand: [
    { key: 'meta_title', label: 'Meta sarlavha' },
    { key: 'meta_description', label: 'Meta tavsif (max 160)', type: 'textarea', rows: 2, maxLength: 160 },
  ],
  chatbot: [
    { key: 'chatbot_welcome', label: 'Salom xabari', type: 'textarea', rows: 3 },
    { key: 'ai_system_prompt', label: 'AI System Prompt', type: 'textarea', rows: 6 },
  ],
  secret: [
    { key: 'telegram_bot_token', label: 'Telegram Bot Token', type: 'password' },
    { key: 'telegram_chat_ids', label: 'Telegram Chat IDlar' },
    { key: 'smtp_host', label: 'SMTP Host' },
    { key: 'smtp_user', label: 'SMTP User' },
    { key: 'smtp_password', label: 'SMTP Password', type: 'password' },
    { key: 'anthropic_api_key', label: 'Claude API Key', type: 'password' },
    { key: 'cloudinary_api_key', label: 'Cloudinary API Key', type: 'password' },
    { key: 'instagram_access_token', label: 'Instagram Access Token', type: 'password' },
  ],
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get('/admin/settings'),
  });

  // Load settings into form
  useEffect(() => {
    if (data?.data) {
      const map: Record<string, string> = {};
      for (const s of data.data) {
        map[s.key] = s.value || '';
      }
      setFormData(map);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (items: { key: string; value: string }[]) => api.put('/admin/settings/bulk', items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast({ title: 'Sozlamalar saqlandi ✅' });
    },
    onError: (err: Error) => {
      toast({ title: 'Xato', description: err.message, variant: 'destructive' });
    },
  });

  const handleSave = () => {
    const fields = settingsLayout[activeTab] || [];
    const items = fields.map(f => ({ key: f.key, value: formData[f.key] || '' }));
    saveMutation.mutate(items);
  };

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const visibleTabs = tabs.filter(t => !t.superAdmin || isSuperAdmin);
  const currentFields = settingsLayout[activeTab] || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Sozlamalar</h1>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {visibleTabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === t.key ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6">
          {activeTab === 'secret' && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              ⚠️ Faqat super_admin ko'rishi mumkin
            </div>
          )}

          <div className="space-y-4 max-w-lg">
            {currentFields.map(field => (
              <div key={field.key}>
                <label className="mb-1.5 block text-sm font-medium text-foreground">{field.label}</label>
                {field.type === 'textarea' ? (
                  <Textarea
                    value={formData[field.key] || ''}
                    onChange={e => updateField(field.key, e.target.value)}
                    rows={field.rows || 3}
                    maxLength={field.maxLength}
                  />
                ) : (
                  <Input
                    type={field.type || 'text'}
                    value={formData[field.key] || ''}
                    onChange={e => updateField(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button className="ocean-gradient-btn text-primary-foreground hover:opacity-90"
              onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
