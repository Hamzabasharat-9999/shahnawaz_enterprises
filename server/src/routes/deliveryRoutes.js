import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDeliveryConfig, getMyDelivery, updateMyDeliveryAddress } from '../controllers/deliveryController.js';

const router = Router();
router.get('/config', getDeliveryConfig);
router.get('/mine/:orderId', requireAuth, getMyDelivery);
router.patch('/mine/:orderId/address', requireAuth, updateMyDeliveryAddress);
export default router;
