// src/controllers/clinicController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// ---------- Create a new clinic (admin only) ----------
export const createClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admin can create clinics' });
    }
    const { name, cnpj } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const clinic = await prisma.tenant.create({
      data: { name, cnpj },
    });
    return res.status(201).json(clinic);
  } catch (err) {
    return next(err);
  }
};

// Updated getClinics to fetch doctors via users with role DOCTOR
export const getClinics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const where = user.role === 'ADMIN'
      ? {}
      : {
          OR: [
            { users: { some: { id: user.userId, role: 'DOCTOR' } } },
            { patients: { some: { id: user.userId } } },
          ],
        };

    const clinics = await prisma.tenant.findMany({
      where,
      include: {
        users: { where: { role: 'DOCTOR' }, select: { id: true, email: true, role: true } },
        patients: { select: { id: true, fullName: true } },
      },
    });
    // Map to expected shape
    const result = clinics.map(c => ({
      id: c.id,
      name: c.name,
      doctorCount: c.users?.length ?? 0,
      patientCount: c.patients?.length ?? 0,
    }));
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

// ---------- Get clinic by ID ----------
export const getClinicById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { clinicId } = req.params;
    const clinic = await prisma.tenant.findUnique({
      where: { id: clinicId },
      include: {
        users: { where: { role: 'DOCTOR' }, select: { id: true, email: true, role: true } },
        patients: { select: { id: true, fullName: true } },
      },
    });
    if (!clinic) return res.status(404).json({ error: 'Clínica não encontrada' });
    return res.status(200).json({
      id: clinic.id,
      name: clinic.name,
      cnpj: clinic.cnpj,
      doctorCount: clinic.users?.length ?? 0,
      patientCount: clinic.patients?.length ?? 0,
      doctors: clinic.users,
      patients: clinic.patients,
    });
  } catch (err) {
    return next(err);
  }
};

// ---------- Update clinic (admin only) ----------
export const updateClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Apenas administradores podem editar clínicas' });
    }
    const { clinicId } = req.params;
    const { name, cnpj } = req.body;
    const clinic = await prisma.tenant.update({
      where: { id: clinicId },
      data: { ...(name && { name }), ...(cnpj !== undefined && { cnpj }) },
    });
    return res.status(200).json(clinic);
  } catch (err) {
    return next(err);
  }
};

// ---------- Delete clinic (admin only) ----------
export const deleteClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Apenas administradores podem excluir clínicas' });
    }
    const { clinicId } = req.params;
    await prisma.tenant.delete({ where: { id: clinicId } });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

// Updated addDoctorToClinic using connect on users relation
export const addDoctorToClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { clinicId } = req.params;
    const { doctorId } = req.body;
    if (!doctorId) return res.status(400).json({ error: 'doctorId required' });
    // Only admin or the doctor being added can perform
    if (user.role !== 'ADMIN' && user.userId !== doctorId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const clinic = await prisma.tenant.update({
      where: { id: clinicId },
      data: { users: { connect: { id: doctorId } } },
    });
    return res.status(200).json(clinic);
  } catch (err) {
    return next(err);
  }
};

// ---------- Add a patient to a clinic (doctor or admin) ----------
export const addPatientToClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { clinicId } = req.params;
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId required' });
    // Only admin or a doctor assigned to the clinic can add patients
    if (user.role === 'DOCTOR') {
      const isDoctorInClinic = await prisma.tenant.findFirst({
        where: { id: clinicId, users: { some: { id: user.userId, role: 'DOCTOR' } } },
      });
      if (!isDoctorInClinic) return res.status(403).json({ error: 'Doctor not linked to clinic' });
    } else if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const clinic = await prisma.tenant.update({
      where: { id: clinicId },
      data: { patients: { connect: { id: patientId } } },
    });
    return res.status(200).json(clinic);
  } catch (err) {
    return next(err);
  }
};

// ---------- Remove doctor from clinic (admin) ----------
export const removeDoctorFromClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { clinicId, doctorId } = req.params;
    const clinic = await prisma.tenant.update({
      where: { id: clinicId },
      data: { users: { disconnect: { id: doctorId } } },
    });
    return res.status(200).json(clinic);
  } catch (err) {
    return next(err);
  }
};

// ---------- Remove patient from clinic (admin) ----------
export const removePatientFromClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { clinicId, patientId } = req.params;
    const clinic = await prisma.tenant.update({
      where: { id: clinicId },
      data: { patients: { disconnect: { id: patientId } } },
    });
    return res.status(200).json(clinic);
  } catch (err) {
    return next(err);
  }
};
