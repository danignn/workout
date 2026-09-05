import { useEffect, useState } from 'react';
import type { VideoRef } from '../data/videos';
import { Sheet } from './Sheet';
import { PlayIcon } from './Icons';

/**
 * TikTok's official embed player. It renders inside an iframe, so it needs a
 * network connection; when the app is offline (or the embed is blocked) we
 * fall back to a plain link that opens the TikTok app.
 */
export function VideoSheet({ video, onClose }: { video: VideoRef | null; onClose: () => void }) {
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

  return (
    <Sheet open={video !== null} onClose={onClose} title={video?.title}>
      {video && (
        <div className="stack">
          <p className="small muted">@{video.author}</p>
          {online ? (
            <iframe
              className="embed-frame"
              src={`https://www.tiktok.com/embed/v2/${video.id}`}
              title={video.title}
              allow="encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="chart-empty">
              You are offline, so the video cannot load. The form cues below the video button still work without a connection.
            </div>
          )}
          <a className="btn btn-ghost btn-block" href={video.url} target="_blank" rel="noreferrer noopener">
            <PlayIcon /> Open in TikTok
          </a>
        </div>
      )}
    </Sheet>
  );
}

export function VideoButton({ video, onPlay }: { video: VideoRef; onPlay: (v: VideoRef) => void }) {
  return (
    <button className="video-card" onClick={() => onPlay(video)}>
      <span className="video-thumb">
        <PlayIcon size={16} />
      </span>
      <span className="grow">
        <span className="bold small" style={{ display: 'block' }}>{video.title}</span>
        <span className="tiny faint">@{video.author}</span>
      </span>
    </button>
  );
}
