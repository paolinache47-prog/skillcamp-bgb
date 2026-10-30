import type { Segment } from '../content/types';
import { useImageStatus } from '../hooks/useImageStatus';
import { ArrowRightIcon } from './Icons';

export function Intro({ segment, onStart }: { segment: Segment; onStart: () => void }) {
  const { intro, media } = segment;
  const poster = useImageStatus(media.poster);

  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="intro-text">
        <p className="eyebrow">{intro.caption}</p>
        <h1 id="intro-title" className="intro-title" tabIndex={-1}>
          {intro.title}
        </h1>
        <p className="lead">{intro.lead}</p>
        <p className="intro-meta">{intro.meta}</p>
        <div className="intro-actions">
          <button type="button" className="button button-primary" onClick={onStart}>
            {intro.cta}
            <ArrowRightIcon />
          </button>
          <span className="intro-note">{intro.mediaNote}</span>
        </div>
      </div>

      <figure className="intro-media" style={{ aspectRatio: `${media.width} / ${media.height}` }}>
        {poster.state === 'ok' ? (
          <img
            src={media.poster}
            alt="Empfangsbereich: Ein Besucher steht vor der Theke, dahinter die Kollegin, rechts ein Mitarbeiter des Sicherheitsdienstes."
          />
        ) : (
          <div className="media-placeholder" aria-hidden={poster.state === 'loading'}>
            {poster.state === 'error' && <span>Vorschaubild nicht verfügbar</span>}
          </div>
        )}
      </figure>
    </section>
  );
}
