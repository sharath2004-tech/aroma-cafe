'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOrderStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import type { PreOrder } from '@/lib/types';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const;

const NEXT_STATUS: Record<string, { status: string; label: string; className: string } | undefined> = {
  pending: { status: 'confirmed', label: 'Confirm', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
  confirmed: { status: 'preparing', label: 'Start Preparing', className: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  preparing: { status: 'ready', label: 'Mark Ready', className: 'bg-green-500 hover:bg-green-600 text-white' },
  ready: { status: 'completed', label: 'Complete', className: 'bg-green-600 hover:bg-green-700 text-white' },
};

const STATUS_BADGES: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const { orders, loading, error, fetchAllOrders, updateOrderStatus, cancelOrder } = useOrderStore();
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Orders</h1>
        <p className="text-lg text-muted-foreground">Track and manage every order in the cafe</p>
      </motion.div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap capitalize ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {status}
            {status !== 'all' && (
              <span className="ml-2 text-xs opacity-75">
                {orders.filter((o) => o.status === status).length}
              </span>
            )}
          </button>
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
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg text-muted-foreground">No {filter === 'all' ? '' : filter} orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order: PreOrder, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.4) }}
              className="bg-card border border-border rounded-2xl p-6 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-foreground">Order #{order.id.slice(-6).toUpperCase()}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGES[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                    {order.tableNumber !== undefined && !Number.isNaN(order.tableNumber) && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                        Table {order.tableNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.customer?.name ?? 'Customer'} • {new Date(order.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="text-xl font-bold text-primary">{formatINR(order.totalPrice)}</p>
              </div>

              <div className="bg-muted/30 rounded-lg p-3">
                <ul className="space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="text-foreground">
                        {item.quantity}× {item.menuItem.name}
                      </span>
                      <span className="text-muted-foreground">{formatINR(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                {order.specialNotes && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-semibold">Note:</span> {order.specialNotes}
                  </p>
                )}
              </div>

              {!['completed', 'cancelled'].includes(order.status) && (
                <div className="flex gap-3">
                  {NEXT_STATUS[order.status] && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, NEXT_STATUS[order.status]!.status)}
                      className={`flex-1 ${NEXT_STATUS[order.status]!.className}`}
                    >
                      {NEXT_STATUS[order.status]!.label}
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => cancelOrder(order.id)} className="flex-1 text-destructive">
                    Cancel Order
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
