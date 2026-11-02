/**
 * Panel steps of the Notstand episodes, after the video reached its freeze frame.
 * Video playback itself reuses segmentMachine. Every event is accepted only in its
 * own step, so repeated clicks never skip a step. Practice questions here are not scored.
 */

// ---------- Dachpfannen ----------

export type RoofStep = 'question' | 'compare' | 'rule' | 'consequences';

export interface RoofState {
  step: RoofStep;
  choice: string | null;
  submittedChoice: string | null;
}

export type RoofEvent =
  | { type: 'CHOOSE'; id: string }
  | { type: 'SUBMIT' }
  | { type: 'SHOW_RULE' }
  | { type: 'SHOW_CONSEQUENCES' };

export const roofInitial: RoofState = { step: 'question', choice: null, submittedChoice: null };

export function roofReducer(state: RoofState, event: RoofEvent): RoofState {
  switch (event.type) {
    case 'CHOOSE':
      return state.step === 'question' ? { ...state, choice: event.id } : state;
    case 'SUBMIT':
      if (state.step !== 'question' || state.choice === null) return state;
      return { ...state, step: 'compare', submittedChoice: state.choice };
    case 'SHOW_RULE':
      return state.step === 'compare' ? { ...state, step: 'rule' } : state;
    case 'SHOW_CONSEQUENCES':
      return state.step === 'rule' ? { ...state, step: 'consequences' } : state;
  }
}

// ---------- Verschlossene Tür ----------

export type DoorStep = 'choose' | 'outcome' | 'role' | 'rule' | 'compare';

export interface DoorState {
  step: DoorStep;
  choice: string | null;
  /** The confirmed first decision. Viewing the other branch never changes it. */
  decision: string | null;
  /** Branch currently shown in the outcome step. */
  viewing: string | null;
  /** Practice question on the role of the door: not scored. */
  roleChoice: string | null;
  roleAnswer: string | null;
}

export type DoorEvent =
  | { type: 'CHOOSE'; id: string }
  | { type: 'SUBMIT' }
  | { type: 'TOGGLE_BRANCH' }
  | { type: 'SHOW_ROLE' }
  | { type: 'CHOOSE_ROLE'; id: string }
  | { type: 'SUBMIT_ROLE' }
  | { type: 'SHOW_RULE' }
  | { type: 'SHOW_COMPARE' };

export const doorInitial: DoorState = { step: 'choose', choice: null, decision: null, viewing: null, roleChoice: null, roleAnswer: null };

export function createDoorReducer(branchIds: readonly [string, string]) {
  const other = (id: string) => (id === branchIds[0] ? branchIds[1] : branchIds[0]);
  return function doorReducer(state: DoorState, event: DoorEvent): DoorState {
    switch (event.type) {
      case 'CHOOSE':
        return state.step === 'choose' && branchIds.includes(event.id) ? { ...state, choice: event.id } : state;
      case 'SUBMIT':
        if (state.step !== 'choose' || state.choice === null) return state;
        return { ...state, step: 'outcome', decision: state.choice, viewing: state.choice };
      case 'TOGGLE_BRANCH':
        return state.step === 'outcome' && state.viewing ? { ...state, viewing: other(state.viewing) } : state;
      case 'SHOW_ROLE':
        return state.step === 'outcome' ? { ...state, step: 'role' } : state;
      case 'CHOOSE_ROLE':
        return state.step === 'role' && state.roleAnswer === null ? { ...state, roleChoice: event.id } : state;
      case 'SUBMIT_ROLE':
        if (state.step !== 'role' || state.roleChoice === null || state.roleAnswer !== null) return state;
        return { ...state, roleAnswer: state.roleChoice };
      case 'SHOW_RULE':
        return state.step === 'role' && state.roleAnswer !== null ? { ...state, step: 'rule' } : state;
      case 'SHOW_COMPARE':
        return state.step === 'rule' ? { ...state, step: 'compare' } : state;
    }
  };
}
