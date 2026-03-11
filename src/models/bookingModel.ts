import { pool } from '../config/database';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  shift_id: string;
  worker_id: string;
  status: BookingStatus;
  created_at: Date;
}

export interface CreateBookingInput {
  shift_id: string;
  worker_id: string;
  status?: BookingStatus;
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
    const { shift_id, worker_id, status = 'pending' } = input;
    
    const query = `
      INSERT INTO bookings (shift_id, worker_id, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [shift_id, worker_id, status]);
    return result.rows[0];
  }

  /**
   * Find booking by ID
   */
  static async findById(id: string): Promise<Booking | null> {
    const query = 'SELECT * FROM bookings WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all bookings
   */
  static async findAll(): Promise<Booking[]> {
    const query = 'SELECT * FROM bookings ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get bookings by worker ID with shift details
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
      WHERE b.worker_id = $1
      ORDER BY s.start_time DESC
    `;
    
    const result = await pool.query(query, [workerId]);
    return result.rows;
  }

  /**
   * Get bookings by shift ID with worker details
   */
  static async findByShiftId(shiftId: string): Promise<BookingWithDetails[]> {
    const query = `
      SELECT 
        b.*,
        u.name as worker_name,
        u.email as worker_email
      FROM bookings b
      JOIN users u ON b.worker_id = u.id
      WHERE b.shift_id = $1
      ORDER BY b.created_at DESC
    `;
    
    const result = await pool.query(query, [shiftId]);
    return result.rows;
  }

  /**
   * Update booking status
   */
  static async updateStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    const query = `
      UPDATE bookings 
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    return result.rows[0] || null;
  }

  /**
   * Check if booking exists for a worker and shift
   */
  static async existsByWorkerAndShift(workerId: string, shiftId: string): Promise<boolean> {
    const query = `
      SELECT id FROM bookings 
      WHERE worker_id = $1 AND shift_id = $2
    `;
    
    const result = await pool.query(query, [workerId, shiftId]);
    return result.rows.length > 0;
  }

  /**
   * Delete booking by ID
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM bookings WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
