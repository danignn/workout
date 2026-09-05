import { VIDEOS, type VideoRef } from './videos';

export type RestTier = 'compound' | 'accessory' | 'isolation';

export interface RestRule {
  tier: RestTier;
  label: string;
  betweenSets: [number, number]; // seconds, min-max
  description: string;
}

/** Rest timing rules, from the plan's rest table. */
export const REST_RULES: Record<RestTier, RestRule> = {
  compound: {
    tier: 'compound',
    label: 'Heavy compound',
    betweenSets: [120, 180],
    description: 'Barbell squat, RDL, hip thrust, Bulgarian split squat',
  },
  accessory: {
    tier: 'accessory',
    label: 'Moderate',
    betweenSets: [90, 120],
    description: 'Step-ups, lunges, sumo squat, rows, press, leg curl, chest press',
  },
  isolation: {
    tier: 'isolation',
    label: 'Isolation & core',
    betweenSets: [45, 60],
    description: 'Kickbacks, abduction, lateral raises, curls, pushdowns, planks',
  },
};

/** Between every exercise: 2 to 3 minutes. */
export const REST_BETWEEN_EXERCISES: [number, number] = [120, 180];

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  /** Human-readable rep target, e.g. "12 to 15" or "12 each leg". */
  repsLabel: string;
  /** Numeric rep target used for progression logic (top of the range). */
  repTarget: number;
  /** Suggested starting load in kg. 0 means bodyweight. */
  suggestedKg: number;
  loadNote?: string;
  /** True when the rep count is per side, so each set covers both. */
  perSide?: boolean;
  /** True when reps are actually seconds (planks, carries, cardio). */
  timeBased?: boolean;
  tier: RestTier;
  restBetweenSets?: [number, number];
  restBeforeNext?: [number, number];
  cues: string[];
  cueSource?: string;
  notes?: string;
  videos?: VideoRef[];
  /** Skippable when short on time; the session still counts. */
  optional?: boolean;
  /** Which session types this can be added to from the library. */
  group?: 'shoulders' | 'arms' | 'back' | 'legs' | 'glutes' | 'core';
  /** Shown as a swap suggestion, e.g. a rotation every few weeks. */
  swapNote?: string;
}

export interface MobilityMove {
  name: string;
  prescription: string;
  note?: string;
}

export interface Session {
  id: string;
  /**
   * Position in the 7-day cycle, counted from whichever day you start the
   * programme. 0 is your first training day. This is what lets the plan begin
   * on any weekday without collapsing the gap between leg days.
   */
  dayOffset: number;
  title: string;
  subtitle: string;
  kind: 'lower' | 'upper' | 'full' | 'core' | 'rest';
  accent: string;
  intro?: string;
  optional?: boolean;
  warmup: MobilityMove[];
  warmupVideo?: string;
  cooldown: MobilityMove[];
  cooldownVideo?: string;
  exercises: Exercise[];
  finisher?: string;
  /** Extra reference video for the whole session. */
  sessionVideo?: VideoRef;
}

/* ------------------------------------------------------------------ *
 * Warm-ups and cool-downs
 * ------------------------------------------------------------------ */

const GLUTE_WARMUP: MobilityMove[] = [
  { name: 'Incline walk or march on the spot', prescription: '5 min', note: 'Enough to feel warm and breathe a little harder. Do not skip this to save time.' },
  { name: 'Bodyweight glute bridges', prescription: '10 reps', note: 'Squeeze at the top. This wakes up the muscle you are about to train.' },
  { name: 'Banded side steps', prescription: '15 each direction', note: 'Band above the knees, small bend in the knees, stay low the whole way.' },
  { name: 'Bodyweight squats', prescription: '10 reps', note: 'Slow, full depth, grooving the pattern before you add load.' },
  { name: 'Leg swings', prescription: '10 each leg, front to back', note: 'Hold something for balance. Opens the hip before you load it.' },
];

