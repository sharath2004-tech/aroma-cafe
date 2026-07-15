'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PhoneAuthForm } from '@/components/auth/PhoneAuthForm';
import { useAuthStore } from '@/lib/store';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, loginWithGoogle, isLoading, error, setError } = useAuthStore();

  const defaultRole = (searchParams.get('role') || 'customer') as 'customer' | 'chef' | 'admin';

  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      // After successful registration, redirect based on role
      router.push(`/dashboard/${formData.role}`);
    } catch (err) {
      setLocalError('Registration failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError('');
    try {
      await loginWithGoogle(formData.role);
      // The chosen role only applies to brand-new accounts; an existing
      // account keeps its stored role, so redirect from the actual profile.
      const role = useAuthStore.getState().user?.role ?? formData.role;
      router.push(`/dashboard/${role}`);
    } catch (err) {
      setLocalError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <Image
            src="/logo.jpg"
            alt="Urban Crave - The Kitchen"
            width={56}
            height={56}
            className="inline-block w-14 h-14 rounded-full object-cover ring-2 ring-primary/40 mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">Join Urban Crave</h1>
          <p className="text-muted-foreground mt-2">Create your account to get started</p>
        </div>

        {/* Method toggle */}
        <div className="grid grid-cols-2 gap-1 bg-muted/50 p-1 rounded-lg">
          {(['email', 'phone'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMethod(m); setLocalError(''); setError(null); }}
              className={`py-2 rounded-md text-sm font-medium transition-all ${
                method === m
                  ? 'bg-card text-foreground shadow border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'email' ? '✉️ Email' : '📱 Phone'}
            </button>
          ))}
        </div>

        {/* Phone registration */}
        {method === 'phone' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="customer">Customer</option>
                <option value="chef">Chef</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <PhoneAuthForm
              syncPayload={{ name: formData.name, role: formData.role }}
              validateBeforeSend={() => (formData.name.trim() ? null : 'Please enter your full name first')}
            />
          </div>
        )}

        {/* Email form */}
        {method === 'email' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {(localError || error) && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-lg text-sm">
              {localError || error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="customer">Customer</option>
              <option value="chef">Chef</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign up with Google
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Already have an account?</span>
          </div>
        </div>

        {/* Footer */}
        <Link href="/auth/login">
          <Button variant="outline" className="w-full">
            Sign In
          </Button>
        </Link>
      </div>

      {/* Back link */}
      <div className="text-center mt-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition">
          ← Back to home
        </Link>
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterFormContent />
      </Suspense>
    </div>
  );
}
