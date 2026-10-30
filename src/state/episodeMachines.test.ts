import { describe, expect, it } from 'vitest';
import { createDoorReducer, createRoofReducer, doorInitial, roofInitial, type DoorEvent, type RoofEvent } from './episodeMachines';

const roof = createRoofReducer(2);
const door = createDoorReducer(['damage', 'wait']);
const runRoof = (events: RoofEvent[]) => events.reduce(roof, roofInitial);
const runDoor = (events: DoorEvent[]) => events.reduce(door, doorInitial);

describe('roof episode', () => {
  it('reveals the two items in order and asks only afterwards', () => {
    const early = runRoof([{ type: 'SHOW_COMPARE' }, { type: 'REVEAL_NEXT' }, { type: 'CHOOSE', id: 'source' }]);
    expect(early.revealed).toBe(1);
    expect(early.choice).toBeNull();

    const s = runRoof([{ type: 'SHOW_COMPARE' }, { type: 'REVEAL_NEXT' }, { type: 'REVEAL_NEXT' }, { type: 'REVEAL_NEXT' }]);
    expect(s.revealed).toBe(2);
  });

  it('a repeated submit or rule click does not skip steps', () => {
    const s = runRoof([
      { type: 'SHOW_COMPARE' },
      { type: 'SHOW_COMPARE' },
      { type: 'REVEAL_NEXT' },
      { type: 'REVEAL_NEXT' },
      { type: 'CHOOSE', id: 'uninvolved' },
      { type: 'SUBMIT' },
      { type: 'CHOOSE', id: 'source' },
      { type: 'SUBMIT' },
      { type: 'SHOW_RULE' },
      { type: 'SHOW_RULE' },
    ]);
    expect(s.step).toBe('rule');
    expect(s.submittedChoice).toBe('uninvolved');
    expect(roof(s, { type: 'SHOW_CONSEQUENCES' }).step).toBe('consequences');
  });
});

describe('door episode', () => {
  it('the choice can change until it is confirmed', () => {
    const s = runDoor([{ type: 'CHOOSE', id: 'wait' }, { type: 'CHOOSE', id: 'damage' }, { type: 'SUBMIT' }, { type: 'CHOOSE', id: 'wait' }]);
    expect(s).toMatchObject({ step: 'outcome', decision: 'damage', viewing: 'damage' });
  });

  it('viewing the other branch keeps the first decision', () => {
    const s = runDoor([{ type: 'CHOOSE', id: 'wait' }, { type: 'SUBMIT' }, { type: 'TOGGLE_BRANCH' }]);
    expect(s).toMatchObject({ decision: 'wait', viewing: 'damage' });
    expect(door(s, { type: 'TOGGLE_BRANCH' }).viewing).toBe('wait');
  });

  it('a double submit stays in the outcome; the rule needs a decision first', () => {
    expect(runDoor([{ type: 'SHOW_RULE' }]).step).toBe('choose');
    const s = runDoor([{ type: 'CHOOSE', id: 'damage' }, { type: 'SUBMIT' }, { type: 'SUBMIT' }]);
    expect(s.step).toBe('outcome');
    expect(door(door(s, { type: 'SHOW_RULE' }), { type: 'TOGGLE_BRANCH' }).viewing).toBe('damage');
  });
});