const LOWER_COOLDOWN: MobilityMove[] = [
  { name: 'Figure-4 glute stretch', prescription: '30 sec each side', note: 'On your back, ankle over the opposite knee, pull the thigh toward you.' },
  { name: 'Standing forward fold', prescription: '40 sec', note: 'Soft knees. Let your head hang, this is for the hamstrings and lower back.' },
  { name: 'Kneeling hip flexor stretch', prescription: '30 sec each side', note: 'Tuck the pelvis under before you lean forward, otherwise you stretch your lower back instead.' },
  { name: 'Standing quad stretch', prescription: '30 sec each side', note: 'Knees together, push the hip forward.' },
  { name: "Child's pose", prescription: '45 sec', note: 'Knees wide, hips back to the heels, breathe into your lower back.' },
];

const UPPER_WARMUP: MobilityMove[] = [
  { name: 'Arm circles', prescription: '15 forward, 15 back', note: 'Start small and grow them.' },
  { name: 'Band pull-aparts', prescription: '15 reps', note: 'Straight arms, squeeze the shoulder blades. Wakes up the upper back for posture work.' },
  { name: 'Scapular pulls', prescription: '10 reps', note: 'On the lat pulldown, move only the shoulder blades, arms stay straight.' },
  { name: 'Cat-cow', prescription: '8 slow rounds', note: 'Warms the spine before you press overhead.' },
];

const UPPER_COOLDOWN: MobilityMove[] = [
  { name: 'Doorway chest stretch', prescription: '30 sec each side', note: 'Forearm on the frame, step through gently. This is the one that undoes desk posture.' },
  { name: 'Cross-body shoulder stretch', prescription: '30 sec each side' },
  { name: 'Overhead lat stretch', prescription: '30 sec each side', note: 'Hold something above you, sink the hips back.' },
  { name: 'Neck side stretch', prescription: '20 sec each side', note: 'Ear toward shoulder, no pulling hard.' },
  { name: 'Cat-cow', prescription: '8 slow rounds' },
];

const FULL_WARMUP: MobilityMove[] = [
  { name: 'Light cardio', prescription: '5 min', note: 'Bike, walk or march. Warm before you touch a weight.' },
  { name: 'Bodyweight glute bridges', prescription: '10 reps' },
  { name: "World's greatest stretch", prescription: '5 each side', note: 'Lunge, elbow inside the foot, then rotate the top arm to the ceiling.' },
  { name: 'Arm circles', prescription: '15 forward, 15 back' },
  { name: 'Bodyweight squats', prescription: '10 reps' },
];

const FULL_COOLDOWN: MobilityMove[] = [
  { name: 'Figure-4 glute stretch', prescription: '30 sec each side' },
  { name: 'Standing forward fold', prescription: '40 sec' },
  { name: 'Doorway chest stretch', prescription: '30 sec each side' },
  { name: 'Kneeling hip flexor stretch', prescription: '30 sec each side' },
  { name: "Child's pose", prescription: '45 sec' },
];

/* ------------------------------------------------------------------ *
 * The four sessions
 * ------------------------------------------------------------------ */

