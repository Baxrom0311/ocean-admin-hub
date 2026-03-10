import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Globe, Home, BarChart3, Palette, Bot, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
  { key: 'chatbot', label: 'AI Prompt', icon: Bot },
];

const legacyKeyFallbacks: Record<string, string[]> = {
  address_uz: ['address'],
  hero_subtitle_uz: ['hero_desc_uz'],
  stats_years: ['stat_years'],
  stats_clients: ['stat_clients'],
  stats_products: ['stat_products'],
  stats_cities: ['stat_cities'],
};

// Group settings by tab
const settingsLayout: Record<string, { key: string; label: string; type?: string; rows?: number; maxLength?: number }[]> = {
  contact: [
    { key: 'phone_1', label: 'Telefon 1' },
    { key: 'phone_2', label: 'Telefon 2' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'address_uz', label: 'Manzil (UZ)' },
    { key: 'address_ru', label: 'Manzil (RU)' },
    { key: 'address_en', label: 'Address (EN)' },
    { key: 'working_hours', label: 'Ish vaqti' },
    { key: 'map_embed', label: 'Xarita embed', type: 'textarea', rows: 3 },
  ],
  social: [
    { key: 'whatsapp_url', label: '💬 WhatsApp' },
    { key: 'instagram_url', label: '📷 Instagram' },
    { key: 'telegram_url', label: '✈️ Telegram' },
    { key: 'facebook_url', label: '👤 Facebook' },
    { key: 'youtube_url', label: '▶️ YouTube' },
  ],
  hero: [
    { key: 'hero_badge', label: 'Badge' },
    { key: 'hero_title_uz', label: 'Sarlavha (UZ)' },
    { key: 'hero_title_ru', label: 'Sarlavha (RU)' },
    { key: 'hero_title_en', label: 'Sarlavha (EN)' },
    { key: 'hero_subtitle_uz', label: 'Kichik matn (UZ)' },
    { key: 'hero_subtitle_ru', label: 'Kichik matn (RU)' },
    { key: 'hero_subtitle_en', label: 'Kichik matn (EN)' },
  ],
  about: [
    { key: 'about_page_title_uz', label: 'Page sarlavha (UZ)' },
    { key: 'about_page_title_ru', label: 'Page sarlavha (RU)' },
    { key: 'about_page_title_en', label: 'Page sarlavha (EN)' },
    { key: 'about_section_badge_uz', label: 'Badge (UZ)' },
    { key: 'about_section_badge_ru', label: 'Badge (RU)' },
    { key: 'about_section_badge_en', label: 'Badge (EN)' },
    { key: 'about_section_title_uz', label: 'Asosiy sarlavha (UZ)' },
    { key: 'about_section_title_ru', label: 'Asosiy sarlavha (RU)' },
    { key: 'about_section_title_en', label: 'Asosiy sarlavha (EN)' },
    { key: 'about_text_uz', label: 'Matn (UZ)', type: 'textarea', rows: 4 },
    { key: 'about_text_ru', label: 'Matn (RU)', type: 'textarea', rows: 4 },
    { key: 'about_text_en', label: 'Matn (EN)', type: 'textarea', rows: 4 },
    { key: 'about_values_badge_uz', label: 'Qadriyatlar badge (UZ)' },
    { key: 'about_values_badge_ru', label: 'Qadriyatlar badge (RU)' },
    { key: 'about_values_badge_en', label: 'Qadriyatlar badge (EN)' },
    { key: 'about_values_title_uz', label: 'Qadriyatlar sarlavha (UZ)' },
    { key: 'about_values_title_ru', label: 'Qadriyatlar sarlavha (RU)' },
    { key: 'about_values_title_en', label: 'Qadriyatlar sarlavha (EN)' },
  ],
  stats: [
    { key: 'stats_years', label: 'Yillar tajriba' },
    { key: 'stats_clients', label: 'Mijozlar' },
    { key: 'stats_products', label: 'Mahsulotlar' },
    { key: 'stats_cities', label: 'Shaharlar' },
  ],
  brand: [
    { key: 'logo_url', label: 'Logo URL' },
  ],
  chatbot: [
    { key: 'ai_system_prompt', label: 'AI System Prompt', type: 'textarea', rows: 6 },
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
    enabled: isSuperAdmin,
  });

  // Load settings into form
  useEffect(() => {
    if (data?.data) {
      const map: Record<string, string> = {};
      for (const s of data.data) {
        map[s.key] = s.value || '';
      }

      for (const [targetKey, legacyKeys] of Object.entries(legacyKeyFallbacks)) {
        if (map[targetKey]) continue;
        const legacyValue = legacyKeys.map(key => map[key]).find(Boolean);
        if (legacyValue) {
          map[targetKey] = legacyValue;
        }
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

  const currentFields = settingsLayout[activeTab] || [];

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground">Sozlamalar</h1>
        </motion.div>

        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Bu bo'lim faqat `super_admin` uchun ochiq. Integratsiya secretlari server `.env` fayli orqali boshqariladi.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Sozlamalar</h1>
      </motion.div>

      <div className="rounded-xl border border-border bg-card/70 p-4 text-sm text-muted-foreground sm:p-5">
        `SMTP`, `Telegram` va `DeepSeek` credentiallari admin paneldan emas, server `.env` konfiguratsiyasi orqali boshqariladi.
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-1">
        {tabs.map(t => (
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
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="max-w-lg space-y-4">
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
