import { Sheet } from './Sheet';
import { VideoPlayer, OwnClip } from './InlineVideo';
import { PlayIcon } from './Icons';
import type { VideoSource } from '../utils/media';

export interface PlayRequest {
  title: string;
  subtitle?: string;
  source?: VideoSource;
  clipId?: string;
}

/** Videos open in a sheet on tap, at full height, and close when you are done. */
export function VideoSheet({ request, onClose }: { request: PlayRequest | null; onClose: () => void }) {
  return (
    <Sheet open={request !== null} onClose={onClose} title={request?.title}>
      {request && (
        <div className="stack">
          {request.subtitle && <p className="small muted" style={{ marginTop: -6 }}>{request.subtitle}</p>}
          {request.clipId ? <OwnClip clipId={request.clipId} /> : request.source ? <VideoPlayer source={request.source} /> : null}
        </div>
      )}
    </Sheet>
  );
}

/** The tappable row that opens the sheet. */
export function VideoButton({
  title,
  subtitle,
  onPlay,
}: {
  title: string;
  subtitle?: string;
  onPlay: () => void;
}) {
  return (
    <button className="video-card" onClick={onPlay}>
      <span className="video-thumb"><PlayIcon size={16} /></span>
      <span className="grow">
        <span className="bold small" style={{ display: 'block' }}>{title}</span>
        {subtitle && <span className="tiny faint">{subtitle}</span>}
      </span>
    </button>
  );
}