export const SESSIONS: Session[] = [
  {
    id: 'lower-a',
    dayOffset: 0,
    title: 'Lower A',
    subtitle: 'Glute and squat focus',
    kind: 'lower',
    accent: '#f48fb1',
    warmup: GLUTE_WARMUP,
    warmupVideo: VIDEOS.legWarmup.url,
    cooldown: LOWER_COOLDOWN,
    cooldownVideo: VIDEOS.legCooldown.url,
    exercises: [
      {
        id: 'barbell-squat',
        name: 'Barbell Squat',
        sets: 3,
        repsLabel: '10',
        repTarget: 10,
        suggestedKg: 20,
        tier: 'compound',
        restBetweenSets: [120, 180],
        restBeforeNext: [120, 180],
        cues: [
          'Feet shoulder-width, slight hip hinge, push the hips back for a small forward lean.',
          'Sit back rather than driving the knees forward.',
          'Shin stays vertical. That is what keeps the load in the hips instead of the quads.',
        ],
        videos: [VIDEOS.squatVariations],
      },
      {
        id: 'db-hip-thrust',
        name: 'Dumbbell Hip Thrust',
        sets: 4,
        repsLabel: '12 to 15',
        repTarget: 15,
        suggestedKg: 10,
        tier: 'compound',
        restBetweenSets: [120, 120],
        restBeforeNext: [120, 180],
        cues: [
          'Bench edge just below the shoulder blades.',
          'Feet set so the knees hit 90 degrees at the top.',
          'Feet too close loads the quads, too far loads the hamstrings.',
        ],
        videos: [VIDEOS.hipThrustTutorial, VIDEOS.hipThrustTips],
      },
      {
        id: 'reverse-lunge',
        name: 'Reverse Lunges',
        sets: 3,
        repsLabel: '12 each leg',
        repTarget: 12,
        suggestedKg: 7.5,
        perSide: true,
        tier: 'accessory',
        restBetweenSets: [90, 120],
        restBeforeNext: [120, 180],
        cues: [
          'The front leg does the work.',
          'Front knee never travels past 90 degrees.',
          'Slight forward lean for glute bias.',
        ],
        videos: [VIDEOS.reverseLunge],
      },
      {
        id: 'seated-leg-curl',
        name: 'Seated Leg Curl',
        sets: 3,
        repsLabel: '12 to 15',
        repTarget: 15,
        suggestedKg: 12,
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 180],
        cues: [
          'Pad sits between the Achilles and the lower calf.',
          'Knees aligned with the machine pivot.',
          'Toes neutral or slightly up.',
          'Glutes glued to the seat. If your hips lift, the weight is too heavy.',
          'Full range every rep.',
        ],
        videos: [VIDEOS.legCurl, VIDEOS.legCurlAlt],
      },
      {
        id: 'hip-abduction',
        name: 'Hip Abduction Machine',
        sets: 3,
        repsLabel: '20',
        repTarget: 20,
        suggestedKg: 20,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 180],
        cues: [
          'Sit upright.',
          'Upright posture emphasises the gluteus medius, the upper-outer glute behind the shelf and the hip-to-waist ratio.',
        ],
        videos: [VIDEOS.hipAbduction],
      },
      {
        id: 'cable-kickbacks',
        name: 'Cable Kickbacks',
        sets: 3,
        repsLabel: '15 each side',
        repTarget: 15,
        suggestedKg: 5,
        perSide: true,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        cues: [
          'Control it. No leg swinging.',
          'No arching the lower back to fake range.',
          'Movement comes from the hip, not the spine.',
        ],
        videos: [VIDEOS.kickbacks],
      },
    ],
  },

  {
    id: 'upper-core',
    dayOffset: 1,
    title: 'Upper + Core',
    subtitle: 'Posture and the hourglass line',
    kind: 'upper',
    accent: '#c8a2e0',
    intro: 'Light loads, moderate reps. This session is for posture and shape, not size.',
    sessionVideo: VIDEOS.upperDay,
    warmup: UPPER_WARMUP,
    warmupVideo: VIDEOS.upperWarmup.url,
    cooldown: UPPER_COOLDOWN,
    cooldownVideo: VIDEOS.upperCooldown.url,
    exercises: [
      {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 20,
        tier: 'accessory',
        restBetweenSets: [90, 120],
        restBeforeNext: [120, 180],
        cues: ['Full stretch at the top, full contraction at the bottom.', 'Slow and controlled.'],
        videos: [VIDEOS.upperDay],
      },
      {
        id: 'seated-row',
        name: 'Seated Row',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 20,
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 180],
        cues: ['Squeeze the shoulder blades together.', 'Do not yank with the arms.'],
        videos: [VIDEOS.upperDay],
      },
      {
        id: 'overhead-db-press',
        name: 'Overhead Dumbbell Press',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 4,
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 180],
        cues: ['Ribs down, do not arch the lower back to press.'],
        videos: [VIDEOS.overheadPress],
      },
      {
        id: 'lateral-raise',
        name: 'Dumbbell Lateral Raise',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 3,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 180],
        cues: [
          'Soft knees, slight forward lean.',
          'Start at your pockets and raise in a slight Y, not a flat T.',
          'Lead with the elbows.',
          'Stop at shoulder height so the traps do not take over.',
        ],
        videos: [VIDEOS.lateralRaise],
      },
      {
        id: 'bent-over-lateral-raise',
        name: 'Bent-Over Lateral Raise',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 3,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 180],
        cues: ['Your posture exercise.', 'Hinge at the hips, flat back, raise out and slightly back.'],
        videos: [VIDEOS.upperDay],
      },
      {
        id: 'cable-bicep-curl',
        name: 'Cable Bicep Curl',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 10,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 180],
        cues: ['Elbows pinned at your sides, no swinging.', 'Lower slowly.'],
      },
      {
        id: 'cable-tricep-pushdown',
        name: 'Cable Tricep Pushdown',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 10,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 180],
        cues: ['Elbows pinned to your sides.', 'Only the forearms move.'],
        videos: [VIDEOS.tricepPushdown],
      },
      {
        id: 'plank',
        name: 'Plank',
        sets: 3,
        repsLabel: '45 sec',
        repTarget: 45,
        suggestedKg: 0,
        timeBased: true,
        tier: 'isolation',
        restBetweenSets: [45, 45],
        restBeforeNext: [45, 60],
        cues: ['Straight line from head to heels. Squeeze the glutes so the hips cannot sag.'],
      },
      {
        id: 'dead-bug',
        name: 'Dead Bug',
        sets: 3,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 0,
        tier: 'isolation',
        restBetweenSets: [45, 45],
        restBeforeNext: [45, 60],
        cues: ['Lower back pressed flat into the floor the whole time.', 'Move slowly.'],
        videos: [VIDEOS.deadBug],
      },
      {
        id: 'pallof-press',
        name: 'Pallof Press',
        sets: 3,
        repsLabel: '12 each side',
        repTarget: 12,
        suggestedKg: 10,
        perSide: true,
        tier: 'isolation',
        restBetweenSets: [45, 45],
        cues: [
          'Stand side-on to the cable, press it straight out from your chest and refuse to twist.',
          'Nothing moves except your arms.',
        ],
        videos: [VIDEOS.pallofPress],
      },
    ],
  },

  {
    id: 'lower-b',
    dayOffset: 3,
    title: 'Lower B',
    subtitle: 'Hamstring and posterior chain',
    kind: 'lower',
    accent: '#f48fb1',
    warmup: GLUTE_WARMUP,
    warmupVideo: VIDEOS.legWarmup.url,
    cooldown: LOWER_COOLDOWN,
    cooldownVideo: VIDEOS.legCooldown.url,
    exercises: [
      {
        id: 'smith-rdl',
        name: 'Smith Machine RDL',
        sets: 4,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 25,
        loadNote: 'Start 20 to 30kg total',
        tier: 'compound',
        restBetweenSets: [120, 180],
        restBeforeNext: [120, 180],
        cues: [
          'Feet hip-width, soft knees.',
          'Push the hips back like you are reaching them toward a wall behind you.',
          'Bar stays close to the body.',
          'Neutral spine, no rounding.',
          'Lower to a deep hamstring stretch, drive the hips forward, squeeze the glutes.',
          'Do not over-extend at the top.',
          'Turn the feet slightly outward to feel it more in the glutes.',
        ],
        swapNote:
          'Once the hinge feels automatic, progress to the single leg RDL.',
        videos: [VIDEOS.smithRdl, VIDEOS.singleLegRdl],
      },
      {
        id: 'hip-thrust-b',
        name: 'Hip Thrust',
        sets: 4,
        repsLabel: '12 to 15',
        repTarget: 15,
        suggestedKg: 10,
        loadNote: 'Dumbbell or Smith machine',
        tier: 'compound',
        restBetweenSets: [120, 120],
        restBeforeNext: [120, 180],
        cues: [
          'Bench edge just below the shoulder blades.',
          'Knees at 90 degrees at the top, drive through the hips.',
        ],
        videos: [VIDEOS.hipThrustTutorial],
      },
      {
        id: 'smith-step-ups',
        name: 'Smith Machine Step-Ups',
        sets: 3,
        repsLabel: '12 each leg',
        repTarget: 12,
        suggestedKg: 7.5,
        perSide: true,
        tier: 'accessory',
        restBetweenSets: [90, 120],
        restBeforeNext: [120, 180],
        cues: [
          'Slight forward lean, vertical shin.',
          'Drive through the heel of the working leg.',
          'Do not push off the bottom foot.',
        ],
        videos: [VIDEOS.smithStepUps],
      },
      {
        id: 'sumo-squat',
        name: 'Sumo Squat',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 10,
        tier: 'accessory',
        restBetweenSets: [90, 120],
        restBeforeNext: [120, 180],
        cues: [
          'Stance about 1.5x shoulder width, toes out roughly 45 degrees.',
          'Dumbbell hangs naturally between the legs, not at the chest, so your arms are not the limiting factor.',
          'Slight forward lean for hip flexion.',
          'Do not go so wide that the inner thighs take over.',
        ],
        swapNote:
          'Rotation option: every third or fourth week, swap this for Bulgarian split squat, 3 x 10 each leg at 7.5kg.',
        videos: [VIDEOS.squatVariations, VIDEOS.bulgarianSplit],
      },
      {
        id: 'seated-leg-curl-b',
        name: 'Seated Leg Curl',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 12,
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 180],
        cues: [
          'Glutes glued to the seat, knees on the machine pivot.',
          'Full range, controlled on the way back.',
        ],
        videos: [VIDEOS.legCurl],
      },
      {
        id: 'hip-abduction-b',
        name: 'Hip Abduction Machine',
        sets: 3,
        repsLabel: '20',
        repTarget: 20,
        suggestedKg: 20,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        cues: ['Sit upright to bias the gluteus medius.'],
        videos: [VIDEOS.hipAbduction],
      },
    ],
  },

  {
    id: 'glute-pump',
    dayOffset: 5,
    title: 'Glute Pump + Core',
    subtitle: 'Light session and cardio',
    kind: 'full',
    accent: '#f6b3a0',
    intro: 'Light session. No heavy compounds, so it sits fine 48 hours after Lower B.',
    warmup: FULL_WARMUP,
    warmupVideo: VIDEOS.fullWarmup.url,
    cooldown: FULL_COOLDOWN,
    cooldownVideo: VIDEOS.fullCooldown.url,
    exercises: [
      {
        id: 'hip-thrust-pump',
        name: 'Hip Thrust',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 10,
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 180],
        cues: ['Knees at 90 degrees at the top, squeeze hard and hold for a beat.'],
        videos: [VIDEOS.hipThrustTutorial],
      },
      {
        id: 'cable-kickbacks-pump',
        name: 'Cable Kickbacks',
        sets: 3,
        repsLabel: '15 each side',
        repTarget: 15,
        suggestedKg: 5,
        perSide: true,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 180],
        cues: ['Movement from the hip, not the spine. No swinging.'],
        videos: [VIDEOS.kickbacks],
      },
      {
        id: 'hip-abduction-pump',
        name: 'Hip Abduction Machine',
        sets: 3,
        repsLabel: '20',
        repTarget: 20,
        suggestedKg: 20,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 180],
        cues: ['Sit upright.'],
        videos: [VIDEOS.hipAbduction],
      },
      {
        id: 'row-or-pulldown',
        name: 'Seated Row or Lat Pulldown',
        sets: 3,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 15,
        loadNote: 'Light',
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 180],
        cues: ['Pick whichever you feel like. Light and controlled.'],
        videos: [VIDEOS.upperDay],
      },
      {
        id: 'db-chest-press',
        name: 'Dumbbell Chest Press',
        sets: 3,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 4,
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 180],
        cues: ['Lying on a bench, control the descent.'],
        videos: [VIDEOS.chestPress],
      },
      {
        id: 'bicycle-crunch',
        name: 'Bicycle Crunch',
        sets: 3,
        repsLabel: '20',
        repTarget: 20,
        suggestedKg: 0,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        cues: ['Part of the core circuit. Slow, rotate from the ribs, never yank the neck.'],
        videos: [VIDEOS.coreCircuit],
      },
      {
        id: 'leg-raises',
        name: 'Leg Raises',
        sets: 3,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 0,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        cues: ['Lower back stays flat on the floor. Shorten the range if it lifts.'],
        videos: [VIDEOS.coreCircuitTwo],
      },
      {
        id: 'side-plank',
        name: 'Side Plank',
        sets: 3,
        repsLabel: '30 sec each side',
        repTarget: 30,
        perSide: true,
        timeBased: true,
        suggestedKg: 0,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        cues: ['Hips stacked and lifted, do not let them drop.'],
      },
      {
        id: 'in-and-outs',
        name: 'In and Outs',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 0,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 180],
        cues: [
          'Balanced on your tailbone, extend both legs out and draw them back in.',
          'Last move of the circuit. Rest 45 to 60 sec between rounds.',
        ],
        videos: [VIDEOS.coreCircuit],
      },
      {
        id: 'incline-walk',
        name: 'Incline Walk',
        sets: 1,
        repsLabel: '25 to 35 min',
        repTarget: 30,
        suggestedKg: 0,
        timeBased: true,
        tier: 'isolation',
        cues: [
          'Steady incline walk, conversational pace.',
          'Or the StairMaster pyramid: level 7 for 5 min, level 15 for 4 min, level 13 for 3 min, level 11 for 2 min.',
        ],
        videos: [VIDEOS.stairmaster],
      },
    ],
    finisher:
      'The core circuit is exercises 6 to 9, done as 3 rounds with 45 to 60 seconds rest between rounds rather than straight sets.',
  },
];

