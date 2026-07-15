'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  navItems: NavItem[];
  role: 'customer' | 'admin' | 'chef';
}

export function Sidebar({ navItems, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col p-6 space-y-6"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
        <Image
          src="/logo.jpg"
          alt="Urban Crave - The Kitchen"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-sidebar-primary/40"
        />
        <span className="font-bold text-lg text-sidebar-primary">Urban Crave</span>
      </Link>

      {/* User Info */}
      {user && (
        <div className="bg-sidebar-accent/20 rounded-lg p-4 border border-sidebar-border">
          <p className="text-sm text-sidebar-accent-foreground font-semibold">{user.name}</p>
          <p className="text-xs text-sidebar-foreground/60 mt-1">{user.email}</p>
          <p className="text-xs text-sidebar-primary font-medium mt-2 capitalize">
            {role}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full justify-center"
      >
        Logout
      </Button>
    </motion.div>
  );
}
