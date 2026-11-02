import { useId, useMemo, useReducer, useRef, useState, type Dispatch, type FocusEvent } from 'react';
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

/**
 * Final case: video → continuation with conditions → task 1 on the still frame.
 * Task 1 locks both answers first; correctness appears only after the written part.
 */
export function CaseTask({ content, state, dispatch }: Props) {
  // Coming back from task 2 shows the still frame again instead of the start of the video.
  const [video, videoDispatch] = useReducer(
    useMemo(() => createReducer([]), []),
    state.caseProgress === 'assign' ? { ...initialState, phase: 'analysis', freezeReached: true } : { ...initialState, phase: 'ready' },
  );
  const task = content.tasks[0];
  const { written } = content;
  const decisions = task.decisions.map((id) => content.decisions[id]);
  const locked = state.checked.includes(task.id);
  const revealed = state.written.revealed;
  const answers = locked ? state.first : state.draft;
  const [active, setActive] = useState<DecisionId | null>(null);
  const activeDecision = decisions.find((d) => d.id === active);
  const interactive = video.phase === 'analysis';
  const complete = decisions.every((d) => state.draft[d.id] !== undefined);
  const ownText = state.written.text.trim();
  const fieldId = useId();

  // Each stage replaces the button just used, so focus moves to the new heading.
  const stage = state.caseProgress === 'continuation' ? 'continuation' : !locked ? 'assign' : !revealed ? 'written' : 'results';
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusOnChange(stage, panelRef);

  const select = (id: string) => {
    if (state.caseProgress !== 'assign') return;
    setActive(id as DecisionId);
    requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 1023px)').matches) document.querySelector('.stage')?.scrollIntoView({ block: 'start' });
      panelRef.current?.querySelector('.option-group')?.scrollIntoView({ block: 'nearest' });
    });
  };

  // The on-screen keyboard shrinks the view: keep the field and the button under it reachable.
  const keepFieldVisible = (e: FocusEvent<HTMLTextAreaElement>) => {
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    const field = e.currentTarget.parentElement;
    const reveal = () => field?.scrollIntoView({ block: 'start' });
    reveal();
    window.visualViewport?.addEventListener('resize', reveal, { once: true });
  };

  // Mistakes first, so the wrongly classified intervention stands out.
  const outcomes = [...decisions].sort((a, b) => Number(state.first[a.id] === a.correct) - Number(state.first[b.id] === b.correct));

  const kicker = (
    <p className="panel-kicker">
      {content.kicker} · Aufgabe 1 von {content.tasks.length}
    </p>
  );
  const conditions = (
    <ul className="condition-list">
      {content.conditions.items.map((c) => (
        <li key={c}>{c}</li>
      ))}
    </ul>
  );
  const conditionsDetails = (
    <details className="conditions-details">
      <summary>{content.conditions.heading.replace(/:$/, '')}</summary>
      {conditions}
    </details>
  );
  // Neutral before the results: the chosen wording only, no right or wrong.
  const targets = (
    <div className="assign-targets" role="group" aria-label="Eingriffe">
      {decisions.map((d, i) => {
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
            <span className="assign-target-label">
              <span className="marker-number" aria-hidden="true">
                {i + 1}
              </span>
              {d.label}
            </span>
            <span className="assign-target-value">{chosen ?? 'Noch nicht zugeordnet'}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <SituationScreen
      heading={content.scene.heading}
      // Opens the case once; not repeated when returning to the still frame.
      lead={state.caseProgress === 'continuation' ? content.scene.lead : undefined}
      context={content.scene.context}
      media={content.media}
      state={video}
      dispatch={videoDispatch}
      renderOverlay={(natural) =>
        state.caseProgress === 'assign' ? <HotspotScene hotspots={caseHotspots} natural={natural} activeId={active} onSelect={select} /> : null
      }
      renderPanel={(replay) => (
        <div ref={panelRef} className="panel">
          {stage === 'continuation' && (
            <>
              <h2 className="panel-title" tabIndex={-1}>
                {content.continuation.heading}
              </h2>
              <p className="panel-label">Fortsetzung als Text</p>
              <p className="panel-text">{content.continuation.text}</p>
              <div>
                <h3 className="conditions-title">{content.conditions.heading}</h3>
                {conditions}
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
          )}

          {stage === 'assign' && (
            <>
              {kicker}
              <h2 className="panel-title" tabIndex={-1}>
                {task.heading}
              </h2>
              {conditionsDetails}
              {targets}
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
                <button type="button" className="button button-primary" disabled={!interactive || !complete} onClick={() => dispatch({ type: 'SUBMIT' })}>
                  {task.submitLabel}
                </button>
              </div>
            </>
          )}

          {stage === 'written' && (
            <>
              {kicker}
              <h2 className="panel-title" tabIndex={-1}>
                {written.heading}
              </h2>
              {conditionsDetails}
              {targets}
              <p id={`${fieldId}-prompt`} className="written-prompt">
                {written.prompt}
              </p>
              <div className="written-field">
                <label htmlFor={fieldId}>{written.label}</label>
                <textarea
                  id={fieldId}
                  rows={5}
                  aria-describedby={`${fieldId}-prompt`}
                  onFocus={keepFieldVisible}
                  placeholder={written.placeholder}
                  value={state.written.text}
                  onChange={(e) => dispatch({ type: 'WRITE', text: e.target.value })}
                />
              </div>
              <div className="panel-actions">
                <button
                  type="button"
                  className="button button-primary"
                  disabled={ownText === ''}
                  onClick={() => dispatch({ type: 'REVEAL_MODEL', mode: 'compare' })}
                >
                  {written.compareLabel}
                </button>
                <button type="button" className="button button-ghost" onClick={() => dispatch({ type: 'REVEAL_MODEL', mode: 'unsure' })}>
                  {written.unsureLabel}
                </button>
              </div>
            </>
          )}

          {stage === 'results' && (
            <>
              {kicker}
              <h2 className="panel-title" tabIndex={-1}>
                {written.resultHeading}
              </h2>
              <div className="outcome-list">
                {outcomes.map((d) => (
                  <DecisionOutcome key={d.id} decision={d} answer={state.first[d.id]} feedback={feedbackFor(d, state.first[d.id])} named />
                ))}
              </div>
              <div className="written-compare">
                {ownText !== '' && (
                  <section className="written-block">
                    <h3>{written.ownHeading}</h3>
                    <p>{ownText}</p>
                  </section>
                )}
                <section className="written-block written-model">
                  <h3>{written.modelHeading}</h3>
                  <p>{written.model}</p>
                </section>
              </div>
              <fieldset className="self-check">
                <legend>{written.selfCheckCaption}</legend>
                {written.selfChecks.map((c) => (
                  <label key={c.id}>
                    <input
                      type="checkbox"
                      checked={Boolean(state.written.selfCheck[c.id])}
                      onChange={() => dispatch({ type: 'TOGGLE_SELF_CHECK', id: c.id })}
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </fieldset>
              <div className="panel-actions">
                <button type="button" className="button button-primary" onClick={() => dispatch({ type: 'NEXT' })}>
                  Weiter
                  <ArrowRightIcon />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    />
  );
}
