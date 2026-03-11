import { Router } from 'express';
import { TimesheetController } from '../controllers/timesheetController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireWorker, requireBusiness } from '../middleware/roleMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Clock in (create timesheet) - Worker only
router.post('/clock-in', requireWorker, TimesheetController.clockIn);

// Clock out - Worker only
router.post('/:id/clock-out', requireWorker, TimesheetController.clockOut);

// Get timesheet by booking ID - Authenticated users
router.get('/booking/:bookingId', TimesheetController.getByBookingId);

// Get worker timesheets - Worker only (uses req.user.id)
router.get('/my-timesheets', requireWorker, TimesheetController.getMyTimesheets);

// Get worker earnings - Worker only (uses req.user.id)
router.get('/my-earnings', requireWorker, TimesheetController.getMyEarnings);

// Get business timesheets - Business only (uses req.user.id)
router.get('/business-timesheets', requireBusiness, TimesheetController.getBusinessTimesheets);

// Get pending timesheets for approval - Business only (uses req.user.id)
router.get('/pending', requireBusiness, TimesheetController.getPendingTimesheets);

// Approve timesheet - Business only
router.post('/:id/approve', requireBusiness, TimesheetController.approveTimesheet);

// Reject timesheet - Business only
router.post('/:id/reject', requireBusiness, TimesheetController.rejectTimesheet);

export default router;
