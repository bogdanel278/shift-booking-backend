import { Router } from 'express';
import { WorkerProfileController } from '../controllers/workerProfileController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireWorker } from '../middleware/roleMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get my profile (authenticated worker)
router.get('/me', requireWorker, WorkerProfileController.getMyProfile);

// Update my profile (authenticated worker)
router.put('/me', requireWorker, WorkerProfileController.updateMyProfile);

// Public/business routes (for searching workers)
// Get all worker profiles
router.get('/', WorkerProfileController.getAllProfiles);

// Search workers by skills
router.get('/search', WorkerProfileController.searchBySkills);

// Get top-rated workers
router.get('/top-rated', WorkerProfileController.getTopRated);

// Get worker profile by user ID (public)
router.get('/:userId', WorkerProfileController.getProfileByUserId);

export default router;
