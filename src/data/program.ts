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
  /** Skippable when you are short on time; the session still counts. */
  optional?: boolean;
  /** Which session types this exercise can be added to from the library. */
  group?: 'shoulders' | 'arms' | 'back' | 'legs' | 'glutes' | 'core';
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
   * on a Tuesday without collapsing the 48-72 hour gap between leg days.
   */
  dayOffset: number;
  title: string;
  subtitle: string;
  kind: 'lower' | 'upper' | 'full' | 'core' | 'rest';
  accent: string;
  intro?: string;
  /** True for a session you can skip and still be following the plan. */
  optional?: boolean;
  warmup: MobilityMove[];
  /** Follow-along warm-up video, played on tap. */
  warmupVideo?: string;
  cooldown: MobilityMove[];
  cooldownVideo?: string;
  exercises: Exercise[];
  finisher?: string;
}

/**
 * The three moves the written plan specifies, plus a pulse-raiser before them
 * and leg swings after, which is what makes the first working set feel like the
 * third one instead of a warm-up in disguise.
 */
/** Follow-along warm-up and cool-down videos, supplied by Dani. */
export const LEG_WARMUP_VIDEO = 'https://vt.tiktok.com/ZSqF6YXto/';
export const UPPER_WARMUP_VIDEO = 'https://vt.tiktok.com/ZSqFjAVco/';
export const FULL_WARMUP_VIDEO = 'https://vt.tiktok.com/ZSqF6MCUK/';
export const LEG_COOLDOWN_VIDEO = 'https://vt.tiktok.com/ZSqF6kvWQ/';
export const UPPER_COOLDOWN_VIDEO = 'https://vt.tiktok.com/ZSqF6qfPm/';
export const FULL_COOLDOWN_VIDEO = 'https://vt.tiktok.com/ZSqF6npSK/';

const GLUTE_WARMUP: MobilityMove[] = [
  { name: 'Incline walk or march on the spot', prescription: '5 min', note: 'Just enough to feel warm and breathe a little harder. Do not skip this to save time.' },
  { name: 'Bodyweight glute bridges', prescription: '10 reps', note: 'Squeeze at the top. This is the wake-up call for the muscle you are about to train.' },
  { name: 'Banded side steps', prescription: '15 each direction', note: 'Band above the knees, small bend in the knees, stay low the whole way.' },
  { name: 'Bodyweight squats', prescription: '10 reps', note: 'Slow, full depth, grooving the pattern before you add the bar.' },
  { name: 'Leg swings', prescription: '10 each leg, front to back', note: 'Hold something for balance. Opens the hip before you load it.' },
];

const LOWER_COOLDOWN: MobilityMove[] = [
  { name: 'Figure-4 glute stretch', prescription: '30 sec each side', note: 'Lying on your back, ankle over the opposite knee, pull the thigh toward you.' },
  { name: 'Standing forward fold', prescription: '40 sec', note: 'Soft knees. Let your head hang, this is for the hamstrings and lower back.' },
  { name: 'Kneeling hip flexor stretch', prescription: '30 sec each side', note: 'Tuck the pelvis under before you lean forward, otherwise you stretch your lower back instead.' },
  { name: 'Standing quad stretch', prescription: '30 sec each side', note: 'Knees together, push the hip forward.' },
  { name: "Child's pose", prescription: '45 sec', note: 'Knees wide, hips back to the heels, breathe into your lower back.' },
];

