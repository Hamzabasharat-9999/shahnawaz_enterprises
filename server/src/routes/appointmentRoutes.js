import express from 'express';
import { protect } from '../middleware/auth.js';
import { createAppointment, getAppointmentConfig, getAvailability, listMyAppointments, getMyAppointment, cancelMyAppointment } from '../controllers/appointmentController.js';

const router = express.Router();
router.get('/config', getAppointmentConfig);
router.get('/availability', getAvailability);
router.post('/', protect, createAppointment);
router.get('/mine', protect, listMyAppointments);
router.get('/mine/:id', protect, getMyAppointment);
router.patch('/mine/:id/cancel', protect, cancelMyAppointment);
export default router;
