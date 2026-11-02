import { describe, expect, it } from 'vitest';
import { createDoorReducer, doorInitial, roofInitial, roofReducer, type DoorEvent, type RoofEvent } from './episodeMachines';

const door = createDoorReducer(['damage', 'wait']);
const runRoof = (events: RoofEvent[]) => events.reduce(roofReducer, roofInitial);
const runDoor = (events: DoorEvent[]) => events.reduce(door, doorInitial);

describe('roof episode', () => {
  it('the comparison follows the answer, never before it', () => {
    const s = runRoof([{ type: 'SHOW_RULE' }, { type: 'SUBMIT' }]);
    expect(s.step).toBe('question');
    const changed = runRoof([{ type: 'CHOOSE', id: 'uninvolved' }, { type: 'CHOOSE', id: 'source' }]);
    expect(changed.choice).toBe('source');
  });

  it('a repeated submit or rule click does not skip steps', () => {
    const s = runRoof([
      { type: 'CHOOSE', id: 'uninvolved' },
      { type: 'SUBMIT' },
      { type: 'CHOOSE', id: 'source' },
      { type: 'SUBMIT' },
      { type: 'SHOW_RULE' },
      { type: 'SHOW_RULE' },
    ]);
    expect(s.step).toBe('rule');
    expect(s.submittedChoice).toBe('uninvolved');
    expect(roofReducer(s, { type: 'SHOW_CONSEQUENCES' }).step).toBe('consequences');
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

  it('a double submit stays in the outcome; the rule needs the role question first', () => {
    expect(runDoor([{ type: 'SHOW_RULE' }]).step).toBe('choose');
    const s = runDoor([{ type: 'CHOOSE', id: 'damage' }, { type: 'SUBMIT' }, { type: 'SUBMIT' }]);
    expect(s.step).toBe('outcome');
    expect(door(s, { type: 'SHOW_RULE' }).step).toBe('outcome');

    const role = door(s, { type: 'SHOW_ROLE' });
    expect(door(role, { type: 'SHOW_RULE' }).step).toBe('role');
    expect(door(role, { type: 'SUBMIT_ROLE' }).roleAnswer).toBeNull();
    expect(door(role, { type: 'TOGGLE_BRANCH' }).viewing).toBe('damage');

    const answered = [{ type: 'CHOOSE_ROLE', id: 'source' }, { type: 'SUBMIT_ROLE' }, { type: 'CHOOSE_ROLE', id: 'access' }, { type: 'SUBMIT_ROLE' }] as DoorEvent[];
    const a = answered.reduce(door, role);
    expect(a.roleAnswer).toBe('source');

    const rule = door(a, { type: 'SHOW_RULE' });
    expect(rule.step).toBe('rule');
    expect(door(a, { type: 'SHOW_COMPARE' }).step).toBe('role');
    expect(door(rule, { type: 'SHOW_COMPARE' }).step).toBe('compare');
  });
});
