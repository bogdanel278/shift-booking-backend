import { pool } from '../config/database';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  shift_id: string;
  worker_id: string;
  status: BookingStatus;
  notes: string | null;
  cancellation_reason: string | null;
  created_at: Date;
  updated_at: Date;
  confirmed_at: Date | null;
  cancelled_at: Date | null;
  deleted_at: Date | null;
}

export interface CreateBookingInput {
  shift_id: string;
  worker_id: string;
  status?: BookingStatus;
  notes?: string;
}

export interface BookingWithDetails extends Booking {
  shift_title?: string;
  shift_location?: string;
  shift_start_time?: Date;
  shift_end_time?: Date;
  shift_pay_rate?: number;
  worker_name?: string;
  worker_email?: string;
}

export class BookingModel {
  /**
   * Create a new booking
   */
  static async create(input: CreateBookingInput): Promise<Booking> {
    const { shift_id, worker_id, status = 'pending', notes } = input;
    
    const query = `
      INSERT INTO bookings (shift_id, worker_id, status, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [shift_id, worker_id, status, notes || null]);
    return result.rows[0];
  }

  /**
   * Find booking by ID (excluding soft-deleted)
   */
  static async findById(id: string): Promise<Booking | null> {
    const query = 'SELECT * FROM bookings WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all bookings (excluding soft-deleted)
   */
  static async findAll(): Promise<Booking[]> {
    const query = 'SELECT * FROM bookings WHERE deleted_at IS NULL ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get bookings by worker ID with shift details (excluding soft-deleted)
   */
  static async findByWorkerId(workerId: string): Promise<BookingWithDetails[]> {
    const query = `
      SELECT 
        b.*,
        s.title as shift_title,
        s.location as shift_location,
        s.start_time as shift_start_time,
        s.end_time as shift_end_time,
        s.pay_rate as shift_pay_rate
      FROM bookings b
      JOIN shifts s ON b.shift_id = s.id
      WHERE b.worker_id = $1 AND b.deleted_at IS NULL AND s.deleted_at IS NULL
      ORDER BY s.start_time DESC
    `;
    
    const result = await pool.query(query, [workerId]);
    return result.rows;
  }

  /**
   * Get bookings by shift ID with worker details (excluding soft-deleted)
   */
  static async findByShiftId(shiftId: string): Promise<BookingWithDetails[]> {
    const query = `
      SELECT 
        b.*,
        u.name as worker_name,
        u.email as worker_email
      FROM bookings b
      JOIN users u ON b.worker_id = u.id
      WHERE b.shift_id = $1 AND b.deleted_at IS NULL AND u.deleted_at IS NULL
      ORDER BY b.created_at DESC
    `;
    
    const result = await pool.query(query, [shiftId]);
    return result.rows;
  }

  /**
   * Update booking status
   */
  static async updateStatus(id: string, status: BookingStatus, cancellationReason?: string): Promise<Booking | null> {
    let query: string;
    let params: any[];

    if (status === 'confirmed') {
      query = `
        UPDATE bookings 
        SET status = $1, confirmed_at = NOW(), updated_at = NOW()
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *
      `;
      params = [status, id];
    } else if (status === 'cancelled') {
      query = `
        UPDATE bookings 
        SET status = $1, cancelled_at = NOW(), cancellation_reason = $2, updated_at = NOW()
        WHERE id = $3 AND deleted_at IS NULL
        RETURNING *
      `;
      params = [status, cancellationReason || null, id];
    } else {
      query = `
        UPDATE bookings 
        SET status = $1, updated_at = NOW()
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *
      `;
      params = [status, id];
    }
    
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Update booking notes
   */
  static async updateNotes(id: string, notes: string): Promise<Booking | null> {
    const query = `
      UPDATE bookings 
      SET notes = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await pool.query(query, [notes, id]);
    return result.rows[0] || null;
  }

  /**
   * Check if booking exists for a worker and shift (excluding soft-deleted and cancelled)
   */
  static async existsByWorkerAndShift(workerId: string, shiftId: string): Promise<boolean> {
    const query = `
      SELECT id FROM bookings 
      WHERE worker_id = $1 AND shift_id = $2 
      AND status NOT IN ('cancelled') 
      AND deleted_at IS NULL
    `;
    
    const result = await pool.query(query, [workerId, shiftId]);
    return result.rows.length > 0;
  }

  /**
   * Soft delete booking by ID
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'UPDATE bookings SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