/* ------------------------------------------------------------------ *
 * Optional library
 * ------------------------------------------------------------------ */

/**
 * Deliberately tiny. The plan's "do not add back" list exists because each of
 * those exercises works against a stated goal, so they are not offered here.
 * Leg press is the single exception the plan allows.
 */
export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: 'lib-leg-press',
    name: 'Leg Press',
    group: 'legs',
    sets: 3,
    repsLabel: '12',
    repTarget: 12,
    suggestedKg: 40,
    tier: 'accessory',
    restBetweenSets: [90, 120],
    cues: [
      'Feet high and narrow on the platform to bias the hips rather than the quads.',
      'Knees at roughly 90 degrees at the bottom.',
      'Never lock the knees out hard at the top.',
    ],
    notes:
      'Quad-dominant even with high foot placement. Your plan allows it at most once a week if you enjoy it, and never on both lower days.',
  },
  {
    id: 'lib-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    group: 'glutes',
    sets: 3,
    repsLabel: '10 each leg',
    repTarget: 10,
    perSide: true,
    suggestedKg: 7.5,
    tier: 'compound',
    restBetweenSets: [120, 120],
    cues: [
      'Front foot far enough forward that the knee stays behind the toes.',
      'Torso leans slightly forward for glute bias.',
    ],
    notes: 'The rotation option for sumo squat every third or fourth week.',
    videos: [VIDEOS.bulgarianSplit],
  },
  {
    id: 'lib-single-leg-rdl',
    name: 'Single Leg RDL',
    group: 'glutes',
    sets: 3,
    repsLabel: '10 each leg',
    repTarget: 10,
    perSide: true,
    suggestedKg: 7.5,
    tier: 'compound',
    restBetweenSets: [120, 120],
    cues: [
      'Hinge on one leg, the other extends behind you as a counterweight.',
      'Hips stay square to the floor, do not let the back hip open up.',
    ],
    notes: 'The progression from the Smith machine RDL, once the hinge feels automatic.',
    videos: [VIDEOS.singleLegRdl],
  },
];

