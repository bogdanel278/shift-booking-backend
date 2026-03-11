import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';

const router = Router();

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (worker only)
 * @access  Public (should be protected in production)
 */
router.post('/', BookingController.createBooking);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Public (should be protected in production)
 */
router.get('/:id', BookingController.getBookingById);

/**
 * @route   GET /api/bookings/worker/:workerId
 * @desc    Get all bookings for a specific worker
 * @access  Public (should be protected in production)
 */
router.get('/worker/:workerId', BookingController.getBookingsByWorkerId);

/**
 * @route   GET /api/bookings/shift/:shiftId
 * @desc    Get all bookings for a specific shift
 * @access  Public (should be protected in production)
 */
router.get('/shift/:shiftId', BookingController.getBookingsByShiftId);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking status
 * @access  Public (should be protected in production)
 */
router.put('/:id', BookingController.updateBookingStatus);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel/delete a booking
 * @access  Public (should be protected in production)
 */
router.delete('/:id', BookingController.cancelBooking);

export default router;
