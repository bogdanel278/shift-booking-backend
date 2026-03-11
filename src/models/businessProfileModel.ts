import { pool } from '../config/database';

export interface BusinessProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_description: string | null;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  address: string | null;
  is_verified: boolean;
  verification_documents: string[] | null;
  rating: number | null;
  total_shifts_posted: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateBusinessProfileInput {
  user_id: string;
  company_name: string;
  company_description?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  address?: string;
  verification_documents?: string[];
}

export interface UpdateBusinessProfileInput {
  company_name?: string;
  company_description?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  address?: string;
  verification_documents?: string[];
}

export class BusinessProfileModel {
  /**
   * Create a new business profile
   */
  static async create(input: CreateBusinessProfileInput): Promise<BusinessProfile> {
    const { 
      user_id, company_name, company_description, industry,
      company_size, website, address, verification_documents
    } = input;
    
    const query = `
      INSERT INTO business_profiles (
        user_id, company_name, company_description, industry,
        company_size, website, address, verification_documents
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      user_id,
      company_name,
      company_description || null,
      industry || null,
      company_size || null,
      website || null,
      address || null,
      verification_documents || null
    ]);
    
    return result.rows[0];
  }

  /**
   * Find business profile by ID (excluding soft-deleted)
   */
  static async findById(id: string): Promise<BusinessProfile | null> {
    const query = 'SELECT * FROM business_profiles WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find business profile by user ID (excluding soft-deleted)
   */
  static async findByUserId(userId: string): Promise<BusinessProfile | null> {
    const query = 'SELECT * FROM business_profiles WHERE user_id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Get all business profiles (excluding soft-deleted)
   */
  static async findAll(): Promise<BusinessProfile[]> {
    const query = `
      SELECT * FROM business_profiles 
      WHERE deleted_at IS NULL 
      ORDER BY is_verified DESC, rating DESC NULLS LAST, total_shifts_posted DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get verified businesses
   */
  static async findVerified(): Promise<BusinessProfile[]> {
    const query = `
      SELECT * FROM business_profiles 
      WHERE deleted_at IS NULL AND is_verified = true
      ORDER BY rating DESC NULLS LAST
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Search businesses by industry
   */
  static async findByIndustry(industry: string): Promise<BusinessProfile[]> {
    const query = `
      SELECT * FROM business_profiles 
      WHERE deleted_at IS NULL AND industry = $1
      ORDER BY rating DESC NULLS LAST
    `;
    const result = await pool.query(query, [industry]);
    return result.rows;
  }

  /**
   * Get top-rated businesses
   */
  static async findTopRated(limit: number = 10): Promise<BusinessProfile[]> {
    const query = `
      SELECT * FROM business_profiles 
      WHERE deleted_at IS NULL AND rating IS NOT NULL
      ORDER BY rating DESC, total_shifts_posted DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  /**
   * Update business profile
   */
  static async update(userId: string, input: UpdateBusinessProfileInput): Promise<BusinessProfile | null> {
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
      UPDATE business_profiles 
      SET ${fields.join(', ')}
      WHERE user_id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Update verification status
   */
  static async updateVerificationStatus(userId: string, isVerified: boolean): Promise<BusinessProfile | null> {
    const query = `
      UPDATE business_profiles 
      SET is_verified = $1, updated_at = NOW()
      WHERE user_id = $2 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [isVerified, userId]);
    return result.rows[0] || null;
  }

  /**
   * Increment shifts posted counter
   */
  static async incrementShiftsPosted(userId: string): Promise<void> {
    const query = `
      UPDATE business_profiles 
      SET total_shifts_posted = total_shifts_posted + 1, updated_at = NOW()
      WHERE user_id = $1 AND deleted_at IS NULL
    `;
    await pool.query(query, [userId]);
  }

  /**
   * Update business rating
   */
  static async updateRating(userId: string, newRating: number): Promise<BusinessProfile | null> {
    const query = `
      UPDATE business_profiles 
      SET rating = $1, updated_at = NOW()
      WHERE user_id = $2 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [newRating, userId]);
    return result.rows[0] || null;
  }

  /**
   * Soft delete business profile
   */
  static async delete(userId: string): Promise<boolean> {
    const query = `
      UPDATE business_profiles 
      SET deleted_at = NOW() 
      WHERE user_id = $1 AND deleted_at IS NULL 
      RETURNING id
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
