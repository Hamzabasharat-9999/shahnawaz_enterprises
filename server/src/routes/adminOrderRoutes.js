import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { adminGetOrder, adminListOrders, adminUpdateOrder, statuses } from '../controllers/orderController.js';

const router = Router();
router.use(protect, requireAdmin);
router.get('/meta/statuses', (req, res) => res.json({ statuses }));
router.get('/', adminListOrders);
router.get('/:id', adminGetOrder);
router.patch('/:id', adminUpdateOrder);
export default router;
