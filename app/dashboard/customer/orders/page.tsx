'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  icon: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  readyTime: Date;
  createdAt: Date;
  estimatedTime: number;
}

const MOCK_ORDERS: Order[] = [
  {
    id: '#1250',
    items: [
      { name: 'Cappuccino', quantity: 2, price: 180, icon: '☕' },
      { name: 'Croissant', quantity: 1, price: 150, icon: '🥐' },
    ],
    total: 510,
    status: 'ready',
    readyTime: new Date(Date.now() + 5 * 60000),
    createdAt: new Date(Date.now() - 10 * 60000),
    estimatedTime: 15,
  },
  {
    id: '#1249',
    items: [
      { name: 'Latte', quantity: 1, price: 200, icon: '☕' },
      { name: 'Club Sandwich', quantity: 1, price: 280, icon: '🥪' },
    ],
    total: 480,
    status: 'preparing',
    readyTime: new Date(Date.now() + 8 * 60000),
    createdAt: new Date(Date.now() - 2 * 60000),
    estimatedTime: 10,
  },
  {
    id: '#1248',
    items: [
      { name: 'Americano', quantity: 1, price: 150, icon: '☕' },
      { name: 'Donut', quantity: 2, price: 90, icon: '🍩' },
    ],
    total: 330,
    status: 'completed',
    readyTime: new Date(Date.now() - 2 * 3600000),
    createdAt: new Date(Date.now() - 2.5 * 3600000),
    estimatedTime: 5,
  },
  {
    id: '#1247',
    items: [
      { name: 'Mocha', quantity: 1, price: 210, icon: '☕' },
      { name: 'Danish', quantity: 1, price: 140, icon: '🥐' },
    ],
    total: 350,
    status: 'completed',
    readyTime: new Date(Date.now() - 24 * 3600000),
    createdAt: new Date(Date.now() - 24.5 * 3600000),
    estimatedTime: 8,
  },
];

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
    case 'completed':
      return { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-100 text-gray-700' };
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
    default:
      return '?';
  }
};

export default function OrdersPage() {
  const activeOrders = MOCK_ORDERS.filter(o => o.status !== 'completed');
  const completedOrders = MOCK_ORDERS.filter(o => o.status === 'completed');

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

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">Active Orders</h2>
          {activeOrders.map((order, index) => {
            const colors = getStatusColor(order.status);
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
                      <p className={`font-bold ${colors.text}`}>Order {order.id}</p>
                      <p className={`text-sm ${colors.text} opacity-75`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
                    {order.status === 'ready' ? 'Ready for Pickup' : `Ready in ~${order.estimatedTime} min`}
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
                          <span className="text-lg mr-2">{item.icon}</span>
                          {item.name} x {item.quantity}
                        </span>
                        <span className="text-muted-foreground">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-border pt-3 flex justify-between font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary text-lg">{formatINR(order.total)}</span>
                  </div>

                  {/* Status Progress */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">PROGRESS</span>
                      <span className="text-xs text-muted-foreground">
                        Ordered at {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">Past Orders</h2>
          <div className="space-y-3">
            {completedOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-all"
              >
                <div>
                  <p className="font-semibold text-foreground">Order {order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.map(i => i.name).join(', ')} • {order.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-primary font-bold">{formatINR(order.total)}</span>
                  <span className="text-xl">✅</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {MOCK_ORDERS.length === 0 && (
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
