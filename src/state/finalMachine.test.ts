import { describe, expect, it } from 'vitest';
import type { DecisionId } from '../content/types';
import { createFinalReducer, finalInitial, reviewFinished, score, wrongDecisions, wrongTopics, type FinalConfig, type FinalEvent, type FinalState } from './finalMachine';

const config: FinalConfig = {
  tasks: [
    { id: 'assign', decisions: ['dog_basis', 'bottle_basis'] },
    { id: 'conditions', decisions: ['defensive_conditions', 'aggressive_conditions'] },
    { id: 'compensation', decisions: ['compensation'] },
    { id: 'notwehr', decisions: ['notwehr_basis'] },
    { id: 'perspectives', decisions: ['legal_perspectives'] },
  ],
  correct: {
    dog_basis: 'defensive',
    bottle_basis: 'aggressive',
    defensive_conditions: 'proportion',
    aggressive_conditions: 'disproportionate',
    compensation: 'bottle_only',
    notwehr_basis: 'nothilfe',
    legal_perspectives: 'perspective',
  },
};
const reducer = createFinalReducer(config);
const run = (events: FinalEvent[], from: FinalState = finalInitial) => events.reduce(reducer, from);

const toAssign: FinalEvent[] = [{ type: 'CASE_NEXT' }, { type: 'CASE_NEXT' }];

/** Answers every task with `pick(id)`, submitting each twice; task 1 continues without text. */
function answerAll(pick: (id: DecisionId) => string): FinalEvent[] {
  return config.tasks.flatMap((t) => [
    ...t.decisions.map((id) => ({ type: 'SELECT', id, option: pick(id) }) as FinalEvent),
    { type: 'SUBMIT' } as FinalEvent,
    { type: 'SUBMIT' } as FinalEvent,
    ...(t.id === 'assign' ? [{ type: 'REVEAL_MODEL', mode: 'unsure' } as FinalEvent] : []),
    { type: 'NEXT' } as FinalEvent,
  ]);
}

const right = (id: DecisionId) => config.correct[id];
const wrong = (id: DecisionId) => `wrong-${id}`;

