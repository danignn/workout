export type VideoSource =
  | { kind: 'youtube'; id: string; embed: string; watch: string }
  | { kind: 'tiktok'; id: string; embed: string; watch: string }
  | { kind: 'unknown'; watch: string };

/** Recognises the two link formats worth embedding; anything else stays a link. */
export function parseVideoUrl(raw: string): VideoSource | null {
  const url = raw.trim();
  if (!url) return null;

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) {
    return {
      kind: 'youtube',
      id: yt[1],
      embed: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&playsinline=1`,
      watch: `https://www.youtube.com/watch?v=${yt[1]}`,
    };
  }

  const tt = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/)(\d{6,})/);
  if (tt) {
    return {
      kind: 'tiktok',
      id: tt[1],
      embed: `https://www.tiktok.com/embed/v2/${tt[1]}`,
      watch: url,
    };
  }

  if (/^https?:\/\//i.test(url)) return { kind: 'unknown', watch: url };
  return null;
}

export function tiktokSource(id: string, watch: string): VideoSource {
  return { kind: 'tiktok', id, embed: `https://www.tiktok.com/embed/v2/${id}`, watch };
}

/**
 * A live search rather than a fixed video id. Curated links rot when a creator
 * deletes a post; a search for the movement never does, and always surfaces
 * current tutorials.
 */
export function youtubeSearchUrl(exerciseName: string): string {
  const q = `${exerciseName} proper form women glute`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

export function tiktokSearchUrl(exerciseName: string): string {
  return `https://www.tiktok.com/search?q=${encodeURIComponent(`${exerciseName} form glute`)}`;
}
