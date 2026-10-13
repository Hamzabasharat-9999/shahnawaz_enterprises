import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { adminCreateMissingDelivery, adminDeleteDelivery, adminGetDelivery, adminListDeliveries, adminUpdateDelivery } from '../controllers/deliveryController.js';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/', adminListDeliveries);
router.get('/:id', adminGetDelivery);
router.post('/from-order/:orderId', adminCreateMissingDelivery);
router.patch('/:id', adminUpdateDelivery);
router.delete('/:id', adminDeleteDelivery);
export default router;
