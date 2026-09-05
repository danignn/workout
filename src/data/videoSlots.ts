import { SESSIONS, EXERCISE_LIBRARY } from './program';

export interface VideoSlot {
  /** Key into state.media. Exercises use their id; sessions use a prefix. */
  key: string;
  label: string;
  group: string;
  /** The original TikTok link, kept as a fallback and for re-downloading. */
  sourceUrl?: string;
}

/**
 * Every place in the app that can hold a video, so the library can list them
 * all in one screen and say which ones have a file saved.
 */
export function allVideoSlots(): VideoSlot[] {
  const slots: VideoSlot[] = [];
  const seen = new Set<string>();

  for (const session of SESSIONS) {
    if (session.warmupVideo) {
      const key = `warmup:${session.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        slots.push({ key, label: `${session.title} — warm-up`, group: 'Warm-ups & cool-downs', sourceUrl: session.warmupVideo });
      }
    }
    if (session.cooldownVideo) {
      const key = `cooldown:${session.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        slots.push({ key, label: `${session.title} — cool-down`, group: 'Warm-ups & cool-downs', sourceUrl: session.cooldownVideo });
      }
    }
  }

  for (const session of SESSIONS) {
    for (const ex of session.exercises) {
      if (seen.has(ex.id)) continue;
      seen.add(ex.id);
      slots.push({ key: ex.id, label: ex.name, group: session.title, sourceUrl: ex.videos?.[0]?.url });
    }
  }

  for (const ex of EXERCISE_LIBRARY) {
    if (seen.has(ex.id)) continue;
    seen.add(ex.id);
    slots.push({ key: ex.id, label: ex.name, group: 'Optional extras', sourceUrl: ex.videos?.[0]?.url });
  }

  return slots;
}

/** Loose filename match so a bulk import can guess which slot a file belongs to. */
export function matchSlot(filename: string, slots: VideoSlot[]): VideoSlot | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const file = norm(filename);
  if (!file) return undefined;

  let best: { slot: VideoSlot; score: number } | undefined;
  for (const slot of slots) {
    const words = norm(slot.label).split(' ').filter((w) => w.length > 2);
    if (words.length === 0) continue;
    const hits = words.filter((w) => file.includes(w)).length;
    const score = hits / words.length;
    if (score >= 0.5 && (!best || score > best.score)) best = { slot, score };
  }
  return best?.slot;
}
