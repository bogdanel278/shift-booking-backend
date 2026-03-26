import { pool } from '../config/database';

export type ShareStatus = 'verified' | 'not_verified';

export interface RightToWorkVerification {
  id: string;
  worker_id: string;
  employee_nr: string;
  name: string;
  share_status: ShareStatus;
  documents_provided_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRTWVerificationInput {
  worker_id: string;
  employee_nr: string;
  name: string;
  share_status?: ShareStatus;
  documents_provided_at?: Date;
}

export interface UpdateRTWVerificationInput {
  employee_nr?: string;
  name?: string;
  share_status?: ShareStatus;
  documents_provided_at?: Date;
}

export class RightToWorkModel {
  /**
   * Create a new right-to-work verification record
   */
  static async create(input: CreateRTWVerificationInput): Promise<RightToWorkVerification> {
    const query = `
      INSERT INTO right_to_work_verifications (
        worker_id, employee_nr, name, share_status, documents_provided_at
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      input.worker_id,
      input.employee_nr,
      input.name,
      input.share_status || 'not_verified',
      input.documents_provided_at || null,
    ]);

    return result.rows[0];
  }

  /**
   * Find verification by ID
   */
  static async findById(id: string): Promise<RightToWorkVerification | null> {
    const query = 'SELECT * FROM right_to_work_verifications WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find all verifications for a worker
   */
  static async findByWorkerId(workerId: string): Promise<RightToWorkVerification[]> {
    const query = `
      SELECT * FROM right_to_work_verifications 
      WHERE worker_id = $1 
      ORDER BY employee_nr ASC
    `;
    const result = await pool.query(query, [workerId]);
    return result.rows;
  }

  /**
   * Find verification by worker ID and employee number
   */
  static async findByWorkerAndEmployeeNr(
    workerId: string,
    employeeNr: string,
  ): Promise<RightToWorkVerification | null> {
    const query = `
      SELECT * FROM right_to_work_verifications 
      WHERE worker_id = $1 AND employee_nr = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [workerId, employeeNr]);
    return result.rows[0] || null;
  }

  /**
   * Get the next employee number for a worker (auto-increment logic)
   */
  static async getNextEmployeeNr(workerId: string): Promise<string> {
    const query = `
      SELECT COALESCE(MAX(CAST(employee_nr AS INTEGER)), 0) + 1 as next_nr
      FROM right_to_work_verifications 
      WHERE worker_id = $1
    `;
    const result = await pool.query(query, [workerId]);
    const nextNum = result.rows[0].next_nr;
    return String(nextNum).padStart(2, '0');
  }

  /**
   * Get all verified records for a worker
   */
  static async findVerifiedByWorkerId(workerId: string): Promise<RightToWorkVerification[]> {
    const query = `
      SELECT * FROM right_to_work_verifications 
      WHERE worker_id = $1 AND share_status = 'verified'
      ORDER BY employee_nr ASC
    `;
    const result = await pool.query(query, [workerId]);
    return result.rows;
  }

  /**
   * Check if worker has any verified records
   */
  static async hasVerifiedRecords(workerId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count 
      FROM right_to_work_verifications 
      WHERE worker_id = $1 AND share_status = 'verified'
    `;
    const result = await pool.query(query, [workerId]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Update verification record
   */
  static async update(
    id: string,
    updates: UpdateRTWVerificationInput,
  ): Promise<RightToWorkVerification | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.employee_nr !== undefined) {
      fields.push(`employee_nr = $${paramIndex}`);
      values.push(updates.employee_nr);
      paramIndex++;
    }

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }

    if (updates.share_status !== undefined) {
      fields.push(`share_status = $${paramIndex}`);
      values.push(updates.share_status);
      paramIndex++;
    }

    if (updates.documents_provided_at !== undefined) {
      fields.push(`documents_provided_at = $${paramIndex}`);
      values.push(updates.documents_provided_at);
      paramIndex++;
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE right_to_work_verifications 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a verification record
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM right_to_work_verifications WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all records for a worker
   */
  static async deleteAllByWorkerId(workerId: string): Promise<number> {
    const query = 'DELETE FROM right_to_work_verifications WHERE worker_id = $1';
    const result = await pool.query(query, [workerId]);
    return result.rowCount ? result.rowCount : 0;
  }
}
