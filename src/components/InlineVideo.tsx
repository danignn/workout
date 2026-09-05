import { useEffect, useState } from 'react';
import { getPhoto } from '../store/idb';
import { resolveShortTiktok, tiktokSource, type VideoSource } from '../utils/media';

function OpenLink({ url, label = 'Watch on TikTok' }: { url: string; label?: string }) {
  return (
    <a className="btn btn-block" href={url} target="_blank" rel="noreferrer noopener">
      {label}
    </a>
  );
}

/** Renders a playable video for any supported source. */
export function VideoPlayer({ source }: { source: VideoSource }) {
  const [resolved, setResolved] = useState<VideoSource | null>(null);
  const [resolving, setResolving] = useState(false);
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

  // Short share links hide the video id behind a redirect; look it up once.
  useEffect(() => {
    if (source.kind !== 'tiktok-short') {
      setResolved(null);
      return;
    }
    let cancelled = false;
    setResolving(true);
    resolveShortTiktok(source.watch)
      .then((id) => {
        if (cancelled) return;
        setResolved(id ? tiktokSource(id, source.watch) : null);
      })
      .finally(() => !cancelled && setResolving(false));
    return () => {
      cancelled = true;
    };
  }, [source]);

  if (!online) {
    return (
      <div className="stack-sm">
        <div className="chart-empty">
          You are offline, so this video cannot load. The written steps still work without a connection.
        </div>
        <OpenLink url={source.watch} />
      </div>
    );
  }

  const effective = source.kind === 'tiktok-short' ? resolved : source;

  if (!effective) {
    return (
      <div className="stack-sm">
        <div className="chart-empty">
          {resolving
            ? 'Loading the video…'
            : 'This one is a short share link, which TikTok will only open in its own app or site.'}
        </div>
        <OpenLink url={source.watch} />
      </div>
    );
  }

  if (effective.kind === 'unknown' || effective.kind === 'tiktok-short') {
    return <OpenLink url={effective.watch} label="Open video" />;
  }

  return (
    <div className="stack-sm">
      <iframe
        className={`video-frame${effective.kind === 'youtube' || effective.kind === 'drive' ? ' video-frame-wide' : ''}`}
        src={effective.embed}
        title="Exercise form video"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      <a className="btn btn-ghost btn-sm btn-block" href={effective.watch} target="_blank" rel="noreferrer noopener">
        Open in {effective.kind === 'youtube' ? 'YouTube' : effective.kind === 'drive' ? 'Drive' : 'TikTok'}
      </a>
    </div>
  );
}

/** Plays a clip the user saved to her own device. */
export function OwnClip({ clipId }: { clipId: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;
    getPhoto(clipId).then((blob) => {
      if (!blob || cancelled) return;
      revoke = URL.createObjectURL(blob);
      setUrl(revoke);
    });
    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [clipId]);

  if (!url) return <div className="chart-empty">Loading your clip…</div>;
  return <video className="video-frame" src={url} controls playsInline preload="metadata" />;
}
