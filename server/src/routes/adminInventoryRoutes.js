import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { createInventory, updateInventory, archiveInventory, adjustInventory, listTransactions } from '../controllers/inventoryController.js';

const router = Router();
router.use(protect, requireAdmin);
router.get('/transactions', listTransactions);
router.get('/:id/transactions', listTransactions);
router.post('/', createInventory);
router.put('/:id', updateInventory);
router.patch('/:id/adjust', adjustInventory);
router.delete('/:id', archiveInventory);
export default router;
