import { useEffect, useRef, useState } from 'react';
import type { BranchVideo as BranchVideoConfig } from '../content/types';
import { MutedIcon, PauseIcon, PlayIcon, SoundIcon, TextIcon } from './Icons';

interface Props {
  video: BranchVideoConfig;
  title: string;
  /** Width/height of the main clip, so the stage keeps its size. */
  width: number;
  height: number;
  /**
   * 'play': start right away (mounted by the learner's click, muted) from `startAt`.
   * 'end': show the final frame of an already watched clip, without playing.
   */
  mode: 'play' | 'end';
  onEnded: () => void;
  /** The learner chose to read the text continuation instead. */
  onReadText: () => void;
  /** The clip could not be loaded or played: fall back to the text continuation. */
  onUnavailable: () => void;
}

/** Continuation clip of a door branch, shown in place of the start scene. */
export function BranchVideo({ video, title, width, height, mode, onEnded, onReadText, onUnavailable }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'paused' | 'blocked' | 'ended'>(mode === 'end' ? 'ended' : 'loading');
  const [muted, setMuted] = useState(true);
  const startAt = video.startAt ?? 0;

  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);

  const play = async () => {
    const v = ref.current;
    if (!v) return;
    try {
      await v.play();
    } catch (err) {
      const name = (err as DOMException).name;
      // NotAllowedError: the browser wants another click. Anything but AbortError is a real failure.
      if (name === 'NotAllowedError') setStatus('blocked');
      else if (name !== 'AbortError') onUnavailable();
    }
  };

  const onLoadedMetadata = () => {
    const v = ref.current;
    if (!v) return;
    if (mode === 'end') {
      v.currentTime = Math.max(0, v.duration - 0.05);
      return;
    }
    if (startAt > 0) v.currentTime = startAt;
    void play();
  };

  const playing = status === 'playing';

  return (
    <div className="video-scene">
      <div className="stage" style={{ aspectRatio: `${width} / ${height}` }}>
        <video
          ref={ref}
          className="stage-media"
          src={video.src}
          poster={video.poster}
          preload="auto"
          playsInline
          muted
          aria-label={title}
          onLoadedMetadata={onLoadedMetadata}
          onError={onUnavailable}
          onPlaying={() => setStatus('playing')}
          onPause={(e) => !e.currentTarget.ended && mode === 'play' && setStatus('paused')}
          onEnded={() => {
            setStatus('ended');
            onEnded();
          }}
        />
        {status === 'loading' && (
          <div className="stage-status" role="status">
            Video wird geladen …
          </div>
        )}
        {status === 'blocked' && (
          <button type="button" className="stage-play" onClick={play} aria-label="Video abspielen">
            <PlayIcon />
          </button>
        )}
      </div>

      <div className="controls">
        {(playing || status === 'paused' || status === 'blocked') && (
          <button type="button" className="button button-secondary" onClick={() => (playing ? ref.current?.pause() : play())}>
            {playing ? <PauseIcon /> : <PlayIcon />}
            {playing ? 'Pause' : status === 'blocked' ? 'Video abspielen' : 'Fortsetzen'}
          </button>
        )}
        {status === 'ended' && <span className="controls-status">Ende des Videos</span>}
        <button type="button" className="button button-ghost" aria-pressed={!muted} onClick={() => setMuted((m) => !m)}>
          {muted ? <MutedIcon /> : <SoundIcon />}
          {muted ? 'Ton ein' : 'Ton aus'}
        </button>
        <span className="controls-spacer" />
        {status !== 'ended' && (
          <button
            type="button"
            className="button button-ghost"
            onClick={() => {
              ref.current?.pause();
              onReadText();
            }}
          >
            <TextIcon />
            Als Text lesen
          </button>
        )}
      </div>
    </div>
  );
}
