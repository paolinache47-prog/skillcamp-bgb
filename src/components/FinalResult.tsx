import { useState } from 'react';
import type { DecisionId, FinalCheck } from '../content/types';
import type { FinalState } from '../state/finalMachine';
import { CheckIcon, InfoIcon, ReplayIcon } from './Icons';
import { LegalSources } from './LegalSources';

interface Props {
  content: FinalCheck;
  state: FinalState;
  correct: number;
  total: number;
  onReview: () => void;
  onBack: () => void;
  /** 'check': only the final check again; 'course': the whole lesson from the intro. */
  onRestart: (scope: 'check' | 'course') => void;
}

/** First-attempt result (unchanged by the repetition), memo, sources and a confirmed restart. */
export function FinalResult({ content, state, correct, total, onReview, onBack, onRestart }: Props) {
  const [confirming, setConfirming] = useState(false);
  const { result } = content;
  const ids = content.tasks.flatMap((t) => t.decisions);
  const hasErrors = correct < total;
  const repeated = state.review?.answers ?? {};

  return (
    <section className="complete final-result" aria-labelledby="result-title">
      <p className="eyebrow">{content.kicker}</p>
      <h1 id="result-title" className="scene-title" tabIndex={-1}>
        {result.heading}
      </h1>
      <p className="result-score">
        <strong>
          {correct} von {total}
        </strong>{' '}
        Entscheidungen beim ersten Versuch richtig.
      </p>
      {!hasErrors && <p className="result-all">{result.allCorrect}</p>}

      <ul className="result-list" aria-label="Entscheidungen im ersten Versuch">
        {ids.map((id: DecisionId) => {
          const d = content.decisions[id];
          const ok = state.first[id] === d.correct;
          const again = repeated[id];
          return (
            <li key={id} className={ok ? 'is-correct' : 'is-incorrect'}>
              <span className="result-icon" aria-hidden="true">
                {ok ? <CheckIcon /> : <InfoIcon />}
              </span>
              <span className="result-label">{d.label}</span>
              <span className="result-state">
                {ok ? 'richtig' : 'nicht richtig'}
                {!ok && again !== undefined && (again === d.correct ? ' · Wiederholung richtig' : ' · Wiederholung nicht richtig')}
              </span>
            </li>
          );
        })}
      </ul>

      <h2 className="complete-subtitle">{result.memoHeading}</h2>
      <ul className="complete-points">
        {result.memo.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      <div className="result-actions">
        {hasErrors && (
          <button type="button" className="button button-primary" onClick={onReview}>
            <ReplayIcon />
            {result.reviewLabel}
          </button>
        )}
        <LegalSources triggerClassName="button button-secondary" />
        <button type="button" className="button button-ghost" onClick={onBack}>
          Zurück zur letzten Aufgabe
        </button>
        {!confirming && (
          <button type="button" className="button button-ghost" onClick={() => setConfirming(true)}>
            {result.restartLabel}
          </button>
        )}
      </div>

      {confirming && (
        <div className="restart-confirm" role="group" aria-labelledby="restart-text">
          <p id="restart-text">{result.restartConfirm}</p>
          <div className="result-actions">
            <button type="button" className="button button-secondary" onClick={() => onRestart('check')}>
              {result.restartCheckLabel}
            </button>
            <button type="button" className="button button-secondary" onClick={() => onRestart('course')}>
              {result.restartCourseLabel}
            </button>
            <button type="button" className="button button-ghost" onClick={() => setConfirming(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
