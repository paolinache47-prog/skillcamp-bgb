/**
 * Learning flow of one segment, independent of React and the <video> element.
 *
 * intro → ready → playing ⇄ paused → analysis → decision → feedback → segmentComplete
 *
 * Media status (loading / ready / error) is tracked separately, so a missing video
 * never blocks the flow: the text alternative leads to the same analysis.
 */

export type Phase =
  | 'intro'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'analysis'
  | 'decision'
  | 'feedback'
  | 'segmentComplete';

export type MediaStatus = 'loading' | 'ready' | 'error';

export interface SegmentState {
  phase: Phase;
  media: MediaStatus;
  /** play() was rejected (autoplay policy, decoding problem). */
  playFailed: boolean;
  /** The freeze frame was reached at least once; playback since then is a replay. */
  freezeReached: boolean;
  /** Discovered hotspots, in order. Survives replays. */
  explored: string[];
  activeHotspot: string | null;
  choice: string | null;
  submittedChoice: string | null;
}

export type SegmentEvent =
  | { type: 'START' }
  | { type: 'MEDIA_READY' }
  | { type: 'MEDIA_ERROR' }
  | { type: 'PLAYING' }
  | { type: 'PLAY_FAILED' }
  | { type: 'USER_PAUSED' }
  /** Target time reached, video ended, seek beyond target or text alternative finished. */
  | { type: 'FREEZE_REACHED' }
  | { type: 'SELECT_HOTSPOT'; id: string }
  | { type: 'CONTINUE' }
  | { type: 'CHOOSE'; id: string }
  | { type: 'SUBMIT' }
  | { type: 'FINISH' }
  | { type: 'RESTART' };

export const initialState: SegmentState = {
  phase: 'intro',
  media: 'loading',
  playFailed: false,
  freezeReached: false,
  explored: [],
  activeHotspot: null,
  choice: null,
  submittedChoice: null,
};

const watchPhases: Phase[] = ['ready', 'playing', 'paused', 'analysis'];

export function allExplored(state: SegmentState, hotspotIds: readonly string[]): boolean {
  return hotspotIds.every((id) => state.explored.includes(id));
}

export function createReducer(hotspotIds: readonly string[]) {
  return function reducer(state: SegmentState, event: SegmentEvent): SegmentState {
    switch (event.type) {
      case 'START':
        return state.phase === 'intro' ? { ...state, phase: 'ready' } : state;

      case 'MEDIA_READY':
        return state.media === 'ready' ? state : { ...state, media: 'ready' };

      case 'MEDIA_ERROR':
        return { ...state, media: 'error', phase: state.phase === 'playing' ? 'paused' : state.phase };

      case 'PLAYING':
        if (!watchPhases.includes(state.phase)) return state;
        return { ...state, phase: 'playing', playFailed: false };

      case 'PLAY_FAILED':
        return { ...state, playFailed: true, phase: state.phase === 'playing' ? 'paused' : state.phase };

      case 'USER_PAUSED':
        // A user pause is never an implicit jump to the analysis.
        return state.phase === 'playing' ? { ...state, phase: 'paused' } : state;

      case 'FREEZE_REACHED':
        // Repeated ended/seek events after the analysis started are ignored.
        if (!['ready', 'playing', 'paused'].includes(state.phase)) return state;
        return { ...state, phase: 'analysis', freezeReached: true };

      case 'SELECT_HOTSPOT':
        if (state.phase !== 'analysis' || !hotspotIds.includes(event.id)) return state;
        return {
          ...state,
          activeHotspot: event.id,
          explored: state.explored.includes(event.id) ? state.explored : [...state.explored, event.id],
        };

      case 'CONTINUE':
        if (state.phase !== 'analysis' || !allExplored(state, hotspotIds)) return state;
        return { ...state, phase: 'decision' };

      case 'CHOOSE':
        return state.phase === 'decision' ? { ...state, choice: event.id } : state;

      case 'SUBMIT':
        if (state.phase !== 'decision' || state.choice === null) return state;
        return { ...state, phase: 'feedback', submittedChoice: state.choice };

      case 'FINISH':
        return state.phase === 'feedback' ? { ...state, phase: 'segmentComplete' } : state;

      case 'RESTART':
        return { ...initialState, phase: 'ready', media: state.media };
    }
  };
}
