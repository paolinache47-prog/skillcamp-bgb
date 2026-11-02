import { useEffect, useRef, type ReactNode } from 'react';
import { feedbackFor } from '../content/finalCheck';
import type { DecisionId, FinalTask, ScoredDecision } from '../content/types';
import { ChoiceGroup } from './ChoiceGroup';
import { DecisionOutcome } from './DecisionOutcome';
import { ArrowRightIcon } from './Icons';

interface Props {
  task: FinalTask;
  kicker: string;
  /** The decisions asked on this screen (in the repetition only the wrong ones). */
  decisions: ScoredDecision[];
  answers: Partial<Record<DecisionId, string>>;
  checked: boolean;
  /** Overrides the task's button label (repetition). */
  submitLabel?: string;
  onSelect: (id: DecisionId, option: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  nextLabel: string;
  onBack?: () => void;
  caseImage?: string;
  /** Extra context above the questions, e.g. the case text in the repetition of task 1. */
  context?: ReactNode;
  note?: string;
}

/** One task of the final check on its own screen: questions, one check, feedback, next. */
export function TaskScreen({ task, kicker, decisions, answers, checked, submitLabel, onSelect, onSubmit, onNext, nextLabel, onBack, caseImage, context, note }: Props) {
  const complete = decisions.every((d) => answers[d.id] !== undefined);
  const named = decisions.length > 1;

  // The check button is replaced by the feedback: continue with the next button.
  const nextRef = useRef<HTMLButtonElement>(null);
  const wasChecked = useRef(checked);
  useEffect(() => {
    if (checked && !wasChecked.current) nextRef.current?.focus();
    wasChecked.current = checked;
  }, [checked]);

  return (
    <section className="decision task-screen" aria-labelledby={`task-${task.id}`}>
      <div className="decision-main">
        <p className="panel-kicker">{kicker}</p>
        <h1 id={`task-${task.id}`} className="scene-title" tabIndex={-1}>
          {task.heading}
        </h1>
        {note && <p className="task-note">{note}</p>}
        {context}
        {task.scenario && (
          <div className="assumption">
            <p className="assumption-label">Situation</p>
            <p>{task.scenario}</p>
          </div>
        )}

        <form
          className="choice-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {decisions.map((d) => (
            <div key={d.id} className="task-question">
              <ChoiceGroup
                legend={d.prompt}
                options={d.options}
                value={answers[d.id] ?? null}
                disabled={checked}
                onChange={(option) => onSelect(d.id, option)}
              />
              <div aria-live="polite">
                {checked && <DecisionOutcome decision={d} answer={answers[d.id]} feedback={feedbackFor(d, answers[d.id])} named={named} />}
              </div>
            </div>
          ))}

          <div className="panel-actions">
            {onBack && (
              <button type="button" className="button button-ghost" onClick={onBack}>
                Zurück
              </button>
            )}
            {!checked ? (
              <button type="submit" className="button button-primary" disabled={!complete}>
                {submitLabel ?? task.submitLabel}
              </button>
            ) : (
              <button ref={nextRef} type="button" className="button button-primary" onClick={onNext}>
                {nextLabel}
                <ArrowRightIcon />
              </button>
            )}
          </div>
        </form>
      </div>

      {caseImage && (
        <figure className="decision-still">
          <img src={caseImage} alt="" />
          <figcaption>Fall: Hund und Glasflasche am Eingang.</figcaption>
        </figure>
      )}
    </section>
  );
}
