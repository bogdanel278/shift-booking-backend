import { Router } from 'express';
import { RightToWorkController } from '../controllers/rightToWorkController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireWorker } from '../middleware/roleMiddleware';

const router = Router();

// Worker endpoints (requires authentication + worker role)
router.post(
  '/submit',
  authenticateToken,
  requireWorker,
  RightToWorkController.submitVerification
);

router.get(
  '/status',
  authenticateToken,
  requireWorker,
  RightToWorkController.getStatus
);

// Admin endpoints (requires authentication)
// TODO: Add requireAdmin middleware when admin role is implemented
router.get(
  '/admin/pending',
  authenticateToken,
  RightToWorkController.getPending
);

router.patch(
  '/admin/:id/review',
  authenticateToken,
  RightToWorkController.reviewVerification
);

export default router;
