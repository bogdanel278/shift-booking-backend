import { TimesheetModel, CreateTimesheetInput, ClockOutInput } from '../models/timesheetModel';
import { BookingModel } from '../models/bookingModel';

export class TimesheetService {
  /**
   * Create a new timesheet (clock in)
   */
  static async clockIn(input: CreateTimesheetInput) {
    // Verify booking exists and is confirmed
    const booking = await BookingModel.findById(input.booking_id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    if (booking.status !== 'confirmed') {
      throw new Error('Booking must be confirmed to clock in');
    }

    // Check if timesheet already exists for this booking
    const existing = await TimesheetModel.findByBookingId(input.booking_id);
    if (existing) {
      throw new Error('Timesheet already exists for this booking');
    }

    // Validate hourly rate
    if (input.hourly_rate <= 0) {
      throw new Error('Hourly rate must be positive');
    }

    return await TimesheetModel.create(input);
  }

  /**
   * Clock out and calculate totals
   */
  static async clockOut(timesheetId: string, input: ClockOutInput) {
    const timesheet = await TimesheetModel.findById(timesheetId);
    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    if (timesheet.clock_out_time) {
      throw new Error('Already clocked out');
    }

    // Validate clock out time is after clock in
    if (new Date(input.clock_out_time) <= new Date(timesheet.clock_in_time)) {
      throw new Error('Clock out time must be after clock in time');
    }

    return await TimesheetModel.clockOut(timesheetId, input);
  }

  /**
   * Get timesheet by booking ID
   */
  static async getByBookingId(bookingId: string) {
    const timesheet = await TimesheetModel.findByBookingId(bookingId);
    if (!timesheet) {
      throw new Error('Timesheet not found');
    }
    return timesheet;
  }

  /**
   * Get worker timesheets
   */
  static async getWorkerTimesheets(workerId: string) {
    return await TimesheetModel.findByWorkerId(workerId);
  }

  /**
   * Get business timesheets
   */
  static async getBusinessTimesheets(businessId: string) {
    return await TimesheetModel.findByBusinessId(businessId);
  }

  /**
   * Get pending timesheets for approval
   */
  static async getPendingTimesheets(businessId: string) {
    return await TimesheetModel.findPendingByBusinessId(businessId);
  }

  /**
   * Approve timesheet
   */
  static async approveTimesheet(timesheetId: string, approvedBy: string) {
    const timesheet = await TimesheetModel.findById(timesheetId);
    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    if (timesheet.status !== 'pending') {
      throw new Error('Only pending timesheets can be approved');
    }

    if (!timesheet.clock_out_time) {
      throw new Error('Cannot approve timesheet without clock out time');
    }

    return await TimesheetModel.approve(timesheetId, approvedBy);
  }

  /**
   * Reject timesheet
   */
  static async rejectTimesheet(timesheetId: string, reason: string) {
    const timesheet = await TimesheetModel.findById(timesheetId);
    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    if (timesheet.status !== 'pending') {
      throw new Error('Only pending timesheets can be rejected');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    return await TimesheetModel.reject(timesheetId, reason);
  }

  /**
   * Get total earnings for a worker
   */
  static async getWorkerEarnings(workerId: string) {
    const total = await TimesheetModel.getTotalEarnings(workerId);
    return { worker_id: workerId, total_earnings: total };
  }
}