describe('final check', () => {
  it('all correct → 7 of 7, no repetition offered', () => {
    const s = run([...toAssign, ...answerAll(right)]);
    expect(s.step).toBe('result');
    expect(score(s, config)).toEqual({ correct: 7, total: 7 });
    expect(run([{ type: 'START_REVIEW' }], s).step).toBe('result');
  });

  it('all wrong → 0 of 7', () => {
    const s = run([...toAssign, ...answerAll(wrong)]);
    expect(score(s, config).correct).toBe(0);
    expect(wrongDecisions(s, config)).toHaveLength(7);
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
    const s = run([...toAssign, ...answerAll(right).slice(0, 9), { type: 'BACK' }, { type: 'BACK' }]);
    expect(s.step).toBe('assign');
    expect(s.caseProgress).toBe('assign');
    expect(score(s, config).correct).toBe(4);
  });

  it('task 1: results stay hidden until the written part is finished; text survives going back', () => {
    const locked = run([
      ...toAssign,
      { type: 'WRITE', text: 'zu früh' },
      { type: 'SELECT', id: 'dog_basis', option: 'defensive' },
      { type: 'SELECT', id: 'bottle_basis', option: 'aggressive' },
      { type: 'SUBMIT' },
    ]);
    expect(locked.written.text).toBe('');
    expect(locked.written.revealed).toBe(false);
    expect(run([{ type: 'NEXT' }], locked).step).toBe('assign');

    const blank = run([{ type: 'WRITE', text: '   ' }, { type: 'REVEAL_MODEL', mode: 'compare' }], locked);
    expect(blank.written.revealed).toBe(false);

    const shown = run(
      [
        { type: 'WRITE', text: 'Meine Erklärung' },
        { type: 'REVEAL_MODEL', mode: 'compare' },
        { type: 'WRITE', text: 'geändert' },
        { type: 'TOGGLE_SELF_CHECK', id: 'source' },
        { type: 'NEXT' },
        { type: 'BACK' },
      ],
      locked,
    );
    expect(shown.step).toBe('assign');
    expect(shown.written).toEqual({ text: 'Meine Erklärung', revealed: true, selfCheck: { source: true } });
    expect(score(shown, config).correct).toBe(2);
  });

  it('"unsure" continues without text and scores nothing', () => {
    const s = run([
      ...toAssign,
      { type: 'SELECT', id: 'dog_basis', option: 'notwehr' },
      { type: 'SELECT', id: 'bottle_basis', option: 'aggressive' },
      { type: 'SUBMIT' },
      { type: 'REVEAL_MODEL', mode: 'unsure' },
      { type: 'TOGGLE_SELF_CHECK', id: 'source' },
      { type: 'NEXT' },
    ]);
    expect(s.step).toBe('conditions');
    expect(s.written.text).toBe('');
    expect(score(s, config).correct).toBe(1);
  });

  it('result topics follow the first attempt, without duplicates', () => {
    const topics: { id: string; decisions: DecisionId[] }[] = [
      { id: 'source', decisions: ['dog_basis', 'bottle_basis'] },
      { id: 'def', decisions: ['defensive_conditions'] },
      { id: 'agg', decisions: ['aggressive_conditions'] },
      { id: 'comp', decisions: ['compensation'] },
      { id: 'not', decisions: ['notwehr_basis'] },
      { id: 'law', decisions: ['legal_perspectives'] },
    ];
    const ids = (pick: (id: DecisionId) => string) => wrongTopics(run([...toAssign, ...answerAll(pick)]), config, topics).map((t) => t.id);

    expect(ids(right)).toEqual([]);
    expect(ids((id) => (id === 'compensation' ? wrong(id) : right(id)))).toEqual(['comp']);
    expect(ids((id) => (id === 'dog_basis' || id === 'bottle_basis' ? wrong(id) : right(id)))).toEqual(['source']);
    expect(ids(wrong)).toHaveLength(6);
  });

  it('the repetition counts as finished only after its last screen', () => {
    const start = run([...toAssign, ...answerAll((id) => (id === 'compensation' ? wrong(id) : right(id)))]);
    expect(reviewFinished(start)).toBe(false);
    const asked = run([{ type: 'START_REVIEW' }, { type: 'REVIEW_SELECT', id: 'compensation', option: 'bottle_only' }], start);
    expect(reviewFinished(asked)).toBe(false);
    const done = run([{ type: 'REVIEW_SUBMIT' }, { type: 'REVIEW_NEXT' }], asked);
    expect(reviewFinished(done)).toBe(true);
    expect(score(done, config).correct).toBe(6);
    const again = run([{ type: 'START_REVIEW' }], done);
    expect(reviewFinished(again)).toBe(false);
  });

  it('mixed result; the repetition asks only the mistakes and keeps the first score', () => {
    const mixed = (id: DecisionId) => (id === 'bottle_basis' || id === 'legal_perspectives' ? wrong(id) : right(id));
    const s = run([...toAssign, ...answerAll(mixed), { type: 'START_REVIEW' }]);
    expect(score(s, config).correct).toBe(5);
    expect(s.review?.tasks).toEqual(['assign', 'perspectives']);

    const notAsked = run([{ type: 'REVIEW_SELECT', id: 'dog_basis', option: 'notwehr' }], s);
    expect(notAsked.review?.draft).toEqual({});

    const done = run(
      [
        { type: 'REVIEW_SELECT', id: 'bottle_basis', option: 'aggressive' },
        { type: 'REVIEW_SUBMIT' },
        { type: 'REVIEW_NEXT' },
        { type: 'REVIEW_SELECT', id: 'legal_perspectives', option: 'perspective' },
        { type: 'REVIEW_SUBMIT' },
        { type: 'REVIEW_NEXT' },
      ],
      s,
    );
    expect(done.step).toBe('result');
    expect(done.review?.answers).toEqual({ bottle_basis: 'aggressive', legal_perspectives: 'perspective' });
    expect(score(done, config).correct).toBe(5);
  });
});
