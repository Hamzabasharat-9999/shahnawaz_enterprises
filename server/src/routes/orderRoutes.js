import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { approveQuotationAndCreateOrder, getMyOrder, listMyOrders } from '../controllers/orderController.js';

const router = Router();
router.use(protect);
router.post('/from-quotation/:id', approveQuotationAndCreateOrder);
router.get('/mine', listMyOrders);
router.get('/mine/:id', getMyOrder);
export default router;
