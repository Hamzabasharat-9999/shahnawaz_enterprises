import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { adminDeleteReview, adminGetReview, adminListReviews, adminModerateReview } from '../controllers/reviewController.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);
router.get('/', adminListReviews);
router.get('/:id', adminGetReview);
router.patch('/:id', adminModerateReview);
router.delete('/:id', adminDeleteReview);
export default router;
