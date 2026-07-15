'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';

const CHEF_NAV_ITEMS = [
  { href: '/dashboard/chef', label: 'Orders Queue', icon: '📋' },
  { href: '/dashboard/chef/active', label: 'Active Orders', icon: '⏳' },
  { href: '/dashboard/chef/completed', label: 'Completed', icon: '✅' },
  { href: '/dashboard/chef/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/dashboard/chef/profile', label: 'Profile', icon: '👤' },
];

export default function ChefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={CHEF_NAV_ITEMS} role="chef" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
