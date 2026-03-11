import { pool } from '../config/database';

export type UserRole = 'worker' | 'business';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(input: CreateUserInput): Promise<User> {
    const { name, email, role } = input;
    
    const query = `
      INSERT INTO users (name, email, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, email, role]);
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Get all users
   */
  static async findAll(): Promise<User[]> {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get users by role
   */
  static async findByRole(role: UserRole): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [role]);
    return result.rows;
  }

  /**
   * Delete user by ID
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
