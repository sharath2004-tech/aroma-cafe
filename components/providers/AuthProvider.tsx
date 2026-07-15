'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

// Restores the Firebase session on load/refresh so the Zustand auth store
// stays in sync with the actual signed-in user.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return <>{children}</>;
}
