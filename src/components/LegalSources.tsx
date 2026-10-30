import { useId, useRef } from 'react';
import { legalSources } from '../content/lesson';
import { CloseIcon } from './Icons';

/** "Rechtsquellen" trigger plus dialog; the header shows it as a link, the result as a button. */
export function LegalSources({ triggerClassName = 'link-button' }: { triggerClassName?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => dialogRef.current?.showModal()}>
        Rechtsquellen
      </button>
      <dialog
        ref={dialogRef}
        className="sources-dialog"
        aria-labelledby={titleId}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
      >
        <div className="sources-body">
          <div className="sources-head">
            <h2 id={titleId}>Rechtsquellen</h2>
            <button type="button" className="icon-button" aria-label="Schließen" onClick={() => dialogRef.current?.close()}>
              <CloseIcon />
            </button>
          </div>
          <p className="sources-note">Gesetzestexte auf gesetze-im-internet.de. Die Links öffnen sich in einem neuen Tab.</p>
          <ul className="sources-list">
            {legalSources.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  <span className="sources-label">{s.label}</span>
                  <span className="sources-title">{s.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
