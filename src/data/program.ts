import { VIDEOS, type VideoRef } from './videos';

export type RestTier = 'compound' | 'accessory' | 'isolation';

export interface RestRule {
  tier: RestTier;
  label: string;
  betweenSets: [number, number]; // seconds, min-max
  description: string;
}

/** Rest timing rules, straight from the plan's rest table. */
export const REST_RULES: Record<RestTier, RestRule> = {
  compound: {
    tier: 'compound',
    label: 'Heavy compound',
    betweenSets: [120, 180],
    description: 'Barbell squat, RDL, hip thrust, Bulgarian split squat',
  },
  accessory: {
    tier: 'accessory',
    label: 'Moderate accessory',
    betweenSets: [90, 120],
    description: 'Step-ups, lunges, goblet squat, rows, press',
  },
  isolation: {
    tier: 'isolation',
    label: 'Isolation & burnout',
    betweenSets: [45, 60],
    description: 'Kickbacks, abductions, lateral raises, glute bridges',
  },
};

/** Between exercises: 2 to 3 minutes regardless of what you just did. */
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
  /** True when the rep count is per side, so each set is logged twice. */
  perSide?: boolean;
  /** True when reps are actually seconds (planks). */
  timeBased?: boolean;
  tier: RestTier;
  /** Overrides the tier default when the plan specifies something different. */
  restBetweenSets?: [number, number];
  restBeforeNext?: [number, number];
  cues: string[];
  cueSource?: string;
  notes?: string;
  videos?: VideoRef[];
}

export interface Session {
  id: string;
  /** 0 = Sunday, matching Date.getDay(). */
  dayOfWeek: number;
  dayName: string;
  title: string;
  subtitle: string;
  kind: 'lower' | 'upper' | 'full' | 'rest';
  accent: string;
  intro?: string;
  warmup?: string[];
  exercises: Exercise[];
  finisher?: string;
}

const GLUTE_WARMUP = [
  '10 bodyweight glute bridges',
  '15 banded side steps each direction',
  '10 bodyweight squats',
];

