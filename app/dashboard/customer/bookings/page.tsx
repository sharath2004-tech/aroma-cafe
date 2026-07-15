'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/lib/store';

export default function BookingsPage() {
  const { bookings, loading, error, fetchBookings, createBooking, cancelBooking } = useBookingStore();

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [formData, setFormData] = useState({
    tableNumber: '1',
    guestCount: '2',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingTime: '18:00',
    duration: '90',
    specialRequests: '',
  });

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const bookingTime = new Date(`${formData.bookingDate}T${formData.bookingTime}`);
    if (Number.isNaN(bookingTime.getTime()) || bookingTime <= new Date()) {
      setLocalError('Please choose a date and time in the future');
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        tableNumber: parseInt(formData.tableNumber),
        guestCount: parseInt(formData.guestCount),
        bookingTime: bookingTime.toISOString() as unknown as Date,
        duration: parseInt(formData.duration),
        specialRequests: formData.specialRequests || undefined,
      });
      setShowForm(false);
      setFormData({
        tableNumber: '1',
        guestCount: '2',
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: '18:00',
        duration: '90',
        specialRequests: '',
      });
    } catch {
      // store already surfaces the error message
    } finally {
      setSubmitting(false);
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.bookingTime) > new Date() && b.status !== 'cancelled'
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.bookingTime) <= new Date() || b.status === 'cancelled'
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Table Bookings</h1>
          <p className="text-lg text-muted-foreground">Reserve your favorite table</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {showForm ? 'Cancel' : '+ New Booking'}
        </Button>
      </motion.div>

      {(localError || error) && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {localError || error}
        </div>
      )}

      {/* Booking Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Table</label>
                  <select
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>Table {n}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Number of Guests</label>
                  <select
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Time</label>
                  <input
                    type="time"
                    value={formData.bookingTime}
                    onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Duration (minutes)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[60, 90, 120, 150, 180].map(d => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Special Requests</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="Any special requests? (e.g., window seat, high chair needed)"
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
              >
                {submitting ? 'Booking...' : 'Book Table'}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && bookings.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          Loading your bookings...
        </div>
      )}

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">Upcoming Bookings</h2>
          {upcomingBookings.map((booking, index) => {
            const when = new Date(booking.bookingTime);
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">🪑</div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Table {booking.tableNumber}</h3>
                      <p className="text-muted-foreground">{booking.guestCount} Guest{booking.guestCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-semibold text-foreground">
                      {when.toLocaleDateString()} at {when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Duration</p>
                    <p className="font-semibold text-foreground">{booking.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Special Requests</p>
                    <p className="font-semibold text-foreground">{booking.specialRequests || '—'}</p>
                  </div>
                  <div className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => cancelBooking(booking.id)}
                    >
                      Cancel Booking
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">Past Bookings</h2>
          <div className="space-y-3">
            {pastBookings.map((booking) => {
              const when = new Date(booking.bookingTime);
              return (
                <motion.div
                  key={booking.id}
                  className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-all"
                >
                  <div>
                    <p className="font-semibold text-foreground">Table {booking.tableNumber} • {booking.guestCount} Guests</p>
                    <p className="text-sm text-muted-foreground">
                      {when.toLocaleDateString()} at {when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && bookings.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 space-y-4"
        >
          <div className="text-6xl">📅</div>
          <h2 className="text-2xl font-bold text-foreground">No bookings yet</h2>
          <p className="text-muted-foreground">Reserve a table for your next visit!</p>
        </motion.div>
      )}
    </div>
  );
}
