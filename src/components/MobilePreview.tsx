import { useEffect, useRef, useState } from 'react';
import { CloseIcon, PhoneIcon } from './Icons';

const CLOSE_MESSAGE = 'mobile-preview-close';

/** Inside the preview frame: Escape never reaches the parent page, so it is forwarded. */
export function useCloseFromPreviewFrame(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      // An open dialog inside the frame (Rechtsquellen) closes first.
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
        window.parent.postMessage(CLOSE_MESSAGE, window.location.origin);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);
}

function previewUrl() {
  const params = new URLSearchParams(window.location.search);
  params.set('preview', 'mobile');
  return `${window.location.pathname}?${params}`;
}

/**
 * Desktop-only preview: the same app in an iframe, so mobile media queries really apply.
 * The frame is its own document with its own in-memory state, so progress in it never
 * touches the lesson behind it. It is created on opening and discarded on closing.
 */
export function MobilePreview() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.source === frameRef.current?.contentWindow && e.data === CLOSE_MESSAGE) {
        dialogRef.current?.close();
      }
    };
    window.addEventListener('message', onMessage);

    // The real viewport can be smaller than 390 × 844 in a small window.
    const frame = frameRef.current;
    const observer = new ResizeObserver(() => frame && setSize({ width: frame.clientWidth, height: frame.clientHeight }));
    if (frame) observer.observe(frame);
    return () => {
      window.removeEventListener('message', onMessage);
      observer.disconnect();
    };
  }, [open]);

  const openPreview = () => {
    // One playing clip at a time: the lesson behind the preview pauses.
    document.querySelectorAll('video').forEach((v) => v.pause());
    setOpen(true);
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button ref={triggerRef} type="button" className="preview-trigger" onClick={openPreview}>
        <PhoneIcon />
        Mobile Vorschau
      </button>
      <dialog
        ref={dialogRef}
        className="preview-dialog"
        aria-labelledby="preview-title"
        onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
      >
        <div className="preview-head">
          <h2 id="preview-title">
            Mobile Vorschau
            {size && (
              <span className="preview-size">
                {size.width} × {size.height} px
              </span>
            )}
          </h2>
          <button type="button" className="icon-button" aria-label="Vorschau schließen" onClick={() => dialogRef.current?.close()}>
            <CloseIcon />
          </button>
        </div>
        {open && <iframe ref={frameRef} className="preview-frame" src={previewUrl()} title="Lerneinheit in der mobilen Ansicht" allow="autoplay; fullscreen" />}
      </dialog>
    </>
  );
}
