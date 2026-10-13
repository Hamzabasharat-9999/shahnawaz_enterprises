import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { adminGetQuotation, adminListQuotations, adminUpdateQuotation } from '../controllers/quotationController.js';

const router = Router();
router.use(protect, requireAdmin);
router.get('/', adminListQuotations);
router.get('/:id', adminGetQuotation);
router.patch('/:id', adminUpdateQuotation);
export default router;
