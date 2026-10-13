import { Router } from 'express';
import { calculateEstimateEndpoint, calculateProjectEndpoint, getEstimateConfig } from '../controllers/estimateController.js';

const router = Router();
router.get('/config', getEstimateConfig);
router.post('/calculate', calculateEstimateEndpoint);
router.post('/calculate-project', calculateProjectEndpoint);
export default router;
