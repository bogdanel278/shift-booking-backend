import { ShiftModel, CreateShiftInput, UpdateShiftInput, Shift } from '../models/shiftModel';
import { UserModel } from '../models/userModel';

export class ShiftService {
  /**
   * Create a new shift
   */
  static async createShift(input: CreateShiftInput): Promise<Shift> {
    // Validate business exists and has correct role
    const business = await UserModel.findById(input.business_id);
    
    if (!business) {
      throw new Error('Business not found');
    }

    if (business.role !== 'business') {
      throw new Error('Only businesses can create shifts');
    }

    // Validate input
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (!input.location || input.location.trim().length === 0) {
      throw new Error('Location is required');
    }

    if (!input.start_time || !input.end_time) {
      throw new Error('Start time and end time are required');
    }

    if (new Date(input.start_time) >= new Date(input.end_time)) {
      throw new Error('End time must be after start time');
    }

    if (new Date(input.start_time) < new Date()) {
      throw new Error('Start time must be in the future');
    }

    if (!input.pay_rate || input.pay_rate <= 0) {
      throw new Error('Pay rate must be greater than 0');
    }

    // Create shift
    return await ShiftModel.create(input);
  }

  /**
   * Get shift by ID
   */
  static async getShiftById(id: string): Promise<Shift> {
    const shift = await ShiftModel.findById(id);
    
    if (!shift) {
      throw new Error('Shift not found');
    }

    return shift;
  }

  /**
   * Get all shifts
   */
  static async getAllShifts(): Promise<Shift[]> {
    return await ShiftModel.findAll();
  }

  /**
   * Get available shifts (future shifts)
   */
  static async getAvailableShifts(): Promise<Shift[]> {
    return await ShiftModel.findAvailable();
  }

  /**
   * Get shifts by business ID
   */
  static async getShiftsByBusinessId(businessId: string): Promise<Shift[]> {
    // Validate business exists
    const business = await UserModel.findById(businessId);
    
    if (!business) {
      throw new Error('Business not found');
    }

    if (business.role !== 'business') {
      throw new Error('User is not a business');
    }

    return await ShiftModel.findByBusinessId(businessId);
  }

  /**
   * Update shift
   */
  static async updateShift(id: string, businessId: string, input: UpdateShiftInput): Promise<Shift> {
    // Check if shift exists
    const shift = await ShiftModel.findById(id);
    
    if (!shift) {
      throw new Error('Shift not found');
    }

    // Verify ownership
    if (shift.business_id !== businessId) {
      throw new Error('Not authorized to update this shift');
    }

    // Validate time constraints if provided
    if (input.start_time && input.end_time) {
      if (new Date(input.start_time) >= new Date(input.end_time)) {
        throw new Error('End time must be after start time');
      }
    }

    if (input.pay_rate !== undefined && input.pay_rate <= 0) {
      throw new Error('Pay rate must be greater than 0');
    }

    // Update shift
    const updated = await ShiftModel.update(id, input);
    
    if (!updated) {
      throw new Error('Failed to update shift');
    }

    return updated;
  }

  /**
   * Delete shift
   */
  static async deleteShift(id: string, businessId: string): Promise<void> {
    // Check if shift exists
    const shift = await ShiftModel.findById(id);
    
    if (!shift) {
      throw new Error('Shift not found');
    }

    // Verify ownership
    if (shift.business_id !== businessId) {
      throw new Error('Not authorized to delete this shift');
    }

    const deleted = await ShiftModel.delete(id);
    
    if (!deleted) {
      throw new Error('Failed to delete shift');
    }
  }

  /**
   * Cancel shift
   */
  static async cancelShift(id: string, businessId: string): Promise<Shift> {
    // Check if shift exists
    const shift = await ShiftModel.findById(id);
    
    if (!shift) {
      throw new Error('Shift not found');
    }

    // Verify ownership
    if (shift.business_id !== businessId) {
      throw new Error('Not authorized to cancel this shift');
    }

    // Check if shift is already cancelled
    if (shift.status === 'cancelled') {
      throw new Error('Shift is already cancelled');
    }

    // Update shift status to cancelled
    const cancelled = await ShiftModel.update(id, { status: 'cancelled' });
    
    if (!cancelled) {
      throw new Error('Failed to cancel shift');
    }

    return cancelled;
  }
}
