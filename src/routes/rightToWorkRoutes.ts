import { Router } from 'express';
import { RightToWorkController } from '../controllers/rightToWorkController';
import { authenticateToken, requireWorker, requireAdmin } from '../middleware/authMiddleware';
import { validateRTWSubmission, validateUUID } from '../middleware/validationMiddleware';
import { handleValidationErrors } from '../middleware/handleValidationErrors';
import { uploadSingleDocument } from '../middleware/uploadMiddleware';

const router = Router();

// Worker endpoints (requires authentication + worker role)
router.post(
  '/submit',
  authenticateToken,
  requireWorker,
  validateRTWSubmission,
  handleValidationErrors,
  RightToWorkController.submitVerification
);

router.get(
  '/status',
  authenticateToken,
  requireWorker,
  RightToWorkController.getStatus
);

router.post(
  '/analyze',
  authenticateToken,
  requireWorker,
  uploadSingleDocument,
  RightToWorkController.analyzeDocument
);

// Admin endpoints (requires authentication + admin role)
router.get(
  '/admin/pending',
  authenticateToken,
  requireAdmin,
  RightToWorkController.getPending
);

router.patch(
  '/admin/:id/review',
  authenticateToken,
  requireAdmin,
  validateUUID('id'),
  handleValidationErrors,
  RightToWorkController.reviewVerification
);

export default router;
