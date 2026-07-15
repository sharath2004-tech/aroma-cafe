'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore, useOrderStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';

const STATUS_LABEL: Record<string, { label: string; icon: string; className: string }> = {
  pending: { label: 'Pending', icon: '⏳', className: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', icon: '✔️', className: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'Preparing', icon: '👨‍🍳', className: 'bg-orange-100 text-orange-700' },
  ready: { label: 'Ready for pickup', icon: '🔔', className: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', icon: '✅', className: 'bg-gray-100 text-gray-700' },
  cancelled: { label: 'Cancelled', icon: '✖️', className: 'bg-red-100 text-red-700' },
};

export default function CustomerHome() {
  const { user } = useAuthStore();
  const { orders, loading, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const recentOrders = orders.slice(0, 3);

  const stats = useMemo(() => {
    const counted = orders.filter((o) => o.status !== 'cancelled');
    const totalSpent = counted.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const itemCounts = new Map<string, number>();
    for (const order of counted) {
      for (const item of order.items) {
        const name = item.menuItem?.name;
        if (name) itemCounts.set(name, (itemCounts.get(name) ?? 0) + item.quantity);
      }
    }
    let favorite = '—';
    let best = 0;
    for (const [name, count] of itemCounts) {
      if (count > best) {
        best = count;
        favorite = name;
      }
    }

    return { totalOrders: counted.length, totalSpent, favorite };
  }, [orders]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ' Back'}!
        </h1>
        <p className="text-lg text-muted-foreground">What would you like to do today?</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { title: 'Browse Menu', description: 'Order your favorite items', href: '/dashboard/customer/menu', icon: '☕' },
          { title: 'Your Orders', description: 'Track active orders', href: '/dashboard/customer/orders', icon: '📦' },
          { title: 'Book Table', description: 'Reserve a table', href: '/dashboard/customer/bookings', icon: '📅' },
          { title: 'View Cart', description: 'Check your cart', href: '/dashboard/customer/cart', icon: '🛒' },
        ].map((action, index) => (
          <Link key={index} href={action.href}>
            <motion.button
              whileHover={{ scale: 1.02, translateY: -4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-full bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all text-left space-y-3"
            >
              <div className="text-4xl">{action.icon}</div>
              <div>
                <h3 className="font-bold text-foreground">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </motion.button>
          </Link>
        ))}
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Recent Orders</h2>
        {loading && orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">Loading your orders...</p>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            <Link href="/dashboard/customer/menu" className="text-primary font-medium hover:underline">
              Browse the menu to get started →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const status = STATUS_LABEL[order.status] ?? STATUS_LABEL.completed;
              return (
                <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{status.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        {order.items.map((i) => i.menuItem.name).join(' + ') || 'Order'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { label: 'Total Orders', value: String(stats.totalOrders), icon: '📊' },
          { label: 'Amount Spent', value: formatINR(stats.totalSpent), icon: '💰' },
          { label: 'Favorite Item', value: stats.favorite, icon: '⭐' },
        ].map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-2xl p-6">
            <div className="text-3xl mb-3">{stat.icon}</div>
            <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
