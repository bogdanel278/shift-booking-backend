import { 
  BookingModel, 
  CreateBookingInput, 
  Booking, 
  BookingStatus,
  BookingWithDetails 
} from '../models/bookingModel';
import { UserModel } from '../models/userModel';
import { ShiftModel } from '../models/shiftModel';
import { RightToWorkModel } from '../models/rightToWorkModel';

export class BookingService {
  /**
   * Create a new booking
   */
  static async createBooking(input: CreateBookingInput): Promise<Booking> {
    // Validate worker exists and has correct role
    const worker = await UserModel.findById(input.worker_id);
    
    if (!worker) {
      throw new Error('Worker not found');
    }

    if (worker.role !== 'worker') {
      throw new Error('Only workers can create bookings');
    }

    // CRITICAL: Verify worker has approved right-to-work verification
    const hasApprovedRTW = await RightToWorkModel.hasApprovedVerification(input.worker_id);
    
    if (!hasApprovedRTW) {
      throw new Error('You must have an approved right-to-work verification before booking shifts. Please submit your verification documents.');
    }

    // Validate shift exists
    const shift = await ShiftModel.findById(input.shift_id);
    
    if (!shift) {
      throw new Error('Shift not found');
    }

    // Check if shift is cancelled
    if (shift.status === 'cancelled') {
      throw new Error('Cannot book a cancelled shift');
    }

    // Check if shift is already filled
    if (shift.status === 'filled') {
      throw new Error('This shift is already filled');
    }

    // Check if shift is in the future
    if (new Date(shift.start_time) < new Date()) {
      throw new Error('Cannot book a shift that has already started');
    }

    // Check if worker already has a booking for this shift
    const existingBooking = await BookingModel.existsByWorkerAndShift(
      input.worker_id,
      input.shift_id
    );

    if (existingBooking) {
      throw new Error('You have already booked this shift');
    }

    // Create booking
    return await BookingModel.create(input);
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(id: string): Promise<Booking> {
    const booking = await BookingModel.findById(id);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  /**
   * Get all bookings
   */
  static async getAllBookings(): Promise<Booking[]> {
    return await BookingModel.findAll();
  }

  /**
   * Get bookings by worker ID
   */
  static async getBookingsByWorkerId(workerId: string): Promise<BookingWithDetails[]> {
    // Validate worker exists
    const worker = await UserModel.findById(workerId);
    
    if (!worker) {
      throw new Error('Worker not found');
    }

    if (worker.role !== 'worker') {
      throw new Error('User is not a worker');
    }

    return await BookingModel.findByWorkerId(workerId);
  }

  /**
   * Get bookings by shift ID
   */
  static async getBookingsByShiftId(shiftId: string, businessId?: string): Promise<BookingWithDetails[]> {
    // Validate shift exists
    const shift = await ShiftModel.findById(shiftId);
    
    if (!shift) {
      throw new Error('Shift not found');
    }

    // Verify ownership if businessId provided
    if (businessId && shift.business_id !== businessId) {
      throw new Error('Not authorized to view bookings for this shift');
    }

    return await BookingModel.findByShiftId(shiftId);
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(
    id: string, 
    status: BookingStatus,
    userId: string
  ): Promise<Booking> {
    // Validate status
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      throw new Error('Invalid status');
    }

    // Check if booking exists
    const booking = await BookingModel.findById(id);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Validate status transitions (state machine)
    const currentStatus = booking.status;
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['cancelled', 'completed'],
      'cancelled': [], // Cannot transition from cancelled
      'completed': []  // Cannot transition from completed
    };

    if (!validTransitions[currentStatus].includes(status)) {
      throw new Error(`Cannot change booking status from '${currentStatus}' to '${status}'`);
    }

    // Get user and shift to verify permissions
    const user = await UserModel.findById(userId);
    const shift = await ShiftModel.findById(booking.shift_id);

    if (!user || !shift) {
      throw new Error('Invalid booking data');
    }

    // Verify authorization
    // Workers can cancel their own bookings
    // Businesses can confirm or cancel bookings for their shifts
    if (user.role === 'worker' && booking.worker_id !== userId) {
      throw new Error('Not authorized to modify this booking');
    }

    if (user.role === 'business' && shift.business_id !== userId) {
      throw new Error('Not authorized to modify this booking');
    }

    // Only businesses can confirm bookings
    if (status === 'confirmed' && user.role !== 'business') {
      throw new Error('Only businesses can confirm bookings');
    }

    // If confirming a booking, check shift capacity
    if (status === 'confirmed' && shift.max_workers) {
      const confirmedCount = await BookingModel.countConfirmedByShift(booking.shift_id);
      
      if (confirmedCount >= shift.max_workers) {
        throw new Error(`This shift has reached its maximum capacity of ${shift.max_workers} workers`);
      }
    }

    // Update status
    const updated = await BookingModel.updateStatus(id, status);
    
    if (!updated) {
      throw new Error('Failed to update booking');
    }

    return updated;
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(id: string, userId: string): Promise<void> {
    // Check if booking exists
    const booking = await BookingModel.findById(id);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Get user and shift to verify permissions
    const user = await UserModel.findById(userId);
    const shift = await ShiftModel.findById(booking.shift_id);

    if (!user || !shift) {
      throw new Error('Invalid booking data');
    }

    // Verify authorization
    const isWorkerOwner = user.role === 'worker' && booking.worker_id === userId;
    const isBusinessOwner = user.role === 'business' && shift.business_id === userId;

    if (!isWorkerOwner && !isBusinessOwner) {
      throw new Error('Not authorized to cancel this booking');
    }

    const deleted = await BookingModel.delete(id);
    
    if (!deleted) {
      throw new Error('Failed to cancel booking');
    }
  }
}
