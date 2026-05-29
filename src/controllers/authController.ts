import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateToken, AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(['ADMIN', 'DOCTOR', 'PATIENT']),
  tenantId: z.string().uuid().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    let tenantId = data.tenantId;
    if (!tenantId) {
      const defaultTenant = await prisma.tenant.findFirst();
      if (!defaultTenant) {
        return res.status(400).json({ error: 'Nenhum tenant disponível. Crie um tenant primeiro.' });
      }
      tenantId = defaultTenant.id;
    } else {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant não encontrado' });
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        tenantId,
      },
    });

    if (data.role === 'PATIENT') {
      await prisma.patient.create({
        data: {
          fullName: data.fullName,
          tenantId,
          userId: user.id,
        },
      });
    }

    const token = generateToken({ userId: user.id, role: user.role as 'ADMIN' | 'DOCTOR' | 'PATIENT', tenantId });

    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    }
    return next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role as 'ADMIN' | 'DOCTOR' | 'PATIENT',
      tenantId: user.tenantId,
    });

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    }
    return next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Não autorizado' });

    const user = await prisma.user.findUnique({
      where: { id: authReq.user.userId },
      select: { id: true, email: true, role: true, tenantId: true },
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    if (user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: user.id },
        select: { id: true, fullName: true },
      });
      if (patient) {
        return res.status(200).json({ ...user, patientId: patient.id, fullName: patient.fullName });
      }
    }

    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
};
