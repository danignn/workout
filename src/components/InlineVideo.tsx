import { useEffect, useState } from 'react';
import { getPhoto } from '../store/idb';
import { resolveShortTiktok, tiktokSource, type VideoSource } from '../utils/media';
import { PlayIcon } from './Icons';

/**
 * TikTok refuses to render its embed inside an installed web app, which left a
 * dead grey box where the video should be. YouTube and Drive do allow it, so
 * only those are embedded. A TikTok link opens in TikTok instead, which is the
 * behaviour that already worked for the warm-up videos.
 */
type EmbeddableSource = Extract<VideoSource, { kind: 'youtube' | 'drive' }>;

function canEmbed(source: VideoSource): source is EmbeddableSource {
  return source.kind === 'youtube' || source.kind === 'drive';
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
        Save it once and it plays right here, instantly and offline, even if the post is deleted.
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
          className="video-frame video-frame-wide"
          src={effective.embed}
          title="Exercise form video"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        <OpenButton source={effective} />
        {saveRow}
      </div>
    );
  }

  return (
    <div className="stack-sm">
      <div className="video-poster">
        <span className="video-poster-icon"><PlayIcon size={26} /></span>
        <span className="small bold">Opens in TikTok</span>
        <span className="tiny muted center">
          TikTok does not allow its videos to play inside another app, so it opens in TikTok and comes straight back.
        </span>
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
