import { initialState, STATE_VERSION, type AppState } from './types';

const KEY = 'bloom.state.v1';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Merge over defaults so state written by an older build still opens.
    const base = initialState();
    return {
      ...base,
      ...parsed,
      version: STATE_VERSION,
      profile: { ...base.profile, ...parsed.profile },
      settings: { ...base.settings, ...parsed.settings },
      cycle: { ...base.cycle, ...parsed.cycle },
      schedule: { ...base.schedule, ...parsed.schedule },
      theme: { ...base.theme, ...parsed.theme },
      media: parsed.media ?? {},
      workouts: parsed.workouts ?? [],
      measurements: parsed.measurements ?? [],
      photos: parsed.photos ?? [],
      meals: parsed.meals ?? {},
      grocery: parsed.grocery ?? {},
      habits: parsed.habits ?? {},
    };
  } catch {
    return initialState();
  }
}

let saveTimer: number | undefined;

export function saveState(state: AppState): void {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Could not save app state', err);
    }
  }, 200);
}

export function exportState(state: AppState): string {
  // Photo blobs live in IndexedDB and are far too large for a JSON backup, so
  // the metadata is stripped too — restoring it elsewhere would only produce
  // tiles with no image behind them.
  const { photos: _photos, ...rest } = state;
  return JSON.stringify({ exportedAt: new Date().toISOString(), state: { ...rest, photos: [] } }, null, 2);
}

export function parseImport(text: string): AppState {
  const parsed = JSON.parse(text);
  const candidate = (parsed?.state ?? parsed) as AppState;
  if (!candidate || typeof candidate !== 'object' || !Array.isArray(candidate.workouts)) {
    throw new Error('That file does not look like a Bloom backup.');
  }
  return { ...initialState(), ...candidate, version: STATE_VERSION };
}
