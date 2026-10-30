import type { PerspectivesScreen } from '../content/types';
import { ArrowRightIcon } from './Icons';

/** Short white screen before the final check: § 32 StGB and § 227 BGB side by side. Not a task. */
export function PerspectivesIntro({ screen, onNext }: { screen: PerspectivesScreen; onNext: () => void }) {
  return (
    <section className="perspectives" aria-labelledby="perspectives-title">
      <h1 id="perspectives-title" className="scene-title" tabIndex={-1}>
        {screen.heading}
      </h1>
      <p className="lead perspectives-text">{screen.text}</p>
      <div className="perspective-blocks">
        {screen.blocks.map((b) => (
          <div key={b.norm} className="perspective-block">
            <p className="perspective-norm">{b.norm}</p>
            <p>{b.text}</p>
          </div>
        ))}
      </div>
      <p className="perspectives-conclusion">{screen.conclusion}</p>
      <button type="button" className="button button-primary" onClick={onNext}>
        {screen.cta}
        <ArrowRightIcon />
      </button>
    </section>
  );
}
