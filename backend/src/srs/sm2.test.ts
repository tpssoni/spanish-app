import { sm2 } from './sm2';

describe('sm2', () => {
  it('resets reps and interval on failed recall', () => {
    const next = sm2({ easeFactor: 2.5, intervalDays: 6, reps: 2 }, 2);
    expect(next.reps).toBe(0);
    expect(next.intervalDays).toBe(1);
  });

  it('progresses through 1 -> 6 -> ease-scaled intervals on success', () => {
    let state = { easeFactor: 2.5, intervalDays: 0, reps: 0 };
    state = sm2(state, 5);
    expect(state.intervalDays).toBe(1);
    state = sm2(state, 5);
    expect(state.intervalDays).toBe(6);
    const easeBeforeThird = state.easeFactor;
    state = sm2(state, 5);
    expect(state.intervalDays).toBe(Math.round(6 * easeBeforeThird));
  });

  it('never drops ease factor below 1.3', () => {
    let state = { easeFactor: 1.3, intervalDays: 1, reps: 1 };
    for (let i = 0; i < 5; i++) state = sm2(state, 0);
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});
