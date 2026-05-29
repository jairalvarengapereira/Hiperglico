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
- Cria usuário paciente (João da Silva)
- Cria 2 registros de PA e 2 de glicemia como amostra

### 3.3 Backend (`src/server.ts`)
- Middlewares: helmet, cors, morgan, express.json
- Rota GET `/health`
- Handler 404 e error handler centralizado
- Exporta `app` para testes

### 3.4 Rotas (`src/routes/health.ts`)
| Método | Rota                           | Auth     | Descrição                   |
| ------ | ------------------------------ | -------- | --------------------------- |
| GET    | `/api/health/blood-pressure`   | Paciente | Lista PA do paciente logado |
| POST   | `/api/health/blood-pressure`   | Paciente | Cria registro de PA         |
| GET    | `/api/health/glucose`          | Paciente | Lista glicemia do paciente  |
| POST   | `/api/health/glucose`          | Paciente | Cria registro de glicemia   |
| GET    | `/api/health/patients`         | Médico   | Lista pacientes do tenant   |

### 3.5 Controller (`src/controllers/healthController.ts`)
- `authMiddleware` — valida token mock (Bearer)
- `authMiddlewareDoctor` — restringe a DOCTOR
- `createBloodPressure` / `getBloodPressure`
- `createGlucose` / `getGlucose`
- `getPatients` — lista pacientes do tenant com registros

### 3.6 Tipos TypeScript (`src/types/health.ts`)
- `BloodPressureDTO`, `GlucoseDTO`, `GlucoseContext`, `CreateRecordResponse<T>`

### 3.7 Componente React (`src/components/HealthRecordForm.tsx`)
- Formulário funcional para PA e glicemia
- Usa `useAuth` hook mockado
- Faz POST para `/api/health/blood-pressure` ou `/api/health/glucose`
- Estilizado com classes Tailwind

### 3.8 Hook useAuth (`src/hooks/useAuth.ts`)
- Retorna dados mockados do paciente padrão

### 3.9 Configurações
- `tsconfig.json` — strict, sourceMap, declarationMap, jsx react-jsx
- `.env` — `DATABASE_URL="file:./dev.db"`
- `package.json` — scripts dev, build, start, prisma, seed

---

## 4. O que Falta / Está Incompleto

### 🟥 CRÍTICO (bloqueia uso real)

| #  | Item                                  | Descrição                                                                 |
|----|---------------------------------------|---------------------------------------------------------------------------|
| 1  | ~~Autenticação real (JWT)~~           | ✅ Concluído: Login/registro com bcrypt + JWT real implementados.         |
| 2  | ~~Trocar SQLite → PostgreSQL~~        | ✅ Concluído: Schema e migrations PostgreSQL configuradas e seed rodado.  |
| 3  | ~~Frontend sem entry point~~          | ✅ Concluído: Entry points (index.html, App.tsx, main.tsx) e Vite ativos. |
| 4  | ~~Tailwind CSS não configurado~~      | ✅ Concluído: Tailwind CSS v4 configurado com @tailwindcss/postcss.      |

### 🟡 ALTA PRIORIDADE

| #  | Item                                      | Descrição                                                                  |
|----|-------------------------------------------|----------------------------------------------------------------------------|
| 5  | **CRUD completo**                         | Faltam update/delete para PA e glicemia                                    |
| 6  | ~~Dashboard médico~~                      | ✅ Concluído: Tela com gráficos de evolução, filtros, busca de pacientes.   |
| 7  | ~~Dashboard paciente~~                    | ✅ Concluído: Histórico, gráficos de tendência, e formulários de saúde.    |
| 8  | **Lista de pacientes com paginação**      | `getPatients` sem paginação, ordenação ou busca                            |
| 9  | **Validação de tenant cross‑data**        | Middleware não valida se paciente pertence ao tenant do token              |
| 10 | **Camada de serviço (service layer)**     | Controllers acoplam lógica de negócio + Prisma direto                     |

### 🟠 MÉDIA PRIORIDADE

