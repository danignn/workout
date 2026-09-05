export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toKey(new Date());
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return toKey(d);
}

export function daysBetween(a: string, b: string): number {
  const ms = fromKey(b).getTime() - fromKey(a).getTime();
  return Math.round(ms / 86400000);
}

export function formatShort(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function formatLong(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Monday-first week containing the given date, as YYYY-MM-DD keys. */
export function weekOf(key: string): string[] {
  const d = fromKey(key);
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  const monday = addDays(key, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
