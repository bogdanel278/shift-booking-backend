import { Router } from 'express';
import { WorkerProfileController } from '../controllers/workerProfileController';

const router = Router();

// Create worker profile
router.post('/', WorkerProfileController.createProfile);

// Get all worker profiles
router.get('/', WorkerProfileController.getAllProfiles);

// Search workers by skills
router.get('/search', WorkerProfileController.searchBySkills);

// Get top-rated workers
router.get('/top-rated', WorkerProfileController.getTopRated);

// Get worker profile by user ID
router.get('/:userId', WorkerProfileController.getProfileByUserId);

// Update worker profile
router.put('/:userId', WorkerProfileController.updateProfile);

// Delete worker profile
router.delete('/:userId', WorkerProfileController.deleteProfile);

export default router;
