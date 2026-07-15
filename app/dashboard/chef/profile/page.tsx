'use client';

import { motion } from 'framer-motion';
import { ProfileCard } from '@/components/dashboard/ProfileCard';

export default function ChefProfilePage() {
  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Profile</h1>
        <p className="text-lg text-muted-foreground">Your chef account details</p>
      </motion.div>

      <ProfileCard />
    </div>
  );
}
