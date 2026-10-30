import { useMemo, useReducer, useRef, useState } from 'react';
import type { DoorEpisode as DoorContent } from '../content/types';
import { useFocusOnChange } from '../hooks/useFocusOnChange';
import { createDoorReducer, doorInitial } from '../state/episodeMachines';
import { createReducer, initialState } from '../state/segmentMachine';
import { BranchVideo } from './BranchVideo';
import { ChoiceGroup, Feedback } from './ChoiceGroup';
import { ArrowRightIcon, ReplayIcon } from './Icons';
import { SituationScreen } from './SituationScreen';

/** How a branch continuation is shown: clip not watched yet, clip watched, or text only. */
type BranchView = 'video' | 'watched' | 'text';

export function DoorEpisode({ episode, onComplete }: { episode: DoorContent; onComplete: () => void }) {
  const [video, videoDispatch] = useReducer(useMemo(() => createReducer([]), []), { ...initialState, phase: 'ready' });
  const ids = useMemo(() => [episode.branches[0].id, episode.branches[1].id] as const, [episode]);
  const [state, dispatch] = useReducer(useMemo(() => createDoorReducer(ids), [ids]), doorInitial);
  const [views, setViews] = useState<Record<string, BranchView>>(() =>
    Object.fromEntries(episode.branches.map((b) => [b.id, b.video.available ? 'video' : 'text'])),
  );
  const setView = (id: string, view: BranchView) => setViews((v) => ({ ...v, [id]: view }));
  // Bumped to remount the clip for "Video erneut ansehen"; only one clip is ever mounted.
  const [replays, setReplays] = useState(0);
  // Clips that failed to load or play: their branch stays in text mode.
  const [failed, setFailed] = useState<string[]>([]);

  const interactive = video.phase === 'analysis';
  const branch = episode.branches.find((b) => b.id === state.viewing);
  const isOwnDecision = state.viewing === state.decision;
  const view = branch ? views[branch.id] : 'text';
  // A watched clip stays on its last frame next to the explanation.
  const showClip = state.step === 'outcome' && branch && view !== 'text';

  const panelRef = useRef<HTMLDivElement>(null);
  useFocusOnChange(`${state.step}:${state.viewing}:${view}:${replays}`, panelRef);

  const replayBranch = (id: string) => {
    setView(id, 'video');
    setReplays((n) => n + 1);
  };

  return (
    <SituationScreen
      heading={episode.scene.heading}
      context={episode.scene.context}
      media={episode.media}
      state={video}
      dispatch={videoDispatch}
      stageOverride={
        showClip && branch ? (
          <BranchVideo
            key={`${branch.id}:${replays}`}
            video={branch.video}
            title={`Video: ${branch.heading}`}
            width={episode.media.width}
            height={episode.media.height}
            mode={view === 'video' ? 'play' : 'end'}
            onEnded={() => setView(branch.id, 'watched')}
            onReadText={() => setView(branch.id, 'text')}
            onUnavailable={() => {
              setFailed((f) => (f.includes(branch.id) ? f : [...f, branch.id]));
              setView(branch.id, 'text');
            }}
          />
        ) : undefined
      }
      stageNote={
        state.step !== 'outcome' || view !== 'text'
          ? undefined
          : video.media === 'error'
            ? 'Der mögliche weitere Verlauf ist im Text beschrieben.'
            : 'Standbild aus dem Video. Der mögliche weitere Verlauf ist im Text beschrieben.'
      }
      renderPanel={(replay) => (
        <div ref={panelRef} className="panel">
          {state.step === 'choose' && (
            <>
              <h2 className="panel-title" tabIndex={-1}>
                {episode.conditions.heading}
              </h2>
              <ul className="condition-list">
                {episode.conditions.items.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <form
                className="panel-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  dispatch({ type: 'SUBMIT' });
                }}
              >
                <ChoiceGroup
                  legend={episode.question}
                  options={episode.branches.map((b) => ({ id: b.id, label: b.choice }))}
                  value={state.choice}
                  disabled={!interactive}
                  onChange={(id) => dispatch({ type: 'CHOOSE', id })}
                />
                <div className="panel-actions">
                  <button type="submit" className="button button-primary" disabled={!interactive || state.choice === null}>
                    {episode.submitLabel}
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

          {state.step === 'outcome' && branch && (
            <>
              <p className="panel-kicker">
                {isOwnDecision ? 'Ihre Entscheidung' : 'Andere Entscheidung'}: {branch.choice}
              </p>
              <h2 className="panel-title" tabIndex={-1}>
                {branch.heading}
              </h2>

              {view === 'video' ? (
                // No explanation before the clip has ended (only the text mode skips ahead).
                <p className="panel-instruction">Das Video zeigt diesen möglichen Verlauf. Danach folgt die Einordnung.</p>
              ) : (
                <>
                  {view === 'text' && (
                    <>
                      <p className="panel-label">Fortsetzung als Text</p>
                      <p className="panel-text">{branch.text}</p>
                    </>
                  )}
                  <div aria-live="polite">
                    <Feedback positive={branch.consistent}>{branch.feedback}</Feedback>
                  </div>
                  <div className="panel-actions">
                    <button type="button" className="button button-primary" onClick={() => dispatch({ type: 'SHOW_RULE' })}>
                      Weiter
                      <ArrowRightIcon />
                    </button>
                    {branch.video.available && !failed.includes(branch.id) && (
                      <button type="button" className="button button-ghost" onClick={() => replayBranch(branch.id)}>
                        <ReplayIcon />
                        Video erneut ansehen
                      </button>
                    )}
                    <button type="button" className="button button-ghost" onClick={() => dispatch({ type: 'TOGGLE_BRANCH' })}>
                      {isOwnDecision ? 'Andere Entscheidung ansehen' : 'Zurück zu Ihrer Entscheidung'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {state.step === 'rule' && (
            <>
              <h2 className="panel-title" tabIndex={-1}>
                {episode.rule.heading}
              </h2>
              <p className="panel-text">{episode.rule.text}</p>
              <dl className="rule-facts">
                <div>
                  <dt>Anwendung</dt>
                  <dd>{episode.rule.application}</dd>
                </div>
                <div>
                  <dt>Ziel</dt>
                  <dd>{episode.rule.purpose}</dd>
                </div>
                <div>
                  <dt>Folge</dt>
                  <dd>{episode.rule.consequence}</dd>
                </div>
              </dl>
              <section className="compare-mini" aria-labelledby="compare-mini-title">
                <h3 id="compare-mini-title" className="compare-mini-title">
                  Im Vergleich
                </h3>
                <ul>
                  {episode.comparison.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p className="compare-mini-note">{episode.comparisonNote}</p>
              </section>
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
