import type { WorkoutLog } from '../store/types';
import { addDays, todayKey, weekOf } from './date';

export function volumeOf(log: WorkoutLog): number {
  return Object.values(log.entries)
    .flat()
    .filter((s) => s.done && s.reps != null)
    .reduce((n, s) => n + (s.reps as number) * (s.weight ?? 0), 0);
}

export function setsCompleted(log: WorkoutLog): number {
  return Object.values(log.entries).flat().filter((s) => s.done).length;
}

export function completedWorkouts(workouts: WorkoutLog[]): WorkoutLog[] {
  return workouts.filter((w) => w.completed);
}

export function workoutsThisWeek(workouts: WorkoutLog[], today = todayKey()): WorkoutLog[] {
  const week = new Set(weekOf(today));
  return completedWorkouts(workouts).filter((w) => week.has(w.date));
}

/**
 * Consecutive weeks, counting back from this week, in which at least one
 * workout was completed. Weekly rather than daily, because the plan has
 * three rest days and a daily streak would punish following it correctly.
 */
export function weekStreak(workouts: WorkoutLog[], today = todayKey()): number {
  const done = new Set(completedWorkouts(workouts).map((w) => w.date));
  let streak = 0;
  let cursor = today;
  for (let i = 0; i < 260; i += 1) {
    const week = weekOf(cursor);
    const hit = week.some((d) => done.has(d));
    if (!hit) {
      // The current week is still in progress, so an empty one does not break a streak.
      if (i === 0) {
        cursor = addDays(cursor, -7);
        continue;
      }
      break;
    }
    streak += 1;
    cursor = addDays(cursor, -7);
  }
  return streak;
}

export function totalVolume(workouts: WorkoutLog[]): number {
  return completedWorkouts(workouts).reduce((n, w) => n + volumeOf(w), 0);
}

export function lastLogForSession(workouts: WorkoutLog[], sessionId: string): WorkoutLog | undefined {
  return [...workouts]
    .filter((w) => w.sessionId === sessionId)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function logForDate(workouts: WorkoutLog[], date: string, sessionId: string): WorkoutLog | undefined {
  return workouts.find((w) => w.date === date && w.sessionId === sessionId);
}

/** Compact kg display: 640, 4.2k, 18k. "0k" for a real 200kg session helps nobody. */
export function formatVolume(kg: number): string {
  if (kg < 1000) return String(Math.round(kg));
  if (kg < 10000) return `${(kg / 1000).toFixed(1)}k`;
  return `${Math.round(kg / 1000)}k`;
}
