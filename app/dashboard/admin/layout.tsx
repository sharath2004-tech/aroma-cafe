'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';

const ADMIN_NAV_ITEMS = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/admin/menu', label: 'Menu Management', icon: '🍽️' },
  { href: '/dashboard/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/dashboard/admin/bookings', label: 'Bookings', icon: '📅' },
  { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={ADMIN_NAV_ITEMS} role="admin" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
