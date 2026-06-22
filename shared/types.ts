export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

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
  sentence: string; // contains "___" placeholder
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

export interface Unit {
  id: string;
  title: string;
  level: CefrLevel;
  orderIndex: number;
  description?: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  level: CefrLevel;
  orderIndex: number;
  content: LessonContent;
}
