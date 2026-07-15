'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';

const CUSTOMER_NAV_ITEMS = [
  { href: '/dashboard/customer', label: 'Home', icon: '🏠' },
  { href: '/dashboard/customer/menu', label: 'Menu', icon: '☕' },
  { href: '/dashboard/customer/cart', label: 'Cart', icon: '🛒' },
  { href: '/dashboard/customer/orders', label: 'Orders', icon: '📦' },
  { href: '/dashboard/customer/bookings', label: 'Bookings', icon: '📅' },
  { href: '/dashboard/customer/profile', label: 'Profile', icon: '👤' },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={CUSTOMER_NAV_ITEMS} role="customer" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
