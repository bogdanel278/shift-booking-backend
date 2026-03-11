import { Request, Response, NextFunction } from 'express';
import { RightToWorkService } from '../services/rightToWorkService';

const rtwService = new RightToWorkService();

export class RightToWorkController {
  /**
   * Submit right-to-work verification
   * POST /api/workers/right-to-work/submit
   */
  static async submitVerification(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Ensure worker is submitting for themselves
      const input = {
        ...req.body,
        worker_user_id: req.user.userId,
      };

      const verification = await rtwService.submitVerification(input);

      res.status(201).json({
        success: true,
        message: 'Right-to-work verification submitted successfully',
        data: verification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get worker's verification status
   * GET /api/workers/right-to-work/status
   */
  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const status = await rtwService.getWorkerStatus(req.user.userId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all pending verifications (admin only)
   * GET /api/admin/right-to-work/pending
   */
  static async getPending(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Add proper admin role check
      // For now, any authenticated user can access this
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const verifications = await rtwService.getPendingVerifications();

      res.status(200).json({
        success: true,
        data: verifications,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Review verification (admin only)
   * PATCH /api/admin/right-to-work/:id/review
   */
  static async reviewVerification(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const review = {
        ...req.body,
        checked_by_user_id: req.user.userId,
      };

      const verification = await rtwService.reviewVerification(id, review);

      res.status(200).json({
        success: true,
        message: 'Verification reviewed successfully',
        data: verification,
      });
    } catch (error) {
      next(error);
    }
  }
}
