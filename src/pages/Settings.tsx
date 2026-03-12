import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Globe, Home, BarChart3, Palette, Bot, Info, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import ImageUpload, { SingleFileUpload } from '@/components/ImageUpload';
import { deleteMediaUrls } from '@/lib/media';

const LEGACY_PARTNER_LOGOS = [
  '/media/partners/NGMK.jpg',
  '/media/partners/MININNOVATION.jpg',
  '/media/partners/UZAVTO.jpg',
  '/media/partners/ONA.jpg',
  '/media/partners/ICHF.jpg',
  '/media/partners/NBU.jpg',
  '/media/partners/URSU.jpg',
];

const isLegacyPartnerLogoList = (value: string[]) =>
  value.length === LEGACY_PARTNER_LOGOS.length
  && value.every((item, index) => item === LEGACY_PARTNER_LOGOS[index]);

const tabs = [
  { key: 'contact', label: 'Kontakt', icon: Phone },
  { key: 'social', label: 'Ijtimoiy', icon: Globe },
  { key: 'hero', label: 'Hero', icon: Home },
  { key: 'about', label: 'Haqimizda', icon: Info },
  { key: 'stats', label: 'Statistika', icon: BarChart3 },
  { key: 'brand', label: 'Brand', icon: Palette },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'partners', label: 'Hamkorlar', icon: Users },
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
    { key: 'hero_image_url', label: 'Hero rasmi', type: 'image' },
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
    { key: 'logo_url', label: 'Logo', type: 'image' },
  ],
  seo: [
    { key: 'seo_keywords_uz', label: "Global kalit so'zlar (UZ, vergul bilan)", type: 'textarea', rows: 3 },
    { key: 'seo_keywords_ru', label: "Global kalit so'zlar (RU, vergul bilan)", type: 'textarea', rows: 3 },
    { key: 'seo_keywords_en', label: 'Global keywords (EN, comma separated)', type: 'textarea', rows: 3 },
    { key: 'seo_home_keywords_uz', label: "Bosh sahifa kalit so'zlar (UZ)", type: 'textarea', rows: 2 },
    { key: 'seo_home_keywords_ru', label: "Bosh sahifa kalit so'zlar (RU)", type: 'textarea', rows: 2 },
    { key: 'seo_home_keywords_en', label: 'Homepage keywords (EN)', type: 'textarea', rows: 2 },
    { key: 'seo_products_keywords_uz', label: "Mahsulotlar kalit so'zlar (UZ)", type: 'textarea', rows: 2 },
    { key: 'seo_products_keywords_ru', label: "Mahsulotlar kalit so'zlar (RU)", type: 'textarea', rows: 2 },
    { key: 'seo_products_keywords_en', label: 'Products keywords (EN)', type: 'textarea', rows: 2 },
    { key: 'seo_about_keywords_uz', label: "Haqimizda kalit so'zlar (UZ)", type: 'textarea', rows: 2 },
    { key: 'seo_about_keywords_ru', label: "Haqimizda kalit so'zlar (RU)", type: 'textarea', rows: 2 },
    { key: 'seo_about_keywords_en', label: 'About keywords (EN)', type: 'textarea', rows: 2 },
    { key: 'seo_gallery_keywords_uz', label: "Galereya kalit so'zlar (UZ)", type: 'textarea', rows: 2 },
    { key: 'seo_gallery_keywords_ru', label: "Galereya kalit so'zlar (RU)", type: 'textarea', rows: 2 },
    { key: 'seo_gallery_keywords_en', label: 'Gallery keywords (EN)', type: 'textarea', rows: 2 },
    { key: 'seo_certificates_keywords_uz', label: "Sertifikatlar kalit so'zlar (UZ)", type: 'textarea', rows: 2 },
    { key: 'seo_certificates_keywords_ru', label: "Sertifikatlar kalit so'zlar (RU)", type: 'textarea', rows: 2 },
    { key: 'seo_certificates_keywords_en', label: 'Certificates keywords (EN)', type: 'textarea', rows: 2 },
    { key: 'seo_contact_keywords_uz', label: "Aloqa kalit so'zlar (UZ)", type: 'textarea', rows: 2 },
    { key: 'seo_contact_keywords_ru', label: "Aloqa kalit so'zlar (RU)", type: 'textarea', rows: 2 },
    { key: 'seo_contact_keywords_en', label: 'Contact keywords (EN)', type: 'textarea', rows: 2 },
  ],
  partners: [
    { key: 'partner_logos', label: 'Hamkor logolari', type: 'images' },
  ],
  chatbot: [
    { key: 'ai_system_prompt', label: 'AI System Prompt', type: 'textarea', rows: 6 },
  ],
};

const IMAGE_LIST_KEYS = new Set(
  Object.values(settingsLayout)
    .flat()
    .filter(field => field.type === 'images')
    .map(field => field.key),
);

const parseImageListValue = (value: unknown, fallback: string[] = []) => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
  } catch {
    return fallback;
  }
  return fallback;
};

