import { useEffect, useMemo, useReducer, useRef, useState, type Dispatch } from 'react';
import { caseHotspots, feedbackFor } from '../content/finalCheck';
import type { DecisionId, FinalCheck } from '../content/types';
import { useFocusOnChange } from '../hooks/useFocusOnChange';
import type { FinalEvent, FinalState } from '../state/finalMachine';
import { createReducer, initialState } from '../state/segmentMachine';
import { ChoiceGroup } from './ChoiceGroup';
import { DecisionOutcome } from './DecisionOutcome';
import { HotspotScene } from './HotspotScene';
import { ArrowRightIcon, ReplayIcon } from './Icons';
import { SituationScreen } from './SituationScreen';

interface Props {
  content: FinalCheck;
  state: FinalState;
  dispatch: Dispatch<FinalEvent>;
}

/** Final case: video → continuation with conditions → task 1 on the still frame. */
export function CaseTask({ content, state, dispatch }: Props) {
  // Coming back from task 2 shows the still frame again instead of the start of the video.
  const [video, videoDispatch] = useReducer(
    useMemo(() => createReducer([]), []),
    state.caseProgress === 'assign' ? { ...initialState, phase: 'analysis', freezeReached: true } : { ...initialState, phase: 'ready' },
  );
  const task = content.tasks[0];
  const decisions = task.decisions.map((id) => content.decisions[id]);
  const checked = state.checked.includes(task.id);
  const answers = checked ? state.first : state.draft;
  const [active, setActive] = useState<DecisionId | null>(null);
  const activeDecision = decisions.find((d) => d.id === active);
  const interactive = video.phase === 'analysis';
  const complete = decisions.every((d) => state.draft[d.id] !== undefined);

  const panelRef = useRef<HTMLDivElement>(null);
  useFocusOnChange(state.caseProgress, panelRef);
  // The check button is replaced by the feedback: continue with "Weiter".
  useEffect(() => {
    if (checked) panelRef.current?.querySelector<HTMLElement>('.panel-actions .button-primary')?.focus();
  }, [checked]);

  const select = (id: string) => {
    if (state.caseProgress !== 'assign') return;
    setActive(id as DecisionId);
    requestAnimationFrame(() => panelRef.current?.querySelector('.option-group, .outcome-list')?.scrollIntoView({ block: 'nearest' }));
  };

  // Mistakes first, so the wrongly classified intervention stands out.
  const outcomes = [...decisions].sort(
    (a, b) => Number(state.first[a.id] === a.correct) - Number(state.first[b.id] === b.correct),
  );

  return (
    <SituationScreen
      heading={content.scene.heading}
      context={content.scene.context}
      media={content.media}
      state={video}
      dispatch={videoDispatch}
      renderOverlay={(natural) =>
        state.caseProgress === 'assign' ? (
          <HotspotScene hotspots={caseHotspots} natural={natural} activeId={active} onSelect={select} />
        ) : null
      }
      renderPanel={(replay) => (
        <div ref={panelRef} className="panel">
          {state.caseProgress === 'continuation' ? (
            <>
              <h2 className="panel-title" tabIndex={-1}>
                {content.continuation.heading}
              </h2>
              <p className="panel-label">Fortsetzung als Text</p>
              <p className="panel-text">{content.continuation.text}</p>
              <div>
                <h3 className="conditions-title">{content.conditions.heading}</h3>
                <ul className="condition-list">
                  {content.conditions.items.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <div className="panel-actions">
                <button type="button" className="button button-primary" disabled={!interactive} onClick={() => dispatch({ type: 'CASE_NEXT' })}>
                  Zum Selbstcheck
                  <ArrowRightIcon />
                </button>
                {video.media !== 'error' && (
                  <button type="button" className="button button-ghost" disabled={!interactive} onClick={replay}>
                    <ReplayIcon />
                    Video erneut ansehen
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="panel-kicker">
                {content.kicker} · Aufgabe 1 von {content.tasks.length}
              </p>
              <h2 className="panel-title" tabIndex={-1}>
                {task.heading}
              </h2>
              <details className="conditions-details">
                <summary>{content.conditions.heading.replace(/:$/, '')}</summary>
                <ul className="condition-list">
                  {content.conditions.items.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </details>

              <div className="assign-targets" role="group" aria-label="Eingriffe">
                {decisions.map((d) => {
                  const chosen = d.options.find((o) => o.id === answers[d.id])?.label;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      className={`assign-target${active === d.id ? ' is-active' : ''}`}
                      aria-pressed={active === d.id}
                      disabled={!interactive}
                      onClick={() => select(d.id)}
                    >
                      <span className="assign-target-label">{d.label}</span>
                      <span className="assign-target-value">{chosen ?? 'Noch nicht zugeordnet'}</span>
                    </button>
                  );
                })}
              </div>

              {!checked && (
                <>
                  {activeDecision ? (
                    <ChoiceGroup
                      key={activeDecision.id}
                      legend={`Rechtsgrundlage: ${activeDecision.label}`}
                      options={activeDecision.options}
                      value={state.draft[activeDecision.id] ?? null}
                      disabled={!interactive}
                      onChange={(option) => dispatch({ type: 'SELECT', id: activeDecision.id, option })}
                    />
                  ) : (
                    <p className="explanation-empty">Wählen Sie eine Markierung im Bild oder einen der Eingriffe oben.</p>
                  )}
                  <div className="panel-actions">
                    <button
                      type="button"
                      className="button button-primary"
                      disabled={!interactive || !complete}
                      onClick={() => dispatch({ type: 'SUBMIT' })}
                    >
                      {task.submitLabel}
                    </button>
                  </div>
                </>
              )}

              <div className="outcome-list" aria-live="polite">
                {checked &&
                  outcomes.map((d) => (
                    <DecisionOutcome key={d.id} decision={d} answer={state.first[d.id]} feedback={feedbackFor(d, state.first[d.id])} named />
                  ))}
              </div>

              {checked && (
                <div className="panel-actions">
                  <button type="button" className="button button-primary" onClick={() => dispatch({ type: 'NEXT' })}>
                    Weiter
                    <ArrowRightIcon />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    />
  );
}
