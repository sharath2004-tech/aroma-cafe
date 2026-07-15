'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOrderStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';

export default function ChefCompletedOrdersPage() {
  const { orders, loading, error, fetchAllOrders } = useOrderStore();

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const completed = orders.filter((o) => o.status === 'completed');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const completedToday = completed.filter((o) => new Date(o.updatedAt) >= todayStart);
  const revenueToday = completedToday.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Completed Orders</h1>
        <p className="text-lg text-muted-foreground">Everything served and picked up</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Completed Today', value: String(completedToday.length), icon: '✅' },
          { label: "Today's Revenue", value: formatINR(revenueToday), icon: '💰' },
          { label: 'All-Time Completed', value: String(completed.length), icon: '📊' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          Loading orders...
        </div>
      ) : completed.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🍳</div>
          <p className="text-lg text-muted-foreground">No completed orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.4) }}
              className="bg-card border border-border rounded-xl p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-foreground">#{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.map((item) => `${item.quantity}× ${item.menuItem.name}`).join(', ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{formatINR(order.totalPrice)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
