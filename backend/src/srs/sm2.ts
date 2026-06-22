// SM-2 spaced repetition algorithm.
// quality: 0-5 self-rated recall score (0 = total blackout, 5 = perfect recall)

export interface SrsCardState {
  easeFactor: number;
  intervalDays: number;
  reps: number;
}

export function sm2(state: SrsCardState, quality: number): SrsCardState {
  if (quality < 0 || quality > 5) throw new Error('quality must be between 0 and 5');

  let { easeFactor, intervalDays, reps } = state;

  if (quality < 3) {
    // Failed recall: reset repetitions, review again soon.
    reps = 0;
    intervalDays = 1;
  } else {
    reps += 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return { easeFactor, intervalDays, reps };
}
