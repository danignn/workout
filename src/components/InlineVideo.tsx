import { useEffect, useState } from 'react';
import { getPhoto } from '../store/idb';
import type { VideoSource } from '../utils/media';

/** Plays an embedded video inside the card, rather than opening a sheet. */
export function InlineVideo({ source }: { source: VideoSource }) {
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

  if (!online) {
    return (
      <div className="chart-empty">
        You are offline, so this video cannot load. The written form cues below work without a connection.
      </div>
    );
  }

  if (source.kind === 'unknown') {
    return (
      <a className="btn btn-ghost btn-block" href={source.watch} target="_blank" rel="noreferrer noopener">
        Open video
      </a>
    );
  }

  return (
    <iframe
      className={`video-frame${source.kind === 'youtube' ? ' video-frame-wide' : ''}`}
      src={source.embed}
      title="Exercise form video"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
      loading="lazy"
    />
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
