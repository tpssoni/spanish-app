import { Router } from 'express';
import { pool } from '../db/pool';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

router.get('/dashboard', requireAuth, async (req: AuthedRequest, res) => {
  const userResult = await pool.query(
    'SELECT id, email, name, cefr_level, xp, streak, last_active_date FROM users WHERE id = $1',
    [req.userId]
  );
  if (!userResult.rowCount) return res.status(404).json({ error: 'User not found' });
  const user = userResult.rows[0];

  const dueCount = await pool.query(
    'SELECT count(*) FROM srs_cards WHERE user_id = $1 AND next_review <= CURRENT_DATE',
    [req.userId]
  );
  const wordsLearned = await pool.query('SELECT count(*) FROM srs_cards WHERE user_id = $1', [req.userId]);
  const lessonsCompleted = await pool.query(
    'SELECT count(*) FROM user_progress WHERE user_id = $1',
    [req.userId]
  );
  const recentSessions = await pool.query(
    `SELECT id, scenario, accuracy_score, fluency_score, duration_seconds, created_at
     FROM conversation_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
    [req.userId]
  );

  res.json({
    user,
    wordsDueForReview: parseInt(dueCount.rows[0].count, 10),
    wordsLearned: parseInt(wordsLearned.rows[0].count, 10),
    lessonsCompleted: parseInt(lessonsCompleted.rows[0].count, 10),
    recentConversationSessions: recentSessions.rows,
  });
});

export default router;
