import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState, type Dispatch, type ReactNode } from 'react';
import type { MediaConfig } from '../content/types';
import { useImageStatus } from '../hooks/useImageStatus';
import type { SegmentEvent, SegmentState } from '../state/segmentMachine';
import { MutedIcon, PauseIcon, PlayIcon, ReplayIcon, SoundIcon, TextIcon } from './Icons';

export interface VideoSceneHandle {
  replay: () => void;
}

interface Props {
  media: MediaConfig;
  state: SegmentState;
  dispatch: Dispatch<SegmentEvent>;
  /** Rendered over the still frame only, never over moving video. */
  renderOverlay: (natural: { width: number; height: number }) => ReactNode;
}

/** Tolerance for "reached the target time" and for detecting a seek past it. */
const EPSILON = 0.04;

export const VideoScene = forwardRef<VideoSceneHandle, Props>(function VideoScene({ media, state, dispatch, renderOverlay }, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptId = useId();
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(true);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [natural, setNatural] = useState({ width: media.width, height: media.height });
  const freezeImage = useImageStatus(media.freezeFrame);

  const { phase } = state;
  const target = media.pauseAtSeconds;
  const frozen = phase === 'analysis';
  const videoMissing = state.media === 'error';

  // Set right before a pause we trigger ourselves, so it is not mistaken for a user pause.
  const autoPause = useRef(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const holdAtTarget = (v: HTMLVideoElement) => {
    if (!v.paused) {
      autoPause.current = true;
      v.pause();
    }
    if (v.readyState >= 1 && Math.abs(v.currentTime - target) > EPSILON) v.currentTime = target;
  };

  const freeze = (v: HTMLVideoElement) => {
    holdAtTarget(v);
    dispatch({ type: 'FREEZE_REACHED' });
  };

  const play = async (fromStart: boolean) => {
    const v = videoRef.current;
    if (!v) return;
    if (fromStart || v.currentTime >= target - EPSILON) v.currentTime = 0;
    try {
      await v.play();
    } catch (err) {
      // AbortError only means a pause interrupted the request.
      if ((err as DOMException).name !== 'AbortError') dispatch({ type: 'PLAY_FAILED' });
    }
  };

  useImperativeHandle(ref, () => ({ replay: () => void play(true) }));

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  // Watch the media clock while playing: frame callbacks where supported, timeupdate as backup.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || phase !== 'playing') return;
    const reached = (t: number) => {
      if (t < target - EPSILON) return false;
      freeze(v);
      return true;
    };
    const onTime = () => reached(v.currentTime);
    v.addEventListener('timeupdate', onTime);

    let frameId = 0;
    const hasFrameCallback = 'requestVideoFrameCallback' in v;
    if (hasFrameCallback) {
      const step: VideoFrameRequestCallback = (_now, meta) => {
        if (!reached(meta.mediaTime)) frameId = v.requestVideoFrameCallback(step);
      };
      frameId = v.requestVideoFrameCallback(step);
    }
    return () => {
      v.removeEventListener('timeupdate', onTime);
      if (hasFrameCallback) v.cancelVideoFrameCallback(frameId);
    };
  }, [phase, target]);

  // Analysis reached another way (text alternative, "Zum Standbild"): stop and hold the frame.
  useEffect(() => {
    if (frozen && videoRef.current) holdAtTarget(videoRef.current);
  }, [frozen]);

  const onPause = () => {
    const v = videoRef.current;
    if (autoPause.current) {
      autoPause.current = false;
      return;
    }
    if (!v || v.ended) return;
    dispatch({ type: 'USER_PAUSED' });
  };

  const onSeeked = () => {
    const v = videoRef.current;
    if (!v || phaseRef.current === 'analysis') return;
    if (v.currentTime > target + EPSILON) freeze(v);
  };

  const showFreezeImage = frozen && freezeImage.state === 'ok';
  const stillAvailable = frozen && (showFreezeImage || !videoMissing);
  const overlayNatural = showFreezeImage ? freezeImage : natural;
  const playing = phase === 'playing';
  const canFreezeJump = state.freezeReached && (phase === 'playing' || phase === 'paused');

  const mainControl = (() => {
    if (phase === 'ready') return { label: 'Video abspielen', icon: <PlayIcon />, action: () => play(false) };
    if (phase === 'playing') return { label: 'Pause', icon: <PauseIcon />, action: () => videoRef.current?.pause() };
    if (phase === 'paused') return { label: 'Fortsetzen', icon: <PlayIcon />, action: () => play(false) };
    return null;
  })();

  return (
    <div className="video-scene">
      <div className={`stage${frozen ? ' is-frozen' : ''}`} style={{ aspectRatio: `${natural.width} / ${natural.height}` }}>
        {!videoMissing && (
          <video
            ref={videoRef}
            className="stage-media"
            src={media.src}
            poster={media.poster}
            preload="auto"
            playsInline
            muted
            aria-label={media.title}
            onLoadedMetadata={(e) => setNatural({ width: e.currentTarget.videoWidth, height: e.currentTarget.videoHeight })}
            onLoadedData={() => dispatch({ type: 'MEDIA_READY' })}
            onCanPlay={() => dispatch({ type: 'MEDIA_READY' })}
            onError={() => dispatch({ type: 'MEDIA_ERROR' })}
            onPlaying={(e) => {
              setBuffering(false);
              // A late "playing" after a seek can arrive once we already paused at the target.
              if (!e.currentTarget.paused) dispatch({ type: 'PLAYING' });
            }}
            onWaiting={() => setBuffering(true)}
            onPause={onPause}
            onSeeked={onSeeked}
            onEnded={(e) => freeze(e.currentTarget)}
          />
        )}

        {showFreezeImage && <img className="stage-media stage-freeze" src={media.freezeFrame} alt="" />}

        {videoMissing && !showFreezeImage && (
          <div className="stage-unavailable">
            <p>Das Video ist derzeit nicht verfügbar.</p>
            {!frozen && (
              <button
                type="button"
                className="button button-secondary"
                aria-expanded={transcriptOpen}
                aria-controls={transcriptId}
                onClick={() => setTranscriptOpen((o) => !o)}
              >
                <TextIcon />
                Situation lesen
              </button>
            )}
          </div>
        )}

        {phase === 'ready' && !videoMissing && (
          <button type="button" className="stage-play" onClick={() => play(false)} aria-label="Video abspielen">
            <PlayIcon />
          </button>
        )}

        {buffering && playing && (
          <div className="stage-status" role="status">
            Video wird geladen …
          </div>
        )}

        {stillAvailable && renderOverlay(overlayNatural)}
      </div>

      <div className="controls">
        {!videoMissing && mainControl && (
          <button type="button" className={`button ${phase === 'ready' ? 'button-primary' : 'button-secondary'}`} onClick={mainControl.action}>
            {mainControl.icon}
            {mainControl.label}
          </button>
        )}
        {!videoMissing && phase !== 'ready' && !frozen && (
          <button type="button" className="button button-ghost" onClick={() => play(true)}>
            <ReplayIcon />
            Von vorn
          </button>
        )}
        {canFreezeJump && (
          <button type="button" className="button button-ghost" onClick={() => dispatch({ type: 'FREEZE_REACHED' })}>
            Zum Standbild
          </button>
        )}
        {frozen && <span className="controls-status">Standbild</span>}
        {!videoMissing && !frozen && media.hasAudio && (
          <button type="button" className="button button-ghost" aria-pressed={!muted} onClick={() => setMuted((m) => !m)}>
            {muted ? <MutedIcon /> : <SoundIcon />}
            {muted ? 'Ton ein' : 'Ton aus'}
          </button>
        )}
        <span className="controls-spacer" />
        {/* While the "unavailable" notice offers it, the stage button is the only one. */}
        {!(videoMissing && !frozen) && (
          <button
            type="button"
            className="button button-ghost"
            aria-expanded={transcriptOpen}
            aria-controls={transcriptId}
            onClick={() => setTranscriptOpen((o) => !o)}
          >
            <TextIcon />
            Situation lesen
          </button>
        )}
      </div>

      {state.media === 'loading' && phase === 'ready' && (
        <p className="hint" role="status">
          Video wird geladen …
        </p>
      )}
      {state.playFailed && !videoMissing && (
        <p className="hint hint-warning" role="status">
          Die Wiedergabe konnte nicht gestartet werden. Versuchen Sie es erneut oder lesen Sie die Situation als Text.
        </p>
      )}

      <section id={transcriptId} className="transcript" hidden={!transcriptOpen} aria-labelledby={`${transcriptId}-title`}>
        <h2 id={`${transcriptId}-title`} className="transcript-title">
          Die Situation als Text
        </h2>
        {media.transcript.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {!state.freezeReached && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              setTranscriptOpen(false);
              dispatch({ type: 'FREEZE_REACHED' });
            }}
          >
            Weiter zur Analyse
          </button>
        )}
      </section>
    </div>
  );
});
