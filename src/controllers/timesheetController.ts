import { Request, Response, NextFunction } from 'express';
import { TimesheetService } from '../services/timesheetService';

export class TimesheetController {
  /**
   * Clock in (create timesheet)
   */
  static async clockIn(req: Request, res: Response, next: NextFunction) {
    try {
      const timesheet = await TimesheetService.clockIn(req.body);
      res.status(201).json(timesheet);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clock out
   */
  static async clockOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const timesheet = await TimesheetService.clockOut(id, req.body);
      res.json(timesheet);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get timesheet by booking ID
   */
  static async getByBookingId(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const timesheet = await TimesheetService.getByBookingId(bookingId);
      res.json(timesheet);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get worker timesheets
   */
  static async getWorkerTimesheets(req: Request, res: Response, next: NextFunction) {
    try {
      const { workerId } = req.params;
      const timesheets = await TimesheetService.getWorkerTimesheets(workerId);
      res.json(timesheets);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get business timesheets
   */
  static async getBusinessTimesheets(req: Request, res: Response, next: NextFunction) {
    try {
      const { businessId } = req.params;
      const timesheets = await TimesheetService.getBusinessTimesheets(businessId);
      res.json(timesheets);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending timesheets for approval
   */
  static async getPendingTimesheets(req: Request, res: Response, next: NextFunction) {
    try {
      const { businessId } = req.params;
      const timesheets = await TimesheetService.getPendingTimesheets(businessId);
      res.json(timesheets);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve timesheet
   */
  static async approveTimesheet(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { approved_by } = req.body;
      const timesheet = await TimesheetService.approveTimesheet(id, approved_by);
      res.json(timesheet);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject timesheet
   */
  static async rejectTimesheet(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const timesheet = await TimesheetService.rejectTimesheet(id, reason);
      res.json(timesheet);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get worker earnings
   */
  static async getWorkerEarnings(req: Request, res: Response, next: NextFunction) {
    try {
      const { workerId } = req.params;
      const earnings = await TimesheetService.getWorkerEarnings(workerId);
      res.json(earnings);
    } catch (error) {
      next(error);
    }
  }
}
