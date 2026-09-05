import type { Exercise } from '../data/program';
import type { WorkoutLog } from '../store/types';

export interface ExercisePerformance {
  date: string;
  sets: { reps: number; weight: number }[];
  topWeight: number;
  totalReps: number;
  volume: number;
}

/** Every logged performance of one exercise, oldest first. */
export function historyFor(workouts: WorkoutLog[], exerciseId: string): ExercisePerformance[] {
  return workouts
    .map((w) => {
      const sets = (w.entries[exerciseId] ?? [])
        .filter((s) => s.done && s.reps != null)
        .map((s) => ({ reps: s.reps as number, weight: s.weight ?? 0 }));
      if (sets.length === 0) return null;
      return {
        date: w.date,
        sets,
        topWeight: Math.max(...sets.map((s) => s.weight)),
        totalReps: sets.reduce((n, s) => n + s.reps, 0),
        volume: sets.reduce((n, s) => n + s.reps * (s.weight || 0), 0),
      };
    })
    .filter((x): x is ExercisePerformance => x !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function lastPerformance(workouts: WorkoutLog[], exerciseId: string): ExercisePerformance | undefined {
  const h = historyFor(workouts, exerciseId);
  return h[h.length - 1];
}

export interface ProgressionAdvice {
  level: 'add-weight' | 'add-reps' | 'repeat' | 'none';
  message: string;
  suggestedWeight?: number;
}

/**
 * The plan's rule, automated: add reps before you add weight, and when 15 reps
 * feels easy, go up 2.5kg and drop back to the lower end of the rep range.
 */
export function progressionAdvice(exercise: Exercise, workouts: WorkoutLog[]): ProgressionAdvice {
  const last = lastPerformance(workouts, exercise.id);
  if (!last) {
    return { level: 'none', message: `First time logging this. Start around ${exercise.suggestedKg > 0 ? `${exercise.suggestedKg}kg` : 'bodyweight'} and note how it feels.` };
  }

  const ceiling = Math.max(15, exercise.repTarget);
  const allSetsAtCeiling = last.sets.length >= exercise.sets && last.sets.every((s) => s.reps >= ceiling);
  const allSetsAtTarget = last.sets.length >= exercise.sets && last.sets.every((s) => s.reps >= exercise.repTarget);

  if (exercise.timeBased) {
    return {
      level: allSetsAtTarget ? 'add-reps' : 'repeat',
      message: allSetsAtTarget
        ? `Last time you held the full ${exercise.repsLabel}. Try adding 5 to 10 seconds per set.`
        : `Last time: ${last.sets.map((s) => `${s.reps}s`).join(', ')}. Match or beat it.`,
    };
  }

  if (allSetsAtCeiling && last.topWeight > 0) {
    return {
      level: 'add-weight',
      message: `You hit ${ceiling}+ reps on every set at ${last.topWeight}kg. Time to go up to ${last.topWeight + 2.5}kg and drop back to the lower end of the rep range.`,
      suggestedWeight: last.topWeight + 2.5,
    };
  }

  if (allSetsAtCeiling) {
    return {
      level: 'add-weight',
      message: `You hit ${ceiling}+ reps on every set at bodyweight. Add a light dumbbell or a band next time.`,
    };
  }

  if (allSetsAtTarget) {
    return {
      level: 'add-reps',
      message: `You hit the target on every set at ${last.topWeight > 0 ? `${last.topWeight}kg` : 'bodyweight'}. Add reps before weight, work toward ${ceiling} per set.`,
      suggestedWeight: last.topWeight || undefined,
    };
  }

  return {
    level: 'repeat',
    message: `Last time: ${last.sets.map((s) => `${s.reps}${s.weight ? ` × ${s.weight}kg` : ''}`).join(', ')}. Match it or beat it by a rep.`,
    suggestedWeight: last.topWeight || undefined,
  };
}

export interface PersonalBest {
  exerciseId: string;
  weight: number;
  reps: number;
  date: string;
}

export function personalBest(workouts: WorkoutLog[], exerciseId: string): PersonalBest | undefined {
  let best: PersonalBest | undefined;
  for (const perf of historyFor(workouts, exerciseId)) {
    for (const set of perf.sets) {
      const better =
        !best || set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps);
      if (better) best = { exerciseId, weight: set.weight, reps: set.reps, date: perf.date };
    }
  }
  return best;
}
