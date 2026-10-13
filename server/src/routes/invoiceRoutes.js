import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getMyInvoice, listMyInvoices } from '../controllers/invoiceController.js';

const router = Router();
router.use(protect);
router.get('/mine', listMyInvoices);
router.get('/mine/:id', getMyInvoice);
export default router;
