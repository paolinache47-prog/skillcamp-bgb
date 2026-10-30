import { useEffect, useMemo, useReducer, useRef } from 'react';
import type { RoofEpisode as RoofContent } from '../content/types';
import { useFocusOnChange } from '../hooks/useFocusOnChange';
import { createRoofReducer, roofInitial } from '../state/episodeMachines';
import { createReducer, initialState } from '../state/segmentMachine';
import { ChoiceGroup, Feedback } from './ChoiceGroup';
import { HotspotScene } from './HotspotScene';
import { ArrowRightIcon, CheckIcon, ReplayIcon } from './Icons';
import { SituationScreen } from './SituationScreen';

export function RoofEpisode({ episode, onComplete }: { episode: RoofContent; onComplete: () => void }) {
  const [video, videoDispatch] = useReducer(useMemo(() => createReducer([]), []), { ...initialState, phase: 'ready' });
  const { compare } = episode;
  const [state, dispatch] = useReducer(useMemo(() => createRoofReducer(compare.items.length), [compare.items.length]), roofInitial);

  const interactive = video.phase === 'analysis';
  // The same roof area is marked from the first revealed item through the rule.
  const lastItem = compare.items[compare.items.length - 1];
  const highlight =
    state.step === 'compare'
      ? (compare.items[state.revealed - 1]?.highlightLabel ?? null)
      : state.step === 'continuation'
        ? null
        : lastItem.highlightLabel;
  const answer = compare.options.find((o) => o.id === state.submittedChoice);

  const panelRef = useRef<HTMLDivElement>(null);
  useFocusOnChange(state.step, panelRef);

  // The clicked reveal button disappears: continue with the next one, then with the question.
  const revealedBefore = useRef(state.revealed);
  useEffect(() => {
    if (revealedBefore.current === state.revealed) return;
    revealedBefore.current = state.revealed;
    panelRef.current?.querySelector<HTMLElement>('.reveal-button, .option-group input')?.focus();
  }, [state.revealed]);

  // Same after the check: the submit button is replaced by the feedback (announced via aria-live).
  useEffect(() => {
    if (state.submittedChoice) panelRef.current?.querySelector<HTMLElement>('.panel-actions .button-primary')?.focus();
  }, [state.submittedChoice]);

  return (
    <SituationScreen
      heading={episode.scene.heading}
      context={episode.scene.context}
      media={episode.media}
      state={video}
      dispatch={videoDispatch}
      renderOverlay={(natural) => (
        <HotspotScene hotspots={[]} natural={natural} highlight={highlight ? { region: compare.region, label: highlight } : null} />
      )}
      renderPanel={(replay) => (
        <div ref={panelRef} className="panel">
          {state.step === 'continuation' && (
            <>
              <h2 className="panel-title" tabIndex={-1}>
                {episode.continuation.heading}
              </h2>
              <p className="panel-kicker">Fortsetzung als Text</p>
              <p className="panel-text">{episode.continuation.text}</p>
              <div className="panel-actions">
                <button type="button" className="button button-primary" disabled={!interactive} onClick={() => dispatch({ type: 'SHOW_COMPARE' })}>
                  Vergleichen
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

          {state.step === 'compare' && (
            <>
              <h2 className="panel-title" tabIndex={-1}>
                {compare.heading}
              </h2>
              <p className="panel-instruction">{compare.instruction}</p>

              <ol className="reveal-list">
                {compare.items.map((item, i) => {
                  const shown = i < state.revealed;
                  return (
                    <li key={item.label} className={shown ? 'is-shown' : undefined}>
                      <span className="reveal-index" aria-hidden="true">
                        {shown ? <CheckIcon /> : i + 1}
                      </span>
                      {shown ? (
                        <span className="reveal-text">{item.text}</span>
                      ) : i === state.revealed ? (
                        <button type="button" className="reveal-button" disabled={!interactive} onClick={() => dispatch({ type: 'REVEAL_NEXT' })}>
                          {item.label} zeigen
                        </button>
                      ) : (
                        <span className="reveal-pending">{item.label}</span>
                      )}
                    </li>
                  );
                })}
              </ol>

              {state.revealed === compare.items.length && (
                <form
                  className="panel-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    dispatch({ type: 'SUBMIT' });
                  }}
                >
                  <ChoiceGroup
                    legend={compare.question}
                    options={compare.options}
                    value={state.choice}
                    disabled={!interactive || state.submittedChoice !== null}
                    onChange={(id) => dispatch({ type: 'CHOOSE', id })}
                  />
                  {state.submittedChoice === null && (
                    <button type="submit" className="button button-primary" disabled={!interactive || state.choice === null}>
                      {compare.submitLabel}
                    </button>
                  )}
                </form>
              )}

              <div aria-live="polite">{answer && <Feedback positive={answer.correct}>{answer.feedback}</Feedback>}</div>

              {answer && (
                <div className="panel-actions">
                  <button type="button" className="button button-primary" disabled={!interactive} onClick={() => dispatch({ type: 'SHOW_RULE' })}>
                    Zur Regel
                    <ArrowRightIcon />
                  </button>
                </div>
              )}
            </>
          )}

          {state.step === 'rule' && (
            <>
              <h2 className="panel-title" tabIndex={-1}>
                {episode.rule.heading}
              </h2>
              <p className="panel-text">{episode.rule.text}</p>
              <div className="panel-actions">
                <button type="button" className="button button-primary" onClick={() => dispatch({ type: 'SHOW_CONSEQUENCES' })}>
                  Anwendung und Folgen
                  <ArrowRightIcon />
                </button>
              </div>
            </>
          )}

          {state.step === 'consequences' && (
            <>
              <p className="panel-kicker">{episode.rule.heading}</p>
              <h2 className="panel-title" tabIndex={-1}>
                {episode.consequences.heading}
              </h2>
              <p className="panel-text">{episode.consequences.application}</p>
              <p className="panel-text">{episode.consequences.addition}</p>
              <p className="panel-note">{episode.consequences.note}</p>
              <div className="panel-actions">
                <button type="button" className="button button-primary" onClick={onComplete}>
                  {episode.nextLabel}
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