const UPPER_WARMUP: MobilityMove[] = [
  { name: 'Arm circles', prescription: '15 forward, 15 back', note: 'Start small and grow them.' },
  { name: 'Band pull-aparts', prescription: '15 reps', note: 'Straight arms, squeeze the shoulder blades. Wakes up the upper back for posture work.' },
  { name: 'Scapular pulls', prescription: '10 reps', note: 'Hanging or on the lat pulldown, move only the shoulder blades, arms stay straight.' },
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
  { name: "World's greatest stretch", prescription: '5 each side', note: 'Lunge, elbow to the inside of the foot, then rotate the top arm to the ceiling.' },
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

export const SESSIONS: Session[] = [
  {
    id: 'lower-a',
    dayOffset: 0,
    title: 'Lower A',
    subtitle: 'Glute focus',
    kind: 'lower',
    accent: '#f48fb1',
    warmup: GLUTE_WARMUP,
    warmupVideo: LEG_WARMUP_VIDEO,
    cooldown: LOWER_COOLDOWN,
    cooldownVideo: LEG_COOLDOWN_VIDEO,
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
        id: 'leg-press',
        name: 'Leg Press, glute-biased',
        sets: 3,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 40,
        loadNote: 'Start light and find your foot position first',
        tier: 'compound',
        restBetweenSets: [120, 180],
        restBeforeNext: [120, 180],
        cueSource: 'Bret Contreras',
        cues: [
          'Place your feet HIGH and NARROW on the platform. That is what shifts the work from quads to glutes.',
          'You have found your position when your knees form roughly a 90 degree angle at the bottom.',
          'Feet low on the platform turns this into a quad exercise, which is what you are trying to avoid.',
          'Push through your heels, not your toes. Do not let your lower back round off the pad at the bottom.',
          'Never lock the knees out hard at the top.',
        ],
        notes:
          'High and narrow biases the glutes but does not switch the quads off — both work, you are just changing which one leads.',
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
    dayOffset: 1,
    title: 'Upper + Core',
    subtitle: 'Posture & the hourglass line',
    kind: 'upper',
    accent: '#c8a2e0',
    warmup: UPPER_WARMUP,
    warmupVideo: UPPER_WARMUP_VIDEO,
    cooldown: UPPER_COOLDOWN,
    cooldownVideo: UPPER_COOLDOWN_VIDEO,
    intro:
      'Keep loads light and reps moderate. This session is for posture, shoulder shape and the hourglass line, not size.',
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
        restBeforeNext: [120, 120],
        cues: [
          'Full stretch at the top, full contraction at the bottom. Slow and controlled.',
          'This is the exercise that widens your back, and a wider back is what makes your waist look smaller. Do not drop it for more shoulder work.',
        ],
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
        restBeforeNext: [120, 120],
        cues: ['Squeeze the shoulder blades together, control the return.', 'Chest tall, do not round forward to reach.'],
      },
      {
        id: 'db-shoulder-press',
        name: 'Overhead Dumbbell Press',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 4,
        tier: 'accessory',
        restBetweenSets: [90, 90],
        restBeforeNext: [120, 120],
        cues: ['Ribs down, do not arch the lower back to press.', 'Press slightly in front of your head, not behind it.'],
      },
      {
        id: 'lateral-raises',
        name: 'Dumbbell Lateral Raise',
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
          'Lead with the elbows, stop at shoulder height.',
        ],
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
        restBeforeNext: [120, 120],
        cues: [
          'Hinge forward, flat back, raise the dumbbells out to the sides.',
          'This is the rear shoulder. It is the half most people never train, and the half that makes shoulders look round rather than flat from the side.',
          'Very light. If your back is swinging, halve the weight.',
        ],
      },
      {
        id: 'front-raise',
        name: 'Dumbbell Front Raise',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 3,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        optional: true,
        cues: [
          'Raise to shoulder height, no higher, no swinging.',
          'The front shoulder already works hard on the overhead press, so treat this as a finisher rather than a priority.',
        ],
      },
      {
        id: 'face-pull',
        name: 'Cable Face Pull',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 10,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        cues: [
          'Rope at face height, pull toward your forehead and pull the rope apart at the end.',
          'Rear shoulder and upper back, which is what fixes desk posture.',
          'Light weight. If your neck is doing the work, it is too heavy.',
        ],
      },
      {
        id: 'bicep-curl',
        name: 'Dumbbell Bicep Curl',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 4,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        cues: [
          'Elbows pinned to your sides, no swinging the weight up with your back.',
          'Lower slowly, that half of the rep is where the shape comes from.',
          'Your list had five tricep moves and no biceps. This balances the arm out.',
        ],
      },
      {
        id: 'overhead-tricep',
        name: 'Overhead Tricep Extension',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 4,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        cues: [
          'Elbows point forward and stay still, only the forearms move.',
          'The overhead position stretches the long head of the tricep, which is the part that shapes the back of the arm.',
          'Single arm or two hands, whichever you prefer.',
        ],
      },
      {
        id: 'tricep-pushdown',
        name: 'Cable Tricep Pushdown',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 10,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        optional: true,
        cues: [
          'Elbows locked at your ribs, only the forearms move.',
          'Same muscle as the overhead extension from a different angle. Do it if you have time, skip it if you do not.',
        ],
      },
      {
        id: 'plank',
        name: 'Plank',
        sets: 3,
        repsLabel: '60 sec',
        repTarget: 60,
        suggestedKg: 0,
        timeBased: true,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        cues: ['Straight line from head to heels. Squeeze the glutes to stop the hips sagging.'],
      },
    ],
    finisher:
      "Shy girl alternative (Vera's cable-only upper): if free weights feel intimidating, swap the whole session for lat pulldown, straight-arm cable pulldown, cable bicep curl, half-kneeling single-arm lat pulldown, lateral raises. Same rest times apply.",
  },
  {
    id: 'core-cardio',
    dayOffset: 2,
    title: 'Core + Cardio',
    subtitle: 'Abs, waist and conditioning',
    kind: 'core',
    accent: '#8fd6bd',
    optional: true,
    intro:
      'This is the day you asked for. Abs respond to load and progression like every other muscle, so most of this is weighted in the 10 to 20 rep range rather than endless bodyweight crunches. It puts no load through your legs, so it sits safely between your two lower body days. If you are tired or sore, walk instead and take the rest — this session is optional by design.',
    warmup: FULL_WARMUP,
    warmupVideo: FULL_WARMUP_VIDEO,
    cooldown: FULL_COOLDOWN,
    cooldownVideo: FULL_COOLDOWN_VIDEO,
    exercises: [
      {
        id: 'cable-crunch',
        name: 'Cable Crunch',
        sets: 3,
        repsLabel: '12 to 15',
        repTarget: 15,
        suggestedKg: 15,
        tier: 'accessory',
        restBetweenSets: [60, 90],
        restBeforeNext: [120, 120],
        cues: [
          'Kneel facing the machine, rope beside your head, hips stay still.',
          'Curl your ribs down toward your hips. The movement is your spine flexing, not your hips folding.',
          'This is the one exercise here you add weight to over time, and that is what actually thickens the muscle.',
        ],
        notes: 'Added on top of your routine: everything you were doing was bodyweight, which builds endurance more than muscle.',
      },
      {
        id: 'knee-ups',
        name: 'Knee Ups',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 0,
        tier: 'accessory',
        restBetweenSets: [60, 90],
        restBeforeNext: [120, 120],
        cues: [
          'Hanging from a bar or on the captain\u2019s chair, draw the knees up toward your chest.',
          'Curl your pelvis up at the top rather than only lifting the knees. That is what turns it from a hip flexor exercise into an ab one.',
          'No swinging.',
        ],
      },
      {
        id: 'russian-twist',
        name: 'Russian Twist',
        sets: 3,
        repsLabel: '15 each side',
        repTarget: 15,
        suggestedKg: 6,
        loadNote: '6kg kettlebell',
        perSide: true,
        tier: 'accessory',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        cues: [
          'Lean back until you feel the abs switch on, chest tall, and rotate from the ribs.',
          'Slow and controlled. Fast twisting is momentum, not muscle.',
          'Keep the load moderate. Heavy loaded rotation and side bending is what thickens the waist, and you want the opposite.',
        ],
      },
      {
        id: 'in-and-outs',
        name: 'In and Outs',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 0,
        tier: 'accessory',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        cues: [
          'Sit balanced on your tailbone, hands behind you, extend both legs out and draw them back in.',
          'Keep your chest up and your lower back from collapsing. Bend the knees more if it does.',
        ],
      },
      {
        id: 'leg-raises-core',
        name: 'Leg Raises',
        sets: 3,
        repsLabel: '15',
        repTarget: 15,
        suggestedKg: 0,
        tier: 'accessory',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        cues: [
          'Lower back stays flat on the floor the whole time.',
          'If your back arches off the floor, shorten the range or bend the knees. That arch is where lower back pain comes from.',
          'Lower slowly, that half is the work.',
        ],
      },
      {
        id: 'plank-core',
        name: 'Plank',
        sets: 3,
        repsLabel: '60 sec',
        repTarget: 60,
        suggestedKg: 0,
        timeBased: true,
        tier: 'isolation',
        restBetweenSets: [45, 60],
        restBeforeNext: [120, 120],
        cues: [
          'Straight line from head to heels, glutes squeezed so the hips cannot sag.',
          'When a minute gets easy, add weight on your back rather than adding minutes.',
        ],
      },
      {
        id: 'core-cardio-walk',
        name: 'Incline Walk',
        sets: 1,
        repsLabel: '25 to 35 min',
        repTarget: 30,
        suggestedKg: 0,
        timeBased: true,
        tier: 'isolation',
        cues: [
          'Steep incline, brisk but conversational. No running needed.',
          'This is the part that actually uncovers the abs. The six exercises above build them.',
        ],
      },
    ],
    finisher:
      'Honest note: this session builds the muscle. Whether it becomes visible is decided by body fat, which comes from food, sleep and daily steps. Doing this three times a week will not out-train a calorie surplus, and no amount of core work burns fat off your stomach specifically.',
  },
  {
    id: 'lower-b',
    dayOffset: 3,
    title: 'Lower B',
    subtitle: 'Hamstring & glute focus',
    kind: 'lower',
    accent: '#f48fb1',
    warmup: GLUTE_WARMUP,
    warmupVideo: LEG_WARMUP_VIDEO,
    cooldown: LOWER_COOLDOWN,
    cooldownVideo: LEG_COOLDOWN_VIDEO,
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
        id: 'leg-curl',
        name: 'Seated Leg Curl',
        sets: 3,
        repsLabel: '12',
        repTarget: 12,
        suggestedKg: 12,
        tier: 'accessory',
        restBetweenSets: [90, 120],
        restBeforeNext: [120, 120],
        cues: [
          'Point the toes slightly away from you and keep the hips pinned to the seat.',
          'Squeeze at the bottom, lower slowly over three seconds.',
          'This is your hamstring machine work. Hamstrings sit under the glute, so filling them out helps the shelf you are after.',
        ],
        notes: 'From your own routine, placed on hamstring day where it belongs.',
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
    dayOffset: 5,
    title: 'Full Body + Core',
    subtitle: 'Plus cardio finish',
    kind: 'full',
    accent: '#f6b3a0',
    warmup: FULL_WARMUP,
    warmupVideo: FULL_WARMUP_VIDEO,
    cooldown: FULL_COOLDOWN,
    cooldownVideo: FULL_COOLDOWN_VIDEO,
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


/**
 * Extra exercises from Dani's own routine that do not fit in a 60-minute
 * session. They can be added to any workout from the "Add an exercise" button,
 * so nothing she was already doing is lost, without every session running long.
 */
export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: 'lib-around-the-world',
    name: 'Around the World',
    group: 'shoulders',
    sets: 3,
    repsLabel: '15',
    repTarget: 15,
    suggestedKg: 2,
    tier: 'isolation',
    restBetweenSets: [45, 60],
    cues: [
      'Sweep the dumbbells from your hips out and up overhead in a wide arc, then back the same way.',
      'Go very light. This one is all about control, and it hits the front and side shoulder together.',
    ],
  },
  {
    id: 'lib-upright-row',
    name: 'Dumbbell Upright Row',
    group: 'shoulders',
    sets: 3,
    repsLabel: '15',
    repTarget: 15,
    suggestedKg: 4,
    tier: 'isolation',
    restBetweenSets: [45, 60],
    cues: [
      'Use a wider grip and stop when your elbows reach shoulder height.',
      'Pulling narrow and high pinches the shoulder joint for a lot of people. If you feel any pinch, swap this for a face pull.',
    ],
    notes: 'Kept from your list, but with the safer wide-grip version.',
  },
  {
    id: 'lib-tricep-kickback',
    name: 'Tricep Kickback',
    group: 'arms',
    sets: 3,
    repsLabel: '15',
    repTarget: 15,
    suggestedKg: 3,
    tier: 'isolation',
    restBetweenSets: [45, 60],
    cues: [
      'Hinge forward, upper arm locked parallel to your torso, extend from the elbow only.',
      'Squeeze for a beat at the top. Light weight, this is a finisher.',
    ],
  },
  {
    id: 'lib-tricep-dips',
    name: 'Tricep Dips',
    group: 'arms',
    sets: 3,
    repsLabel: '12',
    repTarget: 12,
    suggestedKg: 0,
    loadNote: 'Bodyweight, bench or parallel bars',
    tier: 'accessory',
    restBetweenSets: [60, 90],
    cues: [
      'Keep your shoulders down and back, and stop before your upper arms go far below parallel.',
      'Feet closer in makes it easier, further out makes it harder.',
    ],
  },
  {
    id: 'lib-leg-extension',
    name: 'Leg Extension',
    group: 'legs',
    sets: 3,
    repsLabel: '12',
    repTarget: 12,
    suggestedKg: 12,
    tier: 'accessory',
    restBetweenSets: [90, 120],
    cues: [
      'Hips pinned to the seat, squeeze at the top, lower slowly.',
    ],
    notes:
      'Honest flag: this is a pure quad exercise with no glute involvement at all. It is in your list so it is here, but it is the one move in your routine that works directly against not wanting bigger quads. Use it lightly or skip it.',
  },
  {
    id: 'lib-side-to-side',
    name: 'Side-to-Side Raises',
    group: 'core',
    sets: 3,
    repsLabel: '15 each side',
    repTarget: 15,
    perSide: true,
    suggestedKg: 0,
    tier: 'isolation',
    restBetweenSets: [45, 60],
    cues: [
      'Lying down, reach alternately toward each heel, keeping the lower back flat.',
      'Bodyweight only. Adding load to side-to-side work thickens the obliques and squares the waist.',
    ],
  },
  {
    id: 'lib-pallof',
    name: 'Pallof Press',
    group: 'core',
    sets: 3,
    repsLabel: '12 each side',
    repTarget: 12,
    perSide: true,
    suggestedKg: 10,
    tier: 'accessory',
    restBetweenSets: [45, 60],
    cues: [
      'Stand side-on to the cable, press it straight out from your chest and refuse to twist.',
      'Nothing moves except your arms. This trains the deep core that holds the waist in.',
    ],
  },
  {
    id: 'lib-suitcase-carry',
    name: 'Suitcase Carry',
    group: 'core',
    sets: 3,
    repsLabel: '30 sec each side',
    repTarget: 30,
    perSide: true,
    timeBased: true,
    suggestedKg: 12,
    tier: 'accessory',
    restBetweenSets: [45, 60],
    cues: [
      'One heavy dumbbell in one hand, walk tall and do not let your body tip toward it.',
      'Trains the same muscles as a side bend without building them outward.',
    ],
  },
  {
    id: 'lib-dead-bug',
    name: 'Dead Bug',
    group: 'core',
    sets: 3,
    repsLabel: '12 each side',
    repTarget: 12,
    perSide: true,
    suggestedKg: 0,
    tier: 'isolation',
    restBetweenSets: [45, 60],
    cues: ['Lower back pressed flat into the floor the whole time. Move slowly.'],
  },
  {
    id: 'lib-bicycle-crunch',
    name: 'Bicycle Crunch',
    group: 'core',
    sets: 3,
    repsLabel: '20',
    repTarget: 20,
    suggestedKg: 0,
    tier: 'isolation',
    restBetweenSets: [45, 60],
    cues: ['Slow. Rotate from the ribs, never yank the neck.'],
  },
  {
    id: 'lib-glute-bridge',
    name: 'Glute Bridge',
    group: 'glutes',
    sets: 3,
    repsLabel: '20',
    repTarget: 20,
    suggestedKg: 0,
    tier: 'isolation',
    restBetweenSets: [45, 60],
    cues: ['Squeeze hard at the top and hold for one second each rep.'],
  },
  {
    id: 'lib-hip-abduction',
    name: 'Hip Abduction',
    group: 'glutes',
    sets: 3,
    repsLabel: '20',
    repTarget: 20,
    suggestedKg: 0,
    tier: 'isolation',
    restBetweenSets: [45, 60],
    cues: ['Keep the torso still. Do not lean away to get more range.'],
  },
];

export function libraryExercise(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find((e) => e.id === id);
}

/** Any exercise the app knows about, whether scheduled or added from the library. */
export function findExercise(id: string): Exercise | undefined {
  for (const session of SESSIONS) {
    const hit = session.exercises.find((e) => e.id === id);
    if (hit) return hit;
  }
  return libraryExercise(id);
}

export interface RestDay {
  dayOffset: number;
  label: string;
  note: string;
}

export const REST_DAYS: RestDay[] = [
  { dayOffset: 4, label: 'Rest', note: 'Full rest before your full body day. Recovery is where the growth happens.' },
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
