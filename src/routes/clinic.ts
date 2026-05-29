// src/routes/clinic.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
  addDoctorToClinic,
  addPatientToClinic,
  removeDoctorFromClinic,
  removePatientFromClinic,
} from '../controllers/clinicController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create clinic (admin only)
router.post('/', createClinic);

// Get clinics for current user
router.get('/', getClinics);

// Get clinic by ID
router.get('/:clinicId', getClinicById);

// Update clinic (admin only)
router.put('/:clinicId', updateClinic);

// Delete clinic (admin only)
router.delete('/:clinicId', deleteClinic);

// Associate doctor
router.post('/:clinicId/doctors', addDoctorToClinic);
// Remove doctor
router.delete('/:clinicId/doctors/:doctorId', removeDoctorFromClinic);

// Associate patient
router.post('/:clinicId/patients', addPatientToClinic);
// Remove patient
router.delete('/:clinicId/patients/:patientId', removePatientFromClinic);

export default router;
