import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { getInventorySummary, listInventory, listProductsForInventory } from '../controllers/inventoryController.js';

const router = Router();
router.use(protect, requireAdmin);
router.get('/summary', getInventorySummary);
router.get('/products', listProductsForInventory);
router.get('/', listInventory);
export default router;
