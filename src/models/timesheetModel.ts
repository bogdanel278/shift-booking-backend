import { pool } from '../config/database';

export type TimesheetStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface Timesheet {
  id: string;
  booking_id: string;
  worker_id: string;
  business_id: string;
  clock_in_time: Date;
  clock_out_time: Date | null;
  break_duration: number | null; // in minutes
  total_hours: number | null;
  hourly_rate: number;
  total_amount: number | null;
  status: TimesheetStatus;
  notes: string | null;
  approved_by: string | null;
  approved_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateTimesheetInput {
  booking_id: string;
  worker_id: string;
  business_id: string;
  clock_in_time: Date;
  hourly_rate: number;
  notes?: string;
}

export interface ClockOutInput {
  clock_out_time: Date;
  break_duration?: number;
  notes?: string;
}

export class TimesheetModel {
  /**
   * Create a new timesheet (clock in)
   */
  static async create(input: CreateTimesheetInput): Promise<Timesheet> {
    const { booking_id, worker_id, business_id, clock_in_time, hourly_rate, notes } = input;
    
    const query = `
      INSERT INTO timesheets (
        booking_id, worker_id, business_id, clock_in_time, hourly_rate, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      booking_id,
      worker_id,
      business_id,
      clock_in_time,
      hourly_rate,
      notes || null
    ]);
    
    return result.rows[0];
  }

  /**
   * Clock out and calculate totals
   */
  static async clockOut(id: string, input: ClockOutInput): Promise<Timesheet | null> {
    const { clock_out_time, break_duration = 0, notes } = input;
    
    const query = `
      UPDATE timesheets 
      SET 
        clock_out_time = $1,
        break_duration = $2,
        total_hours = EXTRACT(EPOCH FROM ($1 - clock_in_time)) / 3600 - ($2::numeric / 60),
        total_amount = (EXTRACT(EPOCH FROM ($1 - clock_in_time)) / 3600 - ($2::numeric / 60)) * hourly_rate,
        notes = COALESCE($3, notes),
        updated_at = NOW()
      WHERE id = $4 AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await pool.query(query, [clock_out_time, break_duration, notes, id]);
    return result.rows[0] || null;
  }

  /**
   * Find timesheet by ID (excluding soft-deleted)
   */
  static async findById(id: string): Promise<Timesheet | null> {
    const query = 'SELECT * FROM timesheets WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find timesheet by booking ID
   */
  static async findByBookingId(bookingId: string): Promise<Timesheet | null> {
    const query = 'SELECT * FROM timesheets WHERE booking_id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [bookingId]);
    return result.rows[0] || null;
  }

  /**
   * Get all timesheets for a worker
   */
  static async findByWorkerId(workerId: string): Promise<Timesheet[]> {
    const query = `
      SELECT * FROM timesheets 
      WHERE worker_id = $1 AND deleted_at IS NULL
      ORDER BY clock_in_time DESC
    `;
    const result = await pool.query(query, [workerId]);
    return result.rows;
  }

  /**
   * Get all timesheets for a business
   */
  static async findByBusinessId(businessId: string): Promise<Timesheet[]> {
    const query = `
      SELECT * FROM timesheets 
      WHERE business_id = $1 AND deleted_at IS NULL
      ORDER BY clock_in_time DESC
    `;
    const result = await pool.query(query, [businessId]);
    return result.rows;
  }

  /**
   * Get pending timesheets for approval
   */
  static async findPendingByBusinessId(businessId: string): Promise<Timesheet[]> {
    const query = `
      SELECT * FROM timesheets 
      WHERE business_id = $1 AND status = 'pending' AND deleted_at IS NULL
      ORDER BY clock_in_time DESC
    `;
    const result = await pool.query(query, [businessId]);
    return result.rows;
  }

  /**
   * Approve timesheet
   */
  static async approve(id: string, approvedBy: string): Promise<Timesheet | null> {
    const query = `
      UPDATE timesheets 
      SET status = 'approved', approved_by = $1, approved_at = NOW(), updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [approvedBy, id]);
    return result.rows[0] || null;
  }

  /**
   * Reject timesheet
   */
  static async reject(id: string, notes: string): Promise<Timesheet | null> {
    const query = `
      UPDATE timesheets 
      SET status = 'rejected', notes = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [notes, id]);
    return result.rows[0] || null;
  }

  /**
   * Mark timesheet as paid
   */
  static async markAsPaid(id: string): Promise<Timesheet | null> {
    const query = `
      UPDATE timesheets 
      SET status = 'paid', updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get total earnings for a worker
   */
  static async getTotalEarnings(workerId: string): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM timesheets 
      WHERE worker_id = $1 AND status = 'paid' AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [workerId]);
    return parseFloat(result.rows[0].total);
  }

  /**
   * Soft delete timesheet
   */
  static async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE timesheets 
      SET deleted_at = NOW() 
      WHERE id = $1 AND deleted_at IS NULL 
      RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
