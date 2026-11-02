import { useReducer, useMemo, useRef } from 'react';
import type { RoofEpisode as RoofContent } from '../content/types';
import { useFocusOnChange } from '../hooks/useFocusOnChange';
import { roofInitial, roofReducer } from '../state/episodeMachines';
import { createReducer, initialState } from '../state/segmentMachine';
import { ChoiceGroup, Feedback } from './ChoiceGroup';
import { HotspotScene } from './HotspotScene';
import { ArrowRightIcon, ReplayIcon } from './Icons';
import { SituationScreen } from './SituationScreen';

/** Facts and one practice question first; the comparison and § 228 only after the answer. */
export function RoofEpisode({ episode, onComplete }: { episode: RoofContent; onComplete: () => void }) {
  const [video, videoDispatch] = useReducer(useMemo(() => createReducer([]), []), { ...initialState, phase: 'ready' });
  const { compare, question } = episode;
  const [state, dispatch] = useReducer(roofReducer, roofInitial);

  const interactive = video.phase === 'analysis';
  const correct = state.submittedChoice === question.correct;
  // No marking or label on the frame before the answer.
  const highlight = state.step === 'question' ? null : { region: compare.region, label: compare.highlightLabel };

  // Each step replaces the button just used, so focus moves to the new heading.
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusOnChange(state.step, panelRef);

  return (
    <SituationScreen
      heading={episode.scene.heading}
      lead={episode.scene.lead}
      context={episode.scene.context}
      media={episode.media}
      state={video}
      dispatch={videoDispatch}
      renderOverlay={(natural) => <HotspotScene hotspots={[]} natural={natural} highlight={highlight} />}
      renderPanel={(replay) => (
        <div ref={panelRef} className="panel">
          {state.step === 'question' && (
            <>
              <h2 className="panel-title" tabIndex={-1}>
                {episode.continuation.heading}
              </h2>
              <p className="panel-kicker">Fortsetzung als Text</p>
              <p className="panel-text">{episode.continuation.text}</p>
              <form
                className="panel-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  dispatch({ type: 'SUBMIT' });
                }}
              >
                <ChoiceGroup
                  legend={question.prompt}
                  options={question.options}
                  value={state.choice}
                  disabled={!interactive}
                  onChange={(id) => dispatch({ type: 'CHOOSE', id })}
                />
                <div className="panel-actions">
                  <button type="submit" className="button button-primary" disabled={!interactive || state.choice === null}>
                    {question.submitLabel}
                  </button>
                  {video.media !== 'error' && (
                    <button type="button" className="button button-ghost" disabled={!interactive} onClick={replay}>
                      <ReplayIcon />
                      Video erneut ansehen
                    </button>
                  )}
                </div>
              </form>
            </>
          )}

          {state.step === 'compare' && (
            <>
              <h2 className="panel-title" tabIndex={-1}>
                {compare.heading}
              </h2>
              <div className="compare-mini">
                <ul>
                  {compare.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <Feedback positive={correct}>{`${correct ? 'Richtig.' : 'Nicht ganz.'} ${compare.explanation}`}</Feedback>
              <div className="panel-actions">
                <button type="button" className="button button-primary" onClick={() => dispatch({ type: 'SHOW_RULE' })}>
                  Zur Regel
                  <ArrowRightIcon />
                </button>
              </div>
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
