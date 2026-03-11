import { pool } from '../config/database';

export type ShiftStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';

export interface Shift {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  location: string;
  requirements: string | null;
  start_time: Date;
  end_time: Date;
  pay_rate: number;
  max_workers: number | null;
  category: string | null;
  status: ShiftStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateShiftInput {
  business_id: string;
  title: string;
  description?: string;
  location: string;
  requirements?: string;
  start_time: Date;
  end_time: Date;
  pay_rate: number;
  max_workers?: number;
  category?: string;
  status?: ShiftStatus;
}

export interface UpdateShiftInput {
  title?: string;
  description?: string;
  location?: string;
  requirements?: string;
  start_time?: Date;
  end_time?: Date;
  pay_rate?: number;
  max_workers?: number;
  category?: string;
  status?: ShiftStatus;
}

export class ShiftModel {
  /**
   * Create a new shift
   */
  static async create(input: CreateShiftInput): Promise<Shift> {
    const { 
      business_id, title, description, location, requirements,
      start_time, end_time, pay_rate, max_workers, category, status = 'published'
    } = input;
    
    const query = `
      INSERT INTO shifts (
        business_id, title, description, location, requirements,
        start_time, end_time, pay_rate, max_workers, category, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      business_id,
      title,
      description || null,
      location,
      requirements || null,
      start_time,
      end_time,
      pay_rate,
      max_workers || null,
      category || null,
      status
    ]);
    
    return result.rows[0];
  }

  /**
   * Find shift by ID (excluding soft-deleted)
   */
  static async findById(id: string): Promise<Shift | null> {
    const query = 'SELECT * FROM shifts WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all shifts (excluding soft-deleted)
   */
  static async findAll(): Promise<Shift[]> {
    const query = 'SELECT * FROM shifts WHERE deleted_at IS NULL ORDER BY start_time ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get available shifts (future, published shifts with capacity)
   */
  static async findAvailable(): Promise<Shift[]> {
    const query = `
      SELECT s.*, 
        COALESCE(
          (SELECT COUNT(*) FROM bookings b 
           WHERE b.shift_id = s.id AND b.status IN ('pending', 'confirmed')
          ), 0
        ) as booked_count
      FROM shifts s
      WHERE s.start_time > NOW()
      AND s.status = 'published'
      AND s.deleted_at IS NULL
      AND (
        s.max_workers IS NULL 
        OR s.max_workers > (
          SELECT COUNT(*) FROM bookings b 
          WHERE b.shift_id = s.id AND b.status IN ('pending', 'confirmed')
        )
      )
      ORDER BY s.start_time ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get shifts by business ID (excluding soft-deleted)
   */
  static async findByBusinessId(businessId: string): Promise<Shift[]> {
    const query = `
      SELECT * FROM shifts 
      WHERE business_id = $1 AND deleted_at IS NULL
      ORDER BY start_time DESC
    `;
    const result = await pool.query(query, [businessId]);
    return result.rows;
  }

  /**
   * Search shifts by text
   */
  static async search(searchText: string): Promise<Shift[]> {
    const query = `
      SELECT * FROM shifts 
      WHERE deleted_at IS NULL
      AND (
        title ILIKE $1 
        OR description ILIKE $1 
        OR location ILIKE $1 
        OR category ILIKE $1
      )
      ORDER BY start_time ASC
    `;
    const result = await pool.query(query, [`%${searchText}%`]);
    return result.rows;
  }

  /**
   * Get shifts by category
   */
  static async findByCategory(category: string): Promise<Shift[]> {
    const query = `
      SELECT * FROM shifts 
      WHERE category = $1 AND deleted_at IS NULL
      ORDER BY start_time ASC
    `;
    const result = await pool.query(query, [category]);
    return result.rows;
  }

  /**
   * Check if shift has available capacity
   */
  static async hasCapacity(shiftId: string): Promise<boolean> {
    const query = `
      SELECT s.max_workers, COUNT(b.id) as booked_count
      FROM shifts s
      LEFT JOIN bookings b ON s.id = b.shift_id AND b.status IN ('pending', 'confirmed')
      WHERE s.id = $1 AND s.deleted_at IS NULL
      GROUP BY s.id, s.max_workers
    `;
    const result = await pool.query(query, [shiftId]);
    
    if (result.rows.length === 0) return false;
    
    const { max_workers, booked_count } = result.rows[0];
    if (max_workers === null) return true; // unlimited capacity
    
    return parseInt(booked_count) < max_workers;
  }

  /**
   * Update shift by ID
   */
  static async update(id: string, input: UpdateShiftInput): Promise<Shift | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE shifts 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Soft delete shift by ID
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'UPDATE shifts SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
