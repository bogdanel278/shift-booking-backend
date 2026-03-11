import { pool } from '../config/database';

export type UserRole = 'worker' | 'business' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  profile_picture_url: string | null;
  timezone: string | null;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
  deleted_at: Date | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  role: UserRole;
  timezone?: string;
  profile_picture_url?: string;
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(input: CreateUserInput): Promise<User> {
    const { name, email, password_hash, phone, role, timezone, profile_picture_url } = input;
    
    const query = `
      INSERT INTO users (name, email, password_hash, phone, role, timezone, profile_picture_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, 
      email, 
      password_hash, 
      phone || null, 
      role, 
      timezone || null, 
      profile_picture_url || null
    ]);
    return result.rows[0];
  }

  /**
   * Find user by ID (excluding soft-deleted)
   */
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find user by email (excluding soft-deleted)
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Get all users (excluding soft-deleted)
   */
  static async findAll(): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get users by role (excluding soft-deleted)
   */
  static async findByRole(role: UserRole): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE role = $1 AND deleted_at IS NULL ORDER BY created_at DESC';
    const result = await pool.query(query, [role]);
    return result.rows;
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(id: string): Promise<void> {
    const query = 'UPDATE users SET last_login_at = NOW() WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Update user verification status
   */
  static async updateVerificationStatus(id: string, isVerified: boolean): Promise<User | null> {
    const query = `
      UPDATE users 
      SET is_verified = $1, updated_at = NOW() 
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [isVerified, id]);
    return result.rows[0] || null;
  }

  /**
   * Update user profile
   */
  static async update(id: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Soft delete user by ID
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Hard delete user by ID (only for testing/admin purposes)
   */
  static async hardDelete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
