import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  /**
   * Register a new worker
   * POST /api/auth/register/worker
   */
  static async registerWorker(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerWorker(req.body);
      res.status(201).json({
        success: true,
        message: 'Worker registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register a new business
   * POST /api/auth/register/business
   */
  static async registerBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerBusiness(req.body);
      res.status(201).json({
        success: true,
        message: 'Business registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await AuthService.getCurrentUser(req.user.userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
