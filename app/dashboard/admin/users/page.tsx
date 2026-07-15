'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { userApi } from '@/lib/auth/client';
import { useAuthStore } from '@/lib/store';
import type { UserRole } from '@/lib/types';

interface ManagedUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

const ROLE_BADGES: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  chef: 'bg-yellow-100 text-yellow-700',
  customer: 'bg-blue-100 text-blue-700',
};

export default function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  useEffect(() => {
    userApi
      .getAll()
      .then(({ users }) => setUsers(users))
      .catch((err) => setError(err?.response?.data?.message ?? 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (id: string, role: UserRole) => {
    setError('');
    const previous = users;
    setUsers(users.map((u) => (u.id === id ? { ...u, role } : u)));
    try {
      await userApi.updateRole(id, role);
    } catch (err: any) {
      setUsers(previous);
      setError(err?.response?.data?.message ?? 'Failed to update role');
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.phone ?? '').includes(q)
    );
  });

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Users</h1>
        <p className="text-lg text-muted-foreground">Manage accounts and roles</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: '👥' },
          { label: 'Customers', value: users.filter((u) => u.role === 'customer').length, icon: '☕' },
          { label: 'Chefs', value: users.filter((u) => u.role === 'chef').length, icon: '👨‍🍳' },
          { label: 'Admins', value: users.filter((u) => u.role === 'admin').length, icon: '🛡️' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="flex-1 px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
          className="px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All roles</option>
          <option value="customer">Customers</option>
          <option value="chef">Chefs</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          Loading users...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-lg text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="px-6 py-4 font-semibold text-foreground">User</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Contact</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Joined</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div>{user.email ?? '—'}</div>
                      {user.phone && <div className="text-xs">{user.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {user.id === currentUser?.id ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_BADGES[user.role]}`}>
                          {user.role} (you)
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="px-3 py-1.5 rounded-lg bg-input border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary capitalize"
                        >
                          <option value="customer">Customer</option>
                          <option value="chef">Chef</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
