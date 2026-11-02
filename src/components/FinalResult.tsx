import { useState } from 'react';
import type { FinalCheck } from '../content/types';
import { ReplayIcon } from './Icons';
import { LegalSources } from './LegalSources';

interface Props {
  content: FinalCheck;
  correct: number;
  total: number;
  /** Topics of the first-attempt mistakes, each once. */
  topics: FinalCheck['result']['topics'];
  /** The optional repetition of mistakes has been completed. */
  reviewDone: boolean;
  onReview: () => void;
  onBack: () => void;
  /** 'check': only the final check again; 'course': the whole lesson from the intro. */
  onRestart: (scope: 'check' | 'course') => void;
}

/** First-attempt result (unchanged by the repetition), memo, sources and a confirmed restart. */
export function FinalResult({ content, correct, total, topics, reviewDone, onReview, onBack, onRestart }: Props) {
  const [confirming, setConfirming] = useState(false);
  const { result } = content;
  const hasErrors = correct < total;

  return (
    <section className="complete final-result" aria-labelledby="result-title">
      <p className="eyebrow">{content.kicker}</p>
      <h1 id="result-title" className="scene-title" tabIndex={-1}>
        {result.heading}: <strong>{correct} von {total}</strong> Entscheidungen beim ersten Versuch richtig.
      </h1>
      {!hasErrors && <p className="result-all">{result.allCorrect}</p>}
      <p className="result-written">{result.writtenNote}</p>

      {hasErrors && (
        <>
          <h2 className="complete-subtitle">{result.topicsHeading}</h2>
          <ul className="complete-points result-topics">
            {topics.map((t) => (
              <li key={t.label}>{t.label}</li>
            ))}
          </ul>
        </>
      )}
      {reviewDone && (
        <p className="result-review-done">
          <strong>{result.reviewDone}</strong> {result.reviewDoneNote}
        </p>
      )}

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

      <h2 className="complete-subtitle">{result.memoHeading}</h2>
      <ul className="complete-points">
        {result.memo.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      {/* Only an announcement: there is no next module to link to yet. */}
      <aside className="next-topic" aria-labelledby="next-topic-title">
        <h2 id="next-topic-title" className="next-topic-title">
          {result.nextTopic.heading}
        </h2>
        <p>{result.nextTopic.text}</p>
        <p className="next-topic-caption">{result.nextTopic.caption}</p>
      </aside>
    </section>
  );
}
