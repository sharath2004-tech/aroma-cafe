'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CustomerHome() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Welcome Back!</h1>
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
          { title: 'Browse Menu', description: 'Order your favorite items', href: '/dashboard/customer/menu', icon: '☕', color: 'from-primary' },
          { title: 'Your Orders', description: 'Track active orders', href: '/dashboard/customer/orders', icon: '📦', color: 'from-accent' },
          { title: 'Book Table', description: 'Reserve a table', href: '/dashboard/customer/bookings', icon: '📅', color: 'from-secondary' },
          { title: 'View Cart', description: 'Check your cart', href: '/dashboard/customer/cart', icon: '🛒', color: 'from-primary/50' },
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
        <div className="space-y-4">
          {[
            { id: '1', items: 'Cappuccino + Croissant', status: 'Ready for pickup', date: 'Today, 10:30 AM', icon: '✅' },
            { id: '2', items: 'Espresso Double Shot', status: 'Preparing', date: 'Today, 10:15 AM', icon: '⏳' },
            { id: '3', items: 'Latte + Pastry', status: 'Completed', date: 'Yesterday, 3:45 PM', icon: '✅' },
          ].map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{order.icon}</span>
                <div>
                  <p className="font-semibold text-foreground">{order.items}</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'Ready for pickup' ? 'bg-green-100 text-green-700' :
                order.status === 'Preparing' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { label: 'Total Orders', value: '24', icon: '📊' },
          { label: 'Amount Spent', value: '₹1,565', icon: '💰' },
          { label: 'Favorite Item', value: 'Cappuccino', icon: '⭐' },
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
