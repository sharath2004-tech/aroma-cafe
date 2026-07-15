'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, type Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/lib/store';
import type { OrderNotification } from '@/lib/types';

// Socket server lives at the API origin (without the /api suffix).
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const TYPE_ICONS: Record<OrderNotification['type'], string> = {
  new_order: '📦',
  status_update: '📝',
  ready: '✅',
  cancelled: '❌',
};

let socket: Socket | null = null;

export default function ChefNotificationsPage() {
  const { notifications, unreadCount, addNotification, markAsRead, clearNotifications } = useNotificationStore();

  // Listen for live order events pushed by the Express/Socket.IO server.
  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL);
    }

    const handleOrderCreated = (payload: { orderId: string; status: string; message: string }) => {
      addNotification({
        id: `${payload.orderId}-${Date.now()}`,
        orderId: payload.orderId,
        userId: '',
        type: 'new_order',
        message: payload.message ?? 'New order placed!',
        read: false,
        createdAt: new Date(),
      });
    };

    const handleOrderUpdated = (payload: { orderId: string; status: string; message: string }) => {
      addNotification({
        id: `${payload.orderId}-${Date.now()}`,
        orderId: payload.orderId,
        userId: '',
        type: payload.status === 'cancelled' ? 'cancelled' : payload.status === 'ready' ? 'ready' : 'status_update',
        message: payload.message ?? `Order status: ${payload.status}`,
        read: false,
        createdAt: new Date(),
      });
    };

    socket.on('order-created', handleOrderCreated);
    socket.on('order-updated', handleOrderUpdated);

    return () => {
      socket?.off('order-created', handleOrderCreated);
      socket?.off('order-updated', handleOrderUpdated);
    };
  }, [addNotification]);

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Notifications</h1>
          <p className="text-lg text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'You are all caught up'}
          </p>
        </div>
        {notifications.length > 0 && (
          <Button variant="outline" onClick={clearNotifications}>
            Clear All
          </Button>
        )}
      </motion.div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        Listening for new orders in real time
      </div>

      <AnimatePresence>
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-12 text-center"
          >
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-lg text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              New orders and status updates will appear here instantly.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <motion.button
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition ${
                  notification.read
                    ? 'bg-card border-border'
                    : 'bg-primary/5 border-primary/30 hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">{TYPE_ICONS[notification.type]}</span>
                <div className="flex-1">
                  <p className={`${notification.read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!notification.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