| #  | Item                                      | Descrição                                                                 |
|----|-------------------------------------------|---------------------------------------------------------------------------|
| 11 | **Registro de usuário médico no seed**    | Seed só cria paciente; falta médico para testar rota `/patients`          |
| 12 | **Testes automatizados**                  | Nenhum teste (unit, integration, e2e)                                     |
| 13 | **README.md**                             | Sem instruções de setup, execução, variáveis de ambiente                  |
| 14 | **Tratamento de erros aprimorado**        | Error handler genérico; faltam códigos HTTP específicos                   |
| 15 | **Suporte a Admin (RBAC)**                | Role ADMIN existe no schema mas sem rotas ou middleware específico        |

### 🔵 BAIXA PRIORIDADE / DESEJÁVEL

| #  | Item                                      | Descrição                                                                 |
|----|-------------------------------------------|---------------------------------------------------------------------------|
| 16 | **Documentação da API (Swagger/OpenAPI)** | Facilitaria consumo por terceiros                                         |
| 17 | **Notificações / Lembretes**              | Push/email para paciente lembrar de registrar                             |
| 18 | **Exportação de dados (PDF/CSV)**         | Relatórios exportáveis                                                    |
| 19 | **Mobile (React Native)**                 | Mencionado no prompt inicial, não iniciado                                |
| 20 | **CI/CD pipeline**                        | GitHub Actions ou similar                                                 |
| 21 | **Rate limiting**                         | Prevenir abuso da API                                                     |
| 22 | **Logs estruturados**                     | Morgan é básico; Winston/Bunyan para produção                             |
| 23 | **Auditoria / logs de acesso**            | Quem acessou o que e quando                                               |

---

## 5. Estrutura de Diretórios Atual

```
D:\Projetos\IA\Projetos\pa_pg\
├── .env
├── package.json
├── tsconfig.json
├── prompt.txt                        # Prompt original de requisitos
├── PRD.md                            # Este documento
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   ├── dev.db                        # Banco SQLite
│   └── migrations/
│       └── 20260526175209_init/
│           └── migration.sql
└── src/
    ├── server.ts
    ├── types/
    │   └── health.ts
    ├── hooks/
    │   └── useAuth.ts
    ├── components/
    │   └── HealthRecordForm.tsx
    ├── controllers/
    │   └── healthController.ts
    └── routes/
        └── health.ts
```

---

## 6. Recomendações para Próxima LLM

### Bloco 1 — Auth & Infra (crítico)
1. [x] Substituir SQLite por PostgreSQL no `.env` e regerar migration
2. [x] Criar `src/routes/auth.ts` com `POST /auth/register` e `POST /auth/login`
3. [x] Criar `src/controllers/authController.ts` com bcrypt + JWT real
4. [x] Substituir mock `authMiddleware` por verificação real de JWT
5. [x] Criar `src/middleware/auth.ts` extraindo `userId`, `role`, `tenantId` do token

### Bloco 2 — Frontend (entregável)
6. [x] Configurar Vite + React + Tailwind + PostCSS
7. [x] Criar `src/App.tsx`, `src/main.tsx`, `index.html`
8. [x] Criar `tailwind.config.js`, `postcss.config.js` (Tailwind v4 PostCSS)
9. [x] Criar tela de Login (usando /auth/login)
10. [x] Criar dashboard paciente (histórico com gráficos SVG responsivos nativos)
11. [x] Criar dashboard médico (tabela pacientes + gráficos)

### Bloco 3 — API Completa
12. Adicionar `PUT /api/health/blood-pressure/:id` e `DELETE /api/health/blood-pressure/:id`
13. Adicionar `PUT /api/health/glucose/:id` e `DELETE /api/health/glucose/:id`
14. Adicionar paginação em `GET /api/health/patients`
15. Adicionar filtros por data em `GET /api/health/blood-pressure` e `GET /api/health/glucose`

### Bloco 4 — Qualidade
16. Escrever testes (jest + supertest) para controllers
17. Criar `.github/workflows/ci.yml`
18. Criar `README.md` com instruções completas
19. Adicionar Swagger/OpenAPI com `swagger-jsdoc` + `swagger-ui-express`

---

## 7. Comandos Úteis

```bash
# Dev
npm run dev

# Build
npm run build

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
```
