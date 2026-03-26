import { Request, Response, NextFunction } from 'express';
import { ShiftService } from '../services/shiftService';

export class ShiftController {
  /**
   * Create a new shift
   * POST /api/shifts
   */
  static async createShift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { title, description, location, requirements, start_time, end_time, pay_rate, max_workers, category } = req.body;

      const shift = await ShiftService.createShift({
        business_id: req.user.userId,
        title,
        description,
        location,
        requirements,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        pay_rate: parseFloat(pay_rate),
        max_workers: max_workers ? parseInt(max_workers) : undefined,
        category
      });

      res.status(201).json({
        success: true,
        data: shift
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get shift by ID
   * GET /api/shifts/:id
   */
  static async getShiftById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const shift = await ShiftService.getShiftById(id);

      res.status(200).json({
        success: true,
        data: shift
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all shifts or available shifts
   * GET /api/shifts?available=true
   * GET /api/shifts?business_id=xxx
   */
  static async getAllShifts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { available, business_id } = req.query;

      let shifts;
      
      if (business_id) {
        shifts = await ShiftService.getShiftsByBusinessId(business_id as string);
      } else if (available === 'true') {
        shifts = await ShiftService.getAvailableShifts();
      } else {
        shifts = await ShiftService.getAllShifts();
      }

      res.status(200).json({
        success: true,
        data: shifts,
        count: shifts.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update shift
   * PUT /api/shifts/:id
   */
  static async updateShift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { title, description, location, requirements, start_time, end_time, pay_rate, max_workers, category, status } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (location !== undefined) updateData.location = location;
      if (requirements !== undefined) updateData.requirements = requirements;
      if (start_time !== undefined) updateData.start_time = new Date(start_time);
      if (end_time !== undefined) updateData.end_time = new Date(end_time);
      if (pay_rate !== undefined) updateData.pay_rate = parseFloat(pay_rate);
      if (max_workers !== undefined) updateData.max_workers = max_workers ? parseInt(max_workers) : null;
      if (category !== undefined) updateData.category = category;
      if (status !== undefined) updateData.status = status;

      const shift = await ShiftService.updateShift(id, req.user.userId, updateData);

      res.status(200).json({
        success: true,
        data: shift
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete shift
   * DELETE /api/shifts/:id
   */
  static async deleteShift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;

      await ShiftService.deleteShift(id, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Shift deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel shift
   * PATCH /api/shifts/:id/cancel
   */
  static async cancelShift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;

      const shift = await ShiftService.cancelShift(id, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Shift cancelled successfully',
        data: shift
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all bookings for a shift
   * GET /api/shifts/:id/bookings
   */
  static async getShiftBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;

      const { BookingService } = await import('../services/bookingService');
      const bookings = await BookingService.getBookingsByShiftId(id, req.user.userId);

      res.status(200).json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      next(error);
    }
  }
}
