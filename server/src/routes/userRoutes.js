import { Router } from 'express';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/profile', protect, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, phone: req.user.phone } });
});

export default router;
