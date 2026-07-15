'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Link from 'next/link';
import { useBookingStore, useOrderStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';

export default function AdminDashboard() {
  const { orders, loading: ordersLoading, fetchAllOrders } = useOrderStore();
  const { bookings, fetchBookings } = useBookingStore();

  useEffect(() => {
    fetchAllOrders();
    fetchBookings();
  }, [fetchAllOrders, fetchBookings]);

  const countedOrders = useMemo(() => orders.filter((o) => o.status !== 'cancelled'), [orders]);

  const stats = useMemo(() => {
    const revenue = countedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const customers = new Set(countedOrders.map((o) => o.customerId).filter(Boolean)).size;
    return {
      totalOrders: countedOrders.length,
      revenue,
      customers,
      avgOrder: countedOrders.length ? revenue / countedOrders.length : 0,
    };
  }, [countedOrders]);

  // Last 7 days, oldest first.
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((day) => {
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const dayOrders = countedOrders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= day.getTime() && t < next.getTime();
      });
      return {
        day: day.toLocaleDateString([], { weekday: 'short' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
      };
    });
  }, [countedOrders]);

  const recentActivity = useMemo(() => {
    const orderEvents = orders.slice(0, 6).map((o) => ({
      type: 'Order',
      icon: '📦',
      message: `Order #${o.id.slice(-6).toUpperCase()} • ${o.items.length} item${o.items.length !== 1 ? 's' : ''} • ${formatINR(o.totalPrice || 0)} (${o.status})`,
      at: new Date(o.createdAt),
    }));
    const bookingEvents = bookings.slice(0, 6).map((b) => ({
      type: 'Booking',
      icon: '📅',
      message: `Table ${b.tableNumber} booked for ${b.guestCount} guest${b.guestCount !== 1 ? 's' : ''} (${b.status})`,
      at: new Date(b.createdAt),
    }));
    return [...orderEvents, ...bookingEvents]
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 5);
  }, [orders, bookings]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">Manage your cafe operations</p>
      </motion.div>

      {/* Key Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: 'Total Orders', value: String(stats.totalOrders), icon: '📦' },
          { label: 'Revenue', value: formatINR(stats.revenue), icon: '💰' },
          { label: 'Customers', value: String(stats.customers), icon: '👥' },
          { label: 'Avg Order Value', value: formatINR(stats.avgOrder), icon: '📊' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ translateY: -4 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-3"
          >
            <span className="text-3xl">{stat.icon}</span>
            <div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Orders Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Weekly Orders</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis allowDecimals={false} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: `1px solid var(--color-border)`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Weekly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: `1px solid var(--color-border)`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={2} dot={{ fill: 'var(--color-accent)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: 'Manage Menu', href: '/dashboard/admin/menu', icon: '🍽️' },
          { label: 'View Orders', href: '/dashboard/admin/orders', icon: '📦' },
          { label: 'Users', href: '/dashboard/admin/users', icon: '👥' },
          { label: 'Analytics', href: '/dashboard/admin/analytics', icon: '📈' },
        ].map((action, index) => (
          <Link key={index} href={action.href}>
            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              className="w-full bg-primary/10 border border-primary/20 hover:border-primary/50 rounded-xl p-4 text-center transition-all"
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <span className="font-semibold text-foreground">{action.label}</span>
            </motion.button>
          </Link>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Recent Activity</h2>
        {ordersLoading && recentActivity.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">Loading activity...</p>
        ) : recentActivity.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">
            No activity yet — orders and bookings will appear here as they come in.
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.at.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                  {activity.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