export function libraryExercise(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find((e) => e.id === id);
}

export function findExercise(id: string): Exercise | undefined {
  for (const session of SESSIONS) {
    const hit = session.exercises.find((e) => e.id === id);
    if (hit) return hit;
  }
  return libraryExercise(id);
}

/* ------------------------------------------------------------------ *
 * Rest days and lookups
 * ------------------------------------------------------------------ */

export interface RestDay {
  dayOffset: number;
  label: string;
  note: string;
}

export const REST_DAYS: RestDay[] = [
  { dayOffset: 2, label: 'Rest or walk', note: 'A gentle walk is perfect. Nothing that fatigues the legs.' },
  { dayOffset: 4, label: 'Rest', note: 'Full rest before Saturday. Recovery is where the growth happens.' },
  { dayOffset: 6, label: 'Rest', note: 'Reset for the week. Sleep and food do the work today.' },
];

export const SESSION_BY_OFFSET: Record<number, Session | undefined> = SESSIONS.reduce(
  (acc, s) => ({ ...acc, [s.dayOffset]: s }),
  {} as Record<number, Session | undefined>,
);

export const REST_DAY_BY_OFFSET: Record<number, RestDay | undefined> = REST_DAYS.reduce(
  (acc, d) => ({ ...acc, [d.dayOffset]: d }),
  {} as Record<number, RestDay | undefined>,
);

