import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { toFile } from 'openai';
import { pool } from '../db/pool';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { openai } from '../ai/openaiClient';
import { buildPersonaSystemPrompt, SCENARIOS, type Scenario } from '../ai/persona';
import { config } from '../config';
import { analyzeConversation } from '../ai/scoring';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

interface TranscriptTurn {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const scenarioSchema = z.enum(Object.keys(SCENARIOS) as [Scenario, ...Scenario[]]);

router.post('/start', requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  const parsed = z.object({ scenario: scenarioSchema }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { scenario } = parsed.data;

  const userResult = await pool.query('SELECT name, cefr_level FROM users WHERE id = $1', [req.userId]);
  const user = userResult.rows[0];

  const systemPrompt = buildPersonaSystemPrompt({ userName: user.name, level: user.cefr_level, scenario });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '(El usuario acaba de iniciar la conversación. Saluda y comienza la escena.)' },
    ],
  });
  const opener = completion.choices[0].message.content ?? '¡Hola!';

  const transcript: TranscriptTurn[] = [{ role: 'assistant', text: opener, timestamp: new Date().toISOString() }];

  const sessionResult = await pool.query(
    `INSERT INTO conversation_sessions (user_id, scenario, transcript_json) VALUES ($1, $2, $3) RETURNING id`,
    [req.userId, scenario, JSON.stringify(transcript)]
  );

  const ttsAudio = await synthesizeSpeech(opener);

  res.status(201).json({
    sessionId: sessionResult.rows[0].id,
    openerText: opener,
    openerAudioBase64: ttsAudio,
  });
}));

router.post('/transcribe', requireAuth, upload.single('audio'), asyncHandler(async (req: AuthedRequest, res) => {
  const sessionId = req.body.sessionId as string | undefined;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
  if (!req.file) return res.status(400).json({ error: 'audio file is required' });

  const transcription = await openai.audio.transcriptions.create({
    file: await toFile(req.file.buffer, req.file.originalname || 'audio.webm'),
    model: 'whisper-1',
  });

  res.json({ text: transcription.text });
}));

const respondSchema = z.object({
  sessionId: z.string().uuid(),
  userText: z.string().min(1),
});

router.post('/respond', requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  const parsed = respondSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { sessionId, userText } = parsed.data;

  const sessionResult = await pool.query(
    `SELECT cs.scenario, cs.transcript_json, u.name, u.cefr_level
     FROM conversation_sessions cs JOIN users u ON u.id = cs.user_id
     WHERE cs.id = $1 AND cs.user_id = $2`,
    [sessionId, req.userId]
  );
  if (!sessionResult.rowCount) return res.status(404).json({ error: 'Session not found' });
  const session = sessionResult.rows[0];
  const transcript: TranscriptTurn[] = session.transcript_json ?? [];

  transcript.push({ role: 'user', text: userText, timestamp: new Date().toISOString() });

  const systemPrompt = buildPersonaSystemPrompt({
    userName: session.name,
    level: session.cefr_level,
    scenario: session.scenario,
  });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...transcript.map((t) => ({ role: t.role, content: t.text } as const)),
    ],
  });
  const replyText = completion.choices[0].message.content ?? '';

  transcript.push({ role: 'assistant', text: replyText, timestamp: new Date().toISOString() });

  await pool.query(`UPDATE conversation_sessions SET transcript_json = $2 WHERE id = $1`, [
    sessionId,
    JSON.stringify(transcript),
  ]);

  const ttsAudio = await synthesizeSpeech(replyText);

  res.json({ text: replyText, audioBase64: ttsAudio });
}));

const endSchema = z.object({
  sessionId: z.string().uuid(),
  durationSeconds: z.number().int().min(0),
});

router.post('/end', requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  const parsed = endSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { sessionId, durationSeconds } = parsed.data;

  const sessionResult = await pool.query(
    `SELECT transcript_json FROM conversation_sessions WHERE id = $1 AND user_id = $2`,
    [sessionId, req.userId]
  );
  if (!sessionResult.rowCount) return res.status(404).json({ error: 'Session not found' });
  const transcript: TranscriptTurn[] = sessionResult.rows[0].transcript_json ?? [];

  const analysis = await analyzeConversation(transcript);

  await pool.query(
    `UPDATE conversation_sessions
     SET accuracy_score = $2, fluency_score = $3, duration_seconds = $4, report_json = $5
     WHERE id = $1`,
    [sessionId, analysis.accuracyScore, analysis.fluencyScore, durationSeconds, JSON.stringify(analysis)]
  );

  await pool.query(`UPDATE users SET xp = xp + 30 WHERE id = $1`, [req.userId]);

  res.json({ ...analysis, durationSeconds });
}));

router.get('/history', requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  const result = await pool.query(
    `SELECT id, scenario, accuracy_score, fluency_score, duration_seconds, report_json, created_at
     FROM conversation_sessions
     WHERE user_id = $1 AND accuracy_score IS NOT NULL
     ORDER BY created_at DESC LIMIT 20`,
    [req.userId]
  );
  res.json(result.rows);
}));

async function synthesizeSpeech(text: string): Promise<string> {
  const speech = await openai.audio.speech.create({
    model: 'tts-1',
    voice: config.openaiTtsVoice as 'onyx',
    input: text,
  });
  const buffer = Buffer.from(await speech.arrayBuffer());
  return buffer.toString('base64');
}

export default router;
