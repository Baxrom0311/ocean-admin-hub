import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Package, Trophy, Image, Mail, Plus, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const statCards = [
  { label: 'Mahsulotlar', icon: Package, count: 24, link: '/products', linkText: 'Barchasi' },
  { label: 'Sertifikatlar', icon: Trophy, count: 8, link: '/certificates', linkText: 'Barchasi' },
  { label: 'Albumlar', icon: Image, count: 6, link: '/gallery', linkText: 'Barchasi' },
  { label: 'Yangi xabarlar', icon: Mail, count: 5, link: '/contacts', linkText: "Ko'rish", highlight: true },
];

const quickActions = [
  { label: 'Mahsulot', link: '/products', icon: Package },
  { label: 'Sertifikat', link: '/certificates', icon: Trophy },
  { label: 'Album', link: '/gallery', icon: Image },
  { label: 'Kategoriya', link: '/categories', icon: FolderOpen },
];

const Dashboard = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">
          Xush kelibsiz, {user?.name || 'Admin'}! 👋
        </h1>
        <p className="text-muted-foreground">{today}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-5 ocean-shadow transition-all hover:ocean-shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <card.icon className="h-6 w-6 text-primary" />
              </div>
              {card.highlight && (
                <span className="flex h-3 w-3 rounded-full bg-destructive" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{card.count}</p>
            <Link to={card.link} className="mt-3 inline-block text-sm text-primary hover:underline">
              ↗ {card.linkText}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent messages */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-lg font-semibold text-foreground">So'nggi xabarlar</h3>
            <div className="space-y-3">
              {[
                { name: 'Alisher T.', subject: 'Narx so\'rash', date: '04.03, 14:32', unread: true },
                { name: 'Nodira K.', subject: 'Buyurtma', date: '03.03, 09:15', unread: true },
                { name: 'Jamshid M.', subject: 'Hamkorlik', date: '02.03, 16:45', unread: false },
              ].map((msg, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted">
                  {msg.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
                  {!msg.unread && <span className="h-2.5 w-2.5 shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{msg.name}</p>
                    <p className="text-xs text-muted-foreground">{msg.subject}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{msg.date}</span>
                </div>
              ))}
            </div>
            <Link to="/contacts" className="mt-3 inline-block text-sm text-primary hover:underline">
              Barcha xabarlar →
            </Link>
          </div>
        </div>

        {/* Instagram status */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              📸 Instagram Token
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holat:</span>
                <span className="font-medium text-primary">✅ Faol</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Muddati:</span>
                <span className="font-medium text-foreground">45 kun qoldi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yangilangan:</span>
                <span className="text-muted-foreground">2 soat oldin</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full border-primary text-primary hover:bg-secondary">
              Keshni yangilash
            </Button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Tezkor amallar</h3>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(action => (
            <Link key={action.label} to={action.link}>
              <Button variant="outline" size="sm" className="gap-2 border-primary text-primary hover:bg-secondary">
                <Plus className="h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
