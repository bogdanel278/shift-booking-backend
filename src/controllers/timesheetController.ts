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
   * Get worker timesheets (my timesheets)
   */
  static async getMyTimesheets(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const timesheets = await TimesheetService.getWorkerTimesheets(req.user.userId);
      res.json(timesheets);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get business timesheets (my business timesheets)
   */
  static async getBusinessTimesheets(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const timesheets = await TimesheetService.getBusinessTimesheets(req.user.userId);
      res.json(timesheets);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending timesheets for approval (my business)
   */
  static async getPendingTimesheets(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const timesheets = await TimesheetService.getPendingTimesheets(req.user.userId);
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
      
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const timesheet = await TimesheetService.approveTimesheet(id, req.user.userId);
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
   * Get worker earnings (my earnings)
   */
  static async getMyEarnings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const earnings = await TimesheetService.getWorkerEarnings(req.user.userId);
      res.json(earnings);
    } catch (error) {
      next(error);
    }
  }
}
