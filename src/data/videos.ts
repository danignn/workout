export interface VideoRef {
  /** Stable slug used as a React key, not the TikTok id. */
  id: string;
  title: string;
  author: string;
  url: string;
}

const vera = (slug: string, title: string, videoId: string): VideoRef => ({
  id: slug,
  title,
  author: 'vera.armishaw',
  url: `https://www.tiktok.com/@vera.armishaw/video/${videoId}`,
});

const short = (slug: string, title: string, code: string, author = 'tiktok'): VideoRef => ({
  id: slug,
  title,
  author,
  url: `https://vt.tiktok.com/${code}/`,
});

/** Every video referenced by the final plan. */
export const VIDEOS: Record<string, VideoRef> = {
  squatVariations: vera('squat-variations', 'Squat variations & form', '7458972600350395665'),
  hipThrustTutorial: vera('hip-thrust-tutorial', 'Hip thrust tutorial', '7333825575968165121'),
  hipThrustTips: vera('hip-thrust-tips', 'Hip thrust: 5 form tips', '7475156218374311169'),
  reverseLunge: vera('reverse-lunge', 'Reverse lunges, glute focus', '7329024160783518978'),
  hipAbduction: vera('hip-abduction', 'Hip abduction machine', '7503310492308360449'),
  kickbacks: vera('kickbacks', 'Cable kickback mistakes', '7617999324399602964'),
  upperDay: vera('upper-day', 'Full upper body session', '7494921938859478273'),
  overheadPress: vera('overhead-press', 'Overhead dumbbell press', '7496018277248896273'),
  lateralRaise: vera('lateral-raise', 'Lateral raise form', '7422875173717560583'),
  smithRdl: vera('smith-rdl', 'Smith machine RDL', '7553760780265557249'),
  smithStepUps: vera('smith-step-ups', 'Smith machine step-ups', '7483006995079925009'),
  bulgarianSplit: vera('bulgarian-split', 'Bulgarian split squat', '7496449294824672529'),
  coreCircuit: vera('core-circuit', 'Core circuit', '7501051301665508624'),
  coreCircuitTwo: vera('core-circuit-2', 'More core work', '7564249316513139988'),
  stairmaster: vera('stairmaster', 'StairMaster & incline walking', '7545977897186528529'),
  glutesNotLegs: vera('glutes-not-legs', 'Glutes without growing legs', '7617179758962527508'),

  legCurl: short('leg-curl', 'Seated leg curl setup', 'ZSqFmbtoq'),
  legCurlAlt: {
    id: 'leg-curl-alt',
    title: 'Seated leg curl, second angle',
    author: 'tylerpath',
    url: 'https://www.tiktok.com/@tylerpath/video/7257930123259874606',
  },
  tricepPushdown: short('tricep-pushdown', 'Cable tricep pushdown', 'ZSqFmCSLt'),
  deadBug: short('dead-bug', 'Dead bug', 'ZSqFue6cR'),
  pallofPress: short('pallof-press', 'Pallof press', 'ZSqFm9KT5'),
  singleLegRdl: short('single-leg-rdl', 'Single leg RDL progression', 'ZSqFmyXqj'),
  chestPress: short('chest-press', 'Dumbbell chest press', 'ZSqFmv7ct'),

  // Follow-along warm-ups and cool-downs
  legWarmup: short('leg-warmup', 'Leg day warm-up', 'ZSqF6YXto'),
  upperWarmup: short('upper-warmup', 'Upper body warm-up', 'ZSqFjAVco'),
  fullWarmup: short('full-warmup', 'Full body warm-up', 'ZSqF6MCUK'),
  legCooldown: short('leg-cooldown', 'Leg day cool-down', 'ZSqF6kvWQ'),
  upperCooldown: short('upper-cooldown', 'Upper body cool-down', 'ZSqF6qfPm'),
  fullCooldown: short('full-cooldown', 'Full body cool-down', 'ZSqF6npSK'),
};

export const ALL_VIDEOS: VideoRef[] = Object.values(VIDEOS);