export function getSession(id: string): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}

/* ------------------------------------------------------------------ *
 * Reference content
 * ------------------------------------------------------------------ */

export const PROGRAM_META = {
  name: 'Bloom — Final Plan',
  goal: 'Round glutes, hourglass line, flat midsection, minimal quad growth, lean toned arms',
  schedule: 'Four sessions a week: Lower A, Upper + Core, Lower B, Glute Pump + Core + Cardio',
  equipment: 'Barbell, dumbbells, cable, Smith machine, hip abduction machine, leg curl machine',
  startingLoads: 'Barbell squat 20kg, dumbbells 7.5 to 10kg on lower, 3 to 4kg on upper, Smith RDL 20 to 30kg total',
  spacingNote:
    'The two lower days sit 72 hours apart, and the Saturday session is light enough to land 48 hours after Lower B without interfering.',
  sessionLength: 'Sessions run about 50 to 60 minutes.',
  selfCheck: 'Ready check before your next set: breathing normal, no burn or shake in the target muscle.',
  progression:
    'Add reps before weight. When you hit the top of the rep range on every set with clean form, add 2.5kg and drop back to the bottom of the range.',
  progressionWhy:
    'Log every session. Progressive overload is the mechanism. Without a record you will sit at the same load for months without noticing.',
};

