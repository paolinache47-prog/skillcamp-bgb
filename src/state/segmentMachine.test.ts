import { describe, expect, it } from 'vitest';
import { createReducer, initialState, type SegmentEvent, type SegmentState } from './segmentMachine';

const reducer = createReducer(['visitor', 'colleague']);
const run = (events: SegmentEvent[], from: SegmentState = initialState) => events.reduce(reducer, from);

const toAnalysis: SegmentEvent[] = [{ type: 'START' }, { type: 'PLAYING' }, { type: 'FREEZE_REACHED' }];

describe('segment flow', () => {
  it('a user pause mid-video does not open the analysis', () => {
    const s = run([{ type: 'START' }, { type: 'PLAYING' }, { type: 'USER_PAUSED' }]);
    expect(s.phase).toBe('paused');
    expect(s.freezeReached).toBe(false);
  });

  it('repeated ended / seek events after the freeze are ignored', () => {
    const s = run([...toAnalysis, { type: 'SELECT_HOTSPOT', id: 'visitor' }, { type: 'FREEZE_REACHED' }]);
    expect(s.phase).toBe('analysis');
    expect(s.activeHotspot).toBe('visitor');

    const later = run([{ type: 'SELECT_HOTSPOT', id: 'colleague' }, { type: 'CONTINUE' }, { type: 'FREEZE_REACHED' }], s);
    expect(later.phase).toBe('decision');
  });

  it('a replay keeps the discovered details', () => {
    const s = run([
      ...toAnalysis,
      { type: 'SELECT_HOTSPOT', id: 'visitor' },
      { type: 'PLAYING' },
      { type: 'FREEZE_REACHED' },
      { type: 'SELECT_HOTSPOT', id: 'visitor' },
    ]);
    expect(s.phase).toBe('analysis');
    expect(s.explored).toEqual(['visitor']);
  });

  it('continues only after both details and ignores hotspots outside the freeze', () => {
    const playing = run([{ type: 'START' }, { type: 'PLAYING' }, { type: 'SELECT_HOTSPOT', id: 'visitor' }]);
    expect(playing.explored).toEqual([]);

    const one = run([...toAnalysis, { type: 'SELECT_HOTSPOT', id: 'visitor' }, { type: 'CONTINUE' }]);
    expect(one.phase).toBe('analysis');
  });

  it('the text alternative reaches the analysis without the video', () => {
    const s = run([{ type: 'MEDIA_ERROR' }, { type: 'START' }, { type: 'FREEZE_REACHED' }]);
    expect(s.media).toBe('error');
    expect(s.phase).toBe('analysis');
  });

  it('submits once; a second submit does not change the answer', () => {
    const decided = run([
      ...toAnalysis,
      { type: 'SELECT_HOTSPOT', id: 'visitor' },
      { type: 'SELECT_HOTSPOT', id: 'colleague' },
      { type: 'CONTINUE' },
      { type: 'SUBMIT' },
    ]);
    expect(decided.phase).toBe('decision');

    const s = run([{ type: 'CHOOSE', id: 'yes' }, { type: 'SUBMIT' }, { type: 'CHOOSE', id: 'no' }, { type: 'SUBMIT' }], decided);
    expect(s.phase).toBe('feedback');
    expect(s.submittedChoice).toBe('yes');
  });

  it('restart clears progress but keeps the known media status', () => {
    const s = run([{ type: 'MEDIA_READY' }, ...toAnalysis, { type: 'SELECT_HOTSPOT', id: 'visitor' }, { type: 'RESTART' }]);
    expect(s).toEqual({ ...initialState, phase: 'ready', media: 'ready' });
  });
});
