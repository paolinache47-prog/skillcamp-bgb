import { useCallback, useRef, useState } from 'react';
import { course, type CourseContent } from '../content/lesson';
import type { Stage } from '../content/types';
import { useFocusOnChange } from '../hooks/useFocusOnChange';
import { DoorEpisode } from './DoorEpisode';
import { LegalSources } from './LegalSources';
import { MobilePreview, useCloseFromPreviewFrame } from './MobilePreview';
import { ReceptionEpisode } from './ReceptionEpisode';
import { RoofEpisode } from './RoofEpisode';
import { FinalCheckFlow } from './FinalCheckFlow';
import { PerspectivesIntro } from './PerspectivesIntro';

type EpisodeId = 'reception' | 'roof' | 'door' | 'perspectives' | 'final';

const order: EpisodeId[] = ['reception', 'roof', 'door', 'perspectives', 'final'];
const stageOf: Record<EpisodeId, Stage> = {
  reception: 'verstehen',
  roof: 'unterscheiden',
  door: 'unterscheiden',
  perspectives: 'anwenden',
  final: 'anwenden',
};

export function CourseShell({ content }: { content: CourseContent }) {
  const [episode, setEpisode] = useState<EpisodeId>(content.start);
  // A new run remounts the episodes, so a restart begins with fresh state.
  const [run, setRun] = useState(0);
  const stage = stageOf[episode];
  useCloseFromPreviewFrame(content.preview);

  // Advance only from the episode that asked: repeated clicks cannot skip one.
  const advanceFrom = useCallback(
    (from: EpisodeId) => setEpisode((current) => (current === from ? order[order.indexOf(from) + 1] : current)),
    [],
  );
  const afterReception = useCallback(() => advanceFrom('reception'), [advanceFrom]);

  const mainRef = useRef<HTMLElement>(null);
  useFocusOnChange(`${episode}:${run}`, mainRef, { scrollTop: true });

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Zum Inhalt springen
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="topbar-title">{course.title}</span>
          <ol className="stage-progress" aria-label="Aufbau der Lerneinheit">
            {course.stages.map((s, i) => {
              const current = s.id === stage;
              const later = i > course.stages.findIndex((x) => x.id === stage);
              return (
                <li key={s.id} className={current ? 'is-current' : undefined} aria-current={current ? 'step' : undefined}>
                  {s.label}
                  {later && <span className="visually-hidden"> (folgt)</span>}
                </li>
              );
            })}
          </ol>
          {!content.preview && <MobilePreview />}
          <LegalSources />
        </div>
      </header>

      <main id="main" ref={mainRef} className="main">
        {episode === 'reception' && <ReceptionEpisode key={run} segment={content.reception} onComplete={afterReception} />}
        {episode === 'roof' && <RoofEpisode episode={content.roof} onComplete={() => advanceFrom('roof')} />}
        {episode === 'door' && <DoorEpisode episode={content.door} onComplete={() => advanceFrom('door')} />}
        {episode === 'perspectives' && <PerspectivesIntro screen={content.perspectives} onNext={() => advanceFrom('perspectives')} />}
        {episode === 'final' && (
          <FinalCheckFlow
            key={run}
            content={content.final}
            onRestart={(scope) => {
              setRun((r) => r + 1);
              if (scope === 'course') setEpisode('reception');
            }}
          />
        )}
      </main>
    </div>
  );
}
