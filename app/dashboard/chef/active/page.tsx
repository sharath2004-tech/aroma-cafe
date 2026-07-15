'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOrderStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'ready'] as const;

const STATUS_BORDER: Record<string, string> = {
  pending: 'border-l-red-500',
  confirmed: 'border-l-blue-500',
  preparing: 'border-l-yellow-500',
  ready: 'border-l-green-500',
};

const STATUS_LABEL: Record<string, string> = {
  pending: '🕐 Waiting',
  confirmed: '✔️ Confirmed',
  preparing: '👨‍🍳 Cooking',
  ready: '✅ Ready',
};

export default function ChefActiveOrdersPage() {
  const { orders, loading, error, fetchAllOrders, updateOrderStatus } = useOrderStore();

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const active = orders.filter((o) => (ACTIVE_STATUSES as readonly string[]).includes(o.status));

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Active Orders</h1>
        <p className="text-lg text-muted-foreground">
          {active.length} order{active.length !== 1 ? 's' : ''} in progress
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ACTIVE_STATUSES.map((status) => (
          <div key={status} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-sm capitalize">{status}</p>
            <p className="text-2xl font-bold text-foreground">
              {orders.filter((o) => o.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <AnimatePresence>
        {loading && orders.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            Loading orders...
          </div>
        ) : active.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-12 text-center"
          >
            <div className="text-5xl mb-4">✨</div>
            <p className="text-lg text-muted-foreground">No active orders right now. Time for a coffee break! ☕</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {active.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: Math.min(index * 0.05, 0.4) }}
                className={`bg-card border-l-4 ${STATUS_BORDER[order.status]} border-r border-t border-b border-border rounded-lg p-6 space-y-4`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">
                        #{order.id.slice(-6).toUpperCase()}
                      </h3>
                      {order.tableNumber !== undefined && !Number.isNaN(order.tableNumber) && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                          Table {order.tableNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customer?.name ?? 'Customer'} •{' '}
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-muted-foreground">{STATUS_LABEL[order.status]}</span>
                    <p className="font-bold text-primary">{formatINR(order.totalPrice)}</p>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm font-semibold text-foreground mb-2">Items:</p>
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm text-muted-foreground">
                        • {item.quantity}× {item.menuItem.name}
                        {item.notes && <span className="text-xs"> — {item.notes}</span>}
                      </li>
                    ))}
                  </ul>
                </div>

                {order.specialNotes && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <span className="font-semibold">Note:</span> {order.specialNotes}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Start Preparing
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      Mark as Ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Picked Up
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
