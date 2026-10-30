import { useMemo, useReducer, useRef } from 'react';
import type { DecisionId, FinalCheck } from '../content/types';
import { useFocusOnChange } from '../hooks/useFocusOnChange';
import { createFinalReducer, finalInitial, reviewDecisions, score, type FinalConfig } from '../state/finalMachine';
import { CaseTask } from './CaseTask';
import { FinalResult } from './FinalResult';
import { TaskScreen } from './TaskScreen';

/** Final case, tasks 1–5, result and repetition of mistakes. `onRestart` starts a fresh attempt or the whole lesson. */
export function FinalCheckFlow({ content, onRestart }: { content: FinalCheck; onRestart: (scope: 'check' | 'course') => void }) {
  const config: FinalConfig = useMemo(
    () => ({
      tasks: content.tasks.map((t) => ({ id: t.id, decisions: t.decisions })),
      correct: Object.fromEntries(Object.values(content.decisions).map((d) => [d.id, d.correct])) as Record<DecisionId, string>,
    }),
    [content],
  );
  const [state, dispatch] = useReducer(useMemo(() => createFinalReducer(config), [config]), finalInitial);
  const total = content.tasks.length;

  const rootRef = useRef<HTMLDivElement>(null);
  useFocusOnChange(`${state.step}:${state.review?.index ?? ''}`, rootRef, { scrollTop: true });

  let screen;
  if (state.step === 'assign') {
    screen = <CaseTask content={content} state={state} dispatch={dispatch} />;
  } else if (state.step === 'result') {
    const s = score(state, config);
    screen = (
      <FinalResult
        content={content}
        state={state}
        correct={s.correct}
        total={s.total}
        onReview={() => dispatch({ type: 'START_REVIEW' })}
        onBack={() => dispatch({ type: 'BACK' })}
        onRestart={onRestart}
      />
    );
  } else if (state.step === 'review' && state.review) {
    const r = state.review;
    const task = content.tasks.find((t) => t.id === r.tasks[r.index])!;
    const ids = reviewDecisions(state, config, task.id);
    const checked = r.checked.includes(task.id);
    screen = (
      <TaskScreen
        key={`review-${task.id}`}
        task={task}
        kicker={`Wiederholung · ${r.index + 1} von ${r.tasks.length}`}
        note="Ihr Ergebnis des ersten Versuchs bleibt unverändert."
        decisions={ids.map((id) => content.decisions[id])}
        answers={checked ? r.answers : r.draft}
        checked={checked}
        onSelect={(id, option) => dispatch({ type: 'REVIEW_SELECT', id, option })}
        onSubmit={() => dispatch({ type: 'REVIEW_SUBMIT' })}
        onNext={() => dispatch({ type: 'REVIEW_NEXT' })}
        nextLabel={r.index + 1 < r.tasks.length ? 'Nächster Fehler' : 'Zum Ergebnis'}
        caseImage={task.showCaseImage ? content.media.freezeFrame : undefined}
        context={task.id === 'assign' ? <CaseContext content={content} /> : undefined}
      />
    );
  } else {
    const index = content.tasks.findIndex((t) => t.id === state.step);
    const task = content.tasks[index];
    const checked = state.checked.includes(task.id);
    screen = (
      <TaskScreen
        key={task.id}
        task={task}
        kicker={`${content.kicker} · Aufgabe ${index + 1} von ${total}`}
        decisions={task.decisions.map((id) => content.decisions[id])}
        answers={checked ? state.first : state.draft}
        checked={checked}
        onSelect={(id, option) => dispatch({ type: 'SELECT', id, option })}
        onSubmit={() => dispatch({ type: 'SUBMIT' })}
        onNext={() => dispatch({ type: 'NEXT' })}
        nextLabel={index + 1 < total ? 'Weiter' : 'Zum Ergebnis'}
        onBack={() => dispatch({ type: 'BACK' })}
        caseImage={task.showCaseImage ? content.media.freezeFrame : undefined}
      />
    );
  }

  return <div ref={rootRef}>{screen}</div>;
}

/** The case in words for the repetition of task 1 (no hotspots there). */
function CaseContext({ content }: { content: FinalCheck }) {
  return (
    <div className="assumption">
      <p className="assumption-label">Fall</p>
      <p>{content.continuation.text}</p>
      <ul className="condition-list">
        {content.conditions.items.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
