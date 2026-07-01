import { Router } from 'express';
import multer from 'multer';
import { uploadReport, getPatientReports } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/upload', authenticate, upload.single('file'), uploadReport);
router.get('/patient/:patientId', authenticate, getPatientReports);

export default router;
