import express from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import { adminListAppointments, adminGetAppointment, adminUpdateAppointment } from '../controllers/appointmentController.js';

const router = express.Router();
router.use(protect, requireAdmin);
router.get('/', adminListAppointments);
router.get('/:id', adminGetAppointment);
router.patch('/:id', adminUpdateAppointment);
export default router;
