import { Router } from 'express';
import { ShiftController } from '../controllers/shiftController';

const router = Router();

/**
 * @route   POST /api/shifts
 * @desc    Create a new shift (business only)
 * @access  Public (should be protected in production)
 */
router.post('/', ShiftController.createShift);

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
 * @access  Public (should be protected in production)
 */
router.put('/:id', ShiftController.updateShift);

/**
 * @route   DELETE /api/shifts/:id
 * @desc    Delete shift (business owner only)
 * @access  Public (should be protected in production)
 */
router.delete('/:id', ShiftController.deleteShift);

export default router;
