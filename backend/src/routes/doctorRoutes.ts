import { Router } from 'express';
import { getDoctorById, getMyAppointments, listDoctors, updateAvailability } from '../controllers/doctorController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', listDoctors);
router.get('/:id', getDoctorById);
router.put('/me/availability', authenticate, authorize('doctor'), updateAvailability);
router.get('/me/appointments', authenticate, authorize('doctor'), getMyAppointments);

export default router;
