import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Package, Trophy, Image, Mail, Plus, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const quickActions = [
  { label: 'Mahsulot', link: '/products', icon: Package },
  { label: 'Sertifikat', link: '/certificates', icon: Trophy },
  { label: 'Album', link: '/gallery', icon: Image },
  { label: 'Kategoriya', link: '/categories', icon: FolderOpen },
];

const Dashboard = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });

  // Fetch real counts
  const { data: productsData } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: () => api.get('/admin/products', { per_page: 1 }),
  });

  const { data: certsData } = useQuery({
    queryKey: ['admin-certs-count'],
    queryFn: () => api.get('/admin/certificates', { per_page: 1 }),
  });

  const { data: albumsData } = useQuery({
    queryKey: ['admin-albums-count'],
    queryFn: () => api.get('/admin/gallery/albums'),
  });

  const { data: unreadData } = useQuery({
    queryKey: ['admin-contacts-unread'],
    queryFn: () => api.get('/admin/contacts/unread-count'),
  });

  const { data: contactsData } = useQuery({
    queryKey: ['admin-contacts-recent'],
    queryFn: () => api.get('/admin/contacts', { per_page: 5 }),
  });

  const { data: tokenData } = useQuery({
    queryKey: ['admin-instagram-status'],
    queryFn: () => api.get('/admin/instagram/token-status'),
  });

  const productCount = productsData?.data?.total ?? productsData?.data?.length ?? 0;
  const certCount = certsData?.data?.total ?? certsData?.data?.length ?? 0;
  const albumCount = albumsData?.data?.length ?? 0;
  const unreadCount = unreadData?.data?.count ?? 0;
  const recentContacts = contactsData?.data?.items || [];
  const instagramStatus = tokenData?.data;

  const statCards = [
    { label: 'Mahsulotlar', icon: Package, count: productCount, link: '/products', linkText: 'Barchasi' },
    { label: 'Sertifikatlar', icon: Trophy, count: certCount, link: '/certificates', linkText: 'Barchasi' },
    { label: 'Albumlar', icon: Image, count: albumCount, link: '/gallery', linkText: 'Barchasi' },
    { label: 'Yangi xabarlar', icon: Mail, count: unreadCount, link: '/contacts', linkText: "Ko'rish", highlight: true },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

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
              {card.highlight && card.count > 0 && (
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
              {recentContacts.length > 0 ? recentContacts.map((msg: any) => (
                <div key={msg.id} className="flex flex-col gap-2 rounded-lg p-3 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-start gap-3 sm:flex-1 sm:items-center">
                    {!msg.is_read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary sm:mt-0" />}
                    {msg.is_read && <span className="mt-1 h-2.5 w-2.5 shrink-0 sm:mt-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{msg.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{msg.subject || msg.message?.slice(0, 50)}</p>
                    </div>
                  </div>
                  <span className="pl-5 text-xs text-muted-foreground sm:pl-0">{formatDate(msg.created_at)}</span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Xabarlar yo'q</p>
              )}
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
              📸 Instagram videolari
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-muted-foreground">Holat:</span>
                <span className={`font-medium ${instagramStatus?.is_configured ? 'text-primary' : 'text-destructive'}`}>
                  {instagramStatus?.is_configured ? "✅ Linklar kiritilgan" : instagramStatus ? "❌ Linklar yo'q" : '⏳ Tekshirilmoqda...'}
                </span>
              </div>
              {instagramStatus?.link_count !== undefined && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground">Video soni:</span>
                  <span className="font-medium text-foreground">{instagramStatus.link_count} ta</span>
                </div>
              )}
            </div>
            <Link to="/instagram">
              <Button variant="outline" size="sm" className="mt-4 w-full border-primary text-primary hover:bg-secondary">
                Batafsil →
              </Button>
            </Link>
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
