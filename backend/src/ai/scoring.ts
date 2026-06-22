import { z } from 'zod';
import { openai } from './openaiClient';

interface TranscriptTurn {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const analysisSchema = z.object({
  accuracyScore: z.number().min(0).max(100),
  fluencyScore: z.number().min(0).max(100),
  errors: z.array(
    z.object({
      original: z.string(),
      corrected: z.string(),
      explanationEn: z.string(),
    })
  ),
  newVocabularyAttempted: z.array(z.string()),
  suggestedPhrases: z.array(z.string()).max(5),
});

export type ConversationAnalysis = z.infer<typeof analysisSchema>;

const FALLBACK_ANALYSIS: ConversationAnalysis = {
  accuracyScore: 0,
  fluencyScore: 0,
  errors: [],
  newVocabularyAttempted: [],
  suggestedPhrases: [],
};

export async function analyzeConversation(transcript: TranscriptTurn[]): Promise<ConversationAnalysis> {
  const userTurns = transcript.filter((t) => t.role === 'user');
  if (userTurns.length === 0) return FALLBACK_ANALYSIS;

  const transcriptText = transcript.map((t) => `${t.role.toUpperCase()}: ${t.text}`).join('\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a Spanish language assessment tool. Given a conversation transcript between a learner (USER) and an AI Spanish tutor (ASSISTANT), evaluate only the USER's Spanish output and return a JSON object with this exact shape:
{
  "accuracyScore": number (0-100, percentage of grammatically correct sentences),
  "fluencyScore": number (0-100, based on sentence complexity, hesitation markers, response length),
  "errors": [{ "original": string, "corrected": string, "explanationEn": string }],
  "newVocabularyAttempted": string[] (Spanish words/phrases the user attempted that are notable),
  "suggestedPhrases": string[] (up to 5 useful Spanish phrases for the user to learn next, related to this conversation's topic)
}`,
      },
      { role: 'user', content: transcriptText },
    ],
  });

  const raw = completion.choices[0].message.content;
  if (!raw) return FALLBACK_ANALYSIS;

  try {
    const parsed = analysisSchema.parse(JSON.parse(raw));
    return parsed;
  } catch {
    return FALLBACK_ANALYSIS;
  }
}
