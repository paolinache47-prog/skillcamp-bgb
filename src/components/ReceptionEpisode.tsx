import { useEffect, useMemo, useReducer, useRef } from 'react';
import type { Segment } from '../content/types';
import { useFocusOnChange } from '../hooks/useFocusOnChange';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { createReducer, initialState, type Phase } from '../state/segmentMachine';
import { DecisionCheck } from './DecisionCheck';
import { ExplanationPanel } from './ExplanationPanel';
import { HotspotScene } from './HotspotScene';
import { Intro } from './Intro';
import { SituationScreen } from './SituationScreen';

function screenFor(phase: Phase) {
  if (phase === 'intro') return 'intro';
  if (phase === 'decision' || phase === 'feedback' || phase === 'segmentComplete') return 'decision';
  return 'situation';
}

/** Intro and episode 1 (Notwehr am Empfang). Calls `onComplete` once the segment is finished. */
export function ReceptionEpisode({ segment, onComplete }: { segment: Segment; onComplete: () => void }) {
  const hotspotIds = useMemo(() => segment.media.hotspots.map((h) => h.id), [segment]);
  const reducer = useMemo(() => createReducer(hotspotIds), [hotspotIds]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const reducedMotion = usePrefersReducedMotion();
  const screen = screenFor(state.phase);

  const rootRef = useRef<HTMLDivElement>(null);
  useFocusOnChange(screen, rootRef, { scrollTop: true });

  // FINISH is accepted only once by the reducer, so this fires once per run.
  useEffect(() => {
    if (state.phase === 'segmentComplete') onComplete();
  }, [state.phase, onComplete]);

  return (
    <div ref={rootRef}>
      {screen === 'intro' && <Intro segment={segment} onStart={() => dispatch({ type: 'START' })} />}
      {screen === 'situation' && (
        <SituationScreen
          heading={segment.scene.heading}
          context={segment.scene.context}
          media={segment.media}
          state={state}
          dispatch={dispatch}
          renderOverlay={(natural) => (
            <HotspotScene
              hotspots={segment.media.hotspots}
              natural={natural}
              activeId={state.activeHotspot}
              explored={state.explored}
              onSelect={(id) => {
                dispatch({ type: 'SELECT_HOTSPOT', id });
                // On narrow screens the panel sits below the frame: bring the text into view, keep focus.
                requestAnimationFrame(() =>
                  document.querySelector('.explanation')?.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' }),
                );
              }}
            />
          )}
          renderPanel={(replay) => (
            <ExplanationPanel segment={segment} state={state} dispatch={dispatch} canReplay={state.media !== 'error'} onReplay={replay} />
          )}
        />
      )}
      {screen === 'decision' && <DecisionCheck segment={segment} state={state} dispatch={dispatch} />}
    </div>
  );
}
