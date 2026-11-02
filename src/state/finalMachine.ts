/**
 * Final check: case → five tasks → result → optional repetition of mistakes.
 *
 * The first attempt of each decision is stored once, when its task is submitted, and never
 * changes afterwards. The repetition has its own answers and does not touch the result.
 *
 * Task 1 has a written justification between locking the answers and showing the results.
 * It is self-reflection: never scored, stays in memory, is sent nowhere.
 */
import type { DecisionId, TaskId } from '../content/types';

/** The case panel: continuation and conditions first, then task 1. */
export type CaseProgress = 'continuation' | 'assign';
export type FinalStep = TaskId | 'result' | 'review';

type Answers = Partial<Record<DecisionId, string>>;

export interface Written {
  text: string;
  /** The model answer and the results of task 1 are visible. */
  revealed: boolean;
  selfCheck: Record<string, boolean>;
}

export interface FinalState {
  step: FinalStep;
  /** How far the case screen got; going back to it does not replay anything. */
  caseProgress: CaseProgress;
  draft: Answers;
  first: Answers;
  checked: TaskId[];
  written: Written;
  review: {
    tasks: TaskId[];
    index: number;
    draft: Answers;
    answers: Answers;
    checked: TaskId[];
  } | null;
}

export type FinalEvent =
  | { type: 'CASE_NEXT' }
  | { type: 'SELECT'; id: DecisionId; option: string }
  | { type: 'SUBMIT' }
  | { type: 'WRITE'; text: string }
  /** 'compare' needs a non-empty text; 'unsure' continues without one. */
  | { type: 'REVEAL_MODEL'; mode: 'compare' | 'unsure' }
  | { type: 'TOGGLE_SELF_CHECK'; id: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'START_REVIEW' }
  | { type: 'REVIEW_SELECT'; id: DecisionId; option: string }
  | { type: 'REVIEW_SUBMIT' }
  | { type: 'REVIEW_NEXT' };

export interface FinalConfig {
  tasks: { id: TaskId; decisions: DecisionId[] }[];
  correct: Record<DecisionId, string>;
}

export const finalInitial: FinalState = {
  step: 'assign',
  caseProgress: 'continuation',
  draft: {},
  first: {},
  checked: [],
  written: { text: '', revealed: false, selfCheck: {} },
  review: null,
};

export function wrongDecisions(state: FinalState, config: FinalConfig): DecisionId[] {
  return config.tasks.flatMap((t) => t.decisions).filter((id) => state.first[id] !== undefined && state.first[id] !== config.correct[id]);
}

export function score(state: FinalState, config: FinalConfig) {
  const all = config.tasks.flatMap((t) => t.decisions);
  return { correct: all.filter((id) => state.first[id] === config.correct[id]).length, total: all.length };
}

/** Topics touched by first-attempt mistakes, each once, in the given order. */
export function wrongTopics<T extends { decisions: DecisionId[] }>(state: FinalState, config: FinalConfig, topics: T[]): T[] {
  const wrong = wrongDecisions(state, config);
  return topics.filter((t) => t.decisions.some((id) => wrong.includes(id)));
}

/** The repetition was started and every one of its screens was checked. */
export function reviewFinished(state: FinalState): boolean {
  return state.review !== null && state.review.checked.length === state.review.tasks.length;
}

/** Decisions of a task that the repetition asks again (only the wrong ones). */
export function reviewDecisions(state: FinalState, config: FinalConfig, task: TaskId): DecisionId[] {
  const wrong = wrongDecisions(state, config);
  return config.tasks.find((t) => t.id === task)!.decisions.filter((id) => wrong.includes(id));
}

export function createFinalReducer(config: FinalConfig) {
  const taskIds = config.tasks.map((t) => t.id);
  const taskOf = (id: DecisionId) => config.tasks.find((t) => t.decisions.includes(id))!;

  return function finalReducer(state: FinalState, event: FinalEvent): FinalState {
    const current = config.tasks.find((t) => t.id === state.step);
    const currentIndex = taskIds.indexOf(state.step as TaskId);

    switch (event.type) {
      case 'CASE_NEXT':
        return state.step === 'assign' && state.caseProgress === 'continuation' ? { ...state, caseProgress: 'assign' } : state;

      case 'SELECT': {
        const task = taskOf(event.id);
        if (state.step !== task.id || state.checked.includes(task.id)) return state;
        if (task.id === 'assign' && state.caseProgress !== 'assign') return state;
        return { ...state, draft: { ...state.draft, [event.id]: event.option } };
      }

      case 'SUBMIT': {
        if (!current || state.checked.includes(current.id)) return state;
        if (!current.decisions.every((id) => state.draft[id] !== undefined)) return state;
        const first = { ...state.first };
        for (const id of current.decisions) first[id] = state.draft[id];
        return { ...state, first, checked: [...state.checked, current.id] };
      }

      case 'WRITE':
        if (!state.checked.includes('assign') || state.written.revealed) return state;
        return { ...state, written: { ...state.written, text: event.text } };

      case 'REVEAL_MODEL':
        if (!state.checked.includes('assign') || state.written.revealed) return state;
        if (event.mode === 'compare' && state.written.text.trim() === '') return state;
        return { ...state, written: { ...state.written, revealed: true } };

      case 'TOGGLE_SELF_CHECK': {
        if (!state.written.revealed) return state;
        const selfCheck = { ...state.written.selfCheck, [event.id]: !state.written.selfCheck[event.id] };
        return { ...state, written: { ...state.written, selfCheck } };
      }

      case 'NEXT': {
        if (!current || !state.checked.includes(current.id)) return state;
        if (current.id === 'assign' && !state.written.revealed) return state;
        const nextTask = taskIds[currentIndex + 1];
        return { ...state, step: nextTask ?? 'result' };
      }

      case 'BACK':
        if (state.step === 'result') return { ...state, step: taskIds[taskIds.length - 1] };
        return currentIndex > 0 ? { ...state, step: taskIds[currentIndex - 1] } : state;

      case 'START_REVIEW': {
        if (state.step !== 'result') return state;
        const wrong = wrongDecisions(state, config);
        if (wrong.length === 0) return state;
        const tasks = taskIds.filter((t) => config.tasks.find((x) => x.id === t)!.decisions.some((id) => wrong.includes(id)));
        return { ...state, step: 'review', review: { tasks, index: 0, draft: {}, answers: {}, checked: [] } };
      }

      case 'REVIEW_SELECT': {
        const r = state.review;
        if (state.step !== 'review' || !r) return state;
        const task = r.tasks[r.index];
        if (r.checked.includes(task) || !reviewDecisions(state, config, task).includes(event.id)) return state;
        return { ...state, review: { ...r, draft: { ...r.draft, [event.id]: event.option } } };
      }

      case 'REVIEW_SUBMIT': {
        const r = state.review;
        if (state.step !== 'review' || !r) return state;
        const task = r.tasks[r.index];
        const ids = reviewDecisions(state, config, task);
        if (r.checked.includes(task) || !ids.every((id) => r.draft[id] !== undefined)) return state;
        const answers = { ...r.answers };
        for (const id of ids) answers[id] = r.draft[id];
        return { ...state, review: { ...r, answers, checked: [...r.checked, task] } };
      }

      case 'REVIEW_NEXT': {
        const r = state.review;
        if (state.step !== 'review' || !r || !r.checked.includes(r.tasks[r.index])) return state;
        if (r.index + 1 < r.tasks.length) return { ...state, review: { ...r, index: r.index + 1 } };
        return { ...state, step: 'result' };
      }
    }
  };
}
