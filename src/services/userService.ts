import { UserModel, CreateUserInput, User, UserRole } from '../models/userModel';

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(input: CreateUserInput): Promise<User> {
    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (!input.email || !this.isValidEmail(input.email)) {
      throw new Error('Valid email is required');
    }

    if (!input.role || !['worker', 'business'].includes(input.role)) {
      throw new Error('Role must be either "worker" or "business"');
    }

    // Check if email already exists
    const existingUser = await UserModel.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Create user
    return await UserModel.create(input);
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User> {
    const user = await UserModel.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<User[]> {
    return await UserModel.findAll();
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: UserRole): Promise<User[]> {
    if (!['worker', 'business'].includes(role)) {
      throw new Error('Invalid role');
    }

    return await UserModel.findByRole(role);
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<void> {
    const deleted = await UserModel.delete(id);
    
    if (!deleted) {
      throw new Error('User not found');
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