export const SESSIONS: Session[] = [
  {
    id: 'lower-a',
    dayOfWeek: 1,
    dayName: 'Monday',
    title: 'Lower A',
    subtitle: 'Glute focus',
    kind: 'lower',
    accent: '#F49AC1',
    warmup: GLUTE_WARMUP,
    exercises: [
      {
        id: 'barbell-squat',
        name: 'Barbell Squat',
        sets: 3,
        repsLabel: '10',
        repTarget: 10,
        suggestedKg: 20,
        loadNote: 'Empty bar',
        tier: 'compound',
        restBetweenSets: [120, 180],
        restBeforeNext: [180, 180],
        cueSource: 'Vera',
        cues: [
          'Feet shoulder-width, slight hip hinge.',
          'Push the hips back to allow a bit of forward lean in your upper body. That lean is what shifts focus from quads to glutes.',
          'Sit back into it rather than driving your knees forward, and keep the shin more vertical.',
        ],
        notes: 'Glute-biased squat, not a quad squat.',
        videos: [VIDEOS.squatVariations, VIDEOS.glutesNotLegs],
      },
      {
        id: 'db-hip-thrust',
        name: 'Dumbbell Hip Thrust',
        sets: 4,
        repsLabel: '12 to 15',
        repTarget: 15,
        suggestedKg: 10,
        loadNote: 'On hips',
        tier: 'compound',
        restBetweenSets: [120, 120],
        restBeforeNext: [120, 180],
        cueSource: 'Vera',
        cues: [
          'Bench edge sits just below your shoulder blades.',
          'Feet positioned so your knees form a 90 degree angle at the top. That is the sweet spot for glute activation.',
          'Feet too close to your body shifts tension to quads, too far out shifts it to hamstrings.',
          'Spine stays straight throughout, drive through the hips. Form over weight.',
        ],
        videos: [VIDEOS.hipThrustTutorial, VIDEOS.hipThrustFormTips, VIDEOS.singleLegHipThrust],
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
        restBeforeNext: [120, 120],
        cueSource: 'Vera',
        cues: [
          'The front leg does all the work.',
          'Front knee should not travel forward past a 90 degree angle.',
          'Add a slight forward lean to bias the glute.',
        ],
        notes: 'Rest after both legs, not between them.',
        videos: [VIDEOS.reverseLungeGlutes, VIDEOS.reverseLungeCue],
      },
      {
        id: 'glute-bridge',
        name: 'Glute Bridge',
        sets: 3,
        repsLabel: '20',
        repTarget: 20,
        suggestedKg: 0,
        loadNote: 'Bodyweight',
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        cues: [
          'Same setup logic as the hip thrust but on the floor.',
          'Squeeze hard at the top and hold for one second each rep.',
        ],
        videos: [VIDEOS.hipThrustTutorial],
      },
      {
        id: 'kickbacks',
        name: 'Cable or Band Kickbacks',
        sets: 3,
        repsLabel: '15 each side',
        repTarget: 15,
        suggestedKg: 0,
        perSide: true,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        cueSource: 'Vera',
        cues: [
          'Control it. Do not swing the leg.',
          'Do not arch your lower back to get more range, that is the most common mistake.',
          'The movement comes from the hip, not the spine.',
        ],
        videos: [VIDEOS.kickbackMistakes],
      },
    ],
  },
  {
    id: 'upper-core',
    dayOfWeek: 2,
    dayName: 'Tuesday',
    title: 'Upper + Core',
    subtitle: 'Posture & the hourglass line',
    kind: 'upper',
    accent: '#C9A7E8',
    intro:
      'Keep loads light and reps moderate. This session is for posture, shoulder shape and the hourglass line, not size.',
    exercises: [
      {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        sets: 3,
        repsLabel: '10',
        repTarget: 10,
        suggestedKg: 20,
        tier: 'accessory',
        restBetweenSets: [90, 120],
        restBeforeNext: [120, 120],
        cues: ['Full stretch at the top, full contraction at the bottom.', 'Slow and controlled.'],
      },
      {
        id: 'seated-row',
        name: 'Seated Row',
        sets: 3,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 20,
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 120],
        cues: ['Squeeze the shoulder blades together, control the return.'],
      },
      {
        id: 'db-shoulder-press',
        name: 'Dumbbell Shoulder Press',
        sets: 3,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 4,
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 120],
        cues: ['Ribs down, do not arch the lower back to press.'],
      },
      {
        id: 'lateral-raises',
        name: 'Lateral Raises',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 3,
        loadNote: '2 to 4kg',
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        cues: [
          'Light weight, slow tempo.',
          'This builds the shoulder cap that makes your waist look smaller by contrast.',
        ],
      },
      {
        id: 'plank',
        name: 'Plank',
        sets: 3,
        repsLabel: '40 sec',
        repTarget: 40,
        suggestedKg: 0,
        timeBased: true,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        cues: ['Straight line from head to heels. Squeeze the glutes to stop the hips sagging.'],
      },
      {
        id: 'dead-bug',
        name: 'Dead Bug',
        sets: 3,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 0,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        cues: ['Lower back stays pressed into the floor the whole time. Move slowly.'],
      },
    ],
    finisher:
      "Shy girl alternative (Vera's cable-only upper): if free weights feel intimidating, swap the whole session for lat pulldown, straight-arm cable pulldown, cable bicep curl, half-kneeling single-arm lat pulldown, lateral raises. Same rest times apply.",
  },
  {
    id: 'lower-b',
    dayOfWeek: 4,
    dayName: 'Thursday',
    title: 'Lower B',
    subtitle: 'Hamstring & glute focus',
    kind: 'lower',
    accent: '#F49AC1',
    warmup: GLUTE_WARMUP,
    exercises: [
      {
        id: 'db-rdl',
        name: 'Dumbbell Romanian Deadlift',
        sets: 4,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 10,
        tier: 'compound',
        restBetweenSets: [120, 180],
        restBeforeNext: [180, 180],
        cues: [
          'Feet hip-width, soft knees.',
          "Push the hips back like you're reaching them toward a wall behind you.",
          'Keep the dumbbells travelling close to your body, that is what keeps the stress off your lower back.',
          'Neutral spine the whole way, no rounding.',
          'Lower until you feel a deep hamstring stretch, then drive hips forward and squeeze the glutes to stand.',
          'Do not over-extend at the top.',
        ],
      },
      {
        id: 'sumo-squat',
        name: 'Sumo Squat',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 10,
        loadNote: 'One dumbbell held between legs',
        tier: 'accessory',
        restBetweenSets: [90, 120],
        restBeforeNext: [120, 120],
        cueSource: 'Vera',
        cues: [
          'Wide stance, toes pointed outward. Chest tall, push the knees out as you descend.',
          'This one hits the inner thighs more.',
          'Do not go so wide that the adductors take over completely.',
          'Let the dumbbell hang naturally between the legs rather than holding it at your chest, so your arms are not the limiting factor.',
        ],
        videos: [VIDEOS.squatVariations],
      },
      {
        id: 'step-ups',
        name: 'Step-Ups onto Bench',
        sets: 3,
        repsLabel: '12 each leg',
        repTarget: 12,
        suggestedKg: 7.5,
        perSide: true,
        tier: 'accessory',
        restBetweenSets: [90, 120],
        restBeforeNext: [120, 120],
        cueSource: 'Vera',
        cues: [
          'She calls this one of the best glute exercises.',
          'Slight forward lean, keep the shin vertical.',
          'Drive through the heel of the working leg.',
          'Do not push off the bottom foot to help yourself up.',
        ],
        videos: [VIDEOS.stepUpsTutorial, VIDEOS.stepUpsDumbbell],
      },
      {
        id: 'bulgarian-split-squat',
        name: 'Bulgarian Split Squat',
        sets: 3,
        repsLabel: '10 each leg',
        repTarget: 10,
        suggestedKg: 7.5,
        perSide: true,
        tier: 'compound',
        restBetweenSets: [120, 120],
        restBeforeNext: [120, 120],
        cues: [
          'Front foot far enough forward that your knee stays behind your toes.',
          'Torso leans slightly forward for glute bias.',
          'If balance is the issue, use the bench-supported alternative version.',
        ],
        videos: [VIDEOS.bulgarianAlternative],
      },
      {
        id: 'hip-abduction',
        name: 'Hip Abduction',
        sets: 3,
        repsLabel: '20',
        repTarget: 20,
        suggestedKg: 0,
        loadNote: 'Machine or band',
        tier: 'isolation',
        restBetweenSets: [45, 60],
        cues: ['Keep the torso still. Do not lean away to get more range.'],
        videos: [VIDEOS.kickbackMistakes],
      },
    ],
  },
  {
    id: 'full-body',
    dayOfWeek: 6,
    dayName: 'Saturday',
    title: 'Full Body + Core',
    subtitle: 'Plus cardio finish',
    kind: 'full',
    accent: '#F7B267',
    exercises: [
      {
        id: 'hip-thrust-fb',
        name: 'Hip Thrust',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 10,
        tier: 'compound',
        restBetweenSets: [120, 120],
        restBeforeNext: [120, 180],
        cues: [
          'Bench edge just below the shoulder blades, knees at 90 degrees at the top.',
          'Drive through the hips, spine neutral.',
        ],
        videos: [VIDEOS.hipThrustTutorial, VIDEOS.hipThrustFormTips],
      },
      {
        id: 'goblet-squat',
        name: 'Goblet Squat',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 10,
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 120],
        cueSource: 'Vera',
        cues: [
          'Dumbbell at chest, upright torso.',
          'Deep knee bend means this one is more quad-focused, so treat it as a movement quality exercise rather than your main glute driver.',
        ],
        videos: [VIDEOS.squatVariations],
      },
      {
        id: 'push-ups',
        name: 'Push-Ups',
        sets: 3,
        repsLabel: '8 to 12',
        repTarget: 12,
        suggestedKg: 0,
        loadNote: 'Knees are fine',
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 120],
        cues: ['Body in one line, elbows about 45 degrees from the ribs.'],
      },
      {
        id: 'bent-over-row',
        name: 'Bent-Over Row',
        sets: 3,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 4,
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 120],
        cues: ['Hinge at the hips, flat back, pull to the hip not the chest.'],
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
        cues: ['Slow. Rotate from the ribs, not by yanking the neck.'],
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
      },
      {
        id: 'side-plank',
        name: 'Side Plank',
        sets: 3,
        repsLabel: '30 sec each side',
        repTarget: 30,
        suggestedKg: 0,
        perSide: true,
        timeBased: true,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        cues: ['Hips stacked and lifted, do not let them drop toward the floor.'],
      },
      {
        id: 'cardio',
        name: 'Incline Walk',
        sets: 1,
        repsLabel: '20 to 30 min',
        repTarget: 30,
        suggestedKg: 0,
        timeBased: true,
        tier: 'isolation',
        cues: ['Steady incline walk. Conversational pace, no need to run.'],
      },
    ],
  },
];

