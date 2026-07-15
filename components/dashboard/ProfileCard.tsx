'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';

const ROLE_LABELS: Record<string, string> = {
  customer: '☕ Customer',
  chef: '👨‍🍳 Chef',
  admin: '🛡️ Admin',
};

export function ProfileCard() {
  const router = useRouter();
  const { user, updateProfile, logout, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setPhone(user.phone ?? '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!name.trim()) {
      setMessage('❌ Name cannot be empty');
      return;
    }
    try {
      await updateProfile({ name, phone });
      setMessage('✅ Profile updated');
    } catch {
      setMessage('❌ Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-2xl"
    >
      {/* Identity card */}
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5">
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/40"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold uppercase">
            {user.name?.charAt(0) ?? '?'}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
          {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
          {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
          <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h3 className="text-lg font-bold text-foreground">Edit Profile</h3>

        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>

      {/* Sign out */}
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-foreground">Sign Out</h3>
          <p className="text-sm text-muted-foreground">End your current session</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-destructive">
          Sign Out
        </Button>
      </div>
    </motion.div>
  );
}
