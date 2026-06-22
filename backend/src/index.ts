import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth';
import curriculumRoutes from './routes/curriculum';
import progressRoutes from './routes/progress';
import vocabularyRoutes from './routes/vocabulary';
import userRoutes from './routes/user';
import conversationRoutes from './routes/conversation';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/curriculum', curriculumRoutes);
app.use('/progress', progressRoutes);
app.use('/vocabulary', vocabularyRoutes);
app.use('/user', userRoutes);
app.use('/conversation', conversationRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Unexpected error';
  res.status(502).json({ error: 'Upstream or server error', message });
});

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
});
