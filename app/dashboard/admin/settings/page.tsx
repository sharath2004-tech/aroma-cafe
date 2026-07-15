'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';

interface CafeSettings {
  cafeName: string;
  phone: string;
  address: string;
  openingTime: string;
  closingTime: string;
  totalTables: number;
  acceptOrders: boolean;
  acceptBookings: boolean;
}

const DEFAULT_SETTINGS: CafeSettings = {
  cafeName: 'Urban Crave - The Kitchen',
  phone: '',
  address: '',
  openingTime: '09:00',
  closingTime: '22:00',
  totalTables: 12,
  acceptOrders: true,
  acceptBookings: true,
};

const STORAGE_KEY = 'cafe-settings';

export default function AdminSettingsPage() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_SETTINGS);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch {
        // Ignore corrupted settings and fall back to defaults
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setProfileName(user.name ?? '');
      setProfilePhone(user.phone ?? '');
    }
  }, [user]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSavedAt(new Date());
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      await updateProfile({ name: profileName, phone: profilePhone });
      setProfileMessage('✅ Profile updated');
    } catch {
      setProfileMessage('❌ Failed to update profile');
    }
  };

  const inputClass =
    'w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-lg text-muted-foreground">Cafe configuration and your admin profile</p>
      </motion.div>

      {/* Cafe settings */}
      <motion.form
        onSubmit={handleSaveSettings}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6 space-y-5"
      >
        <h2 className="text-xl font-bold text-foreground">🏪 Cafe Details</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Cafe Name</label>
          <input
            type="text"
            value={settings.cafeName}
            onChange={(e) => setSettings({ ...settings, cafeName: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Contact Phone</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Total Tables</label>
            <input
              type="number"
              min={1}
              value={settings.totalTables}
              onChange={(e) => setSettings({ ...settings, totalTables: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Address</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            placeholder="Street, City, PIN"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Opening Time</label>
            <input
              type="time"
              value={settings.openingTime}
              onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Closing Time</label>
            <input
              type="time"
              value={settings.closingTime}
              onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-3">
          {(
            [
              { key: 'acceptOrders', label: 'Accept online orders' },
              { key: 'acceptBookings', label: 'Accept table bookings' },
            ] as const
          ).map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50 cursor-pointer">
              <span className="text-sm font-medium text-foreground">{label}</span>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                className="w-5 h-5 accent-[var(--color-primary)]"
              />
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
          <span className="text-sm font-medium text-foreground">Currency</span>
          <span className="text-sm font-bold text-primary">₹ Indian Rupee (INR)</span>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Save Settings
          </Button>
          {savedAt && (
            <span className="text-sm text-muted-foreground">
              Saved at {savedAt.toLocaleTimeString('en-IN')}
            </span>
          )}
        </div>
      </motion.form>

      {/* Admin profile */}
      <motion.form
        onSubmit={handleSaveProfile}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6 space-y-5"
      >
        <h2 className="text-xl font-bold text-foreground">👤 Your Profile</h2>

        {profileMessage && <p className="text-sm text-muted-foreground">{profileMessage}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone</label>
            <input
              type="tel"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </div>
        </div>

        {user?.email && (
          <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {isLoading ? 'Saving...' : 'Update Profile'}
        </Button>
      </motion.form>
    </div>
  );
}
