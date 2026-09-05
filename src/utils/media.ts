export type VideoSource =
  | { kind: 'youtube'; id: string; embed: string; watch: string }
  | { kind: 'tiktok'; id: string; embed: string; watch: string }
  | { kind: 'tiktok-short'; watch: string }
  | { kind: 'drive'; id: string; embed: string; watch: string }
  | { kind: 'unknown'; watch: string };

/** Recognises the link formats worth embedding; anything else stays a plain link. */
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

  // Google Drive: a file you uploaded yourself, shared with "anyone with the link".
  const drive = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([A-Za-z0-9_-]{10,})/);
  if (drive) {
    return {
      kind: 'drive',
      id: drive[1],
      embed: `https://drive.google.com/file/d/${drive[1]}/preview`,
      watch: `https://drive.google.com/file/d/${drive[1]}/view`,
    };
  }

  const tt = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/)(\d{6,})/);
  if (tt) return tiktokSource(tt[1], url);

  // Short share links (vt./vm.tiktok.com) hide the numeric id behind a redirect,
  // so they need resolving at runtime before they can be embedded.
  if (/(?:vt|vm)\.tiktok\.com\//i.test(url)) return { kind: 'tiktok-short', watch: url };

  if (/^https?:\/\//i.test(url)) return { kind: 'unknown', watch: url };
  return null;
}

export function tiktokSource(id: string, watch: string): VideoSource {
  return { kind: 'tiktok', id, embed: `https://www.tiktok.com/embed/v2/${id}`, watch };
}

const RESOLVED_KEY = 'bloom.tiktok.resolved.v1';

function readCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(RESOLVED_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeCache(map: Record<string, string>) {
  try {
    localStorage.setItem(RESOLVED_KEY, JSON.stringify(map));
  } catch {
    /* A full quota should never break playback. */
  }
}

/**
 * Turns a vt.tiktok.com share link into an embeddable video id using TikTok's
 * public oEmbed endpoint, caching the result so it is looked up once per link.
 * Returns null when the lookup is unavailable — offline, blocked, or the post
 * has been deleted — and the caller falls back to opening TikTok directly.
 */
export async function resolveShortTiktok(shortUrl: string): Promise<string | null> {
  const cache = readCache();
  if (cache[shortUrl]) return cache[shortUrl];

  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(shortUrl)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { embed_product_id?: string; html?: string };
    const id = data.embed_product_id ?? data.html?.match(/data-video-id="(\d+)"/)?.[1] ?? null;
    if (id) {
      writeCache({ ...cache, [shortUrl]: id });
      return id;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * A live search rather than a fixed video id. Curated links rot when a creator
 * deletes a post; a search for the movement never does.
 */
export function youtubeSearchUrl(exerciseName: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exerciseName} proper form women glute`)}`;
}

export function tiktokSearchUrl(exerciseName: string): string {
  return `https://www.tiktok.com/search?q=${encodeURIComponent(`${exerciseName} form glute`)}`;
}
