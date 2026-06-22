import { Router } from 'express';
import { pool } from '../db/pool';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

router.get('/units', requireAuth, async (req: AuthedRequest, res) => {
  const units = await pool.query('SELECT * FROM units ORDER BY level, order_index');
  const lessons = await pool.query(
    `SELECT l.id, l.unit_id, l.title, l.level, l.order_index,
            up.completed_at IS NOT NULL AS completed
     FROM lessons l
     LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = $1
     ORDER BY l.unit_id, l.order_index`,
    [req.userId]
  );

  const lessonsByUnit = new Map<string, unknown[]>();
  for (const row of lessons.rows) {
    const list = lessonsByUnit.get(row.unit_id) ?? [];
    list.push({
      id: row.id,
      title: row.title,
      level: row.level,
      orderIndex: row.order_index,
      completed: row.completed,
    });
    lessonsByUnit.set(row.unit_id, list);
  }

  const result = units.rows.map((u) => ({
    id: u.id,
    title: u.title,
    level: u.level,
    orderIndex: u.order_index,
    description: u.description,
    lessons: lessonsByUnit.get(u.id) ?? [],
  }));

  res.json(result);
});

router.get('/lessons/:id', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'Lesson not found' });
  const lesson = result.rows[0];
  res.json({
    id: lesson.id,
    unitId: lesson.unit_id,
    title: lesson.title,
    level: lesson.level,
    orderIndex: lesson.order_index,
    content: lesson.content_json,
  });
});

export default router;
