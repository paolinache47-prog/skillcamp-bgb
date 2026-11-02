import { useLayoutEffect, useRef, type Dispatch, type ReactNode } from 'react';
import type { MediaConfig } from '../content/types';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import type { SegmentEvent, SegmentState } from '../state/segmentMachine';
import { VideoScene, type VideoSceneHandle } from './VideoScene';

interface Props {
  heading: string;
  /** Short narrative line connecting this scene to the previous one. */
  lead?: string;
  context: string;
  media: MediaConfig;
  state: SegmentState;
  dispatch: Dispatch<SegmentEvent>;
  /** Markers or highlights on the still frame. */
  renderOverlay?: (natural: { width: number; height: number }) => ReactNode;
  /** Learning panel; shown next to (desktop) or below (mobile) the frame once it was reached. */
  renderPanel: (replay: () => void) => ReactNode;
  /** Replaces the main clip, e.g. with a branch continuation video. */
  stageOverride?: ReactNode;
  /** Short caption under the frame, e.g. that a continuation is told as text. */
  stageNote?: ReactNode;
}

/**
 * Video first and centred; after the freeze it slides into the left column and the
 * panel appears on the right. One movement, skipped with reduced motion.
 */
export function SituationScreen({ heading, lead, context, media, state, dispatch, renderOverlay, renderPanel, stageOverride, stageNote }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<VideoSceneHandle>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const split = state.freezeReached;

  const lastRect = useRef<DOMRect | null>(null);
  const wasSplit = useRef(split);
  useLayoutEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const now = el.getBoundingClientRect();
    const before = lastRect.current;
    if (split && !wasSplit.current && before && !reducedMotion && window.matchMedia('(min-width: 1024px)').matches) {
      el.animate(
        [
          { transform: `translateX(${before.left - now.left}px)`, width: `${before.width}px` },
          { transform: 'translateX(0)', width: `${now.width}px` },
        ],
        { duration: 300, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      );
    }
    wasSplit.current = split;
    lastRect.current = now;
  });

  return (
    <section className={`situation${split ? ' is-split' : ''}`} aria-labelledby="situation-title">
      <div ref={mainRef} className="situation-main">
        <div className="situation-head">
          <h1 id="situation-title" className="scene-title" tabIndex={-1}>
            {heading}
          </h1>
          {lead && <p className="scene-lead">{lead}</p>}
          <p className="scene-context">{context}</p>
        </div>

        {stageOverride ?? (
          <VideoScene ref={videoRef} media={media} state={state} dispatch={dispatch} renderOverlay={renderOverlay ?? (() => null)} />
        )}
        {stageNote && <p className="stage-note">{stageNote}</p>}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {state.phase === 'analysis' ? 'Die Szene ist angehalten. Die Analyse finden Sie neben dem Standbild.' : ''}
      </p>

      {split && (
        <aside className="situation-panel" aria-label="Analyse der Situation">
          {renderPanel(() => videoRef.current?.replay())}
        </aside>
      )}
    </section>
  );
}