export interface RestDay {
  dayOfWeek: number;
  dayName: string;
  label: string;
  note: string;
}

export const REST_DAYS: RestDay[] = [
  { dayOfWeek: 3, dayName: 'Wednesday', label: 'Rest or walk', note: 'A gentle walk is perfect. Nothing that fatigues the legs.' },
  { dayOfWeek: 5, dayName: 'Friday', label: 'Rest', note: 'Full rest before Saturday. Recovery is where the growth happens.' },
  { dayOfWeek: 0, dayName: 'Sunday', label: 'Rest', note: 'Reset for the week. Sleep and food do the work today.' },
];

export const SESSION_BY_DAY: Record<number, Session | undefined> = SESSIONS.reduce(
  (acc, s) => ({ ...acc, [s.dayOfWeek]: s }),
  {} as Record<number, Session | undefined>,
);

export const REST_DAY_BY_DAY: Record<number, RestDay | undefined> = REST_DAYS.reduce(
  (acc, d) => ({ ...acc, [d.dayOfWeek]: d }),
  {} as Record<number, RestDay | undefined>,
);

export function getSession(id: string): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}

export function getExercise(sessionId: string, exerciseId: string): Exercise | undefined {
  return getSession(sessionId)?.exercises.find((e) => e.id === exerciseId);
}

