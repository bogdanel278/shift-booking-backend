import { UserModel, CreateUserInput } from '../models/userModel';
import { WorkerProfileModel } from '../models/workerProfileModel';
import { BusinessProfileModel } from '../models/businessProfileModel';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { generateToken } from '../utils/jwt';
import { pool } from '../config/database';

export interface RegisterWorkerInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  date_of_birth?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  postcode?: string;
  nationality?: string;
}

export interface RegisterBusinessInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  company_name: string;
  company_number?: string;
  business_type?: string;
  contact_name?: string;
  business_address?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new worker
   */
  static async registerWorker(input: RegisterWorkerInput) {
    // Validate required fields
    if (!input.first_name || !input.last_name || !input.email || !input.password) {
      throw new Error('Missing required fields: first_name, last_name, email, password');
    }

    // Check if email already exists
    const existingUser = await UserModel.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Validate password strength
    if (input.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash password
    const password_hash = await hashPassword(input.password);

    // Create user
    const name = `${input.first_name} ${input.last_name}`;
    const userInput: CreateUserInput = {
      name,
      email: input.email.toLowerCase(),
      password_hash,
      phone: input.phone,
      role: 'worker',
    };

    const user = await UserModel.create(userInput);

    // Create worker profile with additional fields
    await WorkerProfileModel.create({
      user_id: user.id,
      // Additional fields will be added via profile update
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Register a new business
   */
  static async registerBusiness(input: RegisterBusinessInput) {
    // Validate required fields
    if (!input.first_name || !input.last_name || !input.email || !input.password || !input.company_name) {
      throw new Error('Missing required fields: first_name, last_name, email, password, company_name');
    }

    // Check if email already exists
    const existingUser = await UserModel.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Validate password strength
    if (input.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash password
    const password_hash = await hashPassword(input.password);

    // Create user
    const name = `${input.first_name} ${input.last_name}`;
    const userInput: CreateUserInput = {
      name,
      email: input.email.toLowerCase(),
      password_hash,
      phone: input.phone,
      role: 'business',
    };

    const user = await UserModel.create(userInput);

    // Create business profile with correct field mapping
    await BusinessProfileModel.create({
      user_id: user.id,
      company_name: input.company_name,
      tax_id: input.company_number, // Maps company_number to tax_id
      business_type: input.business_type,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Login a user
   */
  static async login(input: LoginInput) {
    // Validate required fields
    if (!input.email || !input.password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await UserModel.findByEmail(input.email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is inactive. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(input.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has verified right to work status
    let rtw_verified = false;
    if (user.role === 'worker') {
      const rtwQuery = await pool.query(
        `SELECT share_status FROM right_to_work_verifications 
         WHERE worker_id = $1 AND share_status = 'verified'
         LIMIT 1`,
        [userId]
      );
      rtw_verified = rtwQuery.rows.length > 0;
    }

    // Check if user has bank account (for now, check if they have any payout records)
    const bankQuery = await pool.query(
      `SELECT id FROM payouts WHERE worker_id = $1 LIMIT 1`,
      [userId]
    );
    const has_bank_account = bankQuery.rows.length > 0;

    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;
    
    return {
      ...userWithoutPassword,
      rtw_verified,
      has_bank_account,
    };
  }

  /**
   * Update user profile picture
   */
  static async updateProfilePicture(userId: string, profilePictureUrl: string) {
    const query = `
      UPDATE users 
      SET profile_picture_url = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [profilePictureUrl, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];
    const { password_hash: _, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }
}
