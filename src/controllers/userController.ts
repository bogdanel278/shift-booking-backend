import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  /**
   * Create a new user
   * POST /api/users
   */
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, role, password_hash, phone, timezone, profile_picture_url } = req.body;

      const user = await UserService.createUser({ 
        name, 
        email, 
        role, 
        password_hash,
        phone,
        timezone,
        profile_picture_url
      });

      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await UserService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users
   * GET /api/users
   */
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.query;

      let users;
      if (role && (role === 'worker' || role === 'business')) {
        users = await UserService.getUsersByRole(role);
      } else {
        users = await UserService.getAllUsers();
      }

      res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await UserService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