export const PROGRAM_META = {
  name: '4-Day Glute-Focused Plan',
  goal: 'Rounder glutes, hourglass shape, flat midsection, lean arms and legs',
  startingLoads: '7.5 to 10kg dumbbells on lower, empty barbell on squat, 4kg dumbbells on upper',
  spacingNote:
    'Always leave 48 to 72 hours between lower sessions. Monday and Thursday gives you 72 hours, which is ideal. Two leg days a week is enough for glute growth.',
  sessionLength: 'Total session should land around 50 to 60 minutes, not 90.',
  selfCheck:
    'Self-check before your next set: breathing back to normal, no burning or shaking in the target muscle. If you are still panting, wait.',
  progression:
    'Add reps before you add weight. When 15 reps feels easy on any exercise, go up 2.5kg and drop back to the lower end of the rep range.',
  progressionWhy:
    'Track it. Write down the weight and reps you hit each session, because progressive overload is the actual mechanism behind glute growth. Without a record you will unconsciously stay at the same load for months.',
  veraLegDay:
    'Her own glute-growth leg day for comparison: hip thrusts 4x10, RDLs 4x8, step-ups 4x8 each side, kickbacks 3x15 each side, hip abductions 3x15, run 1 to 2 times per week.',
};

export const HONEST_NOTES = [
  {
    title: 'On not wanting muscle',
    body: "Growing a rounder butt IS building muscle. There's no separate pathway. Vera's own framing on this is worth internalising: you can't completely separate glutes from legs when you train, but you can bias your training so glutes are the priority. That's what this plan does. You will not accidentally get bulky. Visible mass requires years of heavy progressive overload plus a calorie surplus.",
    video: VIDEOS.glutesNotLegs,
  },
  {
    title: 'On the flat tummy',
    body: 'That comes from overall body fat, not from ab exercises. Crunches strengthen the muscle underneath but don’t burn fat off that specific spot. Nutrition, sleep and daily activity do the work there. The core exercises in this plan are for strength and posture.',
  },
];
