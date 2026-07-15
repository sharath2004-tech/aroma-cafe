import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', bookingController.getBookings);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.post('/:id/cancel', bookingController.cancelBooking);

export default router;