const toMediaList = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value];
  }
  return [];
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [initialFormData, setInitialFormData] = useState<Record<string, string | string[]>>({});
  const pendingUploadUrlsRef = useRef<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get('/admin/settings'),
    enabled: isSuperAdmin,
  });

  // Load settings into form
  useEffect(() => {
    if (data?.data) {
      const map: Record<string, string | string[]> = {};
      for (const s of data.data) {
        map[s.key] = IMAGE_LIST_KEYS.has(s.key)
          ? parseImageListValue(s.value)
          : (s.value || '');
      }

      for (const [targetKey, legacyKeys] of Object.entries(legacyKeyFallbacks)) {
        if (map[targetKey]) continue;
        const legacyValue = legacyKeys.map(key => map[key]).find(Boolean);
        if (legacyValue) {
          map[targetKey] = legacyValue;
        }
      }

      if (Array.isArray(map.partner_logos) && isLegacyPartnerLogoList(map.partner_logos)) {
        map.partner_logos = [];
      }

      setFormData(map);
      setInitialFormData(map);
      pendingUploadUrlsRef.current.clear();
    }
  }, [data]);

  useEffect(() => () => {
    const pendingUrls = Array.from(pendingUploadUrlsRef.current);
    pendingUploadUrlsRef.current.clear();
    if (pendingUrls.length > 0) {
      void deleteMediaUrls(pendingUrls);
    }
  }, []);

  const saveMutation = useMutation({
    mutationFn: (items: { key: string; value: string }[]) => api.put('/admin/settings/bulk', items),
  });

  const handleMediaFieldChange = (key: string, nextValue: string | string[]) => {
    const previousUrls = toMediaList(formData[key]);
    const nextUrls = toMediaList(nextValue);
    const initialUrls = new Set(toMediaList(initialFormData[key]));
    const nextUrlSet = new Set(nextUrls);

    const removedPendingUrls = previousUrls.filter(
      (url) => !nextUrlSet.has(url) && pendingUploadUrlsRef.current.has(url),
    );
    if (removedPendingUrls.length > 0) {
      removedPendingUrls.forEach((url) => pendingUploadUrlsRef.current.delete(url));
      void deleteMediaUrls(removedPendingUrls);
    }

    nextUrls.forEach((url) => {
      if (!initialUrls.has(url)) {
        pendingUploadUrlsRef.current.add(url);
      }
    });

    setFormData(prev => ({ ...prev, [key]: nextValue }));
  };

  const handleSave = async () => {
    const fields = settingsLayout[activeTab] || [];
    const items = fields.map((f) => ({
      key: f.key,
      value: f.type === 'images'
        ? JSON.stringify(Array.isArray(formData[f.key]) ? formData[f.key] : [])
        : (typeof formData[f.key] === 'string' ? formData[f.key] : ''),
    }));
    const removedPersistedUrls = fields.flatMap((field) => {
      if (field.type !== 'image' && field.type !== 'images') return [];

      const initialUrls = toMediaList(initialFormData[field.key]);
      const currentUrls = new Set(toMediaList(formData[field.key]));
      return initialUrls.filter((url) => !currentUrls.has(url));
    });

    try {
      await saveMutation.mutateAsync(items);

      if (removedPersistedUrls.length > 0) {
        await deleteMediaUrls(removedPersistedUrls);
      }

      const persistedCurrentUrls = fields.flatMap((field) =>
        field.type === 'image' || field.type === 'images'
          ? toMediaList(formData[field.key])
          : [],
      );
      persistedCurrentUrls.forEach((url) => pendingUploadUrlsRef.current.delete(url));

      setInitialFormData((prev) => {
        const next = { ...prev };
        fields.forEach((field) => {
          const currentValue = formData[field.key];
          next[field.key] = Array.isArray(currentValue)
            ? [...currentValue]
            : (typeof currentValue === 'string' ? currentValue : '');
        });
        return next;
      });

      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast({ title: 'Sozlamalar saqlandi ✅' });
    } catch (err) {
      toast({
        title: 'Xato',
        description: err instanceof Error ? err.message : "Sozlamalarni saqlab bo'lmadi",
        variant: 'destructive',
      });
    }
  };

  const updateField = (key: string, value: string | string[]) => {
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
          {activeTab === 'seo' && (
            <div className="mb-5 rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              Kalit so'zlarni vergul bilan yozing. Yangi mahsulot, kategoriya va rasmlar uchun sitemap, structured data va image SEO signallari baribir avtomatik yangilanadi; bu maydonlar esa qo'shimcha target querylarni kuchaytiradi.
            </div>
          )}
          <div className={activeTab === 'seo' ? 'grid max-w-4xl gap-4 md:grid-cols-2' : 'max-w-lg space-y-4'}>
            {currentFields.map(field => (
              <div key={field.key} className={activeTab === 'seo' && field.key.startsWith('seo_keywords') ? 'md:col-span-2' : ''}>
                {field.type !== 'image' && (
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{field.label}</label>
                )}
                {field.type === 'textarea' ? (
                  <Textarea
                    value={typeof formData[field.key] === 'string' ? formData[field.key] : ''}
                    onChange={e => updateField(field.key, e.target.value)}
                    rows={field.rows || 3}
                    maxLength={field.maxLength}
                  />
                ) : field.type === 'images' ? (
                  <ImageUpload
                    value={Array.isArray(formData[field.key]) ? formData[field.key] : []}
                    onChange={(urls) => handleMediaFieldChange(field.key, urls)}
                    folder="partners"
                    label={field.label}
                    accept="image/*"
                    max={24}
                  />
                ) : field.type === 'image' ? (
                  <SingleFileUpload
                    value={typeof formData[field.key] === 'string' ? formData[field.key] : ''}
                    onChange={(url) => handleMediaFieldChange(field.key, url)}
                    folder="settings"
                    label={field.label}
                    accept="image/*"
                  />
                ) : (
                  <Input
                    type={field.type || 'text'}
                    value={typeof formData[field.key] === 'string' ? formData[field.key] : ''}
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
