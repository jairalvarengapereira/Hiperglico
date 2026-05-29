"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.createGlucose = exports.createBloodPressure = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// ---------- Esquemas de validação Zod ----------
const bpSchema = zod_1.z.object({
    systolic: zod_1.z.number().int().min(0),
    diastolic: zod_1.z.number().int().min(0),
    pulse: zod_1.z.number().int().min(0).optional(),
    note: zod_1.z.string().optional(),
});
const glucoseSchema = zod_1.z.object({
    valueMgDl: zod_1.z.number().nonnegative(),
    context: zod_1.z.enum(['FASTING', 'PRE_MEAL', 'POST_MEAL', 'RANDOM']),
    note: zod_1.z.string().optional(),
});
// ---------- CONTROLLER ----------
const createBloodPressure = async (req, res, next) => {
    try {
        const patientId = req.userId;
        if (!patientId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const payload = bpSchema.parse(req.body);
        // Garante que o paciente realmente pertence ao tenant do usuário (opcional, mas bom)
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: { tenant: true },
        });
        if (!patient) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }
        const record = await prisma.bloodPressureRecord.create({
            data: {
                ...payload,
                patientId,
                // recordedAt será definido pelo banco (default now())
            },
        });
        return res.status(201).json({
            id: record.id,
            data: record,
            createdAt: record.createdAt.toISOString(),
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
        }
        return next(err);
    }
};
exports.createBloodPressure = createBloodPressure;
const createGlucose = async (req, res, next) => {
    try {
        const patientId = req.userId;
        if (!patientId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const payload = glucoseSchema.parse(req.body);
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
        });
        if (!patient) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }
        const record = await prisma.glucoseRecord.create({
            data: {
                ...payload,
                patientId,
            },
        });
        return res.status(201).json({
            id: record.id,
            data: record,
            createdAt: record.createdAt.toISOString(),
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
        }
        return next(err);
    }
};
exports.createGlucose = createGlucose;
// ---------- Middleware de autenticação simplificado (exemplo) ----------
const authMiddleware = (req, res, next) => {
    // Supondo que o token JWT venha no header Authorization: Bearer <token>
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    const token = auth.split(' ')[1];
    try {
        // Aqui você verificaria o token e extrairia o userId
        // Para o exemplo, vamos mockar com o mesmo UUID estável usado no frontend:
        const decoded = { userId: 'c3f8b1a2-b3c4-4d5e-ae6f-7fa8b9c0d1e2' };
        req.userId = decoded.userId;
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Token inválido' });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=healthController.js.map