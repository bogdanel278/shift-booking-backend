import { Router } from 'express';
import { BusinessProfileController } from '../controllers/businessProfileController';

const router = Router();

// Create business profile
router.post('/', BusinessProfileController.createProfile);

// Get all business profiles
router.get('/', BusinessProfileController.getAllProfiles);

// Get verified businesses
router.get('/verified', BusinessProfileController.getVerified);

// Get top-rated businesses
router.get('/top-rated', BusinessProfileController.getTopRated);

// Get businesses by industry
router.get('/industry', BusinessProfileController.getByIndustry);

// Get business profile by user ID
router.get('/:userId', BusinessProfileController.getProfileByUserId);

// Update business profile
router.put('/:userId', BusinessProfileController.updateProfile);

// Delete business profile
router.delete('/:userId', BusinessProfileController.deleteProfile);

export default router;
