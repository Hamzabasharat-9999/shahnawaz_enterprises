import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { getAdminDashboard } from '../controllers/dashboardController.js';

const router = Router();
router.use(protect, requireAdmin);
router.get('/', getAdminDashboard);
export default router;
