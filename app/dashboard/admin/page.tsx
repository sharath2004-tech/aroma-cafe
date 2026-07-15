'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Link from 'next/link';

const chartData = [
  { day: 'Mon', orders: 120, revenue: 450 },
  { day: 'Tue', orders: 150, revenue: 620 },
  { day: 'Wed', orders: 130, revenue: 480 },
  { day: 'Thu', orders: 180, revenue: 750 },
  { day: 'Fri', orders: 220, revenue: 950 },
  { day: 'Sat', orders: 280, revenue: 1200 },
  { day: 'Sun', orders: 200, revenue: 850 },
];

export default function AdminDashboard() {
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
          { label: 'Total Orders', value: '1,240', change: '+12.5%', icon: '📦' },
          { label: 'Revenue', value: '₹85,400', change: '+8.2%', icon: '💰' },
          { label: 'Active Customers', value: '340', change: '+5.1%', icon: '👥' },
          { label: 'Avg Order Value', value: '₹285', change: '+3.8%', icon: '📊' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ translateY: -4 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{stat.icon}</span>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
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
              <YAxis stroke="var(--color-muted-foreground)" />
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
        <div className="space-y-3">
          {[
            { type: 'Order', message: 'New order #1240 from John Doe', time: '5 minutes ago', icon: '📦' },
            { type: 'Booking', message: 'Table booking confirmed for 6 people', time: '15 minutes ago', icon: '📅' },
            { type: 'Order', message: 'Order #1239 ready for pickup', time: '25 minutes ago', icon: '✅' },
            { type: 'User', message: 'New user registration: Jane Smith', time: '1 hour ago', icon: '👤' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                {activity.type}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
