import { Router } from 'express';
import multer from 'multer';
import { uploadReport, getPatientReports, deleteReport } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/upload', authenticate, upload.single('file'), uploadReport);
router.get('/patient/:patientId', authenticate, getPatientReports);
router.delete('/:id', authenticate, deleteReport);

export default router;
