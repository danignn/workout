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

export function currentPhase(cycle: CycleSettings, today: string): PhaseInfo | null {
  if (!cycle.enabled || !cycle.lastPeriodStart) return null;
  const elapsed = daysBetween(cycle.lastPeriodStart, today);
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
  if (!cycle.enabled || !cycle.lastPeriodStart) return null;
  const elapsed = daysBetween(cycle.lastPeriodStart, today);
  if (elapsed < 0) return null;
  const length = Math.max(21, cycle.cycleLength);
  return length - (elapsed % length);
}
