import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import type { Lesson } from '../api/types';

type Step = 'vocabulary' | 'grammar' | 'sentenceBuilder' | 'fillInBlank' | 'dialogue' | 'culture' | 'done';

const STEP_ORDER: Step[] = ['vocabulary', 'grammar', 'sentenceBuilder', 'fillInBlank', 'dialogue', 'culture', 'done'];

export function LessonPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [score, setScore] = useState(100);

  useEffect(() => {
    if (!id) return;
    api.get<Lesson>(`/curriculum/lessons/${id}`).then((res) => setLesson(res.data));
  }, [id]);

  if (!lesson) return <div className="p-8 text-center text-amber-700">Loading lesson…</div>;

  const step = STEP_ORDER[stepIndex];

  function next() {
    setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1));
  }

  async function finish() {
    if (!id) return;
    await api.post('/progress/lesson', { lessonId: id, score });
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <ProgressBar current={stepIndex} total={STEP_ORDER.length} />
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow p-6 mt-6"
          >
            {step === 'vocabulary' && <VocabularyStep lesson={lesson} onNext={next} />}
            {step === 'grammar' && <GrammarStep lesson={lesson} onNext={next} />}
            {step === 'sentenceBuilder' && (
              <SentenceBuilderStep lesson={lesson} onNext={next} onScore={penalize(setScore)} />
            )}
            {step === 'fillInBlank' && (
              <FillInBlankStep lesson={lesson} onNext={next} onScore={penalize(setScore)} />
            )}
            {step === 'dialogue' && <DialogueStep lesson={lesson} onNext={next} />}
            {step === 'culture' && <CultureStep lesson={lesson} onNext={next} />}
            {step === 'done' && <DoneStep score={score} onFinish={finish} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function penalize(setScore: React.Dispatch<React.SetStateAction<number>>) {
  return (correct: boolean) => {
    if (!correct) setScore((s) => Math.max(0, s - 10));
  };
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-amber-600 transition-all"
        style={{ width: `${(current / (total - 1)) * 100}%` }}
      />
    </div>
  );
}

function StepFooter({ onNext, label = 'Continue' }: { onNext: () => void; label?: string }) {
  return (
    <button
      onClick={onNext}
      className="mt-6 w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-2 font-semibold"
    >
      {label}
    </button>
  );
}

function VocabularyStep({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-amber-800 mb-4">Vocabulary</h2>
      <div className="grid grid-cols-2 gap-3">
        {lesson.content.vocabulary.map((v) => (
          <div key={v.spanish} className="border rounded-xl p-3 text-center">
            <div className="font-semibold text-amber-700">
              {v.spanish}
              {v.gender ? <span className="text-xs text-gray-400"> ({v.gender})</span> : null}
            </div>
            <div className="text-sm text-gray-500">{v.english}</div>
          </div>
        ))}
      </div>
      <StepFooter onNext={onNext} />
    </div>
  );
}

function GrammarStep({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  const g = lesson.content.grammar;
  return (
    <div>
      <h2 className="text-xl font-bold text-amber-800 mb-2">{g.title}</h2>
      <p className="text-gray-700 mb-4">{g.explanationEn}</p>
      <div className="space-y-2">
        {g.examples.map((ex) => (
          <div key={ex.es} className="bg-amber-50 rounded-lg p-2">
            <div className="font-medium text-amber-800">{ex.es}</div>
            <div className="text-sm text-gray-500">{ex.en}</div>
          </div>
        ))}
      </div>
      <StepFooter onNext={onNext} />
    </div>
  );
}

function SentenceBuilderStep({
  lesson,
  onNext,
  onScore,
}: {
  lesson: Lesson;
  onNext: () => void;
  onScore: (correct: boolean) => void;
}) {
  const exercise = lesson.content.sentenceBuilder[0];
  const [chosen, setChosen] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const remaining = exercise.words.filter((w) => !chosen.includes(w));

  function check() {
    onScore(chosen.join(' ') === exercise.correctOrder.join(' '));
    setChecked(true);
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-amber-800 mb-2">Build the sentence</h2>
      <p className="text-gray-600 mb-4">{exercise.promptEn}</p>
      <div className="min-h-12 border rounded-lg p-2 flex flex-wrap gap-2 mb-3">
        {chosen.map((w, idx) => (
          <button
            key={`${w}-${idx}`}
            onClick={() => setChosen(chosen.filter((_, i) => i !== idx))}
            className="bg-amber-600 text-white rounded px-2 py-1"
          >
            {w}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {remaining.map((w, idx) => (
          <button
            key={`${w}-${idx}`}
            onClick={() => setChosen([...chosen, w])}
            className="bg-amber-100 text-amber-800 rounded px-2 py-1"
          >
            {w}
          </button>
        ))}
      </div>
      {checked && (
        <p className={chosen.join(' ') === exercise.correctOrder.join(' ') ? 'text-green-600' : 'text-red-600'}>
          {chosen.join(' ') === exercise.correctOrder.join(' ')
            ? '¡Correcto!'
            : `Correct answer: ${exercise.correctOrder.join(' ')}`}
        </p>
      )}
      {!checked ? (
        <StepFooter onNext={check} label="Check" />
      ) : (
        <StepFooter onNext={onNext} />
      )}
    </div>
  );
}

function FillInBlankStep({
  lesson,
  onNext,
  onScore,
}: {
  lesson: Lesson;
  onNext: () => void;
  onScore: (correct: boolean) => void;
}) {
  const exercise = lesson.content.fillInBlank[0];
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const isCorrect = answer.trim().toLowerCase() === exercise.answer.toLowerCase();

  function check() {
    onScore(isCorrect);
    setChecked(true);
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-amber-800 mb-2">Fill in the blank</h2>
      <p className="text-lg text-gray-700 mb-2">{exercise.sentence}</p>
      {exercise.hintEn && <p className="text-sm text-gray-400 mb-3">Hint: {exercise.hintEn}</p>}
      <input
        className="w-full border rounded-lg px-3 py-2 mb-3"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={checked}
      />
      {checked && (
        <p className={isCorrect ? 'text-green-600' : 'text-red-600'}>
          {isCorrect ? '¡Correcto!' : `Correct answer: ${exercise.answer}`}
        </p>
      )}
      {!checked ? <StepFooter onNext={check} label="Check" /> : <StepFooter onNext={onNext} />}
    </div>
  );
}

function DialogueStep({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  const [showEnglish, setShowEnglish] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-amber-800">Mini dialogue</h2>
        <button onClick={() => setShowEnglish(!showEnglish)} className="text-sm text-amber-700 underline">
          {showEnglish ? 'Hide' : 'Show'} English
        </button>
      </div>
      <div className="space-y-3">
        {lesson.content.dialogue.map((line, idx) => (
          <div key={idx}>
            <div className="font-semibold text-amber-700">{line.speaker}: {line.es}</div>
            {showEnglish && <div className="text-sm text-gray-500">{line.en}</div>}
          </div>
        ))}
      </div>
      <StepFooter onNext={onNext} />
    </div>
  );
}

function CultureStep({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-amber-800 mb-2">Culture note 🌎</h2>
      <p className="text-gray-700">{lesson.content.cultureNote}</p>
      <StepFooter onNext={onNext} label="Finish lesson" />
    </div>
  );
}

function DoneStep({ score, onFinish }: { score: number; onFinish: () => void }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-amber-800 mb-2">¡Lección completa! 🎉</h2>
      <p className="text-gray-600 mb-4">Score: {score}%</p>
      <StepFooter onNext={onFinish} label="Back to dashboard" />
    </div>
  );
}
