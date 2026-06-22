import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import type { ReviewCard } from '../api/types';

export function ReviewPage() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<ReviewCard[]>('/vocabulary/review').then((res) => setCards(res.data));
  }, []);

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4">
        <p className="text-amber-700 text-lg mb-4">No words due for review right now. ¡Buen trabajo! 🎉</p>
        <button onClick={() => navigate('/dashboard')} className="text-amber-700 underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (index >= cards.length) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4">
        <p className="text-amber-700 text-lg mb-4">Review deck complete! 🎉</p>
        <button onClick={() => navigate('/dashboard')} className="text-amber-700 underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  const card = cards[index];

  async function rate(quality: number) {
    await api.post('/vocabulary/review', { vocabId: card.vocab_id, quality });
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4">
      <p className="text-amber-600 mb-4">
        Card {index + 1} of {cards.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={card.vocab_id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center cursor-pointer"
          onClick={() => setRevealed(true)}
        >
          <div className="text-3xl font-bold text-amber-800 mb-4">{card.spanish}</div>
          {revealed && <div className="text-lg text-gray-600">{card.english}</div>}
          {!revealed && <div className="text-sm text-gray-400">Tap to reveal</div>}
        </motion.div>
      </AnimatePresence>

      {revealed && (
        <div className="grid grid-cols-4 gap-2 mt-6 w-full max-w-sm">
          <RateButton label="Again" quality={0} onClick={rate} color="bg-red-500" />
          <RateButton label="Hard" quality={3} onClick={rate} color="bg-orange-500" />
          <RateButton label="Good" quality={4} onClick={rate} color="bg-amber-600" />
          <RateButton label="Easy" quality={5} onClick={rate} color="bg-green-600" />
        </div>
      )}
    </div>
  );
}

function RateButton({
  label,
  quality,
  onClick,
  color,
}: {
  label: string;
  quality: number;
  onClick: (quality: number) => void;
  color: string;
}) {
  return (
    <button onClick={() => onClick(quality)} className={`${color} text-white rounded-lg py-2 text-sm font-semibold`}>
      {label}
    </button>
  );
}
