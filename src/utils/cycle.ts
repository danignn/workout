import type { CycleSettings } from '../store/types';
import { daysBetween } from './date';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface PhaseInfo {
  phase: CyclePhase;
  dayOfCycle: number;
  label: string;
  headline: string;
  advice: string;
  emoji: string;
}

const PHASE_COPY: Record<CyclePhase, { label: string; headline: string; advice: string; emoji: string }> = {
  menstrual: {
    label: 'Menstrual phase',
    headline: 'Be kind to yourself today',
    emoji: '🌙',
    advice:
      'Energy is usually lowest here. Training is still fine and often helps cramps, but drop the load 10 to 20 percent if you need to and lean on the accessory work. A walk counts.',
  },
  follicular: {
    label: 'Follicular phase',
    headline: 'Your strongest stretch is starting',
    emoji: '🌱',
    advice:
      'Rising oestrogen means better recovery and higher pain tolerance. This is the best window to push for a new weight on hip thrusts, RDLs or squats.',
  },
  ovulation: {
    label: 'Ovulation',
    headline: 'Peak strength window',
    emoji: '✨',
    advice:
      'Strength typically peaks around now. Great time to test a heavier top set. Warm up thoroughly, joints are slightly more lax around ovulation.',
  },
  luteal: {
    label: 'Luteal phase',
    headline: 'Steady, not heroic',
    emoji: '🌸',
    advice:
      'Body temperature and appetite rise, recovery slows a little. Hold your weights rather than chasing PBs, prioritise sleep and protein, and expect some water retention that is not fat.',
  },
};

function anchorStart(cycle: CycleSettings): string | undefined {
  const logged = [...(cycle.logs ?? [])].sort((a, b) => b.start.localeCompare(a.start))[0];
  return logged?.start ?? cycle.lastPeriodStart;
}

export function currentPhase(cycle: CycleSettings, today: string): PhaseInfo | null {
  const anchor = anchorStart(cycle);
  if (!cycle.enabled || !anchor) return null;
  const elapsed = daysBetween(anchor, today);
  if (elapsed < 0) return null;
  const length = Math.max(21, cycle.cycleLength);
  const dayOfCycle = (elapsed % length) + 1;

  let phase: CyclePhase;
  if (dayOfCycle <= cycle.periodLength) phase = 'menstrual';
  else if (dayOfCycle <= length / 2 - 2) phase = 'follicular';
  else if (dayOfCycle <= length / 2 + 2) phase = 'ovulation';
  else phase = 'luteal';

  return { phase, dayOfCycle, ...PHASE_COPY[phase] };
}

export function nextPeriodIn(cycle: CycleSettings, today: string): number | null {
  const anchor = anchorStart(cycle);
  if (!cycle.enabled || !anchor) return null;
  const elapsed = daysBetween(anchor, today);
  if (elapsed < 0) return null;
  const length = Math.max(21, cycle.cycleLength);
  return length - (elapsed % length);
}

/* ------------------------------------------------------------------ *
 * Logged periods and the training adjustment
 * ------------------------------------------------------------------ */

import type { PeriodLog } from '../store/types';

/** Periods newest first, which is the order they are read in. */
export function sortedLogs(cycle: CycleSettings): PeriodLog[] {
  return [...(cycle.logs ?? [])].sort((a, b) => b.start.localeCompare(a.start));
}

export function openPeriod(cycle: CycleSettings): PeriodLog | undefined {
  return sortedLogs(cycle).find((l) => !l.end);
}

/** The last day a period covers: its end date, or the expected length if still open. */
function lastDayOf(log: PeriodLog, cycle: CycleSettings): string {
  if (log.end) return log.end;
  const d = fromKeySafe(log.start);
  d.setDate(d.getDate() + Math.max(1, cycle.periodLength) - 1);
  return toKeySafe(d);
}

function fromKeySafe(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toKeySafe(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Day number within the period, 1-based, or null when not on one. */
export function periodDay(cycle: CycleSettings, date: string): number | null {
  for (const log of cycle.logs ?? []) {
    if (date < log.start) continue;
    if (date > lastDayOf(log, cycle)) continue;
    return daysBetween(log.start, date) + 1;
  }
  return null;
}

export function isOnPeriod(cycle: CycleSettings, date: string): boolean {
  return periodDay(cycle, date) !== null;
}

export interface TrainingAdjustment {
  day: number;
  /** Multiplier to suggest for heavy compound loads. 1 means no change. */
  loadFactor: number;
  headline: string;
  advice: string;
  /** True on the days where skipping entirely is explicitly fine. */
  skipOk: boolean;
}

/**
 * The plan does not change during a period; the expectations do. Training
 * through a period is fine and often eases cramps, so this keeps the same
 * sessions and removes the pressure to hit personal bests on the heaviest days.
 */
export function trainingAdjustment(cycle: CycleSettings, date: string): TrainingAdjustment | null {
  if (!cycle.enabled || !cycle.adjustTraining) return null;
  const day = periodDay(cycle, date);
  if (day === null) return null;

  if (day <= 3) {
    return {
      day,
      loadFactor: 0.85,
      headline: 'Day ' + day + '. Go lighter, not harder',
      advice:
        'Take about 15 percent off the barbell squat, RDL and hip thrust and keep the reps the same. Everything else stays as written. If you feel awful, a 25 minute walk counts as the session and you have lost nothing.',
      skipOk: true,
    };
  }
  return {
    day,
    loadFactor: 1,
    headline: 'Day ' + day + '. Back to normal loads',
    advice:
      'The heaviest days are behind you. Train as written. Strength usually climbs from here through the week after your period, so this is a good stretch to push for a new weight.',
    skipOk: false,
  };
}

/** Suggested working weight during a period, rounded to the nearest 2.5kg. */
export function adjustedLoad(weight: number, factor: number): number {
  if (factor === 1 || weight <= 0) return weight;
  return Math.max(2.5, Math.round((weight * factor) / 2.5) * 2.5);
}

export function averageCycleLength(cycle: CycleSettings): number | null {
  const starts = sortedLogs(cycle).map((l) => l.start);
  if (starts.length < 2) return null;
  const gaps: number[] = [];
  for (let i = 0; i < starts.length - 1; i += 1) gaps.push(daysBetween(starts[i + 1], starts[i]));
  const usable = gaps.filter((g) => g >= 18 && g <= 45);
  if (usable.length === 0) return null;
  return Math.round(usable.reduce((n, g) => n + g, 0) / usable.length);
}
