# PRD — Hiperglico Multi-tenant (Monitoramento Clínico de Hipertensão e Diabetes)

## 1. Visão Geral

SaaS multi-tenant para monitoramento clínico de hipertensão e diabetes (pressão arterial e glicemia). Duas interfaces: **Painel do Profissional de Saúde** (web dashboard) e **Interface do Paciente** (registros diários).

---

## 2. Stack Utilizada

| Camada     | Tecnologia                          | Status     |
| ---------- | ----------------------------------- | ---------- |
| Backend    | Node.js + Express + TypeScript      | ✅ Ok      |
| ORM        | Prisma                              | ✅ Ok      |
| BD         | PostgreSQL (via Prisma)             | ✅ Ok      |
| Validação  | Zod                                 | ✅ Ok      |
| Frontend   | React + TypeScript + Tailwind (cls) | ✅ Ok      |
| Auth       | JWT real (bcryptjs + jsonwebtoken)  | ✅ Ok      |

---

## 3. O que Já Foi Implementado

### 3.1 Banco de Dados (`prisma/schema.prisma`)
- **Tenant** — clínicas/entidades
- **User** — RBAC (ADMIN, DOCTOR, PATIENT)
- **Patient** — vincula User ao Tenant, com registros de saúde
- **BloodPressureRecord** — sistólica, diastólica, pulso, nota
- **GlucoseRecord** — valor mg/dL, contexto (FASTING, PRE_MEAL, POST_MEAL, RANDOM), nota
- Migração inicial aplicada (`prisma/migrations/...`)

### 3.2 Seed (`prisma/seed.ts`)
- Cria tenant "Clínica Saúde & Vida"
- Cria usuário admin (admin@saudevida.com.br)
- Cria usuário médico (medico@saudevida.com.br)
- Cria 2 pacientes (João da Silva, Maria Oliveira)
- Cria registros de PA e glicemia como amostra

### 3.3 Backend (`src/server.ts`)
- Middlewares: helmet, cors, morgan, express.json
- Rota GET `/health`
- Handler 404 e error handler centralizado
- Exporta `app` para testes

### 3.4 Rotas Health (`src/routes/health.ts`)
| Método | Rota                           | Auth     | Descrição                   |
| ------ | ------------------------------ | -------- | --------------------------- |
| GET    | `/api/health/blood-pressure`   | Paciente | Lista PA do paciente logado |
| POST   | `/api/health/blood-pressure`   | Paciente | Cria registro de PA         |
| GET    | `/api/health/glucose`          | Paciente | Lista glicemia do paciente  |
| POST   | `/api/health/glucose`          | Paciente | Cria registro de glicemia   |
| GET    | `/api/health/patients`         | Médico/Admin | Lista pacientes do tenant |

### 3.5 Rotas Auth (`src/routes/auth.ts`)
| Método | Rota               | Auth   | Descrição                    |
| ------ | ------------------ | ------ | ---------------------------- |
| POST   | `/api/auth/register`| Público | Registra usuário (ADMIN/DOCTOR/PATIENT) |
| POST   | `/api/auth/login`  | Público | Login, retorna JWT           |
| GET    | `/api/auth/me`     | JWT    | Retorna dados do usuário logado |

### 3.6 Rotas Clinic (`src/routes/clinic.ts`)
| Método | Rota                                    | Auth   | Descrição                    |
| ------ | --------------------------------------- | ------ | ---------------------------- |
| POST   | `/api/clinic`                           | Admin  | Cria clínica                 |
| GET    | `/api/clinic`                           | JWT    | Lista clínicas do usuário    |
| GET    | `/api/clinic/:clinicId`                 | JWT    | Detalhes da clínica          |
| PUT    | `/api/clinic/:clinicId`                 | Admin  | Atualiza clínica             |
| DELETE | `/api/clinic/:clinicId`                 | Admin  | Exclui clínica               |
| POST   | `/api/clinic/:clinicId/doctors`         | Admin  | Associa médico à clínica     |
| DELETE | `/api/clinic/:clinicId/doctors/:doctorId`| Admin | Remove médico da clínica     |
| POST   | `/api/clinic/:clinicId/patients`        | Admin  | Associa paciente à clínica   |
| DELETE | `/api/clinic/:clinicId/patients/:patientId`| Admin | Remove paciente da clínica |

### 3.7 Controllers
- **authController.ts** — register, login, me
- **healthController.ts** — createBloodPressure, getBloodPressure, createGlucose, getGlucose, getPatients (com paginação)
- **clinicController.ts** — createClinic, getClinics, getClinicById, updateClinic, deleteClinic, addDoctorToClinic, addPatientToClinic, removeDoctorFromClinic, removePatientFromClinic

### 3.8 Middleware (`src/middleware/auth.ts`)
- `authMiddleware` — valida JWT real
- `requireRole(...roles)` — restringe por papel
- `generateToken(payload)` — gera JWT

