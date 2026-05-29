// src/server.ts
import 'express-async-errors';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middlewares ----------
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ---------- Rotas ----------
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handler para rotas inexistentes (404)
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Middleware centralizado de tratamento de erros
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error stack:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
