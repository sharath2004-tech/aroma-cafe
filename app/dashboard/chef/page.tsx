'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  items: string[];
  table?: number;
  time: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'preparing' | 'ready';
  notes?: string;
}

export default function ChefDashboard() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '#1240',
      items: ['Cappuccino', 'Croissant'],
      table: 5,
      time: '2 mins',
      priority: 'high',
      status: 'pending',
      notes: 'Extra foam on cappuccino',
    },
    {
      id: '#1239',
      items: ['Espresso Double', 'Pastry'],
      table: 8,
      time: '5 mins',
      priority: 'medium',
      status: 'preparing',
    },
    {
      id: '#1238',
      items: ['Latte', 'Sandwich'],
      table: 3,
      time: '8 mins',
      priority: 'low',
      status: 'preparing',
    },
  ]);

  const updateOrderStatus = (id: string, newStatus: 'pending' | 'preparing' | 'ready') => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const completeOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
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
      case 'preparing':
        return 'border-l-yellow-500';
      case 'ready':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

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
          {orders.length} active order{orders.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: '⏳' },
          { label: 'Preparing', value: orders.filter(o => o.status === 'preparing').length, icon: '👨‍🍳' },
          { label: 'Ready', value: orders.filter(o => o.status === 'ready').length, icon: '✅' },
          { label: 'Total Today', value: '47', icon: '📊' },
        ].map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Orders Queue */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Active Orders</h2>
        <AnimatePresence>
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border rounded-2xl p-12 text-center"
            >
              <div className="text-5xl mb-4">✨</div>
              <p className="text-lg text-muted-foreground">All orders completed! Well done! 🎉</p>
            </motion.div>
          ) : (
            orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-card border-l-4 ${getStatusColor(order.status)} border-r border-t border-b border-border rounded-lg p-6 space-y-4`}
              >
                {/* Order Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{order.id}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${getPriorityColor(order.priority)}`}>
                        {order.priority.toUpperCase()}
                      </span>
                      {order.table && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                          Table {order.table}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Ordered {order.time} ago</p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {order.status === 'pending' && '🕐 Waiting'}
                    {order.status === 'preparing' && '👨‍🍳 Cooking'}
                    {order.status === 'ready' && '✅ Ready'}
                  </span>
                </div>

                {/* Items */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm font-semibold text-foreground mb-2">Items:</p>
                  <ul className="space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <span className="font-semibold">Note:</span> {order.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {order.status === 'pending' && (
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
                      onClick={() => completeOrder(order.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Picked Up
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    Details
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
