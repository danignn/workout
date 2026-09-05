import { todayKey } from '../utils/date';

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
  /** Library exercise ids added to this session on the day. */
  extras?: string[];
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

export interface PeriodLog {
  id: string;
  /** YYYY-MM-DD of day 1. */
  start: string;
  /** Left open while the period is still running. */
  end?: string;
}

export interface CycleSettings {
  enabled: boolean;
  /** Kept for state written before periods were logged individually. */
  lastPeriodStart?: string;
  cycleLength: number;
  periodLength: number;
  logs: PeriodLog[];
  /** Turns the lighter training suggestions on and off. */
  adjustTraining: boolean;
}

export interface Profile {
  name: string;
  bodyweightKg: number;
  proteinTargetOverride?: number;
  waterTarget: number;
  stepTarget: number;
}

export interface ScheduleSettings {
  /** YYYY-MM-DD of the first training day (Lower A). The whole cycle hangs off this. */
  startDate: string;
}

export type PaletteId = 'blush' | 'rose' | 'lilac' | 'mint' | 'butter';
export type MascotId =
  | 'butterfly'
  | 'sparkle'
  | 'heart'
  | 'fairy'
  | 'bunny'
  | 'kitty'
  | 'flower'
  | 'custom'
  | 'none';

export interface ThemeSettings {
  palette: PaletteId;
  mascot: MascotId;
  /** IndexedDB key of an image the user chose as their own mascot. */
  customMascotId?: string;
  /** How busy the animation is. */
  mascotSpeed: 'calm' | 'normal' | 'lively';
}

/** A reference video the user attached to an exercise herself. */
export interface ExerciseMedia {
  /** A YouTube or TikTok URL she pasted in. */
  link?: string;
  /** IndexedDB key of a clip she recorded or picked from her camera roll. */
  clipId?: string;
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
  schedule: ScheduleSettings;
  theme: ThemeSettings;
  /** Keyed by exercise id. */
  media: Record<string, ExerciseMedia>;
  workouts: WorkoutLog[];
  measurements: Measurement[];
  photos: PhotoMeta[];
  /** Keyed by YYYY-MM-DD. */
  meals: Record<string, MealLogItem[]>;
  /** Ticked-off grocery items, keyed by item name. */
  grocery: Record<string, boolean>;
  habits: Record<string, HabitDay>;
}

export const STATE_VERSION = 3;

export const EMPTY_HABIT: HabitDay = { water: 0, steps: 0, sleepHours: 0, proteinHit: false };

export function initialState(): AppState {
  return {
    version: STATE_VERSION,
    profile: { name: '', bodyweightKg: 42, waterTarget: 8, stepTarget: 8000 },
    settings: { restPreference: 'min', vibrate: true, sound: true, autoStartRest: true },
    cycle: { enabled: false, cycleLength: 28, periodLength: 5, logs: [], adjustTraining: true },
    schedule: { startDate: todayKey() },
    theme: { palette: 'blush', mascot: 'butterfly', mascotSpeed: 'normal' },
    media: {},
    workouts: [],
    measurements: [],
    photos: [],
    meals: {},
    grocery: {},
    habits: {},
  };
}
