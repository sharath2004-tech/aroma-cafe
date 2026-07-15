import Booking from '../models/Booking.js';

const isStaff = (req) => req.user.role === 'admin' || req.user.role === 'chef';

export const getBookings = async (req, res) => {
  try {
    const filter = isStaff(req) ? {} : { customerId: req.user.userId };
    const bookings = await Booking.find(filter).sort({ bookingTime: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { tableNumber, guestCount, bookingTime, duration, specialRequests } = req.body;

    if (!tableNumber || !guestCount || !bookingTime) {
      return res.status(400).json({ message: '❌ tableNumber, guestCount and bookingTime are required' });
    }

    const booking = new Booking({
      customerId: req.user.userId,
      tableNumber,
      guestCount,
      bookingTime,
      duration,
      specialRequests
    });
    await booking.save();

    if (global.io) {
      global.io.emit('booking-created', {
        bookingId: booking._id,
        message: '📅 New table booking placed!'
      });
    }

    res.status(201).json({ message: '✅ Booking created', booking });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: '❌ Booking not found' });
    }
    if (!isStaff(req) && booking.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: '❌ You do not have permission to modify this booking' });
    }

    const { tableNumber, guestCount, bookingTime, duration, specialRequests, status } = req.body;
    if (tableNumber !== undefined) booking.tableNumber = tableNumber;
    if (guestCount !== undefined) booking.guestCount = guestCount;
    if (bookingTime !== undefined) booking.bookingTime = bookingTime;
    if (duration !== undefined) booking.duration = duration;
    if (specialRequests !== undefined) booking.specialRequests = specialRequests;
    if (status !== undefined) {
      if (!isStaff(req)) {
        return res.status(403).json({ message: '❌ Only staff can change booking status' });
      }
      booking.status = status;
    }
    booking.updatedAt = Date.now();

    await booking.save();
    res.json({ message: '✅ Booking updated', booking });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: '❌ Booking not found' });
    }
    if (!isStaff(req) && booking.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: '❌ You do not have permission to cancel this booking' });
    }

    booking.status = 'cancelled';
    booking.updatedAt = Date.now();
    await booking.save();

    res.json({ message: '✅ Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};
