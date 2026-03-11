import { Router } from 'express';
import { TimesheetController } from '../controllers/timesheetController';

const router = Router();

// Clock in (create timesheet)
router.post('/clock-in', TimesheetController.clockIn);

// Clock out
router.post('/:id/clock-out', TimesheetController.clockOut);

// Get timesheet by booking ID
router.get('/booking/:bookingId', TimesheetController.getByBookingId);

// Get worker timesheets
router.get('/worker/:workerId', TimesheetController.getWorkerTimesheets);

// Get worker earnings
router.get('/worker/:workerId/earnings', TimesheetController.getWorkerEarnings);

// Get business timesheets
router.get('/business/:businessId', TimesheetController.getBusinessTimesheets);

// Get pending timesheets for approval
router.get('/business/:businessId/pending', TimesheetController.getPendingTimesheets);

// Approve timesheet
router.post('/:id/approve', TimesheetController.approveTimesheet);

// Reject timesheet
router.post('/:id/reject', TimesheetController.rejectTimesheet);

export default router;
