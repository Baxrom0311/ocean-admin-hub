import { NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Package, FolderOpen, Trophy, Image, Mail,
  Settings, Instagram, Users, ClipboardList, LogOut, ChevronLeft, ChevronRight, Droplets
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Mahsulotlar', badge: true },
  { to: '/categories', icon: FolderOpen, label: 'Kategoriyalar' },
  { to: '/certificates', icon: Trophy, label: 'Sertifikatlar' },
  { to: '/gallery', icon: Image, label: 'Galereya' },
  { to: '/contacts', icon: Mail, label: 'Xabarlar', unread: true },
  { to: '/settings', icon: Settings, label: 'Sozlamalar' },
  { to: '/instagram', icon: Instagram, label: 'Instagram' },
];

const superAdminItems = [
  { to: '/users', icon: Users, label: 'Foydalanuvchilar' },
  { to: '/audit-logs', icon: ClipboardList, label: 'Audit Log' },
];

export const AdminSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) => {
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const visibleNavItems = navItems.filter((item) => item.to !== '/settings' || isSuperAdmin);
  const isCompact = collapsed && !mobileOpen;
  const { data: unreadData } = useQuery({
    queryKey: ['admin-contacts-unread'],
    queryFn: () => api.get('/admin/contacts/unread-count'),
  });
  const unreadCount = unreadData?.data?.count || 0;

  const sidebarClasses = cn(
    'fixed top-0 left-0 z-50 flex h-screen w-[260px] max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar shadow-2xl transition-all duration-200 md:max-w-none md:shadow-none',
    isCompact ? 'md:w-[72px]' : 'md:w-[260px]',
    mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  );

  const renderLink = (item: typeof navItems[0]) => {
    const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
    const isContacts = item.to === '/contacts';

    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onMobileClose}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
          'text-sidebar-foreground hover:bg-sidebar-accent',
          isActive && 'bg-primary text-primary-foreground border-l-4 border-accent'
        )}
        title={isCompact ? item.label : undefined}
      >
        <div className="relative shrink-0">
          <item.icon className="h-5 w-5" />
          {isContacts && unreadCount > 0 && isCompact && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {!isCompact && <span className="truncate">{item.label}</span>}
        {!isCompact && isContacts && unreadCount > 0 && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className={sidebarClasses}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5">
        <Droplets className="h-8 w-8 shrink-0 text-accent" />
        {!isCompact && (
          <div>
            <h1 className="text-lg font-bold text-sidebar-accent-foreground">ECO COMPANY</h1>
            <p className="text-xs text-sidebar-foreground">Admin Panel</p>
          </div>
        )}
      </div>

      <div className="mx-3 border-t border-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleNavItems.map(renderLink)}

        {isSuperAdmin && (
          <>
            <div className="mx-0 my-3 border-t border-sidebar-border" />
            {superAdminItems.map(renderLink)}
          </>
        )}
      </nav>

      {/* User card */}
      <div className="border-t border-sidebar-border p-3">
        {!isCompact ? (
          <div className="rounded-lg bg-sidebar-accent p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{user?.name || 'Admin'}</p>
                <p className="truncate text-xs text-sidebar-foreground">{user?.role || 'admin'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-hover hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              Chiqish
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground hover:text-destructive"
            title="Chiqish"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground md:flex"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
};
