import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';

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

export const AdminNavbar = ({ onMenuClick, sidebarCollapsed }: Props) => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const { data: unreadData } = useQuery({
    queryKey: ['admin-contacts-unread'],
    queryFn: () => api.get('/admin/contacts/unread-count'),
  });

  const title = pageTitles[location.pathname] || 'Dashboard';
  const unreadCount = unreadData?.data?.count || 0;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur md:px-6 lg:px-8 ${sidebarCollapsed ? 'md:left-[72px]' : 'md:left-[260px]'}`}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button onClick={onMenuClick} className="text-muted-foreground md:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="truncate text-base font-bold text-foreground sm:text-lg">{title}</h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          to="/contacts"
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Xabarlarga o'tish"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

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
