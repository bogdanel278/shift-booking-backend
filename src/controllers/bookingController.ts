import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/bookingService';

export class BookingController {
  /**
   * Create a new booking
   * POST /api/bookings
   */
  static async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shift_id } = req.body;

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const booking = await BookingService.createBooking({
        shift_id,
        worker_id: req.user.userId
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
   * Get bookings by worker ID (authenticated worker's bookings)
   * GET /api/bookings/my-bookings
   */
  static async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const bookings = await BookingService.getBookingsByWorkerId(req.user.userId);

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
      const { status } = req.body;

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const booking = await BookingService.updateBookingStatus(id, status, req.user.userId);

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

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      await BookingService.cancelBooking(id, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
