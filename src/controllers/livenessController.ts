import { Request, Response, NextFunction } from 'express';
import { LivenessService } from '../services/livenessService';

/**
 * Liveness Verification Controller
 * Handles liveness check endpoints for mobile app
 */
export class LivenessController {
  /**
   * Create liveness session
   * POST /api/liveness/session
   */
  static async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { employee_nr, name, vendorData, callbackUrl } = req.body;

      // Validate employee_nr format if provided
      if (employee_nr && !/^\d{2,}$/.test(String(employee_nr))) {
        res.status(400).json({ 
          error: 'employee_nr must be a number with at least 2 digits (e.g., 01, 02)' 
        });
        return;
      }

      const session = await LivenessService.createSession(
        req.user.userId,
        employee_nr,
        name,
        vendorData,
        callbackUrl
      );

      res.status(201).json({
        success: true,
        message: 'Liveness session created',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process liveness callback
   * POST /api/liveness/callback
   */
  static async processCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { worker_id, status, session_id } = req.body;

      if (!worker_id || !status) {
        res.status(400).json({ 
          error: 'Missing required fields',
          required: ['worker_id', 'status']
        });
        return;
      }

      if (status !== 'success' && status !== 'failure') {
        res.status(400).json({ 
          error: 'Invalid status',
          valid_values: ['success', 'failure']
        });
        return;
      }

      const result = await LivenessService.processCallback(
        worker_id,
        status,
        session_id
      );

      res.status(200).json({
        success: true,
        message: `Liveness verification ${status === 'success' ? 'completed' : 'failed'}`,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * Get liveness status for authenticated worker
   * GET /api/liveness/status
   */
  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const status = await LivenessService.getStatus(req.user.userId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}
