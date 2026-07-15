'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useOrderStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import type { PreOrder } from '@/lib/types';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'ready'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-700' };
    case 'confirmed':
      return { bg: 'bg-blue-100', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-700' };
    case 'preparing':
      return { bg: 'bg-orange-100', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-700' };
    case 'ready':
      return { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-100 text-green-700' };
    case 'cancelled':
      return { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-100 text-red-700' };
    case 'completed':
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-100 text-gray-700' };
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'confirmed':
      return '✓';
    case 'preparing':
      return '👨‍🍳';
    case 'ready':
      return '🔔';
    case 'completed':
      return '✅';
    case 'cancelled':
      return '✖️';
    default:
      return '?';
  }
};

const shortId = (id: string) => `#${id.slice(-6).toUpperCase()}`;

export default function OrdersPage() {
  const { orders, loading, error, fetchOrders, cancelOrder } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pastOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Your Orders</h1>
        <p className="text-lg text-muted-foreground">Track and manage your orders</p>
      </motion.div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading && orders.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          Loading your orders...
        </div>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">Active Orders</h2>
          {activeOrders.map((order: PreOrder, index: number) => {
            const colors = getStatusColor(order.status);
            const createdAt = new Date(order.createdAt);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                {/* Order Header */}
                <div className={`${colors.bg} px-6 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStatusIcon(order.status)}</span>
                    <div>
                      <p className={`font-bold ${colors.text}`}>Order {shortId(order.id)}</p>
                      <p className={`text-sm ${colors.text} opacity-75`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
                    {order.status === 'ready' ? 'Ready for Pickup' : 'In Progress'}
                  </span>
                </div>

                {/* Order Details */}
                <div className="p-6 space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Items:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          {item.menuItem.name} x {item.quantity}
                        </span>
                        <span className="text-muted-foreground">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-border pt-3 flex justify-between font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary text-lg">{formatINR(order.totalPrice)}</span>
                  </div>

                  {/* Status Progress */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">PROGRESS</span>
                      <span className="text-xs text-muted-foreground">
                        Ordered at {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            order.status === 'pending' ? '25%' :
                            order.status === 'confirmed' ? '50%' :
                            order.status === 'preparing' ? '75%' :
                            '100%'
                          }`
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status === 'ready' && (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-sm text-green-700 dark:text-green-200 font-medium">
                        Your order is ready! Please pick it up at the counter.
                      </p>
                    </div>
                  )}
                  {order.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Past Orders */}
      {pastOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">Past Orders</h2>
          <div className="space-y-3">
            {pastOrders.map((order: PreOrder, index: number) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-all"
              >
                <div>
                  <p className="font-semibold text-foreground">Order {shortId(order.id)}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.map((i) => i.menuItem.name).join(', ')} • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-primary font-bold">{formatINR(order.totalPrice)}</span>
                  <span className="text-xl">{getStatusIcon(order.status)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 space-y-6"
        >
          <div className="text-6xl">📦</div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start by placing your first order</p>
            <Link href="/dashboard/customer/menu">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Browse Menu
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
