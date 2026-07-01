import { Router } from 'express';
import { getMe, getMyAppointments, updateMe } from '../controllers/patientController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, authorize('patient'), getMe);
router.put('/me', authenticate, authorize('patient'), updateMe);
router.get('/me/appointments', authenticate, authorize('patient'), getMyAppointments);

export default router;
