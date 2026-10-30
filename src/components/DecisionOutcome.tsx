import type { ScoredDecision } from '../content/types';
import { CheckIcon, InfoIcon } from './Icons';

interface Props {
  decision: ScoredDecision;
  answer: string | undefined;
  /** Feedback text for this decision; null for tasks with one shared feedback. */
  feedback: string | null;
  /** Show the decision's label in the status line (tasks with several decisions). */
  named?: boolean;
}

/** Checked decision: status in words and icon (not colour alone), the chosen answer, the explanation. */
export function DecisionOutcome({ decision, answer, feedback, named }: Props) {
  const correct = answer === decision.correct;
  const chosen = decision.options.find((o) => o.id === answer)?.label;
  const verdict = correct ? 'richtig' : 'nicht richtig';
  const status = named ? `${decision.label}: ${verdict}` : verdict[0].toUpperCase() + verdict.slice(1);

  return (
    <div className={`feedback outcome ${correct ? 'is-correct' : 'is-incorrect'}`}>
      <span className="feedback-icon" aria-hidden="true">
        {correct ? <CheckIcon /> : <InfoIcon />}
      </span>
      <div>
        <p className="outcome-status">{status}</p>
        {!correct && chosen && <p className="outcome-answer">Ihre Antwort: {chosen}</p>}
        {feedback && <p>{feedback}</p>}
      </div>
    </div>
  );
}
