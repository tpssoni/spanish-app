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

export interface DashboardData {
  user: User & { last_active_date: string | null };
  wordsDueForReview: number;
  wordsLearned: number;
  lessonsCompleted: number;
  recentConversationSessions: unknown[];
}
