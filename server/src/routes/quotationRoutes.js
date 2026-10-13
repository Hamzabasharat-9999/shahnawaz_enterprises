import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { cancelMyQuotation, createQuotation, getMyQuotation, listMyQuotations } from '../controllers/quotationController.js';

const router = Router();
router.use(protect);
router.post('/', createQuotation);
router.get('/mine', listMyQuotations);
router.get('/mine/:id', getMyQuotation);
router.patch('/mine/:id/cancel', cancelMyQuotation);
export default router;
