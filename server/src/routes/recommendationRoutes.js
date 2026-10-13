import express from 'express';
import { recommend, featuredRecommendations } from '../controllers/recommendationController.js';
const router = express.Router();
router.get('/featured', featuredRecommendations);
router.post('/', recommend);
export default router;
