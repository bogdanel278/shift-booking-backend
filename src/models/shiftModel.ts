import { pool } from '../config/database';

export interface Shift {
  id: string;
  business_id: string;
  title: string;
  location: string;
  start_time: Date;
  end_time: Date;
  pay_rate: number;
  created_at: Date;
}

export interface CreateShiftInput {
  business_id: string;
  title: string;
  location: string;
  start_time: Date;
  end_time: Date;
  pay_rate: number;
}

export interface UpdateShiftInput {
  title?: string;
  location?: string;
  start_time?: Date;
  end_time?: Date;
  pay_rate?: number;
}

export class ShiftModel {
  /**
   * Create a new shift
   */
  static async create(input: CreateShiftInput): Promise<Shift> {
    const { business_id, title, location, start_time, end_time, pay_rate } = input;
    
    const query = `
      INSERT INTO shifts (business_id, title, location, start_time, end_time, pay_rate)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      business_id,
      title,
      location,
      start_time,
      end_time,
      pay_rate
    ]);
    
    return result.rows[0];
  }

  /**
   * Find shift by ID
   */
  static async findById(id: string): Promise<Shift | null> {
    const query = 'SELECT * FROM shifts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all shifts
   */
  static async findAll(): Promise<Shift[]> {
    const query = 'SELECT * FROM shifts ORDER BY start_time ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get available shifts (future shifts)
   */
  static async findAvailable(): Promise<Shift[]> {
    const query = `
      SELECT * FROM shifts 
      WHERE start_time > NOW()
      ORDER BY start_time ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get shifts by business ID
   */
  static async findByBusinessId(businessId: string): Promise<Shift[]> {
    const query = `
      SELECT * FROM shifts 
      WHERE business_id = $1
      ORDER BY start_time DESC
    `;
    const result = await pool.query(query, [businessId]);
    return result.rows;
  }

  /**
   * Update shift by ID
   */
  static async update(id: string, input: UpdateShiftInput): Promise<Shift | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(input.title);
    }
    if (input.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(input.location);
    }
    if (input.start_time !== undefined) {
      fields.push(`start_time = $${paramCount++}`);
      values.push(input.start_time);
    }
    if (input.end_time !== undefined) {
      fields.push(`end_time = $${paramCount++}`);
      values.push(input.end_time);
    }
    if (input.pay_rate !== undefined) {
      fields.push(`pay_rate = $${paramCount++}`);
      values.push(input.pay_rate);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE shifts 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete shift by ID
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM shifts WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
