import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { adminAddPayment, adminCreateInvoiceFromOrder, adminGetInvoice, adminListInvoices, adminUpdateInvoice } from '../controllers/invoiceController.js';

const router = Router();
router.use(protect, requireAdmin);
router.get('/', adminListInvoices);
router.get('/:id', adminGetInvoice);
router.post('/from-order/:orderId', adminCreateInvoiceFromOrder);
router.patch('/:id', adminUpdateInvoice);
router.post('/:id/payments', adminAddPayment);
export default router;
