'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/lib/store';
import type { TableBooking } from '@/lib/types';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;

const STATUS_BADGES: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminBookingsPage() {
  const { bookings, loading, error, fetchBookings, updateBooking, cancelBooking } = useBookingStore();
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Table Bookings</h1>
        <p className="text-lg text-muted-foreground">Review and manage reservations</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
          <div key={status} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-sm capitalize">{status}</p>
            <p className="text-2xl font-bold text-foreground">
              {bookings.filter((b) => b.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap capitalize ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading && bookings.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          Loading bookings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-lg text-muted-foreground">No {filter === 'all' ? '' : filter} bookings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((booking: TableBooking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.4) }}
              className="bg-card border border-border rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-foreground">Table {booking.tableNumber}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGES[booking.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {booking.customer?.name ?? 'Customer'}
                  </p>
                </div>
                <span className="text-3xl">🍽️</span>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-sm">
                <p className="text-foreground">
                  🕐 {new Date(booking.bookingTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <p className="text-muted-foreground">👥 {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}</p>
                {booking.duration && <p className="text-muted-foreground">⏱️ {booking.duration} minutes</p>}
                {booking.specialRequests && (
                  <p className="text-muted-foreground">📝 {booking.specialRequests}</p>
                )}
              </div>

              {['pending', 'confirmed'].includes(booking.status) && (
                <div className="flex gap-3">
                  {booking.status === 'pending' && (
                    <Button
                      onClick={() => updateBooking(booking.id, { status: 'confirmed' })}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      Confirm
                    </Button>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button
                      onClick={() => updateBooking(booking.id, { status: 'completed' })}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Mark Completed
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => cancelBooking(booking.id)} className="flex-1 text-destructive">
                    Cancel
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
