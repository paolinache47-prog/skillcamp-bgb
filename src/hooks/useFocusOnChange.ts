import { useEffect, useRef, type RefObject } from 'react';

/**
 * Moves focus to `target` (or its first h1/h2) whenever `key` changes — not on mount,
 * so content that appears by itself never steals focus.
 */
export function useFocusOnChange(key: string, target: RefObject<HTMLElement | null>, options: { scrollTop?: boolean } = {}) {
  const previous = useRef(key);
  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    const el = target.current;
    const heading = el?.matches('h1, h2') ? el : el?.querySelector<HTMLElement>('h1, h2');
    heading?.focus({ preventScroll: options.scrollTop });
    if (options.scrollTop) window.scrollTo({ top: 0 });
  }, [key, target, options.scrollTop]);
}
