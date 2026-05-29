"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Iniciando o semeamento do banco de dados (seed)...');
    // 1. Limpar registros antigos para evitar conflitos de restrições únicas
    await prisma.glucoseRecord.deleteMany();
    await prisma.bloodPressureRecord.deleteMany();
    await prisma.user.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.tenant.deleteMany();
    // 2. Criar o Tenant padrão (Clínica)
    const tenantId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    const tenant = await prisma.tenant.create({
        data: {
            id: tenantId,
            name: 'Clínica Saúde & Vida',
            cnpj: '12.345.678/0001-90',
        },
    });
    console.log(`Tenant criado: ${tenant.name} (${tenant.id})`);
    // 3. Criar o usuário Paciente com o ID de paciente mockado
    const patientId = 'c3f8b1a2-b3c4-4d5e-ae6f-7fa8b9c0d1e2';
    const userId = 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e';
    const user = await prisma.user.create({
        data: {
            id: userId,
            email: 'paciente@saudevida.com.br',
            passwordHash: '$2a$12$L7pBqX1Qj5VnJ9b3x9n3e.y3f1s8h8a8p8e8v8e8r8s8s8e8e8e8e', // mock hash
            role: 'PATIENT',
            tenantId: tenant.id,
        },
    });
    console.log(`Usuário criado: ${user.email} (${user.id})`);
    // 4. Criar o registro de Paciente vinculado ao Usuário e Tenant
    const patient = await prisma.patient.create({
        data: {
            id: patientId,
            fullName: 'João da Silva',
            birthDate: new Date('1980-05-15'),
            phone: '(11) 98765-4321',
            tenantId: tenant.id,
            userId: user.id,
        },
    });
    console.log(`Paciente criado: ${patient.fullName} (${patient.id})`);
    // 5. Criar alguns registros iniciais de Saúde para o João da Silva
    await prisma.bloodPressureRecord.createMany({
        data: [
            {
                systolic: 120,
                diastolic: 80,
                pulse: 72,
                note: 'Pressão normal em repouso',
                patientId: patient.id,
                recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
            },
            {
                systolic: 135,
                diastolic: 85,
                pulse: 80,
                note: 'Um pouco elevada após café da manhã',
                patientId: patient.id,
                recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
            },
        ],
    });
    await prisma.glucoseRecord.createMany({
        data: [
            {
                valueMgDl: 95,
                context: 'FASTING',
                note: 'Jejum matinal',
                patientId: patient.id,
                recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            },
            {
                valueMgDl: 140,
                context: 'POST_MEAL',
                note: '2 horas após almoço',
                patientId: patient.id,
                recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            },
        ],
    });
    console.log('Registros de saúde iniciais criados para o Paciente João da Silva.');
    console.log('Banco de dados semeado com sucesso!');
}
main()
    .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map