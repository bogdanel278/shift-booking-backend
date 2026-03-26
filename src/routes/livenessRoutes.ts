import { Router } from 'express';
import { LivenessController } from '../controllers/livenessController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * Liveness verification routes
 * Handles mobile app liveness check flow
 */

// Create liveness session (requires authentication)
router.post(
  '/session',
  authenticateToken,
  LivenessController.createSession
);

// Process liveness callback (public endpoint for external service)
router.post(
  '/callback',
  LivenessController.processCallback
);

// Get liveness status (requires authentication)
router.get(
  '/status',
  authenticateToken,
  LivenessController.getStatus
);

export default router;
