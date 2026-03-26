import { Router } from 'express';
import { RightToWorkController } from '../controllers/rightToWorkController';
import { authenticateToken, requireWorker } from '../middleware/authMiddleware';
import { validateUUID } from '../middleware/validationMiddleware';
import { handleValidationErrors } from '../middleware/handleValidationErrors';

const router = Router();

// Worker endpoints (requires authentication + worker role)

// Get all records
router.get(
  '/records',
  authenticateToken,
  requireWorker,
  RightToWorkController.getRecords
);

// Get verification status
router.get(
  '/status',
  authenticateToken,
  requireWorker,
  RightToWorkController.getStatus
);

// Create new record
router.post(
  '/records',
  authenticateToken,
  requireWorker,
  RightToWorkController.createRecord
);

// Get specific record
router.get(
  '/records/:id',
  authenticateToken,
  requireWorker,
  validateUUID('id'),
  handleValidationErrors,
  RightToWorkController.getRecord
);

// Update record
router.patch(
  '/records/:id',
  authenticateToken,
  requireWorker,
  validateUUID('id'),
  handleValidationErrors,
  RightToWorkController.updateRecord
);

// Mark documents as provided
router.patch(
  '/records/:id/documents-provided',
  authenticateToken,
  requireWorker,
  validateUUID('id'),
  handleValidationErrors,
  RightToWorkController.markDocumentsProvided
);

// Delete record
router.delete(
  '/records/:id',
  authenticateToken,
  requireWorker,
  validateUUID('id'),
  handleValidationErrors,
  RightToWorkController.deleteRecord
);

export default router;
