// src/controllers/healthController.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// ---------- Esquemas de validação Zod ----------
const bpSchema = z.object({
  systolic: z.number().int().min(0),
  diastolic: z.number().int().min(0),
  pulse: z.number().int().min(0).optional(),
  note: z.string().optional(),
});

const glucoseSchema = z.object({
  valueMgDl: z.number().nonnegative(),
  context: z.enum(['FASTING', 'PRE_MEAL', 'POST_MEAL', 'RANDOM']),
  note: z.string().optional(),
});

// ---------- Helpers de extração do usuário autenticado ----------
const getUser = (req: Request) => (req as AuthRequest).user;
const getPatientId = (req: Request) => getUser(req)?.userId;

// ---------- CREATE: Pressão Arterial ----------
export const createBloodPressure = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado' });

    const patient = await prisma.patient.findUnique({
      where: { userId: user.userId },
    });
    if (!patient) return res.status(404).json({ error: 'Paciente não encontrado' });

    const payload = bpSchema.parse(req.body);

    const record = await prisma.bloodPressureRecord.create({
      data: { ...payload, patientId: patient.id },
    });

    return res.status(201).json({
      id: record.id,
      data: record,
      createdAt: record.createdAt.toISOString(),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    }
    return next(err);
  }
};

// ---------- GET: Pressão Arterial do paciente autenticado ----------
export const getBloodPressure = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado' });

    const patient = await prisma.patient.findUnique({
      where: { userId: user.userId },
    });
    if (!patient) return res.status(404).json({ error: 'Paciente não encontrado' });

    const records = await prisma.bloodPressureRecord.findMany({
      where: { patientId: patient.id },
      orderBy: { recordedAt: 'asc' },
    });

    return res.status(200).json(records);
  } catch (err) {
    return next(err);
  }
};

// ---------- CREATE: Glicemia ----------
export const createGlucose = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado' });

    const patient = await prisma.patient.findUnique({
      where: { userId: user.userId },
    });
    if (!patient) return res.status(404).json({ error: 'Paciente não encontrado' });

    const payload = glucoseSchema.parse(req.body);

    const record = await prisma.glucoseRecord.create({
      data: { ...payload, patientId: patient.id },
    });

    return res.status(201).json({
      id: record.id,
      data: record,
      createdAt: record.createdAt.toISOString(),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    }
    return next(err);
  }
};

// ---------- GET: Glicemia do paciente autenticado ----------
export const getGlucose = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado' });

    const patient = await prisma.patient.findUnique({
      where: { userId: user.userId },
    });
    if (!patient) return res.status(404).json({ error: 'Paciente não encontrado' });

    const records = await prisma.glucoseRecord.findMany({
      where: { patientId: patient.id },
      orderBy: { recordedAt: 'asc' },
    });

    return res.status(200).json(records);
  } catch (err) {
    return next(err);
  }
};

// ---------- GET: Lista de pacientes do tenant (painel médico) ----------
export const getPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado' });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    const where = {
      tenantId: user.tenantId,
      ...(search ? { fullName: { contains: search, mode: 'insensitive' as const } } : {}),
    };

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          bloodPressure: { orderBy: { recordedAt: 'desc' }, take: 5 },
          glucose: { orderBy: { recordedAt: 'desc' }, take: 5 },
        },
        orderBy: { fullName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);

    return res.status(200).json({
      data: patients,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return next(err);
  }
};