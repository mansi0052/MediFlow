import { Router } from 'express';
import { getStats, pendingDoctors, verifyDoctor } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/doctors/pending', authenticate, authorize('admin'), pendingDoctors);
router.put('/doctors/:id/verify', authenticate, authorize('admin'), verifyDoctor);
router.get('/stats', authenticate, authorize('admin'), getStats);

export default router;
