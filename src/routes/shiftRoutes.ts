import { Router } from 'express';
import { ShiftController } from '../controllers/shiftController';
import { authenticateToken, requireBusiness } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/shifts
 * @desc    Create a new shift (business only)
 * @access  Protected - Business only
 */
router.post('/', authenticateToken, requireBusiness, ShiftController.createShift);

/**
 * @route   GET /api/shifts
 * @desc    Get all shifts or filter by query params
 * @query   available - Get only available (future) shifts
 * @query   business_id - Get shifts by business ID
 * @access  Public
 */
router.get('/', ShiftController.getAllShifts);

/**
 * @route   GET /api/shifts/:id
 * @desc    Get shift by ID
 * @access  Public
 */
router.get('/:id', ShiftController.getShiftById);

/**
 * @route   PUT /api/shifts/:id
 * @desc    Update shift (business owner only)
 * @access  Protected - Business only
 */
router.put('/:id', authenticateToken, requireBusiness, ShiftController.updateShift);

/**
 * @route   PATCH /api/shifts/:id/cancel
 * @desc    Cancel shift (business owner only)
 * @access  Protected - Business only
 */
router.patch('/:id/cancel', authenticateToken, requireBusiness, ShiftController.cancelShift);

/**
 * @route   GET /api/shifts/:id/bookings
 * @desc    Get all bookings for a specific shift (business owner only)
 * @access  Protected - Business only
 */
router.get('/:id/bookings', authenticateToken, requireBusiness, ShiftController.getShiftBookings);

/**
 * @route   DELETE /api/shifts/:id
 * @desc    Delete shift (business owner only)
 * @access  Protected - Business only
 */
router.delete('/:id', authenticateToken, requireBusiness, ShiftController.deleteShift);

export default router;
