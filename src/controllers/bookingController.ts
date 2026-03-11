import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/bookingService';

export class BookingController {
  /**
   * Create a new booking
   * POST /api/bookings
   */
  static async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shift_id, worker_id } = req.body;

      const booking = await BookingService.createBooking({
        shift_id,
        worker_id
      });

      res.status(201).json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get booking by ID
   * GET /api/bookings/:id
   */
  static async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await BookingService.getBookingById(id);

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bookings by worker ID
   * GET /api/bookings/worker/:workerId
   */
  static async getBookingsByWorkerId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workerId } = req.params;

      const bookings = await BookingService.getBookingsByWorkerId(workerId);

      res.status(200).json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bookings by shift ID
   * GET /api/bookings/shift/:shiftId
   */
  static async getBookingsByShiftId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shiftId } = req.params;

      const bookings = await BookingService.getBookingsByShiftId(shiftId);

      res.status(200).json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update booking status
   * PUT /api/bookings/:id
   */
  static async updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, user_id } = req.body;

      if (!user_id) {
        throw new Error('user_id is required for authorization');
      }

      const booking = await BookingService.updateBookingStatus(id, status, user_id);

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel/delete booking
   * DELETE /api/bookings/:id
   */
  static async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { user_id } = req.body;

      if (!user_id) {
        throw new Error('user_id is required for authorization');
      }

      await BookingService.cancelBooking(id, user_id);

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
