import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Globe, Home, BarChart3, Palette, Bot, Lock, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

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

const Settings = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const { isSuperAdmin } = useAuth();

  const visibleTabs = tabs.filter(t => !t.superAdmin || isSuperAdmin);

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

      {/* Tab content */}
      <div className="rounded-xl border border-border bg-card p-6">
        {activeTab === 'contact' && (
          <div className="space-y-4 max-w-lg">
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Telefon 1</label><Input placeholder="+998 __ ___ __ __" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Telefon 2</label><Input placeholder="+998 __ ___ __ __" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Email</label><Input type="email" placeholder="info@ecocompany.uz" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Manzil (UZ)</label><Input placeholder="Toshkent shahri..." /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Manzil (RU)</label><Input placeholder="г. Ташкент..." /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Ish vaqti</label><Input placeholder="Dush-Juma: 09:00 - 18:00" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Xarita embed</label><Textarea placeholder="<iframe..." rows={3} /></div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4 max-w-lg">
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">📷 Instagram</label><Input placeholder="instagram.com/ecocompany" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">✈️ Telegram</label><Input placeholder="t.me/ecocompany" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">👤 Facebook</label><Input placeholder="facebook.com/ecocompany" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">▶️ YouTube</label><Input placeholder="youtube.com/@ecocompany" /></div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div className="space-y-4 max-w-lg">
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Sarlavha (UZ)</label><Input /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Sarlavha (RU)</label><Input /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Sarlavha (EN)</label><Input /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Kichik matn (UZ)</label><Input /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Tugma matni</label><Input /></div>
            <div className="rounded-lg border border-border bg-muted p-8 text-center text-muted-foreground">
              Fon rasmi preview — [O'zgartirish]
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-4 max-w-lg">
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Sarlavha (UZ)</label><Input /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Matn (UZ)</label><Textarea rows={4} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Sarlavha (RU)</label><Input /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Matn (RU)</label><Textarea rows={4} /></div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4 max-w-lg">
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Yillar tajriba</label><Input placeholder="10+" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Mijozlar</label><Input placeholder="5000+" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Mahsulotlar</label><Input placeholder="50+" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Shaharlar</label><Input placeholder="15" /></div>
            <div className="mt-4 flex gap-4 rounded-lg bg-muted p-4">
              {['10+ Yil', '5000+ Mijoz', '50+ Mahsulot', '15 Shahar'].map(s => (
                <div key={s} className="flex-1 text-center text-sm font-semibold text-foreground">{s}</div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'brand' && (
          <div className="space-y-4 max-w-lg">
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">Logo yuklash</div>
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">Favicon yuklash (32x32)</div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Meta sarlavha</label><Input /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Meta tavsif (max 160)</label><Textarea rows={2} maxLength={160} /></div>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Chatbot yoqilgan</label>
              <Switch />
            </div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Salom xabari</label><Textarea placeholder="Salom! ECO COMPANY yordamchisiman 💧..." rows={3} /></div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Tez-tez so'raladigan savollar</label>
              <div className="space-y-2">
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Narxlar qancha?</p>
                      <p className="text-xs text-muted-foreground">5L — 12,000 so'm, 19L — 45,000 so'm</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive">✕</Button>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-2 text-primary">+ Savol qo'shish</Button>
            </div>
          </div>
        )}

        {activeTab === 'secret' && (
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              ⚠️ Faqat super_admin ko'rishi mumkin
            </div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Telegram Bot Token</label><Input type="password" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Telegram Chat IDlar</label><Input placeholder="123,456,789" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">SMTP Host</label><Input /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">SMTP User</label><Input /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">SMTP Password</label><Input type="password" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Claude API Key</label><Input type="password" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Cloudinary API Key</label><Input type="password" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Instagram Access Token</label><Input type="password" /></div>
          </div>
        )}

        <div className="mt-6">
          <Button className="ocean-gradient-btn text-primary-foreground hover:opacity-90">Saqlash</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
