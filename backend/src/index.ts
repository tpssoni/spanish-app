import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth';
import curriculumRoutes from './routes/curriculum';
import progressRoutes from './routes/progress';
import vocabularyRoutes from './routes/vocabulary';
import userRoutes from './routes/user';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/curriculum', curriculumRoutes);
app.use('/progress', progressRoutes);
app.use('/vocabulary', vocabularyRoutes);
app.use('/user', userRoutes);

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
});
