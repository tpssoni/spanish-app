export interface User {
  id: string;
  email: string;
  name: string;
  cefr_level: string;
  xp: number;
  streak: number;
}

export interface VocabCard {
  spanish: string;
  english: string;
  gender?: 'm' | 'f' | null;
  audioUrl?: string | null;
}

export interface GrammarExplanation {
  title: string;
  explanationEn: string;
  examples: { es: string; en: string }[];
}

export interface SentenceBuilderExercise {
  promptEn: string;
  words: string[];
  correctOrder: string[];
}

export interface FillInBlankExercise {
  sentence: string;
  answer: string;
  hintEn?: string;
}

export interface MiniDialogueLine {
  speaker: string;
  es: string;
  en: string;
}

export interface LessonContent {
  vocabulary: VocabCard[];
  grammar: GrammarExplanation;
  sentenceBuilder: SentenceBuilderExercise[];
  fillInBlank: FillInBlankExercise[];
  dialogue: MiniDialogueLine[];
  cultureNote: string;
}

export interface LessonSummary {
  id: string;
  title: string;
  level: string;
  orderIndex: number;
  completed: boolean;
}

export interface UnitSummary {
  id: string;
  title: string;
  level: string;
  orderIndex: number;
  description?: string;
  lessons: LessonSummary[];
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  level: string;
  orderIndex: number;
  content: LessonContent;
}

export interface ReviewCard {
  vocab_id: string;
  spanish: string;
  english: string;
  gender: 'm' | 'f' | null;
  audio_url: string | null;
  ease_factor: number;
  interval_days: number;
  reps: number;
  next_review: string;
}

export type Scenario =
  | 'market'
  | 'airport'
  | 'restaurant'
  | 'introductions'
  | 'phone_call'
  | 'doctor'
  | 'job_interview'
  | 'free_conversation';

export const SCENARIO_LABELS: Record<Scenario, { emoji: string; label: string }> = {
  market: { emoji: '🛒', label: 'At the market' },
  airport: { emoji: '✈️', label: 'At the airport' },
  restaurant: { emoji: '🍽️', label: 'At a restaurant' },
  introductions: { emoji: '👋', label: 'Meeting someone new' },
  phone_call: { emoji: '📞', label: 'Phone call' },
  doctor: { emoji: '🏥', label: 'At the doctor' },
  job_interview: { emoji: '💼', label: 'Job interview' },
  free_conversation: { emoji: '🗣️', label: 'Free conversation' },
};

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ConversationStartResponse {
  sessionId: string;
  openerText: string;
  openerAudioBase64: string;
}

export interface ConversationRespondResponse {
  text: string;
  audioBase64: string;
}

export interface ConversationError {
  original: string;
  corrected: string;
  explanationEn: string;
}

export interface ConversationReport {
  accuracyScore: number;
  fluencyScore: number;
  errors: ConversationError[];
  newVocabularyAttempted: string[];
  suggestedPhrases: string[];
  durationSeconds?: number;
}

export interface ConversationHistoryItem {
  id: string;
  scenario: Scenario;
  accuracy_score: number;
  fluency_score: number;
  duration_seconds: number;
  report_json: ConversationReport;
  created_at: string;
}

export interface DashboardData {
  user: User & { last_active_date: string | null };
  wordsDueForReview: number;
  wordsLearned: number;
  lessonsCompleted: number;
  recentConversationSessions: unknown[];
}
