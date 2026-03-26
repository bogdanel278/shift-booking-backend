import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';
import { authenticateToken, requireWorker, requireBusiness } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (worker only)
 * @access  Protected - Worker only
 */
router.post('/', authenticateToken, requireWorker, BookingController.createBooking);

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Get all bookings for the authenticated worker
 * @access  Protected - Worker only
 */
router.get('/my-bookings', authenticateToken, requireWorker, BookingController.getMyBookings);

/**
 * @route   GET /api/bookings/shift/:shiftId
 * @desc    Get all bookings for a specific shift (business owner only)
 * @access  Protected - Business only
 */
router.get('/shift/:shiftId', authenticateToken, requireBusiness, BookingController.getBookingsByShiftId);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Protected
 */
router.get('/:id', authenticateToken, BookingController.getBookingById);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking status
 * @access  Protected
 */
router.put('/:id', authenticateToken, BookingController.updateBookingStatus);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel/delete a booking
 * @access  Protected
 */
router.delete('/:id', authenticateToken, BookingController.cancelBooking);

export default router;
