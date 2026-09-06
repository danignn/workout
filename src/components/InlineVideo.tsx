import { useEffect, useState } from 'react';
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

/** Plays a clip saved to this device. */
export function OwnClip({ clipId }: { clipId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;
    getPhoto(clipId).then((blob) => {
      if (cancelled) return;
      if (!blob) {
        setMissing(true);
        return;
      }
      revoke = URL.createObjectURL(blob);
      setUrl(revoke);
    });
    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [clipId]);

  if (missing) return <div className="chart-empty">That saved video is no longer on this device.</div>;
  if (!url) return <div className="chart-empty">Loading your video…</div>;
  return <video className="video-frame" src={url} controls autoPlay playsInline preload="metadata" />;
}
