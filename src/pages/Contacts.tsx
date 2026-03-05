import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Trash2, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const mockMessages = [
  { id: '1', name: 'Alisher Toshmatov', phone: '+998901234567', email: 'alisher@gmail.com', subject: 'Narx so\'rash', date: '04.03, 14:32', message: "Salom, sizning 5L mahsulotingizning narxi qancha? Ulgurji buyurtma bermoqchiman...", is_read: false },
  { id: '2', name: 'Nodira Karimova', phone: '+998941112233', email: 'nodira@gmail.com', subject: 'Buyurtma', date: '03.03, 09:15', message: "50 ta 19L idish buyurtma bermoqchiman. Narxlar haqida ma'lumot bering.", is_read: false },
  { id: '3', name: 'Jamshid Mirzayev', phone: '+998907778899', email: 'jamshid@mail.ru', subject: 'Hamkorlik', date: '02.03, 16:45', message: "Hamkorlik qilish imkoniyati bormi?", is_read: true },
];

type FilterTab = 'all' | 'unread' | 'read' | 'archive';

const Contacts = () => {
  const [tab, setTab] = useState<FilterTab>('all');
  const [selected, setSelected] = useState<typeof mockMessages[0] | null>(null);

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: 'Barchasi', count: mockMessages.length },
    { key: 'unread', label: 'Yangi', count: mockMessages.filter(m => !m.is_read).length },
    { key: 'read', label: "O'qilgan" },
    { key: 'archive', label: 'Arxiv' },
  ];

  const filtered = mockMessages.filter(m => {
    if (tab === 'unread') return !m.is_read;
    if (tab === 'read') return m.is_read;
    return true;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Xabarlar</h1>
        <Badge className="bg-destructive text-destructive-foreground">{mockMessages.filter(m => !m.is_read).length} ta yangi</Badge>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label} {t.count !== undefined && <span className="ml-1 text-xs">({t.count})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="w-8 px-4 py-3"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ism</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tel / Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mavzu</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sana</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-border transition-colors last:border-0 hover:bg-secondary/50 cursor-pointer"
                onClick={() => setSelected(m)}>
                <td className="px-4 py-3">
                  {!m.is_read && <span className="flex h-2.5 w-2.5 rounded-full bg-primary" />}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{m.phone}</td>
                <td className="px-4 py-3 text-sm text-foreground">{m.subject}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{m.date}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={e => { e.stopPropagation(); setSelected(m); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[420px]">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-foreground">{selected.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">📞 {selected.phone}</p>
                  <p className="text-muted-foreground">📧 {selected.email}</p>
                  <p className="text-muted-foreground">📋 {selected.subject}</p>
                  <p className="text-muted-foreground">🕐 {selected.date}</p>
                </div>
                <div className="border-t border-border" />
                <p className="text-sm text-foreground leading-relaxed">"{selected.message}"</p>
                <div className="border-t border-border" />
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1 ocean-gradient-btn text-primary-foreground">
                    <CheckCheck className="h-3.5 w-3.5" /> O'qildi
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => window.open(`mailto:${selected.email}?subject=Re: ${selected.subject}`)}>
                    📧 Javob berish
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Contacts;
