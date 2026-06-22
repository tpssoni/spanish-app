import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { sm2 } from '../srs/sm2';

const router = Router();

router.get('/review', requireAuth, async (req: AuthedRequest, res) => {
  const result = await pool.query(
    `SELECT v.id AS vocab_id, v.spanish, v.english, v.gender, v.audio_url,
            s.ease_factor, s.interval_days, s.reps, s.next_review
     FROM srs_cards s
     JOIN vocabulary v ON v.id = s.vocab_id
     WHERE s.user_id = $1 AND s.next_review <= CURRENT_DATE
     ORDER BY s.next_review ASC
     LIMIT 50`,
    [req.userId]
  );
  res.json(result.rows);
});

const reviewSchema = z.object({
  vocabId: z.string().uuid(),
  quality: z.number().int().min(0).max(5),
});

router.post('/review', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { vocabId, quality } = parsed.data;

  const cardResult = await pool.query(
    `SELECT ease_factor, interval_days, reps FROM srs_cards WHERE user_id = $1 AND vocab_id = $2`,
    [req.userId, vocabId]
  );
  if (!cardResult.rowCount) return res.status(404).json({ error: 'SRS card not found for user/vocab' });

  const current = cardResult.rows[0];
  const next = sm2(
    { easeFactor: current.ease_factor, intervalDays: current.interval_days, reps: current.reps },
    quality
  );

  const intervalDaysRounded = Math.round(next.intervalDays);

  const updated = await pool.query(
    `UPDATE srs_cards
     SET ease_factor = $3, interval_days = $4, reps = $5,
         next_review = CURRENT_DATE + $6::int, last_reviewed_at = now()
     WHERE user_id = $1 AND vocab_id = $2
     RETURNING ease_factor, interval_days, reps, next_review`,
    [req.userId, vocabId, next.easeFactor, next.intervalDays, next.reps, intervalDaysRounded]
  );

  res.json(updated.rows[0]);
});

export default router;
