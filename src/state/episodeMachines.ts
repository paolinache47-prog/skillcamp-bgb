/**
 * Panel steps of the Notstand episodes, after the video reached its freeze frame.
 * Video playback itself reuses segmentMachine. Every event is accepted only in its
 * own step, so repeated clicks never skip a step.
 */

// ---------- Dachziegel ----------

export type RoofStep = 'continuation' | 'compare' | 'rule' | 'consequences';

export interface RoofState {
  step: RoofStep;
  /** Compare items revealed one after another (0..itemCount). */
  revealed: number;
  choice: string | null;
  submittedChoice: string | null;
}

export type RoofEvent =
  | { type: 'SHOW_COMPARE' }
  | { type: 'REVEAL_NEXT' }
  | { type: 'CHOOSE'; id: string }
  | { type: 'SUBMIT' }
  | { type: 'SHOW_RULE' }
  | { type: 'SHOW_CONSEQUENCES' };

export const roofInitial: RoofState = { step: 'continuation', revealed: 0, choice: null, submittedChoice: null };

export function createRoofReducer(itemCount: number) {
  return function roofReducer(state: RoofState, event: RoofEvent): RoofState {
    const comparing = state.step === 'compare';
    switch (event.type) {
      case 'SHOW_COMPARE':
        return state.step === 'continuation' ? { ...state, step: 'compare' } : state;
      case 'REVEAL_NEXT':
        return comparing && state.revealed < itemCount ? { ...state, revealed: state.revealed + 1 } : state;
      case 'CHOOSE':
        return comparing && state.revealed === itemCount && state.submittedChoice === null ? { ...state, choice: event.id } : state;
      case 'SUBMIT':
        if (!comparing || state.choice === null || state.submittedChoice !== null) return state;
        return { ...state, submittedChoice: state.choice };
      case 'SHOW_RULE':
        return comparing && state.submittedChoice !== null ? { ...state, step: 'rule' } : state;
      case 'SHOW_CONSEQUENCES':
        return state.step === 'rule' ? { ...state, step: 'consequences' } : state;
    }
  };
}

// ---------- Verschlossene Tür ----------

export type DoorStep = 'choose' | 'outcome' | 'rule';

export interface DoorState {
  step: DoorStep;
  choice: string | null;
  /** The confirmed first decision. Viewing the other branch never changes it. */
  decision: string | null;
  /** Branch currently shown in the outcome step. */
  viewing: string | null;
}

export type DoorEvent =
  | { type: 'CHOOSE'; id: string }
  | { type: 'SUBMIT' }
  | { type: 'TOGGLE_BRANCH' }
  | { type: 'SHOW_RULE' };

export const doorInitial: DoorState = { step: 'choose', choice: null, decision: null, viewing: null };

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
      case 'SHOW_RULE':
        return state.step === 'outcome' ? { ...state, step: 'rule' } : state;
    }
  };
}
