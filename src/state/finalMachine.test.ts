import { describe, expect, it } from 'vitest';
import type { DecisionId } from '../content/types';
import { createFinalReducer, finalInitial, score, wrongDecisions, type FinalConfig, type FinalEvent, type FinalState } from './finalMachine';

const config: FinalConfig = {
  tasks: [
    { id: 'assign', decisions: ['dog_basis', 'bottle_basis'] },
    { id: 'conditions', decisions: ['defensive_conditions', 'aggressive_conditions'] },
    { id: 'compensation', decisions: ['compensation'] },
    { id: 'notwehr', decisions: ['notwehr_basis'] },
    { id: 'perspectives', decisions: ['criminal_perspective', 'civil_perspective'] },
  ],
  correct: {
    dog_basis: 'defensive',
    bottle_basis: 'aggressive',
    defensive_conditions: 'required',
    aggressive_conditions: 'disproportionate',
    compensation: 'b',
    notwehr_basis: 'nothilfe',
    criminal_perspective: 'stgb',
    civil_perspective: 'bgb',
  },
};
const reducer = createFinalReducer(config);
const run = (events: FinalEvent[], from: FinalState = finalInitial) => events.reduce(reducer, from);

const toAssign: FinalEvent[] = [{ type: 'CASE_NEXT' }, { type: 'CASE_NEXT' }];

/** Answers every task with `pick(id)`, submitting each twice. */
function answerAll(pick: (id: DecisionId) => string): FinalEvent[] {
  return config.tasks.flatMap((t) => [
    ...t.decisions.map((id) => ({ type: 'SELECT', id, option: pick(id) }) as FinalEvent),
    { type: 'SUBMIT' } as FinalEvent,
    { type: 'SUBMIT' } as FinalEvent,
    { type: 'NEXT' } as FinalEvent,
  ]);
}

const right = (id: DecisionId) => config.correct[id];
const wrong = (id: DecisionId) => `wrong-${id}`;

describe('final check', () => {
  it('all correct → 8 of 8, no repetition offered', () => {
    const s = run([...toAssign, ...answerAll(right)]);
    expect(s.step).toBe('result');
    expect(score(s, config)).toEqual({ correct: 8, total: 8 });
    expect(run([{ type: 'START_REVIEW' }], s).step).toBe('result');
  });

  it('all wrong → 0 of 8', () => {
    const s = run([...toAssign, ...answerAll(wrong)]);
    expect(score(s, config).correct).toBe(0);
    expect(wrongDecisions(s, config)).toHaveLength(8);
  });

  it('answers can change before the check, never after it', () => {
    const s = run([
      ...toAssign,
      { type: 'SELECT', id: 'dog_basis', option: 'notwehr' },
      { type: 'SELECT', id: 'dog_basis', option: 'defensive' },
      { type: 'SUBMIT' },
      { type: 'SELECT', id: 'bottle_basis', option: 'aggressive' },
      { type: 'SUBMIT' },
      { type: 'SELECT', id: 'bottle_basis', option: 'notwehr' },
      { type: 'SUBMIT' },
    ]);
    expect(s.first).toEqual({ dog_basis: 'defensive', bottle_basis: 'aggressive' });
    expect(s.checked).toEqual(['assign']);
  });

  it('task 1 needs the case continuation first; back keeps the answers', () => {
    expect(run([{ type: 'SELECT', id: 'dog_basis', option: 'defensive' }]).draft).toEqual({});
    const s = run([...toAssign, ...answerAll(right).slice(0, 8), { type: 'BACK' }, { type: 'BACK' }]);
    expect(s.step).toBe('assign');
    expect(s.caseProgress).toBe('assign');
    expect(score(s, config).correct).toBe(4);
  });

  it('mixed result; the repetition asks only the mistakes and keeps the first score', () => {
    const mixed = (id: DecisionId) => (id === 'bottle_basis' || id === 'civil_perspective' ? wrong(id) : right(id));
    const s = run([...toAssign, ...answerAll(mixed), { type: 'START_REVIEW' }]);
    expect(score(s, config).correct).toBe(6);
    expect(s.review?.tasks).toEqual(['assign', 'perspectives']);

    const notAsked = run([{ type: 'REVIEW_SELECT', id: 'dog_basis', option: 'notwehr' }], s);
    expect(notAsked.review?.draft).toEqual({});

    const done = run(
      [
        { type: 'REVIEW_SELECT', id: 'bottle_basis', option: 'aggressive' },
        { type: 'REVIEW_SUBMIT' },
        { type: 'REVIEW_NEXT' },
        { type: 'REVIEW_SELECT', id: 'civil_perspective', option: 'bgb' },
        { type: 'REVIEW_SUBMIT' },
        { type: 'REVIEW_NEXT' },
      ],
      s,
    );
    expect(done.step).toBe('result');
    expect(done.review?.answers).toEqual({ bottle_basis: 'aggressive', civil_perspective: 'bgb' });
    expect(score(done, config).correct).toBe(6);
  });
});
