import { Request, Response, NextFunction } from 'express';
import { ShiftService } from '../services/shiftService';

export class ShiftController {
  /**
   * Create a new shift
   * POST /api/shifts
   */
  static async createShift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { business_id, title, location, start_time, end_time, pay_rate } = req.body;

      const shift = await ShiftService.createShift({
        business_id,
        title,
        location,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        pay_rate: parseFloat(pay_rate)
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
      const { id } = req.params;
      const { business_id, title, location, start_time, end_time, pay_rate } = req.body;

      if (!business_id) {
        throw new Error('business_id is required for authorization');
      }

      const updateData: any = {};
      if (title) updateData.title = title;
      if (location) updateData.location = location;
      if (start_time) updateData.start_time = new Date(start_time);
      if (end_time) updateData.end_time = new Date(end_time);
      if (pay_rate) updateData.pay_rate = parseFloat(pay_rate);

      const shift = await ShiftService.updateShift(id, business_id, updateData);

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
      const { id } = req.params;
      const { business_id } = req.body;

      if (!business_id) {
        throw new Error('business_id is required for authorization');
      }

      await ShiftService.deleteShift(id, business_id);

      res.status(200).json({
        success: true,
        message: 'Shift deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
