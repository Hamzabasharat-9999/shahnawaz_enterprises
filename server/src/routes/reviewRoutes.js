import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createReview, getReviewConfig, listMyReviews, listPublicReviews, updateMyReview } from '../controllers/reviewController.js';

const router = express.Router();
router.get('/', listPublicReviews);
router.get('/config', getReviewConfig);
router.get('/mine', requireAuth, listMyReviews);
router.post('/', requireAuth, createReview);
router.patch('/mine/:id', requireAuth, updateMyReview);
export default router;
