import { pool } from '../config/database';

export interface WorkerProfile {
  id: string;
  user_id: string;
  bio: string | null;
  skills: string[] | null;
  hourly_rate: number | null;
  years_of_experience: number | null;
  certifications: string[] | null;
  availability: any | null; // JSONB field
  rating: number | null;
  total_jobs_completed: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateWorkerProfileInput {
  user_id: string;
  bio?: string;
  skills?: string[];
  hourly_rate?: number;
  years_of_experience?: number;
  certifications?: string[];
  availability?: any;
}

export interface UpdateWorkerProfileInput {
  bio?: string;
  skills?: string[];
  hourly_rate?: number;
  years_of_experience?: number;
  certifications?: string[];
  availability?: any;
}

export class WorkerProfileModel {
  /**
   * Create a new worker profile
   */
  static async create(input: CreateWorkerProfileInput): Promise<WorkerProfile> {
    const { 
      user_id, bio, skills, hourly_rate, 
      years_of_experience, certifications, availability 
    } = input;
    
    const query = `
      INSERT INTO worker_profiles (
        user_id, bio, skills, hourly_rate, 
        years_of_experience, certifications, availability
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      user_id,
      bio || null,
      skills || null,
      hourly_rate || null,
      years_of_experience || null,
      certifications || null,
      availability || null
    ]);
    
    return result.rows[0];
  }

  /**
   * Find worker profile by ID (excluding soft-deleted)
   */
  static async findById(id: string): Promise<WorkerProfile | null> {
    const query = 'SELECT * FROM worker_profiles WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find worker profile by user ID (excluding soft-deleted)
   */
  static async findByUserId(userId: string): Promise<WorkerProfile | null> {
    const query = 'SELECT * FROM worker_profiles WHERE user_id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Get all worker profiles (excluding soft-deleted)
   */
  static async findAll(): Promise<WorkerProfile[]> {
    const query = `
      SELECT * FROM worker_profiles 
      WHERE deleted_at IS NULL 
      ORDER BY rating DESC NULLS LAST, total_jobs_completed DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Search workers by skills
   */
  static async searchBySkills(skills: string[]): Promise<WorkerProfile[]> {
    const query = `
      SELECT * FROM worker_profiles 
      WHERE deleted_at IS NULL 
      AND skills && $1
      ORDER BY rating DESC NULLS LAST
    `;
    const result = await pool.query(query, [skills]);
    return result.rows;
  }

  /**
   * Get top-rated workers
   */
  static async findTopRated(limit: number = 10): Promise<WorkerProfile[]> {
    const query = `
      SELECT * FROM worker_profiles 
      WHERE deleted_at IS NULL 
      AND rating IS NOT NULL
      ORDER BY rating DESC, total_jobs_completed DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  /**
   * Update worker profile
   */
  static async update(userId: string, input: UpdateWorkerProfileInput): Promise<WorkerProfile | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE worker_profiles 
      SET ${fields.join(', ')}
      WHERE user_id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Increment jobs completed counter
   */
  static async incrementJobsCompleted(userId: string): Promise<void> {
    const query = `
      UPDATE worker_profiles 
      SET total_jobs_completed = total_jobs_completed + 1, updated_at = NOW()
      WHERE user_id = $1 AND deleted_at IS NULL
    `;
    await pool.query(query, [userId]);
  }

  /**
   * Update worker rating
   */
  static async updateRating(userId: string, newRating: number): Promise<WorkerProfile | null> {
    const query = `
      UPDATE worker_profiles 
      SET rating = $1, updated_at = NOW()
      WHERE user_id = $2 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [newRating, userId]);
    return result.rows[0] || null;
  }

  /**
   * Soft delete worker profile
   */
  static async delete(userId: string): Promise<boolean> {
    const query = `
      UPDATE worker_profiles 
      SET deleted_at = NOW() 
      WHERE user_id = $1 AND deleted_at IS NULL 
      RETURNING id
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
