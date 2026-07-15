'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useOrderStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { orders, loading, fetchAllOrders } = useOrderStore();

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const stats = useMemo(() => {
    const billable = orders.filter((o) => o.status !== 'cancelled');
    const revenue = billable.reduce((sum, o) => sum + o.totalPrice, 0);

    // Revenue & order count for each of the last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - i));
      return date;
    });
    const daily = days.map((day) => {
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const dayOrders = billable.filter((o) => {
        const created = new Date(o.createdAt);
        return created >= day && created < next;
      });
      return {
        day: day.toLocaleDateString('en-IN', { weekday: 'short' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.totalPrice, 0),
      };
    });

    // Top-selling items by quantity
    const itemTotals = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const order of billable) {
      for (const item of order.items) {
        const existing = itemTotals.get(item.menuItem.name) ?? { name: item.menuItem.name, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        itemTotals.set(item.menuItem.name, existing);
      }
    }
    const topItems = [...itemTotals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    const statusCounts = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    }));

    return {
      revenue,
      totalOrders: orders.length,
      avgOrderValue: billable.length ? revenue / billable.length : 0,
      completed: orders.filter((o) => o.status === 'completed').length,
      daily,
      topItems,
      statusCounts,
    };
  }, [orders]);

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
        <p className="text-lg text-muted-foreground">
          {loading ? 'Loading live order data...' : 'Live insights from your orders'}
        </p>
      </motion.div>

      {/* Key stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: 'Total Revenue', value: formatINR(stats.revenue), icon: '💰' },
          { label: 'Total Orders', value: String(stats.totalOrders), icon: '📦' },
          { label: 'Avg Order Value', value: formatINR(stats.avgOrderValue), icon: '📊' },
          { label: 'Completed Orders', value: String(stats.completed), icon: '✅' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
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
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Revenue (last 7 days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                formatter={(value) => formatINR(Number(value))}
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Orders (last 7 days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="orders" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Top items */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Top Selling Items</h2>
          {stats.topItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">No order data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topItems.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} sold</p>
                  </div>
                  <span className="font-bold text-primary">{formatINR(item.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {stats.statusCounts.map(({ status, count }) => (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-foreground">{status}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${stats.totalOrders ? (count / stats.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
