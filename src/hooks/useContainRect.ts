import { useLayoutEffect, useState, type RefObject } from 'react';

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Where media of the given natural size actually lands inside `ref` with
 * object-fit: contain, so relative hotspot coordinates ignore letterbox bars.
 */
export function useContainRect(ref: RefObject<HTMLElement | null>, naturalWidth: number, naturalHeight: number): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !naturalWidth || !naturalHeight) return;
    const measure = () => {
      const { clientWidth: cw, clientHeight: ch } = el;
      const scale = Math.min(cw / naturalWidth, ch / naturalHeight);
      const width = naturalWidth * scale;
      const height = naturalHeight * scale;
      setRect({ left: (cw - width) / 2, top: (ch - height) / 2, width, height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, naturalWidth, naturalHeight]);

  return rect;
}
