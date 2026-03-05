import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Mahsulotlar',
  '/categories': 'Kategoriyalar',
  '/certificates': 'Sertifikatlar',
  '/gallery': 'Galereya',
  '/contacts': 'Xabarlar',
  '/settings': 'Sozlamalar',
  '/instagram': 'Instagram',
  '/users': 'Foydalanuvchilar',
  '/audit-logs': 'Audit Log',
};

export const AdminNavbar = ({ onMenuClick }: Props) => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-8"
      style={{ left: 'inherit', width: '100%' }}>
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="text-muted-foreground md:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            3
          </span>
        </button>

        <button
          onClick={toggle}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {user?.name?.charAt(0) || 'A'}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive">
              Chiqish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
