import type { Dispatch } from 'react';
import type { Segment } from '../content/types';
import { useImageStatus } from '../hooks/useImageStatus';
import type { SegmentEvent, SegmentState } from '../state/segmentMachine';
import { ArrowRightIcon, CheckIcon, InfoIcon } from './Icons';

interface Props {
  segment: Segment;
  state: SegmentState;
  dispatch: Dispatch<SegmentEvent>;
}

export function DecisionCheck({ segment, state, dispatch }: Props) {
  const { decision, media } = segment;
  const still = useImageStatus(media.freezeFrame);
  const submitted = state.phase === 'feedback';
  const answer = decision.options.find((o) => o.id === state.submittedChoice);

  return (
    <section className="decision" aria-labelledby="decision-title">
      <div className="decision-main">
        <h1 id="decision-title" className="scene-title" tabIndex={-1}>
          {decision.heading}
        </h1>

        <div className="assumption">
          <p className="assumption-label">Angenommen</p>
          <p>{decision.scenario}</p>
        </div>

        <form
          className="choice-form"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: 'SUBMIT' });
          }}
        >
          <fieldset disabled={submitted}>
            <legend className="choice-question">{decision.question}</legend>
            <div className="choices">
              {decision.options.map((o) => (
                <label key={o.id} className={`choice${state.choice === o.id ? ' is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="decision"
                    value={o.id}
                    checked={state.choice === o.id}
                    onChange={() => dispatch({ type: 'CHOOSE', id: o.id })}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {!submitted && (
            <button type="submit" className="button button-primary" disabled={state.choice === null}>
              Entscheidung prüfen
            </button>
          )}
        </form>

        <div aria-live="polite">
          {submitted && answer && (
            <div className={`feedback ${answer.correct ? 'is-correct' : 'is-incorrect'}`}>
              <span className="feedback-icon" aria-hidden="true">
                {answer.correct ? <CheckIcon /> : <InfoIcon />}
              </span>
              <p>{answer.feedback}</p>
            </div>
          )}
        </div>

        {submitted && (
          <button type="button" className="button button-primary" onClick={() => dispatch({ type: 'FINISH' })}>
            {segment.nextLabel}
            <ArrowRightIcon />
          </button>
        )}
      </div>

      {still.state === 'ok' && (
        <figure className="decision-still">
          <img src={media.freezeFrame} alt="" />
          <figcaption>Ausgangssituation aus dem Video. Die veränderte Lage ist nur angenommen.</figcaption>
        </figure>
      )}
    </section>
  );
}
