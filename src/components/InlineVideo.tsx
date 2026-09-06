import { useCallback, useEffect, useRef, useState } from 'react';
import { getPhoto } from '../store/idb';
import { resolveShortTiktok, tiktokSource, type VideoSource } from '../utils/media';
import { PlayIcon } from './Icons';

type EmbeddableSource = Extract<VideoSource, { kind: 'youtube' | 'drive' | 'tiktok' }>;

/**
 * Anything with a real embed address is played in place. A short share link
 * only becomes embeddable once it has been resolved to its numeric id.
 */
function canEmbed(source: VideoSource): source is EmbeddableSource {
  return source.kind === 'youtube' || source.kind === 'drive' || source.kind === 'tiktok';
}

function OpenButton({ source }: { source: VideoSource }) {
  const where =
    source.kind === 'youtube' ? 'YouTube' : source.kind === 'drive' ? 'Drive' : source.kind === 'unknown' ? 'the browser' : 'TikTok';
  return (
    <a className="btn btn-block" href={source.watch} target="_blank" rel="noreferrer noopener">
      <PlayIcon size={16} /> Watch on {where}
    </a>
  );
}

export function VideoPlayer({ source, onSaveFile }: { source: VideoSource; onSaveFile?: () => void }) {
  const [resolved, setResolved] = useState<VideoSource | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Short share links still need resolving before they can be opened cleanly.
  useEffect(() => {
    if (source.kind !== 'tiktok-short') {
      setResolved(null);
      return;
    }
    let cancelled = false;
    resolveShortTiktok(source.watch).then((id) => {
      if (!cancelled && id) setResolved(tiktokSource(id, source.watch));
    });
    return () => {
      cancelled = true;
    };
  }, [source]);

  const effective = source.kind === 'tiktok-short' ? (resolved ?? source) : source;

  const saveRow = onSaveFile && (
    <>
      <button className="btn btn-ghost btn-block" onClick={onSaveFile}>
        Save a video file for this
      </button>
      <p className="tiny faint center">
        Save it once and it plays instantly and offline, even if the original post is deleted.
      </p>
    </>
  );

  if (!online) {
    return (
      <div className="stack-sm">
        <div className="chart-empty">
          You are offline. The written cues below still work, and a saved video file would play without a connection.
        </div>
        {saveRow}
      </div>
    );
  }

  if (canEmbed(effective)) {
    return (
      <div className="stack-sm">
        <iframe
          className={`video-frame${effective.kind === 'tiktok' ? '' : ' video-frame-wide'}`}
          src={effective.embed}
          title="Exercise form video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        <OpenButton source={effective} />
        {saveRow}
      </div>
    );
  }

  // A short link that could not be resolved has no embed address to use.
  return (
    <div className="stack-sm">
      <div className="video-poster">
        <span className="video-poster-icon"><PlayIcon size={26} /></span>
        <span className="small bold">Tap to watch</span>
        <span className="tiny muted center">This one is a short share link, so it opens in TikTok.</span>
      </div>
      <OpenButton source={effective} />
      {saveRow}
    </div>
  );
}

/**
 * Plays a clip saved to this device.
 *
 * Safari will not render video from a blob: URL because it cannot make byte
 * range requests against one, which plays the audio and leaves the picture
 * blank. The service worker route answers Range properly, so it is tried
 * first, and the blob URL is kept only as an automatic fallback for when no
 * worker is controlling the page yet.
 */
export function OwnClip({ clipId }: { clipId: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [noPicture, setNoPicture] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  const mediaUrl = `${import.meta.env.BASE_URL}__media/${encodeURIComponent(clipId)}`;

  // Fall back to a blob URL if the worker route cannot serve the file.
  const useBlobFallback = useCallback(() => {
    if (blobUrlRef.current) {
      setSrc(blobUrlRef.current);
      return;
    }
    getPhoto(clipId).then((blob) => {
      if (!blob) {
        setProblem('That saved video is no longer on this device.');
        return;
      }
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setUsingFallback(true);
      setSrc(url);
    });
  }, [clipId]);

  useEffect(() => {
    let cancelled = false;
    setProblem(null);
    setNoPicture(false);
    setUsingFallback(false);

    // Give the worker a moment to take control after an update, then prefer it.
    const decide = async () => {
      try {
        if (navigator.serviceWorker) {
          await navigator.serviceWorker.ready;
          if (cancelled) return;
          if (navigator.serviceWorker.controller) {
            setSrc(mediaUrl);
            return;
          }
        }
      } catch {
        /* fall through to the blob URL */
      }
      if (!cancelled) useBlobFallback();
    };
    decide();

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [clipId, mediaUrl, useBlobFallback]);

  if (problem) return <div className="chart-empty">{problem}</div>;
  if (!src) return <div className="chart-empty">Loading your video…</div>;

  return (
    <div className="stack-sm">
      <video
        key={src}
        className="video-frame"
        src={src}
        controls
        autoPlay
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          setNoPicture(el.videoWidth === 0 || el.videoHeight === 0);
        }}
        onError={() => {
          // The worker route failed; try the blob URL before giving up.
          if (!usingFallback) {
            useBlobFallback();
            return;
          }
          setProblem('This video could not be played. Re-saving the file usually fixes it.');
        }}
      />
      {noPicture && (
        <p className="tiny" style={{ color: 'var(--pink-700)', fontWeight: 600 }}>
          Sound but no picture means this phone cannot display the file's video format, usually HEVC. Re-save it as
          MP4 and it will play. If you are on iPhone, Settings → Camera → Formats → Most Compatible records MP4.
        </p>
      )}
    </div>
  );
}
