import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadState, saveState } from './storage';
import {
  EMPTY_HABIT,
  type AppState,
  type HabitDay,
  type LoggedSet,
  type MealLogItem,
  type Measurement,
  type PhotoMeta,
  type Profile,
  type Settings,
  type CycleSettings,
  type ScheduleSettings,
  type ThemeSettings,
  type ExerciseMedia,
  type WorkoutLog,
} from './types';
import { getSession } from '../data/program';
import { todayKey } from '../utils/date';

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

interface AppContextValue {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  updateProfile: (patch: Partial<Profile>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  updateCycle: (patch: Partial<CycleSettings>) => void;
  updateSchedule: (patch: Partial<ScheduleSettings>) => void;
  updateTheme: (patch: Partial<ThemeSettings>) => void;
  setMedia: (exerciseId: string, patch: Partial<ExerciseMedia>) => void;
  clearMedia: (exerciseId: string, field: keyof ExerciseMedia) => void;
  /** Returns the log for this session on this date, creating it if needed. */
  ensureLog: (sessionId: string, date?: string) => WorkoutLog;
  getLog: (sessionId: string, date: string) => WorkoutLog | undefined;
  updateSet: (logId: string, exerciseId: string, index: number, patch: Partial<LoggedSet>) => void;
  addSet: (logId: string, exerciseId: string) => void;
  removeSet: (logId: string, exerciseId: string) => void;
  setLogNotes: (logId: string, notes: string) => void;
  addExtraExercise: (logId: string, exerciseId: string, sets: number, weight: number | null) => void;
  removeExtraExercise: (logId: string, exerciseId: string) => void;
  toggleWorkoutComplete: (logId: string) => void;
  deleteLog: (logId: string) => void;
  addMeasurement: (m: Omit<Measurement, 'id'>) => void;
  deleteMeasurement: (id: string) => void;
  addPhotoMeta: (p: PhotoMeta) => void;
  removePhotoMeta: (id: string) => void;
  addMealLog: (date: string, item: Omit<MealLogItem, 'id'>) => void;
  removeMealLog: (date: string, id: string) => void;
  updateHabit: (date: string, patch: Partial<HabitDay>) => void;
  toggleGrocery: (name: string) => void;
  resetGrocery: () => void;
  replaceState: (next: AppState) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function buildLog(sessionId: string, date: string): WorkoutLog {
  const session = getSession(sessionId);
  const entries: Record<string, LoggedSet[]> = {};
  for (const ex of session?.exercises ?? []) {
    entries[ex.id] = Array.from({ length: ex.sets }, () => ({
      reps: null,
      weight: ex.suggestedKg > 0 ? ex.suggestedKg : null,
      done: false,
    }));
  }
  return { id: uid(), sessionId, date, startedAt: Date.now(), completed: false, entries };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const updateCycle = useCallback((patch: Partial<CycleSettings>) => {
    setState((s) => ({ ...s, cycle: { ...s.cycle, ...patch } }));
  }, []);

  const updateSchedule = useCallback((patch: Partial<ScheduleSettings>) => {
    setState((s) => ({ ...s, schedule: { ...s.schedule, ...patch } }));
  }, []);

  const updateTheme = useCallback((patch: Partial<ThemeSettings>) => {
    setState((s) => ({ ...s, theme: { ...s.theme, ...patch } }));
  }, []);

  const setMedia = useCallback((exerciseId: string, patch: Partial<ExerciseMedia>) => {
    setState((s) => ({ ...s, media: { ...s.media, [exerciseId]: { ...s.media[exerciseId], ...patch } } }));
  }, []);

  const clearMedia = useCallback((exerciseId: string, field: keyof ExerciseMedia) => {
    setState((s) => {
      const next = { ...s.media[exerciseId] };
      delete next[field];
      return { ...s, media: { ...s.media, [exerciseId]: next } };
    });
  }, []);

  const getLog = useCallback(
    (sessionId: string, date: string) => state.workouts.find((w) => w.sessionId === sessionId && w.date === date),
    [state.workouts],
  );

  const ensureLog = useCallback(
    (sessionId: string, date = todayKey()) => {
      const existing = state.workouts.find((w) => w.sessionId === sessionId && w.date === date);
      if (existing) return existing;
      const created = buildLog(sessionId, date);
      setState((s) =>
        s.workouts.some((w) => w.sessionId === sessionId && w.date === date)
          ? s
          : { ...s, workouts: [...s.workouts, created] },
      );
      return created;
    },
    [state.workouts],
  );

  const mapLog = useCallback((logId: string, fn: (log: WorkoutLog) => WorkoutLog) => {
    setState((s) => ({ ...s, workouts: s.workouts.map((w) => (w.id === logId ? fn(w) : w)) }));
  }, []);

  const updateSet = useCallback(
    (logId: string, exerciseId: string, index: number, patch: Partial<LoggedSet>) => {
      mapLog(logId, (log) => {
        const sets = [...(log.entries[exerciseId] ?? [])];
        sets[index] = { ...(sets[index] ?? { reps: null, weight: null, done: false }), ...patch };
        return { ...log, entries: { ...log.entries, [exerciseId]: sets } };
      });
    },
    [mapLog],
  );

  const addSet = useCallback(
    (logId: string, exerciseId: string) => {
      mapLog(logId, (log) => {
        const sets = log.entries[exerciseId] ?? [];
        const last = sets[sets.length - 1];
        return {
          ...log,
          entries: {
            ...log.entries,
            [exerciseId]: [...sets, { reps: null, weight: last?.weight ?? null, done: false }],
          },
        };
      });
    },
    [mapLog],
  );

  const removeSet = useCallback(
    (logId: string, exerciseId: string) => {
      mapLog(logId, (log) => {
        const sets = log.entries[exerciseId] ?? [];
        if (sets.length <= 1) return log;
        return { ...log, entries: { ...log.entries, [exerciseId]: sets.slice(0, -1) } };
      });
    },
    [mapLog],
  );

  const addExtraExercise = useCallback(
    (logId: string, exerciseId: string, sets: number, weight: number | null) => {
      mapLog(logId, (log) => {
        if (log.extras?.includes(exerciseId)) return log;
        return {
          ...log,
          extras: [...(log.extras ?? []), exerciseId],
          entries: {
            ...log.entries,
            [exerciseId]: Array.from({ length: sets }, () => ({ reps: null, weight, done: false })),
          },
        };
      });
    },
    [mapLog],
  );

  const removeExtraExercise = useCallback(
    (logId: string, exerciseId: string) => {
      mapLog(logId, (log) => {
        const entries = { ...log.entries };
        delete entries[exerciseId];
        return { ...log, extras: (log.extras ?? []).filter((id) => id !== exerciseId), entries };
      });
    },
    [mapLog],
  );

  const setLogNotes = useCallback(
    (logId: string, notes: string) => mapLog(logId, (log) => ({ ...log, notes })),
    [mapLog],
  );

  const toggleWorkoutComplete = useCallback(
    (logId: string) =>
      mapLog(logId, (log) => ({
        ...log,
        completed: !log.completed,
        finishedAt: !log.completed ? Date.now() : undefined,
      })),
    [mapLog],
  );

  const deleteLog = useCallback((logId: string) => {
    setState((s) => ({ ...s, workouts: s.workouts.filter((w) => w.id !== logId) }));
  }, []);

  const addMeasurement = useCallback((m: Omit<Measurement, 'id'>) => {
    setState((s) => ({
      ...s,
      measurements: [...s.measurements.filter((x) => x.date !== m.date), { ...m, id: uid() }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    }));
  }, []);

  const deleteMeasurement = useCallback((id: string) => {
    setState((s) => ({ ...s, measurements: s.measurements.filter((m) => m.id !== id) }));
  }, []);

  const addPhotoMeta = useCallback((p: PhotoMeta) => {
    setState((s) => ({ ...s, photos: [p, ...s.photos] }));
  }, []);

  const removePhotoMeta = useCallback((id: string) => {
    setState((s) => ({ ...s, photos: s.photos.filter((p) => p.id !== id) }));
  }, []);

  const addMealLog = useCallback((date: string, item: Omit<MealLogItem, 'id'>) => {
    setState((s) => ({ ...s, meals: { ...s.meals, [date]: [...(s.meals[date] ?? []), { ...item, id: uid() }] } }));
  }, []);

  const removeMealLog = useCallback((date: string, id: string) => {
    setState((s) => ({ ...s, meals: { ...s.meals, [date]: (s.meals[date] ?? []).filter((m) => m.id !== id) } }));
  }, []);

  const updateHabit = useCallback((date: string, patch: Partial<HabitDay>) => {
    setState((s) => ({ ...s, habits: { ...s.habits, [date]: { ...EMPTY_HABIT, ...s.habits[date], ...patch } } }));
  }, []);

  const toggleGrocery = useCallback((name: string) => {
    setState((s) => ({ ...s, grocery: { ...s.grocery, [name]: !s.grocery[name] } }));
  }, []);

  const resetGrocery = useCallback(() => setState((s) => ({ ...s, grocery: {} })), []);

  const replaceState = useCallback((next: AppState) => setState(next), []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      setState,
      updateProfile,
      updateSettings,
      updateCycle,
      updateSchedule,
      updateTheme,
      setMedia,
      clearMedia,
      ensureLog,
      getLog,
      updateSet,
      addSet,
      removeSet,
      setLogNotes,
      addExtraExercise,
      removeExtraExercise,
      toggleWorkoutComplete,
      deleteLog,
      addMeasurement,
      deleteMeasurement,
      addPhotoMeta,
      removePhotoMeta,
      addMealLog,
      removeMealLog,
      updateHabit,
      toggleGrocery,
      resetGrocery,
      replaceState,
    }),
    [
      state,
      updateProfile,
      updateSettings,
      updateCycle,
      updateSchedule,
      updateTheme,
      setMedia,
      clearMedia,
      ensureLog,
      getLog,
      updateSet,
      addSet,
      removeSet,
      setLogNotes,
      addExtraExercise,
      removeExtraExercise,
      toggleWorkoutComplete,
      deleteLog,
      addMeasurement,
      deleteMeasurement,
      addPhotoMeta,
      removePhotoMeta,
      addMealLog,
      removeMealLog,
      updateHabit,
      toggleGrocery,
      resetGrocery,
      replaceState,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
