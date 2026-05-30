import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
  createBloodPressure,
  createGlucose,
  getBloodPressure,
  getGlucose,
  getPatients,
} from '../controllers/healthController';

const router = Router();

// --- Rotas do Paciente ---
router.get('/blood-pressure', authMiddleware, requireRole('PATIENT'), getBloodPressure);
router.post('/blood-pressure', authMiddleware, requireRole('PATIENT'), createBloodPressure);

router.get('/glucose', authMiddleware, requireRole('PATIENT'), getGlucose);
router.post('/glucose', authMiddleware, requireRole('PATIENT'), createGlucose);

// --- Rotas do Médico ---
router.get('/patients', authMiddleware, requireRole('DOCTOR', 'ADMIN'), getPatients);

export default router;
