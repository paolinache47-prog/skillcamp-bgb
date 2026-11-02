import type { Dispatch } from 'react';
import type { Segment } from '../content/types';
import { allExplored, type SegmentEvent, type SegmentState } from '../state/segmentMachine';
import { ArrowRightIcon, CheckIcon, InfoIcon, ReplayIcon } from './Icons';

interface Props {
  segment: Segment;
  state: SegmentState;
  dispatch: Dispatch<SegmentEvent>;
  canReplay: boolean;
  onReplay: () => void;
}

export function ExplanationPanel({ segment, state, dispatch, canReplay, onReplay }: Props) {
  const { analysis, media } = segment;
  const hotspots = media.hotspots;
  const interactive = state.phase === 'analysis';
  const active = hotspots.find((h) => h.id === state.activeHotspot);
  const done = allExplored(state, hotspots.map((h) => h.id));

  return (
    <div className="panel panel-hotspots">
      <h2 className="panel-title">{analysis.heading}</h2>
      <p className="panel-instruction">{analysis.instruction}</p>

      <p className="premise">
        <InfoIcon />
        <span>{analysis.premise}</span>
      </p>

      <div className="detail-buttons" role="group" aria-label="Markierte Details">
        {hotspots.map((h, i) => {
          const seen = state.explored.includes(h.id);
          return (
            <button
              key={h.id}
              type="button"
              className={`detail-button${h.id === state.activeHotspot ? ' is-active' : ''}`}
              aria-pressed={h.id === state.activeHotspot}
              disabled={!interactive}
              onClick={() => dispatch({ type: 'SELECT_HOTSPOT', id: h.id })}
            >
              <span className="detail-index" aria-hidden="true">
                {seen ? <CheckIcon /> : i + 1}
              </span>
              {h.label}
              {seen && <span className="visually-hidden"> (angesehen)</span>}
            </button>
          );
        })}
      </div>

      <div className="explanation" aria-live="polite">
        {!interactive ? (
          <p className="explanation-empty">Die Details sind am Standbild verfügbar.</p>
        ) : active ? (
          <div key={active.id} className="explanation-body">
            <h3 className="explanation-title">
              <span className="marker-number" aria-hidden="true">
                {hotspots.indexOf(active) + 1}
              </span>
              {active.title}
            </h3>
            <p>{active.text}</p>
          </div>
        ) : (
          <p className="explanation-empty">Wählen Sie eine Markierung im Bild oder eines der Details oben.</p>
        )}
      </div>

      {done && (
        <section className="summary" aria-labelledby="summary-title">
          <h3 id="summary-title" className="summary-title">
            {analysis.summary.title}
          </h3>
          <p>{analysis.summary.text}</p>
          {analysis.summary.notes?.map((n) => (
            <p key={n} className="summary-note">
              {n}
            </p>
          ))}
        </section>
      )}

      <div className="panel-actions">
        <button
          type="button"
          className="button button-primary"
          disabled={!done || !interactive}
          onClick={() => dispatch({ type: 'CONTINUE' })}
        >
          {done ? 'Situation weiterdenken' : 'Entdecken Sie beide Details'}
          {done && <ArrowRightIcon />}
        </button>
        {canReplay && (
          <button type="button" className="button button-ghost" onClick={onReplay} disabled={!interactive}>
            <ReplayIcon />
            Video erneut ansehen
          </button>
        )}
      </div>
    </div>
  );
}
