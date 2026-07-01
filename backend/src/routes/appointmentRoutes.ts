import { Router } from 'express';
import { createAppointment, deleteAppointment, getAppointmentById, updateAppointmentStatus } from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createAppointment);
router.get('/:id', authenticate, getAppointmentById);
router.put('/:id/status', authenticate, updateAppointmentStatus);
router.delete('/:id', authenticate, deleteAppointment);

export default router;
