import { useEffect, useState } from 'react';

export type ImageStatus = { state: 'loading' | 'ok' | 'error'; width: number; height: number };

/** Preloads an image so it can be swapped in without a flash; reports failures instead of a broken image. */
export function useImageStatus(src: string): ImageStatus {
  const [status, setStatus] = useState<ImageStatus>({ state: 'loading', width: 0, height: 0 });

  useEffect(() => {
    let active = true;
    const img = new Image();
    img.onload = () => active && setStatus({ state: 'ok', width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => active && setStatus({ state: 'error', width: 0, height: 0 });
    img.src = src;
    return () => {
      active = false;
    };
  }, [src]);

  return status;
}
