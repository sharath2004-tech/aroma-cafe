'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOrderStore } from '@/lib/store';
import type { PreOrder } from '@/lib/types';

const QUEUE_STATUSES = ['pending', 'confirmed', 'preparing', 'ready'];

const minutesSince = (date: Date | string) =>
  Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));

// Older orders bubble up as higher priority.
const priorityFor = (order: PreOrder): 'high' | 'medium' | 'low' => {
  const age = minutesSince(order.createdAt);
  if (age >= 15) return 'high';
  if (age >= 5) return 'medium';
  return 'low';
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'border-l-red-500';
    case 'confirmed':
      return 'border-l-blue-500';
    case 'preparing':
      return 'border-l-yellow-500';
    case 'ready':
      return 'border-l-green-500';
    default:
      return 'border-l-gray-500';
  }
};

const shortId = (id: string) => `#${id.slice(-6).toUpperCase()}`;

export default function ChefDashboard() {
  const { orders, loading, error, fetchAllOrders, updateOrderStatus } = useOrderStore();

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const queue = orders
    .filter((o) => QUEUE_STATUSES.includes(o.status))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Order Queue</h1>
        <p className="text-lg text-muted-foreground">
          {queue.length} active order{queue.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {QUEUE_STATUSES.map((status) => (
          <div key={status} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-sm capitalize">{status}</p>
            <p className="text-2xl font-bold text-foreground">
              {orders.filter((o) => o.status === status).length}
            </p>
          </div>
        ))}
      </motion.div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading && orders.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          Loading the order queue...
        </div>
      )}

      {/* Queue */}
      <AnimatePresence>
        {queue.map((order, index) => {
          const priority = priorityFor(order);
          const age = minutesSince(order.createdAt);
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-card border border-border border-l-4 ${getStatusColor(order.status)} rounded-xl p-6 space-y-4`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-foreground">Order {shortId(order.id)}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(priority)}`}>
                      {priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {age} min ago{order.tableNumber ? ` • Table ${order.tableNumber}` : ''}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-muted text-foreground capitalize">
                  {order.status}
                </span>
              </div>

              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-foreground">
                    • {item.menuItem.name} × {item.quantity}
                    {item.notes ? <span className="text-muted-foreground"> — {item.notes}</span> : null}
                  </p>
                ))}
              </div>

              {order.specialNotes && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">📝 {order.specialNotes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    👨‍🍳 Start Preparing
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    🔔 Mark Ready
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    variant="outline"
                  >
                    ✅ Complete (Picked Up)
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && queue.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 space-y-4"
        >
          <div className="text-6xl">🧑‍🍳</div>
          <h2 className="text-2xl font-bold text-foreground">All caught up!</h2>
          <p className="text-muted-foreground">New orders will appear here as customers place them.</p>
        </motion.div>
      )}
    </div>
  );
}
