import { pool } from '../config/database';

export type VerificationMethod = 'passport' | 'visa' | 'share_code';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'failed';

export interface RightToWorkVerification {
  id: string;
  worker_user_id: string;
  verification_method: VerificationMethod;
  status: VerificationStatus;
  provider_name: string | null;
  provider_reference: string | null;
  share_code: string | null;
  passport_number: string | null;
  passport_country: string | null;
  passport_expiry_date: Date | null;
  visa_type: string | null;
  visa_expiry_date: Date | null;
  visa_reference: string | null;
  document_file_url: string | null;
  submitted_at: Date;
  checked_at: Date | null;
  checked_by_user_id: string | null;
  notes: string | null;
  raw_provider_response_json: any | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRTWVerificationInput {
  worker_user_id: string;
  verification_method: VerificationMethod;
  share_code?: string;
  passport_number?: string;
  passport_country?: string;
  passport_expiry_date?: Date;
  visa_type?: string;
  visa_expiry_date?: Date;
  visa_reference?: string;
  document_file_url?: string;
}

export interface UpdateRTWVerificationInput {
  status?: VerificationStatus;
  checked_by_user_id?: string;
  notes?: string;
  provider_name?: string;
  provider_reference?: string;
  raw_provider_response_json?: any;
}

export class RightToWorkModel {
  /**
   * Create a new right-to-work verification
   */
  static async create(input: CreateRTWVerificationInput): Promise<RightToWorkVerification> {
    const query = `
      INSERT INTO right_to_work_verifications (
        worker_user_id, verification_method, share_code, passport_number,
        passport_country, passport_expiry_date, visa_type, visa_expiry_date,
        visa_reference, document_file_url, status, submitted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      input.worker_user_id,
      input.verification_method,
      input.share_code || null,
      input.passport_number || null,
      input.passport_country || null,
      input.passport_expiry_date || null,
      input.visa_type || null,
      input.visa_expiry_date || null,
      input.visa_reference || null,
      input.document_file_url || null,
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
   * Find verifications by worker user ID
   */
  static async findByWorkerId(workerId: string): Promise<RightToWorkVerification[]> {
    const query = `
      SELECT * FROM right_to_work_verifications 
      WHERE worker_user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [workerId]);
    return result.rows;
  }

  /**
   * Get latest verification for a worker
   */
  static async getLatestByWorkerId(workerId: string): Promise<RightToWorkVerification | null> {
    const query = `
      SELECT * FROM right_to_work_verifications 
      WHERE worker_user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [workerId]);
    return result.rows[0] || null;
  }

  /**
   * Find all pending verifications (for admin review)
   */
  static async findPending(): Promise<RightToWorkVerification[]> {
    const query = `
      SELECT rtw.*, u.name as worker_name, u.email as worker_email
      FROM right_to_work_verifications rtw
      JOIN users u ON u.id = rtw.worker_user_id
      WHERE rtw.status = 'pending'
      ORDER BY rtw.submitted_at ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Check if worker has pending verification
   */
  static async hasPendingVerification(workerId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count 
      FROM right_to_work_verifications 
      WHERE worker_user_id = $1 AND status = 'pending'
    `;
    const result = await pool.query(query, [workerId]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Update verification
   */
  static async update(
    id: string,
    updates: UpdateRTWVerificationInput
  ): Promise<RightToWorkVerification | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex}`);
      values.push(updates.status);
      paramIndex++;
    }

    if (updates.checked_by_user_id !== undefined) {
      fields.push(`checked_by_user_id = $${paramIndex}`);
      values.push(updates.checked_by_user_id);
      paramIndex++;
      
      fields.push(`checked_at = NOW()`);
    }

    if (updates.notes !== undefined) {
      fields.push(`notes = $${paramIndex}`);
      values.push(updates.notes);
      paramIndex++;
    }

    if (updates.provider_name !== undefined) {
      fields.push(`provider_name = $${paramIndex}`);
      values.push(updates.provider_name);
      paramIndex++;
    }

    if (updates.provider_reference !== undefined) {
      fields.push(`provider_reference = $${paramIndex}`);
      values.push(updates.provider_reference);
      paramIndex++;
    }

    if (updates.raw_provider_response_json !== undefined) {
      fields.push(`raw_provider_response_json = $${paramIndex}`);
      values.push(JSON.stringify(updates.raw_provider_response_json));
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
}