### 3.9 Frontend (`frontend/src/`)
- **Login** — formulário com abas Login/Cadastro, seleção de role (Admin/Médico/Paciente)
- **DashboardPaciente** — histórico de PA e glicemia, gráficos, formulários de registro
- **DashboardMedico** — lista de pacientes com paginação, busca, gráficos
- **ClinicsList** — lista de clínicas com botões de editar/excluir (Admin)
- **CreateClinic** — formulário de criação (Admin)
- **ClinicDetail** — detalhes da clínica com edição inline (Admin)
- **Hook useAuth** — gerencia autenticação, token, sessão

### 3.10 Configurações
- `tsconfig.json` — strict, sourceMap, declarationMap, jsx react-jsx
- `.env` — DATABASE_URL (PostgreSQL), JWT_SECRET, PORT=3001
- `frontend/vite.config.ts` — proxy /api → localhost:3001
- `package.json` — scripts dev, build, start, prisma, seed

---

## 4. O que Falta / Está Incompleto

### 🟥 CRÍTICO (bloqueia uso real)

| #  | Item                                  | Status |
|----|---------------------------------------|--------|
| 1  | Autenticação real (JWT)               | ✅ Concluído |
| 2  | Trocar SQLite → PostgreSQL            | ✅ Concluído |
| 3  | Frontend sem entry point              | ✅ Concluído |
| 4  | Tailwind CSS não configurado          | ✅ Concluído |

### 🟡 ALTA PRIORIDADE

| #  | Item                                      | Status |
|----|-------------------------------------------|--------|
| 5  | CRUD completo (Clínicas)                  | ✅ Concluído |
| 6  | Dashboard médico                          | ✅ Concluído |
| 7  | Dashboard paciente                        | ✅ Concluído |
| 8  | Lista de pacientes com paginação          | ✅ Concluído |
| 9  | CRUD completo (PA e glicemia)             | ❌ Faltam update/delete |
| 10 | Validação de tenant cross‑data            | ❌ Não implementado |
| 11 | Camada de serviço (service layer)         | ❌ Controllers acoplados ao Prisma |

### 🟠 MÉDIA PRIORIDADE

| #  | Item                                      | Status |
|----|-------------------------------------------|--------|
| 12 | Seed completo (admin, médico, paciente)   | ✅ Concluído |
| 13 | Suporte a Admin (RBAC)                    | ✅ Concluído |
| 14 | Testes automatizados (Jest + supertest)   | ❌ Nenhum teste |
| 15 | README.md                                 | ❌ Sem instruções |
| 16 | Tratamento de erros aprimorado            | ❌ Error handler genérico |
| 15b| Limpar arquivos .js compilados do repo    | ✅ Concluído |
| 16b| .gitignore para node_modules              | ✅ Concluído |
| 17b| DashboardModoDemo — status API online     | ✅ Concluído |

### 🔵 BAIXA PRIORIDADE / DESEJÁVEL

| #  | Item                                      | Status |
|----|-------------------------------------------|--------|
| 18 | Documentação da API (Swagger/OpenAPI)     | ❌ |
| 19 | Notificações / Lembretes                  | ❌ |
| 20 | Exportação de dados (PDF/CSV)             | ❌ |
| 21 | Mobile (React Native)                     | ❌ |
| 22 | CI/CD pipeline                            | ❌ |
| 23 | Rate limiting                             | ❌ |
| 24 | Logs estruturados                         | ❌ |
| 25 | Auditoria / logs de acesso                | ❌ |

---

## 5. Estrutura de Diretórios Atual

```
D:\Projetos\IA\Projetos\Hiperglico\
├── PRD.md
├── backend/
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── server.ts
│       ├── lib/
│       │   └── prisma.ts
│       ├── middleware/
│       │   └── auth.ts
│       ├── types/
│       │   └── health.ts
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── healthController.ts
│       │   └── clinicController.ts
│       └── routes/
│           ├── auth.ts
│           ├── health.ts
│           └── clinic.ts
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── hooks/
        │   ├── useAuth.tsx
        │   └── useHealthData.ts
        ├── types/
        │   └── health.ts
        ├── components/
        │   ├── HealthRecordForm.tsx
        │   ├── GlassCard.tsx
        │   └── ClinicCard.tsx
        └── pages/
            ├── Login.tsx
            ├── DashboardPaciente.tsx
            ├── DashboardMedico.tsx
            ├── ClinicsList.tsx
            ├── CreateClinic.tsx
            └── ClinicDetail.tsx
```

---

## 6. Última Sessão (30/05/2026)

### O que foi feito nesta sessão:

