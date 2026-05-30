import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o semeamento do banco de dados (seed)...');

  // 1. Limpar registros antigos
  await prisma.glucoseRecord.deleteMany();
  await prisma.bloodPressureRecord.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  const hash = await bcrypt.hash('123456', 10);

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

  // 3. Criar usuário Médico
  const doctorUserId = 'd1e2f3a4-b5c6-4d5e-ae6f-7fa8b9c0d1e2';
  const doctorUser = await prisma.user.create({
    data: {
      id: doctorUserId,
      email: 'medico@saudevida.com.br',
      passwordHash: hash,
      role: 'DOCTOR',
      tenantId: tenant.id,
    },
  });
  console.log(`Médico criado: ${doctorUser.email} (${doctorUser.id})`);

  // 4. Criar usuário Administrador
  const adminUserId = 'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c';
  const adminUser = await prisma.user.create({
    data: {
      id: adminUserId,
      email: 'admin@saudevida.com.br',
      passwordHash: hash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });
  console.log(`Admin criado: ${adminUser.email} (${adminUser.id})`);

  // 5. Criar usuário Paciente
  const patientUserId = 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e';
  const patientUser = await prisma.user.create({
    data: {
      id: patientUserId,
      email: 'paciente@saudevida.com.br',
      passwordHash: hash,
      role: 'PATIENT',
      tenantId: tenant.id,
    },
  });
  console.log(`Usuário paciente criado: ${patientUser.email} (${patientUser.id})`);

  // 6. Criar o registro de Paciente vinculado ao Usuário e Tenant
  const patientId = 'c3f8b1a2-b3c4-4d5e-ae6f-7fa8b9c0d1e2';
  const patient = await prisma.patient.create({
    data: {
      id: patientId,
      fullName: 'João da Silva',
      birthDate: new Date('1980-05-15'),
      phone: '(11) 98765-4321',
      tenantId: tenant.id,
      userId: patientUser.id,
    },
  });
  console.log(`Paciente criado: ${patient.fullName} (${patient.id})`);

  // 7. Criar registros iniciais de Saúde
  await prisma.bloodPressureRecord.createMany({
    data: [
      {
        systolic: 120, diastolic: 80, pulse: 72,
        note: 'Pressão normal em repouso',
        patientId: patient.id,
        recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
      {
        systolic: 135, diastolic: 85, pulse: 80,
        note: 'Um pouco elevada após café da manhã',
        patientId: patient.id,
        recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        systolic: 118, diastolic: 76, pulse: 68,
        note: 'Medida noturna',
        patientId: patient.id,
        recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      },
    ],
  });

  await prisma.glucoseRecord.createMany({
    data: [
      {
        valueMgDl: 95, context: 'FASTING',
        note: 'Jejum matinal',
        patientId: patient.id,
        recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
      {
        valueMgDl: 140, context: 'POST_MEAL',
        note: '2 horas após almoço',
        patientId: patient.id,
        recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        valueMgDl: 110, context: 'RANDOM',
        note: 'Medida aleatória',
        patientId: patient.id,
        recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      },
    ],
  });

  // 8. Criar um segundo paciente (sem registros)
  const patient2Id = 'e5f6a7b8-c9d0-4e1f-8a2b-3c4d5e6f7a8b';
  const patient2UserId = 'c4d5e6f7-a8b9-0c1d-2e3f-4a5b6c7d8e9f';
  const patient2User = await prisma.user.create({
    data: {
      id: patient2UserId,
      email: 'maria@saudevida.com.br',
      passwordHash: hash,
      role: 'PATIENT',
      tenantId: tenant.id,
    },
  });

  await prisma.patient.create({
    data: {
      id: patient2Id,
      fullName: 'Maria Oliveira',
      birthDate: new Date('1992-11-20'),
      phone: '(11) 91234-5678',
      tenantId: tenant.id,
      userId: patient2User.id,
    },
  });
  console.log(`Paciente criado: Maria Oliveira (${patient2Id})`);

  console.log('\n=== Seed concluído com sucesso! ===');
  console.log('Credenciais de login (senha: 123456):');
  console.log('  Médico:   medico@saudevida.com.br');
  console.log('  Paciente: paciente@saudevida.com.br');
  console.log('  Admin:    admin@saudevida.com.br');
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
