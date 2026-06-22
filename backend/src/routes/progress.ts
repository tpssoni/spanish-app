import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

const completeLessonSchema = z.object({
  lessonId: z.string().uuid(),
  score: z.number().min(0).max(100),
});

const XP_PER_LESSON = 20;

router.post('/lesson', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = completeLessonSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { lessonId, score } = parsed.data;

  await pool.query(
    `INSERT INTO user_progress (user_id, lesson_id, score)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, lesson_id) DO UPDATE SET score = EXCLUDED.score, completed_at = now()`,
    [req.userId, lessonId, score]
  );

  const updated = await pool.query(
    `UPDATE users SET xp = xp + $2 WHERE id = $1 RETURNING xp, streak, cefr_level`,
    [req.userId, XP_PER_LESSON]
  );

  const vocabResult = await pool.query('SELECT id FROM vocabulary WHERE lesson_id = $1', [lessonId]);
  for (const v of vocabResult.rows) {
    await pool.query(
      `INSERT INTO srs_cards (user_id, vocab_id) VALUES ($1, $2)
       ON CONFLICT (user_id, vocab_id) DO NOTHING`,
      [req.userId, v.id]
    );
  }

  res.json({ xpAwarded: XP_PER_LESSON, totalXp: updated.rows[0].xp });
});

export default router;