export interface RemovedExercise {
  name: string;
  reason: string;
}

/** The plan's "Do Not Add Back" table, kept visible so the reasoning survives. */
export const DO_NOT_ADD_BACK: RemovedExercise[] = [
  { name: 'Leg extension', reason: 'Pure quad isolation. Zero glute or hamstring involvement. The most quad-specific machine in any gym.' },
  { name: 'Leg press', reason: 'Quad-dominant even with high foot placement. Optional at most once a week if you enjoy it, never on both lower days.' },
  { name: 'Goblet squat', reason: 'Most quad-dominant of the squat variations.' },
  { name: 'Weighted Russian twist, weighted side bends, any loaded rotation', reason: 'Loaded rotation grows the obliques. Thicker obliques blunt the waist taper. Bodyweight versions are fine.' },
  { name: 'Dumbbell upright row', reason: 'Builds traps and carries impingement risk. Bigger traps make shoulders look sloped, working against the cap that creates the hourglass illusion.' },
  { name: 'Dumbbell front raise', reason: 'Redundant. The overhead press already loads the front delt.' },
  { name: 'Face pull', reason: 'Redundant with the bent-over lateral raise.' },
  { name: 'Around the world', reason: 'Low value for the shoulder risk.' },
  { name: 'Tricep overhead extension, kickback, dips', reason: 'You had six tricep exercises. One is enough, and it is the pushdown.' },
  { name: 'Push-ups', reason: 'You do not like them. Chest press covers it.' },
  { name: 'Glute bridge', reason: 'Redundant with the hip thrust, which is the same movement loaded better.' },
];

export const QUAD_VS_GLUTE = {
  quad: 'Leg press, leg extension, goblet squat, front squat, hack squat, walking lunges, high step-ups, any squat with an upright torso and forward knee travel.',
  glute: 'Hip thrust, glute bridge, RDL, 45 degree back extension, reverse lunge with forward lean, cable kickback, hip abduction, leg curl, step-up with a vertical shin.',
};

export const HONEST_NOTES = [
  {
    title: 'The flat tummy is a nutrition outcome',
    body: 'Nothing here burns fat off your stomach specifically, because no exercise can. The core work builds and strengthens the muscle underneath. Whether it becomes visible is decided by body fat percentage, which comes from food, sleep and daily step count.',
  },
  {
    title: 'A round butt is muscle',
    body: 'There is no other pathway to it. This plan builds glutes hard while giving quads as little stimulus as the movements allow, and keeps the upper body light and high-rep so your arms and shoulders get shape rather than size. You will not accidentally become bulky. That takes years of heavy loading plus deliberate overfeeding.',
    video: VIDEOS.glutesNotLegs,
  },
  {
    title: 'Where this comes from',
    body: "Programming principles follow Bret Contreras's work on glute-versus-quad bias and Vera Armishaw's form cues. Neither has reviewed this plan personally. If anything hurts beyond normal muscle soreness, stop and see a physio.",
  },
];
