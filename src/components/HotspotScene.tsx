import { useRef } from 'react';
import type { Hotspot, RelBox } from '../content/types';
import { useContainRect } from '../hooks/useContainRect';
import { CheckIcon } from './Icons';

interface Props {
  hotspots: Pick<Hotspot, 'id' | 'label' | 'marker' | 'region'>[];
  natural: { width: number; height: number };
  activeId?: string | null;
  explored?: string[];
  onSelect?: (id: string) => void;
  /** A labelled area without a marker (used when there is nothing to click). */
  highlight?: { region: RelBox; label: string } | null;
}

const pct = (v: number) => `${v * 100}%`;

/** Markers on the still frame, anchored to the real image area inside the object-fit: contain stage. */
export function HotspotScene({ hotspots, natural, activeId = null, explored = [], onSelect, highlight }: Props) {
  const layerRef = useRef<HTMLDivElement>(null);
  const rect = useContainRect(layerRef, natural.width, natural.height);
  const active = hotspots.find((h) => h.id === activeId);
  const region = highlight?.region ?? active?.region;

  return (
    <div ref={layerRef} className="hotspot-layer">
      {rect && (
        <div className="hotspot-frame" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
          {region && (
            <div
              key={active?.id ?? 'highlight'}
              className={`hotspot-region${highlight ? ' is-outline' : ''}`}
              aria-hidden="true"
              style={{ left: pct(region.x), top: pct(region.y), width: pct(region.w), height: pct(region.h) }}
            >
              {highlight && (
                <span key={highlight.label} className="hotspot-region-label">
                  {highlight.label}
                </span>
              )}
            </div>
          )}
          {hotspots.map((h, i) => {
            const isActive = h.id === activeId;
            const seen = explored.includes(h.id);
            return (
              <button
                key={h.id}
                type="button"
                className={`hotspot${isActive ? ' is-active' : ''}${seen ? ' is-seen' : ''}`}
                style={{ left: pct(h.marker.x), top: pct(h.marker.y) }}
                aria-label={`Markierung ${i + 1}: ${h.label}`}
                aria-pressed={isActive}
                onClick={() => onSelect?.(h.id)}
              >
                <span className="hotspot-dot" aria-hidden="true">
                  {seen && !isActive ? <CheckIcon /> : i + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
