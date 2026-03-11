import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimitMiddleware';
import { 
  validateWorkerRegistration,
  validateBusinessRegistration,
  validateLogin 
} from '../middleware/validationMiddleware';
import { handleValidationErrors } from '../middleware/handleValidationErrors';

const router = Router();

// Unified registration endpoint
router.post(
  '/register',
  authLimiter,
  AuthController.register
);

// Registration endpoints (with strict rate limiting)
router.post(
  '/register/worker',
  authLimiter,
  validateWorkerRegistration,
  handleValidationErrors,
  AuthController.registerWorker
);

router.post(
  '/register/business',
  authLimiter,
  validateBusinessRegistration,
  handleValidationErrors,
  AuthController.registerBusiness
);

// Login endpoint (with strict rate limiting)
router.post(
  '/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  AuthController.login
);

// Get current user (requires authentication)
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;
