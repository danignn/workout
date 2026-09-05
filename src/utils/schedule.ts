import { REST_DAY_BY_OFFSET, SESSION_BY_OFFSET, type RestDay, type Session } from '../data/program';
import { addDays, daysBetween } from './date';

/**
 * The programme is a repeating 7-day cycle anchored to the day you start it,
 * not to the calendar week. Starting on a Tuesday simply rotates the whole
 * pattern, which keeps Lower A and Lower B 72 hours apart however you begin.
 */
export function cycleOffset(startDate: string, date: string): number | null {
  const elapsed = daysBetween(startDate, date);
  if (elapsed < 0) return null;
  return elapsed % 7;
}

export function sessionFor(startDate: string, date: string): Session | undefined {
  const offset = cycleOffset(startDate, date);
  return offset === null ? undefined : SESSION_BY_OFFSET[offset];
}

export function restDayFor(startDate: string, date: string): RestDay | undefined {
  const offset = cycleOffset(startDate, date);
  return offset === null ? undefined : REST_DAY_BY_OFFSET[offset];
}

/** 1-based programme week, so the Plan screen can say "Week 3". */
export function weekNumber(startDate: string, date: string): number {
  const elapsed = daysBetween(startDate, date);
  return elapsed < 0 ? 0 : Math.floor(elapsed / 7) + 1;
}

/** The 7 dates of the programme week containing `date`, cycle-aligned. */
export function cycleWeekOf(startDate: string, date: string): string[] {
  const offset = cycleOffset(startDate, date);
  const first = offset === null ? startDate : addDays(date, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(first, i));
}

export interface UpcomingSession {
  date: string;
  session: Session;
  daysAway: number;
}

export function nextSessionAfter(startDate: string, date: string): UpcomingSession | undefined {
  for (let i = 1; i <= 7; i += 1) {
    const d = addDays(date, i);
    const session = sessionFor(startDate, d);
    if (session) return { date: d, session, daysAway: i };
  }
  return undefined;
}

/**
 * Hours between the two lower-body sessions in the cycle. The plan asks for
 * 48 to 72, and the fixed offsets give 72, but this is computed rather than
 * asserted so a future edit to the offsets cannot quietly break the rule.
 */
export function legDaySpacingHours(): number {
  const lower = Object.values(SESSION_BY_OFFSET)
    .filter((s): s is Session => !!s && s.kind === 'lower')
    .map((s) => s.dayOffset)
    .sort((a, b) => a - b);
  if (lower.length < 2) return 0;
  return (lower[1] - lower[0]) * 24;
}

export function startDayLabel(startDate: string): string {
  const d = new Date(`${startDate}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'long' });
}
