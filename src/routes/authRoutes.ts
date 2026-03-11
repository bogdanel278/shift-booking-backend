import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Registration endpoints
router.post('/register/worker', AuthController.registerWorker);
router.post('/register/business', AuthController.registerBusiness);

// Login endpoint
router.post('/login', AuthController.login);

// Get current user (requires authentication)
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;
