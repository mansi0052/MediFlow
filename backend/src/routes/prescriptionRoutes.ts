import { Router } from 'express';
import { createPrescription, getPatientPrescriptions, getPrescriptionById } from '../controllers/prescriptionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('doctor'), createPrescription);
router.get('/:id', authenticate, getPrescriptionById);
router.get('/patient/:patientId', authenticate, getPatientPrescriptions);

export default router;