#### Sessão anterior (manhã):
1. **Separado sistema em pastas backend/ e frontend/** — Todos os arquivos do backend movidos para pasta `backend/`:
   - `.env`, `package.json`, `tsconfig.json`, `prisma/`, `src/`
   - Frontend permanece na pasta `frontend/`
   - Atualizado PRD.md com nova estrutura e comandos

2. **Corrigido proxy do Vite** — `frontend/vite.config.ts` apontava para porta errada (3002 → 3001)

3. **Removidas URLs hardcoded** — 8 arquivos tinham `localhost:3000/3001/3002` hardcoded; substituídos por caminhos relativos para usar o proxy do Vite:
   - `useAuth.tsx`, `HealthRecordForm.tsx`, `CreateClinic.tsx`, `ClinicsList.tsx`, `ClinicDetail.tsx`, `DashboardPaciente.tsx`, `DashboardMedico.tsx`, `useHealthData.ts`

4. **Registro como Admin** — Adicionada role `ADMIN` no schema de registro (backend) e botão "Admin" no formulário de cadastro (frontend)

5. **Rota GET /api/clinic/:clinicId** — Criada `getClinicById` no controller e rota correspondente

6. **Corrigido GET /api/clinic** — Query para ADMIN não retornava clínicas; ajustado para retornar todas quando role=ADMIN

7. **CRUD de Clínicas** — Adicionadas rotas `PUT` e `DELETE`:
   - `PUT /api/clinic/:clinicId` — atualiza nome e CNPJ (admin)
   - `DELETE /api/clinic/:clinicId` — exclui clínica (admin)

8. **Frontend de Clínicas** — Atualizados `ClinicsList.tsx` e `ClinicDetail.tsx`:
   - Botões de editar/excluir visíveis apenas para ADMIN
   - Formulário de edição inline na página de detalhes
   - Confirmação antes de excluir

#### Sessão atual (tarde):
9. **Corrigido erro de compilação TypeScript** — `authController.ts`: `user.tenantId` era `string | null`, mas `AuthPayload.tenantId` esperava `string`. Adicionado `!` (non-null assertion) na linha 95.

10. **Removidos arquivos `.js` compilados antigos** — Existiam arquivos `.js` dentro de `backend/src/` que o `ts-node` carregava em vez dos `.ts`. Isso causava:
    - `health.js` antigo só tinha 2 rotas POST (sem GET, sem `/patients`)
    - Todas as rotas GET de health retornavam 404
    - Solução: deletar todos os `.js` de `backend/src/`

11. **Corrigido DashboardMedico (Modo Demo)** — O frontend exibia "Modo Demo" mesmo com backend rodando:
    - **Causa raiz:** A API retorna `{ data: [...], pagination: {...} }`, mas o código esperava um array direto. `data.length` era `undefined`, então `setApiOnline(true)` nunca era chamado.
    - **Correção:** Adicionado `json.data ?? json` para extrair o array da resposta.
    - **Melhoria:** `setApiOnline(true)` movido para fora do `if (data.length > 0)` para mostrar "API Online" mesmo sem pacientes.

12. **Adicionado `.gitignore`** — O repositório rastreava `node_modules/` inteiro (~milhares de arquivos). Criado `.gitignore` com:
    - `node_modules/`, `dist/`, `build/`, `.env`
    - `*.js.map`, `*.d.ts.map`, `backend/src/**/*.js`, `frontend/dist/`

13. **Testes automatizados de todas as rotas** — 19/19 rotas testadas e funcionando:
    - Auth: login (3 roles), login com erro, me, me sem token
    - Health: patients (médico, admin), blood-pressure (GET/POST), glucose (GET/POST), RBAC
    - Clinic: CRUD completo + RBAC

14. **Commit e push** — Enviado para https://github.com/jairalvarengapereira/Hiperglico.git

15. **Substituição de logos** — Trocadas logos por versões 3D:
   - `Logo.png` → `Logo3D.png` (App.tsx, Login.tsx)
   - `Logo01.png` → `Logo3D01.png` (App.tsx)

### Credenciais de teste:
- **Admin:** admin@saudevida.com.br / 123456
- **Médico:** medico@saudevida.com.br / 123456
- **Paciente:** paciente@saudevida.com.br / 123456

### Para rodar:
```bash
# Backend (porta 3001)
cd backend && npm run dev

# Frontend (porta 5173)
cd frontend && npm run dev
```

---

## 7. Próximos Passos Recomendados

1. **CRUD de PA e glicemia** — Adicionar `PUT` e `DELETE` para registros de saúde
2. **Validação de tenant** — Middleware para garantir que usuário só acesse dados do seu tenant
3. **Service layer** — Extrair lógica de negócio dos controllers para services
4. **Testes** — Jest + supertest para controllers
5. **README.md** — Instruções de setup, execução, variáveis de ambiente

---

## 8. Comandos Úteis

```bash
# Dev Backend
cd backend && npm run dev

# Dev Frontend
cd frontend && npm run dev

# Build Backend
cd backend && npm run build

# Prisma
cd backend && npm run prisma:generate
cd backend && npm run prisma:migrate
cd backend && npm run prisma:seed
cd backend && npm run prisma:studio
```
