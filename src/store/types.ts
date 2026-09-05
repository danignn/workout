export interface LoggedSet {
  reps: number | null;
  weight: number | null;
  done: boolean;
}

export interface WorkoutLog {
  id: string;
  sessionId: string;
  /** YYYY-MM-DD */
  date: string;
  startedAt: number;
  finishedAt?: number;
  /** Ticked by the user when the scheduled workout is considered complete. */
  completed: boolean;
  entries: Record<string, LoggedSet[]>;
  notes?: string;
  /** Exercises the user skipped on purpose. */
  skipped?: string[];
}

export interface Measurement {
  id: string;
  date: string;
  weightKg?: number;
  waistCm?: number;
  hipsCm?: number;
  gluteCm?: number;
  thighCm?: number;
  armCm?: number;
  note?: string;
}

export interface PhotoMeta {
  id: string;
  date: string;
  angle: 'front' | 'side' | 'back';
  note?: string;
  width: number;
  height: number;
}

export interface MealLogItem {
  id: string;
  /** Set when the entry came from the meal library. */
  mealId?: string;
  name: string;
  protein: number;
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface HabitDay {
  water: number;
  steps: number;
  sleepHours: number;
  proteinHit: boolean;
}

export interface CycleSettings {
  enabled: boolean;
  /** YYYY-MM-DD of the first day of the most recent period. */
  lastPeriodStart?: string;
  cycleLength: number;
  periodLength: number;
}

export interface Profile {
  name: string;
  bodyweightKg: number;
  proteinTargetOverride?: number;
  waterTarget: number;
  stepTarget: number;
}

export interface Settings {
  restPreference: 'min' | 'max';
  vibrate: boolean;
  sound: boolean;
  autoStartRest: boolean;
}

export interface AppState {
  version: number;
  profile: Profile;
  settings: Settings;
  cycle: CycleSettings;
  workouts: WorkoutLog[];
  measurements: Measurement[];
  photos: PhotoMeta[];
  /** Keyed by YYYY-MM-DD. */
  meals: Record<string, MealLogItem[]>;
  habits: Record<string, HabitDay>;
}

export const STATE_VERSION = 1;

export const EMPTY_HABIT: HabitDay = { water: 0, steps: 0, sleepHours: 0, proteinHit: false };

export function initialState(): AppState {
  return {
    version: STATE_VERSION,
    profile: { name: '', bodyweightKg: 60, waterTarget: 8, stepTarget: 8000 },
    settings: { restPreference: 'min', vibrate: true, sound: true, autoStartRest: true },
    cycle: { enabled: false, cycleLength: 28, periodLength: 5 },
    workouts: [],
    measurements: [],
    photos: [],
    meals: {},
    habits: {},
  };
}
